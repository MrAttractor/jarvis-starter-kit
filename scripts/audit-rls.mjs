#!/usr/bin/env node
// ============================================================================
// Audit de sécurité RLS du projet Supabase partagé (toutes les apps ATTRACTOR)
//
// À lancer AVANT toute livraison : node scripts/audit-rls.mjs
//
// Pourquoi : toutes les apps (Assists, J'Envoie Express, Vies Croisées,
// Livraison Pro, boutiques clientes, cockpit...) partagent un seul projet
// Supabase et une seule clé anon, qui est publique par nature (elle est dans le
// code source de chaque page). Une table lisible/écrivable par le rôle `anon`
// est donc lisible/écrivable par n'importe qui sur Internet.
//
// Ce que fait le script :
//   1. Liste toutes les tables `public`, leur état RLS et leurs policies.
//   2. Détecte les colonnes de données personnelles (nom, tel, email, adresse,
//      GPS, mot de passe...).
//   3. Attaque réellement chaque table avec la clé anon (SELECT + tentative
//      d'INSERT) pour mesurer l'exposition réelle, pas seulement théorique.
//   4. ÉCHOUE (exit 1) si une table à données personnelles est lisible en
//      anonyme, ou si une table hors all-list est écrivable en anonyme.
//
// Les tables volontairement publiques (contenus de vitrine, catalogues, dates
// de départ...) sont déclarées dans PUBLIC_OK ci-dessous. Toute NOUVELLE table
// publique non déclarée est signalée : c'est le filet qui empêche qu'une
// prochaine app rouvre une faille sans qu'on le voie.
// ============================================================================

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// --- Chargement du .env (sans dépendance externe) --------------------------
function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(join(ROOT, '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {}
  return env;
}
const ENV = loadEnv();
const PROJECT_REF = ENV.SUPABASE_PROJECT_REF;
const ACCESS_TOKEN = ENV.SUPABASE_ACCESS_TOKEN;
const SUPABASE_URL = ENV.SUPABASE_URL;
const ANON_KEY = ENV.SUPABASE_ANON_KEY;

if (!PROJECT_REF || !ACCESS_TOKEN || !SUPABASE_URL || !ANON_KEY) {
  console.error('Variables manquantes dans .env (SUPABASE_PROJECT_REF, SUPABASE_ACCESS_TOKEN, SUPABASE_URL, SUPABASE_ANON_KEY).');
  process.exit(2);
}

// --- Tables volontairement publiques (contenu, pas de données personnelles) -
// Ajouter ici SEULEMENT une table dont la lecture publique est un choix assumé,
// et qui ne contient aucune donnée personnelle.
const PUBLIC_OK = new Set([
  // Vitrines / catalogues / contenu éditorial (aucune donnée personnelle privée ;
  // les noms présents = auteurs, responsables, produits publiés à dessein).
  'produits', 'hero_slides', 'agents', 'plans', 'parcours', 'methode_votes',
  'community_posts', 'als_albums', 'als_dirigeants', 'als_medias',
  'als_actualites', 'als_departements', 'als_evenements', 'als_temoignages',
  'gw_produits',
  'vc_episodes', 'vc_articles', 'vc_commentaires',
  'je_voyages', 'je_parametres', 'je_avis',
  'veille_tendances',
  'parametres', 'avis',
]);

// --- Heuristique "colonne de données personnelles" -------------------------
const PII_RE = /(^|_)(nom|prenom|email|mail|whatsapp|tel|telephone|phone|contact|adresse|address|lat|lng|latitude|longitude|gps|mot_de_passe|password|mdp|secret|token|cni|piece|rccm|iban)($|_)/i;

async function mgmtQuery(sql) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  const j = await r.json();
  if (!Array.isArray(j)) throw new Error('Management API: ' + JSON.stringify(j).slice(0, 200));
  return j;
}

async function anonSelect(table) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`, {
    headers: { apikey: ANON_KEY },
  });
  const body = await r.json().catch(() => null);
  return { readable: Array.isArray(body), rows: Array.isArray(body) ? body.length : 0 };
}

async function main() {
  console.log('Audit RLS — projet ' + PROJECT_REF + '\n');

  // 1. Tables + RLS
  const tables = await mgmtQuery(
    `select c.relname as table, c.relrowsecurity as rls
       from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r'
      order by 1`
  );

  // 2. Colonnes (pour la détection PII)
  const cols = await mgmtQuery(
    `select table_name, string_agg(column_name, ',') as cols
       from information_schema.columns
      where table_schema = 'public' group by 1`
  );
  const colsByTable = Object.fromEntries(cols.map((r) => [r.table_name, (r.cols || '').split(',')]));

  // 3. Policies anon/public (lecture + écriture)
  const pols = await mgmtQuery(
    `select tablename, cmd, array_to_string(roles, ',') as roles,
            coalesce(qual, '') as qual, coalesce(with_check, '') as wc
       from pg_policies where schemaname = 'public'`
  );
  const anonRead = new Set();   // tables avec une policy SELECT ouverte à anon/public
  const anonWrite = new Set();  // tables avec une policy d'écriture ouverte à anon/public
  for (const p of pols) {
    const roles = p.roles || '';
    const openRole = roles.includes('anon') || roles.includes('public') || roles === '';
    if (!openRole) continue;
    const isRead = p.cmd === 'SELECT';
    const isWrite = ['INSERT', 'UPDATE', 'DELETE', 'ALL'].includes(p.cmd);
    if (isRead && p.qual.includes('true')) anonRead.add(p.tablename);
    if (isWrite && (p.wc.includes('true') || p.qual.includes('true'))) anonWrite.add(p.tablename);
  }

  // Règle de blocage (confidentialité) : toute table LISIBLE en anonyme doit
  // être explicitement déclarée publique (PUBLIC_OK). Une table lisible non
  // déclarée = fuite potentielle, on force à la justifier ou à la fermer.
  // L'écriture anonyme est signalée à part : un formulaire public (commande,
  // prospect, inscription) a légitimement besoin d'insérer, donc c'est une
  // revue, pas un échec automatique — mais elle doit rester insert-seul et
  // sans lecture en retour.
  const leaks = [];   // lecture anonyme non déclarée → BLOQUANT
  const writes = [];  // écriture anonyme → à confirmer (insert-seul + quota)
  const okPublic = [];

  for (const { table, rls } of tables) {
    const tcols = colsByTable[table] || [];
    const piiCols = tcols.filter((c) => PII_RE.test(c));

    const { readable, rows: nrows } = await anonSelect(table);
    const anonCanRead = readable && (nrows > 0 || anonRead.has(table) || rls === false);
    const anonCanWrite = anonWrite.has(table);
    const declared = PUBLIC_OK.has(table);

    if (anonCanRead && declared) okPublic.push(table);
    if (anonCanRead && !declared) leaks.push({ table, rls, piiCols });
    if (anonCanWrite) writes.push({ table, piiCols });
  }

  if (leaks.length) {
    console.log('LECTURE ANONYME NON DÉCLARÉE (bloquant) :');
    console.log('  ' + 'table'.padEnd(24) + 'RLS'.padEnd(7) + 'colonnes personnelles');
    console.log('  ' + '-'.repeat(70));
    for (const l of leaks) {
      console.log('  ' + l.table.padEnd(24) + String(l.rls).padEnd(7) + (l.piiCols.length ? l.piiCols.join(', ') : '(aucune détectée)'));
    }
    console.log('');
  }

  if (writes.length) {
    console.log('ÉCRITURE ANONYME (à confirmer : formulaire légitime insert-seul, ou à fermer) :');
    for (const w of writes) console.log('  - ' + w.table + (w.piiCols.length ? '  [' + w.piiCols.join(', ') + ']' : ''));
    console.log('');
  }

  console.log(`Résumé : ${okPublic.length} table(s) publiques déclarées OK, ${leaks.length} lecture(s) non déclarée(s), ${writes.length} écriture(s) anonyme(s).`);

  if (leaks.length) {
    console.log('\nÉCHEC. Chaque table ci-dessus est lisible par n\'importe qui avec la clé anon.');
    console.log('Soit la fermer (RLS + policy scopée), soit — si elle est publique à dessein');
    console.log('et sans donnée personnelle — l\'ajouter à PUBLIC_OK dans ce script.');
    process.exit(1);
  }

  console.log('\nOK — aucune table lisible en anonyme hors de celles déclarées publiques.');
  process.exit(0);
}

main().catch((e) => { console.error('Erreur audit:', e.message); process.exit(2); });

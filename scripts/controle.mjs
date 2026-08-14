#!/usr/bin/env node
// ============================================================================
// CONTROLE AVANT MISE EN LIGNE
//
//   node scripts/controle.mjs [--dossier <chemin>] [--site <url>]
//
// Une seule commande, lancee avant chaque deploiement. Elle remplace la chasse
// manuelle aux defauts, defaut par defaut.
//
// LE PRINCIPE, ET IL EXPLIQUE TOUT LE RESTE
//
// Une alarme qui se trompe apprend a etre ignoree. L'audit precedent signalait
// vingt-cinq tables dont une seule fuyait reellement, et il ne donnait pas deux
// fois le meme resultat. Personne ne le lancait, ce qui revenait a n'avoir
// aucun controle du tout.
//
// Ce script separe donc trois natures de constat, et une seule bloque :
//
//   PROUVE   ce que le script a REUSSI a faire avec la cle publique, ou une
//            regle verifiable sans ambiguite. Bloquant.
//   SUSPECT  ce dont la forme est douteuse mais dont l'exploitation n'est pas
//            demontree. Affiche, jamais bloquant.
//   INCERTAIN le reseau n'a pas repondu, ou le test n'a pas pu conclure.
//            Ni innocente ni condamne : un test rate n'est pas un test reussi.
//
// Sortie : 0 si aucun PROUVE, 1 s'il y en a, 2 si le controle n'a pas pu tourner.
// ============================================================================

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { writeFileSync, unlinkSync } from 'node:fs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------- arguments

const args = process.argv.slice(2);
const opt = (nom) => {
  const i = args.indexOf('--' + nom);
  return i >= 0 ? args[i + 1] : null;
};
const DOSSIER = opt('dossier');
const SITE = opt('site') ? opt('site').replace(/\/+$/, '') : null;

// ------------------------------------------------------------------ constats

const constats = [];
// Ce qui a ete regarde. Sans ce compte, une sortie vide se lit comme un
// controle qui n'a rien fait, et on cesse de lui faire confiance.
const compte = { tables: 0, fonctions: 0, fichiers: 0, adresses: 0 };
const prouve  = (bloc, quoi, quoiFaire) => constats.push({ n: 'PROUVE', bloc, quoi, quoiFaire });
const suspect = (bloc, quoi, quoiFaire) => constats.push({ n: 'SUSPECT', bloc, quoi, quoiFaire });

// Un incertain BLOQUE par defaut, et c'est la seule position tenable : un
// controle qui n'a pas pu tourner ne peut pas donner un feu vert, sinon il
// suffit qu'une requete echoue pour que la barriere s'ouvre toute seule.
// Seules les omissions volontaires, comme ne pas passer de --site, sont
// signalees sans bloquer.
const incertain = (bloc, quoi, volontaire = false) => constats.push({
  n: 'INCERTAIN', bloc, quoi, volontaire,
  quoiFaire: volontaire ? 'Omission volontaire, rien à corriger.'
    : 'Relancer le contrôle. Un test qui n\'a pas conclu n\'innocente rien.',
});

// ------------------------------------------------------------------- .env

function lireEnv() {
  const env = {};
  try {
    for (const ligne of readFileSync(join(ROOT, '.env'), 'utf8').split('\n')) {
      const m = ligne.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch { /* pas de .env : les controles base seront sautes */ }
  return env;
}
const ENV = lireEnv();

async function sql(requete) {
  let derniere;
  for (let essai = 0; essai < 3; essai++) {
    try {
      const r = await fetch(`https://api.supabase.com/v1/projects/${ENV.SUPABASE_PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ENV.SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'curl/8.4.0',
        },
        body: JSON.stringify({ query: requete }),
      });
      const j = await r.json();
      if (Array.isArray(j)) return j;
      derniere = new Error(JSON.stringify(j).slice(0, 160));
    } catch (e) { derniere = e; }
    // L'API se fatigue quand on l'interroge en rafale. On la laisse respirer
    // plutot que de conclure a tort que le controle est passe.
    await new Promise((r) => setTimeout(r, 1500 * (essai + 1)));
  }
  throw derniere;
}

// ============================================================================
// A. LA BASE
// ============================================================================

// Deux poids, et c'est la difference entre une alarme utile et une alarme
// qu'on eteint. « tel » ou « whatsapp » ne designent jamais autre chose qu'une
// personne. « nom » designe aussi bien une cliente qu'une bouteille de liqueur.
// Le premier bloque, le second demande un oeil.
const PERSO_CERTAIN = /(^|_)(email|mail|whatsapp|tel|telephone|phone|adresse|address|lat|lng|latitude|longitude|gps|mot_de_passe|password|mdp|secret|token|jeton|cni|piece|rccm|iban)($|_)/i;
const PERSO_POSSIBLE = /(^|_)(nom|prenom|contact|reponses|notes|scores)($|_)/i;

// Tables publiques a dessein, sans donnee personnelle. Une table qui n'est pas
// ici et qui se lit en anonyme est un constat, pas une opinion.
const PUBLIQUES_ASSUMEES = new Set([
  'produits', 'hero_slides', 'agents', 'plans', 'parcours', 'methode_votes',
  'community_posts', 'als_albums', 'als_dirigeants', 'als_medias',
  'als_actualites', 'als_departements', 'als_evenements', 'als_temoignages',
  'gw_produits', 'vc_episodes', 'vc_articles', 'vc_commentaires',
  'je_voyages', 'je_parametres', 'je_avis', 'veille_tendances',
  'parametres', 'avis',
  // Catalogues de vitrine : « nom » y designe un produit, pas quelqu'un.
  'ay_produits', 'cr_produits',
  // Partenaires affiches sur les sites, publies a dessein.
  'vc_partenaires', 'nb_partenaires',
  // La demonstration By Macoco : ouverte sans mot de passe par choix, et
  // remplie de donnees inventees, sans aucun lien avec un vrai compte.
  'demo_produits', 'demo_clients', 'demo_commandes', 'demo_equipe',
  'demo_pos', 'demo_stock', 'demo_ventes',
]);

// Fonctions volontairement appelables sans compte : elles portent leur propre
// controle par jeton. Toute autre fonction ouverte a anon est signalee.
const RPC_PUBLIQUES_ASSUMEES = new Set([
  'pm_questionnaire_etat', 'pm_questionnaire_repondre', 'pm_questionnaire_valider',
  'fgp_etat', 'fgp_point_maj', 'fgp_point_ajout', 'fgp_info_maj', 'fgp_action_ajout',
  'fgp_action_maj', 'fgp_cloturer', 'fgp_rouvrir', 'fgp_signer', 'fgp_presence_ping',
  'fgp_rapport', 'fgp_reinitialiser', 'fgp_board', 'fgp_jalon_maj', 'fgp_info_suivi',
]);

// Trois tentatives, et un resultat n'est retenu que s'il est stable. C'est ce
// qui manquait a l'audit precedent : deux executions donnaient deux chiffres.
async function mesurerLecture(table) {
  const essais = [];
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(`${ENV.SUPABASE_URL}/rest/v1/${table}?select=*&limit=2`, {
        headers: { apikey: ENV.SUPABASE_ANON_KEY, Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}` },
      });
      if (r.status === 200) {
        const corps = await r.json().catch(() => null);
        essais.push(Array.isArray(corps) ? corps.length : -1);
      } else {
        essais.push(-2); // refuse
      }
    } catch {
      essais.push(-3); // reseau
    }
  }
  if (essais.some((e) => e === -3)) return { etat: 'incertain' };
  if (!essais.every((e) => e === essais[0])) return { etat: 'incertain' };
  if (essais[0] === -2) return { etat: 'refuse' };
  return { etat: 'lisible', lignes: essais[0] };
}

async function controlerBase() {
  if (!ENV.SUPABASE_PROJECT_REF || !ENV.SUPABASE_ACCESS_TOKEN || !ENV.SUPABASE_ANON_KEY) {
    incertain('base', 'Clés Supabase absentes du .env, les contrôles de base sont sautés.');
    return;
  }

  // Le nombre reel de lignes est indispensable : sans lui, « la cle publique ne
  // lit rien » ne veut rien dire. Zero ligne lue sur une table qui en contient
  // trente-huit est la preuve que la protection marche. Zero ligne lue sur une
  // table vide ne prouve rien du tout.
  const tables = await sql(
    `select c.relname as t, c.relrowsecurity as rls,
            (select count(*) from pg_policies p where p.schemaname='public' and p.tablename=c.relname) as policies,
            coalesce((select string_agg(column_name, ',') from information_schema.columns
                      where table_schema='public' and table_name=c.relname), '') as cols,
            has_table_privilege('anon', c.oid, 'select') as anon_a_le_droit,
            exists (select 1 from pg_policies p
                     where p.schemaname='public' and p.tablename=c.relname
                       and p.cmd in ('SELECT','ALL')
                       and (array_to_string(p.roles,',') like '%anon%'
                            or array_to_string(p.roles,',') like '%public%')
                       and coalesce(p.qual,'true') like '%true%') as policy_ouvre_la_lecture,
            (xpath('/row/c/text()',
                   query_to_xml(format('select count(*) as c from public.%I', c.relname),
                                false, true, '')))[1]::text::bigint as lignes_reelles
       from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='public' and c.relkind='r' order by 1`
  );

  for (const t of tables) {
    compte.tables++;
    const colonnes = (t.cols || '').split(',');
    const certain = colonnes.filter((c) => PERSO_CERTAIN.test(c));
    const possible = colonnes.filter((c) => PERSO_POSSIBLE.test(c));

    // 1. Une policy sur une table dont la RLS est eteinte ne s'applique jamais.
    //    La table est grande ouverte et rien ne le montre dans le tableau de bord.
    if (Number(t.policies) > 0 && t.rls === false) {
      prouve('base', `${t.t} a ${t.policies} policy(ies) mais la RLS est désactivée : elles ne s'appliquent pas.`,
        `alter table public.${t.t} enable row level security;`);
    }

    // 2. La mesure reelle, avec la cle publique.
    const m = await mesurerLecture(t.t);
    if (m.etat === 'incertain') { incertain('base', `Lecture de ${t.t} : mesure instable.`); continue; }
    if (m.etat === 'refuse') continue;

    const declaree = PUBLIQUES_ASSUMEES.has(t.t);
    if (declaree) continue;

    const enBase = Number(t.lignes_reelles || 0);

    if (m.lignes > 0 && certain.length) {
      prouve('base', `${t.t} : ${m.lignes} ligne(s) réellement lues avec la clé publique, dont ${certain.join(', ')}.`,
        'Fermer la lecture publique, ou passer par une fonction qui filtre.');
    } else if (m.lignes > 0 && possible.length) {
      suspect('base', `${t.t} : lisible en anonyme, colonnes ${possible.join(', ')}, qui peuvent désigner une personne ou un objet.`,
        'Si c\'est un catalogue, l\'ajouter à PUBLIQUES_ASSUMEES. Sinon, fermer.');
    } else if (m.lignes > 0) {
      suspect('base', `${t.t} : lisible en anonyme, aucune colonne personnelle détectée.`,
        'Si c\'est voulu, l\'ajouter à PUBLIQUES_ASSUMEES pour que l\'alarme cesse.');
    } else if (enBase === 0 && (certain.length || possible.length)) {
      // La cle publique ne lit rien, mais la table est vide : la mesure ne
      // prouve rien. On conclut alors sur la forme, qui elle est lisible :
      // sans policy qui ouvre la lecture, la table restera fermee une fois
      // remplie. Avec une telle policy, elle fuira des la premiere ligne.
      const ouverte = t.policy_ouvre_la_lecture === true || t.policy_ouvre_la_lecture === 't';
      const droit = t.anon_a_le_droit === true || t.anon_a_le_droit === 't';
      const sansRls = t.rls === false || t.rls === 'f';
      if (ouverte || (sansRls && droit)) {
        suspect('base', `${t.t} : vide aujourd'hui, mais la lecture est ouverte à la clé publique. Elle porte ${(certain.length ? certain : possible).join(', ')}.`,
          'Elle fuira dès la première ligne insérée. À fermer maintenant, pas le jour où elle servira.');
      }
      // Sinon : vide, et aucune policy n'ouvre la lecture. Rien a signaler.
    }
    // Zero ligne lue sur une table qui en contient : la protection est prouvee.
    // Rien a signaler, et c'est le seul cas qui merite le silence.
  }

  // 3. Les fonctions.
  const fns = await sql(
    `select p.proname as nom, p.prosecdef as definer,
            has_function_privilege('anon', p.oid, 'execute') as anon,
            (p.prorettype = 'trigger'::regtype) as est_declencheur,
            pg_get_functiondef(p.oid) as def
       from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.prokind='f' order by 1`
  );

  for (const f of fns) {
    compte.fonctions++;
    const def = f.def || '';

    // La comparaison qui ne protege rien. Avec la cle publique auth.uid() vaut
    // NULL, « NULL <> uuid » vaut NULL, et le refus ne se declenche jamais.
    if (/auth\.uid\(\)\s*(<>|!=)/.test(def)) {
      prouve('base', `${f.nom} compare auth.uid() avec <> : la protection ne se déclenche pas pour un appel anonyme.`,
        'Remplacer par « is distinct from ».');
    }

    // Postgres accorde l'execution a tout le monde a la creation. Mais signaler
    // toutes les fonctions ouvertes reviendrait a en signaler quatre-vingt-dix,
    // ce qui est le meilleur moyen de n'en regarder aucune. On ne retient que
    // celles qui n'ont AUCUN garde-fou dans leur corps : ni verification
    // d'identite, ni jeton, ni refus explicite. Ce sont les seules ou la porte
    // ouverte n'est compensee par rien.
    const declencheur = f.est_declencheur === true || f.est_declencheur === 't';
    const aUnGardeFou = /auth\.uid\(\)|p_jeton|p_token|raise\s+exception/i.test(def);
    if (f.definer && f.anon && !declencheur && !aUnGardeFou && !RPC_PUBLIQUES_ASSUMEES.has(f.nom)) {
      suspect('base', `${f.nom} est appelable par la clé publique et ne contient aucun garde-fou.`,
        `Soit un contrôle dans le corps, soit : revoke all on function public.${f.nom} from public, anon;`);
    }
  }
}

// ============================================================================
// B. LES FICHIERS
// ============================================================================

function fichiers(racine, ext) {
  const out = [];
  const marcher = (d) => {
    for (const e of readdirSync(d)) {
      if (e === 'node_modules' || e === '.git' || e.startsWith('.wrangler')) continue;
      const p = join(d, e);
      const st = statSync(p);
      if (st.isDirectory()) marcher(p);
      else if (!ext || ext.includes(extname(p))) out.push(p);
    }
  };
  if (existsSync(racine)) marcher(racine);
  return out;
}

// Les emojis utilises comme icones. Seules les plages pictographiques sont
// regardees : ni les lettres accentuees, ni les fleches typographiques, qui
// sont des caracteres de texte et pas des images.
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

function nomsDesAutresDossiers(dossier) {
  const base = join(ROOT, 'livrables', 'clients');
  if (!existsSync(base)) return [];
  return readdirSync(base)
    .filter((d) => statSync(join(base, d)).isDirectory())
    .filter((d) => !dossier.includes(d) && d.length > 5 && !d.startsWith('_'));
}

function controlerFichiers() {
  if (!DOSSIER) {
    incertain('fichiers', 'Aucun --dossier fourni : les contrôles de fichiers sont sautés.', true);
    return;
  }
  const racine = join(ROOT, DOSSIER);
  if (!existsSync(racine)) { prouve('fichiers', `Dossier introuvable : ${DOSSIER}`, 'Vérifier le chemin.'); return; }

  const autres = nomsDesAutresDossiers(DOSSIER);
  const html = fichiers(racine, ['.html']);

  for (const f of html) {
    compte.fichiers++;
    const rel = relative(ROOT, f);
    const src = readFileSync(f, 'utf8');

    // 1. La syntaxe. Une page qui ne se parse pas ne s'affiche pas.
    const scripts = [...src.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    if (scripts.length) {
      const tmp = join(tmpdir(), 'controle-' + Date.now() + '.js');
      try {
        writeFileSync(tmp, scripts.join('\n;\n'), 'utf8');
        execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' });
      } catch (e) {
        const msg = String(e.stderr || e.message).split('\n').find((l) => l.includes('SyntaxError')) || 'erreur de syntaxe';
        prouve('fichiers', `${rel} : ${msg.trim()}`, 'Corriger avant de déployer.');
      } finally { try { unlinkSync(tmp); } catch {} }
    }

    // 2. Le CSS d'impression, sur ce qui est fait pour etre imprime.
    const imprimable = /window\.print\(\)|Imprimer/i.test(src);
    if (imprimable && !/@media\s+print/.test(src)) {
      prouve('fichiers', `${rel} propose une impression mais n'a aucun bloc @media print.`,
        'Ajouter le bloc, avec break-inside: avoid et overflow: visible.');
    }
    if (/@media\s+print/.test(src) && !/break-inside\s*:\s*avoid/.test(src)) {
      suspect('fichiers', `${rel} imprime sans « break-inside: avoid » : des blocs seront coupés en deux pages.`,
        'Ajouter la règle sur les cartes, tableaux et lignes.');
    }

    // 3. Les emojis en guise d'icones.
    const lignes = src.split('\n');
    lignes.forEach((l, i) => {
      if (EMOJI.test(l) && !/^\s*(\/\/|<!--|\*)/.test(l)) {
        suspect('fichiers', `${rel}:${i + 1} contient un emoji.`, 'Les icônes sont en SVG maison, jamais en emoji.');
      }
    });

    // 4. Le nom d'un autre dossier dans un fichier livre. Les commentaires
    //    partent en production et se lisent d'un clic droit.
    for (const autre of autres) {
      const mot = autre.replace(/-/g, '[- ]?');
      if (new RegExp('\\b' + mot + '\\b', 'i').test(src)) {
        prouve('fichiers', `${rel} cite « ${autre} », qui est un autre dossier client.`,
          'Retirer la mention, commentaires compris.');
      }
    }
  }

  // 5. L'attrape-tout dans _redirects.
  for (const f of fichiers(racine, ['']).filter((p) => p.endsWith('_redirects'))) {
    const rel = relative(ROOT, f);
    for (const l of readFileSync(f, 'utf8').split('\n')) {
      const t = l.trim();
      if (!t || t.startsWith('#')) continue;
      if (/^\/(:\w+|\*)\s/.test(t)) {
        prouve('fichiers', `${rel} contient une règle attrape-tout : « ${t} »`,
          'Elle est évaluée avant le routage naturel et capture toute adresse non déclarée.');
      }
      if (/\.html\s+200\s*$/.test(t)) {
        suspect('fichiers', `${rel} réécrit vers un .html : « ${t} »`,
          'Cloudflare Pages transforme cette réécriture en redirection 308, ce qui ajoute un saut sur le lien envoyé.');
      }
    }
  }
}

// ============================================================================
// C. LE SITE DEPLOYE
// ============================================================================

async function reponse(url) {
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(url, { redirect: 'manual', headers: { 'Cache-Control': 'no-cache' } });
      return { code: r.status, vers: r.headers.get('location') };
    } catch { /* on retente */ }
  }
  return null;
}

async function controlerSite() {
  if (!SITE) { incertain('site', 'Aucun --site fourni : les contrôles en ligne sont sautés.', true); return; }

  const aTester = new Set(['/']);

  // Les adresses declarees dans _redirects du dossier, s'il y en a un.
  if (DOSSIER) {
    for (const f of fichiers(join(ROOT, DOSSIER), ['']).filter((p) => p.endsWith('_redirects'))) {
      for (const l of readFileSync(f, 'utf8').split('\n')) {
        const t = l.trim();
        if (!t || t.startsWith('#')) continue;
        const de = t.split(/\s+/)[0];
        if (de && de.startsWith('/') && !de.includes('*') && !de.includes(':')) aTester.add(de);
      }
    }
    // Et les fichiers html servis, sous leur adresse propre.
    const pub = join(ROOT, DOSSIER, 'public');
    for (const f of fichiers(pub, ['.html'])) {
      const rel = relative(pub, f).replace(/\\/g, '/');
      if (rel === '404.html') continue;
      aTester.add('/' + rel.replace(/(index)?\.html$/, '').replace(/\/$/, ''));
    }
  }

  for (const chemin of [...aTester].sort()) {
    compte.adresses++;
    const url = SITE + (chemin === '/' ? '/' : chemin);
    const r = await reponse(url);
    if (!r) { incertain('site', `${chemin} : pas de réponse.`); continue; }

    // La forme sans barre oblique finale est celle qu'on colle dans un message.
    if (r.code >= 300 && r.code < 400) {
      suspect('site', `${chemin} répond ${r.code} vers ${r.vers} au lieu de 200.`,
        'Un saut de plus sur un lien envoyé à quelqu\'un. Servir la page directement.');
    } else if (r.code !== 200) {
      prouve('site', `${chemin} répond ${r.code}.`, 'Adresse déclarée mais non servie.');
    }
  }

  // Les fichiers internes servis en ligne.
  //
  // Deployer un dossier entier expedie aussi ce qui n'a rien a y faire : les
  // fiches de suivi, les migrations, les notes. Mesure du 12/08/2026 sur une
  // app de l'ecosysteme : sa fiche interne etait publiquement lisible, avec le
  // nom d'un partenaire commercial et l'historique d'une panne. Personne ne
  // l'avait vu parce que personne ne va chercher une adresse qu'on n'a pas
  // publiee. La machine, elle, la teste.
  if (DOSSIER) {
    const interdits = ['.md', '.sql', '.env', '.toml', '.log', '.bak'];
    const candidats = fichiers(join(ROOT, DOSSIER), interdits)
      .concat(fichiers(join(ROOT, DOSSIER), ['.json']).filter((p) => !/manifest\.json$/i.test(p)));

    for (const f of candidats) {
      const rel = relative(join(ROOT, DOSSIER), f).replace(/\\/g, '/');
      if (rel.startsWith('public/')) continue; // deja servi a dessein
      compte.adresses++;
      const r = await reponse(SITE + '/' + rel.replace(/^public\//, ''));
      if (!r) { incertain('site', `Impossible de tester ${rel}.`); continue; }
      if (r.code === 200) {
        prouve('site', `${rel} est servi en ligne alors que c'est un fichier interne.`,
          'Ne déployer que les fichiers publics, pas le dossier de travail entier.');
      }
    }
  }

  // Une vraie page 404, et pas la page d'accueil deguisee.
  const r404 = await reponse(SITE + '/' + 'adresse-qui-nexiste-pas-' + 'controle');
  if (!r404) incertain('site', 'Impossible de tester la page 404.');
  else if (r404.code !== 404) {
    prouve('site', `Une adresse inexistante répond ${r404.code} au lieu de 404.`,
      'Un attrape-tout capture probablement tout ce qui n\'est pas déclaré.');
  }
}

// ============================================================================
// RESTITUTION
// ============================================================================

function restituer() {
  const par = (n) => constats.filter((c) => c.n === n);
  const titres = {
    PROUVE: 'PROUVÉ — mesuré, ou vérifiable sans ambiguïté. Bloquant.',
    SUSPECT: 'SUSPECT — la forme est douteuse, l\'exploitation n\'est pas démontrée.',
    INCERTAIN: 'INCERTAIN — le test n\'a pas conclu. N\'innocente rien.',
  };

  for (const n of ['PROUVE', 'SUSPECT', 'INCERTAIN']) {
    const l = par(n);
    if (!l.length) continue;
    console.log('\n' + titres[n]);
    console.log('-'.repeat(76));
    for (const c of l) {
      console.log(`  [${c.bloc}] ${c.quoi}`);
      if (c.quoiFaire) console.log(`           → ${c.quoiFaire}`);
    }
  }

  const p = par('PROUVE').length, s = par('SUSPECT').length;
  const incertitudes = par('INCERTAIN');
  const nonConclus = incertitudes.filter((c) => !c.volontaire);

  console.log('\n' + '='.repeat(76));
  console.log(`Contrôlé : ${compte.tables} table(s) attaquées à la clé publique, ${compte.fonctions} fonction(s), `
    + `${compte.fichiers} page(s), ${compte.adresses} adresse(s) en ligne.`);
  console.log(`${p} prouvé(s) · ${s} suspect(s) · ${incertitudes.length} incertain(s), dont ${nonConclus.length} non conclu(s)`);

  if (p) {
    console.log('\nMISE EN LIGNE BLOQUÉE. Les constats prouvés se corrigent avant de déployer.');
    process.exit(1);
  }
  if (nonConclus.length) {
    console.log('\nMISE EN LIGNE BLOQUÉE. Rien de prouvé, mais un contrôle n\'a pas pu conclure.');
    console.log('Un test qui n\'a pas tourné ne vaut pas un test réussi : relancer.');
    process.exit(1);
  }
  console.log('\nRien de prouvé. Ce qui reste demande un œil, pas une correction.');
  console.log('Et ce qu\'aucun script ne voit : si la formulation est comprise, si le');
  console.log('livrable est le bon, et ce que ça donne dans la main sur un vrai téléphone.');
  process.exit(0);
}

// ============================================================================

(async () => {
  console.log('Contrôle avant mise en ligne');
  if (DOSSIER) console.log('  dossier : ' + DOSSIER);
  if (SITE) console.log('  site    : ' + SITE);

  try {
    await controlerBase();
  } catch (e) { incertain('base', 'Contrôle de base interrompu : ' + e.message); }

  try {
    controlerFichiers();
  } catch (e) { incertain('fichiers', 'Contrôle des fichiers interrompu : ' + e.message); }

  try {
    await controlerSite();
  } catch (e) { incertain('site', 'Contrôle du site interrompu : ' + e.message); }

  restituer();
})().catch((e) => { console.error('Le contrôle n\'a pas pu tourner : ' + e.message); process.exit(2); });

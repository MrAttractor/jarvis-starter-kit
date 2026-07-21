// ============================================================
// Batterie de JUSTESSE du classement en famille — edge function `diagnostic`.
//
// La batterie `diagnostic-battery.mjs` verifie que la famille est VALIDE (A/B/C/D).
// Celle-ci verifie qu'elle est JUSTE. C'est different, et c'est le trou trouve le
// 21/07/2026 : un prospect "jus naturels a Cocody, tout sur WhatsApp, note sur un
// cahier, ne sait pas ce qu'il reste en stock" (cas d'ecole d'App pro) a ete classe
// famille B (conseil). La famille aiguille tout le parcours : mal classer, c'est
// proposer du conseil a 350 EUR a quelqu'un qui aurait signe une app a 490 EUR + MRR.
//
// Tourne EN ISOLATION : appel direct a l'API, aucune ecriture en base, aucun email.
// Chaque cas est joue N fois pour mesurer la STABILITE (Haiku n'est pas deterministe).
//
// Lancer : node livrables/ecosysteme-attractor/attractor-assists/app/tests/famille-battery.mjs
// Prerequis : .env a la racine (ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RUNS = Number(process.env.RUNS || 3);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..');
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env'), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const KEY = env.ANTHROPIC_API_KEY, URL = env.SUPABASE_URL, SR = env.SUPABASE_SERVICE_ROLE_KEY;

// Meme cerveau qu'en production : la methode vient de la base, jamais du modele seul.
const r = await fetch(`${URL}/rest/v1/methode_modules?select=titre,contenu&etape=in.(decouverte,diagnostic,ton)&actif=eq.true&order=ordre`, { headers: { apikey: SR, Authorization: `Bearer ${SR}` } });
const mods = await r.json();
const methode = (Array.isArray(mods) ? mods : []).map(m => `### ${m.titre}\n${m.contenu}`).join('\n\n');

// ATTENTION FIDELITE : ce prompt est la copie EXACTE de celui de
// supabase/functions/diagnostic/index.ts. La batterie `diagnostic-battery.mjs`
// utilise une version simplifiee QUI OMET la ligne de definition des familles :
// elle mesure donc un prompt qui n'existe pas en production. Ne pas simplifier ici.
// Toute modification du prompt de production doit etre reportee dans ce fichier.
const SYSTEM = `Tu es le consultant de découverte de l'Agence Mr Attractor. Tu analyses un entrepreneur à partir de la MÉTHODE ATTRACTOR ci-dessous — jamais à partir de tes seules connaissances.

${methode}

À partir des réponses de l'entrepreneur, produis un diagnostic FIDÈLE à la méthode. Réponds en JSON strict, sans texte autour :
{
  "synthese": "<3-4 phrases chaleureuses qui montrent qu'on a compris son activité et sa situation, dans un ton bienveillant et concret>",
  "cartographie": ["<étape 1 de son process actuel>", "<étape 2>", "..."],
  "problemes": ["<problème réel détecté>", "..."],
  "opportunites": ["<opportunité d'automatisation ou d'amélioration concrète, reliée à la méthode>", "..."],
  "famille": "A" | "B" | "C" | "D",
  "couloir": "Organisation" | "Visibilité" | "Ventes",
  "message_whatsapp": "<premier message WhatsApp de contact À FROID, prêt à envoyer.>"
}
Famille : A = besoin d'une app/outil métier ; B = besoin de conseil/structuration ; D = business établi avec chiffres où on aligne sur la performance. Choisis la plus probable.`;
// Copie EXACTE de CLASSIF_SYSTEM de la fonction de production (version enrichie 21/07/2026).
const CLASSIF = `Tu classes le besoin d'un entrepreneur en UNE seule lettre.

Règle de décision, dans cet ordre :

1. D — SEULEMENT si le business est déjà établi ET pilote des chiffres (comptabilité tenue, CA/marge suivis, plusieurs employés ou points de vente) ET le sujet est la rentabilité. Un entrepreneur qui débute n'est JAMAIS D.

2. A — s'il décrit une activité qui VEND déjà quelque chose et perd du temps ou de l'information dans son process : commandes notées à la main ou dans WhatsApp, stock inconnu, prix répétés en boucle, suivi de livraison au téléphone, cahiers qui ne concordent pas, plusieurs vendeurs. Le livrable est un OUTIL. C'est le cas le plus fréquent.

3. B — s'il n'a PAS encore d'offre claire ou de clientèle définie : il ne sait pas quoi vendre, à qui, ni à quel prix, ou il prépare un lancement. Le livrable est une RÉFLEXION, pas un outil.

4. C — assistant IA personnel. Très rare, ne le choisis que si c'est demandé explicitement.

Départager A et B quand les deux semblent possibles : cherche une PERTE D'INFORMATION dans son quotidien (commandes oubliées, stock inconnu, cahiers qui ne concordent, statuts demandés au téléphone). S'il y a une perte d'information, c'est A, même s'il doute aussi de ses prix : l'outil est ce qui se livre. S'il n'y a aucune perte d'information et que le problème est uniquement le prix, le positionnement ou l'offre, c'est B.

Réponds UNIQUEMENT par la lettre A, B, C ou D.`;

async function classify(brief) {
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 5, system: CLASSIF, messages: [{ role: 'user', content: brief }] }) });
  const d = await res.json();
  return ((d?.content ?? []).map(b => b.text).join('').toUpperCase().match(/[ABCD]/) || [null])[0];
}
async function analyze(answers, contact, nom = 'Prospect Test') {
  // Brief construit exactement comme en production (Nom ET Contact).
  const brief = Object.entries(answers).map(([k, v]) => `${k} : ${v}`).join('\n') + `\nNom : ${nom}\nContact : ${contact}`;
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 2000, system: SYSTEM, messages: [{ role: 'user', content: brief }, { role: 'assistant', content: '{' }] }) });
  const d = await res.json();
  const raw = '{' + (d?.content ?? []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
  const m = raw.match(/\{[\s\S]*\}/);
  let parsed = null;
  try { parsed = JSON.parse(m ? m[0] : raw); } catch { /* ignore */ }
  // Reproduit la logique de production depuis le 21/07/2026 : la classification dédiée
  // est SYSTÉMATIQUE, la famille du gros prompt n'est qu'un filet de secours.
  const famPrompt = String(parsed?.famille ?? '').trim().toUpperCase();
  const famClassif = await classify(brief);
  const fam = /^[ABCD]$/.test(String(famClassif)) ? famClassif : (/^[ABCD]$/.test(famPrompt) ? famPrompt : 'A');
  return { fam, src: fam === famClassif ? 'classif' : 'secours', famPrompt, couloir: parsed?.couloir };
}

// ── Les cas. `att` = famille attendue, tranchee sur le barème :
//    A = il lui faut un OUTIL (catalogue, commandes, stock, tableau de bord)
//    B = il lui faut du CONSEIL (positionnement, offre, modele) sans outil a livrer
//    D = business etabli avec chiffres suivis, remuneration alignee sur la performance
// Les paires marquees `pair` ne different QUE par la reponse "objectif" : elles
// isolent l'hypothese que "Mieux m'organiser" tire artificiellement vers B.
const S = [
  { n: 'A1 jus Cocody / organiser', att: 'A', pair: 'jus', c: '+2250700000001', a: {
    activite: 'Je vends des jus naturels bissap et gingembre a Abidjan, Cocody',
    offre: 'Bouteilles 50cl et 1L, livrees a domicile et en bureau, packs evenements',
    clients: 'Familles de Cocody et bureaux qui commandent pour leurs equipes',
    canal: 'Tout par WhatsApp, je note sur un cahier, parfois j oublie des commandes',
    douleur: 'Je repete les memes prix toute la journee et je ne sais jamais combien j ai vendu ni ce qu il me reste en stock',
    objectif: 'Mieux m\'organiser' } },
  { n: 'A2 jus Cocody / vendre', att: 'A', pair: 'jus', c: '+2250700000002', a: {
    activite: 'Je vends des jus naturels bissap et gingembre a Abidjan, Cocody',
    offre: 'Bouteilles 50cl et 1L, livrees a domicile et en bureau, packs evenements',
    clients: 'Familles de Cocody et bureaux qui commandent pour leurs equipes',
    canal: 'Tout par WhatsApp, je note sur un cahier, parfois j oublie des commandes',
    douleur: 'Je repete les memes prix toute la journee et je ne sais jamais combien j ai vendu ni ce qu il me reste en stock',
    objectif: 'Vendre plus' } },
  { n: 'A3 pagnes stock+equipe', att: 'A', c: '+2250700000003', a: {
    activite: 'Boutique de pagnes wax a Treichville',
    offre: 'Pagnes au metre, ensembles cousus, vente en gros aux revendeuses',
    clients: 'Revendeuses du marche et clientes finales',
    canal: 'WhatsApp et la boutique physique, 3 vendeuses notent sur des cahiers separes',
    douleur: 'Je ne sais pas quel stock il reste ni qui a vendu quoi, les cahiers ne concordent jamais',
    objectif: 'Mieux m\'organiser' } },
  { n: 'A4 livraison suivi', att: 'A', c: '+2250700000004', a: {
    activite: 'Service de livraison de repas a Yopougon',
    offre: 'Livraison de plats pour restaurants partenaires',
    clients: 'Restaurants et clients finaux du quartier',
    canal: 'Appels et WhatsApp, mes livreurs m appellent pour chaque course',
    douleur: 'Je passe ma journee au telephone a dire ou en est chaque commande, les clients rappellent sans arret',
    objectif: 'Mieux m\'organiser' } },
  { n: 'B1 offre floue', att: 'B', pair: 'offre', c: '+2250700000005', a: {
    activite: 'Je suis coach en developpement personnel a Abidjan',
    offre: 'Je fais un peu de tout, des seances, des ateliers, ca depend des demandes',
    clients: 'Je ne sais pas trop, un peu tout le monde',
    canal: 'Bouche a oreille surtout',
    douleur: 'Je n arrive pas a expliquer ce que je vends, les gens ne comprennent pas mon offre et ne signent pas',
    objectif: 'Vendre plus' } },
  { n: 'B2 positionnement', att: 'B', c: '+33700000006', a: {
    activite: 'Je lance une marque de cosmetiques naturels',
    offre: 'Rien n est encore fige, je reflechis a la gamme et au positionnement',
    clients: 'Je vise la diaspora mais je ne sais pas comment me differencier',
    canal: 'Rien encore, je prepare le lancement',
    douleur: 'Je ne sais pas par ou commencer ni comment me positionner face aux marques deja installees',
    objectif: 'Me faire connaitre' } },
  { n: 'B3 prix trop bas', att: 'B', c: '+2250700000007', a: {
    activite: 'Photographe evenementiel a Abidjan',
    offre: 'Mariages, bapteme, portraits',
    clients: 'Particuliers et quelques entreprises',
    canal: 'Instagram et recommandations',
    douleur: 'Je travaille beaucoup mais je ne gagne rien, je crois que je vends trop bas et je n ose pas augmenter',
    objectif: 'Vendre plus' } },
  { n: 'D1 distribution etablie', att: 'D', c: '+2250700000008', a: {
    activite: 'Distribution de produits agroalimentaires, 12 ans d activite, 14 employes',
    offre: 'Approvisionnement de 60 points de vente a Abidjan et a l interieur',
    clients: 'Supermarches, epiceries, grossistes',
    canal: 'Commerciaux terrain, commandes par telephone, comptabilite tenue par un cabinet',
    douleur: 'Ma marge se degrade trimestre apres trimestre et je vois mes chiffres trop tard pour reagir',
    objectif: 'Vendre plus' } },
  { n: 'MIX conseil + outil', att: 'A', c: '+2250700000009', a: {
    activite: 'Patisserie sur commande a Cocody',
    offre: 'Gateaux personnalises, je ne sais pas bien fixer mes prix',
    clients: 'Mamans du quartier, quelques entreprises pour les evenements',
    canal: 'WhatsApp, je note les commandes dans mes messages et je m y perds',
    douleur: 'Je perds des commandes dans les messages et en plus je ne sais pas si je gagne de l argent sur chaque gateau',
    objectif: 'Mieux m\'organiser' } },
];

console.log(`Batterie JUSTESSE du classement — ${S.length} cas x ${RUNS} passages\n`);
const results = [];
for (const s of S) {
  const runs = await Promise.all(Array.from({ length: RUNS }, () => analyze(s.a, s.c)));
  const fams = runs.map(x => x.fam);
  const hits = fams.filter(f => f === s.att).length;
  const stable = new Set(fams).size === 1;
  const srcs = runs.map(x => x.src);
  results.push({ s, fams, hits, stable, srcs });
  const icon = hits === RUNS ? '[OK]  ' : hits === 0 ? '[FAUX]' : '[INST]';
  console.log(`${icon} ${s.n.padEnd(26)} attendu=${s.att}  obtenu=${fams.join(',')}  ${stable ? '' : '<<< INSTABLE'} ${hits < RUNS ? `>>> ${RUNS - hits}/${RUNS} faux` : ''}`);
  if (srcs.includes('secours')) console.log(`${''.padEnd(7)}   (filet de secours utilise : ${srcs.filter(x => x === 'secours').length}/${RUNS})`);
}

// ── Analyse ciblee : l'effet de la reponse "objectif" a periметre identique ──
console.log('\n--- Effet de la reponse "objectif" (le reste du brief est identique) ---');
const pairs = {};
for (const r of results) if (r.s.pair) (pairs[r.s.pair] ||= []).push(r);
for (const [k, rs] of Object.entries(pairs)) {
  if (rs.length < 2) continue;
  for (const r of rs) console.log(`  ${k} | objectif="${r.s.a.objectif}"`.padEnd(46) + ` -> ${r.fams.join(',')}`);
  const sets = rs.map(r => [...new Set(r.fams)].sort().join(''));
  console.log(`  => ${new Set(sets).size === 1 ? 'aucun effet mesure' : 'EFFET CONFIRME : la reponse objectif change la famille'}`);
}

const totalRuns = results.length * RUNS;
const totalHits = results.reduce((a, r) => a + r.hits, 0);
const wrong = results.filter(r => r.hits < RUNS);
console.log(`\n===== ${totalHits}/${totalRuns} classements justes (${Math.round(100 * totalHits / totalRuns)}%) — ${wrong.length} cas sur ${results.length} en defaut =====`);
for (const w of wrong) console.log(`   ${w.s.n} : attendu ${w.s.att}, obtenu ${w.fams.join(',')}`);
process.exit(wrong.length ? 1 : 0);

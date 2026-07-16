// ============================================================
// Batterie de fiabilisation du tunnel — edge function `diagnostic`.
// Tire des scénarios réalistes ET limites sur l'analyse Claude, EN ISOLATION
// (aucune donnée créée en base, aucun email envoyé). But : trouver les ratés
// AVANT qu'un vrai prospect les subisse.
//
// Lancer :  node livrables/ecosysteme-attractor/attractor-assists/app/tests/diagnostic-battery.mjs
// Prérequis : .env à la racine avec ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
//
// Reproduit la logique de production de la fonction : prefill "{" (force le JSON),
// max_tokens 2000 (anti-troncature), validation stricte de la famille (A/B/C/D sinon
// classification de secours). Historique : créée le 16/07/2026 après 2 ratés en prod
// (Nabyntou = troncature sur input riche ; input pauvre = Claude partait en prose).
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..');
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env'), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const KEY = env.ANTHROPIC_API_KEY, URL = env.SUPABASE_URL, SR = env.SUPABASE_SERVICE_ROLE_KEY;

const r = await fetch(`${URL}/rest/v1/methode_modules?select=titre,contenu&etape=in.(decouverte,diagnostic,ton)&actif=eq.true&order=ordre`, { headers: { apikey: SR, Authorization: `Bearer ${SR}` } });
const mods = await r.json();
const methode = (Array.isArray(mods) ? mods : []).map(m => `### ${m.titre}\n${m.contenu}`).join('\n\n');
const SYSTEM = `Tu es le consultant de découverte de l'Agence Mr Attractor. Tu analyses un entrepreneur à partir de la MÉTHODE ATTRACTOR ci-dessous.
${methode}
Réponds en JSON strict : {"synthese":"...","cartographie":["..."],"problemes":["..."],"opportunites":["..."],"famille":"A|B|C|D","couloir":"Organisation|Visibilité|Ventes","message_whatsapp":"..."}`;
const CLASSIF = `Tu classes le besoin en UNE lettre. A=app/outil métier. B=conseil/structuration. C=assistant IA. D=business établi avec chiffres/performance. Réponds UNIQUEMENT la lettre.`;

async function classify(brief) {
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 5, system: CLASSIF, messages: [{ role: 'user', content: brief }] }) });
  const d = await res.json();
  return ((d?.content ?? []).map(b => b.text).join('').toUpperCase().match(/[ABCD]/) || [null])[0];
}
async function analyze(answers, contact) {
  const brief = Object.entries(answers).map(([k, v]) => `${k} : ${v}`).join('\n') + `\nContact : ${contact}`;
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 2000, system: SYSTEM, messages: [{ role: 'user', content: brief }, { role: 'assistant', content: '{' }] }) });
  const d = await res.json();
  const raw = '{' + (d?.content ?? []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
  const m = raw.match(/\{[\s\S]*\}/);
  let parsed = null, perr = null;
  try { parsed = JSON.parse(m ? m[0] : raw); } catch (e) { perr = String(e).slice(0, 50); }
  let famSrc = 'claude';
  if (parsed) { const fr = String(parsed.famille ?? '').trim().toUpperCase(); if (/^[ABCD]$/.test(fr)) parsed.famille = fr; else { parsed.famille = await classify(brief); famSrc = 'fallback'; } }
  return { stop: d?.stop_reason, apiErr: d?.error?.message, parsed, perr, famSrc };
}

const S = [
  { n: '1 riche (Nabyntou)', junk: false, c: 'nabycook@gmail.com', a: { activite: 'consultante culinaire a Paris', offre: '3 poles ateliers traiteur epicerie', clients: '5 cibles B2C B2B institutionnel detaillees', canal: 'mail telephone', douleur: 'ecrire des offres, faire la promotion', objectif: 'Vendre plus' } },
  { n: '2 vague', junk: false, c: '+2250700000010', a: { activite: 'je vends des trucs', offre: 'des produits', clients: 'des gens', canal: 'whatsapp', douleur: 'pas assez de ventes', objectif: 'Vendre plus' } },
  { n: '3 email au lieu num', junk: false, c: 'marie@gmail.com', a: { activite: 'vente de pagnes', offre: 'pagnes wax', clients: 'femmes', canal: 'whatsapp', douleur: 'commandes a la main', objectif: 'Mieux m\'organiser' } },
  { n: '4 champs vides', junk: false, c: '+22501020304', a: { activite: 'couturiere', offre: '', clients: '', canal: '', douleur: '', objectif: '' } },
  { n: '5 monster (repetition)', junk: true, c: '+2250799999999', a: { activite: 'restaurant '.repeat(30), offre: 'menu '.repeat(120), clients: 'clients '.repeat(120), canal: 'canal '.repeat(80), douleur: 'douleur '.repeat(120), objectif: 'Vendre plus' } },
  { n: '6 anglais', junk: false, c: '+447700900000', a: { activite: 'coffee shop in London', offre: 'coffee and pastries', clients: 'young professionals', canal: 'walk-in Instagram', douleur: 'lose track of inventory', objectif: 'Vendre plus' } },
  { n: '7 emojis/special', junk: false, c: '+2250701020304', a: { activite: '🍰 pâtisserie 🎂', offre: 'gâteaux <sur commande>', clients: 'mamans 💼', canal: 'WhatsApp 📱', douleur: 'trop de messages 😩', objectif: 'Mieux m\'organiser' } },
  { n: '8 CI app typique', junk: false, c: '+2250506070809', a: { activite: 'poulets braises', offre: 'poulet alloco boissons', clients: 'quartier livraison', canal: 'appels whatsapp', douleur: 'perds des commandes', objectif: 'Vendre plus' } },
  { n: '9 bruit/pollueur', junk: true, c: '+2250000000000', a: { activite: 'azerty', offre: '.', clients: 'test', canal: 'x', douleur: 'rien', objectif: 'Vendre plus' } },
  { n: '10 ultra court', junk: false, c: '+2250712345678', a: { activite: 'coiffure', offre: 'tresses', clients: 'femmes', canal: 'whatsapp', douleur: 'rdv', objectif: 'Mieux m\'organiser' } },
];

let fails = 0;
for (const s of S) {
  const res = await analyze(s.a, s.c); const p = res.parsed;
  const bad = [];
  if (res.apiErr) bad.push('API_ERR');
  if (res.stop === 'max_tokens') bad.push('TRONQUÉ');
  if (res.perr) bad.push('PARSE_FAIL');
  if (!p?.famille || !/^[ABCD]$/.test(p.famille)) bad.push('FAMILLE_INVALIDE');
  if (!(p?.problemes?.length)) bad.push('0_problemes');
  if (!p?.message_whatsapp) bad.push('wa_absent');
  // opportunités vides tolérées sur les inputs volontairement dégénérés (junk)
  if (!(p?.opportunites?.length) && !s.junk) bad.push('0_opportunites');
  if (bad.length) fails++;
  console.log(`${bad.length ? '❌' : '✅'} ${s.n.padEnd(24)} stop=${String(res.stop).padEnd(9)} fam=${p?.famille}(${res.famSrc}) prob=${p?.problemes?.length || 0} opp=${p?.opportunites?.length || 0} ${bad.length ? '>>> ' + bad.join(', ') : ''}`);
}
console.log(`\n===== ${S.length - fails}/${S.length} scénarios OK, ${fails} en échec =====`);
process.exit(fails ? 1 : 0);

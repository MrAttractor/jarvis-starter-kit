import { JSDOM } from 'jsdom';
import fs from 'fs';
const SITE = 'C:/Users/macar/OneDrive/Bureau/jarvis-starter-kit/livrables/clients/studio-ia-partenaire/site';
const dom = new JSDOM(fs.readFileSync(SITE+'/index.html','utf8'), { runScripts:'outside-only' });
const src = fs.readFileSync(SITE+'/assets/contenu.js','utf8').replace(/const CONTENU_READY[\s\S]*$/,'');
const { CONTENU_CHAMPS, CONTENU_TYPES } = dom.window.eval(src + ' ; ({CONTENU_CHAMPS:CONTENU_CHAMPS, CONTENU_TYPES:CONTENU_TYPES})');
const doc = dom.window.document;

const dansHtml = new Set();
doc.querySelectorAll('[data-c]').forEach(e=> dansHtml.add(e.getAttribute('data-c')));
doc.querySelectorAll('[data-c-poster]').forEach(e=> dansHtml.add(e.getAttribute('data-c-poster')));
const declares = CONTENU_CHAMPS.flatMap(g=> g.champs.map(c=> c.cle));

let ko = 0;
const orphelinsAdmin = declares.filter(c=> !dansHtml.has(c));
const orphelinsHtml  = [...dansHtml].filter(c=> !declares.includes(c));
if (orphelinsAdmin.length){ ko++; console.log('ECHEC proposes dans l admin mais absents du site :', orphelinsAdmin); }
else console.log('OK    les ' + declares.length + ' champs proposes existent tous dans le site');
if (orphelinsHtml.length){ ko++; console.log('ECHEC reperes dans le site mais non proposes :', orphelinsHtml); }
else console.log('OK    aucun repere orphelin dans le site');

const dbl = declares.filter((c,i)=> declares.indexOf(c)!==i);
if (dbl.length){ ko++; console.log('ECHEC cles en double :', dbl); } else console.log('OK    aucune cle en double');

const vides = [];
declares.forEach(cle=>{
  const t = CONTENU_TYPES[cle];
  const el = doc.querySelector('[data-c="'+cle+'"]') || doc.querySelector('[data-c-poster="'+cle+'"]');
  let v;
  if (t==='lien') v = el.getAttribute('href')==='#' ? '(vide, attendu)' : el.getAttribute('href');
  else if (t==='image') v = el.getAttribute('src');
  else if (t==='video') v = (el.querySelector('source')||el).getAttribute('src') || el.getAttribute('poster');
  else if (t==='compteur') v = el.getAttribute('data-to');
  else v = el.textContent.trim();
  if (!v) vides.push(cle);
});
if (vides.length) console.log('INFO  champs sans valeur de depart :', vides);
else console.log('OK    tous les champs ont une valeur de depart affichable');

console.log(ko===0 ? '\n=== COHERENCE ADMIN / SITE VALIDEE ===' : '\n=== ' + ko + ' INCOHERENCE(S) ===');
process.exit(ko?1:0);

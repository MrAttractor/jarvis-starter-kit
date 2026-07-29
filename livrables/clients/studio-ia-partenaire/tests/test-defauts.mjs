/* teste la VRAIE fonction loadDefauts extraite de admin.html,
   pour prouver que le formulaire affiche bien les valeurs actuelles du site */
import { JSDOM } from 'jsdom';
import fs from 'fs';
const SITE = 'C:/Users/macar/OneDrive/Bureau/jarvis-starter-kit/livrables/clients/studio-ia-partenaire/site';
const admin = fs.readFileSync(SITE+'/admin.html','utf8');
const m = admin.match(/async function loadDefauts\(\)\{[\s\S]*?\n\}/);
if(!m){ console.log('ECHEC : loadDefauts introuvable dans admin.html'); process.exit(1); }

const dom = new JSDOM('<!doctype html><body>', { runScripts:'outside-only' });
const src = fs.readFileSync(SITE+'/assets/contenu.js','utf8').replace(/const CONTENU_READY[\s\S]*$/,'');
const indexHtml = fs.readFileSync(SITE+'/index.html','utf8');
dom.window.__html = indexHtml;
// on remplace le fetch reseau par la lecture du fichier local, le reste du code est inchange
dom.window.fetch = () => Promise.resolve({ ok:true, text:()=>Promise.resolve(dom.window.__html) });

const loadDefauts = dom.window.eval(src + ' ; ' + m[0] + ' ; loadDefauts');
const def = await loadDefauts();

let ko = 0;
const check = (cle, attendu) => {
  const ok = def[cle] === attendu;
  if(!ok) ko++;
  console.log((ok?'OK   ':'ECHEC')+' '+cle+' = '+JSON.stringify(def[cle])+(ok?'':' (attendu '+JSON.stringify(attendu)+')'));
};
console.log('--- valeurs de depart lues dans le site reel ---');
check('accueil.titre',    'Créer autrement.');
check('accueil.video',    'assets/video/accueil.mp4');
check('accueil.poster',   'assets/video/accueil-poster.jpg');
check('accueil.bouton',   'Accéder au studio');
check('hero.titre_b',     'ultra-réalistes');
check('studio.photo',     'assets/img/studio-emmanuel.jpg');
check('chiffre3.valeur',  '8');
check('chiffre1.libelle', 'Créations livrées');
check('formation1.prix',  '30 000');
check('formation3.lien',  '');           // href="#" => vide, c'est le lien manquant
check('coaching2.prix',   '200 000');
check('contact.ville',    "Abidjan, Côte d'Ivoire");
console.log('\nchamps lus : ' + Object.keys(def).length + ' / 33');
if(Object.keys(def).length !== 33){ ko++; console.log('ECHEC nombre de champs lus'); }
console.log(ko===0 ? '\n=== LE FORMULAIRE AFFICHERA LES BONNES VALEURS ===' : '\n=== '+ko+' ECHEC(S) ===');
process.exit(ko?1:0);

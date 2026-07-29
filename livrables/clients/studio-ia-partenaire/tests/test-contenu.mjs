import { JSDOM } from 'jsdom';
import fs from 'fs';

const SITE = 'C:/Users/macar/OneDrive/Bureau/jarvis-starter-kit/livrables/clients/studio-ia-partenaire/site';
const html = fs.readFileSync(SITE + '/index.html', 'utf8');
const moteur = fs.readFileSync(SITE + '/assets/contenu.js', 'utf8');

const dom = new JSDOM(html, { runScripts: 'outside-only' });
const { window } = dom;
// on n'exécute pas le fetch : on injecte le moteur puis on applique une carte de valeurs
window.eval(moteur.replace(/const CONTENU_READY[\s\S]*$/, ''));

const q = s => window.document.querySelector(s);
const txt = s => q(s)?.textContent?.trim();

let ko = 0;
const check = (nom, attendu, obtenu) => {
  const ok = attendu === obtenu;
  if (!ok) ko++;
  console.log((ok ? 'OK   ' : 'ECHEC') + ' ' + nom + (ok ? '' : `\n        attendu: ${JSON.stringify(attendu)}\n        obtenu : ${JSON.stringify(obtenu)}`));
};

// --- état d'origine, sans aucune modification ---
console.log('--- 1. table vide : le site doit rester intact ---');
window.applyContenu({});
check('titre accueil intact', 'Créer autrement.', txt('[data-c="accueil.titre"]'));
check('chiffre 3 intact (data-to)', '8', q('[data-c="chiffre3.valeur"]').getAttribute('data-to'));
check('video intacte', 'assets/video/accueil.mp4', q('[data-c="accueil.video"] source').getAttribute('src'));

// --- valeurs modifiées ---
console.log('--- 2. modifications appliquees ---');
window.applyContenu({
  'accueil.titre':    'Créer sans limite.',
  'accueil.soustitre':'Nouvelle phrase.',
  'accueil.bouton':   'Entrer',
  'accueil.poster':   'https://cdn.test/poster.jpg',
  'accueil.video':    'https://cdn.test/film.mp4',
  'hero.titre_b':     'hyper-réalistes',
  'studio.photo':     'https://cdn.test/moi.jpg',
  'chiffre3.valeur':  '12',
  'chiffre1.valeur':  '750',
  'chiffre4.libelle': 'Élèves formés',
  'formation3.lien':  'https://pay.test/imagin3',
  'formation1.prix':  '35 000',
  'contact.ville':    'Abidjan, Cocody',
});
check('titre accueil remplace', 'Créer sans limite.', txt('[data-c="accueil.titre"]'));
check('sous-titre remplace', 'Nouvelle phrase.', txt('[data-c="accueil.soustitre"]'));
check('texte du bouton remplace', 'Entrer', txt('[data-c="accueil.bouton"]'));
check('poster de la video', 'https://cdn.test/poster.jpg', q('[data-c-poster="accueil.poster"]').getAttribute('poster'));
check('source de la video', 'https://cdn.test/film.mp4', q('[data-c="accueil.video"] source').getAttribute('src'));
check('mots en orange du titre', 'hyper-réalistes', txt('[data-c="hero.titre_b"]'));
check('la classe orange est conservee', true, q('[data-c="hero.titre_b"]').classList.contains('grad-txt'));
check('photo du studio', 'https://cdn.test/moi.jpg', q('[data-c="studio.photo"]').getAttribute('src'));
check('compteur 3 (data-to)', '12', q('[data-c="chiffre3.valeur"]').getAttribute('data-to'));
check('compteur 1 (data-to)', '750', q('[data-c="chiffre1.valeur"]').getAttribute('data-to'));
check('libelle compteur 4', 'Élèves formés', txt('[data-c="chiffre4.libelle"]'));
check('lien de paiement IMAGIN 3', 'https://pay.test/imagin3', q('[data-c="formation3.lien"]').getAttribute('href'));
check('prix IMAGIN 1', '35 000', txt('[data-c="formation1.prix"]'));
check('la mention F CFA est conservee', true, q('[data-c="formation1.prix"]').parentElement.textContent.includes('F CFA'));
check('ville de contact', 'Abidjan, Cocody', txt('[data-c="contact.ville"]'));

// --- robustesse ---
console.log('--- 3. robustesse ---');
window.applyContenu({ 'accueil.titre': '' });
check('valeur vide ne vide pas le site', 'Créer sans limite.', txt('[data-c="accueil.titre"]'));
window.applyContenu({ 'cle.inexistante': 'x' });
console.log('OK    cle inconnue ignoree sans erreur');
window.applyContenu(null);
console.log('OK    carte nulle ignoree sans erreur');
check('aucun texte injecte en HTML (pas de balise)', true,
  (()=>{ window.applyContenu({'studio.para1':'<img src=x onerror=alert(1)>'});
         return q('[data-c="studio.para1"]').children.length === 0; })());

console.log(ko === 0 ? '\n=== TOUS LES TESTS PASSENT ===' : `\n=== ${ko} ECHEC(S) ===`);
process.exit(ko ? 1 : 0);

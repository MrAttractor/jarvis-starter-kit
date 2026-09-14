/* Recette du parcours VISITEUR de La Beynaumania.
 * ------------------------------------------------------------------
 * Pourquoi ce fichier existe : le 14/09/2026, une ligne visant un bouton
 * inexistant a vide toute la page du visiteur, et personne ne l'a vu parce
 * que l'agence teste toujours avec une session deja ouverte, donc sur
 * l'autre branche du code. Le seul ecran que voit un inconnu, c'est-a-dire
 * le seul qui convertit, etait le seul jamais parcouru. R-84.
 *
 * A LANCER AVANT CHAQUE MISE EN LIGNE.
 *
 *   node recette-visiteur.js                      -> la version en ligne
 *   node recette-visiteur.js <chemin/vers/public> -> les fichiers locaux
 *
 * Prerequis, une fois : npm i playwright-core && npx playwright install chromium
 */
/* playwright-core n'est pas installe dans ce dossier client : on le cherche la
   ou il se trouve, et on dit quoi faire s'il manque, plutot que d'echouer sur
   un message de module introuvable. */
let chromium;
try{ chromium = require('playwright-core').chromium; }
catch(e){
  try{ chromium = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright-core').chromium; }
  catch(_){
    console.error("playwright-core est absent. Depuis ce dossier :");
    console.error("  npm i playwright-core && npx playwright install chromium");
    process.exit(2);
  }
}
const http = require('http'), fs = require('fs'), path = require('path');

const RACINE = process.argv[2] || null;
const PORT = 8787;
const EN_LIGNE = 'https://demo.agenceattractor.com/beynaud/fan';

const TYPES = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json',
  '.webmanifest':'application/manifest+json','.jpg':'image/jpeg','.webp':'image/webp','.png':'image/png'};

/* Sert le dossier public tel quel, avec la seule regle d'URL propre de
   Cloudflare Pages dont la page a besoin. */
function servir(racine){
  return http.createServer((req,res)=>{
    let u = decodeURIComponent(req.url.split('?')[0]);
    if(u === '/beynaud/fan') u = '/beynaud/fan.html';
    const f = path.join(racine, u);
    fs.readFile(f,(e,d)=>{
      if(e){ res.writeHead(404); return res.end('404'); }
      res.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream'});
      res.end(d);
    });
  });
}

(async ()=>{
  let serveur = null, url = EN_LIGNE;
  if(RACINE){ serveur = servir(RACINE); await new Promise(r=>serveur.listen(PORT,r)); url = `http://localhost:${PORT}/beynaud/fan`; }
  console.log('Recette sur ' + url + '\n');

  const nav = await chromium.launch();
  // Un iPhone, sans session : exactement ce qu'ouvre un fan qui recoit le lien.
  const ctx = await nav.newContext({
    viewport:{width:390,height:844}, deviceScaleFactor:3, isMobile:true, hasTouch:true,
    userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  });
  const page = await ctx.newPage();
  const erreurs = [];
  page.on('pageerror', e => erreurs.push('exception : ' + e.message));
  page.on('console', m => { if(m.type()==='error') erreurs.push('console : ' + m.text()); });

  await page.goto(url, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  const entree = await page.evaluate(()=>{
    const img = document.getElementById('clip-img');
    return {
      photoAffichee: !!img && img.complete && img.naturalWidth>0,
      clipLance: !!document.querySelector('#clip-layer iframe, #clip-layer video'),
      bouton: (document.getElementById('enter-btn')||{}).textContent.trim()
    };
  });
  await page.screenshot({path: path.join(__dirname,'recette-1-entree.png')});

  await page.click('#enter-btn');
  await page.waitForTimeout(3000);
  const apercu = await page.evaluate(()=>{
    const fil = document.getElementById('fil');
    const zd = document.querySelector('.zone-danger');
    return {
      splashFerme: document.getElementById('splash').classList.contains('out'),
      publications: fil ? fil.children.length : -1,
      porteInscription: !!document.querySelector('.porte'),
      // Rien qui appartient au membre ne doit fuir chez l'inconnu.
      fuiteEffacerCompte: !!zd && !zd.classList.contains('hidden'),
      fuiteCarteAmbassadeur: !document.getElementById('amb-card').classList.contains('hidden')
    };
  });
  await page.screenshot({path: path.join(__dirname,'recette-2-apercu.png'), fullPage:true});

  const echecs = [];
  if(!entree.photoAffichee)          echecs.push("la photo d'accueil ne s'affiche pas");
  if(!entree.clipLance)              echecs.push('le clip ne demarre pas');
  if(!apercu.splashFerme)            echecs.push("le bouton n'ouvre pas l'apercu");
  if(apercu.publications < 2)        echecs.push('le fil est vide (' + apercu.publications + ' element[s])');
  if(!apercu.porteInscription)       echecs.push("la porte d'inscription est absente");
  if(apercu.fuiteEffacerCompte)      echecs.push('FUITE : « Effacer mon compte » visible pour un inconnu');
  if(apercu.fuiteCarteAmbassadeur)   echecs.push('FUITE : la carte ambassadeur visible pour un inconnu');
  if(erreurs.length)                 echecs.push('erreurs JavaScript : ' + erreurs.join(' | '));

  console.log('Ecran d entree :', JSON.stringify(entree));
  console.log('Apercu         :', JSON.stringify(apercu));
  console.log('');
  if(echecs.length){ console.log('RECETTE EN ECHEC :'); echecs.forEach(e=>console.log('  - ' + e)); }
  else console.log('RECETTE OK : le parcours du visiteur est intact.');

  await nav.close(); if(serveur) serveur.close();
  process.exit(echecs.length ? 1 : 0);
})();

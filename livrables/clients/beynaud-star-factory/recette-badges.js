/* Recette des listes repliables et de l'etagere a badges — 21/09/2026
 * ------------------------------------------------------------------
 * Pourquoi ce fichier existe. Deux choses ajoutees le meme jour peuvent
 * echouer EN SILENCE, et c'est le pire cas :
 *   - une liste repliee qui ne se deplie pas ressemble a une liste courte ;
 *   - une etagere a badges qui ne recoit rien reste simplement cachee.
 * Dans les deux cas l'ecran est beau, aucune erreur n'apparait, et le defaut
 * ne se voit qu'en le cherchant. C'est exactement ce qui s'est passe le 19/09
 * avec des temoins qui peignaient un fil VIDE sans le signaler.
 *
 * Ce controle CLIQUE, il ne regarde pas. Il compte les lignes avant et apres
 * le clic, et il verifie que le bouton dit la verite.
 *
 *   node recette-badges.js site/public
 *
 * Prerequis, une fois : npm i playwright-core
 */
let chromium;
try { chromium = require('playwright-core').chromium; }
catch (e) {
  console.error('playwright-core est absent. Depuis ce dossier :');
  console.error('  npm i playwright-core');
  process.exit(2);
}
const http = require('http'), fs = require('fs'), path = require('path');

const RACINE = process.argv[2] || 'site/public';
const PORT = 8791;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.png': 'image/png' };

function servir(racine) {
  return http.createServer((req, res) => {
    let u = decodeURIComponent(req.url.split('?')[0]);
    if (/^\/(fan|app|rejoindre)$/.test(u)) u += '.html';
    if (u === '/') u = '/index.html';
    fs.readFile(path.join(racine, u), (e, d) => {
      if (e) { res.writeHead(404); return res.end('404'); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(u)] || 'application/octet-stream' });
      res.end(d);
    });
  });
}

let rates = 0;
function verifier(nom, vrai, detail) {
  if (!vrai) { rates++; console.log('  RATE  ' + nom + (detail ? '  -> ' + detail : '')); }
  else console.log('  ok    ' + nom);
}

/* Le membre de recette n'existe pas en base : sans cette reponse,
   l'application le deconnecte et on auditerait l'ecran d'inscription en
   croyant auditer l'espace du membre. */
const MEMBRE = { id: '00000000-0000-4000-8000-000000000001', prenom: 'Awa', lieu: 'Abidjan',
  code_ambassadeur: 'AWAX01', grade: 'membre', filleuls: 3, a_numero: true, jeton: 'recette' };

/* Les cles sont celles que rend REELLEMENT le serveur. Une facade qui invente
   ses propres noms de champs fait passer un test sur une application qui,
   elle, n'affiche rien. */
const b = (cle, nom, famille, ou_en, palier, quoi) =>
  ({ cle, nom, famille, quoi, ou_en, palier, prestige: 1, gagne: ou_en >= palier });
const BADGES = [
  b('premier_mot', 'Premier mot', 'parole', 3, 1, 'Laisser un commentaire'),
  b('coeur_chaud', 'Cœur chaud', 'coeur', 14, 10, '10 cœurs'),
  b('ton_avis', 'Ton avis compte', 'avis', 5, 3, 'Répondre à 3 sondages'),
  b('pionnier', 'Pionnier', 'maison', 1, 1, '100 premiers inscrits'),
  b('premier_filleul', 'Premier filleul', 'equipe', 3, 1, 'Faire entrer 1 fan'),
  b('recruteur', 'Recruteur', 'equipe', 3, 5, 'Faire entrer 5 fans'),
  b('on_t_entend', "On t'entend", 'parole', 3, 10, '10 commentaires'),
  b('jury', 'Membre du jury', 'avis', 5, 15, 'Répondre à 15 sondages'),
  b('griot', 'Le griot', 'parole', 3, 200, '200 commentaires'),
];

const STATS = {
  ok: true, total: 1284, ambassadeurs: 37, nbMessages: 18, nbComments: 214,
  topAmb: [1, 2, 3, 4, 5].map((n) => ({ prenom: 'Amb' + n, lieu: 'Abidjan', filleuls: 50 - n })),
  topContrib: [1, 2, 3, 4, 5].map((n) => ({ prenom: 'Contrib' + n, lieu: 'Abidjan', commentaires: 10 - n,
    votes: 2, coeurs: 8, points: 100 - n, badge: n === 1 ? 'Porte-voix' : null })),
  recents: [1, 2, 3, 4, 5].map((n) => ({ prenom: 'Fan' + n, lieu: 'Bouaké', grade: 'membre',
    created_at: new Date(Date.now() - n * 36e5).toISOString() })),
  lieux: [],
};

(async () => {
  const srv = servir(RACINE);
  await new Promise((r) => srv.listen(PORT, r));
  const nav = await chromium.launch();
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();

  const erreurs = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/Permissions policy/i.test(m.text())) erreurs.push(m.text()); });

  await page.route('**/functions/v1/bey-public', async (route) => {
    let action = '';
    try { action = JSON.parse(route.request().postData() || '{}').action; } catch (_) {}
    const rep = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
    if (action === 'me') return rep({ ok: true, membre: MEMBRE });
    if (action === 'badges') return rep({ ok: true, badges: BADGES, gagnes: BADGES.filter((x) => x.gagne).length, total: BADGES.length });
    if (action === 'classement') return rep({ ok: true, ouvert: false, podium: [], saison: null });
    if (action === 'feed') return rep({ ok: true, fil: [], apercu: false, total_posts: 0, restants: 0, lives: [], contenus: [], photos: [], messages: [], sondages: [] });
    return rep({ ok: true });
  });
  await page.route('**/functions/v1/bey-admin', (route) => {
    let action = '';
    try { action = JSON.parse(route.request().postData() || '{}').action; } catch (_) {}
    const corps = action === 'stats' ? STATS
      : action === 'classement' ? { ok: true, joueurs: 5, confirmes: 50,
          saison: { nom: 'Saison 1', fin: new Date(Date.now() + 12 * 864e5).toISOString() },
          podium: [1, 2, 3, 4, 5].map((n) => ({ rang: n, prenom: 'Amb' + n, lieu: 'Abidjan', inscrits: 10 - n, points: 30 - n * 3 })) }
      : { ok: true };
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(corps) });
  });

  // ═══════════ L'ESPACE FAN ═══════════
  console.log("\n1. L'etagere a badges, dans Le Club");
  await page.addInitScript((m) => { localStorage.setItem('bey_membre', JSON.stringify(m)); }, MEMBRE);
  await page.goto('http://localhost:' + PORT + '/fan');
  await page.waitForTimeout(1200);
  await page.click('.ong[data-ong="club"]');
  await page.waitForTimeout(600);

  const carteVisible = await page.isVisible('#bdg-card');
  verifier('la carte est affichee', carteVisible);
  verifier('le compteur annonce 5 sur 9', (await page.textContent('#bdg-compte')).trim() === '5 / 9',
    (await page.textContent('#bdg-compte')).trim());
  verifier('six tuiles visibles, pas neuf', await page.locator('#bdg-grille .bdg-t').count() === 6,
    String(await page.locator('#bdg-grille .bdg-t').count()));
  verifier('les cinq gagnes sont dores, et passent devant', await page.locator('#bdg-grille .bdg-t.on').count() === 5,
    String(await page.locator('#bdg-grille .bdg-t.on').count()));
  verifier('un verrouille annonce sa progression', (await page.textContent('#bdg-grille .bdg-t:not(.on) .bdg-quoi')).includes('/'),
    await page.textContent('#bdg-grille .bdg-t:not(.on) .bdg-quoi'));
  verifier('le reste est cache', await page.locator('#bdg-reste').isHidden());

  await page.click('#bdg-voir');
  await page.waitForTimeout(250);
  verifier('le clic deplie les trois derniers', await page.locator('#bdg-reste .bdg-t').count() === 3 && await page.isVisible('#bdg-reste'));
  verifier('le bouton propose alors de reduire', (await page.textContent('#bdg-voir')).trim() === 'Réduire',
    (await page.textContent('#bdg-voir')).trim());
  await page.click('#bdg-voir');
  await page.waitForTimeout(250);
  verifier('et il se replie', await page.locator('#bdg-reste').isHidden());

  await page.screenshot({ path: 'recette-badges-club.png', fullPage: false });

  // ═══════════ LE TABLEAU DE BORD ═══════════
  console.log('\n2. Les listes du tableau de bord');
  await page.addInitScript(() => {
    localStorage.setItem('bey_admin_session', JSON.stringify({ access_token: 'recette', refresh_token: 'recette' }));
    localStorage.setItem('bey_onglet', 'communaute');
  });
  await page.route('**/auth/v1/user', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'recette' }) }));
  await page.goto('http://localhost:' + PORT + '/app');
  await page.waitForTimeout(1500);

  for (const [id, titre] of [['recents', 'Inscriptions récentes'], ['top-amb', 'Top ambassadeurs'],
                             ['top-contrib', 'Meilleurs contributeurs'], ['cl-liste', 'Classement du concours']]) {
    const lignes = await page.locator('#' + id + ' > .row').count();
    const cache = await page.locator('#' + id + ' .repli .row').count();
    verifier(titre + ' : trois lignes visibles', lignes === 3, String(lignes));
    verifier(titre + ' : deux lignes repliees', cache === 2, String(cache));
    const b = page.locator('#' + id + ' > .add-toggle');
    verifier(titre + ' : le bouton annonce le nombre exact',
      (await b.textContent()).trim() === 'Voir les 2 autres', (await b.textContent()).trim());
    await b.click();
    await page.waitForTimeout(150);
    verifier(titre + ' : le clic montre les deux', await page.locator('#' + id + ' .repli').isVisible());
    verifier(titre + ' : la derniere ligne visible retrouve son trait',
      await page.locator('#' + id + ' > .row.sans-trait').count() === 0);
  }

  const chip = await page.locator('#top-contrib .bdg').first().textContent();
  verifier('le badge du meilleur contributeur est cite', chip.trim() === 'Porte-voix', chip);

  await page.screenshot({ path: 'recette-badges-dashboard.png', fullPage: false });

  verifier('aucune erreur dans la console', erreurs.length === 0, erreurs.join(' | '));

  await nav.close();
  srv.close();
  console.log(rates ? '\nRECETTE EN ECHEC : ' + rates + ' point(s).\n' : '\nRECETTE OK.\n');
  process.exit(rates ? 1 : 0);
})();

/* Recette du rang, des trois distinctions et des listes repliables — 21/09/2026
 * ------------------------------------------------------------------
 * Pourquoi ce fichier existe. Ces deux choses echouent EN SILENCE, et c'est
 * le pire cas :
 *   - une liste repliee qui ne se deplie pas ressemble a une liste courte ;
 *   - une carte de rang qui ne recoit rien reste simplement cachee.
 * Dans les deux cas l'ecran est beau, aucune erreur n'apparait, et le defaut
 * ne se voit qu'en le cherchant. C'est exactement ce qui s'est passe le 19/09
 * avec des temoins qui peignaient un fil VIDE sans le signaler.
 *
 * Ce controle CLIQUE, il ne regarde pas. Il compte les lignes avant et apres
 * le clic, et il verifie que ce qui est ecrit dit la verite : le titre de la
 * semaine, ce qui manque pour le palier suivant, et la couverture.
 *
 *   node recette-rang.js site/public
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
  code_ambassadeur: 'AWAX01', grade: 'ambassadeur', filleuls: 12, a_numero: true, jeton: 'recette' };

/* Les cles sont celles que rend REELLEMENT le serveur. Une facade qui invente
   ses propres noms de champs fait passer un test sur une application qui,
   elle, n'affiche rien. */
const RANG_PARTIEL = {
  ok: true, fenetre_jours: 7,
  grade: { niveau: 1, nom: 'Ambassadeur', filleuls: 12, prochain: 30, manque: 18 },
  semaine: { publications: 4, touchees: 3, complet: false, manque: 1 },
  contributeur: false, superfan: false, titre: 'Ambassadeur',
};
const RANG_COMPLET = {
  ok: true, fenetre_jours: 7,
  grade: { niveau: 1, nom: 'Ambassadeur', filleuls: 12, prochain: 30, manque: 18 },
  semaine: { publications: 4, touchees: 4, complet: true, manque: 0 },
  contributeur: true, superfan: true, titre: 'Super fan',
};
const RANG_SOMMET = {
  ok: true, fenetre_jours: 7,
  grade: { niveau: 3, nom: 'Super Ambassadeur', filleuls: 140, prochain: null, manque: 0 },
  semaine: { publications: 0, touchees: 0, complet: false, manque: 0 },
  contributeur: false, superfan: false, titre: 'Super Ambassadeur',
};

const STATS = {
  ok: true, total: 1284, ambassadeurs: 37, nbMessages: 18, nbComments: 214,
  publicationsSemaine: 4, fenetreJours: 7,
  topAmb: [1, 2, 3, 4, 5].map((n) => ({ prenom: 'Amb' + n, lieu: 'Abidjan', filleuls: 50 - n })),
  topContrib: [
    { prenom: 'Mariam', lieu: 'Abidjan', touchees: 4, manque: 0, commentaires: 34, filleuls: 12, titre: 'Super fan', contributeur: true, superfan: true },
    { prenom: 'Awa', lieu: 'Abidjan', touchees: 4, manque: 0, commentaires: 12, filleuls: 0, titre: 'Meilleur contributeur', contributeur: true, superfan: false },
    { prenom: 'Konan', lieu: 'Bouaké', touchees: 3, manque: 1, commentaires: 5, filleuls: 31, titre: 'Grand Ambassadeur', contributeur: false, superfan: false },
    { prenom: 'Yao', lieu: 'Daloa', touchees: 2, manque: 2, commentaires: 1, filleuls: 0, titre: 'Membre', contributeur: false, superfan: false },
    { prenom: 'Fatou', lieu: 'Korhogo', touchees: 1, manque: 3, commentaires: 0, filleuls: 0, titre: 'Membre', contributeur: false, superfan: false },
  ],
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

  let RANG = RANG_PARTIEL;
  await page.route('**/functions/v1/bey-public', async (route) => {
    let action = '';
    try { action = JSON.parse(route.request().postData() || '{}').action; } catch (_) {}
    const rep = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
    if (action === 'me') return rep({ ok: true, membre: MEMBRE });
    if (action === 'distinctions') return rep(RANG);
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

  const txt = (s) => page.textContent(s).then((x) => (x || '').trim());

  // ═══════════ 1. UNE SEMAINE INCOMPLETE ═══════════
  console.log('\n1. Ambassadeur, mais il a rate une publication');
  await page.addInitScript((m) => { localStorage.setItem('bey_membre', JSON.stringify(m)); }, MEMBRE);
  await page.goto('http://localhost:' + PORT + '/fan');
  await page.waitForTimeout(1200);
  await page.click('.ong[data-ong="club"]');
  await page.waitForTimeout(600);

  verifier('la carte est affichee', await page.isVisible('#rg-card'));
  verifier('son grade est ecrit en grand', await txt('#rg-grade') === 'AMBASSADEUR', await txt('#rg-grade'));
  verifier('le compte de filleuls est juste', (await txt('#rg-filleuls')).includes('12'), await txt('#rg-filleuls'));
  verifier('il sait ce qui manque pour le palier suivant',
    (await txt('#rg-reste-grade')).includes('18') && (await txt('#rg-reste-grade')).includes('Grand Ambassadeur'),
    await txt('#rg-reste-grade'));
  verifier('pas de sceau : il n a pas le titre', await page.locator('#rg-sceau').isHidden());
  verifier('la couverture est dite en clair', (await txt('#rg-couverture')).includes('3 des 4'), await txt('#rg-couverture'));
  verifier('il sait ce qui lui manque pour le titre', (await txt('#rg-reste-semaine')).includes('1'), await txt('#rg-reste-semaine'));
  await page.screenshot({ path: 'recette-rang-partiel.png' });

  // ═══════════ 2. LA SEMAINE PARFAITE ═══════════
  console.log('\n2. La meme personne, mais elle n a rien rate');
  RANG = RANG_COMPLET;
  await page.evaluate(() => chargerRang());
  await page.waitForTimeout(500);
  verifier('le sceau Super fan apparait', await txt('#rg-sceau') === 'Super fan', await txt('#rg-sceau'));
  verifier('la semaine porte le titre', await txt('#rg-semaine') === 'MEILLEUR CONTRIBUTEUR', await txt('#rg-semaine'));
  verifier('la jauge de la semaine passe au vert', await page.locator('#rg-jauge-semaine.vert').count() === 1);
  verifier('et il n a plus rien a faire', (await txt('#rg-reste-semaine')).includes('rien raté'), await txt('#rg-reste-semaine'));
  await page.screenshot({ path: 'recette-rang-superfan.png' });

  // ═══════════ 3. LE SOMMET, ET UNE SEMAINE SANS PUBLICATION ═══════════
  console.log('\n3. Au sommet, et Serge n a rien publie');
  RANG = RANG_SOMMET;
  await page.evaluate(() => chargerRang());
  await page.waitForTimeout(500);
  verifier('plus de jauge de grade au sommet', await page.locator('#rg-jauge-grade').isHidden());
  verifier('et on le lui dit', (await txt('#rg-reste-grade')).includes('sommet'), await txt('#rg-reste-grade'));
  // Sans publication, on ne reproche rien a personne et on ne felicite personne.
  verifier('sans publication, aucun titre a prendre', await page.locator('#rg-sceau').isHidden());
  verifier('et la raison est dite', (await txt('#rg-couverture')).includes('rien publié'), await txt('#rg-couverture'));
  verifier('pas de jauge de semaine non plus', await page.locator('#rg-jauge-semaine').isHidden());

  // ═══════════ 4. LES LISTES DU TABLEAU DE BORD ═══════════
  console.log('\n4. Les listes du tableau de bord');
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

  console.log('\n5. Ce que le tableau de bord dit des contributeurs');
  verifier('la regle du titre est ecrite a l ecran',
    (await txt('#contrib-regle')).includes('4 fois') && (await txt('#contrib-regle')).includes('rien raté'),
    await txt('#contrib-regle'));
  verifier('le titre du premier est cite', (await txt('#top-contrib .sceau')) === 'Super fan', await txt('#top-contrib .sceau'));
  verifier('la couverture se lit 4/4', (await txt('#top-contrib > .row .row-amt')) === '4/4', await txt('#top-contrib > .row .row-amt'));
  // Ce qui manque passe avant ce qui est fait : c'est la seule information
  // qui peut encore changer la semaine de quelqu'un.
  const troisieme = await page.locator('#top-contrib > .row').nth(2).locator('.row-sub').textContent();
  verifier('celui qui a rate voit ce qui lui manque', troisieme.includes('il en manque 1'), troisieme);
  verifier('un simple membre ne porte pas de sceau',
    await page.locator('#top-contrib .repli .row').first().locator('.sceau').count() === 0);

  await page.screenshot({ path: 'recette-rang-dashboard.png' });
  verifier('aucune erreur dans la console', erreurs.length === 0, erreurs.join(' | '));

  await nav.close();
  srv.close();
  console.log(rates ? '\nRECETTE EN ECHEC : ' + rates + ' point(s).\n' : '\nRECETTE OK.\n');
  process.exit(rates ? 1 : 0);
})();

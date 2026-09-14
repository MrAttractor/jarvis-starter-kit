/* Recette du mode CLAIR / SOMBRE de La Beynaumania.
 * ------------------------------------------------------------------
 * Pourquoi ce fichier existe : un theme clair ajoute un second jeu de
 * couleurs a chaque texte de chaque ecran. A l'oeil, ca « parait lisible » ;
 * au calcul, l'or de la charte ne fait que 2,1:1 sur du blanc. R-24 : une
 * palette se valide au script, contraste des textes compris. Ce fichier
 * mesure le rapport de contraste reel de chaque texte affiche, dans les deux
 * themes, en composant les transparences et en remontant les fonds.
 *
 * Il verifie aussi ce que le theme peut casser ailleurs : le choix retenu
 * d'une visite a l'autre, la couleur de la barre du telephone, le
 * debordement horizontal et les zones de tap sur les 6 resolutions de
 * reference (R-41, UX_SYSTEM sections 2, 3 et 9).
 *
 *   node recette-theme.js <chemin/vers/public>   -> les fichiers locaux
 *   node recette-theme.js                        -> la version en ligne
 *
 * Prerequis, une fois : npm i playwright-core && npx playwright install chromium
 */
/* Meme resolution que recette-visiteur.js : playwright-core n'est pas installe
   dans ce dossier client, on le cherche la ou il se trouve. */
let chromium;
try { chromium = require('playwright-core').chromium; }
catch (e) {
  try { chromium = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright-core').chromium; }
  catch (_) {
    console.error('playwright-core est absent. Depuis ce dossier :');
    console.error('  npm i playwright-core && npx playwright install chromium');
    process.exit(2);
  }
}
const http = require('http'), fs = require('fs'), path = require('path');

const RACINE = process.argv[2] || null;
const PORT = 8788;
const EN_LIGNE = 'https://demo.agenceattractor.com/beynaud';
const LARGEURS = [375, 390, 414, 768, 1024, 1440];

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.png': 'image/png' };

function servir(racine) {
  return http.createServer((req, res) => {
    let u = decodeURIComponent(req.url.split('?')[0]);
    if (/^\/beynaud\/(fan|app)$/.test(u)) u += '.html';
    const f = path.join(racine, u);
    fs.readFile(f, (e, d) => {
      if (e) { res.writeHead(404); return res.end('404'); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
      res.end(d);
    });
  });
}

/* ══════════════════════════════════════════════════════════════════
   L'AUDIT DE CONTRASTE, execute dans la page
   ══════════════════════════════════════════════════════════════════
   Le principe : pour chaque element qui porte du texte visible, on compose
   sa couleur de texte sur son fond effectif. Le fond effectif se construit
   en remontant les parents jusqu'a l'opacite 1, exactement comme le fait le
   navigateur. Un fond qui vient d'une image (la photo de Serge, la carte du
   monde) n'est pas calculable : ces textes sont comptes a part et non juges,
   plutot que declares bons par defaut. */
const AUDIT_CONTRASTE = function () {
  function parse(c) {
    const m = String(c).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map(x => parseFloat(x.trim()));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function sur(dessus, dessous) {
    const a = dessus.a;
    return { r: dessus.r * a + dessous.r * (1 - a), g: dessus.g * a + dessous.g * (1 - a),
             b: dessus.b * a + dessous.b * (1 - a), a: 1 };
  }
  function lum(c) {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function ratio(a, b) {
    const la = lum(a), lb = lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  function chemin(el) {
    const b = [];
    for (let n = el; n && n.nodeType === 1 && b.length < 4; n = n.parentElement) {
      let s = n.tagName.toLowerCase();
      if (n.id) { b.unshift(s + '#' + n.id); break; }
      if (n.className && typeof n.className === 'string') s += '.' + n.className.trim().split(/\s+/).join('.');
      b.unshift(s);
    }
    return b.join(' > ');
  }

  /* Les blocs peints par une photo : un frere en position absolue porte
     l'image (.m-hero-bg, .join-bg, .clip-layer), le parent du texte n'a donc
     aucun fond a lire. Remonter les parents y donnerait le fond de la page.
     La premiere version de ce fichier les sortait du calcul, et cet angle
     mort a laisse passer deux couleurs non epinglees sur l'ecran
     d'inscription : « Retrouver mon espace » et « Revenir a l'apercu »
     suivaient les jetons et devenaient donc sombres sur la photo sombre.
     On ne les saute plus : ces trois blocs sont sombres par construction
     dans les deux themes, on leur prete donc un fond sombre de reference et
     on mesure normalement. L'approximation est conservatrice, et elle
     attrape exactement ce qu'elle avait manque : une encre sombre posee sur
     du sombre. */
  const PHOTO = '#splash, .m-hero, .join-hero';
  const FOND_PHOTO = { r: 20, g: 20, b: 20, a: 1 };

  const resultats = [], surImage = [];

  for (const el of document.querySelectorAll('body *')) {
    // Le texte doit etre porte directement par l'element, sinon on le
    // compterait une fois par ancetre.
    let texte = '';
    for (const n of el.childNodes) if (n.nodeType === 3) texte += n.textContent;
    texte = texte.trim();
    if (!texte) continue;

    const st = getComputedStyle(el);
    if (st.visibility === 'hidden' || st.display === 'none' || parseFloat(st.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;

    /* Les couches de fond, de l'element vers l'exterieur. Dans un meme
       element, la couleur de fond se peint d'abord, l'image par dessus. Un
       degrade est calculable : ses arrets de couleur sont dans la valeur
       calculee, et on retiendra le pire d'entre eux. Une vraie image ne
       l'est pas. */
    // Sur photo, aucune couche n'est a remonter : le fond de reference suffit.
    const surPhoto = !!el.closest(PHOTO);
    const couches = [];
    let image = null;
    for (let n = surPhoto ? null : el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      const couleur = parse(s.backgroundColor);
      const bi = s.backgroundImage;
      let arrets = null;
      if (bi && bi !== 'none') {
        if (/url\(/.test(bi)) { image = chemin(n); break; }
        arrets = (bi.match(/rgba?\([^)]+\)/g) || []).map(parse).filter(Boolean);
        if (!arrets.length) arrets = null;
      }
      couches.push({ couleur: couleur && couleur.a > 0 ? couleur : null, arrets });
      if (n === document.body) break;
      // Inutile de remonter plus haut : tout est deja recouvert.
      if (!arrets && couleur && couleur.a >= 0.999) break;
    }
    if (image) { surImage.push({ ou: chemin(el), cause: image, texte: texte.slice(0, 40) }); continue; }

    // On peint de l'exterieur vers l'element. Un degrade multiplie les fonds
    // possibles : on garde toutes les combinaisons, plafonnees.
    let fonds = [surPhoto ? FOND_PHOTO : { r: 255, g: 255, b: 255, a: 1 }];
    for (let i = couches.length - 1; i >= 0; i--) {
      const c = couches[i];
      if (c.couleur) fonds = fonds.map(f => sur(c.couleur, f));
      if (c.arrets) {
        const suite = [];
        for (const f of fonds) for (const a of c.arrets) suite.push(sur(a, f));
        fonds = suite.slice(0, 24);
      }
    }

    const couleur = parse(st.color);
    if (!couleur) continue;

    const taille = parseFloat(st.fontSize);
    const gras = parseInt(st.fontWeight, 10) >= 700;
    // Seuils WCAG AA : 3,0 pour le grand texte, 4,5 pour le texte courant.
    const grand = taille >= 24 || (taille >= 18.66 && gras);
    const seuil = grand ? 3.0 : 4.5;

    // Le pire fond du degrade decide : c'est celui-la que quelqu'un lira.
    let pire = null;
    for (const fond of fonds) {
      const encre = couleur.a < 1 ? sur(couleur, fond) : couleur;
      const rc = ratio(encre, fond);
      if (!pire || rc < pire.ratio) pire = { ratio: rc, encre, fond };
    }
    if (!pire) continue;

    resultats.push({
      ou: chemin(el) + (surPhoto ? ' [sur photo]' : ''), texte: texte.slice(0, 40), taille: Math.round(taille * 10) / 10,
      ratio: Math.round(pire.ratio * 100) / 100, seuil,
      encre: [Math.round(pire.encre.r), Math.round(pire.encre.g), Math.round(pire.encre.b)],
      fond: [Math.round(pire.fond.r), Math.round(pire.fond.g), Math.round(pire.fond.b)],
      ok: pire.ratio >= seuil
    });
  }
  return { resultats, surImage };
};

/* Debordement horizontal et zones de tap : UX_SYSTEM sections 3 et 9. */
const AUDIT_MISE_EN_PAGE = function () {
  const tropPetits = [];
  for (const el of document.querySelectorAll('button, a, input, select, textarea, [onclick]')) {
    const st = getComputedStyle(el);
    if (st.visibility === 'hidden' || st.display === 'none') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (r.width < 44 || r.height < 44) {
      let s = el.tagName.toLowerCase();
      if (el.id) s += '#' + el.id;
      else if (el.className && typeof el.className === 'string') s += '.' + el.className.trim().split(/\s+/)[0];
      tropPetits.push(s + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
    }
  }
  return {
    debordement: document.documentElement.scrollWidth - window.innerWidth,
    tropPetits
  };
};

/* ══════════════════════════════════════════════════════════════════
   Les donnees de facade du pilotage
   ══════════════════════════════════════════════════════════════════
   Le pilotage est derriere un mot de passe, et la recette n'en a pas. Sans
   donnees, la moitie des composants colores ne se peignent jamais : ni une
   ligne de moderation, ni une barre de sondage, ni un ambassadeur en or. On
   repond donc a sa place a la fonction bey-admin, avec une reponse par
   action de lecture. C'est le rendu qu'on mesure, pas le serveur. */
const FACADE = {
  stats: {
    ok: true, total: 1284, ambassadeurs: 37, nbMessages: 18, nbComments: 214,
    topAmb: [{ prenom: 'Awa', lieu: 'Abidjan', filleuls: 41 }, { prenom: 'Konan', lieu: 'Bouaké', filleuls: 22 }],
    lieux: [{ lieu: 'Abidjan', ville: 'Abidjan', pays: "Côte d'Ivoire", n: 620, total: 620, lat: 5.35, lon: -4.02 },
            { lieu: 'Paris', ville: 'Paris', pays: 'France', n: 210, total: 210, lat: 48.85, lon: 2.35 }],
    recents: [{ prenom: 'Mariam', lieu: 'Yopougon', grade: 'ambassadeur', created_at: new Date(Date.now() - 3.6e6).toISOString() },
              { prenom: 'Yao', lieu: 'Daloa', grade: 'membre', created_at: new Date(Date.now() - 9e7).toISOString() }]
  },
  classement: {
    ok: true, joueurs: 12, confirmes: 58,
    saison: { nom: 'Saison 1', fin: new Date(Date.now() + 12 * 864e5).toISOString() },
    podium: [{ rang: 1, prenom: 'Awa', lieu: 'Abidjan', inscrits: 41, points: 28 },
             { rang: 2, prenom: 'Konan', lieu: 'Bouaké', inscrits: 22, points: 14 },
             { rang: 3, prenom: 'Yao', lieu: 'Daloa', inscrits: 9, points: 5 }]
  },
  comments_recent: {
    ok: true, commentaires: [
      { id: 'c1', prenom: 'Mariam', contenu: 'Le son est trop bon, on attend le clip !', created_at: new Date(Date.now() - 6e5).toISOString(), masque: false, cible_libelle: 'Photo · backstage' },
      { id: 'c2', prenom: 'Inconnu', contenu: 'achete des vues pas cher ici 0707...', created_at: new Date(Date.now() - 3e6).toISOString(), masque: true, motif: 'lien commercial', cible_libelle: 'Mot de Serge' }
    ]
  },
  message_list: { ok: true, messages: [{ id: 'm1', contenu: 'Rendez-vous vendredi à 20h pour le direct.', created_at: new Date(Date.now() - 8e6).toISOString() }] },
  content_list: {
    ok: true, contenus: [
      { id: 'v1', type: 'serie', titre: 'Épisode 3 · la tournée', youtube_url: 'https://youtu.be/aaaaaaaaaaa', actif: true, grade_requis: 'membre', created_at: new Date(Date.now() - 2e7).toISOString() },
      { id: 'v2', type: 'serie', titre: 'Coulisses réservées', youtube_url: 'https://youtu.be/bbbbbbbbbbb', actif: false, grade_requis: 'ambassadeur', created_at: new Date(Date.now() - 4e7).toISOString() },
      { id: 'l1', type: 'live', titre: 'Direct du samedi', youtube_url: 'https://youtu.be/ccccccccccc', actif: true, grade_requis: 'membre', created_at: new Date(Date.now() - 1e6).toISOString() }
    ]
  },
  photo_list: { ok: true, photos: [{ id: 'p1', legende: 'En studio ce matin', url: 'serge-portrait.jpg', actif: true, grade_requis: 'membre', created_at: new Date(Date.now() - 5e6).toISOString() }] },
  poll_list: { ok: true, sondages: [{ id: 'q1', question: 'Quel titre en single ?', options: ['Attraper pour laisser', 'Monde'], counts: [78, 34], total: 112, actif: true, grade_requis: 'membre', created_at: new Date(Date.now() - 3e7).toISOString() }] }
};

/* Le membre de recette. Ambassadeur, pour que la carte or, le badge et le
   classement se peignent : ce sont eux qui portent les couleurs les plus
   fragiles en mode clair. */
const MEMBRE_RECETTE = {
  id: '00000000-0000-0000-0000-000000000001', prenom: 'Awa',
  grade: 'ambassadeur', code_ambassadeur: 'AWA777', filleuls: 12
};

const echecs = [], notes = [];
/* Les zones de tap trop petites sont identiques dans les deux themes : elles
   sont anterieures a la bascule par construction. On les affiche, elles ne
   bloquent pas cette recette-ci. */
const tapsAnterieurs = [];
/* Chaque texte mesure est range sous une cle stable (l'ecran, l'element, le
   texte) avec son resultat par theme. C'est ce qui permet, a la fin, de dire
   si un manque de contraste vient de la bascule ou l'attendait deja. */
const mesures = new Map();

async function auditer(page, ecran, theme, largeur) {
  const etiquette = ecran + ' · ' + theme;
  const { resultats, surImage } = await page.evaluate(AUDIT_CONTRASTE);
  const rates = resultats.filter(r => !r.ok);
  const mep = await page.evaluate(AUDIT_MISE_EN_PAGE);

  console.log('  ' + etiquette.padEnd(34) + ' ' + String(resultats.length).padStart(3) + ' textes mesurés · '
    + (rates.length ? rates.length + ' SOUS LE SEUIL' : 'contraste OK')
    + (surImage.length ? ' · ' + surImage.length + ' sur image' : '')
    + ' · débord ' + mep.debordement + 'px'
    + (mep.tropPetits.length ? ' · ' + mep.tropPetits.length + ' zone(s) < 44px' : ''));

  for (const r of resultats) {
    const cle = ecran + ' | ' + r.ou + ' | ' + r.texte;
    if (!mesures.has(cle)) mesures.set(cle, {});
    // Sur plusieurs resolutions, on garde la mesure la plus defavorable.
    const d = mesures.get(cle);
    if (!d[theme] || r.ratio < d[theme].ratio) d[theme] = r;
  }
  if (mep.debordement > 0) echecs.push('DÉBORDEMENT ' + etiquette + ' à ' + largeur + 'px : ' + mep.debordement + 'px');
  for (const t of mep.tropPetits) tapsAnterieurs.push(ecran + ' · ' + t);
  for (const s of surImage) notes.push(ecran + ' : posé sur ' + s.cause + ', contraste non calculable');
  return resultats.length;
}

/* Le tri final : ce que la bascule a casse, et ce qui n'allait pas avant elle. */
function trierContrastes() {
  const regressions = [], anterieurs = [], partout = [];
  for (const [cle, d] of mesures) {
    const c = d.clair, so = d.sombre;
    const decrire = r => r.ratio + ':1 (seuil ' + r.seuil + ') · ' + r.taille + 'px · rgb('
      + r.encre + ') sur rgb(' + r.fond + ')';
    const ou = cle.split(' | ')[0] + ' · ' + cle.split(' | ')[1] + ' « ' + cle.split(' | ')[2] + ' »';
    const clairRate = c && !c.ok, sombreRate = so && !so.ok;
    if (clairRate && sombreRate) partout.push(ou + '\n      clair ' + decrire(c) + '\n      sombre ' + decrire(so));
    else if (clairRate) regressions.push(ou + '\n      clair ' + decrire(c) + (so ? '  (sombre : ' + so.ratio + ':1, passe)' : ''));
    else if (sombreRate) anterieurs.push(ou + '\n      sombre ' + decrire(so) + (c ? '  (clair : ' + c.ratio + ':1, passe)' : ''));
  }
  return { regressions, anterieurs, partout };
}

(async () => {
  let serveur = null, base = EN_LIGNE;
  if (RACINE) {
    serveur = servir(RACINE);
    await new Promise(r => serveur.listen(PORT, r));
    base = 'http://localhost:' + PORT + '/beynaud';
  }
  console.log('Recette clair / sombre sur ' + base + '\n');

  const nav = await chromium.launch();
  const erreurs = [];

  async function ouvrir(largeur) {
    const ctx = await nav.newContext({
      viewport: { width: largeur, height: largeur < 500 ? 844 : 900 },
      deviceScaleFactor: largeur < 500 ? 3 : 1,
      isMobile: largeur < 500, hasTouch: largeur < 500,
      userAgent: largeur < 500
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined
    });
    const page = await ctx.newPage();
    page.on('pageerror', e => erreurs.push('exception : ' + e.message));
      /* Le navigateur sans interface se plaint de politiques de permission que
       la page ne demande pas (compute-pressure, via l'iframe YouTube) : c'est
       du bruit de l'outil, pas un defaut de la page. */
    page.on('console', m => {
      if (m.type() !== 'error') return;
      const t = m.text();
      if (/Permissions policy violation/i.test(t)) return;
      erreurs.push('console : ' + t);
    });
    // Le pilotage parle a bey-admin : on repond a sa place.
    await page.route('**/functions/v1/bey-admin', route => {
      let action = '';
      try { action = JSON.parse(route.request().postData() || '{}').action; } catch (_) {}
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify(FACADE[action] || { ok: true }) });
    });
    /* Le fil du fan, lui, parle au vrai serveur : ce sont les vraies
       publications qu'on veut mesurer, pas des couleurs de facade. Seule
       exception, « me » : le membre de recette n'existe pas en base, et sans
       cette reponse l'application le deconnecte aussitot, ce qui ferait
       auditer l'ecran d'inscription en croyant auditer l'espace membre. */
    await page.route('**/functions/v1/bey-public', async route => {
      let action = '';
      try { action = JSON.parse(route.request().postData() || '{}').action; } catch (_) {}
      if (action === 'me') {
        return route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ ok: true, membre: MEMBRE_RECETTE }) });
      }
      try { route.fulfill({ response: await route.fetch() }); }
      catch (e) { route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":false}' }); }
    });
    return { ctx, page };
  }

  /* ── 1. LE FIL DU FAN, parcours du visiteur (R-84 : celui-la d'abord) ── */
  for (const largeur of LARGEURS) {
    const { ctx, page } = await ouvrir(largeur);
    await page.goto(base + '/fan', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1800);
    await page.click('#enter-btn');
    await page.waitForTimeout(2200);

    // Sombre par defaut : c'est la premiere impression de marque.
    const parDefaut = await page.evaluate(() => ({
      attribut: document.documentElement.getAttribute('data-theme'),
      barre: (document.getElementById('meta-theme') || {}).content,
      bouton: !!document.getElementById('bascule-theme'),
      soleilVisible: !!document.querySelector('#bascule-theme .ico-soleil') &&
        getComputedStyle(document.querySelector('#bascule-theme .ico-soleil')).display !== 'none'
    }));
    if (largeur === 390) {
      if (parDefaut.attribut !== null) echecs.push("le fil ne s'ouvre pas en sombre par défaut (data-theme=" + parDefaut.attribut + ')');
      if (parDefaut.barre !== '#070707') echecs.push('barre du téléphone en sombre : ' + parDefaut.barre);
      if (!parDefaut.bouton) echecs.push('la bascule est absente du fil du fan');
      if (!parDefaut.soleilVisible) echecs.push("en sombre, la bascule doit montrer le soleil (ce qu'on va obtenir)");
    }
    await auditer(page, 'fan · visiteur', 'sombre', largeur);
    if (largeur === 390) await page.screenshot({ path: path.join(__dirname, 'recette-theme-fan-sombre.png'), fullPage: true });

    await page.click('#bascule-theme');
    await page.waitForTimeout(400);
    const apresClic = await page.evaluate(() => ({
      attribut: document.documentElement.getAttribute('data-theme'),
      barre: (document.getElementById('meta-theme') || {}).content,
      memoire: localStorage.getItem('bey_theme'),
      presse: document.getElementById('bascule-theme').getAttribute('aria-pressed'),
      etiquette: document.getElementById('bascule-theme').getAttribute('aria-label'),
      luneVisible: getComputedStyle(document.querySelector('#bascule-theme .ico-lune')).display !== 'none'
    }));
    if (largeur === 390) {
      if (apresClic.attribut !== 'clair') echecs.push('le clic ne bascule pas en clair');
      if (apresClic.barre !== '#F6F5F3') echecs.push('barre du téléphone pas suivie en clair : ' + apresClic.barre);
      if (apresClic.memoire !== 'clair') echecs.push('le choix clair n\'est pas retenu (bey_theme=' + apresClic.memoire + ')');
      if (apresClic.presse !== 'true') echecs.push('aria-pressed pas mis à jour');
      if (!/sombre/i.test(apresClic.etiquette || '')) echecs.push('aria-label ne propose pas le retour au sombre : ' + apresClic.etiquette);
      if (!apresClic.luneVisible) echecs.push('en clair, la bascule doit montrer la lune');
    }
    await auditer(page, 'fan · visiteur', 'clair', largeur);
    if (largeur === 390) await page.screenshot({ path: path.join(__dirname, 'recette-theme-fan-clair.png'), fullPage: true });

    /* ── 2. LE FIL DU FAN, parcours du membre, en clair conserve ── */
    await page.evaluate(m => { localStorage.setItem('bey_membre', JSON.stringify(m)); }, MEMBRE_RECETTE);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2200);
    const retenu = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    if (largeur === 390 && retenu !== 'clair') echecs.push('le choix clair est perdu au rechargement (data-theme=' + retenu + ')');
    await auditer(page, 'fan · membre', 'clair', largeur);
    if (largeur === 390) await page.screenshot({ path: path.join(__dirname, 'recette-theme-fan-membre-clair.png'), fullPage: true });

    await page.click('#bascule-theme');
    await page.waitForTimeout(400);
    await auditer(page, 'fan · membre', 'sombre', largeur);

    await ctx.close();
  }

  /* ── 3. LE PILOTAGE DE SERGE ── */
  for (const largeur of LARGEURS) {
    const { ctx, page } = await ouvrir(largeur);
    await page.addInitScript(() => {
      localStorage.setItem('bey_admin_session', JSON.stringify({ access_token: 'recette', refresh_token: 'recette' }));
    });
    await page.goto(base + '/app', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const dash = await page.evaluate(() => !document.getElementById('view-dash').classList.contains('hidden'));
    if (!dash) { echecs.push('pilotage : le tableau de bord ne se peint pas à ' + largeur + 'px'); await ctx.close(); continue; }

    if (largeur === 390) {
      const p = await page.evaluate(() => ({
        attribut: document.documentElement.getAttribute('data-theme'),
        bouton: !!document.getElementById('bascule-theme'),
        barre: (document.getElementById('meta-theme') || {}).content
      }));
      if (p.attribut !== null) echecs.push('pilotage : pas sombre par défaut');
      if (!p.bouton) echecs.push('pilotage : la bascule est absente');
      if (p.barre !== '#070707') echecs.push('pilotage : barre du téléphone ' + p.barre);
    }
    /* L'en-tete doit tenir sur une ligne. Ajouter un bouton de 44 px y a fait
       passer « LA BEYNAUMANIA » sur deux lignes sans provoquer le moindre
       debordement horizontal : aucun autre controle ne l'aurait vu. */
    const hauteurEntete = await page.evaluate(() => {
      const h = document.querySelector('#view-dash .header');
      return h ? Math.round(h.getBoundingClientRect().height) : -1;
    });
    if (hauteurEntete > 64) echecs.push("pilotage : l'en-tête fait " + hauteurEntete + 'px de haut à '
      + largeur + 'px, il passe sur deux lignes');

    // Les trois onglets, dans les deux themes : chacun peint ses propres couleurs.
    for (const theme of ['sombre', 'clair']) {
      if (theme === 'clair') { await page.click('#bascule-theme'); await page.waitForTimeout(400); }
      for (const onglet of ['publier', 'communaute', 'moderation']) {
        await page.click('#o-' + onglet);
        await page.waitForTimeout(350);
        await auditer(page, 'app · ' + onglet, theme, largeur);
        if (largeur === 390) {
          await page.screenshot({ path: path.join(__dirname, 'recette-theme-app-' + onglet + '-' + theme + '.png'), fullPage: true });
        }
      }
    }

    // L'ecran de connexion, le seul que Serge voit sur un telephone neuf.
    await page.evaluate(() => { localStorage.removeItem('bey_admin_session'); });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(900);
    await auditer(page, 'app · connexion', 'clair', largeur);
    if (largeur === 390) await page.screenshot({ path: path.join(__dirname, 'recette-theme-app-connexion-clair.png') });

    await ctx.close();
  }

  if (erreurs.length) echecs.push('erreurs JavaScript : ' + [...new Set(erreurs)].join(' | '));

  const { regressions, anterieurs, partout } = trierContrastes();

  console.log('');
  if (notes.length) {
    console.log('Non calculable, texte posé sur une vraie image (' + notes.length + ' occurrences) :');
    [...new Set(notes)].forEach(n => console.log('  · ' + n));
    console.log('');
  }
  console.log('Les textes marqués [sur photo] sont mesurés sur un fond sombre de');
  console.log('référence (rgb(20,20,20)) : le clip, le bandeau et l’écran d’inscription');
  console.log('restent sombres dans les deux thèmes.');
  console.log('');

  const bloquants = [...echecs];
  if (regressions.length) {
    console.log('◆ RÉGRESSIONS DU MODE CLAIR — à corriger avant de livrer (' + regressions.length + ') :');
    regressions.forEach(e => { console.log('  - ' + e); bloquants.push('RÉGRESSION CLAIR : ' + e); });
    console.log('');
  } else {
    console.log('◆ RÉGRESSIONS DU MODE CLAIR : aucune. Tout texte qui passait en sombre');
    console.log('  passe aussi en clair.');
    console.log('');
  }
  if (partout.length) {
    console.log('◇ SOUS LE SEUIL DANS LES DEUX THÈMES — antérieur à la bascule (' + partout.length + ') :');
    partout.forEach(e => console.log('  - ' + e));
    console.log('');
  }
  if (anterieurs.length) {
    console.log('◇ SOUS LE SEUIL EN SOMBRE SEULEMENT — dette de la charte, antérieure (' + anterieurs.length + ') :');
    anterieurs.forEach(e => console.log('  - ' + e));
    console.log('');
  }

  if (tapsAnterieurs.length) {
    const uniques = [...new Set(tapsAnterieurs)];
    console.log('◇ ZONES DE TAP SOUS 44 px — identiques dans les deux thèmes, antérieures (' + uniques.length + ') :');
    uniques.forEach(e => console.log('  - ' + e));
    console.log('');
  }
  if (echecs.length) {
    console.log('◆ MISE EN PAGE ET MOTEUR (' + [...new Set(echecs)].length + ') :');
    [...new Set(echecs)].forEach(e => console.log('  - ' + e));
    console.log('');
  }

  if (bloquants.length) console.log('RECETTE EN ECHEC : ' + [...new Set(bloquants)].length + ' point(s) bloquant(s).');
  else {
    console.log('RECETTE OK : le mode clair n\'a cassé aucun contraste, le choix est retenu,');
    console.log('             zéro débordement sur les 6 résolutions. Ce qui reste listé');
    console.log('             ci-dessus est antérieur à la bascule et vaut dans les deux thèmes.');
  }

  await nav.close();
  if (serveur) serveur.close();
  process.exit(bloquants.length ? 1 : 0);
})();

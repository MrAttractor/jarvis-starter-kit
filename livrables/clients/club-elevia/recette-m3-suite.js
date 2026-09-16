/* Recette des quatre manques du cahier des charges, Module 3.
   Blocage et signalement · premier message · connexion établie · filtre de zone.

   Elle se joue à DEUX, parce que trois des quatre ne se voient pas d'un seul
   côté : une connexion établie doit s'afficher aux deux membres, et un
   message a besoin de quelqu'un pour le lire. Deux contextes de navigateur
   séparés, donc deux stockages séparés, comme deux téléphones (R-81).

   Usage :
     node recette-m3-suite.js <dossier> jetonA jetonB
   où A est celle qui demande et B celle qui répond. Les deux comptes
   doivent être vérifiés et avoir terminé le questionnaire.

   Ce que la recette écrit en base est listé à la fin, pour être effacé. */
const { chromium } = require('playwright');
const fs = require('fs');

const URL = 'https://demo.agenceattractor.com/elevia/app/';
const SORTIE = process.argv[2] || '.';
const JETON_A = process.argv[3];
const JETON_B = process.argv[4];
if (!JETON_A || !JETON_B) { console.error('Il faut deux jetons : node recette-m3-suite.js <dossier> jetonA jetonB'); process.exit(1); }

const JOURNAL = `${SORTIE}/journal-m3-suite.txt`;
const dire = (...a) => { console.log(a.join(' ')); fs.appendFileSync(JOURNAL, a.join(' ') + '\n'); };
const txt = async p => (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');

const verdicts = [];
function verifier(quoi, vrai, detail) {
  verdicts.push({ quoi, vrai: !!vrai, detail: detail || '' });
  dire(`   [${vrai ? 'OK ' : 'NON'}] ${quoi}${detail ? ' :: ' + detail : ''}`);
}

/* Les deux contrôles que R-41 impose et qu'aucun œil ne fait de façon fiable :
   le débordement horizontal, et les cibles sous 44 px. */
async function mesurer(page, etiquette) {
  const m = await page.evaluate(() => {
    const de = document.documentElement;
    const trop = [], petites = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > de.clientWidth + 1) trop.push(el.tagName + '.' + (el.className || '').toString().slice(0, 24));
    }
    for (const el of document.querySelectorAll('button, a, input, select, textarea')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.height < 44) petites.push((el.id || el.className || el.tagName) + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
    }
    const petitTexte = [];
    for (const el of document.querySelectorAll('input, select, textarea')) {
      if (el.getBoundingClientRect().width === 0) continue;
      const t = parseFloat(getComputedStyle(el).fontSize);
      if (t < 16 && el.type !== 'range') petitTexte.push((el.id || el.type) + ' ' + t + 'px');
    }
    return { debord: de.scrollWidth > de.clientWidth + 1, trop: [...new Set(trop)].slice(0, 3),
             petites: [...new Set(petites)].slice(0, 5), petitTexte: [...new Set(petitTexte)] };
  });
  const pb = [];
  if (m.debord) pb.push('DÉBORDEMENT :: ' + m.trop.join(' | '));
  if (m.petites.length) pb.push('cibles <44px : ' + m.petites.join(' | '));
  if (m.petitTexte.length) pb.push('champs <16px : ' + m.petitTexte.join(', '));
  verifier(`mise en page « ${etiquette} »`, pb.length === 0, pb.join(' ;; '));
  return m;
}

async function ouvrir(nav, jeton, nom, soucis) {
  const ctx = await nav.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'fr-FR',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const page = await ctx.newPage();
  page.on('pageerror', e => soucis.push(`[${nom}] PAGEERROR ` + String(e).slice(0, 180)));
  page.on('console', m => { if (m.type() === 'error') soucis.push(`[${nom}] CONSOLE ` + m.text().slice(0, 180)); });
  page.on('response', r => { if (r.status() >= 400) soucis.push(`[${nom}] HTTP ` + r.status() + ' ' + r.url().slice(0, 90)); });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(j => localStorage.setItem('elevia_jeton', j), jeton);
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  return page;
}

/* Un appel direct à la fonction, sans passer par l'écran : c'est la seule
   façon de prouver qu'un garde-fou est au serveur et non dans l'affichage
   (R-80). Un bouton caché ne prouve rien. */
async function appelDirect(page, action, corps) {
  // On emprunte la fonction d'appel de la page elle-même : c'est le vrai
  // chemin réseau, sans l'écran. Refaire un fetch à la main testerait mon
  // propre fetch, pas celui de l'application.
  return await page.evaluate(([a, c]) => appelClub(a, c), [action, corps]);
}

(async () => {
  fs.writeFileSync(JOURNAL, '');
  const soucis = [];
  const nav = await chromium.launch();
  const A = await ouvrir(nav, JETON_A, 'A', soucis);
  const B = await ouvrir(nav, JETON_B, 'B', soucis);

  // ════════════════════════════════════════════════════════════
  dire('══ 4 · LE FILTRE DE ZONE, ET LE BADGE VÉRIFIÉ ══');
  // ════════════════════════════════════════════════════════════
  if (await A.isVisible('#b-aff').catch(() => false)) { await A.click('#b-aff'); await A.waitForTimeout(3000); }

  const zones = await A.$$('button[data-zone]');
  verifier('les trois zones sont proposées', zones.length === 3, zones.length + ' bouton(s)');
  verifier('« Tous les profils proposés sont vérifiés » est dit',
    (await txt(A)).includes('Tous les profils proposés sont vérifiés'));

  const compte = async (p) => await p.evaluate(() => document.querySelectorAll('.profil-carte').length);
  const badges = await A.evaluate(() => {
    const c = [...document.querySelectorAll('.profil-carte')];
    return { total: c.length, avecBadge: c.filter(x => x.querySelector('.verifie')).length };
  });
  verifier('chaque profil porte le badge Vérifié',
    badges.total > 0 && badges.avecBadge === badges.total, `${badges.avecBadge}/${badges.total}`);

  const partout = await compte(A);
  await mesurer(A, 'découverte, partout');
  await A.screenshot({ path: `${SORTIE}/suite-1-zone-partout.png`, fullPage: true });

  for (const [cle, mot] of [['pays', 'Mon pays'], ['ville', 'Ma ville']]) {
    await A.click(`button[data-zone="${cle}"]`); await A.waitForTimeout(3000);
    const n = await compte(A);
    const actif = await A.evaluate((c) => {
      const b = document.querySelector(`button[data-zone="${c}"]`);
      return b && b.classList.contains('actif') && b.getAttribute('aria-pressed') === 'true';
    }, cle);
    verifier(`la zone « ${mot} » se marque choisie`, actif);
    verifier(`la zone « ${mot} » restreint ou égale « Partout »`, n <= partout, `${n} contre ${partout}`);
    // Un résultat vide doit se dire comme un filtre trop étroit, pas comme
    // un Club désert : « jamais renseigné » et « rien » ne se disent pas
    // pareil (R-58).
    if (n === 0) {
      const t = await txt(A);
      verifier(`« ${mot} » vide invite à élargir, sans alarmer`,
        t.includes('Personne dans cette zone') && t.includes('Élargissez la zone'));
    }
    await mesurer(A, `découverte, ${mot}`);
    await A.screenshot({ path: `${SORTIE}/suite-1-zone-${cle}.png`, fullPage: true });
  }
  await A.click('button[data-zone="partout"]'); await A.waitForTimeout(3000);

  // ════════════════════════════════════════════════════════════
  dire('\n══ 1 · BLOQUER OU SIGNALER, DEPUIS LA DÉCOUVERTE ══');
  // ════════════════════════════════════════════════════════════
  const liensSig = await A.$$('button[id^=b-sig-]');
  verifier('chaque profil proposé peut être signalé', liensSig.length === partout, `${liensSig.length}/${partout}`);
  if (liensSig.length) {
    await liensSig[0].click(); await A.waitForTimeout(1200);
    const t = await txt(A);
    verifier('l\'écran de signalement dit ce qu\'il fait',
      t.includes('retiré des profils proposés') && t.includes('n\'est pas prévenue'));
    verifier('le motif est facultatif', t.includes('facultatif'));
    await mesurer(A, 'signalement');
    await A.screenshot({ path: `${SORTIE}/suite-2-signaler.png`, fullPage: true });
    await A.click('#b-sig-non'); await A.waitForTimeout(2500);   // on annule, on ne signale pas encore
    verifier('annuler ramène à la découverte', (await txt(A)).includes('Votre cercle'));
  }

  // ════════════════════════════════════════════════════════════
  dire('\n══ A demande une mise en relation à B ══');
  // ════════════════════════════════════════════════════════════
  const dem = await A.$$('button[id^=b-dem-]');
  if (!dem.length) { dire('*** aucun profil à demander, la suite ne peut pas se jouer ***'); await nav.close(); return; }
  await dem[0].click(); await A.waitForTimeout(1200);
  await A.fill('#i-mot', 'Recette automatisée, mot d\'introduction.');
  await A.click('#b-envoyer-dem'); await A.waitForTimeout(3000);
  verifier('la demande part', (await txt(A)).includes('Demande envoyée'));

  // ════════════════════════════════════════════════════════════
  dire('\n══ 2 · LE PREMIER MESSAGE EST FERMÉ AVANT ACCEPTATION ══');
  // ════════════════════════════════════════════════════════════
  // Le garde-fou se prouve au serveur, pas à l'écran.
  const relA = await appelDirect(A, 'relations', {});
  const enAttente = (relA.envoyees || []).find(x => x.statut === 'demandee');
  if (enAttente) {
    const refus = await appelDirect(A, 'message', { relation: enAttente.id, texte: 'Avant acceptation.' });
    verifier('le serveur refuse un message avant acceptation',
      refus && refus.ok === false, JSON.stringify(refus).slice(0, 140));
  } else {
    verifier('une demande en attente est retrouvée', false, 'introuvable côté A');
  }

  // ════════════════════════════════════════════════════════════
  dire('\n══ B répond : l\'écran de réponse porte les quatre gestes ══');
  // ════════════════════════════════════════════════════════════
  await B.reload({ waitUntil: 'networkidle' }); await B.waitForTimeout(3000);
  if (await B.isVisible('#b-voir-demandes').catch(() => false)) { await B.click('#b-voir-demandes'); await B.waitForTimeout(2500); }

  const gestes = await B.evaluate(() => ({
    accepter: !!document.querySelector('button[data-rep="acceptee"]'),
    decliner: !!document.querySelector('button[data-rep="refusee"]'),
    bloqSig:  !!document.querySelector('button[data-sig]'),
  }));
  verifier('accepter, décliner et bloquer ou signaler sont tous offerts',
    gestes.accepter && gestes.decliner && gestes.bloqSig, JSON.stringify(gestes));
  await mesurer(B, 'demandes reçues');
  await B.screenshot({ path: `${SORTIE}/suite-3-demandes.png`, fullPage: true });

  await B.click('button[data-rep="acceptee"]'); await B.waitForTimeout(3500);

  // ════════════════════════════════════════════════════════════
  dire('\n══ 3 · CONNEXION ÉTABLIE, CÔTÉ B (celle qui accepte) ══');
  // ════════════════════════════════════════════════════════════
  const tB = await txt(B);
  verifier('B voit l\'écran de connexion établie',
    tB.includes('Connexion établie') && tB.includes('Vous êtes en relation'));
  await mesurer(B, 'connexion établie');
  await B.screenshot({ path: `${SORTIE}/suite-4-connexion-B.png`, fullPage: true });

  // ════════════════════════════════════════════════════════════
  dire('\n══ 2 · LE PREMIER MESSAGE, B ÉCRIT ══');
  // ════════════════════════════════════════════════════════════
  await B.click('#b-ecrire'); await B.waitForTimeout(2500);
  verifier('le fil s\'ouvre vide et le dit sans alarmer',
    (await txt(B)).includes('Aucun message pour l\'instant'));
  await B.fill('#i-msg', 'Premier message de la recette, côté B.');
  await mesurer(B, 'fil, avant envoi');
  await B.click('#b-env-msg'); await B.waitForTimeout(3000);
  verifier('le message de B s\'affiche dans le fil',
    (await txt(B)).includes('Premier message de la recette, côté B'));
  await B.screenshot({ path: `${SORTIE}/suite-5-fil-B.png`, fullPage: true });

  // ════════════════════════════════════════════════════════════
  dire('\n══ 3 · CONNEXION ÉTABLIE, CÔTÉ A (celle qui a demandé) ══');
  // ════════════════════════════════════════════════════════════
  // C'est le vrai test du critère : A n'a rien fait depuis sa demande, et
  // doit pourtant voir l'annonce.
  await A.reload({ waitUntil: 'networkidle' }); await A.waitForTimeout(3500);
  const tA = await txt(A);
  verifier('A est prévenue sur son écran de profil',
    tA.includes('Connexion établie') && tA.includes('a accepté votre demande'), tA.slice(40, 200));
  await A.screenshot({ path: `${SORTIE}/suite-6-annonce-A.png`, fullPage: true });

  if (await A.isVisible('#b-annonce').catch(() => false)) {
    await A.click('#b-annonce'); await A.waitForTimeout(2000);
    verifier('A voit le même écran de connexion établie',
      (await txt(A)).includes('Vous êtes en relation'));
    await mesurer(A, 'connexion établie, A');
    await A.screenshot({ path: `${SORTIE}/suite-7-connexion-A.png`, fullPage: true });
    await A.click('#b-ecrire'); await A.waitForTimeout(2500);
    verifier('A lit le message de B',
      (await txt(A)).includes('Premier message de la recette, côté B'));
    await A.fill('#i-msg', 'Réponse de la recette, côté A.');
    await A.click('#b-env-msg'); await A.waitForTimeout(3000);
    verifier('la réponse de A s\'affiche', (await txt(A)).includes('Réponse de la recette, côté A'));
    await mesurer(A, 'fil, deux messages');
    await A.screenshot({ path: `${SORTIE}/suite-8-fil-A.png`, fullPage: true });
  }

  // L'annonce ne doit pas revenir à chaque ouverture.
  await A.reload({ waitUntil: 'networkidle' }); await A.waitForTimeout(3500);
  verifier('l\'annonce ne se répète pas à la visite suivante',
    !(await txt(A)).includes('a accepté votre demande'));

  // ════════════════════════════════════════════════════════════
  dire('\n══ 1 · LE BLOCAGE FERME VRAIMENT LA PORTE ══');
  // ════════════════════════════════════════════════════════════
  await B.reload({ waitUntil: 'networkidle' }); await B.waitForTimeout(3000);
  if (await B.isVisible('#b-voir-demandes').catch(() => false)) { await B.click('#b-voir-demandes'); await B.waitForTimeout(2500); }
  else if (await B.isVisible('#b-non-lus').catch(() => false)) { await B.click('#b-non-lus'); await B.waitForTimeout(2500); }

  const relB = await appelDirect(B, 'relations', {});
  const acc = (relB.acceptees || [])[0];
  if (acc) {
    const bloque = await appelDirect(B, 'repondre_relation', { relation: acc.id, reponse: 'bloquee' });
    verifier('une relation acceptée peut encore être bloquée', bloque && bloque.ok === true, JSON.stringify(bloque).slice(0, 120));
    const apres = await appelDirect(A, 'message', { relation: acc.id, texte: 'Après blocage.' });
    verifier('plus aucun message ne passe après blocage', apres && apres.ok === false, JSON.stringify(apres).slice(0, 140));
    const filFerme = await appelDirect(A, 'fil', { relation: acc.id });
    verifier('le fil n\'est plus lisible après blocage', filFerme && filFerme.ok === false, JSON.stringify(filFerme).slice(0, 140));
    const redemande = await appelDirect(A, 'demander', { membre: acc.membre, mot: 'Je réessaie.' });
    verifier('on ne peut pas redemander après un blocage', redemande && redemande.ok === false, JSON.stringify(redemande).slice(0, 140));
  } else {
    verifier('une relation acceptée est retrouvée côté B', false, 'introuvable');
  }

  // ════════════════════════════════════════════════════════════
  dire('\n══ INCIDENTS ET VERDICT ══');
  // ════════════════════════════════════════════════════════════
  dire(soucis.length ? [...new Set(soucis)].join('\n') : 'aucune erreur console, aucune requête en échec');
  const rates = verdicts.filter(v => !v.vrai);
  dire(`\n${verdicts.length - rates.length}/${verdicts.length} contrôles passés.`);
  if (rates.length) { dire('ÉCHECS :'); rates.forEach(r => dire('  · ' + r.quoi + (r.detail ? ' :: ' + r.detail : ''))); }

  dire('\nÀ NETTOYER EN BASE : la relation et ses messages entre les deux comptes de recette,');
  dire('ainsi que tout signalement ouvert créé ici. Rien n\'est effacé automatiquement.');

  await nav.close();
  process.exit(rates.length || soucis.length ? 1 : 0);
})();

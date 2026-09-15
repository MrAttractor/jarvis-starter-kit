/* Recette du Module 3, dans le navigateur, sur le domaine réel.
   Le jeton d'équipe est posé comme la connexion le fait, puis on déroule :
   questionnaire type par type, découverte, demande de mise en relation. */
const { chromium } = require('playwright');
const fs = require('fs');

const URL = 'https://demo.agenceattractor.com/elevia/app/';
const SORTIE = process.argv[2] || '.';
const JETON = fs.readFileSync(`${SORTIE}/jeton-agent.txt`, 'utf8').trim();
const JOURNAL = `${SORTIE}/journal-m3.txt`;
const dire = (...a) => { console.log(a.join(' ')); fs.appendFileSync(JOURNAL, a.join(' ') + '\n'); };
const txt = async p => (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');

async function mesurer(page, etiquette) {
  return await page.evaluate((et) => {
    const de = document.documentElement;
    const trop = [], petites = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > de.clientWidth + 1) trop.push(el.tagName + '.' + (el.className || '').toString().slice(0, 24));
    }
    for (const el of document.querySelectorAll('button, a, input, select')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.height < 44) petites.push((el.id || el.tagName) + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
    }
    const petitTexte = [];
    for (const el of document.querySelectorAll('input, select, textarea')) {
      if (el.getBoundingClientRect().width === 0) continue;
      const t = parseFloat(getComputedStyle(el).fontSize);
      if (t < 16 && el.type !== 'range') petitTexte.push((el.id || el.type) + ' ' + t + 'px');
    }
    return { et, debord: de.scrollWidth > de.clientWidth + 1, trop: [...new Set(trop)].slice(0, 3),
             petites: [...new Set(petites)].slice(0, 5), petitTexte: [...new Set(petitTexte)] };
  }, etiquette);
}

function rapporter(m) {
  const pb = [];
  if (m.debord) pb.push('DÉBORDEMENT :: ' + m.trop.join(' | '));
  if (m.petites.length) pb.push('cibles <44px : ' + m.petites.join(' | '));
  if (m.petitTexte.length) pb.push('champs <16px : ' + m.petitTexte.join(', '));
  dire('   [' + m.et + '] ' + (pb.length ? pb.join(' ;; ') : 'rien à signaler'));
}

(async () => {
  fs.writeFileSync(JOURNAL, '');
  const nav = await chromium.launch();
  const ctx = await nav.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'fr-FR',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const page = await ctx.newPage();
  const soucis = [];
  page.on('pageerror', e => soucis.push('PAGEERROR ' + String(e).slice(0, 180)));
  page.on('console', m => { if (m.type() === 'error') soucis.push('CONSOLE ' + m.text().slice(0, 180)); });
  page.on('response', r => { if (r.status() >= 400) soucis.push('HTTP ' + r.status() + ' ' + r.url().slice(0, 90)); });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(j => localStorage.setItem('elevia_jeton', j), JETON);
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);

  dire('══ écran de profil ══');
  dire('   ' + (await txt(page)).slice(40, 400));
  rapporter(await mesurer(page, 'profil'));
  await page.screenshot({ path: `${SORTIE}/m3-1-profil.png`, fullPage: true });

  // ── entrée dans le questionnaire ────────────────────────────
  if (!(await page.isVisible('#b-aff').catch(() => false))) {
    dire('*** la carte affinités ne s\'affiche pas, arrêt ***');
    await nav.close(); return;
  }
  await page.click('#b-aff'); await page.waitForTimeout(1200);
  dire('\n══ introduction ══');
  dire('   ' + (await txt(page)).slice(40, 320));
  await page.screenshot({ path: `${SORTIE}/m3-2-intro.png`, fullPage: true });

  if (await page.isVisible('#b-commencer').catch(() => false)) {
    await page.click('#b-commencer'); await page.waitForTimeout(2500);
  }

  // ── les cinq parties ────────────────────────────────────────
  for (let partie = 1; partie <= 8; partie++) {
    const entete = (await txt(page)).slice(0, 200);
    dire(`\n══ partie ${partie} ══`);
    dire('   ' + entete);

    // Remplir chaque question visible, selon son type réel dans le DOM.
    const rempli = await page.evaluate(() => {
      const faits = [];
      for (const champ of document.querySelectorAll('#questions > .champ')) {
        const code = champ.id.replace(/^q-/, '');
        // curseurs d'âge : déjà à une valeur par défaut, rien à toucher
        if (champ.querySelector('input[type=range]')) { faits.push(code + ':age'); continue; }
        const sel = champ.querySelector('select');
        if (sel) { faits.push(code + ':liste'); continue; }
        const opts = champ.querySelectorAll('.opt');
        if (opts.length) { faits.push(code + ':opts(' + opts.length + ')'); continue; }
        const ajout = champ.querySelector('button[id^=b-add-]');
        if (ajout) { faits.push(code + ':tags'); continue; }
        const txtc = champ.querySelector('input[type=text]');
        if (txtc) { faits.push(code + ':texte'); continue; }
      }
      return faits;
    });
    dire('   questions : ' + rempli.join(', '));

    // On agit par de vrais clics et de vraies frappes, pas en JS.
    const champs = await page.$$('#questions > .champ');
    for (const champ of champs) {
      const code = (await champ.getAttribute('id') || '').replace(/^q-/, '');
      const range = await champ.$('input[type=range]');
      if (range) continue;                                   // valeur par défaut acceptée
      const select = await champ.$('select');
      if (select) {
        const vals = await select.$$eval('option', os => os.map(o => o.value).filter(Boolean));
        if (vals.length) await select.selectOption(vals[0]);
        continue;
      }
      const opts = await champ.$$('.opt');
      if (opts.length) {
        // Un classement demande de tout ordonner : on clique dans l'ordre.
        const cpt = await champ.$('[id^=cpt-]');
        const texteCpt = cpt ? (await cpt.innerText()) : '';
        const classement = /ordre de préférence/i.test(texteCpt);
        const combien = classement ? opts.length : 1;
        for (let i = 0; i < combien; i++) {
          const frais = await champ.$$('.opt');
          if (frais[i]) { await frais[i].click(); await page.waitForTimeout(80); }
        }
        continue;
      }
      const ajout = await champ.$('button[id^=b-add-]');
      if (ajout) {
        const c = await champ.$('input[type=text]');
        if (c) { await c.fill('Lyon'); await ajout.click(); await page.waitForTimeout(150); }
        continue;
      }
      const t = await champ.$('input[type=text]');
      if (t) await t.fill(code === 'ville' ? 'Paris' : 'Recette automatisée');
    }

    rapporter(await mesurer(page, 'partie ' + partie));
    await page.screenshot({ path: `${SORTIE}/m3-p${partie}.png`, fullPage: true });

    if (!(await page.isVisible('#b-suivant').catch(() => false))) { dire('   (plus de bouton, on sort)'); break; }
    const avant = await page.evaluate(() => (document.querySelector('.avancee-texte span') || {}).textContent || '');
    await page.click('#b-suivant');
    await page.waitForTimeout(2800);
    const apres = await page.evaluate(() => (document.querySelector('.avancee-texte span') || {}).textContent || '');
    // Si l'ecran n'a pas change de partie, une question obligatoire manque :
    // on le dit au lieu de tourner en rond.
    if (avant && avant === apres) {
      dire('   *** blocage : ' + (await txt(page)).slice(0, 160));
      break;
    }
    if (!(await page.isVisible('#questions').catch(() => false))) { dire('   (questionnaire termine)'); break; }
  }

  dire('\n══ fin du questionnaire ══');
  dire('   ' + (await txt(page)).slice(40, 360));
  await page.screenshot({ path: `${SORTIE}/m3-3-fin.png`, fullPage: true });

  // ── la découverte ───────────────────────────────────────────
  if (await page.isVisible('#b-voir').catch(() => false)) {
    await page.click('#b-voir'); await page.waitForTimeout(3000);
  }
  dire('\n══ découverte ══');
  const vus = await page.evaluate(() => [...document.querySelectorAll('.profil-carte')].map(c => ({
    nom: (c.querySelector('.nom') || {}).textContent,
    score: (c.querySelector('.accord .chiffre') || {}).textContent,
    raisons: [...c.querySelectorAll('.raisons li')].map(l => l.textContent.trim()),
  })));
  dire('   profils proposés : ' + vus.length);
  vus.forEach(v => dire(`   · ${v.nom} ${v.score}/100 → ${v.raisons.join(' | ')}`));
  rapporter(await mesurer(page, 'découverte'));
  await page.screenshot({ path: `${SORTIE}/m3-4-decouverte.png`, fullPage: true });

  // ── demander une mise en relation ───────────────────────────
  const boutons = await page.$$('button[id^=b-dem-]');
  if (boutons.length) {
    await boutons[0].click(); await page.waitForTimeout(1200);
    dire('\n══ demande ══');
    dire('   ' + (await txt(page)).slice(40, 330));
    await page.fill('#i-mot', 'Bonjour, votre parcours me parle. Un café à Paris ?');
    rapporter(await mesurer(page, 'demande'));
    await page.screenshot({ path: `${SORTIE}/m3-5-demande.png`, fullPage: true });
    await page.click('#b-envoyer-dem'); await page.waitForTimeout(3000);
    dire('   après envoi : ' + (await txt(page)).slice(40, 320));
    await page.screenshot({ path: `${SORTIE}/m3-6-envoyee.png`, fullPage: true });
  } else {
    dire('*** aucun bouton de demande trouvé ***');
  }

  dire('\n══ incidents ══');
  dire(soucis.length ? [...new Set(soucis)].join('\n') : 'aucun');
  await nav.close();
})();

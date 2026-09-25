const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:8777';
const PAGES = ['/', '/personal-branding.html', '/digitaliser-son-activite.html', '/methode.html', '/qui-je-suis.html', '/contact.html'];
const TAILLES = [375, 390, 414, 768, 1024, 1440];

(async () => {
  const nav = await chromium.launch();
  const ctx = await nav.newContext({ deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  const erreurs = [];
  const console_ko = [];
  page.on('console', m => { if (m.type() === 'error') console_ko.push(m.text()); });
  page.on('pageerror', e => console_ko.push('JS: ' + e.message));

  for (const url of PAGES) {
    for (const l of TAILLES) {
      await page.setViewportSize({ width: l, height: 900 });
      const rep = await page.goto(BASE + url, { waitUntil: 'networkidle' });
      if (!rep.ok()) { erreurs.push(`${url} @${l}px : HTTP ${rep.status()}`); continue; }
      await page.waitForTimeout(150);

      const r = await page.evaluate(() => {
        const de = document.documentElement;
        const debord = [];
        document.querySelectorAll('body *').forEach(el => {
          const b = el.getBoundingClientRect();
          if (b.width === 0 && b.height === 0) return;
          if (b.right > window.innerWidth + 1 || b.left < -1) {
            debord.push((el.tagName + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''))
              + ' [' + Math.round(b.left) + '→' + Math.round(b.right) + ']');
          }
        });
        // taille de tap des éléments interactifs
        const petits = [];
        document.querySelectorAll('a, button, input, summary, label.choix, label.burger').forEach(el => {
          const b = el.getBoundingClientRect();
          if (b.width === 0 || b.height === 0) return;
          if (b.height < 44 && !el.closest('.pied') && !el.closest('.q-rep') && el.tagName !== 'A')
            petits.push(el.tagName + '.' + (typeof el.className === 'string' ? el.className.split(' ')[0] : '') + ' h=' + Math.round(b.height));
        });
        return {
          scrollW: de.scrollWidth,
          clientW: de.clientWidth,
          debord: [...new Set(debord)].slice(0, 6),
          petits: [...new Set(petits)].slice(0, 6),
          h1: document.querySelectorAll('h1').length,
          titre: document.title.length,
          sansAlt: [...document.images].filter(i => !i.hasAttribute('alt')).length,
          imgSansDim: [...document.images].filter(i => !i.width || !i.height).length,
        };
      });

      if (r.scrollW > r.clientW + 1)
        erreurs.push(`DÉBORDEMENT ${url} @${l}px : scrollWidth ${r.scrollW} > ${r.clientW} — ${r.debord.join(', ')}`);
      if (r.petits.length)
        erreurs.push(`TAP < 44px ${url} @${l}px : ${r.petits.join(', ')}`);
      if (r.h1 !== 1)
        erreurs.push(`H1 ${url} : ${r.h1} balise(s) h1`);
      if (r.sansAlt)
        erreurs.push(`ALT ${url} : ${r.sansAlt} image(s) sans alt`);
      if (r.imgSansDim)
        erreurs.push(`DIMENSIONS ${url} : ${r.imgSansDim} image(s) sans width/height`);
    }
  }

  // Poids réel de la page d'accueil
  await page.setViewportSize({ width: 1440, height: 900 });
  let octets = 0;
  page.on('response', async res => { try { const b = await res.body(); octets += b.length; } catch (e) {} });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  console.log('\n═══ RECETTE ═══');
  console.log('Pages testées : ' + PAGES.length + ' × ' + TAILLES.length + ' résolutions = ' + (PAGES.length * TAILLES.length) + ' passes');
  console.log('Poids de l\'accueil (tout compris, polices comprises) : ' + Math.round(octets / 1024) + ' Ko');
  if (console_ko.length) {
    console.log('\n!! ERREURS CONSOLE :');
    [...new Set(console_ko)].forEach(e => console.log('   ' + e));
  } else console.log('Console : aucune erreur.');

  if (erreurs.length) {
    console.log('\n!! ' + erreurs.length + ' DÉFAUT(S) :');
    [...new Set(erreurs)].forEach(e => console.log('   ' + e));
  } else {
    console.log('\nAucun débordement, aucune cible de tap trop petite, structure conforme.');
  }

  // Captures
  for (const [l, nom] of [[390, 'mobile'], [1440, 'desktop']]) {
    await page.setViewportSize({ width: l, height: 900 });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `capture-accueil-${nom}.png`, fullPage: false });
    await page.goto(BASE + '/contact.html', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `capture-contact-${nom}.png`, fullPage: false });
  }
  console.log('\nCaptures enregistrées.');

  await nav.close();
})();

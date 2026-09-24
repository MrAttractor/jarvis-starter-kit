const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8777';
const PAGES = ['/', '/personal-branding.html', '/methode.html', '/qui-je-suis.html', '/contact.html'];

(async () => {
  const nav = await chromium.launch();
  const page = await nav.newPage({ viewport: { width: 1440, height: 900 } });
  const fautes = [];

  for (const url of PAGES) {
    await page.goto(BASE + url, { waitUntil: 'networkidle' });
    const r = await page.evaluate(() => {
      const lum = c => {
        const v = c.map(x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
        return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
      };
      const rgb = s => (s.match(/\d+/g) || [0, 0, 0]).slice(0, 3).map(Number);
      // remonte jusqu'à trouver un fond réellement opaque
      const fond = el => {
        let n = el;
        while (n && n !== document.documentElement) {
          const bg = getComputedStyle(n).backgroundColor;
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && !bg.startsWith('rgba(0, 0, 0, 0)')) {
            const a = bg.match(/rgba?\(([^)]+)\)/);
            const parts = a[1].split(',').map(s => parseFloat(s));
            if (parts.length < 4 || parts[3] > 0.85) return rgb(bg);
          }
          n = n.parentElement;
        }
        return [11, 11, 12];
      };
      const out = [];
      document.querySelectorAll('p, h1, h2, h3, a, span, li, label, summary, button, cite').forEach(el => {
        const t = (el.childNodes.length && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
        if (!t) return;
        const b = el.getBoundingClientRect();
        if (!b.width || !b.height) return;
        const cs = getComputedStyle(el);
        const fg = rgb(cs.color), bg = fond(el);
        const l1 = lum(fg), l2 = lum(bg);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        const px = parseFloat(cs.fontSize);
        const gros = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight) >= 700);
        const seuil = gros ? 3 : 4.5;
        if (ratio < seuil) {
          out.push({
            texte: el.textContent.trim().slice(0, 34),
            ratio: ratio.toFixed(2), seuil,
            couleur: cs.color, fond: 'rgb(' + bg.join(',') + ')', taille: Math.round(px)
          });
        }
      });
      return out;
    });
    r.forEach(x => fautes.push({ page: url, ...x }));
  }

  console.log('═══ CONTRASTE (WCAG AA) ═══');
  if (!fautes.length) {
    console.log('Aucun texte sous le seuil, sur les 5 pages.');
  } else {
    const vus = new Set();
    fautes.forEach(f => {
      const cle = f.texte + f.ratio;
      if (vus.has(cle)) return; vus.add(cle);
      console.log(`!! ${f.page} « ${f.texte} » ${f.ratio}:1 (seuil ${f.seuil}) — ${f.couleur} sur ${f.fond}, ${f.taille}px`);
    });
  }
  await nav.close();
})();

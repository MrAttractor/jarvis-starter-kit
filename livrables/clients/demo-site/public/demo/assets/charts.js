/* ============================================================
   DEMO PALIERS — graphiques
   SVG écrit à la main, aucune librairie : la stack maison est vanilla,
   et une page de démonstration ne doit pas dépendre d'un CDN tiers.

   PALETTE — ne pas changer ces trois valeurs sans revalider.
   #B85C2A terre · #2E6FB7 bleu · #8E4585 prune
   Passées au validateur de la maison sur les deux surfaces réelles
   (#FFFFFF carte, #FBF7F0 page) et sur toutes les paires, pas seulement
   les paires adjacentes : bande de clarté, plancher de chroma, séparation
   daltonisme (pire paire ΔE 8.5 deutan), plancher vision normale (16.8),
   contraste ≥ 3:1. La première combinaison essayée, orange et vert de la
   charte, échouait : les deux se confondent en protanopie.

   Règles suivies : une seule couleur quand il n'y a qu'une mesure (jamais
   un dégradé par valeur, qui ré-encode la longueur de barre en teinte),
   grille en filet plein jamais en pointillés, marques fines, étiquettes
   sélectives et non sur chaque point, tableau lisible sous chaque
   graphique, survol partout.
   ============================================================ */

const VIZ = {
  s1: '#B85C2A', s2: '#2E6FB7', s3: '#8E4585',
  grille: '#E1E0D9', axe: '#C3C2B7',
  muted: '#898781', ink: '#2A2520', ink2: '#52514E'
};

const CANAUX = [
  { cle: 'boutique',       nom: 'Boutique en ligne', couleur: VIZ.s1 },
  { cle: 'point_de_vente', nom: 'Points de vente',   couleur: VIZ.s2 },
  { cle: 'whatsapp',       nom: 'WhatsApp',          couleur: VIZ.s3 }
];

const courtFcfa = n => n >= 1000000 ? (n / 1000000).toFixed(1).replace('.0', '') + ' M'
                     : n >= 1000    ? Math.round(n / 1000) + ' k'
                     : String(n);

/* ── Courbe d'évolution ────────────────────────────────────── */
/* Une seule mesure, donc une seule couleur et aucune légende :
   le titre du bloc nomme déjà la série. */

function courbe(points, options = {}) {
  const L = 720, H = 260;
  const mg = { g: 56, d: 16, h: 20, b: 34 };   // la bande du bas contient l'axe
  const pl = { l: L - mg.g - mg.d, h: H - mg.h - mg.b };

  if (!points.length) return '<div class="vide">Pas encore de données.</div>';

  const max = Math.max(...points.map(p => p.y), 1);
  const plafond = Math.ceil(max / 5000) * 5000 || 5000;
  const x = i => mg.g + (points.length === 1 ? pl.l / 2 : (i / (points.length - 1)) * pl.l);
  const y = v => mg.h + pl.h - (v / plafond) * pl.h;

  const ligne = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ');
  const aire = `${ligne} L${x(points.length - 1).toFixed(1)},${mg.h + pl.h} L${x(0).toFixed(1)},${mg.h + pl.h} Z`;

  // 4 graduations, et seulement quelques dates : un axe saturé ne se lit pas
  const grads = [0, 1, 2, 3, 4].map(i => plafond * i / 4);
  const pas = Math.max(1, Math.floor(points.length / 5));
  const dates = points.map((p, i) => ({ p, i })).filter(({ i }) => i % pas === 0 || i === points.length - 1);

  const dernier = points[points.length - 1];
  const sommet = points.reduce((a, b) => (b.y > a.y ? b : a), points[0]);
  const iSommet = points.indexOf(sommet);

  return `
  <figure class="viz" data-viz="courbe">
    <svg viewBox="0 0 ${L} ${H}" width="100%" height="auto" role="img"
         aria-label="${options.alt || 'Évolution du chiffre d’affaires'}">
      ${grads.map(v => `
        <line x1="${mg.g}" y1="${y(v)}" x2="${L - mg.d}" y2="${y(v)}"
              stroke="${v === 0 ? VIZ.axe : VIZ.grille}" stroke-width="1"/>
        <text x="${mg.g - 10}" y="${y(v) + 4}" text-anchor="end"
              font-size="12" fill="${VIZ.muted}" style="font-variant-numeric:tabular-nums">${courtFcfa(v)}</text>`).join('')}

      <path d="${aire}" fill="${VIZ.s1}" opacity=".08"/>
      <path d="${ligne}" fill="none" stroke="${VIZ.s1}" stroke-width="2"
            stroke-linejoin="round" stroke-linecap="round"/>

      <circle cx="${x(iSommet)}" cy="${y(sommet.y)}" r="5" fill="#fff" stroke="${VIZ.s1}" stroke-width="2"/>
      <circle cx="${x(points.length - 1)}" cy="${y(dernier.y)}" r="5" fill="${VIZ.s1}" stroke="#fff" stroke-width="2"/>

      ${dates.map(({ p, i }) => `
        <text x="${x(i)}" y="${H - 12}" text-anchor="middle" font-size="12" fill="${VIZ.muted}">${p.label}</text>`).join('')}

      ${points.map((p, i) => `
        <rect x="${x(i) - pl.l / points.length / 2}" y="${mg.h}"
              width="${pl.l / points.length}" height="${pl.h}" fill="transparent"
              class="viz__cible" data-t="${p.label} · ${fcfa(p.y)}"
              data-cx="${x(i).toFixed(0)}" data-cy="${y(p.y).toFixed(0)}"/>`).join('')}

      <line class="viz__croix" x1="0" y1="${mg.h}" x2="0" y2="${mg.h + pl.h}"
            stroke="${VIZ.axe}" stroke-width="1" opacity="0"/>
    </svg>
    <div class="viz__bulle"></div>
    ${options.legende ? `<figcaption class="viz__note">${options.legende}</figcaption>` : ''}
  </figure>`;
}

/* ── Barres horizontales ───────────────────────────────────── */
/* Une mesure unique : toutes les barres de la même couleur. La longueur
   porte déjà la magnitude, colorer par valeur n'ajouterait rien. */

function barres(items, options = {}) {
  if (!items.length) return '<div class="vide">Pas encore de données.</div>';

  const hauteurBarre = 26, ecart = 14, gauche = options.largeurLabel || 190;
  const L = 720, H = items.length * (hauteurBarre + ecart) + 8;
  const pl = L - gauche - 90;
  const max = Math.max(...items.map(i => i.valeur), 1);

  return `
  <figure class="viz" data-viz="barres">
    <svg viewBox="0 0 ${L} ${H}" width="100%" height="auto" role="img"
         aria-label="${options.alt || 'Classement'}">
      ${items.map((it, i) => {
        const yy = i * (hauteurBarre + ecart) + 4;
        const l = Math.max(3, (it.valeur / max) * pl);
        const couleur = it.couleur || VIZ.s1;
        return `
        <g class="viz__cible" data-t="${echappe(it.label)} · ${fcfa(it.valeur)}${it.sous ? ' · ' + echappe(it.sous) : ''}">
          <rect x="0" y="${yy - 4}" width="${L}" height="${hauteurBarre + 8}" fill="transparent"/>
          <text x="0" y="${yy + hauteurBarre / 2 + 5}" font-size="15" fill="${VIZ.ink}">${echappe(it.label).slice(0, 26)}</text>
          <rect x="${gauche}" y="${yy}" width="${l}" height="${hauteurBarre}" rx="4" fill="${couleur}"/>
          <text x="${gauche + l + 10}" y="${yy + hauteurBarre / 2 + 5}" font-size="15" font-weight="700"
                fill="${VIZ.ink2}" style="font-variant-numeric:tabular-nums">${fcfa(it.valeur)}</text>
        </g>`;
      }).join('')}
    </svg>
    <div class="viz__bulle"></div>
    ${options.legende ? `<figcaption class="viz__note">${options.legende}</figcaption>` : ''}
  </figure>`;
}

/* ── Barre de répartition ──────────────────────────────────── */
/* Part d'un tout, trois segments : lisible d'un coup d'œil. Un écart de
   2 px de la couleur du fond sépare les segments, jamais un contour. */

function repartition(parts, options = {}) {
  const total = parts.reduce((s, p) => s + p.valeur, 0) || 1;
  return `
  <figure class="viz" data-viz="repartition">
    <div class="viz__ruban">
      ${parts.map(p => `
        <span class="viz__segment viz__cible" style="width:${(p.valeur / total * 100).toFixed(2)}%;background:${p.couleur}"
              data-t="${echappe(p.nom)} · ${fcfa(p.valeur)} · ${Math.round(p.valeur / total * 100)} %"></span>`).join('')}
    </div>
    <ul class="viz__legende">
      ${parts.map(p => `
        <li><span class="viz__puce" style="background:${p.couleur}"></span>
            ${echappe(p.nom)}
            <strong>${Math.round(p.valeur / total * 100)} %</strong>
            <span class="viz__val">${fcfa(p.valeur)}</span></li>`).join('')}
    </ul>
    <div class="viz__bulle"></div>
    ${options.legende ? `<figcaption class="viz__note">${options.legende}</figcaption>` : ''}
  </figure>`;
}

/* ── Aperçu verrouillé ─────────────────────────────────────── */
/* Montrer ce que la formule supérieure apporte, en le disant clairement.
   Les données sont réelles, c'est la fonction qui n'est pas dans l'offre. */

function verrouille(titre, contenu, formule) {
  return `
  <div class="bloc verrou">
    <div class="verrou__voile">
      <span class="verrou__etiquette">Disponible en ${formule}</span>
    </div>
    <div class="bloc__titre"><h3>${titre}</h3></div>
    <div class="verrou__apercu" aria-hidden="true">${contenu}</div>
  </div>`;
}

/* ── Survol ────────────────────────────────────────────────── */
/* Le survol enrichit, il ne conditionne jamais la lecture : chaque
   valeur reste accessible dans le tableau sous le graphique. */

document.addEventListener('mouseover', e => {
  const cible = e.target.closest('.viz__cible');
  if (!cible) return;
  const fig = cible.closest('.viz');
  const bulle = fig && fig.querySelector('.viz__bulle');
  if (!bulle) return;

  bulle.textContent = cible.dataset.t;
  bulle.classList.add('visible');

  const rf = fig.getBoundingClientRect();
  const rc = cible.getBoundingClientRect();
  bulle.style.left = Math.max(4, Math.min(rf.width - 4, rc.left - rf.left + rc.width / 2)) + 'px';
  bulle.style.top = Math.max(0, rc.top - rf.top - 8) + 'px';

  const croix = fig.querySelector('.viz__croix');
  if (croix && cible.dataset.cx) {
    croix.setAttribute('x1', cible.dataset.cx);
    croix.setAttribute('x2', cible.dataset.cx);
    croix.setAttribute('opacity', '.5');
  }
});

document.addEventListener('mouseout', e => {
  const cible = e.target.closest('.viz__cible');
  if (!cible) return;
  const fig = cible.closest('.viz');
  fig?.querySelector('.viz__bulle')?.classList.remove('visible');
  fig?.querySelector('.viz__croix')?.setAttribute('opacity', '0');
});

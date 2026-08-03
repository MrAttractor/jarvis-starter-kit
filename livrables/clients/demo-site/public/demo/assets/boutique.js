/* ============================================================
   DEMO PALIERS — la vitrine
   Un seul rendu pour les trois paliers. Les fonctions supérieures
   (stock visible, suivi de commande) s'allument par la configuration.
   ============================================================ */

const P = palierCourant();
let CATALOGUE = [];
let STOCK = {};
let PANIER = JSON.parse(localStorage.getItem('demo_panier_' + P.cle) || '[]');

const photo = url => (url || '').startsWith('assets/') ? '/demo/' + url : url;
const cleStock = (nom, format) => `${nom}||${format}`;

/* ── Rendu ─────────────────────────────────────────────────── */

function gabarit() {
  return `
    ${bandeauDemo(P)}
    <div class="bascule">
      <div class="bascule__inner">
        <div class="bascule__palier">Vous regardez la vitrine · formule <strong>${P.nom}</strong></div>
        <div class="bascule__liens">
          <span class="bascule__lien bascule__lien--actif">Vitrine</span>
          <a class="bascule__lien" href="/demo/${P.cle}/admin/">Tableau de bord</a>
        </div>
      </div>
    </div>

    <header class="entete contenu">
      <div class="entete__marque">${MARQUE.nom}</div>
      <div class="entete__baseline">${MARQUE.baseline}</div>
      <p class="entete__intro">${MARQUE.intro}</p>
    </header>

    <main class="contenu">
      <div id="grille" class="grille"><div class="vide">Chargement du catalogue…</div></div>
    </main>

    <section class="encart">
      <div class="contenu">
        <h2>Cette boutique n'existe pas. La vôtre, oui.</h2>
        <p>${P.resume} Formule <strong>${P.nom}</strong>, ${P.prix} (${P.prixEur}), puis ${P.mrr}.</p>
        <div class="encart__actions">
          <a class="btn btn--plein" href="/demo/">Comparer les 3 formules</a>
          <a class="btn btn--ligne" style="color:#F5EFE6;border-color:#6E645A"
             href="https://wa.me/${MARQUE.whatsapp}?text=${encodeURIComponent("Bonjour, j'ai vu la démonstration " + P.nom + " et je veux la même chose pour mon activité.")}"
             target="_blank" rel="noopener">Demander la mienne</a>
        </div>
      </div>
    </section>

    <div class="pied">Démonstration produite par l'agence Mr Attractor · <a href="https://agenceattractor.com">agenceattractor.com</a></div>

    <div class="panier-barre" id="panierBarre">
      <div class="panier-barre__inner">
        <div class="panier-barre__info">
          <strong id="panierTotal">0 F</strong>
          <span id="panierCompte">0 article</span>
        </div>
        <button class="btn btn--plein" id="btnCommander">Commander</button>
      </div>
    </div>

    <div class="modale" id="modaleCommande">
      <div class="modale__boite">
        <div class="modale__titre">
          <h2>Votre commande</h2>
          <button class="btn btn--ligne btn--petit" id="btnFermer">Fermer</button>
        </div>
        <div id="recap"></div>
        <div class="champ">
          <label for="nom">Votre nom</label>
          <input id="nom" type="text" placeholder="Comment doit-on vous appeler ?" autocomplete="name">
        </div>
        <div class="champ">
          <label for="wa">Votre WhatsApp</label>
          <input id="wa" type="tel" placeholder="+225 07 00 00 00 00" autocomplete="tel">
        </div>
        <div class="champ">
          <label for="zone">Votre quartier</label>
          <input id="zone" type="text" placeholder="Cocody Angré, Marcory…">
        </div>
        <button class="btn btn--vert btn--large" id="btnEnvoyer">Envoyer la commande</button>
        <p style="font-size:13px;color:var(--gris);margin:16px 0 0;text-align:center">
          Démonstration : la commande apparaît dans le tableau de bord, aucun message n'est réellement envoyé.
        </p>
      </div>
    </div>

    <div class="toast" id="toast"></div>
  `;
}

function carteProduit(p) {
  const formats = Array.isArray(p.formats) ? p.formats : [];
  return `
    <article class="carte">
      <div class="carte__media">
        <img src="${photo(p.photo_url)}" alt="${echappe(p.nom)}" loading="lazy"
             onerror="this.style.display='none'">
        ${p.badge ? `<span class="carte__badge">${echappe(p.badge)}</span>` : ''}
        ${etiquetteStock(p, formats)}
      </div>
      <div class="carte__corps">
        <div class="carte__cat">${echappe(p.categorie)}</div>
        <div class="carte__nom">${echappe(p.nom)}</div>
        <p class="carte__desc">${echappe(p.description)}</p>
        <div class="carte__formats">
          ${formats.map((f, i) => `
            <div class="format">
              <div class="format__label">
                <strong>${echappe(f.label)}</strong>
                <span>${echappe(f.sub || '')}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span class="format__prix">${echappe(f.prix)}</span>
                <button class="btn btn--plein btn--petit"
                        data-produit="${echappe(p.nom)}" data-format="${i}">Ajouter</button>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </article>`;
}

/* Le stock visible par la cliente est une fonction du palier pro.
   Sur le palier simple, l'information n'existe pas : c'est exactement
   ce que le prospect doit constater en passant d'une démo à l'autre. */
function etiquetteStock(p, formats) {
  if (!P.stock || !formats.length) return '';
  const q = STOCK[cleStock(p.nom, formats[0].label)];
  if (q === undefined) return '';
  if (q <= 0) return `<span class="carte__stock carte__stock--bas">Épuisé</span>`;
  if (q < 15) return `<span class="carte__stock carte__stock--bas">Plus que ${q}</span>`;
  return `<span class="carte__stock">${q} en stock</span>`;
}

/* ── Panier ────────────────────────────────────────────────── */

function ajouter(nom, indexFormat) {
  const p = CATALOGUE.find(x => x.nom === nom);
  if (!p) return;
  const f = p.formats[indexFormat];
  const existant = PANIER.find(l => l.nom === nom && l.format === f.label);
  if (existant) existant.quantite++;
  else PANIER.push({ nom, format: f.label, prix: nombrePrix(f.prix), quantite: 1 });
  sauverPanier();
  toast(`${nom} ajouté`);
}

function sauverPanier() {
  localStorage.setItem('demo_panier_' + P.cle, JSON.stringify(PANIER));
  majPanier();
}

function totalPanier() {
  return PANIER.reduce((s, l) => s + l.prix * l.quantite, 0);
}

function majPanier() {
  const barre = document.getElementById('panierBarre');
  const n = PANIER.reduce((s, l) => s + l.quantite, 0);
  barre.classList.toggle('actif', n > 0);
  document.getElementById('panierTotal').textContent = fcfa(totalPanier());
  document.getElementById('panierCompte').textContent = n + (n > 1 ? ' articles' : ' article');
}

function recapPanier() {
  return `<div class="tableau-scroll"><table>
    <tbody>
      ${PANIER.map(l => `<tr>
        <td>${echappe(l.nom)}<br><span style="color:var(--gris);font-size:13px">${echappe(l.format)}</span></td>
        <td style="white-space:nowrap">× ${l.quantite}</td>
        <td style="text-align:right;font-weight:700;white-space:nowrap">${fcfa(l.prix * l.quantite)}</td>
      </tr>`).join('')}
      <tr><td colspan="2"><strong>Total</strong></td>
          <td style="text-align:right"><strong>${fcfa(totalPanier())}</strong></td></tr>
    </tbody></table></div>`;
}

/* ── Envoi de la commande ──────────────────────────────────── */

async function envoyer() {
  const nom = document.getElementById('nom').value.trim();
  const wa = document.getElementById('wa').value.trim();
  const zone = document.getElementById('zone').value.trim();
  if (!nom) return toast('Indiquez votre nom');
  if (!wa) return toast('Indiquez votre WhatsApp');

  const btn = document.getElementById('btnEnvoyer');
  btn.disabled = true;
  btn.textContent = 'Envoi…';
  try {
    await api.post('demo_commandes', {
      client_nom: nom, client_wa: wa, client_zone: zone,
      produits: PANIER, total: totalPanier(), statut: 'nouvelle'
    });
    // Sur le palier pro et au-dessus, la vente décompte le stock
    // et alimente le fichier clientes. Le tableau de bord promet les deux :
    // si la démonstration ne le fait pas, le prospect le voit tout de suite.
    if (P.stock) await decompterStock();
    if (P.clients) await inscrireCliente(nom, wa, zone);
    PANIER = [];
    sauverPanier();
    document.getElementById('modaleCommande').classList.remove('ouverte');
    toast('Commande envoyée. Ouvrez le tableau de bord, elle y est.');
    charger();
  } catch (e) {
    toast('Impossible d\'enregistrer la commande');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Envoyer la commande';
  }
}

async function inscrireCliente(nom, wa, zone) {
  const total = totalPanier();
  const auj = new Date().toISOString().slice(0, 10);
  const existantes = await api.get('demo_clients',
    `select=id,nb_commandes,total_achete&nom=eq.${encodeURIComponent(nom)}`);
  if (existantes.length) {
    const c = existantes[0];
    await api.patch('demo_clients', 'id=eq.' + c.id, {
      nb_commandes: c.nb_commandes + 1,
      total_achete: c.total_achete + total,
      derniere_le: auj
    });
  } else {
    await api.post('demo_clients', {
      nom, whatsapp: wa, zone,
      nb_commandes: 1, total_achete: total, derniere_le: auj
    });
  }
}

async function decompterStock() {
  for (const l of PANIER) {
    const q = STOCK[cleStock(l.nom, l.format)];
    if (q === undefined) continue;
    await api.patch('demo_stock',
      `produit_nom=eq.${encodeURIComponent(l.nom)}&format=eq.${encodeURIComponent(l.format)}`,
      { quantite: Math.max(0, q - l.quantite), updated_at: new Date().toISOString() });
  }
}

/* ── Divers ────────────────────────────────────────────────── */

let minuteurToast;
function toast(message) {
  const t = document.getElementById('toast');
  t.textContent = message;
  t.classList.add('visible');
  clearTimeout(minuteurToast);
  minuteurToast = setTimeout(() => t.classList.remove('visible'), 2600);
}

async function charger() {
  try {
    CATALOGUE = await api.get('demo_produits', 'select=*&est_actif=eq.true&order=ordre');
    if (P.stock) {
      const lignes = await api.get('demo_stock', 'select=produit_nom,format,quantite');
      STOCK = {};
      lignes.forEach(l => { STOCK[cleStock(l.produit_nom, l.format)] = l.quantite; });
    }
    document.getElementById('grille').innerHTML =
      CATALOGUE.length ? CATALOGUE.map(carteProduit).join('')
                       : '<div class="vide">Le catalogue est vide.</div>';
  } catch (e) {
    document.getElementById('grille').innerHTML =
      '<div class="vide">Le catalogue n\'a pas pu être chargé.</div>';
  }
}

function demarrer() {
  document.getElementById('app').innerHTML = gabarit();

  document.getElementById('grille').addEventListener('click', e => {
    const b = e.target.closest('button[data-produit]');
    if (b) ajouter(b.dataset.produit, parseInt(b.dataset.format, 10));
  });
  document.getElementById('btnCommander').addEventListener('click', () => {
    document.getElementById('recap').innerHTML = recapPanier();
    document.getElementById('modaleCommande').classList.add('ouverte');
  });
  document.getElementById('btnFermer').addEventListener('click', () =>
    document.getElementById('modaleCommande').classList.remove('ouverte'));
  document.getElementById('modaleCommande').addEventListener('click', e => {
    if (e.target.id === 'modaleCommande') e.target.classList.remove('ouverte');
  });
  document.getElementById('btnEnvoyer').addEventListener('click', envoyer);

  majPanier();
  charger();
}

document.addEventListener('DOMContentLoaded', demarrer);

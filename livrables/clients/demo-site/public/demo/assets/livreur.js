/* ============================================================
   DEMO PALIERS — la tournée du livreur
   Surface volontairement pauvre : le livreur ouvre un lien, voit ses
   livraisons du jour, appelle, coche. Aucun compte, aucun prix,
   aucune vue sur le reste de l'activité. C'est l'argument.
   ============================================================ */

const P = palierCourant();

function gabarit() {
  return `
    ${bandeauDemo(P)}
    <div class="bascule">
      <div class="bascule__inner">
        <div class="bascule__palier">Tournée du jour · <strong>${MARQUE.nom}</strong></div>
        <div class="bascule__liens">
          <a class="bascule__lien" href="/demo/${P.cle}/admin/">Tableau de bord</a>
        </div>
      </div>
    </div>
    <div class="contenu" style="padding-top:24px">
      <h1>Vos livraisons</h1>
      <p style="color:var(--gris)">
        Ce que voit votre livreur, sur son téléphone, sans compte à créer.
        Il ne voit ni vos prix, ni vos autres commandes.
      </p>
      <div id="liste"><div class="vide">Chargement…</div></div>
    </div>
    <div class="pied">Démonstration produite par l'agence Mr Attractor · <a href="/demo/">Voir les 3 formules</a></div>
    <div class="toast" id="toast"></div>`;
}

function carte(c) {
  const produits = Array.isArray(c.produits) ? c.produits : [];
  const tel = (c.client_wa || '').replace(/[^0-9+]/g, '');
  return `<div class="bloc">
    <div class="bloc__titre">
      <h3>${echappe(c.client_nom)}</h3>
      <span class="pastille pastille--${c.statut}">${c.statut === 'livree' ? 'Livrée' : 'À livrer'}</span>
    </div>
    <p style="margin:0 0 8px"><strong>${echappe(c.client_zone || 'Zone non précisée')}</strong></p>
    <p style="font-size:14px;color:var(--gris);margin:0 0 16px">
      ${produits.map(p => `${echappe(p.nom)} × ${p.quantite}`).join('<br>') || 'Colis'}
    </p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${tel ? `<a class="btn btn--ligne btn--petit" href="tel:${tel}">Appeler</a>
               <a class="btn btn--ligne btn--petit" href="https://wa.me/${tel.replace(/\+/g, '')}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
      ${c.statut !== 'livree' ? `<button class="btn btn--vert btn--petit" data-livre="${c.id}">C'est livré</button>` : ''}
    </div>
  </div>`;
}

async function charger() {
  try {
    const cmds = await api.get('demo_commandes',
      'select=*&statut=in.(en_livraison,livree)&order=created_at.desc');
    document.getElementById('liste').innerHTML = cmds.length
      ? cmds.map(carte).join('')
      : `<div class="vide">Aucune livraison en cours.<br>
           Depuis le tableau de bord, passez une commande en livraison, elle apparaîtra ici.</div>`;
  } catch (e) {
    document.getElementById('liste').innerHTML = '<div class="vide">Chargement impossible.</div>';
  }
}

let minuteurToast;
function toast(message) {
  const t = document.getElementById('toast');
  t.textContent = message;
  t.classList.add('visible');
  clearTimeout(minuteurToast);
  minuteurToast = setTimeout(() => t.classList.remove('visible'), 2600);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('app').innerHTML = gabarit();
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-livre]');
    if (!b) return;
    b.disabled = true;
    try {
      await api.patch('demo_commandes', 'id=eq.' + b.dataset.livre, { statut: 'livree' });
      toast('Marqué livré');
      charger();
    } catch (err) {
      toast('Impossible de mettre à jour');
      b.disabled = false;
    }
  });
  charger();
});

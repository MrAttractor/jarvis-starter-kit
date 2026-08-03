/* ============================================================
   DEMO PALIERS — le tableau de bord
   Ouvert sans mot de passe, pleinement cliquable. Le prospect doit
   pouvoir modifier quelque chose lui-même : c'est ce geste qui vend,
   pas la capture d'écran. La remise à zéro horaire rend cela tenable.
   ============================================================ */

const P = palierCourant();
const photo = url => (url || '').startsWith('assets/') ? '/demo/' + url : url;

const ONGLETS = [
  { cle: 'commandes', nom: 'Commandes', actif: () => true },
  { cle: 'catalogue', nom: 'Catalogue', actif: () => true },
  { cle: 'stock', nom: 'Stock', actif: () => P.stock },
  { cle: 'clients', nom: 'Clientes', actif: () => P.clients },
  { cle: 'pos', nom: 'Points de vente', actif: () => P.pointsDeVente },
  { cle: 'equipe', nom: 'Équipe', actif: () => P.equipe },
  { cle: 'stats', nom: 'Chiffres', actif: () => true }
];

const LIBELLE_STATUT = {
  nouvelle: 'Nouvelle', acceptee: 'Acceptée',
  en_livraison: 'En livraison', livree: 'Livrée', annulee: 'Annulée'
};

/* ── Gabarit ───────────────────────────────────────────────── */

function gabarit() {
  const onglets = ONGLETS.filter(o => o.actif());
  return `
    ${bandeauDemo(P)}
    <div class="bascule">
      <div class="bascule__inner">
        <div class="bascule__palier">Tableau de bord de ${MARQUE.nom} · formule <strong>${P.nom}</strong></div>
        <div class="bascule__liens">
          <a class="bascule__lien" href="/demo/${P.cle}/">Vitrine</a>
          <span class="bascule__lien bascule__lien--actif">Tableau de bord</span>
        </div>
      </div>
    </div>

    <div class="onglets" id="onglets">
      ${onglets.map((o, i) => `<button class="onglet ${i === 0 ? 'onglet--actif' : ''}" data-vue="${o.cle}">${o.nom}</button>`).join('')}
    </div>

    <div class="contenu">
      ${onglets.map((o, i) => `<section class="vue ${i === 0 ? 'vue--active' : ''}" id="vue-${o.cle}"><div class="vide">Chargement…</div></section>`).join('')}
    </div>

    <section class="encart">
      <div class="contenu">
        <h2>Vous venez de piloter une boutique</h2>
        <p>C'est exactement l'écran que vous auriez. Formule <strong>${P.nom}</strong>, ${P.prix} (${P.prixEur}), puis ${P.mrr}.</p>
        <div class="encart__actions">
          <a class="btn btn--plein" href="/demo/">Comparer les 3 formules</a>
          <button class="btn btn--ligne" style="color:#F5EFE6;border-color:#6E645A" id="btnReset">Remettre la démo à zéro</button>
        </div>
        <p style="font-size:13px;margin-top:16px">
          Vos essais sont effacés automatiquement chaque heure. Vous ne pouvez rien casser.
        </p>
      </div>
    </section>

    <div class="pied">Démonstration produite par l'agence Mr Attractor · <a href="https://agenceattractor.com">agenceattractor.com</a></div>
    <div class="toast" id="toast"></div>
  `;
}

/* ── Commandes ─────────────────────────────────────────────── */

async function vueCommandes() {
  const cmds = await api.get('demo_commandes', 'select=*&order=created_at.desc');
  const aTraiter = cmds.filter(c => c.statut === 'nouvelle').length;

  const lien = P.livreur ? `
    <div class="bloc">
      <div class="bloc__titre"><h3>Tournée du livreur</h3></div>
      <p style="font-size:14px;color:var(--gris)">
        Votre livreur ouvre ce lien sur son téléphone. Il voit les commandes à livrer, appelle la cliente,
        coche « livré ». Il n'a aucun compte à créer et ne voit ni vos prix, ni vos autres commandes.
      </p>
      <button class="btn btn--sombre" id="btnLienLivreur">Copier le lien de tournée</button>
    </div>` : '';

  return `
    ${avantApres(
      'Vous remontez vos discussions pour retrouver qui a commandé quoi, et une commande passe à la trappe.',
      'Toutes les commandes dans une liste, avec le quartier et le numéro. Elles restent en tête tant qu\'elles ne sont pas traitées.')}
    <div class="stats">
      <div class="stat"><div class="stat__label">À traiter</div><div class="stat__valeur">${aTraiter}</div></div>
      <div class="stat"><div class="stat__label">Commandes reçues</div><div class="stat__valeur">${cmds.length}</div></div>
    </div>
    ${lien}
    <div class="bloc">
      <div class="bloc__titre"><h3>Toutes les commandes</h3></div>
      ${cmds.length ? `<div class="tableau-scroll"><table>
        <thead><tr><th>Cliente</th><th>Détail</th><th>Total</th><th>État</th><th></th></tr></thead>
        <tbody>${cmds.map(ligneCommande).join('')}</tbody>
      </table></div>` : '<div class="vide">Aucune commande. Passez-en une depuis la vitrine, elle apparaîtra ici.</div>'}
    </div>`;
}

function ligneCommande(c) {
  const produits = Array.isArray(c.produits) ? c.produits : [];
  const suite = { nouvelle: 'acceptee', acceptee: P.livreur ? 'en_livraison' : 'livree', en_livraison: 'livree' }[c.statut];
  const libelleSuite = { acceptee: 'Accepter', en_livraison: 'Envoyer en livraison', livree: 'Marquer livrée' }[suite];
  return `<tr>
    <td><strong>${echappe(c.client_nom)}</strong><br>
        <span style="color:var(--gris);font-size:13px">${echappe(c.client_wa || '')}<br>${echappe(c.client_zone || '')}</span></td>
    <td style="font-size:13px">${produits.map(p => `${echappe(p.nom)} <span style="color:var(--gris)">${echappe(p.format || '')} × ${p.quantite}</span>`).join('<br>') || '—'}</td>
    <td style="white-space:nowrap;font-weight:700">${fcfa(c.total)}</td>
    <td><span class="pastille pastille--${c.statut}">${LIBELLE_STATUT[c.statut] || c.statut}</span></td>
    <td style="white-space:nowrap">
      ${suite ? `<button class="btn btn--vert btn--petit" data-action="statut" data-id="${c.id}" data-vers="${suite}">${libelleSuite}</button>` : ''}
      ${c.statut !== 'annulee' && c.statut !== 'livree' ? `<button class="btn btn--ligne btn--petit" data-action="statut" data-id="${c.id}" data-vers="annulee">Annuler</button>` : ''}
    </td>
  </tr>`;
}

/* ── Catalogue ─────────────────────────────────────────────── */

async function vueCatalogue() {
  const produits = await api.get('demo_produits', 'select=*&order=ordre');
  return `
    ${avantApres(
      'Vous redonnez le même prix à la main, dix fois par jour, et une cliente sur deux n’ose pas redemander.',
      'Le prix est écrit une fois. Vous le changez ici, il change sur la vitrine dans la seconde.')}
    <div class="bloc">
      <div class="bloc__titre">
        <h3>Vos produits</h3>
        <button class="btn btn--plein btn--petit" data-action="nouveau-produit">Ajouter un produit</button>
      </div>
      <p style="font-size:14px;color:var(--gris)">
        Tout ce que vous changez ici apparaît sur la vitrine immédiatement. Essayez : modifiez un prix, puis ouvrez la vitrine.
      </p>
      <div class="tableau-scroll"><table>
        <thead><tr><th></th><th>Produit</th><th>Formats et prix</th><th>En ligne</th><th></th></tr></thead>
        <tbody>${produits.map(p => `<tr>
          <td><img src="${photo(p.photo_url)}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:8px" onerror="this.style.visibility='hidden'"></td>
          <td><strong>${echappe(p.nom)}</strong><br><span style="color:var(--gris);font-size:13px">${echappe(p.categorie)}</span></td>
          <td style="font-size:13px">${(p.formats || []).map((f, i) =>
            `${echappe(f.label)} · <button class="btn btn--ligne btn--petit" data-action="prix" data-id="${p.id}" data-format="${i}">${echappe(f.prix)}</button>`
          ).join('<br>')}</td>
          <td><button class="btn btn--petit ${p.est_actif ? 'btn--vert' : 'btn--ligne'}" data-action="actif" data-id="${p.id}" data-vers="${!p.est_actif}">${p.est_actif ? 'Visible' : 'Masqué'}</button></td>
          <td><button class="btn btn--ligne btn--petit" data-action="supprimer" data-id="${p.id}">Retirer</button></td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>`;
}

/* ── Stock ─────────────────────────────────────────────────── */

async function vueStock() {
  const lignes = await api.get('demo_stock', 'select=*&order=produit_nom');
  const bas = lignes.filter(l => l.quantite < l.seuil);
  return `
    ${avantApres(
      'Le stock est dans votre tête. Vous promettez un produit, puis vous découvrez qu’il n’y en a plus.',
      'La quantité baisse à chaque vente, et l’écran vous alerte avant la rupture.')}
    ${bas.length ? `<div class="note"><strong>${bas.length} référence${bas.length > 1 ? 's' : ''} sous le seuil</strong>
      ${bas.map(l => echappe(l.produit_nom) + ' (' + l.quantite + ')').join(', ')}. C'est l'alerte que vous n'avez pas aujourd'hui.</div>` : ''}
    <div class="bloc">
      <div class="bloc__titre"><h3>Ce qu'il vous reste</h3></div>
      <div class="tableau-scroll"><table>
        <thead><tr><th>Référence</th><th>Quantité</th><th>Niveau</th><th></th></tr></thead>
        <tbody>${lignes.map(l => {
          const pct = Math.min(100, Math.round((l.quantite / Math.max(1, l.seuil * 3)) * 100));
          const alerte = l.quantite < l.seuil;
          return `<tr>
            <td><strong>${echappe(l.produit_nom)}</strong><br><span style="color:var(--gris);font-size:13px">${echappe(l.format || '')}</span></td>
            <td style="font-weight:700;${alerte ? 'color:var(--alerte)' : ''}">${l.quantite}</td>
            <td style="min-width:120px"><div class="barre-jauge"><div class="barre-jauge__remplie ${alerte ? 'barre-jauge__remplie--bas' : ''}" style="width:${pct}%"></div></div>
                <span style="font-size:12px;color:var(--gris)">seuil ${l.seuil}</span></td>
            <td style="white-space:nowrap">
              <button class="btn btn--ligne btn--petit" data-action="stock" data-id="${l.id}" data-delta="-1">−</button>
              <button class="btn btn--vert btn--petit" data-action="stock" data-id="${l.id}" data-delta="10">+10</button>
            </td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>`;
}

/* ── Clientes ──────────────────────────────────────────────── */

async function vueClients() {
  const clients = await api.get('demo_clients', 'select=*&order=total_achete.desc');
  return `
    ${avantApres(
      'Vous vous souvenez à peu près de vos bonnes clientes, sans pouvoir dire qui a acheté quoi ni quand.',
      'La liste se remplit seule, classée par ce que chacune a dépensé. C’est votre matière à relance.')}
    <div class="bloc">
      <div class="bloc__titre"><h3>Qui achète chez vous</h3></div>
      <p style="font-size:14px;color:var(--gris)">
        Cette liste se remplit toute seule à chaque commande. C'est elle qui vous permet de relancer les bonnes personnes.
      </p>
      <div class="tableau-scroll"><table>
        <thead><tr><th>Cliente</th><th>Zone</th><th>Commandes</th><th>Total acheté</th><th>Dernière</th></tr></thead>
        <tbody>${clients.map(c => `<tr>
          <td><strong>${echappe(c.nom)}</strong><br><span style="color:var(--gris);font-size:13px">${echappe(c.whatsapp || '')}</span></td>
          <td>${echappe(c.zone || '')}</td>
          <td>${c.nb_commandes}</td>
          <td style="font-weight:700;white-space:nowrap">${fcfa(c.total_achete)}</td>
          <td style="white-space:nowrap">${c.derniere_le ? new Date(c.derniere_le).toLocaleDateString('fr-FR') : '—'}</td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>`;
}

/* ── Points de vente ───────────────────────────────────────── */

async function vuePos() {
  const pos = await api.get('demo_pos', 'select=*&order=ordre');
  return `
    ${avantApres(
      'Vous appelez chaque boutique pour savoir ce qui est vendu, et vous recomptez sur place.',
      'Chaque gérante saisit ses ventes. Vous voyez le déposé, le vendu et le reste sans bouger.')}
    <div class="bloc">
      <div class="bloc__titre"><h3>Vos points de vente</h3></div>
      <p style="font-size:14px;color:var(--gris)">
        Chaque gérante a son propre lien. Elle saisit ses ventes, demande du réapprovisionnement,
        et ne voit que sa boutique.
      </p>
      <div class="tableau-scroll"><table>
        <thead><tr><th>Point de vente</th><th>Gérante</th><th>Déposé</th><th>Vendu</th><th>Reste</th><th></th></tr></thead>
        <tbody>${pos.map(p => `<tr>
          <td><strong>${echappe(p.nom)}</strong><br><span style="color:var(--gris);font-size:13px">${echappe(p.zone || '')}</span></td>
          <td>${echappe(p.gerante_nom || '')}<br><span style="color:var(--gris);font-size:13px">${echappe(p.gerante_tel || '')}</span></td>
          <td>${p.stock_depose}</td>
          <td style="font-weight:700">${p.vendu}</td>
          <td style="${p.stock_depose - p.vendu < 20 ? 'color:var(--alerte);font-weight:700' : ''}">${p.stock_depose - p.vendu}</td>
          <td><button class="btn btn--vert btn--petit" data-action="vente-pos" data-id="${p.id}">Saisir une vente</button></td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>`;
}

/* ── Équipe ────────────────────────────────────────────────── */

async function vueEquipe() {
  const equipe = await api.get('demo_equipe', 'select=*&order=created_at');
  return `
    ${avantApres(
      'Vous êtes seul à savoir. Donc vous ne pouvez ni tomber malade, ni partir en voyage.',
      'Chacun ouvre le même outil et n’y voit que son travail. Votre vendeuse ne voit pas vos chiffres.')}
    <div class="bloc">
      <div class="bloc__titre"><h3>Qui a accès à quoi</h3></div>
      <p style="font-size:14px;color:var(--gris)">
        C'est ce que « multi-utilisateurs » veut dire concrètement : chacun ouvre le même outil
        et n'y voit que son périmètre. Votre vendeuse ne voit pas votre chiffre d'affaires.
      </p>
      <div class="tableau-scroll"><table>
        <thead><tr><th>Personne</th><th>Rôle</th><th>Ce qu'elle voit</th></tr></thead>
        <tbody>${equipe.map(m => `<tr>
          <td><strong>${echappe(m.nom)}</strong></td>
          <td><span class="pastille pastille--acceptee">${echappe(m.role)}</span></td>
          <td style="font-size:14px;color:var(--gris)">${echappe(m.perimetre || '')}</td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>`;
}

/* ── Chiffres ──────────────────────────────────────────────── */

async function vueStats() {
  const ventes = await api.get('demo_ventes', 'select=produit_nom,montant,quantite,canal,vendu_le&order=vendu_le.desc');
  const auj = new Date().toISOString().slice(0, 10);
  const debutMois = auj.slice(0, 8) + '01';

  const somme = arr => arr.reduce((s, v) => s + (v.montant || 0), 0);
  const duJour = ventes.filter(v => v.vendu_le === auj);
  const duMois = ventes.filter(v => v.vendu_le >= debutMois);

  const parProduit = {};
  ventes.forEach(v => {
    parProduit[v.produit_nom] = parProduit[v.produit_nom] || { qte: 0, ca: 0 };
    parProduit[v.produit_nom].qte += v.quantite || 0;
    parProduit[v.produit_nom].ca += v.montant || 0;
  });
  const classement = Object.entries(parProduit).sort((a, b) => b[1].ca - a[1].ca);

  const niveau = P.stats;                       // minimal | standard | complet
  const standard = niveau !== 'minimal';
  const complet = niveau === 'complet';

  // Série journalière : le tableau de bord d'un commerçant se lit par jour,
  // pas par semaine. 30 jours en standard, 90 en complet.
  const jours = complet ? 90 : 30;
  const parJour = new Map();
  for (let i = jours - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const cle = d.toISOString().slice(0, 10);
    parJour.set(cle, { label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), y: 0 });
  }
  ventes.forEach(v => {
    const j = parJour.get(v.vendu_le);
    if (j) j.y += v.montant || 0;
  });
  const serie = [...parJour.values()];

  const parCanal = {};
  ventes.forEach(v => { parCanal[v.canal] = (parCanal[v.canal] || 0) + (v.montant || 0); });
  const parts = CANAUX.filter(c => parCanal[c.cle])
                      .map(c => ({ nom: c.nom, valeur: parCanal[c.cle], couleur: c.couleur }));

  const meilleur = serie.reduce((a, b) => (b.y > a.y ? b : a), serie[0] || { y: 0, label: '—' });

  const blocCourbe = `
    <div class="bloc">
      <div class="bloc__titre"><h3>Vos ventes, jour par jour</h3></div>
      ${courbe(serie, {
        alt: `Chiffre d’affaires quotidien sur ${jours} jours`,
        legende: `Sur ${jours} jours. Meilleure journée : ${meilleur.label}, ${fcfa(meilleur.y)}. Survolez pour lire chaque jour.`
      })}
    </div>`;

  const blocClassement = `
    <div class="bloc">
      <div class="bloc__titre"><h3>Ce qui se vend le mieux</h3></div>
      ${barres(classement.slice(0, complet ? 8 : 5).map(([nom, d]) => ({
        label: nom, valeur: d.ca, sous: d.qte + ' vendus'
      })), { alt: 'Classement des produits par chiffre d’affaires' })}
      <details>
        <summary style="cursor:pointer;font-size:14px;color:var(--gris);padding:8px 0">
          Voir le tableau des chiffres
        </summary>
        <div class="tableau-scroll"><table>
          <thead><tr><th>Produit</th><th>Quantité</th><th>Chiffre</th></tr></thead>
          <tbody>${classement.map(([nom, d]) => `<tr>
            <td><strong>${echappe(nom)}</strong></td>
            <td style="font-variant-numeric:tabular-nums">${d.qte}</td>
            <td style="font-weight:700;white-space:nowrap;font-variant-numeric:tabular-nums">${fcfa(d.ca)}</td>
          </tr>`).join('')}</tbody>
        </table></div>
      </details>
    </div>`;

  const blocCanaux = `
    <div class="bloc">
      <div class="bloc__titre"><h3>D’où vient l’argent</h3></div>
      ${repartition(parts, { legende: 'Ce que vous ne pouvez pas savoir aujourd’hui : quelle part vient de la boutique et quelle part du terrain.' })}
    </div>`;

  return `
    ${avantApres(
      'En fin de mois, vous additionnez de tête ou vous ne le faites pas du tout.',
      'Le chiffre du jour, celui du mois, et ce qui se vend le mieux. Sans calcul.')}

    <div class="stats">
      <div class="stat"><div class="stat__label">Aujourd'hui</div><div class="stat__valeur">${fcfa(somme(duJour))}</div>
        <div class="stat__note">${duJour.length} vente${duJour.length > 1 ? 's' : ''}</div></div>
      <div class="stat"><div class="stat__label">Ce mois</div><div class="stat__valeur">${fcfa(somme(duMois))}</div>
        <div class="stat__note">${duMois.length} vente${duMois.length > 1 ? 's' : ''}</div></div>
      ${complet ? `
      <div class="stat"><div class="stat__label">Sur 90 jours</div><div class="stat__valeur">${fcfa(somme(ventes))}</div>
        <div class="stat__note">${ventes.length} ventes</div></div>
      <div class="stat"><div class="stat__label">Panier moyen</div><div class="stat__valeur">${fcfa(Math.round(somme(ventes) / Math.max(1, ventes.length)))}</div></div>` : ''}
    </div>

    ${standard ? blocCourbe : verrouille('Vos ventes, jour par jour',
        courbe(serie, { alt: 'Aperçu' }), 'App pro')}

    ${standard ? blocClassement : verrouille('Ce qui se vend le mieux',
        barres(classement.slice(0, 5).map(([nom, d]) => ({ label: nom, valeur: d.ca })), { alt: 'Aperçu' }), 'App pro')}

    ${complet ? blocCanaux : verrouille('D’où vient l’argent',
        repartition(parts.length ? parts : [{ nom: '—', valeur: 1, couleur: VIZ.s1 }], {}), 'App pro+')}

    ${complet ? `<div class="bloc">
      <div class="bloc__titre"><h3>Vos points de vente</h3></div>
      <div id="vizPos"><div class="vide">Chargement…</div></div>
    </div>` : ''}

    ${!complet ? `<p style="font-size:14px;color:var(--gris)">
      Les blocs grisés existent, ils ne sont simplement pas dans la formule ${P.nom}.
      <a href="/demo/">Comparer les formules</a>.
    </p>` : ''}`;
}

/* Le comparatif des points de vente vit dans une autre table : on le charge
   après le rendu plutôt que de retarder tout l'onglet. */
async function vueStatsPos() {
  const cible = document.getElementById('vizPos');
  if (!cible) return;
  try {
    const pos = await api.get('demo_pos', 'select=nom,vendu,stock_depose&order=vendu.desc');
    cible.innerHTML = barres(pos.map(p => ({
      label: p.nom, valeur: p.vendu, sous: (p.stock_depose - p.vendu) + ' en rayon'
    })), { alt: 'Ventes par point de vente', largeurLabel: 220,
           legende: 'Pièces vendues par point de vente. Survolez pour voir ce qu’il reste en rayon.' });
  } catch (e) {
    cible.innerHTML = '<div class="vide">Comparatif indisponible.</div>';
  }
}

/* ── Actions ───────────────────────────────────────────────── */

const RENDUS = {
  commandes: vueCommandes, catalogue: vueCatalogue, stock: vueStock,
  clients: vueClients, pos: vuePos, equipe: vueEquipe, stats: vueStats
};

async function rendre(cle) {
  const cible = document.getElementById('vue-' + cle);
  if (!cible) return;
  try {
    cible.innerHTML = await RENDUS[cle]();
    if (cle === 'stats') vueStatsPos();
  } catch (e) {
    cible.innerHTML = '<div class="vide">Ces données n\'ont pas pu être chargées.</div>';
  }
}

async function agir(action, el) {
  const id = el.dataset.id;
  try {
    if (action === 'statut') {
      await api.patch('demo_commandes', 'id=eq.' + id, { statut: el.dataset.vers });
      toast('Commande mise à jour');
      return rendre('commandes');
    }
    if (action === 'actif') {
      await api.patch('demo_produits', 'id=eq.' + id, { est_actif: el.dataset.vers === 'true' });
      toast('Visibilité changée. Ouvrez la vitrine pour voir.');
      return rendre('catalogue');
    }
    if (action === 'supprimer') {
      if (!confirm('Retirer ce produit du catalogue ?')) return;
      await api.del('demo_produits', 'id=eq.' + id);
      toast('Produit retiré');
      return rendre('catalogue');
    }
    if (action === 'prix') {
      const produits = await api.get('demo_produits', 'select=formats&id=eq.' + id);
      const formats = produits[0].formats;
      const i = parseInt(el.dataset.format, 10);
      const saisi = prompt('Nouveau prix pour « ' + formats[i].label + ' »', formats[i].prix);
      if (saisi === null) return;
      formats[i].prix = saisi.trim();
      await api.patch('demo_produits', 'id=eq.' + id, { formats });
      toast('Prix modifié. Il est déjà à jour sur la vitrine.');
      return rendre('catalogue');
    }
    if (action === 'nouveau-produit') {
      const nom = prompt('Nom du produit');
      if (!nom) return;
      const prix = prompt('Prix, par exemple 5 000 F', '5 000 F') || '0 F';
      await api.post('demo_produits', {
        nom, categorie: 'Soin', description: 'Ajouté depuis le tableau de bord, en direct.',
        formats: [{ label: 'Format unique', sub: '', prix }], ordre: 99
      });
      toast('Produit ajouté. Il est en ligne.');
      return rendre('catalogue');
    }
    if (action === 'stock') {
      const lignes = await api.get('demo_stock', 'select=quantite&id=eq.' + id);
      const q = Math.max(0, lignes[0].quantite + parseInt(el.dataset.delta, 10));
      await api.patch('demo_stock', 'id=eq.' + id, { quantite: q, updated_at: new Date().toISOString() });
      return rendre('stock');
    }
    if (action === 'vente-pos') {
      const pos = await api.get('demo_pos', 'select=nom,vendu&id=eq.' + id);
      const n = parseInt(prompt('Combien de pièces vendues ?', '1') || '0', 10);
      if (!n) return;
      await api.patch('demo_pos', 'id=eq.' + id, { vendu: pos[0].vendu + n });
      await api.post('demo_ventes', {
        produit_nom: 'Vente comptoir', quantite: n, montant: n * 4500,
        canal: 'point_de_vente', pos_nom: pos[0].nom
      });
      toast('Vente enregistrée');
      return rendre('pos');
    }
  } catch (e) {
    toast('Action impossible');
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

function demarrer() {
  document.getElementById('app').innerHTML = gabarit();

  document.getElementById('onglets').addEventListener('click', e => {
    const b = e.target.closest('.onglet');
    if (!b) return;
    document.querySelectorAll('.onglet').forEach(o => o.classList.remove('onglet--actif'));
    document.querySelectorAll('.vue').forEach(v => v.classList.remove('vue--active'));
    b.classList.add('onglet--actif');
    document.getElementById('vue-' + b.dataset.vue).classList.add('vue--active');
    rendre(b.dataset.vue);
  });

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (el) return agir(el.dataset.action, el);
    if (e.target.id === 'btnLienLivreur') {
      const lien = location.origin + '/demo/' + P.cle + '/livreur/';
      navigator.clipboard?.writeText(lien);
      toast('Lien copié : ' + lien);
    }
  });

  document.getElementById('btnReset').addEventListener('click', async e => {
    if (!confirm('Remettre la démonstration dans son état de départ ?')) return;
    e.target.disabled = true;
    try {
      await api.reset();
      toast('Démonstration remise à zéro');
      ONGLETS.filter(o => o.actif()).forEach(o => rendre(o.cle));
    } catch (err) {
      toast('La remise à zéro a échoué');
    } finally {
      e.target.disabled = false;
    }
  });

  rendre(ONGLETS.filter(o => o.actif())[0].cle);
}

document.addEventListener('DOMContentLoaded', demarrer);

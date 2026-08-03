/* ============================================================
   DEMO PALIERS — configuration
   Une seule base de code, trois paliers. Ce qui change d'un palier à
   l'autre, ce sont les fonctions allumées ci-dessous, jamais le code.
   C'est ce qui rend la démonstration honnête : App pro EST App simple
   avec des interrupteurs en plus.
   ============================================================ */

const SUPA = {
  url: 'https://lgdgbrivnhgeupqhkckd.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZGdicml2bmhnZXVwcWhrY2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDI1OTEsImV4cCI6MjA5NTU3ODU5MX0.kMmpwsQAUJQ6VkEpj4OOloijP1HoZbYYzbjWW2hg7Gk'
};

const MARQUE = {
  nom: 'By Macoco',
  baseline: 'Soins naturels, faits ici',
  intro: 'Karité, savon noir, huiles pressées à froid. Des soins simples, préparés en petites quantités à Abidjan.',
  whatsapp: '2250576877070',        // numéro agence : une démo ne doit jamais écrire à un vrai client
  zone: 'Abidjan et environs'
};

const PALIERS = {
  simple: {
    cle: 'simple',
    nom: 'App simple',
    prix: '165 000 FCFA',
    prixEur: '250 €',
    mrr: '23 000 FCFA / 35 € par mois',
    resume: 'Une vitrine qui prend les commandes, et un tableau de bord pour les traiter.',
    pour: 'Vous vendez seul, votre catalogue tient sur une page, et vous voulez arrêter de tout gérer dans vos discussions WhatsApp.',
    // interrupteurs
    stock: false,
    livreur: false,
    clients: false,
    pointsDeVente: false,
    equipe: false,
    stats: 'minimal',              // minimal | standard | complet
    inclus: [
      'Vitrine avec votre catalogue',
      'Panier et commande envoyée sur votre WhatsApp',
      'Tableau de bord : ajouter, modifier, retirer un produit',
      'Liste des commandes reçues, marquées traitées',
      'Hébergement offert la première année',
      '1 compte, le vôtre'
    ],
    absent: [
      'Suivi du stock',
      'Lien de tournée pour le livreur',
      'Fichier clients',
      'Courbe de vos ventes et classement des produits',
      'Plusieurs points de vente',
      'Plusieurs comptes'
    ]
  },
  pro: {
    cle: 'pro',
    nom: 'App pro',
    prix: 'à partir de 320 000 FCFA',
    prixEur: '490 €',
    mrr: '43 000 FCFA / 65 € par mois',
    resume: 'Tout le palier simple, plus le stock et la livraison.',
    pour: 'Vous vendez assez pour tomber en rupture sans le voir venir, et quelqu\'un livre pour vous.',
    stock: true,
    livreur: true,
    clients: true,
    pointsDeVente: false,
    equipe: false,
    stats: 'standard',
    inclus: [
      'Tout ce que contient App simple',
      'Stock décompté à chaque vente, alerte sous le seuil',
      'Quantité restante visible par la cliente sur la vitrine',
      'Lien de tournée envoyé au livreur, sans compte à créer',
      'Suivi de la commande en temps réel',
      'Fichier clients : qui achète, combien, quand',
      'Courbe de vos ventes sur 30 jours et classement de vos produits'
    ],
    absent: [
      'Plusieurs points de vente',
      'Plusieurs comptes avec des droits différents',
      'Courbe sur 90 jours, répartition par canal, comparatif des points de vente'
    ]
  },
  'pro-plus': {
    cle: 'pro-plus',
    nom: 'App pro+',
    prix: 'à partir de 790 000 FCFA',
    prixEur: '1 200 €',
    mrr: '65 000 FCFA / 100 € par mois',
    resume: 'Tout le palier pro, plus votre équipe et vos points de vente.',
    pour: 'Vous n\'êtes plus seul à vendre, et vous avez du stock dans plusieurs endroits.',
    stock: true,
    livreur: true,
    clients: true,
    pointsDeVente: true,
    equipe: true,
    stats: 'complet',
    inclus: [
      'Tout ce que contient App pro',
      'Plusieurs comptes, chacun ne voit que ce qui le concerne',
      'Points de vente : stock déposé, vendu, à réapprovisionner',
      'Chaque gérante saisit ses ventes depuis son téléphone',
      'Courbe sur 90 jours, d’où vient l’argent, comparatif de vos points de vente',
      'Rapports et assistance prioritaire'
    ],
    absent: [
      'Paiement en ligne automatique (add-on, voir plus bas)',
      'Application installable sur les stores (autre périmètre)'
    ]
  }
};

/* ── Accès aux données ─────────────────────────────────────── */

const api = {
  async get(table, query = '') {
    const r = await fetch(`${SUPA.url}/rest/v1/${table}?${query}`, {
      headers: { apikey: SUPA.key, Authorization: `Bearer ${SUPA.key}` }
    });
    if (!r.ok) throw new Error(`${table} : ${r.status}`);
    return r.json();
  },
  async post(table, corps) {
    const r = await fetch(`${SUPA.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: SUPA.key, Authorization: `Bearer ${SUPA.key}`,
        'Content-Type': 'application/json', Prefer: 'return=representation'
      },
      body: JSON.stringify(corps)
    });
    if (!r.ok) throw new Error(`${table} : ${r.status}`);
    return r.json();
  },
  async patch(table, query, corps) {
    const r = await fetch(`${SUPA.url}/rest/v1/${table}?${query}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPA.key, Authorization: `Bearer ${SUPA.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(corps)
    });
    if (!r.ok) throw new Error(`${table} : ${r.status}`);
    return true;
  },
  async del(table, query) {
    const r = await fetch(`${SUPA.url}/rest/v1/${table}?${query}`, {
      method: 'DELETE',
      headers: { apikey: SUPA.key, Authorization: `Bearer ${SUPA.key}` }
    });
    if (!r.ok) throw new Error(`${table} : ${r.status}`);
    return true;
  },
  async reset() {
    const r = await fetch(`${SUPA.url}/rest/v1/rpc/demo_reset`, {
      method: 'POST',
      headers: {
        apikey: SUPA.key, Authorization: `Bearer ${SUPA.key}`,
        'Content-Type': 'application/json'
      },
      body: '{}'
    });
    if (!r.ok) throw new Error(`remise à zéro : ${r.status}`);
    return r.json();
  }
};

/* ── Utilitaires ───────────────────────────────────────────── */

const fcfa = n => (n || 0).toLocaleString('fr-FR').replace(/ | /g, ' ') + ' F';
const nombrePrix = t => parseInt(String(t).replace(/[^0-9]/g, ''), 10) || 0;
const echappe = t => String(t ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function palierCourant() {
  return PALIERS[window.PALIER] || PALIERS.simple;
}

/* Le contraste avant / après, rappelé à l'endroit exact où la fonction se voit.
   Un prospect ne se vend pas une fonctionnalité, il se vend la disparition
   d'un problème qu'il vit tous les jours. */
function avantApres(avant, apres) {
  return `<div class="av-ap">
    <div class="av-ap__ligne av-ap__ligne--avant"><span>Avant</span><p>${avant}</p></div>
    <div class="av-ap__ligne av-ap__ligne--apres"><span>Ici</span><p>${apres}</p></div>
  </div>`;
}

/* Bandeau de démonstration, présent sur toutes les surfaces.
   Il ne suffit pas de le mettre dans la page : la balise meta description
   de chaque page le dit aussi, sinon la mention manque dans les aperçus
   de partage WhatsApp et Facebook. */
function bandeauDemo(palier) {
  return `<div class="bandeau-demo">
    <span class="bandeau-demo__point"></span>
    <span><strong>Démonstration</strong> · boutique fictive, aucune commande n'est traitée</span>
    <a href="/demo/avant/" class="bandeau-demo__lien">Avant / après</a>
    <a href="/demo/" class="bandeau-demo__lien">Les 3 formules</a>
  </div>`;
}

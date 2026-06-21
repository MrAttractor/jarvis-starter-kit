/* ===== LIVRAISON PRO — DONNÉES MÉTIER ===== */

const COMMUNES = [
  'Cocody', 'Marcory', 'Plateau', 'Yopougon', 'Abobo',
  'Adjamé', 'Koumassi', 'Port-Bouët', 'Treichville',
  'Attecoubé', 'Bingerville', 'Songon'
];

const DIST = {
  Cocody:      { Cocody:2, Marcory:10, Plateau:8,  Yopougon:18, Abobo:20, Adjamé:12, Koumassi:12, 'Port-Bouët':15, Treichville:10, Attecoubé:14, Bingerville:15, Songon:25 },
  Marcory:     { Cocody:10, Marcory:2, Plateau:6,  Yopougon:16, Abobo:22, Adjamé:10, Koumassi:5,  'Port-Bouët':8,  Treichville:5,  Attecoubé:12, Bingerville:20, Songon:28 },
  Plateau:     { Cocody:8,  Marcory:6, Plateau:1,  Yopougon:14, Abobo:18, Adjamé:4,  Koumassi:7,  'Port-Bouët':10, Treichville:4,  Attecoubé:8,  Bingerville:18, Songon:22 },
  Yopougon:    { Cocody:18, Marcory:16, Plateau:14, Yopougon:3, Abobo:12, Adjamé:10, Koumassi:18, 'Port-Bouët':20, Treichville:14, Attecoubé:8,  Bingerville:28, Songon:12 },
  Abobo:       { Cocody:20, Marcory:22, Plateau:18, Yopougon:12, Abobo:2, Adjamé:8,  Koumassi:22, 'Port-Bouët':24, Treichville:18, Attecoubé:14, Bingerville:30, Songon:20 },
  Adjamé:      { Cocody:12, Marcory:10, Plateau:4,  Yopougon:10, Abobo:8, Adjamé:2,  Koumassi:12, 'Port-Bouët':14, Treichville:8,  Attecoubé:6,  Bingerville:22, Songon:18 },
  Koumassi:    { Cocody:12, Marcory:5,  Plateau:7,  Yopougon:18, Abobo:22, Adjamé:12, Koumassi:2,  'Port-Bouët':6,  Treichville:5,  Attecoubé:14, Bingerville:18, Songon:28 },
  'Port-Bouët':{ Cocody:15, Marcory:8,  Plateau:10, Yopougon:20, Abobo:24, Adjamé:14, Koumassi:6,  'Port-Bouët':2,  Treichville:7,  Attecoubé:16, Bingerville:22, Songon:30 },
  Treichville: { Cocody:10, Marcory:5,  Plateau:4,  Yopougon:14, Abobo:18, Adjamé:8,  Koumassi:5,  'Port-Bouët':7,  Treichville:1,  Attecoubé:10, Bingerville:18, Songon:24 },
  Attecoubé:   { Cocody:14, Marcory:12, Plateau:8,  Yopougon:8,  Abobo:14, Adjamé:6,  Koumassi:14, 'Port-Bouët':16, Treichville:10, Attecoubé:2,  Bingerville:24, Songon:14 },
  Bingerville: { Cocody:15, Marcory:20, Plateau:18, Yopougon:28, Abobo:30, Adjamé:22, Koumassi:18, 'Port-Bouët':22, Treichville:18, Attecoubé:24, Bingerville:2, Songon:36  },
  Songon:      { Cocody:25, Marcory:28, Plateau:22, Yopougon:12, Abobo:20, Adjamé:18, Koumassi:28, 'Port-Bouët':30, Treichville:24, Attecoubé:14, Bingerville:36, Songon:2   }
};

/* Barème prix (FCFA) par km selon véhicule */
const BM = { 3: 500,  7: 1000, 15: 1500, 25: 2000 }; // Moto
const BV = { 3: 1000, 7: 1800, 15: 2500, 25: 3500 }; // Voiture

function getPrix(km, vehicule) {
  const b = (vehicule || '').includes('Voiture') ? BV : BM;
  if (km <= 3)  return b[3];
  if (km <= 7)  return b[7];
  if (km <= 15) return b[15];
  if (km <= 25) return b[25];
  return 0;
}

/* Statuts missions */
const STATUTS = {
  attente:  { label: 'En attente', color: 'gris'  },
  accepte:  { label: 'Accepté',    color: 'vt'    },
  recupere: { label: 'Récupéré',   color: 'or'    },
  enroute:  { label: 'En route',   color: 'or'    },
  livre:    { label: 'Livré',      color: 'vt'    },
  echec:    { label: 'Échec',      color: 'rouge' },
  annule:   { label: 'Annulé',     color: 'rouge' }
};

const TARIFS = {
  marchand: { essai: 'Gratuit 1 mois', pro: '3 000 FCFA/mois' },
  livreur:  { essai: 'Gratuit 1 mois', pro: '2 000 FCFA/mois' }
};

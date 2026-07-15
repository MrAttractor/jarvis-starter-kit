// La synthèse du business d'un entrepreneur, calculée à partir de ses commandes.
//
// Source unique : le tableau de bord l'affiche, et le coach s'en sert pour savoir
// de quoi il parle. Deux calculs séparés finiraient par se contredire, et rien
// n'est pire qu'un coach qui annonce un chiffre d'affaires différent de l'écran
// d'à côté.

export const PERIODS = [
  { key: 'today', label: "Aujourd'hui" },
  { key: '7d',    label: '7 jours'    },
  { key: '30d',   label: '30 jours'   },
];

/** Début de la période, et de la période précédente de même durée (pour comparer). */
export function periodRange(key, now = new Date()) {
  const start = new Date(now);
  if (key === 'today') start.setHours(0, 0, 0, 0);
  else if (key === '7d')  start.setDate(start.getDate() - 7);
  else if (key === '30d') start.setDate(start.getDate() - 30);

  const span = now - start;
  return { start, prevStart: new Date(start - span), prevEnd: start };
}

/** Les commandes qui comptent : tout sauf les annulées. */
const facturables = (orders) => orders.filter(o => o.status !== 'cancelled');

function agrege(orders) {
  const ok = facturables(orders);
  const ca = ok.reduce((s, o) => s + (o.total_fcfa || 0), 0);
  return {
    ca,
    commandes: ok.length,
    panierMoyen: ok.length ? Math.round(ca / ok.length) : 0,
    clients: new Set(ok.map(o => o.client_wa || o.client_name).filter(Boolean)).size,
  };
}

/**
 * Top produits sur la période, à partir des lignes de commande.
 * La donnée existe depuis toujours dans `orders.items` ; elle n'était agrégée nulle part.
 */
export function topProduits(orders, limit = 5) {
  const counts = {};
  for (const o of facturables(orders)) {
    for (const it of (Array.isArray(o.items) ? o.items : [])) {
      const nom = it?.nom;
      if (!nom) continue;
      const qty = Number(it.qty) || 1;
      const ca  = (Number(it.prix) || 0) * qty;
      if (!counts[nom]) counts[nom] = { nom, qty: 0, ca: 0 };
      counts[nom].qty += qty;
      counts[nom].ca  += ca;
    }
  }
  return Object.values(counts).sort((a, b) => b.qty - a.qty).slice(0, limit);
}

/** Évolution en %, ou null quand il n'y a rien à comparer (0 → x n'est pas « +∞ »). */
function evolution(actuel, precedent) {
  if (!precedent) return null;
  return Math.round(((actuel - precedent) / precedent) * 100);
}

/**
 * La synthèse complète d'une période.
 * @param {Array} orders - toutes les commandes de l'entrepreneur
 * @param {string} periodKey - 'today' | '7d' | '30d'
 */
export function synthese(orders, periodKey = '7d', now = new Date()) {
  const { start, prevStart, prevEnd } = periodRange(periodKey, now);
  const dans = (o, a, b) => {
    const d = new Date(o.created_at);
    return d >= a && (!b || d < b);
  };

  const courant = orders.filter(o => dans(o, start));
  const passe   = orders.filter(o => dans(o, prevStart, prevEnd));

  const a = agrege(courant);
  const b = agrege(passe);

  return {
    ...a,
    top: topProduits(courant),
    enAttente: orders.filter(o => o.status === 'new').length,
    evolution: {
      ca: evolution(a.ca, b.ca),
      commandes: evolution(a.commandes, b.commandes),
    },
  };
}

export const fmtMoney = (n) => (n ? n.toLocaleString('fr-FR') + ' F' : '—');

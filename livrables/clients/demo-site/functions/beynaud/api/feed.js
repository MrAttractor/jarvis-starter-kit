/* Le fil public, mis en cache au bord du reseau.
 * ─────────────────────────────────────────────────────────────────────────
 * POURQUOI. Mesure du 17/09 : le plafond est de ~55 ouvertures de page par
 * seconde, et chaque ouverture coute 6 requetes SQL. Au lancement, l'ecrasante
 * majorite des arrivants ne sont pas encore membres : ils recoivent tous
 * EXACTEMENT la meme reponse, qu'on recalcule pour chacun d'eux. Mise en cache
 * 30 secondes, elle coute UN appel toutes les 30 secondes, quel que soit le
 * nombre de visiteurs. Le plafond devient sans objet.
 *
 * CE QU'ON NE MET JAMAIS EN CACHE, et c'est la seule chose qui compte ici.
 * Quand l'appel porte un `membre_id`, la reponse est personnalisee : chaque
 * post y porte `liked`, qui dit si CE membre a aime. Servir cette reponse a
 * quelqu'un d'autre serait une fuite de donnees, pas une optimisation. Ces
 * appels passent donc en direct, sans jamais toucher au cache.
 *
 * La cle de cache inclut le grade : un Ambassadeur voit des contenus qu'un
 * Membre ne voit pas. Les confondre montrerait le contenu reserve a tout le
 * monde. Deux caches separes, jamais un seul.
 *
 * Le cache ne retient que les succes. Une panne de 30 secondes cote Supabase
 * ne doit pas devenir une panne de 30 secondes servie a tout le monde.
 */

const SUPABASE = 'https://lgdgbrivnhgeupqhkckd.supabase.co';
const AMONT = SUPABASE + '/functions/v1/bey-public';
const TTL = 30;

const json = (obj, statut) => new Response(JSON.stringify(obj), {
  status: statut || 200,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

export async function onRequestPost({ request, waitUntil }) {
  let corps;
  try { corps = await request.json(); } catch (_) { return json({ ok: false, error: 'corps illisible' }, 400); }

  // Ce chemin ne sert QUE le fil. Tout le reste continue d'aller directement a
  // Supabase : un relais generique serait une porte ouverte a maintenir.
  if (!corps || corps.action !== 'feed') return json({ ok: false, error: 'action non relayee ici' }, 400);

  const grade = corps.grade === 'ambassadeur' ? 'ambassadeur' : 'membre';
  // Volontairement strict : toute valeur de membre_id, meme inattendue, sort du
  // cache. On se trompe du cote qui ne fuite pas.
  const personnalise = corps.membre_id !== undefined && corps.membre_id !== null && corps.membre_id !== '';

  const entetes = {
    'Content-Type': 'application/json',
    apikey: request.headers.get('apikey') || '',
    Authorization: request.headers.get('authorization') || '',
  };

  if (personnalise) {
    const r = await fetch(AMONT, { method: 'POST', headers: entetes, body: JSON.stringify(corps) });
    const texte = await r.text();
    return new Response(texte, {
      status: r.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  // Clé synthétique : le cache de Cloudflare n'indexe que des GET. On fabrique
  // donc une adresse qui represente exactement cette reponse-la.
  const cache = caches.default;
  const cle = new Request(`https://fil.beynaumania.interne/apercu/${grade}`, { method: 'GET' });

  const enCache = await cache.match(cle);
  if (enCache) {
    const r = new Response(enCache.body, enCache);
    r.headers.set('X-Fil-Cache', 'hit');
    return r;
  }

  const amont = await fetch(AMONT, {
    method: 'POST',
    headers: entetes,
    body: JSON.stringify({ action: 'feed', grade }),
  });
  const texte = await amont.text();

  // Une reponse qui n'est pas un succes franc n'entre pas dans le cache.
  let sain = amont.ok;
  if (sain) { try { sain = JSON.parse(texte).ok !== false; } catch (_) { sain = false; } }

  const reponse = new Response(texte, {
    status: amont.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': sain ? `public, max-age=${TTL}` : 'no-store',
      'X-Fil-Cache': sain ? 'miss' : 'bypass',
    },
  });

  if (sain) waitUntil(cache.put(cle, reponse.clone()));
  return reponse;
}

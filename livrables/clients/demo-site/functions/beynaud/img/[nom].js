/* Les photos de la Beynaumania, servies par Cloudflare au lieu de Supabase.
 * ─────────────────────────────────────────────────────────────────────────
 * Deux defauts mesures le 17/09, qui se corrigent tous les deux ici.
 *
 * 1. LE CACHE. Supabase enregistre « no-cache » en dur dans les metadonnees de
 *    chaque objet et ignore les deux formes d'en-tete documentees : verifie en
 *    depot direct et en formulaire, il repond no-cache dans les deux cas. Le
 *    cache ne se reglait donc PAS a la source. Ici, si.
 *
 * 2. LA SORTIE RESEAU. Chaque photo vue partait du quota Supabase : 640 Ko par
 *    visiteur, soit un quota mensuel gratuit epuise a 8 197 visiteurs. Derriere
 *    Cloudflare, Supabase ne sert la photo qu'une fois par emplacement de cache,
 *    et la bande passante de Cloudflare est gratuite et illimitee. Un lancement
 *    devant 10 millions d'abonnes cesse d'etre une question de quota.
 *
 * Le nom de fichier est un UUID : son contenu ne changera jamais, donc le cache
 * est pose a un an et immuable. Pour remplacer une image, on change son nom,
 * on ne l'ecrase pas (meme regle que les images du dossier, dans _headers).
 */

const SUPABASE = 'https://lgdgbrivnhgeupqhkckd.supabase.co';
const PANIER = 'bey-photos';
const UN_AN = 'public, max-age=31536000, immutable';

// onRequest et pas onRequestGet : sinon une requete HEAD n'est pas prise en
// charge, retombe sur les fichiers du site et repond 404 sur une photo qui
// existe. Ce sont les outils de controle et certains aperçus de lien qui font
// des HEAD, donc une image « introuvable » la ou elle s'affiche tres bien.
export async function onRequest({ params, request, waitUntil }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Methode non autorisee.', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  // Le nom vient de l'adresse publique : on n'accepte qu'un UUID suivi d'une
  // extension connue. Sans ca, ce chemin deviendrait un relais ouvert vers
  // n'importe quel objet du panier, et plus tard vers n'importe quoi.
  const nom = String(params.nom || '');
  if (!/^[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$/i.test(nom)) {
    return new Response('Nom de fichier invalide.', { status: 400 });
  }

  const cache = caches.default;
  const cle = new Request(new URL(request.url).toString(), request);
  const enCache = await cache.match(cle);
  if (enCache) return enCache;

  const amont = await fetch(`${SUPABASE}/storage/v1/object/public/${PANIER}/${nom}`, {
    cf: { cacheEverything: true, cacheTtl: 31536000 },
  });

  if (!amont.ok) {
    // On ne met jamais une erreur en cache pour un an : une photo deposee juste
    // apres une faute de frappe resterait introuvable pendant douze mois.
    return new Response('Photo introuvable.', {
      status: amont.status,
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  }

  const reponse = new Response(amont.body, amont);
  reponse.headers.set('Cache-Control', UN_AN);
  reponse.headers.set('X-Servi-Par', 'cloudflare');
  reponse.headers.delete('set-cookie');

  waitUntil(cache.put(cle, reponse.clone()));
  return reponse;
}

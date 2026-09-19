/* ═══════════════════════════════════════════════════════════════════════
   latiss.net — le Worker
   ───────────────────────────────────────────────────────────────────────
   Il ne sert PAS les pages : les fichiers de `public/` sont servis avant
   lui, directement par Cloudflare. Il ne s'occupe que des deux chemins qui
   demandent du code, et qui vivaient jusqu'au 19/09/2026 en Pages Functions
   sur le site mutualise :

     POST /api/feed        le fil public, mis en cache au bord du reseau
     GET  /img/<uuid>.ext  les photos, servies par Cloudflare et non par
                           Supabase

   POURQUOI CE FICHIER EXISTE. Le site mutualise est un projet Pages
   classique, ou un dossier `functions/` suffit. `latiss.net` est ne sur la
   nouvelle plateforme, ou Pages est fondu dans Workers : ce dossier n'y
   existe pas, et les deux fonctions auraient disparu en silence pendant le
   demenagement. Le fil serait reparti taper Supabase a chaque ouverture de
   page (plafond mesure : ~55 par seconde) et chaque photo serait repartie
   du quota de sortie Supabase (epuise a 8 197 visiteurs). Rien n'aurait
   semble casse. C'est exactement le genre de perte qu'un demenagement fait.
   ═══════════════════════════════════════════════════════════════════════ */

const SUPABASE = 'https://lgdgbrivnhgeupqhkckd.supabase.co';
const AMONT = SUPABASE + '/functions/v1/bey-public';
const PANIER = 'bey-photos';
const TTL = 30;
const UN_AN = 'public, max-age=31536000, immutable';

const json = (obj, statut) => new Response(JSON.stringify(obj), {
  status: statut || 200,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

/* ── Le fil ─────────────────────────────────────────────────────────────
   CE QU'ON NE MET JAMAIS EN CACHE, et c'est la seule chose qui compte ici.
   Quand l'appel porte un membre_id ou un jeton, la reponse est
   personnalisee : chaque publication y porte `liked`, qui dit si CE membre
   a aime. Servir cette reponse a quelqu'un d'autre serait une fuite de
   donnees, pas une optimisation.

   La cle inclut le grade : un Ambassadeur voit des contenus qu'un Membre ne
   voit pas. Les confondre montrerait le contenu reserve a tout le monde. */
async function fil(request, ctx) {
  let corps;
  try { corps = await request.json(); }
  catch (_) { return json({ ok: false, error: 'corps illisible' }, 400); }

  // Ce chemin ne sert QUE le fil. Un relais generique serait une porte
  // ouverte a maintenir.
  if (!corps || corps.action !== 'feed') {
    return json({ ok: false, error: 'action non relayee ici' }, 400);
  }

  // Volontairement strict : toute valeur, meme inattendue, sort du cache.
  // On se trompe du cote qui ne fuite pas.
  const porte = (v) => v !== undefined && v !== null && v !== '';
  const personnalise = porte(corps.membre_id) || porte(corps.jeton);

  // Le grade ne donne acces a rien : le serveur ignore ce que le client
  // affirme etre et lit le grade dans la ligne du membre. Il ne sert ici
  // qu'a ne pas servir un apercu calcule pour un grade a un appel qui en
  // demandait un autre.
  const grade = corps.grade === 'ambassadeur' ? 'ambassadeur' : 'membre';

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

  // Cle synthetique : le cache de Cloudflare n'indexe que des GET. On
  // fabrique donc une adresse qui represente exactement cette reponse-la.
  const cache = caches.default;
  const cle = new Request(`https://fil.latiss.interne/apercu/${grade}`, { method: 'GET' });

  const enCache = await cache.match(cle);
  if (enCache) {
    const r = new Response(enCache.body, enCache);
    r.headers.set('X-Fil-Cache', 'hit');
    return r;
  }

  const amont = await fetch(AMONT, {
    method: 'POST', headers: entetes,
    body: JSON.stringify({ action: 'feed', grade }),
  });
  const texte = await amont.text();

  // Une panne de 30 secondes cote Supabase ne doit pas devenir une panne de
  // 30 secondes servie a tout le monde.
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

  if (sain) ctx.waitUntil(cache.put(cle, reponse.clone()));
  return reponse;
}

/* ── Les photos ─────────────────────────────────────────────────────────
   Supabase ecrit « no-cache » en dur dans les metadonnees de chaque objet
   et ignore les deux formes d'en-tete documentees : verifie le 17/09 en
   depot direct et en formulaire. Le cache ne se reglait donc pas a la
   source. Ici, si. Et la sortie reseau passe du quota Supabase a la bande
   passante de Cloudflare, qui est gratuite.

   GET et HEAD : sans HEAD, les outils de controle et certains apercus de
   lien recoivent 404 sur une photo qui s'affiche tres bien. */
async function photo(request, nom, ctx) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Methode non autorisee.', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }

  // Le nom vient de l'adresse publique : un UUID suivi d'une extension
  // connue, rien d'autre. Sans ce filtre, ce chemin devient un relais
  // ouvert vers n'importe quel objet du panier.
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
    // Jamais une erreur en cache pour un an : une photo deposee juste apres
    // une faute de frappe resterait introuvable pendant douze mois.
    return new Response('Photo introuvable.', {
      status: amont.status,
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  }

  const reponse = new Response(amont.body, amont);
  reponse.headers.set('Cache-Control', UN_AN);
  reponse.headers.set('X-Servi-Par', 'cloudflare');
  reponse.headers.delete('set-cookie');

  ctx.waitUntil(cache.put(cle, reponse.clone()));
  return reponse;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/feed') {
      if (request.method !== 'POST') {
        return new Response('Methode non autorisee.', { status: 405, headers: { Allow: 'POST' } });
      }
      return fil(request, ctx);
    }

    if (url.pathname.startsWith('/img/')) {
      return photo(request, decodeURIComponent(url.pathname.slice(5)), ctx);
    }

    // Tout le reste appartient aux fichiers du site. En temps normal
    // Cloudflare les sert sans jamais reveiller ce Worker ; ce renvoi est la
    // pour que rien ne tombe dans le vide si ce n'etait pas le cas.
    return env.ASSETS.fetch(request);
  },
};

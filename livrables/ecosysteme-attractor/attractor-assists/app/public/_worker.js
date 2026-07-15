/**
 * Routeur du domaine assists.agenceattractor.com.
 *
 * Pourquoi un worker plutôt que _redirects : Cloudflare Pages transforme toute
 * réécriture (200) vers un fichier .html en redirection 308 vers l'URL « propre ».
 * Vérifié en production :
 *   - « /privacy → /privacy.html 200 » bouclait sur lui-même (défaut préexistant) ;
 *   - « /[slug] → /boutique/index.html 200 » redirigeait vers /boutique/ en
 *     perdant le slug, donc la boutique ne savait plus qui elle devait afficher.
 * Et une règle « /:slug » attrapait /app et /privacy avant leurs propres fichiers.
 *
 * Ici, on sert l'asset directement : l'URL affichée reste /[slug], sans redirection.
 *
 * La présence de ce fichier met le projet en mode « advanced » : _redirects n'est
 * plus lu, tout le routage se décide ci-dessous.
 */

// Ce qui n'est jamais un slug d'entrepreneur. Doit rester cohérent avec la table
// reserved_slugs (migration 0053), qui refuse ces noms à l'inscription.
const RESERVES = new Set([
  'app', 'privacy', 'privacy-delete', 'boutique', 'assets', 'uploads', 'b',
  'favicon.ico', 'robots.txt', 'manifest.json', 'sw.js',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png',
]);

/** Sert /boutique/ avec le slug en query, sans changer l'URL vue par le client. */
function servirBoutique(url, request, env, slug) {
  const cible = new URL(url);
  cible.pathname = '/boutique/';
  cible.searchParams.set('c', slug);
  return env.ASSETS.fetch(new Request(cible.toString(), request));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const seg = url.pathname.split('/').filter(Boolean);

    // /b/[slug] — ancien format, encore dans des liens partagés à des clients
    if (seg.length === 2 && seg[0] === 'b') {
      return servirBoutique(url, request, env, decodeURIComponent(seg[1]));
    }

    // /[slug] — le lien de boutique. Un seul segment, pas un fichier, pas une route.
    if (seg.length === 1 && !RESERVES.has(seg[0]) && !seg[0].includes('.')) {
      return servirBoutique(url, request, env, decodeURIComponent(seg[0]));
    }

    // Tout le reste : la landing (/), l'app (/app), les pages légales, les assets.
    return env.ASSETS.fetch(request);
  },
};

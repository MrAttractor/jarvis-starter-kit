/**
 * viescroiseesci.com — aperçu de partage par contenu
 *
 * Le site est une page unique. Les robots de Facebook et de WhatsApp ne lisent
 * pas le JavaScript : ils prennent les balises du fichier HTML tel qu'il est
 * livré. Sans cette brique, tous les partages sortent avec le même titre et la
 * même image, quel que soit l'article envoyé.
 *
 * Ici, quand l'adresse porte ?a=slug (article) ou ?e=slug (épisode), on lit le
 * contenu dans Supabase et on réécrit les balises og: à la volée. Un article
 * non publié ou programmé pour plus tard n'est pas lisible avec la clé publique
 * (règles de sécurité de la migration 0004), donc il ne peut pas fuiter dans un
 * aperçu.
 *
 * Règle de sûreté : toute erreur retombe sur la page servie normalement. Cette
 * brique ne doit jamais pouvoir casser le site.
 */

const SUPABASE_URL = 'https://lgdgbrivnhgeupqhkckd.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZGdicml2bmhnZXVwcWhrY2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDI1OTEsImV4cCI6MjA5NTU3ODU5MX0.kMmpwsQAUJQ6VkEpj4OOloijP1HoZbYYzbjWW2hg7Gk';

const SITE = 'Vies Croisées';
const OG_DEFAUT = '/og-default.jpg';

export default {
  async fetch(request, env) {
    const reponse = await env.ASSETS.fetch(request);
    try {
      return await personnaliser(request, reponse);
    } catch (e) {
      return reponse; // le site passe avant l'aperçu
    }
  }
};

async function personnaliser(request, reponse) {
  const url = new URL(request.url);
  const ref = url.searchParams.get('a') || url.searchParams.get('e');
  if (!ref) return reponse;

  const type = (reponse.headers.get('content-type') || '');
  if (!type.includes('text/html')) return reponse;

  const estArticle = url.searchParams.has('a');
  const contenu = await lireContenu(estArticle ? 'vc_articles' : 'vc_episodes', ref);
  if (!contenu) return reponse;

  const titre = `${contenu.titre} — ${SITE}`;
  const descr = resume(contenu, estArticle);
  const image = absolue(contenu.image_url, url);

  return new HTMLRewriter()
    .on('meta', new Metas({ titre, descr, image, url: url.origin + url.pathname + url.search }))
    .on('title', new Titre(titre))
    .transform(reponse);
}

async function lireContenu(table, ref) {
  const champs = table === 'vc_articles'
    ? 'titre,contenu,image_url,slug'
    : 'titre,description,invites,image_url,slug';

  // On interroge par slug, puis par identifiant pour les liens de la première
  // heure. La clé publique ne voit que ce qui est réellement en ligne.
  for (const filtre of [`slug=eq.${encodeURIComponent(ref)}`, `id=eq.${encodeURIComponent(ref)}`]) {
    if (filtre.startsWith('id=') && !/^[0-9a-f-]{36}$/i.test(ref)) continue;
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filtre}&select=${champs}&limit=1`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
    });
    if (!r.ok) continue;
    const lignes = await r.json();
    if (Array.isArray(lignes) && lignes.length) return lignes[0];
  }
  return null;
}

function resume(c, estArticle) {
  const brut = estArticle
    ? (c.contenu || '')
    : [c.invites, c.description].filter(Boolean).join(' — ');
  const texte = brut.replace(/\s+/g, ' ').trim();
  if (!texte) return "Vies Croisées, l'émission qui fait dialoguer les parcours de vie pour éveiller les consciences, qui met en lumière ce qui transforme une vie.";
  return texte.length > 195 ? texte.slice(0, 195).replace(/\s\S*$/, '') + '…' : texte;
}

function absolue(src, url) {
  if (!src) return url.origin + OG_DEFAUT;
  if (/^https?:\/\//i.test(src)) return src;
  return url.origin + '/' + src.replace(/^\/+/, '');
}

// Réécriture des balises existantes, sans en ajouter : le fichier HTML porte
// déjà toutes celles dont Facebook a besoin.
class Metas {
  constructor(d) { this.d = d; }
  element(el) {
    const cle = el.getAttribute('property') || el.getAttribute('name');
    const valeurs = {
      'og:title': this.d.titre,
      'twitter:title': this.d.titre,
      'og:description': this.d.descr,
      'twitter:description': this.d.descr,
      'description': this.d.descr,
      'og:image': this.d.image,
      'twitter:image': this.d.image,
      'og:url': this.d.url,
      'og:type': 'article'
    };
    // Les dimensions annoncées ne valent que pour l'image par défaut : sur un
    // visuel d'article, une taille fausse fait recadrer l'aperçu de travers.
    if ((cle === 'og:image:width' || cle === 'og:image:height') && !this.d.image.endsWith(OG_DEFAUT)) {
      el.remove();
      return;
    }
    if (cle && valeurs[cle] !== undefined) el.setAttribute('content', valeurs[cle]);
  }
}

class Titre {
  constructor(t) { this.t = t; }
  element(el) { el.setInnerContent(this.t); }
}

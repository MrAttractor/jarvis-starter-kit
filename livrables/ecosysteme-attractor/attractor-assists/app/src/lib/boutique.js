// Source unique des liens de boutique.
//
// Avant, l'URL était construite à 5 endroits sous 3 formes différentes
// (demo.agenceattractor.com/slug, assists…/b/slug, assists…/?c=slug), dont une
// sur le mauvais domaine. Le lien qu'un entrepreneur partage à ses clients ne
// peut pas dépendre de l'écran qui l'affiche.
//
// Bascule future vers un sous-domaine ([slug].boutik.ci) : une seule ligne à changer,
// ici, plus la résolution du slug dans public/boutique/index.html.

export const BOUTIQUE_BASE = 'https://assists.agenceattractor.com';

/** Le lien public de la boutique, celui que l'entrepreneur partage. */
export function boutiqueUrl(slug) {
  return slug ? `${BOUTIQUE_BASE}/${encodeURIComponent(slug)}` : null;
}

/** Même boutique, forcée dans un modèle donné, sans rien écrire en base. */
export function previewUrl(slug, template) {
  return slug ? `${boutiqueUrl(slug)}?preview=${encodeURIComponent(template)}` : null;
}

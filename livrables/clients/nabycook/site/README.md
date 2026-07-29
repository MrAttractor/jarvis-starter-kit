# Site NabyCook — Phase 1 (socle institutionnel)

Maquette fonctionnelle des 5 pages de la Phase 1, à la charte Adinkra v2.0.
Construite le 29/07/2026 par l'agence Mr Attractor.

**En ligne (maquette) :** https://demo.agenceattractor.com/nabycook-site
**Cible finale :** nabycook.com (projet Cloudflare Pages dédié, à créer)

---

## Ce qui est dans cette Phase 1

| Page | Fichier | Contenu |
|---|---|---|
| Accueil | `index.html` | Hero, 3 accès rapides, distinctions, 3 activités, chiffres d'impact, partenaires, Instagram, newsletter |
| L'Univers NabyCook | `univers.html` | Histoire de Nabintou, les deux gestes, l'héritage, la mission anti-gaspi |
| L'Association & l'Impact | `association.html` | Statut loi 1901 / ESS / ESUS, infos légales, chiffres, 3 leviers, gouvernance, partenaires, presse |
| Adhésions | `adhesions.html` | Nabycook'r 50 €/an et La Brigade du cœur dès 20 €/an, ce que ça finance, témoignages, FAQ |
| Contact & Partenariats | `contact.html` | Coordonnées, formulaire (email ou WhatsApp), parcours partenaire, Jotform magasin |

**Hors périmètre Phase 1** (voir `../PHASAGE-SITE.md`) : pages Ateliers, Traiteur, Épicerie,
Journal de bord, back-office Supabase, RGPD, formation. Ce sont les Phases 2 et 3.

---

## Le seul fichier à remplir : `assets/config.js`

Tout ce qui est variable y est regroupé : contacts, liens externes, chiffres d'impact,
partenaires, presse, témoignages, formules d'adhésion, drapeaux d'affichage.

Une valeur laissée à `A_FOURNIR` s'affiche sur le site avec un marqueur orange
« à fournir ». C'est volontaire : un emplacement vide est honnête, un chiffre inventé ne l'est pas.

---

## Checklist avant mise en ligne sur nabycook.com

À faire dans l'ordre, rien ne doit être sauté.

- [ ] Remplir `assets/config.js` avec les éléments réels de Nabintou
- [ ] Remplacer `assets/logo-nabycook.jpg` par le logo HD ou vectoriel détouré (PNG à fond transparent de préférence)
- [ ] Déposer les photos et remplacer les blocs `data-photo` par de vraies balises `<img>` avec `width` et `height`
- [ ] Passer `NABY.maquette` à `false` dans `assets/config.js`
- [ ] **Retirer la balise `<meta name="robots" content="noindex">` dans les 5 pages HTML**
      (elle n'est PAS pilotée par le fichier de configuration, c'est volontaire : un
      drapeau JavaScript ne couvre jamais le `<head>`. La console du navigateur affiche
      un avertissement si les deux ne sont pas cohérents.)
- [ ] Passer `NABY.adhesions` à `true` une fois les liens HelloAsso fournis
- [ ] Vérifier la mention fiscale : `NABY.recuFiscal` ne passe à `true` qu'après
      confirmation écrite que l'association peut émettre des reçus fiscaux
- [ ] Ajouter les mentions légales et la politique de confidentialité (Phase 3, mais
      obligatoires dès la mise en ligne publique)
- [ ] Rejouer la vérification des liens et des 6 résolutions

---

## Déploiement

**Maquette (demo-site)** — depuis `livrables/clients/demo-site/` :

```
npx wrangler pages deploy public --project-name=demo-agenceattractor --branch=master --commit-dirty=true
```

La branche de production de ce projet Pages est `master`, pas `main`.
Un déploiement sur `main` part en Preview et le domaine ne bouge pas.
Le dossier `public/nabycook-site/` est une copie de ce dossier `site/`, qui reste la source.

Une règle explicite `/nabycook-site  /nabycook-site/index.html  200` a été ajoutée dans
`public/_redirects` : sans elle, la règle catch-all `/:slug` du fichier renverrait l'URL
vers la boutique Assists.

**Production (à venir)** : créer un projet Cloudflare Pages dédié `nabycook`, brancher
le domaine nabycook.com, déployer ce dossier `site/` directement.

---

## Notes techniques

- HTML/CSS/JS natif, aucune dépendance hors les polices Google (Pacifico + Poppins)
- Mobile first, grille 8 px, zones de tap ≥ 44 px, aucun débordement horizontal
- Icônes en SVG trait, dessinées maison, inspirées des motifs adinkra. Aucun emoji.
- Le formulaire de contact n'a pas de backend : il pré-remplit un email ou un message
  WhatsApp. Aucune donnée n'est stockée, donc aucune obligation RGPD de collecte à ce stade.
- Feuille d'impression incluse (`break-inside: avoid` + `overflow: visible`)
- Les liens internes portent l'extension `.html` pour rester ouvrables en local.
  Cloudflare Pages les redirige en 308 vers l'URL propre. À la mise en ligne sur
  nabycook.com, on peut retirer l'extension pour supprimer cette redirection.

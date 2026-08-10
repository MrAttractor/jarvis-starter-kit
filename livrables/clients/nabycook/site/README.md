# Site NabyCook — Phase 1 (socle institutionnel)

Maquette fonctionnelle des 5 pages de la Phase 1, à la charte Adinkra v2.0.
Construite le 29/07/2026 par l'agence Mr Attractor.

**En ligne :** https://nabycook.pages.dev (projet Pages dédié `nabycook`, branche `main`)
**Cible finale :** nabycook.com, à brancher sur ce même projet

---

## Ce qui est dans cette Phase 1

| Page | Fichier | Contenu |
|---|---|---|
| Accueil | `index.html` | Hero, 3 accès rapides, distinctions, 3 activités, chiffres d'impact, partenaires, Instagram, newsletter |
| L'Univers NabyCook | `univers.html` | Histoire de Nabintou, les deux gestes, l'héritage, la mission anti-gaspi |
| L'Association & l'Impact | `association.html` | Statut loi 1901 / ESS / ESUS, infos légales, chiffres, ce qu'on fait, gouvernance, partenaires, presse |
| Adhésions | `adhesions.html` | Nabycook'r 50 €/an et La Brigade du cœur dès 20 €/an, ce que ça finance, témoignages, FAQ |
| Contact & Partenariats | `contact.html` | Coordonnées, formulaire (email ou WhatsApp), parcours partenaire, Jotform magasin |

**Hors périmètre Phase 1** (voir `../PHASAGE-SITE.md`) : pages Ateliers, Traiteur, Épicerie,
Journal de bord, back-office Supabase, RGPD, formation. Ce sont les Phases 2 et 3.

---

## Le seul fichier à remplir : `assets/config.js`

Tout ce qui est variable y est regroupé : contacts, liens externes, chiffres d'impact,
partenaires, photos, presse, témoignages, formules d'adhésion, drapeaux d'affichage.

Une valeur laissée à `A_FOURNIR` s'affiche sur le site avec un marqueur orange
« à fournir ». C'est volontaire : un emplacement vide est honnête, un chiffre inventé ne l'est pas.

**Rempli le 08/08/2026** avec les éléments du Drive « SITE NABYCOOK » de Nabintou :
infos légales, liens HelloAsso, Instagram, YouTube, chiffres d'impact au 30/06/2026,
partenaires confirmés, biographie.

### Déposer les photos

Aucun code à toucher. Il suffit de poser les fichiers sous ces noms exacts :

| Fichier attendu | Emplacement sur le site |
|---|---|
| `assets/photos/atelier-ambiance.jpg` | haut de la page d'accueil, paysage |
| `assets/photos/portrait-nabintou.jpg` | page Univers, vertical |
| `assets/photos/plats-et-epices.jpg` | page Univers, paysage |
| `assets/photos/atelier-entreprise.jpg` | page Association, paysage 16/9 |
| `assets/partenaires/linkee.png` | mur des partenaires |

Tant qu'un fichier est absent, l'emplacement en pointillés reste affiché : **une photo
manquante ne produit jamais d'image cassée**, le `onerror` retombe sur l'emplacement.
Même mécanisme pour les logos partenaires, qui retombent sur le nom de la structure.

Compresser avant de déposer, la cible est **moins d'un mégaoctet par image** : la
clientèle se connecte souvent en 4G.

---

## Checklist avant mise en ligne sur nabycook.com

À faire dans l'ordre, rien ne doit être sauté.

- [x] Remplir `assets/config.js` avec les éléments réels de Nabintou
- [x] Déposer les photos dans `assets/photos/` (voir le tableau ci-dessus)
- [x] Logo HD en place (`assets/logo-nabycook.png`, 1042 px)
- [ ] Obtenir un **vrai détourage** du logo. Le PNG fourni est en RGBA mais son
      fond blanc est opaque, il n'est effacé que par un `mix-blend-mode: multiply`
      dans la feuille de style. Ça tient sur le crème de l'en-tête, pas ailleurs.
- [ ] Faire **confirmer par Nabintou** que la femme en toque blanche des trois photos
      est bien elle : c'est ce que la page Univers affirme par son emplacement
- [ ] Vérifier les **autorisations de droit à l'image** des personnes reconnaissables
      sur les photos publiées (une photo du Drive portait des autocollants sur des
      visages, donc tout le monde n'avait pas donné son accord)
- [ ] Ouvrir une fois les 3 liens HelloAsso depuis un téléphone : HelloAsso bloque les vérifications automatiques, ils n'ont pas pu être testés d'ici
- [ ] Ouvrir le site sur un vrai téléphone : Chrome sans interface ne descend pas sous 504 px de large, le 375 px réel n'a pas pu être mesuré
- [ ] Confirmer les accords d'affichage de GAB Île-de-France et EE avant de les ajouter
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

**Le site a son propre projet Cloudflare Pages depuis le 10/08/2026.**
Il ne vit plus sur le demo-site. Depuis ce dossier `site/` :

```
npx wrangler pages deploy . --project-name=nabycook --branch=main --commit-dirty=true
```

La branche de production de ce projet est **`main`** (fixée à la création).
Ne pas déployer le `README.md` : le copier ailleurs et retirer le fichier avant
d'envoyer, comme pour les autres dossiers clients.

**L'ancienne adresse redirige.** `demo.agenceattractor.com/nabycook-site` et ses
sous-pages renvoient en 301 vers `nabycook.pages.dev`, règles explicites dans
`demo-site/public/_redirects`. Les liens déjà envoyés à Nabintou restent valides.
Attention à ne pas confondre avec `demo.agenceattractor.com/nabycook`, **qui reste
la page de son devis** et ne doit pas bouger.

**Bascule sur nabycook.com** (quand elle donne les accès) : déclarer le domaine en
Custom Domain dans le projet Pages `nabycook`, attendre le statut Actif, **puis
seulement** poser le CNAME en Proxied. L'ordre inverse donne une Error 522.

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

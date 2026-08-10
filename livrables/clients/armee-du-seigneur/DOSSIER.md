# Mission L'Armée du Seigneur — l'état du dossier

> Révision du 10/08/2026. **Cette fiche est la première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | attente client |
| Dernier contact | 2026-08-05 |
| Prochaine action | Annoncer le domaine propre à la Mission, avec la relance groupée des contenus |
| Échéance | — |
| Argent en attente | aucun, c'est un don assumé |

## En une phrase

**C'est un don de Mac Arthur à sa communauté**, pas une prestation facturée. Phase 1a
livrée le 13/07, **et depuis le 10/08 la Mission a son propre domaine**. En attente des
contenus de la Mission.

## Le bénéficiaire

Mission chrétienne présente en **Côte d'Ivoire et en France**, fondée le 8 janvier 2017.
Dirigeants : **Rév. Zaby Galla Josias Joseph** (CI) et **Rév. Veroly Zaby Galla** (France).

## La règle de ce dossier

**Pas de facturation, pas de devis.** Mais le travail est soigné comme un livrable
professionnel : c'est aussi une vitrine de l'agence. Ne pas laisser traîner un détail
qu'on ne laisserait pas passer chez un client payant.

## Le découpage

| Phase | Contenu | État |
|---|---|---|
| **1a** | Site vitrine public + back-office de contenu | **livré le 13/07** |
| 1b | Pilotage de la communication : 5 rôles et permissions, calendrier éditorial, workflow de validation, médiathèque, statistiques | plus tard |
| 2+ | APIs réseaux sociaux, espace membres, dons, prière, CRM missionnaire | plus tard |

## Ce qui est en ligne

| Quoi | Où |
|---|---|
| Site vitrine | **`missionarmeeduseigneur.com`** |
| Back-office | **`missionarmeeduseigneur.com/admin`** |

Compte : `admin.armee-du-seigneur@agenceattractor.com`, mot de passe temporaire
`ArmeeDuSeigneur2026!`, rebasculable sur leur vraie adresse.

## Le domaine propre, depuis le 10/08/2026

La Mission a **son propre nom**, `missionarmeeduseigneur.com`, acheté par Mac Arthur.
La zone est dans le compte Cloudflare de l'agence (nameservers `noor` et `tate`), avec
un **projet Cloudflare Pages dédié `missionarmeeduseigneur`, branche de production
`main`** (à ne pas confondre avec le demo-site, qui est en `master`, cf. R-17).

L'ancienne adresse `demo.agenceattractor.com/armee-du-seigneur` **redirige en 301**
vers le nouveau domaine, elle. Les liens déjà partagés continuent donc de marcher, y
compris ceux qui pointaient sur l'admin.

**Le code source reste dans `../demo-site/public/armee-du-seigneur/`**, comme avant.
C'est ce dossier qui se déploie, mais désormais vers le projet Pages de la Mission :

```
wrangler pages deploy . --project-name=missionarmeeduseigneur --branch=main
```

Trois choses ajoutées à l'occasion du passage sur un vrai domaine :

- **Aperçu de partage** (`og:url`, `og:image`, `canonical`) : sans ça, un lien collé
  dans WhatsApp arrive nu, or c'est le canal de la Mission. L'image d'aperçu est le
  logo, à remplacer par un vrai visuel 1200×630 quand ils en auront un.
- **Une vraie page 404.** Sans elle, Cloudflare Pages servait la page d'accueil en
  code 200 sur n'importe quelle adresse fausse : une faute de frappe ressemblait à une
  page valide et les moteurs indexaient des doublons (R-53).
- **`robots.txt` et `sitemap.xml`**, avec l'admin exclu de l'indexation.

Backend Supabase partagé, tables `als_`, RLS nominative, bucket public `als-medias`.
Migrations versionnées dans `supabase/`. **Le code du site vit dans
`../demo-site/public/armee-du-seigneur/`**, ce dossier ne garde que les migrations.

**Direction artistique propre à la Mission**, pas la charte de l'agence : bleu nuit
`#0A1730`, or `#C9A34E`, Cinzel et Inter, alternance de sections claires et sombres,
photos des dirigeants en grand format, logo en médaillon blanc.

Sections en place : accueil, vision (5 piliers), histoire, dirigeants, 11 départements,
vie de la Mission, actualités, événements, galerie, témoignages, contact France et Côte
d'Ivoire avec formulaire et WhatsApp. L'admin permet de tout modifier et de lire les
messages reçus.

## La galerie est vivante depuis le 05/08/2026

Premier contenu réel reçu de la Mission : **20 photos du 28 juillet 2026**, déposées
dans le dossier Drive `Clients / Mission Armée du Seigneur`. Deux albums en ligne,
découpés par nature du moment et non par lieu (les photos viennent de plusieurs
salles, mais le visiteur lit un culte d'un côté et un temps de communion de l'autre) :

| Album | Photos | Ce qu'on y voit |
|---|---|---|
| Culte et adoration, juillet 2026 | 15 | louange, prédication, prière et imposition des mains, prosternation, sainte cène |
| Moments de communion, juillet 2026 | 5 | danse, célébration, portraits après le culte |

Fichiers dans le bucket sous `galerie/2026-07-28/`, migration `0005`. **Rien n'a été
redéployé** : le site lit la base, les albums sont apparus seuls.

**Deux choix assumés, à corriger depuis l'admin quand la Mission répondra :**

- **Aucun nom de personne dans les légendes.** Les visages n'ont pas été identifiés
  avec certitude, et nommer quelqu'un à tort sur une page publique ne se rattrape pas.
- **Le champ « événement » est vide** : le nom exact de la rencontre n'a pas été
  communiqué, et les titres sont donc datés plutôt que nommés.

Le département **« Compassion » est devenu « Social »** (migration `0004`, demande de
la Mission). Le mot « compassion » reste ailleurs sur le site, au pilier 04 de la
vision et dans le texte d'accueil : là c'est une valeur spirituelle, pas un nom
d'organe.

## Les retours du 10/08, appliqués

Passés en direct pendant la mise en ligne du domaine, et versionnés dans
`supabase/0007_departements_et_dirigeants.sql` pour être rejouables.

| Retour | Ce qui a été fait |
|---|---|
| En-tête | « L'Armée du Seigneur » devient **« Mission L'Armée du Seigneur »**, en-tête et pied de page |
| Vision | **« Préparer le retour de Christ » passe en pilier 01**, les quatre autres décalent |
| Départements | **Médias, Évangélisation, Formation et Technique supprimés** · **Louange devient « Chantre d'Or »**. Il en reste sept |
| Fiche Rév. Veroly | La phrase qui répétait mot pour mot son bloc « Sa mission » est retirée |
| Photo d'accueil | Retour à la **photo de prédication**, retouchée |
| Aperçu de partage | La photo de prédication remplace le logo, et le texte reprend la formule complète, « Jésus-Christ » et « envers les plus faibles » |

**Les lignes supprimées sont sauvegardées** en JSON à côté des migrations. Un
département se remet en une requête si la Mission le redemande.

**La retouche de la photo, et pourquoi elle n'est pas faite par l'IA seule.**
Il fallait retirer la personne assise derrière le Révérend. Les deux passes
génératives ont chacune **réinventé des silhouettes de personnes** dans le fond,
ce qui est précisément ce qu'on voulait supprimer. Le remplissage final est
**déterministe** : le mur et la colonne sont prolongés verticalement depuis la
zone juste au-dessus, puis floutés au niveau du reste de l'arrière-plan. Rien
n'est inventé, et le Révérend n'est pas touché d'un pixel : le masque a été
découpé sur sa silhouette et contrôlé au comptage de pixels, pas à l'œil.
Leçon transférable : **sur une photo de personne réelle, une retouche générative
peut ajouter ce qu'on lui demande de retirer.** Vérifier le résultat, toujours.

La photo de prédication devient l'accueil, et **le portrait en costume passe sur
la fiche du fondateur** : sans ça, la même image apparaissait deux fois sur la page.

## Ce qu'il manque, et qui bloque

Tout vient de la Mission, rien ne dépend de l'agence :

1. Le bloc de configuration : **WhatsApp, adresses France et Côte d'Ivoire, lien Maps**
2. Les **responsables et les photos** des 11 départements
3. Les **contenus restants** : actualités, événements, témoignages
   (la galerie, elle, est amorcée)
4. La validation des **biographies des dirigeants** (ce sont des brouillons éditables)
5. Le **nom des deux rencontres du 28 juillet**, et si des personnes doivent être
   nommées dans les légendes

## Galerie et départements refondus le 05/08

Deux remarques de Mac Arthur, toutes deux justes, et une troisième chose corrigée
au passage.

**La galerie était trop petite sur ordinateur.** Deux causes. La grille des albums
était en `auto-fill` sur quatre colonnes : avec deux albums, ils se tassaient dans un
quart de la largeur. Passée en `auto-fit`, les colonnes vides se replient. Surtout,
**la lightbox n'avait aucune vue photo** : cliquer un album ouvrait une planche de
vignettes carrées de 120 px, recadrées, et il était impossible de voir une photo
entière ou sa légende. Elle a maintenant deux vues : la planche (vignettes 4/3 de
190 px) puis **la photo en grand**, jamais recadrée, avec sa légende, un compteur,
les flèches précédent / suivant, les touches ← → et Échap.

**Les départements passent de la liste en cartes cliquables**, chacune ouvrant une
fiche en modale : mission complète, responsable quand il sera renseigné, photo quand
elle existera, et un bouton « Rejoindre ce département » qui amène au formulaire de
contact avec le message déjà écrit.

**Les accents ont été remis sur tout le contenu seedé** (migration `0006`). Mettre en
avant les départements dans des cartes et une fiche tout en affichant
« Evangelisation », « Femmes Elites » et « Reverend » aurait été livrer à moitié.

**Bug corrigé au passage :** la règle globale `img{display:block}` écrasait le
`display:none` de l'attribut `hidden`, donc un département sans photo affichait un
grand cadre vide dans sa fiche. Réglé par `[hidden]{display:none!important}`.

**Validation :** 15 écrans capturés au navigateur (galerie, planche, photo,
départements, fiche) en 375, 768 et 1440 px. Aucun débordement horizontal
(`scrollWidth == clientWidth` partout).

## Prochaine action

Une seule relance, groupée, avec la liste ci-dessus. Les photos donnent enfin un
prétexte concret pour relancer : le site montre quelque chose, la Mission peut voir
le résultat et compléter le reste.

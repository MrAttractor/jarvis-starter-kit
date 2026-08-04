# Mission L'Armée du Seigneur — l'état du dossier

> Révision du 05/08/2026. **Cette fiche est la première chose à lire du dossier.**

## En une phrase

**C'est un don de Mac Arthur à sa communauté**, pas une prestation facturée. Phase 1a
livrée le 13/07 et en ligne. En attente des contenus de la Mission.

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
| Site vitrine | `demo.agenceattractor.com/armee-du-seigneur` |
| Back-office | `/armee-du-seigneur/admin` |

Compte : `admin.armee-du-seigneur@agenceattractor.com`, mot de passe temporaire
`ArmeeDuSeigneur2026!`, rebasculable sur leur vraie adresse.

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

## Ce qu'il manque, et qui bloque

Tout vient de la Mission, rien ne dépend de l'agence :

1. Le bloc de configuration : **WhatsApp, adresses France et Côte d'Ivoire, lien Maps**
2. Les **responsables et les photos** des 11 départements
3. Les **contenus restants** : actualités, événements, témoignages
   (la galerie, elle, est amorcée)
4. La validation des **biographies des dirigeants** (ce sont des brouillons éditables)
5. Le **nom des deux rencontres du 28 juillet**, et si des personnes doivent être
   nommées dans les légendes

## Un défaut relevé le 05/08, pas encore corrigé

**Tout le contenu seedé en juillet est sans accents**, alors qu'il s'affiche tel quel
au visiteur : « Reverend », « Cote d'Ivoire », « Evangelisation », « Medias »,
« Maison de la Destinee », « Femmes Elites ». Sur un site français d'une mission
chrétienne, ça se voit. La migration `0006_accents_contenu.sql` est écrite et prête,
**volontairement non appliquée** : elle ne change aucun contenu, elle ne remet que les
accents et les ligatures. En attente d'un feu vert.

## Prochaine action

Une seule relance, groupée, avec la liste ci-dessus. Les photos donnent enfin un
prétexte concret pour relancer : le site montre quelque chose, la Mission peut voir
le résultat et compléter le reste.

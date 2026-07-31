# Mission L'Armée du Seigneur — l'état du dossier

> Révision du 31/07/2026. **Cette fiche est la première chose à lire du dossier.**

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

## Ce qu'il manque, et qui bloque

Tout vient de la Mission, rien ne dépend de l'agence :

1. Le bloc de configuration : **WhatsApp, adresses France et Côte d'Ivoire, lien Maps**
2. Les **responsables et les photos** des 11 départements
3. Les **premiers contenus** : actualités, événements, galeries, témoignages
4. La validation des **biographies des dirigeants** (ce sont des brouillons éditables)

## Prochaine action

Une seule relance, groupée, avec la liste ci-dessus. Tant que ces éléments ne sont pas
là, le site reste un beau squelette.

# GetWinWorld — l'état du dossier

> Révision du 31/07/2026. **Cette fiche est la première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | en production |
| Dernier contact | 2026-08-10 (refonte catalogue livrée le 25/09, sans échange client) |
| Prochaine action | Caler le rendez-vous physique proposé par Charles (pas encore trouvé le temps). Récupérer aussi les 11,86 €. Le mensuel attend l'activation des récurrents, chantier collectif |
| Échéance | — |
| Argent en attente | 11,86 €. Le mensuel de 35 € est contractuel, pas encaissé |

## En une phrase

Client actif, livré et en production sur `getwinworld.net`. Facture réglée,
**reste 11,86 € dus** au titre du nom de domaine avancé par l'agence.

## Le client

**Charles**, personal shopper de luxe. WhatsApp **+33 6 13 05 71 38**.
Vend des pièces de luxe à une clientèle qui commande au fil des offres du jour.

## L'argent

| | |
|---|---|
| Setup | **150 €**, facture `ATR-2026-0007` **réglée** |
| Abonnement | **35 €/mois** (Formule Essentielle), 1er mois offert |
| Reste dû | **11,86 €** — remboursement du nom de domaine, avancé au prix coûtant Cloudflare |

Le tableau de bord admin et la vidéo d'accueil ont été livrés **en plus, à titre gracieux**
pour le lancement. Toute évolution future se chiffre séparément : c'est écrit, il faut le
tenir.

Le domaine est au nom de l'agence, **transférable à Charles à tout moment sur simple
demande** (clause habituelle).

## Ce qui est en ligne

| Quoi | Où |
|---|---|
| Boutique | `getwinworld.net` |
| Back-office de publication du catalogue | `getwinworld.net/admin.html` |
| Guide remis au client | `getwinworld.net/guide.html` |

Projet Cloudflare Pages dédié `getwinworld`, **branche de production `main`**.
Backend Supabase partagé, tables `gw_`. Le code source du site vit dans
`../demo-site/public/getwinworld/`, ce dossier-ci ne garde que les documents
commerciaux et une sauvegarde du catalogue.

L'ancienne adresse `demo.agenceattractor.com/getwinworld` redirige en 301 depuis le 05/07.

## Le parcours d'achat, refondu le 11/07

Avant, la demande tombait silencieusement en base et **c'était Charles qui devait faire le
premier pas**. Maintenant : la cliente choisit ses pièces, une barre de panier flottante
la suit, et le bouton **« Commander sur WhatsApp »** ouvre une conversation vers le numéro
de Charles avec le récapitulatif pré-rempli. **C'est la cliente qui engage la
conversation**, Charles n'a plus qu'à répondre pour vendre.

Le compte membre est devenu optionnel, relégué sous la sélection. Conséquence à connaître :
pour une commande sans compte, l'admin affiche `client_nom = "Client via WhatsApp"`, le
vrai contact étant dans le fil WhatsApp de Charles.

Modules en place : vitrine catalogue, suivi des commandes, espace privilèges. Le
conseiller IA a été **désactivé le 25/09** (décision de Mac Arthur), voir plus bas.

## Refonte du catalogue, 25/09 (offerte)

Demandée par Mac Arthur, livrée **sans facturation**.

- **Deux types de produits.** Une *offre du jour* est effacée définitivement 48h après
  être passée en offre, **fiche et photo**. Un produit *en stock* reste en ligne jusqu'à
  ce que Charles le supprime. Un bouton fait passer de l'un à l'autre, et le compteur
  des 48h repart à zéro quand un produit en stock redevient offre du jour.
- **La purge** est l'edge function `getwinworld-purge`, appelée toutes les 15 min par
  le job `gw_purge_offres` (colonne `offre_depuis`, migration `supabase-schema-04`).
  Elle efface aussi les photos orphelines : **68 photos** laissées par l'ancienne règle
  des 24h ont été supprimées au premier passage. L'ancien job `gw_expire_produits`
  (tout effacer à 24h, stock compris) est retiré.
- **Admin :** modifier tous les champs (photo, type, nom, prix, catégorie, maison,
  description, délai, étiquette, visible ou masqué), suppression définitive avec
  confirmation, filtres Tous / Offres / Stock, photo depuis la **galerie** ou
  l'**appareil photo**, et un affichage adapté à l'ordinateur.
- **Vitrine :** photos affichées entières dans un cadre 4:5 (les photos de Charles font
  1200×1600, elles étaient coupées en carré), grille de 2 à 4 colonnes selon l'écran,
  fiche produit en deux colonnes sur ordinateur. Les textes « 0 stock » sont corrigés.
- **Conseiller IA désactivé :** l'onglet a disparu et les boutons « Faire une demande »
  ouvrent WhatsApp. La fonction `getwinworld-chat` est toujours déployée mais n'est
  plus appelée. Pour réactiver le conseiller, il suffit de restaurer l'onglet depuis git.

## Ce qui fait foi

| Document | Fichier |
|---|---|
| Facture réglée | `FACTURE-ATR-2026-0007-GetWinWorld.html` |
| Sauvegarde catalogue du 09/07 | `BACKUP-gw_produits-2026-07-09.json` |

## Prochaine action

- **Charles propose un rendez-vous physique**, pas encore casé au 10/08/2026 faute de temps
- Récupérer les **11,86 €** restants, ou les passer en perte et le dire
- L'**abonnement à 35 €/mois** n'est **pas activé**, et ce n'est pas un oubli sur
  ce dossier : précision de Mac Arthur le 07/08/2026, **aucun récurrent ne tourne
  nulle part**, l'agence est encore en phase de mise en place du système. Le
  montant est contractuel. Son activation est un chantier collectif, pas une
  relance client à faire ici.

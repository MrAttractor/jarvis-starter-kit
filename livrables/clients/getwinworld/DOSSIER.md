# GetWinWorld — l'état du dossier

> Révision du 31/07/2026. **Cette fiche est la première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | en production |
| Dernier contact | 2026-07-11 |
| Prochaine action | Récupérer les 11,86 € et vérifier que l'abonnement à 35 €/mois tourne |
| Échéance | — |
| Argent en attente | 11,86 €, plus 35 €/mois à vérifier |

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

Quatre modules en place : vitrine catalogue, conseiller IA (Claude Haiku, branché sur le
catalogue réel, ne doit jamais inventer un produit ni un prix), suivi des commandes,
espace privilèges.

## Ce qui fait foi

| Document | Fichier |
|---|---|
| Facture réglée | `FACTURE-ATR-2026-0007-GetWinWorld.html` |
| Sauvegarde catalogue du 09/07 | `BACKUP-gw_produits-2026-07-09.json` |

## Prochaine action

- Récupérer les **11,86 €** restants, ou les passer en perte et le dire
- Vérifier que l'**abonnement à 35 €/mois** est bien activé depuis la fin du mois offert. C'est le MRR du dossier, et c'est ce qui compte le plus ici.

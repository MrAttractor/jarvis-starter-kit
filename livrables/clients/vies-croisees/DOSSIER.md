# Vies Croisées — l'état du dossier

> Révision du 31/07/2026. **Cette fiche est la première chose à lire du dossier.**

## En une phrase

Site en production sur `viescroiseesci.com`, Andréa est autonome. **Le vrai sujet n'est
plus technique : elle produit et ne publie pas.**

## Le client

**Andréa Koné**, émission « Vies Croisées » sur la transformation, la vulnérabilité et
l'authenticité. Cible : diaspora africaine et France. Projet parti de zéro, **sans aucune
audience préexistante**.

Compte de pilotage : `viescroiseesci@gmail.com`. Elle change son mot de passe elle-même.

## L'état éditorial réel, relevé le 25/07

| | |
|---|---|
| Articles écrits | **18** |
| Articles publiés | **0** |
| Épisodes en « programmé » | 4 |
| Abonnés | 0 |
| Témoignages | 0 |
| Commentaires | 0 |

**C'est le seul chiffre qui compte dans ce dossier.** L'outil fonctionne, il est vide.
Piste proposée et non encore tranchée avec elle : programmer ses 14 chroniques à raison
d'une par semaine, pour amorcer sans qu'elle ait à décider chaque semaine.

## L'argent

Aucun montant n'est tracé dans ce dossier. Le domaine a été acheté par Mac Arthur via
Cloudflare et la zone vit dans le compte de l'agence. **À clarifier** : ce qui a été
facturé, ce qui reste dû, et si un abonnement mensuel doit être activé.

## Ce qui est en ligne

| Quoi | Où |
|---|---|
| Site public | `viescroiseesci.com` (+ www, SSL Cloudflare) |
| Espace de pilotage d'Andréa | `viescroiseesci.com/?pilotage` (les 5 taps sur le logo restent en secours) |

Projet Cloudflare Pages dédié `viescroiseesci`, **branche de production `main`**.
Backend Supabase partagé, tables `vc_`. L'ancien lien `demo.agenceattractor.com/vies-croisees`
redirige en 301.

**Source du code : `../demo-site/public/vies-croisees/`.** Ne déployer que les fichiers
utiles (`index.html`, `logo.png`, `og-default.jpg`, `partenaires/`, `_worker.js`), **jamais
la proposition de vente qui vit dans le même dossier**.

## Ce que le site sait faire

- Épisodes et articles avec **programmation réelle** : avant l'heure, la ligne n'est pas lisible avec la clé publique. Ce n'est plus une étiquette sans effet comme dans la première version.
- **Teasers multiples** par épisode, **visuels** (affiche + photo avec l'invité), réduits côté navigateur
- **Partage réseaux** : un `slug` figé par contenu, adresses `?a=` et `?e=`, et un Worker qui réécrit les balises de partage pour que l'aperçu soit correct
- Bandeau **partenaires** non cliquables
- Espace admin : publication, partenaires, modération des commentaires, boîte témoignages et abonnés

## Deux corrections de sécurité déjà passées

1. La table qui stockait le mot de passe **en clair** a été supprimée (migration 0003). L'authentification passe par Supabase Auth, les policies sont scopées à son UID.
2. La détection du mode pilotage cherchait une **sous-chaîne** dans l'URL : tout visiteur dont l'article partagé contenait « andrea » se voyait proposer la connexion admin. Corrigé le 25/07, la détection ne lit plus que les paramètres exacts.

## Prochaine action

**Traiter le sujet éditorial avec elle, pas la technique.** Lui proposer un calendrier de
publication simple et l'aider à appuyer sur le bouton. Et clarifier ce qui a été facturé.

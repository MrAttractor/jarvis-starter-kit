# Ayêla SARL — l'état du dossier

> Révision du 31/07/2026. **Cette fiche est la première chose à lire du dossier.**

## En une phrase

Livré et en production sur `lamaisonayela.com`. Lorraine est autonome sur son
catalogue, son stock, ses points de vente et, depuis le 31/07, ses promotions.

## Le client

**Lorraine**, CEO d'Ayêla SARL, Abidjan. +225 07 48 84 45 13 (WhatsApp, Orange Money,
Wave). Liqueurs et cocktails prêts-à-boire premium, made in Côte d'Ivoire.
Signature : « L'amour des saveurs, l'élégance du terroir africain ».
Catalogue : 7 créations, 12 références avec les pockets 100 ml.

## L'argent

Ce n'est pas une vente classique : **partenariat par échange**. L'agence livre la
vitrine et le tableau de bord, Lorraine recommande l'agence dans son réseau
(bars, hôtels, restaurants, épiceries, réseau Petro Ivoire), donne une vidéo
témoignage et de la visibilité.

| | |
|---|---|
| Forfait technique (domaine + hébergement, à son nom) | **55 000 FCFA / 80 €** |
| Encaissé au 19/07 | 40 000 FCFA |
| **À vérifier** | le solde de 15 000 FCFA est-il rentré ? La fiche de contexte et la mémoire divergent sur ce point. |
| Valeur réelle du build | estimée 1,8 à 3 millions FCFA |

Le vrai gain attendu n'est pas l'argent, c'est **l'ouverture du réseau Petro Ivoire**
comme pipeline de prospects.

## Ce qui est en ligne

| Quoi | Où |
|---|---|
| Vitrine cliente | `lamaisonayela.com` |
| Tableau de bord CEO | `lamaisonayela.com/admin` (compte `Sonialorraine3@gmail.com`, elle a changé son mot de passe elle-même) |
| Guide de prise en main | `lamaisonayela.com/guide` |
| Portail d'une gérante de boutique | `lamaisonayela.com/b/<code>`, sans mot de passe, limité à son point de vente |

Code source dans `app/`. Backend Supabase partagé, tables préfixées `ay_`,
9 migrations versionnées (`app/schema.sql` à `schema-09.sql`), RLS nominative sur
l'UUID de Lorraine.

## Deux pièges à connaître

1. **La branche de production du projet Cloudflare Pages `lamaisonayela` est `master`,
   pas `main`.** Un déploiement sur `main` part en Preview, le domaine ne bouge pas, et
   l'alias `pages.dev` semble pourtant à jour. Commande correcte, depuis ce dossier :
   `npx wrangler pages deploy app --project-name=lamaisonayela --branch=master`.
   **Toujours vérifier sur le domaine réel, jamais sur l'alias.**
2. **Wave et Orange Money sont des liens de collecte, pas une passerelle.** Aucun
   rapprochement automatique : Lorraine vérifie encore la réception à la main. Le vrai
   paiement en ligne reste une évolution à vendre.

## Prochaine action

- Vérifier le solde de 15 000 FCFA du forfait technique
- Récupérer la **vidéo témoignage** et un cas d'usage chiffré : c'est la contrepartie du partenariat, et elle n'est pas encore encaissée
- Corriger le guide client, qui affiche encore son mot de passe initial alors qu'elle l'a changé
- À construire quand elle le voudra : le concept d'attraction du Club (bienvenue, parrainage, tirage)

## Évolutions payantes identifiées, hors périmètre livré

Agenda du Salon d'Ayêla, vrai paiement en ligne (XPaye), application installable,
notifications WhatsApp automatiques.

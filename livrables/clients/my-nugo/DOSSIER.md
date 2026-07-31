# MY NUGO — l'état du dossier

> Révision du 31/07/2026. **Cette fiche est la première chose à lire du dossier.**

## En une phrase

Boutique en production sur `mynugo.store`. **Elle tourne sur un catalogue écrit en dur
dans la page** : la bascule vers la base de données n'a jamais été terminée.

## Le client

**Maimounata Kouma épouse Effi**, mode africaine, Côte d'Ivoire.
Collection 2026 : 22 pièces.

## Le point qui compte

Le code de la boutique est prêt à lire un **catalogue en base**, mais la migration n'a
jamais été finie. Le site fonctionne aujourd'hui grâce à un **repli sur 22 produits écrits
dans la page**. Conséquence concrète : **la cliente ne peut rien changer seule**, chaque
modification passe par l'agence.

Deux façons de finir, à trancher :

1. **Brancher sur le projet Supabase partagé** (tables préfixées `nug_`), comme tous les
   autres dossiers depuis la consolidation du 08/07. C'est la voie cohérente aujourd'hui.
2. L'ancienne piste d'un projet Supabase dédié, qui date d'avant la consolidation, est à
   abandonner : le compte est limité à 2 projets actifs en tier gratuit.

Le fichier `supabase-schema.sql` de ce dossier est prêt à être adapté.

Il existe aussi un tableau de bord admin séparé (dépôt `MrAttractor/mynugo-dashboard`),
lui aussi à connecter.

## Ce qui est en ligne

| Quoi | Où |
|---|---|
| Boutique | `mynugo.store` |
| Page stock événement | `stock-expo.html` |
| Guide WhatsApp | `wa-guide.html` |

Hébergement **Cloudflare Pages, projet `mynugo-store`, branche de production `main`**
(migré depuis Netlify, crédits épuisés). DNS `mynugo.store` sur Cloudflare, CNAME racine
vers `mynugo-store.pages.dev`.

## L'argent

Aucun montant n'est tracé dans ce dossier. **À clarifier** : ce qui a été facturé, ce qui
reste dû, et si un abonnement mensuel est actif.

## Le dernier événement traité

Expo-Vente Défilé de **Lyon le 11/07/2026** (150 Cours Gambetta, partenaire Carrefour des
Cultures Africaines) : encart, compte à rebours, message WhatsApp pré-rempli et trailer
vidéo de 58 s compressé de 80 à 14 Mo.

**L'événement est passé.** L'encart doit être retiré ou remplacé par le suivant, sinon la
boutique affiche une date morte.

## Prochaine action

1. **Retirer ou remplacer l'encart de l'événement de Lyon**, qui est passé
2. Décider si on finit la bascule en base pour la rendre autonome, et le chiffrer
3. Clarifier ce qui a été facturé sur ce dossier

# MY NUGO — l'état du dossier

> Révision du 31/07/2026. **Cette fiche est la première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | à trancher |
| Dernier contact | 2026-08-02 |
| Prochaine action | Clarifier ce qui a été facturé, puis décider si on finit la bascule en base |
| Échéance | — |
| Argent en attente | rien de tracé |

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

## Les événements éphémères, désormais pilotés par un interrupteur

L'Expo-Vente de **Lyon du 11/07/2026** est restée affichée trois semaines après la date,
avec un compte à rebours qui annonçait « En cours » en permanence.

**Corrigé le 02/08/2026.** Le bloc événement est maintenant piloté par un seul objet
`EVENEMENT` en tête du script de `index.html` :

```js
var EVENEMENT = {
  actif: false,          // true = l'encart s'affiche, false = il disparaît entièrement
  titre: '...', dateTexte: '...', dateISO: '...',  // cible du compte à rebours
  horaires, lieu, partenaire, affiche, teaser, poster, waTexte
};
```

Pour annoncer le prochain événement : remplir les champs, passer `actif` à `true`, déposer
l'affiche et le teaser dans `images/`, redéployer. Pour l'arrêter : repasser à `false`.
Plus rien n'est écrit en dur, ni dans le compte à rebours, ni dans le message WhatsApp.

Le bloc est **masqué en dur dans le HTML** (`style="display:none"`) et n'est affiché que
par le script : si le JavaScript échoue, l'événement ne réapparaît pas tout seul.

## Prochaine action

1. Décider si on finit la bascule en base pour la rendre autonome, et le chiffrer
2. Clarifier ce qui a été facturé sur ce dossier

# Attractor Assists — l'état du produit

> Révision du 31/07/2026. **Cette fiche est la première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | en pause |
| Dernier contact | 2026-08-06 |
| Prochaine action | Aucune. La reprise est conditionnée, voir « La mise en pause » plus bas |
| Échéance | — |
| Argent en attente | — |

## En une phrase

**Le produit est réparé, il n'est pas rempli.** Le tunnel s'enchaîne enfin de bout en
bout depuis le 15/07, mais 2 personnes seulement l'ont terminé.

## Les chiffres réels, relevés en base le 15/07

| | |
|---|---|
| Inscrits | 37 |
| **Onboardings terminés** | **2** (Mac Arthur et Marie Kezey) |
| Conversations | 5 |
| Abonnements | **0** |
| Commandes | 1 (un test) |

Les 35 autres sont des testeurs de mai, remis à zéro par une migration et jamais revenus.
**Ne plus jamais écrire « 25 testeurs actifs »** : c'était faux.

## Ce que c'est

Pas un chatbot, pas un CRM, pas une app métier. **La duplication numérique de Mac Arthur** :
un bras droit qui soulage l'entrepreneur des tâches quotidiennes et l'aide à devenir
numéro un dans son couloir.

**Un cerveau unique, deux surfaces, deux promesses** : côté entrepreneur « je te vide la
tête », côté client final « je prends ta commande de A à Z ».

**Le principe architectural central** : chaque entrepreneur a son propre CLAUDE.md
construit dynamiquement = son profil + sa mémoire + ses modules actifs + la base de
connaissance ATTRACTOR fixe. L'anamnèse remplit son profil en conversationnel.

## Ce qui est en ligne

| Adresse | Ce que c'est |
|---|---|
| `assists.agenceattractor.com/` | landing publique qui vend le produit |
| `/app` | l'application entrepreneur (installable) |
| `/[slug]` | le lien de boutique canonique, `/b/[slug]` conservé pour les liens déjà partagés |

React + Vite + Tailwind + Supabase, hébergé sur Cloudflare Pages (projet
`assists-agenceattractor`). Connexion par code à 6 chiffres reçu par email.

**Piège de routage connu** : Cloudflare Pages transforme toute réécriture vers un `.html`
en redirection, ce qui perdait le slug. Le routage passe donc par `public/_worker.js` en
mode avancé, et `scripts/postbuild.mjs` réorganise le build. Ne pas revenir à un
`_redirects`.

## Le critère d'acceptation, et il n'est pas atteint

> Le tunnel doit produire une boutique **au moins équivalente à `boutiquecreal.com`**,
> que Mac Arthur a dû coder à la main pour Kezey.

Le jour où c'est vrai, l'usine tourne et Kezey peut basculer sur le produit standard.

## Ce qui manque pour passer à l'échelle

- **La facturation récurrente n'est pas automatique** : XPaye ne gère pas le prélèvement mensuel. C'est le blocage structurel du modèle d'abonnement.
- **Zéro test automatisé** sur le projet, et aucun test de charge
- L'anamnèse de Kezey est vide, et son catalogue contient 3 doublons visibles par ses clientes depuis juin

## Prochaine action

**Recruter 3 premiers utilisateurs en test accompagné** et regarder où ils décrochent.
Profil cible : catalogue simple, déjà habitué à vendre par WhatsApp. Les 35 testeurs de
mai ne reviendront pas d'eux-mêmes.

C'est un travail de terrain, pas de code. Tant qu'il n'est pas fait, ajouter des
fonctionnalités ne sert à rien.

## La mise en pause, décidée le 06/08/2026

**Décision de Mac Arthur.** Le produit n'est pas abandonné, il cesse de consommer des
heures qui manquent ailleurs.

**Ce qui l'a déclenchée, ce sont les chiffres de ce dossier, pas une lassitude :**
37 inscrits, **2 onboardings terminés dont Mac Arthur lui-même**, 5 conversations,
**0 abonnement**. Et le critère d'acceptation écrit plus haut, produire une boutique au
moins équivalente à `boutiquecreal.com`, n'est pas atteint.

**Ce que la pause veut dire concrètement :**

- Plus aucune heure de développement sur ce produit
- L'application reste **en ligne et fonctionnelle**, on ne débranche rien
- Les inscrits existants ne sont pas prévenus : rien ne change pour eux
- La veille quotidienne des 9 piliers est **désactivée** (elle ne servait qu'à ce produit)

**Les deux conditions de reprise, et il en faut une seule :**

1. **Un entrepreneur va au bout du tunnel et vend avec**, sans que Mac Arthur tienne la
   main. Ce serait la preuve que le produit tient debout seul.
2. **La ligne des apps métier finance son développement**, c'est-à-dire un récurrent
   vérifié qui couvre le temps passé.

Tant qu'aucune des deux n'est vraie, ce dossier ne remonte pas dans le brief du matin.

**Ce qui reste valide et ne se perd pas :** la mission fondatrice, le concept V3, le
principe du CLAUDE.md dynamique, et tout ce qui est écrit dans `concept-v3.md`. La pause
porte sur le temps investi, pas sur la vision.

## Chantiers ouverts

Ils vivent sous ce produit et n'ont pas de dossier propre. **Sans cette liste, ils
n'apparaissent nulle part.**

| Chantier | État | Prochaine action |
|---|---|---|
| **Cockpit Pilotage** | en place et peuplé | Brancher la signature sur le pipeline, pour qu'un document signé déclenche le reçu |
| **Roland V2** (coach + discipline) | cadré dans `../notes/CADRAGE-ROLAND-V2.md` | Construire les actions et les rendez-vous d'agenda |
| **Correctifs V3** | liste à préciser | Simplifier `agentGating.js` |

## Les documents du dossier

| Quoi | Fichier |
|---|---|
| Concept V3, source de vérité produit | `concept-v3.md` |
| Décisions produit et décisions actées | `decisions-produit.md`, `decisions-actees.md` |
| Idées capturées, à évaluer au bon moment | `idees-pipeline.md` |
| Design system | `design-system.md` |
| Application | `app/` |

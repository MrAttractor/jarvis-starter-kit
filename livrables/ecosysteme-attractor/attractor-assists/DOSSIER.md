# Attractor Assists — l'état du produit

> Révision du 31/07/2026. **Cette fiche est la première chose à lire du dossier.**

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

## Les documents du dossier

| Quoi | Fichier |
|---|---|
| Concept V3, source de vérité produit | `concept-v3.md` |
| Décisions produit et décisions actées | `decisions-produit.md`, `decisions-actees.md` |
| Idées capturées, à évaluer au bon moment | `idees-pipeline.md` |
| Design system | `design-system.md` |
| Application | `app/` |

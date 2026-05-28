---
name: maquette-closer
description: Transforme une conversation avec un prospect en maquette d'application cliquable aux couleurs du client, prête à présenter via un simple lien web (fini l'enregistrement d'écran d'un fichier HTML brut). Utilise cette skill dès que Mac Arthur parle d'un prospect, d'un client à convaincre, d'une démo ou d'une maquette à préparer, même s'il ne dit pas explicitement le mot "maquette". Exemples de déclencheurs : "j'ai un nouveau prospect dans la restauration", "prépare une démo pour Olive", "montre-lui à quoi ressemblerait son app", "maquette pour [client]", "/maquette-closer". C'est le mécanisme de vente "maquette-first" prouvé de l'agence Mr Attractor : montrer une maquette concrète déclenche l'intérêt et le closing.
---

# Maquette-Closer

## Pourquoi cette skill existe

Le mécanisme de vente le plus efficace de l'agence est simple et prouvé sur le terrain : pendant un échange avec un prospect, lui montrer une maquette concrète de SON application déclenche l'intérêt et le closing, là où un discours seul échoue. Un client accompagné pendant 4 ans a acheté le jour où il a vu une maquette.

Cette skill industrialise ce mécanisme. Elle doit produire deux choses, vite :
1. Une maquette cliquable et crédible, aux couleurs du client.
2. Un moyen de la présenter proprement, c'est-à-dire un lien web, jamais un fichier HTML brut envoyé tel quel.

Le point de douleur à éliminer : avant, Claude générait un fichier HTML que Mac Arthur n'osait pas envoyer, donc il filmait son écran. Ce n'est pas vendeur. La maquette doit devenir un lien que le prospect ouvre sur son téléphone et qu'il peut toucher.

Garde en tête en permanence : c'est un outil de CLOSING, pas un projet de développement. L'objectif est de déclencher un "oui" et un acompte, pas de livrer l'app finale. Reste rapide, crédible, simple.

## Étape 1 — Brief express

Avant de coder, il faut le strict nécessaire. Extrais d'abord tout ce que tu peux de la conversation en cours (le prospect a souvent déjà été décrit). Ne pose ensuite que les questions qui manquent, une à la fois, pour ne pas casser le rythme.

Informations à réunir :
- **Nom du client et du projet/app** (et un nom d'appli accrocheur si pas encore défini).
- **Secteur et cible** : à qui s'adresse le service, qui sont ses clients.
- **Problème n°1** que l'app résout pour lui.
- **Promesse en une phrase** (ce que le client gagne).
- **3 à 5 écrans/fonctions clés** seulement. Pas plus : une maquette de closing reste simple.
- **Couleurs de marque** : si un logo ou un site est fourni, extrais-en les couleurs toi-même. Sinon, demande la couleur principale, ou propose une palette adaptée au secteur et fais valider.
- **Logo** si disponible.
- **Ton** (pro, chaleureux, premium, jeune...).

Si le client ne sait pas, propose des valeurs par défaut crédibles pour son secteur et avance. Mieux vaut une maquette à ajuster qu'une page blanche.

## Étape 2 — Construire la maquette

Pars du gabarit fourni : `assets/template-maquette.html`. C'est une maquette mobile-first autonome, déjà mise dans un cadre de smartphone, avec une navigation par onglets qui fonctionne, et des variables CSS pour les couleurs. Copie-le et remplis-le.

Règles de qualité, parce que c'est ce qui fait la différence entre "joli" et "ça déclenche l'achat" :
- **Mobile-first**, dans le cadre téléphone du gabarit. Les clients regardent sur leur téléphone, et une app dans un cadre de smartphone fait "vraie app".
- **Couleurs du client** via les variables CSS `--brand` et `--brand-2` en haut du fichier. Change uniquement ces variables pour habiller toute la maquette d'un coup.
- **Contenu réaliste en français**, jamais de "lorem ipsum". Mets de vrais noms de plats, de vrais quartiers, de vrais montants, des prénoms locaux. Le prospect doit se reconnaître immédiatement.
- **3 à 5 écrans navigables** maximum, reliés par la barre d'onglets du bas.
- **Une âme qui parle à la cible** : utilise des situations concrètes du métier du client. Si pertinent, intègre des visuels de personnes (générées par IA) qui incarnent les situations décrites, pour créer de l'émotion et de la projection.
- **Soigné mais sobre** : un bon dégradé, des cartes, des boutons d'action clairs. Pas de surcharge.

Garde le fichier 100% autonome (CSS et JS inline, pas de dépendance externe qui pourrait casser hors ligne ou une fois hébergé).

Détails sur le gabarit et comment l'adapter : voir `references/presentation.md`.

## Étape 3 — Rendre la maquette présentable (le lien)

Ne jamais livrer le `.html` brut. Transforme-le en lien. Trois niveaux, du plus rapide au plus pro. Le détail des manipulations est dans `references/presentation.md`.

1. **Immédiat (zéro configuration)** : publier l'artefact directement depuis claude.ai (bouton Publier) pour obtenir un lien partageable, ou déposer le fichier sur un hébergeur statique gratuit (Netlify Drop, Cloudflare Pages). Lien prêt en moins d'une minute.
2. **Pro (recommandé à terme)** : héberger sur un sous-domaine de l'agence, par exemple `demo.agenceattractor.com`. Le prospect voit une démo hébergée par Mr Attractor : crédibilité maximale. À configurer une seule fois côté DNS, puis chaque maquette devient un lien.
3. **Effet waouh** : le gabarit affiche déjà la maquette dans un cadre de smartphone, ce qui suffit la plupart du temps. Sur grand écran, ce cadre fait la démonstration tout seul.

Choisis le niveau selon le temps disponible et l'importance du prospect.

## Étape 4 — Kit de closing

La maquette ne vend pas seule, c'est Mac Arthur qui vend avec. Fournis-lui systématiquement, en plus du lien :

- **Un script de présentation court** (3 à 5 phrases) qui suit cette logique : rappeler le problème du prospect, montrer comment l'app le résout, pointer 1 ou 2 écrans clés, puis proposer l'étape suivante.
- **L'étape suivante claire et chiffrée** : ce que le prospect obtient s'il dit oui, le prix, et l'acompte pour démarrer. Toujours finir sur une action concrète, pas sur "dis-moi ce que tu en penses".

Modèle de script :

```
[Prénom], tu m'as dit que ton problème c'est [problème]. Regarde, voilà à quoi
ressemblerait ton application : [lien]. Ouvre-la sur ton téléphone.

Sur le premier écran, tes clients [action clé]. Ici, toi tu vois [bénéfice].

Pour lancer ta version, c'est [prix], avec [acompte] pour démarrer cette semaine.
On bloque un créneau pour récupérer tes infos et je te livre le MVP sous [délai] ?
```

## Garde-fous

- Reste un outil rapide. Si tu passes trop de temps, tu as raté l'objectif.
- Ne promets jamais dans la maquette des fonctions impossibles à livrer ensuite. Ce que tu montres doit pouvoir être construit.
- Toujours finir par le lien + le script + l'étape suivante. Une maquette sans appel à l'action ne close pas.

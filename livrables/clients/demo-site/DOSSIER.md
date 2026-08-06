# demo-site — l'état du dossier

> Révision du 31/07/2026. **Cette fiche est la première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | infrastructure |
| Dernier contact | — |
| Prochaine action | Rien d'urgent, c'est de l'hébergement mutualisé |
| Échéance | — |
| Argent en attente | — |

## Ce que c'est

**Ce n'est pas un client.** C'est l'hébergement mutualisé de tous les mini-sites de
l'agence : maquettes de closing, devis en ligne, sites livrés qui n'ont pas encore de
domaine propre. Un dossier par client dans `public/`, une adresse en deux minutes.

Adresse : **`demo.agenceattractor.com`**

## Comment on déploie, et les deux pièges

Depuis ce dossier :

```
npx wrangler pages deploy public --project-name=demo-agenceattractor --branch=master
```

**Piège n°1 — le Worker homonyme.** Un Worker du même nom existe dans le compte
Cloudflare, relié seulement à son `.workers.dev`. **Ne jamais utiliser `wrangler deploy`
seul ici** : le déploiement dit « réussi » et rien ne change sur le vrai domaine. Piège
découvert le 01/07/2026, une demi-journée perdue.

**Piège n°2 — la branche.** La branche de production de ce projet Pages est **`master`**,
pas `main`. Un `--branch=main` part en Preview sans erreur visible et ne touche jamais le
domaine. En cas de doute :
`npx wrangler pages deployment list --project-name=demo-agenceattractor`.

**Règle générale : toujours vérifier sur le domaine réel, jamais sur l'alias `pages.dev`.**

## Ce qu'il héberge aujourd'hui

157 fichiers dans `public/`, dont les sites de : armee-du-seigneur, beynaud,
all-eyes-on-yoo, yiriba, nabycook-site, romuald-ndoua, air-cote-divoire, pilotage,
vies-croisees, getwinworld, creal, innovation-creative (redirigé), ethsun,
template-executive-edu.

**Attention aux dossiers mixtes.** Certains contiennent à la fois le site du client **et**
la proposition de vente qui lui est destinée : ne déployer que les fichiers utiles. Cas
connu : `vies-croisees/`, dont la proposition commerciale ne doit jamais partir en ligne.

## Les redirections

Le fichier `public/_redirects` gère les 301 des anciens liens vers les domaines propres
(getwinworld.net, boutiquecreal.com, viescroiseesci.com, aicreatioon.com). **À mettre à
jour à chaque fois qu'un client passe sur son propre domaine.**

## À ne pas confondre

| Adresse | Ce que c'est |
|---|---|
| `demo.agenceattractor.com` | ici, les mini-sites statiques |
| `assists.agenceattractor.com` | l'application Attractor Assists (React) |

## Prochaine action

Rien d'urgent. Deux dossiers à surveiller quand ils bougeront : `air-cote-divoire/`, dont
la page de proposition décrit encore le modèle abandonné le 31/07, et les résidus Netlify
et Vercel (`.netlify/`, `.vercel/`) qui n'ont plus de raison d'être.

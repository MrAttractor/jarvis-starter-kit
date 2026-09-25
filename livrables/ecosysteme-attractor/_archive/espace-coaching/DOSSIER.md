# Espace Coaching — l'état du dossier

> Fiche créée le 11/08/2026. **Première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | en ligne, non branché sur son domaine |
| Dernier mouvement | 2026-08-11 |
| Prochaine action | Déclarer `coaching.agenceattractor.com` dans le projet Pages, puis le CNAME chez GoDaddy |
| Échéance | avant la première séance avec la cliente test |
| Argent en attente | — |

## En une phrase

L'outil qui porte le **tunnel d'accompagnement** de bout en bout, de la demande
expresse jusqu'à l'autonomie, harmonisé sur la méthode de consultance de
l'agence. Il sert d'abord au test avec une première cliente, puis à l'offre de
coaching annoncée le 15 octobre.

## Les adresses

| Quoi | Où |
|---|---|
| Espace du coach | `coaching.agenceattractor.com` *(à brancher)*, en attendant `coaching-attractor.pages.dev` |
| Questionnaire de la personne | la même adresse suivie de `/q?j=<jeton>` |
| Projet Cloudflare Pages | `coaching-attractor`, **branche de production `main`** |
| Base | projet Supabase partagé, tables préfixées `pm_` |

## Le tunnel

```
demande → séance découverte → engagement → phase 1 → phase 2 → phase 3 → clôture → suivi
```

Une porte par étape. **L'étape suivante refuse de s'ouvrir tant que la porte
n'est pas franchie, et la règle est en base, pas dans l'écran.**

## Ce qui fait foi

| Document | Fichier |
|---|---|
| Le plan du tunnel | `~/.claude/plans/distributed-marinating-muffin.md` |
| Socle de base | `supabase/0001_pm_socle.sql` |
| Référentiel du questionnaire | `supabase/0002_pm_reference.sql`, **généré**, jamais écrit à la main |
| Notification de fin de questionnaire | `supabase/0003_pm_notification.sql` |
| Outil d'extraction | `outils/extraire-cle.mjs` |
| Espace du coach | `public/index.html` |
| Questionnaire | `public/q.html` |
| Cadre invariant de séance | `scripts/00-CADRE-DE-SEANCE.md` |
| Script séance découverte | `scripts/01-SEANCE-DECOUVERTE.md` |
| Script séance 1 | `scripts/02-SEANCE-1.md` |
| Contrat | `../certification-preparation-mentale/CONTRAT-COACHING-v2.md` |
| Méthode d'accompagnement | `../certification-preparation-mentale/CERVEAU.md` |

## Trois choses à ne pas oublier

**La clé de dépouillement se régénère, elle ne se corrige pas.** Elle est
dérivée des formules du classeur de l'Académie par `outils/extraire-cle.mjs`,
qui refuse de produire quoi que ce soit si les 135 items ou les 15 par type ne
tombent pas. Si l'école corrige son classeur, on relance l'outil, on rejoue
`0002`, et c'est tout.

**La grille de dépouillement n'est pas dans l'ordre des types.** Sa première
colonne compte le type 8, la deuxième le type 9, puis 1 à 7. Un dépouillement
à la main se trompe sans jamais lever d'alerte. C'est la raison d'être du
calcul automatique.

**La durée de conservation est écrite à deux endroits et doit rester la même.**
Vingt-quatre mois dans la base, qui déclenche l'effacement automatique, et
vingt-quatre mois à l'article 11 du contrat. Si l'une change, l'autre change
le même jour, sinon la promesse ment.

## Ce qui reste

1. Déclarer le domaine personnalisé **dans le projet Pages**, puis seulement
   après, le CNAME `coaching` vers `coaching-attractor.pages.dev` chez GoDaddy.
   L'ordre inverse donne une erreur 522.
2. Ouvrir les deux pages dans un navigateur, puis **sur un vrai téléphone**.
   Rien n'a encore été vu à l'écran.
3. Remplir les blancs du contrat, dont l'assureur et le médiateur, ou retirer
   ces articles. Une clause à trous vaut moins qu'une clause absente.
4. Demander à l'Académie ce qu'est « l'association » à qui son modèle de
   contrat prévoit d'envoyer un exemplaire nominatif.

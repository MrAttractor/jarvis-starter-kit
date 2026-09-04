# Espace Coaching — l'état du dossier

> Fiche créée le 11/08/2026. **Première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | en mise en service, recette d'écran passée |
| Dernier mouvement | 2026-09-04 |
| Prochaine action | Déployer les corrections, puis suivre `MISE-EN-SERVICE.md` de l'étape 2 à l'étape 5 |
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
| Espace du coach | `coaching.agenceattractor.com` *(CNAME posé et résolvant vers Cloudflare le 04/09 ; reste à confirmer que le domaine est déclaré dans le projet Pages, sinon 522)*, sinon `coaching-attractor.pages.dev` |
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
| **La marche à suivre pour ouvrir** | `MISE-EN-SERVICE.md` |
| Recette d'écran, à rejouer avant tout déploiement | `tests/README.md`, `tests/recette.mjs` |
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

Le détail, avec les cases à cocher, est dans `MISE-EN-SERVICE.md`. En résumé :

1. **Déployer** les corrections du 04/09 (`wrangler pages deploy`, branche
   `main`), après avoir rejoué la recette d'écran.
2. **Confirmer le domaine.** Le CNAME est posé et résout. Reste à vérifier que
   `coaching.agenceattractor.com` est déclaré dans le projet Pages : sans cette
   déclaration, l'adresse répond 522.
3. **Le voir sur un vrai téléphone**, en particulier le questionnaire, et
   couper la 4G au milieu pour vérifier la reprise. C'est écrit, ce n'est pas
   encore observé.
4. **Assurance RC pro et adhésion à un médiateur.** Ces deux lignes du contrat
   ne se remplissent pas au clavier, elles supposent une souscription. Sans
   elles, l'article 13 se retire, et l'adhésion au médiateur reste obligatoire
   avant le premier encaissement auprès d'un particulier.
5. **Demander à l'Académie** ce qu'est « l'association » à qui son modèle de
   contrat prévoit d'envoyer un exemplaire nominatif.

## Ce qui a bougé le 04/09/2026

- Recette d'écran créée dans `tests/`. 12 scènes × 6 résolutions. Elle passe.
- Trois défauts attrapés et corrigés dans `public/index.html` : 14 boutons
  secondaires à 40 px au lieu de 44, les 8 cases du contrôle final à 42 px, et
  « Se déconnecter » mal placé sous 400 px. Aucun débordement horizontal nulle
  part, aucune erreur JavaScript.
- Contrat : l'en-tête annonçait « Certifié en préparation mentale ». Le
  résultat de la soutenance du 3 septembre n'est pas connu, la ligne est passée
  à « **Formé à** la préparation mentale », vraie dans tous les cas.

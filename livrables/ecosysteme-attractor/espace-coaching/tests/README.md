# La recette d'écran de l'espace coaching

## À quoi elle sert

Les deux pages sont parties en ligne sans jamais avoir été ouvertes dans un
navigateur. Le `DOSSIER.md` le disait : « rien n'a encore été vu à l'écran ».

Une vérification faite une fois à la main ne protège de rien, parce qu'elle
n'est pas rejouée au déploiement suivant. Celle-ci l'est, et elle bloque sur ce
que la section 12 du `UX_SYSTEM.md` rejette automatiquement.

## Ce qu'elle vérifie

Douze scènes, aux six résolutions du `UX_SYSTEM` (375, 390, 414, 768, 1024,
1440), soit 72 écrans par passage.

| Contrôle | Règle |
|---|---|
| Débordement horizontal | UX_SYSTEM section 3, rejet automatique. Le coupable exact est nommé dans le rapport |
| Zone de tap sous 44 × 44 px | UX_SYSTEM section 9. Une case à cocher est mesurée sur son étiquette, pas sur la case |
| Champ de saisie sous 16 px | UX_SYSTEM section 11. En dessous, iOS zoome tout seul au focus et l'écran se décale |
| Erreur JavaScript | Aucune tolérée, y compris en console |

## Ce qu'elle ne vérifie pas

**La base n'est jamais interrogée.** Les réponses de Supabase sont simulées.

C'est délibéré, pour deux raisons. L'objet de cette recette est l'écran : la
règle des portes, les jetons et la purge se vérifient en base, pas au pixel. Et
le projet Supabase contient de vraies notes de coaching : une recette
automatique ne doit pas pouvoir y écrire de fausses personnes accompagnées.

Ne comptez donc pas sur elle pour dire que le tunnel fonctionne. Elle dit que
l'écran tient.

## Lancer

```bash
cd tests
npm i
npm run recette           # contrôles seuls, sortie en une page
npm run recette:photos    # + 72 captures dans tests/captures/
```

Les captures ne sont pas versionnées, elles se régénèrent.

Si Chromium est déjà présent sur la machine et que `npx playwright install`
n'est pas souhaitable, désignez-le :

```bash
PW_CHROMIUM=/chemin/vers/chromium npm run recette
```

## Quand la lancer

**Avant chaque `wrangler pages deploy`.** C'est le seul moment où elle sert.
Une recette qu'on lance après la mise en ligne ne fait que documenter un
problème déjà en production.

## Journal des défauts attrapés

| Date | Défaut | Correction |
|---|---|---|
| 2026-09-04 | 14 boutons secondaires à 40 px de haut au lieu de 44, dont « Supprimer la séance » et « Marquer tenue », côte à côte dans la même barre | `.btn.petit` passé à `min-height:44px` |
| 2026-09-04 | Les 8 cases du contrôle final : étiquette à 42 px de haut sur une question courte | `.coche` passé à `min-height:44px` |
| 2026-09-04 | « Se déconnecter » aligné à gauche sous le titre en dessous de 400 px | `margin-left:auto` sur `.lien-plat` |

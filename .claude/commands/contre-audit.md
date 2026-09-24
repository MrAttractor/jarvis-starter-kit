# /contre-audit

> Lance la relecture adverse d'une décision gelée, avant lancement ou mise en production sensible.
> Usage : `/contre-audit decisions/2026-09-paiement-mobile-money.md`

---

## Mission

Quand je lance `/contre-audit <chemin du dossier de décision>`, exécute cette séquence.

### Étape 1 : Vérifier que la décision est relecturable

Lis le dossier de décision fourni. Refuse de lancer la relecture si l'une de ces
conditions n'est pas remplie, et dis-moi laquelle :

- La section « La décision » est remplie et affirmative (pas « on envisage »).
- La section « Les hypothèses » contient au moins trois lignes chiffrées.
- La section « Ce qui se passe si on s'est trompé » est remplie.
- La section « Où regarder » pointe vers des fichiers qui existent.

Une décision floue produit une relecture floue. On ne lance pas.

### Étape 2 : Lancer l'avocat du diable en contexte neuf

Lance l'agent `avocat-du-diable` avec, et seulement avec :

- le contenu du dossier de décision,
- l'accès en lecture au code du projet.

**Ne lui transmets pas** notre conversation, ni les raisons pour lesquelles je trouve
cette décision bonne, ni les contre-arguments déjà écartés. Il doit arriver vierge,
sinon il se range à l'avis déjà formulé.

### Étape 3 : Vérifier les trouvailles avant de me les montrer

Pour chaque trouvaille rendue, contrôle toi-même dans le code :

- l'ancrage existe-t-il vraiment (le fichier, la ligne, l'absence de test) ?
- le scénario d'échec est-il possible en l'état du code, ou a-t-il déjà une protection ?

Marque chaque trouvaille **CONFIRMÉE** ou **NON CONFIRMÉE — [ce que tu as trouvé à la place]**.
Ne supprime rien : je veux voir aussi ce qui a été écarté et pourquoi.

### Étape 4 : Me rendre le résultat

```
Contre-audit — [titre de la décision]
[n] bloquantes · [n] majeures · [n] mineures · [n] non confirmées

[Les trouvailles confirmées, de la plus grave à la moins grave]

[Les non confirmées, en fin de liste, avec le motif]

Zone d'ombre : [ce qui n'a pas pu être vérifié, et ce qu'il faudrait]
```

### Étape 5 : Préparer l'arbitrage

Remplis la colonne « Trouvaille » et « Gravité » du tableau d'arbitrage de la section 7
du dossier de décision. Laisse « Verdict » et « Motif » vides : c'est moi qui tranche.

Ne modifie aucune autre section du dossier.

---

## Ce que cette commande ne fait pas

- Elle ne corrige rien. Aucun code n'est touché.
- Elle ne me dit pas si la décision est bonne. Elle me dit par où elle casse.
- Elle ne se relance pas sur ses propres corrections : après correction, c'est un
  **nouveau** dossier de décision et une **nouvelle** relecture, en contexte neuf.

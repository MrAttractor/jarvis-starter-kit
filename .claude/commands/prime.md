# /prime

> Commande pour démarrer une nouvelle session avec contexte complet.

---

## Mission

Quand je lance `/prime` au début d'une session, exécute la séquence suivante :

### Étape 1 : Charger le contexte local

Lis dans cet ordre, en intégralité :
1. `CLAUDE.md` (le fichier racine du workspace)
2. `cerveau/CERVEAU.md` (le point d'entrée du cerveau master : protocoles)
3. `cerveau/03-REGLES.md` (ce qu'on applique, sans redemander)
4. `context/CONTEXT.md` (mon contexte personnel et professionnel)
5. `context/HISTORY.md` (l'historique de mes sessions précédentes)

`cerveau/02-EXPERIENCES.md` et `cerveau/01-DOCTRINE.md` ne se lisent pas au démarrage, ils
se consultent au besoin pendant la session, ou via `/cerveau [sujet]`.

### Étape 2 : Relire ce qui a été produit pour anticiper

Scanne la structure `livrables/` pour avoir une vue complète de ce qui existe déjà :
- `livrables/clients/` : toutes les apps métiers livrées ou en cours par client
- `livrables/ecosysteme-attractor/` : les apps internes (Assists, Pilotage, Fidelys, etc.)
- `livrables/commercial/` : supports de vente, devis, maquettes closing

Pour chaque livrable identifié, croise avec HISTORY.md pour détecter :
- Ce qui est **livré et déployé** (rien à faire)
- Ce qui est **en suspens** (commencé mais pas terminé ou pas testé)
- Ce qui a une **suite logique** non encore engagée (prochain chantier naturel)
- Ce qui a des **bugs connus** ou retours clients non traités

L'objectif n'est pas de lister tout ce qui existe, mais de dégager les **points chauds** : ce sur quoi il y a de la valeur à reprendre ou à faire avancer.

### Étape 3 : Résumer ta compréhension

Présente-moi un résumé clair et synthétique en suivant cette structure :

```
Bonjour Mac Arthur, j'ai chargé ton contexte. Voici ce que je vois :

**Qui tu es**
- [Synthèse en 2-3 lignes du profil]

**Tes objectifs court terme**
- [Top 3 des objectifs en cours]

**Ce qu'on a déjà produit**
- [Liste des livrables actifs par client/projet, avec statut court]

**Points chauds à anticiper**
- [2 à 4 sujets qui ont une suite logique ou un chantier en suspens]

**Dernière session**
- [Si HISTORY.md contient une entrée récente, la résumer en 2-3 lignes]

Je suis prêt. Que veux-tu faire aujourd'hui ?
```

### Étape 4 : Attendre les instructions

Ne lance aucune action de toi-même. Attends que je te donne le sujet de la session.

---

## Règles importantes

- Si certains fichiers sont vides ou incomplets, signale-le et propose de les remplir
- Si tu détectes une incohérence entre les fichiers, signale-le calmement
- Ne fais pas de suppositions sur ce qu'on doit faire aujourd'hui, attends mes instructions
- Le résumé doit être en français et utiliser le tutoiement
- Pas de tirets longs (em dashes) dans tes réponses
- Ne pas aller chercher le CRM Notion ni le pipeline clients : l'état des dossiers est dans CONTEXT.md et HISTORY.md

# /prime

> Commande pour démarrer une nouvelle session avec contexte complet.

---

## Mission

Quand je lance `/prime` au début d'une session, exécute la séquence suivante :

### Étape 1 : Charger le contexte local

Lis dans cet ordre, en intégralité :
1. `CLAUDE.md` (le fichier racine du workspace)
2. `context/CONTEXT.md` (mon contexte personnel et professionnel)
3. `context/HISTORY.md` (l'historique de mes sessions précédentes)

### Étape 2 : Charger le CRM Notion

Lis le CRM Notion pour avoir l'état réel et à jour du pipeline :
- Page CRM : https://app.notion.com/p/37a4257524c681e6a510c98e53210ffe
- Fetch la base Dossiers (collection://e6f8bb59-bee7-47d6-b8c0-69bf92de00a2)
- Extraire : tous les dossiers actifs (statut != Perdu / Clôturé), leur statut, prochaine action, montants

Si le CRM n'est pas accessible, signale-le et utilise les infos de CONTEXT.md à la place.

### Étape 3 : Résumer ta compréhension

Présente-moi un résumé clair et synthétique en suivant cette structure :

```
Bonjour [Prénom], j'ai bien chargé ton contexte. Voici où on en est :

**Qui tu es**
- [Synthèse en 2-3 lignes du profil]

**Tes objectifs court terme**
- [Top 3 des objectifs en cours]

**Pipeline actif (depuis Notion)**
- [Liste des dossiers actifs avec statut et prochaine action]

**Projets internes actifs**
- [Liste des projets en cours hors clients]

**Dernière session**
- [Si HISTORY.md contient une entrée récente, la résumer]

Je suis prêt à t'aider. Que veux-tu faire aujourd'hui ?
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

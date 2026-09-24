# Décision — [titre court]

> Ce dossier est l'**entrée unique** de l'avocat du diable. Il est gelé avant la relecture :
> on ne le modifie plus tant que le contre-audit n'est pas rendu.
> Temps de rédaction visé : 20 minutes. Au-delà, c'est que la décision n'est pas mûre.

**Date de gel :** [AAAA-MM-JJ]
**Auteur :** [prénom]
**Portée :** [le module, le parcours, le projet concerné]
**Échéance :** [la date après laquelle revenir en arrière coûte cher]

---

## 1. La décision, en trois phrases maximum

[Ce qui a été décidé. Affirmatif. Pas de « on envisage de ».]

---

## 2. Pourquoi celle-là

[Le raisonnement réel, y compris les raisons non techniques : délai client, coût,
compétence de l'équipe. Les cacher ne les fait pas disparaître, ça empêche juste
de les attaquer.]

---

## 3. Les alternatives écartées

| Option | Pourquoi écartée |
|---|---|
| | |
| | |

---

## 4. Les hypothèses sur lesquelles ça repose

[Une par ligne, chiffrée quand c'est possible. C'est la section que l'avocat du diable
attaque en premier, donc c'est celle qui mérite le plus d'honnêteté.]

- Volume attendu : [x utilisateurs simultanés, y transactions/jour]
- Latence tolérée : [z ms]
- Fiabilité supposée des tiers : [prestataire de paiement, hébergeur, API externe]
- Compétence disponible dans l'équipe : [qui sait maintenir ça]
- [autre]

---

## 5. Ce qui se passe si on s'est trompé

**On s'en aperçoit comment, et au bout de combien de temps ?**
[…]

**On en sort comment, et en combien de temps ?**
[…]

**Ce que ça coûte :** [argent, données perdues, jours de travail]

---

## 6. Où regarder

- Fichiers concernés : […]
- Branche ou commit gelé : […]
- Ce qui est déjà testé : […]
- Ce qui n'est pas testé et qu'on sait : […]

---

## 7. Arbitrage — rempli APRÈS la relecture adverse

| # | Trouvaille | Gravité | Verdict | Motif | Qui / Quand |
|---|---|---|---|---|---|
| 1 | | | Retenu / Écarté / Différé | | |
| 2 | | | | | |

**Règle :** aucune trouvaille ne sort du tableau sans un motif écrit.
« Écarté » sans motif se lit « ignoré », et c'est exactement ce qu'on cherche à éviter.
Les trouvailles BLOQUANTES retenues se règlent avant le lancement, sans exception.

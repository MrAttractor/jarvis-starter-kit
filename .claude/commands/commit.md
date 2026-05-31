# /commit

Crée un commit avec un message intelligent basé sur les changements en staging.

**Sécurité** : La commande refuse de commiter si un fichier `.env` est en staging.

## Comportement

1. Vérifie que `.env` n'est pas en staging
2. Affiche les changements prêts à être commités
3. Propose un message de commit basé sur les changements
4. Exécute le commit

## Utilisation

```
/commit
```

Claude va analyser les changements et te proposer un message. Tu peux l'accepter ou le modifier.

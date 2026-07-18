# Process de vente — Agence Mr Attractor

> Source de vérité du pipeline commercial. Chaque prospect passe par ces étapes dans l'ordre.
> Barème officiel : `.claude/skills/devis-express/references/bareme.md`

---

## Vue d'ensemble du pipeline

```
Détection → Qualification → Maquette → Devis → Closing → Acompte → Production → Livraison
```

---

## ÉTAPE 1 — Détection

**Déclencheur :** prospect identifié (inbound site, recommandation, réseau, direct)

**Ce que tu fais :**
- Créer le dossier dans le CRM Notion (base Dossiers)
- Statut : `Nouveau`

**Infos minimales à saisir immédiatement :**
- Nom / prénom
- WhatsApp ou email
- Comment il est arrivé (inbound, réseau, cold)
- Zone (CI ou France)
- Ce qu'il veut en une phrase

---

## ÉTAPE 2 — Qualification

**Objectif :** comprendre le besoin, décider quelle famille, identifier les blocages.

**Ce que tu fais :**
- Envoyer le message de qualification WA (template ci-dessous)
- Mettre le statut CRM : `En contact`

**Infos à collecter obligatoirement :**
| Info | Pourquoi |
|------|----------|
| Secteur d'activité | Choisir le bon template maquette |
| Nombre d'utilisateurs de l'outil | Niveau Famille A (SOLO / ÉQUIPE / ENTERPRISE) |
| Problème principal à résoudre | Argumentaire de valeur |
| Délai souhaité | Urgence = levier de closing |
| Budget indicatif | Qualifier avant de passer du temps |
| Zone de facturation | EUR ou FCFA |

**Message WA — Premier contact**
```
Bonjour [Prénom] !

Merci de m'avoir contacté. Pour bien comprendre ton projet et te proposer quelque chose d'adapté, j'ai besoin de quelques infos :

1. Ton activité en 2 phrases ?
2. L'outil que tu veux créer, c'est pour toi seul ou pour une équipe ?
3. Quel est le problème principal que cet outil doit résoudre ?
4. Tu as une idée de ton budget ?

Je reviens vers toi rapidement avec une proposition concrète.

Mac Arthur / Mr Attractor
```

---

## ÉTAPE 3 — Maquette

**Objectif :** montrer avant de chiffrer. La maquette déclenche l'intérêt et réduit l'objection prix.

**Ce que tu fais :**
- Préparer la maquette via `/maquette-closer` (splash vendeur + app cliquable + closing.html)
- Déployer sur `demo.agenceattractor.com/[client]`
- Envoyer le message de présentation maquette (template ci-dessous)

**Infos supplémentaires à collecter pour la maquette :**
- Nom de l'outil / de l'app
- Couleurs souhaitées ou direction design
- Logo si disponible
- 2-3 fonctionnalités clés qu'il veut voir

**Message WA — Envoi maquette**
```
Bonjour [Prénom],

Comme promis, j'ai préparé une première version de ce que pourrait donner ton app.

Voici le lien : demo.agenceattractor.com/[slug]

C'est une maquette interactive — tu peux cliquer et naviguer. Elle te donne une idée du rendu final avec tes couleurs et ton contenu.

Dis-moi ce que tu en penses. Si l'idée te plaît, je te prépare un chiffrage complet.

Mac Arthur
```

---

## ÉTAPE 4 — Devis

**Objectif :** chiffrer précisément, créer l'engagement.

**Ce que tu fais :**
- Classifier : Famille A (app) / Famille B (consulting) / Famille C (SaaS)
- Appliquer le barème officiel
- Produire le PDF devis (template ci-dessous)
- Mettre le statut CRM : `Devis envoyé`
- Saisir Setup HT et MRR dans le CRM

**Message WA — Envoi devis**
```
Bonjour [Prénom],

Suite à notre échange et à la maquette, voici le devis détaillé pour ton projet [Nom du projet].

Référence : ATR-2026-XXXX
Setup : [montant] €
Abonnement mensuel : [montant] €/mois
Délai de livraison : [X semaines]

Le devis est valable 15 jours. Si tu as des questions ou si tu veux ajuster le périmètre, dis-moi.

Pour démarrer : acompte de 50% ([montant] €) à la commande.

Mac Arthur
```

---

## ÉTAPE 5 — Closing & Relances

**Objectif :** transformer le devis en bon de commande signé.

**Relance J+2 (si pas de réponse)**
```
Bonjour [Prénom],

Je voulais m'assurer que tu avais bien reçu le devis. Tu as des questions sur le périmètre ou le prix ?

Je suis disponible pour un appel rapide si tu veux qu'on en parle.
```

**Relance J+5**
```
Bonjour [Prénom],

Le devis ATR-2026-XXXX est valable encore [X] jours. Je voulais te laisser le temps de réfléchir sereinement.

Si le budget est un frein, on peut regarder ensemble comment découper le projet en phases pour démarrer avec moins.

Tu me dis ?
```

**Relance J+10 (dernière)**
```
Bonjour [Prénom],

Le devis expire dans 5 jours. Si le projet est toujours d'actualité, c'est le bon moment pour confirmer.

Si ce n'est pas le bon timing, pas de souci — je garde le dossier et on peut reprendre quand tu es prêt.
```

---

## ÉTAPE 6 — Acompte & Bon de commande

**Ce que tu fais :**
- Envoyer la facture d'acompte (50% du setup)
- Envoyer le bon de commande pour validation du scope
- Mettre le statut CRM : `Acompte reçu` dès paiement confirmé

**Message WA — Confirmation et démarrage**
```
Bonjour [Prénom],

Excellent ! Je t'envoie deux documents :
1. La facture d'acompte : [montant] € (50% du setup)
2. Le bon de commande : il récapitule le périmètre exact. Confirme par retour de message que tu valides.

Dès réception de l'acompte, on démarre. Délai estimé : [X semaines].

Moyens de paiement :
- France : Wero / Revolut / PayPal @Myattractor (+33 7 53 90 23 23)
- CI : Wave / MTN Money / Orange Money (+225 05 76 87 70 70)

Mac Arthur
```

---

## ÉTAPE 7 — Production

**Ce que tu fais :**
- Démarrer le développement
- Point hebdomadaire client (WhatsApp ou appel)
- Partager les livrables intermédiaires (maquettes, liens de test)

**Message WA — Point hebdo**
```
Bonjour [Prénom],

Point de la semaine sur [Nom du projet] :

✓ Fait : [liste]
En cours : [liste]
Prochain jalon : [date]

Des retours ou des ajustements ? Je suis dispo.
```

---

## ÉTAPE 8 — Livraison & Solde

**Ce que tu fais :**
- Livrer le lien final + accès
- Envoyer la facture solde (50% restant)
- Mettre le statut CRM : `Livré`
- Demander un témoignage

**Message WA — Livraison**
```
Bonjour [Prénom],

Ton application est prête !

Lien de production : [URL]
Accès admin : [si applicable]
Guide de prise en main : [lien ou joint]

Je t'envoie également la facture de solde : [montant] €.

Avant de clore le dossier, j'aurais besoin d'un retour de ta part — même court — sur ton expérience avec l'agence. C'est précieux pour moi.

Merci de ta confiance.
Mac Arthur
```

---

## Documents officiels

Voir les templates dans ce même dossier :
- `template-devis.md` — structure du devis
- `template-facture-acompte.md` — facture 50%
- `template-facture-solde.md` — facture solde
- `template-bon-de-commande.md` — validation scope
- `template-contrat.md` — contrat complet (Famille A/D, projets structurants), inclut la clause de transfert de nom de domaine (Art. 11)

---

## Règles non négociables

- Jamais de prix hors barème sans validation explicite de Mac Arthur
- Toujours présenter une maquette avant le devis pour un projet Famille A
- Acompte 50% obligatoire avant tout démarrage
- Scope verrouillé dans le bon de commande — toute évolution = avenant
- Numérotation devis/factures : `ATR-AAAA-NNNN` (incrémental)
- Mention légale obligatoire : "TVA non applicable, article 293 B du CGI"

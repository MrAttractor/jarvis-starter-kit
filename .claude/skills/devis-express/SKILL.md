---
name: devis-express
description: Produit un devis professionnel à la marque Mr Attractor à partir d'infos brutes, en s'appuyant sur le barème de référence (pas de prix fixé à la volée). Utilise cette skill dès que Mac Arthur veut chiffrer ou formaliser une offre pour un client ou prospect, même sans dire le mot "devis" : "chiffre-moi l'app de X", "fais le devis pour [client]", "combien je facture pour...", "client Y veut une app de réservation, 4 écrans, paiement Wave". Vient juste après maquette-closer dans la chaîne de vente. Le prix sort du barème, jamais de l'improvisation, c'est ce qui enlève à Mac Arthur la charge de fixer un tarif sous pression.
---

# Devis-Express

## Pourquoi cette skill existe

Mac Arthur l'a dit clairement : sa force n'est pas le closing ni le suivi chiffré, c'est la pub et le marketing. Fixer un prix face au client le met mal à l'aise et il se sous-vend. Cette skill enlève ce point faible en rendant le prix **mécanique** : il envoie les infos brutes du besoin, le **barème** décide, le devis sort propre et constant.

Place dans la chaîne de vente : `maquette-closer` (donne envie) → **`devis-express`** (formalise et rassure) → acompte (cash).

## Source de vérité : le barème

Lis toujours `references/bareme.md` avant de chiffrer. Il contient les familles d'offres, les tarifs (EUR et FCFA), l'identité légale, les moyens de paiement et les règles (validité, acompte, numérotation). En cas de doute sur un prix, c'est ce fichier qui fait foi, jamais une grille trouvée ailleurs.

## Étape 1 — Récupérer les infos brutes

Idéalement, reprends le périmètre de la maquette déjà faite avec `maquette-closer`. Sinon, il te faut, au minimum :
- le **client** (nom, contact, lieu) ;
- le **type de besoin** (app/système, conseil, autre) ;
- le **périmètre** (nombre d'écrans/fonctions, nombre d'utilisateurs, backend ou non, intégrations comme paiement mobile ou WhatsApp) ;
- la **zone** (détermine la devise EUR ou FCFA).

Si une seule info bloque la classification (par exemple le nombre d'utilisateurs, qui décide SOLO vs ÉQUIPE), pose UNE question ciblée. Sinon, avance.

## Étape 2 — Classer et chiffrer via le barème

Applique la logique de classification de `references/bareme.md` :
1. Famille (A app/système, B consulting, C Assists freemium non chiffré).
2. Niveau pour la Famille A (SOLO / ÉQUIPE / ENTERPRISE).
3. Add-ons selon les intégrations citées.
4. Devise selon la zone.

Calcule le total, l'acompte (50 % par défaut, ajustable) et le solde. Choisis un numéro `ATR-AAAA-NNNN`.

## Étape 3 — Générer le devis

Pars du gabarit `assets/template-devis.html`, qui est déjà au format A4 imprimable avec l'identité légale et la mention "TVA non applicable, article 293 B du CGI" en pied de page. Remplace les `{{...}}`. Ajoute une ligne de tableau par prestation ou add-on.

Enregistre le devis rempli dans `context/import/devis/devis-<client>-<numero>.html`.

**Présentation en PDF** : le client doit recevoir un PDF, pas un fichier HTML. Méthode simple et fiable : ouvrir le fichier dans le navigateur, puis Imprimer > Enregistrer au format PDF (A4). Indique-le clairement à Mac Arthur.

## Étape 4 — Suivi et message d'envoi

- **Suivi** (recommandé) : consigner le devis dans un Google Sheet dédié (onglet DEVIS) via le connecteur Drive : numéro, client, montant, date, statut (envoyé / accepté / payé). Cela permet à Mac Arthur de ne plus perdre le fil, ce qui est justement sa difficulté. Si le Sheet n'existe pas encore, proposer de le créer.
- **Message d'envoi** : rédiger un court message (email ou WhatsApp) qui accompagne le devis, rappelle la valeur et l'étape suivante (acompte pour démarrer). Toujours proposer pour validation : **ne jamais envoyer à la place de Mac Arthur sans son feu vert explicite.**

## Garde-fous

- Le prix vient du barème, jamais de l'improvisation. Si le besoin ne rentre dans aucune case, le dire et demander, plutôt que d'inventer un tarif.
- Famille C (Attractor Assists) : freemium, ne pas produire de devis chiffré tant que la refonte n'a pas fixé les tarifs.
- Vérifier que l'identité légale (SIRET, statut, mention TVA) est correcte sur chaque devis.
- Ne jamais envoyer le devis au client sans validation de Mac Arthur.

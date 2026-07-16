# Parcours client automatisé jusqu'au devis

> Objectif : sortir Mac Arthur du travail d'opérateur (construire un devis, le mettre en ligne, l'envoyer) sans sacrifier le close humain qui fait signer sa cible CI/diaspora.
> Décidé le 16/07/2026 après le cas Yiriba Nature. Deux voies selon la taille du deal.

---

## Le principe : deux voies, un aiguilleur

L'aiguilleur, c'est la **qualification du diagnostic** (`famille` + `niveau`), qui existe déjà. Selon ce qu'elle détecte, le prospect part sur l'une des deux voies.

### Voie rapide (self-service) — petits deals
- **Cible** : Famille A, niveau **App simple** (250 €, prix fixe, hébergement 1 an offert). Pas de combo, pas de contrepartie, pas de plafond d'heures à arbitrer.
- **Parcours** : le prospect remplit le formulaire → il voit **immédiatement, à l'écran, son diagnostic ET son devis** (pas d'attente, pas de coup de fil). Il valide sur place → `devis-accept` notifie Mac Arthur.
- **Ton rôle** : zéro, jusqu'à la notification d'acceptation. Tu interviens seulement pour encaisser et lancer.
- **Pourquoi c'est sûr** : la marge d'une App simple ne paie pas ton temps de closing. Un prix fixe ne peut pas être mal chiffré. Le devis s'affiche dans le résultat du formulaire, on n'auto-envoie pas de WhatsApp à un numéro non vérifié (moins de risque spam/erreur).

### Voie accompagnée — combos et gros deals
- **Cible** : tout le reste. App pro / pro+, EAGLE, combos (app + accompagnement), partenariats en nature, Famille D.
- **Parcours** : le prospect remplit → tu reçois l'email de qualif + un **devis brouillon déjà pré-chiffré au barème** dans Pilotage → tu closes au téléphone (ta zone de génie) → tu ajustes le brouillon en 1 clic → le lien de devis part.
- **Ton rôle** : le close humain reste. Ce qui disparaît, c'est le montage du devis à la main (aujourd'hui une session de dev entière).

---

## État réel des briques (ce qui existe, débranché)

| Brique | Fait | Manque |
|--------|------|--------|
| `diagnostic` (edge function) | Qualifie, crée prospect + dossier Pilotage + notif email + message WA pré-rédigé | Ne renvoie pas de devis au prospect |
| `generate-devis` (edge function) | Chiffre au barème, accepte un `dossier_id`, sort des chiffres en base | N'est branché sur rien ; ne produit pas de page de devis |
| Template devis `/yiriba`, `/fleur` | Moteur de rendu piloté par un bloc CONFIG, POST vers `devis-accept` | Le CONFIG est codé à la main à chaque fois |
| `devis-accept` (edge function) | Capte l'acceptation, notifie | — |

**L'insight** : au lieu de coder le CONFIG à la main, `generate-devis` génère ce CONFIG, et **une seule page hébergée le lit par numéro** (`demo.agenceattractor.com/d/ATR-2026-XXXX`). Le jour où c'est branché, plus personne ne code jamais une page de devis.

---

## Les 3 bloquants à corriger avant de brancher l'auto-devis (voie accompagnée)

1. **Barème désynchronisé** : `bareme.md` et la copie en dur `BAREME_SYSTEM` de `generate-devis` divergent (EAGLE « 10h/2 mois » vs « 8 semaines » ; section Mr Attractor Films absente). L'auto-devis chiffre sur une grille obsolète.
2. **Numérotation qui collisionne** : `generate-devis` fait `count+1` sur ses tables et ignore les devis faits main (0005, 0007, 0008, 0009, 0010) → il réattribue des numéros déjà signés. Problème comptable.
3. **Acompte 50 % figé** : incompatible avec un paiement en 3 tranches (cas Yiriba).

---

## La dépendance qu'on ne peut pas sauter (voie accompagnée)

La voie accompagnée chiffre des **combos**, et le barème actuel modélise des produits séparés. Il n'a aucune règle pour composer A+B, valoriser une contrepartie en nature, ni borner les heures. **Tant que cette règle n'existe pas, l'auto-devis sortira des prix faux sur les combos.** C'est le sujet de la réunion « sur l'entreprise » du dimanche 21h, et c'est le prérequis n°1 de la voie accompagnée.

**La voie rapide n'a PAS cette dépendance** (prix fixe App simple) → livrable indépendamment, tout de suite.

---

## Séquence

1. **Maintenant** : construire la **voie rapide** (self-service App simple). Indépendante de la règle de prix. Le formulaire affiche le devis App simple à l'écran quand la qualif = Famille A / niveau simple.
2. **Dimanche 21h** : établir la règle de packaging et de prix (combos, contreparties, plafond d'heures).
3. **Ensuite** : corriger les 3 bloquants + encoder la règle dans le barème et `generate-devis`.
4. **Enfin** : brancher la **voie accompagnée** (`diagnostic → generate-devis → page /d/[numero]`, lien injecté dans l'email + le message WA que tu envoies).

---

## Ce que le parcours ne fait pas (honnêteté)

- Il ne remplace pas ton close sur les vrais deals. Sur ta cible, la relation humaine fait signer ; l'auto n'y toucherait que pour les petits tickets où ton temps ne se rentabilise pas.
- La qualité du devis auto suit la qualité de l'input du formulaire (garbage in, garbage out). Le champ `famille` est déjà sorti « ? » sur Yiriba alors que le reste était bon : à fiabiliser avant d'aiguiller sur cette base.

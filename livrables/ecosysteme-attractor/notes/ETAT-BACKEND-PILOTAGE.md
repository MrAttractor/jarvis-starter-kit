# État des lieux — Backend de pilotage de l'agence

> Fait le 17/07/2026 à la demande de Mac Arthur (« je n'ai pas vraiment de backend pour piloter l'agence concrètement »). Relevé en base, pas d'impression.

## Ce qui existe et tourne (chiffré)

L'app **Pilotage** (`demo.agenceattractor.com/pilotage`, 2 306 lignes) est un vrai cockpit : onglets Pipeline et Devis, et elle lit des tables Finances, Charges, Enveloppes budgétaires, Projets, Focus, Cap.

Données réelles en base au 17/07 :

| Table | Lignes | Ce que c'est |
|---|---|---|
| `pilotage_pipeline` | 15 | Dossiers prospects/clients suivis |
| `pilotage_enveloppes` | 11 | Enveloppes budgétaires |
| `pilotage_focus` | 6 | Priorités / focus |
| `pilotage_finances` | 5 | Lignes financières |
| `pilotage_projets` | 4 | Projets |
| `pilotage_devis` | 4 | Devis suivis dans le cockpit |
| `prospects` | 5 | Prospects (table du tunnel) |
| `diagnostics` | 4 | Diagnostics du formulaire |
| `devis_web` | 1 | Acceptations de devis en ligne |
| `propositions` | 0 | (le devis interactif dynamique, jamais utilisé) |

**Conclusion : tu AS un backend, et il est peuplé. Ce n'est pas une coquille vide.** Le problème est ailleurs.

## Pourquoi tu ne le « sens » pas comme un backend de pilotage

1. **Les boucles ne sont pas fermées (motif session 101).** Le diagnostic crée bien des dossiers pipeline (15), mais les devis que je construis à la main (Yiriba, Nabycook, la facture DMV) sont des fichiers HTML/PDF autonomes : **ils n'entrent jamais dans le cockpit** (`propositions` = 0, `devis_web` = 1, `pilotage_devis` = 4 mais déconnectés des devis réels). Tu génères un devis, il disparaît du système. Tu pilotes donc à côté de ton propre outil.
2. **Pas de source de vérité unique.** Tes clients vivent dans `CONTEXT.md`, tes factures en fichiers, tes devis en HTML, tes prospects en base. Pour savoir où tu en es, tu croises quatre endroits plus ta tête.
3. **Rien ne te dit « ta prochaine action ».** Le cockpit montre l'état, pas quoi faire ensuite sur chaque dossier. Or piloter, c'est décider de la prochaine action, pas juste regarder.

## La cible : un back-office = source de vérité unique

Un endroit où tu vois, d'un seul écran : mes prospects, mes devis en cours, mes clients actifs, qui me doit quoi, ce que j'encaisse, et **ma prochaine action** sur chaque dossier. Tout y entre automatiquement (diagnostic → devis → acceptation → facture → client).

## Propositions d'automatisation, phase par phase

### Phase 1 — Fermer la boucle devis (rapide, gros gain)
Quand un devis est généré (le futur constructeur), il crée automatiquement sa ligne dans le cockpit, reliée au dossier. `devis-accept` met déjà à jour le pipeline et envoie le PDF signé. La chaîne **diagnostic → dossier → devis → accepté → PDF signé** devient visible de bout en bout.
- **Gain :** tu ne perds plus jamais un devis, tu vois l'état de chaque offre sans chercher.

### Phase 2 — Le cockpit financier + coach de discipline (spec consolidée 17/07/2026)
Reformulée avec les précisions de Mac Arthur. Fondation posée : colonne `dossier_id` ajoutée à `pilotage_finances`. Quatre modules :

1. **Déclaration simple des entrées, y compris informelles.** Au démarrage, beaucoup de deals se font via WhatsApp avec son réseau perso, hors tunnel formel. Il faut une saisie en un geste (« +175 € Nabyntou, acompte ») que Mac Arthur déclare. Il va discipliner et déclarer ses entrées.
2. **Le système SUGGÈRE, Mac Arthur VALIDE (jamais autonome).** L'agent propose des actions à valider dans le cockpit : « devis Nabyntou accepté → confirmer l'encaissement de 175 € ? », « entrée de 500 € → répartition suggérée sur tes enveloppes ? ». Règle « Mac Arthur = source ».
3. **Vue argent par client :** facturé (devis acceptés) / encaissé (entrées liées au dossier) / reste dû. Rendue possible par `dossier_id` sur les finances.
4. **Coach de discipline + répartition enveloppes automatisée.** Le point le plus important. Mac Arthur a beaucoup de pulsions de dépense mal organisées. Le coach lit les entrées, et à chaque rentrée d'argent **suggère une répartition sur les 11 enveloppes** (par priorité) qu'il valide → l'épargne s'assigne AVANT qu'il puisse la dépenser (logique « pay yourself first » anti-pulsion). Aujourd'hui : 0 € épargné sur ~76 000 € de cibles. Le coach fait aussi des recommandations récurrentes et suit un chiffre : l'encaissé agence du mois.
- **Gain :** il sait qui lui doit quoi, son argent s'assigne tout seul (moins de pulsions), et un coach le discipline sans qu'il y pense.

**À construire :** l'app Pilotage est une SPA React (Babel standalone, onglets). Ajouter un onglet « Argent/Coach » + une edge function `coach-repartition` (suggère le split). À faire à tête reposée (build React de prod).

### Phase 3 — Ta prochaine action + relances automatiques
Sur chaque dossier : « prochaine action + échéance ». Relances automatiques (devis sans réponse à J+3, acompte non réglé, client à recontacter). C'est l'agent commercial qui dort déjà dans le pipeline.
- **Gain :** le système te pousse l'action au bon moment, tu ne pilotes plus de tête.

## Recommandation

Commencer par la **Phase 1** : c'est le maillon manquant qui rend tout le reste cohérent (sans lui, le cockpit restera à côté de ton activité réelle), et c'est buildable sans dépendre de la règle de prix de dimanche.

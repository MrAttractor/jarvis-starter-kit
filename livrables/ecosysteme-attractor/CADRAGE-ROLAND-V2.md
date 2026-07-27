# Cadrage — Roland V2 : coach financier interactif & routine de discipline

> Cadré le 27/07/2026 avec Mac Arthur. Document de préparation, à construire en session dédiée. Ne pas coder avant validation des décisions en fin de doc.

## Le problème à résoudre

Mac Arthur a beaucoup d'informations financières (encaissements, dépenses, devis en attente…) **dans la tête, mais jamais à jour dans le cockpit**. Aujourd'hui Roland est **consultatif** : il lit le contexte du mois et conseille, mais il n'enregistre rien. Résultat : les chiffres restent flous, la saisie manuelle ne se fait pas, et il n'y a pas de mécanique qui force la mise à jour.

## Le changement de nature

Roland passe de **« il parle »** à **« il fait et il tient »**. Trois capacités :

### 1. Saisie par la parole (done-for-you)
Mac Arthur parle normalement (« j'ai encaissé 150 000 de Fleur, payé 40 000 d'hébergement »). Roland **extrait les montants** et **propose les écritures** :
> « Je note : +150 000 revenu (Fleur), −40 000 charge (hébergement). Je valide ? »

Validation en **1 tap** → ça entre dans `pilotage_finances`. Mac Arthur garde la main, Roland fait le travail. C'est la réponse directe au « plein d'infos pas à jour » : il vide sa tête en parlant, Roland range.

### 2. Routine de discipline (rendez-vous ponctuels précis)
Des points fixes où **Roland sollicite** Mac Arthur, à heure définie, format court, une question précise. **Horaires validés :**

| Rendez-vous | Quand | Ce que Roland fait |
|-------------|-------|--------------------|
| **Le cap du jour** | Lundi → vendredi, **8h00–8h15** | Point de 15 min : ce qu'on encaisse / relance aujourd'hui, jauges du jour |
| **Le point du samedi** | Samedi **11h00** | Bilan de la semaine + saisie de ce qui a bougé |
| **Le bilan du dimanche** | Dimanche **20h00** | Semaine chiffrée + enveloppes + 1 challenge (rituel de discipline) |

Chaque rendez-vous devient un **événement récurrent dans Google Agenda** (canal validé), avec notification sur le téléphone. S'appuie sur la discipline hebdo déjà cadrée (DISCIPLINE-TRAVAIL.md).

**Ton de Roland : motivant et familier.** Pas un comptable froid, un coach proche qui pousse.

### 3. Le challenge (éveil financier)
Roland ne se contente pas d'enregistrer, il **surveille toutes les jauges et alerte**, et il **confronte Mac Arthur à ses chiffres** :
- Toutes les jauges du cockpit (entrées, sorties, enveloppes, réserve URSSAF, objectif du mois) → alerte dès qu'une jauge décroche.
- **Rappel des échéances de paiement** (ce qui est dû, quand) pour que rien ne passe à la trappe.
- La question qui pique, sur du réel : « Tu as 3 devis validés non encaissés (X FCFA). Tu relances qui aujourd'hui ? »

Objectif : maintenir l'attention sur le **cash**, ne jamais laisser les chiffres dormir.

### La philosophie de Roland (sa boussole, non négociable)

**Face à un besoin d'argent, le réflexe de Roland n'est JAMAIS « pioche dans tes économies ». C'est « quelle vente ciblée on fait pour couvrir ça ».**

Chaque fois qu'un besoin ou une dépense se présente, Roland amène Mac Arthur à **générer de l'argent nouveau par une vente ciblée**, plutôt qu'à entamer les enveloppes ou la réserve. Il protège les économies comme un rempart, et transforme chaque besoin en occasion de vendre.

C'est le cœur du personnage : un coach qui pousse à **attaquer par le chiffre d'affaires**, pas à grignoter l'épargne. Synergie directe avec la machine de vente qu'on vient de brancher (page /commander + XPaye) : quand Roland dit « il faut 200 000 ce mois », l'outil pour aller les chercher est déjà prêt.

## Comment ça marche (haut niveau)

- **Roland gagne des actions bornées** (pas du code libre) : `enregistrer_revenu`, `enregistrer_charge`, `creer_rappel`, `marquer_fait`. Toujours une **validation avant écriture** (il propose, Mac Arthur confirme). Modification de `chat-assistant` pour qu'il renvoie des écritures structurées, pas seulement du texte.
- **Un moteur de rendez-vous** : heures définies → crée/maintient les événements dans **Google Agenda** via l'API Calendar. Accès serveur à poser une fois (compte de service sur le Workspace agenceattractor.com, que Mac Arthur possède). C'est l'accès de Roland, distinct de celui de l'assistant constructeur.
- **Contexte temps réel** : Roland lit `pilotage_finances`, les devis validés non encaissés (`devis_web` / `devis_paiements`), les enveloppes et la réserve URSSAF (`coach-repartition`) pour formuler ses challenges sur du vrai.
- **Rail de sécurité** : Roland agit dans ces actions précises uniquement. Il ne touche jamais au code ni à la structure de l'app (ça reste le rôle du constructeur, cf. discussion du 27/07).

## Décisions — validées le 27/07/2026

1. **Horaires** ✅ : lundi→vendredi 8h00–8h15 ; samedi 11h00 ; dimanche 20h00.
2. **Canal des relances** ✅ : **Google Agenda** (événements + notifications téléphone), à compléter par WhatsApp pour l'urgent si besoin.
3. **Ton** ✅ : motivant et familier.
4. **Surveillance** ✅ : toutes les jauges + alertes + rappel des échéances de paiement.
5. **Philosophie** ✅ : ventes ciblées pour argent nouveau, jamais puiser dans les économies (voir section dédiée).

**Reste à trancher :**
- **Validation des écritures** : Roland propose et Mac Arthur confirme d'un tap (recommandé, sûr), ou saisie directe autorisée sur les cas simples ? → à confirmer.

## Séquence de construction (une fois validé)

1. Actions structurées dans `chat-assistant` (Roland propose des écritures) + écran de confirmation dans le cockpit.
2. Contexte enrichi (devis non encaissés, enveloppes, URSSAF) injecté à Roland.
3. Moteur de rendez-vous + relances sur le canal choisi.
4. Bibliothèque de challenges basés sur les chiffres réels.

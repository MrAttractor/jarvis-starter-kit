# LS EXPERTISE — Brief métier détaillé (agence de création de contenu)

> Reçu de Mac Arthur le 06/07/2026, transcrit/structuré à partir de son brief écrit + précision vocale. Beaucoup plus précis que le brief de conception initial (`BRIEF-CLIENT.md`) — sert désormais de référence principale pour le workflow réel. Rôles confirmés le 06/07/2026 : Commercial, Social Media Manager, Assistante Administrative (+ Directeur/Super Administrateur, + équipes de production spécialisées).

---

## Objectif

Système de gestion interne qui accompagne tout le cycle de vie d'un client, de son arrivée comme prospect jusqu'au suivi de la production des contenus. Chaque département travaille sans perte d'information, avec un historique complet des échanges, validations et responsabilités.

## Les acteurs

### 1. Super Administrateur (Directeur — Lyle)
Supervise toute l'entreprise, visualise tous les projets, valide les décisions importantes, consulte les indicateurs, suit les performances commerciales et opérationnelles, gère les utilisateurs/offres/départements, peut intervenir sur n'importe quel dossier.

### 2. Commercial
**Responsabilité : transformer un prospect en client.**

**Étape 1 — Découverte** (entretien approfondi, tout enregistré dans la fiche Prospect) :
- Informations générales : nom, entreprise, activité, contacts, adresse, site web
- Compréhension du métier : ce que fait le client, produits, services, cible, objectifs
- Situation actuelle : réseaux sociaux utilisés, depuis quand, résultats obtenus, actions déjà essayées, ce qui fonctionne/ne fonctionne pas
- Organisation interne : seul ou en équipe, qui valide les contenus, interlocuteur principal
- Budget : prévu, contraintes, priorités

**Étape 2 — Transmission** : dossier transféré automatiquement au Social Media Manager, avec compte rendu, notes, documents, pièces jointes conservés.

**Retour vers le Commercial** : reçoit la proposition stratégique du Social Media Manager, puis **produit lui-même l'offre technique et financière (le devis)** à partir de cette proposition, et organise la présentation au client. Le système gère l'envoi du devis, le suivi, les relances, la validation. Client accepte → statut **Prospect → Client**.

> ✅ **Tranché par Mac Arthur le 06/07/2026** : c'est le **Commercial** qui produit l'offre technique et financière (le devis). Une fois le client OK, l'**Assistante Administrative** prend le relais et envoie le contrat (puis gère facture/reçus/documents internes, comme déjà écrit dans le brief). Séquence confirmée : Commercial (devis) → validation client → Assistante Administrative (contrat → facturation → ouverture du projet).

### 3. Social Media Manager — Phase Stratégie
À partir du brief reçu :
- **Analyse** : étude du secteur, analyse de la concurrence, analyse des réseaux existants
- **Proposition stratégique** : objectifs, positionnement, ligne éditoriale, tonalité, rubriques, fréquence de publication, formats recommandés, recommandations marketing
- **Proposition visuelle** : templates, charte, style graphique, inspirations

Renvoie tout au Commercial (proposition stratégique + offre technique + devis).

### 4. Assistante Administrative
Dès validation client, dossier transféré automatiquement :
- **Contrat** : génération, récupération des informations légales, signature, archivage
- **Documents administratifs** : facture, reçus, documents internes
- **Ouverture officielle du projet** : le système crée automatiquement le dossier client, le projet, les accès internes

Statut → **Projet actif**.

### 5. Social Media Manager — Phase Production
Reprend complètement le dossier :
- **Calendrier éditorial** : calendrier mensuel, types de contenus, objectifs par publication → envoyé au client, qui peut valider/commenter/demander des modifications (toutes les versions conservées)
- **Planning de tournage** : lieux, horaires, intervenants, besoins matériels. **Règle opérationnelle clé** : un planning général de tournage est construit en début de mois ; les nouveaux clients arrivant en cours de mois sont intégrés automatiquement dans ce planning existant (pas un planning séparé par client)
- **Coordination des équipes** : une fois le planning validé, notification automatique à l'équipe vidéo, aux photographes, graphistes, monteurs, community managers — chacun reçoit sa mission, ses horaires, les infos client, les contenus attendus
- **Suivi de production** : statut par étape — tournage effectué → rushs reçus → montage terminé → validation interne → validation client → programmation → publication
- **Suivi client** : historique complet des échanges (WhatsApp, appels, réunions, validations, remarques, demandes complémentaires)

## Tableau de bord Directeur (temps réel)

- **Commercial** : prospects, devis envoyés, devis acceptés, taux de transformation
- **Production** : tournages prévus, tournages réalisés, contenus en attente, contenus validés, contenus publiés
- **Clients** : clients actifs, clients en attente, contrats en cours, renouvellements

## Flux métier global

```
Prospect
  → Commercial (Découverte) → Création du brief
  → Social Media Manager (Stratégie) → Templates → Offre technique
  → Retour Commercial → Présentation → Validation Client
  → Assistante Administrative → Contrat → Facturation → Ouverture du projet
  → Social Media Manager (Production) → Calendrier éditorial → Validation client
  → Planning de tournage → Production → Validation → Programmation → Publication
  → Suivi mensuel
```

---

## Réconciliation avec la conception précédente

Ce brief est beaucoup plus précis que le brief de conception initial (6 départements génériques). Différences à noter :
- Le Social Media Manager porte à lui seul **deux phases distinctes** (Stratégie puis Production) — pas un simple département statique, c'est un rôle qui suit le dossier sur la durée.
- Les "équipes de production" (vidéo, photographes, graphistes, monteurs, community managers) sont des **exécutants notifiés par mission**. **Tranché le 06/07/2026** : toute notification reste **interne à l'outil**, regroupée dans un seul système centralisé — pas de fragmentation par WhatsApp individuel par exécutant. Conséquence : ces équipes ont besoin d'un accès applicatif minimal (au moins une boîte de notifications/missions), pas seulement un message externe — le système d'invitation multi-utilisateurs (section 2bis de `CONCEPTION-DMV.md`) doit donc couvrir potentiellement toute l'équipe, pas seulement les 4 rôles à dashboard complet.
- La règle du planning de tournage mensuel avec intégration automatique des nouveaux clients en cours de mois est une **contrainte d'algorithme de planification** à concevoir spécifiquement — ce n'est pas un simple calendrier, c'est un système d'allocation de ressources (équipes, créneaux) par mois glissant.
- Confirme et affine `CONCEPTION-DMV.md` section 2bis (Assistante Administrative = rôle réel, module Administration).

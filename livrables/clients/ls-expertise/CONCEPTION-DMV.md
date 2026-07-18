# LS EXPERTISE — Conception du DMV (Système d'exploitation d'agence)

> Document de conception, pas encore une maquette. Sert de socle avant de produire le DMV cliquable (`/maquette-closer`), le devis (`/devis-express`) et le CDC.
> Rédigé le 06/07/2026.

---

## 0. Cadrage stratégique — à trancher avant l'architecture

Le brief demande "le système d'exploitation complet de l'agence", pensé pour tenir "plusieurs années" et "5 000 clients actifs". C'est une vision juste comme architecture cible, mais **ce n'est pas ce qu'on vend en premier**, et ce n'est pas ce qu'on construit en V1. Deux pièges classiques que ce brief contient :

- **Le piège de la V1 d'Attractor Assists** : trop de portes d'entrée, trop de modules, l'objectif dilué dans la complexité. Le brief liste 6 départements, 40+ sous-fonctions, une gestion documentaire versionnée, un moteur d'automatisation générique. Si on construit tout ça avant qu'un seul client réel n'ait payé quoi que ce soit, on répète l'erreur.
- **Le piège du CRM générique** : sans savoir *qui* est LS EXPERTISE (combien de clients gère l'agence aujourd'hui, quelle taille d'équipe, quel outil utilisé actuellement, quelle douleur precise), on conçoit dans le vide. Le brief ne le dit pas.

**Recommandation** : ce document pose l'architecture cible (ce que la plateforme peut devenir), mais le DMV à produire pour closer doit rester sur le mécanisme "maquette-first" déjà validé chez toi : montrer 1 parcours concret (un dossier client qui traverse 3-4 étapes clés), pas les 6 départements en même temps. Section 9 propose le phasage.

**Précision du 06/07/2026 — modèle de deal** : pas de facturation. Le contact chez LS EXPERTISE (~10 personnes) est **influenceur marketing**. Il utilisera l'outil pour son agence, parlera de ce que l'outil fait concrètement pour lui, et produira des vidéos pour attirer des prospects. Ce n'est donc pas une Famille A classique (devis + acompte) mais un **partenariat cas d'usage / marketing d'influence** : LS EXPERTISE devient utilisateur réel et vitrine vivante, comme C'Real (Kezey) a servi de DMV principale pour attirer de nouveaux clients boutique — mais ici à l'échelle "OS d'agence" et avec un influenceur qui produit du contenu vidéo dédié, pas juste un cas client cité en passant.

**Conséquence stratégique** : ce projet n'est plus seulement un service rendu à un client — c'est potentiellement l'amorce d'une **nouvelle ligne de produit** (l'OS d'agence de création de contenu, vendable ensuite à d'autres agences), avec LS EXPERTISE comme premier utilisateur réel + moteur marketing. Mac Arthur a tranché : **il faut un projet complet** (pas un MVP limité à la Formule Essentielle) — voir section 0bis et 9 révisées.

---

## 0bis. Partenariat en nature — cadrage avant tout engagement

**Ce qui change par rapport à un deal payant** : la friction naturelle d'un devis + acompte (qui borne le scope et matérialise l'engagement du client) n'existe pas ici. Sans facturation, rien n'empêche mécaniquement le scope de déraper vers "les 6 départements" du brief initial. Le risque n'est pas la trahison de LS EXPERTISE, c'est l'absence de garde-fou naturel.

**Pour** (arguments en faveur du deal) :
- Aucune barrière à l'entrée pour LS EXPERTISE → accord plus facile à obtenir qu'un contrat payant
- Une agence de 10 personnes avec un vrai réseau de clients peut générer des leads qualifiés sans dépenser en pub Meta
- Cas d'usage flagship pour le Générateur d'Apps Métier à l'échelle "OS d'agence" (au-delà des apps métier mono-utilisateur déjà livrées) — actif de vente pour de futurs prospects similaires
- Cohérent avec les partenariats déjà en cours (Beracca, XPaye) : Mr Attractor sait déjà faire ce type de deal

**Contre** (risques à ne pas sous-estimer) :
- Aucune rentrée de cash direct : le temps de dev ne compte pas dans l'objectif 10 000€/mois — c'est un investissement, pas un revenu
- "Faire notre pub" est actuellement une promesse verbale, pas un engagement mesurable — sans chiffrage (portée, fréquence, durée, canaux), impossible de vérifier si la contrepartie a été honorée
- Le brief initial demande un OS complet (6 départements) : sans devis pour borner le scope, le seul garde-fou possible est un document écrit avec jalons — sinon le risque de sur-livrer (temps agence non facturé) est réel
- Pas de acompte = pas de preuve d'engagement de la part de LS EXPERTISE avant que Mr Attractor investisse du temps de conception/dev

**Recommandation** : traiter ce partenariat comme le protocole Beynaud plutôt que comme un devis classique — un document écrit avant tout développement qui fixe : (1) le scope exact livré et son ordre de construction (section 9 révisée — le projet cible est complet, mais il se construit quand même par étapes), (2) la définition mesurable du contenu marketing (nombre de vidéos, fréquence, canaux, durée d'engagement, ce qu'elles doivent montrer), (3) des jalons de validation réciproques (chaque étape livrée = contenu vidéo produit en retour), (4) une clause de sortie si l'une des deux parties ne tient pas sa part, (5) qui possède quoi sur la marque/le produit final si l'OS devient une ligne de produit vendue à d'autres agences (LS EXPERTISE reste-t-il "client zéro" ou co-conçoit-il l'offre ?). Sans ce document signé, ne pas commencer le développement — seule la conception (ce présent document) est offerte à ce stade.

**Point de vigilance sur "projet complet"** : accepté comme cible, mais à traduire en engagement réciproque proportionnel — un projet complet en échange d'un flux de contenu ponctuel et non garanti serait un échange déséquilibré. Le protocole doit lier l'ampleur du contenu vidéo (fréquence et durée dans le temps, pas une seule vidéo de lancement) à l'ampleur du développement.

---

## 1. Modèle du cycle de vie client (machine à états)

**Mis à jour le 06/07/2026** avec le brief métier détaillé (`BRIEF-METIER-DETAILLE.md`), beaucoup plus précis que l'estimation initiale. Le flux réel confirmé par Lyle :

```
PROSPECT
  → DECOUVERTE (Commercial : fiche prospect complète — voir section 3)
  → BRIEF_TRANSMIS (Social Media Manager)
  → STRATEGIE_PROPOSEE (analyse + proposition stratégique + templates + offre technique + devis)
  → PRESENTATION (retour Commercial, envoi devis, relances)
  → SIGNE (validation client) ─┐
                                ↓ (rejet → retour STRATEGIE_PROPOSEE, pas juste "perdu")
  → CONTRAT_EN_COURS (Assistante Administrative : contrat, légal, facturation)
  → PROJET_ACTIF (dossier + accès internes créés automatiquement)
  → CALENDRIER_PROPOSE (Social Media Manager phase Production)
  → CALENDRIER_VALIDE (client valide/commente/demande modif — versions conservées)
  → PLANNING_TOURNAGE (intégré au planning mensuel glissant — section 3bis)
  → EN_PRODUCTION (tournage effectué → rushs reçus → montage terminé)
  → VALIDATION_INTERNE → VALIDATION_CLIENT → PROGRAMME → PUBLIE
  → SUIVI_MENSUEL (boucle : nouveau calendrier le mois suivant)
```

Toujours vrai (repris de la V1 de cette section) : chaque transition = ligne append-only, checklist de prérequis par transition, retours en arrière possibles à chaque étape de validation (pas un pipeline à sens unique), `PERDU` reste un état à part avec motif obligatoire à n'importe quel point du flux.

Règles non négociables :
- Chaque transition d'état = une ligne dans `dossier_transitions` (append-only, jamais de update/delete). C'est la seule façon de garantir "aucune information perdue quand un dossier change de responsable" — pas une promesse UX, une contrainte de schéma.
- Chaque transition a une **checklist de prérequis** propre (même logique que le SOPCadre déjà en place dans Pilotage : Devis envoyé/Acompte reçu/En production/Livré). Ex. : `SIGNE → EN_PRODUCTION` impossible sans acompte enregistré + brief stratégique validé.
- `PERDU` doit être un état à part entière avec motif obligatoire (le brief ne le prévoit pas — angle mort n°1, voir section 8).

---

## 2. Départements & permissions (RBAC)

**Mis à jour le 06/07/2026** : le brief métier détaillé confirme 4 rôles réels avec accès applicatif complet, plus des équipes d'exécution notifiées par mission (pas nécessairement des comptes avec dashboard) :

| Rôle | Voit | Peut valider |
|---|---|---|
| Directeur (Super Admin — Lyle) | tout, tous clients, tous indicateurs | utilisateurs, offres, départements, n'importe quel dossier |
| Commercial | ses prospects + clients qu'il a signés | fiche prospect, **offre technique et financière (devis)**, relances, passage Prospect→Client |
| Social Media Manager | dossiers qui lui sont assignés, sur les 2 phases (Stratégie et Production) | proposition stratégique, calendrier éditorial, planning de tournage |
| Assistante Administrative | contrats/factures/paiements de tous les clients (pas le contenu créatif ni les scores commerciaux) | **envoi du contrat une fois le client OK**, facture émise, ouverture officielle du projet |
| Équipes d'exécution (vidéo, photographes, graphistes, monteurs, community managers) | leur mission assignée uniquement (pas tout le dossier client) via une boîte de notifications interne | statut de leur tâche (tournage fait, montage terminé, etc.) |

✅ **Tranché le 06/07/2026** : Commercial produit le devis, Assistante Administrative envoie le contrat une fois le client OK (séquence confirmée, cf. `BRIEF-METIER-DETAILLE.md`).

✅ **Tranché le 06/07/2026** : toute notification reste interne à l'outil, centralisée dans un seul système (table `notifications`) — pas de fragmentation par WhatsApp individuel. Conséquence : les équipes d'exécution ont besoin d'un compte applicatif minimal (boîte de notifications/missions), le système d'invitation (section 2bis) doit donc couvrir potentiellement toute l'équipe (~10 personnes), pas seulement les 4 rôles à dashboard complet — périmètre plus large que prévu initialement, à refléter dans le chiffrage de l'Étape 1.

Point de vigilance : **Production ne doit pas voir les infos financières du client** (marge, tarif) sauf si Direction en décide autrement — sinon on répète l'erreur "policy SELECT publique" déjà rencontrée et corrigée sur GetWinWorld (bucket photos), transposée ici aux données financières.

### 2bis. Décision du 06/07/2026 — gestion d'équipe en libre-service

Mac Arthur a tranché : **on livre le cadre, pas la liste des utilisateurs.** Dès la livraison de l'app, Lyle doit pouvoir lui-même renseigner et créer son équipe (inviter chaque membre, lui assigner un rôle) — on ne lui demande pas la liste réelle de ses employés en amont pour la préconfigurer.

**Conséquence architecturale importante** : le gabarit standard du Générateur d'Apps Métier (GetWinWorld, J'Envoie Express, C'Real) suppose un **seul compte propriétaire** — un UUID Supabase Auth nominatif unique, RLS gaté sur `auth.uid() = '<uuid-du-client>'`. Ce modèle ne suffit pas ici : LS EXPERTISE a besoin d'un vrai **système multi-utilisateurs par tenant**, avec :
- une table `equipe_membres` (`user_id`, `agence_id`, `role`, `statut` invité/actif, `invite_par`, `date_invitation`) ;
- un flux d'invitation (Lyle saisit le téléphone/email du futur membre + son rôle → compte créé ou invité → l'intéressé complète son inscription) ;
- des policies RLS qui vérifient l'appartenance à l'agence ET le rôle (`auth.uid() IN (SELECT user_id FROM equipe_membres WHERE agence_id = X AND role IN (...))`), pas juste un UUID unique codé en dur.

C'est un écart réel par rapport au gabarit existant — à budgétiser comme un module à part, pas une variation mineure du schéma standard.

**Rôle confirmé (06/07/2026) — Assistante administrative** : Lyle travaille étroitement avec une assistante administrative. C'est un rôle réel, pas hypothétique — elle couvre naturellement ce que le brief initial appelait "Administration" (contrats, facturation, paiements, suivi administratif), un des départements que le prototype transmis ne couvrait pas encore. Ajouté au tableau RBAC :

| Rôle | Voit | Peut valider |
|---|---|---|
| Assistante administrative | contrats, factures, paiements de tous les clients (pas le contenu créatif ni les scores de qualification commerciale) | facture émise, paiement reçu, statut administratif du dossier |

Implication sur le phasage (section 9) : puisque ce rôle est confirmé comme réel et central dans le fonctionnement quotidien de Lyle (pas une hypothèse à valider plus tard), le module Administration devrait avancer dans l'Étape 1 plutôt que d'être repoussé à l'Étape 3.

### 2ter. Décision du 06/07/2026 — onboarding en cascade par lien (précision de la section 2bis)

Mac Arthur a précisé le mécanisme d'auto-configuration à la livraison : ce n'est pas un flux d'invitation générique unique, c'est une **cascade en 2 temps** :

1. **Lien Direction** (Lyle + son assistante) : premier lien envoyé à la livraison de l'Étape 1. Formulaire de configuration qui capture l'identité de l'agence (coordonnées, offre/tarifs actuels) et surtout la liste des personnes à inviter (nom, téléphone/email, rôle). À la soumission, le système crée les lignes `equipe_membres` en statut "invité" avec un token unique par personne et déclenche l'envoi automatique du lien individuel (WhatsApp ou email, pattern déjà validé sur Assists).
2. **Liens par département** : chaque personne invitée reçoit un lien propre à son rôle (`/onboarding/[role]/[token]`), qui mène directement à un écran de configuration spécifique à son métier — pas un formulaire générique identique pour tous :
   - Commercial : prospects en cours à reprendre, offre/tarifs si différents de la base
   - Social Media Mgmt : process éditorial actuel
   - Production : équipe cadreurs/monteurs, matériel, contraintes de planning
   - Administration : infos de facturation actuelles, modèle de contrat existant
   - Community Mgmt : comptes réseaux gérés aujourd'hui

Le token authentifie l'accès le temps de l'onboarding (même logique que les liens boutique `/b/slug`) ; une fois le formulaire soumis, le compte passe en "actif" et bascule sur le login OTP classique pour les connexions suivantes.

**Conséquence sur le chiffrage de l'Étape 1** : il ne s'agit pas seulement de construire "un système d'invitation" (déjà noté en 2bis) mais 5 écrans de configuration différenciés par département, en plus du formulaire Direction — un peu plus de travail que prévu initialement, à refléter dans le chiffrage final de l'Étape 1.

---

## 3. Modèle de données (entités clés)

Stack cohérente avec l'existant (Supabase Postgres) :

- `clients` (identité, formule, statut, responsable_commercial_id)
- `contacts` (personnes physiques liées à un client)
- `dossiers` (1 par client actif, état courant, département courant)
- `dossier_transitions` (append-only — historique complet, jamais écrasé)
- `devis` / `contrats` / `factures` / `paiements` (documents versionnés, jamais de suppression, `statut` + `version`)
- `documents` (table générique fichiers avec `type`, `version`, `client_id`, stockage Supabase Storage — jamais d'overwrite, chaque upload crée une nouvelle version)
- `calendrier_editorial` (par client, par mois)
- `contenus` (brief → tournage → montage → validation → publication, avec `statut` et assignation département)
- `taches` (génériques, assignées à une personne, liées à un dossier ou un contenu)
- `notifications` (générées par le moteur de règles, section 4)
- `indicateurs_snapshot` (photos périodiques pour les dashboards — éviter de recalculer en temps réel des agrégats lourds à chaque vue)

Le point commun structurant : **tout est rattaché à `client_id`**, jamais de donnée orpheline. C'est ce qui permet, plus tard, la vue "espace client unique" demandée dans le brief sans dupliquer un système de fichiers parallèle.

**Précision du 06/07/2026 — champs réels de la fiche prospect** (`BRIEF-METIER-DETAILLE.md`), à intégrer dans `clients`/`contacts` plutôt que de laisser un simple champ "notes" libre : informations générales (nom, entreprise, activité, contacts, adresse, site web) ; compréhension du métier (produits, services, cible, objectifs) ; situation actuelle (réseaux sociaux utilisés, depuis quand, résultats, actions déjà essayées, ce qui fonctionne/ne fonctionne pas) ; organisation interne (seul/équipe, qui valide les contenus, interlocuteur principal) ; budget (prévu, contraintes, priorités). Champs structurés, pas un blob texte — ils alimentent directement la proposition stratégique du Social Media Manager.

### 3bis. Planning de tournage mensuel — algorithme d'allocation, pas un simple calendrier

Règle opérationnelle confirmée le 06/07/2026 : le planning de tournage se construit **en début de mois pour tous les clients actifs**, et les nouveaux clients arrivant en cours de mois sont **intégrés automatiquement dans le planning existant** (pas un planning séparé par client créé à la volée). Concrètement, ça implique :
- une table `planning_tournage_mensuel` (mois, créneaux disponibles par équipe/intervenant, capacité) distincte de `contenus`/`taches` ;
- un algorithme d'insertion qui trouve un créneau disponible pour un nouveau client sans tout recalculer, plutôt qu'un simple formulaire de prise de rendez-vous ;
- une notification automatique à l'équipe d'exécution assignée (vidéo/photo/graphiste/monteur/CM) dès qu'un créneau est confirmé, avec mission + horaires + infos client + contenus attendus (repris du modèle "Missions" déjà validé dans le prototype transmis par Lyle).

C'est plus complexe qu'un calendrier éditorial classique — à traiter comme un module de planification à part dans le chiffrage, pas une simple vue de plus sur `calendrier_editorial`.

---

## 4. Moteur d'automatisation (règles, pas d'IA magique)

Le brief demande beaucoup d'automatisation ("le système propose automatiquement..."). Concrètement, ça se construit en 2 couches, pas une seule boîte noire :

1. **Gate checks** : chaque transition d'état a une liste de conditions (déjà éprouvé dans Pilotage — SOPCadre). Simple, fiable, pas d'IA nécessaire.
2. **Moteur de suggestions** (cron ou trigger) : scanne les dossiers actifs et génère des `notifications` sur des règles explicites — échéance dans 3 jours, document manquant depuis X jours, validation client en attente depuis Y jours, conflit de planning (2 tournages même créneau même personne). Ça peut vivre dans n8n (déjà l'outil en place) plutôt que dans du code applicatif dédié — cohérent avec l'existant (workflow Veille Santé Assists, Brief Inbound).

L'IA (Claude) intervient en V2 pour les tâches à valeur ajoutée réelle : rédaction de brief stratégique à partir d'un audit, synthèse de reporting mensuel par client, détection de dérive qualité — pas pour remplacer les gate checks, qui doivent rester déterministes.

---

## 5. Dashboards par rôle

Directement dérivés des permissions (section 2), alimentés par `indicateurs_snapshot` :

- **Direction** : prospects actifs, taux de conversion, CA signé vs CA récurrent (MRR), rentabilité par client (revenu − coût de production estimé), charge par département, retards en cours, satisfaction (à connecter à un NPS/enquête simple, pas à inventer).
- **Commercial** : pipeline (comme Pilotage aujourd'hui), relances dues.
- **Administration** : factures en attente, paiements en retard, renouvellements à J-30.
- **Production** : planning de charge par personne, tâches en retard.
- **Community Mgmt** : calendrier de publication à venir, performance des contenus publiés (si connecté aux API réseaux sociaux — V2).

---

## 6. Architecture technique proposée

Cohérente avec l'architecture commune déjà validée sur GetWinWorld / J'Envoie Express / C'Real (`.claude/skills/generateur-app-metier/references/architecture-commune.md`), pas une pile nouvelle à maintenir :

- **Backend** : un projet Supabase (Postgres + Auth + Storage + Realtime). RLS activé par défaut sur toutes les tables, policies nominatives par rôle (jamais de SELECT public sur des données client — règle non négociable déjà actée).
- **Frontend** : Cloudflare Pages, HTML/CSS/JS ou React selon la complexité réelle des interfaces par département (le back-office multi-rôle justifierait React/Vite, contrairement aux vitrines clients qui restent en HTML statique).
- **Automatisations** : n8n (déjà sur Railway), pas de moteur de règles réinventé.
- **Documents/versioning** : Supabase Storage, convention de nommage `client_id/type/vX_date`.
- **Intégrations prévues mais pas construites en V1** : IA (edge function Claude, même pattern que le conseiller GetWinWorld), WhatsApp (lien partagé, pattern déjà validé sur Assists — pas de Cloud API dédiée), signature électronique et paiement (à brancher via prestataire externe quand un vrai besoin contractuel se présente, pas avant).

Modularité : chaque département = un schéma logique de tables + ses propres vues RLS, mais un seul `client_id` transversal. Pas de microservices séparés — inutile à l'échelle réelle du projet (bien avant "5 000 clients actifs", qui est un horizon théorique, pas un besoin actuel de LS EXPERTISE).

---

## 7. Ce que le brief ne dit pas — risques et angles morts

1. **Pas de gestion des sous-traitants/freelances** — une agence de création de contenu externalise presque toujours (monteurs, photographes freelances). Le modèle "Production" suppose une équipe interne fixe ; à prévoir : assignation à des tiers, leurs propres accès restreints, leur rémunération.
2. **Pas de droits d'image / cession de droits sur les contenus produits** — juridiquement critique pour une agence de contenu (qui possède la vidéo une fois publiée ? le client, l'agence, le créateur ?). Absent du brief, à ne pas improviser.
3. **Pas de gestion des litiges/réclamations client** — le cycle de vie s'arrête à "Fidélisation", aucun état pour un client insatisfait qui conteste une facture ou un livrable.
4. **Pas de suivi de rentabilité réelle par dossier** — le brief demande "l'impact financier de chaque étape" en philosophie mais aucune entité ne capture le coût de production réel (heures, sous-traitance) face au prix vendu. Sans ça, le dashboard Direction "rentabilité par client" est une coquille vide.
5. **Pas de gestion multi-devise / multi-marché** — pertinent si l'agence a des clients CI et France (comme ton propre modèle). Si LS EXPERTISE est purement locale, ce n'est pas un problème ; à vérifier.
6. **Pas de niveaux de service différenciés par formule tarifaire** — le brief traite tous les clients pareil dans le workflow. Ta propre règle commerciale ("toujours 2-3 formules") suggère que le SLA (délai de production, nombre de révisions incluses) devrait varier par formule — sinon on revend un service premium au prix essentiel par erreur de configuration.
7. **Pas de politique de rétention/RGPD sur les données clients et les contenus** — "aucune information ne doit être écrasée" est en tension directe avec le droit à l'effacement RGPD si l'agence a des clients en Europe. À trancher explicitement (rétention append-only interne + effacement anonymisé sur demande, plutôt que suppression physique).
8. **Le chiffre "5 000 clients actifs" est un horizon théorique, pas un budget de scalabilité réel** — Supabase/Cloudflare tiennent cette charge sans souci technique à ce stade ; le vrai risque à 500+ clients n'est pas la base de données, c'est la conception RLS/permissions (section 2) qui doit être pensée juste dès la V1, parce que corriger une faille de cloisonnement client après coup est coûteux (déjà vécu sur GetWinWorld, corrigé avant que ça devienne un incident).

---

## 8. Ce que le brief demande en trop pour un premier DMV

Le brief, tel que rédigé, décrit une plateforme à construire sur plusieurs mois. Le vendre comme ça reviendrait à répéter le contre-exemple GetWinWorld (négociation à la baisse d'un tarif unique) à l'envers : présenter un scope trop large fait peur ou paraît hors budget. La règle "toujours 2-3 formules" s'applique aussi ici — pas un bloc monolithique.

---

## 9. Phasage — projet complet, construction séquencée (révisé 06/07/2026)

**Décision de Mac Arthur : la cible est le projet complet**, pas un MVP limité vendu par palier. Ça change l'objectif final (les 6 départements doivent exister) mais pas la méthode de construction : on ne peut pas coder les 6 départements en même temps sans risquer la sur-construction déjà vécue sur Attractor Assists V1. La séquence ci-dessous reste donc l'ordre de livraison technique, chaque étape étant immédiatement utilisable par LS EXPERTISE (donc filmable par l'influenceur au fur et à mesure, pas seulement à la toute fin) :

**Étape 1 — Socle** (utilisable et démontrable dès la fin de cette étape) :
- Système d'invitation et de rôles en libre-service (section 2bis) : Lyle crée son compte, invite son équipe, assigne les rôles — condition préalable à tout le reste, car sans ça personne d'autre que lui ne peut se connecter
- Pipeline prospect → client (pattern Pilotage existant, réutilisable)
- Espace client unique avec documents versionnés
- Checklist de transition (gate checks) sur les étapes clés du cycle de vie
- Module Administration (contrats, factures, paiements) — avancé depuis l'Étape 2 initiale car l'assistante administrative est un rôle réel et central, pas hypothétique (section 2bis)
- Dashboard Direction basique (CA signé, pipeline, retards)

**Étape 2** :
- Social Media Mgmt + Community Mgmt (calendrier éditorial, validation client, publication)
- Moteur de suggestions n8n (relances, échéances, alertes)
- Dashboards par rôle complets (Commercial, Production, CM)

**Étape 3** :
- IA pour brief stratégique et reporting automatisé
- Intégrations réseaux sociaux (perf des publications)
- Suivi de rentabilité réelle par dossier (section 7, point 4)
- Signature électronique + paiement intégrés

Chaque étape livrée déclenche un jalon du protocole de partenariat (section 0bis) : LS EXPERTISE l'utilise en conditions réelles, l'influenceur produit du contenu sur cette étape précise, avant de passer à la suivante. Ça évite de tout construire à l'aveugle pendant des mois sans aucun retour marketing entre-temps.

---

## 10. Prochaine étape concrète

Connu à ce stade : agence de ~10 personnes, contact = influenceur marketing, contrepartie = usage réel + vidéos pour attirer des prospects, cible = projet complet construit par étapes (section 9).

Avant tout développement :
1. **Qualifier le contact** : identité de l'influenceur, taille réelle de son audience/canaux, quels clients gère l'agence aujourd'hui, avec quel outil (Notion/Excel/rien) — pour dimensionner correctement l'Étape 1 sur une équipe de 10.
2. **Chiffrer la contrepartie vidéo** : combien de vidéos par étape livrée, sur quels canaux, quelle portée engagée ou estimée, sur quelle durée totale (pas une seule vidéo de lancement).
3. **Rédiger le protocole de partenariat** (section 0bis) avant tout dev — même logique que le protocole Beynaud, avec jalons alignés sur les 3 étapes de la section 9.
4. Une fois signé : produire le DMV cliquable via `/maquette-closer` sur l'Étape 1 uniquement, pour valider le concept avant d'investir sur les étapes 2 et 3.

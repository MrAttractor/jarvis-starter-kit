# Pipeline des idées — Attractor Assists

> Toute idée de Mac Arthur est capturée ici par MIROIR.
> Une idée ne meurt pas, elle attend son heure.
> Le PILOTE analyse et décide du moment d'implémentation.

---

## Règle de fonctionnement

Quand Mac Arthur formule une idée dans une session :
1. MIROIR la capture immédiatement dans ce fichier
2. PILOTE évalue : potentiel + moment optimal
3. Statut mis à jour à chaque session

**Statuts possibles :** EN ATTENTE / EN ANALYSE / GO / EN COURS / LIVRÉ / ÉCARTÉ

---

## Pipeline actif

| Date | Idée | Potentiel | Moment | Statut |
|---|---|---|---|---|
| 2026-05-29 | Boutique mini-agents (one-shot + abonnement) | Fort | Après 3 mini-agents actifs | EN ATTENTE |
| 2026-05-29 | Bundles de mini-agents complémentaires | Fort | Après boutique active | EN ATTENTE |
| 2026-05-29 | Offres flash sur modules | Moyen | À cadrer (fréquence, durée) | EN ANALYSE |
| 2026-05-29 | Bras droit digital (veille hebdo pour utilisateur) | Fort | Après mini-agent "Connais ta cible" | EN ATTENTE |
| 2026-05-29 | Assistants connaissent les produits à venir → orient. subtile | Fort | Intégrer dès refonte system prompt | GO |
| 2026-05-29 | Customer success via escalade vers consulting Mac Arthur | Moyen | Après 50 utilisateurs actifs | EN ATTENTE |
| 2026-05-30 | **App "Chaines Privées" pour influenceurs et artistes** — plateforme permettant aux influenceurs et artistes CI/diaspora de créer des communautés privées payantes pour leurs fans. Monétisation du lien créateur-audience. PILOTE briefé. | Fort | À analyser — nouveau produit | EN ANALYSE |
| 2026-05-30 | **Chatbot WhatsApp Business agence** — Manychat retenu. Numéro +2250576877070 déjà sur Meta Business API (ID: 699911237524141), zéro migration. 4 flux à configurer : capture FB comments, qualification leads, FAQ auto, suivi J+2. Prérequis : créer compte Manychat + connecter Meta BM. | Fort | ~~Avant lancement campagne S1~~ | **ÉCARTÉ (13/07/2026)** — le bot Cloud API confisque le numéro principal (plus utilisable dans l'app WhatsApp Business). Objectifs déjà couverts par wa.me + chat web + message auto edge function `diagnostic`. Si un jour bot réel : numéro DÉDIÉ obligatoire. cf. mémoire project-whatsapp-mvp |
| 2026-05-30 | **Modèle KAHOOT V2** — quiz interactif pour mesurer l'intégration de la stratégie Attractor par l'utilisateur. Gamification de la compréhension : l'utilisateur répond à des questions sur sa cible, son offre, ses canaux. Score = indicateur de maturité Attractor. Nourrit le profil pour les sous-agents. | Fort | V2, après 100 utilisateurs actifs et données PPSD disponibles | EN ATTENTE |
| 2026-06-08 | **Page "Ce qu'on fait pour nos clients B2B"** — née en retirant le lien cassé "voir nos apps en action → demo.agenceattractor.com" du chat de qualification du site (la page menait à un "bientôt disponible", et montrer les vraies maquettes clients pose un problème de confidentialité + qualité). Plutôt qu'une galerie de maquettes privées, une page simple qui explique en clair la démarche/l'offre B2B (le problème qu'on résout, comment ça se passe, pour qui). Remplace l'idée de vitrine par de l'explication directe. | Moyen | Pas urgent — site fonctionne sans pour l'instant | EN ATTENTE |
| 2026-06-08 | **Cockpit business mobile — pipeline unifié + indicateurs de pilotage** — Mac Arthur veut superviser tout son flux commercial et ses indicateurs business depuis son téléphone, sans avoir à ouvrir un fichier ou lancer une session. Concrètement : (1) fusionner dans le Pipeline du Cockpit les deux flux prospects — auto-capture du site ET saisie manuelle par Mac Arthur — en une seule vue ; (2) étendre le cycle de vie au-delà de "Closé" : nouveau statut "Payé / Projet en cours" déclenché à la réception du paiement avec notification automatique à Mac Arthur, puis "Livré", puis "SAV / Suivi" — la relation commerciale continue jusqu'au service après-vente, pas seulement jusqu'à la signature ; (3) faire évoluer l'onglet Intel pour qu'il affiche SES indicateurs de business (CA en cours, valeur du pipeline, projets actifs, encaissé vs à venir, alertes de relance) et non plus seulement les stats d'usage de l'app. S'appuie sur de l'existant (Pipeline + Intel déjà en seed dans MacCockpitScreen) — extension, pas nouveau produit. | Fort | À cadrer dans la refonte V2 du Cockpit | EN ANALYSE |
| 2026-06-09 | **Canva organisé par catégories de visuels pour les agents Assists** — structurer le Canva de Mac Arthur en dossiers/catégories (ex : Vente formation, Promo produit, Story annonce, Bannière web, Post engagement…). Chaque agent Assists utilisateur pioche dans la bonne catégorie selon le besoin détecté en conversation et personnalise le Brand Template avec les infos du business de l'entrepreneur. Faisable via Canva API (`list-folder-items`, `search-brand-templates`, `create-design-from-brand-template`). Mac Arthur = bibliothèque maître. Chaque entrepreneur = client de cette bibliothèque. | Fort | Après module créateur de visuels V1 | EN ATTENTE |
| 2026-06-09 | **Module "Créateur de visuels de vente"** — l'entrepreneur remplit ses infos dans le chat Assists (nom produit, prix officiel, prix promo, 5 modules, description courte) et obtient ses 4 visuels prêts à poster : post carré cover, post carré vente, bannière horizontale, story 9:16. Template de référence : kit "AGEO" Canva (Design ID `DAHAcsysfsQ`). Style : fond charbon, typo blanche + accent or, podium laptop, FCFA, logos Wave/MTN/Orange. Stack : Brand Template Canva publié avec champs autofill → Edge function `generate-visuals` → Canva API `create-design-from-brand-template` → 4 liens retournés dans le chat. 6 questions max en conversation. Lien Canva source : `https://canva.link/8w05wzija0wx0ox` | Fort | Après stabilisation V3 core | EN ATTENTE |
| 2026-07-13 | **Ligne de templates "Booking / Prise de RDV" pour le Générateur d'Apps Métier** — idée née d'un post Facebook (les artistes galèrent à gérer leur booking). Deux déclinaisons d'un même moteur agenda/réservation : (1) **Booking artiste** — gestion des demandes de dates/events, cachets, riders, contrats, calendrier des dispos, validation ; plus complexe (B2B, négo). Synergie directe avec le réseau artistes déjà en portefeuille (Beynaud, Awa, Studio IA). (2) **Prise de RDV à créneaux** — salon de coiffure, spa, coach, clinique, esthétique : agenda de créneaux, réservation client, rappels WhatsApp, tableau de bord pro. Besoin ultra-universel des TPE. Cœur commun réutilisable = moteur de réservation sur la stack maison (Supabase + Cloudflare + HTML). = nouvelle(s) verticale(s) du Générateur, produit standard vendable en volume (logique "actif réutilisable", aligné discipline). | Fort | Nouvelle ligne de template Générateur — à cadrer en R&D (PILOTE), PAS maintenant (chantiers en cours + fiabilisation n8n) | EN ANALYSE |
| 2026-07-16 | **Formulaire diagnostic → devis auto au barème (rendre le formulaire "intelligent")** — remarque de Mac Arthur : le formulaire n'est pas percutant, en le remplissant on devrait sortir le devis en présentant ce qu'on fait selon le barème, ça raccourcit le travail. **Constat de lecture du code : les briques existent déjà et sont débranchées** (motif session 101). `diagnostic/index.ts` qualifie (famille/couloir/synthèse) et crée un `pilotage_pipeline` avec un `dossier_id`, mais ne chiffre rien ; `generate-devis/index.ts` chiffre au barème et accepte précisément un `dossier_id`, mais n'est déclenché qu'à la main depuis Pilotage. La jointure = un appel à la fin du diagnostic. **3 bloquants à traiter AVANT de brancher** : (1) **barème désynchronisé** — `bareme.md` dit EAGLE = 10h sur 2 mois max, la copie en dur `BAREME_SYSTEM` dit "Coaching CEO + pilotage, 8 semaines" ; toute la section Mr Attractor Films manque côté auto-devis ; le fichier avertit lui-même de la synchro manuelle obligatoire, jamais faite → l'auto-devis chiffrerait sur une grille obsolète ; (2) **numérotation qui collisionne** — `count+1` sur `pilotage_devis` / `devis_prospects` (deux tables qui numérotent chacune de leur côté) ignore les devis faits main (0005 Élévia, 0007 GetWinWorld, 0008 LS Expertise, 0009 Fleur) → réattribution de numéros déjà signés, problème comptable ; le commentaire du prompt dit "timestamp last 4 digits" et contredit le code ; (3) **acompte 50 % en dur**, incompatible avec un paiement en 3 tranches (cas Yiriba). Suite naturelle : brancher sur le devis web interactif (`devis-accept` + cas Fleur Ndoua) pour que le prospect coche et valide en 1 clic. Défaut voisin observé sur le lead Yiriba : email reçu avec "Famille ?" alors que le parse Claude a réussi (synthèse et message WhatsApp présents) — cause non établie, à prouver en exécutant (`?debug=1`), pas en lisant. | Fort | Actif réutilisable (aligné DISCIPLINE-TRAVAIL) — à cadrer après le devis Yiriba ; corriger les 3 bloquants avant la jointure | EN ANALYSE |
| 2026-06-08 | **Onglet "Nouveau prospect" structuré dans le cockpit (sans upload)** — formulaire texte qui reprend les 4 blocs de la fiche-prospect (identité & marque, le client de mon client, le quotidien, proposition commerciale), pour structurer la collecte en live et ne rien oublier pendant un échange — peu importe l'appareil. Couleurs de marque données en texte approximatif, **aucun upload de logo/photo** (choix volontaire de Mac Arthur pour éviter le mur Supabase Storage qui avait bloqué la génération de maquette en session 33). Une fois la fiche validée, Claude la récupère pour construire la maquette. Remarque architecturale de Mac Arthur à garder en tête : le cockpit (MacCockpitScreen) est aujourd'hui greffé sur l'app Assists — si cette dépendance devient bloquante pour son usage de pilotage personnel, prévoir un lien/outil dédié séparé plutôt que de forcer la cohabitation. Lié à l'idée "Cockpit business mobile" ci-dessus — à cadrer ensemble dans la refonte V2. | Fort | À cadrer dans la refonte V2 du Cockpit, avec l'idée "Cockpit business mobile" | EN ANALYSE |

---

## Idées écartées (et pourquoi)

*Rien pour l'instant.*

---

## Idées livrées

*Rien encore — pipeline en construction.*

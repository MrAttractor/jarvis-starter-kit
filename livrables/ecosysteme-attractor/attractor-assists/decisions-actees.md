# Décisions Actées — Mr Attractor

> Registre temps réel. Chaque décision validée par Mac Arthur y est tracée.
> Réservé aux Head of. Maintenu par l'agent PONT.
> Le plus récent en haut.

---

[2026-08-17] — DÉCISION 021
Pôle concerné : Produit / R&D (Attractor Assists)
Décision : Attractor Assists sort de pause pour quinze jours bornés, du 17/08 au 28/08, adossés à l'immersion PMSMP d'Antso Nirina RAKOTOMANANA sur le métier de product builder (convention ffa2ddc7-e4c0-40d9-96df-30eeeaf2a93c). Antso occupe le poste de chef de projet, Mac Arthur reste seul décideur. « Produit prêt » est défini par quatre critères prouvables au 28/08 à 17h : boutique au moins équivalente à boutiquecreal.com, trois entrepreneurs réels ayant terminé le tunnel sans aide, une commande réelle d'un vrai client final, huit marches du tunnel mesurées. Hors périmètre explicite et assumé : facturation récurrente, tests automatisés, migration des testeurs de mai, toute fonctionnalité nouvelle.
Validé par : Mac Arthur
Impacte : Produit, R&D, Commercial (recrutement des trois testeurs), Administratif (pièces PMSMP)
Actions déclenchées :
  → Produit : recette du tunnel par un œil neuf au J1, avant tout engagement de correctif
  → Commercial : dix candidats entrepreneurs listés au J2, trois engagés au J5 en présentiel
  → R&D : instrumentation des huit marches du tunnel au J4, la mesure prime sur l'intuition
  → Administratif : bilan PMSMP et enquête métier remplis au fil de l'eau, pas la veille
  → Mac Arthur : réenregistrer les quatre pièces jointes d'Antso dans context/import/formation/pmsmp-antso/
Contradiction assumée : les deux conditions de reprise écrites au DOSSIER.md le 06/08 ne sont pas remplies. La relance ne rouvre pas le développement de fonctionnalités, elle finance en temps humain l'action de terrain qui était bloquée, avec une date de sortie et un verdict écrit. Si le verdict est négatif, retour en pause avec une raison mesurée.
Statut : EN COURS (échéance 28/08/2026 17h00)

---

[2026-07-27] — DÉCISION 020
Pôle concerné : Stratégy / Commercial (dossier Air CI / VSD)
Décision : Économie VSD figée. Rétrocession de 1 €/kg à Air CI UNIQUEMENT sur les valises exceptionnelles de 32 kg à l'aller ; le retour (2×23 kg) utilise le quota bagage normal, gratuit. Fin du « bon de conversion » et du « 1,5 €/kg sur tous les kilos ». Jean Yves n'investit rien (outils déjà en main), son apport = sa présence de coordination. Règle de vocabulaire : on ne dit plus jamais « fret », on dit « colis normaux acheminés par un prestataire externe (J'Envoie Express) ».
Validé par : Mac Arthur
Impacte : Commercial (offre DR), R&D (simulateur, BP), Contenu (tout discours public sur le dossier)
Actions déclenchées :
  → Commercial : offre DR + simulateur + BP recalculés et redéployés (FAIT)
  → Contenu / tous : bannir « fret » de tout livrable et de tout message ; le mot est une ligne rouge de vocabulaire, pas une préférence
  → Stratégy : marge cible ≈ 4 360 €/rotation, ≈ 170 k€/an — à traiter comme une CIBLE, le retour Abidjan n'est pas assuré
Statut : ACTÉE (tarif du 32 kg et nombre de valises à confirmer par Air CI)

---

[2026-07-25] — DÉCISION 019
Pôle concerné : R&D / Produit
Décision : La publication programmée se fait par policy RLS (la ligne n'est pas lisible avec la clé publique avant l'heure), jamais par un cron ou un automate. Corollaire de vérification : une policy RLS ne se prouve qu'en interrogeant l'API REST avec la clé anon, jamais avec le service role. Deuxième corollaire acté : les migrations SQL s'exécutent depuis le workspace via l'API Management Supabase, on n'attend plus que Mac Arthur colle le SQL à la main.
Validé par : Mac Arthur
Impacte : R&D (tous les projets clients avec du contenu daté)
Actions déclenchées :
  → R&D : appliquer ce standard à tout futur module de publication programmée (Beynaumania, Assists, Nabycook Phase 3)
  → R&D : plus aucune migration laissée « en attente que Mac Arthur l'applique »
Statut : ACTÉE

---

[2026-07-25] — DÉCISION 018
Pôle concerné : Stratégy / R&D (dossier Air CI / VSD)
Décision : Modèle opérationnel VSD verrouillé. Il n'y a plus de convoyeurs : ce sont de simples voyageurs qui débloquent la soute par leur allocation bagage, ils ne portent rien. Les valises sont enregistrées séparément au nom des sociétés de colisage (canal cargo déclaré, jamais la franchise bagage passager). J'Envoie Express fait transport + préparation sûreté uniquement, ne touche PAS à la douane : chaque société de colisage a son transitaire agréé. Positionnement Mr Attractor = apporteur d'affaires, PAS OTA ni agence de voyage (évite l'immatriculation Atout France).
Validé par : Mac Arthur
Impacte : Stratégy, Commercial, R&D, Juridique
Actions déclenchées :
  → Tous : la terminologie « convoyeur » est morte dans tous les livrables (FAIT)
  → Commercial : ne jamais présenter la franchise bagage au DR, ligne rouge d'Hervé Abou
  → Stratégy : obtenir les charges directes de Jean Yves — sans elles le partage 50/50 reste en l'air
Statut : ACTÉE (charges directes Jean Yves toujours manquantes)

---

[2026-07-23] — DÉCISION 017
Pôle concerné : Produit / Stratégy (VSD by Attractor)
Décision : Le voyageur VSD n'est JAMAIS payé (un voyageur payé devient prestataire de transport). Pas de forfait touristique : l'hébergement est un code de réduction partenaire, le voyageur réserve et paie lui-même (aucun prix global, aucune réservation faite par nous, aucune commission perçue de l'hôtel). Marque « VSD by Attractor », signature « Voyager léger », à partir de 430 €, vente sur liste d'attente uniquement. Lancement : vendredi 4 septembre 2026.
Validé par : Mac Arthur
Impacte : Produit, Commercial, Contenu, Juridique
Actions déclenchées :
  → Contenu : plan de communication à armer, clôture des inscriptions le 25 août — 4 semaines
  → Commercial : demander à Air CI les 6 places non payantes + autorisations de tournage (sinon 3 180 € à sortir, hors trésorerie)
  → R&D : table vsd_inscriptions + edge function vsd-inscription écrites mais NON DÉPLOYÉES — bloquant pour ouvrir les inscriptions
Statut : EN COURS (backend d'inscription non déployé)

---

[2026-07-19] — DÉCISION 016
Pôle concerné : Transverse / R&D
Décision : GitHub est la source de vérité des fichiers de tous les sites. Commit + push au fil de l'eau, plus rien ne vit qu'en local. Modèle trunk-based : `main` = source de vérité et prod (`master` renommée).
Validé par : Mac Arthur
Impacte : Tous les pôles produisant des fichiers
Actions déclenchées :
  → Mac Arthur (1 clic) : GitHub → Settings → Branches → basculer la branche par défaut de `master` à `main`, puis supprimer `origin/master`
  → Mac Arthur : régénérer le GITHUB_TOKEN du .env (périmé, « Bad credentials »)
  → R&D : connecter les projets Cloudflare Pages au repo (déploiement au push) — nécessite l'OAuth Cloudflare↔GitHub côté dashboard
  → R&D : sortir les gros médias du repo (vidéo 17 Mo, HEIF, PDF)
Statut : EN COURS (règle non tenue : 45 fichiers non commités au 28/07 — cf. bulletin)

---

[2026-07-18] — DÉCISION 015
Pôle concerné : R&D / Commercial (Nabycook)
Décision : Abandon de la stack WordPress/Elementor recommandée dans le cahier des charges client, on part sur la stack maison (HTML sur mesure + Cloudflare Pages + back-office Supabase gaté OTP). Site découpé en 3 phases : Phase 1 socle institutionnel comprise dans le partenariat DMV, Phases 2 et 3 facturées en complément.
Validé par : Mac Arthur
Impacte : R&D, Commercial
Actions déclenchées :
  → Commercial : validation du périmètre par Nabintou toujours en attente (CDC v2 envoyé le 18/07)
  → R&D : Phase 1 attendue pour le forum des assos du 5 septembre — échéance ferme
Statut : EN COURS (validation cliente en attente)

---

[2026-07-17] — DÉCISION 014
Pôle concerné : Transverse / gouvernance
Décision : L'objectif 10 000 €/mois est recalé sur mi-2027 (juillet 2027), au lieu de fin août 2026 jugé hors d'atteinte. Base : moyenne réelle des ventes agence ≈ 275 €/mois. Progression par paliers.
Validé par : Mac Arthur
Impacte : Tous les pôles (cadre de référence de toutes les projections)
Actions déclenchées :
  → FAIT : CLAUDE.md, CONTEXT.md et pilotage_cap.date_objectif = 2027-07-31 mis à jour
  → DAF / Analyste : toute projection financière se réfère désormais à cet horizon, plus jamais à août 2026
Statut : ACTÉE

---

[2026-07-12] — DÉCISION 013
Pôle concerné : Transverse / tous
Décision : Réunion générale d'audit de performance et d'efficacité des 15 agents (référence : blueprint fondateur). Constat : 4 agents portent réellement l'agence (BÂTISSEUR, VENDEUR, MIROIR, PINCEAU), 8 sont dormants ou jamais activés, 3 par intermittence. Priorité de remise en route validée : les GARDE-FOUS d'abord (GARDIEN + PONT). Sort des 8 dormants : à trancher plus tard.
Validé par : Mac Arthur
Impacte : Tous les pôles (gouvernance)
Actions déclenchées :
  → GARDIEN : checklist + carte de déploiement créées (.claude/skills/gardien/references/checklist-deploiement.md) ; hook deploy-guard.js étendu aux commandes wrangler (FAIT)
  → PONT : registre de décisions réactivé, mois de juillet rattrapé (FAIT)
  → Chief of Staff : CR d'audit archivé comme réunion de référence pour la prochaine
Statut : ACTÉE (garde-fous livrés ; réactivation des autres agents à séquencer)

---

[2026-07-11] — DÉCISION 012
Pôle concerné : Produit / Stratégy
Décision : La Beynaumania (plateforme fan Serge Beynaud) construite en vraie plateforme, pas maquette. Adhésion GRATUITE (maximiser volume + ambassadeurs), monétisation en one-shot XPaye uniquement (événements payants + série spéciale + replays concert), ce qui enterre le blocage "XPaye ne fait pas le récurrent". Logique cheval de Troie : la visibilité de Serge (~10M followers) est le vrai gain.
Validé par : Mac Arthur
Impacte : Produit, Stratégy, Commercial
Actions déclenchées :
  → Live pro Cloudflare Stream différé, à proposer à Latiss comme offre premium "Concerts"
  → Remplir la plateforme de vrais membres ; protocole STAR FACTORY toujours en attente
Statut : ACTÉE

---

[2026-07-10] — DÉCISION 011
Pôle concerné : Commercial / Stratégy
Décision : Nouvelle grille tarifaire app métier : App simple 250€ / App pro dès 490€ / App pro+ dès 1200€. Remplace l'ancienne grille SOLO/ÉQUIPE/ENTERPRISE.
Validé par : Mac Arthur
Impacte : Commercial (devis), R&D (edge function generate-devis)
Actions déclenchées :
  → Barème synchronisé dans devis-express ET generate-devis/index.ts
  → Redéployer generate-devis sur Supabase pour que l'auto-devis applique la nouvelle grille
Statut : ACTÉE (redéploiement generate-devis à confirmer)

---

[2026-07-09] — DÉCISION 010
Pôle concerné : Stratégy / Commercial
Décision : Virage en phase de PROMOTION + multiplication des partenariats visibilité et business. Chaque partenariat de ce type se cadre avec le template standard de proposition d'échange (livrables/commercial/process-vente/template-proposition-echange.md). Premiers cas : Studio IA (Emmanuel Yao), Ayela.
Validé par : Mac Arthur
Impacte : Commercial, Contenu, tous
Actions déclenchées :
  → Cadrer chaque échange (périmètre borné côté presta, contrepartie chiffrée, forfait tiers domaine/hébergement)
  → Note d'audit 12/07 : la phase promotion suppose de réveiller ÉDITO/VOIX/CARBURANT (aujourd'hui dormants)
Statut : ACTÉE

---

[2026-07-08] — DÉCISION 009
Pôle concerné : R&D / Architecture
Décision : Consolidation des backends clients dans le projet Supabase partagé attractor-assists (tables préfixées par client) tant que l'agence reste en tier gratuit (limite 2 projets actifs), au lieu d'un projet dédié par client. Règle de sécurité non négociable à chaque greffe : RLS scopée à un UID précis, jamais auth.role()='authenticated' seul.
Validé par : Mac Arthur
Impacte : R&D (tous les nouveaux backends clients)
Actions déclenchées :
  → J'Envoie Express (je_), Livraison Pro (lp_), Beynaud (bey_), Studio IA (aic_) greffés sur le projet partagé
  → Faille corrigée sur J'Envoie Express (policy admin scopée à l'UID de Jean Yves)
Statut : ACTÉE

---

[2026-06-17] — DÉCISION 008
Pôle concerné : Produit / R&D
Décision : Carelle est la première duplication de Mac Arthur. Son brief est réécrit à partir du cas Kezey / C'real (premier cas réel validé en production). Elle automatise exactement ce que Mac Arthur a fait manuellement : collecte → 3 modèles → génération site → branchement Supabase → livraison lien. Plus de programmeur dans la boucle. Standard UX/UI impeccable sur les 3 templates.
Validé par : Mac Arthur
Impacte : R&D (Carelle engine), Produit (templates), Stratégy (scalabilité)
Actions déclenchées :
  → R&D : transformer le site C'real en template paramétrable (variables CSS + données JSON injectées)
  → R&D : construire les templates Modèle 2 (vitrine service) et Modèle 3 (menu livraison) au même niveau de qualité
  → R&D : ajouter notifications push CommandesScreen (P1)
  → R&D : ajouter souscription realtime sur CommandesScreen (P1)
  → Produit : Carelle engine — parcours onboarding automatisé (brief-onboarding-carelle.md V2)
Statut : ACTÉE

---

[2026-06-15] — DÉCISION 007
Pôle concerné : Produit / Transverse
Décision : Standard anti AI-slop pour tous les assistants clients — zéro emojis, zéro markdown, ton naturel et direct. L'assistant C'Real V1 a été jugé trop "chatbot générique".
Validé par : Mac Arthur
Impacte : R&D, Contenu
Actions déclenchées :
  → R&D : refondre les system prompts de tous les assistants clients Assists selon ce standard avant la campagne de contenu
  → Contenu : appliquer ce standard à tout livrable textuel produit par l'équipe pour les clients
Statut : ACTÉE

---

[2026-06-15] — DÉCISION 006
Pôle concerné : R&D / Stratégy
Décision : Le lien mini-site partagé en message d'accueil ou message d'absence WhatsApp résout le problème de l'API WhatsApp Cloud. Pas besoin de migration SIM. Les conversations publiques se stockent automatiquement en base (table conversations, is_public=true) — le CRM se nourrit seul.
Validé par : Mac Arthur
Impacte : Produit (Attractor Assists), R&D
Actions déclenchées :
  → R&D : afficher les conversations publiques dans le dashboard entrepreneur (CommandesScreen ou onglet dédié) — chantier identifié, à planifier
  → Stratégy : capitaliser sur l'insight "tandem WA + mini-site" dans les discours de vente et les démos
Statut : EN COURS (dashboard conversations publiques à livrer)

---

[2026-06-15] — DÉCISION 005
Pôle concerné : Produit / R&D
Décision : Nouveau concept produit validé — "sites de commande métier" : site web professionnel de commande généré depuis l'anamnèse conversationnelle, transmis au maquettiste + programmeur, avec upload photos depuis smartphone.
Validé par : Mac Arthur
Impacte : R&D, Stratégy/Contenu
Actions déclenchées :
  → R&D : planifier une session dédiée pour définir les écrans + flow commande de ce concept
  → Stratégy : intégrer ce concept dans le pitch commercial (différenciation forte vs landing page statique)
Statut : ACTÉE (session dédiée à planifier)

---

[2026-06-14] — DÉCISION 004
Pôle concerné : Stratégy / R&D
Décision : Business model Serge Beynaud validé — hybride : 1 500€ setup + 150€/mois + 3% revenue share Fan Club. NDA 1 page (Yousign) obligatoire avant toute présentation. Démo en live uniquement, jamais de lien envoyé par écrit.
Validé par : Mac Arthur
Impacte : Stratégy (closing), R&D (dev si GO)
Actions déclenchées :
  → Stratégy : préparer le NDA 1 page Yousign pour Serge Beynaud — envoyer avant présentation
  → Stratégy : fixer un rendez-vous présentation live (semaine du 17/06/2026)
  → R&D : déposer Enveloppe Soleau INPI (10€) pour horodater le concept BEYNAUD ARMY
Statut : EN COURS (NDA + RDV en attente)

---

[2026-06-13] — DÉCISION 003
Pôle concerné : Stratégy / Transverse
Décision : Rigueur juridique renforcée — présenter une checklist des clauses critiques AVANT toute rédaction contractuelle. Clause déclencheuse : NDA V1 Club Élévia refusé par Élise (6 points d'amélioration remontés après envoi).
Validé par : Mac Arthur
Impacte : Stratégy (tous les futurs clients), R&D (cadrage juridique projets)
Actions déclenchées :
  → Stratégy : créer une checklist standard des clauses critiques (PI, confidentialité, durée, non-concurrence, restitution données, juridiction) à valider avant toute rédaction
  → Tous les pôles : appliquer cette checklist sur tout document juridique futur
Statut : ACTÉE

---

[2026-06-11] — DÉCISION 002
Pôle concerné : Produit / R&D
Décision : Focus acquisition 3 semaines sur testeurs gratuits Attractor Assists — campagne Facebook groupes, LinkedIn, TikTok. Contenu rédigé (livrables/contenu/_archive/campagne-testeurs-juin2026.md). Aucune feature nouvelle pendant cette période.
Validé par : Mac Arthur
Impacte : Contenu, R&D (gel features pendant la campagne)
Actions déclenchées :
  → Contenu : publier la campagne (3 semaines : problème → preuve → urgence)
  → R&D : tracker source d'acquisition (param ?src=) à activer AVANT la campagne — bloquant
Statut : EN COURS (campagne à lancer, tracker source à activer en priorité)

---

[2026-06-09] — DÉCISION 001
Pôle concerné : Produit / Transverse
Décision : Renommage définitif "Jarvis" → "Assists" dans tout le workspace et le produit. L'assistant s'appelle "Assists" — cohérence de marque totale.
Validé par : Mac Arthur
Impacte : Tous les pôles (documents, code, communication)
Actions déclenchées :
  → Tous : ne plus jamais écrire "Jarvis" pour désigner le produit ou l'assistant
  → R&D : vérifier que le renommage est complet dans le code (FAIT en session 42-43)
Statut : COMPLÈTE

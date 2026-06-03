# Workspace History

> Journal chronologique de toutes les sessions et décisions importantes.
> Le plus récent en haut. Mis à jour automatiquement par Claude.
>
> **Comment ça marche :** Quand je lance la commande `/update` après une session importante, ou quand je raconte un changement significatif, Claude ajoute une entrée ici automatiquement. Je n'ai pas à écrire ce fichier manuellement.

---

## 2026-06-03 (session 26 — UX Mon équipe + FCFA primaire + Maryline fix)

### Fix opener Maryline
- Maryline tombait sur le fallback d'Awa ("je ne fais pas de conseils") faute d'opener défini dans OPENERS_AGENTS
- Nouvel opener : accueil guide, question de profil directe ("t'organiser, te faire connaître, ou vendre plus ?")

### Miriam débloquée au plan Growth
- `agentGating.js` : Miriam passe de rank >= 2 (Team) à rank >= 1 (Growth)
- PASSIVE_SUFFIX de Miriam mis à jour : "c'est dans le plan Growth"
- MARYLINE_SYSTEM : prix Growth et Team écrits FCFA en primaire, euros entre parenthèses
- Miriam ajoutée dans la liste des inclus du plan Growth

### FCFA en primaire dans "Mon équipe"
- `AGENT_PLAN_INFO` mapping créé : Miriam (9 900 FCFA / 15 €), Serge / Roland / Kofi (≈ 25 500 FCFA / 39 €)
- Badge carousel verrouillé : "Plan Growth" ou "Plan Team", sans montant
- CTA carousel verrouillé : "Voir la formule" (plus de prix affiché)
- Modal bio verrouillée : "Dispo dans le plan X · Découvre la formule pour débloquer [nom]"

### Carelle épinglée — restructuration de l'écran
- Carelle sort du carousel, devient une carte fixe entre Coach et le carousel
- Carte photo plein-fond + gradient, CTA contextuel : "Démo gratuite" / "Parler" / "Voir la formule"
- Carousel réduit à 5 agents : Awa, Miriam, Serge, Roland, Kofi
- Logique validée : projection d'abord, prix uniquement sur PaliersScreen

---

## 2026-06-03 (session 25 — Maryline bulle flottante + XPAYE sandbox validé)

### Maryline (ex-Hawa) — bulle flottante WhatsApp-style

- Renommage complet Hawa → Maryline dans data.js, agentGating.js, system prompt (`MARYLINE_SYSTEM`), edge function redéployée
- Maryline retirée du carousel et des avatars AssistantsScreen (badge "6 experts")
- Devient une bulle flottante fixe (bottom-right, z-40) : avatar + nom orange + message "Si tu as le moindre soucis ou si tu veux savoir tout ce qu'on peut faire ensemble ... demande moi" + timestamp "maintenant" + bouton × pour fermer
- Style WhatsApp message reçu : fond blanc, bordure sable, coins `18px 18px 18px 6px`, queue CSS gauche
- Visible sur tous les écrans sauf la conversation et l'admin. Tap → conversation Maryline

### Intégration XPAYE / PaiementPro — sandbox validé (PP-F422)

- Migration SQL 0021 : table `payments` (user_id, plan_id, reference, channel, amount, currency, status, gateway_response)
- Edge Function `init-payment` : auth via `getUser(token)`, insert référence en base, appel PaiementPro sandbox, retourne URL de paiement. Sandbox PP-F422, prod = `www.paiementpro.net` (auto-détecté selon merchant ID)
- Edge Function `payment-webhook` : notification silencieuse PaiementPro → update payments.status + profiles.plan_code si succès
- PaliersScreen PaymentSheet : 4 boutons (Wave=WAVECI, MTN=MOMOCI, Orange Money=OMCIV2, Carte=CARD) branchés sur `init-payment`, redirect vers URL PaiementPro, état error avec message réel + retry
- App.jsx : détecte `?payment_done=1` au retour, toast confirmation + reload profil pour afficher le nouveau plan
- Toujours FCFA (XOF/952) pour PaiementPro — gateway CI uniquement
- Bugs corrigés en cours : CORS (apikey manquant), numéro téléphone vide, montant EUR envoyé à la place du FCFA
- Pour passer en production : remplacer `XPAYE_MERCHANT_ID=PP-F422` par l'ID live dans les secrets Supabase

### Autres corrections

- Prix FCFA en grand (primaire), euros en option discrète — PaliersScreen et PaymentSheet
- Lien WhatsApp mort supprimé de ConversationScreen (bouton "Envoyer sur WhatsApp" + fonction `sendToWhatsApp`)

---

## 2026-06-03 (session 24 — Marketplace Attractor v2 + agent Hawa)

### Marketplace Attractor v2 (refonte complète de l'onglet "Experts")

**Architecture :**
- Onglet renommé "Experts" → "Marketplace" dans la nav
- 3 familles visuelles avec photos CI réelles :
  - Services (entrepreneur B2B bureau) : consultant, infographiste, vidéaste, photographe, formateur, développeur
  - E-commerçants (scène coworking kente) : cosmétique, bien-être, couture, produits divers
  - Food (table plats africains — attiéké, alloco, poulet braisé) : restaurant, traiteur, produits alimentaires
- Hero Marketplace : portrait studio Mac Arthur Baobab (#1 dans mon couloir) cadré à droite
- Gradient overlay réduit (15%→82%) pour que les photos CI restent visibles
- Sous-catégories filtrables par chips sous chaque famille

**Tarification :**
- Choix prestataire : detail (montant + unité, recommandé) ou "sur devis"

**CGV v1.0 et contrat signé électroniquement :**
- InscriptionFlow 4 étapes : catégorie → infos pro → tarification → CGV
- CGV complètes : engagement qualité, fausses promesses, RGPD (loi française + ARTCI CI), droit de retrait, clause signature art. 1366 Code civil
- Accepter = signer : contrat HTML complet envoyé par email (Resend) avec date et nom du signataire
- Edge Function `marketplace-signup` déployée sur Supabase
- Migration SQL 0020 : colonnes ajoutées (categorie_principale, sous_categorie, pricing_type, pricing_details, email, cgv_accepted_at, cgv_version)

**Navigation enrichie :**
- Badges live sur tous les onglets : nb agents actifs (Mon équipe) + nb prestataires visibles (Marketplace)
- Même pattern desktop (sidebar) et mobile (bottom nav)

### Agent Hawa — Guide & Découverte (8e agent, plan Gratuit)

**Profil :**
- Bouaké, fille de commerçante. Mémorise ce que les gens disent, ne disent pas, et veulent vraiment.
- Photo : hawa.jpg déployée dans public/uploads/agents/

**Rôle et comportement :**
- Accessible depuis le plan Gratuit (comme Coach et Awa)
- Détection de profil proactive : lit couloir dominant (organisation/visibilité/ventes), plan, zone (CI/EU), profil dominant
- Connaissance des 13 fonctionnalités complètes + 4 plans avec vrais prix CI et EU
- Pédagogie pas à pas : 1 fonctionnalité à la fois, expliquée en situation réelle ("par exemple si un client est inactif depuis 3 semaines...")
- Propositions commerciales naturelles uniquement quand la feature du plan supérieur résout ce que l'utilisateur vient d'exprimer
- HAWA_SYSTEM injecté dans chat-assistant, redéployé sur Supabase

**Badge mis à jour :** AssistantsScreen "6 experts" → "7 experts"

### Test utilisateur — points de vérification

**Parcours complet validé :**
- Onboarding : narrative CoS, carnet quick win, décharge vocale
- Dashboard : hero immersif, quick actions, conseil clients inactifs
- Mon équipe : hero avatars, carousel 7 spécialistes (Coach épinglé + 7 slides), gating par plan
- Hawa : slide visible, accessible Gratuit, ouverture avec détection de profil
- Carelle : demo Gratuit (4 questions + maquette auto), full Growth+
- Marketplace : hero fondateur, 3 cards photos CI, sous-catégories, InscriptionFlow 4 étapes, CGV
- Profil : dark mode, parrainage, méthode ATTRACTOR

**Chantiers identifiés pour la prochaine session :**
- Mini-agents (6 process validés à injecter dans le system prompt, ~6h, zéro code)
- Awa qualification flow (questions avant séquence de vente)
- Paiements XPAYE en production (sandbox PP-F422 validé)
- Campagne de contenu (plan éditorial + lancement)

---

## 2026-06-03 (session 23 — Phase 4 : agents dynamiques + démo Carelle + Marketplace)

### Phase 4 livrée

**Module 1 — Accès agents dynamiques :**
- `agentGating.js` créé : `resolveAgentStatus()` calcule l'accès selon le `plan_code` réel de l'utilisateur
- Gratuit : Coach + Awa actifs, Carelle en mode "Essai gratuit", 4 autres verrouillés "Plan Team"
- Growth : Carelle pleinement active, 4 autres verrouillés
- Team : tous les 6 agents actifs
- Correction "Manager" → "Team" dans toute l'interface (badges, textes, system prompts)

**Module 2 — Démo Carelle (accessible depuis plan Gratuit) :**
- CTA "Voir ma démo gratuite" (amber) sur le slide Carelle en mode `demo`
- ConversationScreen : mode démo détecté via `params.mode === 'demo'`, opener Carelle dédié
- Bouton flottant jaune "Générer ma maquette" apparaît après 4 échanges utilisateur
- Maquette générée automatiquement via Edge Function `generate-maquette` (sans intervention Mac Arthur)
- Card résultat dans la conversation : lien démo + 2 CTA upgrade (hébergé Attractor Growth / personnalisé Famille A)
- Prospect créé automatiquement en base (`type_projet='C'`, `statut='nouveau'`) au premier message pour tracking Mac Arthur dans le Pipeline Cockpit
- `chat-assistant` redéployé : `CARELLE_DEMO_SUFFIX` injecté en mode démo, Carelle sans `PASSIVE_SUFFIX` pour Growth+

**Module 3 — Marketplace :**
- Onglet "Experts" ajouté en 3e position dans la nav (4 onglets total : Accueil / Mon équipe / Experts / Profil), FAB coach centré entre onglets 2 et 3
- `MarketplaceScreen.jsx` créé : hero charbon, filtres par catégorie (Tous/Dev/Design/Marketing/Finance/Logistique/Autre), cards prestataires avec contact WhatsApp direct
- Formulaire d'inscription prestataire : WhatsApp obligatoire (format international) pour vérification avant validation
- Migration SQL `0019_prestataires.sql` appliquée : table `prestataires` (RLS public read+insert, admin update)
- Hub MacCockpit : section "Marketplace — prestataires en attente" avec Valider/Rejeter + lien WA de vérification

---

## 2026-06-03 (session 22 — Phase 3 : Hero UI, carousel agents, PaliersScreen 4 tiers)

### Phase 3 livrée

**PaliersScreen — 4 tiers :**
- Hero charbon avec barre de progression visuelle 4 étapes (Gratuit → Growth → Team → Personnalisé)
- Gratuit (0€), Attractor Growth (15€/9 900 FCFA), Attractor Team (39€/~25 500 FCFA), Application Personnalisée (sur devis, Barème Famille A)
- Features dépliables : 2 affichées par défaut, chaque feature avec titre + ligne d'explication
- XPAYE ajouté dans la PaymentSheet (stub "Bientôt disponible", sandbox PP-F422)
- CTA "Parler à Carelle" pour l'Application Personnalisée

**AssistantsScreen — hero + carousel :**
- Hero charbon : titre "Ton équipe.", avatars circulaires scrollables, glow orange animé, badge "6 spécialistes en ligne"
- Carousel horizontal 6 slides (Awa, Miriam, Serge, Roland, Kofi, Carelle) : CSS snap scroll, swipe natif, dots + flèches
- Chaque slide : photo portrait plein écran, gradient overlay, rôle + nom grand format, teaser vivant, quick actions, CTA orange/amber
- Coach (Bras Droit) épinglé séparément au-dessus du carousel
- Tap sur un avatar du hero → scroll automatique vers le slide correspondant

**DashboardScreen — hero immersif :**
- Hero 260px : image de fond `/uploads/photo-paliers.jpg` à 18% + dégradé orange→charbon sur 165°
- Double halo lumineux (blanc haut-droit + orange bas-gauche)
- Salutation contextuelle selon l'heure (Bonjour / Bonne après-midi / Bonne soirée / Bonne nuit) + jour de la semaine
- Tagline "Qu'est-ce qu'on règle aujourd'hui ?" + sous-titre "Dis, dicte ou tape — l'équipe est prête."
- Barre messages redessinée : fond dark blur, plus discrète

**Autres corrections :**
- Onglet "Mon équipe" : icône `bot` (robot) remplacée par `users` (groupe de personnes)
- Fix encodage : 6 fichiers corrigés (AgendaScreen, AxesScreen, BroadcastsScreen, ConversationScreen, MasterSheetScreen, NotificationsScreen) — garbled UTF-8 via Windows-1252 éliminés
- Script `fix-encoding.js` conservé à la racine pour usage futur

### Décision prix confirmée
- Attractor Team : 39€/mois (~25 500 FCFA) — définitif

---

## 2026-06-03 (session 21 — Refonte stratégique Attractor Assists : Phase 1 + Phase 2)

### Décision de refonte stratégique
- Vision validée : Attractor Assists devient le Chief of Staff numérique des entrepreneurs africains (Mr Attractor)
- Nouvelle architecture 4 tiers : Gratuit / Attractor Growth (9 900 FCFA CI | €15 EU) / Attractor Team (~€29-49) / App Personnalisée (barème Famille A)
- Plan `prancy-strolling-tide.md` approuvé, exécution par phases
- Décisions validées : Whisper API pour la voix, Carnet V1 clients+prospects, séquençage phase par phase, prix zone-based

### Phase 1 livrée (onboarding + carnet d'affaires)
- OnboardingScreen réécrit : narrative Mr Attractor Chief of Staff, 1 slide typewriter, prénom, secteur chips, 3 questions CoS, quick win (premier client dans le carnet pendant l'onboarding), présentation équipe 3 niveaux
- CarnetAffairesScreen créé : CRM léger utilisateur (clients + prospects), ajout/édition/suppression, deeplink WhatsApp, alerte inactivité 14 jours
- DashboardScreen : support plan_code gratuit/growth, bouton décharge vocale dark en accès prioritaire, quick actions Carnet + Agenda, conseil automatique clients inactifs
- InstallScreen : icône Attractor visible + message "Mr Attractor en 1 tap, tout le temps"
- Migrations SQL 0017 (carnet_affaires) + 0018 (plan_codes) appliquées sur Supabase

### Phase 2 livrée (décharge vocale)
- DechargeVocaleScreen : micro (appui) → Whisper transcrit → Claude Haiku extrait tâches/clients/rappels/idées → cartes cochables → sauvegarde sélective (tâches/rappels → agenda, clients → carnet, idées affichées seulement)
- Edge Function `process-dump` déployée sur Supabase (`lgdgbrivnhgeupqhkckd`)
- Clé `OPENAI_API_KEY` ajoutée dans Supabase Secrets (crédit OpenAI : 4,27$, expire juillet 2026)
- 3 commits poussés sur master, déploiement Netlify déclenché automatiquement

### Prochains chantiers
- Phase 3 : PaliersScreen 4 tiers + XPAYE (sandbox PP-F422 déjà validé)
- Phase 4 : Attractor Team agents redéfinis + Application Personnalisée pipeline

---

## 2026-06-03 (session 20 — Cockpit MacCockpitScreen : generate-maquette + hero Carelle + Pipeline 2 phases)

### Edge Function generate-maquette
- Fix déploiement : la fonction devait être lancée depuis `livrables/.../app/`, pas depuis la racine du workspace
- Fix clé API : `ANTHROPIC_API_KEY` → fallback `CLAUDE_KEY` (secret déjà configuré en base)
- Ajout support vision Claude Haiku : image uploadée (base64) envoyée dans le message pour extraire les couleurs et le style
- Upload image dans la Sheet Fam. A : bouton + preview + suppression, en plus du champ URL

### Nettoyage code mort MacCockpitScreen
- Suppression des états et fonctions de l'ancienne flow "upload image + message WhatsApp" : `buildMaquetteMsg`, `copyMaquetteMsg`, `showAddContext`, `maquetteMsg`, `maquetteCopied`
- `openFamASheet` : cliquer sur un prospect Fam. A ouvre directement l'orchestration (plus de query `sequences_vente`). Si `maquette_url` existe sur le prospect, le lien est pré-rempli

### Hero Pilotage — photo Carelle
- Photo `carelle.jpg` en fond plein écran, cadrée haut
- Gradient bas → transparent (même recette agenceattractor.com, adapté mobile vertical)
- Glow orange animé coin bas droit
- Pill badge "Chief of Staff · Coordination" avec point orange pulsé
- Titre "Pilotage" 34px + sous-titre avec "Carelle" en orange
- Chips contextuelles + CTA "Parler à Carelle"

### Pipeline Fam. A — 2 phases distinctes
- Phase 1 (avant alerte) : ref visuelle (upload image + URL), textarea "Ce que tu sais déjà", bouton "Alerter les agents"
- Phase 2 (après alerte) : badge "Agents briefés", plan Carelle (ou indicateur de chargement), textarea "Répondre aux questions de Carelle", bouton "Lancer la production →"
- Fix spinner : `alerteLoading(false)` déclenché immédiatement après les journal entries, sans attendre Carelle
- Fix resilience : toutes les opérations DB sont fire-and-forget, Carelle répond en arrière-plan

### Carelle — une question à la fois
- Règle ajoutée dans `CARELLE_SYSTEM` du fichier `chat-assistant/index.ts` et redéployée
- Règle aussi ajoutée dans les messages de `carelleBriefProspect` et `alerteAgents`

---

## 2026-06-03 (session 19 — Pilotage + orchestration Fam. A + maquette Rukayatou)

### DNS demo.agenceattractor.com
- CNAME `demo` ajouté dans GoDaddy → `inspiring-frangipane-9631b1.netlify.app`
- Sous-domaine propagé et opérationnel

### J'envoie Express — mobile-first
- Sidebar cachée sur mobile, hamburger ☰ + drawer overlay
- KPI grid 2 colonnes, grilles en colonne unique, tableaux scrollables horizontalement

### Bug fix — Pipeline Fam. A
- `saveProspect` appelait `generateSequence` (Awa) pour tous les types
- Fix : Fam. A → `carelleBriefProspect` (Carelle), Fam. B/C → `generateSequence` (Awa)
- Texte chargement et bouton différenciés selon le type
- `await loadAll()` retiré de `generateSequence` (cascade setState bugguée)

### Maquette Rukayatou Saka
- Maquette "XPaye Pro" produite et déployée : `demo.agenceattractor.com/rukayatou`
- 4 écrans : Accueil, Agent commercial IA, Réseau CI, Résultats
- Script de closing rédigé (lien + prix + acompte)

### Redesign Carelle → "Pilotage"
- Écran Carelle renommé "Pilotage"
- Hero charbon en haut : titre, sous-titre Sora/mono, chips contextuelles (prospects actifs, dernière action)
- Bouton "Parler à Carelle" orange → scroll vers chat + focus input
- Chat passé en light mode : fond sable, messages user orange, messages bot blanc/g200
- Orb micro conservé marron-noir + glow orange (contraste premium sur fond blanc)
- Input : fond sable, border g200, texte charbon

### Pipeline Fam. A — Orchestration complète
- Suppression upload image → champ URL référence visuelle (site/réseaux du prospect)
- Textarea "Infos complémentaires" avec append automatique dans `prospects.contexte`
- Bouton "Alerter les agents" → Carelle orchestre via `chat-assistant` + journal_agent écrit pour Éclaireur, Programmeur Senior, Maquette Closer
- Bouton "Lancer la production →" (orange) → Edge Function `generate-maquette`
- Affichage lien généré + Copier + Mettre à jour (même URL, contenu régénéré)

### Edge Function generate-maquette (nouvelle)
- Fichier : `supabase/functions/generate-maquette/index.ts`
- Flow : charge prospect → construit brief → Claude Haiku génère HTML maquette → upload Supabase Storage bucket `maquettes` → retourne URL publique
- SQL à appliquer : `ALTER TABLE prospects ADD COLUMN IF NOT EXISTS maquette_url TEXT;` + création bucket `maquettes`
- Déployée via `npx supabase functions deploy generate-maquette --project-ref lgdgbrivnhgeupqhkckd --no-verify-jwt`

### Note stratégique actée
- Refonte complète d'Attractor Assists prévue avec changement de modèle économique — à planifier en session dédiée

---

## 2026-06-02 (session 18 — MacCockpitScreen + demo site + circuit visiteur site)

### MacCockpitScreen — tableau de bord admin sur mesure
- Nouveau screen `MacCockpitScreen.jsx` remplace AdminScreen pour le compte admin
- 4 onglets : Carelle (hub voix/TTS dark), Agence (31 agents + historique), Pipeline (prospects + maquette-closer), Hub (stats + broadcasts + MIROIR + feedbacks)
- Bypass onboarding/activation pour admin : connexion directe sur Carelle
- Carelle : format messages corrigé (chat-assistant), une question à la fois, contexte agence injecté
- Bouton déconnexion dans Hub, suppression prospect + changement statut dans Pipeline
- SQL 0016 exécuté : compte macarthur.nguessankouassi@gmail.com en manager + admin

### demo.agenceattractor.com
- Sous-domaine Netlify configuré (DNS en propagation)
- Maquette J'envoie Express déployée : `demo.agenceattractor.com/jenvoie-express`
- Structure `livrables/clients/demo-site/public/[client]/index.html` pour les prochains clients

### Circuit visiteur site agenceattractor.com → Pipeline (LIVRÉ)
- `sendProspect` branché sur Supabase REST API (remplace Apps Script Google Sheets)
- Collecte : prénom, activité, besoin, zone, numéro WhatsApp
- Chip "Autre" dans besoin → input texte libre
- Suppression bouton WhatsApp sticky et lien wa.me (court-circuit manuel éliminé)
- Message de clôture : confirmation 24h + lien demo, sans redirection vers Attractor Assists
- Listener realtime dans le cockpit : alerte toast + prospect dans Pipeline en temps réel

### Déploiements
- Site agenceattractor.com : passage en `workflow_dispatch` uniquement (plus d'auto-deploy)
- Fix warning Node.js 24 sur GitHub Actions

---

## 2026-06-02 (session 17 — cockpit admin restructuré + pivot B2B + gardien déploiement)

### Cockpit admin — refonte complète
- Nav conditionnelle : admin voit "Cockpit" dans la nav (AdminScreen), users voient "Mon équipe" (AssistantsScreen). Basé sur `profile?.role === 'admin'`
- Onglet "Awa" renommé "Pipeline" — workflow Carelle par statut (Nouveau/Contacté/Relancé/Closé/Perdu), chaque groupe collapsible
- Section Users : liste plate → 6 rubriques collapsibles (À surveiller, En ligne, Manager, Découverte, Onboarding incomplet, Inactifs)
- ProfilScreen : bouton "Tableau de pilotage" supprimé (plantait, rendu obsolète par la nav Cockpit)

### Mon équipe vivant
- Badges Supabase live : nb prospects actifs pour Awa (count), dot vert/orange selon journal_agent et dernière interaction
- Teasers dynamiques par heure (matin/après-midi/soir/nuit) + override si données réelles disponibles
- Strip activité horizontal en haut de l'écran (journal agents + prospects en attente)
- Quick actions contextuelles par agent : 2 chips cliquables qui ouvrent la conversation avec message pré-rempli

### Maquette closer flow (Famille A)
- Sheet prospect Famille A : bannière "Mode Maquette", upload image ou URL référence, preview, message Awa pré-rédigé éditable
- Guide 2 étapes vendeur : "Envoie l'image d'abord → Copie le message"
- Au copy : Carelle reçoit automatiquement un brief dans journal_agent ("Maquette proposée à [Prénom]")

### Fix encodage ConversationScreen
- Tous les caractères garbled (Ã©, â€", etc.) corrigés dans ConversationScreen.jsx
- Bug présent depuis l'origine : les agents s'exprimaient en mojibake dans toutes les conversations

### Fix devis
- type_projet 'app'/'consulting' → 'A'/'B'/'C' dans le formulaire prospect (mismatch avec l'Edge Function generate-devis)

### Gardien de déploiement (nouveau)
- Script `.claude/hooks/deploy-guard.js` créé
- Hook PostToolUse sur Bash : déclenché après chaque `git push`
- Vérifie : imports App.jsx → screens existants, encodage garbled, cohérence routes
- Exit 0 toujours — signale sans bloquer

### Pivot stratégique B2B (décision clé)
- Mac Arthur est le vendeur B2B, pas Awa. Awa n'écrit plus de messages de prospection pour lui
- Le Pipeline est le cockpit de closing personnel de Mac Arthur
- Awa observe les patterns de vente de Mac Arthur et les réapplique dans l'interface des utilisateurs Attractor Assists
- Carelle = coordinatrice : Famille A → maquette first ; Famille B → séquence consulting

### Prospect Rukayatou (cas pratique)
- Package : Attractor Assists marque blanche (Fam. A ÉQUIPE, 520€ setup + 180€/mois) + consulting visibilité (Fam. B RUNNER, 350€). Total M1 : 1 050€
- Partenariat XPaye : agent commercial pour son réseau d'entrepreneurs CI
- Livrables produits manuellement : message collecte info, brief Programmeur, devis draft, cahier des charges
- Bloquant : logo + couleurs + nom de l'outil à récupérer

### SQL en attente
- 0016 : passer macarthur.nguessankouassi@gmail.com en plan_code='manager' + role='admin' (à exécuter dans Supabase dashboard)

---

## 2026-06-02 (session 16 — corrections UX + Jarvis cockpit smartphone + voix)

### Corrections Attractor Assists (livrées en production)
- Dark mode persistant : état sauvegardé en localStorage, plus de reset au relaunch
- Fix écran noir généralisé : `min-h-full` → `min-h-screen` sur tous les screens (Dashboard, Assistants, Profil, Agenda, Méthode, Paliers, Notifications, Conversation, Axes, Broadcasts, MasterSheet) + body background fixé en sable au lieu de noir
- Fix connexion WiFi : `getUser()` → `getSession()` dans loadProfile (lecture localStorage sans appel réseau, résout les blocages sur WiFi lent/captif/entreprise)
- Astuces du jour : carousel 3 tips rotatif avec dots et auto-rotation 5s
- Pleine puissance AgentBioModal : photo hero 260→200px, scroll iOS amélioré (pb-24, WebkitOverflowScrolling)
- AdminScreen : liste utilisateurs paginée (8 + "Voir les X autres"), onglets scrollables
- Resources admin : Excalidraw (lien mort) et Paperclip (login requis) supprimés, remplacés par accès Supabase + Netlify uniquement
- Messages d'erreur login enrichis (portail captif, délai OTP WiFi)

### SQL à exécuter dans Supabase (pas encore fait)
- Passer le compte macarthur.nguessankouassi@gmail.com en `plan_code = 'manager'` + `role = 'admin'`

### Jarvis Cockpit — piloter les agents depuis le smartphone
- Nouvelle Edge Function `jarvis-cockpit` déployée sur Supabase : Carelle incarne tous les agents Jarvis (Edito, CM, Commercial, DAF, Eclaireur, Analyste, Chef de projet, Ambassadeur, Boussole, Programmeur) via un seul point de contact
- Onglet "Jarvis" dans AdminScreen : interface dark immersive (fond #0d0b09), orbe central animé (arc reactor style), anneaux orbRing CSS, animations glowPulse
- Voix : Web Speech API fr-FR, reconnaissance en temps réel, transcript visible, envoi automatique à la fin de phrase
- TTS : Jarvis lit les réponses à voix haute (SpeechSynthesis fr-FR), bouton "Écouter" par réponse, bouton "Stop" en header
- Suggestions rapides cliquables (CM, Commercial, Eclaireur, DAF)
- Input texte en fallback discret sous l'orbe
- Historique compact en bas avec codes couleur par agent
- Compatibilité : Android Chrome (parfait), PWA iOS (ok), Safari iOS (fallback texte)

### Décision actée : circuit visiteur site → Carelle
- Principe validé : chat qualification sur agenceattractor.com → Supabase table `prospects` → notification cockpit → Carelle génère séquence Awa → Mac Arthur envoie sur WhatsApp en 1 tap
- À implémenter en prochaine session dédiée

### Prochaine session
- Exécuter le SQL compte admin Manager
- Implémenter le circuit visiteur site agenceattractor.com → Supabase → Carelle

---

## 2026-06-02 (session 15 — vie aux agents + infrastructure complète)

### Agents Attractor Assists enrichis (personnalités complètes)
- System prompts enrichis avec origine, tics, phrases signature, backstory de la bible des personnages : Awa (Treichville, règle 48h), Miriam (847k vues attiéké, horaires CI), Serge (14 cahiers Oxford, 8h pile), Roland (Grand-Bassam / Bordeaux, métaphores pêche), Kofi (Adjamé, grand-père griot — bio corrigée)
- Carelle ajoutée comme 7e agent (Chief of Staff / Coordination, Manager) avec frontières explicites : délègue toute demande de vente à Awa, jamais de recouvrement
- Nouvelles photos agents (AWA.png, MIRIAM.jpg, SERGE.jpg, ROLAND.jpg, Kofi.jpg) copiées en production
- Bible des personnages archivée : `livrables/contenu/bible-personnages-attractor-office.md`

### MIROIR — déployé et actif
- Edge Function `miroir` déployée sur Supabase (Deno, Claude Haiku 4.5)
- Tables SQL créées : `decisions`, `methode_miroir`, vue `referentiel_actif`
- Secret `CLAUDE_KEY` configuré
- Anti-hallucination : preuve obligatoire, contradictions remontées dans `a_arbitrer`
- Onglet Miroir dans le cockpit admin : référentiel actif + ajouter décisions VALIDÉ/REJETÉ + arbitrage au pouce
- Injection live : chaque appel `chat-assistant` charge les principes haute confiance et les injecte dans tous les agents de tous les utilisateurs

### Infrastructure crons (3 jobs actifs)
- `miroir-reveil` : toutes les 30 min — analyse décisions non traitées
- `notify-auto-matin` : 8h chaque jour — streak + quota utilisateurs
- `collect-insights-matin` : 7h chaque jour — conversations 24h → thèmes → décision MIROIR

### CRM Prospects + Journal agents
- Table `prospects` (pipeline Mac Arthur), `sequences_vente`, `journal_agent`, `insights_users`
- Edge Function `generate-sequence` : Awa génère une séquence 3 messages (premier contact, relance 48h, closing 96h) prêts à copier/envoyer WA
- Edge Function `collect-insights` : analyse conversations 24h, extrait thèmes récurrents, pousse vers MIROIR
- Onglet "Awa" dans cockpit admin : formulaire prospect + séquence générée + copier/WA direct + pipeline statuts

### Skill Attractor Office créé
- Nouveau skill Jarvis `/attractor-office` : scénariste de la série, connaît les 7 personnages, scènes canoniques, 5 formats de contenu, règles éditoriales

### Modules archivés
- COMPTEUR financier : SQL + interface HTML + README → `livrables/ecosysteme-attractor/compteur/`
- Module voix : voice-input.js + whisper-client.js + Edge Function + démo → `modules/voix/`
- Page consulting HTML → `livrables/clients/`

### Règles architecturales gravées dans CONTEXT.md
- Mac Arthur = seul décideur de ce qui est injecté chez les utilisateurs
- Circuit validé : son cockpit → MIROIR → tous les agents
- Frontières agents : chacun dans son couloir, Carelle délègue la vente à Awa

### Devis automatique + vérification système 100% live

**generate-devis Edge Function (déployée) :**
- Barème officiel Attractor embarqué (Famille A/B/C, SOLO/EQUIPE/ENTERPRISE, EUR/FCFA)
- Classification automatique selon type_projet + nb_users + zone du prospect
- Calcul : setup HT, MRR, acompte (50%), solde, total M1, numéro ATR-2026-NNNN
- Jamais de prix hors barème — si info manquante, question posée plutôt que devis inventé
- Devis affiché pour validation Mac Arthur avant tout envoi

**Formulaire prospect enrichi :**
- 2 nouveaux champs : Type de projet (Fam. A/B/C) + Nb utilisateurs (1 / 2-5 / 5+)
- A la création : séquence Awa + devis générés en parallèle automatiquement

**Tables Supabase créées (toutes actives) :**
- prospects, sequences_vente, journal_agent, insights_users, devis_prospects (31 tables total)

**Vérification système 100% live :**
- 13 Edge Functions ACTIVE : generate-livrable, activation-sequence, analyze-presence, chat-assistant (v14), extract-memories, notify-update, notify-auto, challenge-register, challenge-day, miroir, generate-sequence, collect-insights, generate-devis
- 3 crons actifs : miroir-reveil (*/30min), notify-auto-matin (8h), collect-insights-matin (7h)
- 31 tables Supabase en production
- Schéma B2B Excalidraw publié

**Section Ressources dans cockpit admin :**
- Liens directs : schéma Excalidraw + Supabase + Netlify + Paperclip

**Prochain sujet identifié :**
- Générateur d'Apps Métier (modèle Shopify, copies à l'infini) + partenariats stratégiques

### Benchmark Paperclip (fait en fin de session)
- Paperclip.ing analysé : orchestration d'agents en org chart hiérarchique, open-source MIT, auto-hébergé, agnostique LLM (Claude, Codex, Gemini...)
- Fonctionnalités : budget par agent, ticket system avec audit immuable, heartbeats (crons), gouvernance (approbation embauches agents)
- Avantage Attractor Assists confirmé : MIROIR (moat imprenable — fondateur qui s'améliore = tous les utilisateurs qui s'améliorent), ancrage culturel CI/diaspora, méthode ATTRACTOR propriétaire, done-for-you, mobile-first PWA
- Ce qu'ils font qu'on n'a pas encore : budget control par agent, audit trail immuable par décision
- Schéma visuel écosystème complet (démos B2B) : outil Excalidraw chargé, à produire prochaine session

---

## 2026-06-01 (session 14 — déploiement site + challenge 7 jours flow complet)

### DNS et déploiement agenceattractor.com
- DNS GoDaddy corrigés (4 A records GitHub Pages — anciens records pointaient vers AWS/autre hébergeur)
- Branche `gh-pages` déployée via GitHub Actions (CLI Supabase utilisé pour débloquer)
- Site nouvelle version confirmé live en navigation privée mobile

### Challenge 7 jours — flow complet livré
- `challenge.html` : page des 7 jours branchée Supabase (design sable/charbon/orange, Sora)
- Modal de capture prénom + email sur le site principal (remplace href /challenge mort)
- Edge Function `challenge-register` : upsert lead + envoi ebook via Resend (testé OK, mail reçu)
- Edge Function `challenge-day` : sauvegarde réponse jour + email nurturing (7 emails Koffi/Awa/Monsieur S.)
- SQL `0011_challenge.sql` appliqué : tables `challenge_leads` + `challenge_responses`
- Déploiement CLI `--no-verify-jwt` (dashboard ne déployait pas le code correctement)
- Ebook PDF : `https://drive.google.com/uc?export=download&id=1Gh-lZjJVK_Q-HTV0s4-fV4zxRShHP-jc`
- WA coaching : +225 05 76 87 70 70
- Clé anon Supabase ajoutée dans les fetch HTML (architecture publique sans auth)

### Prochaine session
- Préparation campagne digitale (contenu, ads, séquences)

---

## 2026-06-01 (session 13 — redesign agenceattractor.com + infrastructure complète)

### Site agenceattractor.com redesigné et déployé
- Design light mode : fond sable/blanc, orange signature, Sora + Space Mono
- Hero avec image entrepreneur CI, accroche "Conçu pour soulager les entreprises."
- Chat Mac Arthur : funnel qualification 4 questions → recommandation → Apps Script
- Section "Ce que nos clients ne font plus seuls" : 6 cartes cliquables (veille marché, relances, app 7j, contenu, finances, plan Manager), icônes Lucide SVG
- Équipe complète : Mac Arthur (bio coach prépa mentale, duplication IA, 100 projets), Carelle (Chief of Staff, depuis 2009), Awa/Miriam/Serge/Roland/Kofi avec catchphrases fun
- Apps métiers : J'envoie Express (mockup browser bleu + logo), MY NUGO (mockup browser + logo + lien live https://mynugo.store/), "Et bientôt ton site intelligent"
- Challenge 7 jours : section avec 7 étapes + photo communauté (132 participants)
- Pixel Facebook 1225122193019269 intégré : InitiateCheckout, Lead, ViewContent + tracking comportemental (scroll depth, temps, sections)
- Déploiement GitHub Actions (peaceiris/actions-gh-pages v4) : push master → publication automatique
- DNS GoDaddy configurés (4 A records GitHub Pages + CNAME www) → DNS check vert

### Infrastructure Attractor Assists complétée
- SQL 0009 (methode_votes) appliqué en Supabase
- SQL 0010 (admin_chats) appliqué en Supabase + realtime activé
- Edge Functions notify-update + notify-auto déployées sur Supabase
- Webhook Netlify configuré : deploy succeeded → notify-update (secret query param)
- WEBHOOK_SECRET ajouté dans Supabase Edge Functions secrets
- Notifications auto : déploiement → notif users, sinon pensée du jour (20 extraits écrits Mac Arthur)
- Chat admin ↔ users : interface dans AdminScreen + réponse côté user dans NotificationsScreen

### Fixes Attractor Assists (session 13)
- Profil agents : phrase coupée Pleine puissance (overflow iOS Safari corrigé), genre dynamique (champ `genre` m/f), animations entrée stagger 65ms

---

## 2026-06-01 (session 12 — tableau de pilotage, dark mode, bibliothèque Méthode)

### Tableau de pilotage admin (livré sur master)
- Fix critique : `last_seen` manquant dans la requête Supabase (statuts "En ligne" jamais affichés)
- Taux d'activation affiché sous la stat Onboarding
- Onglet Feedbacks : liste filtrée bug/besoin/autre, badge nouveaux, marquage traité
- Clic sur un utilisateur : Sheet de détail (profil, ouverture, mémoire, activité, conversations)
- Migration 0006 appliquée en Supabase (policy UPDATE admin feedback)

### Fix dark mode (livré sur master)
- `color: #F5F0E8` sur `.theme-dark` = couleur de base pour tout texte sans classe
- `color-scheme: dark` pour éléments natifs (input, select)
- Hover `bg-white` et `bg-sable` neutralisés en mode sombre

### Fix login bloqué (livré sur master)
- Bug : `loadProfile` échouait → `setPhase("login")` no-op → LoginScreen gelé sur "On prépare ton espace"
- Fix : `loginKey` incrémenté à chaque erreur pour forcer le remount de LoginScreen
- `supabase.rpc().catch()` remplacé par `.then(null, () => {})` (API Supabase v2)

### Bibliothèque La Méthode ATTRACTOR (livré sur master)
- Bouton "La Méthode" dans le Dashboard
- MéthodeScreen : 5 livres, 1 disponible (Framework), 4 "Bientôt disponible"
- Framework ATTRACTOR lu depuis markdown structuré (`public/methode/framework.md`)
- 6 questions PPSD progressives via marqueurs `[Q:key]` dans le markdown
  → Sauvegarde en base : ppsd.lieux_cible, problemes, peurs, souhaits, desirs, declencheurs
- 2 questions pratiques : canal_principal + activite (profiles)
- Bloc "Défi" : contacter un client sur ce qu'on lui a vendu
- Champs toujours vides, réponse existante affichée en "Déjà noté" sans pré-remplir
- 4 ebooks "Bientôt disponible" avec teaser + vote (table methode_votes, migration 0009)
- Zéro emoji dans l'interface, badges numérotés 01-05 CSS
- Merge dev → master, déployé en prod sur assists.agenceattractor.com

### SQL à appliquer en Supabase
- 0009_methode_votes.sql : table `methode_votes` + policies (votes ebooks)

### Chantiers planifiés (prochaines sessions)
- Tracker source d'acquisition : param `?src=` dans URL → sauvegardé dans profiles
- Option B Méthode : extraits visuels dans les conversations (balises `[EXTRAIT:...]`)
- Partage WhatsApp + réseaux sociaux à la fin des ebooks avec lien tracké
- 4 autres ebooks à rédiger en markdown dans `context/import/methode-md/`
- Système autonome feedback-to-dev (validé session 11, à implémenter)
- Challenge 7 jours dans Attractor Assists (ChallengeScreen, agent Monsieur S.)
- Pixel / profilage avancé après validation du trafic

---

## 2026-06-01 (session 11 — WhatsApp V1, feedback, notifications, benchmark Limova)

### Benchmark stratégique : Limova.ai
- Analyse complète de Limova (9 agents, 70-120€/mois, 28k users, Made in France Nice)
- Avantage compétitif confirmé : différenciation culturelle CI/diaspora, méthode ATTRACTOR propriétaire, mobile money, ton Koffi/Awa
- Limova valide le marché mais cible un segment différent (PME France, productivité pure)
- Veille permanente à mettre en place (agent hebdo à planifier)

### WhatsApp Business V1 — Deeplink (livré sur master)
- Table `whatsapp_messages` créée en Supabase (RLS activée)
- Bouton vert "Envoyer sur WhatsApp" sous chaque réponse assistant (non-opener, non-verrouillé)
- Deeplink `wa.me/?text=` avec texte pré-rempli + log silencieux en base
- Principe : l'app rédige, l'utilisateur envoie en 1 tap

### Système de feedback utilisateurs (livré sur master)
- Table `feedback` Supabase (type : bug/besoin/autre, contexte JSON, statut nouveau)
- Bouton "Un bug ou une idée ?" dans ProfilScreen (section Application)
- Icône drapeau dans le header ConversationScreen (signalement contextuel avec agent_id + nb_messages)
- SQL à exécuter sur dashboard Supabase : migration 0005_feedback.sql

### Profils agents — section Pleine puissance (livré sur master)
- Textes proactif enrichis : 3 phrases concrètes par agent (Awa, Miriam, Serge, Roland, Kofi)
- Fix CSS header : `items-start` + `flex-shrink-0` sur icône, plus de coupure sur petits écrans

### Système de notifications in-app (livré sur dev, niveaux 1 + 2)
- Cloche dans le header Dashboard avec badge rouge (count non-lu en temps réel)
- Route `notifications` branchée dans App.jsx et ProfilScreen
- Trigger SQL `notify_welcome` : notification bienvenue à la fin de l'onboarding
- Edge Function `notify-auto` : streak à risque (3j sans connexion) + quota 80% atteint
- Cron à configurer dans Supabase Dashboard : `0 8 * * *` → POST notify-auto
- 3 actions Supabase restantes : SQL trigger + deploy Edge Function + cron job

### Vision système autonome (acté, à implémenter)
- Pipeline validé : Utilisateurs → Feedback → Agent collecte → Résumé Mac Arthur → Programmeur exécute
- Agent débrief quotidien (scan feedback + conversations) = prochain chantier après validation notifications
- Mac Arthur supervise uniquement : valide les décisions, le système exécute

---

## 2026-06-01 (session 10 — Kofi, campagne SEUL, ebook, challenge 7 jours)

### Attractor Assists : agents, UX, déploiement

- Kofi (Storytelling & Campagnes) : 6e agent créé, system prompt déployé, photo intégrée, teasers contextuels
- Forfaits restructurés : features honnêtes, Awa gratuite mentionnée en Découverte, Manager -70% / 99€ barré, badge "Promo fondateurs"
- Awa rendue proactive : opener contextuel selon profil onboarding, produit directement sans tourner autour
- UserCount corrigé : RPC Supabase `get_user_count()` bypass RLS — les 25 vrais testeurs s'affichent
- PWA : `manifest.json` + logo Attractor à l'installation iOS/Android, meta tags Apple ajoutés
- Login : phrase d'accueil remplacée par "Trouve ton Couloir… et cours dedans !"
- Agents verrouillés : section "Pleine puissance" orange dans le modal bio, CTA avec prix et mention 99€ barré
- Table `notifications` créée en Supabase + `NotificationsScreen` ajouté

### Campagne et contenu

- Campagne storytelling "SEUL" produite : film 2 minutes complet (script 6 scènes), stratégie 4 semaines (reconnaissance / diagnostic / révélation / WhatsApp), hashtag #TonBrasDroit
- Ebook "Manuel de Procédures" (Koffi et Awa) : contenu complet dans `context/import/` — 31 pages, structure narrative en 7 chapitres + plan 7 jours. Production visuelle Canva IA en cours.
- Storytelling PDF (Franck Bayé) analysé : framework StoryBrand, Story of Self/Us/Now, schéma actanciel appliqués à la stratégie Attractor

### En cours

- Challenge 7 jours dans Attractor Assists : visuels J1-J7 + prologue disponibles dans import, développement en cours (agent Monsieur S., ChallengeScreen, déclencheur onboarding organisation)

---

## 2026-05-31 (session 9 — Générateur d'Apps Métier + J'Envoie Express)

### Validation du concept Générateur d'Apps Métier

- Analyse de faisabilité des 13 projets de l'écosystème Attractor : classement en 4 niveaux (faisable maintenant / moyen terme / long terme / reporter). Top 3 prioritaires : Générateur d'Apps Métier, Attractor IA, Brain Dump vocal.
- Concept Générateur d'Apps Métier validé : pipeline industrialisé de l'audit à la livraison. Collecte via Tally → personnalisation Claude vision → validation client → déploiement Netlify. 3 niveaux de personnalisation (surface, modules, nouveau secteur). Logique "Shopify des apps métier africaines".
- Pipeline interne en 5 étapes : réception infos client → personnalisation par Claude (~20 min) → validation Mac Arthur (~5 min) → déploiement Netlify (~5 min) → livraison client. Total : moins de 48h après réception des infos.
- Template #1 créé : Livraison colis (J'Envoie Express). 8 modules : dashboard KPI, gestion colis, voyages, clients, demandes, tarifs, tracking avec preview mobile, assistant IA intégré.
- J'Envoie Express : maquette HTML complète analysée. 6 infos manquantes identifiées (logo, WA business, adresses collecte, prochain voyage, validation couleurs). Message WhatsApp de collecte rédigé et prêt à envoyer.

---

## 2026-05-31 (session 8 — suite : dark mode, forfaits, référencement)

### Chantiers livrés (fin de session)

**Dark mode corrigé :** Overrides CSS complets ajoutés (inputs, nav bas, bg-g200, placeholders, borders). Le texte ne reste plus noir sur fond noir.

**Forfaits reformulés (zéro jargon) :**
- Découverte : "Ton bras droit personnel — gratuit pour toujours" + features humaines
- Bras Droit Pro : "Ton bras droit qui agit à ta place" + analyse marché, rapports, actions concrètes
- Manager : "Ta petite agence digitale à portée de main" + agents 24h/24

**Bannière communauté :** Count dynamique depuis Supabase (vrais testeurs en cours). CTA changé en "Voir comment on peut t'aider". Message honnête : "Tu fais partie des premiers."

**Boutons paiement désactivés :** "Bientôt disponible" (XPAYE non encore connecté). Décision : référencement avant paiements, on est en phase test.

**Système de référencement complet :**
- DB : colonnes `referral_code`, `referred_by`, `referral_count` dans profiles
- Codes générés pour les 25 utilisateurs existants
- Login : capture `?ref=CODE` dès l'arrivée sur l'app
- Onboarding : crédite le parrain (+1 filleul) à la fin du tunnel
- Profil : section "Partager et gagner" avec lien unique, compteur filleuls, bonus messages, bouton WhatsApp natif
- Dashboard : limite messages dynamique = base (20) + (filleuls x 5)

---

## 2026-05-31 (session 8 — refonte onboarding, bras droit proactif, agenda, vie des assistants)

### Chantiers livrés

**Sécurité login :** Magic link remplacé par OTP 6 chiffres. Template email brandé Attractor Assists en français. Correction bug mobile (cross-browser localStorage).

**Onboarding refait :**
- Livrable Facebook supprimé (hallucination). Remplacé par écran bienvenue honnête.
- 5 questions conversationnelles (journée type, attente actuelle, épuisement, vision 6 mois, ville+canal) au lieu du PPSD frontal.
- Écran bienvenue : "[nomAssistant] est prêt, [prenom]. On commence maintenant."

**Activation sans hallucination :**
- Edge Function `activation-sequence` réécrite : Claude lit tout le profil onboarding et génère un vrai mirroring avec les mots de l'utilisateur.
- Suppression pseudo-analyse ("J'ai regardé ta page") et demande de lien réseaux sociaux.
- Suppression victoire hardcodée ("Mission du jour : ton premier post").
- Détection couloir client-side en fallback fiable (keywords org vs ventes).

**Dashboard :** phrase "Conçu pour devenir ta doublure et te décharger mentalement". Progression basée sur usage réel (Installé / 1re session / En rythme / Pilotage auto).

**Bras droit proactif :**
- Opener visite guidée à la première conversation : présente l'équipe complète + reprend l'ouverture de l'utilisateur.
- Opener adapté selon le profil dominant (entrepreneur / salarié / étudiant / mix).
- Profil complet injecté dans Claude : ouverture, journée type, épuisement, vision, PPSD.
- Coaching actif quand profil vide : Claude pose la question clé ATTRACTOR au lieu de répondre à vide.
- Colonne `memoire_cache` créée en base (était générée mais jamais sauvegardée).

**Agenda :**
- Table Supabase `todos` créée avec RLS.
- AgendaScreen complet : CRUD, priorités (urgente/normale/basse), sections aujourd'hui/à venir, filtre en cours/terminées.
- Accessible depuis le dashboard.

**Vie des assistants :**
- Bras droit épinglé en tête de "Mon équipe", fond charbon, rappelle l'ouverture de l'utilisateur.
- Teasers personnalisés par agent basés sur le profil (ouverture + activité).
- Statuts animés : dot vert pulsé sur les actifs.
- Agents verrouillés : photo en couleur, teaser en italique, plus de grisé.
- Modal bio enrichie : "Ce qu'il/elle ferait pour toi là" en première position.

**XPAYE :** Sandbox validé (merchant ID PP-F422), doc archivée dans `context/import/SANDBOX XPAYE.txt`.

**Workflow :** branche `dev` / `master` en place. Dev = tests, master = prod.

---

## 2026-05-31 (session 7 — déploiement live + humanisation équipe)

### Attractor Assists en production + vision équipe clarifiée

- App déployée live sur `assists.agenceattractor.com` via Netlify, repo `jarvis-starter-kit` sur GitHub
- Vision équipe définitivement clarifiée : le Bras Droit (`nom_assistant`) = décharge mentale quotidienne, accessible via le FAB partout, disponible sur tous les forfaits. Les 4 employés de l'Agence Attractor (Awa, Miriam, Serge, Roland) = homologues directs des agents Jarvis (agent-commercial, community-manager, chief-of-staff, agent-daf), passifs sans Manager, proactifs avec Manager
- Photos CI et biographies "pro mais décalées" intégrées pour les 4 agents. Modal bio au clic sur la photo (grand portrait + biographie + aperçu mode Manager)
- Mémoire courte auto implémentée : résumé toutes les 5 réponses, stocké dans `profiles.memoire_cache`
- Base de connaissance ATTRACTOR injectée dans chaque conversation (PPSD, AIDA/PASA, offre irrésistible, Facebook Lyle Soboro, 3 couloirs)
- Messages Bras Droit limités : max 350 tokens, max 3 phrases par réponse
- Login : OTP remplacé par magic link (cohérent avec SMTP), session persistante (`persistSession`, `autoRefreshToken`, `detectSessionInUrl`), instructions spam intégrées dans l'écran
- SMTP Resend configuré, domaine `agenceattractor.com` vérifié (3 records DNS ajoutés dans Netlify)
- 25 utilisateurs dans Supabase (migration Apps Script réussie pour 21, 4 comptes supplémentaires)
- Terminologie définitive : "Coach" supprimé, "Bras Droit" partout. "Assistants" remplacé par "Mon équipe"
- 30% restants à livrer : Parcours Ventes (4 modules), Parcours #1dansmoncouloir, Agenda + Todo Serge, Triggers quotidiens

---

## 2026-05-30 (session 6 — architecture UX et vision produit Attractor Assists)

### Navigation, activation, agents et philosophie produit validés
- Navigation finale validée : Accueil / FAB (conversation directe) / Assistants / Profil. MasterSheet retirée du nav principal, repositionnée dans Profil sous "Ce que [assistant] sait sur toi" (conversationnel, pas formulaire).
- ActivationScreen remplace DiscoveryScreen : démarre par le mirroring de l'`ouverture` déjà capturée en onboarding (pas de re-question). 5 temps : mirroring + confirmation ("C'est ça" / "Autre chose" libre) → insight adapté au couloir → action WOW → victoire rapide. Flag `activation_done` dans `profiles` Supabase.
- Couloir Ventes/Visibilité : insight marché + analyse présence en ligne réelle (WebFetch sur lien fourni, 1 seule fois, stockée dans `profiles.presence_analyse`). Couloir Organisation : vide-tête 5 tâches + diagnostic 3 fuites (méthode Koffi), pas de lien présence.
- Profil Organisation clarifié : surcharge mentale, sans système, tout en urgence. Promesse = soulagement via coaching manuel de procédures 7 jours.
- Agents verrouillés = mode passif interactif (génie d'Aladin) : se présentent, répondent à toutes les questions, réponse tronquée via gradient fade avec trigger upgrade contextuel. Fini les sheets statiques.
- Coach = gratuit sans limite de messages. RAG ATTRACTOR uniquement. Réponses riches pour créer l'addiction et pousser vers les agents de production payants.
- Design : emojis standards supprimés. Miniatures illustrées expressives par agent, style Ugo Creative CI. À créer sur Canva Pro. Remplacent le composant AssistGlyph.
- Migration anciens utilisateurs Apps Script Google Sheets → Supabase : à exécuter.
- Prochaine session : coder ActivationScreen + ConversationScreen branchée API réelle + migration Apps Script → Supabase.

## 2026-05-30

### Refonte onboarding Attractor Assists + déploiement Edge Function

- OnboardingScreen.jsx entièrement réécrit : tunnel 3 actes (plus de formulaire avec chips).
- Acte 1 : 3 slides avec animation machine à écrire (36ms/char, curseur clignotant, skip on tap). Textes validés par Mac Arthur. Fond noir chaud avec glow orange. Slot image de fond prévu dans le code (à décommenter quand image disponible).
- Acte 2 : question d'ouverture verrouillée + naming en 2 étapes (prénom puis nom du bras droit avec suggestions) + anamnèse conversationnelle 5 questions (interface chat, une question visible à la fois).
- Option B validée : onboarding minimal (5-7 min max) + collecte progressive ensuite. Profil dominant (entrepreneur/employé/étudiant/mix) à intégrer comme question branching à la prochaine itération.
- Acte 3 : plus de "livrable" (terme trop technique). Formulation : "J'ai analysé ce que tu m'as dit. Voici ce que j'ai appris..." Le texte généré s'affiche dans un textarea éditable. L'utilisateur peut modifier, ajouter, retirer avant de copier. C'est l'ADN Mac Arthur : écoute approfondie et active.
- Edge Function "generate-livrable" déployée sur Supabase (projet lgdgbrivnhgeupqhkckd). Clé Anthropic configurée côté serveur. System prompt Mac Arthur embarqué : voix CI, structure PASA, règles anti-générique absolues.
- Supabase : URL Configuration corrigée (localhost:5173), magic link fonctionnel, app testée et accessible.
- Compilation Vite propre (85 modules, 0 erreur).
- Prochaine session : fixer d'autres points de l'onboarding + suite du plan.

---

## 2026-05-29 (session 5)

### Vision RED complète — mini-agents, boutique, organisme vivant

- Pipeline d'extraction mini-agents clarifiée en détail : MIROIR observe un process validé sur un vrai client → formule la recette exacte (déclencheur, questions, relances, output) → PILOTE évalue (injectable en 1 bloc ? aligné ATTRACTOR ? moins de 2h ?) → BÂTISSEUR rédige le bloc texte → GARDIEN valide (pas générique, ton Mac Arthur, déclencheur clair) → PONT injecte dans `methode-attractor-synthese.md` → MIROIR trace dans `decisions-actées.md`.
- Mini-agents = capacités silencieuses dans le system prompt. L'utilisateur ne sait pas. Déclenché par contexte. Nom interne (ex : PPSD EXPRESS) différent du nom utilisateur ("Connais ta cible").
- 3 mini-agents prioritaires définis : A "Connais ta cible" (extractible maintenant, validé J'envoie Express + restaurant Abidjan) ; B "Bras droit digital" (veille hebdo niche + cible, sujets qui font réagir, à période définie, moteur de rétention, à construire) ; C "Organisation" (Koffi System, 3 fuites, focalise sur le cash, moteur du challenge 7 jours en continu).
- Vision commerciale "vendre sans vendre" actée : mini-agents validés → injectés silencieusement → apparaissent dans la boutique segmentée par profil. One-shot (ponctuels) + accompagnement récurrent (abonnement). Bundles et offres flash à cadrer. Assistants connaissent les produits actuels, en déploiement et à venir. Orientent les conversations subtilement. Machine à cash non agressive.
- Customer success = l'assistant lui-même (proactif, célèbre, relance). Si blocage persistant → escalade vers consulting Mac Arthur.
- Règle hypercréatif actée : toute idée capturée dans `idees-pipeline.md` par MIROIR. PILOTE choisit le moment. Fichier créé : `livrables/ecosysteme-attractor/attractor-assists/idees-pipeline.md`.
- Attractor Assists = organisme vivant. Chaque innovation validée améliore l'app pour tous les utilisateurs.
- WhatsApp V1 : terme "Assisté" confirmé et conservé.

---

## 2026-05-29 (session 4)

### Équipe d'agents complète + chaîne de livraison client validée

**Équipe créée (24 agents actifs dans Jarvis) :**
- Pôle R&D : PILOTE (`/pilote-rd`), ÉCLAIREUR (`/eclaireur`), GARDIEN (`/gardien`)
- Pôle Stratégy Finance : COMPTES (`/comptes`), BOUSSOLE (`/boussole`)
- Pôle Stratégy Contenu : ÉDITO (`/edito`)
- Pôle RSE : AMBASSADEUR (`/ambassadeur`)
- Transverses critiques : MIROIR (`/miroir`), PONT (`/pont`)
- Opérations agence : CHEF DE PROJET (`/chef-de-projet`), AGENT DAF, COMMERCIAL, ANALYSTE, RGPD, CRÉA IA + les existants (maquette-closer, devis-express, community-manager, directeur-artistique, media-buyer, programmeur-senior, qa-agent)
- Source de référence : `context/import/RECAP_Ecosysteme_Agents_Attractor.md`

**Corrections apportées après simulation n°1 (restaurant Abidjan) :**
- ÉCLAIREUR et PILOTE retirés de la chaîne client standard → ils sont pour le R&D interne uniquement
- Chief of Staff : qualification obligatoire avant tout routing (barème consulté, nombre d'users, zone, add-ons)
- Barème référencé dans Chief of Staff et Bâtisseur : SOLO 150 000 FCFA setup + 45 000/mois, ÉQUIPE 350 000 FCFA + 120 000/mois
- Délais : plus jamais inventés → grille de complexité définie (SOLO simple = 5-8j, SOLO complexe = 8-12j, ÉQUIPE = 12-18j)
- MRR systématiquement présenté dans le devis (pas juste le setup)

**Décision validée : Audit métier client (step entre V1 et V2)**
- Après maquette OK + devis signé + acompte reçu → lien audit envoyé au client
- Style conversationnel, 3-5 questions min par thème, relances si réponse vague
- Récapitulatif produit séance tenante → client valide ou affine
- Validation du récapitulatif = bon de livraison (scope verrouillé)
- Développement V2 ne commence pas avant cette validation
- Documenté dans `livrables/ecosysteme-attractor/attractor-assists/decisions-produit.md` section 6
- Chef de Projet et Programmeur Senior mis à jour avec ce workflow

**Projets RED validés :**
- Mini-agents Attractor Assists (GO) : extraire process validés → mini-prompts → injection dans synthèse, 6h effort total
- WhatsApp Business V1 assistée (GO) : deeplink 1 tap, table Supabase `whatsapp_messages`, sans API Meta
- WhatsApp Business V2 (ATTENDRE) : API Cloud, après validation V1 par vrais utilisateurs

---

## 2026-05-29 (session 3)

### Enrichissement de la base Jarvis + décisions produit Attractor Assists

- 7 documents de méthodologie ingérés dans `context/import/` : framework ATTRACTOR, Méthode v2026, Boost ta Marque, 3 secrets, Ebook procédures (Koffi & Awa), Clés universelles (Régis Amon), Vendre sur Facebook (Lyle Soboro).
- `methode-attractor-synthese.md` mis à jour : intro reécrite, comportement proactif ajouté en section 7, section 8 "carte des déclencheurs" (15 situations → enseignements à glisser + réflexe done-for-you), section 9 table des sources.
- Principe validé : l'assistant glisse les enseignements dans l'action (jamais en mode formateur), basé sur ce que dit l'utilisateur dans la conversation.
- `decisions-produit.md` créé avec 4 décisions validées :
  1. Challenge "7 jours pour t'organiser" (déclenché si désorganisé, rythme libre, modules visibles dès le début).
  2. Modules toujours cliquables même inactifs → message de capacité concrète personnalisé (jamais "bientôt disponible").
  3. Nommer son bras droit : progression assistant → bras droit, critère fondamental de performance de l'app.
  4. Scan quotidien des BDD pour amélioration continue + résumé Mac Arthur chaque matin.
- Ordre de priorité d'implémentation : nommer → modules cliquables → challenge → scan.
- Maquette : tiiny.host obligatoire avant tout envoi client. Jamais le fichier HTML brut. J'envoie Express = cas d'école du blocage.
- demo.agenceattractor.com : chantier validé, à tester avec J'envoie Express. CNAME DNS + Netlify custom domain. Sous-chemin par défaut, sous-domaine pour clients ÉQUIPE/ENTERPRISE.
- Audit métier : Tally.so (pas HTML). Conversationnel, 3-5 questions min, récap séance tenante, validation = bon de livraison.
- Projets RED validés : mini-agents Attractor Assists (GO, ~6h, zéro code), WhatsApp Business V1 assistée (GO, table Supabase + deeplink), V2 API Cloud (attendre).

---

## 2026-05-29 (session 2)

### Refonte de la logique parcours Attractor Assists
- Évaluation de l'app existante : 4/10. Problèmes : onboarding lapidaire, données non utilisées, persona fictif "Aya Koné" non remplacé par les vraies données utilisateur.
- Concurrent redéfini : la distraction (pas une autre app).
- Posture de l'assistant : ami qui comprend et décharge, jamais formateur.
- Tunnel d'embarquement en 3 actes : slides "je te comprends" + anamnèse conversationnelle (preuves concrètes : liens pages, posts récents) + premier livrable immédiat.
- Question d'ouverture verrouillée : "Et si tu avais un bras droit professionnel dispo 24h/24, qu'est-ce que tu aimerais qu'il fasse pour toi ? Là. Maintenant."
- Anamnèse complète = fusion Jarvis Install (8 questions) + backend Supabase (profiles, ppsd, marque, offres), collectée en mode conversationnel sans formulaire.
- Proactivité : l'assistant initie (matin/soir), suit les engagements, relance sur ce qui a été dit.
- Organisation légère : capture en une phrase, l'assistant classe et rappelle. Alternative Google Agenda.
- Rétention modèle Duolingo : streak, mission du jour, XP, badges, nudge si série en danger.
- Bulles d'enseignement silencieux : extraits des écrits Mac Arthur sur les questions techniques (cible, PPSD, offre irrésistible), aspirent vers la méthode sans enseigner.
- Style de voix calibré sur les vrais écrits : phrases courtes, tutoiement, storytelling Koffi/Awa, questions directes, "Et si tu avais...", références culturelles CI. Jamais européen, jamais formateur.
- Ebook LEAD_MAGNET_SYSTEME_ATTRACTOR.pdf dans context/import/ (PDF non lisible directement, conversion txt à finaliser).
- Lien Drive RAG partagé, fichiers à déposer dans context/import/ en .txt ou .md pour lecture.

---

## 2026-05-29

### Fondations techniques Attractor Assists + décisions produit
- Nouveau projet Supabase `attractor-assists` provisionné (Paris ; l'ancien était mort). Schéma de fondation appliqué et vérifié : 16 tables, RLS partout (profils, forfaits, abonnements, quotas, conversations, PPSD, agenda, to-do, parcours, gamification, agents, livrables, communauté, base de connaissance RAG).
- Forfaits arrêtés : Découverte (gratuit, coach passif, 20 msg/jour) / Bras Droit (proactif + Digital Manager) / Manager (Community Manager, Chief of Staff, DAF, broadcasts). Manager 29€/mois en promo flash ancré sur 99€. Prix EUR et FCFA, pas de frais de setup sur Assists.
- Modèle IA : Haiku par défaut (coach), Sonnet pour les agents lourds, caching + batch pour le coût.
- Publication V1 = WhatsApp assisté (l'app organise, relit, alerte ; envoi en 1 tap ; pas d'API Meta ni validation ; zéro intervention). V2 = API WhatsApp Cloud plus tard.
- Décisions : écosystème sur un même projet Supabase pour préparer l'interconnexion future ; ajout d'un agent DAF (structurer les idées en argent) et d'un agent commercial pour les promos.
- Front scaffolde (Vite + React + Tailwind v4, tokens orange/vert/sable) dans `app/`. Node installé en portable pour piloter le build.

### Refonte Attractor Assists, virage vers le modèle Jarvis
- Session dédiée à la refonte. Cartographie de l'existant faite à partir du repo GitHub `MrAttractor/demoattractorassist` (3 monolithes HTML : `index.html` inscription, `assistant-client.html` app PWA, `dashboard.html` pilotage ; backend unique Apps Script + Google Sheet). Sauvegardée dans `livrables/ecosysteme-attractor/attractor-assists/cartographie-existant.md`.
- Dette critique relevée : mot de passe du dashboard en clair dans le JS public (`#Mimschak`), endpoint Apps Script ouvert exposant toutes les données clients (risque RGPD), branding actuel (luxe or/noir) à l'opposé de la direction validée, incohérences quota et taxonomie de forfaits.
- Virage stratégique majeur : Attractor Assists devient Mac Arthur dupliqué en coach individuel, nourri de ses 10 ans d'écrits, en logique done-for-you (l'assistant produit à la place de l'utilisateur), ludique et rythmé. Pas de posture de formateur (la cible ne veut pas creuser). Façade utilité d'abord, mouvement Attractor (couloir d'appel, DEVENIR le #1) en couche profonde, fondation biblique silencieuse (Romains 8.19).
- Écrits ingérés depuis le Drive "La Stratégie Attractor dématérialisée" (myattractor1) : framework de la stratégie, outline formation BOOST TA MARQUE (7 modules), ebooks "3 secrets", "Booste ta marque", "7 jours pour gagner en liberté", refs (200 idées géniales, 2 clés universelles de Régis Amon, Vendre sur Facebook de Lyle Soboro). Synthèse "cerveau de l'assistant" rédigée dans `methode-attractor-synthese.md`.
- Décisions produit : assistant nourri seulement (RAG, pas d'académie), positionnement utilité d'abord, couche biblique silencieuse. CONTEXT.md mis à jour. Plan de refonte à produire et valider.

### Réalignement et verrouillage de la base
- Des sessions Haiku parallèles avaient réinjecté le template générique (dossiers `sites-web/`, `applications/`, `youtube/`, `cabinet/` Chatflow, `ecole/` l'Apreneur Académie ; `.env` avec YouTube/Stripe). Nettoyé.
- Grille `livrables/` rétablie : `clients/`, `ecosysteme-attractor/`, `commercial/`, `contenu/`, `recherche-et-developpement/` (ce dernier = idées inspirées → MVP réutilisables en marque blanche, voulu par Mac Arthur).
- `.env` / `.env.example` réalignés sur la vraie stack (Wave, MTN Money, PayPal actifs ; Stripe et CinetPay en prochaines étapes ; retrait YouTube).
- Cause racine traitée : ajout de la grille `livrables/` et de la règle "source de vérité" dans `CLAUDE.md` (chargé à chaque session) pour empêcher les futures sessions de réintroduire le générique.
- Consigne durable de Mac Arthur : tout doit rester aligné, faire le nécessaire à chaque fois pour garder une base solide (alignement proactif, sans redemander).
- Design system : analyse des 6 captures faite (`analyses/` + `PATTERNS.md` + `COMPARISON.md`). Direction retenue = pop africaine chaude + premium accessible, épurée pour le produit. Tokens proposés dans `livrables/ecosysteme-attractor/attractor-assists/design-system.md`. Prompt de refonte (wireframe + high-fidelity, base Supabase) dans le même dossier.
- Références ajoutées par Mac Arthur : campagne IVOIRE "Comme nous" (Heineken CI, Behance) comme référence pivot (levier = fierté ivoirienne + appartenance "comme nous"), et Agence UGO (Instagram) pour le registre créa fun. App voulue chaleureuse, intuitive, fun. Refonte à mener dans une session dédiée.
- Décisions design verrouillées : orange = signature/primaire, vert = accent uniquement. Concept directeur de l'écosystème = "frise narrative" (designs complémentaires app par app, l'ensemble racontant le parcours de l'entrepreneur). Couleurs vives assumées comme moteur de désir/engagement. Agence UGO sert surtout l'inspiration des campagnes.
- Fil narratif de la frise défini (ordre) : Assist (*Penser* : bras droit, visibilité + argent) → Livraison Pro (*Délivrer*) → Fidelys (*Fidéliser* : rétention) → Dashboard (*Piloter* : supervision). Sauvegardé dans `livrables/ecosysteme-attractor/frise-narrative.md`. Progression chromatique proposée : du chaud (Assist) au calme/premium (Dashboard), le vert montant comme jauge de croissance.
- Prompt de refonte finalisé et passé en **PLAN MODE** (`livrables/ecosysteme-attractor/attractor-assists/prompt-refonte.md`) : base technique Supabase, à mener dans une session dédiée qui planifie avant d'exécuter.

---

## 2026-05-28

### Organisation workspace + principe Attractor Assists
- Réécriture d'un prompt template (livré dans un .docx) pour l'aligner sur l'agence Mr Attractor : le template générique parlait de "cabinet Chatflow", "lApreneur Académie" et YouTube (pas ses business). Prompt aligné sauvegardé dans `context/import/prompt-organisation-workspace.md`.
- Structure `livrables/` proposée : `clients/`, `ecosysteme-attractor/`, `commercial/`, `contenu/`. Gestion des secrets adaptée à sa stack (ajout Wave/CinetPay pour mobile money CI/diaspora, retrait YouTube).
- Décision stratégique notée : ce workspace Jarvis sert de prototype à l'app Attractor Assists. Tout ce qui est validé pour Mac Arthur sera réinjecté dans l'app. Une refonte d'Attractor Assists est envisagée.

### Session de mise en place (connecteurs, inventaire, premier deal)
- Sécurité : rotation de la clé API Claude (exposée en clair dans l'Apps Script), déplacée dans les Propriétés du script. Test OK (HTTP 200).
- Connecteurs branchés : Google Drive/Sheets, Gmail, Google Agenda, Notion, Canva. Agenda/Gmail confirmés sur le compte pro myattractor1. Accès confirmé à la MasterSheet "SYSTEME ATTRACTOR".
- Clarification des 3 comptes : myattractor1@gmail.com (pro), nguessankouassi@gmail.com (perso), kouassi@outlook.fr (Canva).
- Inventaire des Projects Claude.ai : ~8 apps métiers déjà construites (NABYCOOK, MY NUGO, LS EXPERTISE, J'envoie Express, OLIVE MAFO, Cèchémoi, MIX PREMIER, INTIM CONFORT). Constat : pas un problème de production mais de dispersion et de packaging.
- Premier deal travaillé : J'envoie Express (MVP, 230€, acompte 130€ le 3 juin). Le client a closé après présentation d'une maquette.
- Mécanisme de vente identifié et validé : "maquette-first". Décision de l'industrialiser via une skill `maquette-closer`.
- Décision : bâtir une équipe d'agents IA (employés de l'agence) par vagues, à commencer par le pôle closing et livraison.

### Installation initiale du Jarvis
- Workspace personnalisé pour Mac Arthur (marque Mr Attractor), basé dans le 77 (Seine-et-Marne), travaille à Montreuil.
- Profil principal : mix salarié (CDD 3 ans DGFiP, service recouvrement, macros et procédures collectives) + entrepreneur, l'agence étant la priorité de fond.
- Activité : agence de business et développement humain, écosystème d'apps ATTRACTOR (Attractor Assists, Livraison Pro, Fidelys, pilotage) en freemium + web apps métiers sur mesure (conception + MRR). Cible : Côte d'Ivoire et diaspora en France.
- Objectifs court terme : 10 000 €/mois d'ici fin août 2026, reconstruction et déploiement d'Attractor Assists, vente directe des app métiers, lancement mensuel d'une app.
- Vision long terme : 2027 système autonome + 15 000 €/mois + 1000 utilisateurs actifs + certification coach ; 2028 sortie de la fonction publique et installation au Canada, 120 projets sur 3 continents ; projet associatif de bibliothèques en Afrique.
- Projets actifs : montée en compétences Claude Code, vente d'app métiers, développement écosystème Attractor, plan de campagne de contenu.
- Domaine d'aide prioritaire : mise en place du système de vente automatisé.
- Style de communication choisi : mélange selon le contexte, avec recentrage sur la vision et le plan quand les sujets se dispersent.
- Détail des offres et tarifs archivé dans `context/import/offre-attractor.md`.

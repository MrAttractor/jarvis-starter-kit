# Workspace History

> Journal chronologique de toutes les sessions et décisions importantes.
> Le plus récent en haut. Mis à jour automatiquement par Claude.
>
> **Comment ça marche :** Quand je lance la commande `/update` après une session importante, ou quand je raconte un changement significatif, Claude ajoute une entrée ici automatiquement. Je n'ai pas à écrire ce fichier manuellement.

---

## 2026-07-01 (session 78 — GetWinWorld refonte + déploiement + leçon Pages/Workers)

### GetWinWorld — refonte hero vidéo + admin + guide client
- `index.html` : retrait du splash vendeur, hero plein écran en vidéo 9:16, titre "Votre Personal Shopper"
- `admin.html` créé : espace de publication du catalogue en autonomie pour Charles
- `guide.html` créé : guide de démarrage imprimable, Formule Active (350€ setup + 65€/mois), 6 sections (modules, parcours client, process 0 stock, publication, partage du lien, contact agence)
- Schémas SQL `supabase-schema.sql` + `supabase-schema-02-panier.sql` (comptes clients `gw_clients` + demandes groupées `gw_commandes`), à exécuter côté Supabase si pas déjà fait
- Bloc "Pourquoi GetWinWorld / comment ça marche" ajouté sous le hero de la vitrine (3 étapes : Charles déniche chaque jour → le visiteur choisit → Charles gère le reste), visible sur les 3 sous-onglets

### Leçon déploiement — demo.agenceattractor.com = Cloudflare Pages, pas le Worker homonyme
- `wrangler deploy` (Worker `demo-agenceattractor`) a semblé réussir mais ne touchait que son `.workers.dev` — le vrai domaine ne changeait pas
- Root cause : deux ressources Cloudflare portent le même nom `demo-agenceattractor` (un Worker + un projet Pages), seul le projet Pages possède le custom domain
- Fix : toujours déployer avec `npx wrangler pages deploy public --project-name=demo-agenceattractor`
- CONTEXT.md corrigé (il indiquait à tort "Worker" à un endroit et "Pages" à un autre) + mémoire créée (`project_demo_site_deploy.md`) pour ne plus reproduire l'erreur

### GetWinWorld — onglet Conseils + récupération d'espace WhatsApp
- Onglet "Vidéos" remplacé par "Conseils" (Charles n'a pas encore de vidéos) : 5 fiches pratiques (occasion costume, mesures, entretien cuir, costume vs blazer, délais livraison) + lien vers le conseiller
- "Mon espace" : bouton "Déjà un espace ? Le retrouver" — lookup par WhatsApp via fonction Postgres SECURITY DEFINER (`gw_find_client_by_whatsapp`), exécutée en prod. Corrige la perte d'accès sur changement d'appareil (identité stockée en localStorage, pas de login)

---

## 2026-06-29 (session 77 — Assists acquisition-ready + routing boutique universel)

### Attractor Assists — migration Netlify → Cloudflare Pages
- Build minutes Netlify épuisées : deploy bloqué → migré sur Cloudflare Pages (projet `assists-agenceattractor`)
- GoDaddy : CNAME `assists.agenceattractor.com` → `assists-agenceattractor.pages.dev` mis à jour manuellement
- Deploy via `npx wrangler pages deploy ./dist --project-name assists-agenceattractor`

### Lien boutique unifié `demo.agenceattractor.com/[slug]`
- 5 écrans modifiés : MonAppScreen, DashboardScreen, CommandesScreen, OnboardingScreen, ProfilScreen
- Plus aucun `?c=slug` ni `template-X/?c=slug` dans le code
- Routing universel : `_redirects` dans demo-site (pages statiques 200 + catch-all `/:slug → assists/b/:slug 302`) + App.jsx lit le slug depuis `/b/[slug]` en plus de `?c=`
- Pages statiques existantes (creal, ethsun, beynaud...) restent prioritaires sur le catch-all

### Tracker source d'acquisition
- Param `?src=` capturé au lancement → `localStorage('aa_src')` → `profiles.source_acquisition` à l'onboarding
- Migration SQL `0046_source_acquisition.sql` appliquée en prod

### Notification commande in-app
- Edge function `notify-order` déployée (no-verify-jwt, service role key)
- Appelée fire-and-forget depuis `handlePayment` dans PublicAssistantScreen
- Insère une notification dans `notifications` pour l'entrepreneur : "Nouvelle commande — X vient de commander : 2× Multicreal. Total : 7 500 F."
- Prochain : CallMeBot pour notification WhatsApp hors-app (non implémenté)

### Facebook Login annulé
- Jamais implémenté dans la version actuelle de LoginScreen.jsx
- Scope définitivement fermé : OTP email uniquement

### Coaching Kezey (C'Real) — données business capturées
- Session WA du 20/06/2026 analysée : 7 variétés, ventes jan-mai (pic mars 108 unités), budget structuré 310.000 FCFA (emballages 2× + eau production + fonds urgence)
- Gap produit identifié : Zoé entrepreneur-side doit pouvoir recevoir un dump de données brutes et produire un audit structuré (comme Mac Arthur l'a fait manuellement)
- Données sauvegardées en mémoire (`project_creal_coaching.md`)

---

## 2026-06-28 (session 76 — My Nugo corrections catalogue + pop-up countdown)

### My Nugo — corrections catalogue et pop-up
- Lien Instagram mis à jour : `@mynugo_` avec igsh (4 occurrences nav/footer/about)
- Robe Eliora Court → Robe Eliora Long (PROD_03 + PROD_04, description "Coupe longue")
- Ensemble Naïla → Pantalon Naïla (PROD_11)
- "La Collection" → "La Collection RENAISSANCE" partout (nav, footer, section titre)
- Compte à rebours J- ajouté sur la section Pop-Up Paris (cible : 1er juillet 2026, 00:00 Paris) — affiche "En cours" une fois démarré
- supabase-schema.sql synchronisé avec les corrections de noms

---

## 2026-06-27 (session 75 — My Nugo corrections post-deploy + sécurité XSS)

### My Nugo — corrections et mise en production
- Deploy Cloudflare Pages corrigé : branche `master` (preview) → `main` (production) via `--branch=main`
- Error 522 résolue définitivement : Custom Domain ajouté dans Pages dashboard AVANT activation Proxied DNS
- Logo manquant corrigé : `Logo My Nugo.png` copié depuis context/import/
- Galerie multi-angles lightbox : openLb(), swipe tactile, navigation clavier
- Collection nommée "RENAISSANCE 2026" dans ticker et sous-titre section catalogue
- WhatsApp : 6 fonctions spécialisées par contexte (waCommander, waDecouvrir, waCollection, waPopup, waContact, waCGV)
- Guide gestionnaire WhatsApp créé : wa-guide.html (catalogue 23 produits + 7 templates copier-coller + checklist commande)
- Photos nouvelles intégrées : 6 nouvelles principales + 15 angles multi-vues dans FALLBACK

### Sécurité XSS — 3 vulnérabilités corrigées
- renderHero et renderProduits réécrits intégralement en DOM API
- Plus aucun innerHTML avec données dynamiques Supabase
- Règle : createElement + textContent pour les textes, setAttribute pour les attributs, addEventListener pour les handlers
- Validation regex `/^[A-Za-z0-9_-]{1,32}$/` sur les IDs produits avant usage dans GALLERIES
- Supabase prêt à connecter sans risque XSS (URL/ANON_KEY à renseigner, schema SQL déjà en place)

---

## 2026-06-25 (session 74 — My Nugo mise à jour + migration Supabase)

### My Nugo — site mis à jour et pushé
- Nouvelle collection 2026 : FALLBACK passé de 12 → 22 produits
- Nugo Surprise et Nugo Biman supprimés (nav réduite à 2 items : La Collection / À Propos)
- 7 photos de vestes uploadées : HERO_01-04 (Yaya / Armelia x3) + PROD_16/17/18_principale
- Google Sheets remplacé par Supabase dans index.html (SUPABASE_CONFIG)
- `livrables/clients/my-nugo/supabase-schema.sql` créé (tables produits + hero_slides + RLS + seed 22 produits)
- Pushé sur GitHub : MrAttractor/mynugo (commit 6884d2c)

### Migration Supabase — en standby
- Code côté site 100% prêt, schema SQL prêt
- Reste 3 étapes Mac Arthur : créer projet Supabase + coller SQL + renseigner URL/ANON_KEY dans index.html
- À reprendre dans une prochaine session

### Migration hébergement — Netlify → Cloudflare Pages
- Build minutes Netlify épuisées : tous les deploys bloqués (GitHub CI, CLI, API direct)
- Déployé sur Cloudflare Pages : projet `mynugo-store` → `https://mynugo-store.pages.dev`
- GoDaddy : A record Netlify (75.2.60.5) supprimé + CNAME _domainconnect supprimé
- DNS `mynugo.store` migré sur Cloudflare : nameservers `noor.ns.cloudflare.com` + `tate.ns.cloudflare.com`
- CNAME racine `@` → `mynugo-store.pages.dev` (proxied orange) ajouté dans la zone CF
- Propagation en cours — mynugo.store servira la nouvelle collection dès résolution

---

## 2026-06-24 (session 73 — Beynaud DMV V2 + Bible Attractor + migrations infra)

### Beynaud DMV V2 — RDV 30 juin
- 3 fichiers déployés sur Cloudflare Workers : `app.html` (dashboard artiste), `fan.html` (espace Fami), `brief.html` (préparation RDV)
- Naming validé : Fami (base) / Fami Gold (19,99€) / Clan Latiss (49,99€) — Fami = Famille, Latiss = surnom de Serge Beynaud. Jamais "Mes Fami", toujours "Fami, j'ai un truc pour vous"
- Fonctionnalités DMV : compteur fans live animé, calculateur revenus interactif (curseur), carte géo fans animée, feed inscriptions en temps réel, player audio, countdown live, fan wall, boutique SVG
- YouTube embed intégré dans fan.html (video IenC34xgq9o)
- 3 modèles économiques formalisés : abonnement mensuel (idéal long terme) / pay-per-event (compatible XPaye) / boutique + exclusifs offerts (recommandé pour démarrer)
- XPaye partenaire paiement confirmé — ne gère pas le récurrent automatique pour l'instant

### Migrations infra actées
- Demo-site migré définitivement sur Cloudflare Workers (`demo-agenceattractor` worker, `npx wrangler deploy`) — Netlify en pause, ne plus utiliser
- /prime reconfiguré : plus de fetch Notion CRM, scan livrables/ + croisement HISTORY.md pour anticiper les points chauds

### Bible Attractor — initiative identifiée
- Concept validé : Single Source of Truth multi-agents (Vision + Principes + UX + Architecture + Qualité + Agents)
- 60% de la matière existe déjà (CONTEXT.md MAÎTRE, UX_SYSTEM.md, BASE_CONNAISSANCE_ASSISTS.md, mémoire agents)
- Manque : architecture technique formalisée, ADR, Guardian system
- Session dédiée à planifier pour construire la Bible complète

---

## 2026-06-24 (session 72 — ETHSUN proposition + NDA gate + exigences qualité)

### Call discovery ETHSUN + requalification
- Call effectué le 23/06/2026 à 22h30 avec Jean Calvin ETHIEN (oxford@ethsun.org)
- Requalifié Famille B + A hybride : pas une app métier, mais audit + intégrations N8N + stratégie contenu + lancement livre
- Stack existante : Dolibarr (depuis 2020) + HubSpot + site en production
- Client techniquement averti (utilise Claude, connaît les outils)
- Maquette 8 écrans OS ETHSUN déplacée vers `template-executive-edu` (réutilisable secteur éducation executive)

### Proposition de mission envoyée
- `demo.agenceattractor.com/ethsun/` : single-page NDA gate + proposition complète
- Pattern Beynaud appliqué : 1 seul lien, NDA modal auto-appear, confirm + mailto, proposition révélée
- 3 formules : Formule I 800€ (Cartographie & Audit) / Formule II 2 500€+300€/mois (Intégration & Stratégie, Recommandée) / Formule III 5 000€+500€/mois (Accélérateur Complet)
- Email envoyé à oxford@ethsun.org. Statut : en attente NDA + choix formule

### Exigences qualité actées (définitif)
- Checklist QA obligatoire avant tout livrable : NDA, scope sans ambiguïté, coûts de livraison calculés, liens testés, résidus template éliminés, recommandations positionnées comme expérience terrain (pas IA)
- Zéro marge d'erreur sur les livrables B2B exécutifs
- Patterns validés à respecter systématiquement sans réinventer (Beynaud NDA gate = référence)
- Scope auto-publication LinkedIn/réseaux interdit (LinkedIn API bloque les profils perso) : remplacé par "accompagnement à la publication"
- Toujours calculer les coûts de sous-traitance (vidéo, PR) avant inclusion dans une offre

### Corrections majeures session
- Nom client corrigé : Jean Calvin ETHIEN (pas "Jean-Calvin Étienne")
- Titre livre corrigé : "L'Afrique des entrepreneurs - Bâtir dans la tempête" (5 occurrences)
- Unicode chars (━━━, ×) retirés du body mailto : incompatibles Outlook → remplacés par ASCII pur

---

## 2026-06-23 (session 71 — Maquette ETHSUN + fix desktop + fonts)

### Prospect ETHSUN entrant
- www.ethsun.org : executive education Afrique (partenariat Oxford), 2 500+ dirigeants, 20 pays, 3 centres
- Besoin : automatiser tous les process business (inscriptions, CRM, paiements, relances) + vendre le livre "L'Afrique des Entrepreneurs - Bâtir dans la tempête"
- Maquette produite depuis sources publiques en session : `demo.agenceattractor.com/ethsun` (8 écrans, light mode navy/blanc, Cormorant Garamond + Inter)
- Décision closing : pas de prix sur l'écran S6, seulement les features par palier. Budget demandé pendant le call, chiffrage dans le devis PDF sous 24h
- Call prévu ce soir à 22h30

### Fix desktop maquette ETHSUN
- Problème : la maquette s'étirait en plein écran sur desktop
- Fix : ajout `.app-shell` max-width 430px centré, fond gris (#D8D4CE) autour, nav passée de `position:fixed` à `position:sticky`, `.screen` min-height recalculé (`100vh - 52px`)
- Règle validée : toutes les maquettes mobiles doivent avoir ce shell desktop dès la création

### Fix déploiement Cloudflare Pages
- Bug : `npx wrangler deploy` pousse vers Cloudflare Workers (`*.workers.dev`) alors que le DNS pointe vers Cloudflare Pages (`demo-agenceattractor.pages.dev`)
- Fix : toujours utiliser `npx wrangler pages deploy ./public --project-name demo-agenceattractor --commit-dirty=true`
- Les deux produits (Workers / Pages) sont distincts sur Cloudflare

### Fonts ETHSUN
- Toutes les tailles de police augmentées sur l'ensemble des 8 écrans (minimum 13px pour les labels, 14px pour les textes courants)

---

## 2026-06-23 (session 70 — Automatisation process commercial + Knowledge Base)

### Sprint 1 : Notion Knowledge Base
- Database "Knowledge Base — Sessions & Bugs" créée sur la page CRM Notion (`collection://179ddada-8eb1-4734-bf0d-fb807af129eb`)
- 11 entrées seed : bugs bloquants J'Envoie Express, Assists, Pilotage + leçons cross-client (RLS, iOS, Netlify, NDA)
- 3 vues : Tout / Par client / Bugs actifs (filtrée Type=Bug, triée par Gravité)
- /update enrichi : Étape 4 pousse automatiquement les événements notables dans Notion après chaque session

### Sprint 2 : Tunnel commercial automatisé
- Formulaire audit "Je veux mon app" ajouté dans section #apps de agenceattractor.com (modale 5 questions : prenom/activite/besoin/zone/wa → Supabase table prospects, type_projet=A)
- SQL : colonnes `source` + `wa_draft` ajoutées à `pilotage_pipeline`
- Workflow n8n "Brief Inbound" (`livrables/ecosysteme-attractor/attractor-assists/n8n/brief-inbound.json`) : schedule 15 min, fetch prospects nouveaux App Métier, Claude Haiku génère message WA + note de qualification, INSERT pilotage_pipeline, PATCH prospect statut=traité
- Pilotage (`demo.agenceattractor.com/pilotage`) : badge "Site" sur leads inbound, bouton "WA pré-écrit" orange (wa.me?text=[message Claude]) remplace le bouton WA standard
- Déployé : GitHub Actions (agenceattractor.com) + Cloudflare Pages (pilotage)
- Mac Arthur ne qualifie plus et ne rédige plus manuellement : 1 clic suffit pour envoyer le premier message au prospect

---

## 2026-06-22 (session 69 — Pilotage : SOP commerciale + design light mode)

### Process commercial cadré dans l'app pilotage
- **SOPCadre** : 8 règles non négociables affichées en permanence dans l'onglet Pipeline
- **Validation par étape** : checklist bloquante à chaque changement de statut (Devis envoyé : 4 / Acompte reçu : 4 / En production : 4 / Livré : 5 conditions)
- **NouveauProspectModal** : ajout prospect depuis l'app (nom, activité, WA, famille A/B/C, zone CI/France/International) sans sortir de l'interface
- **Pipeline natif Supabase** (`pilotage_pipeline`) : colonnes `famille`, `zone`, `activite`, `setup`, `mensuel` ajoutées. Notion CRM remplacé pour le suivi actif
- **Montants éditables** : setup et mensuel saisissables directement dans chaque fiche prospect

### Design apps aligné agenceattractor.com
- Light mode complet : fond crème (#F5F0E8), cartes blanches, accent orange (#EE7C1F), typographie propre
- Fix iOS Safari : zoom auto sur contentEditable corrigé (`maximum-scale=1` + `font-size:16px` au focus)
- Fix overflow horizontal : `width:100%; maxWidth:100%; minWidth:0; overflowWrap:break-word` sur tous les champs éditables
- Fix SOP modal scroll : `flex:1; minHeight:0; overflowY:auto` sur la liste des checks (résout le `min-height:auto` par défaut des flex children)

### Infra
- Déploiement basculé sur Cloudflare Pages (wrangler), Netlify crédits épuisés
- Projet Cloudflare : `demo-agenceattractor`

---

## 2026-06-22 (session 68 — J'Envoie Express livraison complète)

### J'Envoie Express — app métier livrée et déployée
- Page publique : formulaire demande (3 options collecte FR + CI), prochains départs accordéon, suivi colis par numéro, prix dynamiques Supabase
- Dashboard Jean Yves simplifié : 3 vues (À traiter / En cours / Paramètres), modal acceptation rapide (poids + montant → colis créé directement), confirmation avant refus, lien suivi WA 1 clic
- Déployé sur Cloudflare Pages (jenvoie-express.myattractor1.workers.dev) après blocage crédits Netlify
- SQL Supabase exécuté : colonnes nom_expediteur + wa_expediteur, policy voyages lecture publique
- Template #1 du Générateur d'Apps Métier validé en conditions réelles

---

## 2026-06-21 (session 67 — GetWinWorld refonte + stratégie formules multiples)

### GetWinWorld — refonte visuelle complète (index.html)
- Palette "Atelier Italien" : Vert #1B3A2D + Rouge #C0392B, Cormorant Garamond (titres) + Space Grotesk (corps)
- Splash redesignée : hero vert foncé, 3 services numérotés I/II/III en rouge, comparaison avant/après, prix 150€ + 35€/mois
- App : 3 onglets Vitrine (Vestimentaire / Concierge Événements / Vidéos), logique 0 stock throughout ("Sur commande · Délai X-X jours")
- Section Concierge avec 3 offres (Événements privés / Accès VIP / Déplacements)
- Section Vidéos avec thumbnails et bouton play
- Déployé sur demo.agenceattractor.com/getwinworld

### GetWinWorld — closing.html : 3 formules tarifaires
- Formule I Essentielle : 150€ setup + 35€/mois — 1 mise à jour catalogue/mois incluse, acompte 75€
- Formule II Active : 350€ setup + 65€/mois — back-office autonome (MAJ illimitées), enquêtes satisfaction, notifications auto, acompte 175€ — mise en avant "Recommandée"
- Formule III Premium : 600€ setup + 100€/mois — tout le II + vidéos hébergées + plateforme VIP + tableau de bord Charles, acompte 300€
- Checklist inclus/exclus par formule, note explicite sur quota mensuel Formule I

### Décision commerciale — formules multiples dans tous les devis
- Cas Charles = cas d'école : prospect via recommandation, a négocié de 350€ à 150€ sur un seul tarif présenté
- Nouvelle règle : tout devis présente désormais 2 ou 3 formules (Essentielle / Active / Premium ou équivalent)
- Le client choisit son niveau d'entrée, on ne descend plus sur le même périmètre
- À uniformiser sur tous les templates commerciaux existants et futurs

---

## 2026-06-19 (session 66 — refonte offre Latiss + NDA allégé)

### Beynaud — offre.html refondée + NDA simplifié
- Tarifs ramenés en euros : Modèle 1 = 5 000€ setup + 1 500€/mois + 12% / Modèle 2 WIN WIN = 1 500€ forfait + 0 MRR + 70-30 / Modèle 3 Licence = 35 000€ + 1 500€/mois + 0%
- ROI recalculé (1€ = 655 FCFA) : x10 / x28 / x1,7
- Sections "Pour qui" supprimées, marque concept non nommée dans les docs, artiste désigné "Latiss" partout
- XPaye 16 pays intégré dans les questions juridiques (partenaire historique Agence Attractor)
- Calendrier en Étape 1→4, CTA "cahier des charges + démarrage du chantier"
- NDA modal allégé : simple acceptation confidentialité RGPD, NDA complet renvoyé au cadrage
- Déployé Netlify demo.agenceattractor.com

---

## 2026-06-19 (session 65 — Beynaud Army démo complète + offre + Livraison Pro design + fix C Real)

### Beynaud Army — démo + offre confidentielle
- Demo 11 slides finalisée : boutique emojis remplacés par SVG line-art (shirt, cap, vinyl, photo)
- NDA gate : bandeau d'entrée slide 1 + bouton top-bar pulsant rouge, offre déverrouillée après signature
- `offre.html` créé : 3 modèles de collaboration (Clé en main / Partenariat 12% / Licence), revenue sharing comparatif, 6 points juridiques (droits image, paiements mobiles CI, clause sortie), calendrier J+0→S3
- Déployé sur Netlify `demo.agenceattractor.com/beynaud/` + `demo.agenceattractor.com/beynaud/offre.html`
- RDV téléphonique avec Serge prévu : stratégie = envoyer lien WA pendant l'appel, guider vers slide 3 (40M FCFA) et slide 9 (simulation)

### Livraison Pro — design system ATTRACTOR + hero photo
- `tokens.css` réécrit : palette ATTRACTOR complète (Sora, `--or:#F25C05`, `--noir:#1A1714`, vert CI préservé)
- Hero photo réelle intégrée (`img/hero.webp` 142kb WebP, fallback PNG), z-index corrigé, gradient overlay ajusté
- `manifest.json` mis à jour, `app.html` theme-color orange
- Déployé sur Vercel via `npx vercel --prod`

### Fix Attractor Assists — onboarding C Real
- Bug "une erreur est survenue" au clic "Lancer assistant" : colonne `profil_type` manquante dans `profiles`
- Migration `0045_profil_type.sql` créée et appliquée en production via Supabase Management API
- Fix transparent pour C Real et tous les futurs utilisateurs

---

## 2026-06-19 (session 64 — Login Assists : slideshow hero + Maryline pré-signup + retour site)

- "Retour au site" plus visible sur LoginScreen (text-white/50 → text-white/75)
- ProfilScreen : footer devient lien cliquable vers agenceattractor.com
- Slideshow hero 5 photos avec crossfade (4.5s / 0.7s) — hero-1 à hero-5 dans `uploads/`
- Chat Maryline pré-signup : bulle flottante droite sur l'intro, 4 FAQ scriptées, sheet WhatsApp-style, CTA "Démarrer" intégré
- Photos : groupe avec téléphones, entrepreneur bras ouverts, rooftop coucher soleil, groupe hommes, businessman bureau
- 4 commits : 6ddf805 → 4f0cdc2 → db9bd2e → b189347

---

## 2026-06-19 (session 63 — Ebook PDF + redesign consulting + SMTP + fix onboarding C Real)

### Ebook "Méthode ATTRACTOR" déployé

- `livrables/commercial/site-agenceattractor/ebook-pdf.html` créé : ebook HTML A4 imprimable, 19 pages, design system ATTRACTOR complet (cover charbon/orange, pages corps blanc/sable, story sections charbon)
- Contenu complet : cover, citation, sommaire, intro, prologue Koffi/Awa, 7 chapitres méthode ATTRACTOR, plan 7 jours, bonus CTA
- 4 URLs converties en liens `<a>` cliquables (agenceattractor.com, assists.agenceattractor.com, consulting, assists)
- Barre d'impression cachée à l'impression, fonctionnel via `window.print()`
- Déployé sur GitHub Pages : `agenceattractor.com/ebook-pdf.html`
- Apps Script mis à jour pour pointer vers le nouvel ebook

### consulting.html redesigné (design system ATTRACTOR)

- Fonts remplacées : Playfair Display + DM Sans → Sora uniquement
- Tokens ATTRACTOR appliqués : `--orange:#F25C05`, `--charbon:#1A1714`, `--sable:#FAF6F0`, `--g200:#E8E2DA`
- Aliases legacy conservés pour éviter les régressions visuelles
- Story section en charbon pour le contraste, footer charbon avec liens sable/orange
- SVG boussole mis à jour vers orange (#F25C05), modal CGV fond blanc titres Sora accents orange

### Resend SMTP Supabase activé — OTP fonctionnel

- DNS Resend vérifiés (Verified), SMTP configuré dans Supabase Auth : `smtp.resend.com` port 465, `noreply@agenceattractor.com`
- Confirmé : code OTP 6 chiffres reçu en boîte mail — les nouvelles inscriptions sont débloquées

### Fix onboarding Assists — persistance localStorage (C Real)

- Bug signalé par Kezey (C Real) : blocage au moment de rentrer ses produits + perte de progression en cas de rechargement
- Fix : persistance de toutes les variables d'état onboarding dans `localStorage` (clé `aa_onboarding_v1`)
- useEffect RESTORE au montage pour reprendre là où l'utilisateur s'est arrêté
- useEffect SAVE sur chaque changement d'état significatif (phase, prenom, nomAss, profilType, anamnData, anamnQ, baptemeQ, chatHistory, templateId, brandColor, slug, produits)
- `localStorage.removeItem(LOCAL_KEY)` à la fin de l'onboarding pour nettoyer
- Fix champ prix iOS : `type="text" inputMode="numeric"` + `.replace(/\D/g, '')` au lieu de `type="number"` (évite le blocage iOS)
- Déployé sur Netlify : `assists.agenceattractor.com`

### Tâches restantes

- Vérifier trigger `envoyerEmailsQuotidiens` dans Apps Script (actif + 8h quotidien)
- Test funnel complet end-to-end (diagnostic → email → J0 reçu)
- Vérification visuelle consulting.html en conditions réelles
- Facebook Login : configurer côté Supabase + callback URL Meta

---

## 2026-06-19 (session 62 — Site agenceattractor.com : funnel DMV + audit UX)

### Funnel DMV activé sur le site

- `ebook.html` créé : diagnostic interactif 3 questions (heures perdues + prospects non relancés + autonomie) → calcul FCFA perdus → profil personnalisé → capture email
- Endpoint Apps Script branché sur le bon lead magnet (`AKfycby...neYV6G/exec`, action `inscrire`) avec séquence 12 emails J0→J11 déjà prête
- `index.html` restructuré : hero axé sur le diagnostic, banner ebook au-dessus du fold, 6 cartes → 3 cartes "Fuite #1/2/3", section consulting visible avec 3 offres + tarifs, app "bientôt disponible" remplacée par Attractor Assists
- Nav réordonnée : "Ebook gratuit" (orange) en premier
- Footer et CTA challenge : `openChallengeModal()` remplacé par lien direct `challenge.html`

### Audit UX et corrections

- Audit complet contre UX_SYSTEM.md réalisé
- 3 non-conformités critiques corrigées (rejet automatique évité) :
  - Section consulting 3 cartes : ajout classe `.consulting-grid` + `@media(max-width:768px){1 colonne}`
  - Challenge days 4 cases : ajout `@media(max-width:600px){2 colonnes}`
  - Banner ebook `1fr auto` : ajout `.ebook-banner-grid` + `@media(max-width:600px){empilé vertical}`
- Règle mémorisée : audit UX automatique avant tout commit front-end sans demande explicite

### Déploiement

- Commits pushés sur master, GitHub Actions déploie automatiquement sur `agenceattractor.com`

### Tâches restantes

- Vérifier trigger `envoyerEmailsQuotidiens` dans Apps Script (actif + 8h quotidien)
- Vérifier onglet LEAD_MAGNET dans Google Sheet
- Test funnel complet end-to-end (diagnostic → email → J0 reçu)
- Photo Mac Arthur sur chat widget
- Audit UX de challenge.html
- Resend SMTP Supabase dès DNS Verified

---

## 2026-06-18 (session 61 — Cabinet DAB : dossier créé + note stratégique envoyée)

### Note stratégique DFMM envoyée à Cabinet DAB

- Document `note-strategique-dfmm.html` produit et envoyé à Cabinet DAB (Dr. KANGA + M. Ahébé Jean)
- Contenu : preuve MVP (3-5T/mois CI → Canada) · 3 chantiers détaillés · brief production vidéo (4 tournages) · tableau tarification à compléter · préparatifs par acteur (Dr. KANGA + M. Ahébé Jean) · planning juillet–septembre 2026
- Prochaines étapes côté Cabinet DAB : valider les tarifs masterclass, fournir accès CMS + inventaire enregistrements, disponibilité Dr. KANGA pour tournages
- Option dashboard : subdomain `tableau.cabinetdab.com` sur Netlify + Supabase, CNAME côté TyIT Group — à construire dès que Cabinet DAB répond

---

## 2026-06-18 (session 61 — Cabinet DAB : dossier DFMM récupéré et sauvegardé)

### Dossier Cabinet DAB créé après coupure PC

- Contexte récupéré depuis `context/import/DMV Cabinet DAB x Agence Attractor x Beracca.txt` + brief oral de Mac Arthur
- Projet DFMM "De la Ferme aux Marchés Mondiaux" : Mac Arthur a modélisé le concept avec Cabinet DAB (Dr. KANGA), lancé un appel à candidatures (45+ intéressés), coaching collectif 3 mois par webinaires
- Mac Arthur a mis en contact Beracca Mastery Group x Cabinet DAB pour la matérialisation
- Résultat validé : **Beracca a obtenu un marché d'exportation 3 à 5T/mois**, KONAVA reçoit l'attiéké pour les magasins OPLUS Canada
- Phase suivante : communication pour attirer les 3 cibles de toutes les parties prenantes — Agence Attractor pilote la stratégie globale
- Dossier créé : `livrables/clients/cabinet-dab/BRIEF_PROJET.md` (source de vérité du projet)
- CONTEXT.md mis à jour avec Cabinet DAB comme projet actif

---

## 2026-06-17 (session 60 — Plan acquisition 10k€ + pivot focus ventes)

### Pipeline actualisé et plan chiffré construit

- Club Élévia : NDA signé, document vision attendu, démarrage fin juin — 3 500€ setup + 250€/mois
- Andréa Koné : GO fin juin, site à construire — 500-1 000€ setup
- Beracca : NDA + offre envoyés, en attente retour — 150€/mois + 10% commission
- Beynaud : relancé, feedback attendu — 1 500€ setup + rev share (deal stratégique)
- Club Élévia : NDA signé, vision en cours
- J'envoie Express : relance en cours (RDV semaine passée annulé)
- Rukayatou : partenaire (pas cliente), RDV à caler
- C'Real : tests en cours, sera utilisé comme DMV principale pour attirer nouveaux clients
- GetWinWorld : relance aujourd'hui

### Modèle économique clarifié — 3 flux vers 10 000€/mois

- Flux 1 : Setups app métier 3-4/mois × 1 000-2 000€ = 3 000-8 000€ (levier principal court terme)
- Flux 2 : MRR clients 10 clients × 200-250€ = 2 000-2 500€ (construit sur 60-90 jours)
- Flux 3 : Attractor Assists SaaS = rôle crédibilité avant août, revenus significatifs en 2027
- Beynaud ou équivalent grand compte = game changer si ça signe

### Décisions stratégiques

- Focus total sur ventes à partir de maintenant
- Meta ads activé comme canal d'acquisition
- C'Real = DMV Attractor : 1 client réel qui vend → attire 5 clients similaires
- HISTORY.md recentré sur acquisition concrète (plus de détails techniques)

---

## 2026-06-17 (session 59 — Galerie templates + P1 bugs + audit parcours)

### Galerie templates, realtime commandes, table orders créée, liens boutique corrigés

- TemplateGalerieScreen : galerie in-app (Grille/Liste/Magazine), mockups CSS purs, iframe preview plein écran, sélection sauvegardée en Supabase — les prospects ne quittent jamais Assists
- P1 fix : table public.orders créée sur Supabase remote (n'avait jamais été appliquée — toutes les commandes Kezey échouaient silencieusement depuis le début)
- P1 fix : realtime Supabase branché sur CommandesScreen (channel filtré par owner_id), màj instantanée sans re-tap + notifications navigateur sur nouvelle commande
- Audit complet du parcours (login → onboarding → activation → app → modèle Kezey) : Facebook login toujours non configuré côté Meta/Supabase
- Bug lien boutique corrigé dans 5 fichiers : assists.agenceattractor.com/b/slug → www.assists.agenceattractor.com/?c=slug
- Architecture clarifiée : www.assists.agenceattractor.com = app Assists / demo.agenceattractor.com = mini-sites clients statiques
- Message WhatsApp rédigé pour Kezey : se reconnecter sur www.assists.agenceattractor.com et vérifier slug = creal

---

## 2026-06-17 (session 58 — suite — Beynaud Army : démo validée)

### Maquette Beynaud Army validée, contact Serge initié

- Maquette 11 slides mise à jour : ton généralisé slide 2, pain cards reformulées
- Modale NDA horodaté intégrée (clic pendant présentation → mailto pré-rempli)
- Closing remplacé : roadmap 5 étapes + bouton "Signer le NDA maintenant"
- Démo validée en live sur demo.agenceattractor.com/beynaud
- Contact Serge Beynaud initié — prochaine étape : obtenir un rendez-vous de présentation

---

## 2026-06-17 (session 58 — Beracca Mastery Group — dossier commercial complet)

### Dossier partenariat Beracca créé et envoyé

- Nouveau dossier client : Bérénice KOUADIO DEBRIMOU, Manager Beracca Mastery Group (CI), agro-distribution attiéké
- Modèle partenariat simplifié et aligné : 100 000 FCFA mise en place + 100 000 FCFA/mois + 10% sur croissance au-dessus du CA de référence
- 3 documents produits : NDA (11 articles, durée 5 ans, juridiction CCJA-OHADA), Contrat partenariat stratégique (15 articles, 5 phases ERP), Fiche d'investissement A4 Noir & Or
- Fix PDF export couleurs appliqué sur les 3 documents (print-color-adjust: exact)
- Mail envoyé. Statut : en attente retour cliente et versement 100 000 FCFA pour déploiement Phase 1

---

## 2026-06-17 (session 57 — Monitoring Assists mis en place)

### Système de veille automatique déployé

- Stratégie de monitoring définie : 2 couches (UptimeRobot 5 min + n8n 2h)
- UptimeRobot actif : 2 monitors (assists.agenceattractor.com + demo.agenceattractor.com)
- Workflow n8n "Veille Santé Assists" créé et activé sur Railway : 4 checks automatiques toutes les 2h (Netlify, Supabase Auth, chat-assistant, init-payment), alerte email via Resend si panne détectée
- Variables Railway ajoutées : RESEND_API_KEY, N8N_BLOCK_ENV_ACCESS_IN_NODE=false
- Incidents gérés en direct : faux positif UptimeRobot Amérique du Nord + faux positif Supabase Auth (apikey manquante, corrigé dans le workflow)
- Fichier source : livrables/ecosysteme-attractor/attractor-assists/monitoring/n8n-health-check.json

---

## 2026-06-17 (session 56 — Fix login OTP + Facebook Login publié)

### Login OTP réparé et déployé

- Bug "Error sending magic link email" résolu : Resend configuré comme SMTP custom dans Supabase
- DNS GoDaddy complétés (MX `send` ajouté) → domaine `agenceattractor.com` vérifié dans Resend
- SMTP Supabase configuré : `smtp.resend.com` port 465, `noreply@agenceattractor.com`
- Test validé : code OTP reçu en boîte mail
- Texte LoginScreen corrigé ("lien de connexion" → "code à 6 chiffres") — commit `339fdb4` pushé, Netlify déployé
- **Impact** : les nouvelles inscriptions sont débloquées

### Facebook Login — app Meta publiée

- App Meta publiée par Mac Arthur en cours de session
- Étapes suivantes identifiées (non faites) : App ID + Secret → Supabase Auth Providers → callback URL dans Meta → domaine autorisé

### État Assists évalué

- ~68% opérationnel. Login réparé = ~75% désormais
- Bloquant principal suivant : testeurs silencieux depuis longtemps — à réactiver par WA direct avant nouvelle campagne acquisition
- Prompt stratégique rédigé : réflexion Assists × écosystème Meta (toutes les connexions possibles)

---

## 2026-06-15 (session 55 — Déploiement C'Real + Vision nouveau produit Assists)

### Mini-site C'Real déployé

- Mini-site Kezey (farines infantiles C'Real) mis en ligne sur `demo.agenceattractor.com/creal`
- Stack : HTML standalone, catalogue 8 produits, panier, commande via WhatsApp (+225 07 49 56 39 76), chat assistante IA
- Profil Supabase Kezey configuré : `public_slug = 'creal'`, `client_assistant_prompt` rédigé, `client_assistant_ready = true`
- Blocages résolus en session : ANTHROPIC_API_KEY vide dans les secrets Supabase Edge Functions (clé ajoutée), erreur 23502 sur INSERT profiles (profil existait déjà, UPDATE suffisait)
- Lien envoyé à Kezey

### Insight stratégique — Tandem WhatsApp + Assists

- Partager le lien du mini-site en message d'accueil ou message d'absence WhatsApp résout le problème de l'API WhatsApp Cloud (pas besoin de migration SIM)
- Les conversations publiques sont déjà sauvegardées en base (table `conversations`, `is_public = true`) — le CRM se nourrit automatiquement
- Chantier restant : afficher ces conversations publiques dans le dashboard entrepreneur (CommandesScreen ou onglet dédié)

### Feedback design — Anti AI-slop

- Réponse de l'assistante C'Real jugée trop "chatbot générique" : emojis, gras markdown, formule d'accueil artificielle
- Décision : refonte progressive de l'approche design Assists — standard à définir proprement avant la prochaine session dédiée
- Mémorisé : prompts assistants clients = zéro emojis, zéro markdown, ton naturel et direct

### Vision nouveau produit Assists — Sites de commande métier

- Concept : site web de commande professionnel pour entrepreneurs (hero/bannière, produits bien affichés, couleurs du client)
- Workflow envisagé : anamnèse conversationnelle → brief design standardisé → transmis à l'équipe (maquettiste + programmeur) → génération maquette → client charge ses propres photos depuis smartphone
- Faisabilité confirmée : socle technique déjà en place (upload photos Supabase Storage migration 0032, maquette-closer, anamnèse V3)
- Séance de travail dédiée à planifier

---

## 2026-06-14 (session 54 — Nouveau prospect Serge Beynaud · Maquette BEYNAUD ARMY)

### Prospect qualifié : Serge Beynaud (artiste coupé-décalé, icône ivoirienne)

- Profil : 2M+ fans, figure nationale CI, marque lifestyle forte, fondateur (fondation jeunesse), a vécu une restriction Facebook (douleur vécue = hook central de la vente)
- Proposition : app "BEYNAUD ARMY" — Fan Operating System (Fan Club payant 3 niveaux, boutique officielle directe, lives + vidéos exclusives, contact direct 100% de l'armée)
- Calcul potentiel présenté : 1% adoption × 2 000 FCFA × 2M fans = **40M FCFA/mois récurrents**

### Maquette BEYNAUD ARMY produite (11 slides)

- Déployée sur `demo.agenceattractor.com/beynaud`
- Design mobile-first, palette Noir/Rouge/Chrome déduite de l'identité visuelle de l'artiste
- Structure : Cover / Problème / Solution / App fan (splash + fan club + boutique) / Lives & vidéos exclusives / Dashboard artiste / Simulation live (fan clique → notification temps réel artiste) / Chiffres / Closing
- Contenu exclusif verrouillé par niveau (Fan / VIP / Elite), player live simulé avec badge LIVE
- Swipe mobile ajouté, navigation clavier, simulation interactive
- Décision stratégie : montrer QUOI (produit), garder COMMENT (architecture, code, intégrations) — lien non public, présenter en live uniquement

### Business model défini

- Modèle recommandé : hybride — 1 500€ setup + 150€/mois + 3% revenue share Fan Club
- Logique : setup couvre la prod, mensuel = récurrent stable, rev share = alignement sur la croissance du fan club
- Piloté dans Supabase : ATR-9, priorité 1

### Risques techniques analysés

- Vidéos / lives : déléguer à CDN (Mux / Cloudflare Stream) — pas de gestion maison des flux
- BDD sous charge : Supabase Pro + connection pooling suffit jusqu'à 10 000 simultanés
- Fuite du lien vidéo : signed URLs temporaires (Mux / Cloudflare natif)
- Paiements Wave/MTN instables : retry + statut "en attente" en base
- Pic exceptionnel (50K+ simultanés) : architecture event à facturer séparément

### Garanties légales cadrées

- Avant présentation : démo en live uniquement, pas de lien envoyé par écrit
- Si intérêt : NDA 1 page (Yousign mobile), couvre aussi l'entourage de l'artiste (manager, équipe digitale)
- Si accord : devis signé + 40% acompte avant tout démarrage
- PI : le code appartient à Mac Arthur jusqu'au paiement intégral
- Revenue share : formalisé contractuellement (% + base de calcul + vérification)
- À faire dès maintenant : dépôt Enveloppe Soleau INPI (10€) pour horodater le concept et le code

### Pilotage mis à jour

- Supabase : ATR-9 inséré dans `pilotage_pipeline` (statut "Demo prete", prochaine action NDA + présentation live, semaine 17/06)
- Démo Beynaud Army ajoutée dans l'onglet Démos du pilotage

---

## 2026-06-13 (session 53 — Tableau de bord Pilotage connecté Supabase)

### Dashboard Pilotage opérationnel

- Prototype statique converti en app connectée Supabase (4 tables : `pilotage_cap`, `pilotage_pipeline`, `pilotage_focus`, `pilotage_projets`)
- Données chargées au démarrage via `@supabase/supabase-js` CDN — plus de hardcode
- Édition inline sur tous les champs clés : prochaine action (pipeline + projets), focus (description + toggle done), cap confirmé + pipeline qualifié
- Toutes les modifications persistent en base au blur/Entrée
- Démos responsive : 2 colonnes tablette, 1 colonne mobile < 400px
- Fix majeur : colonne `priorite` manquante dans pilotage_pipeline causait une query Supabase silencieuse → pipeline affichait 0€. Colonne créée + noms accentués restaurés (Club Élévia, Vies Croisées)
- Fix layout : remplacement inputs/textareas par `contentEditable` pour édition sans décalage de contenu
- Déployé sur `demo.agenceattractor.com/pilotage`

### Référence dashboard inspirante notée

- `https://dashboardbusiness.netlify.app/` : bonne base pour futures features (log transactions, charges outils, alertes expiration) — design moins avancé que le nôtre mais idées utiles

---

## 2026-06-13 (session 52 — Démo Beracca Mastery Group produite et envoyée)

### Maquette hi-fi TOP Attiéké V1 livrée

- Prototype React 18 + Babel standalone déployé sur `demo.agenceattractor.com/beracca`
- Vue manager (Bérénice Kouadio) : dashboard trésorerie, FAB "Saisir une commande" entre Accueil et Caisse, notifications en temps réel, liste commandes + timeline statuts
- Vue client : catalogue 2×2 avec photos produits réelles (4 formules : SOUTRA / ECO / Family / Pro), panier avec vignettes, formulaire coordonnées + zone + paiement, confirmation
- Simulation live : commande saisie côté client → apparaît instantanément dans le dashboard manager (badge cloche rouge + toast + ordre en tête de liste)
- Design mobile-first : plein écran sur téléphone, toggle Client/Beracca en haut de l'écran
- **Prix à confirmer avec Bérénice** (valeurs issues du fichier design, pas validées)
- Lien envoyé à Bérénice Kouadio le 13/06/2026 — en attente de feedback

---

## 2026-06-13 (session 51 — Dossier Club Élévia : NDA V2 + Devis + Contrat)

### Documents Club Élévia produits et archivés

- NDA V1 refusé par Élise (léger, non signé) : 6 points d'amélioration remontés par la cliente. NDA V2 produit avec toutes les corrections : PI exclusive Élise (nom, concept, business model, marque, stratégie), durée illimitée pour les secrets commerciaux, non-concurrence 24 mois, clause restitution/destruction des données, Tribunal Judiciaire de Paris explicite
- Reçu REÇ-2026-001 : 200€ Wero reçus le 10/06/2026 à 12h24, solde 50€ restants
- Devis ATR-2026-0005 : 3 500€ setup en 4 phases progressives (Identité 800€ / Confiance 700€ / Rencontre 1 350€ / Communauté 650€) + Plan de continuité 250€/mois. Paiement 50/50 par phase, acompte 250€ déduit du démarrage Phase 1 (150€ net)
- Contrat CONTRAT-ATR-2026-0005 : 18 articles complets (objet, périmètre cadré inclus/exclus/complémentaire, obligations réciproques, paiement, recette + 2 rounds révisions inclus, PI cession complète par phase, Plan de continuité, garantie 2 mois, confidentialité, limitation responsabilité plafonnée, résiliation équilibrée 3 cas, force majeure, TJ Paris)
- Google Drive structuré sur macarthur.nguessankouassi@gmail.com : `Clients/Club Élévia — ATR-2026-0005/` avec sous-dossiers Documents signés / Documents de travail / Échanges
- Notion CRM mis à jour (fiche ATR-10 : notes + prochaine action + liens Drive intégrés)
- Message WhatsApp préparé pour envoi des 4 documents via Yousign

### Feedback rigueur juridique acté

- Claude doit présenter une checklist des clauses critiques AVANT toute rédaction juridique — mémorisé dans la mémoire persistante

---

## 2026-06-12 (session 50 — MVP WhatsApp + clarification tandem Assists)

### Compréhension tandem WhatsApp x Attractor Assists

- Logique de fond documentée : 5 scénarios d'adoption, complexité par palier (45/100 MVP, 160/200 industrialisé), modèle pricing MVP (150€ setup + 49€/mois)
- Étude de cas C'Real (Kezey) : option B retenue = mini-site HTML C'Real comme interface cliente réelle, Assists en backend invisible
- Document de référence créé : `context/import/tandem-whatsapp-assists.md`
- Insight clé : la maquette-closer = 80% de l'anamnèse, même travail sert deux fois

### Infrastructure MVP WhatsApp posée

- n8n déployé sur Railway : `https://n8n-production-3bfc.up.railway.app`
- Workflow WhatsApp importé, clé Anthropic + token Meta configurés
- Nœud "Extraire Message" adapté pour reconnaître les deux formats (Twilio + Meta)
- Workflow publié et actif

### Blocage restant : canal WhatsApp

- Numéro CI +22576877070 : conversations supprimées par erreur (inutilement), numéro recréé en WhatsApp Business. Migration vers API bloquée : SIM CI inaccessible depuis la France
- Twilio Sandbox : sandbox ne répondait plus en fin de session
- **Prochaine étape :** soit présence physique en CI avec la SIM pour migrer le vrai numéro (15 min), soit Twilio numéro virtuel payant (~2€/mois) pour tester depuis la France

---

## 2026-06-11 (session 49 — Point financier stack)

### Bilan financier complet établi

- Stack coûts réels clarifiés : Claude Max 100,07€/mois (renouvellement le 10), Anthropic API ~10€/mois (usage), GoDaddy ~20€/an (renouvellement 05/05/2027), Canva gratuit. Total mensuel réel : ~110€/mois
- Double facturation détectée et réglée : Claude Pro (21,60€) était en doublon avec Claude Max — annulé automatiquement par Anthropic au passage sur Max. Dernier prélèvement Pro : 21/05/2026
- Page Finances créée dans Notion CRM : https://app.notion.com/p/37c4257524c681bf83b1c3bf730de3df (charges, encaissements mensuels, MRR cible vs réel, pipeline, solde net)
- Agent de veille renouvellements activé (chaque lundi 7h UTC, routine `trig_016usiPjAAsTi783K197qCNH`) : lit le tableau Notion et crée un rappel Google Calendar J-2 avant chaque échéance

### CRM mis à jour

- Club Élévia : 1er acompte 200€ reçu le 10/06/2026. 2e versement 50€ attendu le 11/06
- J'envoie Express : acompte 130€ non reçu, RDV reporté semaine du 16/06

---

## 2026-06-11 (session 48 — Security review + fixes + campagne testeurs)

### Sécurité
- Security review exécuté sur commit `c869373` (CLAUDE.md dynamique + migrations 0034/0035)
- 4 vulnérabilités confirmées et corrigées en prod :
  - VUL-02/03 (HIGH) : JWT validation ajoutée dans `chat-assistant/index.ts` — user_id vérifié contre le token avant toute opération
  - VUL-05 (MEDIUM) : policy `notifications INSERT` restreinte à `auth.uid() = user_id`
  - VUL-06 (MEDIUM) : policy `devis_service_all` supprimée — accès direct frontend fermé
- Migration `0036_security_fixes.sql` créée et appliquée en prod
- Edge function `chat-assistant` redéployée
- Commit `5c20a45`

### Stratégie
- Décision : focus 3 semaines sur acquisition de testeurs gratuits (Facebook groupes, LinkedIn, TikTok)
- Campagne contenu rédigée et sauvegardée : `livrables/contenu/campagne-testeurs-juin2026.md`
- 3 semaines : problème → preuve → urgence ; formats : texte long, post court, scripts vidéo 30-45s

---

## 2026-06-11 (session 47 — n8n activé + Agent Commercial en construction)

- Docker Desktop découvert et utilisé pour la première fois, n8n lancé en local via docker-compose
- Workflow "Veille Quotidienne" créé et activé (cron 6h30, RSS 5 secteurs CI/diaspora/food/beauté/business, pipeline complet vers Supabase)
- Données confirmées dans veille_tendances, process-veille prêt à générer les DMV dès les premiers utilisateurs Growth+
- Workflow "Agent Commercial — Brief Matin" démarré : connexion Notion CRM établie (base Dossiers, intégration n8n-attractor créée)

---

## 2026-06-10 (session 46 — Corrections V3 + Offre lancement 1 mois gratuit)

### Bugs corrigés et nouvelles features deployées en prod

- **Encodage UTF-8 corrigé** : 27 caractères double-encodés (é, à, ê, è, ·) réparés en binaire dans DashboardScreen, + BOM retiré sur 6 fichiers JSX (Axes, Broadcasts, Conversation, MasterSheet, Notifications, ConversationScreen)
- **Vote méthode** : `loadVotes()` corrigé (comptage client-side), `vote()` récupère le userId en live plutôt qu'en state — le bouton "Je veux ce livre en premier" fonctionne maintenant
- **ProfilScreen redesigné** : raccourcis rapides (Assists, Catalogue, Clients, Fidelys), boutique en hero card orange si pas de slug, layout plus engageant et cliquable
- **CatalogueScreen** : upload photo depuis le téléphone via Supabase Storage (plus besoin de coller une URL), bucket `catalogue-photos` créé (migration 0032)
- **Offre lancement** : badge "OFFERT" dans PaliersScreen, TrialSheet avec confirmation + liste des features, edge function `activate-trial` (set plan_code=bras_droit +30j + notif in-app), migration 0033 (colonnes trial_activated_at / trial_expires_at)
- **Dashboard** : card tip quotidienne rotative pour les utilisateurs en essai (feature du jour + jours restants), banniere upgrade masquee pendant l'essai
- Migrations 0032 et 0033 appliquees en prod, commits `e5c1159` et `481e622` pushes

---

## 2026-06-10 (session 43 — Attractor Assists V3 : refonte complète deployée en prod)

### V3 deployée à 18h55

- **Navigation V3** : 4 onglets (Assists / Catalogue / Commandes / Profil), ancien système supprimé
- **DashboardScreen** : "On fait quoi aujourd'hui boss ?", card proactivité (plan Gratuit), StatStrip commandes/relances
- **CatalogueScreen** : nouveau — grille 2 colonnes, chips catégories, gestion actif/inactif
- **CommandesScreen** : nouveau — stats CA du jour, tabs En attente/En cours/Livrées
- **ProfilScreen** : section Outils + Configuration (lien boutique, nom assistant, plan badge)
- **OnboardingScreen** : 9 étapes, baptême mutuel (2 questions : prénom + nom de l'assistant)
- **PublicAssistantScreen** : machine à 5 états (splash → catalogue → chat → paiement → confirmation)
- **PaliersScreen** : 2 plans uniquement (Gratuit 0 F / Bras Droit 9 900 FCFA) + 2 upsells sur mesure avec CTA WA
- **Migration SQL** : table `orders` créée (0028_orders.sql)
- **Process upsells** : `livrables/commercial/process-vente/PROCESS_UPSELLS_SUR_MESURE.md`
- Commit `4d87f89` pushé sur master, build propre, deploy Netlify confirmé

---

## 2026-06-10 (session 44 — Club Élévia : NDA signé + Maquette V2 + Process closing)

### NDA Club Élévia signé avec Elise CAPEL

- NDA créé, ajusté (Mac Arthur KOUASSI, Paris, Auto-entrepreneur, signature électronique) et envoyé via Yousign
- Signé et validé le 10/06/2026 — fichier dans `livrables/clients/club-elevia/`
- App repositionnée : ouverte à toutes nationalités (pas uniquement diaspora africaine)
- En attente du document détaillé d'Elise (à poser dans `context/import/`) pour mise à jour contenu maquette

### Maquette Club Élévia V2 structurée

- Ancienne maquette "Racines" (V1, diaspora, rose/violet) supprimée
- Maquette V2 générée via Claude Design (rebrandée Club Élévia) sauvegardée dans `livrables/clients/club-elevia/maquette-club-elevia-v2.html`
- Contenus provisoires marqués `<!-- PLACEHOLDER -->` pour mise à jour après réception doc Elise
- Dossier club-elevia contient désormais : NDA signé + maquette V2 cliquable

### Process commercial grands clients — formalisation en cours

- Séquence validée : NDA signé → maquette V2 annotée + cliquable → PDF éducatif phases → point contenu/UX → dev
- PDF éducatif sur les phases de déploiement prévu (fond noir/doré, premium) — en attente GO de Mac Arthur
- Clients d'envergure (Club Élévia, Beracca) = NDA obligatoire avant tout brief détaillé
- **Prochain chantier identifié :** automatiser l'envoi du NDA à signer via Yousign

---

## 2026-06-09 (session 43 — Nouveaux modules V3 + Branding Assists acté)

### Branding JARVIS → ASSISTS acté définitivement

- "Jarvis" remplacé par "Assists" dans tout le workspace (CLAUDE.md, CONTEXT.md)
- Le workspace de Mac Arthur EST l'Assists de Mr Attractor — prototype vivant et source de vérité
- Cohérence totale : même nom dans le produit et dans le workspace personnel

### 4 nouveaux modules V3 ajoutés dans `context/import/`

- `ANAMNESE.txt` : squelette CONTEXT.md entrepreneur — template que l'anamnèse conversationnelle va remplir lors de l'onboarding de chaque entrepreneur dans Assists
- `DECLENCHEUR.txt` : commande /prime simplifiée pour les entrepreneurs Assists (sans étape CRM Notion — juste charger le contexte + résumer)
- `CHASSEUR DINFOS.txt` : skill de veille contextualisée complète — module "Chasseur d'infos" pour Assists (filtre les actualités selon le profil entrepreneur)
- `FIDELYS.txt` : HTML complet Fidelys — 3 interfaces livrées : dashboard entrepreneur (Noir/Or), espace client fidélité (personnalisable aux couleurs de l'entrepreneur), landing inscription

### GetWinWorld — nouveau dossier dans `context/import/`

- 47 photos produit d'une boutique de chaussures luxe/premium (mocassins python, intérieur orange, style prestige)
- Statut : prospect à qualifier ou template démo secteur mode/luxe

---

## 2026-06-09 (sessions 41-42 — V3 Chantier 2 + Architecture cerveau + Base de connaissance)

### Chantier 2 livré — Agent Veille & Prospection (DMV quotidienne)

- Edge functions déployées sur Supabase : `receive-veille` (webhook n8n → stocke les articles RSS) et `process-veille` (génère DMV personnalisée via Claude Haiku pour chaque utilisateur Growth+)
- Migration SQL `0027_veille.sql` créée (tables `veille_tendances`, `dmv_queue`, `user_rss_config`) — à appliquer manuellement dans le dashboard Supabase
- `DashboardScreen.jsx` mis à jour : card "Action du jour" affiche insight + message WA copiable + idée de post + question client (preview bloquée pour plan gratuit, CTA Growth)
- `notify-auto` mis à jour : livre la DMV via notification agent à 8h, marque delivered=true
- SOP n8n créé : `.claude/skills/veille-setup/SOP_n8n.md` (guide complet pour l'assistante, 5 étapes, URLs RSS par secteur, checklist test)

### Architecture V3 — Principe du CLAUDE.md dynamique documenté

- Principe central cadré et ajouté à `concept-v3.md` : chaque entrepreneur a son propre CLAUDE.md construit dynamiquement (profil + mémoire + modules actifs + base de connaissance)
- Analogie directe : CONTEXT.md = table profiles, HISTORY.md = memoire_cache, /prime = anamnèse, /morning = DMV quotidienne, skills/ = modules Fidelys/Veille/Commandes
- Le system prompt de chaque Jarvis = Base de connaissance Attractor (fixe) + Profil entrepreneur (dynamique) + Mémoire des échanges (croissante) + Modules actifs (contextuels)
- Chantier technique suivant identifié : câbler ce principe dans `chat-assistant/index.ts` (chargement dynamique profil + mémoire + base à chaque conversation)

### Base de connaissance Attractor créée

- Fichier : `context/import/methode-md/BASE_CONNAISSANCE_ASSISTS.md`
- Contenu : méthode ATTRACTOR complète (PPSD, AIDA/PASA, offre irrésistible, 4 étapes), mindset et phrases clés Mac Arthur, protocoles d'accompagnement selon situation, ton et registre, 3 paliers de croissance, logique appartement vivant
- Ce fichier sera injecté dans le cerveau de chaque Jarvis entrepreneur comme socle commun immuable

### Wireframes V3 — Claude Design

- Prompts générés pour Claude Design : écrans PWA entrepreneur (Dashboard Jarvis, Conversation, Boutique, Onboarding), mini-site boutique client (Splash, Catalogue, Chat commande)
- Concept onboarding "appartement vide" cadré : anamnèse conversationnelle + phase apprentissage style + complicité progressive (taquin semaine 3+)
- Humanisation Assists : le Jarvis apprend à écrire comme l'utilisateur, s'adapte progressivement, ne plaisante pas avant d'avoir créé la complicité

### Modèle économique — Réflexion

- 3 modèles analysés : SaaS pur / Hybride abonnement+services / Commission transactions
- Recommandation : Modèle B (Hybride) comme socle + Modèle C (Commission XPaye) comme upside Phase 2
- Gratuit : mini-site boutique fonctionnel + Jarvis 20 msg. Bras Droit 12€/mois : Jarvis illimité + DMV + Fidelys + Veille
- Mac Arthur continue la réflexion avant décision finale

### Décision naming

- "Jarvis" → "Assists" dans le produit Attractor Assists
- Motivation : cohérence de marque, pas de perte des utilisateurs existants, "Assists" est le nom du produit et le nom de l'assistant

---

## 2026-06-09 (session 40 — LivraisonPro : design system + hero illustration)

### LivraisonPro — refonte typographie + illustration hero

- Polices remplacées : Syne → Plus Jakarta Sans (titres), DM Sans → Inter (body) — benchmark Yango/Uber Eats
- Tous les font-weight:800 → 700 dans l'app et la landing (800 = marketing, 700 = UI pro)
- Boutons/cards passés à weight 600 — plus léger, meilleure lisibilité mobile
- Hero landing page : silhouette moto livreur SVG inline (zéro requête réseau) + double gradient orange/vert + overlay fondu noir
- Redéployé sur Vercel — `https://livraisonpro-demo.vercel.app`
- `livraison.agenceattractor.com` — DNS CNAME en propagation

---

## 2026-06-09 (session 39 — LivraisonPro : refacto + déploiement prod)

### LivraisonPro — restructuration complète + mise en prod

- Projet : marketplace livraison certifiée CI (livreur vérifié ↔ marchand)
- Concept : livreur s'inscrit + se fait vérifier → accès réseau marchands ; marchand trouve un livreur en urgence ; GPS tracking = plan Pro (2000 FCFA/mois)
- Refacto complète depuis fichier monolithique 1005 lignes → architecture multi-fichiers
- Fichiers créés : `css/tokens.css`, `css/components.css`, `js/config.js`, `js/data.js`, `js/utils.js`, `js/app.js` (~700 lignes), `app.html`, `index.html` (landing marketplace), `manifest.json` (PWA), `vercel.json`
- Backend : migration Supabase appliquée (6 tables : users, missions, bons, alertes, avis, tracking\_gps) sur projet `jwucinmwrksqfrmkymds.supabase.co`
- Déploiement : Vercel — `https://livraisonpro-demo.vercel.app` (live)
- Domaine : `livraison.agenceattractor.com` — CNAME ajouté chez GoDaddy, propagation en cours
- Note : actions Supabase côté JS à brancher (actuellement legacy API GAS en fallback) — suffisant pour démo

---

## 2026-06-09 (session 38 — Prospect Elise / Racines + dossier commercial + tableau de pilotage)

### Prospect Elise — Racines (app rencontres diaspora)

- Projet identifié : app de rencontres pour interconnecter la diaspora africaine
- Nom interne dans le workspace : Racines / InterCéli
- Maquette existante : `demo.agenceattractor.com/racines` (rose/violet — à refaire en Noir & Or)
- Document technique importé : `context/import/SITE DE RENCONTRE.txt` (cahier InterCéli V1, 8 modules, 4 sprints)
- Features clés V1 : vérification vidéo KYC (liveness detection), matching IA (embeddings), RGPD lourd
- Features V2 prévues : conciergerie (organisation RDV, chat), photos/vocaux, abonnement premium
- Direction design : Noir & Or chaleureux, prestige, aucune référence "IA" ou "tech"
- Elise basée en France, budget non connu, attend un point
- Devis ATR-2026-0005 cadré en 4 phases progressives :
  - Phase 1 Identité : 800 € (architecture + auth + RGPD + design system)
  - Phase 2 Confiance : 700 € (KYC vidéo)
  - Phase 3 Rencontre : 1 350 € (matching IA + découverte + mise en relation)
  - Phase 4 Communauté : 650 € (messagerie + back-office modération)
  - Total V1 : 3 500 € setup + 250 €/mois MRR
- Dossier créé dans Notion CRM : statut "En contact", prochaine action "Attendre feedback devis 4 phases"

### Dossier commercial créé

Nouveau dossier `livrables/commercial/process-vente/` avec :
- `PROCESS.md` : pipeline de vente complet en 8 étapes (détection → livraison), infos à collecter, messages WA templates, règles non négociables
- `template-devis.md` : structure officielle avec mentions légales
- `template-facture-acompte.md` : facture 50% à la commande
- `template-facture-solde.md` : facture solde à la livraison
- `template-bon-de-commande.md` : validation scope, verrouille le périmètre

### Tableau de pilotage global Notion créé

- Page : https://app.notion.com/p/37a4257524c681b39c20da2dd45c3dee
- Contient : objectif CA, pipeline actif, projets internes, rappel process de vente, compteur devis ATR-2026-0001 à 0005, liens utiles

### /prime mis à jour

- Ajout d'une étape 2 : lecture du CRM Notion (collection Dossiers) à chaque démarrage de session
- L'état réel du pipeline est désormais chargé automatiquement, qu'il ait été mis à jour par Mac Arthur ou par Claude

---

## 2026-06-09 (session 37 — CRM Notion agence créé)

### CRM Mr Attractor dans Notion

- Page hub créée : **"CRM — Mr Attractor"** (compte macarthur.nguessankouassi@gmail.com, pages privées)
- Base de données **"Dossiers"** créée avec 15 champs : Nom, ID auto (ATR-xxx), Type, Famille, Statut, Zone, Setup HT, MRR, Prochaine action, Date action, WhatsApp, Email, Notes, Créé le, Modifié le
- 8 dossiers pré-remplis depuis le contexte : J'envoie Express (Client, Acompte reçu), Rukayatou Saka (Prospect, Devis envoyé), MY NUGO (Client, En production), Andréa Koné — Vies Croisées (Prospect, Devis envoyé), Beracca Mastery Group (Prospect, Devis envoyé), Attractor Assists (Interne), Awa Influenceuse IA (Interne), Agent Commercial (Interne)
- Vue **"Pipeline"** (Kanban groupé par Statut) ajoutée à la base
- Confirmé : Claude peut lire et mettre à jour le CRM Notion directement depuis le Jarvis (MCP branché)

### Lien direct
https://app.notion.com/p/37a4257524c681e6a510c98e53210ffe

---

## 2026-06-09 (session 36 — Mise à plat concept Attractor Assists V3)

### Déclic

Mac Arthur exprime être perdu, demande à simplifier au maximum. Le déclic : son Jarvis personnel (ce workspace) est le **prototype vivant** d'Attractor Assists. Pas une app multi-agents complexe, mais un Jarvis personnel chargé de la méthode Attractor, dupliqué chez chaque entrepreneur pour distiller le mindset Mac Arthur.

### 8 décisions cadrées (une question à la fois)

1. **Pour qui** : entrepreneur + ses clients (2 publics, 1 cerveau)
2. **Surfaces** : Entrepreneur PWA / Client mini-site web (lien partagé via WhatsApp)
3. **Promesse entrepreneur** : "Je te vide la tête"
4. **Promesse client** : "Je prends ta commande de A à Z"
5. **Onboarding** : vidéo Mac Arthur (5 min) + conversation Jarvis (10-15 min)
6. **Catalogue** : photo → IA extrait → entrepreneur valide. Claude design extrait les couleurs et génère le thème de la boutique.
7. **Commandes** : alerte WhatsApp + gestion dans la PWA
8. **Domaine** : démarrage gratuit avec `assists.agenceattractor.com/b/[slug]`, achat domaine court (`attractor.ci` ~15 €/an) reporté

### Pivot vs V2 : suppression du chantier WhatsApp Cloud API

Initialement, on partait sur WhatsApp Cloud API pour la promesse client. Mac Arthur a recadré : approche plus simple via lien partagé. Le client clique le lien dans le message d'accueil WhatsApp de la boutique → atterrit sur un mini-site personnalisé avec assistant de vente intégré.

Gain : 1-2 semaines de dev supprimées, 0 € de coûts Meta récurrents, 0 friction setup côté entrepreneur, branding propre (chaque boutique a son lien).

### Inventaire de l'existant (tri honnête)

- **Écrans** (23) : 4 gardés / 9 simplifiés / 10 jetés / 1 à créer
- **Edge Functions** (23) : 9 gardées / 4 transformées / 10 jetées / 4 à créer
- **Tables SQL** (~28) : 8 gardées / 3 simplifiées / 7 jetées / 4 à créer

Verdict : on jette ~40% du code, on simplifie ~30%, on garde ~30%, on ajoute ~10 briques nouvelles ciblées.

### Livrables

- `livrables/ecosysteme-attractor/attractor-assists/concept-v3.md` créé (source de vérité produit, remplace les concepts V1 et V2)
- Inventaire complet écrans/functions/tables avec verdict de tri inclus dans le document

### Prochaines sessions (à reprendre au choix)

1. Définir à quoi ressemble concrètement le mini-site boutique (écrans + flow commande)
2. Plan d'exécution (semaine 1 / semaine 2 / etc.)
3. Migration des 25 testeurs actuels
4. Pricing V3

---

## 2026-06-08 (session 35 — Mise à jour CONTEXT.md : nettoyage et nouveau CONTEXTE MAÎTRE)

### Nettoyage de CONTEXT.md

- Bullet Attractor Assists simplifié : historique de sessions retiré, état actuel + refonte V2 synthétisés
- 10 sous-bullets "livrés" supprimés (Mini-agents, WhatsApp V1, Feedback, Notifications, MIROIR, CRM, Cockpit, Gardien, Prochains chantiers)
- Notes obsolètes supprimées (Navigation Assists, Modèle Coach, Design assets agents, Frontières agents)
- Note "Chantier futur" remplacée par "Refonte V2 en cours" à jour
- XPaye mis à jour dans les moyens de paiement (désormais actif en production)
- Description Attractor Assists dans "Ce que je fais" simplifiée et renvoyée vers le CONTEXTE MAÎTRE

### Nouveau CONTEXTE MAÎTRE — ATTRACTOR ASSISTS

- Manifeste Produit V2 (ancien, historique) remplacé par le document "MISE A JOUR ASSISTS.txt"
- Cerveau Attractor mis à jour : 14 niveaux (vs 10 précédemment), ajout Processus métier / Digitalisation / Application métier / Entreprise autonome assistée par IA
- Nouvelles sections ajoutées : ERREUR DE LA V1 (confirmation du retour à la source), ANAMNÈSE (jumeau opérationnel), ASSISTANT CLIENT, PROACTIVITÉ, PERSONNALISATION, DIGITALISATION, APPLICATIONS MÉTIERS
- Architecture agents clarifiée : spécialisations internes du cerveau Attractor, pas des produits séparés

---

## 2026-06-05 (session 34 — Refonte Assists : décision validée + mission fondatrice capturée)

### Décision stratégique : refonte complète d'Attractor Assists

- **Déclencheur** : lecture du document `REFONTE ASSISTS.txt` en import
- **Pivot fondamental** : Attractor Assists cesse d'être une plateforme multi-agents pour l'entrepreneur. Elle devient un générateur d'assistant IA que l'entrepreneur partage à SES clients.
- **Suppression définitive** : volet "Mon équipe" (8 agents) disparaît de l'UI utilisateur
- **Nouveau flow** : anamnèse business → génération assistant personnalisé → lien public client → flow commerce (commande / preuve paiement / tracking / satisfaction)
- **Verdict Pilote R&D** : GO sous conditions — valider les 5 questions ouvertes avant développement
- **Faisabilité** : oui sur la stack actuelle (React + Supabase + Netlify). Effort V1 : 3 sessions P0 + 2 sessions P1

### 5 questions ouvertes (à valider avant développement)
1. Slug : l'entrepreneur choisit son lien ou on le génère ?
2. Anonymat client : clients laissent nom/numéro ou totalement anonymes ?
3. Pricing : Gratuit = X commandes/mois ? Growth = illimité + stats + Fidelys ?
4. Migration 25 testeurs : nouvel onboarding forcé ou configuration manuelle ?
5. Multi-produits : un seul assistant ou plusieurs profils par entrepreneur ?

### Mission fondatrice capturée (décision clé)

Ce n'est pas un pivot. C'est un retour à la source. La v1 originale était déjà dans ce modèle, mais la découverte de Claude puis de VS Code a déclenché une sur-construction : trop de personnages, trop de portes conversationnelles, objectif dilué dans la complexité.

**La phrase fondatrice validée et capturée dans CONTEXT.md :**
> "Un bras droit intelligent qui soulage les gens des tâches quotidiennes, tout en les aidant à devenir numéro 1 dans leur couloir."

L'app doit incarner Mac Arthur dupliqué. Pas une agence. Lui.

---

## 2026-06-04 (session 33 — Fix génération maquette + chat WhatsApp-style)

### Génération maquette — bypass Storage complet

- **Problème racine** : `generate-maquette` edge function retournait 500 à cause de Supabase Storage inaccessible (bucket jamais créé ou permissions). Plusieurs tentatives de fix Storage (Uint8Array, bucket autocreation, serve-maquette) ont toutes échoué avec 500 constant.
- **Solution finale** : génération 100% locale côté navigateur via `src/lib/demoTemplate.js`. Template HTML complet généré en JS avec les données du profil (prenom, activite, zone). Zéro API, zéro edge function, zéro Storage. Instantané.
- Template adapte le contenu selon le secteur détecté (food / livraison / services) : labels, icônes, données fictives cohérentes.
- 4 onglets navigables : Accueil (KPIs), Agent IA (chat simulé), Clients, Résultats.
- Blob URL créé dans le navigateur, sauvegarde `demo_html` + `demo_url='generated'` dans profiles (fire-and-forget, SQL 0025 à appliquer).
- **Edge functions déployées mais non utilisées** : `generate-maquette` (mise à jour), `serve-maquette` (nouvelle) — conservées pour le flow Famille A cockpit.
- Bouton "Générer" : guard `!demoProspectId` retiré (plus nécessaire).

### Modal "Pourquoi pas WhatsApp ?"
- Lien discret sous "Voir ma démo" dans `DemoResultCard`.
- Sheet bottom : 5 limites WhatsApp vs 4 avantages Attractor Assists (agent IA 24h/24, tableau de bord, relances auto, gestion métier).
- CTA "Activer mon app" → `onSousHerberge`.

### Chat UX — style WhatsApp
- **Layout** : `height: 100dvh` + `overflow-hidden` — input fixe, ne bouge plus au clavier.
- **Fond** : `#EAE4D9` (beige chaud, wallpaper WhatsApp).
- **Bulles** : police système (`-apple-system`), 15px, poids 400, coins asymétriques (queue droite envoyé / queue gauche reçu), ombre légère.
- **Input bar** : fond `#f0f2f5`, champ blanc arrondi, placeholder `"Message..."`, bouton send orange.
- Commits pushés sur master : `4347fa3`, `0b608a7`.

### SQL à appliquer (non bloquant)
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS demo_html text;
```

---

## 2026-06-04 (session 32 — Refonte flow démo maquette + onglet Mon App)

### Architecture flow démo — refondue de bout en bout

- **Double Carelle corrigée** : retirée du carousel "Mon équipe", carte héro déplacée sur l'Accueil (photo plein-fond, CTA adapté au statut démo/actif/verrouillé). Équipe de l'Accueil filtrée sans Carelle ni Maryline.
- **Timing bouton "Générer"** : plus de comptage de messages (`userMsgCount >= 4` supprimé). Le bouton apparaît uniquement quand Carelle envoie le marker `[[PRÊTE]]` en fin de diagnostic, strippé avant affichage. CARELLE_DEMO_SUFFIX mis à jour dans `chat-assistant` (déployé).
- **DemoResultCard 2 axes** : redesign complet — Axe 1 "L'app hébergée chez nous" (orange, 9 900 FCFA / 15€/mois, ouvre Mon App), Axe 2 "L'app à tes couleurs" (amber, sur devis Famille A, ouvre Carelle en mode famille-a).
- **Mobilisation backend auto** : à la génération réussie, 2 entrées `journal_agent` créées fire-and-forget (programmeur_senior + awa) avec résumé conversation et URL maquette.
- **Mode famille-a** : nouveau mode Carelle dans `chat-assistant` — collecte logo/URL, scraping automatique via `analyze-presence` si URL détectée dans le message, proposition commerciale closing avec pricing Famille A + marker `[[CLOSING_READY]]`.
- **Onglet Mon App** : tab dynamique qui remplace Marketplace quand `profile.demo_url` est set (TABS_USER_MONAPP). Nouveau `MonAppScreen` : mode démo (iframe + bannière "données fictives" + CTA activer) ou mode Growth+ (iframe + actions agents). Route `mon-app` ajoutée dans App.jsx.
- **SQL 0024 appliqué** : `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS demo_url TEXT`.
- **Commit** `8344a10` pushé sur master, Netlify redéployé.

### Prochains chantiers identifiés
- Vérifier la signature de `analyze-presence` au premier test famille-a avec un vrai lien
- Passer XPaye en production si pas encore fait

---

## 2026-06-04 (session 31 — Fix 13 bugs UX/design session 28)

### Tous les bugs traités et pushés en production

- **text-g500** : token manquant ajouté dans `index.css` — `--color-g500: #6b6057` (warm gray cohérent avec la palette)
- **\n non rendu** : `renderText()` branché sur toutes les bulles + `ts={m.ts}` pour les timestamps
- **planLabel brut** : mapping complet dans ProfilScreen (`growth` → "Attractor Growth", `team` → "Attractor Team", etc.)
- **dark mode Maryline** : MarylineBubble reçoit prop `dark`, bg/border/text adaptatifs
- **activeTab hors-nav** : `SUBSCREEN_PARENT` map dans App.jsx (`paliers`/`methode`/`notifications` → `profil`, `agenda`/`carnet`/`dump` → `dashboard`)
- **icône toggle PaliersScreen** : `chevdown` + `rotate-180` (smooth) au lieu de `chevron` + `rotate-90`
- **amber tokens mixtes** : DashboardScreen — `amber-200`/`amber-50`/`amber-600` remplacés par tokens design (`amber/30`, `amber/8`, `text-amber`)
- **emoji solitaire** : `📖` remplacé par `<Icon name="sheet" />` dans DashboardScreen
- **TeamHero statuts bruts** : `resolvedAssistants` passé au lieu de `MOCK.assistants`
- **label profil incorrect** : "Ton préféré de ton assistant" → "Ton de communication"
- **header ConversationScreen** : photo agent au lieu d'AssistGlyph (commit précédent inclus)
- **bulles WhatsApp-style + timestamps** : renderText, coins différenciés, heure affichée (commit précédent inclus)

### Résultat
- 1 commit pushé sur master (`d5100a2`), Netlify redéployé
- Build propre : 0 erreur, 0 warning critique
- Toutes les 13 anomalies de la session 28 sont soldées

---

## 2026-06-04 (session 30 — Cockpit admin redesigné + Veille écosystème + Intel)

### Routine CCR veille quotidienne
- Document "Ecosysteme vivant Attractor.txt" lu et intégré (9 piliers de vision)
- Routine remote agent créée : `trig_017NC3D7NQnGoRWuZJ9wrH3u`, tourne chaque jour à 7h Paris (5h UTC)
- Écrit dans Supabase (table `veille_rapports`) via Edge Function `save-veille-rapport` (no-verify-jwt, déployée)
- SQL 0023 appliqué : table `veille_rapports` avec RLS admin uniquement

### Cockpit admin redesigné
- Admin arrive désormais sur le Dashboard normal (même interface que les utilisateurs)
- Onglet "Cockpit" dédié dans la nav admin (5e position) avec landing page 5 tiles
- Tiles : Carelle / Pipeline / Hub / Intel / Veille — boutons retour sur chaque sous-section
- Tile "Agence" supprimée : agents visibles uniquement via leurs rapports dans Intel

### Section Intel (nouvelle)
- Stats utilisation : 4 métriques (inscrits, onboarding, en ligne, nouveaux 7j)
- Tendances conversations 30j par agent (barre de progression)
- Journal agents : accordéon collapsible par agent (Awa, Carelle, Miriam, Serge, Roland, Kofi)
- Séquences Awa : prompts générés par prospect, collapsibles, copie 1-tap
- Tickets et remontées utilisateurs filtrables (bug / besoin / autre), marquage traité

### Section Veille (nouvelle)
- Affiche dernier rapport quotidien : état des 9 piliers (livré / en cours / à faire), 3 priorités, signaux faibles
- Historique 7 rapports précédents avec résumé statuts

### Chantiers restants identifiés
- 13 bugs UX/design session 28 toujours en attente (prochaine session dédiée)
- Passer XPAYE en production (merchant ID live dans secrets Supabase)
- Mini-agents Attractor Assists (~6h, aucun code)

---

## 2026-06-04 (session 29 — Hotfixes build + UI)

### Build Netlify cassé corrigé
- Apostrophe typographique (`'`) dans `AssistantsScreen.jsx` ligne 626 interprétée comme fermeture de string JS : build échouait silencieusement depuis la session 28
- Corrigé : guillemets doubles autour de la string fallback de Carelle

### Bug UI PaliersScreen corrigé
- `overflow-hidden` sur les cartes coupait les badges promo positionnés à `-top-3`
- Corrigé : `overflow-hidden` retiré de la carte + wrapper `pt-3` ajouté pour les cartes avec badge

### Résultat
- 2 commits pushés sur master, Netlify redéployé
- App à jour sur assists.agenceattractor.com

---

## 2026-06-04 (session 28 — Refonte UX : Mr Attractor central + Suivi Clients + Calendrier)

### Audit UX/UI complet (16 problèmes identifiés)
- 2 bugs critiques corrigés et pushés : `profile` manquant dans PaliersScreen + typo `'verrouillé'` vs `'verrouille'` dans AgentBioModal
- 13 problèmes UX/design restants à traiter en prochaine session (text-g500, \n non rendu, planLabel brut, dark mode Maryline, activeTab hors-nav, icône toggle PaliersScreen, amber tokens mixtes, emoji solitaire, "5 experts" hardcodé — déjà fixé, TeamHero statuts bruts, label profil incorrect, header ConversationScreen AssistGlyph au lieu de photo)

### Opener Maryline corrigé
- Ancienne question finale = "t'organiser, te faire connaître, ou vendre plus ?" (territoire d'Awa)
- Nouveau : "T'as une question sur quelque chose que t'as vu dans l'app, ou tu veux qu'on commence par ce qui peut t'aider le plus en ce moment ?" (guide, pas commerciale)

### Mr Attractor central — refonte architecture agents
- Awa verrouillée (plan Growth requis) — plus jamais active sur le plan Gratuit
- Agents réordonnés dans data.js : Mr Attractor → Maryline → Carelle → Miriam → Serge → Roland → Kofi → Awa
- Carelle CTA : "Voir mon app personnalisée" (plus "Voir ma démo gratuite")
- Badge "X experts" dans Mon équipe désormais dynamique
- agentGating.js : Awa rejoint le groupe Miriam (verrouillé si rank < 1)
- Forfaits mis à jour : "Awa incluse" retiré du Gratuit, features Growth et Team reformulées

### Bloc micro central Dashboard
- Card "Prochaine action" supprimée (redondante)
- Bouton "Décharge vocale" isolé supprimé des quick actions
- Nouveau bloc pleine largeur : micro animé (glow orange) + "Besoin de te vider la tête ? Parle à Mr Attractor — il va gérer." → DechargeVocale
- Quick actions réduits à 2 : Suivi Clients + Agenda

### Suivi Clients (ex-Carnet d'affaires)
- Renommé partout : "Suivi Clients" en UI, route interne 'carnet' inchangée
- Section "Mes produits / services" : ajout/suppression, prix, unité (unité/heure/mois/projet)
- Fiche client : affiche "Dernier achat : [produit] · [date]" ou "Aucun achat enregistré"
- Historique achats : liste des achats + ajout (sélecteur produit ou texte libre + date + montant)
- Flow Mr Attractor : bouton → conversation avec prefill "Je veux enregistrer un achat pour [client]"
- Migration SQL 0022 appliquée : tables `produits_user` + `client_purchases`

### Agenda → Vue Calendrier
- Grille mensuelle (lun→dim), navigation mois précédent/suivant
- Points colorés sous chaque date : rouge (urgente), orange (normale), gris (basse)
- Tap sur un jour → Sheet avec tâches du jour + bouton "+" (pré-remplit la date)
- Liste groupée (Urgentes / Aujourd'hui / À venir) conservée sous le calendrier
- Pas de changement BDD (todos existant avec date_echeance suffisant)

### Suggestions ConversationScreen enrichies
- Cases `carelle` et `maryline` ajoutées
- Awa : suggestions reformulées (closing, séquences) sans redirection vers coach

---

## 2026-06-04 (session 27 — XPAYE production activé)

### Passage en production des paiements XPaye

- Correction `init-payment` : `isSandbox` découpé du merchant ID. Avant : `merchantId === "PP-F422"` (couplage fragile). Après : `Deno.env.get("XPAYE_SANDBOX") === "true"` (contrôle indépendant)
- Confirmation : PP-F422 est le vrai merchant ID production de Mac Arthur (Lead Holding Sarl)
- Secret `XPAYE_SANDBOX=false` posé dans Supabase (projet lgdgbrivnhgeupqhkckd)
- Fonction `init-payment` redéployée — pointe maintenant vers `www.paiementpro.net` (prod)
- Les paiements Attractor Assists (Wave, MTN, Orange Money, Carte) sont désormais réels

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

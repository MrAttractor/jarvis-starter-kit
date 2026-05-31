# Workspace History

> Journal chronologique de toutes les sessions et décisions importantes.
> Le plus récent en haut. Mis à jour automatiquement par Claude.
>
> **Comment ça marche :** Quand je lance la commande `/update` après une session importante, ou quand je raconte un changement significatif, Claude ajoute une entrée ici automatiquement. Je n'ai pas à écrire ce fichier manuellement.

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

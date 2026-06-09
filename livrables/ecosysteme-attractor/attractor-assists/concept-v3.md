# Concept Attractor Assists V3

> Cadré le 09/06/2026 (session 36). Source de vérité produit.
> Avant toute décision technique, UX ou commerciale sur Attractor Assists, consulter ce document.
> Remplace les concepts V1 (multi-agents) et V2 (assistant unique partagé).

---

## En une phrase

Un cerveau unique (Claude + business de l'entrepreneur + méthode Attractor), branché sur 2 surfaces, qui sert 2 publics avec 2 promesses distinctes.

---

## Le déclic

Le Jarvis personnel de Mac Arthur (ce workspace : `CLAUDE.md` + `CONTEXT.md` + skills + mémoire) est le **prototype vivant** de ce qu'Attractor Assists doit devenir pour chaque entrepreneur. Pas une app multi-agents avec écrans et carousels. Un Jarvis personnel, chargé de la méthode Attractor, accessible simplement.

C'est exactement la mission fondatrice : "Un bras droit intelligent qui soulage les gens des tâches quotidiennes, tout en les aidant à devenir numéro 1 dans leur couloir."

---

## Les 8 décisions cadrées

| # | Question | Décision |
|---|---|---|
| 1 | Pour qui ? | **Entrepreneur + ses clients** (2 publics, 1 cerveau) |
| 2 | Par quelles surfaces ? | **Entrepreneur** : PWA (config + vue d'ensemble) + WhatsApp (notifications). **Client** : mini-site web personnalisé (lien partagé par l'entrepreneur dans son message d'accueil WhatsApp, statut, flyer, devanture, etc.) |
| 3 | Promesse côté entrepreneur | **"Je te vide la tête"** : dictée vocale ou écrite → tâches structurées, clients à relancer, plan du jour, décisions du moment |
| 4 | Promesse côté client | **"Je prends ta commande de A à Z"** : catalogue → commande → paiement → confirmation → tracking |
| 5 | Onboarding | **Vidéo Mac Arthur (5 min) + conversation guidée avec le Jarvis (10-15 min)**. La vidéo humanise l'expérience. La conversation collecte l'anamnèse business. |
| 6 | Catalogue | **Photo de la carte/catalogue → IA extrait → entrepreneur valide.** Bonus : Claude design extrait les couleurs dominantes et génère le thème visuel de la boutique. |
| 7 | Réception des commandes | **Alerte WhatsApp (réactivité) + gestion dans la PWA (vue d'ensemble, stats, historique).** L'entrepreneur reste sur WhatsApp où il est déjà, mais a une vraie vue d'ensemble quand il en a besoin. |
| 8 | Domaine | **Démarrage gratuit** avec `assists.agenceattractor.com/b/[slug]`. Achat d'un domaine court (type `attractor.ci`, 15 €/an) reporté quand on aura des résultats à scaler. QR code généré automatiquement en complément pour les supports physiques. |

---

## Schéma du concept

```
   ENTREPRENEUR
        │
        ├── PWA ──────────────┐    ┌── Onboarding (1 fois)
        │  (config initiale,  │    │   Vidéo Mac Arthur
        │   vue d'ensemble,   │    │   + Conversation Jarvis
        │   stats, commandes) │    │   "Qui es-tu ? Que vends-tu ?
        │                     ▼    ▼    Qui sont tes clients ?"
        │              ┌────────────────────┐
        └── WhatsApp   │   CERVEAU UNIQUE   │      (méthode Attractor +
   (vide-tête quotidien│                    │       mindset Mac Arthur +
    + notifications    │  Claude + contexte │       contexte business)
    commandes)         │     du business    │
                       └────────────────────┘
   CLIENT                          │
        │                          │
        └── Mini-site personnalisé ┘
   (lien partagé via WhatsApp,
    statut, flyer, devanture)
   → Aux couleurs de la boutique
   → Assistant de vente qui prend la commande
   → Paiement Wave/MTN/Orange (XPaye)
   → Confirmation + tracking
```

---

## Parcours utilisateur

### Côté entrepreneur — jour 1

1. Reçoit le lien d'inscription (pub, parrainage, WhatsApp).
2. Ouvre la PWA → vidéo Mac Arthur 5 min (méthode + promesse).
3. Conversation guidée avec son Jarvis : anamnèse business (10-15 min).
4. Photographie sa carte/catalogue → Jarvis extrait → il valide.
5. Choisit son slug (`/b/aicha`).
6. Récupère son lien + son QR code → prêt à le partager.

### Côté entrepreneur — quotidien

- **Matin** : il dicte ce qu'il a en tête → Jarvis structure (tâches, relances, plan du jour).
- **Journée** : son téléphone vibre à chaque commande → 1 tap → il valide.
- **Soir** : Jarvis lui envoie le résumé (CA, commandes, clients à relancer demain).

### Côté client — 1ère commande

1. Le client écrit "Bonjour" au numéro WhatsApp de la boutique.
2. Réponse automatique de l'entrepreneur : "Bienvenue chez Aïcha ! Commandez ici : assists.agenceattractor.com/b/aicha"
3. Le client clique le lien → mini-site personnalisé s'ouvre.
4. Catalogue présenté, assistant de vente dialogue.
5. Commande prise (produits, quantités, livraison, paiement).
6. Paiement Wave/MTN/Orange via XPaye.
7. Confirmation + tracking.
8. L'entrepreneur prépare et livre.
9. Le lendemain, le Jarvis prend des nouvelles (satisfaction).

---

## Ce que ça change par rapport à V1 et V2

| Version | Statut | Caractéristique |
|---|---|---|
| **V1** | Livrée, déployée | 8 agents personnages, multi-écrans, cockpit, complexité côté UI. Mac Arthur s'y est perdu. |
| **V2** | En cours (décidée 05/06/2026) | 1 assistant unique partagé aux clients. Bon début côté client, mais côté entrepreneur restait flou. |
| **V3** | Cadrée 09/06/2026 | 2 surfaces, 1 cerveau, 2 promesses claires. Pas d'agents personnages. Pas de carousel. Pas de plan tarifaire visible avant que la valeur soit livrée. |

---

## Inventaire de l'existant (tri honnête)

### Écrans (23 actuels)

**GARDE tel quel (4)** : `LoginScreen`, `InstallScreen`, `MacCockpitScreen`, `AdminScreen` (les deux derniers côté admin uniquement).

**SIMPLIFIE / TRANSFORME (9)** :
- `OnboardingScreen` → refait selon décision 5 (vidéo + conversation)
- `DashboardScreen` → devient "Mon Jarvis" (chat principal)
- `ConversationScreen` → écran central de dialogue (un seul, plus 8)
- `DechargeVocaleScreen` → intégré dans le chat principal (cœur du vide-tête)
- `MonAppScreen` → devient "Commandes & stats"
- `PublicAssistantScreen` → devient le mini-site boutique client
- `CarnetAffairesScreen`, `AgendaScreen` → intégrés dans le Jarvis (parle au Jarvis pour gérer)
- `ProfilScreen`, `PaliersScreen`, `NotificationsScreen` → versions ultra-épurées

**JETTE (10)** : `DiscoveryScreen`, `ActivationScreen`, `AssistantsScreen` (Mon équipe V1), `MéthodeScreen`, `MarketplaceScreen`, `BroadcastsScreen`, `MasterSheetScreen`, `AxesScreen`.

**À CRÉER (1)** : écran "Catalogue" dans la PWA (upload photos → preview brouillon IA → validation).

### Edge Functions (23 actuelles)

**GARDE (9)** : `process-dump` (cœur du vide-tête), `init-payment` + `payment-webhook` (XPaye prod), `extract-memories` + `miroir` + `collect-insights` (cerveau apprend), `notify-auto` + `notify-update`, `jarvis-cockpit` (admin), `save-veille-rapport` (admin).

**TRANSFORME (4)** : `chat-assistant` → cerveau Jarvis entrepreneur, `public-assistant` → cerveau Jarvis client (mini-site), `generate-client-assistant` → génère le profil depuis l'anamnèse, `analyze-presence` → recyclé en analyse de carte/catalogue par photo.

**JETTE (10)** : `generate-maquette`, `serve-maquette`, `generate-livrable`, `activation-sequence`, `generate-sequence`, `generate-devis` (peut rester en admin uniquement), `challenge-day`, `challenge-register`, `marketplace-signup`.

**À CRÉER (4)** :
- `catalog-from-photos` : Claude Vision extrait le catalogue depuis les photos
- `order-handler` : orchestration du flux de commande client
- `onboarding-anamnese` : conversation guidée jour 1
- `theme-generator` : Claude design extrait les couleurs et génère le thème visuel

(Note : `whatsapp-webhook` est SUPPRIMÉ du plan grâce à l'approche "lien partagé" qui évite WhatsApp Cloud API.)

### Tables SQL (~28 migrations actuelles)

**GARDE** : `profiles`, `payments`, `agenda/todos`, `memoire_cache`, `methode_miroir`, `decisions`, `last_seen`, `veille_rapports`.

**SIMPLIFIE / FUSIONNE** : `carnet_affaires` + `suivi_clients` → table `clients` épurée. `prospects` + `journal_agent` → restent mais côté admin uniquement (cockpit Mac Arthur).

**JETTE** : `broadcasts`, `master_sheets`, `axes`, `challenge`, `prestataires/marketplace`, `sequences_vente`, `feedback v1` (refait).

**À CRÉER** :
- `catalogue` : produits par entrepreneur (nom, prix, options, photo, dispo)
- `orders` : commandes client (entrepreneur_id, client_contact, items, montant, statut, paiement_ref)
- `conversations_client` : historique des dialogues client ↔ Jarvis (séparé des chats internes entrepreneur)
- `themes_boutique` : thème visuel généré par Claude design (couleurs, police, ton)

### Verdict d'ensemble

| Couche | GARDE | SIMPLIFIE/TRANSFORME | JETTE | À CRÉER |
|---|---|---|---|---|
| Écrans (23) | 4 | 9 | 10 | 1 |
| Edge Functions (23) | 9 | 4 | 10 | 4 |
| Tables SQL (~28) | 8 | 3 | 7 | 4 |

**On jette ~40% du code, on simplifie ~30%, on garde ~30%, on ajoute ~10 briques nouvelles ciblées.**

---

## Ce qui change concrètement vs V2

- **Suppression du chantier WhatsApp Cloud API** (gain : 1-2 semaines de dev, 0 € de coûts Meta récurrents, 0 friction setup côté entrepreneur).
- **Approche "lien partagé via WhatsApp"** : chaque entrepreneur a son lien `assists.agenceattractor.com/b/[slug]` qu'il met dans son message d'accueil WhatsApp Business. Le client clique, atterrit sur sa boutique personnalisée.
- **Le mini-site est généré dynamiquement** avec les couleurs et l'identité de la boutique (extraites des photos via Claude design).
- **L'app actuelle reste en ligne** sur `assists.agenceattractor.com` pour les 25 testeurs pendant la transition. On ne casse rien le jour 1.

---

## Ce qui reste à cadrer (sessions suivantes)

Au choix selon l'énergie :

1. **À quoi ressemble concrètement le mini-site boutique** (les écrans, le flow commande client).
2. **Plan d'exécution** (par où on commence, semaine 1 / semaine 2 / etc.).
3. **Migration des 25 testeurs actuels** (nouvel onboarding forcé ou configuration manuelle ?).
4. **Pricing V3** (gratuit / payant — sur quel critère ?).

---

## Règles produit non négociables (reprises du CONTEXTE MAÎTRE)

- Jamais de formulaire classique. Toujours une conversation.
- L'utilisateur reste le pilote. Assist reste le copilote.
- Avant toute fonctionnalité : "Cette fonctionnalité réduit-elle réellement la charge mentale de l'utilisateur ?" Si non, ne pas développer.
- Le cerveau Attractor (14 niveaux, voir CONTEXT.md section "CONTEXTE MAÎTRE") sous-tend toute recommandation produite par le système.

---

## Lien avec le Jarvis Mac Arthur

Ce concept est la traduction directe de ce que Mac Arthur vit dans son Jarvis (ce workspace). Les 4 ingrédients d'un Jarvis (fichier "qui je suis" + mémoire qui grandit + skills + cerveau Claude) sont dupliqués chez chaque entrepreneur, avec son business à lui, le tout chargé du mindset Mac Arthur et de la méthode Attractor.

**Principe** : tout ce qui est validé pour Mac Arthur dans son Jarvis (organisation, process, structure, automatisations) a vocation à être réinjecté dans Attractor Assists. Conséquence : garder les mises en place simples, claires, documentées et reproductibles pour un entrepreneur novice.

---

## Principe Architectural Central (non négociable)

> **Chaque entrepreneur a son propre CLAUDE.md, construit dynamiquement.**

### L'analogie directe

| Jarvis Mac Arthur (ce workspace) | Jarvis Entrepreneur (Attractor Assists V3) |
|---|---|
| `CLAUDE.md` | System prompt dynamique chargé à chaque conversation |
| `CONTEXT.md` | Profil entrepreneur (activité, clients, style, offre) |
| `HISTORY.md` | Mémoire conversationnelle (`memoire_cache`) |
| `context/import/` | Catalogue photos, messages exemples, documents uploadés |
| `/prime` | L'anamnèse d'onboarding (la conversation de jour 1) |
| `/update` | "Mets à jour mon profil" via conversation |
| `/morning` | DMV quotidienne (action du jour générée chaque matin) |
| `skills/` | Modules actifs : Fidelys, Veille, Commandes, Media Buyer |

### Ce que le cerveau doit faire au démarrage de chaque conversation

```
1. Charger le profil entrepreneur (table profiles) → son CONTEXT.md à lui
2. Charger ses 5 dernières mémoires (memoire_cache) → son HISTORY.md à lui
3. Charger ses modules actifs (Fidelys activé ? Veille activée ?) → ses skills
4. Injecter la base de connaissance Attractor → la méthode, le ton, les repères
5. Construire le system prompt final → il sait qui il aide avant le premier mot
```

**La différence entre un chatbot générique et un vrai bras droit : le bras droit sait qui il est avant que tu parles.**

### L'appartement vide

Quand l'entrepreneur installe l'app, le Jarvis est vide. Il ne connaît rien. L'anamnèse de jour 1 est le moment où l'entrepreneur meuble son appartement : il nourrit son Jarvis de ses informations, son style, ses clients, son offre. Ce n'est pas un formulaire. C'est une première conversation qui construit le `CONTEXT.md` de l'entrepreneur.

Chaque échange suivant enrichit sa mémoire. Le Jarvis apprend progressivement à l'anticiper, à écrire comme lui, à connaître ses habitudes. La complicité se construit dans le temps.

### La base de connaissance (le socle immuable)

En plus du profil de l'entrepreneur, chaque Jarvis est chargé de la **base de connaissance Attractor** :
la méthode, les frameworks, le mindset, les repères de croissance, le ton.

Source de vérité : `context/import/methode-md/BASE_CONNAISSANCE_ASSISTS.md`

Cette base est commune à tous les entrepreneurs. Elle ne change pas selon l'utilisateur. Elle est le "Mac Arthur dupliqué" dans chaque Jarvis — ce qui fait qu'Assists n'est pas un outil générique mais un bras droit formé à une méthode précise.

### Résumé en une phrase

> Le system prompt de chaque Jarvis = Base de connaissance Attractor (fixe) + Profil de l'entrepreneur (dynamique) + Mémoire des échanges (croissante) + Modules actifs (contextuels).

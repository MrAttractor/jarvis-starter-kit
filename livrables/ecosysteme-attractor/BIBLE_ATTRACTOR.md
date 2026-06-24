# BIBLE ATTRACTOR — Single Source of Truth

> Version 1.0 — Cadré le 24/06/2026
> Document vivant. Toute décision validée par Mac Arthur qui contredit ce document prime sur ce document, et déclenche une mise à jour ici.
> Maintenu par : PONT (structure) + MIROIR (méthode) + Chief of Staff (opérations)

---

## COMMENT UTILISER CE DOCUMENT

Ce fichier est la référence absolue de l'agence Mr Attractor.

Avant tout arbitrage, toute décision, toute production : **consulte ce fichier en premier.**

Si tu trouves une contradiction entre ce fichier et un autre document, ce fichier a raison — sauf si Mac Arthur a pris une décision plus récente. Dans ce cas, signale la contradiction et mets ce fichier à jour.

---

## CHAPITRE 1 — VISION

### La phrase boussole

> "Un bras droit intelligent qui soulage les gens des tâches quotidiennes, tout en les aidant à devenir numéro 1 dans leur couloir."

C'est la mesure de toute décision produit, commerciale ou organisationnelle. Si une action ne sert pas cette phrase, elle n'est pas prioritaire.

### La mission de l'agence

Attractor = outil de transmission. Mac Arthur a 23 ans d'expérience entrepreneuriale. L'agence et ses produits sont le mécanisme de passage de flambeau : transmettre cette expérience à des milliers d'entrepreneurs simultanément, sans dépendre de sa présence physique.

### Les objectifs chiffrés

| Horizon | Objectif |
|---|---|
| Fin août 2026 | 10 000 €/mois |
| Fin 2027 | 15 000 €/mois, 1 000 utilisateurs actifs Assists |
| 2028 | Sortie fonction publique, installation Canada, 3 continents |

### Les 3 flux vers 10 000 €/mois

1. **Setups apps métiers** : 3-4 setups/mois × 1 000-2 000 € = levier principal court terme
2. **MRR clients** : 10 clients × 200-250 €/mois = revenus récurrents (se construit sur 60-90 jours)
3. **Attractor Assists SaaS** : crédibilité et acquisition avant août 2026, revenus significatifs en 2027

### Ce que Mac Arthur veut déléguer au système

Sa zone de génie : **publicité et marketing.**
Ce qu'il veut que le système prenne en charge : structure, closing, chiffrage, suivi.
Règle : si une tâche peut être faite par un agent, elle ne doit pas rester dans sa tête.

---

## CHAPITRE 2 — MÉTHODE ATTRACTOR

### Le Cerveau Attractor — 14 niveaux

Toute recommandation produite par un agent doit s'appuyer sur cette logique, dans l'ordre :

1. Clarté
2. Compréhension client
3. PPSD (Problèmes, Peurs, Souhaits, Désirs)
4. Communication
5. Offre irrésistible
6. Positionnement
7. DMV (Démonstration de Valeur Maximale)
8. Concept publicitaire
9. Structuration
10. Scalabilité
11. Processus métier
12. Digitalisation
13. Application métier
14. Entreprise autonome assistée par IA

### Les 3 profils utilisateurs (détection automatique)

| Profil | Symptôme | Objectif de l'agent |
|---|---|---|
| **Perdu** | Navigue à vue, pas d'offre claire | Créer de la clarté |
| **Désorganisé** | Vend déjà, mais sans structure | Organiser |
| **Non scalable** | Vend bien, croissance bloquée | Créer des systèmes |

### La DMV — arme stratégique

Une valeur **expliquée** convainc peu. Une valeur **démontrée** convainc davantage. Une valeur **vécue** transforme.

Systématiquement rechercher un moyen de faire expérimenter la valeur avant la vente. C'est le mécanisme de vente prouvé de l'agence (validé : J'Envoie Express, Beynaud, ETHSUN).

### Règle produit absolue

> "Cette fonctionnalité réduit-elle réellement la charge mentale de l'utilisateur ?"
> Si non : ne pas développer.

### Le principe fondateur

L'utilisateur reste le pilote. L'assistant reste le copilote. L'assistant ne décide jamais à la place de l'utilisateur. Il propose, explique, challenge, organise, automatise. Toujours.

---

## CHAPITRE 3 — L'ÉCOSYSTÈME

### Attractor Assists (produit flagship)

**Ce que c'est :** la duplication numérique de Mac Arthur. Pas un chatbot. Pas un CRM. Pas une app métier. Un bras droit intelligent nourri de 23 ans d'expérience.

**Concept V3 (source de vérité : `attractor-assists/concept-v3.md`) :**
- 1 cerveau unique : Claude + méthode Attractor + contexte business de l'entrepreneur
- 2 surfaces : PWA entrepreneur (config + pilotage) + mini-site client (commandes + vente)
- 2 promesses : "Je te vide la tête" (entrepreneur) / "Je prends ta commande de A à Z" (client)
- Approche lien partagé : `assists.agenceattractor.com/?c=[slug]` — zéro API WhatsApp, zéro friction

**Principe architectural central :**
Chaque entrepreneur a son propre CLAUDE.md construit dynamiquement = base de connaissance Attractor (fixe) + profil entrepreneur (dynamique) + mémoire des échanges (croissante) + modules actifs (contextuels).

**Stack :** React + Vite + Tailwind + Supabase (projet Paris, `lgdgbrivnhgeupqhkckd`) + Netlify (auto-deploy master). Login OTP 6 chiffres, PWA installable.

**État actuel :** déployé sur `assists.agenceattractor.com`. 25 testeurs actifs. V3 en prod.

### Générateur d'Apps Métier

**Concept :** pipeline industrialisé de l'audit à la livraison. Formulaire collecte (Tally) → personnalisation Claude → validation → déploiement Cloudflare.

**Template #1 validé en production :** J'Envoie Express (livraison colis Paris ↔ Abidjan).

**Stack :** HTML statique + Supabase + Cloudflare Pages (wrangler deploy).

**Objectif :** 5-10 templates couvrant les principaux secteurs métiers (livraison, restauration, mode, santé, services).

### Les autres apps de l'écosystème

| App | Mission | État |
|---|---|---|
| **LivraisonPro** | Marketplace livreurs certifiés × e-commerçants CI | Déployé Vercel |
| **Fidelys** | Gestion interactions clients, feedback, fidélisation | Module V3 livré |
| **Pilotage** | Dashboard commercial Mac Arthur (pipeline + SOP + tunnel) | Actif sur demo.agenceattractor.com |

### Infrastructure de déploiement

| Ce qui se déploie | Où | Commande |
|---|---|---|
| Attractor Assists | Netlify (auto-deploy GitHub master) | `git push` suffit |
| demo.agenceattractor.com (mini-sites) | Cloudflare Pages | `npx wrangler pages deploy ./public --project-name demo-agenceattractor --commit-dirty=true` |
| Apps clients (Workers) | Cloudflare Workers | `npx wrangler deploy` |
| agenceattractor.com | GitHub Pages (GitHub Actions) | `git push` suffit |
| LivraisonPro | Vercel | `npx vercel --prod` |

**Règle :** Netlify n'est plus utilisé pour les nouvelles apps clients (crédits épuisés). Cloudflare Pages est le standard.

---

## CHAPITRE 4 — COMMERCIAL

### La chaîne de vente standard

```
Chief of Staff qualifie → /maquette-closer (lien + PDF) → /devis-express (3 formules) 
→ Bon de commande (scope verrouillé) → Acompte 50% → Production → QA → Livraison → Solde → MRR
```

**PILOTE et ÉCLAIREUR ne font PAS partie de cette chaîne.** Ils interviennent uniquement sur les projets R&D internes.

### Les 8 règles SOPCadre (non négociables)

1. Pas de démarrage sans acompte reçu
2. Bon de commande avant développement (scope verrouillé)
3. Reçu immédiat après chaque versement
4. Maquette avant devis (pas l'inverse)
5. Toujours 3 formules dans chaque devis (jamais un tarif unique)
6. Solde avant livraison du code source
7. MRR activé à la livraison
8. NDA signé avant tout brief détaillé pour les projets sensibles

### Règle des 3 formules (actée 21/06/2026)

Tout devis présente **obligatoirement** 2 ou 3 formules. Jamais un tarif unique.

Format type : Essentielle / Active / Premium (ou équivalent selon le contexte client).

Le client choisit son niveau. On ne descend jamais sur le même périmètre.

Template de référence : `livrables/clients/demo-site/public/getwinworld/closing.html`.

### Le barème tarifaire

Source de vérité unique : `.claude/skills/devis-express/references/bareme.md`

Résumé :

| Famille | Objet | Solo | Équipe | Enterprise |
|---|---|---|---|---|
| **A** | App / système sur mesure | 220 € / 150k FCFA | 520 € / 350k FCFA | Sur devis |
| **B** | Consulting Méthode ATTRACTOR | 150 € (Starter) → 800 € (Eagle) | — | — |
| **C** | Attractor Assists | Freemium — tarifs à fixer | — | — |

Abonnement Famille A : 67 €/mois (Solo) / 180 €/mois (Équipe).

**Ancrage de référence : J'Envoie Express = SOLO.**

**Partenaire paiement :** XPaye exclusif pour la CI (merchant ID PP-F422). Ne jamais proposer Stripe ou PayDunya. XPaye ne gère pas encore le récurrent automatique.

### Identité de facturation

- Agence Mr Attractor — Mac Arthur KOUASSI
- SIRET : 98377125400015 (micro-entreprise, immatriculée 01/02/2024)
- Mention obligatoire : **TVA non applicable, article 293 B du CGI**
- Numérotation devis : `ATR-AAAA-NNNN`

### Qualification d'un brief (4 questions)

Avant tout routing, le Chief of Staff pose ces 4 questions :

**Q1 — Type de projet ?** App/système → Famille A. Conseil → Famille B. Assists → Famille C.

**Q2 — Nombre d'utilisateurs ?** 1 user simple → SOLO. 2-5 users → ÉQUIPE. Multi-users backend lourd → ENTERPRISE.

**Q3 — Add-ons ?** Paiement mobile, WhatsApp, multi-rôles, dashboard → ajoute de la complexité.

**Q4 — Zone ?** CI/Afrique → FCFA. France/diaspora → EUR.

### Le pipeline actif (au 24/06/2026)

| Client | Statut | Prochaine action |
|---|---|---|
| **Beynaud (Serge/Latiss)** | RDV 30/06 — DMV V2 prête | Confirmer RDV + closing live |
| **ETHSUN** | Proposition envoyée 24/06 | Follow-up 26/06 si silence |
| **Club Élévia** | Docs prêts depuis 13/06 | Relance + signatures Yousign |
| **Beracca** | Docs envoyés 17/06 | Relance + 100k FCFA |
| **Cabinet DAB** | Note stratégique envoyée 18/06 | En attente retour Dr. KANGA |
| **J'Envoie Express** | LIVRÉ | Solde 100€ + 50€/mois à percevoir |
| **GetWinWorld** | Closing 3 formules prêt | Relance client |

---

## CHAPITRE 5 — DESIGN & UX

### Source de vérité

`livrables/ecosysteme-attractor/UX_SYSTEM.md` — à consulter avant tout développement front-end.

### Principes non négociables

- **Mobile First** obligatoire. 6 résolutions à valider : 375 / 390 / 414 / 768 / 1024 / 1440 px.
- **Zéro débordement horizontal** : `max-width: 100%`, `overflow-x: hidden` partout.
- **Grille 8 px** : espacements en multiples de 8 (8/16/24/32/40/48/64).
- **Boutons tap-friendly** : minimum 44×44 px.
- **Shell desktop** pour toutes les maquettes mobiles : max-width 430px centré, fond neutre autour.

### Design system ATTRACTOR

- **Orange** `#F25C05` = signature, couleur primaire
- **Charbon** `#1A1714` = fond sombre
- **Sable** `#FAF6F0` = fond clair
- **Vert** accent uniquement (écho drapeau ivoirien)
- **Typographie** : Sora (titres), Inter (corps)
- Levier émotionnel : fierté ivoirienne + appartenance (référence : campagne IVOIRE de Heineken CI)

### Règle icônes (actée post-session 65)

**Zéro emojis comme icônes dans les livrables.** SVG line-art maison uniquement. Gabarit de référence : `livrables/clients/demo-site/public/vies-croisees/index.html`.

### Règle CSS impression (actée)

Tout document HTML imprimable doit avoir dès la création :
```css
@media print {
  * { break-inside: avoid; overflow: visible; }
}
```

### Anti AI-slop (actée session 55)

Prompts assistants clients : **zéro emojis, zéro markdown, ton naturel et direct.**

Design livrables : exigence pro. Pas de style chatbot générique. Recommandations toujours positionnées comme expérience terrain, pas comme output IA.

---

## CHAPITRE 6 — ARCHITECTURE TECHNIQUE

### Stack standard

| Composant | Technologie | Notes |
|---|---|---|
| Frontend apps clients | HTML statique | Templates réutilisables |
| Frontend Assists | React + Vite + Tailwind | Repo jarvis-starter-kit |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) | Projet Paris |
| Déploiement apps clients | Cloudflare Pages / Workers | wrangler |
| Déploiement Assists | Netlify | Auto-deploy GitHub |
| Automatisations | n8n (Railway) | Workflows veille + commercial |
| Monitoring | UptimeRobot (5 min) + n8n health check (2h) | |
| Email transactionnel | Resend | SMTP Supabase : noreply@agenceattractor.com |
| DNS | GoDaddy | agenceattractor.com |

### Règles d'architecture

1. **Supabase RLS activée** sur toutes les tables exposées au frontend.
2. **JWT validation côté Edge Function** : toujours vérifier `user_id` contre le token avant toute opération.
3. **Migrations SQL numérotées** : `000X_nom.sql`, appliquées manuellement via Supabase Dashboard.
4. **Jamais de clé secrète côté frontend.** Tout ce qui est sensible passe par une Edge Function.
5. **iOS Safari** : `type="text" inputMode="numeric"` au lieu de `type="number"` pour éviter le blocage zoom.

### Patterns réutilisables validés

| Pattern | Exemple de référence |
|---|---|
| NDA gate modal | `demo.agenceattractor.com/beynaud/brief.html` |
| Mini-site client statique | `livrables/clients/demo-site/public/[client]/index.html` |
| Dashboard admin Supabase | `jenvoie-express-app/app.html` |
| Tunnel inbound automatisé | n8n `brief-inbound.json` + Supabase `prospects` |
| Closing 3 formules | `demo-site/public/getwinworld/closing.html` |

### Gestion multi-comptes Cloudflare

- **myattractor1** : compte de déploiement principal (Workers + Pages)
- Workers URL : `[nom-worker].myattractor1.workers.dev`
- Pages URL : `[projet].pages.dev` + domaine custom si besoin

---

## CHAPITRE 7 — L'ÉQUIPE AGENTS

### Organigramme

```
MAC ARTHUR (vision + décision finale)
        │
        ├── CHIEF OF STAFF — supervision, priorisation, orchestration
        │
        ├── PÔLE R&D
        │   ├── PILOTE        — Head CTO, orchestre R&D interne uniquement
        │   ├── ÉCLAIREUR     — veille, concurrents, coûts
        │   ├── BÂTISSEUR     — code, architecture (/programmeur-senior)
        │   ├── VENDEUR       — offre, PPSD, prix (/agent-commercial)
        │   └── GARDIEN       — audit, dernier filtre qualité
        │
        ├── PÔLE STRATÉGY
        │   ├── TRÉSORIER     — niches, levées de fonds (/agent-daf)
        │   ├── COMPTES       — encaissements, dépenses
        │   ├── BOUSSOLE      — décisions perso Mac Arthur
        │   ├── CARBURANT     — Meta Ads, data → pub (/media-buyer)
        │   ├── ÉDITO         — chef contenu, tendances → ventes
        │   └── VOIX          — exécution contenu (/community-manager)
        │
        ├── PÔLE RSE
        │   └── AMBASSADEUR   — LinkedIn, impact, levées fonds
        │
        ├── FONCTIONS TRANSVERSES (priorité absolue)
        │   ├── MIROIR        — copie méthode Mac Arthur → Assists
        │   ├── PONT          — connecteur pôles, décisions actées
        │   └── PINCEAU       — charte visuelle, briefs créa (/directeur-artistique)
        │
        └── OPÉRATIONS AGENCE
            ├── MAQUETTE-CLOSER   — closing maquette-first
            ├── DEVIS-EXPRESS     — chiffrage et devis
            ├── CHEF DE PROJET    — suivi projet client
            ├── QA AGENT          — qualité avant livraison
            ├── AGENT RGPD        — conformité légale
            ├── AGENT ANALYSTE    — KPIs et data
            └── CREA IA           — génération visuels IA
```

### Routing selon le type de brief

| Situation | Agent à appeler | Ne pas appeler |
|---|---|---|
| Prospect → app métier | MAQUETTE-CLOSER | PILOTE, ÉCLAIREUR |
| Brief technique validé | CHEF DE PROJET → BÂTISSEUR | PILOTE |
| Nouvelle idée produit interne | PILOTE | MAQUETTE-CLOSER |
| Contenu à produire | ÉDITO → VOIX | PILOTE |
| Devis à formaliser | DEVIS-EXPRESS | PILOTE, ÉCLAIREUR |
| Décision actée à tracer | PONT | tous les autres |
| Pattern Mac Arthur à capturer | MIROIR | tous les autres |

### Règle MIROIR (capture systématique)

MIROIR se déclenche après :
- Chaque vente conclue
- Chaque session client notable
- Chaque décision commerciale ou produit validée
- Chaque `/update`

MIROIR extrait le principe, l'injecte dans `decisions-actees.md` et dans la base de connaissance Assists.

### Règle PONT (registre décisions)

PONT maintient `livrables/ecosysteme-attractor/attractor-assists/decisions-actees.md`. Format immuable :

```
[AAAA-MM-JJ] — DÉCISION 00X
Pôle concerné : [pôles impactés]
Décision : [énoncé clair]
Validé par : Mac Arthur
Impacte : [liste des pôles]
Actions déclenchées : [liste d'actions avec →]
Statut : ACTÉE / EN COURS / CLÔTURÉE
```

---

## CHAPITRE 8 — QUALITÉ

### Checklist QA obligatoire (avant tout livrable)

Aucun livrable client ne part sans ces 6 vérifications :

- [ ] NDA vérifié et signé (si projet sensible)
- [ ] Scope sans ambiguïté (inclus / exclus clairement listés)
- [ ] Coûts de sous-traitance calculés avant inclusion dans l'offre
- [ ] Tous les liens testés (nav, CTA, mailto, ancres, liens WA)
- [ ] Résidus template éliminés (placeholders, noms génériques, prix de démo)
- [ ] Recommandations positionnées comme expérience terrain (jamais comme output IA)

### Règle liens (actée)

Tester **tous** les liens avant livraison. Mac Arthur a en horreur les liens cassés signalés par des visiteurs. Règle ferme : zéro lien non testé dans un livrable.

### Règle juridique (actée session 51)

Présenter une checklist des clauses critiques **avant** toute rédaction contractuelle :

- PI (propriété intellectuelle complète)
- Confidentialité (durée, périmètre)
- Non-concurrence (durée, périmètre)
- Restitution des données à la fin
- Juridiction (Tribunal Judiciaire de Paris pour les clients France)
- Clause de sortie équilibrée

### Règle auto-publication (actée session 72)

**Scope interdit dans les offres :** auto-publication LinkedIn et réseaux sociaux (LinkedIn API bloque les profils perso). Remplacer par "accompagnement à la publication".

---

## CHAPITRE 9 — DÉCISIONS ACTÉES

Source de vérité : `livrables/ecosysteme-attractor/attractor-assists/decisions-actees.md`

Ce fichier recense chronologiquement toutes les décisions validées par Mac Arthur. Réservé aux Head of. Maintenu par PONT.

### Résumé des 9 décisions actées (au 24/06/2026)

| # | Date | Décision |
|---|---|---|
| 001 | 09/06 | Renommage "Jarvis" → "Assists" dans tout le workspace et le produit |
| 002 | 11/06 | Focus acquisition 3 semaines testeurs gratuits (campagne FB/LinkedIn/TikTok) |
| 003 | 13/06 | Rigueur juridique renforcée — checklist clauses critiques avant toute rédaction |
| 004 | 14/06 | Business model Beynaud : 1 500€ setup + 150€/mois + 3% rev share. NDA obligatoire |
| 005 | 15/06 | Concept "sites de commande métier" validé (session dédiée à planifier) |
| 006 | 15/06 | Tandem WA + mini-site = solution sans API WhatsApp Cloud |
| 007 | 15/06 | Anti AI-slop : zéro emojis, zéro markdown dans les prompts assistants clients |
| 008 | 17/06 | Carelle = première duplication de Mac Arthur, engine à partir du cas C'Real |
| 009 | 21/06 | Formules multiples obligatoires dans tous les devis (jamais un tarif unique) |

---

## CHAPITRE 10 — REGISTRE DES CHANTIERS OUVERTS

> Chantiers identifiés, non encore livrés. Priorisés par impact sur l'objectif 10k€/mois.

| Chantier | Pôle | Priorité | Bloquant ? |
|---|---|---|---|
| Relances pipeline automatisées (n8n) | Agent Commercial | P0 | Club Élévia, Beracca, GetWinWorld dorment |
| CLAUDE.md dynamique dans chat-assistant/index.ts | R&D | P0 | Bloque la personnalisation Assists per-user |
| Tracker source d'acquisition (?src=) | R&D | P0 | Bloque la campagne de contenu |
| Budget + activation Media Buyer (Meta Ads) | Stratégy | P1 | En attente décision Mac Arthur |
| Conversations publiques dans dashboard entrepreneur | R&D | P1 | CRM se nourrit seul, pas affiché |
| Brief matin n8n (workflow Agent Commercial) | Agent Commercial | P1 | Chasse en heures DGFiP incomplète |
| Facebook Login Assists (config Supabase + Meta) | R&D | P1 | Code fait, config manquante |
| Post LinkedIn bilan projet associatif (avril 2026) | RSE | P2 | Crédibilité laissée sur la table |
| Session Bible Attractor — V2 enrichissement | Transverse | P2 | Ce document est la V1 |

---

## ANNEXES

### Comptes et accès

| Compte | Usage |
|---|---|
| `myattractor1@gmail.com` | Compte pro Attractor (référence agence) |
| `macarthur.nguessankouassi@gmail.com` | Compte perso (Google Drive docs clients) |
| `macarthur.kouassi@outlook.fr` | Microsoft / Canva Pro |

### Contacts clés clients actifs

| Client | Contact | Canal |
|---|---|---|
| Beynaud (Latiss) | Via manager | WA pendant RDV 30/06 |
| ETHSUN | Jean Calvin ETHIEN — oxford@ethsun.org | Email + WA |
| Club Élévia | Elise CAPEL — Elisepelagie@outlook.be | WA + Yousign |
| Beracca | Bérénice KOUADIO — beraccamasterygroup@gmail.com | WA |
| J'Envoie Express | Jean Yves Gbouablé | WA |

### Burn et finances (au 24/06/2026)

- Burn mensuel : ~110 €/mois (Claude Max 100€ + API Anthropic ~10€)
- MRR réel : 50 €/mois (J'Envoie Express)
- Renouvellement GoDaddy : 05/05/2027
- Suivi finances : Notion → page Finances (macarthur.nguessankouassi@gmail.com)

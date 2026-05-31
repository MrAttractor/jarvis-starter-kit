# Écosystème d'Agents Attractor — Récapitulatif détaillé

> Document de référence pour déploiement (VS Code).
> Cadre : Agence Mr Attractor — produit fondateur **Attractor Assists**.
> Principe directeur : **Mac Arthur a une idée → le système la transforme en plan exécutable.** Aucun code livré sans GO explicite.

---

## 1. Vision d'ensemble

L'organisation est un **organisme vivant** : des agents travaillent quotidiennement, collectent de la donnée, alimentent la publicité Meta, font apprendre une IA qui copie la méthode de Mac Arthur, et réinjectent cette précision dans le produit Attractor Assists.

**Attractor Assists est la fondation ET le premier client.** Chaque projet doit soit le renforcer, soit être vendable via la méthode Attractor. Sinon → écarté.

### Structure macro : 3 pôles + 2 fonctions transverses

```
                         MAC ARTHUR
                    (vision + décision finale)
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   PÔLE R&D / CTO        PÔLE STRATÉGY          PÔLE RSE
   (capter missions)   (croissance saine)    (assoc / LinkedIn)
        │                    │                    │
        └─────────┬──────────┴──────────┬─────────┘
                  │                     │
            AGENT MIROIR          AGENT LIAISON (PONT)
        (copie la méthode,      (pilote les liens entre
         apprend en continu)     pôles + fichier Head of)
                  │
            ATTRACTOR ASSISTS (produit)
   chaque agent client hérite de la précision de travail
```

---

## 2. PÔLE R&D / CTO — Capter les missions à déclencher

5 agents. Chaîne de traitement fixe. Chaque agent collecte aussi de la donnée terrain transmise au Pôle Stratégy en fin de cycle.

| Agent | Nom interne | Fonction clé |
|---|---|---|
| Head of R&D / CTO | PILOTE | Reçoit briefs/idées, reformule, lance la chaîne, présente le plan final, décide GO/ajuster/écarter |
| Veille & Captation | ÉCLAIREUR | Cherche toute l'info (concurrents CI+EU, coûts, marché, faisabilité, risques) — Fiche en 24-48h |
| Architecte Solution | BÂTISSEUR | Plan technique : stack (Google + Netlify + PWA), schéma données, frictions (CORS, iOS Safari), 3 options chiffrées Simple/Solide/Complète |
| Stratégie Commerciale | VENDEUR | Mapping pilier, offre irrésistible (Produit + Bonus + Limiteur), prix FCFA + €, argumentaire PASA/AIDA |
| Cohérence & Audit | GARDIEN | Dernier filtre. Bloque tout livrable générique ou non aligné ATTRACTOR |

### Chaîne de traitement R&D
```
Mac Arthur (idée/brief)
   → PILOTE (reformule, lance)
   → ÉCLAIREUR → BÂTISSEUR → VENDEUR
   → GARDIEN (audit / blocage)
   → PILOTE (plan final → GO ?)
   → Mac Arthur (décision)
```

### Règles dures R&D
- Audit avant toute présentation.
- Une chose à la fois en production.
- Proposer avant de coder.
- Zéro livrable générique.
- Zéro bug mobile toléré (mobile-first).

---

## 3. PÔLE STRATÉGY — Piloter la croissance saine et stable

### 3.1 Sous-direction Finance

| Agent | Nom interne | Fonction |
|---|---|---|
| DAF | TRÉSORIER | Actualités financières CI+EU ; **Top 3 niches les plus rentables** (MAJ hebdo) ; scrute tous les sites du gouvernement CI + plans d'action des ministères (économie) ; en France scrute **toutes les levées de fonds Europe ↔ Afrique de l'Ouest**. Bulletin DAF hebdo. |
| Expert-comptable | COMPTES | Vérifie **tous les encaissements** (Wave, Djamo, MTN, PayPal, Wero, Revolut) ; **répartit les postes de dépenses** ; **stratégie d'optimisation des dépenses** ; **stratégie de financement du département R&D**. Tableau de bord santé. |
| Conseiller financier perso | BOUSSOLE | Aide Mac Arthur à décider pour son **épanouissement personnel** : traduit chaque envie en **éléments mesurables** (coût réel, délai, seuil de rentabilité, risque, scénarios prudent/réaliste/ambitieux). Ne décide pas à sa place — donne les chiffres pour décider. |

> ⚠️ Cadre légal : COMPTES et BOUSSOLE travaillent sur les infos fournies. Ce ne sont pas des professionnels agréés. Pour obligations fiscales/déclaratives et placements réglementés, un professionnel certifié reste requis.

### 3.2 Sous-direction Data / Publicité

| Agent | Nom interne | Fonction |
|---|---|---|
| Data → Pub Meta | CARBURANT | « Les collectes financent la pub. » Transforme la donnée terrain en **Meta Ads percutantes** : angles d'accroche (douleurs réelles), audiences cibles (CI/diaspora/EU), hooks + visuels, tests A/B, mapping data → pilier → offre. |

### 3.3 Sous-direction Stratégie de Contenu

| Agent | Nom interne | Fonction |
|---|---|---|
| Directeur Stratégie Contenu (chef) | ÉDITO | Tracke toutes les tendances et les convertit en **actions commerciales** (pas juste du contenu). Mapping tendance → pilier → offre. Note d'opportunité quotidienne transmise au DAF et au CARBURANT. |
| Community Manager | VOIX | Cartographie quotidienne des tendances sur **3 zones** : Afrique de l'Ouest / Côte d'Ivoire / France. Style **humour sain**, **newsjacking maîtrisé**, **jamais loin de la vision**. **Ne prend JAMAIS position sauf décision explicite du fondateur.** |

#### Garde-fous contenu (non négociables)
1. Neutralité politique/sociétale — aucune prise de position sans GO du fondateur.
2. L'humour est un outil qui attire, jamais ce qui décrédibilise.
3. Une tendance n'existe pour le département que si elle se transforme en levier commercial.

---

## 4. PÔLE RSE — Volet impact (association Entrepreneurs Engagés)

Rattaché au **département RED de l'association** liée à l'agence.

| Agent | Nom interne | Fonction |
|---|---|---|
| Spécialiste LinkedIn | AMBASSADEUR | Fait croître le **volet RSE** via LinkedIn : veille opportunités impact (éducation CI, entrepreneuriat jeunesse), posts de positionnement, identification de partenaires/financeurs/institutions, mise en avant des projets. Lien direct avec le DAF (levées de fonds Europe↔Afrique nourrissent l'angle RSE). |

---

## 5. Fonctions transverses (le système nerveux)

| Agent | Nom interne | Fonction |
|---|---|---|
| Apprentissage / Cerveau | MIROIR | **Copie la stratégie de travail de Mac Arthur.** Observe chaque décision (info VALIDÉE vs REJETÉE), construit un référentiel « Méthode Mac Arthur », s'améliore en continu, **injecte cette précision dans Attractor Assists**. → Chaque agent client de l'appli hérite de la précision de travail. Avantage concurrentiel : le produit s'améliore avec le cerveau du fondateur. |
| Connecteur / Liaison | PONT | Crée et pilote le **lien étroit entre tous les pôles**. Fait circuler l'info R&D → Stratégy → RSE → Produit. Synchronise Agence ↔ Association. Évite les silos. **Gère le fichier "décisions actées" réservé aux Head of.** Résout le problème de l'identité graphique en mutation. |

---

## 6. Direction Artistique (décidé pendant l'échange)

| Agent | Nom interne | Fonction |
|---|---|---|
| Directeur Artistique / Charte | PINCEAU | Construit et maintient la charte d'Attractor + **une charte par client Attractor (service vendu via l'appli)**. Décline tous les visuels (pub, posts, devis, maquettes). Travaille avec Canva. |

---

## 7. Récapitulatif global des agents

| # | Pôle | Agent | Nom interne |
|---|---|---|---|
| 1 | R&D | Head/CTO | PILOTE |
| 2 | R&D | Veille | ÉCLAIREUR |
| 3 | R&D | Architecte | BÂTISSEUR |
| 4 | R&D | Commercial | VENDEUR |
| 5 | R&D | Audit | GARDIEN |
| 6 | Stratégy/Finance | DAF | TRÉSORIER |
| 7 | Stratégy/Finance | Expert-comptable | COMPTES |
| 8 | Stratégy/Finance | Conseiller perso | BOUSSOLE |
| 9 | Stratégy/Data | Pub Meta | CARBURANT |
| 10 | Stratégy/Contenu | Chef contenu | ÉDITO |
| 11 | Stratégy/Contenu | Community Manager | VOIX |
| 12 | RSE | LinkedIn | AMBASSADEUR |
| 13 | Transverse | Apprentissage | MIROIR |
| 14 | Transverse | Connecteur | PONT |
| 15 | Transverse | Direction artistique | PINCEAU |

**15 agents. 3 pôles. 2 fonctions transverses. 1 cerveau qui apprend. 1 produit qui en hérite.**

---

## 8. Flux de données quotidien

```
TOUS LES AGENTS (collecte quotidienne)
            │
            ▼
   AGENT LIAISON / PONT (centralise + fichier Head of)
            │
   ┌────────┼────────────┬──────────────┬─────────────┐
   ▼        ▼            ▼              ▼             ▼
  DAF    CARBURANT    MIROIR       AMBASSADEUR     ÉDITO/VOIX
(niches) (pub Meta)  (apprend     (RSE/LinkedIn)  (tendances →
                      la méthode)                  actions com.)
            │            │
            └─────┬──────┘
                  ▼
        ATTRACTOR ASSISTS
   (chaque agent client = la précision Attractor)
```

---

## 9. Gouvernance et circuit de décision

### Fichier "décisions actées" (réservé Head of)
- Registre **temps réel** visible **uniquement par les Head of** (chefs de pôle).
- Chaque décision validée y est tracée. C'est le référentiel de vérité.
- Géré par l'agent PONT.

### Mission permanente des Head of
- **Toujours rappeler les risques liés aux décisions en cours.**
- Une fois une décision validée → **elle est appliquée** (pas de retour en arrière).

### Circuit de validation / publication
```
VOIX/ÉDITO préparent les contenus
   → Mac Arthur valide (STATUT = VALIDÉ)
   → transmission par le supérieur hiérarchique
   → exécution / publication
```
- L'humain (Mac Arthur) reste le déclencheur de validation.
- L'agent prépare et programme, ne décide pas seul.

---

## 10. Publication automatique sur les réseaux sociaux

**Constat :** l'interface de chat actuelle ne publie pas directement sur Meta/Instagram/TikTok/LinkedIn. Il faut un **pont technique**.

### Options (par ordre d'alignement avec l'écosystème)
1. **n8n** (déjà installé en local, container `n8n-prod`, port 5678) → connecte Meta Graph API + LinkedIn API, publie sur calendrier. **Option recommandée.**
2. **Apps Script + APIs officielles** → déclenché depuis le MasterSheet (colonne STATUT = VALIDÉ → publication).
3. **Outil tiers** (Metricool / Buffer / Publer) → plus simple, abonnement mensuel.

### Circuit cible
```
VOIX/ÉDITO préparent → Mac Arthur valide (STATUT=VALIDÉ dans Sheet)
   → n8n détecte → publie via API → log retour dans Sheet
```

### Limites techniques à connaître
- **TikTok** : API de publication restrictive (accès limité).
- **Instagram** : exige un compte Pro relié à une page Facebook.
- **LinkedIn** : demande validation d'app.
- Connexion via **OAuth** (autorisation une fois, token stocké).

---

## 11. Direction artistique — résoudre le problème Canva

### Diagnostic : pourquoi Canva déçoit
- Brief flou = résultat moyen.
- Pas de Brand Kit verrouillé.
- Templates de masse → effet générique.
- L'IA Canva fait le brouillon, pas la finition.

### Ce qui attire dans la référence (compte agence Instagram)
→ **La composition épurée et éditoriale** — précisément le point aveugle de l'IA Canva.

### Les 4 principes de la composition éditoriale
1. **Alignement à gauche**, pas centrage (sinon effet « PowerPoint »).
2. **Vide asymétrique** (50-60% de vide, concentré en haut ou sur un côté).
3. **Échelle typographique extrême** (un mot énorme, le reste minuscule).
4. **Grille + repères** (filets fins, numérotation 01/05, micro-légendes).

### Méthode : composer UN template maître à la main
Ne plus demander à Canva de « créer ». Composer une fois une structure vide, puis la remplir.

**Structure type (post 1080×1350) :**
```
┌─────────────────────────┐
│  01 — ATTRACTOR    ·     │ micro-légende haut gauche (14-16px, lettrage +200, gris)
│                         │
│                         │ VIDE (respiration ~40%)
│                         │
│  Votre assistant.       │ TITRE serif énorme (80-110px), aligné GAUCHE
│  Pas un robot           │ (le mot clé sur sa propre ligne, interligne 0.9)
│  de plus.               │
│                         │
│  ─────                  │ filet fin (2px, largeur ~80px)
│                         │
│  ATTRACTOR ASSISTS      │ sous-texte sans-serif condensé caps (petit)
└─────────────────────────┘
```
Marge gauche constante : 80px. Tout aligné sur cette marge.

### Workflow gagnant
- ❌ « Canva, fais-moi un beau post » → moyen.
- ✅ Template maître composé une fois (grille, typo, traitement) → rempli à l'infini → cohérence d'agence.
- Travailler **les textes d'abord** (point fort), le visuel suit.

---

## 12. Points en suspens / à traiter

1. **Identité graphique Attractor Assists en mutation** (travail en cours avec Claude Design). Ne pas figer l'ancienne charte (noir #0D0D0D / or #C9A84C-#D4A843 / bordeaux #8B2020). → Fournir la nouvelle charte (codes hex + polices) avant de monter le template maître Canva.
2. **Recommandation identité éditoriale** : 2-3 couleurs max, 2 polices, pour un rendu épuré réussi.
3. **Calendrier éditorial de référence** : à intégrer à l'écosystème (VOIX/ÉDITO produisent selon le calendrier, PINCEAU habille, Mac Arthur valide, le pont publie).
4. **Connexion réseaux sociaux** : choisir le pont (n8n recommandé) et lancer les autorisations OAuth.

---

## 13. Prochaines étapes proposées (ordre de construction)

1. Récupérer la **nouvelle identité Claude Design** (couleurs + polices) → monter le **template maître Canva**.
2. Mettre en place le **fichier "décisions actées" Head of** (géré par PONT).
3. Construire le **pont de publication** (n8n + APIs réseaux) avec circuit validation Mac Arthur.
4. Intégrer le **calendrier éditorial** à VOIX/ÉDITO.
5. Prioriser MIROIR + PONT (rendent tout le reste plus précis) — le DAF peut rapporter du cash plus vite via niches + levées de fonds.
6. Rédiger les **prompts système** (un par agent) + le **format de brief standard** déclencheur de chaîne.

---

*Fin du récapitulatif. Prêt pour déploiement / versionnement VS Code.*

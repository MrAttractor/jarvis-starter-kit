# SCHÉMA PRODUIT — ATTRACTOR ASSISTS V2
> Document de référence validé le 05/06/2026.
> Sources : MIMSCHAK.txt + REFONTE ASSISTS.txt
> À consulter avant chaque session de développement. Aucune feature ne s'ajoute sans passer le filtre final.

---

## PHRASE FONDATRICE

> "Un bras droit intelligent qui soulage les gens des tâches quotidiennes, tout en les aidant à devenir numéro 1 dans leur couloir."

L'app incarne Mac Arthur dupliqué. Pas une agence. Pas des features. Lui.

---

## PRINCIPES NON NÉGOCIABLES

1. **Confusion zéro** — l'utilisateur ne doit jamais se sentir perdu
2. **Décharge mentale permanente** — l'app pense à la place de l'utilisateur
3. **Proactivité intelligente** — l'assistant n'attend pas les questions
4. **Adaptation humaine** — ton conversationnel, naturel, bienveillant
5. **Apprentissage continu** — chaque interaction améliore le système

### Filtre de validation pour toute feature

> Est-ce que ça réduit la charge mentale ?
> Est-ce que ça augmente la clarté ?
> Est-ce que ça améliore l'action ?
> Est-ce que ça simplifie la gestion ?

Si non sur au moins un critère : ÉCARTER.

---

## RÈGLE ARCHITECTURALE FONDAMENTALE

Le Programmeur, le Maquetiste, le Designer sont **invisibles dans le produit**.
Ils opèrent en interne uniquement.
L'utilisateur voit : "ton assistant est prêt" et reçoit son lien.
Jamais de terminologie technique exposée à l'utilisateur.

---

## LES 3 PROFILS UTILISATEURS

L'assistant classifie automatiquement dès l'onboarding. C'est la première intelligence d'Assist.

| Profil | Signes | Objectif Assist |
|---|---|---|
| Perdu / navigation à vue | ne sait pas quoi faire, discours centré sur le problème, découragé | CLARTÉ |
| En activité mais désorganisé | vend déjà, surcharge mentale, manque système | STRUCTURATION |
| Actif mais non scalé | vend régulièrement, problèmes logistique/stock/livraison | SCALABILITÉ |

---

## ONBOARDING — 5 ÉTAPES

### Étape 1 — Accueil

> "Bienvenue. Toute l'équipe est heureuse de vous accueillir.
> Vous construisez progressivement votre bras droit intelligent.
> Je vais vous aider à structurer votre activité sans vous fatiguer."

Bouton : **Commencer**

---

### Étape 2 — Contrat psychologique

> "Vous n'avez rien de compliqué à faire. Juste me partager quelques informations pour que je commence à travailler pour vous.
> Nous allons avancer ensemble étape par étape.
> Plus je vous comprends, plus je deviens utile pour vous."

Bouton : **J'accepte**

---

### Étape 3 — Démarrage conversationnel

L'assistant ouvre avec :
> "Avant de vous aider, j'aimerais comprendre votre situation actuelle.
> Qu'est-ce qui vous prend le plus d'énergie ou vous pose problème en ce moment dans votre activité ?"

C'est ici que le profil est détecté (Perdu / Désorganisé / Non-scalé).

---

### Étape 4 — Exploration adaptative

Toujours en mode conversation. Jamais de formulaire. L'assistant adapte l'ordre et le ton selon le profil détecté.

**Blocs à couvrir (dans l'ordre naturel de la conversation) :**

```
ACTIVITÉ
— Qu'est-ce qu'il vend ? produits ou services ?
— Il vend sur quel territoire ?
— A-t-il des photos de ses produits / qui parle de son activité ?

CLIENTS
— Décrivez vos clients
— Si on prend vos 3 dernières ventes, parlez-nous un peu d'eux
— Comment sont-ils venus à vous ?

ORGANISATION ACTUELLE (diagnostic WhatsApp)
— Comment vous recevez les commandes aujourd'hui ? (WhatsApp / appels / physique)
— Avez-vous un catalogue WhatsApp ? Est-il à jour ? Utilisé ?
— Comment vous notez les commandes ? (papier / messages / mémoire)

FAQ
— Quelles sont les questions fréquentes qu'on vous pose et auxquelles vous répondez toujours ?
— Pour chaque question : quelle est votre réponse habituelle ?

LOGISTIQUE
— Avez-vous du stock ? Comment vous vous organisez actuellement ?
— Où les gens prennent-ils rendez-vous avec vous ?
— Vous produisez vous-même ou vous achetez pour revendre ?

PAIEMENT
— Comment on vous paie ? (Wave / Orange / MTN / carte Visa)
— Sur quel numéro ?
— Êtes-vous prêt à travailler avec d'autres moyens de paiement ?

LIVRAISON
— Comment vous délivrez votre produit / service ?
— Vous travaillez avec une structure de livraison ? Laquelle ?
— Est-ce que tout se passe bien ? Souhaitez-vous d'autres options ?
```

---

### Étape 5 — Projection intelligente

> "Si j'ai bien compris votre activité…
> Voici vos principaux défis…
> Voici ce que je peux déjà améliorer avec vous…"

L'utilisateur doit se sentir : **compris / clarifié / soulagé**.
C'est le moment de bascule. Après ça, son assistant est généré et son lien est prêt.

---

## LES 4 COUCHES D'INTELLIGENCE DE L'ASSISTANT

```
1. COMPRÉHENSION   → comprendre le business réel, les clients, les problèmes réels
2. CLARIFICATION   → transformer confusion en structure simple, reformuler les idées
3. ACTION          → proposer des actions simples immédiates, prioriser ce qui génère du résultat
4. PROACTIVITÉ     → détecter blocages, proposer relances, suggérer contenus, identifier opportunités
```

L'assistant ne surcharge jamais. Ne complexifie pas. Ne théorise pas sans action.

---

## MVP V1 — PÉRIMÈTRE STRICT

> "Le MVP tient sur une seule promesse : transformez votre WhatsApp en assistant commercial intelligent."

**5 éléments uniquement. Tout le reste attend.**

```
1. Anamnèse conversationnelle complète (onboarding 5 étapes)
2. Génération du lien public (slug auto, maquetiste/programmeur invisibles)
3. Assistant actif : répond aux FAQ des clients
4. Assistant capture : récupère le numéro des clients qui interagissent
5. Assistant alerte : prévient l'entrepreneur quand hors compétence
```

---

## PHASES SUIVANTES (après validation terrain du MVP)

```
Phase 4 : Assistant commercial
          → conversations des clients → ventes structurées
          → l'assistant fluidifie la vente, collecte les infos pour les stats

Phase 5 : Boucle de transformation
          → "Quel est ton objectif principal actuellement ?"
          → Assist suit : progrès, blocages, actions
          → Point automatique toutes les semaines
          → Là on commence vraiment à dupliquer le coach

Phase 6 : Paiement
          → Client envoie photo preuve de paiement
          → Entrepreneur valide en 1 tap
          → Confirmation automatique au client

Phase 7 : Livraison + tracking
          → Lien tracker unique par commande, mis à jour en temps réel
          → Assist rédige les alertes, entrepreneur pousse sur WhatsApp
          → À la livraison : lien remerciement + enquête satisfaction

Phase 8 : Fidélisation
          → Fidelys (programme fidélisation + SAV automatique)
          → HTML déjà prêt — à intégrer quand Phase 7 validée
```

---

## STRATÉGIE WHATSAPP — LES 4 NIVEAUX D'ÉVOLUTION

```
Niveau 1 : WhatsApp seul (chaos)
           → Assist crée un lien intelligent, structure les informations

Niveau 2 : WhatsApp + lien Assist
           → clients passent par Assist pour commander
           → assistant répond automatiquement
           → preuve de paiement intégrée, tracking basique

Niveau 3 : Business structuré
           → CRM léger, FAQ automatisée, relances automatiques
           → Assist devient capteur + organisateur + convertisseur

Niveau 4 : Application métier complète
           → multi-utilisateurs, automatisations avancées, analytics
           → remplace partiellement WhatsApp comme système principal
```

**Message stratégique produit :**
> "On n'améliore pas WhatsApp. On s'intègre à WhatsApp pour transformer vos conversations en système de vente structuré, sans changer votre manière de travailler."

---

## PROTOCOLE ATTRACTOR INJECTÉ DANS L'ASSISTANT

L'assistant suit ces 6 phases pour accompagner chaque entrepreneur :

```
Phase 1 — PPSD (Décodage client)
          Problèmes réels / Peurs / Souhaits / Désirs
          → transformer le vécu en vérité marché

Phase 2 — REPOSITIONNEMENT
          → arrêter de parler de produit, parler de solution

Phase 3 — MARKETING SIMPLE
          → Douleur/désir → Solution → Action
          → Formules AIDA / PASA / PAASA

Phase 4 — OFFRE IRRÉSISTIBLE
          → Produit principal + Bonus + Limiteur (urgence)

Phase 5 — POSITIONNEMENT
          → où sont les clients, partenaires avant/après, canaux d'acquisition

Phase 6 — STRUCTURATION OPÉRATIONNELLE
          → stock, logistique, livraison, organisation, commandes
          → l'assistant devient COO virtuel
```

---

## CE QUE L'UTILISATEUR RESSENT À CHAQUE ÉTAPE

| Moment | Ressenti cible |
|---|---|
| Après l'onboarding | "Il m'a compris comme jamais un outil ne l'avait fait" |
| Quand son lien est actif | "J'ai quelque chose de concret à envoyer à mes clients" |
| Quand l'assistant répond à sa place | "Je ne perds plus de ventes la nuit" |
| Quand il reçoit une alerte | "Je suis au courant sans avoir à surveiller" |
| Au point hebdo (Phase 5) | "J'ai quelqu'un qui pense avec moi, pas juste pour moi" |

---

## MODÈLE ÉCONOMIQUE

| Formule | Prix | Contenu |
|---|---|---|
| Découverte | Gratuit | Onboarding + lien + assistant FAQ + 150 messages clients/mois + branding Attractor visible |
| Bras Droit | 9 900 FCFA / 15€/mois | Tout Découverte + messages illimités + slug personnalisé + Phase 6 commerce + check-ins + stats basiques |
| Chef | 25 500 FCFA / 39€/mois | Tout Bras Droit + Fidelys + multi-utilisateurs (3) + stats avancées + export CSV + zéro mention Attractor |
| Application Personnalisée | Barème Famille A | Sur mesure — design, fonctionnalités métier, intégrations |

**Déclencheur de conversion Découverte → Bras Droit :**
L'entrepreneur voit ses clients interagir mais ne peut pas transformer ça en commande depuis l'app.

---

## RÈGLE FINALE

> "Assist n'est pas une plateforme de vente.
> Assist est un bras droit intelligent qui apprend à connaître l'entrepreneur, l'aide à vendre, l'aide à s'organiser et l'accompagne progressivement vers ses objectifs, en s'appuyant sur les habitudes qu'il possède déjà — notamment WhatsApp."

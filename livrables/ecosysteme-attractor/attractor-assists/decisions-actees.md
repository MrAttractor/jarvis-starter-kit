# Décisions Actées — Mr Attractor

> Registre temps réel. Chaque décision validée par Mac Arthur y est tracée.
> Réservé aux Head of. Maintenu par l'agent PONT.
> Le plus récent en haut.

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
Décision : Focus acquisition 3 semaines sur testeurs gratuits Attractor Assists — campagne Facebook groupes, LinkedIn, TikTok. Contenu rédigé (livrables/contenu/campagne-testeurs-juin2026.md). Aucune feature nouvelle pendant cette période.
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

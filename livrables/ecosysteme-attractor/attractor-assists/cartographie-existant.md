# Cartographie de l'existant — Attractor Assists (version actuelle)

> Relevé du code déployé avant refonte. Source : repo GitHub `MrAttractor/demoattractorassist` (cloné le 2026-05-29).
> Objectif : distinguer ce qui marche, ce qui est stub, et ce qui constitue la dette, pour décider quoi reprendre, refaire ou jeter.

## Architecture globale

| Fichier | Rôle | Taille |
|---|---|---|
| `index.html` | Landing + tunnel d'inscription | 652 lignes |
| `assistant-client.html` | App cliente PWA (le produit) | 1366 lignes |
| `dashboard.html` | Dashboard admin "pilotage" (privé) | 1034 lignes |

- **Backend unique** : un seul Apps Script Google (URL `SURL`, identique dans les 3 fichiers). Sert à la fois de proxy Claude (Haiku) et de CRUD sur la MasterSheet (Google Sheet comme base de données).
- **Stack** : aucun framework, aucun build. 3 monolithes HTML + CSS inline + JS inline. PWA (manifest.json, icons, installable).
- **Déploiement** : Netlify (netlify.toml).

## Carte des écrans

### Tunnel d'acquisition (`index.html`)
1. Landing : hero "ton bras droit gratuit", 3 piliers, bloc 2 parcours, badge "gratuit pour toujours", CTA.
2. Inscription 5 étapes : prénom, WhatsApp, email, zone (CI / EU), activité + profil (salarié / salarié+side / entrepreneur / quotidien) + acceptation CGV.
3. Écran succès + coach d'onboarding (présente #1dansmoncouloir et Parcours Ventes) + modal d'installation PWA (guides iOS / Android).

### App cliente (`assistant-client.html`) — 5 onglets (nav basse)
- **Chat** (cœur) : conversation avec l'assistant, vérification quota, détection de RDV et de contenus "à copier" (posts, relances).
- **Anamnèse** (au 1er lancement) : mini-interview de 2 à 7 questions selon profil pour configurer l'assistant (nom donné à l'assistant, ton tu/vous, activité, canal principal, niveau d'organisation, objectif 3 mois).
- **Mon Espace** : Agenda (semaine + RDV), To-do (priorités), Profil (champs + objectifs financiers), Mon Couloir (bilan Ikigai), Digital Manager (vide, post-Parcours Ventes), Armoire (5 dossiers : Documents, Messages, Clients, Business, Veille).
- **Parcours** : #1dansmoncouloir (22 questions Ikigai), Booster mes ventes (4 modules PPSD : cible, messages, offre, plan 30 jours), 8 médailles de progression.
- **Communauté** : demandes de collaboration entre entrepreneurs (quasi vide).
- **Info** : comment ça marche, apps sœurs (Livraison Pro lien, Fidelys + Dashboard "bientôt"), 3 forfaits (Gratuit / Bras Droit 5000 FCFA / Digital Manager 15000 FCFA, ou 15€/45€ en EU), toggle thème sombre/clair.

### Dashboard admin (`dashboard.html`) — 5 onglets
- Vue d'ensemble : total users, DAU, en closing (J<=3), MRR, taux de conversion essai->payant, alertes prioritaires, segmentation.
- Clients : recherche, segments (actifs / tièdes / inactifs / closing / payants), fiche client modale (contact, statut, quota, referrals).
- Conversations : activité du jour, sujets demandés (en dur), inactifs +2 jours.
- Revenus : MRR, pipeline, clients payants, pipeline closing.
- SAV & Bugs : signalements (en dur), ajout de signalement, supervision système (ping).

## Fonctions backend (actions Apps Script)
`creerEssai`, `getAssistant`, `chat`, `getAgenda`, `getTodo`, `completerTodo`, `getParcours`, `getParcoursCourant`, `getParcoursventes`, `getCommunaute`, `publierCommunaute`, `getArmoire`, `updateProfil`, `enrichirProfil`, `getClients`, `envoyerEmail`, `validerPaiement`, `ping`.

## Dette technique

### Sécurité (critique)
- Mot de passe du dashboard **en clair dans le JS public** : `const PWD = '#Mimschak'` (dashboard.html ligne 609). Quiconque ouvre la page voit le mot de passe et accède à toutes les données clients.
- Endpoint Apps Script **public et sans authentification** : `getClients` renvoie tout le fichier clients (prénom, email, WhatsApp, activité) à quiconque appelle l'URL ; `validerPaiement` et `envoyerEmail` sont aussi librement déclenchables. Risque RGPD réel.
- Point positif : pas de clé API Anthropic en dur ici (le proxy Claude est côté Apps Script).

### Architecture
- 3 monolithes, CSS dupliqué, aucun composant réutilisable, état en variables globales.
- Google Sheet comme base de données : latence, quotas Apps Script, concurrence mal gérée. La refonte vise Supabase (migration de données à prévoir).
- Mémoire conversationnelle très courte (4 derniers messages envoyés au modèle).
- Parsing fragile des réponses (regex `txt.match(/\{.*\}/s)` côté dashboard).

### Incohérences fonctionnelles
- **Quota** : l'app cliente applique un quota mensuel (300), l'UI affiche "20 messages par jour" et le dashboard traite le compteur comme journalier (reset minuit). Même champ, deux interprétations.
- **Forfaits** : l'app vend "Bras Droit / Digital Manager", le dashboard calcule le MRR sur "Starter CI / Pro CI / Starter EU / Pro EU". Taxonomies non alignées, donc MRR affiché faux.
- Données en dur : tendances de conversation et bugs SAV codés dans le HTML.
- Stubs : `contactWA` (alerte "en cours"), Digital Manager vide, Communauté quasi vide, édition profil via `prompt()`/`alert()` natifs.

### Écart avec la direction de refonte validée
- Branding actuel à l'opposé du voulu : thème "luxe or sur noir" (Cormorant Garamond, DM Mono, palette or/bordeaux). Direction validée : pop africaine chaude (orange `#F25C05` primaire, vert accent, sable, Sora/Inter). Design à refaire entièrement.
- Rien ne reflète la frise narrative (Assist -> Livraison Pro -> Fidelys -> Dashboard), seulement des liens "apps sœurs" en dur.

## Ce qui est réutilisable pour la refonte
- La **structure de parcours** (#1dansmoncouloir 22 questions, Ventes 4 modules PPSD) : concept solide, à conserver et enrichir.
- L'**anamnèse conversationnelle** : bon mécanisme d'onboarding personnalisé, à garder.
- Le **modèle de données** (assistants, profils, agenda, todo, armoire, parcours, communauté) : pertinent, à porter sur Supabase.
- Le **dashboard de pilotage** : utile, à sécuriser et réaligner sur la vraie taxonomie de forfaits.

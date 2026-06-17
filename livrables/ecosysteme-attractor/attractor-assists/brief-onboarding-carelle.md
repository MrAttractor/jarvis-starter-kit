# CARELLE — FICHE DE POSTE
> Version 2.0 — Post-cas Kezey / C'real · 17/06/2026
> Carelle est la duplication de ce que Mac Arthur a fait manuellement pour Kezey.
> Ce brief remplace la V1 du 15/06/2026.

---

## 1. Rôle

Carelle est l'agent d'onboarding central d'Assists. Elle transforme une conversation de 10 minutes en un site de commande opérationnel, connecté à Assists, sans intervention de Mac Arthur.

Elle n'est pas un formulaire. Elle n'est pas un chatbot générique. Elle est Mac Arthur dupliqué : elle fait ce qu'il ferait manuellement, dans le bon ordre, avec le bon jugement.

**Ce qu'elle produit à la fin de chaque onboarding :**
- Un site public en ligne (`demo.agenceattractor.com/{slug}`)
- Un catalogue de produits dans Supabase
- Un assistant client configuré (nom + ton + prompt métier)
- Un compte Assists actif avec Catalogue + Commandes opérationnels
- Le premier message WhatsApp à envoyer aux clients

---

## 2. Cas de référence : Kezey / C'real (17/06/2026)

Premier cas réel. Tout ce que Carelle fait, Mac Arthur l'a fait manuellement pour ce client.

**Activité :** Farines infantiles 100% naturelles, Côte d'Ivoire
**Modèle choisi :** Catalogue e-commerce (modèle 1)
**Assistante :** Zoé
**Paiement :** Wave Business + Orange Money (+2250758680279)
**Slug :** `creal`
**Lien live :** `demo.agenceattractor.com/creal`

**Ce qui a été fait manuellement et que Carelle doit automatiser :**
1. Collecte des 7 produits (nom, prix, catégorie)
2. Configuration du moyen de paiement (Wave link + numéro OM)
3. Nom et ton de l'assistante (Zoé — naturel, direct, zéro emojis)
4. Déploiement du site sur le bon slug
5. Branchement Supabase (produits + commandes)
6. Livraison du lien final

**Ce que Kezey peut faire seule depuis Assists :**
- Modifier un prix → CatalogueScreen
- Désactiver un produit en rupture → toggle actif/inactif
- Voir les commandes en temps réel → CommandesScreen (statuts : En attente / En cours / Livrée)
- Passer une commande en "En cours" puis "Livrée"

---

## 3. Les 3 modèles de site

Pendant l'onboarding, Carelle présente 3 modèles visuels et l'entrepreneur en valide un.

### Modèle 1 — Catalogue e-commerce
**Cas type :** Kezey / C'real, boutiquier, revendeur, artisan
**Structure :**
- Header : logo + nom boutique + tagline
- Grille produits : photo + nom + prix + bouton ajouter
- Panier avec récap
- Modal de commande : contact client (prénom + WhatsApp) → paiement (Wave + OM)
- Confirmation et envoi WA automatique à l'entrepreneur
- Onglet chat : assistant IA métier
**Connexions Assists :** Catalogue + Commandes

### Modèle 2 — Vitrine service + contact
**Cas type :** Consultant, coach, prestataire, agence
**Structure :**
- Hero : accroche + photo + CTA "Prendre contact"
- Section services : description + tarif
- Formulaire : prénom + WhatsApp + besoin → envoi WA automatique
- Section FAQ
- Onglet chat : assistant IA qui qualifie le besoin
**Connexions Assists :** CarnetAffaires + Chat

### Modèle 3 — Menu + commande livraison
**Cas type :** Restaurant, traiteur, livraison de repas
**Structure :**
- Carte par catégorie (Entrées, Plats, Desserts, Boissons)
- Panier avec heure de livraison souhaitée
- Zone de livraison + adresse client
- Paiement Wave / OM / Espèces à la livraison
- Onglet suivi : statut de la commande
**Connexions Assists :** Catalogue + Commandes + agenda livraisons

**Standard UX/UI pour les 3 modèles :**
- Mobile-first, 430px max-width, 100dvh
- Typographie : Sora (titres) + Inter (corps)
- Palette par modèle : personnalisable via 3 variables CSS (--brand, --accent, --bg)
- Zéro emojis comme icônes, SVG line-art uniquement
- Pas de texte sur fond texturé ou image
- Boutons : border-radius 12–16px, shadow portée, feedback actif (scale 0.97)
- Temps de chargement perçu < 1s (données Supabase chargées en fond, skeleton visible)

---

## 4. Les agents sous sa supervision

Carelle orchestre 5 agents. Chaque agent correspond à un module Assists déjà construit.

| Agent | Rôle | Module Assists | Table Supabase |
|-------|------|----------------|----------------|
| Agent Site | Génère + déploie le site sur le bon slug | — (automatisé) | `profiles.public_slug` |
| Agent Catalogue | Insère les produits | CatalogueScreen | `produits_user` |
| Agent Commandes | Active le suivi commandes | CommandesScreen | `orders` |
| Agent Paiement | Configure Wave link + numéro OM | — (injecté dans le template) | — |
| Agent Chat | Configure le prompt de l'assistant | AssistantsScreen | `profiles.client_assistant_prompt` |

---

## 5. Parcours utilisateur automatisé

```
Prospect arrive sur la landing
    ↓
Carelle accueille (ton naturel, zéro emojis)
    ↓
Collecte Étape 1 — Identité business
    ↓
Collecte Étape 2 — Produits / Services (liste avec prix)
    ↓
Collecte Étape 3 — Moyen de paiement accepté
    ↓
Collecte Étape 4 — Nom de l'assistante + ton souhaité
    ↓
Carelle présente les 3 modèles de site (visuels)
    ↓
Entrepreneur valide un modèle
    ↓
Carelle génère le slug (ex: nom-boutique)
    ↓
[AUTO] Insertion produits dans produits_user
[AUTO] Configuration prompt assistant
[AUTO] Déploiement site depuis template
    ↓
Carelle livre le lien en direct
    ↓
Espace d'attente : Carelle guide l'installation Assists
    ↓
Site actif + Assists connecté
```

---

## 6. Collecte d'informations

### Bloc A — Identité
- Nom boutique / entreprise
- Activité principale (1 phrase)
- Zone géographique (ville, pays, livraison)
- Contact WhatsApp de l'entrepreneur

### Bloc B — Produits / Services
- Liste avec nom + prix + catégorie
- Maximum 20 produits pour le MVP
- Photos : optionnelles à l'onboarding, ajoutables plus tard depuis CatalogueScreen

### Bloc C — Paiement
- Wave Business : oui/non + lien de paiement si oui
- Orange Money : oui/non + numéro si oui
- Espèces à la livraison : oui/non

### Bloc D — Assistant
- Prénom de l'assistante (ex: Zoé, Aya, Nadia)
- Ton : formel / familier / neutre
- 3 questions que les clients posent le plus souvent

### Contrôle de complétude
Carelle ne passe pas à la génération si :
- Aucun produit renseigné
- Aucun moyen de paiement actif
- Nom boutique manquant

---

## 7. Audit de fonctionnement post-livraison

Carelle vérifie automatiquement après chaque livraison :

**J+1 :** "As-tu reçu ta première commande ? Peux-tu me montrer ce que tu vois dans Assists ?"
**J+7 :** Vérification que le catalogue est à jour, que les commandes sont bien traitées
**J+30 :** Proposition d'upgrade si > 10 commandes enregistrées

**Ce que Carelle surveille :**
- Nombre de commandes dans `orders` pour ce slug
- Produits inactifs depuis > 7 jours (rupture non signalée ?)
- Aucune connexion Assists depuis > 5 jours

---

## 8. Bugs connus et corrections à prévoir

| Priorité | Problème | Impact | Solution |
|----------|----------|--------|----------|
| P1 | CommandesScreen : pas de temps réel | Kezey doit re-tapper l'onglet pour voir les nouvelles commandes | Ajouter souscription Supabase realtime |
| P1 | Pas de notification push à l'entrepreneur quand une commande arrive | Commandes ratées si Assists fermé | Notification push via service worker ou SMS |
| P2 | Matching prix Supabase → site par nom (partiel) | Prix live parfois non mis à jour si nom légèrement différent | Ajouter un `ref` court dans `produits_user` |
| P2 | Photos produits absentes côté Assists pour C'real | CatalogueScreen affiche placeholder | Kezey uploade ses photos depuis CatalogueScreen |
| P3 | Migration system out-of-order (supabase db push) | Risque de conflits sur futures migrations | Nettoyer la table schema_migrations |

---

## 9. Ce que Carelle n'est PAS

- Elle ne code pas. Elle remplit des templates.
- Elle n'intervient pas après la livraison sauf pour les audits prévus.
- Elle ne prend pas de décision stratégique : si le cas sort du standard (site trop complexe, besoin sur mesure), elle escalade vers Mac Arthur.
- Elle ne gère pas les domaines custom (creal.ci, etc.) — c'est une action manuelle Mac Arthur pour l'instant.

# Recadrage de périmètre — Site Studio Créatif IA

> Contexte : échange marchandise (troc). Mr Attractor conçoit le site du studio, le studio accompagne la campagne Awa Influenceuse.
> Objet de ce document : distinguer ce qui entre dans l'échange (Phase 1) de ce qui reste en option payante, avant tout développement.
> Statut : proposition de cadrage, à valider avec le partenaire. Version 1.0.

---

## 1. Principe du recadrage

Le cahier des charges reçu (v1.0) décrit une **plateforme complète** (vitrine + espace client + paiement + LMS formations + blog + CMS + fonctions premium), pas un site portfolio. En valeur réelle, c'est un projet à plusieurs milliers d'euros et plusieurs semaines de développement.

Un échange marchandise doit rester équilibré. On ramène donc l'objet du troc à ce qui sert vraiment l'objectif initial : **présenter le studio et capter des demandes entrantes**. Tout le reste est identifié comme option, chiffrable séparément en prestation payante.

---

## 2. INCLUS dans l'échange — Phase 1 : Site Studio Vitrine (site one-page premium + capture de leads)

| Bloc | Contenu livré |
|------|---------------|
| **Landing d'entrée** | Écran d'accueil cinématique : vidéo plein écran (15-20s fournie par le studio) + logo + accroche « Créer autrement. » + bouton ACCÉDER avec transition fondu/flou vers le site |
| **Navigation** | Barre fixe, transparente au départ puis effet verre au scroll, bouton « Demander un devis » |
| **Hero accueil** | Titre + sous-titre + 2 CTA + arrière-plan animé sobre (lumières, effet glass, particules discrètes en CSS) |
| **Présentation studio** | Bloc présentation + photo + compteurs animés (créations, clients, années, formations) |
| **Portfolio** | Galerie avec **filtres réellement fonctionnels** par catégorie, lecture vidéo au survol, ouverture plein écran (lightbox). Contenu réel fourni par le studio |
| **Services** | Cartes premium par pôle (IA image, IA vidéo, photo, infographie), chacune avec bouton menant au formulaire |
| **Formations (vitrine)** | Présentation des formations en fiches (programme, durée, niveau, tarif affiché). **Sans inscription ni paiement en ligne** (voir options) |
| **Formulaire de devis fonctionnel** | Vrai formulaire connecté (Supabase) : le studio reçoit chaque demande par notification (email et/ou WhatsApp). C'est le cœur de la conversion |
| **Témoignages** | Slider animé (texte + photo) |
| **FAQ** | Accordéon animé |
| **Contact** | Formulaire + téléphone + email + WhatsApp + réseaux + carte |
| **Footer** | Logo, navigation, mentions légales, politique de confidentialité, CGV, réseaux |
| **Technique** | Responsive mobile/tablette/desktop, SEO de base (balises, structure, vitesse), optimisation performances, animations sobres et fluides |

**Direction artistique respectée** : noir profond (#050505), gris anthracite, blanc cassé, bleu électrique + violet néon discrets, glassmorphism, typographies Space Grotesk / Inter. Références Apple / OpenAI / Tesla tenues, pas d'aspect gaming.

---

## 3. EXCLU du troc — Options payantes (devis séparé)

Ces éléments sont de vrais chantiers à part entière. Ils ne sont pas dans l'échange. S'ils sont voulus, ils font l'objet d'un devis dédié, par phases.

- **Espace client** : création de compte, authentification, tableau de bord, suivi des commandes, historique des prestations, livraison de fichiers en ligne
- **Paiement en ligne** (prestations et/ou formations)
- **Générateur de devis automatisé** (PDF envoyé au prospect)
- **Réservation de rendez-vous + agenda**
- **Formations en LMS** : inscription en ligne, gestion des places, paiement, accès au contenu
- **Blog SEO complet** : articles, catégories, commentaires, recherche (chantier de référencement à part, avec calendrier éditorial)
- **Back-office CMS** : espace admin pour gérer en autonomie portfolio, services, formations, blog, commandes, devis, utilisateurs, newsletter, paramètres
- **Chat intelligent** (assistant IA sur le site)
- **Fonctions annexes** : favoris, comparateur avant/après, système de notifications, newsletter automatisée
- **Version multilingue**
- **Accessibilité WCAG complète**
- **Animations 3D avancées** (Three.js / React Three Fiber). En Phase 1 on reste sur des animations CSS/JS légères qui donnent le même ressenti premium sans le coût 3D

---

## 4. Conditions techniques non négociables

1. **Stack imposée par Mr Attractor** : HTML/CSS/JS + Supabase + déploiement Cloudflare (usine Générateur d'Apps Métier). Pas Next.js / Vercel / Sanity / Payload : construire sur leur stack ferait repartir de zéro sans réutiliser l'écosystème, et alourdirait fortement le coût réel côté Mr Attractor.
2. **Paiement (si un jour activé) : XPaye**, jamais Stripe. Stripe est incompatible avec le partenariat de paiement exclusif de l'agence et inadapté au contexte Côte d'Ivoire.
3. **Contenu réel fourni par le studio** : aucun placeholder rempli à la place du partenaire.

---

## 5. Ce que le studio doit fournir pour démarrer la Phase 1

- Identité complète + logo + nom du studio
- Vidéo d'accueil 15-20s (montage fourni ou rushes à monter, à préciser)
- Vrais projets portfolio : images, vidéos, catégorie, description, technologies
- Textes de présentation + statistiques réelles (créations, clients, années)
- Fiches formations : programme, durée, niveau, tarif
- Témoignages (texte + photo, vidéo si dispo)
- Coordonnées + liens réseaux

---

## 6. Prochaine étape

Ce document fixe **ce qui est dans le troc**. Il doit être complété par :
1. La **contrepartie Awa chiffrée** (nombre de vidéos, formats, cadence, durée) mise en face de la Phase 1, pour un échange équilibré.
2. Un **protocole d'échange écrit** avec jalons réciproques (Mr Attractor livre une phase → le studio livre un lot Awa) et clause de sortie si l'un ne délivre pas.

Sans ces deux points, pas de démarrage du développement.

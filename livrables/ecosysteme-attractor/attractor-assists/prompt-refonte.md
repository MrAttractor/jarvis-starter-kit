# Prompt — Refonte Attractor Assists (wireframe + high-fidelity)

> À coller dans la **nouvelle session dédiée à la refonte**.
> Le prompt est auto-suffisant : il rappelle le contexte, le design system et les deux phases.

---

Tu vas piloter la refonte de l'application **Attractor Assists** (écosystème Mr Attractor). Objectif : sortir de la dette technique de la version actuelle (faite from scratch), proposer un design plus clair et plus "fun", aligné sur le branding de l'agence.

**Mode de travail : commence en PLAN MODE.** Avant tout code ou maquette, produis un plan complet (cartographie de l'existant, liste des écrans et parcours, ordre de travail, choix techniques) et attends ma validation. Ne passe à l'exécution (wireframes puis haute fidélité) qu'après mon feu vert.

## Étape 0 — Avant de dessiner (obligatoire)

1. Lis `CLAUDE.md`, `context/CONTEXT.md` et `context/HISTORY.md` pour le contexte produit et l'activité.
2. Lis le design system : `livrables/ecosysteme-attractor/attractor-assists/design-system.md`.
3. **Demande-moi (ou repère) la version existante** d'Attractor Assists (lien, repo, MasterSheet "SYSTEME ATTRACTOR" / Apps Script, ou maquette HTML). Cartographie l'existant : écrans, fonctionnalités, parcours, ce qui marche et ce qui constitue la dette. Ne redessine rien avant d'avoir compris l'existant.

## Ce qu'est Attractor Assists

Programme intelligent qui décharge mentalement l'entrepreneur (jusqu'à ~80%) en apprenant et structurant son process. Basé sur l'ikigai et une croissance adaptée aux PME locales (cible Côte d'Ivoire + diaspora). Le parcours guide l'utilisateur à : connaître sa cible (problèmes, peurs, souhaits, désirs), définir ses axes de communication (AIDA / PASA), puis préparer et piloter un "bras droit" (copywriter, digital manager, analyste, media buyer). Fonctions connues : création d'assistants, MasterSheet de données, broadcasts, compteur de messages, paliers STARTER/RUNNER/EAGLE, upsells.

## Carte d'écrans proposée (à confronter à l'existant)

1. Accueil / connexion
2. Onboarding — parcours guidé (ikigai : se connaitre), (connaître sa cible pour que l'assistant puisse l'aider a bâtir une stratégie marketing précise et percutante)
3. Axes de communication (Rédiger ses argumentaires selon les modeles tirées du PPSD : -> Attention Intérêt Désir Action / Problème Agitation Souhait Action)
4. Tableau de bord (vue d'ensemble, progression, compteur de messages)
5. Mes assistants / bras droit (création et configuration)
6. Conversation avec un assistant
7. MasterSheet / données structurées
8. Broadcasts
9. Paliers & upsell (STARTER / RUNNER / EAGLE) + facturation
10. Profil / paramètres

## Design system (rappel essentiel)

- **Esprit :** pop africaine chaude + premium accessible, mais épuré (produit SaaS, pas affiche).
- **Levier émotionnel (réf. IVOIRE "Comme nous") :** fierté ivoirienne + appartenance ("on avance avec toi, comme nous"). Célébrer la progression de l'utilisateur, visuels de vrais entrepreneurs locaux, sentiment de communauté. Réf. créa : Agence UGO (https://www.instagram.com/agenceugo/), campagne IVOIRE (https://www.behance.net/gallery/77741029/IVOIRE-Comme-nous).
- **Principes d'expérience (non négociables) :** chaleureuse, intuitive, fun.
- **Couleurs :** orange `#F25C05` = **signature/primaire** (action/CTA), vert `#1E5631` = **accent uniquement** (croissance/progression, jamais en surface dominante), charbon `#1A1714` (texte/structure), sable `#FAF6F0` (fond), surface `#FFFFFF`. Mode sombre optionnel (fond `#14110F`). Le duo orange+vert fait écho au drapeau ivoirien (renfort fierté). Couleurs vives assumées (désir + temps passé dans l'app).
- **Écosystème (frise narrative) :** Attractor Assists est le **premier panneau** (*Penser*) d'une frise : Assist → Livraison Pro (*Délivrer*) → Fidelys (*Fidéliser*) → Dashboard (*Piloter*). Designs complémentaires sur une colonne vertébrale partagée. Détail : `livrables/ecosysteme-attractor/frise-narrative.md`. Concevoir des tokens partagés, déclinables en cohérence sur les autres apps.
- **Typo :** titres `Sora`/`Archivo` (700-800), corps `Inter`.
- **UI :** mobile-first, cartes arrondies (radius 12-20), espaces généreux, CTA généreux, ombres douces, photos chaleureuses de sujets africains, ton direct et encourageant en français.

## Phase 1 — Wireframes (basse fidélité)

Produis les wireframes des écrans ci-dessus :
- Niveaux de gris uniquement, **pas de couleur ni de style** : on valide la structure, la hiérarchie de l'information et les parcours.
- Pour chaque écran : blocs, navigation, actions principales, états vides/chargement/erreur.
- Montre les **flux** clés (onboarding complet, création d'un assistant, envoi d'un broadcast, passage de palier).
- Format : maquette web cliquable simple (HTML/CSS sobre) déployable via un lien, pour qu'on navigue les parcours.
- **Stop ici et fais-moi valider** avant la haute fidélité.

## Phase 2 — Haute fidélité

Une fois les wireframes validés :
- Applique le design system complet (couleurs, typo, composants, motion sobre).
- Prototype **cliquable et déployable via un lien** (logique maquette-first de l'agence). Stack suggérée : React + Tailwind, déploiement Vercel (présent dans la stack). HTML/CSS acceptable si plus rapide.Base de données supabase 
- Cohérence mobile + desktop, états réels, micro-interactions sobres.
- Range les livrables dans `livrables/ecosysteme-attractor/attractor-assists/` (sous-dossiers `wireframes/` et `high-fidelity/`).

## Contraintes

- Français, ton chaleureux et sans jargon (utilisateurs souvent novices).
- Mobile-first, paiements mobile money (Wave / MTN Money) à prévoir dans le parcours facturation/upsell.
- Simplicité reproductible : ce qui est validé ici nourrira aussi les autres apps de l'écosystème.

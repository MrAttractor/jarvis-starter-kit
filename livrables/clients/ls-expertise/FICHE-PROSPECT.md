# Fiche prospect — LS EXPERTISE (LS Xpertise)

> Source : brief de conception transmis par Mac Arthur le 06/07/2026 + précisions en conversation (partenariat en nature, contact influenceur, ~10 personnes) + **prototype React réel transmis le 06/07/2026** (fichier `App.jsx`, ~500 lignes, déjà fonctionnel). Le prototype confirme une bonne partie des zones d'ombre — mis à jour ci-dessous. Les champs marqués **[FICTIF]** restent du fictif crédible (le prototype lui-même l'indique : "Prototype V1 · Données fictives").
>
> **Confirmé par Mac Arthur le 06/07/2026** : le contact influenceur est bien **Lyle Soboro** (CEO du prototype, référence "stratégie de vente sur Facebook" déjà citée dans le skill `community-manager`). Identité qualifiée.
>
> **Recherche web du 06/07/2026** : Lyle Soboro est un consultant et formateur marketing/vente agréé NEPAD, auteur de "Le Marketing C'Simple" (Tome 1 et 2), présenté comme spécialiste reconnu du marketing digital/social au-delà des frontières de la Côte d'Ivoire, à l'échelle de la région Afrique de l'Ouest. Présence active multi-plateformes : YouTube (@lylesoboro939), TikTok (@lylesoboro), Instagram (@lyle_soboro), Facebook, LinkedIn — profil LinkedIn indique "Expert marketing chez L.S expertiz" (confirme le nom réel de la structure, cohérent avec "LS Xpertise" du prototype). Chiffres d'audience exacts non récupérables par recherche web (plateformes protégées) — à demander directement à Lyle pour le protocole. Sources : [LinkedIn](https://ci.linkedin.com/in/lyle-soboro-115188382), [YouTube](https://www.youtube.com/@lylesoboro939/about), [TikTok](https://www.tiktok.com/@lylesoboro), [Instagram](https://www.instagram.com/lyle_soboro/), [Facebook](https://www.facebook.com/lyle.soboro/).
>
> Reste à obtenir directement auprès de lui : chiffres d'audience réels par plateforme, clients actuels de son agence, outil utilisé aujourd'hui.

---

## Identité

- **Prénom du client** : **Lyle Soboro** (CEO, confirmé le 06/07/2026 comme contact influenceur)
- **Contact confirmé (06/07/2026)** : +225 07 16 85 64 66 — Abidjan, Côte d'Ivoire
- **Marque / activité** : LS EXPERTISE (variantes rencontrées : "LS Xpertise" dans le prototype, "L.S expertiz" sur LinkedIn — même structure) — agence de gestion de réseaux sociaux avec équipe de tournage terrain (~10 personnes : 3 cadreurs, 1 social media manager, 1 commercial, 1 assistante administrative + direction)
- **Secteur précis** : gestion de comptes TikTok/Facebook pour des marques et PME (pas une agence de production vidéo généraliste — le métier réel est plus précis que le brief initial ne le laissait penser) : community management + tournages terrain + suivi de conformité contractuelle (quota de publications/mois)
- **Source de la fiche** : brief de conception (06/07/2026) + **prototype React fonctionnel transmis le 06/07/2026**, déjà structuré en 2 rôles (CEO / Cadreur)

---

## 1 — Identité & marque

- Palette confirmée par le prototype (pas fictive) : navy #0E1650, bleu #1E2FA8, or #F5C518 — identité "premium/nocturne", cohérente avec un positionnement agence sérieuse
- Typo : Poppins
- Ton de communication : direct, orienté performance (KPIs, scores, conformité contractuelle affichés partout)
- **Décision design (06/07/2026)** : Mac Arthur n'aime pas le rendu actuel du prototype transmis par Lyle. Choix tranché : on garde l'identité propre de LS Expertise (navy/or, univers premium/nocturne) plutôt que de basculer sur le design system Attractor (orange/vert/sable) — c'est son outil, sa marque. Défauts à corriger dans la vraie maquette : toutes les icônes emoji (🏠📊🎬🔔 etc., une quinzaine dans le prototype) remplacées par du SVG line-art maison (règle déjà actée sur tous les livrables, jamais respectée ici car le fichier vient tel quel du prototype de Lyle), mise en page retravaillée avec la rigueur habituelle des maquettes livrées.

## 2 — Le client de mon client

*Les clients de LS Xpertise — confirmés par le prototype, pas fictifs dans leur structure (les noms d'entreprise restent des exemples) :*

- Qui ils sont : marques et PME ivoiriennes tous secteurs (tech, e-commerce, beauté, immobilier dans l'exemple) qui délèguent leur présence TikTok/Facebook
- Ce qu'ils achètent réellement : un **quota de publications mensuel contractuel** par plateforme (ex. 16 posts TikTok/mois, 20 Facebook/mois) — LS Xpertise est jugée sur le respect de ce quota, pas juste sur la qualité
- Indicateurs suivis par client : abonnés, publications réalisées vs contractuelles, vues/portée, taux d'engagement
- Contrainte métier confirmée : missions de tournage terrain avec contact sur place, créneau horaire précis, risque d'échec (client absent, matériel défaillant, accès refusé) — donc un vrai enjeu logistique, pas seulement éditorial

## 3 — Le quotidien de mon client

*LS Xpertise / Lyle Soboro — confirmé en grande partie par la structure même du prototype :*

- Ce qui est déjà modélisé (donc déjà identifié comme prioritaire par Lyle/l'équipe) : suivi de conformité contractuelle par client et par plateforme, planning des missions de tournage par cadreur avec gestion des échecs justifiés, pipeline commercial à 3 étapes (Contact → Qualifié → Closing) avec score de qualification, masse salariale et présence de l'équipe
- Ce qui manque encore dans le prototype vs le brief initial (angles morts confirmés, cf. `CONCEPTION-DMV.md` section 7) : Administration (contrats/factures/paiements), Community Management distinct (programmation/publication/modération), espace/portail pour les clients finaux de LS Xpertise (TechVision CI etc. n'ont pas leur propre vue), gestion documentaire versionnée
- Volume réel confirmé : équipe de 5 dans le prototype (3 cadreurs + 1 social media manager + 1 commercial, direction Lyle en plus) — cohérent avec "~10 personnes" si on compte au-delà de ce sous-ensemble modélisé
- **Résolu (06/07/2026) — gestion d'équipe en libre-service** : décision de Mac Arthur — on ne demande pas la liste réelle des utilisateurs en amont. L'app livre le cadre (système d'invitation + rôles) et Lyle renseigne/crée lui-même son équipe après livraison. Voir `CONCEPTION-DMV.md` section 2bis pour l'implication architecturale (système multi-utilisateurs par tenant, pas le gabarit standard mono-propriétaire du Générateur d'Apps Métier).
- **Rôle confirmé — Assistante administrative** : Lyle travaille étroitement avec une assistante administrative. Rôle réel, couvre le module Administration (contrats, factures, paiements) — avancé à l'Étape 1 du phasage en conséquence.
- Moyens de paiement : non pertinent ici — l'outil est un usage interne agence, pas une boutique e-commerce

## 4 — Proposition commerciale

*Pas de prix : partenariat en nature (cf. `CONCEPTION-DMV.md` section 0bis).*

- Contrepartie : LS EXPERTISE utilise l'outil en conditions réelles et produit du contenu vidéo pour attirer des prospects vers l'agence Mr Attractor
- Scope retenu pour cette maquette : Étape 1 du phasage (socle pipeline + espace client documentaire + dashboard Direction basique)
- **Décision du 06/07/2026 — construction en parallèle du closing** : Mac Arthur a choisi de construire la vraie Étape 1 (backend réel, pas une maquette) en parallèle de l'envoi devis/protocole, signature + encaissement prévus pendant l'appel de cette semaine, avec l'objectif que Lyle commence à exploiter l'outil séance tenante. Scope jour 1 retenu : connexion réelle (email OTP) + dashboard + pipeline commercial branchés sur Supabase, le reste (cascade d'invitation équipe, module Administration, espace client documentaire) suit dans les jours qui suivent.
- **Socle réel livré et vérifié le 06/07/2026** : tables `lsx_equipe_membres`/`lsx_clients`/`lsx_dossier_transitions` + RLS + fonction `lsx_claim_invite()` sur le projet Supabase partagé (`livrables/clients/ls-expertise/supabase-schema.sql`). Vérification end-to-end faite avec 2 comptes de test réels (claim, lecture/écriture RLS, isolation d'un compte non invité) — 2 bugs réels détectés et corrigés en cours de route (retour ambigu du claim, récursion infinie RLS). Déployé sur `demo.agenceattractor.com/ls-expertise`.
- **Session du 06/07/2026 (soir)** : bug crash corrigé (variable `role` indéfinie, plantait le dashboard Direction). Écrans réels construits pour les 5 rôles non-direction (Commercial, Administration, Production, Social Media Mgmt, Community) — anticipe une partie de l'Étape 2 sur décision de Mac Arthur. 3 nouvelles tables Supabase + RLS. Build vérifié et déployé sur `demo.agenceattractor.com/ls-expertise`.
- **Débloqué (06/07/2026, plus tard dans la soirée)** : vrai email de Lyle obtenu (`soborolyle@gmail.com`). Ligne Direction basculée sur cet email (`user_id` remis à null, statut repassé à "invité" en attendant sa première connexion réelle). Lyle peut désormais se connecter lui-même et inviter son équipe — plus besoin de passer par le compte de test de Mac Arthur.

---

## Statut de personnalisation

- [x] Maquette construite (données fictives crédibles — identité, palette, clients de LS EXPERTISE)
- [ ] Présentée / validée par le contact LS EXPERTISE
- [x] Socle réel (auth + pipeline) construit et vérifié — reste à brancher l'email réel de Lyle
- [x] PDF envoyé (synthèse produite, adaptée au deal partenariat)

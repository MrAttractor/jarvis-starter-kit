# Nabycook — Site web · Découpage en 3 phases

> Cahier des charges Nabintou (16/07/2026) réinterprété sur la **stack maison Attractor**, pas WordPress.
> Objectif dur : site opérationnel pour le **forum des associations du 5 septembre 2026** (mise en ligne visée 1er sept).
> Domaine : nabycook.com (déjà réservé). Charte Adinkra v2.0 (vert profond #0E3D14, vert anis #C3D94F, terracotta #C8703D, or #D4A24C, crème #F7F2E7 ; Pacifico + Poppins).

---

## Substitution de stack (vs le CDC)

| Besoin du CDC | Solution WordPress prévue | Notre solution maison |
|---|---|---|
| Site + pages | WordPress + Elementor | HTML/CSS sur-mesure, charte Adinkra, déployé **Cloudflare Pages** (pattern demo-site / air-cote-divoire) |
| Autonomie de Nabintou (éditer ateliers, articles, chiffres) | CMS WordPress | **Mini back-office Supabase gaté (OTP email)** — pattern déjà validé (getwinworld/admin, armee-du-seigneur/admin) |
| Réservations / devis / partenariats | 3 formulaires Jotform | **Inchangé** : embed Jotform stylé aux couleurs Nabycook (IDs déjà fournis) |
| Boutique épicerie | SumUp Store | **Inchangé** : liens/boutons vers nabycook.sumupstore.com |
| Adhésions / dons | HelloAsso | **Inchangé** : boutons + QR HelloAsso |
| Emailing / newsletter | Brevo | **Inchangé** : formulaire connecté Brevo |
| Preuve sociale | Widget Instagram | **Inchangé** : embed du flux |

Le dev lourd se réduit à la **coquille éditoriale + le back-office ateliers/articles**. Tout le transactionnel reste externalisé, donc zéro dette et zéro gestion de stock à dupliquer.

---

## PHASE 1 — Le socle institutionnel *(livrable pour le forum, deadline dure 1er sept)*

Ce qui permet à Nabycook **d'exister et d'être crédible** au forum. Couvre les priorités 1 (notoriété/légitimité) et 2 (financement). C'est le cœur « association qui vend, pas boutique qui fait de l'associatif ».

**Pages**
- **Accueil** : hero immersif (photo/vidéo atelier) + tagline, 3 accès rapides, bandeau « Ils nous font confiance », flux Instagram
- **L'Univers Nabycook** : histoire de Nabintou, archétype Magicienne/Soignante, mission anti-gaspi + héritage ouest-africain
- **L'Association & l'Impact** : statut Loi 1901 / ESS, chiffres d'impact, logos partenaires, revue de presse, CTA adhésions
- **Adhésions** : Nabycook'r (50€/an) + La Brigade du cœur (prix libre dès 20€/an), boutons + QR HelloAsso, témoignages
- **Contact & Partenariats** : formulaire contact + embed Jotform « partenaire magasin » (ID 261936933539066)

**Technique** : charte Adinkra complète, logo HD, mobile-first, HTTPS, déploiement Cloudflare Pages sur nabycook.com. Chiffres d'impact et partenaires **déjà éditables via le back-office** (fondation Supabase posée dès la phase 1).

**Bloquant côté Nabintou** : logo vectoriel/HD (le fichier actuel est un JPG raster sur fond blanc), textes finaux de l'histoire, chiffres d'impact précis, liste des partenaires, accès registrar nabycook.com.

---

## PHASE 2 — La conversion *(le moteur commercial, idéalement avant le 1er sept)*

Ce qui fait **vendre** — priorité 3, en soutien discret. C'est ici que le back-office Supabase prend tout son sens (calendrier d'ateliers que Nabintou met à jour seule).

**Pages**
- **Les Ateliers** : calendrier des prochains ateliers (table Supabase, éditable par Nabintou), fiche atelier type (thème, durée, tarif, lieu, places restantes), embed Jotform réservation « atelier RSE » (ID 261937095223056), bloc Privatisation / Team building entreprises
- **Traiteur & Événements** : présentation offre + embed Jotform devis traiteur (ID 261936674164062)
- **L'Épicerie Nabycook** : 3 gammes (Le Point Doux : Box Pause 30€/Équipe 55€/Réunion 80€ · Bixane · Les Sels du Marché), cadre éditorial « édition limitée / en soutenant Nabycook vous financez… », liens fiches SumUp

**Technique** : back-office ateliers (CRUD Supabase gaté OTP), Jotform stylés, cartes produits reliées à SumUp. Pas de WooCommerce (réévaluable en V2 si le volume le justifie).

---

## PHASE 3 — Le contenu vivant, l'autonomie et la conformité *(consolidation, peut déborder en septembre)*

Ce qui fait **durer** le site et rend Nabintou autonome après la livraison.

- **Le Journal de Bord** : blog anti-gaspi + recettes de saison + coulisses, back-office articles Supabase, fiches recettes pas-à-pas, SEO-friendly
- **CMS complet** : édition autonome des ateliers, articles, chiffres d'impact et partenaires via le back-office Supabase
- **Conformité RGPD** : bandeau cookies, mentions légales, politique de confidentialité
- **SEO on-page** : balises Hn sémantiques, alt sur toutes les images, sitemap XML, URLs propres
- **Performance** : images WebP, cache, cible < 2,5 s
- **Handover** : formation 1h + guide d'utilisation écrit du back-office, transmission des accès

---

## Note de cadrage à trancher (rappel)

Le deal signé (16/07) = partenariat DMV **3 vidéos 350 € + site vitrine offert**. Ce CDC (9 pages + back-office + formation) dépasse un « site vitrine ». Proposition de répartition à valider avec Nabintou par avenant écrit :
- **Phase 1** = le « site vitrine offert » du DMV (socle institutionnel présentable au forum)
- **Phases 2 & 3** = prestation additionnelle facturée (moteur commercial + CMS + contenu + formation)

À arbitrer avant de lancer la production.

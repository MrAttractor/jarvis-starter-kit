# Nabycook — l'état du dossier

> Révision du 22/09/2026. **Cette fiche est la première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | **site en production sur `nabycook.com`, mais pas annonçable** |
| Dernier contact | **2026-09-22 : les 3 vidéos sont tournées et livrées. Elle accepte de tourner une vidéo témoignage pour le site de l'agence, à la demande** (confirmé par Mac Arthur) |
| Prochaine action | **1.** Lui fournir son tableau de bord. **2.** Lui demander sa vidéo témoignage et les 4 chiffres du bloc 6 (`refonte-site-agenceattractor/BLOC-6-PREUVE.md` §7). **3.** Réclamer le solde de 150 € |
| Échéance | forum du 5 septembre 2026 cité dans sa liste d'éléments |
| Argent en attente | **150 €**. Elle a réglé **200 €** en deux versements de 100 € ; solde de 150 € sur les 350 € du partenariat (au 22/09/2026) |

## En une phrase

Le site est **en production sur son domaine `nabycook.com`** depuis le 13/08, mais
**quatre défauts empêchent de l'annoncer** (pas de page 404, `noindex` encore posé,
aucune balise de partage, pas de `robots.txt`). **Les 3 vidéos, seule partie facturée,
sont tournées et livrées** (22/09/2026). Reste dû par l'agence : **son tableau de bord**.

## Ce qui bloque, des deux côtés

**Côté agence, avant de pouvoir annoncer le site :**
1. Une vraie page 404. Aujourd'hui l'accueil est servi en **code 200** sur toute adresse inconnue.
2. Retirer le `noindex` des 5 pages publiques, le garder sur `admin.html`.
3. Les balises `og:` et le `canonical` vers `www.nabycook.com`. Sans elles, ses liens WhatsApp s'affichent nus, sur un dossier qui vit du bouche-à-oreille.
4. `robots.txt` et `sitemap.xml`, avec l'espace d'administration désindexé.
5. Ouvrir le site **sur un vrai téléphone** (R-51), jamais fait à ce jour.
6. Lui fournir son tableau de bord.

**Côté cliente :**
- ~~Les 3 vidéos promotionnelles~~ : **tournées et livrées, confirmé le 22/09/2026.**
- Sa charte éditoriale, citée le 31/07 et jamais transmise.

**Point d'argent, au 22/09/2026.** Elle a réglé **200 €**, en deux versements de 100 €.
**Il reste 150 €** sur les 350 € du partenariat.

La règle SOP était d'encaisser l'acompte **avant** de tourner. Les vidéos ont été tournées
et livrées avec 200 € encaissés sur 350. Le solde est donc réclamé **après** livraison, ce
qui est une position plus faible qu'avant. Ce n'est pas un incident, la relation est bonne
et elle a payé en deux fois d'elle-même : c'est noté pour le prochain dossier, pas pour
celui-ci.

## Contrepartie ouverte, et elle est précieuse (22/09/2026)

**Nabintou accepte de tourner une vidéo témoignage pour le site de l'agence, à la demande
de Mac Arthur.** C'est la preuve la plus forte dont l'agence dispose : son accompagnement
2023-2026 est le seul parcours long et abouti du portefeuille, et il est documenté dans
`livrables/commercial/refonte-site-agenceattractor/BLOC-6-PREUVE.md`.

Ce qu'il faut obtenir avec, et qu'une vidéo seule ne donne pas : **les quatre chiffres
avant/après** du §7 de ce document. Une vidéo sans chiffres reste un compliment.

## L'infrastructure, à ne pas réapprendre

| | |
|---|---|
| Domaine | `nabycook.com`, acheté par elle chez **Infomaniak** le 04/06/2026, à son nom |
| Zone DNS | **laissée chez Infomaniak**, jamais déplacée, pour ne pas mettre sa messagerie en jeu |
| Site | `CNAME www` vers le projet Cloudflare Pages **`nabycook`**, branche de production **`main`** |
| Adresse courte | redirection **301** vers `www.nabycook.com`, qui est l'adresse canonique |
| Messagerie | MX Infomaniak, SPF, DKIM, **DMARC en `p=reject`**, plus deux DKIM Brevo. Intacte, vérifiée après bascule |
| Piège | le formulaire de redirection d'Infomaniak coche par défaut « rediriger également le sous-domaine www » : boucle infinie et écrasement du CNAME. Voir **R-73** |
| Déploiement | **jamais depuis le dossier `site/`** : son `README.md` interne était publiquement lisible. Copier les fichiers publics à part. Voir **R-70** |

## Le client

**Nabintou Dosso**, Paris. nabycook@gmail.com, +33 7 46 45 71 48.

**C'est une association loi 1901 de l'économie sociale et solidaire, pas une
consultante.** Le vocabulaire compte dans ce dossier, elle l'a corrigé elle-même le
31/07. Activité : ateliers culinaires B2C et RSE en entreprise, traiteur événementiel,
épicerie fine artisanale. Positionnement « magicienne, soignante ».

Sa douleur, dite par elle : elle sait cuisiner, elle ne sait pas se vendre (« écrire
des offres, faire la promotion »).

## L'argent

Partenariat DMV, pas une vente au prix fort.

| | |
|---|---|
| Vrai coût du travail | 1 300 € |
| Prix partenariat | **350 €** pour 3 vidéos promotionnelles |
| Site vitrine | **offert**, en échange de promotion active dans son réseau et de l'autorisation de communiquer sur le cas |
| Acompte 50 % prévu | **175 €**, facture `ATR-2026-0012-A` |
| **Réglé au 22/09/2026** | **200 €**, en deux versements de 100 € |
| **Solde dû** | **150 €** |

**Règle SOP, non tenue sur ce dossier :** encaisser l'acompte avant de tourner. Les vidéos
sont parties avec 200 € encaissés sur 350. À tenir sur le prochain dossier.

## Ce qui fait foi

| Document | Fichier |
|---|---|
| Cahier des charges v2 | `CDC-NABYCOOK-v2.html` |
| Devis | `DEVIS-ATR-2026-0012-Nabycook` (html + pdf) |
| Facture d'acompte | `FACTURE-ATR-2026-0012-A-Nabycook` (html + pdf) |
| Découpage du site | `PHASAGE-SITE.md` |
| Ce qu'elle doit fournir | `ELEMENTS-A-FOURNIR.md` |
| Code du site | `site/` (5 pages, aussi déployé sur le demo-site) |

## Prochaine action

**La balle est revenue dans notre camp** pour l'essentiel. Ce qui reste, dans l'ordre :

1. **Les photos et le logo HD.** Ils sont dans son Drive (dossier « SITE NABYCOOK »),
   pas encore dans le dépôt. Le site les affiche dès qu'ils sont posés dans
   `site/assets/photos/`, sans autre intervention.
2. **Les trois liens HelloAsso à ouvrir une fois**, depuis un téléphone. Ils viennent
   de son document et sont branchés sur les boutons d'adhésion, mais HelloAsso bloque
   les vérifications automatiques : personne ne les a encore vus s'ouvrir.
3. **Deux accords de partenaires à confirmer** avant de les afficher : GAB Île-de-France
   (case laissée vide) et EE (« demander au président »). Ils sont volontairement
   absents du site tant que ce n'est pas confirmé.
4. Le **nom de domaine** nabycook.com, à sa charge et à son nom, puis la décision de
   sortir du mode maquette.

Encore attendus d'elle, sans bloquer : témoignages, revue de presse, formulaire Brevo,
composition du bureau, charte éditoriale.

Et côté agence : **réclamer le solde de 150 €**, et lui fournir son tableau de bord.

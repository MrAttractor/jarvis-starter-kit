# Nabycook — l'état du dossier

> Révision du 17/08/2026. **Cette fiche est la première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | **site en production sur `nabycook.com`, mais pas annonçable** |
| Dernier contact | **2026-08-19 : elle demande si elle peut verser une seconde tranche (le solde) dans les jours à venir** |
| Prochaine action | **Lui fournir son tableau de bord**, et relancer sur les 3 vidéos |
| Échéance | forum du 5 septembre 2026 cité dans sa liste d'éléments |
| Argent en attente | **175 € d'acompte, toujours pas encaissés** |

## En une phrase

Le site est **en production sur son domaine `nabycook.com`** depuis le 13/08, mais
**quatre défauts empêchent de l'annoncer** (pas de page 404, `noindex` encore posé,
aucune balise de partage, pas de `robots.txt`). En face, **les 3 vidéos qui sont la
seule partie facturée ne sont pas tournées**, et **l'agence lui doit son tableau de
bord**.

## Ce qui bloque, des deux côtés

**Côté agence, avant de pouvoir annoncer le site :**
1. Une vraie page 404. Aujourd'hui l'accueil est servi en **code 200** sur toute adresse inconnue.
2. Retirer le `noindex` des 5 pages publiques, le garder sur `admin.html`.
3. Les balises `og:` et le `canonical` vers `www.nabycook.com`. Sans elles, ses liens WhatsApp s'affichent nus, sur un dossier qui vit du bouche-à-oreille.
4. `robots.txt` et `sitemap.xml`, avec l'espace d'administration désindexé.
5. Ouvrir le site **sur un vrai téléphone** (R-51), jamais fait à ce jour.
6. Lui fournir son tableau de bord.

**Côté cliente :**
- **Les 3 vidéos promotionnelles.** C'est la partie facturée du deal (350 €), et rien n'est tourné.
- Sa charte éditoriale, citée le 31/07 et jamais transmise.

**Règle à tenir, rappelée :** encaisser les **175 €** avant de tourner. Elle vient du
réseau personnel, la règle vaut quand même.

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
| Acompte 50 % | **175 €**, facture `ATR-2026-0012-A` |

**Règle à tenir : encaisser les 175 € AVANT de tourner.** C'est la règle SOP, elle vaut
aussi pour le réseau personnel. À vérifier avant toute production.

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

Et côté agence : encaisser les 175 € avant de tourner les vidéos.

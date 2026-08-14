# Barème ATTRACTOR (source de vérité tarifaire)

> Grille de référence pour produire les devis. Quand Mac Arthur envoie des infos brutes, on classe le besoin dans une famille, on applique le tarif, on ajoute les add-ons. Les prix ci-dessous sont la référence unique : en cas de contradiction avec le site ou une ancienne grille, c'est CE fichier qui fait foi.
>
> **⚠️ Synchronisation manuelle obligatoire** : ce barème est aussi dupliqué en dur dans `livrables/ecosysteme-attractor/attractor-assists/app/supabase/functions/generate-devis/index.ts` (constante `BAREME_SYSTEM`), utilisé par l'auto-devis Claude du Pilotage (`demo.agenceattractor.com/pilotage`). **Si tu modifies ce fichier, reporte le même changement dans `generate-devis/index.ts`**, sinon l'auto-devis appliquera un barème obsolète.

## Identité (bas de devis)

- **Agence Mr Attractor** — Mac Arthur KOUASSI
- Statut : micro-entreprise
- SIRET : 98377125400015 (immatriculée le 01/02/2024)
- Email : myattractor1@gmail.com — Tél : +33 7 53 90 23 23 — agenceattractor.com
- Mention légale obligatoire : **TVA non applicable, article 293 B du CGI**

## Moyens de paiement

- **Côte d'Ivoire / Afrique** : Wave, Djamo, MTN Money, (+225 05 76 87 70 70)
- **Europe / France** : PayPal @Myattractor, Wero / Revolut (+33 7 53 90 23 23)

## Devise par zone

- **FCFA en premier, équivalent EUR ensuite** — la cible principale est en Côte d'Ivoire. Toujours présenter le prix ainsi : "150 000 FCFA (≈ 220 €)".
- Diaspora / France : EUR reste la devise de facturation réelle.
- Côte d'Ivoire : FCFA reste la devise de facturation réelle.
- Taux de conversion : 1 EUR ≈ 655,957 FCFA, arrondir proprement.

## URSSAF & marge (règle de prix, ne JAMAIS mettre sur le devis)

- L'URSSAF (cotisations sociales, **~22 % du chiffre d'affaires**) est la charge du prestataire, **pas** celle du client. Elle **ne figure jamais** comme ligne d'un devis ou d'une facture (contrairement à la TVA, elle aussi absente ici via l'art. 293 B).
- **Elle doit être intégrée dans le prix.** Sur chaque paiement client, ~22 % partent à l'URSSAF. Pour réellement « garder » 100 €, il faut facturer ~130 €. Les prix du barème sont pensés pour absorber cette charge : ne pas descendre en dessous sans conscience de la marge nette (net ≈ 78 % du prix, avant frais d'outils).
- S'applique à tous les clients (France comme CI) : le CA compte pour l'URSSAF quelle que soit l'origine du paiement.
- Réflexe cockpit : à chaque encaissement, le coach (`coach-repartition`, param `urssaf:true`) met 22 % en réserve URSSAF avant toute épargne.

## Famille A — App métier sur mesure (grille produit, confirmée 10/07/2026)

Composantes récurrentes d'une app métier : **vitrine** (e-commerce, choix du produit directement ou demande type essayage/RDV), **tableau de bord** (autonomie mise en ligne des articles + suivi stock + chiffre d'affaires), **lien livreur** (voit contact + coordonnées du client + jour de visite).

| Niveau | Pour qui / périmètre | Prix (setup) |
|--------|----------------------|--------------|
| **App simple** | Vitrine + traitement des commandes. Vitrine connectée à un tableau de bord basique. **Hébergement 1 an offert.** | 165 000 FCFA / **250 €** |
| **App pro** | Vitrine + traitement des commandes + lien de suivi (livreur) + visibilité stock. | à partir de 320 000 FCFA / **490 €** |
| **App pro+** | Multi-utilisateurs (équipe + administration générale), base de données pro, assistance (rapports, messagerie, etc.). | à partir de 790 000 FCFA / **1 200 €** |

Abonnement / maintenance : App simple = hébergement 1 an offert, puis maintenance à définir ; App pro / pro+ = maintenance mensuelle selon périmètre. Ne pas oublier d'activer le MRR à la livraison (SOP).

Ancrage de référence : **J'Envoie Express, GetWinWorld, C'Real**. Partenariat par échange (DMV) : forfait technique symbolique 80 €/50 000 FCFA seul, cf. règle des rabais volontaires ci-dessous.

## Famille B — Consulting Méthode ATTRACTOR

| Offre | Prix | Format |
|-------|------|--------|
| STARTER | 100 000 FCFA / 150 € | Un document (diagnostic + reco), **livré sous 48h** |
| RUNNER | 230 000 FCFA / 350 € | Un dossier de structuration marketing, **livré sous 72h** |
| EAGLE | 525 000 FCFA / 800 € | Accompagnement : **volume de 10h à répartir sur 2 mois max**, en séances planifiées avec le client |
| CONSEIL | 80 000 FCFA/h / 120 €/h | À la demande, tarif horaire standard |
| CONSEIL — Entrée découverte | 52 000 FCFA / 80 € | **1 heure unique** pour traiter LE point le plus urgent du prospect (au lieu de 120 €). Porte d'entrée à faible engagement : un prospect indécis commence petit, sur sa vraie douleur, et l'agence prouve sa valeur en une séance. Ne pas proposer à un prospect déjà closé sur un package (ça lui ouvre une porte de sortie). |

> **Attention cohérence des formats** : 48h et 72h (Starter/Runner) sont des **délais de livraison** d'un livrable one-shot ; les 10h d'Eagle sont un **volume horaire d'accompagnement** (pas un délai). Ne jamais les présenter côte à côte comme s'ils étaient comparables (ex. "48h / 72h / 10h" est ambigu et fait croire à tort que 10h < 72h). Décrire chaque palier par ce qu'il est.

## Famille B bis — Parcours de consultance en 3 phases (05/08/2026)

> Méthode arrêtée le 05/08/2026, détaillée dans `livrables/ecosysteme-attractor/METHODE-CONSULTANCE.md`.
> À ne pas confondre avec la Famille B ci-dessus : STARTER, RUNNER et EAGLE sont trois offres
> **alternatives** (le client en choisit une). Ici, ce sont trois phases **séquentielles**, chacune
> conditionnée à la validation de la précédente.

| Phase | Livrable | Prix | Accompagnement inclus |
|---|---|---|---|
| **1. Vision stratégique** | Le plan d'action stratégique | **230 000 FCFA / 350 €** | 4 h de séances |
| **2. Plan tactique** | Le business model et le plan d'action opérationnel | **525 000 FCFA / 800 €** | 10 h de séances |
| **3. Suivi opérationnel** | Le pilotage tenu, un accès par acteur | **mensuel, voir ci-dessous** | selon le niveau |

**D'où viennent les prix des phases 1 et 2.** Ils sont calés sur la Famille B existante, pas
inventés : la phase 1 reprend le prix RUNNER (dossier structuré, 350 €), la phase 2 reprend le
prix EAGLE (accompagnement de 10 h, 800 €). EAGLE implique un tarif de 80 €/h en formule, contre
120 €/h à la carte : c'est l'écart de référence de l'agence entre le cadré et le ponctuel.

### Phase 3 — abonnement mensuel `[À VALIDER]`

| Niveau | Prix mensuel | Séances par mois | Accès acteurs | Inclus |
|---|---|---|---|---|
| **Suivi Essentiel** | **100 000 FCFA / 150 €** `[À VALIDER]` | 1 séance (1 h) | 3 | Registre des décisions tenu à jour |
| **Suivi Actif** | **165 000 FCFA / 250 €** `[À VALIDER]` | 2 séances (2 h) | 8 | + point de pilotage écrit chaque mois |
| **Suivi Premium** | **295 000 FCFA / 450 €** `[À VALIDER]` | 4 séances (4 h) | illimités | + alerte et arbitrage sous 48 h |

> **Aucun tarif récurrent de conseil n'existait au barème.** Ces trois montants sont des
> propositions calées sur la cohérence de la grille (80 €/h en formule, plus l'outil et le
> reporting), pas des prix déjà pratiqués. Mac Arthur tranche, puis on retire la mention.
>
> **La phase 3 est la seule ligne récurrente du conseil**, donc la seule qui construise du revenu
> le mois suivant. Un devis de consultance sans phase 3 présentée est un devis incomplet, au même
> titre qu'un devis Famille A sans ligne MRR.

**Durée d'engagement minimale : 3 mois**, puis reconductible au mois. Sans durée minimale, le
suivi s'arrête au premier mois creux et le plan retombe.

### Les trois parcours à présenter

Le devis montre toujours les trois, même si le client n'achète que le premier.

| Parcours | Contenu | Prix |
|---|---|---|
| **Cap** | Phase 1 seule | 230 000 FCFA / **350 €** |
| **Trajectoire** | Phases 1 et 2 | 755 000 FCFA / **1 150 €** |
| **Pilotage** | Phases 1 et 2 + premier mois de Suivi Actif | 920 000 FCFA / 1 400 €, **remise volume 20 % appliquée → 735 000 FCFA / 1 120 €**, puis 165 000 FCFA / 250 € par mois |

> **Point de vigilance à arbitrer.** La remise volume de 20 % ne se déclenche qu'au-dessus de
> 1 200 €. Trajectoire est à 1 150 €, donc juste en dessous, tandis que Pilotage tombe à 1 120 €
> après remise. **Le parcours complet coûte donc moins cher que le parcours intermédiaire.**
> C'est un levier redoutable vers le revenu récurrent, mais un client attentif y verra une
> incohérence de grille. Deux sorties : assumer l'effet et pousser Pilotage, ou remonter la
> phase 2 pour que Trajectoire passe le seuil et bénéficie aussi de la remise. À trancher.

### Règles propres à la consultance

- **Le chef de projet est compris dans chaque phase, jamais facturé à part.**
- **On ne vend jamais les trois phases d'un bloc à un client neuf** : on vend la phase 1, on la livre, la suite se vend sur la preuve.
- Chaque phase se conclut par un livrable validé et signé. Pas de validation, pas de phase suivante.
- Le nombre de séances de chaque phase figure en toutes lettres au devis. Au-delà : tarif CONSEIL 120 €/h.
- Toute demande hors périmètre : 150 €/h, comme partout ailleurs au barème.
- Ne pas facturer une mission de conseil là où il n'y a qu'une prestation d'exécution, et ne pas livrer du conseil gratuitement là où il y en a une.

## Famille C — Attractor Assists (abonnement)

Modèle **freemium** : l'app est gratuite avec des limitations d'usage. La progression via le coaching privé crée l'envie de rester. Les utilisateurs paient pour continuer à progresser. **Tarifs définitifs à fixer lors de la refonte de l'app** (ne pas chiffrer un devis Assists tant que ce n'est pas tranché).

## Famille D — Partenariat Performance (mise en place + mensuel + commission)

Pour un client avec un business déjà existant et mesurable (comptabilité, CA/bénéfice suivi), où la mission de l'agence est une transformation stratégique/digitale dont l'impact doit se voir sur la rentabilité, pas seulement sur des livrables.

**Modèle de référence : Beracca Mastery Group** (ERP agro-distribution) —
- Mise en place : 100 000 FCFA / 150 €
- Mensuel : 100 000 FCFA / 150 €
- Commission : **10% sur le bénéfice réalisé au-dessus de la moyenne des 3 derniers trimestres** (jamais sur le CA brut — toujours sur le delta de bénéfice vs une moyenne mobile de référence)

Quand l'utiliser : le prospect a une activité physique/commerciale établie avec des chiffres vérifiables, et accepte un alignement sur la performance plutôt qu'un forfait fixe intégral. Adapter la période de référence (3 trimestres par défaut) et le taux de commission (10% par défaut) selon la taille du deal, mais toujours documenter clairement la base de calcul dans le contrat pour éviter toute ambiguïté au moment de facturer la commission.

À appeler en premier réflexe dès qu'un nouveau prospect ressemble à ce profil (business établi, chiffres suivables) — ne pas repartir de zéro sur la structure du deal.

## Remise volume — automatique au-dessus de 1 200 €

**Tout devis dont le total dépasse 1 200 € (ou l'équivalent FCFA) reçoit automatiquement 20 % de remise** (décidé le 16/07/2026). Objectif : récompenser les gros engagements et faciliter le closing des combos (app + accompagnement + vidéo). La remise s'applique sur le total composé, s'affiche clairement au client (montant barré → montant remisé), et le point d'entrée reste l'acompte de la formule choisie. Câblée dans le devis web interactif (`recompute()` : `total > 1200 → -20 %`).

## Moyens de paiement affichés APRÈS validation (règle UX, 16/07/2026)

Sur le devis web interactif, les moyens de paiement n'apparaissent **jamais avant** : ils s'affichent sur l'écran de confirmation, **une fois le devis validé** par le client. Cohérent avec le principe « l'appel déclenche la demande, le prix ne se montre pas à froid ». Méthodes affichées selon la zone/devise (France : PayPal / Wero / Revolut ; CI : Wave / MTN / Djamo).

## Rabais volontaires — stratégie assumée, pas une erreur

Sur les petits deals Famille A locaux (ex. GetWinWorld, J'Envoie Express), les prix réels sont parfois sous le barème. C'est une décision stratégique assumée : le rabais est compensé par la communication générée (cas clients réels, bouche-à-oreille, réputation, futurs prospects similaires attirés par la preuve). Ne pas "corriger" ces deals a posteriori — mais rester conscient que cette compensation doit être réelle (le deal doit effectivement générer de la com/des références), sinon c'est du rabais perdu.

## Service Vidéo — Mr Attractor Films (studio maison)

Prestations vidéo pro (tournage 4K, 1 à 2 cadreurs). **Réservé aux projets en Côte d'Ivoire ou en Île-de-France** (tournage sur place). Prix **HT + défraiement** (transport/hébergement/repas selon le lieu). Briefing à valider 72h avant le tournage. Acompte 50 % / solde 50 %.

> **On ne vend pas « une vidéo » mais un accompagnement de lancement, à géométrie variable selon l'ambition du client** : de la production vidéo seule → à la **direction artistique + plan de promotion** → jusqu'au **pilotage complet du lancement** (on orchestre tout). Les packs ci-dessous sont le socle production ; la DA, le plan de promo et le pilotage se chiffrent sur mesure en plus. Toujours présenter la vidéo comme la porte d'entrée d'un lancement piloté, pas comme un livrable isolé.

| Pack | Prix | Détail |
|------|------|--------|
| **Captation / événement / spectacle** | 280 € à 571 € HT | 1 cadreur, tournage + montage, ½ journée, rendu 48h |
| **Film d'entreprise / clip / film promotionnel** | 354 € à 1 405 € HT | 2 cadreurs, tournage + montage + post-prod, 1 journée, interviews + sound design en option, rendu 72h, livraison numérique |
| **Package Créa** (graphisme/branding) | dès 250 € sur devis | identité visuelle, logo, visuels promo réseaux, affiches event, bannières/visuels 1:1 |

Source : `Mr Attractor Films.pdf` (Drive). Contact studio : +33 7 53 90 23 23.

## Add-ons — grille chiffrée (21/07/2026)

> Écrite le 21/07/2026 pour combler le trou n°1 du tunnel : les add-ons étaient tous « à définir », or **ce sont exactement les demandes qui font déborder un périmètre**. Sans grille d'add-ons, impossible de chiffrer un avenant, donc impossible de refuser proprement une demande hors périmètre.
>
> **⚠️ Les montants marqués `[À VALIDER]` sont des propositions calées sur la cohérence de la grille, pas des prix déjà pratiqués. Mac Arthur tranche, puis on retire la mention.**

| Add-on | Prix | Note |
|--------|------|------|
| **Commande WhatsApp (deeplink)** | **inclus** | Déjà dans toutes les apps. Ne jamais le facturer, ne jamais le présenter comme un bonus. |
| **Paiement mobile — lien de paiement** (Wave / Orange Money / MTN) | **60 000 FCFA / 90 €** `[À VALIDER]` | Le client encaisse via son propre lien marchand. Intégration + affichage dans le parcours. |
| **Paiement mobile — API PSP** (CinetPay, XPaye…) | **165 000 FCFA / 250 €** `[À VALIDER]` | Vraie intégration API, webhooks, réconciliation. Frais PSP à la charge du client. |
| **WhatsApp Cloud API** (envoi automatisé) | **230 000 FCFA / 350 €** `[À VALIDER]` | Actuellement au frigo côté agence. Ne pas vendre sans revalider la faisabilité. |
| **Mise en ligne + branchement domaine** | **inclus** (bonus) | Le **coût d'achat du domaine** reste un frais de tiers, refacturé au réel (~12-20 €/an). À dire au client, sinon il croit le domaine offert à vie. |
| **Utilisateur / rôle supplémentaire** au-delà du forfait | **60 000 FCFA / 90 €** `[À VALIDER]` | App simple et App pro = **1 compte admin**. Au-delà, c'est cet add-on ou le passage en App pro+. |
| **Point de vente / boutique supplémentaire** | **60 000 FCFA / 90 €** `[À VALIDER]` | Le cas Ayêla. Chaque point qui a son propre accès est un add-on, pas une variante gratuite. |
| **Reprise de données** (import catalogue > 50 références) | **60 000 FCFA / 90 €** `[À VALIDER]` | En dessous de 50 références, inclus. |
| **Maquette de closing** | **offerte en phase de vente** | C'est un coût d'acquisition, pas un livrable. Facturée **100 000 FCFA / 150 €** uniquement si le prospect veut la maquette sans donner suite. |
| **Module hors périmètre** (après verrouillage du scope) | **150 €/h — 98 000 FCFA/h** | Voir la règle de périmètre ci-dessous. |

### Maintenance mensuelle (MRR) — plus jamais « à définir »

**Grille arrêtée le 21/07/2026.**

| Niveau | MRR | Inclus |
|--------|-----|--------|
| App simple | **23 000 FCFA / 35 €** | Hébergement 1re année offerte, puis ce MRR. Correctifs, disponibilité. |
| App pro | **43 000 FCFA / 65 €** | + sauvegardes, petites retouches de contenu. |
| App pro+ | **65 000 FCFA / 100 €** | + support prioritaire, évolutions mineures. |

> **D'où viennent ces montants, honnêtement.** Ils sont calés sur les seuls chiffres écrits de l'agence : la facture GetWinWorld ATR-2026-0007 (35 €/mois) et la formule supérieure de son closing (65 €/mois), plus l'estimation Ayêla de la session 109 (25 000–50 000 FCFA/mois). **Ce sont des montants facturés ou estimés, jamais encaissés : au 21/07/2026, l'agence n'a encore perçu aucun MRR.** Cette grille est donc une cible à atteindre, pas la description d'une pratique établie. Ne pas la citer à un prospect comme « notre tarif habituel ».
>
> **Le vrai problème n'est pas le montant, c'est l'activation.** Le MRR a toujours été « à définir », donc il n'entrait dans aucun devis, donc il n'était jamais facturé à la livraison. Chiffrer la ligne ne suffira pas : il faut un mécanisme de mise en recouvrement (voir chantier « activation du MRR »).

Le MRR se **présente dans le devis initial**, jamais après la livraison (SOP). Un devis Famille A sans ligne MRR est un devis incomplet.

## Règle de composition des combos (21/07/2026)

> Motif : 100 % des deals réels sont des combos (Yiriba, Beracca, Studio IA, Ayêla, Cabinet DAB). Le barème ne modélisait que des produits isolés, donc chaque deal se recomposait au téléphone et atterrissait sous la grille. Cette règle ferme cette porte.

1. **Un combo = la somme des lignes au barème plein.** On additionne, on ne forfaitise pas à la volée.
2. **Une seule remise s'applique** : la remise volume de 20 % au-dessus de 1 200 €. Pas de dégressivité supplémentaire, pas de remise négociée qui s'ajoute. Si le client négocie encore, on retire une ligne du périmètre, on ne baisse pas le prix.
3. **Plancher absolu : 70 % de la somme des lignes au barème.** En dessous, ce n'est plus un prix, c'est un rabais volontaire : il doit alors être **documenté comme tel dans le devis** (contrepartie écrite et chiffrée, cf. section rabais volontaires). Un rabais sans contrepartie écrite est un rabais perdu.
4. **Le volume d'accompagnement est toujours borné** (voir ci-dessous). Un combo « app + accompagnement » sans nombre d'heures écrit est un combo non chiffrable.

## Volume d'accompagnement inclus — bornage obligatoire

> Motif (Mac Arthur, session 104) : « rien ne borne le volume d'heures que mon style d'accompagnement donne ». C'est la fuite la plus silencieuse de l'agence.

| Niveau | Accompagnement inclus |
|--------|----------------------|
| App simple | **2h** `[À VALIDER]` (prise en main + point à 30 jours) |
| App pro | **4h** `[À VALIDER]` |
| App pro+ | **8h** `[À VALIDER]` |
| EAGLE | **10h** (déjà borné) |

Au-delà du volume inclus : tarif **CONSEIL 120 €/h**. Le volume inclus doit **figurer en toutes lettres dans le devis**. Un accompagnement non chiffré est un accompagnement illimité.

## Règle de périmètre — verrouillage et avenants (21/07/2026)

> Motif : sur 5 devis clients audités (Élévia, Yiriba, Nabycook, Fleur, Ayêla), **un seul** portait des clauses de périmètre. Résultat mesuré : Ayêla = 2 700 à 4 600 € de valeur livrée pour 84 € encaissés ; Élévia = exposition au natif iOS/Android pour 3 500 € sur une clarification seulement orale.

1. **Tout devis porte une section « Ce qui n'est pas inclus ».** Trois lignes minimum : ce qui est V2, ce qui est un frais de tiers (domaine, hébergement au-delà de l'offert, SMS, frais PSP), ce qui déclenche un avenant. Un devis qui ne dit pas ce qu'il ne fait pas dit implicitement qu'il fait tout.
2. **2 rounds de révisions inclus** par phase livrée. Au-delà : **150 €/h**.
3. **Tarif hors périmètre : 150 €/h — au-dessus du tarif conseil (120 €/h), jamais en dessous.** L'ancien 65 €/h du template de contrat était une **incitation inversée** : il facturait le travail non planifié à moitié prix du travail cadré. Se dit très bien au client : « le travail cadré est moins cher parce qu'il est prévisible ».
4. **Aucune exécution hors périmètre sans accord écrit préalable.** Jamais sur la foi d'un appel ou d'un vocal WhatsApp (leçon Élévia, session 91).
5. **Le périmètre s'écrit tant qu'il est encore négociable**, c'est-à-dire dans le devis et l'audit métier, pas après le premier débordement.

> **Note posture** : le client qui demande plus ne ment pas, il **découvre son besoin en utilisant l'outil**. C'est normal et prévisible. La règle n'est donc pas défensive : elle transforme la découverte en avenant facturé au lieu de la laisser en travail absorbé.

## Règles de devis

- **Validité** : 15 jours par défaut.
- **Acompte** : 50 % à la commande, solde à la livraison (ajustable selon le deal).
- **Numérotation** : `ATR-AAAA-NNNN` (incrémental).
- **Section « Ce qui n'est pas inclus » : obligatoire sur tout devis.** Sans elle, le devis n'est pas envoyable (cf. règle de périmètre).
- **Ligne MRR : obligatoire sur tout devis Famille A.**
- **Volume d'accompagnement en heures : obligatoire dès qu'il y a de l'accompagnement.**

## Classification : des infos brutes vers un tarif

À partir des infos brutes, déterminer :
1. **Famille** : besoin d'une app/un système → A ; accompagnement/conseil → B ; assistant IA perso → C (freemium, pas de devis chiffré pour l'instant).
2. **Niveau (Famille A)** :
   - vitrine + traitement des commandes, périmètre simple → **App simple** (250 €)
   - vitrine + commandes + lien de suivi livreur + visibilité stock → **App pro** (dès 490 €)
   - multi-utilisateurs / administration générale / BDD pro + assistance → **App pro+** (dès 1 200 €)
3. **Add-ons** selon les intégrations citées (paiement mobile, WhatsApp, domaine).
4. **Devise** selon la zone (EUR / FCFA).

Si une info manque pour trancher le niveau, poser UNE question ciblée plutôt que de deviner.

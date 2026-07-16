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

## Add-ons (à confirmer avec Mac Arthur)

- Intégration paiement mobile (Wave / Orange Money...) : à définir
- Intégration WhatsApp : à définir
- Nom de domaine + mise en ligne : à définir
- Maintenance mensuelle : incluse dans l'abonnement de la Famille A
- Maquette express : à définir

## Règles de devis

- **Validité** : 15 jours par défaut.
- **Acompte** : 50 % à la commande, solde à la livraison (ajustable selon le deal).
- **Numérotation** : `ATR-AAAA-NNNN` (incrémental).

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

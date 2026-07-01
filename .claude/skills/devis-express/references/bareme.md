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

## Famille A — App / système sur mesure (conception + abonnement)

| Niveau | Pour qui | Setup | Abonnement |
|--------|----------|-------|------------|
| **SOLO** | App simple, 1 utilisateur | 150 000 FCFA / 220 € | 45 000 FCFA / 67 €/mois |
| **ÉQUIPE** | Jusqu'à 5 utilisateurs, workflows partagés | 350 000 FCFA / 520 € | 120 000 FCFA / 180 €/mois |
| **ENTERPRISE** | Multi-utilisateurs, sur mesure | Sur devis, à partir de 500 000 FCFA / 760 € | Sur devis |

Ancrage de référence : **J'envoie Express = SOLO**.

## Famille B — Consulting Méthode ATTRACTOR

| Offre | Prix | Format |
|-------|------|--------|
| STARTER | 100 000 FCFA / 150 € | Cadrage + reco, 48h |
| RUNNER | 230 000 FCFA / 350 € | Structuration marketing, 72h |
| EAGLE | 525 000 FCFA / 800 € | Coaching CEO + pilotage, 10h (séances planifiées avec le client) |
| CONSEIL | 52 000 FCFA/h / 80 €/h | À la demande |

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

## Rabais volontaires — stratégie assumée, pas une erreur

Sur les petits deals Famille A locaux (ex. GetWinWorld, J'Envoie Express), les prix réels sont parfois sous le barème. C'est une décision stratégique assumée : le rabais est compensé par la communication générée (cas clients réels, bouche-à-oreille, réputation, futurs prospects similaires attirés par la preuve). Ne pas "corriger" ces deals a posteriori — mais rester conscient que cette compensation doit être réelle (le deal doit effectivement générer de la com/des références), sinon c'est du rabais perdu.

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
   - 1 utilisateur, périmètre simple → **SOLO**
   - jusqu'à 5 utilisateurs / workflows partagés → **ÉQUIPE**
   - multi-utilisateurs, sur mesure, backend lourd → **ENTERPRISE**
3. **Add-ons** selon les intégrations citées (paiement mobile, WhatsApp, domaine).
4. **Devise** selon la zone (EUR / FCFA).

Si une info manque pour trancher le niveau, poser UNE question ciblée plutôt que de deviner.

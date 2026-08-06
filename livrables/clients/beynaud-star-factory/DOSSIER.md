# Beynaud / STAR FACTORY — l'état du dossier

> Révision du 31/07/2026. **Cette fiche est la première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | à relancer |
| Dernier contact | 2026-07-01 |
| Prochaine action | Relancer Latiss sur le protocole d'accord, rien ne se monétise avant |
| Échéance | — |
| Argent en attente | non chiffré, plateforme livrée sans contrepartie signée |

## En une phrase

La plateforme **La Beynaumania** est construite et en production, gratuite, à remplir de
vrais membres. **Le protocole d'accord n'est toujours pas signé.**

## Le partenaire

**Serge GNOLOU, dit Serge Beynaud**, artiste afrobeat ivoirien, structure **STAR FACTORY**.
Environ 10 millions d'abonnés cumulés toutes plateformes. Interlocuteur : **Latiss**.

Accord de principe obtenu à Paris le 01/07/2026. Sa vision : projet de long terme, la
plateforme devient l'outil de conversion de sa communication publique, le contenu exclusif
est la valeur à monétiser, et le modèle vise le volume plutôt que le prix unitaire.

## Le risque principal de ce dossier

**L'agence a construit avant de faire signer.** La plateforme est livrée, le protocole
d'accord est prêt depuis le 01/07 et attend toujours un retour. C'est un pari assumé
(logique cheval de Troie : la vraie contrepartie est la visibilité de Serge), mais il faut
le savoir en le relançant.

Trois clauses engageantes dès signature : **NDA 5 ans**, **non-contournement 24 mois**,
**exclusivité de négociation 90 jours**. Puis 5 jalons avant le contrat définitif.

**À compléter avant signature** : la qualité du représentant de STAR FACTORY, le RCCM, les
coordonnées, et le montant de l'indemnité forfaitaire de non-contournement.

## Le modèle économique

**Adhésion gratuite** pour maximiser le volume et les ambassadeurs. La monétisation se fait
sur des **événements payants ponctuels, une série spéciale et des replays de concert**,
tous en **paiement one-shot XPaye**. Ce choix contourne le blocage connu : XPaye ne gère
pas le prélèvement mensuel.

Règle stratégique actée : **YouTube pour la portée gratuite de masse, Cloudflare Stream
pour le premium payant** (YouTube ne sait pas verrouiller un contenu payant).

## Ce qui est en ligne

| Quoi | Où |
|---|---|
| Espace fan | `demo.agenceattractor.com/beynaud/fan` |
| Tableau de bord artiste | `demo.agenceattractor.com/beynaud/app` |

Backend Supabase partagé, tables `bey_`, deux fonctions (`bey-public` sans connexion,
`bey-admin` verrouillée sur l'UID de Serge). Aucun accès direct à la base : tout passe par
les fonctions. Le WhatsApp des fans n'est jamais exposé. 4 migrations dans `supabase/`.

Fonctions livrées et testées : inscription, **moteur ambassadeur** (lien personnel,
compteur de filleuls, passage Membre → Ambassadeur à 5 parrainages), mur de diffusion,
likes et commentaires avec **modération hybride** (filtre de mots puis IA, masquage
automatique et révision humaine, jamais de suppression automatique), galerie photos,
séries et live YouTube verrouillés, sondages, application installable.

## Ce qui fait foi

| Document | Fichier |
|---|---|
| Protocole d'accord (pré-contrat) | `PROTOCOLE-ACCORD-Beynaud-StarFactory-MrAttractor-2026-07-01` (html + pdf) |
| Coûts du live professionnel | `COUTS-LIVE-PRO.md` |

## Prochaine action

1. **Relancer Latiss sur le protocole d'accord.** Rien ne peut se monétiser avant.
2. Proposer l'offre premium « Concerts » (live professionnel + replays payants + billetterie), chiffrée dans `COUTS-LIVE-PRO.md` : environ 0,06 $ par fan et par heure, soit ~600 $ pour 10 000 fans, couvert par la billetterie.
3. Obtenir les **vrais titres des séries** (elles sont encore en « Série exclusive 1 / 2 »).

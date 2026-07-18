# La Beynaumania — Live pro (Cloudflare Stream Live) : coûts & mise en place

> Doc de préparation. On garde en tête l'hypothèse cible : **des milliers de fans connectés en simultané.**

## 1. Comment on facture

Cloudflare Stream a un modèle simple, à deux lignes :

| Poste | Prix | Ce que ça couvre |
|---|---|---|
| **Diffusion (delivered)** | **1 $ / 1 000 minutes vues** | chaque minute regardée par chaque fan |
| **Stockage** | **5 $ / 1 000 minutes stockées / mois** | l'enregistrement du live (replay VOD) |
| Base | ~5 $/mois | abonnement Stream minimal |

Points clés :
- **Pas de facturation au Go ni à la bande passante.** On paie à la **minute vue**, quelle que soit la qualité. Un fan en 3G qui regarde en basse def coûte pareil qu'un fan en fibre : le coût est **prévisible**, ce qui est idéal pour une audience mobile CI.
- **Concurrence illimitée** : le réseau Cloudflare encaisse des milliers de connexions simultanées sans plafond. La seule variable, c'est le coût, pas la faisabilité.
- **Encodage/transcodage inclus** (multi-qualités automatiques), pas de surcoût.
- L'**ingest depuis une régie OBS** est natif (RTMPS ou SRT) — voir §4.

## 2. La règle simple à retenir

> **Coût diffusion ≈ 1 $ pour 1 000 minutes-fan**, soit **~0,06 $ par fan et par heure de live** (~0,055 € / ~36 FCFA).

## 3. Coût d'un live selon l'audience simultanée

Hypothèse : tous les fans regardent tout le live.

**Live de 1 heure**
| Fans simultanés | Minutes diffusées | Coût | ≈ € | ≈ FCFA |
|---|---|---|---|---|
| 1 000 | 60 000 | 60 $ | 55 € | 36 000 |
| 5 000 | 300 000 | 300 $ | 275 € | 180 000 |
| 10 000 | 600 000 | 600 $ | 550 € | 360 000 |
| 20 000 | 1 200 000 | 1 200 $ | 1 100 € | 725 000 |

**Live de 2 heures** = le double.
| Fans simultanés | Coût 2h | ≈ FCFA |
|---|---|---|
| 5 000 | 600 $ | 360 000 |
| 10 000 | 1 200 $ | 725 000 |
| 20 000 | 2 400 $ | 1 450 000 |

Le stockage du replay est négligeable (un live de 2h = ~0,60 $/mois de stockage).

## 4. La régie OBS se connecte directement

- Cloudflare fournit un **Live Input** = URL d'ingest **RTMPS** + **clé de stream** (+ option **SRT** si la connexion terrain est instable).
- Dans OBS : `Paramètres > Stream > Service : Personnalisé` → coller l'URL + la clé. La régie complète (multi-cam, scènes, incrustations, titrage) tourne en local et n'envoie **qu'un seul flux programme**. Marche aussi avec les régies hardware (ATEM, vMix, Tricaster).
- Cloudflare distribue en **HLS adaptatif** → lecteur **intégré et gaté** dans la Beynaumania (membres, ou seulement les fans ayant payé l'événement).
- Le live est **enregistré automatiquement** → replay VOD pour les membres juste après.

## 5. La conclusion stratégique (audience de milliers)

Le coût grimpe **linéairement avec audience × durée**. Donc on ne met pas n'importe quel live sur Stream :

- **Live gratuit de masse (ex : 10 000 fans)** → **YouTube Live** (gratuit, illimité). Payer 600 $ pour un live gratuit n'a pas de sens. C'est déjà en place dans l'app (bloc « EN DIRECT »).
- **Live pro / premium / payant** → **Cloudflare Stream**, où le coût est **couvert par la billetterie**. Exemple : live payant à 1 000 FCFA, 5 000 acheteurs = ~5 000 000 FCFA de recettes ; coût Stream (5 000 × 2h) ≈ 360 000 FCFA, soit **~7 % des recettes**. Largement rentable, et le contenu reste **propriétaire + gaté + avec chat modéré en direct**.

Règle : **YouTube pour la portée gratuite, Cloudflare Stream pour l'événement payant et le premium.**

## 6. Ce qu'il reste à faire pour activer le live pro

1. **Activer Cloudflare Stream** sur le compte (produit payant, base ~5 $/mois + usage ci-dessus). Décision de Mac Arthur.
2. Je crée le **Live Input** par API → je fournis l'URL RTMPS + la clé à la régie.
3. Je remplace, pour les lives `Stream`, l'embed YouTube par le **lecteur HLS gaté** dans l'app (le bloc « EN DIRECT » existe déjà, c'est un changement contenu).
4. Pour les lives payants : **URLs signées** + liaison à la **billetterie XPaye** (Jalon 2 événements).
5. Replay VOD auto ajouté à la galerie des membres.

> L'app est déjà structurée pour les lives (le bloc « EN DIRECT » est livré avec YouTube aujourd'hui). Passer un live donné en « pro Cloudflare » est un changement contenu, pas une refonte.

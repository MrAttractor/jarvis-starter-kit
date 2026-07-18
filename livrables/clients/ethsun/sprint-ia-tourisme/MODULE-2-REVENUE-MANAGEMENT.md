# Module 2 — IA pour le Revenue Management & Optimisation Tarifaire

> Note de préparation. Combler l'angle mort identifié pour animer le Sprint IA Tourisme ETHSUN.

## Les indicateurs de base

**RevPAR (Revenue Per Available Room)** — l'indicateur roi de l'hôtellerie. Revenu par chambre disponible, il combine prix et occupation en un seul chiffre.
- Formule : `RevPAR = Revenu chambres / Chambres disponibles` ou `RevPAR = ADR × Taux d'occupation`
- Exemple : hôtel 50 chambres, 40 vendues à 110€ en moyenne → Revenu = 4 400€ → RevPAR = 4 400 / 50 = **88€** (identique à 110 × 80%)

**ADR (Average Daily Rate)** — prix moyen par chambre *vendue* (ignore l'occupation). `ADR = Revenu chambres / Chambres vendues`

**Occupancy (taux d'occupation)** — `Chambres vendues / Chambres disponibles × 100` (ignore le prix)

**RevPAL (Revenue Per Available Listing)** — équivalent du RevPAR pour la **location saisonnière** (pas l'hôtellerie classique) : `RevPAL = Revenu total / Annonces disponibles`. Pertinent pour les hébergements type Airbnb/gîtes, très présents dans le tourisme CI hors grands groupes hôteliers.

**GOPPAR (Gross Operating Profit Per Available Room)** — RevPAR moins les charges d'exploitation, par chambre disponible. Montre la vraie rentabilité, pas juste le chiffre d'affaires.

**TRevPAR (Total RevPAR)** — inclut tous les revenus de l'établissement (restauration, spa, événements), pas seulement les chambres. Pertinent pour les hôtels avec forte offre annexe (courant dans le tourisme CI : restauration + activités + hébergement).

## Yield Management vs Revenue Management — la nuance à tenir en Sprint

- **Yield management** = optimisation des *prix* pour maximiser le remplissage à court terme (le levier tarifaire seul)
- **Revenue management** = discipline plus large : tarification + segmentation clientèle + distribution (canaux) + prévision de demande (forecasting) + pilotage des KPI, pour maximiser le revenu global sur la durée

Message clé pour les participants du Sprint : le yield management est un outil du revenue management, pas un synonyme.

## Comment l'IA s'applique concrètement (à illustrer avec des chiffres réels)

**Dynamic pricing automatisé** — les tarifs s'ajustent en continu selon : historique de réservations (jour/saison/événements), signaux prospectifs (volume de recherche de vols, calendrier de congrès/événements locaux), tarifs concurrents, météo, vélocité de réservation en temps réel.
- Outils du marché (référence internationale à citer, pas des cas propres à Mac Arthur) : **IDeaS Revenue Solutions, Duetto, Atomize**
- Résultats mesurés : **+8 à 15% de RevPAR dans les 12 premiers mois** (répartition : 3-6% optimisation tarifaire, 2-4% meilleures prévisions, 2-5% optimisation des canaux)
- Coût d'entrée pour un petit établissement : 500-1500$/mois, ROI positif en 2-3 mois — argument important pour un public CI où beaucoup d'hôtels sont indépendants/PME, pas des chaînes internationales

**Overbooking intelligent** — scoring de probabilité d'annulation par réservation (modèle prédictif), réduit les pertes liées aux no-shows de 20-30%

**Allocation intelligente des canaux (OTA vs direct)** — l'IA augmente la part de réservations directes de 5-10 points, ce qui évite les commissions OTA. Sur un hôtel de 200 chambres, ça représente 200 000-500 000$/an d'économies. À adapter en échelle pour des établissements CI plus petits, mais le principe (réduire la dépendance aux OTA) reste un vrai levier.

**Prévision de demande (forecasting)** — anticiper les pics (événements, saisons) pour ajuster les prix en amont plutôt qu'en réaction

## Glossaire complémentaire utile pour paraître crédible en Sprint

- **Comp set (competitive set)** : groupe d'hôtels de référence pour se comparer
- **RMS (Revenue Management System)** vs **PMS (Property Management System)** : le RMS calcule les recommandations tarifaires, le PMS gère l'opérationnel (réservations, ménage, facturation)
- **Rate parity** : cohérence tarifaire entre le site direct et les OTA
- **ALOS (Average Length of Stay)** : durée moyenne de séjour
- **Forecast accuracy / MAPE** : mesure de fiabilité des prévisions
- **Displacement analysis** : décider de refuser une réservation aujourd'hui pour un tarif supérieur probable plus tard

## Ce qui reste à faire avant le Sprint

1. Construire 2-3 cas d'usage chiffrés et vérifiables (pas d'invention) adaptés au contexte CI/Afrique de l'Ouest — chercher des exemples de chaînes hôtelières africaines ou internationales ayant publié des résultats
2. Adapter le vocabulaire au public réel : hôteliers indépendants vs grands groupes n'ont pas le même niveau d'accès aux RMS payants (IDeaS/Duetto coûtent cher) — prévoir une version "low-cost" du message (tableurs + IA générative pour du forecasting simple, avant de vendre un RMS complet)
3. Intégrer le RevPAL pour ne pas parler qu'hôtellerie classique — beaucoup d'opérateurs touristiques CI sont sur de la location saisonnière/gîtes

## Sources consultées (08/07/2026)

- [RevPAR 2026 : définition, formule et calcul](https://stayou.fr/guides-ressources/revpar-definition-hotels/)
- [Revenue management en hôtellerie : KPIs et best practices](https://www.bowo.fr/blog/revpar-revenue-management-hotellerie-kpi-best-practices)
- [Revenue Per Available Listing (RevPAL)](https://www.lake.com/help/glossary/revenue-per-available-listing/)
- [Hotel Revenue Management Glossary](https://www.mylighthouse.com/resources/blog/hotel-revenue-management-glossary)
- [AI Hotel Revenue Management: Dynamic Pricing 2026](https://www.theaiconsultingnetwork.com/blog/ai-hotel-revenue-management-dynamic-pricing-occupancy-2026)

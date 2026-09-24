# ETHSUN — l'état du dossier

> Révision du 31/07/2026. **Cette fiche est la première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | **le dossier repart par l'offre, pas par la relance.** Bascule du 27/08 : le Sprint devient un outil, pas un cours. Plan de formation au format du gabarit et deck d'approche **produits, prêts à envoyer, pas encore envoyés** |
| Dernier contact | 2026-08-19, échange bref avec Jean-Calvin Ethien, relance amicale envoyée le jour même. **Sans réponse depuis, soit 8 jours** |
| Prochaine action | **Envoyer le plan de formation et le deck à Jean-Calvin.** Ils remplacent la relance et contiennent les 3 questions de gabarit à trancher. Puis **caler la réunion sur l'économie du partenariat** |
| Échéance | l'envoi lève l'attente : la note du 10/08 demandait un choix d'axe, l'approche outil répond à la question sans lui |
| Argent en attente | rien de chiffré, rien de signé. **L'économie se traite en réunion, pas par écrit** (décision de Mac Arthur du 10/08). **Le calcul de rentabilité de l'état des lieux est à refaire avant cette réunion** : l'outil alourdit la conception initiale |

## En une phrase

Partenariat en revenue-sharing où Mac Arthur anime des Sprints IA. Le partenaire
n'a pas répondu à la note du 10/08. **Plutôt que de relancer une troisième fois,
le 27/08 le dossier repart par l'offre** : le Sprint devient un outil, le plan de
formation est écrit au format de leur gabarit, et le tout attend d'être envoyé.
Rien n'est signé, rien n'est chiffré.

## La bascule du 27/08/2026 : le Sprint devient un outil

Décision de Mac Arthur. Le Sprint cesse d'être deux jours de cours suivis d'un
plan d'action à remplir chez soi. Le participant **arrive avec ses propres
données d'exploitation**, les saisit dans un tableau de bord ouvert avant la
séance, et **repart avec sa feuille de route générée depuis ses chiffres**. La
théorie n'intervient plus à vide : elle explique le chiffre qu'il vient de voir,
puis le mécanisme par lequel l'IA le déplace.

**Ce que ça règle.** L'approche répond à la question d'axe sans avoir besoin de
la réponse de Jean-Calvin : les quatre modules du catalogue sont conservés à
l'identique et deviennent quatre axes de diagnostic. C'est le quatrième scénario
de la note du 10/08, et il débloque un dossier immobile depuis le 19/08.

**L'outil retenu est une web app de l'agence**, pas un classeur remis aux
participants. Motif principal : il reste chez nous, donc le Sprint ne tourne pas
sans nous, ce qui traite le risque de propriété du contenu (point 3 de l'état
des lieux) mieux qu'une clause. Conception détaillée, **interne**, dans
`sprint-ia-tourisme/NOTE-CONCEPTION-OUTIL.md`.

### Ce que le gabarit ETHSUN a appris quand on l'a enfin lu

Récupéré le 27/08 sur le Drive `Ethsun Partenaire` (`GABARIT.doc`). Deux
constats qui vont au-delà de ce que le §7 de l'état des lieux anticipait.

1. **La réserve de format est confirmée, et elle est réelle.** La grille de
   qualité cadre trois formats : 3 heures « en salle ou Webinaire », 7 heures
   « formation en salle », 2 jours « formation en salle ». **Le seul format à
   distance qu'ils cadrent est le webinaire de 3 heures.** Or le Sprint est
   annoncé 2 jours à 100 % en ligne. Aucun barème ne lui correspond. Le plan
   applique le plus exigeant, celui de 2 jours, et pose la question.
2. **Le gabarit se contredit lui-même.** La grille de critères impose « au moins
   4 objectifs généraux » pour 2 jours. La section « TRUCS et astuces », juste
   en dessous, dit « Rédiger deux ou trois objectifs généraux ». Le plan suit la
   grille de critères, qui fait foi, et signale la contradiction pour qu'elle ne
   surgisse pas à la validation.

### Ce qui a été produit le 27/08

| Document | Fichier | Usage |
|---|---|---|
| **Plan de formation au format du gabarit** | `PLAN-DE-FORMATION-SPRINT-TOURISME.docx` et `.pdf` | **Externe.** 16 pages paysage. 6 objectifs généraux, 18 spécifiques, 60 éléments de contenu, 14 h. Conforme au barème 2 jours, qui en demande 4 et 30 |
| **Deck d'approche** | `DECK-APPROCHE-OUTIL-ETHSUN.pptx` et `.pdf` | **Externe.** 11 pages. Vend l'approche outil, **sans aucun contenu pédagogique ni aucun chiffre d'économie du partenariat** |
| Source du plan | `sprint-ia-tourisme/plan-de-formation.json` | Interne. **Source unique.** Le .docx se regénère, il ne s'édite pas à la main |
| Conception de l'outil | `sprint-ia-tourisme/NOTE-CONCEPTION-OUTIL.md` | **Interne, ne sort jamais** |
| Rendu du plan | `scripts/remplir_gabarit_ethsun.py` | Durées d'objectif général et totaux de journée **calculés**, jamais recopiés (R-29) |
| Rendu du deck | `scripts/deck_ethsun.py` | Contrôle de contraste et contrôle de débordement **bloquants** avant écriture (R-24, R-69) |

**Les trois questions posées à l'Institut**, portées à la fois par le plan et par
le deck : quel barème s'applique à un format 2 jours en ligne, combien
d'objectifs généraux sont réellement attendus, et combien d'allers-retours de
validation sont prévus et sous quel délai.

**Ce qui ne part pas** : les supports d'animation, la bibliothèque
d'instructions sectorielles et l'outil lui-même. Ordre de marche inchangé.

**Non fait** : les deux documents n'ont pas été relus sur un vrai téléphone
(R-51), et le précédent envoi du 10/08 était déjà parti par WhatsApp sans cette
relecture.

---

## Le partenaire

**ETHSUN Institute / ETHSUN Executive Education**, partenariat Oxford, www.ethsun.org.
Contact : **Jean-Calvin Ethien**, Executive AI Learning Experience Designer,
oxford@ethsun.org. Échanges depuis le 23/06/2026.

**Le produit** : un Sprint IA, 2 jours intensifs, 100 % en ligne, appliquant l'IA à un
secteur précis, avec certificat ETHSUN. **488 € HT par participant, 388 € en inscription
anticipée.** Secteur de démarrage : Tourisme et Loisirs.

## L'ordre de marche, à tenir

**On s'accorde d'abord, le protocole se signe ensuite, le contenu se livre en dernier.**
Ne pas produire de contenu pédagogique avant que les points ci-dessous soient réglés : ce
sont des actifs réutilisables, et ils vaudront cher.

## Les 8 points qui ne sont pas établis

1. **Le pourcentage du revenue-share et sa base** : sur 488 € ou 388 € ? brut ou net de frais ?
2. Le **nombre de participants engagés**
3. Le **seuil de déclenchement d'une session** : rien n'empêche aujourd'hui d'animer 2 jours pleins pour 4 inscrits
4. La **propriété du contenu produit** (plan de formation, tableur Revenue Management, bibliothèque de prompts)
5. Le **droit de contact commercial avec les participants** après le Sprint. C'est le point le plus important du dossier.
6. Le **calendrier** et son préavis
7. Le **périmètre sectoriel** : Tourisme seul, ou accès à tout le catalogue
8. Le sort de la **proposition de mission du 24/06** (audit Dolibarr et HubSpot, automatisations, contenu, formules 800 € / 2 500 € / 5 000 €), jamais reclarifiée depuis la bascule en partenariat

## L'économie, et la conclusion qui commande la négociation

| Participants (à 488 €) | Part à 25 % | Part à 35 % | Part à 50 % |
|---|---|---|---|
| 8 | 976 € | 1 366 € | 1 952 € |
| 15 | 1 830 € | 2 562 € | 3 660 € |
| 25 | 3 050 € | 4 270 € | 6 100 € |

En tarif anticipé, retirer environ 20 %.

Conception initiale : **5 à 7 jours pleins**, une seule fois. Puis 3 jours par session.
Donc une première session de 15 inscrits à 35 % revient à **environ 285 € par jour
travaillé**, et la deuxième à **854 €**.

> **Ce deal n'a aucun intérêt s'il ne produit qu'une seule session. Toute la valeur est
> dans la répétition : l'engagement de volume pèse plus lourd que le pourcentage.**

## L'angle différenciant

Trois des quatre modules du Sprint recoupent l'expertise réelle de Mac Arthur. Le
**Revenue Management** (RevPAR, tarification dynamique) est le vrai angle mort à combler,
et c'est aussi le meilleur argument : la DIDDS a déjà formé 120 opérateurs ivoiriens à
l'IA et au marketing digital en octobre 2025, **gratuitement**, mais sans couvrir le
Revenue Management.

Positionnement à tenir : **praticien**, face à trois autres intervenants au profil
académique ou conseil.

## Ce qui fait foi

| Document | Fichier | Usage |
|---|---|---|
| **Note de cadrage envoyée au partenaire** | `NOTE-ETHSUN-AXES-ET-COLLABORATION.html` | **Externe.** 4 pages A4, **sans aucun chiffre de notre part**. À ouvrir dans le navigateur, imprimer en PDF, et n'envoyer que le PDF |
| État des lieux et axes retenus | `ETAT-DES-LIEUX-OPPORTUNITE.md` | Interne, ne sort jamais du workspace |
| Veille et démarche | `NOTE-VEILLE-ET-DEMARCHE.md` | Interne |
| Préparation du Sprint Tourisme | `sprint-ia-tourisme/` | Interne, ne part qu'après signature du protocole |

## Ce que la note propose, en trois points

1. **Trois axes** pour le Sprint Tourisme : le prix et le remplissage (recommandé, seule
   matière non couverte par la formation publique), l'expérience et la réputation, les
   opérations et le back-office. Plus un quatrième scénario qui garde les quatre modules
   du catalogue avec l'axe 1 en profondeur.
2. **Le plan de formation ne se rédige qu'après le choix de l'axe.** Les objectifs, les
   verbes de Bloom et les critères de réussite du gabarit changent selon l'axe. C'est aussi
   ce qui protège la règle : aucun contenu pédagogique ne part avant la signature.
3. **Aucun chiffre.** L'économie du partenariat est renvoyée à une réunion, à la demande de
   Mac Arthur. La note se contente d'en poser l'ordre du jour : niveau et base du partage,
   seuil de déclenchement d'une session, propriété du contenu et réutilisation des outils
   génériques, intéressement d'ETHSUN sur les missions issues du Sprint. Les scénarios
   chiffrés préparés pour cette réunion restent internes, dans
   `ETAT-DES-LIEUX-OPPORTUNITE.md`.

## Prochaine action

**Note de cadrage envoyée le 10/08/2026 par WhatsApp.** Obtenir en retour le choix d'axe,
qui déclenche la rédaction du plan de formation, et les six autres réponses du point 7
(barème à distance, allers-retours de validation, calendrier, périmètre sectoriel, sort de
la proposition du 24 juin, brochures du catalogue).

Puis **caler la réunion sur l'économie du partenariat**. Y aller préparé : les scénarios
chiffrés, les seuils et les planchers sont dans `ETAT-DES-LIEUX-OPPORTUNITE.md`, ils n'ont
jamais été envoyés et ne doivent pas l'être avant d'avoir été discutés de vive voix.

**Relance si rien au 20/08/2026.**

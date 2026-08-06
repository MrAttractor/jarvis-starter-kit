# CARI IMMOBILIER, note de cadrage

> Dossier ouvert le 05/08/2026. Entré par le diagnostic en ligne, puis échange WhatsApp.
> Contact : **Serge Boka**, responsable de **CARI IMMOBILIER SARL**. WhatsApp +225 05 01 60 96 90.
> Ce document est la source de vérité du dossier. Un chiffre ou une décision n'existe qu'ici.

---

## 1. Ce que fait CARI, réellement

L'activité **existe déjà et tourne en informel**. Le projet n'est pas un lancement, c'est une
digitalisation. C'est une différence majeure : la matière (projets, promoteurs, investisseurs)
existe, le besoin est de la rendre présentable et traçable.

Le montage, dans l'ordre :

1. Un propriétaire foncier veut lotir son terrain. Il lui manque l'argent pour le **décapage**
   et les travaux d'aménagement.
2. Il cherche des prêteurs. **La contrepartie n'est pas un intérêt, c'est du foncier** : il
   rétrocède une partie de ses terres, en lots, à ceux qui ont avancé l'argent.
3. **CARI se déplace sur le terrain**, rencontre le porteur de projet, récupère les documents,
   vérifie ce qui est vérifiable.
4. **CARI signe un contrat de mandataire** avec le porteur pour rechercher des investisseurs.
5. CARI présente le projet et met en relation. **CARI n'encaisse pas.**

Le travail de fond est fait par CARI au quotidien, sur le terrain. Le site ne remplace pas ce
travail, il l'expose et le trace.

---

## 2. Ce que la plateforme est, et ce qu'elle n'est pas

**Elle est** un registre de projets vérifiés, d'engagements et de lots, avec un journal
d'avancement. Sa valeur est la **traçabilité** : qui a avancé combien, quel lot lui revient,
où en est le terrain.

**Elle n'est pas** une plateforme de collecte. Pas d'encaissement, pas de séquestre, pas de
rendement financier annoncé, pas de paiement en ligne.

### Principe de conception, non négociable

> **La plateforme reflète des contrats signés ailleurs. Elle n'engage jamais par elle-même.**

Conséquences concrètes, à tenir dans chaque écran :

- Tout engagement affiché renvoie à un document signé hors plateforme, daté et identifié.
- Aucun écran ne doit laisser croire qu'un clic vaut réservation ou attribution.
- Le vocabulaire est aligné : on n'écrit pas « investir », on écrit ce que le contrat dit.
- Ce que CARI a vérifié et ce qu'elle n'a pas vérifié est écrit sur la fiche projet, pas sous-entendu.

C'est ce qui protège CARI le jour où un projet dérape, et c'est aussi ce qui rend le produit
honnête vis-à-vis des investisseurs.

---

## 3. L'objet central du produit : le lot

Le brief initial traitait le lot comme une fonction secondaire (section 8). C'est en réalité
**l'objet autour duquel tout tourne**, parce que c'est la contrepartie.

Cycle de vie à modéliser, du plus incertain au plus solide :

| Étape | Ce qui est vrai | Ce qu'on peut afficher |
|---|---|---|
| Projeté | Le lotissement est une intention, rien n'est borné | Une estimation, jamais un numéro de lot ferme |
| Borné | Le géomètre est passé, les lots existent physiquement | Le plan et les numéros réels |
| Engagé | Un contrat lie l'investisseur et le porteur | L'engagement, avec renvoi au contrat |
| Attribué | L'attribution est actée | L'attribution et sa date |
| Titré | Les documents définitifs sont remis | Le document remis |

**Correction du 06/08/2026.** J'avais écrit qu'il fallait rendre impossible l'affichage d'un lot
avant bornage. C'est faux, et ça ne colle pas au métier : chez CARI **les lots sont identifiés
avant le bornage**, sur plan, et c'est justement ce qui permet de proposer une contrepartie au
moment de la signature. On ne l'interdit donc pas.

Ce qu'il faut à la place, et qui est plus utile :

- **Tout lot affiché porte son état**, sur plan ou borné, jamais de façon ambiguë.
- **Les surfaces d'un lot sur plan sont annoncées comme provisoires** jusqu'au bornage.
- **La réconciliation après bornage est prévue dès le départ.** Le bornage fait bouger les
  surfaces réelles, et « mon lot fait 480 m² au lieu de 500 » est le litige le plus prévisible
  de tout le dispositif. Le système doit savoir afficher l'écart et ce qui a été décidé, plutôt
  que de le masquer.
- **Un lot ne peut être engagé qu'une fois.** Ça, c'est la contrainte à rendre techniquement
  impossible à violer.

---

## 4. Ce qui change par rapport au brief du 05/08

| Dans le brief | Devient |
|---|---|
| Montant collecté | Montant engagé, adossé à des contrats |
| Rendement proposé | Contrepartie en lots |
| Module investissement | Module engagement contre lot |
| Commission 5 % prélevée sur la collecte | À clarifier : CARI n'encaisse pas, donc la commission se facture autrement |
| Paiement en ligne (Phase 2) | Hors périmètre |
| KYC réglementaire | Identification simple, pas de dispositif réglementaire lourd |
| « La plateforme vérifie » | « CARI vérifie sur le terrain », et la plateforme dit quoi |

Le périmètre se réduit et se précise. Le projet redevient une application métier ambitieuse,
et non une fintech.

---

## 5. Réponses de Serge, obtenues le 06/08/2026

1. **Rémunération de CARI.** Prévue au contrat de mandat, dès la signature : **5 % du montant
   qui sera collecté**, plus **des lots définis au contrat**. CARI est donc payée en argent et
   en foncier. Elle n'encaisse toujours pas : les 5 % lui sont dus par le porteur.
2. **Les lots sont identifiés AVANT le bornage.** C'est ce qui permet d'annoncer une contrepartie
   au moment de la signature. Voir la correction en section 3.
3. **CARI rédige le contrat**, fait office de facilitateur, et **en conserve une copie**.
4. **On commence par un pilote**, pour valider le modèle. Besoin du pilote : **25 000 000 FCFA**,
   en **tranches de 500 000 F**. Une personne peut prendre une tranche, trois, ou davantage
   selon ses moyens.
5. **La transparence est le cœur du dispositif.** Chaque participant dispose d'**un lien où il
   voit l'évolution réelle comparée à la prévision faite au moment de la signature**. Les
   informations sont communiquées très régulièrement.

### Le chiffre qui redéfinit le produit

**25 000 000 / 500 000 = 50 tranches, donc 50 participants au maximum sur le pilote.**

Le brief décrivait une marketplace : catalogue, découverte, matching, scoring, IA d'analyse
documentaire. La réalité du pilote est un projet, cinquante personnes, et un besoin qui n'est pas
de recruter mais de **tenir informés ceux qui ont déjà signé**.

> **Ce n'est pas une marketplace, c'est un outil de tenue de promesse.**

Conséquence directe : la découverte de projets est secondaire, le suivi est primordial. C'est
aussi une bonne nouvelle pour le chiffrage, le périmètre réel est très inférieur au brief.

### Ce qui reste à clarifier

- **« CARI met cela dans la contrepartie pour les financiers »** : la formulation est ambiguë.
  Les lots revenant à CARI font-ils partie du pool proposé aux participants, ou sont-ils
  prélevés en plus ? Cela change le nombre de lots disponibles, donc le plan.
- **Que se passe-t-il quand le réel s'écarte de la prévision ?** Serge n'a pas répondu, et c'est
  devenu la question la plus importante du dossier. Un outil qui affiche l'avancement documente
  aussi le retard. C'est ce qui construit la confiance, mais il faut pouvoir **expliquer** un
  écart, pas seulement l'afficher. Sans ce mécanisme, l'outil se retourne contre CARI au premier
  contretemps.

---

## 6. Le MVP réel, tel qu'il ressort des réponses

Quatre briques, dans cet ordre. Rien d'autre pour le pilote.

1. **La page du projet pilote.** Présentation, documents vérifiés, plan des lots avec leur état,
   avancement prévu et réel, et l'onglet risques. Publique.
2. **Le registre des tranches.** 50 tranches de 500 000 F, qui a pris quoi, quel lot est associé,
   avec renvoi au contrat signé. Un lot ne peut être engagé qu'une fois.
3. **Le lien de suivi personnel du participant.** La brique la plus importante : il voit ses
   tranches, ses lots prévus, et **la prévision figée à la signature face à l'avancement réel**.
4. **Le back-office CARI.** Saisir les participants depuis les contrats signés, publier les étapes
   d'avancement, téléverser les preuves (photos du décapage, attestation de bornage).

Le modèle de données central est celui d'un planning de chantier : une **prévision figée** au
moment de la signature, et un **journal réel** qui vient s'y comparer. C'est cette comparaison
qui est le produit.

Sont **hors du pilote** : le paiement en ligne, le catalogue multi-projets, le scoring, l'IA
documentaire, la signature électronique. Ils reviendront si le modèle est validé.

---

## 7. Ce qu'on vend d'abord

Serge a demandé « quelqu'un capable de modéliser la plateforme ». C'est le bon point d'entrée,
et c'est vendable seul.

**Phase de modélisation**, livrée en documents : modèle de données, parcours des trois rôles,
cycle de vie du lot et transitions autorisées, mécanisme de réconciliation après bornage, gestion
des écarts entre prévision et réel, et la table de vocabulaire de la section 8. À l'issue, CARI
possède un dossier qui lui sert même si elle change de prestataire, et le développement se chiffre
sur un périmètre arrêté.

**Note sur l'économie du deal.** La commission de CARI sur le pilote est de **5 % de 25 000 000,
soit 1 250 000 FCFA**, environ 1 900 €. Une rémunération indexée sur cette commission ne
représenterait donc qu'une fraction de ce montant pour un premier projet. Le partenariat n'a
d'intérêt que s'il porte sur la suite, pas sur le pilote. À dire franchement à Serge plutôt qu'à
le découvrir après.

---

## 8. La référence Immocratie, ce qu'on prend et ce qu'on laisse

Serge cite **immocratie.com** comme inspiration. Lecture faite le 06/08/2026.

**Ce qu'Immocratie est réellement** : une plateforme française régulée qui émet des **obligations
à taux fixe, non convertibles, in fine**, des titres non cotés, avec un rendement annoncé en
pourcentage et une fiscalité de placement (prélèvement forfaitaire unique de 30 %). C'est un
instrument financier. CARI, elle, organise un prêt remboursé en foncier. Même apparence, deux
métiers différents.

### Ce qui se transpose

- **La structure de la fiche projet** : photos, plans, études, documents, business plan.
- **L'historique de l'opérateur.** C'est le levier de confiance le plus fort du secteur, et chez
  CARI il l'est encore plus : un porteur qui a déjà livré un lotissement borné vaut tous les
  dossiers. Serge l'avait placé en Phase 3, **il doit remonter en Phase 1**.
- **L'onglet risques sur chaque projet**, au même endroit à chaque fois. Immocratie écrit sans
  détour « risque de perte de la totalité du capital investi » et recommande de diversifier. Cette
  franchise fait sa crédibilité. Chez CARI : retard de bornage, litige foncier, porteur qui ne
  rétrocède pas.
- **La prudence des formulations** : « rendement attendu, non garanti » devient « lot prévu, sous
  réserve du bornage ».

### Ce qui ne se transpose pas

**Le vocabulaire financier.** Employer « investir », « rendement », « capital », « plus-value »,
« titres » ferait basculer l'offre de CARI dans le registre du placement financier, celui qui
suppose un agrément. La qualification d'une offre se fait sur sa réalité **et sur la manière dont
elle est présentée** : le site serait la première pièce versée au dossier. De même, CARI ne peut
pas afficher qu'elle est régulée par une autorité, ni annoncer un pourcentage de rendement.

### Table de traduction, à tenir dans toute l'interface

| Ne jamais écrire | Écrire à la place |
|---|---|
| Investir, investissement | Participer au financement du lotissement |
| Investisseur | Participant, ou le terme qu'emploie le contrat de mandat |
| Rendement, taux, % | Contrepartie en lots |
| Capital investi | Montant avancé |
| Plus-value | Valeur du lot |
| Titre, obligation, souscription | Contrat signé avec le porteur de projet |
| Collecte, montant collecté | Montant engagé, adossé aux contrats |
| Plateforme régulée | CARI IMMOBILIER SARL, mandataire du porteur de projet |

Le vocabulaire de référence est celui du foncier ivoirien, celui que Serge emploie déjà :
décapage, bornage, lotissement, attribution, attestation. C'est aussi celui que ses clients
comprennent.

**À faire valider par un juriste ivoirien avant mise en ligne**, au même titre que le montage.

---

## 9. Statut du dossier

| Point | État |
|---|---|
| Qualification | Famille A, corrigée à la main le 05/08 (le classificateur avait dit B) |
| Contact établi | Oui, WhatsApp, besoin recueilli |
| Brief client reçu | Oui, transformé en brief dev par Mac Arthur |
| Montage juridique clarifié | Oui, mandat, sans encaissement |
| Cinq questions | **Répondues le 06/08**, voir section 5 |
| Périmètre du pilote | Cerné : 1 projet, 50 tranches, 4 briques (section 6) |
| Deux points encore ouverts | Le pool de lots de CARI, et la gestion des écarts prévision/réel |
| Validation juridique | **Non faite.** Montage et vocabulaire à faire valider par un juriste ivoirien avant mise en ligne |
| Nature du deal | **Non arrêtée.** Serge parle de partenariat, le contenu reste à définir |
| Chiffrage | Aucun. Possible dès que les deux points ouverts sont tranchés |

### Prochaine action

Poser les deux dernières questions, puis proposer la phase de modélisation. Le périmètre est
désormais assez net pour la chiffrer.

**Vigilance sur le deal** : un partenariat indexé sur les commissions de CARI peut être excellent
ou ne rien rapporter pendant deux ans, selon que des collectes aboutissent ou non. Si cette voie
est retenue, l'indexer sur du réalisé, jamais sur du prévisionnel.

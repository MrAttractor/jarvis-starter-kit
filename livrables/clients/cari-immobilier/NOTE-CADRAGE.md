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

**Le piège à éviter absolument** : afficher un plan de lotissement avec des numéros de lots avant
le bornage. C'est la meilleure façon de promettre deux fois le même lot. Le système doit rendre
cette erreur impossible, pas seulement la déconseiller.

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

## 5. Questions ouvertes, à poser à Serge

Elles conditionnent le modèle de données, donc le chiffrage. Aucune n'est cosmétique.

1. **Comment CARI est-elle payée ?** Commission versée par le porteur de projet, en argent ou
   en lots ? À quel moment, et sur quelle base de calcul, puisque rien ne transite ?
2. **Les lots sont-ils identifiés avant ou après le bornage ?** Autrement dit, au moment où on
   cherche l'argent, sait-on déjà quel lot ira à qui, ou seulement combien de mètres carrés ?
3. **Qui rédige le contrat entre l'investisseur et le porteur ?** CARI, un notaire, le porteur ?
   Et CARI en garde-t-elle une copie ?
4. **Combien de projets actifs aujourd'hui, et combien d'investisseurs par projet ?** Cela
   dimensionne tout le reste, et détermine si un back-office simple suffit.
5. **Que se passe-t-il quand un projet échoue ou prend du retard ?** Le brief ne décrit que le
   chemin heureux. C'est là que se jouent la réputation de CARI et l'utilité du journal.

---

## 6. Ce qu'on vend d'abord

Serge a demandé « quelqu'un capable de modéliser la plateforme ». C'est exactement le bon point
d'entrée, et c'est vendable seul.

**Phase de modélisation**, livrée en documents : modèle de données, parcours des trois rôles,
cycle de vie du lot et transitions autorisées, matrice de ce que CARI vérifie et n'engage pas,
et les réponses écrites aux cinq questions ci-dessus. À l'issue, CARI possède un dossier qui lui
sert même si elle change de prestataire, et le développement se chiffre sur du solide.

Le développement est chiffré **après**, sur un périmètre arrêté, pas sur un brief.

---

## 7. Statut du dossier

| Point | État |
|---|---|
| Qualification | Famille A, corrigée à la main le 05/08 (le classificateur avait dit B) |
| Contact établi | Oui, WhatsApp, besoin recueilli |
| Brief client reçu | Oui, transformé en brief dev par Mac Arthur |
| Montage juridique clarifié | Oui, mandat, sans encaissement |
| Cinq questions ouvertes | **Non posées à ce jour** |
| Nature du deal | **Non arrêtée.** Serge parle de partenariat, le contenu reste à définir |
| Chiffrage | Aucun, et prématuré tant que les questions 1 à 5 sont ouvertes |

**Vigilance sur le deal** : un partenariat indexé sur les commissions de CARI peut être excellent
ou ne rien rapporter pendant deux ans, selon que des collectes aboutissent ou non. Si cette voie
est retenue, l'indexer sur du réalisé, jamais sur du prévisionnel.

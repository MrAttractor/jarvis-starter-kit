# L'outil du Sprint, note de conception

> **INTERNE. Ne sort jamais du workspace.** Le deck envoyé à Jean-Calvin décrit
> le principe de l'outil. Ce document décrit comment il est fait. C'est
> précisément la différence entre les deux qui protège l'actif.
>
> Écrit le 27/08/2026, après la bascule décidée par Mac Arthur : le Sprint
> devient un outil de transformation, pas une formation théorique.

---

## 1. Pourquoi un outil et pas un tableur

La décision du 27/08 est de faire du Sprint un outil. Le choix retenu est une
**web app de l'agence**, pas un classeur remis aux participants. Trois raisons,
dans l'ordre d'importance.

**Elle règle le risque n°3 de l'état des lieux.** Remplir le gabarit d'ETHSUN,
le faire valider par leur comité et intégrer leurs corrections rendait la
revendication ultérieure de propriété difficile. Avec un outil hébergé chez
nous, le gabarit ne décrit plus que la pédagogie **autour** de l'outil. La
matière reste à l'agence.

**Elle change le rapport de force à la réunion sur l'économie.** Un Sprint qui
ne peut pas tourner sans l'outil ne peut pas tourner sans nous. C'est un
argument plus solide que n'importe quel pourcentage négocié, et il n'a pas
besoin d'être énoncé pour agir.

**Elle est réutilisable.** Le catalogue ETHSUN compte quatorze secteurs. Les
quatre axes de maturité changent, la mécanique ne change pas. Ce qui est
construit pour le Tourisme se repose sur Éducation, Hospitalier, Collectivités
et les autres. C'est aussi une brique du Générateur d'Apps Métier.

> **La contrepartie, à assumer.** Cela déplace la charge de conception vers le
> haut. L'état des lieux estimait 5 à 7 jours pleins pour la conception
> initiale. Avec l'outil, compter davantage. Le calcul de rentabilité de
> `ETAT-DES-LIEUX-OPPORTUNITE.md` est donc à refaire **avant** la réunion sur
> l'économie, pas après. La conclusion de fond ne bouge pas : ce deal n'a
> aucun intérêt s'il ne produit qu'une session, et l'outil accentue ce point
> au lieu de l'atténuer.

---

## 2. Ce que l'outil fait, en quatre temps

### Temps 1, avant la séance : le relevé

Un lien personnel part avec la confirmation d'inscription. Le participant y
saisit, sur les douze derniers mois :

| Rubrique | Contenu |
|---|---|
| Structure | type d'établissement, nombre de chambres ou de places, localisation |
| Activité | taux d'occupation mois par mois, prix moyen pratiqué |
| Distribution | répartition direct / plateformes / agences / groupes, taux de commission |
| Outillage | systèmes déjà en place, ou absence de système |
| Intention | trois objectifs de progrès qu'il se fixe lui-même |

**Mode individuel et mode collectif.** Une structure qui inscrit plusieurs
personnes ouvre une session d'équipe : chacun répond, les réponses sont
agrégées, et les écarts entre les réponses d'une même structure deviennent
eux-mêmes matière de travail. C'est le « questionnaire individuel ou
collectif » demandé.

**Le cas des structures sans données.** Une part du tissu touristique ivoirien
tient son activité sur un carnet. Une méthode de reconstitution à partir des
relevés bancaires et du registre d'arrivées est prévue, et elle est intégrée
au premier objectif spécifique du plan de formation. Sans elle, la première
demi-journée se passe à saisir.

### Temps 2, ouverture : le diagnostic

L'outil calcule et affiche, sans qu'on ait encore rien enseigné :

- **Le profil de maturité sur les quatre axes du catalogue ETHSUN** (expérience
  voyageur, revenu, marketing, opérations). Les quatre modules deviennent
  quatre lentilles de diagnostic au lieu de quatre cours.
- **Les indicateurs de performance** calculés depuis ses propres chiffres :
  prix moyen, taux d'occupation, revenu par unité disponible, et la variante
  applicable aux locations saisonnières.
- **Le coût annuel de distribution**, c'est-à-dire le montant réellement versé
  aux plateformes sur douze mois.

> **Le coût annuel de distribution est le pivot du Sprint.** La plupart des
> structures indépendantes connaissent leur taux de commission mais n'ont
> jamais posé la multiplication sur l'année. Ce chiffre ne s'enseigne pas, il
> se découvre, et une fois découvert il rend la suite nécessaire. C'est aussi
> la réponse à la formation gratuite de la DIDDS : une sensibilisation
> collective ne peut pas produire ce moment, parce qu'elle ne travaille sur
> les données de personne.

### Temps 3, pendant les deux jours : la théorie au service du chiffre

Chaque module s'ouvre sur les chiffres du groupe. La théorie explique pourquoi
le chiffre est là, puis par quel mécanisme l'IA le déplace. Le participant
simule dans l'outil (grille tarifaire, part du direct) et voit l'effet projeté
sur son propre indicateur.

C'est la formulation de Mac Arthur : ils entrent des informations concrètes, et
la théorie vient expliquer comment la transformation pourrait être implémentée.

### Temps 4, en sortie : la feuille de route

Le Plan d'Action IA est **généré**, pas remis en modèle. Il reprend les actions
retenues au fil des six objectifs généraux, hiérarchisées sur trois horizons
(première semaine, premier mois, troisième mois). Chaque action porte son
responsable, son échéance, son indicateur de suivi et le seuil à partir duquel
le participant corrige. Exportable en fin de seconde journée.

C'est exactement le livrable que la brochure ETHSUN promet déjà. On n'ajoute
pas une promesse, on est simplement en état de tenir celle qui est faite.

---

## 3. Ce que l'outil apporte à la validation pédagogique

Le gabarit impose une formulation stricte : *être capable de + verbe d'action et
objet + critère de réussite + conditions de réalisation*. Sur une formation à
distance, le **critère de réussite** est le point faible habituel, parce que
rien ne permet de le constater.

L'outil produit la preuve. « L'écart entre le calcul du participant et le calcul
de référence est inférieur à 5 % » se mesure, le formateur n'a pas à en juger.
Les dix-huit objectifs spécifiques du plan sont écrits sur ce principe.

Note pour Mac Arthur : c'est le même défaut que la correctrice Emy GASPARIK a
relevé sur l'évaluation intermédiaire de la certification, sous une autre forme
(relier séance, but, protocole et objectif du client). Le réflexe se travaille
des deux côtés en même temps, cf. `certification-preparation-mentale/`.

---

## 4. Ce qui n'est pas tranché

1. **Le nom vu par le participant.** « Ma Feuille de Route » est un candidat, il
   dit ce qu'on emporte. À arbitrer par Mac Arthur, en gardant la règle du
   vocabulaire propre au client plutôt qu'un terme anglais générique (R-38).
2. **Où vit la donnée du participant.** Ce sont des données d'exploitation
   d'entreprises tierces, collectées via un partenaire, dans un cadre non encore
   contractualisé. La question de la responsabilité de traitement doit être
   posée **avant** le premier relevé, pas après. Passer par l'agent RGPD.
3. **Ce qu'ETHSUN voit de l'outil.** Un accès observateur au diagnostic agrégé
   d'une session est un geste peu coûteux et il a de la valeur pour eux. Un
   accès à l'outil lui-même, non.
4. **Le socle technique.** Par défaut l'architecture commune de l'agence
   (Supabase, Cloudflare), cf. `project_architecture_app_metier`. Rien n'est à
   construire avant le retour de Jean-Calvin sur l'axe et le format.

---

## 5. Ordre de marche, inchangé

L'ordre du dossier reste celui du `DOSSIER.md` : **on s'accorde d'abord, le
protocole se signe ensuite, le contenu se livre en dernier.**

Ce qui est parti le 27/08 (le plan de formation au format du gabarit, et le deck
d'approche) décrit **l'architecture pédagogique**. Ce ne sont pas les supports
d'animation, ni la bibliothèque d'instructions, ni l'outil. Ces trois actifs
restent ici jusqu'à signature.

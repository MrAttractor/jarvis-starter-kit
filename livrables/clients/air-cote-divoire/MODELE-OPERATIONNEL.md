# Le modèle opérationnel VSD, verrouillé

> Figé le 25/07/2026 après la revue de stratégie. **Cette note remplace le montage « fret accompagné » du dossier initial**, qui posait trop de frictions. C'est la source de vérité opérationnelle. Le concept côté consommateur reste dans `CONCEPT-OFFRE-VSD.md`.

> ## Rectification du 30/07/2026, elle prime sur tout ce qui suit
>
> Quatre corrections dictées par Mac Arthur. Elles changent l'économie, en moins bien sur le papier et en beaucoup plus solide en réalité.
>
> 1. **Le recrutement des voyageurs est porté par Mr Attractor ET J'Envoie Express**, en **communication organique uniquement**. Plus de budget d'acquisition payant : le poste de 400 €/rotation disparaît du compte.
> 2. **Montée en puissance par paliers : 4 sièges, puis 7, puis 10.** On est sûr de trouver 4 personnes, 7 assure un premier test réel, 10 est la cible. **Objectif atteint au bout de 3 voyages.** On ne demande plus 10 sièges d'emblée à Air CI.
> 3. **Le voyageur cède toute sa soute au départ de Paris.** En échange il obtient un tarif réduit **et une valise de 32 kg offerte au retour d'Abidjan**. C'est le bonus de l'offre, il n'est plus facturé 99 €.
> 4. **La demande bagage est de 2 × 32 kg par siège dans les deux sens**, en permanence, et 3 × 32 kg exceptionnellement à l'aller. On ne demande plus 3 × 23 kg.
>
> **Conséquence directe :** au retour, une des deux valises part au voyageur, il n'en reste qu'une à vendre. Le sens Abidjan → Paris rapporte donc moitié moins qu'estimé le 27/07.
>
> **Et le point qui commande la négociation :** le prix plancher consenti par Air Côte d'Ivoire. Grille de seuils dans `GRILLE-PRIX-PLANCHER-AIR-CI.md`.

> **Vocabulaire (27/07) : on ne dit plus « fret ».** On parle de **colis normaux acheminés par un prestataire externe** (J'Envoie Express) en collaboration avec son **réseau de sociétés de colisage**. Les valises voyagent en **bagage enregistré déclaré** via l'allocation des sièges, jamais en terminal cargo. Tous les livrables (offre DR, simulateur, BP) sont alignés sur ce vocabulaire.

---

## Le modèle en une phrase

On vend des week-ends 72h Paris ⇄ Abidjan à des voyageurs qui **remplissent les sièges d'Air Côte d'Ivoire**. Leur allocation bagage, au lieu de partir dans leurs valises, porte de la **capacité colis déclarés**, que nous revendons à des sociétés de colisage.

---

## Les acteurs, et qui fait quoi

| Acteur | Rôle |
|---|---|
| **Air Côte d'Ivoire** | Les sièges, la soute et **l'allocation bagage des sièges** utilisée pour les valises (avec une **rétrocession de 1 €/kg** sur la demande exceptionnelle de valises de 32 kg), le co-financement du marketing, le lobbying et les RP. |
| **Mr Attractor** | La marque, la plateforme, la communication, et **le recrutement des voyageurs, conjointement avec J'Envoie Express**. Se positionne en **apporteur d'affaires**, jamais agence de voyage. |
| **J'Envoie Express** | Prestataire **chargeur connu, formé à la sûreté**. Prépare, pèse, scelle, manifeste et **transporte** les valises déclarées. Vend la capacité aux sociétés de colisage. **Prospecte et vérifie les voyageurs avec Mr Attractor.** **Ne touche pas à la douane.** |
| **Les sociétés de colisage** | Clientes de J'Envoie Express (≈ 5 valises chacune). **Importateurs de record.** Leur **propre transitaire agréé** dédouane à Abidjan. Elles récupèrent et gèrent l'aval. |
| **Les voyageurs VSD** | Passagers ordinaires. Remplissent les sièges. **Ne portent rien, ne gèrent rien, ne voient pas les valises.** |

---

## Comment ça marche, étape par étape

1. Les voyageurs achètent leur week-end. **Leurs sièges portent l'allocation bagage.**
2. Les valises sont **enregistrées comme bagage déclaré, au nom des sociétés**, en utilisant **l'allocation bagage normale des sièges**. Pour obtenir des valises de 32 kg au lieu de 23 kg à l'aller, on le demande exceptionnellement et on **rétrocède 1 €/kg à Air CI**. Le voyageur ne les enregistre pas et ne les récupère pas.
3. J'Envoie Express prépare, scelle, manifeste et charge les valises (chargeur connu).
4. **Vol** : passagers et fret sur le même avion, jamais mêlés.
5. À Abidjan : les valises sortent **sur le tapis à bagages**, le transitaire de chaque société les **récupère et dédouane**. J'Envoie Express ne fait que transporter.

---

## La douane (le point tranché le 25/07)

- **J'Envoie Express** : transport uniquement + préparation sûreté. **Ni droits, ni responsabilité d'importateur, ni déclaration à l'import.**
- **Les sociétés de colisage** : importateurs de record, leur **transitaire agréé** dédouane, elles paient les droits + TVA.
- **Récupération sur le tapis** : le transitaire de chaque société prend ses valises directement au tapis à bagages à l'arrivée et dédouane. **Air Côte d'Ivoire a estimé qu'à 10 voyageurs, ce volume ne perturbe pas son fonctionnement.**

---

## L'économie (recalculée le 30/07, 2×32 kg dans les deux sens, 1 valise offerte au retour)

**Chaîne de valeur par valise de 32 kg :** client final **220 €** → J'Envoie Express **150 €** → **32 €** rétrocédés à Air CI (32 kg × 1 €) → **+118 € de marge**.

**Ce que porte un voyageur, aller et retour réunis :**

| | Ce qui part | Ce que ça vaut |
|---|---|---|
| **Aller** Paris → Abidjan | 2 valises de 32 kg vendues | + 236 € |
| **Retour** Abidjan → Paris | 2 valises de 32 kg, dont **1 offerte au voyageur** → 1 seule vendue | + 118 € |
| Coût de la valise offerte | rétrocession 32 kg × 1 €/kg | − 32 € |
| **Marge brute par voyageur** | | **322 €** |

**Par palier de montée en puissance** (marge brute colis par rotation) :

| Palier | 2×32 aller (**retenu**) | 3×32 aller (idéal, exceptionnel) |
|---|---|---|
| **4 voyageurs** (rotation 1) | **1 288 €** | 1 760 € |
| **7 voyageurs** (rotation 2) | **2 254 €** | 3 080 € |
| **10 voyageurs** (rotation 3, cible) | **3 220 €** | 4 400 € |

À la cible, 10 voyageurs sur 39 rotations : **≈ 125 600 €/an** de marge brute colis, partagée **50/50**.

> **Ce que la rectification coûte, dit franchement :** l'estimation du 27/07 annonçait 4 360 €/rotation et 170 k€/an. La valise offerte au retour supprime la moitié du sens Abidjan → Paris et coûte 32 € de rétrocession. On tombe à **3 220 €/rotation et ≈ 125 600 €/an**, soit **26 % de moins**. En échange, l'offre voyageur devient réellement désirable et le remplissage des sièges, qui est le vrai goulot, devient beaucoup plus probable. C'est un bon échange, mais il faut le compter, pas l'oublier.

- **Argument douane :** la douane facture par valise, pas au kilo → tout le monde préfère le 32 kg.
- **Plus de budget d'acquisition** (30/07) : le recrutement est **organique**, porté à deux. Les 400 €/rotation de campagne sortent du compte. Le voyageur cesse d'être un produit d'appel à 10 € net : il rapporte **50 € de frais de réservation nets**, plus les 322 € de capacité qu'il ouvre.
- **Charges directes de Jean Yves ≈ nulles** (27/07) : il a déjà les outils (balance, scellés, matériel), rien à acheter. Son apport = **sa présence pour coordonner** (vendredi matin + la semaine) **et sa part du recrutement**. Seule l'**assurance des marchandises** reste en option.

---

## La négociation Air CI

- **Le levier :** on remplit ses sièges. Le flux passager justifie le tarif bas.
- **La demande précise, réécrite le 30/07 :**
  - **Des sièges par paliers : 4, puis 7, puis 10** chaque vendredi au départ de Paris, sur trois rotations. On ne demande plus 10 d'emblée.
  - **2 valises de 32 kg par siège, dans les deux sens, en permanence.** Et **3 × 32 kg à l'aller, exceptionnellement**, quand le volume le justifie.
  - En contrepartie du 32 kg, on **rétrocède 1 €/kg à Air CI**, présenté comme un bonus qui grandit avec le volume dans un partenariat durable.
- **Le palier est un argument, pas un aveu de faiblesse.** Demander 4 sièges pour commencer dit à Air CI qu'on ne lui fait pas porter un risque de sièges vides, et que la montée se prouve rotation après rotation. C'est exactement ce qui répond à la crainte d'Hervé Abou sur le désordre au comptoir. À dire dans ces termes.
- **Le tarif partenaire est le point qui décide de tout.** Nous ne pouvons pas subventionner le billet : le montage retenu (session 117) fait de nous un **mandataire**, la compagnie encaisse le prix du transport et nous facturons nos frais de réservation à part. Nous n'avons donc **aucun levier financier** sur le prix affiché au voyageur : si le tarif partenaire monte, le prix public monte d'autant, et la demande baisse. Seuils chiffrés dans **`GRILLE-PRIX-PLANCHER-AIR-CI.md`**.
- **Levier sMiles :** le 32 kg est **déjà la franchise du palier Diamant** de leur programme (paliers 3/4/5 étoiles + Diamant : +0/+10/+15/+32 kg ; les miles se dépensent déjà sur « le fret » et « l'excédent bagage »). Argument : notre demande n'est pas exotique, c'est **leur propre standard**. Et nos voyageurs alimentent sMiles (miles gagnés sur billet payant, colis récompensables en miles), ce qui fait de **VSD le partenaire non-aérien colis** qui manque à sMiles. Vigilance : ne pas le présenter comme un cadeau de franchise à des commerçants (ancienne crainte d'Hervé), mais comme un branchement sur leur programme existant, désormais jouable puisqu'Air CI a validé qu'à 10 voyageurs ça ne dérange pas.
- Air CI investit dans le **marketing** (co-financement) et apporte **lobbying + RP**.
- On ne montre **jamais** la marge de revente au DR. Règle de la session 110 : le document DR n'aiguise pas l'appétit tarifaire.

---

## Branding et positionnement

- **Nom de l'offre :** « Les Week-End Légers » (le « de Air Côte d'Ivoire » reste **gaté jusqu'à signature**), opérés par **VSD by Attractor**.
- **Positionnement :** offre exceptionnelle pour ceux qui ont besoin d'être à Abidjan **ou** Paris pour 72h (bidirectionnel à terme).
- **Règle site consommateur :** on ne dit **rien** du deal fret. Le voyageur sait juste qu'il voyage léger et que la place en soute qu'il n'utilise pas revient dans son prix.

---

## Frictions résolues

- Fret accompagné bancal → **fret cargo déclaré séparé**.
- Désordre au comptoir (problème d'Hervé Abou) → **volume maîtrisé, qu'Air CI a elle-même validé comme non perturbant à 10 voyageurs**, valises scellées et déclarées par un chargeur connu.
- Douane sur le dos de Jean Yves → **transitaires des sociétés**.
- Ligne rouge « colis dans le bagage d'un tiers » → **n'existe plus**.

---

## Reste à faire

- **Aligner les livrables** (offre Air CI, simulateur, business plan J'Envoie Express) sur ce modèle, puis **rouvrir le lien** de la proposition (actuellement désactivé).
- Obtenir d'Air CI, dans l'ordre d'importance : le **tarif partenaire plancher** (le chiffre qui commande tout), la validation de **2 × 32 kg par siège dans les deux sens**, la validation de la **rétrocession de 1 €/kg**, et l'accord sur la **montée par paliers 4 / 7 / 10**.
- Valider avec un **transitaire agréé CI** la mécanique de remise au terminal.
- Obtenir de Jean Yves ses **charges directes**, pour figer le 50/50.

# L'offre VSD, le concept

> Document de conception interne. Rédigé le 23/07/2026, après le RDV Air Côte d'Ivoire du 22/07.
> Il décrit **le produit vendu au voyageur**, la brique qui manquait au dossier.
> Ce qui existe déjà et n'est pas repris ici : l'économie côté compagnie (`simulateur-air-ci.html`),
> l'économie côté opérateur (`simulateur-convoyeurs.html`), le rôle de Jean Yves (`BUSINESS-PLAN-CONVOYAGE.html`),
> le cadre légal et les profils (`PROGRAMME-CONVOYEURS.md`).

---

## 1. L'offre en une phrase

**72h Paris-Abidjan-Paris à partir de 430 €, du vendredi au dimanche, pour ceux qui acceptent de voyager sans soute personnelle.**

C'est tout. Il n'y a rien d'autre à comprendre pour l'acheter.

**La marque, arrêtée le 23/07 :** l'offre s'appelle **VSD by Attractor**. Elle est portée par Mr Attractor avec la compagnie, pas par J'Envoie Express, qui reste l'opérateur du fret en coulisse. Charte aux couleurs du drapeau ivoirien (orange, blanc, vert), les mêmes que celles de la compagnie.

**Deux formules, arrêtées le 23/07 :**

| Formule | Prix | Ce qu'elle comprend |
|---|---|---|
| **Le vol** | **à partir de 430 €** | Billet aller-retour, 10 kg en cabine, accueil à l'aéroport |
| **Le vol et l'hôtel** | **500 €, prix rond** | Idem, plus les deux nuits chez l'hôtel partenaire à Abidjan |
| Option | + 49 € | Une seule valise de 23 kg en soute, à titre exceptionnel |

**La construction du 430, à garder pour nous.** 380 € est le tarif du siège que nous facture la compagnie, 50 € est notre marge. Le prix public part donc de 430 € et jamais en dessous : descendre sous ce seuil, c'est vendre le voyage à perte avant même d'avoir compté le fret.

**La formule à 500 € est conditionnée au partenariat hôtel.** Tant qu'aucun établissement n'est signé, elle ne doit pas être publiée : le site la fait disparaître partout en basculant `CONFIG.hebergement` sur `false`. À 500 €, il reste 120 € pour couvrir deux nuits et notre marge, ce qui impose de négocier la chambre nettement sous 50 € la nuit. C'est le chiffre à obtenir avant d'annoncer ce prix rond.

---

## 2. Le retournement à tenir, et il conditionne tout le reste

Ce qu'on vend n'est pas du convoyage. **C'est un week-end à Abidjan à moitié prix.**

Le mot « convoyeur » est un mot de dossier, pas un mot de vente. Le voyageur qui achète ne se voit pas comme un convoyeur, il se voit comme quelqu'un qui rentre au pays pour trois jours sans se ruiner. Le fret est notre affaire, pas la sienne.

**Il ne porte rien, il ne transporte rien, il ne remet rien à personne.** Il renonce simplement à sa soute, exactement comme on renonce à un bagage en soute sur un vol low-cost. La marchandise voyage sous le nom de J'Envoie Express, déclarée, pesée, scellée, manifestée au sol par l'opérateur formé à la sûreté.

Si un seul message doit passer dans toute la communication, c'est celui-là. Il fait trois choses à la fois :
- il rend l'offre **désirable** (personne ne rêve de porter les colis des autres, tout le monde rêve d'un billet à moitié prix),
- il la rend **légale** (le voyageur n'est le transporteur de rien),
- il la rend **défendable** face à Air Côte d'Ivoire (aucun colis de tiers dans un bagage personnel, la ligne rouge du dossier).

---

## 3. À qui on la vend

Quatre segments, dans l'ordre de facilité de conversion.

| Segment | Le déclencheur d'achat | Pourquoi le VSD lui va |
|---|---|---|
| **Diaspora active** (salariés, 25-50 ans) | Voir la famille sans poser de congés | Un seul jour posé, le vendredi. Il reprend le lundi matin. |
| **L'urgence familiale** (deuil, mariage, baptême, maladie) | Il faut y être ce week-end, et le billet de dernière minute coûte une fortune | Départ hebdomadaire fixe, prix connu à l'avance |
| **Petits commerçants et acheteurs** | Aller voir un fournisseur, un chantier, un local | Deux journées ouvrées pleines sur place |
| **Retraités et bi-résidents** | Ils y vont déjà plusieurs fois par an | Le prix leur fait multiplier les allers-retours |

**Le chiffre qui rend l'objectif crédible :** il faut convertir **10 personnes par semaine**, soit environ 500 par an. Sur une diaspora ivoirienne en France qui se compte en centaines de milliers, et sur une ligne qui existe déjà, c'est un taux de conversion minuscule. On ne cherche pas un marché de masse, on cherche dix personnes le vendredi.

---

## 4. Ce qu'il reçoit, ce qu'il accepte

C'est le cœur du contrat moral de l'offre. Il doit tenir en un écran.

**Ce qu'il reçoit**
- Un aller-retour Paris-Abidjan sur vol direct, **à partir de 430 €**
- **10 kg de bagage en cabine**, inclus
- **Ses deux nuits d'hôtel comprises** s'il prend la formule à 500 €
- Deux nuits pleines sur place, vendredi et samedi
- L'option **une seule valise de 23 kg en soute pour 49 €**, à titre exceptionnel
- Ses miles sMiles, sur un billet payant, comme n'importe quel passager
- Un accompagnement à l'aéroport le jour du départ (on est là, il n'est pas seul)

**Ce qu'il accepte**
- Des dates fixes : départ le vendredi, retour le dimanche, pas de modification
- De renoncer à sa franchise soute au-delà des 23 kg optionnels
- Un canal d'achat fermé, sur invitation ou inscription, sans vente publique
- De signer une attestation : il ne transporte aucun bien pour le compte d'un tiers

Cette dernière ligne n'est pas une formalité administrative. **C'est la protection du voyageur**, et il faut la lui présenter comme telle. Là où le GP informel fait porter au voyageur le risque douanier et pénal de ce qu'il transporte, ici il ne porte rien et ne risque rien.

---

## 5. Le prix, et ce qu'il économise

| | Montant |
|---|---|
| Aller-retour Paris-Abidjan au tarif public | de l'ordre de 650 à 900 € selon la période |
| Formule Le vol | **à partir de 430 €** |
| Formule Le vol et l'hôtel | **500 €**, deux nuits comprises |
| Avec la valise de 23 kg | **+ 49 €** |
| Ce qu'il économise sur le seul billet | **entre 220 et 470 €** |

> **Ce que « à partir de » veut dire, et il faut le tenir.** 430 € est un plancher, pas un tarif unique : il correspond au tarif bloc de 380 € plus 50 € de marge. Les départs de forte demande se vendent au-dessus. Si la compagnie remonte son tarif bloc, c'est le prix public qui monte, jamais la marge qui s'écrase.

**Le convoyeur n'est jamais payé.** C'est une décision de conception, pas un oubli.

Un voyageur payé pour porter quelque chose devient un prestataire de transport : il faut le déclarer, il engage sa responsabilité, et le montage ressemble à un réseau de porteurs rémunérés. Un voyageur qui bénéficie d'un tarif réduit reste un passager, purement et simplement. **Le même service, sans aucune des fragilités juridiques.** C'est ce qui nous distingue d'Airmule et de toutes les plateformes de covalisage qui ont fermé.

---

## 6. Le week-end type

| Quand | Ce qui se passe |
|---|---|
| **Vendredi 06h00** | Rendez-vous à CDG, l'équipe J'Envoie Express est sur place, enregistrement du fret sous son propre nom |
| **Vendredi 08h00** | Décollage |
| **Vendredi 13h30** | Arrivée Abidjan. Le voyageur récupère son bagage s'il en a un, et il est libre. |
| **Vendredi soir, samedi, dimanche matin** | Deux nuits pleines. Il fait ce qu'il est venu faire. |
| **Dimanche 15h30** | Décollage retour, avec le fret retour Abidjan vers Paris |
| **Dimanche 23h00** | Arrivée CDG. Il travaille le lundi. |

**Un seul jour de congé posé.** C'est l'argument le plus fort de toute l'offre, et il doit être dans la première ligne de chaque publicité.

Le retour n'est pas un détail : il porte la moitié du volume. Un dimanche à vide fait tomber la marge de la rotation à presque rien.

---

## 7. Le parcours, de la publicité à l'embarquement

1. **Il voit l'annonce** (Facebook, WhatsApp, bouche à oreille diaspora) : « Abidjan ce week-end, 430 € aller-retour, un seul jour de congé. »
2. **Il arrive sur une page** qui explique l'offre en trois blocs : le prix, les dates, la condition (pas de soute).
3. **Il choisit son week-end** dans un calendrier des départs ouverts.
4. **Il crée son dossier** : identité, passeport, statut administratif. Le filtre d'éligibilité s'applique ici, automatiquement.
5. **Il paie** et reçoit sa confirmation, avec le rappel de la condition en toutes lettres.
6. **On le prépare** dans la semaine : un message le mercredi, un le jeudi, le point de rendez-vous, ce qu'il peut emporter en cabine.
7. **Il voyage.**

Aucune de ces étapes ne demande une technologie nouvelle. La plateforme de réservation et de suivi est portée par Mr Attractor, elle s'appuie sur ce qui existe déjà dans l'app J'Envoie Express.

---

## 7 bis. Le paiement (cadrage du 23/07, rien n'est tranché)

**L'intention posée par Mac Arthur :** au moment de payer, le voyageur reçoit **un lien généré par la compagnie** dans le cadre du partenariat. Nos frais sont prélevés sur le flux et reversés instantanément, via **XPaye**. Le **paiement en plusieurs fois** viendra plus tard, quand le modèle aura fait ses preuves.

### La question à trancher avant toute chose : qui encaisse

Le sens du flux d'argent décide de qui possède le client. Ce n'est pas un détail technique.

| Montage | Ce qu'on y gagne | Ce qu'on y perd |
|---|---|---|
| **A. La compagnie encaisse tout** et nous reverse notre part | Zéro risque de trésorerie, zéro obligation réglementaire sur la vente du transport | Nous devenons apporteur d'affaires. Ils ont le client, la donnée de paiement, et le pouvoir de nous couper. Notre marge dépend de leur rythme de reversement. |
| **B. Nous encaissons tout** via XPaye et reversons le siège | Nous gardons la relation client et la marge à la source | Nous portons les remboursements, les litiges et la fraude, et la vente de transport au public est une activité réglementée |
| **C. Chacun encaisse ce qu'il vend** : la compagnie le billet sur son lien, nous notre service et nos options via XPaye | Chacun reste dans son métier et dans son droit, notre marge est encaissée directement, la relation reste partagée | Le voyageur fait deux paiements, il faut soigner l'enchaînement pour ne pas le perdre entre les deux |

**Retenu : le montage C.** C'est le seul où nous encaissons nos 50 € sans dépendre d'un reversement, et où nous ne vendons jamais du transport aérien à la place de la compagnie. XPaye n'a alors rien à voir avec le billet : il encaisse notre part, ce qui est exactement son rôle.

### Le montage C en détail

**Qui vend quoi, et qui encaisse**

| Ce qui est vendu | Par qui | Encaissé par | Montant |
|---|---|---|---|
| Le siège aller-retour | La compagnie | Son lien de paiement | 380 € |
| La valise de 23 kg, en option | La compagnie (c'est sa franchise) | Son lien de paiement | 49 € |
| Le service d'organisation VSD | Nous | XPaye | 50 € |
| **Total payé par le voyageur** | | | **430 €**, ou 479 € avec la valise |

Le prix affiché ne bouge pas. Ce qui change, c'est qu'il se règle en deux fois, à deux destinataires différents.

**L'ordre des paiements, et c'est là que tout se joue**

**Nos 50 € sont encaissés en premier**, au moment où nous confirmons la place. Le lien de la compagnie n'est envoyé qu'ensuite. Trois raisons, dans l'ordre d'importance :

1. **Nous sommes payés, toujours.** Notre marge ne dépend d'aucun reversement, d'aucun délai, d'aucune bonne volonté.
2. **Le voyageur s'engage.** Une liste d'attente gratuite se vide au moment de payer. 50 € versés, c'est un désistement qui devient rare, et c'est ce qui nous permet de tenir la promesse des dix sièges remplis chaque semaine.
3. **Le petit pas d'abord.** 50 € pour bloquer sa place se décide en une minute. 430 € d'un coup se réfléchit une semaine, et une semaine de réflexion sur un vol qui ferme dans dix jours, c'est une place perdue.

**Les règles à écrire avant le premier euro encaissé**

- Les 50 € ne sont encaissés qu'**après** vérification du dossier, jamais à l'inscription. Personne ne paie pour un voyage qu'il ne pourra pas faire.
- Si nous ne pouvons finalement pas fournir la place, les 50 € sont **remboursés intégralement**. C'est notre engagement, et il doit être écrit.
- Le voyageur a **48 heures** pour régler son billet sur le lien de la compagnie. Passé ce délai, la place repart à la personne suivante sur la liste, et les 50 € restent acquis : le travail de vérification a été fait. **Cette règle doit être lue et acceptée avant le paiement des 50 €**, jamais découverte après.

### Comment le présenter au voyageur : la friction devient l'argument

Deux paiements, c'est un inconvénient sur le papier. Sur ce marché précis, c'est notre meilleure preuve d'honnêteté.

La diaspora s'est fait avoir des dizaines de fois par des intermédiaires qui encaissent le prix d'un billet et disparaissent. C'est la peur numéro un, avant même le prix. Le montage C y répond frontalement :

> **« Votre billet, vous le payez à la compagnie. Directement, sur son propre système. Nous ne touchons jamais l'argent de votre voyage. »**

Cette phrase est impossible à prononcer pour un GP, pour un revendeur de kilos, pour n'importe quel intermédiaire du marché. Elle nous distingue en une ligne, et elle est vraie.

La séquence se raconte alors en trois temps simples, sans jamais parler de commission :
1. **Vous vous inscrivez.** Gratuit, aucun paiement.
2. **Nous validons votre dossier.** Passeport, éligibilité, date. C'est notre travail, et c'est ce que vous payez.
3. **Vous réglez.** 50 € qui bloquent votre place, puis votre billet directement à la compagnie.

Le mot à employer pour nos 50 € : **frais de réservation**. Pas « commission » (ce que gagne un intermédiaire), pas « frais de dossier » (ce qu'on paie pour rien). Des frais de réservation, tout le monde sait ce que c'est et personne ne les conteste.

Et ce qu'ils couvrent doit être réel et énumérable : la vérification du dossier et de l'éligibilité, l'accès au tarif fermé, l'accompagnement à l'aéroport le vendredi, le contact sur place pendant le week-end, l'assistance en cas de problème. À 50 €, c'est peu cher payé, et ça se défend en une phrase.

### Comment le présenter à la compagnie : leur rémunération n'est pas entamée

C'est l'argument le plus fort du montage C, et il est contre-intuitif.

Dans un modèle classique de commission, notre rémunération sort de leur recette : ils encaissent 430 € et nous en reversent 50. Visuellement, nous leur coûtons de l'argent, et chaque négociation devient une bataille sur le pourcentage.

Dans le montage C, ils encaissent **380 € nets par siège**, sans rien nous reverser, sans facture à traiter, sans créance à porter. **Notre rémunération est payée par le voyageur, pour un service que nous lui rendons et qu'eux n'ont pas à rendre.**

Ce qu'on leur dit :

> « Vous encaissez la totalité du prix du siège, sur votre propre système, sans nous reverser un centime. Le passager est dans votre PNR, il compte dans votre remplissage, il cumule vos miles. Nous nous rémunérons à côté, auprès du voyageur, sur le travail que nous faisons pour vous l'amener : le recrutement, la vérification des dossiers, l'accompagnement au départ et la gestion du fret. »

Trois bénéfices à souligner en séance :
- **Aucun flux financier entre nos deux sociétés sur les billets.** Pas de compte à régulariser, pas de litige de reversement, un montage qui ne crée aucune charge administrative chez eux.
- **Aucune dérogation à leur politique tarifaire au-delà du tarif bloc.** Ils vendent leur siège à leur prix négocié, point.
- **Le passager reste le leur.** C'est exactement ce qu'ils veulent, et ça nous coûte peu : nous, nous gardons la relation de service, celle qui fait revenir le voyageur.

### Ce qui reste à obtenir d'eux

1. **Le format du lien de paiement** : lien nominatif généré à la demande, ou code de réservation à régler en ligne ? Ça décide de notre délai de bouclage.
2. **Le délai de validité du lien**, qui doit être compatible avec nos 48 heures.
3. **Qui facture la valise** : sur leur lien avec le billet, ce qui est le plus propre, ou par nous en achat de franchise.
4. **Le point de bascule** : à partir de quand la place est réputée confirmée de leur côté, pour que nous ne bloquions jamais quelque chose qu'ils peuvent nous reprendre.

> **Attention au raccourci.** « La compagnie encaisse et XPaye nous reverse » ne fonctionne pas tel quel : XPaye ne peut prélever que sur un flux qui passe par lui. Si le paiement se fait sur un lien de la compagnie, c'est leur système qui reverse, pas XPaye. Il faut choisir : ou le flux passe par nous, ou le reversement est une écriture comptable entre eux et nous.

### Le point réglementaire à ne pas découvrir plus tard

**La formule à 500 € (vol + deux nuits d'hôtel) est un forfait touristique au sens du code du tourisme.** Vendre un forfait au public en France impose une immatriculation Atout France, une garantie financière et une responsabilité de plein droit sur le bon déroulement du séjour. Vendre le seul billet, ou vendre notre prestation d'organisation à côté d'un billet vendu par la compagnie, ne relève pas du même régime.

Trois façons de traiter ça, à valider avec un professionnel :
1. La compagnie vend le vol, **l'hôtel est réservé par le voyageur** avec notre code de réduction. Ce n'est plus un forfait, c'est un avantage négocié.
2. Nous nous adossons à **une agence immatriculée** qui porte le forfait.
3. Nous nous immatriculons, ce qui a un coût et un délai.

**Conséquence immédiate sur le site :** tant que ce point n'est pas réglé, la formule à 500 € reste masquée (`CONFIG.hebergement` sur `false`). La solution 1 est la plus rapide et ramène l'hébergement à ce qu'il était au départ, une réduction, pas un forfait.

### Le paiement en plusieurs fois, quand le modèle sera viable

À garder pour plus tard, avec une règle simple dès le départ : **le solde doit être encaissé avant la clôture des inscriptions**, dix jours avant le départ. Sinon nous immobilisons une place que nous ne pouvons plus revendre, sur un vol où chaque siège vide emporte aussi ses kilos de fret.

### Ce que ça change dans le parcours

L'inscription reste gratuite et sans paiement. La séquence devient : liste d'attente, appel de vérification du dossier, **puis** envoi du lien de paiement. Le paiement n'intervient jamais avant que nous ayons validé l'éligibilité du voyageur, ce qui nous évite d'avoir à rembourser quelqu'un qui n'aurait jamais dû pouvoir réserver.

---

## 8. Qui peut acheter

Reprise du filtre administratif du dossier convoyeurs, appliqué au moment de l'inscription. Il est éliminatoire, pas indicatif.

- **Résident en France à titre stable**, ou **binational avec un passeport ivoirien à jour et vérifié**
- Passeport valide au moins 6 mois
- Pas de visa à obtenir pour ce départ, sinon la rentabilité du voyage disparaît pour lui

Le piège à ne jamais oublier : **binational ne veut pas dire libre**. Sans passeport ivoirien valide, la personne redevient un voyageur soumis à l'e-visa, et l'offre ne tient plus pour elle. On exige la preuve, on ne présume rien.

---

## 9. Ce qui le fait revenir

Un client qui part une fois nous coûte cher en acquisition. Un client qui part quatre fois par an rend le programme rentable.

- **Les miles sMiles.** Il vole sur un billet payant, il cumule, il monte en statut. C'est le levier natif du partenariat, aucune plateforme concurrente ne peut l'offrir.
- **Le parrainage.** Il amène quelqu'un, il obtient une réduction sur son prochain départ. La diaspora fonctionne au bouche à oreille, c'est notre canal le moins cher.
- **Le calendrier.** Les départs sont hebdomadaires et publiés à l'avance. On ne vend pas un voyage, on installe une habitude.
- **Le nom.** Il ne dit pas « j'ai pris un vol pas cher », il dit « je pars en VSD ce week-end ». Le jour où l'expression circule seule dans la diaspora, l'acquisition ne coûte plus rien.

---

## 10. Les cinq lignes rouges

1. Jamais un colis de tiers dans le bagage personnel d'un voyageur.
2. Jamais un voyageur rémunéré pour son voyage.
3. Jamais un contenu que l'opérateur n'a pas emballé, pesé et scellé lui-même.
4. Jamais de vente publique du tarif, le canal reste fermé.
5. Rien de promis à un voyageur tant que l'accord écrit avec Air Côte d'Ivoire n'est pas signé.

---

## 11. Ce qui reste à trancher

**Chez nous, cette semaine**
- ~~Le nom commercial définitif.~~ **Tranché le 23/07 : VSD by Attractor.**
- La valise à 49 € : elle rapporte 490 € par rotation en marge quasi pure, mais elle coûte 230 kg de capacité. Arbitrée le 23/07 en **option exceptionnelle, une seule par voyageur**, ce qui limite la perte de capacité tout en gardant la recette.
- **L'hôtel partenaire à Abidjan.** C'est la condition de la formule à 500 €, et elle est tenue par un tiers. Objectif de négociation : la chambre nettement sous 50 € la nuit, sur les deux nuits du vendredi et du samedi, avec un contingent bloqué chaque semaine. Tant que ce n'est pas signé, la formule reste masquée sur le site.
- Le budget d'acquisition par rotation, aujourd'hui posé à 400 €.

**La règle de rareté, décidée le 23/07 (interne, ne figure nulle part sur le site)**
On affiche **7 places par départ**, on en embarque **10**, choisis dans la liste d'attente. L'affichage crée la tension, la liste d'attente nous laisse le choix des dossiers, et le voyageur n'est jamais lésé puisqu'on prend plus de monde que le nombre annoncé. La vente se fait **uniquement sur liste d'attente et à l'avance**, les inscriptions closes 10 jours avant le départ.

**Chez Air Côte d'Ivoire, dans l'accord**
- Le tarif du bloc siège, et surtout **le tarif du fret accompagné**. La cible est 1 à 1,50 €/kg. Chaque euro par kilo arraché vaut environ 760 € par rotation, soit 30 000 € sur une année.
- Le calendrier des périodes ouvertes au VSD.
- L'appui sur l'hébergement des deux nuits. S'il est obtenu, l'offre devient un week-end organisé et change de catégorie.
- La formation sûreté à l'opérateur, qui ouvre le chemin du statut de chargeur connu.

**Chez Jean Yves**
- Son coût réel au kilo, une fois le local et la main-d'œuvre en place. C'est le seul chiffre du modèle que lui seul peut produire.

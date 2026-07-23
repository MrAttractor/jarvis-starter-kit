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

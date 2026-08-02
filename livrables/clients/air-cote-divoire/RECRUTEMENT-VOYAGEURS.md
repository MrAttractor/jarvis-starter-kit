# VSD — recruter le vivier de voyageurs

> Créé le 02/08/2026. Dispositif opérationnel de la décision du §4 bis de `VSD.md`.
> **Ce document est fait pour être utilisé par Jean Yves**, pas pour être lu une fois.

---

## 1. Pourquoi on peut commencer maintenant

Le recrutement **ne dépend d'aucune réponse d'Air Côte d'Ivoire**. On ne vend rien, on ne
promet aucune date : on constitue une liste de voyageurs qualifiés et intéressés.

Et cette liste est un actif de négociation. Le business plan dit que la demande n'est pas
le frein, la capacité l'est. **Arriver devant la compagnie avec 30 voyageurs qualifiés
change la conversation** : on ne demande plus 4 sièges en espérant les remplir, on montre
une file d'attente qui justifie d'en obtenir 10, puis 20.

**Date-butoir inchangée** : sans visibilité d'Air CI vers le 10-12 août, le 4 septembre
tombe et on repositionne sur octobre. Le recrutement, lui, continue dans tous les cas.

---

## 2. À qui Jean Yves s'adresse en premier

Dans son fichier client, par ordre de pertinence :

| Rang | Profil | Pourquoi c'est lui |
|---|---|---|
| 1 | **Acheteurs et revendeurs** (pagne, wax, karité, cosmétiques, épices, artisanat, bijoux) | Ils partent les mains vides et rentrent pleins. La franchise du retour, c'est leur marchandise. Ils font déjà le trajet ou paient cher pour l'éviter. |
| 2 | **Bi-résidents et propriétaires** | Leurs affaires sont sur place, ils repartent chargés, 3 à 4 fois par an. |
| 3 | **Urgence familiale** (deuil, mariage, maladie) | On part sans préparer, on revient avec ce que la famille donne. |
| 4 | **Affaires, chantier, démarche administrative** | 72 h suffisent, petit volume. |

**Ne pas mettre en tête de campagne** la visite familiale classique : celui-là charge à
l'aller, c'est exactement l'inverse de notre besoin.

---

## 3. Le message de recrutement

À envoyer sur WhatsApp, un par un, jamais en diffusion de masse. Le nom de la compagnie
n'apparaît pas tant que rien n'est signé.

> Bonjour [prénom], c'est Jean Yves de J'Envoie Express.
>
> Je monte quelque chose qui devrait t'intéresser, et je pense d'abord à ceux avec qui je
> travaille déjà.
>
> L'idée : un aller-retour Paris-Abidjan sur un week-end, du vendredi au dimanche, à un
> tarif très en dessous du prix normal, avec une grosse franchise bagage au retour. Tu pars
> léger, tu fais tes achats sur place, et tu rentres chargé avec tes propres marchandises.
> Un seul jour de congé à poser.
>
> Sur place, tu n'es pas lâché : je peux t'accompagner sur les marchés, t'aider à négocier
> et à conditionner avant le retour.
>
> Je constitue la liste des premiers intéressés. Ce n'est pas encore ouvert à la vente,
> je préviendrai en priorité ceux qui sont sur la liste.
>
> Ça te parle ? Je te mets dessus ?

**Ce qu'on ne dit pas, et pourquoi :**

- **Aucune date ferme**, aucun prix précis tant que rien n'est signé. On annonce « très en dessous du prix normal », pas un chiffre.
- **Jamais le nom de la compagnie** avant l'accord : annoncer un partenariat non signé est une fausse déclaration.
- **Jamais « transporter des colis »** ni « on te paie ». Il achète pour lui, il n'est pas payé, et c'est ce qui rend tout le montage propre.

---

## 4. La grille de qualification

Cinq questions à poser avant d'inscrire quelqu'un. **La première est éliminatoire.**

| # | Question | Pourquoi |
|---|---|---|
| 1 | **Tes documents te permettent-ils de voyager sans démarche de visa ?** | Éliminatoire. Un dossier de visa ne tient pas dans nos délais. |
| 2 | Tu comprends que tu pars **sans bagage en soute à l'aller** ? | C'est le cœur du modèle, et ça surprend toujours. À dire tôt. |
| 3 | Tu es disponible **sur les deux dates**, départ et retour, sans modification possible ? | Les dates sont fermes. Un voyageur qui espère décaler son retour est un problème. |
| 4 | Tu peux **régler avant J-10** ? | Au-delà, la place repart à quelqu'un d'autre. |
| 5 | *(vol de lancement uniquement)* Tu acceptes d'**être filmé**, avec cession de droits ? | Une équipe de captation est à bord. À dire avant, jamais sur place. |

**Ce qu'on vérifie aussi, sans en faire une question** : qu'il achète bien pour son propre
compte. Si quelqu'un demande « je peux prendre les affaires de ma cousine ? », la réponse
est non, et c'est le moment de l'expliquer plutôt qu'à l'aéroport.

---

## 5. Ce que le voyageur doit avoir compris avant de payer

Cinq phrases, à lui faire répéter plutôt qu'à lui lire :

1. **Ce que je rapporte m'appartient.** Je ne transporte rien pour personne.
2. **Je ne suis pas payé.** Je bénéficie d'un tarif réduit, c'est ma seule contrepartie.
3. **Je pars sans soute** et je rentre avec ma franchise bagage.
4. **Les dates ne bougent pas.**
5. **Je déclare ce que je rapporte** si la douane me le demande, et j'en réponds.

C'est aussi ce qui protège l'agence : un voyageur qui a compris ça ne se transforme pas en
litige au retour.

---

## 6. Le suivi

Les statuts existent déjà en base (`vsd_inscriptions`) : `nouveau`, `rappele`, `eligible`,
`lien_envoye`, `paye`, `embarque`, `annule`. **Aucune interface ne les pilote encore** :
c'est le back-office de file d'attente, seul chantier technique qui ne dépend pas d'Air CI.

En attendant, tenir la liste à la main, avec pour chaque personne : prénom, WhatsApp,
profil (1 à 4), réponses aux 5 questions, et qui l'a cooptée. **Qui l'a cooptée compte** :
c'est la base de la commission d'apport de Jean Yves.

---

## 7. Ce qui reste à trancher avec Jean Yves

1. **Sa commission d'apport** par voyageur recruté. À fixer **avant** la première rotation.
2. Le partage de l'**accompagnement achat sur place** (hypothèse : 100 €, pris par la moitié des voyageurs, poste qui lui revient).
3. Qui répond au voyageur pendant la semaine : lui, ou l'agence ?

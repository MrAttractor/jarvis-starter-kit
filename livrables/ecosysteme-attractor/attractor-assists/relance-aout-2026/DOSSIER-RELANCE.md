# Relance Attractor Assists, 17 au 29 août 2026

> Ce document est le cadre du chantier. Il fait foi sur le périmètre, la définition de
> « prêt » et la gouvernance. Les trois autres documents du dossier en découlent.
> Ouvert le 17/08/2026, jour 1 de l'immersion d'Antso.

| Radar | |
|---|---|
| Statut | en cours, sortie de pause décidée par Mac Arthur le 17/08 |
| Échéance ferme | vendredi 28/08/2026, 17h00 |
| Chef de projet | Antso Nirina RAKOTOMANANA, en immersion PMSMP |
| Tuteur et décideur | Mac Arthur KOUASSI |
| Prochaine action | Recette du tunnel de bout en bout par Antso, œil neuf, J1 après-midi |

---

## 1. Ce que ce dossier connecte

Deux projets se rencontrent sur exactement les mêmes quinze jours.

**Le produit.** Attractor Assists est en pause depuis le 06/08/2026. Les chiffres relevés le
15/07 : 37 inscrits, 2 onboardings terminés dont Mac Arthur lui-même, 5 conversations,
0 abonnement. Le produit est réparé, il n'est pas rempli. La prochaine action écrite au
dossier n'était pas du code, c'était du terrain : recruter trois utilisateurs réels et
regarder où ils décrochent. Ce travail demandait du temps humain que personne n'avait.

**L'immersion.** Antso réalise une PMSMP du 17/08 au 29/08 (convention Immersion Facilitée
`ffa2ddc7-e4c0-40d9-96df-30eeeaf2a93c`, validée le 17/08 par Talent Solutions Tingari,
conseillère Yamina MOUMOU). Son objectif, dans ses mots : « avoir une vision plus précise
des tâches et des actions requises dans le métier, une vue globale mais concrète des
réalités de l'activité ». À la fin, il décide s'il se lance ou non, et son dossier part chez
France Travail pour financer sa formation Uncode School.

**Le point de jonction.** Un stage d'observation sans chantier réel ne montre rien du métier,
il montre une démonstration. Un chantier produit sans regard extérieur ne trouve pas ses
ruptures, parce que celui qui a construit le tunnel ne peut plus le voir. Les deux besoins se
répondent : Antso obtient le seul terrain qui répond à sa question, et le produit obtient la
seule chose qui lui manquait, un utilisateur qui ne sait rien et qui essaie vraiment.

---

## 2. La contradiction à signaler, et comment elle se résout

Le dossier produit posait deux conditions de reprise, et **aucune des deux n'est remplie** à
ce jour : ni un entrepreneur allé au bout du tunnel sans aide, ni la ligne des apps métier
finançant le développement.

La décision de relance de Mac Arthur prime sur cette règle, c'est l'ordre de priorité du
cerveau. Elle n'est pas contournée en silence, elle est écrite ici.

**Ce qui la rend défendable plutôt qu'impulsive** : la relance ne rouvre pas le développement
de fonctionnalités, qui est ce que la pause avait arrêté. Elle finance en temps humain
l'action de terrain qui était bloquée, et elle se donne quinze jours bornés avec une date de
sortie et un verdict écrit. Si le verdict du 28/08 est négatif, le produit retourne en pause
avec, pour la première fois, une raison mesurée plutôt qu'une intuition.

**Ce qui reste interdit pendant ces quinze jours** : ouvrir un chantier de fonctionnalité
nouvelle. Chaque heure va à faire fonctionner ce qui existe pour de vrais utilisateurs.

---

## 3. La définition de « prêt », à valider par Mac Arthur

« Le produit prêt » ne veut rien dire tant qu'on n'écrit pas à quoi on le reconnaît. Un
product builder qui laisse ce mot flou construit pendant deux semaines et n'a rien à montrer
le dernier jour. Voici le critère proposé, repris du critère d'acceptation déjà écrit au
dossier produit plutôt que réinventé.

**Est déclaré prêt le 28/08 à 17h00 un produit qui coche les quatre lignes suivantes.**

| # | Critère | Comment on le prouve |
|---|---|---|
| 1 | Le tunnel produit une boutique au moins équivalente à `boutiquecreal.com` | Comparaison écran par écran, sur téléphone réel |
| 2 | **Trois entrepreneurs réels** ont terminé l'onboarding **sans que Mac Arthur tienne la main** | Trois boutiques en ligne, relevé en base |
| 3 | **Au moins une commande réelle** passée par un vrai client final sur une de ces boutiques | Ligne en base, montant réel, entrepreneur qui confirme l'avoir reçue |
| 4 | Chaque marche du tunnel est mesurée | Tableau de décrochage, huit étapes, combien entrent, combien sortent |

Le critère 2 est le seul qui compte vraiment. C'est aussi la condition de reprise n° 1 du
dossier produit : si elle est atteinte le 28/08, la pause est levée pour de bon.

**Explicitement hors périmètre de ces quinze jours**, et ce n'est pas un oubli :

- la facturation récurrente automatique, XPaye ne sait pas prélever au mois, c'est un
  chantier structurel qui ne se règle pas en deux semaines et qui n'empêche personne de
  vendre aujourd'hui ;
- la suite de tests automatisés, réelle dette, mais qui ne fait entrer aucun utilisateur ;
- toute fonctionnalité nouvelle, quelle qu'elle soit ;
- la migration des 35 testeurs de mai, ils ne reviendront pas, on ne les compte plus.

---

## 4. Les rôles, et la limite juridique du stage

**Antso, chef de projet.** Il tient le tableau de bord, anime le point du matin, écrit le
relevé de décisions, prépare les arbitrages, teste, mesure, et présente l'avancement. C'est
le meilleur poste d'observation qui existe sur ce métier : le chef de projet voit tout le
monde travailler et comprend pourquoi chaque décision se prend.

**La limite, elle est nette et elle protège tout le monde.** Une PMSMP est une immersion, pas
un contrat de travail. Antso découvre le métier et réalise des gestes professionnels sous
tutorat. Il ne remplace pas un salarié, il ne produit pas de livrable facturé à un client, et
il n'est pas seul responsable d'une décision. Concrètement, dans ce chantier : il teste, il
mesure, il documente, il propose, il assiste aux rendez-vous réels. Il ne code pas en
production et il ne signe rien. Toute décision est prise par Mac Arthur, tracée par Antso.

**Mac Arthur, tuteur et product builder.** Il décide, il construit, et surtout il **pense à
voix haute**. C'est le cœur de la valeur pédagogique : Antso n'a pas besoin de voir un écran
de code, il a besoin d'entendre pourquoi on choisit ceci plutôt que cela. Un métier
s'apprend par ses arbitrages, pas par ses gestes.

**Contrainte réelle à assumer** : Mac Arthur est en CDD à la DGFiP. Il n'est pas disponible
huit heures par jour. Le programme est bâti là-dessus, avec deux rendez-vous fixes par jour
et un travail en autonomie entre les deux. Écrire l'inverse produirait un planning qui
s'effondre au jour 2.

---

## 5. Le plan produit sur dix jours ouvrés

Semaine 1, la vérité. Semaine 2, les utilisateurs.

| Jour | Date | Chantier produit |
|---|---|---|
| J1 | lun 17/08 | Cadrage, état des lieux honnête, recette du tunnel par un œil neuf |
| J2 | mar 18/08 | Liste des ruptures classées par gravité, choix de ce qu'on répare |
| J3 | mer 19/08 | Correctifs bloquants, passe de nettoyage des données de démonstration |
| J4 | jeu 20/08 | Instrumentation des huit marches du tunnel, on ne devine plus |
| J5 | ven 21/08 | **Présentiel Paris**, terrain, recrutement des trois entrepreneurs, enquête métier |
| — | sam 22/08 | Call général de fin de semaine 1, matin |
| — | dim 23/08 | Off |
| J6 | lun 24/08 | Entrepreneur 1 passe le tunnel, observé, chronométré, non aidé |
| J7 | mar 25/08 | Correctifs à chaud, entrepreneur 2 (demi-journée, bilan Activ'Projet d'Antso) |
| J8 | mer 26/08 | Entrepreneur 3, première commande réelle provoquée |
| J9 | jeu 27/08 | Recette mobile complète, comparaison à `boutiquecreal.com` |
| J10 | ven 28/08 | Mesure finale, verdict écrit |
| — | sam 29/08 | Call général de clôture, bilan PMSMP, décision d'Antso |

**Le rythme quotidien**, arrêté le 17/08 : point du matin de 8h45 à 9h00, autonomie, retour
du tuteur à 12h00, débrief de validation d'étape un jour sur deux, call général le samedi
matin, dimanche off. Le détail est dans `PROGRAMME-10-JOURS.md`.

---

## 6. Les trois risques, nommés d'avance

**Le recrutement des trois entrepreneurs échoue.** C'est le risque numéro un, et de loin.
Sans eux, aucun critère ne tombe. Parade : on ne commence pas à chercher au J5, la liste des
candidats se construit dès le J1 dans les contacts existants, et le J5 en présentiel sert à
closer en face à face, pas à prospecter à froid. Profil visé, écrit au dossier produit :
catalogue simple, déjà habitué à vendre par WhatsApp. Seuil d'alerte : si le J4 se termine
sans deux candidats confirmés, on le dit et on change de méthode.

**Le risque est plus élevé que prévu, mesuré le 17/08.** Le balayage des 26 dossiers clients
ne donne que **deux candidats propres**, deux autres étant bloqués par un devis en cours. Le
portefeuille de l'agence n'est pas un vivier d'utilisateurs pour ce produit, ce qui confirme
au passage que la distribution n'a jamais été traitée. Deux sources externes doivent donc
s'ouvrir dès le J2 : les 35 testeurs de mai, jamais rappelés un par un, et la prospection
physique en Île-de-France le vendredi 21/08. Détail dans `liste-candidats.md`.

**Le tunnel casse sur un point qu'on ne sait pas réparer en deux semaines.** Parade : la
recette du J1 se fait avant tout engagement, et le J2 arbitre. Si un blocage dépasse la
capacité du délai, il est écrit et le périmètre se réduit, il ne se cache pas.

**La disponibilité de Mac Arthur.** Parade : deux rendez-vous fixes quotidiens et rien
d'autre d'obligatoire. Un jour manqué décale le plan d'un jour, il ne l'annule pas.

---

## 7. Les documents du dossier

| Quoi | Fichier |
|---|---|
| Le cadre, le périmètre, la définition de prêt | ce fichier |
| Le programme jour par jour, produit et pédagogie | `PROGRAMME-10-JOURS.md` |
| Comment raisonne un product builder, le fond | `MANUEL-PRODUCT-BUILDER.md` |
| Les pièces PMSMP, enquête métier, trame de bilan | `DOSSIER-PMSMP-ANTSO.md` |
| L'état du produit, source de vérité | `../DOSSIER.md` |
| Le concept, source de vérité produit | `../concept-v3.md` |

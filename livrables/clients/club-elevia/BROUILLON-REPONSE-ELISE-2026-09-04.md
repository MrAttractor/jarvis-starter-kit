# Réponse à Élise, ses mails du 28/08, du 03/09 et sa reformulation

> **Remplace `BROUILLON-REPONSE-ELISE-2026-09-03.md`, devenu faux** : celui-ci renvoyait
> l'encaissement des adhésions à un devis complémentaire, ce qui est précisément le point
> qu'elle conteste. Arbitrage du 04/09 : le paiement entre dans les 3 000 €.
>
> **Décision du 04/09 : le devis complémentaire ne part PAS avec ce mail.** Événements,
> conciergerie et suivi des visites feront l'objet d'un échange séparé, plus tard. Le mail
> les nomme sans les chiffrer.
>
> **À faire avant d'envoyer :**
> 1. **Remplacer les trois documents en attente** dans le dossier de signature existant
>    (`94722c2d`) par les PDF régénérés. Le lien d'Élise ne change pas, c'est la consigne
>    de Mac Arthur du 04/09 : on ne recrée pas de dossier.
> 2. **Appliquer `0007_elevia_agents.sql`** pour qu'elle puisse entrer dans son back-office.

---

Objet : Re: Club privé Élévia, le vocabulaire clarifié, le périmètre élargi et la date

Bonjour Élise,

Ta reformulation est exacte, et je te confirme point par point.

## 1. Oui, c'est bien ça, et l'erreur de vocabulaire vient de moi

Quand j'écrivais « V1 », je désignais **la Web App complète**, celle que nous construisons, par opposition à une future application installable depuis les stores. Quand tu écrivais « V1, V2, V3, V4 », tu désignais **les étapes du chantier**, ce que j'appelle les phases 1 à 4.

Nous parlions donc de deux choses différentes avec les mêmes mots, et j'ai laissé cette confusion s'installer pendant deux mois. Pire : mes documents utilisent aussi « V4 » ou « V5 » pour désigner leurs propres numéros de révision. Trois usages du même sigle, c'était intenable.

**J'ai réécrit les trois documents pour que ça n'arrive plus.** Le mot « V1 » n'y figure plus une seule fois. À la place :

| Le mot | Ce qu'il désigne |
|---|---|
| **La Web App Élévia** | Ton Club, accessible depuis n'importe quel navigateur, sur téléphone comme sur ordinateur. C'est ce que nous construisons, et c'est complet |
| **Les phases 1 à 4** | Les étapes du chantier : maquettes, prototype, version testable, version finale. Elles aboutissent toutes à cette même application |
| **Les itérations** | Les allers-retours à l'intérieur d'une phase. Ta phase 1 en a compté trois avant que la direction visuelle soit arrêtée. C'est du travail normal, jamais facturé en plus |
| **L'extension mobile** | L'étape suivante : la même chose, dans une application installable depuis l'App Store et Google Play |
| **Révision 5, révision 6** | Les numéros de version des documents eux-mêmes, rien d'autre |

Le cahier des charges s'ouvre désormais sur une section qui explique ces mots avant toute chose.

## 2. Sur le budget, tu as raison sur un point, et j'en tire les conséquences

Mon estimation de départ était bien de 2 000 à 3 000 €. Tu as retenu le haut de la fourchette en pensant que cela couvrait un Club en état de fonctionner. C'est une lecture légitime, et le flou de vocabulaire a rendu la mienne illisible.

Surtout, ton argument de fond est juste : **un Club qui ne peut pas encaisser ses adhésions n'est pas un Club, c'est une démonstration.**

Donc je tranche, et je le fais dans ton sens :

- **L'adhésion et le paiement entrent dans les 3 000 €**, sans supplément. Le choix de la formule, la souscription, l'encaissement par carte, le renouvellement automatique, les relances en cas d'échec, l'arrêt à tout moment, et le suivi de tes adhésions dans ton espace d'administration. C'est un module entier, le cinquième, il est décrit en détail dans le cahier des charges révisé.
- **Les champs internationaux entrent aussi** : ville de résidence, langues parlées, attaches culturelles. C'était ta demande du 28 août.

Ce que cela représente : environ **huit jours de travail supplémentaires**, soit un peu plus de 1 000 € au tarif de ce projet. Je te le dis pour que ce soit clair des deux côtés, pas pour le facturer.

**En revanche, je maintiens le prix à 3 000 €**, et voici pourquoi, honnêtement.

Ce que tu reçois est plus large que ce que la fourchette de départ décrivait. À l'époque nous parlions d'un site de mise en relation. Aujourd'hui tu as une vérification d'identité par vidéo avec son back-office de décision, une suppression de données prouvée et horodatée, une protection contre les abus d'envoi, deux documents juridiques, et maintenant l'encaissement d'adhésions récurrentes. Descendre à 2 000 € reviendrait à financer les deux modules les plus lourds du projet, la mise en relation et la messagerie, avec 1 050 €. Ce n'est pas tenable, et je préfère te le dire franchement plutôt que d'accepter puis de livrer moins bien.

Sur les 950 € déjà versés, tu as déjà entre les mains deux modules livrés, mis en ligne et corrigés deux fois après tes propres tests.

## 3. Ce qui reste chiffré à part, et pourquoi

Avant tout, pour lever le doute : **tout ce que décrit le cahier des charges est construit et livré dans les 3 000 €**, du premier écran jusqu'au paiement de l'adhésion. Je ne retire rien de ce que nous avons cadré.

Ce qui suit n'a jamais figuré dans ce cahier des charges. Trois choses seulement, et aucune n'empêche ton Club d'ouvrir :

- **les événements du Club** et leur billetterie,
- **la conciergerie**,
- **le suivi des visites** et le bandeau de consentement qu'il rend obligatoire.

Ce sont des services qui s'ajoutent à un Club qui vit déjà, pas des conditions de son ouverture. Je te les chiffrerai le moment venu, séparément, quand tu sauras lesquels te servent vraiment. Rien à décider aujourd'hui là-dessus.

**Et l'extension mobile**, les applications installables depuis les stores, qui reste l'étape suivante du produit. Comme je te l'ai dit dès le début, je n'ai encore publié aucune application sur les stores, je ne vais donc pas t'annoncer un montant que je ne connais pas : ce sont des frais annuels, fixés par Apple et par Google, que tu leur verses directement, et je te les donnerai au moment d'ouvrir les comptes. Une fois la structure prête, il s'agit d'ouvrir un compte chez chacun des deux. Et surtout, **Apple et Google restent seuls juges** d'accepter une application. C'est pour cette raison que je construis dès aujourd'hui en respectant leurs critères, pour que ce passage ne demande pas de tout refaire.

## 4. Ce qu'il reste à construire, et la date

Trois modules : la mise en relation et le questionnaire d'affinités, la messagerie et la modération, l'adhésion et le paiement.

Il me faut de toi **quatre éléments**, et chacun bloque ce qu'il bloque :

| Ce que j'attends | Ce que ça débloque |
|---|---|
| Les questions du questionnaire d'affinités | La mise en relation, le cœur d'Élévia |
| Tes formules d'adhésion : intitulés, prix, durées, ce que chacune donne | Le module de paiement |
| Ton compte chez un prestataire de paiement, ouvert à ton nom | L'encaissement réel |
| Tes conditions de vente relues par un juriste (rétractation, résiliation, remboursement) | L'ouverture commerciale |

Les trois premiers me suffisent pour construire. Le quatrième peut arriver plus tard, mais avant d'accueillir un premier membre payant.

Si tu signes et que tu m'envoies le questionnaire et tes formules **avant le lundi 7 septembre** :

| Étape | Date |
|---|---|
| Démarrage | lundi 7 septembre |
| Version complète, que tu peux tester de bout en bout | lundi 5 octobre |
| Tes tests, les corrections et la mise en ligne | **mercredi 21 octobre 2026** |

Ces jours se comptent hors périodes où j'attends un élément de ta part. Chaque jour sans le questionnaire ou sans tes formules décale la date d'autant.

## 5. Les documents et la signature

Les trois documents sont réécrits et joints à ce message : l'avenant en révision 4, le cahier des charges en révision 5, le devis en révision 6. Le prix n'a pas changé, le périmètre a grandi, et le vocabulaire est clarifié.

**Ton lien de signature ne change pas.** J'y ai simplement remplacé les documents en attente par ces versions à jour, tu retrouves donc exactement le lien que je t'avais envoyé, valable jusqu'au 30 septembre. À recopier dans ton navigateur :

https://signature.agenceattractor.com/s/664e2w4y0v421z5q5s6i026d474q0v030f3k6e53646x1g6v

**J'ai déjà signé de mon côté**, il ne manque plus que toi.

Lis-les avant de signer, en particulier la section 0 du cahier des charges, qui est courte et qui fixe le vocabulaire, et le module 5, qui est nouveau.

## 6. Les trois adresses du projet

Recopie-les dans ton navigateur plutôt que de cliquer dessus : ma messagerie réécrit les liens que je t'envoie et cette réécriture périme au bout de 24 heures. C'est l'explication de tous les liens qui n'ont pas fonctionné depuis juillet, et de l'adresse en `http` que tu avais relevée.

| | |
|---|---|
| Ton Club, côté membre | https://demo.agenceattractor.com/elevia/app/ |
| Ton espace d'administration | https://demo.agenceattractor.com/elevia/admin/ |

Ton espace d'administration, tu ne l'as jamais vu : c'est là que se traitent les candidatures, et c'est là que t'attend la vidéo que tu as déposée le 8 août. Tu t'y connectes avec ton compte Élévia habituel.

Un point d'honnêteté avant que tu invites de vraies personnes : aujourd'hui, un membre dont tu valides la vidéo obtient son badge et s'arrête là. Il n'a encore personne à découvrir ni à qui écrire, puisque c'est exactement ce que contiennent les modules qui restent à construire.

## 7. Tes conditions d'utilisation et ta politique, version 1.1

Bon travail, et tes réserves sont saines. Tu as écrit plusieurs fois « sous réserve de confirmation par le prestataire technique ». Je te confirme par écrit, vérifié dans le code :

- **Aucune reconnaissance faciale, aucune analyse automatique du visage, aucune empreinte faciale, aucune comparaison à une base d'identités.** Une personne regarde la vidéo, c'est tout. Publiable sans réserve.
- **La vidéo est supprimée dans les 24 heures suivant la décision, et au plus tard après 30 jours sans décision.** Les deux règles sont dans la base, la suppression est horodatée donc prouvable. Publiable sans réserve.
- **Les vidéos sont dans un espace privé**, réservé aux personnes habilitées.
- **Les échanges sont chiffrés**, les codes de connexion expirent après 10 minutes, les tentatives et les demandes d'envoi sont plafonnées.
- **Aucun traceur, aucune mesure d'audience, aucun cookie publicitaire** aujourd'hui. Ta prudence est justifiée : le jour où le suivi des visites sera installé, cette section changera et un bandeau de consentement deviendra obligatoire.

Deux corrections de ton côté : trois adresses de contact différentes circulent dans tes documents, dont une avec un accent (`contact@ynlsociéte.com`) qui ne peut pas exister techniquement. Il en faut une seule. Et le champ des attaches culturelles doit rester libre et facultatif, sans liste imposée, pour ne pas devenir une donnée sensible au sens du règlement européen. Je l'ai déjà écrit ainsi dans le cahier des charges.

Enfin, je ne suis pas juriste : la relecture par un professionnel avant l'ouverture commerciale n'est pas une formalité, surtout maintenant qu'il y aura des adhésions payantes.

---

Élise, je veux aller au bout d'Élévia avec toi, et je crois que ce message lève les deux choses qui bloquaient : le vocabulaire, et ce que tu obtiens réellement pour 3 000 €.

Avec ta signature et tes deux listes avant lundi, ton Club ouvre le 21 octobre.

À très vite,

Mac Arthur KOUASSI
Mr Attractor

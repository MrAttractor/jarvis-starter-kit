# Beynaud / STAR FACTORY — l'état du dossier

> Révision du 19/09/2026 : **la plateforme s'appelle latiss.net**, voir la section du même
> nom. Révision précédente du 17/09/2026, coûts mesurés et stratégie de rentabilité.
> **Cette fiche est la première chose à lire du dossier.**
> Un chiffre ou un statut n'existe qu'ici. S'il apparaît ailleurs, c'est une copie à vérifier.

| Radar | |
|---|---|
| Statut | **le rapport de force a changé : c'est l'artiste qui demande maintenant.** Il veut diffuser ses concerts en direct, payants, exclusivement sur son site. Plateforme entièrement refondue le 13/09 (aperçu avant inscription, fil unique, inscription à un champ, **notifications en service**), elle reste **volontairement non diffusée** |
| Dernier contact | 2026-08-10, relance Latiss sur le protocole. **Sans réponse depuis 34 jours** |
| Prochaine action | **1.** Monter le contenu de démarrage : le fil tourne encore sur le jeu de test. **2.** Chiffrer l'offre live, c'est la seule chose qu'il ait demandée de lui-même. **3.** Envoi groupé à Latiss : la plateforme + l'offre live chiffrée + le protocole à signer |
| Échéance | à fixer avec la date du prochain concert, encore inconnue |
| Argent en attente | non chiffré, plateforme livrée sans contrepartie signée. **Le live est le premier poste qui engage de la trésorerie réelle** (voir `COUTS-LIVE-PRO.md`) |
| Coût de fonctionnement | mesuré le 17/09 : **~26 $/mois à 50 000 fans** hors vidéo exclusive, **+50 $ par vidéo exclusive vue par tous**. Aujourd'hui 0 $, mais sur un forfait gratuit **partagé avec tous les autres clients**, qui tombent ensemble s'il saute |
| Alerte juridique | **le protocole interdit à l'agence de se dire prestataire de Serge pendant 5 ans** (Art. 3). Clause de droit de référence à ajouter **avant** signature |

## En une phrase

La plateforme **latiss.net** est construite et en production, gratuite, à remplir de
vrais membres. **Le protocole d'accord n'est toujours pas signé**, mais depuis le 12/09
l'artiste demande lui-même une fonctionnalité payante, ce qui rouvre la négociation par
le haut.

## Le renommage du 19/09/2026 : de La Beynaumania à latiss.net

Décision de Mac Arthur. **Le nom s'écrit `latiss.net`, en entier, minuscules comprises.**
Pas « Latiss » : ce mot-là est déjà pris, c'est le nom que les fans donnent à l'artiste, et
l'application s'en sert dans ses propres phrases (« Sois prévenu quand Latiss poste »).
Écrire la plateforme avec son extension sépare les deux sens sans jamais avoir à choisir
lequel on veut dire. Une phrase comme « Latiss démarre, Latiss poste bientôt » n'existe pas.

**La marque s'écrit à la main.** Police Caveat en graisse 700, choisie sur planche contre
quatre autres : Great Vibes et Sacramento sont illisibles à 13 px, la taille réelle du nom
dans l'en-tête, et une signature qu'on ne lit pas n'est pas une signature. Elle sert là où
le nom se pose en tant que nom, et **nulle part où l'adresse doit être lue puis tapée** :
le titre de l'onglet, le manifeste, la notification et le message WhatsApp restent en
caractères ordinaires. Une adresse manuscrite dans un message WhatsApp ne se copie pas,
elle se devine.

Sur la page d'attente de `latiss.net`, la signature est **gravée en haut à gauche**, à la
place du carré rouge marqué d'un L, et le centre porte **OHWW LATISS**. Chacun son rôle :
écrire l'adresse aux deux endroits ne dirait rien de plus et ferait perdre à la signature
son statut de marque.

### Ce qui a été renommé, et ce qui ne l'a pas été

| | |
|---|---|
| Renommé | les textes vus par un fan, l'icône maskable (**BM** devient **L**), le nom du cache du service worker, le titre des notifications, le message d'invitation WhatsApp, les deux captures du manifeste |
| **Pas** renommé | les identifiants techniques : tables `bey_*`, fonctions `bey-public` et `bey-admin`, seau `bey-photos`, clé `bey_membre` du navigateur |
| **Pas** renommé non plus | `"id": "/beynaud/"` dans le manifeste, et le chemin `/beynaud/fan` |

**Pourquoi les identifiants restent.** Les renommer imposerait une migration de base et
ferait perdre sa session à chaque membre déjà inscrit, sans qu'un seul fan voie la
différence. Le `id` du manifeste, lui, est ce par quoi Android reconnaît l'application
déjà installée : le changer créerait une **seconde** application et rendrait orphelines
les installations existantes.

**Pourquoi le chemin reste, pour l'instant.** Des Ambassadeurs ont déjà partagé des liens
de parrainage en `demo.agenceattractor.com/beynaud/fan` sur WhatsApp. La bascule vers
`latiss.net` se fera avec la redirection des anciens liens posée le jour même, pas après.

## La refonte du 13/09/2026

### Le tunnel d'entrée : quatre écrans deviennent deux

Le visiteur traversait le clip, une page de garde, le formulaire, puis son espace.
Décision de Mac Arthur : **le clip, puis tout de suite le formulaire.** La page de garde
et son texte sont supprimés.

**Le clip a déménagé dans `fan.html`**, il ne vit plus sur une page à part. Motif trouvé
en cours de route et qui justifie à lui seul le déménagement : **le lien qu'un Ambassadeur
partage est construit depuis `fan.html`**, donc tous les liens de parrainage sautaient le
clip et tombaient sur le formulaire nu. Le tunnel était court-circuité par le moteur
ambassadeur lui-même. `.../beynaud/rejoindre` redirige désormais, en conservant le `?ref=`.

Le clip est celui de « Mariam, Attraper pour Laisser », **départ à 25 secondes** pour
éviter la carte de titre, dont le texte est coupé au recadrage portrait. Se change en une
ligne : MP4, lien YouTube ou image de repli. **Un membre déjà inscrit ne le revoit pas.**

### L'espace fan devient un fil unique

Les quatre rubriques (mot de Serge, photos, contenu exclusif, sondages) disparaissent au
profit d'**un seul fil chronologique dans la grammaire d'Instagram**. Chaque élément est un
post avec son cœur, ses commentaires et son partage, quel que soit son type : une photo se
like, une vidéo se commente. Le partage d'un post envoie le lien de parrainage, donc le
geste le plus naturel du fil est aussi celui qui fait grandir la communauté.

Le live reste **épinglé en tête** : il est ponctuel, il ne doit pas redescendre dans le fil.

Ça a demandé la **migration `0005`** : `bey_reactions` et `bey_commentaires` passent de
`message_id` à un couple `(cible_type, cible_id)`. La clé étrangère retirée emportait la
suppression en cascade, remplacée par quatre déclencheurs, sinon supprimer un post laissait
ses cœurs et commentaires orphelins et indestructibles (R-76). Vérifié en réel après deux
suppressions de photos : zéro orphelin.

### Le lecteur vidéo ne renvoie plus vers YouTube

La barre de contrôle de YouTube porte quatre sorties hors de la plateforme : le titre
cliquable, le bouton « Regarder sur YouTube », le partage et l'avatar de la chaîne. Elle est
supprimée et remplacée par des commandes maison. Plus de plein écran, plus d'annotations,
plus de raccourcis clavier, domaine sans cookies, suggestions de fin limitées à sa chaîne.
L'identifiant est réextrait du lien saisi et l'adresse entièrement reconstruite : ce que
Serge colle dans son tableau de bord n'a plus d'influence.

**Ce qu'on ne fait pas, volontairement** : recouvrir d'un calque ce qui reste atteignable.
Les conditions de YouTube imposent que leur lecteur reste joignable, et la chaîne de Serge
est l'actif du dossier. Gain mesuré au passage : **plus aucune iframe YouTube ne se charge
tant que le fan ne lance pas une vidéo**, contre trois auparavant à chaque ouverture.

### L'entrée : on montre avant de demander

Le visiteur arrivait sur un formulaire de trois champs sans avoir rien vu. Il voit
maintenant le clip, puis **trois publications réelles**, la dernière en fondu, puis une
porte qui annonce ce qui reste. Le formulaire n'arrive qu'au moment où il veut agir.

**La coupe est faite au serveur, pas à l'écran.** Sans compte, la fonction ne renvoie que
trois posts et retire le texte des commentaires. Tronquer à l'affichage aurait laissé tout
le fil dans la réponse, lisible dans les outils du navigateur. Le **nombre** de commentaires
survit à la coupe, volontairement : c'est la preuve sociale.

### L'inscription tombe à un champ

Le formulaire ne demande plus que le prénom. Le numéro était collecté depuis juillet et
**n'a jamais servi à contacter personne**, aucun envoi n'y était branché. Il est désormais
proposé plus tard, dans l'espace du membre, comme un filet : « ne perds jamais ton compte ».

Trois défauts réglés au passage :

1. **Connaître le seul numéro d'un fan suffisait à entrer dans son compte**, prouvé le 13/09
   sur le compte de test de Mac Arthur. La reprise exige maintenant le numéro **et** le
   prénom. Ce n'est pas une vérification, c'est un cran de plus en attendant un code à
   usage unique.
2. **Le même numéro existait en base sous trois écritures** (`+33753902323`, `0753902323`,
   `753902323`), donc trois comptes pour Mac Arthur lui-même, et la clé unique ne
   dédupliquait rien. Le serveur impose l'indicatif précédé d'un plus, convertit le `00`
   international, et refuse un numéro sans indicatif plutôt que de deviner le pays.
3. **« Désinscription à tout moment » était affiché sans aucun mécanisme**, et l'écran
   annonçait des actus WhatsApp qui n'ont jamais existé. La suppression de compte existe
   maintenant vraiment, commentaires compris. R-54.

### Les notifications, la pièce qui manquait

**Personne n'était prévenu de rien.** Le service worker ne contenait qu'un cache, l'écran
ne demandait jamais la permission, et la colonne `push_subscription` posée en juillet
n'avait jamais été remplie. Serge publiait dans le vide, et son tableau de bord lui
répondait « Diffusé à N membres » alors qu'aucune notification n'existait.

C'est en service depuis le 13/09, et **vérifié sur un vrai téléphone par Mac Arthur**.

L'envoi est écrit à la main dans `_partage/webpush.ts` plutôt qu'importé : c'est du
chiffrement, et une bibliothèque qui échoue sur ce moteur produirait des notifications qui
ne partent jamais, sans trace. Deux preuves avant livraison : le message chiffré puis
déchiffré avec la clé du destinataire revient identique, et le vrai serveur de Google
répond 410 et non 401 sur une adresse inventée, donc la signature est acceptée.

**La permission n'est jamais demandée à l'ouverture** : un navigateur à qui on demande trop
tôt refuse définitivement. Elle passe par une carte qui explique. Sur iPhone, la carte dit
qu'il faut ajouter la page à l'écran d'accueil, au lieu d'afficher un bouton inopérant.
C'est une vraie limite pour la diaspora en France.

Migration `0007` : une table plutôt qu'une colonne, un fan a souvent deux appareils. Les
abonnements morts sont retirés au lieu d'être retentés indéfiniment.

### Deux défauts corrigés

- **Le formulaire d'inscription clignotait une seconde** avant l'espace membre : le code
  attendait la confirmation du serveur avant de peindre. On peint désormais avec ce que le
  téléphone a gardé, on réconcilie après. Mesuré : 41 échantillons sur la première seconde,
  zéro image avec le formulaire. Une panne de réseau ne déconnecte plus, on ne sort que sur
  un refus explicite.
- **La plateforme est tombée une vingtaine de minutes** en cours de session : la migration
  a été lancée avant le déploiement des fonctions qui la lisent. Rien perdu en base. Fiche
  **EXP-042** et règle **R-77** au cerveau.
- **La carte des notifications ne s'affichait pas du tout**, sans erreur : `serviceWorker.ready`
  ne rejette jamais, elle reste suspendue quand il n'y a pas de service worker, et arrête
  tout le code qui suit. Trouvé en recette automatisée. Règle **R-78**.
- **Le bouton du clip disait « Rejoins la Beynaumania »** alors qu'il n'ouvre plus que
  l'aperçu. Il promettait une inscription et livrait une visite. Signalé par Mac Arthur.

## Le correctif du 14/09/2026 : l'écran noir au lancement

Signalé par Mac Arthur : « un ralentissement au lancement, l'écran est noir, on ne voit
que le bouton en bas ». Ce n'était pas une impression, et ce n'était pas le réseau.

**La photo de fond n'existait nulle part dans la page.** Elle était fabriquée par le
script, tout en bas des 80 Ko de `fan.html`. Le téléphone devait donc lire toute la page
et exécuter 1 200 lignes de code **avant même de réclamer l'image**. Entre-temps il
affichait ce qu'il avait : du noir et le bouton rouge. Sur une connexion mobile
ivoirienne, plusieurs secondes.

Trois aggravants trouvés au passage :

- la feuille de polices de Google **bloquait le premier affichage**, soit un aller-retour
  complet sur un domaine tiers avant le moindre pixel (276 ms mesurés depuis la France) ;
- les images sortaient en `max-age=0, must-revalidate`, donc **un aller-retour réseau à
  chaque visite** pour s'entendre dire que la photo n'avait pas changé ;
- le lecteur YouTube, plus d'un mégaoctet, démarrait **en même temps** que la photo et lui
  prenait la bande passante.

Ce qui a été fait :

| Quoi | Avant | Après |
|---|---|---|
| La photo est réclamée | après les 80 Ko de page et le script | dans l'en-tête, avec les premiers octets |
| Poids de la photo | 126 566 octets (JPEG) | **51 074 octets** (WebP, repli JPEG conservé) |
| Pendant qu'elle arrive | écran noir | une vignette floutée de Serge, **écrite dans la feuille de style, zéro requête** |
| Les polices | bloquent le premier affichage | ne le bloquent plus |
| Une visite de retour | revalidation réseau | 7 jours de cache (`_headers`) |
| Le lecteur YouTube | démarre avec la photo | démarre après elle |

**La vignette floutée est la vraie réponse à l'écran noir.** Elle coûte 200 caractères de
feuille de style et se peint en même temps que le bouton : même sur une connexion coupée,
le fan voit la silhouette de Serge et jamais un aplat noir. Le reste, ce sont des
secondes gagnées.

Règle **R-82** au cerveau, avec la liste des autres sites à repasser au même filtre.

## Le défaut du 14/09 : la page du visiteur était vide, et l'artiste avait le lien

Mac Arthur ouvre la plateforme sur son iPhone : après le bouton « Voir ce qui se passe »,
un écran noir, et une mention « Effacer mon compte » qui n'a rien à faire là.

**Une seule ligne**, dans la fonction qui peint l'aperçu du visiteur, visait un identifiant
`conc` **qui n'a jamais existé dans la page**. Elle était en plus inutile : le concours vit
dans la carte ambassadeur, déjà masquée deux lignes plus haut.

L'exception remontait et emportait les trois instructions suivantes du démarrage : **le clip
ne partait pas, et les publications n'étaient jamais demandées.** Le « Effacer mon compte »
resté à l'écran est le seul indice visible de l'endroit exact où le code s'est arrêté.

**Ce qui l'a caché.** Le défaut ne touchait **que le parcours du visiteur**. L'agence teste
toujours avec une session déjà en mémoire, donc sur l'autre branche du code. Le seul écran
que voit un inconnu, c'est-à-dire le seul qui convertit, était le seul jamais parcouru.

Le même parcours a été rejoué dans un navigateur piloté, en iPhone, **sur la version en ligne
avant toute correction** : `Cannot read properties of null`, zéro publication, « Effacer mon
compte » visible. La capture de Mac Arthur reproduite à l'identique. Puis sur la version
corrigée : trois publications, la porte d'inscription, aucune erreur.

Trois parades, pas une :

1. la ligne fautive est remplacée par un masquage **tolérant à l'absence** d'un nœud ;
2. **ce qui remplit l'écran part avant ce qui l'habille** : le clip, le squelette et l'appel
   des données d'abord, la peinture de la coquille ensuite, **isolée**, avec l'erreur
   journalisée et non avalée ;
3. **`recette-visiteur.js`** dans ce dossier rejoue le parcours de l'inconnu dans un vrai
   navigateur et échoue si le fil est vide, si le clip ne démarre pas, ou si quelque chose
   qui appartient au membre fuit. **À lancer avant chaque mise en ligne.**

Règles **R-83** et **R-84** au cerveau, fiche **EXP-044**.

### Les commandes YouTube étaient revenues

Signalé dans la foulée par Mac Arthur, capture à l'appui : pause, piste précédente et piste
suivante en plein milieu du clip. **Piste précédente et suivante n'ont aucun sens pour une
vidéo seule** : le lecteur était monté avec `loop:1, playlist:<id>`, donc il se croyait sur
une playlist et rallumait son habillage mobile. Ces paramètres étaient inutiles, le code
boucle lui-même. Retirés. C'est ce qui ramenait les sorties vers YouTube que la refonte du
13/09 avait fermées.

### La notification ne partait que pour le mot de Serge

Mac Arthur publie une photo, rien n'arrive sur son téléphone. La refonte du 13/09 a fondu
quatre rubriques en **un seul fil** où photo, vidéo, sondage et mot de Serge sont des
publications équivalentes. **À l'écran seulement** : sur les quatre chemins d'écriture, un
seul prévenait les abonnés. Les trois autres écrivaient en base et se taisaient.

Le piège : la notification avait été livrée la veille et vérifiée sur un vrai téléphone.
Elle marchait. **Elle ne marchait que sur le chemin testé.**

Les quatre chemins préviennent désormais, et le tableau de bord de Serge dit après chaque
publication ce qui est **réellement parti**, jamais le nombre de destinataires possibles.
Règle **R-85**.

À ce jour : **1 abonnement aux notifications** en base, pour 6 membres. C'est le téléphone
de Mac Arthur. Le chiffre ne veut encore rien dire, la plateforme n'est pas diffusée.

### Le tableau de bord de Serge : deux manques comblés

**Une vidéo ne pouvait ni se corriger ni se supprimer.** Elle se publie par un lien
YouTube (pas par envoi de fichier, contrairement aux photos), et il n'existait qu'un
interrupteur « masquer ». Un lien mal collé restait en base pour toujours. `content_update`
et `content_delete` ajoutés, boutons **Modifier** et **Suppr.** sur chaque ligne, et le
lien est désormais affiché sous le titre, puisque c'est justement ce qu'on vient corriger.
Une correction ne renotifie pas. Vérifié de bout en bout dans un navigateur piloté.

**Serge ne voyait pas le classement du concours.** L'action `classement` existait au
serveur depuis le 13/09 et n'était appelée que par l'espace fan. Son tableau de bord ne
montrait qu'un « Top ambassadeurs » par **nombre de filleuls bruts**, qui n'est pas le
score du concours : un point se gagne quand un filleul **active les notifications**, pas
quand il s'inscrit. Le classement est maintenant dans son tableau de bord, avec la saison,
les jours restants, le nombre en lice, les points confirmés, et un bouton pour le copier
tel qu'il le lira face caméra. Tant que personne n'a marqué, l'écran affiche la règle
plutôt qu'une liste de zéros.

**Ce que la démo montre aujourd'hui** : Saison 1, 48 jours restants, 0 en lice, 6 membres
qui peuvent jouer. Deux des six sont le même compte de Mac Arthur en double, séquelle du
numéro enregistré sous trois écritures avant le correctif du 13/09.

### La notification partait, Apple l'acceptait, et elle n'apparaissait pas

Deuxième signalement de Mac Arthur après le correctif de 9h. Le serveur répondait
`notifies: 1, echecs: 0`, et Apple acceptait bien le message. Le défaut était **sur le
téléphone**.

Le service worker posait **le même `tag` sur toutes les notifications**, avec `renotify`.
Or **iOS ne connaît pas `renotify`** : une notification qui réutilise un tag déjà présent
**remplace la précédente en silence**, sans bannière et sans son. Avec un tag fixe,
l'application n'alertait donc **qu'une seule fois dans sa vie**, et toutes les suivantes se
substituaient à elle sans rien dire. Le commentaire du code assumait ce choix, « un seul
fil de notifications plutôt que dix lignes empilées », et c'est exactement ce qui l'a rendue
invisible.

Chaque publication porte maintenant son propre tag. Deux ajouts pour qu'on n'ait plus jamais
à deviner :

- **un fan reçoit une notification de confirmation** dans la seconde où il les active.
  C'est la seule preuve que la chaîne marche de bout en bout, et elle vaut mieux qu'un texte
  qui promet qu'elle marchera ;
- action `push_test` dans `bey-public` : renvoyer une notification à soi-même sans rien
  publier.

**Attention au déploiement** : un service worker ne se met à jour qu'au relancement de
l'application. Tant que le téléphone n'a pas rouvert la Beynaumania, il tourne encore sur
l'ancien.

### La carte du monde remplace les barres

Demande de Mac Arthur : la carte à points de l'ancienne maquette était plus parlante que la
liste de barres. Elle était **fausse** : une grille décorative, des points posés à la main et
des chiffres inventés (« Abidjan 1 284 »).

La nouvelle est réelle. Le fond est une trame de points calculée à partir des contours des
continents, cadrée sur Amériques + Afrique + Europe, 33 Ko. Projection équirectangulaire,
donc un lieu se pose au bon endroit par une règle de trois, sans bibliothèque. Le champ
`lieu` étant saisi librement, un répertoire d'environ 120 entrées reconnaît les villes et
pays qui comptent pour cette audience, accents et raccourcis compris (`abj`, `yakro`,
`ouaga`, « Cocody, Abidjan »). **Ce qui n'est pas reconnu est cité sous la carte**, jamais
jeté en silence.

### La refonte du tableau de bord : onze blocs deviennent trois écrans

Constat de Mac Arthur : « le fil du pilotage s'allonge ». Onze cartes sur un seul
défilement, et une carte de plus à chaque fonctionnalité.

**Le vrai problème n'était pas la longueur.** Le geste principal, publier, vivait dans
**cinq formulaires séparés** : le mot, la photo, la vidéo, le sondage, le live. Alors que
pour Serge c'est un seul geste, et que le fil du fan les traite déjà comme des publications
équivalentes depuis le 13/09.

| | Avant | Après |
|---|---|---|
| Navigation | onze blocs empilés | **trois onglets** en bas : Publier, Communauté, Modération |
| Publier | cinq cartes éparpillées | **un bloc**, un sélecteur de type, cinq formulaires |
| Ce qui est publié | quatre listes dans quatre cartes | **une liste unique**, filtrable, dans l'ordre du fil du fan |
| Un mot déjà diffusé | ni relisible, ni corrigible, ni supprimable | Modifier et Supprimer, comme le reste |
| En ouvrant | il faut chercher | **une ligne d'état** : combien de fans, combien cette semaine, ce qui attend son avis |
| Commentaires en attente | à aller voir | **une pastille** sur l'onglet |

L'onglet ouvert est retenu d'une visite à l'autre.

**Deux ajouts côté serveur** : `message_list`, `message_update` et `message_delete`. Le mot
de Serge avait exactement le même manque que les vidéos ce matin, il était publié et plus
rien ne permettait d'y revenir.

**Le défaut de ce matin a failli revenir.** Les fonctions `togglePoll` et `toggleAdd`
visaient les conteneurs repliables supprimés par la refonte. Un nœud absent, la fonction
s'arrête, et tout ce qui suit avec. C'est **R-83**, trouvé cette fois par la recette avant
la mise en ligne et non par Mac Arthur après.

**Contrôlé avant livraison** : les trois onglets, les cinq types du composeur, les cinq
filtres, la barre du bas qui ne recouvre plus la dernière ligne, **aucun débordement et
aucune zone de tap sous 44 px sur les six résolutions de référence**, et le parcours du
visiteur rejoué pour vérifier qu'il n'a pas bougé.

### Le mode clair, demandé le 14/09

Une bascule clair / sombre sur le fil du fan et sur le pilotage de Serge. Bouton de
44 px dans l'en-tête, l'icône montre ce qu'on va obtenir et pas ce qu'on quitte : soleil
en sombre, lune en clair. **Sombre par défaut**, c'est l'identité de la Beynaumania ; le
choix du fan est retenu d'une visite à l'autre, et la couleur de la barre du téléphone
suit, sinon un iPhone garde un bandeau noir au-dessus d'une page claire.

**Un seul jeu de jetons change, aucune règle de mise en page n'est dupliquée.** Le thème
se pose sur `<html>` par un script de quatre lignes dans le `<head>`, avant le premier
pixel : lu plus tard, l'écran clignoterait en noir avant de passer en clair.

**Les trois blocs photo restent sombres dans les deux thèmes** : l'écran d'entrée, le
bandeau du fil et l'écran d'inscription. Un texte posé sur une photo éclaircie n'a plus
de contraste garanti, et cette photo est l'identité. La parade n'est pas d'épingler les
couleurs une par une, c'est de **redéclarer le jeu sombre à l'intérieur de ces blocs** :
tout ce qui y sera écrit plus tard sera juste d'office. La première version épinglait à
la main, et elle en avait oublié trois.

**L'or de la charte ne passe pas sur du blanc : 2,1:1.** Il descend à `#7A5906` pour le
texte en mode clair, l'aplat or ne bouge pas. Le rouge `#CC0000` descend à `#B80000`, ce
qui fait repasser d'un coup toute la famille rouge sur fond clair, la pastille EN DIRECT
comprise. Ces valeurs sont **calculées, pas choisies à l'œil** (R-24).

**Le thème sombre n'a pas bougé d'un pixel.** Chaque valeur d'origine a retrouvé son
jeton : la première passe avait fondu `.08` et `.16` dans un même jeton de piste, et
`.12` / `.15` / `.28` dans un même jeton de bordure, ce qui aurait discrètement modifié
une application en ligne.

**Un défaut visuel que le débordement horizontal n'aurait pas vu.** Ajouter un bouton de
44 px dans l'en-tête du pilotage faisait passer « LA BEYNAUMANIA » sur deux lignes, sans
le moindre débordement. Le nom est masqué sous 430 px, le logo BM suffit, et la recette
mesure désormais la hauteur de l'en-tête.

**Contrôlé avant livraison**, par `recette-theme.js` : le rapport de contraste **de chaque
texte affiché**, dans les deux thèmes, sur les six résolutions de référence, transparences
composées et fonds en dégradé compris. Le même texte étant mesuré deux fois, la recette
sait dire ce que la bascule a cassé et ce qui n'allait pas avant elle.

**Verdict : zéro régression.** Tout texte qui passait en sombre passe en clair, et les
44 textes sous le seuil en sombre passent tous en clair. Le parcours du visiteur a été
rejoué pour vérifier qu'il n'a pas bougé (R-84).

**En ligne depuis le 14/09/2026**, branche `master` du projet Pages `demo-agenceattractor`.
Les deux recettes ont été **rejouées sur la version en ligne** après le déploiement, pas
seulement sur les fichiers locaux, et le domaine sert bien le même contenu que l'URL du
déploiement direct (R-61 : si les deux sont identiques, le cache ne ment pas et la branche
de production était la bonne). **Reste à ouvrir les deux thèmes sur un vrai téléphone**
avant de considérer la bascule finie : les tests automatisés vérifient la plomberie
imaginée par le développeur, jamais le navigateur réel (R-51).

**Ce que la recette signale et qui est antérieur à la bascule**, donc à arbitrer à part :

| Quoi | Mesure | Dans quel thème |
|---|---|---|
| « Inviter sur WhatsApp », blanc sur le vert WhatsApp | **1,98:1** | les deux |
| L'initiale noire des pastilles Ambassadeur (dégradé or) | **4,13:1** | les deux |
| Les boutons d'action du fil (cœur, bulle, partage) | **39 px de large** | les deux |
| 44 textes secondaires de la charte sombre | 2,55 à 4,50:1 | sombre seulement |

Le cas WhatsApp est le seul vraiment illisible. La parade de R-24 est d'inverser, texte
sombre sur l'aplat vert, ce qui donnerait 10,7:1. **Ce n'est pas fait** : c'est la
reproduction délibérée du bouton de WhatsApp, dont la convention est le blanc sur vert.
C'est un choix de direction artistique, pas une correction technique.

## Le compte se duplique, et ça explique les deux symptômes du 14/09

**Ce que Mac Arthur signale.** Il active les notifications, l'application le lui redemande.
Il vote, et au retour il doit voter à nouveau.

**Mesuré en base, pas supposé.** Il existait **trois comptes « Mr Attractor »**, créés le
13/09 à 20h28, le 14/09 à 06h54 et le 14/09 à 12h13, et **chacun portait exactement un
vote**. Deux portaient un abonnement de notification Apple distinct. Les deux symptômes n'en
font qu'un seul : à chaque fois c'est une identité neuve, donc l'état de la précédente
n'est plus le sien.

**La cause, en trois maillons.**

1. Le numéro est **facultatif depuis le 13/09**, donc le formulaire ne demande que le
   prénom et les trois comptes avaient `whatsapp: null`.
2. Côté serveur, le dédoublonnage de `join` n'existe **que si un numéro est fourni** :
   sans numéro, l'insertion est directe. On ne peut pas dédoublonner sur le prénom, deux
   fans peuvent s'appeler pareil. L'identité ne vit donc que dans le `localStorage`.
3. Sur iPhone, **Safari, l'app installée et le navigateur interne de WhatsApp sont trois
   stockages séparés**. Entrer par une autre porte, c'est ne pas être reconnu, donc créer
   un compte.

**Et la porte de retour est condamnée.** « Déjà membre ? Retrouver mon espace » réclame le
numéro WhatsApp. Sans numéro enregistré, cette porte ne peut pas s'ouvrir. Le filet existe
(`.filet`, proposé dans l'espace et jamais à la porte, à raison), mais Mac Arthur ne l'avait
jamais rempli, donc il n'avait aucun ancrage.

**Le défaut avait déjà été vu, et seulement déplacé.** Le commentaire de `logout()` dit
« Constaté le 13/09 : quatre comptes pour une seule personne en une heure ». Le bouton de
déconnexion a été retiré en réponse. Ce n'est donc plus la déconnexion qui duplique, c'est
le changement de porte : la cause était l'absence d'ancrage durable, pas le bouton.

**Ménage fait le 14/09**, migration `0010_menage_comptes_doublons.sql`, exécutée et vérifiée.
Reste un seul compte, `MRATTR0IB`. **Ce n'est pas le plus récent, et c'était le piège** :
`parraine_par` stocke le **code ambassadeur en texte sans aucune clé étrangère**, et
`MRATTR0IB` portait les deux seuls parrainages réels de la plateforme, Cynthia et Mano.
Garder le compte le plus récent, qui est le réflexe, aurait fait disparaître ces deux
parrainages du classement **sans lever la moindre erreur**. Même famille que R-76.

**Preuve que ça avait déjà frappé** : Dany et Camille-Coralie étaient marquées parrainées par
`MACOCO0UQ`, un code n'existant dans aucun compte, résidu d'un ancien compte de test
supprimé. Les références mortes ont été retirées et le compteur `filleuls` recalculé depuis
les faits. Le compte Dany et son commentaire ont été supprimés à la demande de Mac Arthur.

**Deux choses restent ouvertes.**

- **L'ancrage durable n'existe pas**, donc un quatrième compte naîtra à la prochaine entrée
  par une porte neuve. La parade immédiate coûte zéro ligne : le **lien d'accès personnel**
  (`/beynaud/fan?m=<jeton>`) existe déjà et prime sur tout, il suffit de le donner au membre
  pour qu'il le garde. La parade propre est un code à usage unique par e-mail ou WhatsApp,
  mais elle **contredit la décision du 13/09** de ne demander qu'un prénom à la porte : à
  arbitrer, pas à trancher en silence.
- **`recover()` est faible** : `action:'me'` avec un numéro et un prénom suffit à entrer dans
  le compte d'un fan. Le code l'admet lui-même, « ce n'est pas une vérification ». À traiter
  avant que la plateforme ait de vrais fans, pas après.

**Résidu connu et non traité** : un commentaire « Oui Fami ! » du 11/07 signé « Macoco »
reste visible, son compte ayant été supprimé avant que `bey_commentaires` soit nettoyé.
`bey_commentaires` est en `SET NULL` et porte une colonne `prenom` dénormalisée, donc le
commentaire survit à son auteur. Une ligne de SQL suffit à le retirer, en attente d'accord.

## L'exclusivité est fictive, et c'est le vrai sujet

Vérifié le 13/09 : les trois « contenus exclusifs » du fil sont **publiquement lisibles sur
la chaîne officielle de Serge** (« Attraper pour Laisser », un « Behind the Scene S4 », un
audio DJ CDR). N'importe qui les regarde sans jamais rejoindre la Beynaumania.

Fermer les portes du lecteur ne change rien à ça : ce n'est pas la porte qui fuit, c'est que
le contenu est déjà dehors. **C'est aussi l'argument que Latiss attend** : la plateforme ne
vaut que si elle donne accès à ce qui n'est nulle part ailleurs.

**Décision de Mac Arthur du 13/09 : on ne change pas d'hébergement maintenant.** On garde
YouTube et le lecteur fermé, et la question se tranche quand Latiss aura répondu et que le
modèle sera signé. Motif : ne pas construire une infrastructure de plus sans contrepartie
signée, ce qui est déjà le risque n°1 du dossier.

Les options chiffrées, pour le jour où : **Cloudflare R2** sort du lot, la bande passante
sortante n'y est pas facturée, donc une vidéo vue par 5 000 fans coûte ~0 € contre ~25 $ sur
Cloudflare Stream, avec de vraies URLs signées. R2 ne sait en revanche ni faire de qualité
adaptative ni diffuser un direct : **le live restera sur Stream**, déjà chiffré dans
`COUTS-LIVE-PRO.md`.

**Ce qui manque encore** : le contenu de démarrage. Le fil tourne sur le jeu de test.

### Le dépôt direct de vidéos : tranché le 14/09, en phase 2

Mac Arthur demande de pouvoir **déposer une vidéo directement**, sans passer par YouTube.
C'est la fonctionnalité qui rend l'exclusivité réelle, donc elle répond au sujet ci-dessus.

**Séquence arrêtée le 14/09, et elle confirme la décision du 13/09** : relance de Latiss
pour son retour, puis signature du contrat et **répartition des charges**, et seulement
ensuite la phase 2 technique. Rien ne se construit avant. Motif inchangé : pas
d'infrastructure de plus sans contrepartie signée.

**Le geste attendu, spécifié pour le jour où** (les trois, pas un seul) :

1. Choisir une vidéo dans la galerie du téléphone, mettre une légende, publier. Le geste
   exact de la photo aujourd'hui.
2. Filmer sur le moment, l'appareil s'ouvrant depuis l'app. Un attribut de plus sur le même
   champ, quasi gratuit si le point 1 est fait.
3. **Garder le lien YouTube en parallèle** : YouTube pour ce qui est public et sert de
   téaser, dépôt direct pour ce qui est réservé aux membres et aux Ambassadeurs.

**Le chemin actuel ne peut pas porter une vidéo, et ce n'est pas une question
d'optimisation.** La photo part en base64 dans le corps de la requête et la fonction la
décode en mémoire. Les fonctions Supabase ont une **limite de 150 Mo de mémoire
d'exécution** ; une vidéo de téléphone de 3 minutes pèse environ 150 Mo, soit ~200 Mo en
base64, plus les octets décodés. Il faudra que le navigateur envoie le fichier **directement
à l'hébergeur**, la fonction ne délivrant qu'une autorisation d'écriture à usage unique.

**L'hébergement reste la seule question ouverte**, et elle se tranche avec la répartition
des charges parce que c'est une charge variable :

| | Cloudflare R2 | Cloudflare Stream | Supabase Storage |
|---|---|---|---|
| Diffusion, 3 min × 1 000 fans | **0 $** | 3 $ | 13,50 $ |
| Modèle de facturation | stockage seul, 0,015 $/Go/mois | 1 $ / 1 000 min vues + ~5 $/mois | 0,09 $/Go sortant |
| Qualité adaptative | non | **oui** | non |
| Fan à Abidjan en 3G | dépend du poids qu'on dépose | **joue toujours** | 150 Mo ou rien |
| URL signée, exclusivité réelle | oui | oui | **non, URL publique** |
| Le direct | impossible | **oui** | impossible |

Supabase Storage est écarté : URL publique, donc pas d'exclusivité, et le plus cher des
trois. **Le vrai arbitrage est R2 contre Stream** : payer Stream pour ne jamais se soucier
du réseau des fans, ou prendre R2 sans frais de diffusion en acceptant de maîtriser le poids
des fichiers à la main, ce qui suppose de transcoder avant de déposer. Le live reste sur
Stream dans les deux cas, c'est tranché et chiffré dans `COUTS-LIVE-PRO.md`.

**Ce que ça change à la table de négociation.** Sur R2 le coût de diffusion est nul et ne
dépend pas du succès. Sur Stream il monte avec l'audience de Serge, ce qui est l'argument
même d'un partage de revenus plutôt que d'un forfait. La question d'hébergement n'est donc
pas seulement technique, elle instruit la clause de répartition des charges.

**Préférence exprimée par Mac Arthur le 14/09 : Cloudflare Stream.** Elle a été formulée sur
un comparatif à deux colonnes qui **omettait R2**, l'option que la note du 13/09 mettait en
tête. À reprendre avant la phase 2, avec les trois colonnes.

## Le partenaire

**Serge GNOLOU, dit Serge Beynaud**, artiste afrobeat ivoirien, structure **STAR FACTORY**.
Environ 10 millions d'abonnés cumulés toutes plateformes.

> **Correction du 14/09/2026, par Mac Arthur.** **Latiss, c'est Serge Beynaud lui-même**,
> le petit nom que ses fans lui donnent, une version drôle de l'artiste. Cette fiche
> écrivait depuis juillet « Interlocuteur : Latiss » comme s'il s'agissait d'une personne
> distincte, un manager. **C'était faux.**
>
> Conséquence à lire dans tout ce dossier : partout où il est écrit « Latiss relancé,
> sans réponse », **c'est l'artiste en personne qui ne répond pas**, pas un intermédiaire.
> Ce n'est pas la même chose, et ça change la lecture du silence depuis le 10/08.
>
> Côté produit, « Latiss » est le nom employé face aux fans, parce que c'est le leur
> (R-38). « Serge Beynaud » reste le nom officiel.

Accord de principe obtenu à Paris le 01/07/2026. Sa vision : projet de long terme, la
plateforme devient l'outil de conversion de sa communication publique, le contenu exclusif
est la valeur à monétiser, et le modèle vise le volume plutôt que le prix unitaire.

## Le risque principal de ce dossier

**L'agence a construit avant de faire signer.** La plateforme est livrée, le protocole
d'accord est prêt depuis le 01/07 et attend toujours un retour. C'est un pari assumé
(logique cheval de Troie : la vraie contrepartie est la visibilité de Serge), mais il faut
le savoir en le relançant.

Trois clauses engageantes dès signature : **NDA 5 ans**, **non-contournement 24 mois**,
**exclusivité de négociation 90 jours**. Puis 5 jalons avant le contrat définitif.

**À compléter avant signature** : la qualité du représentant de STAR FACTORY, le RCCM, les
coordonnées, et le montant de l'indemnité forfaitaire de non-contournement.

## Ce que la plateforme coûte réellement — mesuré le 17/09/2026

> Jusqu'ici ce dossier chiffrait le live (`COUTS-LIVE-PRO.md`) et rien d'autre. Le coût de
> la plateforme au repos n'avait jamais été mesuré. Il l'est ici, sur la production, pas
> en théorie. **Les chiffres du live restent dans `COUTS-LIVE-PRO.md`, ils ne sont pas
> recopiés ici.**

### Les mesures, sur la production

| Quoi | Mesure |
|---|---|
| Une ouverture de page (appel `feed`) | 265 à 300 ms, 7,5 Ko de JSON |
| Le premier appel après une période creuse | 590 ms, réveil de la fonction |
| Poids des photos du fil | 136, 184 et 328 Ko. **Moyenne 211 Ko** |
| En-tête de cache des photos | **`Cache-Control: no-cache`** |
| Base de données | 42 Mo sur les 500 Mo du forfait gratuit |
| Membres réels | 9, dont **3 avec un WhatsApp**, 2 abonnés aux notifications |

Deux défauts se lisent directement dans ces mesures.

**Les photos ne sont jamais redimensionnées.** Ce sont des fichiers d'appareil photo servis
tels quels. Une photo de fil devrait peser 60 à 80 Ko en WebP, pas 211 Ko en JPEG.

**Les photos ne se mettent pas en cache.** Le `no-cache` est le réglage par défaut de
Supabase Storage, que personne n'a changé. Chaque ouverture de l'app refait un aller-retour
réseau pour chaque photo. Sur une 3G à Abidjan, c'est de l'attente à chaque visite.

### Le forfait, et le vrai danger

Le projet Supabase est en **forfait gratuit**, et il est **partagé par tous les clients de
l'agence** : 245 tables, celles de la Beynaumania à côté de J'Envoie Express, Élévia,
Ayêla, Vies Croisées et Attractor Assists.

**Le quota est celui du projet, pas de l'application.** Si la Beynaumania le fait sauter,
Supabase restreint tout le projet : les autres clients tombent en même temps. Un lancement
réussi chez Serge devient une panne chez tout le monde. **C'est aujourd'hui le point de
rupture unique de tout le portefeuille de l'agence**, et ce n'est pas un risque propre à ce
dossier.

### La projection à 50 000 fans

Hypothèses posées : 50 000 inscrits, Serge publie 12 fois par mois, un fan ouvre l'app
8 fois par mois.

| Poste | Par mois |
|---|---|
| Réponses JSON du fil | 2,9 Go |
| Photos telles qu'elles sont | **120,6 Go** |
| **Total de sortie réseau** | **123,4 Go** |

Soit **25 fois le plafond gratuit de 5 Go**. En forfait Pro, Beynaud seul consomme **49 %
des 250 Go inclus**, alors que huit autres clients partagent le même projet.

Les appels de fonction atteignent **400 000 par mois, soit 80 % du plafond gratuit**, pour
un seul client.

Et le pic de lancement, si 50 000 personnes arrivent en une heure : **14 ouvertures par
seconde, soit 83 requêtes SQL par seconde** sur la plus petite machine que Supabase
propose.

### La facture mensuelle à 50 000 fans

| Poste | Coût |
|---|---|
| Supabase Pro | 25 $ |
| Photos servies par Cloudflare | 0 $ |
| Le site sur Cloudflare Pages | 0 $ |
| Notifications push | 0 $ |
| Domaine | ~1 $ |
| **Sous-total, sans vidéo exclusive** | **~26 $ / mois** |
| 1 vidéo exclusive d'une minute vue par 50 000 fans | **50 $** |
| 4 vidéos exclusives par mois | **200 $ / mois** |

**La lecture qui compte pour la négociation : la facture monte avec l'audience de Serge, pas
avec le travail de l'agence.** C'est l'argument central d'un partage de revenus plutôt que
d'un forfait, et il est maintenant chiffré au lieu d'être affirmé.

### Les trois correctifs à faire avant tout lancement

Ils ne dépendent d'aucune décision de Latiss et divisent la facture par quatre.

1. **Redimensionner les photos au dépôt.** 211 Ko qui deviennent 70 Ko, c'est 80 Go de
   sortie en moins par mois et une app trois fois plus rapide en Côte d'Ivoire.
2. **Poser un vrai cache sur les photos.** Le `no-cache` est un défaut de réglage, pas un
   choix.
3. **Sortir les photos de Supabase vers Cloudflare**, où la sortie est gratuite.

À quoi s'ajoutent deux défauts de robustesse relevés en lisant le code de `bey-public` :

4. **L'inscription n'a aucun garde-fou**, ni limite de cadence ni captcha, et la clé
   publique est lisible dans la page. Un script peut créer des milliers de faux fans et les
   créditer au code ambassadeur de son choix. **Le concours est truquable**, et il le
   deviendra le jour où il y aura un prix à gagner.
5. **Le compteur de parrainage lit puis écrit.** Deux inscriptions simultanées sur le même
   code, et l'une des deux est effacée par l'autre. En pic de lancement, les Ambassadeurs
   sont sous-comptés, et c'est précisément ce dont ils se plaindront.

### Ce qui n'a pas pu être mesuré

Un banc de montée en charge a été écrit, avec paliers, plafond de 200 comptes marqués et
supprimés, et arrêt automatique. **Le garde-fou de sécurité de l'outil a refusé de
l'exécuter** : un script qui envoie des rafales vers un serveur et crée des centaines de
comptes ressemble, vu de l'extérieur, à une attaque. Restent donc inconnus, et ils ne se
déduisent pas :

- le nombre d'arrivées simultanées à partir duquel la base décroche ;
- le nombre réel de points de parrainage perdus dans la course entre deux inscriptions ;
- les collisions de code ambassadeur en rafale.

## La stratégie de rentabilité pour l'agence — 17/09/2026

> Cette section ne regarde pas le dossier du point de vue du client, mais du point de vue de
> l'argent que l'agence gagne. Elle complète `STRATEGIE-CONTENUS-OCT-DEC.md`, qui traite du
> contenu pour les fans, et ne la contredit pas.

### L'état financier, sans habillage

L'agence a livré une plateforme complète, la maintient, en porte les coûts, et **n'a encaissé
zéro euro**. Le protocole n'est pas signé depuis le 01/07. L'artiste ne répond plus depuis le
10/08. C'est un pari assumé, mais un pari qui dure.

### Le fait qui change tout : ce n'est pas un projet, c'est un produit

Le coût marginal d'un artiste supplémentaire sur la même architecture est **proche de zéro**.
Le Supabase Pro à 25 $ se partage entre tous, Cloudflare Pages est gratuit, les notifications
sont gratuites. Le seul coût vraiment variable est la vidéo, et il se refacture.

Autrement dit : **vendre vingt plateformes de fans ne coûte presque rien de plus que d'en
vendre une.** La marge brute d'un tel produit est de l'ordre de 90 à 95 %.

C'est la vraie nouvelle de ce dossier. La Beynaumania n'est pas un chantier client, c'est le
**premier exemplaire d'un produit** : la plateforme de communauté d'artiste, duplicable pour
les artistes ivoiriens et de la diaspora, les humoristes, les prédicateurs, les influenceurs.

### Combien rapporte Beynaud en direct, et pourquoi c'est peu

> **Avertissement sur les chiffres qui suivent, ajouté le 17/09 après relecture.** Ce sont
> des simulations, pas des résultats. Une seule donnée y est solide, le coût de diffusion,
> tiré de `COUTS-LIVE-PRO.md` et calculé sur le tarif publié de Cloudflare. **Le pourcentage
> revenant à l'agence n'est convenu nulle part** : le protocole le renvoie au « Jalon 2 ·
> Modèle économique ». Et le nombre d'acheteurs est une hypothèse, alors que la plateforme
> compte **9 membres réels** à ce jour.

Le scénario de référence de `COUTS-LIVE-PRO.md` : un live payant à 1 000 FCFA vendu à
5 000 personnes, soit 5 000 000 FCFA de recettes et environ 360 000 FCFA de diffusion, donc
4 640 000 FCFA nets.

Ce que l'agence en tire, selon les deux inconnues, **avant cotisations** :

| Acheteurs | part 20 % | part 30 % | part 40 % |
|---|---|---|---|
| 500 | 141 € | 212 € | 283 € |
| 1 000 | 283 € | 424 € | 566 € |
| 3 000 | 849 € | 1 273 € | 1 698 € |
| 5 000 | 1 415 € | 2 122 € | 2 829 € |

**Trois coûts manquent encore** à cette simulation : la commission XPaye sur l'encaissement,
le coût de production du live lui-même (`COUTS-LIVE-PRO.md` ne chiffre que la diffusion, pas
le tournage), et les **cotisations à ~22 % du chiffre d'affaires**, qui ramènent par exemple
2 122 € à environ **1 655 € réellement encaissés**.

Autrement dit, la fourchette réaliste d'un événement va de **quelques centaines d'euros à
moins de 3 000 €**. Deux ou trois événements par an, c'est un ordre de grandeur de quelques
milliers d'euros annuels. C'est réel, ce n'est pas négligeable, mais **ce n'est pas ce qui
amène l'agence à 10 000 € par mois**, et surtout c'est **ponctuel**, alors que le trou de
l'agence est le récurrent : à ce jour aucun mensuel n'est encaissé sur aucun dossier.

**Et c'est justement ce qui rend la suite décisive** : même au coin haut du tableau, le
revenu direct reste petit devant la valeur de la référence.

### Ce que Beynaud vaut vraiment : la preuve

La valeur de Serge pour l'agence n'est pas dans ce qu'il paie. Elle est dans ce qu'il prouve :
une plateforme en production, portant le nom d'un artiste à 10 millions d'abonnés, avec des
chiffres d'engagement réels. **C'est l'actif commercial le plus cher du portefeuille**, et il
ne coûte rien à produire puisqu'il existe déjà.

### Le blocage juridique que personne n'a vu

**Le protocole ne contient aucune clause donnant à l'agence le droit de citer Serge Beynaud
comme référence.** Pire, l'article 3, engageant dès signature, range explicitement parmi les
informations confidentielles pour cinq ans « l'identité du ou des prestataires pressentis ».

Lu strictement : **en signant en l'état, l'agence s'interdit de dire publiquement qu'elle a
construit la Beynaumania.** L'actif le plus précieux du dossier est verrouillé par le
document censé le sécuriser.

Ce n'est pas une fatalité, c'est une clause à ajouter : un droit de référence encadré, par
exemple le droit de citer le nom et de montrer des captures d'écran une fois la plateforme
publique, avec accord préalable sur les chiffres communiqués. **C'est à porter avant
signature, pas après.**

### La stratégie recommandée, par ordre de rendement

1. **Obtenir la signature, avec la clause de droit de référence.** Sans elle, tout ce qui
   suit est impossible. C'est le point de passage obligé, et il ne coûte qu'une négociation.
2. **Traiter Beynaud comme une vitrine, pas comme une ligne de revenus.** Accepter d'y gagner
   peu, à condition d'avoir le droit de s'en servir. Un dossier qui rapporte 5 000 € par an
   mais qui en fait signer dix autres vaut dix fois son chiffre d'affaires.
3. **Industrialiser la plateforme de fans en produit à trois formules**, sur le modèle déjà
   validé par l'agence, et le vendre aux artistes suivants sans repartir de zéro.
4. **Ne jamais mettre la vidéo dans un forfait.** C'est le seul coût qui monte avec le succès.
   Il se refacture à l'événement ou se partage en pourcentage. Un artiste qui réussit ne doit
   jamais dégrader la marge.
5. **Le live du 5 décembre est le seul revenu direct à court terme.** Il est aussi la
   meilleure occasion de filmer la preuve. Les deux se préparent ensemble.

### Le modèle de deal à appliquer au produit

Le modèle **Famille D, Partenariat Performance**, déjà inventé par l'agence sur le dossier
Beracca, est celui qui convient : une mise en place modeste, un mensuel modeste, et un
pourcentage sur ce que la plateforme rapporte réellement.

Appliqué à la plateforme de fans, cela donne une grille à trois entrées, dont les montants
restent à arrêter avec le DAF :

| Formule | Ce qu'elle contient | Logique |
|---|---|---|
| Essentielle | fil, photos, notifications, installation sur l'écran d'accueil | entrée de gamme, marge pure |
| Active | + ambassadeurs, sondages, modération assistée | le cœur du produit |
| Premium | + lives payants, billetterie, vidéo exclusive | **vidéo refacturée, jamais incluse** |

L'arithmétique à garder en tête, et elle est sobre : vingt artistes à 65 € de mensuel moyen
font **1 300 € par mois de récurrent**, soit 13 % de l'objectif de 10 000 €. Ce n'est pas la
solution unique, mais ce serait **le premier revenu récurrent réel de l'agence**, et il a
une marge de 90 %.

### Le flux de contenu, lu du côté de l'argent

`STRATEGIE-CONTENUS-OCT-DEC.md` définit six formats pour les fans. Vus sous l'angle
financier, ils se rangent en quatre flux, et **le quatrième n'existe pas encore.**

| Flux | Contenu | Coût | Ce qu'il rapporte |
|---|---|---|---|
| **1. Attirer** | reels verticaux publics, YouTube Shorts | ~0 | des inscriptions |
| **2. Retenir** | le fil, photos, sondages, réponses nommées | hébergement | des gens joignables le jour où on vend |
| **3. Convertir** | live payant, replays, série inédite | Stream, couvert par la billetterie | le revenu direct |
| **4. Prouver** | **les chiffres, les captures, le témoignage de l'artiste** | **~0** | **la vente des vingt plateformes suivantes** |

Le flux 4 est celui qui rapporte le plus à l'agence et **personne ne le produit**. Chaque
palier de la Beynaumania est un actif de vente : le millième fan, le premier live, le premier
Ambassadeur à cinq filleuls. Cela se capture au moment où ça arrive, pas six mois après.

Deux conséquences opérationnelles immédiates.

**Le flux 1 est aujourd'hui le maillon le plus faible.** Les reels publics attirent depuis
YouTube, donc la plupart des partages profitent à YouTube et non à la plateforme. Le lien
partagé depuis l'app est de surcroît générique : il ouvre l'accueil, pas la vidéo dont on a
parlé. Un lien qui ouvre sur le contenu, en conservant le parrainage, vaut plus que bien des
fonctionnalités déjà livrées.

**Le flux 2 est muet.** Trois fans sur neuf ont laissé un WhatsApp, deux ont activé les
notifications. À ce rythme, un lancement à 50 000 personnes produirait environ **33 000
numéros et 17 000 fans injoignables à vie**. Une base qui prouve le succès du lancement et
qui ne sert à rien le lendemain. Le concours d'Ambassadeur est le levier honnête pour
corriger cela : **on ne remet pas un prix à quelqu'un qu'on ne sait pas joindre.**

### Ce que ça change dans la prochaine action

L'envoi groupé à Latiss doit maintenant porter **quatre** pièces et non trois : la
plateforme, l'offre live chiffrée, le protocole à signer, **et la clause de droit de
référence**. Cette dernière ne coûte rien à l'artiste et vaut, pour l'agence, plus que le
reste du dossier.

## Le modèle économique

> Complété le 17/09/2026 par la section « La stratégie de rentabilité pour l'agence »
> ci-dessus, qui en donne la lecture côté agence et les chiffres mesurés.

**Adhésion gratuite** pour maximiser le volume et les ambassadeurs. La monétisation se fait
sur des **événements payants ponctuels, une série spéciale et des replays de concert**,
tous en **paiement one-shot XPaye**. Ce choix contourne le blocage connu : XPaye ne gère
pas le prélèvement mensuel.

Règle stratégique actée : **YouTube pour la portée gratuite de masse, Cloudflare Stream
pour le premium payant** (YouTube ne sait pas verrouiller un contenu payant).

## Ce qui est en ligne

| Quoi | Où |
|---|---|
| **Le lien à envoyer** | **`demo.agenceattractor.com/beynaud/fan`** |
| Ancienne porte d'entrée, redirige | `demo.agenceattractor.com/beynaud/rejoindre` |
| Tableau de bord artiste | `demo.agenceattractor.com/beynaud/app` |

Le brief interne du RDV du 30 juin **a été retiré du site le 13/09** : il y était lisible et
indexable (`/beynaud/brief`), troisième occurrence de R-70. Il vit désormais dans ce dossier
sous `BRIEF-RDV-2026-06-30.html`. L'offre confidentielle reste en ligne, elle porte bien un
`noindex`, c'est un document qui se partage par lien.

Backend Supabase partagé, tables `bey_`, deux fonctions (`bey-public` sans connexion,
`bey-admin` verrouillée sur l'UID de Serge). Aucun accès direct à la base : tout passe par
les fonctions. Le WhatsApp des fans n'est jamais exposé. 7 migrations dans `supabase/`.

Fonctions livrées et testées : inscription, **moteur ambassadeur** (lien personnel,
compteur de filleuls, passage Membre → Ambassadeur à 5 parrainages), mur de diffusion,
likes et commentaires avec **modération hybride** (filtre de mots puis IA, masquage
automatique et révision humaine, jamais de suppression automatique), galerie photos,
séries et live YouTube verrouillés, sondages, application installable.

## Ce qui fait foi

| Document | Fichier |
|---|---|
| Protocole d'accord (pré-contrat) | `PROTOCOLE-ACCORD-Beynaud-StarFactory-MrAttractor-2026-07-01` (html + pdf) |
| Coûts du live professionnel | `COUTS-LIVE-PRO.md` |
| Tunnel de conversion et paliers | `SCHEMA-TUNNEL.md` (13/09/2026) |
| Stratégie éditoriale et guide de tournage | `STRATEGIE-CONTENUS-OCT-DEC.md` (13/09/2026) |
| Brief interne du RDV du 30 juin | `BRIEF-RDV-2026-06-30.html` |
| Recette du parcours visiteur | `recette-visiteur.js` (R-84) |
| Recette clair / sombre, contraste calculé | `recette-theme.js` (14/09/2026, R-24 et R-41) |

## Le registre de dette technique

> **Règle posée par Mac Arthur le 17/09/2026.** Beynaud est un projet costaud : on pense
> l'architecture pour la masse, on signale les risques sans attendre la question, et on vise
> **zéro dette technique**. Une rustine non écrite est une dette cachée ; ce registre existe
> pour qu'aucune ne le reste. Il se met à jour à chaque fois qu'on en crée ou qu'on en solde.

| # | Dette | Ce que ça devient à l'échelle | État |
|---|---|---|---|
| D-01 | **Aucune sauvegarde.** Liste vide, restauration à un instant donné désactivée | perte définitive de la base, pour Beynaud **et** les 8 autres clients | ouvert |
| D-02 | **Projet Supabase partagé**, quota et moteur au niveau du projet | un succès chez Serge ralentit ou restreint J'Envoie Express, Élévia, Ayêla, Vies Croisées | **reporté, sciemment.** Un projet dédié a été créé puis supprimé le 17/09 : à l'usage, corriger les photos (D-03 à D-05) fait passer Beynaud de 123 Go à ~3 Go par mois, ce qui rend la séparation inutile **pour les quotas**. Elle reste justifiée par le partage du moteur au moment du pic et par la séparation des données de Serge (NDA). À redécider avec la taille réelle du lancement. Se recrée en deux minutes |
| D-03 | **Photos trop lourdes**, 211 Ko en ligne | 120 Go de sortie par mois à 50 000 fans | **soldée le 17/09.** Le téléphone encode en WebP 1080 px au lieu de JPEG 1280. Mesuré sur les 3 vraies photos, même image en entrée : 135 Ko → **54 Ko**. Repli automatique en JPEG si le navigateur ne sait pas encoder le WebP, vérifié sur ce qui sort réellement et non sur ce qu'on a demandé. Les photos déjà en ligne restent lourdes mais sont désormais mises en cache |
| D-04 | **Photos en `no-cache`** | un aller-retour réseau par photo et par visite, pénalisant en 3G | **soldée le 17/09, ailleurs que prévu.** Supabase inscrit `no-cache` en dur dans les métadonnées et **ignore les deux formes d'en-tête documentées**, vérifié en dépôt direct et en formulaire. Le cache ne se règle donc pas à la source : il est posé par Cloudflare, à un an et immuable |
| D-05 | **Photos servies par Supabase** | 640 Ko par visiteur, quota gratuit épuisé à **8 197 visiteurs** | **soldée le 17/09.** Une fonction Cloudflare sert `/beynaud/img/<fichier>`. Recette en ligne : 7 photos sur 7 passent par notre domaine, **zéro par Supabase**, `CF-Cache-Status: HIT`. La bande passante de Cloudflare est gratuite et illimitée : la taille du lancement cesse d'être une question de quota photo |
| D-06 | **Inscription sans garde-fou**, ni cadence ni captcha, clé publique lisible | **le concours d'Ambassadeur est truquable** dès qu'il y a un prix | ouvert |
| D-14 | **Le grade était pris au mot.** `bey-public` lisait `grade` dans le corps de la requête et retirait le filtre quand la valeur valait `ambassadeur` | tout le contenu réservé lisible sans compte, en une commande | **soldée le 18/09.** Trouvée par le contre-adit de l'avocat du diable, **démontrée en production** sur un contenu de test puis corrigée. Le grade se lit désormais dans la ligne du membre, le fil s'identifie par jeton, et `d.grade` est ignoré. Cinq contrôles : anonyme revendiquant le grade, identifiant inventé, injection dans le champ et membre de grade `membre` sont tous refusés ; un Ambassadeur réel voit bien son contenu |
| D-15 | **Aucun droit d'accès où poser du payant.** Deux grades seulement, dont le second s'obtient gratuitement en 5 parrainages | rien de payant ne pouvait être vendu, ni direct ni replay | **soldée le 18/09.** Migration 0012 : un grade se **gagne**, un billet s'**achète**, et ce sont deux colonnes différentes. `bey_billets` est nominatif, rattaché à un contenu, unique par couple membre-contenu, et inatteignable depuis le navigateur. Le contenu payant **reste visible** dans le fil, marqué verrouillé, mais **le serveur retire son adresse vidéo** : on montre l'offre, jamais l'accès. Six contrôles passés, dont le rejeu d'un paiement qui ne duplique plus rien |
| D-16 | **Aucun moyen pour un fan d'obtenir un billet.** | on pouvait réserver un contenu, pas le vendre | **soldée le 18/09 par les codes d'accès** (migration 0013), XPaye étant mis en veille. Serge génère un lot, le fan paie par le moyen qu'il veut y compris en espèces, saisit son code, obtient son billet. Usage unique arbitré par la base, alphabet sans caractère ambigu, saisie tolérante à la casse et au tiret oublié. Éprouvé en base puis **bout en bout dans un vrai navigateur** : carte verrouillée, code refusé, vrai code, lecteur qui apparaît |
| D-19 | **Deux origines distinctes**, sans redirection canonique, et HTTP non forcé en HTTPS | un fan inscrit sur l'une **perdait son compte** en revenant sur l'autre | **soldée le 19/09.** Adresse officielle : **`latiss.net`**, sans `www`. Deux règles Cloudflare, `HTTP vers HTTPS` en première et `www vers latiss.net` ensuite, toutes deux en 301 avec la chaîne de requête conservée. Les **quatre** portes d'entrée convergent, et le code de parrainage survit à chacune, y compris au chemin le plus long en deux sauts |
| D-18 | **XPaye n'est pas branché**, et aucune documentation de leur API n'existe dans le dossier | tout encaissement reste manuel, donc non automatisable au-delà de quelques centaines d'acheteurs | **en veille, décidé par Mac Arthur le 18/09.** À rouvrir avec la documentation XPaye. Les codes d'accès ne seront pas à jeter : le paiement délivrera un code, ou écrira directement le billet |
| D-17 | **L'espace de Serge ne savait pas cocher « payant »** | le verrou existait mais Serge ne pouvait pas l'activer seul | **soldée le 18/09.** Le sélecteur d'accès propose trois valeurs, pour une vidéo comme pour un direct : tous les membres, Ambassadeurs, ou payant. La base garde deux notions distinctes, la traduction se fait en un seul endroit |
| D-07 | **Compteur de parrainage lu puis écrit**, non atomique | des points perdus en pic, sans moyen de reconstituer la vérité | **soldée le 18/09.** Un seul `update` en base (migration 0011), la ligne se verrouille et les appels simultanés se mettent en file. Éprouvé sur la production : **12 inscriptions au même instant sur un même lien, compteur à 12**, grade Ambassadeur déclenché automatiquement, 13 lignes de test supprimées derrière. Une fonction de recalage est livrée avec, pour recoler le compteur sur la vérité le jour où l'on doute d'un classement |
| D-08 | **Point de rupture inconnu** | on découvrirait le plafond pendant le lancement | **mesuré le 17/09, en lecture seule.** Genou de saturation à **~55 ouvertures de page par seconde** : de 40 à 80 appels simultanés, la latence double (751 → 1 403 ms) et le débit ne gagne que 7 %. **Zéro erreur sur 975 requêtes** : sous surcharge le système ralentit, il ne casse pas. Reste inconnu : le comportement en écriture, non testé pour ne pas créer de faux comptes en production |
| D-09 | **Doublons de comptes** : sans numéro, une réinscription crée une ligne de plus | des fans fantômes qu'aucune clé ne permet de reconnaître | ouvert |
| D-10 | **`photo_add` force `.jpg` et `image/jpeg`** en dur | un fichier qui ment sur son contenu, et le WebP impossible | **soldée le 17/09.** Le type est lu sur l'image elle-même, liste blanche webp/jpeg/png, extension déduite. `bey-admin` v19 |
| D-11 | **Colonne morte `bey_membres.push_subscription`**, 0 ligne renseignée, les abonnements vivent dans `bey_push` | schéma qui ment sur lui-même, piège pour la prochaine personne | ouvert |
| D-12 | **Panier `bey-photos` public** | aucune exclusivité possible sur une photo, quel que soit le grade | ouvert. **La fonction Cloudflare ne la referme pas** : l'adresse Supabase d'origine reste accessible directement. Servir par notre domaine est une affaire de coût et de vitesse, pas de verrou |
| D-13 | **Lien de partage générique** : il ouvre l'accueil, pas la publication partagée | l'ami arrive et doit chercher la vidéo dont on lui a parlé | ouvert |

**Rustines assumées, écrites comme telles.** La vidéo déposée en fichier (17/09) est un chemin
**pour essayer** : le fichier reste téléchargeable par son adresse, il n'y a aucune
exclusivité. Elle sera remplacée par le dépôt verrouillé de la phase 2, adresse signée et
domaine restreint. Elle n'entre pas dans le registre parce qu'elle est datée, documentée et
remplaçable, mais elle ne doit **jamais** servir à du contenu réservé.

### Ce que la mesure du 17/09 dit du lancement

55 ouvertures par seconde, c'est 198 000 visiteurs à l'heure **si le flux était régulier**.
Il ne l'est jamais. Une annonce concentre son monde sur les premières minutes : pour
30 000 visiteurs en une heure, la moyenne est de 50 par seconde mais le pic tourne autour
de 200. **À 200 par seconde on est quatre fois au-delà du genou.**

La page ne tomberait pas, elle deviendrait lente : plusieurs secondes d'attente, sur une
connexion mobile ivoirienne, au moment précis où l'on découvre la plateforme. Pour un
lancement, c'est presque aussi grave qu'une panne.

**Le remède n'était pas une plus grosse machine, c'était de ne plus poser la question à la
base.** Au lancement, l'écrasante majorité des arrivants ne sont pas encore membres : ils
ouvrent la page en aperçu, et cette réponse est **rigoureusement identique pour tout le
monde**. On interrogeait pourtant la base 6 fois par visiteur pour recalculer la même chose.

### Le cache du fil, posé le 18/09 — le genou a disparu

Le fil du visiteur passe désormais par `/beynaud/api/feed`, sur notre domaine, où il est
gardé 30 secondes au bord du réseau. Même banc, même machine, avant et après :

| Appels simultanés | Avant, sur Supabase | Après, par le cache |
|---|---|---|
| 20 | 421 ms | **67 ms** |
| 40 | 751 ms | **53 ms** |
| 80 | 1 403 ms | **77 ms** |

Avant, le débit plafonnait à 55 par seconde quoi qu'on fasse : signature d'un goulot
distant. Après, il monte avec la charge jusqu'à **environ 1 000 par seconde**, et ce qui
cède à 160 simultanés est la machine qui tire, pas le serveur : la latence explose sans
**aucune erreur** sur 1 500 requêtes. Un appel isolé passe de 2 380 ms à **23 ms**.

Le pic de 200 par seconde qu'exigerait un lancement à 30 000 visiteurs en une heure est
donc largement couvert.

**Ce qui n'est jamais mis en cache, et c'est la seule chose qui comptait.** La réponse
change quand l'appel porte un `membre_id` : chaque publication y porte `liked`, qui dit si
**ce** membre a aimé. La servir à quelqu'un d'autre serait une fuite de données. Ces appels
passent en direct, le relais les refuse au cache, et la recette le vérifie sur un membre
réel : Cynthia voit ses 7 cœurs, le visiteur suivant en voit zéro. Le grade a sa propre
entrée de cache, sinon le contenu réservé aux Ambassadeurs s'afficherait pour tout le monde.

Le relais ne relaie que le fil : toute autre action est refusée. Et la page retombe sur
l'appel direct à Supabase si le relais tombe, pour qu'un défaut du cache ne devienne jamais
une panne du fil.

**Soldé le 18/09** : D-07, le compteur de parrainage, et D-08 mesurée puis annulée par le cache du fil.

**Soldé le 17/09** : D-03, D-04, D-05 et D-10, soit tout le poste photo. Une seule mesure
résume le gain : le quota gratuit tombait à **8 197 visiteurs**, les photos n'y comptent plus.

**Ce qui solde le plus de dette au meilleur prix, maintenant** : le forfait Pro solde D-01
d'un coup et pour tous les clients, sans migration ni coupure. D-06, D-07, D-09 et D-11 se
traitent en une journée, sans dépense. D-08 ne demande qu'une autorisation.

## Prochaine action

1. **Monter le contenu de démarrage.** Le fil est prêt mais tourne sur le jeu de test, et un fil presque vide se voit plus qu'une page à rubriques presque vide. C'est le préalable à tout envoi.
2. **Chiffrer l'offre premium « Concerts »** (live professionnel + replays payants + billetterie), base dans `COUTS-LIVE-PRO.md` : environ 0,06 $ par fan et par heure, soit ~600 $ pour 10 000 fans, couvert par la billetterie. **C'est la seule chose que l'artiste ait demandée de lui-même**, donc le levier qui rouvre la négociation par le haut.
3. **Envoi groupé à Latiss, puis signature et répartition des charges** : la plateforme, l'offre live chiffrée, le protocole à signer, **et la clause de droit de référence** (ajoutée le 17/09 : sans elle, l'agence s'interdit pour 5 ans de dire qu'elle a construit la Beynaumania, ce qui annule l'actif le plus précieux du dossier). Relancé le 10/08, sans réponse depuis. Rien ne peut se monétiser avant signature. **C'est aussi la condition de la phase 2 technique**, dépôt direct de vidéos compris : séquence confirmée par Mac Arthur le 14/09. L'arbitrage d'hébergement R2 contre Stream instruit directement la clause de répartition, puisque c'est une charge variable.
4. Obtenir les **vrais titres des séries** (elles sont encore en « Série exclusive 1 / 2 »).
5. **Les cinq correctifs d'avant-lancement**, qui ne dépendent d'aucune décision de Latiss : redimensionner les photos, poser un vrai cache, sortir les photos vers Cloudflare, mettre un garde-fou à l'inscription, rendre le compteur de parrainage atomique. Détail et chiffres dans la section « Ce que la plateforme coûte réellement ». **Tant qu'ils ne sont pas faits, un lancement réussi peut faire tomber les autres clients de l'agence.**

**Contradiction à connaître avant d'envoyer.** La note du 02/08 dit de ne pas proposer
l'offre « Concerts » depuis une position non signée. Le 12/09 a changé la condition :
c'est l'artiste qui demande. L'arbitrage retenu est d'envoyer les trois pièces ensemble,
l'offre servant à obtenir la signature et non l'inverse.

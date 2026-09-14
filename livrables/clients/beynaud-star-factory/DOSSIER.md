# Beynaud / STAR FACTORY — l'état du dossier

> Révision du 13/09/2026, après la refonte du tunnel et du fil.
> **Cette fiche est la première chose à lire du dossier.**
> Un chiffre ou un statut n'existe qu'ici. S'il apparaît ailleurs, c'est une copie à vérifier.

| Radar | |
|---|---|
| Statut | **le rapport de force a changé : c'est l'artiste qui demande maintenant.** Il veut diffuser ses concerts en direct, payants, exclusivement sur son site. Plateforme entièrement refondue le 13/09 (aperçu avant inscription, fil unique, inscription à un champ, **notifications en service**), elle reste **volontairement non diffusée** |
| Dernier contact | 2026-08-10, relance Latiss sur le protocole. **Sans réponse depuis 34 jours** |
| Prochaine action | **1.** Monter le contenu de démarrage : le fil tourne encore sur le jeu de test. **2.** Chiffrer l'offre live, c'est la seule chose qu'il ait demandée de lui-même. **3.** Envoi groupé à Latiss : la plateforme + l'offre live chiffrée + le protocole à signer |
| Échéance | à fixer avec la date du prochain concert, encore inconnue |
| Argent en attente | non chiffré, plateforme livrée sans contrepartie signée. **Le live est le premier poste qui engage de la trésorerie réelle** (voir `COUTS-LIVE-PRO.md`) |

## En une phrase

La plateforme **La Beynaumania** est construite et en production, gratuite, à remplir de
vrais membres. **Le protocole d'accord n'est toujours pas signé**, mais depuis le 12/09
l'artiste demande lui-même une fonctionnalité payante, ce qui rouvre la négociation par
le haut.

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

## Le modèle économique

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

## Prochaine action

1. **Monter le contenu de démarrage.** Le fil est prêt mais tourne sur le jeu de test, et un fil presque vide se voit plus qu'une page à rubriques presque vide. C'est le préalable à tout envoi.
2. **Chiffrer l'offre premium « Concerts »** (live professionnel + replays payants + billetterie), base dans `COUTS-LIVE-PRO.md` : environ 0,06 $ par fan et par heure, soit ~600 $ pour 10 000 fans, couvert par la billetterie. **C'est la seule chose que l'artiste ait demandée de lui-même**, donc le levier qui rouvre la négociation par le haut.
3. **Envoi groupé à Latiss, puis signature et répartition des charges** : la plateforme, l'offre live chiffrée, le protocole à signer. Relancé le 10/08, sans réponse depuis. Rien ne peut se monétiser avant signature. **C'est aussi la condition de la phase 2 technique**, dépôt direct de vidéos compris : séquence confirmée par Mac Arthur le 14/09. L'arbitrage d'hébergement R2 contre Stream instruit directement la clause de répartition, puisque c'est une charge variable.
4. Obtenir les **vrais titres des séries** (elles sont encore en « Série exclusive 1 / 2 »).

**Contradiction à connaître avant d'envoyer.** La note du 02/08 dit de ne pas proposer
l'offre « Concerts » depuis une position non signée. Le 12/09 a changé la condition :
c'est l'artiste qui demande. L'arbitrage retenu est d'envoyer les trois pièces ensemble,
l'offre servant à obtenir la signature et non l'inverse.

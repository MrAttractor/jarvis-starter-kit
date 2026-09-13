# Beynaud / STAR FACTORY — l'état du dossier

> Révision du 13/09/2026, après la refonte du tunnel et du fil.
> **Cette fiche est la première chose à lire du dossier.**
> Un chiffre ou un statut n'existe qu'ici. S'il apparaît ailleurs, c'est une copie à vérifier.

| Radar | |
|---|---|
| Statut | **le rapport de force a changé : c'est l'artiste qui demande maintenant.** Il veut diffuser ses concerts en direct, payants, exclusivement sur son site. La plateforme a été refondue le 13/09 (tunnel raccourci, fil unique, lecteur fermé), elle reste **volontairement non diffusée** |
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

### Deux défauts corrigés

- **Le formulaire d'inscription clignotait une seconde** avant l'espace membre : le code
  attendait la confirmation du serveur avant de peindre. On peint désormais avec ce que le
  téléphone a gardé, on réconcilie après. Mesuré : 41 échantillons sur la première seconde,
  zéro image avec le formulaire. Une panne de réseau ne déconnecte plus, on ne sort que sur
  un refus explicite.
- **La plateforme est tombée une vingtaine de minutes** en cours de session : la migration
  a été lancée avant le déploiement des fonctions qui la lisent. Rien perdu en base. Fiche
  **EXP-042** et règle **R-77** au cerveau.

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

## Le partenaire

**Serge GNOLOU, dit Serge Beynaud**, artiste afrobeat ivoirien, structure **STAR FACTORY**.
Environ 10 millions d'abonnés cumulés toutes plateformes. Interlocuteur : **Latiss**.

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
| Espace fan, clip d'entrée compris | `demo.agenceattractor.com/beynaud/fan` |
| Ancienne porte d'entrée, redirige | `demo.agenceattractor.com/beynaud/rejoindre` |
| Tableau de bord artiste | `demo.agenceattractor.com/beynaud/app` |

Le brief interne du RDV du 30 juin **a été retiré du site le 13/09** : il y était lisible et
indexable (`/beynaud/brief`), troisième occurrence de R-70. Il vit désormais dans ce dossier
sous `BRIEF-RDV-2026-06-30.html`. L'offre confidentielle reste en ligne, elle porte bien un
`noindex`, c'est un document qui se partage par lien.

Backend Supabase partagé, tables `bey_`, deux fonctions (`bey-public` sans connexion,
`bey-admin` verrouillée sur l'UID de Serge). Aucun accès direct à la base : tout passe par
les fonctions. Le WhatsApp des fans n'est jamais exposé. 5 migrations dans `supabase/`.

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
| Brief interne du RDV du 30 juin | `BRIEF-RDV-2026-06-30.html` |

## Prochaine action

1. **Monter le contenu de démarrage.** Le fil est prêt mais tourne sur le jeu de test, et un fil presque vide se voit plus qu'une page à rubriques presque vide. C'est le préalable à tout envoi.
2. **Chiffrer l'offre premium « Concerts »** (live professionnel + replays payants + billetterie), base dans `COUTS-LIVE-PRO.md` : environ 0,06 $ par fan et par heure, soit ~600 $ pour 10 000 fans, couvert par la billetterie. **C'est la seule chose que l'artiste ait demandée de lui-même**, donc le levier qui rouvre la négociation par le haut.
3. **Envoi groupé à Latiss** : la plateforme, l'offre live chiffrée, le protocole à signer. Relancé le 10/08, sans réponse depuis. Rien ne peut se monétiser avant signature.
4. Obtenir les **vrais titres des séries** (elles sont encore en « Série exclusive 1 / 2 »).

**Contradiction à connaître avant d'envoyer.** La note du 02/08 dit de ne pas proposer
l'offre « Concerts » depuis une position non signée. Le 12/09 a changé la condition :
c'est l'artiste qui demande. L'arbitrage retenu est d'envoyer les trois pièces ensemble,
l'offre servant à obtenir la signature et non l'inverse.

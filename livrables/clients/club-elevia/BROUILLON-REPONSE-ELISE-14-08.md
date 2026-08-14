# Brouillon de réponse à Élise CAPEL — 14 août 2026

> À relire et retoucher par Mac Arthur avant envoi.
> Répond à son **debrief de recette du 8 août 2026 (14h45)**, 16 points sur la Web App,
> reçu en retard parce qu'il était tombé dans les spams.
> **À envoyer depuis `hello@agenceattractor.com`**, dans le fil existant
> « Club privé Élévia - Ajout et clarification de clause ».
>
> ## NE PAS ENVOYER AVANT D'AVOIR DÉPLOYÉ LE FRONT
> Les fichiers sont prêts et la base est à jour, mais la mise en ligne du dossier
> `elevia/` n'a pas pu être faite : le jeton Cloudflare du workspace n'a pas la
> permission Pages. Commande à lancer, puis vérifier le lien avant l'envoi :
> `npx wrangler pages deploy public --project-name=demo-agenceattractor --branch=master`
> (depuis `livrables/clients/demo-site/`)
>
> ## À vérifier aussi avant l'envoi
> - Ouvrir `https://demo.agenceattractor.com/elevia/app` **sur un vrai téléphone**,
>   aller jusqu'à l'enregistrement vidéo. Rien de ce qui touche la caméra n'est
>   considéré comme fini avant ça.
> - Tester les deux liens légaux, avec et sans barre oblique finale.
>
> **Ton propre statut de signature est `en_attente`** sur le dossier ATR-2026-0005 :
> elle a ouvert le lien le 5 août sans signer, et toi non plus tu n'as pas signé.
> Le lien envoyé le 7 août est toujours valide, il expire le 30 septembre.

---

**Objet :** Re: Club privé Élévia — ton debrief est intégré, la V1 est à jour

---

Bonjour Élise,

Merci pour ce debrief. C'est le retour le plus utile que tu m'aies envoyé depuis le début du projet : tu as regardé l'application comme une future membre, avec quelqu'un à côté de toi, et ça se voit. Tout est traité.

**Ton logo est en place.** Il apparaît en tête de chaque écran, et en grand à l'ouverture. J'ai détouré son fond pour qu'il se pose proprement partout, et je l'ai allégé pour qu'il s'affiche vite, même en 4G. La mention « une marque de YNL CLUB » figure désormais dans le pied de page de l'application et sur les documents légaux.

**Et tu avais raison sur les couleurs.** Tu me demandais de conserver le bleu nuit et l'or partout. L'application était en noir et or, parce que c'est ce que disait notre cahier des charges, écrit avant que ton logo existe. J'ai relevé les couleurs exactes de ton logo et j'ai basculé toute l'application dessus. C'est ta charte qui fait foi, pas un document rédigé avant elle.

**Le parcours d'inscription est repris point par point :**

- Le pseudonyme affiche des exemples, un compteur de caractères, et dit clairement « Disponible » ou « Déjà utilisé ».
- La longue liste de pays est remplacée par un champ de recherche. Trois lettres suffisent, et les accents sont ignorés, donc « cote d ivoire » trouve bien Côte d'Ivoire. C'était pénible sur téléphone, c'est réglé.
- « Votre âge ne sera jamais affiché » est écrit sous la date de naissance.
- Les liens vers les conditions d'utilisation et la politique de confidentialité sont **actifs**, et les deux documents existent maintenant vraiment. J'y reviens plus bas.
- La mention sur l'hébergement en Europe apparaît à l'étape 3, avant de valider.
- Un écran de bienvenue s'affiche entre l'inscription et l'envoi du code, comme tu le proposais.

**La vérification par vidéo est plus rassurante.** Avant d'activer la caméra, un encadré rappelle les trois choses à faire : se placer dans un endroit lumineux, regarder la caméra, autoriser le navigateur. Les deux gestes demandés sont désormais présentés numérotés, l'un après l'autre, au lieu d'une longue phrase.

**Et l'attente a enfin un véritable écran.** Après l'envoi de la vidéo, la personne voit « Merci, votre demande d'adhésion est bien enregistrée », le statut « en cours de vérification », et le délai de 24 à 48 heures ouvrées. C'était le moment le plus inconfortable du parcours, celui où on vient de confier son visage sans savoir ce qui se passe.

**Les finitions et l'accessibilité :** transitions douces, animations discrètes, angles homogènes, icônes toutes dessinées de la même main. Navigation au clavier complète, contraste renforcé, messages d'erreur annoncés aux lecteurs d'écran, et un pied de page complet avec les mentions et le copyright.

**Sur la sécurité, ton point 14 a mis le doigt sur un vrai trou.** Le nombre de tentatives de saisie d'un code était déjà limité, mais rien ne limitait le nombre de **demandes** de code. Quelqu'un de mal intentionné pouvait donc inonder la boîte mail d'un membre et, au passage, épuiser notre quota d'envoi, ce qui aurait empêché tout le monde de se connecter. C'est corrigé et vérifié : trois demandes par quart d'heure, huit par jour, au-delà c'est refusé. Le refus est formulé de la même façon pour une adresse inscrite et une adresse inconnue, pour ne pas révéler qui est membre du Club.

---

**Trois choses que j'ai faites autrement que ce que tu écrivais, et pourquoi.**

**Le compte à rebours du code.** Tu proposais 2 minutes. Le code est en réalité valable **10 minutes**. Afficher 2 minutes aurait poussé les gens à redemander un code alors que le premier fonctionnait encore, et le nouveau code annule le précédent : on saisit alors celui qui ne marche plus. Le compte à rebours affiche donc la vraie durée, et le bouton « recevoir un nouveau code » n'apparaît qu'à l'expiration.

**L'adresse de contact.** Tu proposais `support@elevia.fr` ou `contact@ynlclub.com`. Ces deux adresses supposent un nom de domaine qui n'est pas encore acheté, donc les messages seraient partis dans le vide. J'ai mis `clubpriveeelevia@gmail.com`, la seule adresse qui existe aujourd'hui. Et je dois te signaler un point que tu n'as pas pu voir à l'écran : **les e-mails de connexion partent encore depuis le domaine de mon agence.** C'est la dernière référence au prestataire, et c'est la plus visible puisque chaque membre la reçoit. Pour la retirer, il faut ton nom de domaine, parce qu'un service d'envoi n'accepte que des domaines vérifiés. En attendant, tes membres qui répondent à ces e-mails t'écrivent bien à toi directement.

**L'espace membre.** Tu proposais d'y ajouter la photo de profil, les notifications, la messagerie et les paramètres. Ce n'est pas oublié : la messagerie et les notifications sont prévues aux **modules 3 et 4**, ceux qui restent à construire, et elles arriveront avec eux. Les ajouter maintenant reviendrait à poser des boutons qui ne mènent nulle part. Le statut « compte vérifié », la date d'adhésion et le pays sont déjà là. La photo de profil, en revanche, n'est dans aucun des quatre modules : à voir ensemble si tu la veux, car elle mérite d'être pensée sérieusement, une photo posant la question de ce qu'on montre et à qui dans un club où l'identité reste confidentielle.

---

**Les conditions d'utilisation et la politique de confidentialité existent maintenant.**

Elles décrivent fidèlement ce que l'application fait réellement : ce qu'on collecte et pourquoi, qui voit quoi, la vérification vidéo expliquée en entier, les durées de conservation, tes prestataires techniques, les droits des membres, et le fait qu'aucun cookie publicitaire n'est déposé.

Deux points importants :

1. **Ce sont des gabarits, et il faut les faire relire par un juriste** avant l'ouverture au public. C'était déjà prévu ainsi dans le cahier des charges. Je décris juste, en droit tu restes responsable de ce que ta société publie.
2. **Il y reste des mentions à compléter, que toi seule peux fournir** : la forme juridique de YNL CLUB, son numéro d'immatriculation, son siège social, et le pays de rattachement, qui détermine le tribunal compétent et l'autorité de protection des données à citer. Elles sont surlignées dans les deux documents, tu les repères tout de suite.

---

**Ce dont j'ai besoin de toi pour avancer, dans l'ordre d'importance :**

1. **Les questions du questionnaire d'affinités.** C'est le cœur d'Élévia et c'est ce qui bloque le module 3. Leur formulation exacte, et ce que tu veux qu'elles révèlent. Je ne peux pas les inventer à ta place, ce sont elles qui feront la différence entre Élévia et n'importe quelle autre application.
2. **Ton nom de domaine.** Il débloque d'un coup l'adresse de contact et l'expéditeur des e-mails.
3. **Les informations légales** pour compléter les deux documents.
4. **La photographie d'ouverture.** Tu parlais d'un rooftop, d'un hôtel, d'un salon privé. En attendant, c'est ton logo qui occupe cette place, et honnêtement ce n'est pas laid du tout, mais une vraie photographie dira mieux à qui tu t'adresses. Envoie-la avec l'autorisation de l'utiliser, ou dis-moi si tu préfères que je te propose des pistes.
5. **Le délai de traitement des vérifications.** J'annonce 24 à 48 heures ouvrées aux membres. Confirme-moi que ton équipe pourra le tenir, sinon on écrit un autre délai : mieux vaut une promesse tenue qu'une promesse flatteuse.

Et enfin, **le lien pour signer est toujours actif**, c'est le même que celui du 7 août, il reste valable jusqu'au 30 septembre :
https://signature.agenceattractor.com/s/664e2w4y0v421z5q5s6i026d474q0v030f3k6e53646x1g6v

Bonnes vacances, et merci pour ce mot de la dernière fois, il m'a fait plaisir. Tu peux regarder tout ça tranquillement, il n'y a rien d'urgent de ton côté cette semaine.

À très vite,

Mac Arthur KOUASSI
Mr Attractor
hello@agenceattractor.com · +33 7 53 90 23 23

---

## Notes internes, à ne pas envoyer

**C'est sa quatrième vague de demandes, et rien n'est signé.**

| Date | Ce qu'elle a demandé | État |
|---|---|---|
| 20/07 puis 30/07 | vision, documents | traité |
| 02/08 | 6 conditions avant signature | absorbées dans l'avenant V2 |
| 04/08 | 4 points de clause | absorbés dans l'avenant V3 |
| 08/08 | 16 points de recette sur la Web App | traités aujourd'hui |

**Relevé en base le 14/08, dossier `ATR-2026-0005` :** dossier `en_attente`,
Élise au statut `ouvert` (elle a ouvert le lien du 5 août, elle n'a pas signé),
**Mac Arthur au statut `en_attente`** (ta signature manque aussi). Deux dossiers
antérieurs, du 29/07 et du 03/08, sont `expire`.

**950 € encaissés, 2 050 € restants, et la Tranche 2 n'est pas déclenchée.**

**Ce que dit ta propre grille d'anomalies**, écrite dans l'avenant le 7 août : une
anomalie mineure, « un détail d'affichage ou de formulation, ne bloque ni la réception
ni le règlement, et se traite pendant les 3 mois de garantie ». Ses 16 points sont,
de son propre aveu, de la « finition, identité de marque et expérience utilisateur »
sans remise en cause de l'architecture. **Ce sont donc des anomalies mineures.**

Elles ont été traitées quand même, et c'était le bon choix pour la relation. Mais il
faut éviter que le schéma s'installe : elle écrit « avant de poursuivre la recette des
modules suivants, je souhaiterais toutefois intégrer quelques ajustements ». Chaque
tour de finition devient ainsi la condition du tour suivant, et le projet n'avance plus.

**Formulation possible si un cinquième tour arrive**, à garder sous la main plutôt qu'à
envoyer maintenant : « Ces points sont des finitions, et la garantie de 3 mois est
justement faite pour ça. Je les note et je les traite pendant la garantie. Ce qui fait
avancer le projet maintenant, ce sont tes questions d'affinités. »

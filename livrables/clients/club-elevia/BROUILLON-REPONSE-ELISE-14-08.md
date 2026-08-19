# Réponse à Élise CAPEL — envoyée depuis Gmail

> **Le texte qui fait foi est le brouillon Gmail `r-8246262309023243695`**, dans le fil
> « Club privé Élévia - Ajout et clarification de clause ». Mac Arthur l'a réécrit
> lui-même le 19/08 : version plus courte, sans les remerciements d'ouverture, sans le
> paragraphe sur la sécurité. Ce fichier n'est qu'une copie d'archive.
>
> ## Attention, deux brouillons existent
> - **`r-8246262309023243695`** : le bon, rattaché au fil d'Élise (`19fd6fc0e0cb26c3`),
>   avec l'historique cité en dessous.
> - `r8581636460261655071` : à supprimer. La mise à jour d'un brouillon par l'API le
>   **détache de sa conversation** et perd l'historique cité. Leçon : ne jamais corriger
>   un brouillon de réponse par `update_draft`, le recréer avec `replyToMessageId`.
>
> ## Ce qui a été modifié dans son texte, et rien d'autre
> Le seul paragraphe touché est celui de l'adresse de contact, pour tenir compte de la
> décision du 19/08 : on affiche l'adresse que la Cliente demande, en disant qu'elle
> n'est pas active. Les adresses enveloppées par Gmail (`google.com/url?q=`) ont aussi
> été remises au propre.
>
> ## Ce que le mail ne prétend pas
> **La vérification par vidéo n'a jamais été menée jusqu'au bout sur un vrai téléphone.**
> Ne pas ajouter de phrase qui l'affirmerait.

---

**Objet :** Re: Club privé Élévia — c'est en ligne, et voici où on en est

---

Bonjour Élise,

Merci pour ta relance, et pardon pour le délai. Ton debrief était le retour le plus utile que tu m'aies envoyé depuis le début : tu as regardé l'application comme une future membre, avec quelqu'un à côté de toi, et ça se voit. Tout est traité, et tout est en ligne.

**Ton logo est en place.** Il ouvre l'écran d'accueil et il accompagne chaque écran. J'ai détouré son fond pour qu'il se pose proprement partout, et je l'ai allégé pour qu'il s'affiche vite, même en 4G. La mention « une marque de YNL CLUB » figure dans le pied de page et sur les documents légaux.

**Et tu avais raison sur les couleurs.** Tu demandais de conserver le bleu nuit et l'or partout. L'application était en noir et or, parce que c'est ce que disait notre cahier des charges, écrit avant que ton logo existe. J'ai relevé les couleurs exactes de ton logo et j'ai basculé toute l'application dessus. C'est ta charte qui fait foi, pas un document rédigé avant elle.

**Le parcours d'inscription est repris point par point :** exemples et compteur de caractères sur le pseudonyme, avec « Disponible » ou « Déjà utilisé » ; la longue liste de pays remplacée par un champ de recherche où trois lettres suffisent et où les accents sont ignorés ; « votre âge ne sera jamais affiché » sous la date de naissance ; les liens vers les conditions et la politique enfin actifs ; la mention sur l'hébergement en Europe avant de valider ; et un écran de bienvenue avant l'envoi du code, comme tu le proposais.

**La vérification par vidéo est plus rassurante.** Avant d'activer la caméra, un encadré rappelle les trois choses à faire : un endroit lumineux, regarder la caméra, autoriser le navigateur. Les deux gestes sont présentés numérotés, l'un après l'autre, au lieu d'une longue phrase.

**Et l'attente a enfin un véritable écran.** Après l'envoi, la personne voit « Merci, votre demande d'adhésion est bien enregistrée », le statut en cours de vérification, et le délai de 24 à 48 heures ouvrées. C'était le moment le plus inconfortable du parcours, celui où l'on vient de confier son visage sans savoir ce qui se passe.

**Les finitions, l'accessibilité et le téléphone.** Transitions douces, angles homogènes, icônes toutes dessinées de la même main, navigation au clavier, contraste renforcé. J'ai aussi mesuré l'application aux tailles d'écran réelles, de l'iPhone SE à l'ordinateur : plus rien ne dépasse, les zones à toucher sont toutes assez grandes pour le doigt, et le bouton d'adhésion est désormais visible sans avoir à faire défiler.

**Sur la sécurité, ton point 14 a mis le doigt sur un vrai trou.** Le nombre de tentatives de saisie d'un code était déjà limité, mais rien ne limitait le nombre de demandes. Quelqu'un de mal intentionné pouvait inonder la boîte mail d'un membre et, au passage, épuiser notre quota d'envoi, ce qui aurait empêché tout le monde de se connecter. C'est corrigé et vérifié.

---

**J'ai touché à ton texte d'accueil, et je te le dis franchement.**

Tu demandais deux choses qui se recouvraient : ton message d'entrée en entier, et trois badges. En les mettant côte à côte, la page annonçait trois fois la même promesse. Le titre et le message commençaient tous les deux par « Élévia réunit des personnes exigeantes », et les trois badges reformulaient les phrases du message.

J'ai donc gardé ton titre, et le texte en dessous enchaîne au lieu de le répéter : « Elles privilégient la confiance, la discrétion et des rencontres de qualité. » Ce sont tes mots, à partir du verbe. Et tes trois badges sont revenus à ce que tu avais écrit, deux mots chacun : membres vérifiés, confidentialité garantie, présence internationale.

Le résultat est plus court et plus net. **Si tu préfères ton texte complet, on le remet, c'est ton texte.** Dis-le simplement.

---

**Trois choses que j'ai faites autrement que ce que tu écrivais, et pourquoi.**

**Le compte à rebours du code.** Tu proposais 2 minutes. Le code est en réalité valable **10 minutes**. Afficher 2 minutes aurait poussé les gens à en redemander un alors que le premier fonctionnait encore, et le nouveau code annule le précédent : on saisit alors celui qui ne marche plus.

**L'adresse de contact.** J'ai mis `contact@ynlclub.com`, celle que tu proposais. Elle n'est pas encore active, puisque le domaine reste à acheter : dans la démo elle s'affiche donc en texte et non en lien, pour que personne n'écrive dans le vide. On branchera une adresse qui fonctionne pour les tests réels.

Un point important sur ton autre proposition, en revanche : **`support@elevia.fr` est à écarter.** J'ai vérifié, ce domaine appartient déjà à quelqu'un d'autre, et il a des serveurs de courrier actifs. Une future membre qui écrirait à cette adresse enverrait ses informations à un inconnu, et le message arriverait bien à destination. Mieux vaut le savoir avant de l'imprimer où que ce soit.

Et je dois te signaler un point que tu n'as pas pu voir à l'écran : **les e-mails de connexion partent encore depuis le domaine de mon agence.** C'est la dernière référence au prestataire, et la plus visible puisque chaque membre la reçoit. Pour la retirer, il faut ton nom de domaine, un service d'envoi n'acceptant que des domaines vérifiés. En attendant, tes membres qui répondent à ces e-mails t'écrivent bien à toi.

**L'espace membre.** Tu proposais d'y ajouter la photo de profil, les notifications, la messagerie et les paramètres. Ce n'est pas oublié : la messagerie et les notifications sont prévues aux **modules 3 et 4**, et elles arriveront avec eux. Les poser maintenant reviendrait à afficher des boutons qui ne mènent nulle part. Le statut vérifié, la date d'adhésion et le pays sont déjà là. La photo de profil, elle, n'est dans aucun des quatre modules : à voir ensemble si tu la veux, car elle mérite d'être pensée sérieusement dans un club où l'identité reste confidentielle.

---

**Les conditions d'utilisation et la politique de confidentialité existent maintenant**, et leurs liens fonctionnent.

Elles décrivent fidèlement ce que l'application fait : ce qu'on collecte et pourquoi, qui voit quoi, la vérification vidéo expliquée en entier, les durées de conservation, tes prestataires techniques, les droits des membres, et le fait qu'aucun cookie publicitaire n'est déposé.

Deux points importants :

1. **Ce sont des gabarits, à faire relire par un juriste** avant l'ouverture au public. C'était déjà prévu ainsi dans le cahier des charges. Je décris ce que fait la plateforme, en droit tu restes responsable de ce que ta société publie.
2. **Il y reste des mentions que toi seule peux fournir** : la forme juridique de YNL CLUB, son numéro d'immatriculation, son siège social, et le pays de rattachement, qui détermine le tribunal compétent et l'autorité de protection des données à citer. Elles sont surlignées, tu les repères tout de suite.

---

**Deux points de ménage avant l'ouverture.**

**Les comptes de test.** J'ai supprimé les deux que j'avais créés de mon côté pour les essais. Il reste **tes deux comptes**, « Caraca » et « elisey ». Je ne les ai pas touchés : ce sont les tiens, tu t'en sers encore, et l'un des deux porte une vidéo en attente de décision. Dis-moi quand tu veux qu'on parte d'une base vide, je m'en occupe à ce moment-là.

**Ta demande de vérification attend depuis le 8 août.** C'est normal, personne n'a encore la main sur l'écran qui sert à les traiter. Il est construit et il t'attend. Dis-moi qui, dans ton équipe, doit y avoir accès, et je vous ouvre les comptes. Ce sera l'occasion de valider ta propre demande et de voir le badge apparaître sur ton profil.

---

**Ce dont j'ai besoin de toi pour avancer, dans l'ordre :**

1. **Les questions du questionnaire d'affinités.** C'est le cœur d'Élévia et c'est ce qui bloque le module 3. Leur formulation exacte, et ce que tu veux qu'elles révèlent. Je ne peux pas les inventer à ta place, ce sont elles qui feront la différence entre Élévia et n'importe quelle autre application.
2. **Ton nom de domaine.** Il débloque d'un coup l'adresse de contact et l'expéditeur des e-mails.
3. **Les informations légales** pour compléter les deux documents.
4. **Le délai de traitement des vérifications.** J'annonce 24 à 48 heures ouvrées aux membres. Confirme-moi que ton équipe pourra le tenir, sinon on écrit un autre délai : mieux vaut une promesse tenue qu'une promesse flatteuse.
5. **La photographie d'ouverture**, si tu la veux. En attendant, c'est ton logo qui occupe cette place, et honnêtement ce n'est pas laid du tout.

Et **le lien pour signer** est toujours actif, c'est le même que celui du 7 août, valable jusqu'au 30 septembre :
https://signature.agenceattractor.com/s/664e2w4y0v421z5q5s6i026d474q0v030f3k6e53646x1g6v

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
| 08/08 | 16 points de recette sur la Web App | traités, en ligne le 17/08 |

**Relevé en base le 19/08, dossier `ATR-2026-0005`** : dossier `en_attente`, Élise
au statut `ouvert` (elle a ouvert le lien du 5 août sans signer), **Mac Arthur au
statut `en_attente`**. Deux dossiers antérieurs, du 29/07 et du 03/08, sont `expire`.

**950 € encaissés, 2 050 € restants, Tranche 2 non déclenchée.**

**Ce que dit la grille d'anomalies de l'avenant** : une anomalie mineure, « un détail
d'affichage ou de formulation, ne bloque ni la réception ni le règlement, et se traite
pendant les 3 mois de garantie ». Ses 16 points sont, de son propre aveu, de la
finition et de l'expérience sans remise en cause de l'architecture. Ce sont donc des
anomalies mineures, traitées quand même, et c'était le bon choix pour la relation.

**Formulation à garder sous la main si un cinquième tour arrive** : « Ces points sont
des finitions, et la garantie de 3 mois est justement faite pour ça. Je les note et je
les traite pendant la garantie. Ce qui fait avancer le projet maintenant, ce sont tes
questions d'affinités. »

# Réponse à Élise, mail du 28/08 à 21h36

> **Le brouillon Gmail existe** : `r-6075573311782687823`, dans le fil `19fd6fc0e0cb26c3`,
> en réponse à son message `1a04a4dec2777833`. Ce fichier en est la copie de référence.
>
> **Deux choses à faire avant d'envoyer :**
> 1. **Valider les cinq prix** du devis complémentaire, puis le joindre en PDF.
>    Voir `DEVIS-ATR-2026-0014-ClubElevia-Complementaire.md`.
> 2. **Appliquer `0007_elevia_agents.sql`** avec l'adresse réelle de son compte, sinon
>    la phrase sur son espace d'administration est fausse : le rôle `agent` n'est porté
>    par personne et elle recevrait « Accès réservé à l'équipe Élévia ».
>
> **Ne pas retoucher ce brouillon avec `update_draft`** : cette opération le sort du fil
> de conversation, mesuré le 03/09. Retoucher, c'est supprimer et recréer avec
> `replyToMessageId`.

---

Objet : Re: Club privé Élévia, l'état exact du projet et la date de lancement

Bonjour Élise,

Merci pour ce cadrage, il est clair et il tombe au bon moment. Je te réponds dans ton ordre, puis je te donne une date.

**Avant tout, les trois adresses du projet.** Recopie-les dans ton navigateur plutôt que de cliquer dessus, je t'explique pourquoi à la fin du message :

| | |
|---|---|
| Ton Club, côté membre | https://demo.agenceattractor.com/elevia/app/ |
| Ton espace d'administration | https://demo.agenceattractor.com/elevia/admin/ |
| Ta signature, jusqu'au 30 septembre | https://signature.agenceattractor.com/s/664e2w4y0v421z5q5s6i026d474q0v030f3k6e53646x1g6v |

## 1. Ce qui est terminé

Deux modules sur quatre, développés, mis en ligne, et que tu as testés deux fois :

- **L'identité et l'inscription.** Pseudonyme vérifié en temps réel, genre, pays de résidence, date de naissance avec blocage strict des moins de 18 ans, acceptation des conditions, connexion par code à 6 chiffres sans mot de passe. Base de données hébergée en Europe.
- **La vérification.** Enregistrement de la vidéo avec deux gestes tirés au sort, dépôt dans un espace privé, file d'attente côté administration, décision prise par une personne, badge de profil vérifié, notification au membre.
- **Ton espace d'administration**, dans sa première forme, à l'adresse ci-dessus : les demandes en attente, la vidéo, accepter ou refuser avec un motif, l'historique des décisions. Tu t'y connectes avec ton compte Élévia habituel, il reconnaît que tu fais partie de l'équipe. C'est là que se traite la vidéo que tu as déposée le 8 août, et qui attend toujours.
- **La suppression des vidéos**, automatique et vérifiée. J'y reviens plus bas.
- **Les conditions d'utilisation et la politique de confidentialité** en ligne, dans leur version gabarit, plus ton logo et ta charte bleu nuit et or partout.
- **Les six points que tu m'as envoyés le 20 août**, tous traités.

## 2. Ce qu'il reste à terminer

D'abord ce qui est prévu et déjà payé dans ce que nous avons cadré en juillet :

- **Le questionnaire d'affinités et la découverte des membres.** Le membre indique ce qu'il recherche, le Club lui propose des profils, il demande une mise en relation, l'autre accepte ou non.
- **La messagerie**, ouverte uniquement après acceptation des deux côtés.
- **La modération complète** (signalements, suspension d'un compte, journal des décisions) et **ton tableau de bord** de pilotage.
- **Les tests finaux** sur mobile et sur ordinateur, et la mise en ligne sur ton nom de domaine.

Un point d'honnêteté sur l'état d'aujourd'hui : un membre dont tu valides la vidéo obtient son badge, et s'arrête là. Il n'a pas encore d'autres membres à découvrir ni personne à qui écrire, puisque c'est exactement ce que contiennent les deux modules qui restent. C'est normal à ce stade, mais il faut le savoir avant d'inviter de vraies personnes.

Ensuite, trois choses de ta liste qui ne sont pas dans ce périmètre, et je préfère te le dire tout de suite plutôt qu'au moment de la facture :

- **le choix de l'adhésion et le paiement**,
- **les événements**,
- **la conciergerie**.

Ce n'est pas un refus, ces trois briques sont nommées à la section 9 du cahier des charges comme relevant d'un devis complémentaire, et l'écran des formules dans la maquette y figure explicitement comme une vision produit, pas comme une fonctionnalité livrée. Tu les veux dans la V1, je les fais. Elles se chiffrent à part, tu trouveras le détail plus bas et le devis en pièce jointe. Tu choisis ce que tu prends maintenant et ce qui attend.

Deux ajouts plus légers, que je te propose de prendre au passage : les champs **ville, langues parlées et attaches culturelles** dans le profil, et le **suivi des visites et des candidatures**.

## 3. Les blocages

Trois, et deux dépendent de toi.

1. **Les questions du questionnaire d'affinités.** Je te les demande depuis le 7 août. C'est le cœur d'Élévia, personne ne peut les écrire à ta place, et tant qu'elles ne sont pas là je ne peux pas commencer ce module. C'est le seul vrai blocage technique aujourd'hui.
2. **La signature.** J'ai signé de mon côté, l'avenant, le devis et le cahier des charges n'attendent plus que toi. Tant qu'ils ne sont pas signés des deux côtés, le document qui fait foi reste le contrat d'origine, celui qui parle d'applications iOS et Android publiées sur les stores, alors que nous construisons une Web App. Ce décalage ne nous sert ni l'un ni l'autre. L'adresse de signature est dans le tableau en haut de ce message, elle reste valable jusqu'au 30 septembre.
3. **Ton nom de domaine et tes informations légales.** Le domaine débloque d'un coup l'adresse de contact et l'expéditeur des e-mails, qui portent encore mon nom d'agence. Les informations légales de YNL complètent les deux documents juridiques. Ni l'un ni l'autre n'empêche de développer, mais les deux empêchent d'ouvrir au public.

Une remarque de fond, dite simplement. Le socle et la vérification ont été construits, mis en ligne et corrigés deux fois avant que le projet ne soit officiellement lancé, sur les 950 € versés en juillet. Je l'ai fait volontiers, parce que tu avais besoin de voir pour décider. Mais pour la suite, je repars sur ce qui est écrit : la signature des trois documents, et la tranche 2 de 900 €, qui correspond au prototype fonctionnel que tu as déjà entre les mains et validé.

## 4. Le délai, et la date

Le cahier des charges prévoit 40 jours ouvrés à partir de la signature. La phase du prototype étant faite, il en reste **25**.

Si je reçois ta signature et tes questions d'affinités **avant le lundi 7 septembre** :

| Étape | Date |
|---|---|
| Démarrage | lundi 7 septembre |
| Version complète, que tu peux tester de bout en bout | lundi 28 septembre |
| Tes tests, les corrections et la mise en ligne | **lundi 12 octobre 2026** |

Ces jours se comptent en jours de production, c'est-à-dire hors périodes où j'attends un élément de ta part. Chaque jour sans les questions du questionnaire décale la date d'autant, et c'est la seule chose qui puisse la décaler.

Si tu prends l'adhésion et le paiement dans la V1, compte **une semaine de plus**, soit une mise en ligne au 19 octobre.

## Ce qui se chiffre à part

| Ce que tu ajoutes | Ce que ça contient |
|---|---|
| Adhésion et paiement | Écran des formules, souscription, encaissement, renouvellement, suivi des adhésions dans ton espace d'administration |
| Événements | Création et gestion des événements chez toi, liste et fiche côté membre, inscription, liste des inscrits |
| Conciergerie | Formulaire de demande côté membre, file de traitement, statuts et réponse |
| Suivi des visites | Visites, candidatures, inscriptions, adhésions, taux de passage d'une étape à l'autre, et le bandeau de consentement qui devient obligatoire dès qu'on mesure |
| Profil international | Ville, langues parlées, attaches culturelles |

Le devis complémentaire joint chiffre chaque ligne séparément. Tu peux en prendre une seule.

## Ton point sur le lien en HTTP, et pourquoi il faut recopier les adresses

Tu as bien vu, et j'ai trouvé la cause exacte. Elle ne vient ni de ton ordinateur ni du site : elle vient de ma messagerie. **Gmail réécrit systématiquement toute adresse que je t'envoie**, et la remplace par une adresse à lui, de la forme `google.com/url?q=…`. Cette adresse de remplacement contient une date d'expiration, d'environ 24 heures. C'est ce qui explique les trois incidents de ce dossier : ta collègue qui tombait sur un avertissement Google, ton lien de signature qui ressemblait à une adresse douteuse en août, et le `http` que tu as vu le 26, ajouté par cette réécriture.

Tant que nous n'aurons pas basculé sur ton propre nom de domaine, la parade est simple : **recopie les adresses du tableau en haut de ce message dans la barre de ton navigateur, ne clique pas dessus.** Recopiées, elles ne périment jamais, et elles sont toutes en `https`. Le site n'a d'ailleurs jamais été autrement, la version non sécurisée bascule automatiquement.

## Tes conditions d'utilisation et ta politique, version 1.1

Bon travail, et tes réserves sont saines. Tu as écrit plusieurs fois « sous réserve de confirmation par le prestataire technique ». Je te confirme donc par écrit, point par point, ce qui est vrai aujourd'hui, vérifié dans le code et pas supposé :

- **Aucune reconnaissance faciale, aucune analyse automatique du visage, aucune empreinte faciale, aucune comparaison à une base d'identités.** Il n'y a aucun outil de ce type dans la plateforme. Une personne regarde la vidéo, c'est tout. Tu peux publier cette phrase sans réserve.
- **La vidéo est supprimée dans les 24 heures suivant la décision, et au plus tard après 30 jours sans décision.** Les deux règles sont dans la base, la suppression est horodatée donc prouvable, et j'ai renforcé fin août les deux cas où un fichier pouvait rester derrière. Publiable sans réserve.
- **Les vidéos sont dans un espace privé**, inaccessible publiquement, réservé aux personnes habilitées. Vrai.
- **Les échanges sont chiffrés en `https`**, les codes de connexion expirent après 10 minutes, le nombre de tentatives est limité, et depuis le 14 août le nombre de demandes d'envoi l'est aussi. Vrai.
- **Aucun traceur, aucun outil de mesure d'audience, aucun cookie publicitaire.** La plateforme ne conserve dans le navigateur qu'un seul élément, celui qui te garde connectée. Ta rédaction est exacte, et ta prudence est justifiée : le jour où nous mettons en place le suivi des visites que tu demandes, cette section change et un bandeau de consentement devient nécessaire. C'est prévu dans la ligne correspondante du devis.

Deux corrections à faire de ton côté avant publication :

- trois adresses différentes circulent dans tes deux documents : `contact@ynlsociéte.com` (avec un accent, qui ne peut pas exister techniquement), `contact@ynlsociete.com` et `contact@ynlclub.com`. Il en faut **une seule**, sans accent, et elle doit fonctionner avant l'ouverture.
- le champ **origines ou attaches culturelles** mérite une attention particulière. Selon la façon dont il est formulé, il peut être considéré comme une donnée sensible au sens du règlement européen. Je te propose un champ libre et facultatif, sans liste de choix imposée, ce qui est la formulation la plus sûre. À confirmer avec le juriste qui relira tes documents.

Enfin, un rappel que j'avais déjà écrit et qui reste vrai : ces deux textes sont des gabarits solides, mais **je ne suis pas juriste**. La relecture par un professionnel avant l'ouverture commerciale n'est pas une formalité, surtout dès qu'il y a des adhésions payantes.

## Ce dont j'ai besoin de toi, dans l'ordre

1. **Les questions du questionnaire d'affinités.** Le seul vrai blocage.
2. **La signature** des trois documents. La mienne est déjà apposée, il ne manque que la tienne.
3. **Ta réponse sur le devis complémentaire**, ne serait-ce que pour savoir si le paiement entre dans la V1 ou non.
4. **Ton nom de domaine**, dès que tu l'as acheté.
5. **Les informations légales de YNL** et l'adresse de contact définitive.

Avec les deux premiers avant lundi, ton Club ouvre le 12 octobre.

À très vite,

Mac Arthur KOUASSI
Mr Attractor

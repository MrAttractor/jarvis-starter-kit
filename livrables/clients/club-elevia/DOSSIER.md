# Club Élévia — l'état du dossier

> Révision du 01/09/2026, après son mail de cadrage du 28/08. **Cette fiche est la
> première chose à lire du dossier.**
> Un chiffre ou un statut n'existe qu'ici. S'il apparaît ailleurs, c'est une copie à vérifier.

| Radar | |
|---|---|
| Statut | **PACKAGE SIGNÉ DES DEUX CÔTÉS.** Élise le 06/09 à 20h21 UTC, Mac Arthur le 07/09 à 21h10 UTC. Dossier `signe`, preuves vérifiées, documents intacts. **Le J0 est posé, la production commence** |
| Dernier contact | **2026-09-07 à 21h10 : contresignature.** Côté cliente, sa signature du 06/09 à 20h21 |
| Prochaine action | **1.** Envoyer la réponse aux 4 questions (`REPONSE-ELISE-2026-09-01.md`, toujours pas envoyée, son mail a 10 jours). **2.** Lui transmettre le certificat complet, elle n'a que celui de sa propre signature. **3.** Démarrer la Phase 2, prototype fonctionnel |
| Échéance | **Tranche 2 le 28/09**, bêta le 19/10, mise en production le **02/11/2026**. Calendrier détaillé plus bas |
| Argent en attente | 2 050 €. **Tranche 2 (900 €) exigible à la livraison du prototype, visée au 28/09.** Le devis complémentaire n'a plus lieu d'être sur l'encaissement, il est entré au périmètre |

## Son mail du 28/08 : ce qu'il demande vraiment

Elle écrit vouloir « aller à l'essentiel » et « ne pas ajouter beaucoup de nouvelles
fonctionnalités ». **Le parcours qu'elle décrit ajoute pourtant trois blocs rangés en
section 9 du CDC** (« hors périmètre, devis complémentaire ») :

| Ce qu'elle demande | Où c'est rangé |
|---|---|
| choix de l'adhésion → **paiement** → accès au Club | **hors périmètre** : « encaissement effectif des abonnements et toute passerelle de paiement associée » |
| accéder aux **événements**, les gérer côté admin | **hors périmètre** : « Module Événements club » |
| contacter la **conciergerie**, recevoir ses demandes | **hors périmètre** : « Espace Concierge Relationnel » |
| **suivi des visites** | hors CDC, et déclenche l'obligation de bannière cookies |

Le piège : le paiement est placé **au milieu du parcours obligatoire**, entre la
validation et l'accès. Répondre à ses 4 questions sans traiter ce point revient à
accepter en silence un périmètre élargi pour 3 000 €. **R-09 et R-10.**

**Sortie proposée dans la réponse** : ouvrir le Club **sans encaissement**, adhésions
fondatrices offertes et validées à la main, paiement branché ensuite. Elle lance à
l'heure, on ne travaille pas gratuitement, et le devis complémentaire reste sur la table.

### Deux points de droit relevés dans ses documents

- **Champ « origines ou attaches culturelles »** qu'elle veut ajouter, et **intentions
  relationnelles** croisées avec le genre déjà collecté : données sensibles au sens de
  l'article 9 du RGPD (origine, orientation sexuelle). Sa propre v1.1 le pressent sans
  le nommer. À faire valider avant mise en service.
- **Trois adresses de contact différentes** dans ses deux documents :
  `contact@ynlsociéte.com` (avec accent, techniquement impossible),
  `contact@ynlsociete.com` et `contact@ynlclub.com`. Aucun de ces domaines n'est acheté.

### Le lien HTTP, cause trouvée et prouvée

Elle signale que le dernier lien commence par `http`. **Le site n'est pas en cause** :
mesuré le 01/09, `http://` renvoie un **301 vers `https://`**, et `https://` répond 200.

La cause est dans notre mail du 26/08. Pour contourner le redirecteur Gmail (R-15),
l'adresse avait été collée **en texte brut sans `https://`**. Gmail l'a linkifiée en
`http://`, **puis l'a réenveloppée quand même** dans son redirecteur, avec une expiration
au 27/08 vers 13h. Résultat : le scheme dégradé **et** le défaut d'origine reproduit,
dans le mail censé le corriger.

**La parade est celle de `reference_gmail_liens_enveloppes`** : fournir un `htmlBody`
avec une vraie ancre. Coller une adresse nue est pire que ne rien faire.

## En une phrase

Elle a fait la recette des Modules 1 et 2 le 08/08 et **envoyé 16 points**, tous traités
le 14/08. Elle juge le travail « de très bonne qualité » et « conforme au périmètre »,
et valide les quatre premiers écrans sur le plan fonctionnel. **Notre contresignature est
apposée depuis le 01/09, la sienne manque toujours**, et les questions du questionnaire
d'affinités, seules bloquantes pour le Module 3, ne sont toujours pas arrivées.

## La 2e recette, du 20/08, et le lien qui n'ouvrait pas

Six points, dont un seul comptait vraiment pour elle : **le lien de démonstration ne
s'ouvrait ni chez sa collègue ni depuis un autre poste**. Elle demandait de chercher un
filtrage, un pare-feu ou un anti-robot côté hébergement.

**Mesuré le 26/08, et ce n'était rien de tout cela.** Le site répond 200 partout, sur
iPhone, sur Android et sans identification de navigateur, sans redirection ni blocage.
Le défaut venait du lien lui-même : Gmail avait réécrit l'adresse en
`google.com/url?q=…&ust=1787222221318000`, et ce paramètre `ust` est **une date
d'expiration, arrivée à terme le 20/08 à 12h37**. Élise a cliqué avant, chez elle ça
marchait. Sa collègue a cliqué après et a reçu une page Google « Avertissement de
redirection », pas le site. **Troisième fois que ce redirecteur coûte quelque chose sur
ce dossier**, après le lien de signature déguisé du 07/08. Voir R-15.

**Ce qui est corrigé et en ligne le 26/08** (déploiement `aa2f6b38`, vérifié sur le
domaine réel, pas sur l'alias) :

- l'aide affichée quand la caméra est refusée **dépend maintenant de l'appareil**. Elle
  parlait du « cadenas à gauche de l'adresse », repère qui n'existe pas dans Safari sur
  iPhone. Sur iPhone elle indique le bouton de réglages de page, puis Réglages du site
  web, puis Caméra, avec le chemin par les Réglages du téléphone en second recours. Et
  le bouton principal devient **Recharger la page**, seul geste qui reprend la main après
  un refus sur Safari ;
- le badge « Confidentialité garantie » devient **« Identité protégée »**, et l'écran du
  pseudonyme reprend sa formulation : « votre identité réelle ne leur est jamais
  affichée ». Elle jugeait ses propres formulations trop absolues, elle a raison ;
- « Tous les pays sont proposés, sans exception » devient **« Sélectionnez votre pays de
  résidence »**, sa phrase exacte ;
- « Nous envoyons votre code sécurisé à l'instant » devient **« Nous vous envoyons votre
  code sécurisé immédiatement »**, sa phrase exacte.

**Son point 4, corrigé le 26/08 avant de lui répondre.** Elle demandait de confirmer par
écrit que la suppression à 24 h est **garantie techniquement**. Elle ne l'était pas : la
ligne partait en cascade et **le fichier restait dans le stockage**, introuvable pour la
purge qui travaille à partir des lignes (R-76). Un **second trou du même ordre** a été
découvert en corrigeant le premier : entre « demarrer » et « soumettre », la vidéo est
déjà déposée alors que la colonne `chemin` est encore vide, donc une personne qui
enregistre puis abandonne laissait elle aussi un fichier que rien ne référençait.

Dispositif livré, migration `0006_elevia_orphelins.sql` plus l'edge function `elevia-verif` :

- un **déclencheur `BEFORE DELETE`** inscrit le chemin dans `el_fichiers_orphelins` dès
  qu'une ligne portant une vidéo est supprimée, cascade comprise ;
- l'edge function **vide cette file à chaque appel** et n'horodate la purge qu'après
  l'effacement réel (R-54) ;
- une action **`balayer`** compare le stockage aux lignes et efface tout objet que plus
  rien ne réclame, avec une marge de 2 heures pour ne jamais toucher un dépôt en cours.

**Prouvé le 26/08, pas supposé.** Recette de bout en bout : membre créé, vidéo réellement
déposée, membre supprimé, **fichier constaté encore présent** (le défaut), puis un appel
à la fonction et **fichier absent, purge horodatée**. Données de recette nettoyées.
Contrôle de non-régression : la vidéo d'Élise, toujours en attente de décision, est
reconnue comme référencée, donc le balayage n'y touche pas. État du stockage après
travaux : **1 vidéo, la sienne, 0 orphelin**. Les quatre fonctions SQL sont inexécutables
par `anon`, `authenticated` et `public` (R-68), vérifié.

**Reste aussi à faire, à l'œil et sur un vrai téléphone** : l'écran de refus caméra n'a
pas été vu sur un iPhone réel (R-51). C'est le seul point de ce lot qui n'est pas prouvé.

**Au passage, ménage R-70.** Le déploiement partait du dossier de travail entier :
`cockpit/README.md` était **publiquement lisible** sur le site, et cinq autres fichiers
internes s'y trouvaient (notes de build, caches `.wrangler`, schémas SQL). Le déploiement
part désormais d'une copie nettoyée. **Sujet ouvert, hors de ce dossier** :
`getwinworld.net/supabase-schema.sql` expose le schéma du projet Supabase partagé, avec
son identifiant, sur le site d'un client.

## La recette du 08/08 et ce qui en est sorti

Ses 16 points portaient sur la finition, l'identité de marque et l'expérience, sans
remise en cause de l'architecture. Traités le 14/08. Trois d'entre eux ont changé
quelque chose de structurant :

| Son point | Ce qui a été fait |
|---|---|
| Intégrer le logo officiel | Logo reçu le 14/08. Détouré, décliné en monogramme (8 ko) et logo complet (43 ko), dans `elevia/assets/` |
| « Conserver partout le bleu nuit et l'or » | **Elle avait raison, et le CDC avait tort.** Les couleurs relevées dans son logo sont bleu nuit `#00234B` et or `#A87726` → `#D9AC56`. Le CDC parlait de « Noir & Or » parce qu'il précède le logo. Toute l'app est passée sur sa charte |
| « Limitation OTP » (point 14) | **Vrai trou de sécurité trouvé grâce à elle.** Les tentatives de saisie étaient plafonnées, les demandes d'envoi non : n'importe qui pouvait inonder la boîte d'un membre et épuiser le quota d'envoi, bloquant les connexions de tous. Migration `0005`, plafond 3 par quart d'heure et 8 par jour, testé |

**Trois écarts assumés par rapport à sa demande, expliqués dans le brouillon de réponse :**
le compte à rebours affiche 10 minutes (la vraie durée) et non 2 ; l'adresse de contact
est `clubpriveeelevia@gmail.com` car `support@elevia.fr` et `contact@ynlclub.com` n'ont
pas de domaine acheté ; la photo de profil, les notifications et la messagerie de son
point 10 relèvent des Modules 3 et 4, pas de maintenant.

**Point qu'elle n'a pas pu voir, et qui est la dernière référence au prestataire :** les
e-mails de connexion partent encore de `hello@agenceattractor.com`. Un service d'envoi
n'accepte que des domaines vérifiés, donc **seul son nom de domaine peut lever ce point**
(Contrat Art. 10 : le domaine est acheté par la Cliente, à son nom). Un `reply_to` vers
son adresse a été ajouté en attendant.

## Livré le 14/08

- `demo-site/public/elevia/app/index.html` — app refondue, charte bleu nuit, 16 points
- `demo-site/public/elevia/cgu/` et `/confidentialite/` — les deux documents **existaient
  comme liens morts** dans l'app, ils existent vraiment maintenant. Gabarits, prévus au
  Module 1, **à faire relire par un juriste**, avec les mentions à compléter surlignées
- `demo-site/public/elevia/assets/` — logo, monogramme, feuille de style légale
- `club-elevia/app/supabase/0005_elevia_limitation_envois.sql` — appliquée et prouvée à
  la clé anon (ligne témoin insérée, invisible en anonyme, écriture refusée 42501)
- Fonctions `elevia-auth` et `elevia-verif` redéployées en **version 4**

**En ligne depuis le 17/08.** Déploiement vérifié : les neuf adresses répondent avec et
sans barre oblique finale, les sept marqueurs de la nouvelle version sont présents, les
trois de l'ancienne ont disparu, et le domaine sert **exactement le même contenu que
l'URL du déploiement direct** (empreintes identiques), donc aucun cache ne masque le
résultat. Plafond d'envoi de codes réessayé en production : refusé à la quatrième demande.

**Le déploiement avait bloqué trois jours pour une fausse raison.** Wrangler donne la
priorité à la variable `CLOUDFLARE_API_TOKEN` sur la session OAuth déjà présente sur la
machine. Comme ce jeton ne porte que le DNS, Cloudflare répondait `Authentication error`
et laissait croire qu'il manquait une permission Pages. Il suffisait de neutraliser la
variable. Deux jetons créés entre-temps se sont tronqués au copier-coller (52 caractères
au lieu de 53). Détail en mémoire `reference_wrangler_oauth`.

**Recette du 19/08 et quatre défauts corrigés depuis.** L'inscription ne partait
jamais (exception avalée, EXP-041), la liste des pays s'arrêtait à la lettre E (plafond
de 60 entrées), le bouton de renvoi de code s'affichait trop tôt (`display` battant
`hidden`), et « un compte existe déjà avec cette adresse » était un cul-de-sac. Tout est
en ligne et prouvé par pilotage dans un navigateur.

**Comptes de test : les deux de Mac Arthur supprimés le 19/08** (4 membres → 2,
15 sessions → 2, aucun fichier orphelin). **Les deux comptes d'Élise sont conservés**,
sur sa décision : elle s'en sert encore, et `Caraca` porte une vidéo de 784 ko en
attente de décision depuis le 08/08.

**Défaut latent trouvé à cette occasion, à corriger :** supprimer un membre efface sa
ligne de vérification en cascade, mais **pas le fichier vidéo dans le stockage**. La
purge travaille à partir des lignes de `el_verifications`, donc le fichier devient
introuvable et n'est jamais effacé. Or la politique de confidentialité qu'on vient de
publier promet au membre de pouvoir supprimer son compte et ses données. À traiter avant
l'ouverture.

**Non fait, et dit :** **la vérification par vidéo n'a jamais été menée jusqu'au bout sur
un vrai téléphone** (R-51). Le brouillon ne prétend donc rien à ce sujet.

## Ses 6 demandes du 02/08 et le traitement retenu

| Sa demande | Traitement dans l'Avenant V2 |
|---|---|
| Propriété intellectuelle | Déjà acquise (son Art. 8). **Confirmée et détaillée**, avec réserve de propriété jusqu'au paiement intégral |
| Données et RGPD | **Vraie lacune, comblée.** Nouvel Art. 15 : rôles responsable/sous-traitant, sécurité, sous-traitants, notification 24h, sort des données, vidéos 24h, absence de biométrie |
| Validation écrite explicite | **Refus partiel assumé.** Le mécanisme de dernier recours est maintenu, le délai post-relance passe de 3 à 5 jours ouvrés. Sans lui, elle peut geler le projet sans terme alors que les tranches sont adossées aux phases |
| Évolutivité de la V1 | Nouvel Art. 16, en **engagements vérifiables**. Sa formule « sans dépendance technique excessive » est écartée : non mesurable, donc contestable sans fin |
| Réversibilité | Élargie (code, sauvegarde base, doc, accès, liste des services tiers), **conditionnée au paiement**, sauf les données des membres restituées sans condition |
| Non-réutilisation | Art. 12 précisé **dans les deux sens**. Gain pour l'agence : le savoir-faire général, les gabarits et les composants réutilisables restent la propriété du Prestataire |

**Le point de vigilance de fond :** c'est sa troisième vague de demandes, 950 € sont
encaissés et le développement n'a pas commencé. L'Avenant V2 doit être présenté comme
le tour de clôture, avec une date.

## Le client

**Élise CAPEL**, Elisepelagie@outlook.be. Club privé international haut de gamme pour
la diaspora ambitieuse, positionnement hôtellerie de luxe (Aman, Four Seasons, Soho
House) plutôt que codes du dating. Dossier `ATR-2026-0005`.

## L'argent

| | |
|---|---|
| Montant V1 | **3 000 €** (ramené de 3 500 € le 15/07) |
| Réglé | **950 €** — 200 + 50 (maquettes) + 300 (16/07) + 400 (20/07) |
| Reste | **2 050 €** |
| Échéancier | T1 900 € (soldée, +50 € d'avance sur T2) · T2 900 € au prototype · T3 900 € à la bêta · T4 300 € à la mise en ligne |
| Hors périmètre, vendu à part | Roadmap produit 3 ans **440 €**. **Déclinée le 02/08** : elle construit son dossier startup elle-même pour garder la main sur la vision. Mais elle écrit « j'aurai besoin de toi une fois mes écrits finalisés » → à cadrer en **relecture facturée 80 €/h, par écrit et à l'avance**, sinon c'est du conseil offert. |

Le plan de continuité à 250 €/mois a été retiré du devis le 15/07. **À reproposer à la
mise en ligne**, sinon il ne se signera jamais.

## Ce qui fait foi

**C'est SON contrat à elle qui a été signé**, pas celui de l'agence. Ordre de priorité
de son Art. 2 : Contrat > CDC > Cession PI > Devis > NDA.

> **Rangement du 06/09/2026.** La racine du dossier ne contient plus que ce qui fait
> foi aujourd'hui. Toutes les révisions antérieures et la correspondance déjà envoyée
> sont dans `_archive/`, avec leur motif dans son README. Les fichiers ont repris la
> convention de nommage du dossier (`AVENANT-01-ClubElevia.pdf` et non
> `AVENANT01ClubElevia.pdf`).

| Document | Fichier | État |
|---|---|---|
| Contrat signé | `CONTRAT DE PRESTATION DE DÉVELOPPEMENT INFORMATIQUE (signed).pdf` | **signé le 09/07** |
| NDA | `NDA-V2-ClubElevia-MrAttractor-2026-06-13.html` | signé |
| Avenant n°1 **révision 4** | `AVENANT-01-ClubElevia.pdf` | **à signer** (V3, V2 et V1 dans `_archive/`, aucune signée) |
| Devis **révision 6** | `DEVIS-ATR-2026-0005-ClubElevia.pdf` | **à signer** (V5 dans `_archive/`) |
| CDC **révision 5** | `CDC-ATR-2026-0005-ClubElevia.pdf` | **à signer** (V4 dans `_archive/`) |
| Reçus 001 à 004 | `RECU-ATR-2026-00x-ClubElevia` | émis |
| Annexes de vision (offertes) | `ELEVIA-Vision-et-proposition-de-valeur`, `ELEVIA-Grandes-orientations` | envoyées |
| Réponse à son mail du 28/08 | `REPONSE-ELISE-2026-09-01.md` | **à envoyer**, seul document de correspondance resté à la racine |

**Les révisions 4, 5 et 6 n'existent qu'en PDF.** Leur source HTML n'a jamais été
versée au dépôt : les seuls HTML disponibles sont ceux des révisions antérieures,
désormais dans `_archive/`. Toute correction se fait donc dans le PDF, par
`scripts/corrige_pdf_elevia.py`, qui repart des fichiers d'origine conservés dans
`_archive/recu-2026-09-06/`. À récupérer dès que possible, sinon chaque révision
future coûtera une chirurgie.

**Corrigé le 06/09 dans les trois documents** : validité du devis portée au
30 septembre 2026 (elle apparaissait à trois endroits, dont un pied de page qui
annonçait encore « V5 ») ; réserve ajoutée au Devis et à l'Article 10 de l'Avenant,
« les commissions et frais de transaction du prestataire de paiement restent
également à la charge de la Cliente » ; pied de page du CDC réaligné sur sa
couverture. La concession de l'encaissement est donc gratuite **hors frais
d'opérations**, conformément à l'arbitrage de Mac Arthur.

Tout ce qui est dans `_archive/` ne fait plus autorité. Voir son README.

## Le piège de ce dossier

Son contrat signé engageait au **natif iOS + Android + stores** (Art. 1, 3, 4, 10),
alors que le périmètre réel voulu est une **Web App responsive**. La clarification
n'avait été faite qu'au téléphone. C'est l'Avenant n°1 qui la met par écrit : tant
qu'il n'est pas signé, l'écrit qui l'emporte est le natif.

**Avec Élise, rien ne se clarifie à l'oral.** Tout par écrit co-signé.

## Deux tarifs horaires coexistent, ne pas les confondre

- **65 €/h** : corrections sur un périmètre déjà spécifié et payé (Devis V5, CDC §11)
- **120 €/h** (appliqué 80 €) : production intellectuelle neuve, le conseil

La différence est expliquée dans le brouillon de réponse, avant qu'elle ne la demande.

## Le lien de signature en cours

> Refait le 06/09/2026, parce que les documents ont changé. **Vérifier toujours le
> `statut` du dossier en base, jamais la réponse HTTP** : un lien périmé répond quand
> même 200 (même leçon que R-60).

**Le dossier qui vaut : `f9f8c931-a6ed-48cf-881d-e0316b7dbaad`**, créé le 06/09,
statut `en_attente`, **expire le 30/09/2026 à 23h59**. Il scelle l'**Avenant révision 4**,
le **Devis révision 6** et le **CDC révision 5**, dans leur état corrigé du 06/09.

| Signataire | Statut |
|---|---|
| Élise CAPEL | **`signe` le 06/09/2026 à 20h21m57 UTC**, consentement recueilli, tracé manuscrit, IP 176.148.9.158, preuve `d1b9e732…` |
| Mac Arthur (contresignature) | **`signe` le 07/09/2026 à 21h10m31 UTC**, preuve `a05cda3f…` |

**Le dossier est `signe`, clos le 07/09/2026 à 21h10m31 UTC.** Vérifié dans
`sig_dossiers` et `sig_signataires`, pas au code de retour de la page (R-60).

### Le calendrier que la signature déclenche

J0 = **lundi 07/09/2026**. Jours ouvrés du lundi au vendredi, Toussaint et 11 novembre
déduits. Le décompte se suspend pendant les validations de la Cliente, l'attente d'un
élément lui incombant, d'une tranche échue ou des frais de tiers (Devis, section
Calendrier).

| Jalon | Date visée | Ce qui se passe |
|---|---|---|
| J+15 ouvrés | **lundi 28/09/2026** | Prototype fonctionnel livré et validé → **Tranche 2, 900 €** |
| J+30 ouvrés | **lundi 19/10/2026** | Version bêta livrée et validée → **Tranche 3, 900 €** |
| J+40 ouvrés | **lundi 02/11/2026** | Mise en production → **Tranche 4, 300 €**, et démarrage des 3 mois de maintenance corrective |

### Un trou du service de signature, constaté ici

Quand le dernier signataire clôt un dossier, `sign-verify` envoie le certificat **au
signataire du moment et à l'agence**. Ici les deux adresses sont la même,
`hello@agenceattractor.com` : **Élise n'a donc jamais reçu le certificat du dossier
complet.** Elle n'a que celui de sa propre signature du 06/09, qui ne montre pas la
contresignature. Il faut le lui transmettre à la main.

**À corriger dans le produit** : à la clôture, l'exemplaire signé doit partir vers
**toutes les parties**, pas seulement vers le dernier signataire. Le cas se reproduira
sur chaque dossier où l'agence signe en dernier.

**Aucun ordre séquentiel n'est imposé** par `sign-verify` : le seul refus possible est
« déjà signé ».

**Sa signature est vérifiée, pas seulement enregistrée** (contrôle du 07/09 par
`scripts/verifier_signature_elevia.mjs`) : les trois documents servis aujourd'hui ont
toujours l'empreinte scellée, et son `preuve_hash` se recalcule à l'identique. Le
contrôle d'intégrité interne de `sign-verify` était donc passé au moment de l'acte :
elle a bien signé les révisions 4, 5 et 6, pas autre chose.

**Ce que son journal raconte, et qui compte pour la suite.** Elle a ouvert le lien à
20h12, consulté les documents **cinq fois entre 20h14 et 20h20**, demandé son code à
20h21m29, signé à 20h21m57, puis **rouvert un document à 20h23m56**. Elle a lu avant de
signer, et elle est revenue vérifier après. C'est une cliente qui relit : les documents
qu'on lui envoie doivent être justes du premier coup.

### Pourquoi un nouveau dossier, et pas une mise à jour de l'ancien

L'ancien dossier `94722c2d` scellait l'Avenant V3, le Devis V5 et le CDC V4, et
**Mac Arthur l'avait signé le 01/09 à 09h23 UTC**. Or le `preuve_hash` d'une signature
est calculé sur l'empreinte des documents au moment où elle est apposée. Remplacer les
documents sous cette signature l'aurait rendue invérifiable, et aurait fait dire au
dossier que Mac Arthur avait signé le 01/09 une révision 4 qui n'existait pas encore.
Le déclencheur `sig_signature_scellee` interdit d'ailleurs de retoucher une ligne signée.

L'ancien dossier est donc **passé en `expire` le 06/09**, avec un événement `remplace`
inscrit à son journal. Sa preuve reste intacte et vérifiable : le `preuve_hash`
`7f3b5732…` se recalcule toujours à l'identique. Son lien ne signe plus.

Dossiers antérieurs, tous expirés et non signables : `94722c2d` du 05/08, `22518a80`
du 03/08, `a2a170aa` du 29/07.

## Prochaine action

1. **Déployer le front**, puis ouvrir l'app **sur un vrai téléphone** jusqu'à
   l'enregistrement vidéo. Tant que ce n'est pas fait, la livraison n'est pas annonçable.
   ```
   cd livrables/clients/demo-site
   npx wrangler pages deploy public --project-name=demo-agenceattractor --branch=master
   ```
   Le jeton Cloudflare du `.env` est valide mais **n'a pas la permission Pages** (vérifié :
   lecture des zones OK, `/pages/projects` refusé en 10000). Soit lui ajouter le droit
   « Cloudflare Pages : Edit », soit se connecter en interactif.
2. **Envoyer `BROUILLON-REPONSE-ELISE-14-08.md`** après avoir testé les liens légaux avec
   et sans barre oblique finale.
3. ~~**Signer le package**~~ **Fait. Élise le 06/09 à 20h21 UTC, Mac Arthur le 07/09
   à 21h10 UTC.** Dossier clos, J0 posé au 07/09, Phase 2 lancée.
4. **Relancer le 25/08** si rien ne bouge. Elle est en vacances mais a explicitement
   demandé à continuer à recevoir les mails. Ses spams avalent nos messages, elle l'a
   écrit deux fois : vérifier la réception plutôt que de supposer le silence.
5. Sa signature fixe le **J0** et lance les 40 jours ouvrés de développement.
6. Garde-fou de son Art. 14 : au-delà de 15 jours ouvrés de retard non justifié, elle
   peut mettre en demeure. Le Devis V5 inscrit la clause de suspension du décompte
   pendant ses validations, l'attente d'un élément lui incombant ou d'une tranche échue.

## Ce qu'on attend d'elle, et qui bloque quoi

| Élément | Ce qu'il bloque |
|---|---|
| **Les questions du questionnaire d'affinités** | **le Module 3 en entier**, demandé depuis le 07/08 |
| Sa signature | le J0 et la Tranche 2 |
| Son nom de domaine | l'adresse de contact **et** l'expéditeur des e-mails |
| Ses informations légales | les CGU et la politique de confidentialité |
| La photographie d'ouverture | rien, le logo occupe la place proprement en attendant |
| Le délai de traitement des vérifications | la promesse « 24 à 48 h ouvrées » affichée aux membres |

## Historique produit

- V1 (en cours) : inscription, profils, vérification, mise en relation, messagerie, administration
- V2 : applications natives iOS et Android, publication sur les stores
- V3 : événements, conciergerie, suggestions par IA, traduction des messages

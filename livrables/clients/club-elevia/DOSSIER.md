# Club Élévia — l'état du dossier

> Révision du 14/08/2026, après sa recette de la Web App. **Cette fiche est la première
> chose à lire du dossier.**
> Un chiffre ou un statut n'existe qu'ici. S'il apparaît ailleurs, c'est une copie à vérifier.

| Radar | |
|---|---|
| Statut | **recette intégrée et EN LIGNE le 17/08. En attente de sa signature et de ses questions d'affinités** |
| Dernier contact | **2026-08-17 : c'est ELLE qui relance**, elle demande où en est l'avancement (le 12/08 elle partait en vacances et demandait à continuer par mail) |
| Prochaine action | **Lui répondre sur l'avancement**, c'est elle qui attend. Avant d'envoyer : **ouvrir l'app sur un vrai téléphone** jusqu'à l'enregistrement vidéo, puis `BROUILLON-REPONSE-ELISE-14-08.md`. **Signer soi-même** l'avenant : ta propre signature manque |
| Échéance | **répondre sans délai** (relance cliente en attente). Relance de signature le 25/08/2026 si toujours rien |
| Argent en attente | 2 050 € — Tranche 2 non déclenchée |

## En une phrase

Elle a fait la recette des Modules 1 et 2 le 08/08 et **envoyé 16 points**, tous traités
le 14/08. Elle juge le travail « de très bonne qualité » et « conforme au périmètre »,
et valide les quatre premiers écrans sur le plan fonctionnel. **Rien n'est signé, ni par
elle ni par nous**, et les questions du questionnaire d'affinités, seules bloquantes pour
le Module 3, ne sont toujours pas arrivées.

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

**Non fait, et dit :** **l'app n'a pas tourné sur un vrai téléphone**, ce qui reste
bloquant pour tout ce qui touche la caméra (R-51). Rien ne s'annonce à la cliente avant.

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

| Document | Fichier | État |
|---|---|---|
| Contrat signé | `CONTRAT DE PRESTATION DE DÉVELOPPEMENT INFORMATIQUE (signed).pdf` | **signé le 09/07** |
| NDA | `NDA-V2-ClubElevia-MrAttractor-2026-06-13.html` | signé |
| Avenant n°1 **révision V2** | `AVENANT-01-V2-ClubElevia.html` | **à signer** (la V1 du 17/07 est dans `_archive/`, non signée) |
| Devis V5 | `DEVIS-ATR-2026-0005-ClubElevia` | **à signer** |
| CDC V4 | `CDC-ATR-2026-0005-ClubElevia` | **à signer** |
| Reçus 001 à 004 | `RECU-ATR-2026-00x-ClubElevia` | émis |
| Annexes de vision (offertes) | `ELEVIA-Vision-et-proposition-de-valeur`, `ELEVIA-Grandes-orientations` | envoyées |
| Réponse à son mail du 02/08 | `BROUILLON-REPONSE-ELISE-03-08.md` | **à relire et envoyer** |
| Réponse du 29/07 | `BROUILLON-REPONSE-ELISE-29-07.md` | envoyée |

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

> Relevé en base le 14/08/2026. **Trois dossiers de signature se sont succédé**, et seul
> le dernier vaut. Les deux liens que cette fiche donnait auparavant appartenaient au
> dossier du 03/08, **expiré depuis le 05/08**.
>
> **Piège constaté :** ces deux liens périmés répondent quand même **HTTP 200**. Un test
> au code de retour les aurait déclarés vivants. Vérifier le `statut` du dossier en base,
> jamais la réponse HTTP (même leçon que R-60).

**Le dossier qui vaut : `94722c2d-77d5-4579-b9a1-2e749baea1fa`**, créé le 05/08,
statut `en_attente`, **expire le 30/09/2026**. Il scelle l'Avenant V3, le Devis V5 et le
CDC V4.

| Signataire | Statut au 14/08 | Lien |
|---|---|---|
| Élise CAPEL | **`ouvert`** : elle a cliqué, elle n'a pas signé | `signature.agenceattractor.com/s/664e2w4y0v421z5q5s6i026d474q0v030f3k6e53646x1g6v` |
| Mac Arthur (contresignature) | **`en_attente`** : ta signature manque aussi | `signature.agenceattractor.com/s/1g595w5c59035x33280n0p5s5s37590f3d1a12104e271y1x` |

C'est le lien envoyé dans le mail du 07/08, il est donc inutile d'en générer un nouveau.

Dossiers antérieurs, **expirés et non signables** : `22518a80` du 03/08 et `a2a170aa` du
29/07. Elle avait ouvert les deux sans signer.

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
3. **Signer soi-même** l'avenant : la contresignature manque, et attendre la sienne sans
   avoir apposé la nôtre n'a pas de sens.
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

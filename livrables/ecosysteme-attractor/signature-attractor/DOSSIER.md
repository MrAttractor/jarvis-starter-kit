# Signature Attractor — l'état du produit

> Révision du 31/07/2026. **Cette fiche est la première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | en production |
| Dernier contact | 2026-08-04 |
| Prochaine action | Corriger les deux manques révélés par la première signature réelle (`envoyer: false` et renvoi d'invitation) |
| Échéance | — |
| Argent en attente | — |

## En une phrase

Signature électronique maison, en service depuis le 22/07. **0 € contre 9 à 25 €/mois
chez Yousign.** Elle attend sa première signature client réelle : celle d'Élise.

## Pourquoi elle existe

Le blocage du Club Élévia n'était pas un refus de la cliente, **c'était l'absence d'un
moyen simple de signer**. Elle avait déjà versé 700 € de développement sans avoir signé
le devis. Refus explicite de payer un abonnement alors que 70 % de la plomberie existait
déjà dans le module de devis en ligne.

C'est le **maillon 5 de la chaîne de vente**, après le devis interactif.

## Ce qui est en ligne

| Quoi | Où |
|---|---|
| Page de signature | `signature.agenceattractor.com/s/<jeton>` |

Backend Supabase partagé, tables `sig_`, migration 0061, quatre fonctions :
`sign-create`, `sign-load`, `sign-otp`, `sign-verify`. Front sur Cloudflare Pages.

Le signataire ouvre un lien, lit le document, signe au doigt ou à la souris, et confirme
avec un code reçu par email. Rien à imprimer, rien à installer.

## Le niveau juridique, assumé

**Signature électronique simple** (article 1367 du Code civil, article 25 du règlement
eIDAS). Valable et recevable en justice, **mais sans présomption de fiabilité** : en cas
de contestation, c'est à nous d'apporter la preuve.

**À ne pas utiliser pour l'immobilier ni pour les cessions de parts sociales.**

## Un bug déjà corrigé, et sa leçon

**31/07 : les invitations tombaient en indésirable.** L'expéditeur était `noreply@`, une
adresse sans boîte réelle, ce qui est un signal de spam classique et n'accepte aucune
réponse. Passé à `hello@agenceattractor.com` dans `_shared/signature.ts`, donc corrigé
pour tous les dossiers.

**Règle à appliquer partout : jamais de `noreply@` sur un email que le destinataire doit
ouvrir et sur lequel il doit agir.** Et symptôme trompeur à retenir : l'envoi renvoie un
succès, les logs sont propres, et pourtant le client n'a rien reçu. Un envoi réussi n'est
pas un email lu.

## Un défaut trouvé le 03/08, à corriger

**Mettre `sig_dossiers.statut` à `expire` ne bloque rien.** `sign-load` ne regarde que
`expire_at`, jamais le statut : le lien reste chargeable et signable. Découvert en
remplaçant le package d'Élise, qui avait déjà ouvert l'ancien lien et aurait pu signer
une version périmée de l'avenant.

**Contournement appliqué :** dater `expire_at` dans le passé. **Correctif à faire :**
`sign-load` et `sign-verify` doivent refuser un dossier dont le statut n'est pas
`en_attente`. Tant que ce n'est pas fait, révoquer un dossier passe par `expire_at`,
jamais par le statut seul.

**Manque aussi un moyen de créer un dossier sans envoyer l'invitation.** `sign-create`
envoie systématiquement, ce qui empêche de préparer un lien pour l'envoyer soi-même
dans un courrier d'accompagnement. Contourné le 03/08 par insertion directe en base
(script dans le scratchpad de session). Ajouter un `envoyer: false` à `sign-create`.

## Un piège de conception, voulu

**Un document modifié après scellement bloque la signature.** C'est volontaire : ça
garantit que le signataire signe bien ce qu'on lui a montré. Il faut alors créer un
nouveau dossier de signature, pas contourner.

## Le test réel a eu lieu le 04/08

Invitation d'Élise envoyée depuis `hello@agenceattractor.com` : Resend renvoie
**delivered**, le serveur d'Outlook a accepté le message, là où l'envoi du 29/07 depuis
`noreply@` avait fini en indésirable. **Le correctif d'expéditeur est validé en réel.**

Réserve à garder en tête : `delivered` prouve l'acceptation par le serveur, **pas
l'arrivée en boîte de réception**. Le seul signal fiable reste le passage du signataire
de `en_attente` à `ouvert`.

L'invitation a été envoyée par un script hors module (Resend + insertion de l'événement
`envoye`), puisque `sign-create` ne sait ni créer sans envoyer, ni renvoyer une
invitation sur un dossier existant. Les deux manques sont ci-dessus.

## Prochaine action

1. Ajouter `envoyer: false` à `sign-create`, et une fonction de **renvoi d'invitation**
   sur un dossier existant. Sans elle, chaque relance passe par un script à la main.
2. Corriger `sign-load` et `sign-verify` pour qu'ils refusent un statut autre que
   `en_attente` (aujourd'hui, révoquer passe seulement par `expire_at`).
3. Brancher `sign-verify` sur le pipeline de pilotage pour qu'un dossier signé déclenche le reçu automatiquement, comme le fait déjà l'acceptation de devis.

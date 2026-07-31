# Signature Attractor — l'état du produit

> Révision du 31/07/2026. **Cette fiche est la première chose à lire du dossier.**

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

## Un piège de conception, voulu

**Un document modifié après scellement bloque la signature.** C'est volontaire : ça
garantit que le signataire signe bien ce qu'on lui a montré. Il faut alors créer un
nouveau dossier de signature, pas contourner.

## Prochaine action

1. **Vérifier que l'invitation d'Élise arrive bien** maintenant que l'expéditeur est corrigé. C'est le test réel du module.
2. Brancher `sign-verify` sur le pipeline de pilotage pour qu'un dossier signé déclenche le reçu automatiquement, comme le fait déjà l'acceptation de devis.

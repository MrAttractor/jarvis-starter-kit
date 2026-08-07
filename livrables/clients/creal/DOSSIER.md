# C'Real — l'état du dossier

> Fiche créée le 06/08/2026, mise à jour le 07/08/2026.
> **Cette fiche est la première chose à lire du dossier.**
> Un chiffre ou un statut n'existe qu'ici. S'il apparaît ailleurs, c'est une copie à vérifier.

| Radar | |
|---|---|
| Statut | **en production**, message de livraison prêt à envoyer |
| Dernier contact | 2026-07-07 |
| Prochaine action | Envoyer le message à Kezey, puis vérifier sous une semaine qu'elle a saisi son stock et changé son mot de passe |
| Échéance | — |
| Argent en attente | **rien de tracé, et c'est le vrai trou du dossier** |

## En une phrase

Marie Kezey a désormais sa boutique **et** son tableau de bord chez elle, sur
`boutiquecreal.com`, sans plus aucune dépendance à Attractor Assists, passé en
pause le 06/08/2026.

## Les liens

| Quoi | Où | Pour qui |
|---|---|---|
| La boutique | `boutiquecreal.com` | ses clientes |
| Son tableau de bord | `boutiquecreal.com/admin` | **elle** |
| Son guide | `boutiquecreal.com/guide` | elle |

Projet Cloudflare Pages `boutiquecreal`, branche de production **`main`**
(vérifiée, pas devinée, R-17).

Connexion : `creal.creal21@gmail.com`. **Le mot de passe temporaire ne s'écrit
pas ici** : il se transmet dans le message, et elle le change à sa première
visite. Le guide d'Ayêla affichait encore son mot de passe initial des mois
après qu'elle l'ait changé, on ne refait pas ça.

## Ce qui a été fait le 07/08/2026

**Sortie d'Assists.** Sept tables `cr_`, une edge function `creal-public`, et la
boutique ne parle plus qu'à elle. Les trois appels à Assists (`get_catalogue`,
`chat-assistant`, `save_order`) ont disparu.

**Le catalogue devient réel.** Avant, les fiches produits vivaient en dur dans le
JavaScript et Assists ne synchronisait que le prix, par rapprochement
approximatif sur le nom. Kezey pouvait changer un prix et rien d'autre :
désactiver un produit ne le retirait pas de la page. Les deux moitiés sont
réunies dans `cr_produits`, qui fait seule autorité.

**Le plafond de 20 commandes par mois a disparu.** Il venait du plan gratuit
d'Assists, et `save_order` refusait d'enregistrer au-delà, en silence. La 21e
commande du mois serait arrivée sur son téléphone sans jamais apparaître nulle
part. En sortant d'Assists, le problème n'existe plus.

**Tableau de bord en cinq onglets** : accueil, commandes, farines, stock, ventes.
Le stock baisse au passage d'une commande en « préparée », jamais à sa création :
ses clientes commandent sur WhatsApp et toutes ne confirment pas.

**Une page 404.** Le domaine servait la boutique sur **n'importe quel chemin**,
en code 200. `/admin` et `/nimportequoi` renvoyaient la même page, octet pour
octet.

## Ce qui a été prouvé, et comment

| Ce qui est prouvé | Comment |
|---|---|
| Un anonyme ne lit aucune commande | ligne réelle insérée en service role, invisible à la clé anon |
| Un anonyme ne peut pas insérer de commande | HTTP 401 |
| Le prompt de Zoé ne sort jamais du serveur | absent de la réponse `catalogue` |
| Un autre compte connecté ne voit rien | compte jetable créé, 0 ligne partout, puis supprimé |
| Un tiers ne peut pas modifier un prix | **0 ligne modifiée** (le code 204 seul aurait menti) |
| Un panier truqué ne passe pas | total forcé à 1 F, enregistré à 1 500 F |
| Le parcours complet fonctionne | vrai code de la page joué contre la base : commande → tableau de bord → préparée → stock 20 → 17 → 20 |

## Ce que le téléphone a corrigé, avant la bascule

Mac Arthur a ouvert le tableau de bord sur son iPhone le 07/08. Deux défauts
qu'aucun des contrôles automatisés n'avait vus :

1. **L'alerte de stock était un cul-de-sac.** « À produire » était une étiquette,
   pas un bouton : il fallait changer d'onglet et retrouver la farine. Chaque
   ligne ouvre maintenant directement la saisie.
2. **Le message était faux.** Ses huit farines n'étaient pas épuisées, elle
   n'avait jamais saisi son stock. L'écran affichait huit alertes rouges et une
   pastille à 8 dès la première ouverture. « Jamais renseigné » se dit maintenant
   autrement que « en rupture ».

C'est la deuxième fois en deux jours que l'appareil réel trouve ce que les tests
laissent passer. R-51.

## Ce qui reste à faire

1. **Envoyer le message de livraison** (rédigé, prêt).
2. **Vérifier sous une semaine** qu'elle a saisi son stock et changé son mot de
   passe. Tout est à zéro, volontairement : un stock inventé est pire que pas de
   stock.

## Ce qui n'est toujours pas établi

1. **Ce qui a été facturé et ce qui reste dû. Aucun devis, aucune facture, aucun
   montant dans le workspace.** On vient de lui construire l'équivalent de ce
   qui vaut entre 1,8 et 3 millions de FCFA chez Ayêla. C'est une question à
   poser, et le moment de la poser, c'est la livraison.
2. **Si un abonnement mensuel doit exister sur ce dossier.** Précision de Mac
   Arthur le 07/08/2026 : **aucun récurrent n'est activé nulle part à ce jour**,
   l'agence est encore en phase de mise en place du système. Les 35 €/mois de
   GetWinWorld et les 50 €/mois de J'Envoie Express sont contractuels, pas
   encaissés. C'Real n'est donc pas une exception, et la vraie question est
   collective : quand active-t-on les récurrents, et sur quels dossiers d'abord.
3. **Le sort de la proposition Assists** (`creal-assists/proposition-creal.html`),
   envoyée ou jamais partie. Elle n'a plus d'objet maintenant qu'Assists est en
   pause : à archiver.

## Ce que l'usage a appris

Zéro commande n'est jamais passée par le tunnel de paiement de la boutique. Ses
clientes regardent le catalogue puis écrivent sur WhatsApp. Le tableau de bord
ne se remplira donc que si elle marque elle-même ses commandes, ou si le
parcours d'achat lui amène de vraies commandes. **À regarder dans un mois : si
`cr_commandes` est encore vide, c'est le parcours qu'il faut revoir, pas
l'outil.**

## Où sont les choses

| Quoi | Chemin |
|---|---|
| Boutique, tableau de bord, guide, 404 | `../demo-site/public/creal/` |
| Migrations et edge function | `supabase/` |
| Maquette Assists (à archiver) | `../demo-site/public/creal-assists/` |
| Visuels sources | `sources-visuels/` |

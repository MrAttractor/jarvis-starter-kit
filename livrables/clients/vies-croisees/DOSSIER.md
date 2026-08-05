# Vies Croisées — l'état du dossier

> Révision du 05/08/2026. **Cette fiche est la première chose à lire du dossier.**

## En une phrase

Site en production sur `viescroiseesci.com`, Andréa est autonome. **Le vrai sujet n'est
plus technique : elle produit et ne publie pas.**

## Le client

**Andréa Koné**, émission « Vies Croisées » sur la transformation, la vulnérabilité et
l'authenticité. Cible : diaspora africaine et France. Projet parti de zéro, **sans aucune
audience préexistante**.

Compte de pilotage : `viescroiseesci@gmail.com`. Elle change son mot de passe elle-même.

## L'état éditorial réel, relevé le 05/08

| | | au 25/07 |
|---|---|---|
| Articles écrits | **18** | 18 |
| Articles **lisibles en ligne** | **2** | 0 |
| Articles programmés (dont 2 dont la date est passée) | 3 | 4 |
| Épisodes | 4 | 4 |
| Abonnés | 1 | 0 |
| Témoignages | 0 | 0 |
| Commentaires | 0 | 0 |

Elle a commencé à sortir : deux chroniques sont lisibles depuis le 25/07, et un premier
abonné est arrivé. **Mais 16 textes sur 18 dorment toujours**, et personne n'a encore
réagi. C'est le seul chiffre qui compte dans ce dossier.

Piste proposée et non encore tranchée avec elle : programmer ses chroniques restantes à
raison d'une par semaine, pour amorcer sans qu'elle ait à décider chaque semaine.

## L'argent

Aucun montant n'est tracé dans ce dossier. Le domaine a été acheté par Mac Arthur via
Cloudflare et la zone vit dans le compte de l'agence. **À clarifier** : ce qui a été
facturé, ce qui reste dû, et si un abonnement mensuel doit être activé.

## Ce qui est en ligne

| Quoi | Où |
|---|---|
| Site public | `viescroiseesci.com` (+ www, SSL Cloudflare) |
| Espace de pilotage d'Andréa | `viescroiseesci.com/?pilotage` (les 5 taps sur le logo restent en secours) |

Projet Cloudflare Pages dédié `viescroiseesci`, **branche de production `main`**.
Backend Supabase partagé, tables `vc_`. L'ancien lien `demo.agenceattractor.com/vies-croisees`
redirige en 301.

**Source du code : `../demo-site/public/vies-croisees/`.** Ne déployer que les fichiers
utiles (`index.html`, `logo.png`, `og-default.jpg`, `partenaires/`, `_worker.js`), **jamais
la proposition de vente qui vit dans le même dossier**.

## Ce que le site sait faire

- **J'aime** et **commentaires** sur les épisodes ET sur les articles. Les commentaires d'article s'affichent dépliés au bout de la lecture, dans le lecteur. Le j'aime ne demande aucun compte : le lecteur est reconnu par un identifiant tiré au hasard, gardé par son navigateur (migration 0005)
- Épisodes et articles avec **programmation réelle** : avant l'heure, la ligne n'est pas lisible avec la clé publique. Ce n'est plus une étiquette sans effet comme dans la première version.
- **Teasers multiples** par épisode, **visuels** (affiche + photo avec l'invité), réduits côté navigateur
- **Partage réseaux** : un `slug` figé par contenu, adresses `?a=` et `?e=`, et un Worker qui réécrit les balises de partage pour que l'aperçu soit correct
- Bandeau **partenaires** non cliquables
- Espace admin : publication, partenaires, modération des commentaires (la boîte dit si le message vient d'un article ou d'un épisode), total des j'aime au tableau de bord, boîte témoignages et abonnés

## La phrase de partage

Le message qui s'affiche quand on envoie le lien du site est celui d'Andréa, mot pour mot :
« Vies Croisées, l'émission qui fait dialoguer les parcours de vie pour éveiller les
consciences, qui met en lumière ce qui transforme une vie. » Il vit à trois endroits du
`index.html` (`description`, `og:description`, `twitter:description`) et une quatrième fois
dans `_worker.js` comme filet. **Quand on partage un article précis, c'est le début de
l'article qui s'affiche à la place**, et c'est voulu : le titre et l'extrait du texte
donnent plus envie de cliquer qu'une phrase de présentation répétée.

Facebook garde en mémoire l'ancien aperçu d'un lien déjà partagé. Pour le forcer à relire :
`developers.facebook.com/tools/debug`, coller l'adresse, « Scrape Again ».

## Deux corrections de sécurité déjà passées

1. La table qui stockait le mot de passe **en clair** a été supprimée (migration 0003). L'authentification passe par Supabase Auth, les policies sont scopées à son UID.
2. La détection du mode pilotage cherchait une **sous-chaîne** dans l'URL : tout visiteur dont l'article partagé contenait « andrea » se voyait proposer la connexion admin. Corrigé le 25/07, la détection ne lit plus que les paramètres exacts.

## Prochaine action

**Traiter le sujet éditorial avec elle, pas la technique.** Lui proposer un calendrier de
publication simple et l'aider à appuyer sur le bouton. Et clarifier ce qui a été facturé.

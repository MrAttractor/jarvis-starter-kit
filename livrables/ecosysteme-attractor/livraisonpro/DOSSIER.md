# Livraison Pro — l'état du produit

> Révision du 31/07/2026. **Cette fiche est la première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | en cours |
| Dernier contact | 2026-08-10 |
| Prochaine action | Décidé le 10/08 : coup de commercial via Job Dadié. Rédiger et envoyer le PDF de présentation pour qu'il prospecte des utilisateurs. Retirer aussi l'ancien Vercel |
| Échéance | — |
| Argent en attente | — |

## En une phrase

En ligne sur `livraisonpro.agenceattractor.com` depuis le 13/07, en **phase de
recrutement de testeurs** par un commercial terrain. Aucun utilisateur réel connu.

## Ce que c'est

Marketplace de livraison certifiée en Côte d'Ivoire : elle met en relation des **livreurs
moto indépendants vérifiés** et des **e-commerçants** qui veulent travailler en direct.
Elle résout le point logistique : données traçables, suivi, relation client.

C'est une app de l'écosystème ATTRACTOR, pas une commande client.

## Ce qui est en ligne

| Quoi | Où |
|---|---|
| Application | `livraisonpro.agenceattractor.com` |
| Support de vente terrain | `livraisonpro.agenceattractor.com/pitch` |

Projet Cloudflare Pages dédié `livraisonpro`, branche `main`, sous-domaine branché chez
GoDaddy. Backend Supabase partagé, tables `lp_`.

**Le support terrain est pensé pour le commercial** : il se feuillette sur mobile, montre
les deux côtés (marchand et livreur), déroule un cas pratique, et **capte l'avis à chaud**
dans `lp_feedback` avec notification email. Le paramètre `?c=<commercial>` permet
d'attribuer chaque retour à celui qui l'a collecté.

## L'historique à connaître

L'app était **en panne** et personne ne le savait : son projet Supabase dédié avait été
mis en pause pour inactivité, parce que le compte gratuit est limité à 2 projets actifs.
Diagnostiqué et corrigé le 08/07 en la basculant sur le projet partagé.

**Leçon qui vaut pour toutes les apps de l'écosystème** : une app qu'on ne regarde plus
peut tomber sans alerte. Elle est aujourd'hui surveillée, mais son inscription n'est
testée que manuellement.

Migrée de Vercel vers Cloudflare Pages le 13/07. **L'ancien projet Vercel est à retirer**,
il ne sert plus.

## Prochaine action

1. **Décidé le 10/08/2026 : coup de commercial terrain, via Job Dadié.** Rédiger et lui envoyer un PDF de présentation, dont il a besoin pour prospecter des utilisateurs (livreurs et marchands).
2. **Retirer l'ancien déploiement Vercel**
3. Suivre la phase de recrutement de testeurs : combien de livreurs et de marchands ont réellement été approchés, et ce que disent les avis captés dans `lp_feedback`

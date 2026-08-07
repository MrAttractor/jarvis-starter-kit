# J'Envoie Express — l'état du dossier

> Révision du 31/07/2026. **Cette fiche est la première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | en production |
| Dernier contact | 2026-06-03 |
| Prochaine action | Confirmer le solde de 100 €. Le mensuel attend l'activation des récurrents, chantier collectif |
| Échéance | — |
| Argent en attente | 100 € de solde. Le mensuel de 50 € est contractuel, pas encaissé |

## En une phrase

Livré et en production sur `jenvoiexpress.com` depuis juin. Jean Yves est autonome sur
son back-office. **C'est le template n°1 du Générateur d'Apps Métier**, validé en
conditions réelles.

## Le client

**Jean Yves**, gb.jeanyves@yahoo.fr. Envoi de colis France ↔ Côte d'Ivoire.
Il a son propre compte admin, avec le « mot de passe oublié » en libre-service.

Il est aussi le **partenaire opérationnel du projet VSD** (voir `../air-cote-divoire/VSD.md`).
Ne pas confondre les deux dossiers : ici c'est son application de colis, qui continue de
tourner indépendamment de VSD.

## L'argent

| | |
|---|---|
| Prix | **230 €** |
| Acompte reçu le 3 juin | 130 € |
| Solde | **100 €** |
| Abonnement | **50 €/mois** |

**Le solde de 100 € est-il rentré ?** C'est la seule question ouverte côté argent
sur ce dossier.

**L'abonnement de 50 €/mois n'est pas encaissé, et ce n'est pas un oubli.**
Précision de Mac Arthur le 07/08/2026 : **aucun récurrent ne tourne nulle part**,
l'agence est encore en phase de mise en place du système. Le montant est
contractuel. Son activation est un chantier collectif, pas une relance à faire
sur ce dossier.

## Ce qui est en ligne

| Quoi | Où |
|---|---|
| Site public | `jenvoiexpress.com` (racine et www) |
| Back-office Jean Yves | `/app.html`, 3 vues : à traiter, en cours, paramètres |
| Lien de tournée du livreur | `/livreur.html`, sans mot de passe, généré depuis l'admin |
| Reçu client | `/recu.html` |

Hébergé sur un **Worker Cloudflare** (pas Pages), backend Supabase partagé, tables `je_`,
policies scopées à l'UUID de Jean Yves.

## Ce que l'app sait faire

- Demande d'envoi, prochains départs alimentés par Jean Yves, suivi de colis en temps réel, prix dynamiques
- Acceptation rapide d'une demande avec création du colis en un geste, envoi du lien de suivi par WhatsApp en un clic
- **Tournée de livraison** (Paris → Abidjan) : le livreur voit ses colis groupés par quartier et coche « livré »
- **Tournée de collecte** (Abidjan → Paris) : il récupère les colis chez les expéditeurs et coche « collecté ». La même fonction détecte le sens du voyage et bascule seule entre les deux modes.
- Tarif Abidjan → Paris affiché **en FCFA d'abord** (6 500 F/kg), conformément à la règle FCFA-en-premier

## Un piège déjà payé une fois

La notification email des nouvelles demandes était **cassée en silence** : la fonction
n'avait ni en-têtes CORS ni gestion du OPTIONS, donc le navigateur bloquait l'appel sans
rien afficher. Un test en ligne de commande passait, une vraie inscription non.
**Toute fonction appelée depuis un navigateur doit gérer CORS et OPTIONS**, surtout quand
l'appel est lancé sans attendre la réponse.

## Ce qui fait foi

Le code du site est ici même (`index.html`, `app.html`, `livreur.html`, `login.html`,
`recu.html`), les migrations dans `supabase/`.

`BUSINESS-PLAN-CONVOYAGE.html` **appartient au dossier VSD**, pas à l'app de colis. Son
modèle économique a changé le 31/07 : ne pas s'y fier sans relire `../air-cote-divoire/VSD.md`.

## Prochaine action

- Confirmer le solde de 100 € et l'encaissement du mensuel
- Décider du sort du business plan convoyage, qui décrit un modèle abandonné

# État des lieux ATTRACTOR (28 mai 2026)

> Inventaire consolidé de l'existant : projets Claude.ai, repos GitHub, sites, backends, n8n. Objectif : distinguer ce qui est réellement déployé de ce qui est maquette, pour décider quoi vendre, finir ou archiver.

## Comptes

- **myattractor1@gmail.com** : compte pro (données projet, MasterSheets, email du site). Connecteurs Gmail/Agenda/Notion branchés ici.
- **macarthur.nguessankouassi@gmail.com** : perso (connecteur Drive actuel ; MasterSheet partagée avec lui).
- **macarthur.kouassi@outlook.fr** : Canva Pro.

## Backends

- **Apps Script "Agence"** (Sheet `1zhk...`) : onglets LEAD_MAGNET, PROSPECTS_AGENCE. Reçoit l'audit conversationnel et le lead magnet du site.
- **Apps Script "Attractor Assists V2"** (Sheet `147TU...`) : onglets ASSISTANTS, PROFILS, CONVERSATIONS, PARCOURS, PARCOURS_VENTES, AGENDA, TODO, ARMOIRE, COMMUNAUTE, KNOWLEDGE, SUPERVISION. Proxy Claude. Clé déplacée en Propriétés du script (sécurisée).

## Portefeuille : projet par projet

| Projet | Claude.ai | Repo GitHub | État réel |
|--------|-----------|-------------|-----------|
| **Site agence** | (Mise à jour site) | `mrattractor` (public, 15 fichiers) | Site multi-pages complet (audit, lead-magnet, consulting, notre-histoire, paiement). En prod sur agenceattractor.com. **Mûr.** |
| **Attractor Assists** | Assists. / Prochaines étapes / démo | `demoattractorassist`, `fibonacciwinner` | App PWA + landing + dashboard, backend Apps Script V2. Déployé. Dette : clé API morte laissée dans le HTML public de fibonacciwinner (à retirer). |
| **MY NUGO** (client) | MY NUGO / mynugo.store | `mynugo` (vitrine + 12 produits), `mynugo-dashboard` (dashboard CEO + assistant "MAC", Netlify Functions) | Livrable client le plus complet : boutique + dashboard IA. **Bien architecturé** (clé en variable d'env). En déploiement. À restreindre : clé Google dans mynugo/index.html. |
| **Livraison Pro** (2e app maison) | Livraison Pro | `livraisonpro` (privé→ouvert, 1 fichier) | App mobile PWA en **un seul fichier HTML** (splash, onboarding, météo, mode hors ligne, couleurs drapeau CI). MVP réel mais monolithique. Dette : tout dans un fichier. |
| **NABYCOOK** (client) | Application métier NabyCook | (pas de repo identifié) | Dashboard production + commandes + vitrine. Cliente Nabintou Dosso, déjà en témoignage sur le site. **Référence prouvée.** |
| **J'envoie Express** (client) | App livraison aérienne | (pas de repo identifié) | MVP d'app envoi de colis Abidjan-Paris-Abidjan. Deal 230€, acompte 130€ le 3 juin. Maquette + kit commercial PDF. En cours de closing. |
| **MIX PREMIER** | MIX PREMIER | `Mix-Premier-` (VIDE) | Repo vide, rien de poussé. Reste au stade conversation. |
| **LS EXPERTISE** | Plateforme suivi perfs agence | (pas de repo identifié) | Dashboard perfs équipes + analyse réseaux. Stade maquette/projet. |
| **OLIVE MAFO** | (récents) | (pas de repo identifié) | Automatisation Facebook → WhatsApp → mini-site IA. Projet. |
| **Cèchémoi** | App métier Cèchémoi | (pas de repo identifié) | App métier + chief of staff pour une CEO. Projet. |
| **INTIM CONFORT** | INTIM CONFORT | (pas de repo identifié) | Stratégie de développement. Projet. |
| **App rencontre diaspora** | Maquette rencontres | (pas de repo identifié) | Mise en relation + vérification vidéo. Produit perso/écosystème. |
| **entrepreneurs-engages** | (à confirmer) | `entrepreneurs-engages` (public, 3 fichiers) | Petit site (index + veille). À clarifier. |

## n8n

- Instance Docker locale actuellement **arrêtée** (Exited 255) et **vide** ("0 workflows"). Volume monté sur `C:\Users\n8n`.
- Conséquence : les vrais workflows sont ailleurs ou non chargés. À localiser avant toute analyse (export JSON dans context/import/n8n/).

## Sécurité (suivi)

- Clé Apps Script Assists : rotée et mise en Propriétés du script. OK.
- Clé Anthropic en dur dans `fibonacciwinner/assistant-client.html` (repo public) : **déjà morte (HTTP 401)**, pas de fuite active. À retirer du fichier par propreté.
- Clé Google dans `mynugo/index.html` (repo public) : à restreindre par référent HTTP.

## Lecture stratégique

- Le problème n'est pas la production, c'est la **dispersion** (12+ chantiers) et le **packaging commercial**.
- Récurrences techniques : apps monolithiques en un seul fichier (dette), gestion des secrets à durcir.
- Actifs les plus solides à valoriser tout de suite : **MY NUGO** (vitrine + dashboard IA, vraie référence client) et **NABYCOOK** (référence avec témoignage). Plus le **site agence** déjà mûr.
- Cash court terme : closer **J'envoie Express** (après échange prospect), puis répliquer via la skill `maquette-closer` sur les prospects.

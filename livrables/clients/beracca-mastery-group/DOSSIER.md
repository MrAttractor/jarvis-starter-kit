# Beracca Mastery Group — l'état du dossier

> Révision du 20/09/2026. **Cette fiche est la première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | **actif, en cadrage de production** |
| Dernier contact | 2026-09-19 (échange Mac Arthur / Bérénice, accord oral de finaliser la plateforme) |
| Prochaine action | Faire signer contrat V2 + Annexe A + NDA, encaisser les 100 000 FCFA |
| Échéance | Signature avant toute écriture de code |
| Argent en attente | 100 000 FCFA d'acompte, puis 100 000 FCFA/mois dès la livraison Phase 1 |

## En une phrase

Le dossier est reparti le 19/09 après trois mois de silence : **accord oral pour construire
la vraie plateforme TOP Attiéké**. On sort de la démo, on construit la Phase 1 contractuelle.
**Rien n'est encore signé ni encaissé.**

## Le client

**Bérénice KOUADIO DEBRIMOU**, beraccamasterygroup@gmail.com, +225 07 57 49 72 07.
Agro-distribution, marque **TOP Attiéké** (100 % manioc local, made in Côte d'Ivoire).

**Le fait qui donne sa valeur au dossier** : Beracca a obtenu, via la mise en relation
faite par Mac Arthur avec le Cabinet DAB, un **marché d'exportation de 3 à 5 tonnes par
mois d'attiéké vers KONAVA / magasins OPLUS au Canada**. C'est le premier producteur à
avoir matérialisé le concept DFMM. Voir `../cabinet-dab/`.

## Le modèle de deal, à connaître

C'est la **Famille D, partenariat de performance**, le seul modèle de ce type de l'agence :

| | |
|---|---|
| Mise en place | **150 € / 100 000 FCFA** |
| Mensuel | **100 000 FCFA/mois**, dû à compter de la livraison de la Phase 1 |
| Intéressement | **10 % du CA net encaissé au-dessus du CA de référence** |

**L'intéressement porte sur la croissance, pas sur le chiffre d'affaires total**, et par
rapport à une moyenne des 3 mois précédant la signature. C'est ce qui rend le modèle
défendable : on ne gagne que si l'entreprise gagne plus qu'avant.

**Encaissé : rien à ce jour.**

## Décisions du 20/09/2026

| Sujet | Décision |
|---|---|
| Périmètre de la livraison | **Phase 1 complète du contrat**, telle qu'écrite à l'Art. 4 |
| Hébergement | Nouveau chemin `demo.agenceattractor.com/topattieke`, **la démo de juin reste en ligne** comme actif de vente |
| Catalogue | Les prix de la démo sont **confirmés par Bérénice**, ils deviennent le catalogue de départ |
| Contrat | Accord oral seulement. **Contrat V2 à signer avant écriture du code** (R-09) |

## Les deux verrous juridiques ouverts

1. **Le NDA n'a jamais été signé.** Le contrat le référence pourtant comme signé le
   17/06/2026 aux Art. 11 et 15.1. La V2 corrige la formulation : NDA signé
   *concomitamment* au contrat. Les deux documents partent ensemble à la signature.
2. **Le CA de référence n'existe pas.** L'Art. 7.2 exige qu'il soit acté par écrit pendant
   le cadrage de la Phase 1. Sans lui, la commission de 10 % est incalculable et devra se
   négocier a posteriori, une fois la plateforme en service et la cliente sans raison
   d'aider à fixer un seuil bas. D'où l'**Annexe A** créée le 20/09, qui le fixe, l'explique
   en langage simple et se signe en même temps que le contrat.

## Ce qui fait foi

| Document | Fichier |
|---|---|
| **Contrat V2 à signer, avec Annexe A** | `CONTRAT-Beracca-MrAttractor-2026-09-20.html` |
| Contrat V1, projet du 17/06 (historique) | `CONTRAT-Beracca-MrAttractor-2026-06-17.html` |
| NDA, 11 articles, arbitrage CCJA-OHADA | `NDA-Beracca-MrAttractor-2026-06-17.html` |
| Fiche d'investissement synthétique | `FICHE-INVESTISSEMENT-Beracca-2026-06-17.html` |
| Proposition | `proposition-bmg.html` / `.pdf` |
| Synthèse stratégique, découpage en tranches | `synthese-strategique.md` |
| Démo de vente de juin (à conserver) | `../demo-site/public/beracca/` |

## Ce qu'on construit : la Phase 1

L'ordre de construction est celui de l'argent, pas celui du métier (cf.
`synthese-strategique.md` § 2). Le stock, la production, les revendeuses et les planteurs
sont contractuellement en Phases 2 à 5, chacune avec son propre devis. **Ne rien en offrir
dans cette livraison.**

| Front, côté clients de Bérénice | Back, côté Bérénice |
|---|---|
| Catalogue TOP Attiéké, formats boule et kg | Dashboard : CA, commandes du jour, retards |
| Prise de commande + suivi de statut | CRM simple : particuliers, entreprises, revendeuses |
| Paiement Mobile Money (Wave, Orange, MTN) + cash | Facturation auto : facture pro, bon de livraison |
| Assistant IA (FAQ, suivi de commande) | Journal des paiements et des soldes |

**Stack** : architecture maison de la skill `generateur-app-metier`, Supabase partagé +
Cloudflare Pages, deux surfaces (publique et admin). Préfixe de tables retenu : `bmg_`.
La démo de juin est du React/Babel monofichier sans base : elle ne se recycle pas, seuls
ses visuels produits et sa direction graphique sont repris.

**Point d'architecture à ne pas rater** : la base et les rôles se pensent multi-sites dès
maintenant (Abidjan, Bouaké, sites futurs), même avec un seul site actif. C'est coûteux à
reprendre après, et la Phase 2 en dépend.

## Prochaine action

**Envoyer contrat V2 + Annexe A + NDA à la signature, et demander les chiffres de CA de
juin, juillet et août.** Le code démarre à la signature, pas avant.

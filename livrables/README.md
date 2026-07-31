# Livrables

Ce dossier contient **tout ce que Claude produit pour Mac Arthur (Mr Attractor)** : apps, maquettes, devis, contenus, MVP.

## Règle d'or

- **Inputs** (documents que je fournis à Claude) → `context/import/`
- **Outputs** (ce que Claude produit pour moi) → `livrables/`

## Structure (ma grille)

| Dossier | Ce qui y va |
|---------|-------------|
| `clients/` | Web apps métiers sur mesure. Un sous-dossier par client (maquette, app, docs). |
| `ecosysteme-attractor/` | Apps maison de l'écosystème : Attractor Assists, Livraison Pro, Fidelys, module de pilotage. |
| `commercial/` | Devis, factures, maquettes de démo, supports de vente. |
| `contenu/` | Campagne de contenu : manuel, challenge 7 jours, scripts, hooks, calendrier éditorial. |
| `recherche-et-developpement/` | Mise en route d'idées inspirées vers des MVP, pensés pour être utilisables en marque blanche. |

## La règle des dossiers clients (31/07/2026)

**Chaque dossier client commence par un `DOSSIER.md`.** C'est la première chose qu'on lit
en l'ouvrant, et la seule qui fasse autorité sur l'état du dossier.

Il répond toujours aux mêmes questions, dans cet ordre :

1. **En une phrase** : où on en est aujourd'hui
2. **Le client** : qui, contact, activité
3. **L'argent** : montant, encaissé, reste dû, échéancier. Écrit ici et nulle part ailleurs.
4. **Ce qui fait foi** : la liste des documents en vigueur, avec leur état
5. **Le piège du dossier** : ce qui a déjà coûté cher, ou ce qui peut coûter cher
6. **Prochaine action** : quoi, et qui l'a en main

Deux conséquences pratiques :

- **Un chiffre n'existe qu'à un seul endroit.** S'il apparaît ailleurs, c'est une copie à
  vérifier. La complexité d'un dossier a déjà caché une erreur pendant cinq jours.
- **Les documents périmés vont dans `_archive/`**, avec un README qui dit pourquoi chacun
  y est. Un contrat caduc rangé à côté du contrat signé finit par partir au client.

Le dossier `air-cote-divoire/` suit la même règle sous un autre nom : sa note unique
s'appelle `VSD.md`.

## Convention de nommage

- kebab-case, sans accents ni espaces : `clients/olive-mafo/`, `commercial/devis/2026-06-jenvoie-express.md`
- Fichiers datés : préfixe `AAAA-MM` pour garder l'ordre chronologique.
- Un client = un dossier dans `clients/`, avec à l'intérieur `maquette/`, `app/`, `docs/` selon le besoin.

> Ce qui est validé ici a vocation à nourrir la refonte d'Attractor Assists : on garde l'organisation simple et reproductible.

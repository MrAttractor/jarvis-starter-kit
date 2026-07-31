# context/import — les entrées

Tout ce qui **arrive** dans le workspace : logos et photos envoyés par les clients,
captures, exports, notes brutes, specs. Ce qui **sort** (ce que Claude produit) va
dans `livrables/`, jamais ici.

Rangé le 31/07/2026. Avant, 172 fichiers vivaient en vrac à la racine.

## Où déposer un nouveau fichier

| Dossier | Ce qu'il contient |
|---|---|
| `clients/<client>/` | tout ce qui vient d'un client : logo, photos produits, notes, brief brut |
| `ecosysteme/` | les apps maison : `assists/`, `cockpit-miroir/`, `paiement/`, `livraison-pro/` |
| `marque/` | l'identité Attractor : `personnages/`, `campagne/`, `site-et-contenu/`, `design-system-references/` |
| `methode/` | la méthode ATTRACTOR, les ebooks, la base de connaissance Assists |
| `formation/` | les supports de formation et de certification |
| `devis/` | les devis générés par la skill `devis-express` (ne pas déplacer, elle écrit ici) |
| `_archive/` | ce qui a servi et ne sert plus, daté |

**La règle, en une phrase :** un fichier client va dans son dossier client, le reste
va dans le dossier qui décrit son usage. En cas d'hésitation entre les deux, le
client l'emporte.

## Deux conventions

1. **Nommer le fichier pour le retrouver**, pas pour décrire son contenu. Les visuels
   générés par IA arrivent avec le prompt entier comme nom, sur 200 caractères : les
   renommer court et garder le prompt dans le README du dossier (voir
   `marque/campagne/README.md`).
2. **Ne rien laisser à la racine.** Si un fichier n'a pas de dossier, c'est qu'il en
   manque un : le créer.

## Chemins cités ailleurs, à ne pas déplacer sans mettre à jour

- `methode/methode-md/BASE_CONNAISSANCE_ASSISTS.md` — cité dans `CONTEXT.md` et `concept-v3.md`
- `marque/design-system-references/` — cité dans `CONTEXT.md` et `design-system.md`
- `devis/` — la skill `devis-express` écrit dedans
- `formation/Enneagramme Preparation Mentale.xlsx` — cité par la bible de certification

## Comment s'en servir

Déposez le fichier dans le bon dossier, puis demandez l'analyse en donnant son
chemin. Exemple : « analyse `clients/ayela/CEO Ayela.heif` et prépare le visuel de
la page fondatrice ».

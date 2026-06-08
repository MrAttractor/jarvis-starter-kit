# Adapter le gabarit aux 3 livrables

Le déploiement (comment transformer un fichier en lien) est traité dans `SKILL.md`, étape 5 — un seul chemin désormais : `demo.agenceattractor.com`. Ce fichier se concentre sur l'adaptation du contenu.

## Le gabarit `assets/template-maquette.html`

Autonome (CSS et JS inline), pour l'habiller :

1. **Couleurs** : en haut du `<style>`, change `--brand` (couleur principale) et `--brand-2` (accent). Tout le reste suit. Si un logo ou des visuels sont fournis, prélève les couleurs dominantes et utilise leurs codes hexadécimaux — c'est dans le bloc 1 de la fiche prospect.
2. **Variables `{{...}}`** : remplace-les par le contenu réel (nom de l'app, secteur, promesse, titres et textes des écrans). Du vrai contenu en français, jamais de remplissage.
3. **Écrans** : garde 3 à 5 écrans (`.view`) par perspective. Adapte les libellés des onglets du bas (`.tab`).
4. **Visuels** : pour donner de l'âme, remplace les `.thumb` par de vraies images (par exemple des personnes générées par IA qui incarnent la cible du client, comme les visuels que Mac Arthur ajoute aux fiches prospects). Encode-les en base64 ou héberge-les pour que le fichier reste autonome.

## Une maquette, deux perspectives

Pour le livrable "parcours client" (étape 3 de `SKILL.md`), pas besoin d'un fichier séparé : ajoute un toggle ou un onglet en tête de l'écran qui bascule entre :
- **Vue [Prénom du client]** : son tableau de bord, ses commandes, ses stats — l'interface qu'il pilote.
- **Vue cliente finale** : ce que vivent SES clients — découverte, questions à l'assistant, commande, suivi.

Même structure de gabarit, même cadre téléphone, juste une suite d'écrans différente derrière chaque bascule. Ça renforce l'effet "vraie app" : le prospect voit les deux faces de son futur outil dans le même geste.

## Le PDF

Construis-le comme une page HTML autonome séparée, mêmes variables `--brand`/`--brand-2` que la maquette pour que les 3 livrables se ressemblent visuellement. Une seule page, pensée pour l'impression navigateur (Ctrl+P → Enregistrer en PDF) : pas de pagination complexe, pas de dépendance à un outil de génération PDF. Détail du contenu attendu : `SKILL.md`, étape 4.

## Rappel

Quel que soit le nombre de livrables produits, toujours terminer par : le ou les **liens** + un **script de présentation court** + l'**étape suivante chiffrée** (prix et acompte). Un livrable sans appel à l'action ne close pas.

# Présenter la maquette : du fichier au lien

Ce guide détaille comment adapter le gabarit et surtout comment transformer la maquette en lien présentable. Objectif : ne jamais envoyer un fichier HTML brut, toujours un lien que le prospect ouvre sur son téléphone.

## Adapter le gabarit

Le gabarit `assets/template-maquette.html` est autonome (CSS et JS inline). Pour l'habiller :

1. **Couleurs** : en haut du `<style>`, change `--brand` (couleur principale) et `--brand-2` (accent). Tout le reste suit. Si tu as un logo ou un site client, prélève les couleurs dominantes et utilise leurs codes hexadécimaux.
2. **Variables `{{...}}`** : remplace-les par le contenu réel (nom de l'app, secteur, promesse, titres et textes des écrans). Mets du vrai contenu en français, pas de remplissage.
3. **Écrans** : garde 3 à 5 écrans (`.view`). Supprime ou ajoute des blocs `.card` selon le métier. Adapte les libellés des onglets du bas (`.tab`).
4. **Visuels** : pour donner de l'âme, tu peux remplacer les `.thumb` par de vraies images (par exemple des personnes générées par IA qui incarnent la cible du client). Encode-les en base64 ou héberge-les pour que le fichier reste autonome.

## Niveau 1 — Lien immédiat (zéro configuration)

Le plus rapide quand il faut closer dans la foulée d'un échange.

- **Publier l'artefact depuis claude.ai** : si la maquette a été générée comme artefact, utiliser le bouton Publier pour obtenir une URL publique partageable. C'est le chemin le plus court depuis l'endroit où le travail est déjà fait.
- **Hébergeur statique gratuit par glisser-déposer** :
  - **Netlify Drop** (app.netlify.com/drop) : on dépose le fichier `.html`, on obtient une URL en quelques secondes.
  - **Cloudflare Pages** : un peu plus de configuration, mais robuste et gratuit.

Limite : l'URL porte le nom de l'hébergeur (claude.site, netlify.app...), pas la marque de l'agence. Suffisant pour closer, pas idéal sur le long terme.

## Niveau 2 — Sous-domaine de marque (recommandé à terme)

Le prospect voit une démo hébergée par l'agence, par exemple `https://demo.agenceattractor.com/nom-client`. Crédibilité maximale, et ça positionne Mr Attractor comme un vrai studio.

Mise en place (une seule fois) :
1. Choisir un hébergeur qui accepte un domaine personnalisé (Netlify, Cloudflare Pages, Vercel : tous gratuits pour ce besoin).
2. Y déposer les maquettes (un dossier ou un sous-chemin par client).
3. Côté DNS de `agenceattractor.com`, créer un enregistrement `CNAME` `demo` qui pointe vers l'hébergeur (l'hébergeur fournit l'adresse cible exacte).
4. Ensuite, chaque maquette devient simplement un nouveau lien sous `demo.agenceattractor.com`.

Prérequis : avoir accès au gestionnaire DNS du domaine. À configurer avec Mac Arthur la première fois.

## Niveau 3 — Effet waouh

Le gabarit affiche déjà la maquette dans un **cadre de smartphone**. Sur un grand écran (présentation en visio ou en personne), ce cadre fait la démonstration tout seul : le prospect voit immédiatement "son app" comme une vraie app. Sur mobile, le prospect manipule directement.

Option complémentaire : si le client veut un document à garder, on peut exporter une version PDF de la présentation. Mais pour closer, la démo cliquable est toujours plus forte qu'un PDF figé.

## Rappel

Quel que soit le niveau choisi, livrer toujours : le **lien** + un **script de présentation court** + l'**étape suivante chiffrée** (prix et acompte). Le lien sans appel à l'action ne close pas.

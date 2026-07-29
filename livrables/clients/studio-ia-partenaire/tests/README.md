# Tests du site Agence Innovation Créative

Trois tests à relancer **avant tout déploiement** du site, dès qu'on touche
`index.html`, `assets/contenu.js` ou `admin.html`.

```bash
npm install jsdom          # une seule fois
node test-contenu.mjs      # le moteur applique bien les contenus modifiés
node test-coherence.mjs    # l'admin et le site parlent des mêmes clés
node test-defauts.mjs      # le formulaire affiche les vraies valeurs du site
```

## Ce que chacun protège

**`test-contenu.mjs`** — vérifie qu'une valeur modifiée arrive au bon endroit
(texte, lien, image, vidéo, compteur), que la mise en forme est préservée
(les mots en orange restent orange, la mention « F CFA » reste), qu'une table
vide laisse le site intact, et qu'aucun texte saisi ne peut injecter de HTML.

**`test-coherence.mjs`** — vérifie que chaque champ proposé dans l'admin existe
bien dans le site, et l'inverse. Sans lui, on peut livrer un champ qu'Emmanuel
modifie sans que rien ne change sur son site.

**`test-defauts.mjs`** — exécute la vraie fonction `loadDefauts()` de l'admin sur
le vrai `index.html`, et vérifie les 33 valeurs de départ. C'est ce qui garantit
que le formulaire ne s'affiche pas vide.

## Défaut déjà attrapé par ces tests

`test-contenu.mjs` a révélé que `video.play()` ne renvoie pas toujours une
promesse (vieux WebView Android, courants en Côte d'Ivoire) : l'exception
interrompait la boucle et **tous les contenus suivants n'étaient plus appliqués**.
D'où les gardes dans `applyContenuValue` et le `try/catch` par champ.

## Rappel de déploiement

`assets/contenu.js` et `assets/works.js` sont mis en cache 4 h par Cloudflare.
Quand on les modifie, **incrémenter le `?v=` dans `index.html`, `admin.html` et
`realisations.html`**, sinon les visiteurs reçoivent la nouvelle page avec
l'ancien script.

La branche de production du projet Pages `aicreatioon` est **`main`**.
Toujours vérifier sur `aicreatioon.com`, jamais sur l'alias `pages.dev`.

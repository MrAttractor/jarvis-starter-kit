# Pilotage — build

`index.html` est la version **déployée** : code déjà transpilé (plus de Babel
navigateur, React en production). Chargement rapide et fiable sur mobile.

`index.src.html` est la **source éditable** (JSX + `<script type="text/babel">`).

## Pour modifier Pilotage
1. Éditer `index.src.html` (le vrai code, avec JSX).
2. Extraire le bloc `<script type="text/babel">` (lignes ~24 à l'avant-dernière).
3. Transpiler : `babel.transformSync(code, { presets: [["@babel/preset-react", { runtime: "classic" }]] })`.
4. Réinjecter dans `index.html` avec les CDN React **production.min** (sans Babel).

À terme : migrer vers un vrai build Vite (option 2, re-packaging complet).

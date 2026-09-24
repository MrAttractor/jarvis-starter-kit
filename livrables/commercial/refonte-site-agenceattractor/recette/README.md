# Recette du site agenceattractor.com

> Trois contrôles à passer avant tout commit qui touche au site.
> Écrits le 25/09/2026, pendant la construction du socle de 5 pages.
> Ils existent parce que deux défauts réels ont été trouvés par la machine et par aucune relecture :
> le bouton jaune de la barre de navigation écrivait en gris clair sur jaune, et
> `radar/index.html`, marqué « usage interne uniquement », était en ligne depuis des mois.

## Lancer la recette

Depuis le dossier du site, servir les fichiers :

```bash
cd livrables/commercial/site-agenceattractor
python -m http.server 8777 --bind 127.0.0.1
```

Puis, dans un autre terminal, depuis ce dossier-ci :

```bash
npm i playwright && npx playwright install chromium
node 01-resolutions-et-structure.js
node 02-formulaire-et-taps.js
node 03-contraste-wcag.js
```

## Ce que chacun vérifie

| Script | Contrôle | Seuil de rejet |
|---|---|---|
| `01-resolutions-et-structure.js` | les 5 pages sur les 6 résolutions de `UX_SYSTEM.md` : débordement horizontal, zones de tap, une seule balise `h1`, `alt` et dimensions sur les images, erreurs de console, poids réel de l'accueil | tout débordement, toute image sans `alt` ou sans dimensions |
| `02-formulaire-et-taps.js` | le formulaire de contact : zone cliquable réelle des cases, validation des trois champs obligatoires, envoi nominal avec l'appel intercepté, contenu exact de ce qui part vers le pipeline, ouverture du menu mobile | une validation qui ne se déclenche pas, un envoi qui ne confirme pas |
| `03-contraste-wcag.js` | le contraste réel de chaque texte des 5 pages, fond opaque remonté dans l'arbre | tout texte sous 4,5:1, ou sous 3:1 s'il est gros |

## Deux points à savoir

**Le faux positif connu.** Le script 01 signale `INPUT h=20` sur `contact.html`. Les cases à
cocher font bien 20 px, mais elles sont enveloppées dans un `label.choix` de 52 à 79 px qui
est la vraie zone cliquable, et le script 02 le vérifie explicitement. Ce signalement est
attendu, il n'est pas un défaut.

**L'envoi du formulaire est intercepté.** Le script 02 détourne l'appel vers `notify-lead` et
répond à sa place. Rien n'arrive dans le pipeline. Ne jamais retirer ce détournement pour
« tester en vrai » : un test réel crée un dossier client qu'il faut ensuite aller supprimer
à la main.

## Valeurs de référence au 25/09/2026

- Accueil, tout compris, polices comprises : **134 Ko**
- Débordement horizontal sur 30 passes : **aucun**
- Textes sous le seuil WCAG AA : **aucun**
- Erreurs de console : **aucune**

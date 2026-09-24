# Direction artistique — agenceattractor.com

> Établie le 23/09/2026, à partir de la charte tranchée le même jour.
> **Brief de commande. Chaque visuel a son emplacement, son format, son modèle et son prompt.**

---

## 1. Le point à trancher avant de commander quoi que ce soit

**Ton portrait ne doit pas être généré. Il doit être retouché.**

Tu vends d'assumer sa réelle identité. Ta page d'accueil dit « exister sans forcer ». **Un portrait visiblement fabriqué sur une page qui vend l'authenticité est une contradiction que le visiteur sent avant de savoir pourquoi.** Et elle se voit : les mains, les oreilles, le grain de peau, la lumière trop lisse.

**Ce qui est légitime, et qui suffit :** partir de ta vraie photo et la traiter. Tu as l'original, `mac-arthur.jpg`, 2624 × 3936, conservé hors du dossier publié. Tu y es sur un fond brun mêlé, en t-shirt noir « #1 dans mon couloir ». **C'est déjà à 80 % de ce que la charte demande.**

| Ce qu'on génère | Ce qu'on ne génère jamais |
|---|---|
| fonds, textures, matières, lumières | **ton visage** |
| visuels abstraits des 3 axes | le visage de tes clients |
| ambiances de section | des preuves, des écrans, des résultats |
| éléments graphiques, pictogrammes | une scène qui prétend s'être produite |

**Et pour les blocs de preuve : une capture d'écran réelle bat n'importe quelle image générée.** Les sites d'Ayêla, de Nabycook, de latiss.net et de MY NUGO existent. Ils sont plus convaincants que tout ce que Magnific peut produire, parce qu'ils sont vrais.

---

## 2. La charte, en valeurs

| Rôle | Valeur | Note |
|---|---|---|
| Fond | `#0B0B0C` | noir très légèrement chaud, **jamais `#000000`** |
| Texte courant | `#F2F0EC` | blanc cassé, **jamais `#FFFFFF`** sur de longs paragraphes |
| Texte secondaire | `#A8A49C` | |
| **Accent, appels à l'action** | `#F2C10D` | jaune saturé |
| **Texte sur bouton jaune** | `#0B0B0C` | **noir. Jamais blanc, c'est illisible et non conforme** |
| Séparateurs | `#232326` | |

**Typographie :** une display pour les titres, une à chasse fixe pour tous les chiffres et les données, une manuscrite pour la signature uniquement. Caveat est déjà ta manuscrite sur latiss.net.

### Les trois règles d'image

1. **La lumière vient d'un seul côté.** Sur fond noir, un éclairage frontal écrase tout. Une source latérale sculpte et sépare le sujet du fond.
2. **Le jaune n'apparaît jamais dans une photo.** Il est réservé à l'interface. Un jaune dans l'image entre en concurrence avec les boutons et tue le repère.
3. **Rien de symétrique, rien de centré parfait.** La symétrie sur fond noir fait entreprise, pas personne.

---

## 3. Les visuels à produire

### A · Ton portrait principal — TRAITEMENT, pas génération

**Emplacement :** premier écran, page d'accueil. **Format :** 1600 × 2000 (4:5), plus un recadrage 800 × 800.

**Chaîne d'outils, dans cet ordre :**

1. `images_remove_background` sur `mac-arthur.jpg` original
2. `images_relight` avec le prompt ci-dessous
3. `images_skin_enhancer` en intensité faible, **surtout pas forte**
4. `images_upscale` en dernier

**Prompt de relight :**

> Cinematic side lighting from the left, warm key light, deep falloff into near-black. Subject separated from a very dark charcoal background (#0B0B0C). Soft rim light on the right shoulder and jawline. Natural skin texture preserved, visible pores, no smoothing. Editorial portrait, documentary feel, not glossy. No yellow tones in the image.

**Critère de rejet :** si la peau paraît lissée ou si le regard a changé, on recommence. **On doit te reconnaître immédiatement.**

### B · Portrait secondaire, en situation

**Emplacement :** page « qui je suis ». **Format :** 1600 × 1066 (3:2).

**À photographier, pas à générer.** Toi en train de travailler : au téléphone en trajet, devant un écran, en visio. C'est la question 29 du guide d'entretien, et Philippe en tire toute sa crédibilité de terrain.

**Si vraiment impossible dans l'immédiat :** un plan large de ton portrait existant, recadré, avec `images_expand` pour élargir le cadre. Provisoire.

### C · Les trois axes de la méthode

**Emplacement :** page méthode, un visuel par axe. **Format :** 1200 × 1200 (1:1). **Modèle :** `seedream-5-pro`.

Abstraits, matiéristes, jamais illustratifs. Pas de cerveau, pas d'ampoule, pas de puzzle, pas de chemin qui monte.

**Axe 1, connexion à soi :**
> Extreme macro photograph of a single smooth dark stone, wet, lit by one hard light from the left, deep black background, high contrast, visible texture and grain, editorial still life, no color except warm neutral tones.

**Axe 2, connexion à l'environnement :**
> Extreme macro of three dark stones of different sizes arranged in an asymmetric balance on a black surface, single side light, long shadows, deep shadow detail, editorial still life photography, warm neutral palette only.

**Axe 3, connexion aux ambitions :**
> Long exposure light trail of a single continuous line drawn in the dark, warm white light, pure black background, minimal, abstract, photographic, no lens flare, no yellow.

### D · Les fonds de section

**Emplacement :** derrière les blocs de texte longs. **Format :** 2400 × 1200. **Modèle :** `recraft-v4-1`.

> Subtle dark texture, charcoal black, fine film grain, very low contrast, almost flat, barely visible organic variation, no pattern, no gradient banding, seamless.

**Ils doivent être presque invisibles.** Si on remarque le fond, il est raté.

### E · L'image de partage (Open Graph)

**Format : 1200 × 630, obligatoire.** C'est ce qui s'affiche quand ton lien est collé dans WhatsApp, et c'est aujourd'hui le seul canal où ton site circule vraiment.

**À composer, pas à générer** : ton portrait traité à gauche, ta phrase d'accroche à droite, sur `#0B0B0C`. Si tu passes par un modèle, **`gpt-2` est le seul recommandé pour du texte lisible dans une image**, les autres déforment les lettres.

### F · Le visuel du Poste de Pilotage

**Emplacement :** page de la seconde offre. **Format :** 1600 × 1200.

**Capture d'écran réelle d'un de tes tableaux de bord existants**, posée dans un cadre sombre. Ayêla, C'Real ou Nabycook. **Ne génère jamais une interface qui n'existe pas** : c'est une promesse que le client viendra réclamer.

### G · L'icône du site

32 × 32, 180 × 180 et 512 × 512, à partir de ton logo existant, en version monochrome claire sur fond transparent. Le logo actuel fait 7993 × 2791, il est inutilisable tel quel en favicon.

---

## 4. Ce qu'il ne faut pas commander

Une liste courte, et elle vaut autant que le reste.

- **Aucune photo de bureau générique.** Pas de poignée de main, pas d'équipe qui sourit autour d'un ordinateur, pas de post-it colorés sur une vitre.
- **Aucun visage inventé.** Ni pour toi, ni pour un client, ni pour un témoignage.
- **Aucune métaphore de coaching** : sommet de montagne, boussole, phare, engrenages, échiquier, mains qui se tendent.
- **Aucun jaune dans une image.**
- **Aucun texte dans une image**, sauf l'Open Graph. Le texte doit être du vrai texte, lisible par Google et par un lecteur d'écran.

---

## 5. La commande, par ordre de priorité

| # | Visuel | Bloquant ? |
|---|---|---|
| 1 | **Portrait principal traité** (A) | **oui, rien ne part sans lui** |
| 2 | **Image de partage** (E) | oui, c'est ton canal réel |
| 3 | Les trois axes (C) | non |
| 4 | Fonds de section (D) | non |
| 5 | Poste de Pilotage (F) | non, attend la page |
| 6 | Portrait en situation (B) | non, mais à programmer |
| 7 | Icônes (G) | non |

**Commence par le 1 et le 2.** Ce sont les deux seuls qui bloquent la mise en ligne, et le premier est un traitement, pas une génération : il coûte quelques minutes.

---

## 6. Avant de valider chaque visuel

- [ ] Est-ce qu'il aurait pu être produit par n'importe quel autre coach ? Si oui, il est générique.
- [ ] Contient-il du jaune ? Il ne doit pas.
- [ ] Contient-il du texte ? Sauf Open Graph, il ne doit pas.
- [ ] Sur un téléphone, à 400 px de large, reste-t-il lisible ?
- [ ] **Le poids : sous 200 Ko après compression.** La leçon de la Phase 0 ne se reperd pas.
- [ ] Prétend-il montrer quelque chose qui n'existe pas ?
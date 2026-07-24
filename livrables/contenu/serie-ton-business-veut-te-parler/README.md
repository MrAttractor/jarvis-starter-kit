# Macoco — Série « Ton business veut te parler »

Personnage récurrent + bibliothèque de déclinaisons pour une série de posts Facebook humoristiques.
**Concept :** on humanise le business. Macoco EST le business, et il se plaint des mauvaises pratiques de son patron (l'entrepreneur). Cible : entrepreneurs ivoiriens et diaspora.

## Contenu du dossier
- `model-sheet/` — versions canoniques de Macoco (A = retenue, B = alternative).
- `images/` — les 10 déclinaisons de la saison 1 « L'argent du business » (`macoco-01…10-*.png`, format 4:5, 2k).
- `serie-macoco-posts.md` — pour chaque post : émotion, situation, idée, phrase d'accroche (français ivoirien).

## Bible du personnage (à préserver sur toute nouvelle image)
Cartoon 2D flat moderne, contours nets, ombres douces, très lisible mobile.
1. **Tête** rectangulaire haute, bandeau orange « MACOCO » en haut + panneau visage crème ; gros yeux expressifs, sourcils marqués (un peut se relever), bouche large à dents, moustache.
2. **Cou** court en accordéon/ressort segmenté.
3. **Torse** en coin (triangle pointe en bas) avec un **M noir dans un badge rond blanc**.
4. **Bras** nouilles noires + **gants blancs 4 doigts**.
5. **Jambes** nouilles ; **grosses bottes blanches** arrondies.
6. **Palette :** corps orange, contours charbon, fond/accents crème-sable. Accents verts pour l'argent.
7. **Règle :** seule l'émotion / la pose / le contexte change. Le personnage reste identique.

## Reproduire / étendre la série (technique)
- Outil : **MAGNIFIC** (MCP). Modèle : `imagen-nano-banana-2` (Nano Banana 2 Pro).
- **Personnage réutilisable enregistré dans la librairie MAGNIFIC** sous le nom `MACOCO-business-mascot`
  (référence de génération : id librairie **2087813**). Le passer en `references: [{type:"character", identifier:"2087813"}]` sur chaque génération garantit la cohérence.
- Format série : `aspectRatio 4:5`, `resolution 2k`. Laisser de l'espace en haut pour la légende.
- Coût indicatif : ~75 crédits / image.

## Points connus / à polir (optionnel)
- Sur quelques accessoires, le texte est sorti en anglais (« BILL », « OVERDUE », « RESIGNATION LETTER ») ; #5 a bien « DETTE ». Regénérable en forçant le français si besoin d'un 100% propre.
- Sur #6 et #7, le badge « M » du torse est masqué par la pose (bras croisés / caisse) ; l'identité reste portée par la tête « MACOCO ».

## Idées de saisons suivantes (même personnage)
- Saison 2 : « Le business ne connaît pas ses chiffres » (marge, prix, stock).
- Saison 3 : « Le business veut grandir » (réinvestir, budget, salaire du patron).

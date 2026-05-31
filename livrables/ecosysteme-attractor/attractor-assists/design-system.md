# Design System — Attractor Assists (proposition v0)

> Direction issue de l'analyse des références (`context/import/design-system-references/`).
> **v0 à valider** : les couleurs sont estimées depuis des captures. À ajuster pendant la refonte.

**Esprit :** pop africaine chaude + premium accessible. Énergie de la marque, mais épurée pour un produit SaaS (clarté avant tout, on ne reproduit pas la densité des affiches event).

**Levier émotionnel (référence pivot : campagne IVOIRE "Comme nous") :** la fierté ivoirienne et l'appartenance. Le produit doit donner le sentiment "on avance avec toi, comme nous". Reconnaître l'utilisateur, célébrer sa progression, le rendre acteur (success stories, communauté). Le duo orange + vert fait aussi écho au drapeau ivoirien, ce qui sert ce sentiment de fierté.

**Principes d'expérience (non négociables) :** chaleureuse · intuitive · fun. Chaque écran doit être facile pour un novice, encourageant, et donner envie d'y revenir.

**Références créa :** IVOIRE "Comme nous" (levier fierté, gros plans de visages locaux) ; Agence UGO (énergie/fun ivoirien, inspire surtout les campagnes). Détail dans `context/import/design-system-references/`.

**Place dans l'écosystème (frise narrative) :** chaque app a un design complémentaire ; mises côte à côte, les interfaces composent une frise qui raconte une histoire (le parcours de croissance de l'entrepreneur). Attractor Assists en est le premier panneau : son design doit pouvoir se décliner en cohérence sur les autres apps (tokens partagés, variations complémentaires).

---

## 1. Couleurs

### Marque
| Rôle | Hex | Usage |
|------|-----|-------|
| Orange Attractor (primaire) | `#F25C05` | Actions, CTA, accents, états actifs |
| Orange clair (hover) | `#FF7A2E` | Survol / pressed |
| Vert croissance (accent) | `#1E5631` | Progression, succès, thème "ikigai/croissance" (jamais en surface dominante) |
| Ambre (highlight) | `#FFB300` | Badges, mises en avant ponctuelles |

> **Règle couleur :** l'orange est la **signature/primaire** de l'écosystème. Le vert reste un **accent** (progression, succès), jamais une couleur de surface dominante. Les couleurs vives sont assumées : elles créent le désir et l'envie de passer du temps dans l'app.

### Neutres
| Rôle | Hex |
|------|-----|
| Charbon (texte / structure) | `#1A1714` |
| Gris 700 | `#4A443E` |
| Gris 400 | `#9A938B` |
| Gris 200 (bordures) | `#E7E1D8` |
| Sable (fond) | `#FAF6F0` |
| Surface | `#FFFFFF` |

### Sémantique
Succès `#2E7D32` · Attention `#F2A104` · Erreur `#D64545` · Info `#2B6CB0`

### Mode sombre (option, inspiré ref "vélo premium")
Fond `#14110F`, surface `#1F1B18`, texte `#F5F0E8`, primaire orange inchangé.

---

## 2. Typographie

- **Titres / display :** `Sora` ou `Archivo` (grotesk grasse, 600-800). Impact, sans crier.
- **Corps / UI :** `Inter` (400-600). Lisibilité maximale.

| Token | Taille / Poids |
|-------|----------------|
| Display | 40-56px / 700 |
| H1 | 32px / 700 |
| H2 | 24px / 600 |
| Body | 16px / 400 |
| Small | 14px / 400 |

---

## 3. Layout & tokens

- **Grille :** mobile-first (cible CI/diaspora, usage mobile + mobile money). Breakpoints 640 / 768 / 1024 / 1280.
- **Spacing :** échelle 4-8-12-16-24-32-48-64.
- **Radius :** sm 8px · md 12px · lg 20px · pill 999px. (Cartes et boutons arrondis, registre chaleureux.)
- **Ombres :** douces et basses (élévation discrète, pas d'ombres dures).

---

## 4. Composants clés

- **Boutons :** primaire orange plein (texte blanc), secondaire contour charbon, tertiaire texte. Coins arrondis, CTA généreux.
- **Cartes :** fond surface, radius lg, padding 24, ombre douce. Modèle "fond uni + accent + sujet" (ref casque).
- **Inputs :** bordure gris 200, focus orange, labels clairs (utilisateurs novices).
- **Navigation :** barre latérale (desktop) / barre basse (mobile), icône + label.
- **Badges paliers :** STARTER / RUNNER / EAGLE différenciés par couleur (ex : gris / orange / charbon-or).
- **Progression :** barres et jalons en vert croissance (renfort du sentiment d'avancée).

---

## 5. Ton & imagerie

- **Voix :** directe, encourageante, sans jargon. Français. Tutoiement chaleureux.
- **Photos / illustrations :** sujets africains expressifs, lumière chaude, fierté et proximité (refs Maxi Good / casque). Éviter les banques d'images génériques froides.
- **Motion :** transitions sobres et fluides (sensation premium), jamais clinquantes.

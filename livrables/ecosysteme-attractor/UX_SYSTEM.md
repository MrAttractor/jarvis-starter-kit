# UX SYSTEM — Écosystème ATTRACTOR

> Source de vérité UX/UI pour toutes les apps de l'écosystème ATTRACTOR.
> S'applique à : Attractor Assists, Livraison Pro, Fidelys, Pilotage, et toute app métier client.
> Tout développement front-end doit être évalué selon ces règles avant mise en production.

---

## 1. PRINCIPE FONDAMENTAL

La simplicité est prioritaire sur la complexité.

Chaque nouvelle fonctionnalité doit répondre à la question :

> "Cette fonctionnalité simplifie-t-elle réellement l'expérience utilisateur ?"

Si la réponse est non : ne pas développer.

---

## 2. MOBILE FIRST OBLIGATOIRE

L'application doit être conçue d'abord pour smartphone. Le desktop est une adaptation du mobile.

Résolutions minimales à tester :

| Largeur | Contexte |
|---------|----------|
| 375 px | iPhone SE / petits Android |
| 390 px | iPhone 14 |
| 414 px | iPhone Plus / grands Android |
| 768 px | Tablette portrait |
| 1024 px | Tablette paysage / petit laptop |
| 1440 px | Desktop standard |

Aucune mise en production sans validation sur ces tailles.

---

## 3. INTERDICTION ABSOLUE DU DÉBORDEMENT HORIZONTAL

Aucun élément ne doit dépasser la largeur visible de l'écran.

Interdictions :
- Scroll horizontal
- Cartes coupées
- Boutons hors écran
- Texte hors viewport
- Images débordantes
- Sections nécessitant un déplacement latéral

Règle CSS obligatoire sur tous les composants :

```css
max-width: 100%;
overflow-x: hidden;
```

Toute page présentant un débordement horizontal est rejetée automatiquement.

---

## 4. STABILITÉ VISUELLE

L'interface ne doit jamais bouger de manière inattendue.

Objectifs :
- CLS (Cumulative Layout Shift) proche de 0
- Aucun saut de contenu
- Aucun déplacement brutal lors du chargement

Toutes les images doivent avoir largeur et hauteur définies. Les espaces doivent être réservés avant chargement.

---

## 5. NAVIGATION

Maximum 5 onglets principaux, 3 niveaux de navigation.

Structure fixe :

1. Accueil
2. Produits
3. Assistant
4. Commandes
5. Profil

La navigation principale reste toujours visible. Les positions des onglets ne changent jamais.

---

## 6. DESIGN SYSTEM — GRILLE 8 PX

Toute l'interface utilise une grille basée sur 8 px.

Espacements autorisés : `8 / 16 / 24 / 32 / 40 / 48 / 64`

Interdiction :
- Marges arbitraires
- Espacements incohérents

---

## 7. COMPOSANTS RESPONSIVE

Sur mobile :
- Les colonnes deviennent des blocs verticaux
- Les cartes s'empilent automatiquement
- Les tableaux deviennent des cartes
- Les images s'adaptent à la largeur disponible

Jamais :
- 3 colonnes fixes sur mobile
- Cartes dépassant l'écran
- Texte tronqué

---

## 8. PERFORMANCE

| Métrique | Objectif |
|----------|---------|
| Première ouverture | < 2 secondes |
| Navigation interne | < 300 ms |
| Affichage réponse IA | < 1 seconde |
| Score Lighthouse | > 90 |
| Core Web Vitals | Tous au vert |

---

## 9. BOUTONS ET INTERACTIONS

Taille minimale : **44 × 44 px** (zone de tap)

Tous les boutons doivent :
- Être visibles sans scroll
- Être accessibles au pouce
- Avoir un retour visuel au tap (feedback)

Aucun bouton ne doit être masqué hors écran.

---

## 10. FORMULAIRES

Objectif : permettre une action en moins de 60 secondes.

Interdiction :
- Formulaires longs
- Champs inutiles
- Multiples validations inutiles

---

## 11. ACCESSIBILITÉ

- Taille de texte minimale : **16 px**
- Contrastes conformes **WCAG AA**
- Tous les éléments interactifs accessibles sans zoom

---

## 12. CHECKLIST DE REJET AUTOMATIQUE

Une fonctionnalité est rejetée si :

- [ ] Un scroll horizontal apparaît
- [ ] Un élément sort du viewport
- [ ] Un texte est coupé
- [ ] Une image déborde
- [ ] Un bouton est inaccessible au pouce
- [ ] Un écran nécessite un zoom pour être utilisé
- [ ] Une page présente des sauts visuels (CLS > 0.1)

---

## 13. RÉFÉRENCES PRODUIT

| Référence | Principe à retenir |
|-----------|-------------------|
| WhatsApp | Simplicité, stabilité, navigation constante |
| Amazon | Conversion, recherche, parcours d'achat clair |
| Uber | Rapidité, temps réel, clarté de l'action |

Chaque écran développé doit respecter ces standards.

---

## RÈGLE D'OR

> L'utilisateur ne doit jamais se demander "Où dois-je cliquer ?"
> La réponse doit être évidente en moins de 3 secondes.

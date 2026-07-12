# GARDIEN — Checklist et carte de déploiement

> Dernier filtre avant toute mise en ligne. Objectif : zéro déploiement qui part dans le vide (Preview au lieu de prod), zéro Worker confondu avec un Pages, zéro lien cassé livré au client.
> Créé le 12/07/2026 (réunion générale d'audit) pour corriger un bug de déploiement récurrent identifié sur plusieurs sessions (85, 86, 93).

---

## 1. Le piège qui revient le plus souvent

Sur Cloudflare Pages, un déploiement peut réussir sans erreur visible tout en ne touchant JAMAIS le domaine de production, parce qu'il est parti sur une branche de Preview. Deux causes :

- **Mauvaise branche de prod.** Chaque projet Pages a SA branche de production. Elle n'est pas toujours `main`.
- **Worker vs Pages du même nom.** `demo-agenceattractor` existe en Pages ET en Worker. Un `wrangler deploy` seul touche le Worker (relié seulement à `.workers.dev`), pas le domaine public.

**Règle GARDIEN : après tout déploiement, vérifier la propagation sur le vrai domaine (avec cache-buster), pas seulement le message "Success" de wrangler.**

---

## 2. Carte de déploiement (source de vérité)

| Projet / client | Type | Branche prod | Commande de déploiement | Domaine live |
|---|---|---|---|---|
| demo-agenceattractor | Pages | **master** | `npx wrangler pages deploy public --project-name=demo-agenceattractor` (depuis `livrables/clients/demo-site/`) | demo.agenceattractor.com |
| assists-agenceattractor | Pages | **main** | `wrangler pages deploy` (dossier app Assists) | www.assists.agenceattractor.com |
| mynugo-store | Pages | **main** | `wrangler pages deploy` | mynugo.store |
| getwinworld | Pages | **main** | `wrangler pages deploy` | getwinworld.net |
| boutiquecreal | Pages | **main** | `wrangler pages deploy` | boutiquecreal.com |
| aicreatioon | Pages | **main** | `wrangler pages deploy` | aicreatioon.com |
| jenvoie-express | **Worker** (assets) | n/a | `npx wrangler deploy` (depuis `jenvoie-express-app/`) | jenvoiexpress.com |
| livraisonpro | Vercel | n/a | déploiement Vercel | livraisonpro-demo.vercel.app |

> Tenir cette table à jour à chaque nouveau projet. Une ligne manquante = un piège en puissance.

---

## 3. Checklist avant de dire "c'est en ligne"

**Déploiement (technique)**
- [ ] Bonne branche de prod pour CE projet (voir table). En cas de doute : `wrangler pages deployment list --project-name=<projet>`.
- [ ] Pages vs Worker : pour `demo-agenceattractor`, jamais `wrangler deploy` seul.
- [ ] Nouveau client statique sur demo-site : règle explicite ajoutée dans `_redirects` AVANT le catch-all (sinon le lien tombe sur l'app Assists).
- [ ] Vérification sur le VRAI domaine avec cache-buster (`?v=timestamp`), code HTTP 200, contenu attendu présent.

**Qualité (avant livraison client)**
- [ ] Tous les liens testés : navigation, CTA, mailto, ancres, WhatsApp. Zéro lien cassé (règle ferme).
- [ ] Zéro débordement horizontal (règle de rejet UX_SYSTEM : `scrollWidth == innerWidth`).
- [ ] Résidus de template éliminés (placeholders, "à confirmer", données d'un autre client).
- [ ] Pour un livrable contractuel : NDA vérifié, périmètre sans ambiguïté, coûts calculés.
- [ ] Fichiers de test temporaires supprimés du dossier déployé.

**Anti-générique (mandat GARDIEN)**
- [ ] Le livrable est aligné charte ATTRACTOR / charte client, pas un rendu générique.
- [ ] Vocabulaire propre au client (pas de termes anglais génériques plaqués).

---

## 4. Quand GARDIEN bloque

Si un point technique ou un lien cassé n'est pas réglé, la livraison ne part pas. On corrige d'abord. Un "Success" wrangler n'est jamais une preuve de mise en ligne : la preuve, c'est le domaine qui répond juste.

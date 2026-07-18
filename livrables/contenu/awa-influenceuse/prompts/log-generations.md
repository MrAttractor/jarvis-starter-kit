# Log des générations Awa

Traçabilité de chaque visuel produit avec Magnific.
Format : 1 ligne par génération validée.

---

| Date | Fichier | Scène / Pose | Prompt utilisé | Réglages | Validé ? |
|---|---|---|---|---|---|
| 2026-06-04 | `00_master/AWA_MASTER_4K.png` | Pose studio référence (sourire, main joue, téléphone) | prompt-master-awa.txt (bloc 1+3) | Mystic 2.5, ref weight 85%, creativity 5 → upscale Sparkle 4x, res 7, creativity 3 | ✅ MASTER officiel |
| 2026-07-08 | `campagnes/promo-app-metier-creal/slide-1-marche-fatigue.png` | Awa au marché de Treichville, épuisée, WhatsApp qui déborde | Bloc 1 master + scène : sitting on wooden stool behind stall, overwhelmed, hand on forehead, phone in hand, market vendors blurred | Nano Banana Pro, 2K, 9:16, image ref (creation `xgHr94CjfW`) | ✅ Validé |
| 2026-07-08 | `campagnes/promo-app-metier-creal/slide-2-declic-systeme.png` | Awa souriante à son bureau, elle a trouvé son système | Bloc 1 master + scène : cozy Abidjan interior, wax curtains, plants, notebook, radiant smile at phone | Nano Banana Pro, 2K, 9:16, image ref (creation `xgHr94CjfW`) | ✅ Validé |
| 2026-07-08 | `campagnes/promo-app-metier-creal/slide-3-app-creal-ecran.png` | Over-shoulder, app C'Real dans le téléphone (MAIS/RIZ/SORGHO/MIL + Wave/MTN) | Bloc 1 master + scène : app screen with product grid, prices in FCFA, green "AJOUTER AU PANIER" buttons, Wave & MTN Money logos | Nano Banana Pro, 2K, 9:16, image ref (creation `xgHr94CjfW`) | ⚠️ Logo "CREAL" à corriger en post-prod (caractère étrange) |
| 2026-07-08 | `campagnes/promo-app-metier-creal/slide-4-resultat-detendue.png` | Awa relax à une terrasse d'Abidjan, jus tropical, ciel golden hour | Bloc 1 master + scène : rooftop cafe, tropical juice, phone face down, laptop closed, palm plants, city skyline | Nano Banana Pro, 2K, 9:16, image ref (creation `xgHr94CjfW`) | ✅ Validé |
| 2026-07-08 | `campagnes/promo-app-metier-creal/slide-5-cta-audit-gratuit.png` | CTA studio dark, Awa tend le téléphone avec "AUDIT GRATUIT" + www.agenceattractor.com | Bloc 1 master + scène : studio dark background, orange rim light, phone facing camera with "AUDIT GRATUIT" orange button and URL | Nano Banana Pro, 2K, 9:16, image ref (creation `xgHr94CjfW`) | ✅ Validé |

---

## Convention de nommage

`AWA_[ZONE]_[NUM]_[DESCRIPTION-COURTE].png`

Exemples :
- `AWA_STUDIO_01_profil-3-4.png`
- `AWA_TREICHVILLE_01_marche-frustree.png`
- `AWA_APP_01_revelation-iphone.png`

## Convention de validation

- ✅ MASTER : référence officielle, jamais supprimer
- ✅ Validé : utilisable en prod
- ⚠️ À refaire : artefact, dérive visage, à régénérer
- ❌ Rejet : hors charte, à supprimer

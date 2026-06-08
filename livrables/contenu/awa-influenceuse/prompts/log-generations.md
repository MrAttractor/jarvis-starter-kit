# Log des générations Awa

Traçabilité de chaque visuel produit avec Magnific.
Format : 1 ligne par génération validée.

---

| Date | Fichier | Scène / Pose | Prompt utilisé | Réglages | Validé ? |
|---|---|---|---|---|---|
| 2026-06-04 | `00_master/AWA_MASTER_4K.png` | Pose studio référence (sourire, main joue, téléphone) | prompt-master-awa.txt (bloc 1+3) | Mystic 2.5, ref weight 85%, creativity 5 → upscale Sparkle 4x, res 7, creativity 3 | ✅ MASTER officiel |

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

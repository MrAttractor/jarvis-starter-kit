# COMPTEUR — Pilotage financier Mac Arthur

Tableau de bord personnel. Suit le CA réel vs objectif (10 000 €), répartit chaque encaissement, distingue produits vs MRR, et détecte la stabilité Fibonacci qui autorise le palier suivant.

## Déploiement en 2 étapes

### 1. Appliquer le schéma SQL
Supabase > SQL Editor > coller `01_schema.sql`.

### 2. Déployer l'interface
Dans `02_interface.html`, remplacer :
- `<PROJECT_REF>` → `lgdgbrivnhgeupqhkckd`
- `<SUPABASE_ANON_KEY>` → clé anon dans `.env`

Puis déployer sur Netlify (drag & drop ou sous-domaine `compteur.agenceattractor.com`).

## Paramètres par défaut

| Paramètre | Valeur |
|---|---|
| objectif_actuel | 10 000 € |
| date_cible | 2026-09-01 |
| pct_charges | 40% |
| pct_campagne | 20% |
| pct_marge | 40% |
| mois_stabilite | 3 mois consécutifs |
| seuil_mrr_pct | 40% |
| fibonacci_paliers | 10k → 13k → 21k → 34k → 55k → 89k → 144k |

## Passer au palier suivant

Quand l'interface affiche "✦ Palier stabilisé" (3 mois consécutifs avec CA ≥ objectif, marge positive, MRR ≥ 40%) :

```sql
update public.config_finance set objectif_actuel = 13000 where id = 1;
```

## Liens avec le cockpit
- MIROIR : les décisions de palier sont de la matière d'apprentissage
- DAF Jarvis : le COMPTEUR est son tableau de bord de référence

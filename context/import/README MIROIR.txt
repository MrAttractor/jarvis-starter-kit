# COMPTEUR — Pilotage financier

L'agent qui rend ta cible vivante. Suit le **CA réel vs objectif (10 000 €)**, répartit chaque encaissement (paramétrable), distingue **produits vs MRR**, et détecte automatiquement la **stabilité** qui autorise le palier Fibonacci suivant.

> À la différence de MIROIR et du STRATÈGE, le COMPTEUR n'a pas besoin d'Edge Function ni d'appel Claude : tout le calcul se fait dans Supabase (vues SQL). C'est plus simple, plus rapide, gratuit. 2 fichiers seulement.

## Ordre de déploiement

### 1. `01_schema.sql`
Supabase > SQL Editor. Crée :
- `config_finance` — **tous tes paramètres** (objectif, date, répartition %, règles de stabilité, paliers Fibonacci). Une seule ligne, modifiable à tout moment.
- `encaissements` — chaque vente (PRODUIT ou MRR).
- `charges_reelles` — tes charges réelles (optionnel ; sinon la marge est estimée via le %).
- Vues `synthese_mensuelle` et `statut_stabilite` (les calculs).

### 2. `02_interface_smartphone.html`
Remplace `<PROJECT_REF>` et `<SUPABASE_ANON_KEY>`. Déploie sur Netlify.
Affiche : jauge objectif du mois, répartition (charges/campagne/marge), produits vs MRR, statut de stabilité, et saisie rapide d'encaissement.

## Tes paramètres par défaut (modifiables)

| Paramètre | Valeur | Sens |
|---|---|---|
| objectif_actuel | 10 000 € | palier en cours |
| date_cible | 2026-09-01 | échéance |
| pct_charges | 40 % | part charges fixes |
| pct_campagne | 20 % | budget marketing auto-financé |
| pct_marge | 40 % | toi + R&D + trésorerie |
| mois_stabilite | 3 | mois consécutifs requis |
| seuil_mrr_pct | 40 % | le MRR doit couvrir ≥ 40 % du palier |
| fibonacci_paliers | 10000,13000,21000,34000,55000,89000,144000 | la suite de croissance |

**Pour modifier un paramètre** (ex : la répartition) :
```sql
update public.config_finance
set pct_charges = 35, pct_campagne = 25, pct_marge = 40
where id = 1;
-- (les 3 doivent sommer à 100)
```

## Le critère de stabilité (conseillé)

Le palier est **stabilisé** quand, sur 3 mois consécutifs, les 3 conditions sont réunies :
1. **CA ≥ palier** (10 000 €)
2. **Marge positive** (croissance saine, pas en brûlant la tréso)
3. **MRR ≥ 40 % du palier** (base récurrente = croissance durable)

Pourquoi les trois : le CA seul peut être gonflé par une grosse vente ; la marge garantit la santé ; le MRR garantit la durabilité. La vue `statut_stabilite` calcule ça en direct et l'interface affiche « ✦ Palier stabilisé » quand c'est bon.

## Déclencher le palier suivant

Quand l'interface affiche « stabilisé », tu passes au palier Fibonacci suivant :
```sql
update public.config_finance set objectif_actuel = 13000 where id = 1;
```
(Automatisable plus tard : un bouton dans l'interface, ou une fonction qui lit `fibonacci_paliers` et avance d'un cran.)

## Liens avec les autres agents
- **STRATÈGE** : peut lire `objectif_actuel` pour calibrer ses campagnes vers le bon montant.
- **MIROIR** : tes décisions de palier (déclencher / attendre) sont de la matière d'apprentissage.
- **DAF / COMPTES** : le COMPTEUR est leur tableau de bord de référence.

## Sécurité
Active Supabase Auth avant la prod (l'interface utilise la clé `anon`). Données financières = à protéger en priorité.

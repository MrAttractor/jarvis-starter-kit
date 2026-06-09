# SOP — Configuration n8n Veille Attractor

**Durée estimée :** 30 minutes  
**Prérequis :** Compte n8n.cloud (gratuit jusqu'à 5 workflows actifs)

---

## Vue d'ensemble

n8n récupère automatiquement les articles RSS chaque matin à 6h30 (heure CI) et les envoie à l'edge function `receive-veille` de Supabase. L'edge function stocke les articles et déclenche `process-veille` qui génère une DMV personnalisée par Claude pour chaque utilisateur Growth+.

**Flux :**
```
n8n Cron 6h30 → RSS feeds → Filtrage → POST receive-veille → process-veille → dmv_queue → Dashboard Assists
```

---

## Étape 1 — Créer le compte n8n

1. Aller sur [n8n.cloud](https://n8n.cloud)
2. S'inscrire avec le mail de l'agence
3. Choisir le plan **Starter** (gratuit, 5 workflows actifs)
4. Nommer le workspace : `Attractor Veille`

---

## Étape 2 — Créer le workflow "Veille Quotidienne"

### 2.1 Noeud 1 : Schedule Trigger
- Type : **Schedule Trigger**
- Règle : `30 6 * * *` (6h30 UTC = 7h30 Abidjan en hivernage, 6h30 en décalage été)
- **Activer** le workflow après configuration complète

### 2.2 Noeuds RSS (un par secteur)

Ajouter autant de noeuds **RSS Feed Read** que de secteurs à surveiller.

**Secteurs principaux à configurer en priorité :**

| Secteur | URL RSS à utiliser |
|---------|-------------------|
| Commerce CI général | `https://news.google.com/rss/search?q=commerce+Abidjan&hl=fr&gl=CI&ceid=CI:fr` |
| Beauté / Bien-être | `https://news.google.com/rss/search?q=beauté+cosmétique+Côte+d%27Ivoire&hl=fr` |
| Food / Restauration | `https://news.google.com/rss/search?q=restauration+Abidjan+tendance&hl=fr` |
| E-commerce diaspora | `https://news.google.com/rss/search?q=e-commerce+diaspora+africaine+France&hl=fr` |
| Business Afrique | `https://news.google.com/rss/search?q=business+PME+Afrique+subsaharienne&hl=fr` |

Configuration de chaque noeud RSS :
- **URL** : coller l'URL du tableau ci-dessus
- **Options > Max Items** : 5 (ne pas dépasser pour rester dans le quota)

### 2.3 Noeud 3 : Merge
- Type : **Merge**
- Mode : **Combine** / **Append**
- Connecter tous les noeuds RSS au Merge

### 2.4 Noeud 4 : Filter (garder uniquement les articles < 24h)
- Type : **Filter**
- Condition : `{{ $json.pubDate }}` est plus récent que `{{ $now.minus(24, 'hours') }}`

### 2.5 Noeud 5 : Code (formater les données)
- Type : **Code**
- Langue : JavaScript
- Code :

```javascript
const articles = $input.all().map(item => ({
  secteur: item.json.secteur || "general",
  titre: (item.json.title || "").slice(0, 200),
  resume: (item.json.contentSnippet || item.json.description || "").slice(0, 300),
  url: item.json.link || null,
  source: item.json.feed?.title || null,
  published_at: item.json.pubDate ? new Date(item.json.pubDate).toISOString() : new Date().toISOString(),
}));

return [{ json: { articles } }];
```

**Avant le noeud Code**, ajouter un noeud **Set** sur chaque sortie RSS pour injecter le secteur :
- Champ : `secteur` = valeur fixe (ex: `"beauté"`, `"food"`, `"commerce"`)

### 2.6 Noeud 6 : HTTP Request (vers Supabase)
- Type : **HTTP Request**
- Method : `POST`
- URL : `https://lgdgbrivnhgeupqhkckd.supabase.co/functions/v1/receive-veille`
- Headers :
  - `Content-Type` : `application/json`
  - `Authorization` : `Bearer [SUPABASE_SERVICE_ROLE_KEY]` ← récupérer depuis Supabase Dashboard > Project Settings > API
- Body : **JSON**
  - Contenu : `{{ $json }}`

---

## Étape 3 — Récupérer la SUPABASE_SERVICE_ROLE_KEY

1. Aller sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Projet : `lgdgbrivnhgeupqhkckd`
3. Settings > API
4. Copier la clé **service_role** (⚠️ secret, ne jamais la partager publiquement)
5. Coller dans le header Authorization du noeud HTTP Request de n8n

---

## Étape 4 — Test manuel

1. Dans n8n, cliquer **Execute Workflow** manuellement
2. Vérifier dans Supabase Dashboard > Table Editor > `veille_tendances` que des lignes apparaissent
3. Attendre 30 secondes puis vérifier `dmv_queue` pour une entrée Growth+
4. Ouvrir Attractor Assists → Dashboard → vérifier la card "Action du jour"

---

## Étape 5 — Activer le cron

Une fois le test validé :
1. Dans n8n, activer le workflow (toggle en haut à droite)
2. Confirmer que le Schedule Trigger est bien actif
3. Documenter la date d'activation dans le CRM Notion (champ "Veille n8n activée le")

---

## Gestion des erreurs courantes

| Erreur | Cause probable | Solution |
|--------|---------------|----------|
| `401 Unauthorized` | Mauvaise clé service_role | Vérifier la clé dans Supabase Settings > API |
| Tableau vide dans dmv_queue | Aucun profil Growth+ avec onboarding_done=true | Vérifier qu'il existe au moins 1 utilisateur Growth+ |
| Articles vides | RSS feed inaccessible | Tester l'URL directement dans le navigateur |
| Workflow ne se déclenche pas | Timezone n8n | Ajuster le cron selon le fuseau configuré dans le compte n8n |

---

## Maintenance

- Revoir les URLs RSS tous les trimestres (Google News change parfois ses formats)
- Ajouter des secteurs au fil des onboardings clients
- Si le plan n8n est dépassé, désactiver temporairement les secteurs les moins utilisés

---

*SOP créé le 09/06/2026 — Session 42 Jarvis*

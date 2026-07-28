# VSD by Attractor — site de vente

Page de vente de l'offre VSD (72h Paris-Abidjan-Paris). Le concept est dans
`../CONCEPT-OFFRE-VSD.md`, qui reste la source de vérité.

**Rien ne doit être publié tant que l'accord avec la compagnie n'est pas signé.**
Un bandeau le rappelle en tête de page, c'est la première ligne du `<body>`.

## Ce qu'il y a dans le dossier

| Fichier | Rôle |
|---|---|
| `index.html` | La page entière, autonome, un seul fichier |
| `assets/bandeau.jpg` | Fond du hero pleine largeur |
| `assets/hero.jpg` | Illustration de la section « pourquoi ce prix existe » |

## Le parcours d'inscription

Tout se traite **par email**. Le numéro de téléphone est facultatif, il est
collecté et conservé en base pour des réutilisations ultérieures (relances,
annonce des départs), il ne déclenche aucun envoi.

1. Le visiteur remplit le formulaire (nom, email, téléphone, départ, formule, valise).
2. La page appelle l'edge function `vsd-inscription`.
3. La fonction insère la ligne dans `vsd_inscriptions` (service role), puis envoie
   deux emails via Resend : l'accusé de réception au voyageur, la notification à
   `hello@agenceattractor.com`.
4. La page affiche la confirmation en ligne, sans quitter le site.

## Mise en service

**FAIT le 28/07/2026. Le backend est en ligne et vérifié.**

| Vérification | Résultat |
|---|---|
| Table `vsd_inscriptions` | créée, RLS active, 3 policies nominatives sur l'UUID de Mac Arthur |
| Policy INSERT publique | aucune, c'est voulu |
| Edge function `vsd-inscription` | déployée |
| `RESEND_API_KEY` | présent dans les secrets du projet |
| Préflight CORS (OPTIONS) | 200 |
| Inscription de test | `{ok:true, mail:true}`, ligne bien présente en base, puis supprimée |
| Email invalide | rejeté (`email_invalide`) |
| Lecture par un anonyme (clé anon) | `[]` alors que la ligne existait, donc la RLS bloque réellement |
| Écriture directe par un anonyme | 401 |

La table a été appliquée via l'API Management Supabase depuis le workspace, pas
par le SQL editor. Rejouer la migration est sans risque, elle est idempotente.

```bash
# si besoin de redéployer la fonction un jour
cd livrables/ecosysteme-attractor/attractor-assists/app
export SUPABASE_ACCESS_TOKEN=...   # celui du .env
npx supabase functions deploy vsd-inscription --project-ref lgdgbrivnhgeupqhkckd --no-verify-jwt
```

## Les réglages

Tout est dans l'objet `CONFIG`, en bas de `index.html`.

| Clé | Effet |
|---|---|
| `endpoint` | URL de l'edge function |
| `email` | Adresse affichée en secours si l'envoi échoue |
| `hebergement` | `false` fait disparaître le bloc du code hôtel partenaire partout. À laisser sur `false` tant qu'aucun établissement d'Abidjan n'a signé. Il n'y a plus de « formule à 500 € » : depuis la décision du 23/07, le voyageur réserve et paie son hôtel directement avec un code de réduction, nous ne vendons pas de séjour (sinon immatriculation Atout France). |
| `delaiMini` | Délai avant le premier départ proposé, en jours |
| `cloture` | Nombre de jours avant le départ où les inscriptions ferment |
| `nbDeparts` | Nombre de départs affichés dans le calendrier |
| `capacite` | Places **affichées** par départ |
| `places` | Places restantes, du départ le plus proche au plus lointain |

Le calendrier se calcule tout seul à partir de la date du jour : les prochains
vendredis, les retours le dimanche, la clôture, et le compte à rebours. Il n'y a
aucune date en dur, la page ne périme pas.

**Interne :** on affiche 7 places et on embarque jusqu'à 10 voyageurs choisis dans
la liste d'attente. Le voyageur n'est jamais lésé, on prend plus que le nombre annoncé.

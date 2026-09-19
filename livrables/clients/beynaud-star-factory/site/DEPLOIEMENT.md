# latiss.net — comment on déploie

> Révision du 19/09/2026, jour où l'application a emménagé sur le domaine.

## Ce que c'est

Le site de **latiss.net**, sur son domaine propre. Il a son **propre projet
Cloudflare**, séparé du site mutualisé `demo.agenceattractor.com`.

**Depuis le 19/09/2026, il porte l'application elle-même**, et plus seulement une page
d'attente :

| Adresse | Ce que c'est |
|---|---|
| `/` | la page d'attente : le clip, la signature, « Bientôt disponible » |
| `/fan` | **l'espace des fans.** C'est l'adresse des liens de parrainage |
| `/app` | le tableau de bord de Serge |
| `/api/feed` | le fil public, mis en cache 30 s au bord du réseau |
| `/img/<uuid>.<ext>` | les photos, servies par Cloudflare et non par Supabase |

## Le piège du déménagement, et il aurait été silencieux

Les deux derniers chemins demandent du **code**. Sur le site mutualisé, c'étaient des
**Pages Functions** : un dossier `functions/`, et Cloudflare s'occupe du reste. **Ce
dossier n'existe pas ici**, parce que ce projet est né sur la nouvelle plateforme où Pages
est fondu dans Workers.

Copiés tels quels, ces deux fichiers n'auraient **rien fait**, sans erreur et sans
avertissement. Le fil serait reparti taper Supabase à chaque ouverture de page, dont le
plafond mesuré est de ~55 par seconde. Chaque photo serait repartie du quota de sortie de
Supabase, épuisé à 8 197 visiteurs. Le site aurait eu l'air parfaitement normal jusqu'au
jour du lancement.

Ils sont donc **portés en Worker**, dans `src/index.js`, et `wrangler.jsonc` déclare
`main`. Deux réglages y méritent d'être lus avant d'y toucher :

- **`not_found_handling: "none"`**, et surtout pas `"single-page-application"`. En mode
  SPA, toute adresse qui ne correspond à aucun fichier reçoit `index.html`, ce qui inclut
  `/api/feed` : le Worker ne serait jamais appelé et le fil recevrait du HTML à la place
  du JSON.
- **`html_handling: "auto-trailing-slash"`**, qui sert `fan.html` sur `/fan`. C'est ce qui
  permet aux liens de parrainage d'être courts et dictables.

**C'est délibéré.** Le site mutualisé héberge dix clients derrière un seul projet : une
erreur sur l'un les touche tous. Latiss vise une audience de dizaines de milliers de
personnes derrière un artiste à ~10 millions d'abonnés. Il ne partage pas.

## La commande

Depuis ce dossier :

```
npx wrangler deploy
```

**Et pas `wrangler pages deploy`.** Ce projet n'est PAS un projet Pages classique : créé le
19/09/2026, il est né sur la nouvelle plateforme où Pages est fondu dans Workers. Il
n'apparaît d'ailleurs pas dans `wrangler pages project list`. Le site mutualisé
`demo-agenceattractor`, lui, reste sur l'ancienne plateforme et garde sa commande à lui.
**Les deux dossiers ont donc deux commandes différentes, et les confondre ne déploie rien.**

**Le piège du nom, rencontré le jour même.** Wrangler avait écrit `"name": "site"` dans le
`wrangler.jsonc`, d'après le nom du dossier, alors que le Worker déployé s'appelle
`latiss`. Un `wrangler deploy` lancé tel quel aurait créé un SECOND Worker nommé `site`,
aurait dit « réussi », et n'aurait jamais touché `latiss.net`. C'est le piège du Worker
homonyme, déjà vécu le 01/07/2026. Le nom est corrigé : **ne pas y retoucher.**

**Toujours vérifier sur `latiss.net`**, jamais sur l'alias `latiss.myattractor1.workers.dev`.

## L'état au 19/09/2026

| | |
|---|---|
| Domaine | `latiss.net`, enregistré le 18/09/2026 chez Cloudflare, jusqu'au 18/09/2027 |
| Serveurs de noms | Cloudflare (`noor` / `tate`) |
| Titulaire | **le compte de l'agence.** À passer à STAR FACTORY, voir le `DOSSIER.md` |
| Contenu | la page d'attente : le clip, le nom, « Bientôt disponible ». Rien d'autre |

## L'adresse officielle : `latiss.net`, sans `www`

Arrêté le 19/09/2026 par Mac Arthur. **Tout lien fabriqué par l'application doit porter
`https://latiss.net`**, jamais `www`, jamais `http`.

Deux règles de redirection Cloudflare le garantissent, dans cet ordre :

| Ordre | Règle | Effet |
|---|---|---|
| 1 | `HTTP vers HTTPS` | `http://*` → `https://${1}`, 301 |
| 2 | `www vers latiss.net` | `https://www.*` → racine, 301 |

Les deux conservent **la chaîne de requête**, et ce n'est pas un détail de confort : c'est
elle qui porte le `?ref=` des liens de parrainage. Sans elle, un filleul arrive sans le code
de son parrain, personne ne voit d'erreur, et le compteur de l'Ambassadeur reste
simplement à zéro.

Vérifié le 19/09, les quatre portes d'entrée convergent et le code survit à chacune :

```
http://latiss.net/fan?ref=AWA777       -> 1 saut  -> https://latiss.net/fan?ref=AWA777
http://www.latiss.net/fan?ref=AWA777   -> 2 sauts -> https://latiss.net/fan?ref=AWA777
https://www.latiss.net/fan?ref=AWA777  -> 1 saut  -> https://latiss.net/fan?ref=AWA777
https://latiss.net/fan?ref=AWA777      -> direct
```

**Pourquoi le domaine nu plutôt que `www`.** Il se dicte mieux, à la radio comme sur scène,
et il se tape plus vite sur un clavier de téléphone. Les deux marchent de toute façon :
`www` n'est pas refusé, il est déplacé.

## L'ancien réglage, réglé



**Fait le 19/09** : le HTTP est forcé en HTTPS par une règle de redirection, ce qui rend
inutile la case SSL/TLS → Edge Certificates → Always Use HTTPS.

**L'adresse canonique, et pourquoi elle comptait.** `latiss.net` et
`www.latiss.net` servent aujourd'hui la même page, donc ça ne se voit pas. Mais
**le stockage du navigateur est propre à chaque adresse** : l'espace fan garde la session
dans `localStorage`, sous la clé `bey_membre`. Le jour où l'application vivra ici, un fan
inscrit sur `www.latiss.net` qui revient sur `latiss.net` **n'aura plus de compte** : ni
prénom, ni grade, ni lien de parrainage. Il croira avoir tout perdu, et il aura raison de
le croire.

Choisir `latiss.net` comme adresse canonique, plus court à dicter et à écrire sur une
affiche, et rediriger `www` vers lui. **À faire avant la bascule de l'espace fan, pas
après** : après, ce sont de vrais fans qui perdent leur compte.

## Le déménagement du 19/09/2026

Fait le jour où Mac Arthur a confirmé que les 11 membres inscrits étaient des testeurs.
**C'était le bon moment, et il ne se représentera pas** : le navigateur range ses données
par adresse, donc un membre inscrit sur l'ancienne adresse arrive sur la nouvelle **sans
compte** — ni prénom, ni grade, ni lien de parrainage. Avec 11 testeurs, ça coûte une
réinscription de dix secondes. Après le lancement, ce sont de vrais fans recrutés par de
vrais Ambassadeurs qui perdent leur grade.

Les anciennes adresses redirigent, **et elles gardent la chaîne de requête**. Ce n'est pas
un détail de confort : c'est elle qui porte le `?ref=` des liens déjà envoyés sur WhatsApp.
Sans elle, un filleul arrive sans le code de son parrain, personne ne voit d'erreur, et le
compteur de l'Ambassadeur reste simplement à zéro.

```
demo.agenceattractor.com/beynaud/fan?ref=X   -> 1 saut  -> latiss.net/fan?ref=X
demo.agenceattractor.com/beynaud/app         -> 1 saut  -> latiss.net/app
http://demo.agenceattractor.com/...?ref=X    -> 2 sauts -> latiss.net/fan?ref=X
```

**Les pages commerciales du dossier restent sur le site mutualisé** : `/beynaud`,
`/beynaud/offre`, `/beynaud/maquette`. Ce ne sont pas l'application, ce sont des supports
de vente de l'agence.

**Les deux Pages Functions n'ont pas été supprimées du site mutualisé**, et c'est
délibéré : un testeur qui a installé l'application sur son écran d'accueil garde une
copie en cache qui les appelle encore. Elles ne coûtent rien et elles pourront partir
quand plus personne n'ouvrira l'ancienne adresse.

**Le domaine n'a pas été attaché par script.** Wrangler ne sait pas attacher un domaine, et
le `CLOUDFLARE_API_TOKEN` du `.env` est **invalide**, vérifié le 19/09 auprès de l'API.
L'attachement se fait donc dans le tableau de bord, une fois :

> Workers & Pages → **latiss** → Settings → **Domains & Routes** → Add → Custom domain
> → `latiss.net`, puis recommencer pour `www.latiss.net`.

Le certificat est émis par Cloudflare en quelques minutes. La zone étant déjà chez eux,
aucun enregistrement DNS n'est à créer à la main.

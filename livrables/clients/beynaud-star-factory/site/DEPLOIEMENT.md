# latiss.net — comment on déploie

> Révision du 19/09/2026, jour de la mise en ligne du domaine.

## Ce que c'est

Le site de **Latiss**, sur son domaine propre `latiss.net`. Il a son **propre projet
Cloudflare Pages**, séparé du site mutualisé `demo.agenceattractor.com`.

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

## Ce qui n'a PAS été fait, et pourquoi

**L'espace fan n'a pas bougé.** Il reste sur `demo.agenceattractor.com/beynaud/fan`, et
c'est volontaire : les Ambassadeurs ont déjà partagé des liens de parrainage à cette
adresse sur WhatsApp. Les déplacer maintenant casserait le recrutement déjà fait, pour
rien, puisque le contenu de démarrage n'est pas prêt.

La bascule de l'espace fan se fera avec **la redirection des anciens liens posée le jour
même**, pas après. C'est la seule partie de cette migration qui casse quelque chose si
elle est mal faite.

**Le domaine n'a pas été attaché par script.** Wrangler ne sait pas attacher un domaine, et
le `CLOUDFLARE_API_TOKEN` du `.env` est **invalide**, vérifié le 19/09 auprès de l'API.
L'attachement se fait donc dans le tableau de bord, une fois :

> Workers & Pages → **latiss** → Settings → **Domains & Routes** → Add → Custom domain
> → `latiss.net`, puis recommencer pour `www.latiss.net`.

Le certificat est émis par Cloudflare en quelques minutes. La zone étant déjà chez eux,
aucun enregistrement DNS n'est à créer à la main.

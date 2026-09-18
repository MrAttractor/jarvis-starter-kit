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

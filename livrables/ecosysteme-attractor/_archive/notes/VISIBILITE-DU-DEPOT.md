# Visibilité du dépôt GitHub, point reporté

> Constat du 14/08/2026, **reporté par Mac Arthur à une session dédiée**.
> Cette note existe pour que cette session reparte des faits vérifiés, sans les
> re-chercher. Rien n'est décidé ici.

---

## Le constat

**`github.com/MrAttractor/jarvis-starter-kit` est public.** Vérifié sans
authentification sur l'API GitHub : `"visibility": "public"`. C'est le monorepo qui
contient tout le workspace.

### Ce qui est lisible par n'importe qui, aujourd'hui

| Quoi | Où |
|---|---|
| Mots de passe temporaires remis à des clients | `context/CONTEXT.md`, `context/HISTORY.md`, `armee-du-seigneur/DOSSIER.md` |
| Numéros de téléphone personnels de clients | 110 fichiers |
| Doctrine, expériences, règles, **barème tarifaire et marges** | `cerveau/`, `.claude/skills/devis-express/` |
| Dossiers clients : montants, impayés, points faibles | `livrables/clients/*/DOSSIER.md` |
| Documents contractuels sous NDA (Festival, Élévia) | `livrables/clients/` |

### Ce qui ne fuit pas

- **`.env` n'a jamais été commité.** Vérifié sur tout l'historique.
- Les clés Supabase présentes dans le code sont des clés **`anon`**, publiques par
  conception, celles que le navigateur reçoit de toute façon. Aucune `service_role`
  en dur.

---

## Le piège à connaître avant de trancher

**`agenceattractor.com` est servi par GitHub Pages depuis la branche `gh-pages` de ce
dépôt.** Sur un compte gratuit, GitHub Pages ne fonctionne pas sur un dépôt privé :
**basculer le dépôt en privé coupe le site vitrine.**

---

## Les trois sorties, avec leur vrai coût

| Option | Ce que ça touche | Risque | Coût | Durée |
|---|---|---|---|---|
| **A. Sortir le site vitrine dans son propre dépôt public** | Rien au DNS | Faible, quelques minutes de coupure | 0 € | ~30 min |
| **B. Migrer le DNS chez Cloudflare et passer sur Cloudflare Pages** | **Toute la zone DNS, emails compris** | **Réel sur le mail de l'agence** | 0 € | 2 à 3 h |
| **C. GitHub Pro** | Rien | Aucun | ~4 $/mois | 2 min |

### Pourquoi l'option A est recommandée

La branche `gh-pages` est déjà autonome : **27 fichiers, 22 Mo**, avec son `CNAME` et
son `.nojekyll`. On la pousse dans un dépôt public dédié, on y active Pages, on déclare
le domaine dessus. **Le DNS ne bouge pas** : les quatre IP de GitHub Pages sont communes
à tout GitHub Pages, c'est le fichier `CNAME` du dépôt qui rattache le domaine. On le
retire de l'ancien, on le déclare dans le nouveau.

### Pourquoi l'option B est un chantier à part

Zone DNS chez **GoDaddy** (`ns29/ns30.domaincontrol.com`), racine du domaine sur les
quatre A de GitHub Pages (`185.199.108-111.153`). Cloudflare Pages sur une racine exige
que la zone soit chez Cloudflare, donc bascule des nameservers et recopie de toute la
zone :

- les **5 MX de Google Workspace** (`macarthur@` et l'alias `hello@`),
- les **SPF, DKIM et DMARC** de Google et de Resend,
- les CNAME de `assists`, `demo`, `livraisonpro`,
- les enregistrements de vérification de domaine.

Un oubli et l'agence n'a plus d'email, ou en a encore mais qui part en indésirables sans
signal. `hello@agenceattractor.com` est l'expéditeur contractuel des invitations à
signer. **À ne pas faire pendant une attente de signature.**

C'est un bon chantier en soi (tout l'écosystème est déjà chez Cloudflare, et ça
supprimerait les CNAME manuels chez GoDaddy). Il se mène pour lui-même, pas pour régler
une question de visibilité de dépôt.

---

## À traiter le jour de la session dédiée

1. Trancher A, B ou C.
2. **Changer les mots de passe temporaires clients** encore actifs, ils ont été publics.
3. Ranger le `HEAD` distant, il pointe encore sur `master` alors que `main` a 186 commits
   d'avance (reliquat du renommage du 19/07).
4. Décider si l'historique déjà publié doit être réécrit ou seulement fermé. Passer en
   privé n'efface pas ce qui a pu être lu, forké ou indexé.

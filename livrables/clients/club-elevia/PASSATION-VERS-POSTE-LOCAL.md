# Passation vers une session Claude Code locale — Club Élévia

> Écrit le 06/09/2026. La session cloud ne peut atteindre ni
> `signature.agenceattractor.com`, ni `demo.agenceattractor.com`, ni Supabase : le proxy
> de sortie refuse ces domaines. Quatre chantiers sont donc bloqués, et ils le resteront
> tant qu'ils ne seront pas repris depuis un poste ayant un accès réseau normal.
>
> **Le bloc ci-dessous se colle tel quel** dans Claude Code sur le poste de Mac Arthur.

---

Contexte : dossier client Club Élévia, dans ce dépôt. Branche de travail
`claude/api-529-overloaded-weff8n`. Commence par lire `livrables/clients/club-elevia/DOSSIER.md`,
c'est la fiche de référence du dossier.

Quatre tâches, dans cet ordre. Ne passe à la suivante que lorsque la précédente est vérifiée,
et arrête-toi pour me demander si quelque chose ne se présente pas comme décrit.

## Tâche 1 — Remettre les bons documents dans le dossier de signature

Le service de signature est maison et son code est dans ce dépôt :
`livrables/ecosysteme-attractor/attractor-assists/app/supabase/`, migration
`0061_signature_attractor.sql`, fonctions `sign-create`, `sign-load`, `sign-otp`,
`sign-verify`. Tables : `sig_dossiers`, `sig_documents`, `sig_signataires`, `sig_evenements`.

Le dossier concerné : **`94722c2d-77d5-4579-b9a1-2e749baea1fa`**. Il contient trois documents
en attente de signature, et ce sont les **anciennes versions**. La cliente les a lus le
6 septembre et a relevé, à juste titre, qu'ils contredisent ce qu'on lui a écrit.

Les bonnes versions sont dans `livrables/clients/club-elevia/`, en `.html` et en `.pdf` :

- `AVENANT-01-ClubElevia` — révision 4
- `CDC-ATR-2026-0005-ClubElevia` — révision 5
- `DEVIS-ATR-2026-0005-ClubElevia` — révision 6

Avant toute écriture, lis la structure de `sig_documents` et le contenu réel du dossier :
comment le document est stocké, et comment `contenu_hash` est produit. Ce champ est
l'empreinte du document au moment du scellement.

Puis remplace les trois documents par les versions à jour, **en recalculant `contenu_hash`**
et **en journalisant l'opération dans `sig_evenements`**. Deux contraintes à respecter :

- le lien de la cliente ne doit pas changer, elle l'a déjà et il court jusqu'au 30/09/2026 ;
- la signature déjà apposée par Mac Arthur doit être préservée.

**Si le remplacement propre est impossible sans invalider la signature existante ou sans
casser la valeur probante du dossier, arrête-toi et explique-moi les options. Ne force pas.**

Vérification : ouvre le lien de la cliente et confirme que les trois documents affichés
portent bien « Révision 4 », « Révision 5 » et « Révision 6 ».

## Tâche 2 — Rendre l'espace d'administration accessible à la cliente

Applique `livrables/clients/club-elevia/app/supabase/0007_elevia_agents.sql` sur le projet
Supabase d'Élévia. Avant de l'exécuter, remplace `A_REMPLACER@exemple.com` par l'adresse
réelle de son compte Élévia, à relever d'abord en base : ce n'est pas forcément son adresse
de correspondance.

Pourquoi c'est bloquant : la fonction `elevia-verif` exige `role = 'agent'` pour ouvrir la
file des candidatures, le rôle par défaut est `membre`, et **aucune ligne du dépôt ne promeut
qui que ce soit**. La cliente ne peut donc valider aucune candidature, et par conséquent
aucun membre ne peut devenir vérifié. Sa propre vidéo attend depuis le 8 août.

Vérification : `select pseudo, email, role from el_membres;` puis ouvre
`https://demo.agenceattractor.com/elevia/admin/` avec son compte.

## Tâche 3 — Vérifier le bucket des vidéos de vérification

Dans Supabase, contrôle la configuration du bucket qui stocke les vidéos : il doit être
**privé**, et sa liste de types autorisés doit contenir **`video/mp4` en plus de
`video/webm`**. Un iPhone produit du mp4 : si seul webm est accepté, l'envoi échoue alors
que l'enregistrement s'est parfaitement déroulé, et le membre voit « L'envoi n'a pas abouti ».

Cette configuration n'existe nulle part dans le dépôt, elle vit seulement dans l'interface
Supabase. **Ajoute une migration qui la fixe**, pour qu'elle soit reproductible le jour où
la base sera transférée au projet de la cliente, comme le contrat le prévoit.

## Tâche 4 — Deux correctifs de la vérification vidéo

Dans `livrables/clients/demo-site/public/elevia/app/index.html` :

1. l'enregistrement démarre par `enregistreur.start()` sans découpage. Passe à
   `start(1000)` : sur Safari iOS, sans découpage, le fichier final peut ressortir vide.
2. le chemin du fichier est toujours `<membre>/<id>.webm`, y compris quand la vidéo est en
   mp4. Cela se décide côté serveur, dans
   `livrables/clients/club-elevia/app/supabase/functions/elevia-verif/index.ts`, actions
   `demarrer` et `soumettre`. Fais correspondre l'extension au format réellement enregistré,
   sans casser les vidéos déjà stockées.

Puis déploie :

```
cd livrables/clients/demo-site
npx wrangler pages deploy public --project-name=demo-agenceattractor --branch=master
```

Neutralise `CLOUDFLARE_API_TOKEN` avant de lancer la commande : Wrangler lui donne la
priorité sur la session OAuth, et ce jeton ne porte que le DNS.

Vérification, et c'est la seule qui compte : ouvre la démo **sur un vrai iPhone** et va
jusqu'au bout de l'envoi de la vidéo. Ce test n'a jamais été fait, c'est le point R-51 du
cerveau, ouvert depuis le 19 août.

## Pour finir

Commit et push sur la même branche, puis mets à jour `DOSSIER.md` avec ce qui a été fait et
ce qui a été mesuré.

**Ne touche pas au brouillon Gmail** destiné à Élise : il est rédigé et Mac Arthur l'a
retouché à la main.

Une fois les tâches 1 et 2 faites, il reste à répondre à son mail du 6 septembre. Le
nécessaire est déjà écrit dans le DOSSIER : elle a lu les anciens documents, l'article 16 de
l'avenant a été corrigé sur le point qu'elle relevait, et son adresse de contact est
`clubpriveeelevia@gmail.com`.

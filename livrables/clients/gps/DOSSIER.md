# GPS — l'état du dossier

> Ouvert le 19/08/2026. **Cette fiche est la première chose à lire du dossier.**

| Radar | |
|---|---|
| Statut | **EN LIGNE le 19/08 sur `demo.agenceattractor.com/gps`. Recette faite. Pas encore montré au client** |
| Dernier contact | 2026-08-19, dépôt de 66 visuels dans le dossier Drive par Mac Arthur |
| Prochaine action | **Ouvrir les deux pages sur un vrai téléphone**, puis écrire la proposition d'échange et lui envoyer le lien |
| Échéance | à fixer. Elle dépend de la date du SAMA, encore inconnue |
| Argent en attente | **0 €. C'est une DMV**, la contrepartie est en promotion ouverte et en marchandises |

## En une phrase

Jeune animateur à Abidjan. L'agence lui conçoit son site en **démonstration de valeur**,
contre une promotion ouverte et un échange marchandises dans le cadre d'une collaboration
formelle. Le site a **deux boutons** et rien d'autre ne compte : **réserver un booking**
et **contacter pour le SAMA**, l'événement qu'il organise.

## Ce qu'on ne sait pas encore, et qui bloque l'écriture du site

Le dossier Drive contient **66 photos et aucun texte**. Tant que ces points ne sont pas
établis, aucune ligne du site ne s'écrit :

1. Son nom, son orthographe exacte, et ce qu'il anime précisément.
2. Le SAMA : nom complet, ce que c'est, quelle édition, quelle date, quel lieu.
3. Ses numéros WhatsApp et ses réseaux.
4. Les marques, lieux et partenaires déjà à son actif.
5. Sa charte réelle : couleurs et typographies de ses visuels.
6. Ce qu'il rend exactement, en promotion comme en marchandises.

**La règle sur ce dossier :** on propose les textes, il les valide. On n'invente ni sa
biographie ni ses références. C'est son nom qui est engagé, pas le nôtre.

## Le montage

**DMV, échange formalisé.** Le cadrage écrit se fait **en parallèle** de la production,
décision de Mac Arthur du 19/08. Le risque est connu et assumé : c'est le schéma qui a
laissé le Festival des Grillades tourner sans convention depuis le 25/07. Ici l'enjeu est
plus petit, et la proposition d'échange est un livrable de la phase 1.

## Le périmètre de la phase 1

**Inclus :** une page qui déroule sur `demo.agenceattractor.com/gps`, une page dédiée au
SAMA partageable seule, un formulaire de booking et un formulaire SAMA qui écrivent en
base et ouvrent WhatsApp pré-rempli, une notification par e-mail à chaque demande.

**Exclu, et présenté comme évolution possible, jamais offert d'avance :** un tableau de
bord pour qu'il suive ses demandes lui-même, un nom de domaine à son nom, les balises de
partage et le référencement sur ce domaine propre.

## Les décisions prises le 19/08

| Sujet | Décision |
|---|---|
| Hébergement | sous-chemin `demo.agenceattractor.com/gps`, zéro coût, zéro DNS |
| Demandes | écrites en base **et** relayées sur WhatsApp |
| Structure | une page qui déroule, plus une page SAMA dédiée |
| Cible | Abidjan et la Côte d'Ivoire |
| Trame graphique | tirée de ses visuels, aucune identité créée par nous |
| Cadrage de l'échange | mené en parallèle de la production |

## Ce qui est déjà construit

**Le site, dans `demo-site/public/gps/`**
- `index.html` — la page qui déroule : hero, trois façons de travailler ensemble,
  sept domaines d'expertise, expérience médiatique, encart SAMA, ses deux structures,
  vision, galerie, formulaire de booking.
- `sama.html` — la page du Salon de la Musique d'Abidjan, partageable seule :
  programme en six axes, SAMA Academy, galerie, formulaire orienté SAMA.
- `assets/` — 14 visuels retaillés en WebP, **757 Ko au total**, dont trois découpés
  dans ses planches de présentation faute d'originaux (studio radio, scène).
- Route déclarée dans `_redirects`, en liste explicite. **Aucune règle pour `/gps/sama`** :
  Pages sert déjà l'URL propre, une règle 200 y créerait une boucle infinie.
- **Tous les chemins sont absolus** (`/gps/...`). Sur l'URL `/gps` sans barre oblique
  finale, un chemin relatif se résout à la racine du domaine et casse tout.

**Le back, dans `supabase/`**
- `0001_gps_demandes.sql` — table unique `gps_demandes`, colonne `type`
  (`booking` ou `sama`), **RLS activé et aucune policy** : ni lecture ni écriture avec
  la clé publique.
- `functions/gps-demande/index.ts` — reçoit les deux formulaires, valide sur listes
  fermées, écrit avec la clé de service, notifie par e-mail avec un bouton de réponse
  WhatsApp. **Les listes doivent rester identiques au mot près à celles des `<option>`
  du HTML**, sans quoi la valeur se range en null sans erreur visible.

**La charte, relevée au script** : fond `#0C0A32`, corail `#ECA089`, violet `#815FFC`.
Un aplat corail porte une **encre sombre** : du blanc dessus tombe à 2,11:1.
Détail dans `FICHE-LECTURE-VISUELS.md`.

## La recette du 19/08, ce qui est prouvé

| Vérification | Résultat |
|---|---|
| `demo.agenceattractor.com/gps` **sans barre oblique** | 308 vers `/gps/`, une seule redirection, page servie |
| `/gps/sama` | 200, bon titre |
| Adresse inconnue sous `/gps/` | **404**, aucun attrape-tout |
| Les 8 visuels de la page principale | 200 |
| Préflight `OPTIONS` sur l'edge function | 200 |
| Demande de booking et message SAMA | écrits en base, **lignes comptées** |
| Champs obligatoires manquants, e-mail invalide | refusés en 400, message clair |
| Valeur hors liste fermée (`<script>`) | acceptée mais **rangée en null**, rien n'est stocké |
| **Lecture de `gps_demandes` à la clé anon** | **0 ligne renvoyée**, mesuré, pas déduit du code HTTP |
| Notification Resend | 3 e-mails reçus sur `hello@agenceattractor.com` |
| Lignes de recette | **supprimées**, la table est vide |

**Non fait, et ça reste bloquant avant de lui envoyer le lien :** les deux pages
n'ont **pas été ouvertes sur un vrai téléphone**. Tant que ça n'est pas fait, le
livrable n'est pas fini.

## Ce qui reste avant de lui montrer

1. **Ouvrir les deux pages sur un vrai téléphone**, en 4G, pas sur un simulateur.
2. Écrire la proposition d'échange, en parallèle comme décidé : périmètre borné
   côté nous, contrepartie chiffrée côté lui (canaux, fréquence, durée, nature et
   valeur des marchandises), jalons réciproques, clause de sortie.
3. Faire valider par lui la `FICHE-LECTURE-VISUELS.md`, en particulier la phrase
   sur Roger Fulgence Kassy, qu'il a choisi de garder.
4. Obtenir de son équipe les **logos vectoriels** SAMA, Médium Africa et
   Kultur'Famân, et les **liens exacts de ses réseaux** : les trois liens du pied
   de page pointent aujourd'hui vers l'accueil des plateformes, faute d'URL précises.
5. Décider si les notifications doivent aussi partir chez lui : aujourd'hui elles
   arrivent seulement sur `hello@agenceattractor.com`. Il suffit d'ajouter le secret
   `GPS_NOTIFY_TO` au projet Supabase.

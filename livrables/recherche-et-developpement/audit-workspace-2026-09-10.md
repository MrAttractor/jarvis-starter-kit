# Audit approfondi du workspace

> Demandé par Mac Arthur le 10/09/2026, suite au constat d'un décalage entre la session web et VS Code.
> Audit en lecture seule. Aucun correctif appliqué, aucune fusion effectuée.
> Périmètre : tout ce qui détermine le comportement de l'Assists, pas seulement l'écart entre les deux environnements.

**Limite de l'audit à connaître** : je n'ai pas accès à ta machine. Tout ce qui suit est établi depuis le dépôt et depuis l'environnement web. Les conclusions sur VS Code sont des déductions, signalées comme telles.

---

## Ce qu'il faut retenir en dix lignes

Le décalage que tu ressens n'est pas un bug, c'est une conséquence mécanique : **les trois fichiers qui décident du comportement de Claude ne sont pas dans le dépôt**. Tes commandes et tes skills se synchronisent, ta configuration non.

Mais l'audit a sorti trois choses plus lourdes que le décalage lui-même :

1. **97 % du dépôt est du média binaire.** 734 Mo sur 760 Mo. C'est la cause profonde de la lenteur des deux côtés.
2. **Tout push sur `main` redéploie le site public de l'agence**, même un commit qui ne touche qu'une note markdown. Ton refus de fusionner tout à l'heure était le bon réflexe.
3. **CLAUDE.md affirme qu'Attractor Assists est une priorité active** alors qu'il est en stand by. Ce fichier est lu au démarrage de chaque session, dans les deux environnements.

---

## 1 · CRITIQUE : le dépôt est un entrepôt de médias

| Mesure | Valeur |
|---|---|
| Poids total suivi par git | 760 Mo |
| Dont médias binaires | **734 Mo** sur 502 fichiers |
| Ce qui reste pour le texte utile | 25 Mo |
| Poids de `.git` | 604 Mo pour 55 commits seulement |
| Fichiers de plus de 5 Mo | 54 |

Répartition : 423 Mo de `.jpg` (333 fichiers), 238 Mo de `.png` (93), 63 Mo de `.mp4` (16).

Les pires : une vidéo de 17 Mo dans `demo-site`, une de 14 Mo chez MY NUGO, et des photos produit à 10 et 12 Mo pièce, non redimensionnées.

**Pourquoi ça produit exactement le symptôme que tu décris.** Chaque session web reclone ces 604 Mo depuis zéro, le conteneur étant éphémère. Chaque `git pull` en VS Code tire les blobs correspondants. Et git ne compresse pas un JPEG : chaque version d'une image reste dans l'historique pour toujours. Le dépôt ne rétrécira jamais de lui-même, il ne fera que grossir.

**Contradiction avec le cerveau.** R-52 dit que le poids d'un média est une décision commerciale. Ici la décision n'a jamais été prise, les sources brutes sont entrées telles quelles.

**Ce que ça ne casse pas encore.** GitHub avertit à 50 Mo par fichier et bloque à 100 Mo. Le plus gros est à 17 Mo. Tu n'es pas bloqué, tu es ralenti.

---

## 2 · CRITIQUE : un commit markdown redéploie agenceattractor.com

`.github/workflows/deploy-site.yml` se déclenche sur `push: branches: [main]` et publie `livrables/commercial/site-agenceattractor` (26 fichiers) sur le domaine `agenceattractor.com`.

**Il n'y a aucun filtre `paths:`.** N'importe quel push sur `main` relance le déploiement du site public, y compris un commit qui ne touche qu'une note de R&D.

Concrètement : si j'avais fusionné mes 2 commits sur `main` comme je te le proposais il y a dix minutes, j'aurais redéployé le site de l'agence pour publier une note markdown. Ça n'aurait probablement rien cassé, mais c'est un déploiement non voulu et non surveillé, ce qui est exactement ce que R-27 interdit.

---

## 3 · CRITIQUE : le workspace se trompe sur ta propre priorité

CLAUDE.md, ligne 19, chargé au démarrage de **chaque** session, web comme VS Code :

> « Mes objectifs prioritaires actuels : atteindre 10 000 €/mois d'ici mi-2027, **reconstruire et déployer Attractor Assists**, et vendre directement mes app métiers. »

Tu viens de me dire qu'Assists est en stand by depuis plusieurs semaines.

Ce n'est pas une coquille de documentation. C'est la prémisse à partir de laquelle chaque session raisonne, priorise et te propose des chantiers. Tant qu'elle est fausse, l'Assists pousse dans une direction que tu as abandonnée, et il le fait de façon invisible parce que personne ne relit CLAUDE.md.

Le désaccord s'étend plus loin :
- `livrables/ecosysteme-attractor/` reste dimensionné comme un chantier actif
- HISTORY.md décrit encore la refonte comme « passée en PLAN MODE, à mener dans une session dédiée »
- R-56 du cerveau dit qu'un produit mis en pause libère l'agence. La pause n'est écrite nulle part, donc elle ne libère rien

À noter : `context/PROGRESSION.md` est, lui, parfaitement à jour et honnête. Le tableau du 09/09 dit les choses sans fard : 2 317 € dus, 21 dossiers en silence de plus de 21 jours. Ce fichier fonctionne. C'est CLAUDE.md qui est resté figé.

---

## 4 · LE DÉCALAGE WEB / VS CODE, cause exacte

### Ce qui se synchronise

Versionné dans git, donc rigoureusement identique des deux côtés :

| Élément | Volume |
|---|---|
| `.claude/commands/` | 7 commandes |
| `.claude/skills/` | 27 skills |
| `.claude/hooks/deploy-guard.js` | 1 fichier |
| `CLAUDE.md`, `cerveau/`, `context/`, `livrables/` | tout le contenu |

### Ce qui ne se synchronise pas

| Fichier | État | Conséquence |
|---|---|---|
| `.claude/settings.json` | **absent du dépôt** | aucune permission, aucun hook, aucun réglage partagé |
| `.mcp.json` | **absent du dépôt** | la liste des serveurs MCP dépend de chaque environnement |
| `.claude/settings.local.json` | gitignored, par conception | c'est normal, mais c'est là que tout finit par vivre |

**Voilà le décalage, en une phrase** : ce qui définit ce que Claude *sait* est versionné, ce qui définit ce que Claude *peut faire* ne l'est pas.

Côté web, mes outils viennent des connecteurs de ton compte claude.ai : FLORA, Notion, Gmail, Google Drive, Google Calendar, MAGNIFIC, plus Canva qui n'est pas encore autorisé. Côté VS Code, ils viennent de ta configuration locale. Rien ne garantit que les deux listes coïncident, et rien dans le dépôt ne cherche à les faire coïncider.

### Le point le plus dangereux : ton garde-fou est mort d'un côté

`deploy-guard.js` existe, il est versionné, il fait 5 845 octets, et son en-tête dit :

> « Déclenché après chaque git push via hook PostToolUse. »

HISTORY.md le confirme, `decisions-actees.md` le note comme **FAIT** et « testé sur 3 cas ».

**Or rien dans le dépôt ne le déclare.** Un hook ne s'exécute que s'il est câblé dans un bloc `hooks` d'un `settings.json`. Il n'y en a aucun. Recherche exhaustive sur `PostToolUse` dans tout le dépôt : une seule occurrence, une ligne de prose dans HISTORY.md.

Deux lectures possibles, et je ne peux pas trancher depuis ici :
- soit il est déclaré dans ton `settings.local.json` sur ton Mac, et alors **il tourne en VS Code et pas en web**, ce qui est le décalage exact que tu décris
- soit il n'a jamais tourné nulle part depuis sa création, et une décision marquée FAIT dans le registre ne l'est pas

Dans les deux cas, un garde-fou de déploiement qui protège un environnement sur deux ne protège rien. Il donne une impression de sécurité, ce qui est pire que pas de garde-fou du tout.

**Comment vérifier en 10 secondes chez toi** : ouvre `.claude/settings.local.json` dans VS Code. S'il contient un bloc `hooks`, c'est la première lecture.

---

## 5 · Cohérence documentaire

### CLAUDE.md ne décrit plus le workspace qu'il gouverne

| Sujet | Déclaré | Réel |
|---|---|---|
| Commandes | 3 (`/prime`, `/update`, `/morning`) | **7** |
| Skills | 1 documentée en section dédiée | **27** |
| Racine du dépôt | 8 entrées | **16** |

Commandes existantes et absentes de CLAUDE.md : `/cerveau`, `/commit`, `/radar`, `/soir`.

Dossiers et fichiers racine non déclarés dans la structure : `.github/`, `memory/`, `supabase/`, `docker-compose.yml`, `netlify.toml`, `fix-encoding.js`.

Point positif : la grille `livrables/` et la structure `context/import/` sont **exactement conformes** à ce que CLAUDE.md déclare. Aucun dossier générique interdit n'a été réintroduit, `.env.example` ne contient aucune clé YouTube. La consigne de source de vérité a tenu.

### `/prime` coûte cher à chaque démarrage

La commande lit intégralement 5 fichiers, dont :

| Fichier | Lignes | Poids |
|---|---|---|
| `context/HISTORY.md` | **3 944** | 400 Ko |
| `context/CONTEXT.md` | 531 | 120 Ko |
| `cerveau/03-REGLES.md` | 400 | 44 Ko |

Plus de 4 400 lignes avalées avant que tu aies posé ta première question, à chaque session, dans les deux environnements.

CLAUDE.md dit pourtant, dans ses notes finales : « L'historique se construit naturellement au fil des sessions, pas besoin de tout y mettre. » La consigne existe, elle n'est pas tenue.

### Conflit de sources sur J'Envoie Express

`memory/project_jenvoie_express.md` contient le deal complet : 230 € au total, 130 € d'acompte, 100 € de solde, 50 €/mois de maintenance.

`livrables/clients/jenvoie-express-app/DOSSIER.md` existe aussi et couvre le même dossier.

Le montant de 230 € apparaît dans **10 fichiers distincts**, dont HISTORY.md et trois dossiers clients sans rapport.

R-29 dit : un document source par dossier, un chiffre à un seul endroit. Le dossier `memory/` n'est déclaré nulle part et duplique une source existante. C'est le type d'écart qui produit un jour un devis avec le mauvais montant.

### Références réellement cassées

Sur l'ensemble des skills et commandes, trois liens pointent vers des fichiers inexistants :

| Fichier qui cite | Cible manquante |
|---|---|
| `.claude/skills/chef-de-projet/SKILL.md` | `livrables/commercial/suivi-clients.md` |
| `.claude/skills/programmeur-senior/SKILL.md` | `references/architecture-supabase.md` |
| `.claude/skills/generateur-app-metier/references/architecture-commune.md` | `references/deploiement-domaine.md` |

Sur des skills aussi centrales que le Chef de Projet et le Programmeur Senior, chaque appel part avec une pièce manquante et personne ne le voit passer.

### Une skill fantôme

`.claude/skills/veille-setup/` contient un `SOP_n8n.md` de 142 lignes, mais **pas de `SKILL.md`**. Sans ce fichier, la skill n'existe pour Claude dans aucun des deux environnements. 142 lignes de procédure n8n écrites et invisibles.

---

## 6 · État git

`main` est en retard de 2 commits sur `claude/clever-cannon-o7tvcq`, en avance pure, fusion en fast-forward possible sans conflit.

| Commit | Contenu | Auteur |
|---|---|---|
| `bd2b08b` | debrief radars du 8 septembre, 3 dossiers clients, PROGRESSION.md | session web précédente |
| `4f8b184` | note d'évaluation FLORA | cette session |

Le premier n'est pas de moi. Une session web antérieure a laissé du travail sur une branche qui n'a jamais été fusionnée. **C'est très probablement le décalage que tu constates en pratique** : en VS Code sur `main`, tu ne vois ni le debrief radars du 8 septembre, ni les mises à jour des dossiers Boutique Paysanne, Club Élévia et Festival Grillades.

Aucun fichier non suivi, aucune modification en attente. L'arbre est propre.

---

## 7 · Tableau de bord des constats

| # | Constat | Gravité | Où ça se corrige |
|---|---|---|---|
| 1 | 734 Mo de médias binaires versionnés | Critique | décision de fond, pas un patch |
| 2 | Tout push sur `main` redéploie le site public | Critique | filtre `paths:` dans le workflow |
| 3 | CLAUDE.md déclare Assists en priorité active | Critique | CLAUDE.md + CONTEXT.md + cerveau |
| 4 | `deploy-guard.js` déclaré nulle part dans le dépôt | Élevée | `.claude/settings.json` versionné |
| 5 | Aucun `.mcp.json`, listes d'outils divergentes | Élevée | `.mcp.json` versionné |
| 6 | 2 commits jamais fusionnés dans `main` | Élevée | décision de branche |
| 7 | `/prime` charge 4 400 lignes à chaque session | Moyenne | archivage de HISTORY.md |
| 8 | `memory/` duplique un DOSSIER client | Moyenne | trancher la source unique |
| 9 | CLAUDE.md documente 3 commandes sur 7, 1 skill sur 27 | Moyenne | CLAUDE.md |
| 10 | 3 références cassées dans les skills | Moyenne | créer les cibles ou retirer les liens |
| 11 | `veille-setup` sans SKILL.md | Faible | ajouter le fichier ou supprimer |
| 12 | 6 entrées racine non déclarées | Faible | CLAUDE.md |

---

## 8 · Ce que je recommande, dans cet ordre

L'ordre compte. Corriger le décalage technique avant de corriger la prémisse fausse reviendrait à synchroniser deux environnements qui se trompent tous les deux de priorité.

**1. Trancher le statut d'Assists, par écrit.** C'est le seul point qui exige ta décision et que rien ne peut deviner. Tant qu'il n'est pas écrit, les onze autres constats se corrigent au service d'une direction périmée.

**2. Poser le filtre `paths:` sur le workflow de déploiement.** Trois lignes, risque nul, et ça débloque la question de la fusion vers `main`.

**3. Verrouiller la configuration dans le dépôt.** `.claude/settings.json` avec le hook déclaré, `.mcp.json` avec les serveurs. C'est ce qui fait disparaître le décalage pour de bon.

**4. Décider quoi faire des 734 Mo.** Décision de fond, à instruire séparément. Purger l'historique git est faisable mais réécrit tous les commits, ce qui casse ton clone local et tous les autres. Ça ne se fait pas à la légère et sûrement pas en fin de session.

**5. Le reste**, qui est du rangement et peut attendre une session dédiée.

---

## 9 · Ce que cet audit n'a pas couvert

Pour être clair sur les angles morts :

- **Ta configuration VS Code locale.** Non accessible depuis ici. La vérification de `settings.local.json` t'appartient.
- **Le contenu métier des livrables.** J'ai audité la structure, pas la qualité des 583 Mo de livrables clients.
- **Le code des apps.** Aucune revue de sécurité ni de qualité sur les web apps clientes.
- **La cohérence du cerveau lui-même.** Les 76 règles n'ont pas été relues pour détecter des contradictions entre elles.

Chacun de ces quatre points peut faire l'objet d'un audit dédié.

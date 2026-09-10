# Réunion générale, refondation de l'agence

**Date : 10/09/2026**
**Référence de comparaison : CR du 12/07/2026 (point zéro, 15 agents)**
**Convoqués : les 27 agents du répertoire `.claude/skills/`**
**Objet : plan de mise à jour complète, sort des projets, sort des agents, refonte du design system et du site web.**

> Ce document est le dossier de séance, pas le procès-verbal des décisions. Tout ce qui
> touche à un abandon ou à un remplacement est présenté avec ses deux faces et **attend
> l'arbitrage de Mac Arthur**. Rien n'a été supprimé avant cette réunion.
>
> Méthode : mandat théorique de chaque agent croisé avec trois mesures indépendantes,
> l'historique git du répertoire des skills, le nombre de mentions dans `HISTORY.md`, et
> les traces réelles de production dans `livrables/`.

---

## 1. Ce que le point zéro du 12/07 avait décidé, et ce qu'il en reste

| Décision du 12/07 | État au 10/09 | Verdict |
|---|---|---|
| GARDIEN remis en route (checklist + hook de déploiement) | La checklist existe (`gardien/references/checklist-deploiement.md`), mais R-70 s'est reproduite le 13/08 (le README interne de l'agence lisible sur le site de Nabycook, **deuxième occurrence**) | Outillé, non appliqué |
| PONT réactivé, registre des décisions relancé | Registre gelé depuis le **27/07, décision 020**. Six semaines de décisions structurelles non tracées : mandat Festival V2, signature Élévia, classement Boutique Paysanne | **Re-gelé. Deuxième fois.** |
| Trancher le sort des 8 dormants | Jamais fait | Reporté |
| Réveiller le trio promotion | Jamais fait | Non fait |
| Visibilité cash (tableau de bord encaissements) | Jamais fait. Le suivi vit dans `PROGRESSION.md`, tenu à la main | Non fait |
| Mettre à jour le blueprint fondateur | `context/import/methode/RECAP_Ecosysteme_Agents_Attractor.md` toujours périmé | Non fait |

**Une décision sur six a produit un effet, et il n'a pas tenu.** C'est le premier fait de
cette réunion, et il conditionne tous les autres : le problème de l'agence n'est pas de
décider, il est que **rien ne rend une décision exécutable après la séance.**

---

## 2. État mesuré des 27 agents

### 2.1 La mesure qui compte le plus

**Les 27 agents ont été créés le 14/08/2026, en une seule fois, et 25 d'entre eux n'ont
jamais été modifiés depuis.** Seuls `miroir` et `devis-express` portent un second commit.

Traduction : le répertoire d'agents est un **organigramme, pas une équipe**. Aucun agent
n'a été corrigé au contact d'un dossier réel. Un agent qui ne se corrige jamais ne
travaille pas, ou son travail n'est jamais relu.

**Deuxième mesure, plus grave : 2 agents sur 27 citent le cerveau** (`miroir` et un fichier
de référence de `generateur-app-metier`). L'agence a écrit **76 règles**, et **25 agents
sur 27 produisent sans les lire.** Le CLAUDE.md impose pourtant la consultation de
`03-REGLES.md` avant toute production. La règle existe, le dispositif qui l'applique
n'existe pas. C'est exactement R-28 : l'oubli se combat par un dispositif, pas par la
volonté.

### 2.2 Tableau d'activité réelle

| Agent | Mentions HISTORY | Commits | Preuve de production réelle | Statut mesuré |
|---|:-:|:-:|---|---|
| miroir | 21 | 2 | crons en production | **Actif fort** |
| comptes | 11 | 1 | suivi manuel, pas de tableau de bord | Partiel |
| gardien | 7 | 1 | checklist créée, non appliquée | Outillé, dormant |
| ambassadeur | 6 | 1 | aucune | Jamais activé |
| pont | 5 | 1 | registre gelé au 27/07 | Dormant |
| maquette-closer | 5 | 1 | maquettes livrées (All Eyes on yoo, Nabycook) | **Actif fort** |
| boussole | 5 | 1 | aucune | Jamais activé |
| generateur-app-metier | 3 | 1 | apps livrées (GetWinWorld, C'Real, J'Envoie) | **Actif fort** |
| edito | 3 | 1 | aucune note d'opportunité | Jamais activé |
| eclaireur | 3 | 1 | veille faite en direct, hors agent | Partiel |
| devis-express | 3 | 2 | devis ATR-2026-00xx émis | **Actif fort** |
| community-manager | 2 | 1 | contenu Awa, sans cadence | Partiel |
| attractor-office | 2 | 1 | aucun épisode publié | Jamais activé |
| qa-agent | 1 | 1 | aucun rapport QA archivé | Jamais activé |
| programmeur-senior | 1 | 1 | le code existe, l'agent n'est pas la voie | Absorbé |
| pilote-rd | 1 | 1 | aucune | Absorbé par Mac Arthur |
| media-buyer | 1 | 1 | aucune campagne, aucun budget | Jamais activé |
| directeur-artistique | 1 | 1 | charte partielle | Partiel |
| chief-of-staff | 1 | 1 | le CR du 12/07 | Ponctuel |
| chef-de-projet | 1 | 1 | aucun planning archivé | Jamais activé |
| agent-daf | 1 | 1 | aucune projection produite | Jamais activé |
| agent-commercial | 1 | 1 | relances faites à la main | Jamais activé |
| recherche-actualites | 0 | 1 | `/morning` tourne, l'agent n'est pas cité | Partiel |
| crea-ia | 0 | 1 | aucune | Jamais activé |
| agent-rgpd | 0 | 1 | mentions légales écrites à la main | Jamais activé |
| agent-analyste | 0 | 1 | aucune | Jamais activé |
| **veille-setup** | 1 | 1 | **aucun `SKILL.md`, le dossier ne contient qu'un `SOP_n8n.md`** | **Inexistant** |

**Bilan : 4 agents portent l'agence** (miroir, maquette-closer, generateur-app-metier,
devis-express). **13 n'ont jamais rien produit.** 1 n'existe pas techniquement.

Le blueprint de juillet comptait 15 agents dont 4 portaient l'agence. Deux mois plus tard,
il y en a 27 et **toujours les 4 mêmes qui portent.** Recruter n'a rien changé, parce que
le problème n'a jamais été l'effectif.

### 2.3 Les redondances, nommées

Cinq groupes font le même travail, et à l'intérieur de chaque groupe, **aucun ne le fait** :

| Groupe | Agents | Production cumulée |
|---|---|---|
| Finance | `agent-daf` + `comptes` + `boussole` | 0 tableau de bord, 0 projection |
| Contenu | `edito` + `community-manager` + `attractor-office` + `crea-ia` | 0 cadence de publication |
| Contrôle | `gardien` + `qa-agent` + `agent-rgpd` | 0 rapport archivé, R-70 reproduite |
| Pilotage | `chief-of-staff` + `chef-de-projet` + `pilote-rd` + `pont` | 1 CR en deux mois, registre gelé |
| Vente | `agent-commercial` + `maquette-closer` + `devis-express` | seuls les deux derniers produisent |

**Trois agents financiers pour une agence à 275 €/mois de moyenne, et personne ne sait
dire, sans ouvrir un fichier à la main, combien elle a encaissé ce mois-ci.**

---

## 3. Les quatre constats de fond

**1. L'agence produit, elle n'encaisse pas.** `PROGRESSION.md` porte la mention « rien »
sur les relevés du 19 et du 20 août. Au 09/09 : **2 317 € dus et non encaissés, 21 dossiers
en silence, tous au-delà de 21 jours.** Sept dossiers en production n'ont **aucun montant
tracé**. Deux abonnements mensuels, les seuls revenus récurrents, ne sont **toujours pas
vérifiés** depuis le 31/07.

**2. La mémoire de gouvernance ne tient pas.** Deuxième gel du registre PONT en deux mois.
Ce n'est plus un incident, c'est la preuve que le dispositif est mal conçu : il repose sur
une intention en fin de session, pas sur un déclencheur.

**3. Le contrôle qualité n'existe qu'à l'écrit.** 76 règles, une checklist de déploiement,
un hook, et R-70 se reproduit un mois plus tard sur le site d'une cliente. Le filtre est
écrit, il n'est pas branché.

**4. Le design système n'est pas un système.** Voir section 5. Trois sources
contradictoires, aucune n'est appliquée par le site de l'agence.

---

## 4. Convocation : la question posée à chaque agent

Chaque agent est convoqué avec une question unique, à laquelle il doit répondre par une
preuve, pas par une intention.

| Agent | Question posée en séance |
|---|---|
| miroir | Qu'as-tu appris de Mac Arthur en août que le cerveau ne contient pas encore ? |
| maquette-closer | Combien de maquettes ont produit une signature, et combien n'ont produit aucune réponse ? |
| devis-express | Sur les 21 dossiers silencieux, combien portent un devis expiré non retiré ? |
| generateur-app-metier | Quelles briques des 3 dernières apps ont été réécrites au lieu d'être réutilisées ? |
| comptes / agent-daf / boussole | Combien l'agence a-t-elle encaissé en août, tous canaux ? Réponse en un chiffre. |
| gardien / qa-agent / agent-rgpd | Pourquoi R-70 est-elle passée deux fois ? |
| pont | Pourquoi le registre a-t-il gelé deux fois au même endroit ? |
| edito / community-manager / attractor-office / crea-ia | Quelle est la dernière publication datée ? |
| media-buyer / ambassadeur | Quel budget, quelle audience, quel résultat ? |
| directeur-artistique | Laquelle des trois chartes fait foi ? |
| chief-of-staff / chef-de-projet / pilote-rd | Quelle décision du 12/07 as-tu fait exécuter ? |
| eclaireur / agent-analyste / recherche-actualites | Quelle veille a changé une décision ? |
| programmeur-senior | Quel écart entre ce que tu prescris et ce que le code fait vraiment ? |
| veille-setup | Sans objet, tu n'existes pas. |

---

## 5. Refonte du design system : le diagnostic

### 5.1 Trois sources, trois vérités

| Source | Ce qu'elle contient | Défaut |
|---|---|---|
| `livrables/ecosysteme-attractor/UX_SYSTEM.md` | 13 chapitres de conformité (mobile first, grille 8 px, tap 44 px, checklist de rejet) | **Aucune couleur, aucune typographie, aucun composant.** C'est un règlement, pas un design system |
| `livrables/ecosysteme-attractor/attractor-assists/design-system.md` | palette orange/vert/sable/charbon, typographies Sora et Inter | Marqué **« proposition v0 à valider »** et **« couleurs estimées depuis des captures »**. Jamais validé, et R-24 exige une palette validée au script |
| Le site `agenceattractor.com` lui-même | l'usage réel | **26 valeurs de couleur en dur** dans `index.html`, dont un vert `#3DDC84` (vert Android) et un bleu `#1a3a6b` qui n'appartiennent à aucune charte |

Le CLAUDE.md déclare `UX_SYSTEM.md` source de vérité unique du front-end. Or il ne décrit
aucun élément visuel. **Toute décision de couleur, de typographie ou de composant se prend
donc aujourd'hui hors système.** C'est la cause racine des allers-retours du dossier GPS,
quatre changements de direction artistique en cinq commits, jusqu'à faire naître R-75.

### 5.2 État du site web

- `index.html` fait **87 Ko en un seul fichier**, tout en styles intégrés.
- Cinq pages autonomes qui ne partagent **aucune feuille de style**.
- Trois familles typographiques chargées, dont une (`Space Mono`) hors charte.
- Conséquence directe : une correction de charte se fait cinq fois, à la main, et R-43
  (GitHub source de vérité) ne protège que les fichiers, pas leur cohérence.

### 5.3 Ce que la refonte doit produire

1. **Un fichier unique de jetons** (`DESIGN-SYSTEM.md` + un `tokens.css` réellement importé
   par les pages), couleurs mesurées et **contrastes validés au script**, comme R-24 l'exige.
2. **La fusion de `UX_SYSTEM.md` dedans** : les règles de conformité deviennent le
   chapitre « contrôle », pas un document concurrent.
3. **Le retrait de la mention « v0 à valider »** : soit la palette est validée, soit elle
   est remplacée. Une charte provisoire depuis trois mois n'est pas une charte.
4. **Un site reconstruit sur ces jetons**, feuille de style partagée, une seule famille
   typographique de titre, une de texte.
5. **Un contrôle automatique** qui refuse un commit front-end introduisant une couleur hors
   jetons. C'est le seul moyen que R-41 cesse d'être une intention.

**Point d'arbitrage : refonte visuelle ou refonte technique ?** Elles n'ont pas le même
coût ni le même effet, et ma recommandation est de les séparer (voir 7.3).

---

## 6. Projets : les candidats à l'abandon

R-32 est claire : **un abandon se décide et s'écrit.** Ne rien décider n'est pas neutre, ça
laisse 21 dossiers consommer de l'attention sans en rendre.

| Projet | Fait mesuré | Coût de le garder | Coût de l'abandonner |
|---|---|---|---|
| **Livraison Pro** | En ligne, **0 utilisateur réel** depuis le lancement | Hébergement, charge mentale, une ligne de plus dans chaque revue | Un pilier de l'écosystème annoncé publiquement disparaît |
| **Fidelys** | Annoncé dans CONTEXT.md, **aucun livrable, aucun code** | Promesse non tenue à chaque présentation de l'écosystème | Aucun, il n'existe pas. Le retirer du discours coûte zéro |
| **Attractor Assists** | 37 inscrits, **2 onboardings**, 0 abonnement, 1 commande | C'est le produit fondateur et la duplication de Mac Arthur | Abandonner contredit la mission fondatrice |
| **5 dossiers en silence > 21 jours** (XPaye 65 j, Beracca 61 j, Cabinet DAB 60 j, LS Expertise 42 j, Yiriba 32 j) | Aucune initiative de leur part | Ils figurent dans « en jeu » et faussent la vue de l'argent | Il faut l'écrire à chacun, ce qui est inconfortable |
| **7 dossiers sans montant tracé** (C'Real, Vies Croisées, MY NUGO, Romuald Ndoua, XPaye, LS Expertise, Beynaud) | Travail livré, contrepartie jamais écrite | L'agence donne sans savoir combien | Poser la question tard est gênant, ne pas la poser est pire |

**Ma recommandation, et elle est nette :**

- **Fidelys : à retirer du discours immédiatement.** Ce n'est pas un abandon, c'est arrêter
  d'annoncer un produit qui n'a pas une ligne de code. Aucun contre-argument.
- **Livraison Pro : dormant assumé et écrit**, pas supprimé. Zéro utilisateur après un
  lancement, c'est une réponse du marché, pas un manque d'effort. Le garder « en cours »
  coûte plus que ce qu'il rapporte.
- **Attractor Assists : à ne pas abandonner, mais à reformuler.** L'objectif « déployer »
  est atteint et l'objectif réel ne l'est pas. **2 onboardings sur 37 n'est pas un problème
  de produit, c'est un problème de tunnel.** Trancher le sort du produit avant d'avoir
  regardé 3 utilisateurs échouer en direct serait une décision prise sans mesure, donc
  contraire à R-23.
- **Les 5 silencieux : clôture écrite, une par dossier**, avec la phrase qui laisse la porte
  ouverte. R-32 l'impose déjà, elle n'est simplement pas appliquée.
- **Les 7 sans montant : une seule question posée à chacun**, avant toute nouvelle ligne de
  code sur leur dossier.

---

## 7. Les arbitrages soumis à Mac Arthur

### 7.1 Arbitrage 1, la structure de l'équipe d'agents

**Option A, l'élagage (recommandée).** On passe de 27 à 9 agents, par fusion et non par
licenciement, et **les 76 règles du cerveau sont injectées dans chacun**.

| Agent cible | Reprend | Justification |
|---|---|---|
| **CERVEAU** (miroir) | miroir | Le seul actif fort transverse |
| **VENTE** | maquette-closer + devis-express + agent-commercial | La chaîne prouvée, bout en bout |
| **PRODUCTION** | generateur-app-metier + programmeur-senior | Ce qui construit réellement |
| **CONTRÔLE** | gardien + qa-agent + agent-rgpd | Un seul filtre, branché, qui bloque |
| **ARGENT** | comptes + agent-daf + boussole | Un chiffre, un endroit, R-29 |
| **CONTENU** | edito + community-manager + attractor-office + crea-ia | Une cadence ou rien |
| **DA** | directeur-artistique | Gardien des jetons après la refonte |
| **CABINET** | chief-of-staff + chef-de-projet + pilote-rd + pont | Orchestration et registre |
| **VEILLE** | eclaireur + agent-analyste + recherche-actualites | Une veille qui change une décision |
| Supprimés | veille-setup, media-buyer, ambassadeur | Voir ci-dessous |

*Pour :* chaque agent survivant hérite d'un mandat qu'un humain peut vérifier. Neuf agents
qu'on relit valent mieux que vingt-sept qu'on n'ouvre jamais.
*Contre :* on perd la granularité, et deux mandats spécialisés disparaissent
(`media-buyer` le jour où il y aura un budget pub, `ambassadeur` si LinkedIn revient).
*Atténuation :* leurs fichiers partent dans `_archive/`, pas à la poubelle. Les rappeler
coûtera dix minutes.

**Option B, le gel.** On garde les 27, on en marque 13 « dormants » et on n'y touche plus.
*Pour :* zéro travail immédiat. *Contre :* c'est exactement la décision du 12/07, et elle
n'a rien produit en deux mois.

**Option C, le statu quo.** Non défendable au vu de la section 2.

### 7.2 Arbitrage 2, ce qui rend une décision exécutable

Le vrai sujet de cette réunion. Trois décisions sur six du 12/07 sont mortes faute de
déclencheur. Deux voies :

- **Voie du dispositif (recommandée).** Toute décision de cette réunion devient une entrée
  datée avec un porteur et une échéance, et le registre est **écrit par un automatisme en
  fin de session**, pas par une bonne intention. R-28 dit déjà que l'oubli se combat par un
  dispositif.
- **Voie de la discipline.** On s'engage à tenir le registre. C'est ce qui a été décidé le
  12/07, et le registre a gelé 15 jours plus tard.

### 7.3 Arbitrage 3, la profondeur de la refonte

- **Refonte technique seule** (jetons unifiés, feuille partagée, contrôle automatique, site
  reconstruit sur la charte actuelle). Environ une session. L'identité ne change pas.
- **Refonte visuelle complète** (nouvelle direction artistique, nouveau discours, nouvelles
  images). Plusieurs sessions, et elle mobilise la DA, le contenu et la production en même
  temps.

**Ma recommandation : la technique d'abord, la visuelle ensuite.** Refaire l'identité sur un
socle où chaque page redéfinit ses couleurs, c'est refaire le travail deux fois. Et le fait
mesuré de la section 5.1, c'est que l'agence n'a pas de problème de goût, elle a un problème
de source unique.

**Réserve à dire franchement :** le site n'est pas ce qui empêche l'agence d'encaisser. Sur
les deux derniers mois, les leads sont venus du formulaire de diagnostic, et l'argent bloqué
l'est sur des relances non faites, pas sur des visiteurs non convaincus. Une refonte totale
du site est un chantier confortable qui ne touche pas les 2 317 €. Elle vaut la peine, mais
**après** la vague 1 ci-dessous, pas à sa place.

---

## 8. Séquence proposée

| Vague | Contenu | Ce que ça débloque |
|---|---|---|
| **0. Immédiat** | Retirer Fidelys du discours. Supprimer `veille-setup`. Écrire cette réunion au registre | Cohérence |
| **1. L'argent** | Le chiffre unique d'encaissement d'août. Vérifier les 2 abonnements. Clôturer les 5 silencieux. Poser la question aux 7 sans montant | La seule vague qui touche les 2 317 € |
| **2. Les agents** | Fusion 27 vers 9, cerveau injecté dans chaque mandat | Des agents qui appliquent les 76 règles |
| **3. Le dispositif** | Registre automatique, contrôle front-end bloquant | Que les décisions survivent à la séance |
| **4. Le design system** | Jetons unifiés, `UX_SYSTEM` fusionné, contrastes validés au script | Une seule source visuelle |
| **5. Le site** | Reconstruction sur les jetons | Un site tenable, corrigeable une fois |
| **6. La direction artistique** | Si arbitrage 3 va jusque-là | Le nouveau tournant, visible |

---

## 9. Ce qui attend le GO

**Rien n'a été supprimé, fusionné ni archivé.** Les seuls actes de cette séance sont ce
document et les mesures qu'il contient.

Les décisions à rendre, dans l'ordre :

1. Option A, B ou C sur la structure des agents.
2. Voie du dispositif ou voie de la discipline sur l'exécution.
3. Refonte technique seule, ou technique puis visuelle.
4. Confirmation des abandons : Fidelys retiré, Livraison Pro dormant, les 5 silencieux
   clôturés.
5. Attractor Assists : confirmer qu'on regarde 3 utilisateurs échouer avant d'en juger.

---

## 10. À écrire au cerveau après la réunion

Ces trois entrées passent le test des six mois, elles seront proposées à la validation :

- **Expérience :** un répertoire d'agents créé d'un coup ne produit rien. Quatre agents
  portaient l'agence à 15, les quatre mêmes la portent à 27. L'effectif n'a jamais été le
  problème.
- **Règle candidate :** un agent qui ne cite pas le cerveau produit hors des règles. Tout
  mandat d'agent doit ouvrir sur la lecture de `03-REGLES.md`, sinon les règles écrites ne
  s'appliquent nulle part.
- **Règle candidate :** une décision de réunion sans porteur, sans échéance et sans
  déclencheur automatique est un souhait. Deux gels du registre en deux mois le prouvent.
</content>
</invoke>

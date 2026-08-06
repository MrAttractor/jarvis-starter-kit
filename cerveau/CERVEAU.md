# CERVEAU MASTER ATTRACTOR

> Créé le 06/08/2026. Point d'entrée unique de l'intelligence de l'agence.
> Tout ce que l'agence a compris, gagné, raté et débloqué se lit ici.

---

## À quoi sert ce cerveau

Une agence qui ne capitalise pas réapprend les mêmes leçons tous les trois mois. Ce cerveau existe pour une seule raison : **qu'aucune expérience vécue ne se paie deux fois.**

Il fait trois choses :

1. **Il tient la doctrine.** Ce en quoi on croit, comment on vend, comment on construit, ce qu'on refuse.
2. **Il garde les expériences.** Chaque réussite, chaque blocage, chaque déblocage, avec le pourquoi.
3. **Il transforme l'expérience en règle.** Une leçon qui ne devient pas une règle appliquée n'a servi à rien.

---

## Les 3 pièces

| Fichier | Contient | Question à laquelle il répond |
|---|---|---|
| `01-DOCTRINE.md` | vision, méthode, commercial, design, architecture, qualité, agents | « Qu'est-ce qu'on croit et comment on fait ? » |
| `02-EXPERIENCES.md` | fiches réussite / blocage / déblocage, datées et sourcées | « Est-ce qu'on a déjà vécu ça ? » |
| `03-REGLES.md` | règles numérotées, avec leur origine et leur application | « Qu'est-ce que je dois appliquer maintenant ? » |

**Le circuit** : une expérience entre dans `02`, elle est comprise, elle en sort une règle dans `03`, et si elle change la façon de penser de l'agence elle modifie `01`.

```
Vécu → 02-EXPERIENCES → 03-REGLES → (si structurel) → 01-DOCTRINE
```

---

## Protocole de consultation (obligatoire pour Claude et pour tout agent)

**Avant toute production, tout arbitrage, toute réponse à un client :**

1. Lire `03-REGLES.md`. Les règles priment sur l'instinct.
2. Chercher dans `02-EXPERIENCES.md` si un cas comparable existe déjà. Si oui, partir de là, pas de zéro.
3. En cas de doute doctrinal, trancher avec `01-DOCTRINE.md`.

**Ordre de priorité en cas de contradiction :**

```
Décision récente de Mac Arthur  >  03-REGLES  >  01-DOCTRINE  >  02-EXPERIENCES  >  tout le reste
```

Si une contradiction est trouvée, ne pas la contourner en silence : la signaler à Mac Arthur et mettre le cerveau à jour.

---

## Protocole d'alimentation

Le cerveau n'est utile que s'il est nourri. Règles d'entrée :

### Ce qui entre systématiquement

| Événement | Où ça va | Qui l'écrit |
|---|---|---|
| Un client dit oui | fiche dans `02` (réussite) | à la fin de la session |
| Un client dit non ou disparaît | fiche dans `02` (blocage) | à la fin de la session |
| Un bug coûte plus de 2 heures | fiche dans `02` (déblocage) | dès la résolution |
| Mac Arthur corrige une production | règle dans `03` | immédiatement |
| Mac Arthur valide explicitement une approche | règle dans `03` | immédiatement |
| Une décision structurelle est prise | `01` + `decisions-actees.md` | dans la foulée |
| Un livrable est refusé par un client | fiche dans `02` (blocage) | dès le retour |

### Ce qui n'entre pas

- Le détail opérationnel d'une session : ça reste dans `context/HISTORY.md`.
- L'état d'avancement d'un projet : ça reste dans le `DOSSIER.md` du client.
- Les préférences purement personnelles : ça reste dans `context/CONTEXT.md`.

Le test d'entrée est unique : **« Est-ce que ça servira sur un autre dossier dans six mois ? »** Si non, ça n'entre pas.

### Le filtre philosophie

Rien n'entre dans ce cerveau qui contredit la boussole :

> Un bras droit intelligent qui soulage l'entrepreneur et l'aide à devenir n°1 dans son couloir.
> L'utilisateur reste le pilote. Nous restons le copilote.

Une technique qui marche mais qui trahit ça n'a pas sa place ici. On préfère perdre la vente.

---

## Ce que le cerveau branche (sans l'absorber)

| Source externe | Rôle | Chemin |
|---|---|---|
| Journal des sessions | trace chronologique brute | `context/HISTORY.md` |
| Profil fondateur | qui est Mac Arthur, objectifs | `context/CONTEXT.md` |
| Décisions actées | registre daté, tenu par PONT | `livrables/ecosysteme-attractor/attractor-assists/decisions-actees.md` |
| Méthode de consultance | les 3 phases de mission conseil | `livrables/ecosysteme-attractor/METHODE-CONSULTANCE.md` |
| Standards UI/UX | source de vérité front-end | `livrables/ecosysteme-attractor/UX_SYSTEM.md` |
| Dossiers clients | état réel de chaque compte | `livrables/clients/*/DOSSIER.md` |
| Barème tarifaire | prix de référence | `.claude/skills/devis-express/references/bareme.md` |
| Mémoire Claude | rappel automatique en session | `~/.claude/projects/.../memory/` |

---

## Rituel de tenue

| Fréquence | Action | Déclencheur |
|---|---|---|
| Fin de chaque session notable | 1 à 3 fiches dans `02` | `/update` |
| Hebdomadaire | extraction des règles de la semaine dans `03` | rituel du dimanche 21h |
| Mensuel | relecture de `01`, purge des règles mortes, mise à jour de la date | premier dimanche du mois |
| Sur demande | consultation ciblée | `/cerveau [sujet]` |

Une règle qui n'a pas servi depuis six mois et qu'on n'applique plus est retirée, pas gardée par politesse. Un cerveau encombré ne sert plus à décider.

---

## Injection dans le produit

Le cerveau n'est pas un document d'archive, c'est la matière première d'Attractor Assists.

- `03-REGLES.md` alimente le system prompt de l'assistant (partie « base de connaissance fixe »).
- `02-EXPERIENCES.md` alimente les cas concrets que l'assistant peut citer à un entrepreneur.
- `01-DOCTRINE.md` alimente la méthode enseignée dans le produit.

C'est là qu'est l'avantage concurrentiel : le produit s'améliore parce que le fondateur capitalise, pas parce qu'on ajoute des fonctionnalités.

# /morning

> Le brief de pilotage du matin. Refondu le 17/08/2026.
> Avant : une veille d'actualités. Maintenant : l'état réel de l'agence, par priorité.

---

## Ce que cette commande sert, et ce qu'elle refuse de servir

Un brief matinal ne vaut que s'il distingue **ce qui occupe l'agence** de **ce qui la fait
progresser**. Ce sont deux choses différentes, et la première masque la seconde.

Une semaine peut produire un espace de pilotage, deux modules livrés, sept règles au
cerveau, et **zéro euro encaissé, zéro signature**. Un brief qui liste les travaux en
cours affiche une agence très active. Celui-ci doit afficher la vérité.

Règle de conception qui prime sur toutes les autres : **ce brief doit pouvoir dire
« rien n'a bougé cette semaine ».** Un tableau de bord incapable d'annoncer une mauvaise
nouvelle cesse d'être lu au bout de trois jours.

---

## Mission

### Étape 1 : Lire l'état réel, en un seul geste

La source de vérité est le bloc Radar de chaque `DOSSIER.md`. Il n'y en a pas d'autre.
Ne jamais reconstruire l'état depuis `CONTEXT.md` ou `HISTORY.md`, qui sont des récits,
ni depuis Notion.

```bash
grep -H -E "^\| (Statut|Dernier contact|Prochaine action|Échéance|Argent en attente) \|" \
  livrables/clients/*/DOSSIER.md livrables/ecosysteme-attractor/*/DOSSIER.md \
  | sed 's|livrables/[a-z-]*/||; s|/DOSSIER.md||'
```

Un seul appel, environ 29 dossiers. **Ne jamais ouvrir les `DOSSIER.md` en entier** pour
faire un brief : c'est long, coûteux, et le radar suffit.

Si un dossier n'a pas de bloc Radar, le signaler en fin de brief plutôt que de l'ignorer.
Un dossier invisible est un dossier qui meurt.

### Étape 2 : Mesurer ce qui a bougé depuis le dernier brief

```bash
tail -3 context/PROGRESSION.md
git log --since="<date du dernier brief>" --format="%ad %s" --date=short -- livrables/
```

Les radars sont versionnés. Ce que git montre sur `livrables/` depuis le dernier brief
**est** l'activité de la période. Ce qui compte comme progression, en revanche, se
restreint à quatre événements et à eux seuls.

### Étape 3 : Classer

**Ce qui brûle.** Échéance dépassée, ou à trois jours ou moins. En tête, sans exception,
même si c'est inconfortable. Une échéance dépassée reste affichée jusqu'à ce qu'elle soit
traitée ou explicitement repoussée dans le radar.

**On attend qui.** Dossiers où la balle est chez le client, avec le nombre de jours de
silence calculé depuis `Dernier contact`. Seuils :

| Silence | Ce qu'on en dit |
|---|---|
| 7 jours et plus | relance due |
| 14 jours et plus | le dossier est en train de mourir |
| 21 jours et plus | **trancher : relancer une dernière fois, ou fermer et l'écrire** (R-32) |

Et un cas à part, toujours signalé nommément : **le client a relancé le premier.** Quand
c'est lui qui demande où on en est, la balle n'est pas chez lui, elle est chez nous, et
le dossier remonte dans le bloc suivant.

**La balle est chez toi.** Ce que l'agence doit produire, **trié par argent en jeu
décroissant**, pas par ordre d'arrivée ni par plaisir à faire.

**L'avancée réelle.** Uniquement ces quatre événements :

1. un devis signé ou un bon de commande reçu
2. un encaissement
3. une mise en production réelle, visible par le client ou son public
4. un rendez-vous obtenu avec un décideur

**Tout le reste est de l'activité, pas de la progression.** Les fichiers écrits, les
migrations, les refontes, les règles ajoutées au cerveau : ça compte pour l'agence, ça ne
compte pas ici. Si aucun des quatre n'a eu lieu, écrire noir sur blanc **« rien n'a
progressé depuis le [date] »**, et ne rien maquiller par une liste de travaux.

**Le reste à faire.** Une ligne par dossier actif, reprise de `Prochaine action`. Les
dossiers en production sans action en attente ne sont pas listés.

### Étape 4 : Présenter

Format de sortie. Pas d'emoji (R-42), pas de tableau large : ce brief se lit souvent sur
un téléphone en trajet (R-34).

```
BRIEF DU [date]. Dernier brief : [date], il y a [N] jours.

CE QUI BRÛLE
- [dossier] : [quoi], échéance [date] [dépassée de N jours]

ON ATTEND QUI
- [dossier] : [qui], silence depuis [N] jours. [relance due / dossier en train de mourir / à trancher]

LA BALLE EST CHEZ TOI
- [dossier] ([montant en jeu]) : [prochaine action]

L'AVANCÉE RÉELLE DEPUIS LE [date]
- [les quatre événements uniquement, ou « rien n'a progressé »]

LE RESTE À FAIRE
- [dossier] : [une ligne]

CE QUE JE FERAIS AUJOURD'HUI
[Une seule proposition, la plus rentable ou la plus urgente, avec son motif en une phrase.
Une seule. Un brief qui propose trois priorités n'en propose aucune.]
```

Trier les actions par appareil quand c'est pertinent (R-34) : environ 10 heures par
semaine en trajet avec le téléphone seul, ordinateur au midi-deux et le soir. Une action
qui exige l'ordinateur, placée sur un créneau téléphone, n'est pas en retard, elle est
impossible.

### Étape 5 : Écrire la ligne de progression

Ajouter **une ligne** à `context/PROGRESSION.md`, en tête du tableau. C'est ce qui permet
au brief suivant de mesurer l'écart, et c'est la seule chose que cette commande écrit.

```
| AAAA-MM-JJ | [total argent en attente] | [nb dossiers balle chez nous] | [nb en silence 14j+] | [ce qui a progressé, ou « rien »] |
```

### Étape 6 (facultative) : la veille

Uniquement si la commande est lancée avec `veille` en argument (`/morning veille`).
Lancer alors la skill `recherche-actualites`, en trois lignes maximum, **après** le brief
de pilotage et jamais avant.

Motif du changement : la veille était l'objet principal de cette commande, elle est
devenue l'accessoire. S'informer n'a jamais encaissé personne, et une recherche web
matinale coûte plus de temps qu'elle n'en fait gagner.

---

## Règles importantes

- **Ne jamais inventer un statut.** Ce qui n'est pas dans un radar n'existe pas dans le brief. Un radar périmé se signale comme périmé, il ne se comble pas au jugé.
- **Dire la fraîcheur des données.** Si la dernière ligne de `context/PROGRESSION.md` date de trois jours ou plus, le brief l'annonce en tête : `/soir` n'a pas tourné, les radars vieillissent, et ce brief est donc moins fiable qu'il n'en a l'air. Un instrument qui ne sait pas dire qu'il dérive est pire qu'un instrument absent.
- **Ne jamais adoucir.** Un dossier mort se dit mort. Une échéance dépassée se dit dépassée, avec le nombre de jours.
- Une page maximum, hors bloc « reste à faire ».
- Français, pas de tirets longs, pas d'emoji.
- Si plus de trois dossiers sont en silence de 14 jours ou plus, le dire comme un constat d'ensemble et pas seulement dossier par dossier : c'est un problème de rythme de relance, pas une série de coïncidences.

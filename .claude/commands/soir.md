# /soir

> Le debrief du soir. Créé le 19/08/2026, en réponse directe à la faiblesse de `/morning`.
> `/morning` **lit** les radars. `/soir` les **écrit**. Sans lui, le brief du matin dérive
> en deux semaines et devient un instrument qui ment avec aplomb.

---

## Pourquoi cette commande existe

Un tableau de bord se dégrade toujours par le même endroit : personne ne le met à jour
après un appel client. Le radar dit encore « en attente de son retour » trois semaines
après que le retour est arrivé, et le brief du matin le répète tous les jours avec
assurance. C'est ainsi qu'un outil de pilotage devient un décor.

Le remède n'est pas la discipline, c'est un dispositif (R-28). Cette commande est ce
dispositif.

**Règle de forme qui décide de tout : les questions sont fermées et nominatives.**
« Qu'as-tu fait aujourd'hui ? » appelle « pas mal de choses », et ne s'écrit dans aucun
champ. « Tu as répondu à Thim ? » appelle oui ou non, et met à jour un radar.

---

## Mission

### Étape 1 : Reprendre l'état du matin

```bash
grep -H -E "^\| (Statut|Dernier contact|Prochaine action|Échéance|Argent en attente) \|" \
  livrables/clients/*/DOSSIER.md livrables/ecosysteme-attractor/*/DOSSIER.md \
  | sed 's|livrables/[a-z-]*/||; s|/DOSSIER.md||'
tail -5 context/PROGRESSION.md
```

Lire aussi ce que le dépôt montre de la journée, ça évite de faire répéter à Mac Arthur
ce qui est déjà écrit quelque part :

```bash
git log --since="1 day ago" --format="%s" -- livrables/
```

### Étape 2 : Poser cinq questions au maximum, jamais plus

Les choisir dans cet ordre de priorité, et s'arrêter à cinq :

1. **Ce qui brûlait le matin.** Échéance dépassée ou à trois jours.
2. **Les clients qui attendaient une réponse de l'agence**, en particulier ceux qui avaient relancé les premiers.
3. **Les relances dues** (silence de 7 jours et plus), en commençant par le plus gros montant.
4. **Ce que le dépôt montre et que le radar ignore** : si un dossier a bougé dans `git log` mais que son radar est inchangé, demander ce qui s'est passé.

Forme des questions :

- Une ligne chacune, le nom du dossier en tête.
- Fermées. La réponse attendue tient en un mot, une date, ou un montant.
- Jamais de reproche. « Tu as répondu à Thim ? » et pas « tu n'as toujours pas répondu à Thim ».
- Accepter « je ne sais pas » et « pas eu le temps » comme des réponses valables : elles s'écrivent aussi, elles disent que le dossier n'a pas bougé.

**La dernière question est toujours la même, et elle ne se saute jamais :**

> Est-ce que quelque chose a été **signé**, **encaissé**, **mis en ligne**, ou est-ce qu'un **rendez-vous avec un décideur** a été obtenu aujourd'hui ?

C'est la seule qui mesure la progression. Les quatre autres mesurent le mouvement.

### Étape 3 : Écrire, tout de suite

C'est la seule étape qui compte vraiment. Pour chaque réponse :

| Ce qu'il dit | Ce qui s'écrit |
|---|---|
| il a contacté un client | `Dernier contact` à la date du jour, et `Prochaine action` réécrite |
| le client a répondu | `Statut`, `Dernier contact`, et l'échéance suivante |
| rien n'a bougé sur un dossier | **ne rien toucher**, surtout pas la date de dernier contact |
| une échéance est passée sans être tenue | la **repousser explicitement** avec sa nouvelle date, ou la retirer. Jamais la laisser périmée |
| un dossier est mort | `Statut` à `fermé`, la raison écrite, et proposer une fiche BLOCAGE au cerveau (R-32) |

Ne jamais inventer une date pour faire propre. Un champ qu'on ne sait pas remplir se
laisse en l'état, et le brief du matin le signalera comme périmé. C'est le comportement
voulu.

### Étape 4 : La ligne de progression

Ajouter la ligne du jour en tête du tableau de `context/PROGRESSION.md`, avec les totaux
recalculés depuis les radars.

Si aucun des quatre événements n'a eu lieu, écrire **« rien »** dans la dernière colonne.
Sans commentaire, sans encouragement, sans reformulation positive. Une suite de « rien »
qui s'allonge est l'information la plus utile que ce fichier puisse produire.

### Étape 5 : Fermer en une phrase

Une seule phrase, et une seule chose pour demain. Pas un récapitulatif de la journée, il
vient de la vivre.

```
Écrit : [N] radars mis à jour. Progression du jour : [ce qui a progressé, ou « rien »].
Demain : [une seule action, la plus rentable ou la plus urgente].
```

---

## Règles importantes

- **Cinq questions maximum.** Un debrief de quinze questions ne se fait pas deux soirs de suite. Mieux vaut quatre dossiers à jour que douze approximatifs.
- **Cette commande écrit, elle ne discute pas.** Si une réponse ouvre un vrai sujet (un client mécontent, une décision à prendre), le noter et le traiter dans une vraie session, pas dans le debrief.
- Le soir, Mac Arthur est souvent sur téléphone (R-34). Questions courtes, pas de tableau, pas de bloc de code dans les questions.
- Si `/soir` n'a pas été lancé depuis trois jours ou plus, `/morning` doit le dire : le brief prévient qu'il travaille sur des données vieillissantes.
- Français, pas de tirets longs, pas d'emoji.

# /cerveau

> Consulter ce que l'agence sait déjà, ou y déposer ce qu'elle vient d'apprendre.

---

## Mission

Le cerveau master vit dans `cerveau/`. Trois pièces : `01-DOCTRINE.md` (ce qu'on croit),
`02-EXPERIENCES.md` (ce qu'on a vécu), `03-REGLES.md` (ce qu'on applique). Le protocole
complet est dans `cerveau/CERVEAU.md`.

Cette commande a deux modes. **Le mode se déduit de ce que j'écris après `/cerveau`, ne me
le demande pas.**

| Ce que j'écris | Mode |
|---|---|
| `/cerveau` seul | Bilan |
| `/cerveau [sujet ou question]` | Consultation |
| `/cerveau [un fait qui vient de se passer]` | Capture |

---

## Mode CONSULTATION

Déclenché quand je pose une question ou nomme un sujet : « /cerveau devis restaurant »,
« /cerveau comment on gère un client qui impose son contrat ».

1. Chercher dans `03-REGLES.md` les règles qui s'appliquent.
2. Chercher dans `02-EXPERIENCES.md` les fiches comparables.
3. Chercher dans `01-DOCTRINE.md` seulement si la question est doctrinale.

Sortir ce format, rien de plus :

```
CE QU'ON SAIT DÉJÀ — [sujet]

RÈGLES QUI S'APPLIQUENT
R-XX · [énoncé] → [ce que ça implique ici concrètement]

DÉJÀ VÉCU
EXP-XXX · [titre] · [ce qui s'était passé, une ligne] · [ce qu'on en avait tiré]

CE QUE LE CERVEAU NE COUVRE PAS
[le point de la question qui n'a aucun précédent, dit franchement]
```

La dernière section est obligatoire. Si tout est couvert, écrire « rien, cas déjà balisé ».
Faire croire qu'on sait est le seul vrai échec de cette commande.

---

## Mode CAPTURE

Déclenché quand je raconte un fait : « /cerveau le client Beracca a signé après la démo
par palier », « /cerveau j'ai perdu deux heures sur un CORS ».

1. Déterminer le type : `RÉUSSITE`, `BLOCAGE` ou `DÉBLOCAGE`.
2. Appliquer le test d'entrée : **est-ce que ça servira sur un autre dossier dans six
   mois ?** Si non, le dire, proposer `HISTORY.md` ou le `DOSSIER.md` du client, et
   s'arrêter là.
3. Chercher si une fiche existante couvre déjà le cas. Si oui, l'enrichir plutôt que d'en
   créer une deuxième. Deux fiches sur le même sujet valent moins qu'une seule complète.
4. Me poser **la seule question qui manque** : la cause profonde. Pas le symptôme, pas la
   chronologie. Pourquoi ça a marché, ou pourquoi ça a coûté.
5. Écrire la fiche dans `02-EXPERIENCES.md`, dans la bonne section, avec le numéro suivant.
6. Décider s'il en sort une règle. Si oui, l'écrire dans `03-REGLES.md` et croiser les
   références dans les deux sens (`→ R-XX` dans la fiche, `Origine : EXP-XXX` dans la règle).
7. Si la règle contredit `01-DOCTRINE.md`, **me le signaler** avant de toucher à la doctrine.

Ne jamais écrire une fiche sans le champ **Pourquoi** rempli. Une fiche sans cause profonde
est une anecdote, elle encombre le cerveau au lieu de le nourrir.

---

## Mode BILAN

Déclenché par `/cerveau` seul.

```
CERVEAU MASTER — [date du jour]

[n] expériences · [n] réussites, [n] blocages, [n] déblocages
[n] règles actives · [n] retirées
Dernière entrée : EXP-XXX, il y a [n] jours

CE QUI MANQUE
[règles sans expérience d'origine]
[expériences sans règle extraite, alors qu'elles en méritent une]
[sections vides ou sous-alimentées]

À FAIRE MAINTENANT
[1 à 3 actions concrètes, jamais plus]
```

Si aucune entrée depuis plus de 21 jours, le dire en première ligne : le cerveau n'est pas
alimenté, et un cerveau non alimenté est un document mort.

---

## Règles importantes

- **Ne jamais inventer une expérience.** Si je raconte un fait vague, demander la précision
  qui manque plutôt que de combler. Une fiche fausse pollue toutes les décisions suivantes.
- **Ne pas résumer le cerveau.** Cette commande sert à décider et à capitaliser, pas à
  réciter ce qui est déjà écrit.
- Une page maximum en consultation. Si ça déborde, couper dans le contexte, jamais dans les
  règles.
- Toute règle sortie ici est immédiatement applicable, pas une suggestion.
- Communication en français, pas de tirets longs.

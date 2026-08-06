# /radar

> La vue unique de tout ce qui est en cours. Ce qui dort, ce qui arrive, ce qui n'est pas encaissé.

---

## Mission

Quand je lance `/radar`, tu lis les blocs Radar de tous les dossiers, tu calcules le temps
écoulé, et tu me sors **ce qui demande une décision maintenant**. Rien d'autre.

Le principe : **je n'ai rien à tenir à jour à la main.** Les fiches sont la source, cette
vue est calculée. Si les deux se contredisent, la fiche gagne.

---

## Étape 1 : Ramasser les blocs Radar

Chaque dossier porte un bloc en tête de son `DOSSIER.md`, dans ce format exact :

```
| Radar | |
|---|---|
| Statut | attente client |
| Dernier contact | 2026-08-04 |
| Prochaine action | Relancer si sa signature n'arrive pas |
| Échéance | 2026-08-11 |
| Argent en attente | 2 050 € |
```

Ramasse-les en **une seule passe** avec l'outil Grep (pas `grep` en shell, il est lent sur
ce disque) :

- pattern : `^\| (Statut|Dernier contact|Prochaine action|Échéance|Argent en attente) \|`
- glob : `**/DOSSIER.md`
- path : `livrables`
- output_mode : `content`, avec `-n`

Ajoute `livrables/clients/air-cote-divoire/VSD.md`, qui porte le même bloc sous un autre
nom de fichier.

Lis aussi les tableaux `## Chantiers ouverts` quand il y en a : ce sont des projets sans
dossier propre, et sans cette lecture ils n'apparaissent nulle part.

## Étape 2 : Calculer

Pour chaque dossier, à partir de la date du jour :

- **Jours de silence** = aujourd'hui moins `Dernier contact`
- **Jours restants** = `Échéance` moins aujourd'hui (ignorer si `—`)

Les statuts possibles sont : `en cours`, `attente client`, `à relancer`, `à trancher`,
`en production`, `bloqué`, `en pause`, `infrastructure`.

**Exclure de toutes les alertes** les statuts `infrastructure`, `bloqué` et `en pause` :
le premier n'est pas un dossier, le deuxième est gelé en attendant une condition
extérieure, le troisième a été mis de côté par décision. Les compter à part, sans les
détailler.

**`en pause` n'est pas `bloqué`.** Un dossier bloqué attend quelque chose qui viendra
peut-être. Un dossier en pause a été écarté volontairement, et sa fiche porte les
conditions écrites de sa reprise. Ne jamais le faire remonter tant qu'aucune n'est
remplie : c'est tout l'intérêt de la décision.

## Étape 3 : Sortir la vue

Format exact, dans cet ordre. **Une ligne par dossier, jamais de paragraphe.**

```
RADAR — [date du jour]

URGENT — échéance sous 7 jours ou dépassée
[dossier] · [échéance] · J-[n] ou DÉPASSÉ de [n]j · [prochaine action]

ÇA DORT — silence de plus de 21 jours
[dossier] · [n]j de silence · [prochaine action]

ARGENT NON ENCAISSÉ
[dossier] · [montant] · [prochaine action]

À TRANCHER — décision qui n'appartient qu'à toi
[dossier] · [prochaine action]

ANGLES MORTS
[dossiers sans bloc Radar, sites en ligne sans dossier, fiches non révisées depuis 30j]

Le reste : [n] dossiers actifs sans alerte, [n] gelés, [n] d'infrastructure.
```

Règles de tri :
- **URGENT** en premier, du plus proche au plus lointain, les dépassés tout en haut
- **ÇA DORT** du plus ancien au plus récent. Au-delà de **45 jours**, préfixer la ligne de `!!` : ce dossier n'est plus en attente, il est perdu si rien ne bouge
- Un dossier peut apparaître dans deux sections. C'est voulu, ça veut dire qu'il cumule.
- Si une section est vide, écrire « rien » sur une ligne, ne pas la supprimer

## Étape 4 : Le contrôle des angles morts

C'est ce contrôle qui a retrouvé C'Real, Rukayatou et XPaye le 06/08/2026. **Le refaire à
chaque fois**, c'est le seul qui trouve ce que personne ne cherche.

1. Lister les dossiers de `livrables/clients/demo-site/public/`
2. Les comparer aux dossiers de `livrables/clients/`
3. Signaler tout site en ligne sans dossier client, en ignorant les outils de l'agence :
   `demo`, `diagnostic`, `pilotage`, `pilote`, `cockpit`, `commander`, `onboarding`,
   `proposition`, `template-executive-edu`
4. Signaler tout `DOSSIER.md` sans bloc Radar
5. Signaler toute fiche dont la ligne de révision date de plus de 30 jours

## Étape 5 : Régénérer la vue transverse

Réécris `livrables/ecosysteme-attractor/PROJETS-EFFECTIFS.md` à partir de ce que tu viens
de calculer, en gardant sa structure actuelle (pipeline commercial, constats, projets
internes, objectif). **Ce fichier est une sortie, plus une saisie** : ne jamais y écrire
un chiffre qui ne vient pas d'une fiche.

---

## Règles importantes

- **Ne jamais inventer une date.** Si `Dernier contact` est `—`, écrire « date inconnue »
  et le mettre dans les angles morts. Une date supposée est pire que pas de date.
- **Ne pas résumer les dossiers.** Cette commande sert à décider quoi rouvrir, pas à
  raconter. Le détail est dans la fiche.
- Une page maximum. Si ça déborde, couper dans les sections calmes, jamais dans URGENT.
- Quand je réponds à un client ou que quelque chose bouge sur un dossier, **mets à jour le
  bloc Radar de sa fiche dans la foulée**, sans attendre que je le demande.
- Communication en français, pas de tirets longs.

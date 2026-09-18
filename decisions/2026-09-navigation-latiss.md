# Décision — Latiss passe d'un fil unique à trois onglets

> Ce dossier est l'**entrée unique** de l'avocat du diable. Il est gelé avant la relecture :
> on ne le modifie plus tant que le contre-audit n'est pas rendu.

**Date de gel :** 2026-09-18
**Auteur :** Mac Arthur
**Portée :** l'espace fan de la plateforme Latiss (ex-Beynaumania), `public/beynaud/fan.html`
**Échéance :** le concert du 5 décembre 2026. Après le lancement, une refonte de navigation
se paie en habitudes prises, pas en jours de travail.

---

## 1. La décision, en trois phrases maximum

L'espace fan abandonne le fil unique qu'on déroule et passe à **trois onglets en barre
basse : Le Club à gauche, Latiss au centre, Live à droite**, l'application ouvrant par
défaut sur Latiss. L'onglet Latiss porte une rangée de reels qui se fait défiler du doigt
au-dessus du fil des publications. L'onglet Live n'est **jamais fermé ni grisé** : au repos
il affiche le prochain rendez-vous et les replays.

---

## 2. Pourquoi celle-là

Le moteur de croissance de la plateforme est le parrainage, et il **n'a aujourd'hui aucun
endroit à lui** : le grade, le lien personnel et le classement sont entassés dans une carte
repliée en haut du fil, sous une pastille. On demande à un fan de recruter sans lui donner
une page où recruter.

Le 5 décembre arrive avec un direct payant, des replays et une billetterie. **Il n'existe
aucune place pour les mettre.** Les ajouter au fil unique reviendrait à noyer l'événement
qui doit rapporter de l'argent au milieu des photos.

Raison non technique, et elle compte : la refonte coûte environ trois jours **aujourd'hui,
avec 9 membres**. Après un lancement devant 10 millions d'abonnés, elle coûte le double et
casse les habitudes de gens qu'on vient d'acquérir.

---

## 3. Les alternatives écartées

| Option | Pourquoi écartée |
|---|---|
| **Garder le fil unique et ajouter une barre de filtres** (Tout / Photos / Vidéos / Sondages) | Une journée de travail, mais ça repousse le problème : à trois mois de contenu, filtrer « Photos » donne encore un fil infini. Et ça ne crée toujours aucune place pour le parrainage ni pour le direct payant. |
| **Le fil plus un tiroir latéral** | Deux jours. Ce qui est rangé dans un tiroir n'est pas consulté, et on y mettrait justement le classement des Ambassadeurs, c'est-à-dire le moteur de recrutement. |
| **Remplacer le fil par un défilement horizontal** (proposé le 18/09) | On perd le sens de « combien il y en a », et les sondages, commentaires et messages s'y prêtent mal. Retenu seulement pour la rangée de reels, en haut de l'onglet Latiss. |
| **Une application native** | Deux bases de code à maintenir, aucune amélioration de la montée en charge qui est côté serveur, et plusieurs jours de validation Google à chaque correction. |

---

## 4. Les hypothèses sur lesquelles ça repose

- **Volume attendu au lancement :** 10 000 à 30 000 visiteurs sur la première heure, estimés
  à partir de ~10 M d'abonnés cumulés, 10 % de portée et 1 à 3 % de clics. Pic autour de
  200 ouvertures par seconde.
- **Capacité mesurée le 18/09 :** ~1 000 ouvertures par seconde depuis la mise en cache du
  fil public, contre 55 avant. Le plafond n'est plus la contrainte.
- **Base installée au moment du gel :** 9 membres, dont **3 avec un numéro WhatsApp** et
  2 abonnés aux notifications. Donc presque aucune habitude à casser, et presque aucun
  moyen de recontacter qui que ce soit.
- **Latence tolérée :** moins de 400 ms pour l'ouverture d'un onglet sur une 3G ivoirienne.
  L'appel du fil coûte 23 ms en cache, 2 380 ms hors cache.
- **Poids des médias :** photos ramenées de 211 Ko à ~54 Ko et servies par Cloudflare depuis
  le 17/09. Un onglet de plus n'ajoute pas de sortie réseau.
- **Fiabilité supposée des tiers :** Cloudflare Pages pour le site et le cache, Supabase en
  forfait **gratuit et partagé avec 8 autres clients**, YouTube pour les vidéos publiques.
- **Compétence disponible :** une seule personne maintient ce code. Toute structure qui
  demande deux personnes pour être tenue est hors d'atteinte.

---

## 5. Ce qui se passe si on s'est trompé

**On s'en aperçoit comment, et au bout de combien de temps ?**
Sur l'usage des onglets, et il n'existe **aucune mesure d'usage aujourd'hui** : ni compteur
de vues par onglet, ni journal de navigation. En l'état, on ne le saurait que par les
plaintes, ou par le fait que le parrainage ne décolle pas, donc avec plusieurs semaines de
retard.

**On en sort comment, et en combien de temps ?**
Le fil unique reste techniquement possible : la barre d'onglets se retire en masquant un
bloc, et l'onglet Latiss redevient l'écran entier. Environ une demi-journée. Ce qui ne se
défait pas, c'est ce qu'on aura publié entre-temps dans Le Club et dans Live, qui n'aurait
plus de place.

**Ce que ça coûte :** environ trois jours de travail, plus la re-génération des captures du
Play Store, plus le risque de retarder le contenu de démarrage qui attend déjà.

---

## 6. Où regarder

- Fichiers concernés : `livrables/clients/demo-site/public/beynaud/fan.html` (l'espace fan,
  écran unique aujourd'hui), `livrables/clients/demo-site/public/beynaud/app.html` (l'espace
  de Serge), `livrables/clients/demo-site/functions/beynaud/api/feed.js` (le cache du fil).
- Commit gelé : **`047d71d`**
- Ce qui est déjà testé : contraste et zones de tap sur 6 résolutions
  (`livrables/clients/beynaud-star-factory/recette-theme.js`, verdict OK contre la
  production le 18/09) ; le cache du fil et l'absence de fuite entre membres ; le compteur
  de parrainage sous 12 inscriptions simultanées.
- Ce qui n'est pas testé et qu'on sait : **aucun test de navigation entre onglets**, aucun
  test sur un vrai téléphone, aucune mesure d'usage. Le registre de dette du dossier client
  liste 7 dettes encore ouvertes, dont l'absence totale de sauvegardes et le concours
  d'Ambassadeur truquable.

---

## 7. Arbitrage — rempli APRÈS la relecture adverse

| # | Trouvaille | Gravité | Verdict | Motif | Qui / Quand |
|---|---|---|---|---|---|
| 1 | | | Retenu / Écarté / Différé | | |
| 2 | | | | | |

**Règle :** aucune trouvaille ne sort du tableau sans un motif écrit.
« Écarté » sans motif se lit « ignoré », et c'est exactement ce qu'on cherche à éviter.
Les trouvailles BLOQUANTES retenues se règlent avant le lancement, sans exception.

# Décision — Latiss passe d'un fil unique à trois onglets

> Ce dossier est l'**entrée unique** de l'avocat du diable. Il est gelé avant la relecture :
> on ne le modifie plus tant que le contre-audit n'est pas rendu.

**État au 19/09/2026 :** la décision est **appliquée et en service**. Mac Arthur a validé les
trois onglets et fait supprimer la version à fil unique. Les trouvailles 1, 2, 5 et 7 sont
traitées (grade vérifié côté serveur, droit d’accès séparé du grade, onglets sans changement
de chemin, reels bâtis sur l’existant). **La trouvaille 3 reste ouverte et bloquante** : le
chemin d’écriture n’est toujours ni caché ni mesuré au-delà de 12 appels simultanés.
Verdict et Motif du tableau restent à remplir par Mac Arthur.

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

> Contre-audit rendu le 18/09/2026 par l'avocat du diable, en contexte neuf.
> Chaque trouvaille a ensuite été vérifiée dans le code, et pour la n°3 démontrée
> en production. Verdict et Motif restent à remplir par Mac Arthur.

| # | Trouvaille | Gravité | Verdict | Motif | Qui / Quand |
|---|---|---|---|---|---|
| 1 | **Le grade revendiqué n'est jamais vérifié.** `bey-public` lit `grade` dans le corps de la requête et retire le filtre si la valeur vaut `ambassadeur`. Un appel anonyme voit tout le contenu réservé. **Démontré en production** : contenu de test réservé, lu sans compte, en une commande | **BLOQUANT — CONFIRMÉE** | Retenu / Écarté / Différé | | |
| 2 | **Aucun niveau d'accès où poser du payant.** Deux grades seulement, et le second s'obtient gratuitement en 5 auto-parrainages (D-06 ouverte). De plus `launchLive` écrit `grade_requis:'membre'` en dur : un direct **ne peut pas** être réservé aujourd'hui | **BLOQUANT — CONFIRMÉE** | | | |
| 3 | **Le chemin d'écriture n'est pas couvert par le cache et n'a jamais été mesuré au-delà de 12 appels simultanés.** `join` part en direct sur Supabase, dont le genou mesuré est à 55 appels/seconde, alors que le pic attendu est de 200 | **BLOQUANT — CONFIRMÉE**, mécanisme nuancé : le verrou de ligne n'est pas le goulot, un `update` d'une ligne est rapide ; le goulot est le débit de la fonction et de la base | | | |
| 4 | **L'échéance qui justifie l'urgence n'est pas acquise.** Protocole non signé, aucune réponse de Latiss depuis le 10/08, et ce dossier de décision n'en dit pas un mot | **MAJEUR — CONFIRMÉE** | | | |
| 5 | **`ambLink()` dérive du chemin courant** (`fan.html:863`). Un routage d'onglets par chemin casserait tous les liens de parrainage déjà partagés | **MAJEUR — CONFIRMÉE**, conditionnelle : ne se déclenche que si les onglets changent le chemin, ce qui n'est pas encore décidé | | | |
| 6 | **Les vignettes de reels viennent de `i.ytimg.com`** (`fan.html:1826`) et échappent à la fonction Cloudflare : 8 reels ajoutent 200 à 280 Ko à l'écran d'ouverture. Contredit l'hypothèse « un onglet de plus n'ajoute pas de sortie réseau » | **MAJEUR — CONFIRMÉE** | | | |
| 7 | **La sortie « en une demi-journée » serait fausse** si la rangée de reels demande un nouveau type de contenu en base, dans l'espace de Serge et dans `bey-public` | **MAJEUR — NON CONFIRMÉE.** Le lecteur détecte déjà le format vertical dans l'adresse (`/shorts/`), sans champ en base : la rangée peut se construire sur les `type:'serie'` existants, sans migration ni changement serveur. Reste vraie **si** on choisit d'introduire un type `reel`, ce qui n'est pas la conception retenue | | | |

**Règle :** aucune trouvaille ne sort du tableau sans un motif écrit.
« Écarté » sans motif se lit « ignoré », et c'est exactement ce qu'on cherche à éviter.
Les trouvailles BLOQUANTES retenues se règlent avant le lancement, sans exception.

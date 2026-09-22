# Refonte agenceattractor.com — audit, score et plan

> Document unique du chantier. Un chiffre ou un constat n'existe qu'ici.
> Ouvert le 22/09/2026. Tout est mesuré en ligne le jour même, rien n'est estimé.

---

## 1. Ce qui a été mesuré, et comment

| Quoi | Méthode | Date |
|---|---|---|
| Site en ligne | requêtes HTTP réelles sur `agenceattractor.com`, code de retour et poids octet par octet | 22/09/2026 |
| Code source | lecture du `index.html` livré (87 Ko) et des 8 autres pages du dossier | 22/09/2026 |
| Référencement | test de `robots.txt`, `sitemap.xml`, balises structurées, redirections, page 404 | 22/09/2026 |
| Références | `cpcoachingmental.com` et `heromental.fr`, structure et palette relevées dans leur code | 22/09/2026 |
| Présence existante | recherche sur le nom de marque et sur l'ancien domaine | 22/09/2026 |

---

## 2. La découverte qui change le plan : tu as déjà un site de coach, et il est mort

`mr-attractor.fr` **existe toujours dans l'index de Google**, avec au moins quatre pages référencées :

| Page indexée | Titre tel que Google l'affiche |
|---|---|
| `/` | Coach en Business en Île-de-France - Mr Attractor |
| `/coaching/` | Coaching en Business pour Dirigeant et Entrepreneur à Noisy-le-Grand |
| `/formation/` | Formation pour Dirigeant et Entrepreneur près de Paris - Mr Attractor |
| `/methodologie/` | Accompagnement pour Dirigeant et Entrepreneur à Noisy-le-Grand |
| `/contact/` | Contactez-moi au 07 53 90 23 23 - Mr Attractor |

**Ce sont exactement les quatre questions que tu veux que Google comprenne** : qui tu es (coach), ce que tu fais (coaching, formation, accompagnement), qui tu accompagnes (dirigeants et entrepreneurs), où tu exerces (Noisy-le-Grand, près de Paris, Île-de-France).

**Et le domaine ne répond plus rien.** Mesuré : `https://www.mr-attractor.fr/` renvoie un HTTP 200 de **34 octets**, contenant le seul texte `<br><center><b>www.mr-attractor.fr`. Ni titre, ni H1, ni contenu. C'est une page de parking d'hébergeur.

Conséquence : **Google affiche encore ces titres dans ses résultats, mais l'internaute qui clique tombe sur une page blanche.** À chaque passage du robot, la probabilité que ces pages soient désindexées monte. Il y a là un actif en train de fondre, et c'est précisément l'actif du positionnement que tu veux reprendre.

**Trois options, à trancher (voir §8).** Aucune n'est neutre, et c'est la première décision du chantier, avant même la première ligne de code.

---

## 3. Le score de l'existant : 29 / 100

Six axes, chacun noté sur 20, chaque note appuyée sur une mesure.

| Axe | Note | Ce qui la justifie |
|---|---|---|
| A. Lisibilité par Google | **4 / 20** | `robots.txt` → 404. `sitemap.xml` → 404. **Zéro balise de données structurées** (aucun `Person`, `LocalBusiness`, `Service`, `FAQPage`). Un seul H1, 7 H2, sur une page unique. Aucune page ne cible une requête autre que « app métier ». |
| B. Clarté en 5 secondes | **6 / 20** | H1 : « Ton activité, clarifiée et *outillée.* » Abstrait. Le hero parle de « WhatsApp qui déborde et commandes perdues », un problème d'outillage, pas d'alignement. **Tu n'apparais qu'à l'étape 3 du processus**, alors que sur un site de coach la personne est le produit. |
| C. Preuve et confiance | **11 / 20** | Solide : 25+ entrepreneurs, 4 cas clients avec logos et liens vivants, 2 témoignages nommés. Manquant : aucun visage client, aucun résultat chiffré avant/après, **aucune certification affichée**, aucune page « qui je suis », aucune mention de l'ancienneté. « Garantie ROI 30 jours » et « 80% de tâches automatisées » sont des affirmations sans source : elles fatiguent au lieu de rassurer. |
| D. Conversion | **9 / 20** | Le mécanisme est bon : un seul type d'appel à l'action, le diagnostic gratuit, répété 9 fois. Mais **aucune prise de rendez-vous en ligne** : le visiteur convaincu à 23h n'a aucun créneau à cliquer. Le diagnostic est hébergé sur un autre domaine (`demo.agenceattractor.com`), ce qui casse la continuité et disperse le référencement. |
| E. Performance et mobile | **3 / 20** | **9,2 Mo d'images sur la seule page d'accueil**, dont `mac-arthur.jpg` à **5,8 Mo** pour une vignette. **Zéro `loading="lazy"`.** Sur un forfait mobile à Abidjan, c'est plusieurs dizaines de secondes et de la data payée pour rien. Le `cursor:none` sur le `body` remplace le curseur système. Dépendance à `unpkg.com` en `@latest`, non versionnée. |
| F. Ancrage local | **2 / 20** | Aucune mention de ville, de département ou de zone dans les balises. Aucun `LocalBusiness`. Pendant ce temps, l'ancien domaine mort tient le terrain sur « Noisy-le-Grand » et « près de Paris ». |

**Total : 35 / 120, soit 29 / 100.**

### Ce qui marche déjà et qu'il ne faut pas casser
- `www` → apex en redirection 301 propre, canonical cohérent, HTTPS, page 404 qui renvoie un vrai 404.
- Les métadonnées de partage (Open Graph, Twitter) sont complètes : un lien collé dans WhatsApp s'affiche correctement.
- Les cas clients pointent vers des applications **réellement en ligne**. C'est la preuve la plus forte du site, et elle est sous-exploitée.
- Le suivi d'événements (`data-track`) est déjà posé partout. La mesure existe, il faudra juste la rebrancher.

### Un point de conformité, pas de référencement
Le pixel Facebook se déclenche **dès l'arrivée, sans aucun bandeau de consentement** (vérifié : le mot « cookie » n'apparaît nulle part dans la page). Tant que la cible était ivoirienne, le sujet était théorique. **Dès lors que tu vises l'Île-de-France, il ne l'est plus.**

---

## 4. Pourquoi ce site n'a rapporté aucun lead

Quatre causes, dans l'ordre d'importance. Aucune n'est un problème de design.

1. **Google ne peut pas te trouver pour ce que tu veux vendre.** Le titre de la page dit « Ton app métier, prête en 7 jours ». Google en déduit : agence de développement d'applications. Un prospect qui cherche un coach ne tapera jamais cette requête. Il n'y a aucun malentendu, le site range exactement ce qu'on lui a demandé de ranger.
2. **Un site d'une seule page ne peut se positionner que sur un seul sujet.** Les huit autres fichiers sont des outils (diagnostic, commande, ebook, radar), pas des pages de contenu. Tu as donc **une seule chance de te positionner**, et elle est dépensée sur « app métier ».
3. **Le visiteur qui arrive ne se reconnaît pas.** Il lit une promesse d'outillage. Celui que tu veux attirer ne cherche pas un outil, il cherche quelqu'un qui comprenne pourquoi il tourne en rond. Ce sont deux douleurs différentes, et deux personnes différentes.
4. **Le site est trop lourd pour être vu.** 9,2 Mo, sans chargement différé. Une part des visiteurs ferme avant que la première image ne s'affiche, et cette part ne se voit dans aucune statistique de conversion.

---

## 5. Ce que les deux références ont en commun, et ce qu'il faut en retenir

**Point à connaître avant de s'en inspirer :** `cpcoachingmental.com` **a été construit par `heromental.fr`.** Le crédit est dans son pied de page (« Crédit — Hero Mental 2026 »), et Philippe figure parmi les trois cas clients affichés sur le site de Hero Mental. Les deux sites que tu as repérés sont donc **le même moule**, vu une fois côté vitrine et une fois côté agence.

Deux conséquences.

**La première est utile :** tu n'as pas à deviner la structure, tu la tiens en double exemplaire, avec la preuve qu'elle est vendue comme un produit.

**La seconde mérite une conversation :** Hero Mental fait exactement ce que fait ton agence, sur une niche (les préparateurs mentaux français) que ta certification du 3 septembre te permet d'approcher de l'intérieur. À traiter à part, ce n'est pas le sujet de cette refonte.

### La structure commune, dans l'ordre

| # | Bloc | Rôle | Chez CP Coaching | Chez Hero Mental |
|---|---|---|---|---|
| 1 | Accroche | dire la transformation, pas le métier | « Le mental, c'est la *seconde* de moins » | « On construit. Tu performes. » |
| 2 | Pour qui | le visiteur se range dans une case | 4 profils (pilotes moto, auto/karting, jeunes 8-18, écuries) | préparateurs mentaux, coachs sportifs, sophrologues |
| 3 | Ce que tu vis | **6 situations concrètes**, à la première personne | stress d'avant-course, peur après la chute, budget, pression familiale | « Tu n'oses même pas montrer ton site » |
| 4 | Qui je suis | la légitimité, en chronologie | champion 1987, 20 ans de circuits, bascule en 2020 | « par des préparateurs mentaux » |
| 5 | La méthode | nommer les outils, les rendre tangibles | 5 outils nommés (Dépolarisation®, imagerie motrice…) | 4 arguments |
| 6 | Terrain / preuve | la présence physique vérifiable | 6 championnats nommés, une écurie | 3 cas clients nommés, 15+ villes |
| 7 | Contenu gratuit | rester dans le paysage sans vendre | podcast « Brain On Track » | — |
| 8 | Étude de cas chiffrée | la transformation en chiffres | −1.2″ → −0.3″ au pôle, confiance 2/10 → 8/10 sur 8 mois | « 2 RDV générés en 48h » |
| 9 | Témoignages | 4 avis nommés | oui | oui |
| 10 | Processus | lever la peur de l'inconnu | — | 4 étapes en 2 semaines |
| 11 | Zone | répondre à « où ? » | « 100 % visio, France et Europe », base Tarbes · 65 | France entière |
| 12 | FAQ | traiter les objections **et nourrir Google** | 9 questions | 6 questions |
| 13 | Contact | qualifier avant d'appeler | statut, âge, discipline, niveau | prénom, rôle, spécialité, ville, site actuel, objectifs |

### Les trois mécaniques à copier, et une à ne pas copier

**À copier.**
1. **Le bloc « ce que tu vis » en six phrases à la première personne.** C'est là que le visiteur se reconnaît, et c'est le bloc que ton site actuel n'a pas. Il vient directement du PPSD que tu es en train de travailler.
2. **Un seul appel à l'action, répété quatre fois, gratuit et sans engagement.** Les deux sites disent « diagnostic offert », jamais « devis » ni « tarifs ». Tu as déjà ce mécanisme, il est bon, il faut le garder.
3. **Le formulaire qui qualifie avant l'appel.** CP Coaching demande le statut, l'âge, la discipline et le niveau. Tu arrives au rendez-vous en sachant à qui tu parles, et le visiteur a déjà investi trois minutes.

**À ne pas copier.** CP Coaching est une page unique avec des ancres. Ça fonctionne pour lui : il est sur une niche minuscule (le pilote moto de compétition) où il n'a presque aucun concurrent. **Toi, tu es sur « coach » et « accompagnement entrepreneur », un des marchés les plus encombrés du web français.** Une page unique t'y condamne à l'invisibilité, exactement comme aujourd'hui. Il te faut des pages séparées, une par question que Google doit comprendre.

---

## 6. Positionnement : où j'en suis, et ce que j'attends de ton PPSD

Ce qui suit est une **proposition de travail**, à confronter à ton PPSD. Je ne la fige pas avant.

### La phrase que tu m'as donnée, et ce qui lui manque

> « Coach en stratégie de croissance perso et professionnelle pour aider les porteurs de vision à trouver l'alignement qui leur permettra de devenir #1 dans leur couloir. »

Elle est juste sur le fond, et **elle ne peut pas être la phrase du site**, pour trois raisons mesurables.

1. **« Porteur de vision » n'est pas une requête.** Personne ne le tape. C'est un mot qui décrit ta cible **vue par toi**, pas un mot par lequel elle se désigne elle-même. Ton prospect se dit entrepreneur, dirigeant, indépendant, ou bien il ne se dit rien du tout et décrit sa situation.
2. **« Alignement » et « couloir » sont ton vocabulaire, pas le sien.** Ce sont de très bons mots **une fois qu'il est sur le site** : ils te distinguent et ils sont à toi. Ce sont de mauvais mots **pour l'y amener**.
3. **« Perso et professionnelle » ouvre trop large.** Deux promesses dans une phrase, le visiteur n'en retient aucune.

### La règle de découpage

**Les mots par lesquels on te trouve ne sont pas les mots par lesquels on te reconnaît.**

- **Le titre de la page et les balises** parlent la langue du prospect : *coach*, *dirigeant*, *entrepreneur*, *Île-de-France*, et la problématique qu'il vit.
- **Le contenu de la page** parle ta langue : *couloir*, *alignement*, *devenir #1*, *méthode ATTRACTOR*. C'est ce qui fait qu'après trente secondes il se dit « celui-là ne parle pas comme les autres ».

Ton site actuel fait l'inverse : langue produit dans les balises, et rien de distinctif dans le contenu.

### Les trois arbitrages que je ne peux pas faire à ta place

Ils changent la structure du site, pas sa décoration. Je les pose ici, je les reprends en §8.

1. **L'agence et le coach : un site ou deux ?** Tu as aujourd'hui une agence qui vend des applications et un coach qui vend de l'accompagnement. Ce ne sont ni la même cible, ni le même panier, ni la même requête.
2. **La zone : Île-de-France ou Côte d'Ivoire ?** Le référencement local ne se partage pas. Une page « coach à Noisy-le-Grand » et une page « coach à Abidjan » sont deux pages, deux stratégies, et deux niveaux de concurrence sans rapport.
3. **La problématique d'entrée.** Un coach se trouve sur une douleur, pas sur une méthode. Ton PPSD doit ressortir **les trois douleurs les plus tapées**, pas les plus vraies. Ce sont rarement les mêmes.

---

## 7. Charte graphique : la lecture des références, et trois directions

### Ce que les deux références font, mesuré dans leur code

| | CP Coaching | Hero Mental |
|---|---|---|
| Fond principal | quasi-noir `#0b0f12` | quasi-noir `#0a0a0a` |
| Fond clair secondaire | sable `#f1ede4` | blanc cassé `#fafaf8` |
| Accent unique | cyan `#00d9d4` | jaune `#ebb118` |
| Titres | Space Grotesk | Archivo / Playfair Display |
| Signal technique | JetBrains Mono | IBM Plex Mono |
| Touche humaine | **Caveat** (manuscrite) | — |

**La recette est constante : un fond sombre, un sable chaud, UN seul accent saturé, une police à chasse fixe pour tout ce qui est chiffre ou donnée, et une manuscrite pour la signature humaine.** Ta charte actuelle a cinq couleurs signifiantes (orange, or, vert, charbon, sable) : une de trop pour deux d'entre elles.

Note au passage : **Caveat est déjà ta police de signature sur latiss.net.** Le geste t'est familier, il n'est pas à inventer.

### Trois directions, avec ce que chacune coûte

**Direction 1 — Continuité assumée.** On garde l'orange `#F25C05` en signature, on retire l'or et on descend le vert en accent de validation uniquement. Fond sable, blocs charbon pour les moments de preuve.
*Pour :* zéro rupture avec les applications clientes et l'écosystème, coût nul, la frise narrative tient.
*Contre :* l'orange vif est un code d'agence tech et de promotion. Sur une page de coach, il pousse à l'achat là où il faudrait inspirer la confiance. Tu restes visuellement « l'agence qui fait des apps ».

**Direction 2 — Bascule coach, fond sombre (recommandée).** Base charbon profond, sable chaud pour les pages de contenu, **l'orange conservé mais réservé à l'appel à l'action et à rien d'autre**, une manuscrite pour ta signature, une chasse fixe pour tous les chiffres de résultat.
*Pour :* c'est la grammaire qui fonctionne sur les deux références, elle porte l'autorité personnelle. Tu gardes ton orange, donc le lien avec l'écosystème, mais tu changes son rôle : il ne décore plus, il désigne l'action. Le sombre donne du poids à ton visage et aux témoignages.
*Contre :* impose de refaire les photos. Un portrait pris sur fond clair ne tient pas sur une base sombre.

**Direction 3 — Rupture complète.** Nouvelle palette, nouveau logo, site coach entièrement séparé de l'identité Attractor.
*Pour :* liberté totale, aucune ambiguïté avec l'agence.
*Contre :* tu jettes une notoriété de marque construite depuis 2014 et tu dédoubles tout. À réserver au cas où tu tranches « deux sites séparés » en §8, et même là je ne le conseille pas.

**Ma recommandation : Direction 2.** Elle règle le problème de fond (l'orange qui crie « promo » sur une page qui doit inspirer confiance) sans payer le prix de la rupture, et elle oblige à la discipline d'un accent unique.

**Le point le plus coûteux de la charte n'est pas la couleur, c'est la photo.** Sur les deux références, la personne est visible dès le premier écran, en situation, dans son milieu. Ta photo actuelle pèse 5,8 Mo et n'apparaît qu'en troisième étape du processus. **Un shooting est nécessaire, et il est sur le chemin critique.** Tu en avais déjà prévu un pour l'annonce du 15 octobre : c'est le même.

---

## 8. Les cinq décisions à prendre avant de coder

Aucune ligne n'est écrite tant que ces cinq points ne sont pas tranchés. Ils déterminent le nombre de pages, les domaines et le calendrier.

| # | Décision | Ce que ça change | Mon avis |
|---|---|---|---|
| **D1** | **Le domaine.** Reprendre `mr-attractor.fr`, le rediriger vers `agenceattractor.com`, ou le laisser mourir | Reprendre : tu récupères 4 pages déjà indexées avec le bon positionnement et l'ancrage local. Rediriger : tu transfères ce qui reste d'autorité vers le nouveau site. Laisser mourir : tu repars de zéro sur un marché saturé | **Rediriger en 301, page par page**, vers les pages équivalentes du nouveau site. Tu récupères l'historique sans entretenir deux sites. À faire vite, avant désindexation |
| **D2** | **Un site ou deux ?** Le coach et l'agence sous le même toit, ou séparés | Un site : une seule autorité à construire, mais un message mixte. Deux sites : deux messages nets, deux fois le travail de référencement | **Un seul site, deux entrées claires** dès la navigation. Tu n'as pas la bande passante pour référencer deux domaines, et tes applications clientes sont ta meilleure preuve de crédibilité en tant que coach |
| **D3** | **La zone prioritaire.** Île-de-France, Côte d'Ivoire, ou les deux | Le référencement local ne se partage pas : une page par zone, et la concurrence n'a rien à voir | **Île-de-France en priorité de référencement**, Côte d'Ivoire traitée par les réseaux et le bouche-à-oreille, où elle marche déjà. Raison : c'est là que les gens *cherchent* un coach sur Google, et c'est là que ton ancien domaine a déjà de l'historique |
| **D4** | **Les trois problématiques d'entrée** | Ce sont les trois pages à écrire en premier, et les trois requêtes à viser | **Sort de ton PPSD.** Je ne peux pas le trancher, et je n'ai pas à le faire |
| **D5** | **La charte** (§7) | Détermine le shooting, donc le calendrier | Direction 2 |

---

## 9. Le plan de refonte, en cinq phases

Une phase ne commence pas avant que la précédente soit vérifiée en ligne.

### Phase 0 — FAITE le 22/09/2026, en local, pas encore déployée

**Mesuré après travaux : 9 270 Ko → 433 Ko pour la page d'accueil, soit -95 %.** Images seules : 9 183 Ko → 345 Ko.

| Action | État | Résultat mesuré |
|---|---|---|
| Compression des 8 images | fait | -96 %, `hero` -95 %, `mac-arthur.jpg` 5 644 → 12,5 Ko. Qualité contrôlée au PSNR : 38,8 dB sur le hero, dimensions servies 4 à 7 fois supérieures à l'affichage |
| Chargement différé + `alt` + dimensions | fait | plus aucune image sans `alt`, `loading="lazy"` sur les visuels hors premier écran |
| `robots.txt` + `sitemap.xml` | fait | 5 URL publiques, documents internes exclus |
| Consentement avant le pixel Facebook | fait | testé sur 5 scénarios, **zéro requête vers Facebook avant acceptation**, refus aussi accessible que l'acceptation, `<noscript>` non gérable supprimé |
| `noindex` sur les pages internes | ajouté | voir §11, le `noindex` ne suffit pas |

Originaux conservés dans `refonte-site-agenceattractor/images-originales/`.

*(Plan initial, conservé pour mémoire :)*
Indépendant de tout le reste, gain immédiat sur le site actuel.
- Compresser les 8 images de l'accueil : **9,2 Mo → cible sous 600 Ko**. À lui seul, ce point vaut plusieurs secondes de chargement.
- Ajouter `loading="lazy"` sur tout ce qui n'est pas dans le premier écran.
- Publier un `robots.txt` et un `sitemap.xml`.
- Poser un bandeau de consentement avant le pixel Facebook.

### Phase 1 — Positionnement verrouillé (dépend du PPSD)
- Les trois problématiques d'entrée, dans les mots du prospect, pas dans les tiens.
- La phrase d'accroche : une promesse de transformation, pas une description de métier.
- Les six phrases du bloc « ce que tu vis ».
- **Livrable : une page de positionnement d'une seule feuille, validée par toi avant toute maquette.**

### Phase 2 — Architecture des pages (dépend de D1, D2, D3)
Une page par question que Google doit comprendre. Structure proposée, à ajuster après §8 :

| Page | Question à laquelle elle répond | Requête visée |
|---|---|---|
| Accueil | qui tu es, ce que tu fais, pour qui | marque + « coach stratégie croissance » |
| Qui je suis | pourquoi toi | marque + parcours |
| Coaching dirigeant | ce que tu fais, concrètement | « coach dirigeant Île-de-France » |
| 3 pages problématiques | sur quelles problématiques | à définir avec le PPSD (D4) |
| Méthode ATTRACTOR | pourquoi ta façon de travailler | « méthode » + marque |
| Résultats / cas | la preuve | requêtes de réassurance |
| Zone d'intervention | où tu exerces | « coach + ville » |
| FAQ | les objections, et le contenu pour Google | requêtes longues |
| Contact / diagnostic | la conversion | — |

### Phase 3 — Preuve et image (dépend de D5, chemin critique)
- **Shooting.** Portrait, situation de travail, et si possible une séance réelle. Le même que celui déjà prévu pour le 15 octobre.
- **Trois résultats clients chiffrés, avant/après**, avec accord écrit de la personne. C'est le bloc le plus convaincant des deux références, et celui qui te manque totalement.
- **Ta certification du 3 septembre affichée**, avec l'organisme nommé.
- Ton ancienneté, avec sa date : tu accompagnes depuis 2014, ton ancien site le disait et le nouveau ne le dit pas.

### Phase 4 — Construction et mise en ligne
- Charte appliquée, gabarit de page unique décliné sur les 10 pages.
- Données structurées : `Person`, `LocalBusiness`, `Service`, `FAQPage`.
- Prise de rendez-vous **sur le domaine**, pas sur un sous-domaine de démo.
- Redirections 301 depuis `mr-attractor.fr` si D1 = rediriger.
- Recette complète avant annonce : les 6 résolutions de l'`UX_SYSTEM.md`, **tous les liens testés**, test sur un vrai téléphone.

### Phase 5 — Alimentation
Le référencement d'un coach ne se gagne pas à la mise en ligne, il se gagne au rythme. Un contenu par semaine, chacun répondant à une question réellement tapée. C'est le seul poste qui demande de la régularité sur la durée, et c'est celui qui décide du résultat à six mois.

---

## 10. Ce qui reste ouvert

- [ ] **D1 à D5** (§8), dont D4 attend ton PPSD.
- [ ] Le shooting à caler. **C'est le chemin critique** : sans photos, pas de Phase 3, donc pas de mise en ligne.
- [ ] Les trois résultats clients chiffrés à collecter, avec l'accord des personnes.
- [ ] La date cible. Si le site doit servir l'annonce du 15 octobre, la Phase 1 doit être bouclée **cette semaine**.
- [ ] Question ouverte, hors périmètre de cette refonte : Hero Mental vend à une niche française que ta certification te permet d'approcher.

---

## 11. Trouvé pendant la Phase 0, et non prévu

### a) Le mécanisme de publication explique les récidives de R-70

Le site est publié par GitHub Pages via `.github/workflows/deploy-site.yml`, déclenché **à chaque push sur `main`**, avec :

```yaml
publish_dir: ./livrables/commercial/site-agenceattractor
```

**Tout ce qui est déposé dans ce dossier part en ligne, sans filtre et sans décision.** C'est la cause racine des trois occurrences de R-70 du mois d'août, et ce n'était pas une inattention à chaque fois : c'est le mécanisme lui-même.

**Les documents de ce chantier allaient devenir la quatrième occurrence, de mon fait.** Écrits dans `site-agenceattractor/refonte-2026/`, ils auraient été lisibles sur `agenceattractor.com/refonte-2026/AUDIT-ET-PLAN.md` : ton positionnement, ton PPSD, l'analyse de tes concurrents et le détail de tes arbitrages. Déplacés hors du dossier publié avant tout commit, avec les images d'origine.

**Chantier à ouvrir, hors Phase 0 :** construire le déploiement à partir d'une liste de fichiers choisis, comme cela a été fait pour Nabycook le 13/08, au lieu de publier un dossier de travail entier. Tant que ce n'est pas fait, la règle est simple et fragile : **rien qui ne soit destiné au public ne se dépose dans `site-agenceattractor/`.**

### b) Deux documents confidentiels sont en ligne, en accès libre

| Adresse | Contenu | État |
|---|---|---|
| `agenceattractor.com/attractor-assists/one-pager.html` | « One Pager · Candidature Financement · **Confidentiel** · Juin 2026 » | HTTP 200, lisible par n'importe qui |
| `agenceattractor.com/attractor-assists/executive-summary.html` | « Executive Summary · Dossier de candidature · **Confidentiel** » | HTTP 200, lisible par n'importe qui |

J'ai posé un `noindex, nofollow` et un `Disallow` dans `robots.txt`. **Ça les retire de Google, ça ne les rend pas privés :** qui a l'adresse y accède toujours. La seule correction réelle est de les sortir du dossier publié. Décision à prendre, ce sont tes documents.

### c) Le logo de MY NUGO n'est pas le sien

`images/logo-mynugo.png` et `images/logo-attractor.png` étaient **strictement identiques** (même empreinte MD5, 7993 × 2791 px). **La carte MY NUGO de ta page d'accueil affiche donc le logo Attractor à la place de celui du client.** Je n'ai pas le vrai logo, je ne l'ai pas inventé. À fournir.

### d) 8 images inutilisées, environ 13 Mo

`awa.png`, `carelle.jpg`, `kofi.jpg`, `miriam.jpg`, `roland.jpg`, `serge.jpg`, `team-community.jpg`, `logo-attractor-alt.png` ne sont appelées par **aucune** des 9 pages du site. Elles ne pèsent pas sur le chargement, elles pèsent sur le dépôt et sur chaque déploiement. À déplacer ou à supprimer, au choix.

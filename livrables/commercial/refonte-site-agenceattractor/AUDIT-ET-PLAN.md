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

### Phase 1 — CLOSE le 23/09/2026

Les neuf blocs d'entretien sont clos, les trois segments et les six phrases validés.
La porte d'entrée est le personal branding, le coaching est la méthode, **Ton Poste de
Pilotage** est la seconde offre. Matière dans les fichiers `BLOC-*.md`.

### Phase 2 — ARCHITECTURE ARBITRÉE le 25/09/2026 : un socle de 5 pages

Arbitrage de Mac Arthur : **le socle part d'un bloc, le reste s'ajoute une page par semaine.**
Raison : les villes ne sont pas décidées, le Poste de Pilotage n'a ni page ni prix, et on
n'écrit pas du remplissage sur la moitié d'un site.

| Page | Fichier | Question à laquelle elle répond | État |
|---|---|---|---|
| Accueil | `index.html` | qui tu es, ce que tu fais, pour qui | **écrite** |
| Le coaching | `personal-branding.html` | ce que tu fais concrètement, plus les 8 questions fréquentes | **écrite** |
| La méthode | `methode.html` | pourquoi ta façon de travailler | **écrite** |
| Qui je suis | `qui-je-suis.html` | pourquoi toi | **écrite** |
| Faire le point | `contact.html` | la conversion, formulaire branché | **écrite** |
| 3 pages problématiques | — | sur quelles problématiques | Phase 5 |
| Zone d'intervention | — | où tu exerces | Phase 5, attend les villes (bloc 8) |
| Résultats / cas | — | la preuve | **attend 3 accords écrits**, voir §14 |
| Ton Poste de Pilotage | — | la seconde offre | attend le prix |

**Décidé au passage, et à ne pas rouvrir sans raison :**

- **Aucun prix affiché.** Les deux références n'en affichent pas. Ça ne bloque pas la mise
  en ligne et ça laisse trancher le forfait à froid. Le site affiche à la place les 7 places,
  qui filtrent aussi bien qu'un prix.
- **Aucun traqueur, donc aucun bandeau de consentement.** Le pixel Facebook servait les
  campagnes « app métier » et le positionnement a changé. C'est le choix de CP Coaching, qui
  mesure sans cookie et génère des rendez-vous là où notre site, avec chat, diagnostic, suivi
  d'événements et pixel, n'a produit aucun lead. **Si la mesure redevient utile, ce sera
  Plausible, pas le pixel.**
- **`commander/`, `challenge.html` et `ebook.html` restent en ligne** et continuent de
  fonctionner, mais `commander/` sort du `sitemap.xml` : il porte l'ancien positionnement et
  Google n'a pas à le lire comme un sujet du site.

### Phase 3 — Preuve et image (dépend de D5, chemin critique)
- **Shooting.** Portrait, situation de travail, et si possible une séance réelle. Le même que celui déjà prévu pour le 15 octobre.
- **Trois résultats clients chiffrés, avant/après**, avec accord écrit de la personne. C'est le bloc le plus convaincant des deux références, et celui qui te manque totalement.
- ~~Ta certification du 3 septembre affichée~~ : **non obtenue, repassage en décembre 2026. Rien ne s'affiche tant qu'elle n'est pas acquise.** Les trois certifications déjà acquises (copywriting LiveMentor, business development Iconoclass, YouTube Olivier Juprelle) et le DESCOM d'AGITEL, eux, s'affichent.
- Ton ancienneté, avec sa date : tu accompagnes depuis 2014, ton ancien site le disait et le nouveau ne le dit pas.

### Phase 4 — CONSTRUITE le 25/09/2026, en local, pas encore déployée

| Action | État | Résultat mesuré |
|---|---|---|
| Charte appliquée, gabarit unique | fait | `assets/attractor.css`, un seul fichier pour les 5 pages |
| Les 5 pages du socle | fait | accueil, coaching, méthode, qui je suis, contact |
| Portrait traité intégré | fait | `mac-arthur-hero.jpg` **71 Ko**, `mac-arthur-buste.jpg` **25 Ko**, depuis le traitement du 23/09 |
| Image de partage (Open Graph) | fait | 1200 × 630, **66 Ko**, portrait à gauche et la phrase du prospect à droite |
| Icônes du site | fait | 32, 180 et 512 px, le « #1 » du logo sur fond charte |
| Données structurées | fait | `Person`, `ProfessionalService`, `Service`, `FAQPage` (8 questions), `AboutPage`, `ContactPage` |
| Formulaire de contact branché | fait | les 8 champs du bloc 9, vers l'edge function `notify-lead`, **testé de bout en bout** |
| `robots.txt` et `sitemap.xml` | refaits | 8 URL, `commander/` retiré |
| Recette complète | passée | voir §15 |

**Reste sur cette phase :** les redirections 301 depuis `mr-attractor.fr` (§12), et le test
sur un vrai téléphone, qui ne se délègue pas à un émulateur.

### Phase 5 — Alimentation
Le référencement d'un coach ne se gagne pas à la mise en ligne, il se gagne au rythme. Un contenu par semaine, chacun répondant à une question réellement tapée. C'est le seul poste qui demande de la régularité sur la durée, et c'est celui qui décide du résultat à six mois.

---

## 10. Ce qui manque pour la refonte

> Liste unique et vivante. Mise à jour du 22/09/2026, fin de journée.
> Classée par ce qu'elle bloque, pas par importance.

### Déjà réglé, et qui n'est plus à discuter

| Sujet | Réponse acquise |
|---|---|
| **La zone** (D3) | **France, et Paris.** « coach business abidjan » et « coach entrepreneur côte d'ivoire » : zéro requête. La Côte d'Ivoire passe par les réseaux, pas par Google |
| **Le vocabulaire** | « alignement », « clarifier son positionnement », « croyances limitantes » : zéro requête. Ces mots restent dans la page, jamais dans un titre |
| **La préparation mentale** | ni porte d'entrée (zéro requête), ni preuve (certification non obtenue). Hors sujet pour ce site |
| **Qui est facturé** | ceux qui ont les moyens de financer leur ambition. Les autres accèdent aux ressources, sans intervention |
| **Le cas de référence** | Nabycook, 2023-2026. Seul accompagnement long et abouti |

### A. Quatre décisions, et elles bloquent tout le reste

| # | Décision | État | Ce qu'elle bloque |
|---|---|---|---|
| ~~**D1**~~ | ~~`mr-attractor.fr`~~ | **TRANCHÉ le 23/09 : on redirige.** Mise en œuvre et piège à éviter au §12 | — |
| ~~**D2**~~ | ~~Un site ou deux~~ | **RÉGLÉ le 22/09** : **un seul site, deux offres séparées**, le coaching (méthode ATTRACTOR) puis **Ton Poste de Pilotage** | — |
| ~~**P**~~ | ~~La porte d'entrée~~ | **ACTÉ le 23/09 : `personal branding`**, le coaching comme méthode, le Poste de Pilotage en seconde offre. Écrit dans les titres et les balises des 5 pages le 25/09 | — |
| ~~**D5**~~ | ~~La charte~~ | **TRANCHÉE le 23/09 : fond noir, écriture blanche, jaune pour les appels à l'action.** Voir §13 | — |

### B. La matière d'entretien qui manque

| Bloc | État | Ce qu'il manque exactement |
|---|---|---|
| 1 · Qui tu accompagnes | partiel | **3 ou 4 segments nommés.** Le PPSD parle d'« un entrepreneur » au singulier générique |
| 2 · Ce qu'il vit | partiel | **Le déclencheur**, jamais donné : qu'est-ce qui s'était passé **la semaine où** on t'a appelé ? Et les 6 phrases dans leurs mots, pas dans les tiens |
| 3 · Qui tu es | **fait** | reste la question 19 : **la phrase que tes clients te renvoient**. Tu as « booster » et « intelligent », le second ne sert à rien |
| 4 · Ta méthode | **CLOS le 22/09** | méthode ATTRACTOR, 3 axes avec leur résultat, puis **Ton Poste de Pilotage** en offre séparée. Voir `BLOC-4-METHODE.md`. Reste à remplacer « devenir sa meilleure version » |
| 5 · Terrain | partiel | tes applications en ligne sont là. Manque ce qui est vérifiable par un tiers |
| 6 · Preuve chiffrée | **cas trouvé** | les **4 chiffres** de Nabintou, son **accord**, et sa **vidéo** |
| 7 · Objections | **rien** | 6 à 9 questions réellement posées. C'est aussi ce qui capte les requêtes longues |
| 8 · Zone | à décider | quelles villes exactement, Paris plus lesquelles |
| 9 · Le rendez-vous | mécanisme OK | la phrase « ce que tu emportes même si on ne travaille pas ensemble » |

### C. Les assets

- [ ] **Le shooting.** Chemin critique : sans photos, pas de Phase 3, donc pas de mise en ligne. Et la Direction 2 impose un fond sombre, donc on ne réutilise pas l'existant.
- [ ] **La vidéo de Nabintou**, offerte, à cadrer (voir `BLOC-6-PREUVE.md` §9).
- [ ] **Un ou deux autres cas** que Nabycook, même sans chiffres.

### D. Le reste, sur le site actuel

- [ ] **Le déploiement reste le dernier verrou.** Correction du 25/09 : le site se publie sur
  un push vers **`main`**, pas vers `master`. `main` a 105 commits d'avance et **un seul de
  retard**, `bd2b08b`, écrit par un agent cloud le 09/09. Ce commit dit « package Élévia signé
  le 08/09, J0 le 08/09 » là où le dossier local dit **signature Élise le 06/09 à 20h21,
  contresignature le 07/09 à 21h10, preuves vérifiées**. C'est le seul conflit, il porte sur
  une seule ligne, et **il décale la livraison à J0 + 40 jours ouvrés**. Arbitrage à rendre,
  mais il ne doit plus retenir le site.
- [x] ~~Les deux documents « Confidentiel »~~ : **sortis du dossier publié le 25/09**, rangés
  dans `_hors-publication/attractor-assists/`. Le `noindex` ne suffisait pas, seul le retrait
  du dossier suffit.
- [x] ~~Le vrai logo MY NUGO~~ : **réglé par disparition** le 25/09. La nouvelle accueil
  n'affiche plus de carte client, et le faux fichier est sorti du dossier publié.
- [x] ~~13 Mo d'images inutilisées~~ : **sorties le 25/09**. Le dossier publié passe de
  **14 Mo à 554 Ko**.
- [ ] **`commander/` reste en ligne avec l'ancien positionnement.** Retiré du `sitemap.xml`,
  mais toujours indexable. À trancher : le laisser, le passer en `noindex`, ou le réécrire.

### E. La date

- [x] ~~La date cible~~ : **début octobre 2026**, arbitrée le 25/09. On part avec le portrait
  déjà traité ; le shooting du 15/10 enrichit ensuite. Le site travaille six semaines plus tôt.

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

---

## 12. `mr-attractor.fr` : on redirige. Ce que ça demande

**Décision du 23/09/2026.**

### L'état technique, relevé le 23/09

| | |
|---|---|
| Registrar et DNS | **Gandi** (`ns-155-a.gandi.net`, `ns-178-c.gandi.net`, `ns-117-b.gandi.net`) |
| Web | `51.103.45.117`, la page de parking qui renvoie 34 octets |
| **Messagerie** | **ACTIVE chez Gandi** : `spool.mail.gandi.net` et `fb.mail.gandi.net` |

### Le piège, et c'est le même qu'à Nabycook

**Il y a une messagerie vivante sur ce domaine.** Côté web il n'y a rien à casser, **tout le risque est sur les mails**. Une modification de zone faite sans précaution coupe une adresse qui fonctionne peut-être encore, et on ne s'en aperçoit que quand quelqu'un se plaint de ne pas avoir reçu de réponse.

**Règle : on ne touche jamais aux enregistrements MX.** On ajoute ou on modifie uniquement ce qui sert le web.

**Et avant toute chose : savoir si une adresse en `@mr-attractor.fr` est encore utilisée, et par qui.** La page `/contact/` indexée affiche encore un numéro de téléphone, donc le domaine a servi de point de contact.

### La mise en œuvre, en deux temps

**Temps 1, tout de suite.** Une redirection 301 de tout le domaine vers `agenceattractor.com`. Ça ne transfère presque rien au référencement, mais **ça arrête de perdre les humains** : aujourd'hui, celui qui clique sur un des quatre résultats Google tombe sur une page blanche. Se fait depuis le tableau de bord Gandi, sans toucher aux MX.

**Temps 2, quand les nouvelles pages existent.** Redirection **page par page**, vers l'équivalent réel :

| Ancienne page | Nouvelle cible |
|---|---|
| `/coaching/` | la page coaching |
| `/formation/` | à décider, la formation n'est plus une offre affichée |
| `/methodologie/` | la page méthode ATTRACTOR |
| `/contact/` | la page contact |

**C'est le temps 2 qui préserve le positionnement**, pas le temps 1. Une redirection en masse vers l'accueil est traitée comme une page introuvable déguisée et ne transmet presque rien.

---

## 13. La charte, tranchée le 23/09

**Fond noir, écriture blanche, jaune pour les appels à l'action.**

### Deux faits à connaître, la décision restant prise

**1. C'est, à peu de chose près, la palette de Hero Mental.** Relevé dans leur code le 22/09 : fond `#0a0a0a`, blanc cassé `#fafaf8`, accent jaune `#ebb118` et `#ffd24a`. Sur un marché voisin, quelqu'un qui connaît les deux sites verra la parenté. **Ce n'est bloquant que si on garde aussi leur structure et leur typographie** : une palette partagée n'est rien, une palette plus une mise en page plus des polices identiques, c'est une copie.

**2. Ça retire l'orange, donc le lien visuel avec tout l'écosystème** : Attractor Assists, Livraison Pro, le Poste de Pilotage à venir, et les applications clientes. C'est un coût réel, assumé.

### Les valeurs techniques, à ne pas prendre au pied de la lettre

**Ni noir pur, ni blanc pur.** Du `#FFFFFF` sur du `#000000` produit un halo sur les longs paragraphes et fatigue l'œil. C'est précisément pour ça que Hero Mental utilise `#0a0a0a` et `#fafaf8` plutôt que les extrêmes.

| Rôle | Valeur proposée |
|---|---|
| Fond | `#0B0B0C`, un noir très légèrement chaud |
| Texte courant | `#F2F0EC`, blanc cassé |
| Texte secondaire | `#A8A49C` |
| **Accent, appels à l'action** | jaune saturé, autour de `#F2C10D` |
| **Texte sur le bouton jaune** | **`#0B0B0C`, jamais du blanc** |

**Le point d'accessibilité qui compte : du blanc sur du jaune est illisible** et échoue à toute norme de contraste. Un bouton jaune porte du texte noir. C'est une règle, pas une préférence.

### Deux conséquences immédiates

1. **Le shooting doit être fait sur fond sombre.** Aucune photo existante ne se réutilise, y compris ton portrait actuel. **C'est le chemin critique du projet.**
2. **La signature manuscrite reste souhaitable**, en blanc, pour la touche humaine sur une base aussi contrastée. Caveat est déjà ta police de signature sur latiss.net.

---

## 14. La preuve : ce qui est publié, et ce qui attend un accord

> Ajouté le 25/09/2026, à la construction du socle.

**Rien de ce qui concerne une personne réelle n'est publié aujourd'hui.** C'est une décision,
pas un oubli : les trois meilleurs cas sont tous en attente d'un accord écrit.

| Cas | Ce qu'il prouve | Ce qui manque |
|---|---|---|
| **Nabintou / Nabycook** | la promesse : quelqu'un qui avait rangé sa force dans un tiroir en a fait une marque publique | les 4 chiffres, son accord sur le texte exact, la vidéo qu'elle a acceptée |
| **Rosine Djaman** | le mécanisme : deux masters puis l'examen d'avocat, après « elle me disait qu'elle n'y arriverait pas » | **son accord.** Et « diagnostiquée dépressive chronique » est une donnée de santé, article 9 du RGPD : elle ne se publie pas, et le cas tient sans |
| **La filleule** | le mécanisme, en plus fort : DEC obtenu après deux échecs, l'un des examens les plus sélectifs de France | **son accord**, et le lien de parenté qui se dit ou alors le cas ne se publie pas |

**Ce qui est publié à la place, et qui se vérifie sans personne :** les quatre sites en
production (Nabycook, Ayêla, latiss.net, Vies Croisées), et la boucle Advantage Conseils
2014 → 2026, même structure, même dirigeante, même événement.

**Trois messages, et le bloc preuve existe.** Ils se passent au téléphone, donc pendant
les trajets.

---

## 15. La recette du 25/09, et ce qu'elle a trouvé

Trois contrôles automatisés, gardés dans `recette/`, à rejouer à chaque modification du site.

| Contrôle | Résultat |
|---|---|
| 5 pages × 6 résolutions = 30 passes | **aucun débordement horizontal** |
| Liens internes | **171 vérifiés, aucun cassé** |
| Contraste WCAG AA sur les 5 pages | **aucun texte sous le seuil** |
| Erreurs de console | **aucune** |
| Poids de l'accueil, polices comprises | **134 Ko** (9 270 Ko avant la Phase 0) |
| Formulaire de contact | validation des 3 champs obligatoires, envoi nominal, contenu du dossier créé : **tout vérifié** |

### Deux défauts réels, trouvés par la machine et par aucune relecture

1. **Le bouton jaune de la barre de navigation écrivait en gris clair sur jaune.**
   `.nav a` l'emportait en spécificité sur `.btn-jaune`. C'est exactement la faute que le §13
   interdit noir sur blanc, elle est passée quand même, et c'est le contrôle de contraste qui
   l'a attrapée.
2. **`radar/index.html`, marqué « Usage interne uniquement », était en ligne.**
   Quatrième occurrence de R-70, jamais relevée par personne. Trouvée par la barrière de
   publication, dès sa première exécution.

### La barrière de publication

Ajoutée à `.github/workflows/deploy-site.yml`. Elle fait échouer le déploiement, au lieu de
publier, si le dossier du site contient un marqueur de confidentialité, un fichier qui n'a
rien à faire sur un serveur public (`.env`, clés, `.sql`, `DOSSIER.md`, cache `wrangler`),
ou s'il dépasse 5 Mo.

**C'est la réponse structurelle aux quatre récidives de R-70.** Le mécanisme publiait tout le
dossier sans rien regarder ; il regarde maintenant.

---

## 16. Ce qui reste ouvert au 25/09/2026

**Décidé, et à ne pas rouvrir :** le positionnement, la charte, le socle de 5 pages,
l'absence de prix affiché, l'absence de traqueur, la date de début octobre.

**Ouvert, par ordre de ce que ça bloque :**

1. **L'arbitrage Élévia**, une ligne de date, qui est le dernier verrou du déploiement.
2. **Le prix et le forfait.** Ne bloque pas la mise en ligne, bloque la page du Poste de
   Pilotage et la réponse honnête à « c'est trop cher ».
3. **Les trois accords écrits** pour le bloc preuve (§14).
4. **Les villes**, pour les pages locales de la Phase 5. Mesuré le 22/09 : c'est Paris, et
   aucune ville d'Île-de-France hors Paris ne remonte.
5. **Les trois déclencheurs**, à noter aux trois prochains appels. Demandés quatre fois.
6. **Le sort de `commander/`**, qui porte encore l'ancien positionnement.
7. **Le shooting du 15/10**, qui n'est plus le chemin critique : le site part sans lui.

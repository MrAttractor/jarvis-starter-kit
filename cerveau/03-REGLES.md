# 03 · RÈGLES

> Le référentiel opérationnel de l'agence. Ce qui doit être appliqué, maintenant, sans redemander.
> Chaque règle est née d'une expérience réelle, référencée. Une règle sans origine est une opinion, elle n'entre pas ici.
> Seed initial du 06/08/2026. Format hérité de l'agent MIROIR.

**Comment lire.** `ORIGINE` = d'où vient la règle. `APPLICATION` = ce qu'on fait concrètement. `ASSISTS` = comment l'injecter dans le produit (vide si non applicable).

---

## A · VENTE ET OFFRE

### R-01 · Maquette avant devis, toujours
**Origine** : EXP-001, closing J'Envoie Express.
**Application** : ne jamais chiffrer avant d'avoir montré quelque chose de cliquable. Skill `/maquette-closer` puis `/devis-express`, dans cet ordre.
**Assists** : quand un utilisateur veut convaincre un prospect, suggérer la démonstration avant l'argumentaire.

### R-02 · Démontrer, pas expliquer
**Origine** : EXP-001, DMV validée sur J'Envoie Express, Beynaud, ETHSUN.
**Application** : sur chaque offre, chercher le moyen de faire vivre la valeur avant la vente. Une valeur expliquée convainc peu, une valeur vécue transforme.
**Assists** : le principe DMV est le cœur de la méthode enseignée.

### R-03 · Jamais un tarif unique
**Origine** : EXP-002, décision actée 009 du 21/06/2026.
**Application** : 2 ou 3 formules dans tout devis (Essentielle / Active / Premium). Template de référence : `getwinworld/closing.html`.
**Assists** : l'assistant qui aide à construire une offre impose le choix multiple.

### R-04 · Le prix sort du barème, jamais de l'improvisation
**Origine** : skill `/devis-express`, barème de référence.
**Application** : `.claude/skills/devis-express/references/bareme.md` fait foi. Aucun prix fixé sous pression dans une conversation.
**Assists** : proposer une grille, pas un chiffre au cas par cas.

### R-05 · Une offre, pas une addition
**Origine** : EXP-003.
**Application** : produit principal + bonus offerts valorisés + limiteurs honnêtes. Point d'entrée = acompte de la phase choisie. Jamais un total en bas de colonne.
**Assists** : structurer toute proposition commerciale sur ce squelette.

### R-06 · Un refus porte sur le format, pas sur la valeur
**Origine** : EXP-004, Air Côte d'Ivoire devenu VSD by Attractor.
**Application** : après tout RDV non conclu, debriefer le besoin exprimé, pas le refus. Chercher l'offre que la conversation vient de révéler.

### R-07 · La démonstration permanente avant le sur-mesure
**Origine** : EXP-005, démos par palier.
**Application** : premier contact = lien vers demo.agenceattractor.com/demo. Le sur-mesure se déclenche seulement sur prospect qualifié.

### R-08 · Le prospect compose son offre
**Origine** : EXP-006, devis interactif Fleur Ndoua.
**Application** : dès 3 options, devis en ligne interactif (table `devis_web` + edge function `devis-accept`) plutôt que PDF figé.

### R-09 · Pas de production sans signature de périmètre
**Origine** : EXP-007, Club Élévia.
**Application** : un acompte encaissé ne vaut pas accord sur le périmètre. Signature du package avant de démarrer. Toute demande hors périmètre est requalifiée et facturée à part, explicitement.

### R-10 · Toute clarification se fait par avenant écrit
**Origine** : EXP-008, Club Élévia natif/stores.
**Application** : quand le client impose son contrat, aucune clarification orale. Avenant co-signé, systématiquement.

### R-11 · Construire plutôt qu'abonner, sous 3 jours
**Origine** : EXP-009, Signature Attractor.
**Application** : tout outil SaaS envisagé est comparé à son coût de construction maison sur la stack existante. Sous 3 jours de développement, on construit.

### R-65 · Un marché déjà formé n'est pas un marché fermé
**Origine** : correction de Mac Arthur du 10/08/2026, note de cadrage ETHSUN, après la découverte que 120 opérateurs touristiques ivoiriens avaient déjà été formés gratuitement à l'IA par le ministère.
**Application** : découvrir qu'un sujet a déjà été enseigné, même gratuitement, même à notre cible exacte, **ne le retire pas de notre offre**. Une sensibilisation collective fait découvrir, elle n'installe rien : les participants repartent en sachant que les outils existent, pas en les ayant mis en service. La différenciation ne se cherche donc pas dans **le sujet** mais dans **le traitement** : outils standards du marché choisis parce qu'ils sont directement applicables, paramétrés pendant la prestation sur les chiffres réels du client, qui repart avec quelque chose qui tourne et non avec des notes. Le seul vrai risque est de reprendre un sujet **au même niveau** que ce qui a été donné gratuitement.
**Corollaire de veille** : une formation antérieure sur notre terrain est un **signal de demande validée**, à traiter comme une bonne nouvelle dans nos documents, jamais comme une menace. Le public est pré-éduqué, il n'y a plus à le convaincre que le sujet le concerne.
**Assists** : quand un utilisateur renonce à une offre parce que « ça existe déjà » ou « c'est déjà enseigné gratuitement », l'assistant déplace la question du sujet vers le niveau d'exécution.

---


### R-100 · Formulaire plutôt que calendrier quand la capacité est limitée et la sélection compte
**Origine** : analyse des deux références et capacité de Mac Arthur, 23/09/2026.
**Application** : `cpcoachingmental.com` et `heromental.fr` n'ont **aucune prise de rendez-vous en ligne**, et c'est délibéré. Un créneau cliquable laisse n'importe qui réserver ; un formulaire de qualification suivi d'un rappel laisse choisir. Dès que la capacité est plafonnée (7 places) ou que l'engagement du client conditionne le résultat, **le formulaire vaut mieux que le calendrier**. Le formulaire porte 6 champs de qualification pour 2 d'identité, dont le déclencheur (« qu'est-ce qui t'amène aujourd'hui ? ») et le degré d'urgence. Un délai de réponse affiché remplace le créneau.
**Assists** : proposer la prise de rendez-vous automatique seulement quand le volume prime sur la sélection.

## B · RELATION CLIENT ET LIVRAISON

### R-12 · Français simple, zéro jargon
**Origine** : EXP-010, Élise / Club Élévia.
**Application** : tout livrable client relu contre le jargon. Un client qui ne comprend pas ne le dit pas, il dit « je vais réfléchir ».
**Assists** : le niveau de langage s'adapte au profil détecté, jamais l'inverse.

### R-13 · Trois chiffres maximum, dans la langue du métier
**Origine** : EXP-011.
**Application** : aucune restitution financière en colonnes à un client non financier. Trois chiffres, en langage courant, avec le vocabulaire de son secteur.

### R-14 · Le contenu appartient au client
**Origine** : EXP-012.
**Application** : on propose un calendrier éditorial, on ne l'écrit jamais en base à la place du client. On livre le tuyau, il met sa voix.

### R-15 · Zéro lien non testé, y compris dans les mails qu'on envoie
**Origine** : EXP-013. **Étendue le 19/08/2026** aux liens des messages sortants, dossier Club Élévia.
**Application** : navigation, CTA, mailto, ancres, liens WhatsApp. Tous testés avant tout envoi. Règle bloquante.
**Extension aux mails** : la règle ne couvrait que les livrables, pas les messages. Or **tout brouillon Gmail créé via le connecteur enveloppe les adresses dans `google.com/url?q=…`, dans le lien ET dans le texte affiché**. Mesuré sur le message réellement envoyé à la Cliente le 07/08 : elle a reçu son **lien de signature électronique** sous la forme d'une longue adresse Google, ce qui ressemble à du hameçonnage. Le défaut a duré des mois sans que personne le voie, parce qu'on relit ce qu'on a écrit et pas ce qui est parti.
**Parade** : fournir un `htmlBody` avec de vraies ancres `<a href="…">…</a>`. Le texte visible redevient propre. Détail en mémoire `reference_gmail_liens_enveloppes`.
**Le réflexe à prendre** : après l'envoi d'un mail contenant un lien qui engage (signature, paiement, accès), **relire le message dans les envoyés** et regarder ce que le destinataire voit. Ce n'est pas le brouillon qui fait foi.
**Extension du 01/09/2026, la parade appliquée de travers a aggravé le défaut.** Pour échapper au redirecteur, l'adresse avait été collée **en texte brut sans `https://`** dans le mail du 26/08 à la Cliente d'Élévia. Résultat mesuré sur le message parti : Gmail l'a linkifiée en **`http://`**, puis **l'a réenveloppée quand même** dans `google.com/url` avec une expiration au lendemain midi. Le mail censé corriger le problème l'a donc reproduit, **en dégradant en plus l'adresse en non sécurisée** aux yeux de la Cliente, qui l'a remarqué et l'a écrit. **Une adresse nue n'échappe à rien** : elle perd son protocole et se fait envelopper comme les autres. La seule parade reste le `htmlBody` avec une vraie ancre, et **le protocole `https://` s'écrit toujours en toutes lettres**. Corollaire pour le client : lui dire de **recopier l'adresse à la main** ou de l'enregistrer en favori, un lien transmis en faisant suivre le mail reste enveloppé.

### R-76 · Une suppression en cascade n'emporte pas les fichiers stockés
**Origine** : ménage des comptes de test du Club Élévia, 19/08/2026.
**Le fait mesuré** : supprimer un membre efface sa ligne de vérification par `on delete cascade`, mais **pas l'objet vidéo dans le stockage**. Or la purge automatique travaille **à partir des lignes** : le fichier devient introuvable et n'est plus jamais effacé. Une vidéo du visage d'une personne resterait donc indéfiniment, alors que la politique de confidentialité publiée lui promet de pouvoir supprimer son compte et ses données.
**Application** : partout où une ligne pointe vers un fichier stocké, la suppression de la ligne doit **d'abord** effacer le fichier. Trois façons, par ordre de robustesse : effacer l'objet dans la fonction qui supprime, un déclencheur `BEFORE DELETE`, ou à défaut un **balayage périodique des orphelins** qui compare le stockage aux lignes existantes. Le balayage seul ne suffit pas, il rattrape au lieu de prévenir.
**Vérification** : après toute suppression, compter les objets du stockage **sans ligne correspondante**. Zéro, sinon la promesse est cassée.
**Pourquoi c'est une règle et pas un détail** : une donnée qu'on a promis d'effacer et qu'on conserve sans le savoir est un manquement qui ne se voit jamais de l'intérieur, puisque plus rien ne la référence. Voir R-54, une suppression promise doit être prouvable.
**Extension du 26/08/2026, trouvée en corrigeant le cas Élévia** : le déclencheur ne suffit pas, parce qu'un fichier peut exister **avant** que la ligne le référence. Ici l'adresse de dépôt est signée à l'ouverture de la demande, la vidéo part directement du navigateur au stockage, et la colonne `chemin` n'est écrite qu'à l'étape suivante. **Quiconque enregistre puis abandonne laisse un fichier que rien ne réclame, et qu'aucun déclencheur ne verra jamais**, puisqu'aucune ligne n'a été supprimée. Tout dépôt direct au stockage impose donc **les deux** : le déclencheur qui prévient, et un balayage qui compare le stockage aux lignes et efface le reste, avec une marge de quelques heures pour ne pas toucher un envoi en cours. Le test qui tranche : compter les objets du stockage sans ligne correspondante, **après** avoir simulé un abandon, pas seulement une suppression.

### R-16 · Passe de nettoyage avant mise en production
**Origine** : EXP-014, doublons C'Real.
**Application** : avant toute mise en ligne, chasser les doublons, les données de démonstration, les placeholders, les prix de test, les noms génériques.

### R-36 · Checklist QA en 6 points, non négociable
**Origine** : doctrine chapitre 8.
**Application** : NDA vérifié · périmètre sans ambiguïté (inclus / exclus listés) · coûts de sous-traitance calculés · tous les liens testés · résidus de template éliminés · recommandations formulées comme expérience terrain, jamais comme sortie d'IA.

### R-37 · Checklist juridique avant rédaction, pas après
**Origine** : décision actée 003 du 13/06/2026.
**Application** : avant toute rédaction contractuelle, présenter la liste des clauses critiques : propriété intellectuelle, confidentialité, non-concurrence, restitution des données, juridiction, clause de sortie équilibrée. Signaler les lacunes explicitement, avant que le client les remonte.

### R-38 · Le vocabulaire du client, jamais le nôtre
**Origine** : dossiers artistes.
**Application** : bannir les termes génériques anglais (Inner Circle, Backstage, Premium Club). Utiliser le vocabulaire propre de l'artiste, du métier ou de la communauté concernée.

### R-39 · L'auto-publication réseaux ne se vend pas
**Origine** : décision actée session 72.
**Application** : scope interdit dans les offres, l'API LinkedIn bloque les profils personnels. Remplacer par « accompagnement à la publication ».

### R-40 · L'URSSAF n'apparaît jamais sur un devis
**Origine** : référentiel prix.
**Application** : environ 22 % du chiffre d'affaires est une charge du prestataire, intégrée dans le prix (net ≈ 78 %). Jamais une ligne visible côté client.

### R-72 · La charte du client prime sur notre cahier des charges, et c'est son logo qui l'établit
**Origine** : EXP-040, recette du Club Élévia du 08/08/2026, logo officiel reçu le 14/08. La cliente demandait « conserver partout le bleu nuit et l'or » alors que l'application était en noir et or.
**Le fait mesuré** : les couleurs relevées dans son fichier logo sont le bleu nuit `#00234B` et l'or `#A87726` à `#D9AC56`. Aucun bleu nulle part dans notre cahier des charges, qui écrit « charte Noir & Or » **six fois, dont dans un critère d'acceptation**. Le cahier des charges n'avait pas tort par négligence : il a été rédigé **avant que le logo existe**.
**Application** : quand un client réclame une identité visuelle différente de nos documents, ne pas lui opposer le cahier des charges. **Comparer les dates.** Un document rédigé avant que l'identité du client existe décrit un provisoire que nous avions choisi à sa place, il n'engage pas le client. On relève alors les couleurs **dans le fichier source, au script, jamais à l'œil** (voir R-24), et on bascule.
**Ce qui reste opposable** dans le cahier des charges, ce sont les fonctionnalités, le périmètre et les critères d'acceptation fonctionnels. Pas la description d'une identité que le client n'avait pas encore fournie.
**Pourquoi c'est structurel et pas anecdotique** : la création de charte et de logo est **explicitement hors de nos prestations**. La charte vient donc toujours du client, par construction, et rien ne garantit qu'elle arrive avant notre cahier des charges. Le cas se reproduira à chaque dossier où le client fait faire son identité en parallèle.
**Le réflexe à prendre** : à l'ouverture d'un dossier, demander si l'identité visuelle est **figée ou en cours**. Si elle est en cours, écrire dans le cahier des charges que la charte appliquée est provisoire et sera remplacée par celle du client sans que cela constitue une demande hors périmètre. Cela évite d'avoir à choisir entre donner raison au client et défendre son propre document.
**Assists** : quand un utilisateur constate qu'un prestataire lui oppose un document contredit par sa propre marque, l'assistant lui fait vérifier laquelle des deux pièces est antérieure à l'autre.

---


### R-96 · Quand un prospect demande ce qui se passe si ça échoue, montrer la sortie, jamais le parapluie
**Origine** : contrat de coaching, 23/09/2026.
**Application** : « obligation de moyens et non de résultat » est la bonne clause à avoir au contrat et **la pire réponse à donner à un prospect** : elle protège le prestataire et confirme la peur de celui qui interroge. La réponse se prend dans la clause de **résiliation** : préavis, séances tenues dues, séances non tenues remboursées au prorata. Même contrat, deux clauses, effets opposés. Règle générale : à une question de risque, on répond par ce que le client peut faire, pas par ce dont on n'est pas tenu.
**Assists** : quand un utilisateur rédige ses conditions, distinguer les clauses qui le protègent de celles qui rassurent, et n'afficher que les secondes côté public.

---

## C · PRODUCTION TECHNIQUE

### R-98 · Le résultat ne vient pas du back end. On n'ajoute pas de technique avant que le contenu soit écrit
**Origine** : EXP-053, analyse du back end de `cpcoachingmental.com` et `heromental.fr`, 23/09/2026.
**Application** : les deux sites de référence du marché sont **statiques**. Formulaire vers un service tiers qui envoie un mail, aucune base, aucun compte, aucune prise de rendez-vous. En face, `agenceattractor.com` avait un chat, un diagnostic, un suivi d'événements complet et un pixel publicitaire, **et zéro lead**. Sur un site de vitrine ou de vente : écrire le contenu d'abord, mettre en ligne en statique, n'ajouter de la technique que quand un besoin mesuré l'exige. Vaut aussi pour les maquettes clientes, la technique ne sauve jamais un message absent.
**Assists** : quand un utilisateur veut « un site », commencer par lui faire écrire ce qu'il a à dire.

### R-99 · On ne génère jamais un visage, une preuve, ou une interface qui n'existe pas
**Origine** : direction artistique de la refonte, 23/09/2026.
**Application** : l'image générée sert les fonds, les textures, les matières et l'abstrait. **Jamais le visage du client ni le nôtre** : on traite la vraie photo, détourage, relight, upscale. **Jamais la capture d'un outil qui n'est pas construit**, c'est une promesse que le client viendra réclamer. **Jamais une scène qui prétend s'être produite.** Sur un bloc de preuve, une capture d'écran réelle d'un livrable en ligne bat toute image générée, parce qu'elle est vraie. Contradiction à éviter absolument : une page qui vend l'authenticité et affiche un portrait fabriqué.
**Assists** : refuser de produire un visuel qui simule une preuve.

### R-17 · Deploy Pages sur la branche de production DU PROJET, vérifiée
**Origine** : EXP-015, corrigée le 06/08/2026.
**Application** : la branche de production **dépend du projet**, elle ne se devine pas. `assists-agenceattractor` et `mynugo-store` sont sur `main` ; **`demo-agenceattractor` et `lamaisonayela` sont sur `master`**. Se tromper envoie le déploiement en preview, sans erreur visible, et le domaine ne bouge pas. En cas de doute : `wrangler pages deployment list --project-name=[projet]`. **La version précédente de cette règle imposait `main` partout : elle était fausse et cassait silencieusement les deux projets en `master`.**

### R-18 · Custom Domain déclaré avant de proxifier
**Origine** : EXP-016.
**Application** : Pages → Custom Domains → statut Actif, puis seulement CNAME en Proxied. L'ordre inverse garantit une Error 522.

### R-19 · Jamais d'`innerHTML` avec des données
**Origine** : EXP-017, session 75.
**Application** : `createElement` + `textContent` + `appendChild`. Attributs via `setAttribute`, handlers via `addEventListener`, IDs de base validés par regex. Seule exception : `innerHTML = ''` pour vider un conteneur.

### R-20 · Toute policy de self-update est bornée par colonne
**Origine** : EXP-018.
**Application** : une policy `auth.uid() = id` sans restriction de colonne permet l'escalade en admin. Parade obligatoire : déclencheur `BEFORE UPDATE` sur les colonnes sensibles.

### R-21 · La base est partagée, aucune opération de masse
**Origine** : EXP-019.
**Application** : `auth.users` est commune à Assists et à 8 dossiers clients, 14 fichiers SQL contiennent des UID en dur. Aucune suppression ou migration de masse sans audit d'impact multi-dossiers.

### R-22 · CORS et OPTIONS sur toute edge function appelée du navigateur
**Origine** : EXP-020.
**Application** : sans traitement du préflight, l'appel échoue en silence, surtout en fire-and-forget.

### R-23 · Mesurer avant de deviner, et savoir lire une absence de mesure
**Origine** : EXP-021. **Étendue le 19/08/2026** après EXP-041.
**Application** : bug non reproductible, dès la deuxième hypothèse : instrumenter (télémétrie `client-log`) plutôt que tester à l'aveugle.
**Le corollaire, qui a coûté deux jours** : une instrumentation correcte ne protège pas d'une mauvaise lecture. Face à un rapport de panne, **aucune trace côté serveur ne veut pas dire que l'utilisateur s'est trompé, ça veut dire que la requête n'est jamais partie du navigateur.** C'est un résultat, pas un vide. L'ordre des hypothèses est donc : le code client a échoué avant l'appel · l'appel a échoué en transport · le serveur a refusé. Chercher l'erreur d'usage **en dernier**, jamais en premier : c'est l'hypothèse la plus flatteuse pour celui qui a écrit le code, donc la plus suspecte.
**Ce qui distingue les deux cas** : une trace partielle (une ligne dans un journal de demandes, sans la suite) prouve que la requête est arrivée. **Zéro trace du tout** oriente vers le navigateur.

### R-24 · Toute palette validée au script, contraste des textes compris
**Origine** : EXP-022, protanopie. **Étendue le 14/08/2026** aux textes d'interface, après EXP-040.
**Application** : l'orange et le vert de la charte se confondent pour certains daltonismes. Validation automatisée, jamais à l'œil. Voir la skill `dataviz`.
**Extension aux interfaces** : le contraste d'un texte sur fond coloré **se calcule, il ne se juge pas**. Minimum 4,5:1 pour du texte courant. Mesure qui a déclenché l'extension : le bouton principal du Club Élévia était en **blanc sur or, soit 2,80:1**, très en dessous du seuil, et personne ne l'avait vu à l'œil parce que ça paraissait élégant. **Un texte clair sur un or, un jaune ou un vert clair ne passe presque jamais** : la parade est d'inverser, texte sombre sur l'aplat coloré, ce qui conserve la couleur de marque et double le contraste (ici 6,52:1). Vérifier avant de livrer, pas après la remarque du client.
**Extension du 14/09/2026, EXP-045 : un audit n'a pas le droit de sauter une zone.** L'outil écrit pour valider le mode clair de La Beynaumania rendait « contraste OK » en ayant classé « non calculables » tous les textes des blocs à fond photo, parce que l'image est portée par un frère en position absolue et reste donc invisible quand on remonte les parents. **Trois couleurs illisibles sont passées**, et c'est une capture d'écran regardée à l'œil qui les a trouvées. Un outil qui certifie ce qu'il n'a pas vu est plus dangereux que pas d'outil, parce qu'il autorise à ne plus regarder. **Parade** : ce qui n'est pas calculable exactement se mesure quand même sur une hypothèse conservatrice — ici un fond sombre de référence, ce qui fait échouer bruyamment toute encre sombre posée sur du sombre. Un « non calculable » ne se compte jamais comme un succès, et il apparaît dans le rapport, jamais dans le verdict. **Trois choses à calculer et non à juger, en plus du contraste** : les textes sur dégradé, en retenant le pire arrêt de couleur ; les textes sur transparence, en composant les couches ; les couleurs de marque sur un aplat très pâle de la même teinte, cas où un rouge à 5,9:1 sur blanc tombe à 4,3:1.
**Aussi** : quand plusieurs cas de la même famille chromatique échouent, corriger **la couleur de la famille dans le thème concerné** plutôt que chaque cas. Sur La Beynaumania, faire descendre le rouge de `#CC0000` à `#B80000` dans le seul mode clair a réglé huit cas d'un coup, sans toucher au mode sombre.

### R-25 · `wrangler pages deploy`, jamais `wrangler deploy`
**Origine** : EXP-023, demo.agenceattractor.com.
**Application** : un Worker porte le même nom que le projet Pages. Le domaine pointe sur le projet Pages.

### R-26 · CSS d'impression dès la création
**Origine** : EXP-024.
**Application** : `break-inside: avoid` et `overflow: visible` en `@media print` sur tout document HTML imprimable. Écrit à la création, pas après la remarque.

### R-41 · Audit UX_SYSTEM avant tout commit front-end
**Origine** : standards de développement, CLAUDE.md.
**Application** : `livrables/ecosysteme-attractor/UX_SYSTEM.md` fait foi. Mobile first sur 6 résolutions (375, 390, 414, 768, 1024, 1440), zéro débordement horizontal, grille 8 px, boutons ≥ 44×44 px, checklist de rejet section 12. Sans attendre qu'on le demande.

### R-42 · Icônes en SVG maison uniquement
**Origine** : décision post-session 65.
**Application** : plus aucun emoji utilisé comme icône dans une maquette ou un livrable. SVG line-art maison. Gabarit : `vies-croisees/index.html`.

### R-43 · GitHub est la source de vérité des fichiers de site
**Origine** : règle du 19/07/2026.
**Application** : commit et push sans attendre pour tous les sites. Architecture main/branches à standardiser.

### R-79 · On montre avant de demander
**Origine** : La Beynaumania, 13/09/2026. Analyse de Weverse, Laylo et des parcours d'inscription.
**Le fait mesuré** : environ **64 % des visiteurs abandonnent** un parcours d'inscription classique. La Beynaumania demandait trois champs avant d'avoir rien montré, pour donner accès à du contenu déjà public ailleurs.
**Application** : aucun formulaire ne se met devant la porte. Le visiteur voit d'abord un vrai morceau de ce qu'on lui promet, et le formulaire n'arrive qu'au moment où il veut **agir** : aimer, commenter, commander, réserver. Vaut pour toute vitrine, toute boutique, tout espace client. Corollaire : le compteur social se montre même quand le contenu est coupé, c'est lui qui donne envie d'entrer.
**Assists** : l'assistant qui construit une boutique ou un espace membre place l'inscription après la démonstration, jamais avant.

### R-82 · Une image d'accueil se réclame dans l'en-tête, jamais depuis le script
**Origine** : La Beynaumania, 14/09/2026. Mac Arthur : « je constate un ralentissement au lancement de la page d'accueil, l'écran est noir, on ne voit que le CTA en bas ».
**Le fait mesuré** : la photo de fond n'existait nulle part dans le HTML, elle était créée par le script tout en bas de page. Le téléphone devait donc lire 80 Ko de HTML et exécuter 1 200 lignes de code **avant même de réclamer l'image**. Pendant ce temps il affichait ce qu'il avait : un aplat noir et le bouton rouge. S'y ajoutaient une feuille de polices distante qui bloquait le premier affichage (276 ms mesurés), un cache d'images à `max-age=0` qui repayait un aller-retour à chaque visite, et le lecteur YouTube lancé en même temps que la photo, avec qui il se disputait la bande passante.
**Application, en quatre temps** :
1. Toute image qui occupe le premier écran est déclarée en `<link rel="preload" as="image" fetchpriority="high">` dans l'en-tête **et** posée dans le balisage. Le script ne fait que la retrouver.
2. Le premier écran ne reste jamais vide en attendant le réseau : une vignette de 24 px floutée, encodée dans la feuille de style, coûte 200 caractères et zéro requête. **C'est elle qui supprime l'écran noir, pas le gain de vitesse.**
3. Ce qui pèse lourd et n'est pas le sujet (lecteur vidéo tiers, scripts de mesure) part **après** que l'image du premier écran est à l'écran, avec un délai de sécurité.
4. Les images d'un site servi par Cloudflare Pages sortent en `max-age=0, must-revalidate` par défaut : poser une règle dans `_headers`, et **renommer le fichier pour remplacer une image** plutôt que l'écraser.
**À vérifier ailleurs** : tous les mini-sites de `demo.agenceattractor.com` partagent le même `_headers` et le même réflexe d'image de héros. Ayêla, GetWinWorld, Vies Croisées et les maquettes de closing sont à repasser au même filtre.
**Assists** : l'assistant qui livre un écran d'accueil vérifie que sa première image est réclamée dans l'en-tête, et qu'il y a quelque chose à regarder avant qu'elle arrive.

### R-83 · Une fonction qui peint un écran ne dépend d'aucun nœud, et le contenu ne dépend pas de la peinture
**Origine** : EXP-044, La Beynaumania, 14/09/2026. Une ligne visant un identifiant inexistant a vidé toute la page du visiteur.
**Le fait** : `document.getElementById('absent').classList.add(...)` lève une exception qui **emporte toutes les instructions suivantes de la fonction et de son appelant**. Ici la ligne était en plus inutile. Résultat : pas de clip, pas de publications, un vide noir, et un bouton de suppression de compte resté visible parce qu'il était après le point de rupture.
**Application, en trois temps** :
1. Masquer et dévoiler passent par des fonctions **tolérantes à l'absence** (`cacher(...)`, `montrer(...)`), jamais par un accès direct au nœud. Un bouton qui change de nom ne doit pas pouvoir éteindre un écran.
2. **Ce qui remplit l'écran part avant ce qui l'habille**, et ne dépend pas de lui : le média, le squelette et l'appel des données d'abord, la peinture de la coquille ensuite, **isolée**.
3. L'isolation **journalise** l'erreur, elle ne l'avale pas. Un `try` muet transforme une panne bruyante en panne invisible, ce qui est pire.
**À vérifier ailleurs** : toutes les applications qui peignent deux états du même écran, donc Ayêla, GetWinWorld, J'Envoie Express, Élévia et les maquettes de closing.
**Assists** : l'assistant qui écrit un écran à plusieurs états n'accède jamais à un nœud sans filet, et ne met jamais le chargement du contenu après la décoration.

### R-84 · Le parcours de l'inconnu se teste en premier, c'est le seul qui rapporte
**Origine** : EXP-044. Le défaut ne touchait que le visiteur sans compte, et il est resté en ligne avec le lien déjà chez l'artiste.
**Le fait** : l'agence teste toujours avec une session ouverte, par commodité. C'est l'autre branche du code. **L'écran que voit un inconnu, celui qui convertit, était le seul jamais parcouru.**
**Application** : toute recette d'une application publique se lance **d'abord en navigation privée, sans session**, et ce parcours-là est celui qu'on rejoue à chaque mise en ligne. On y vérifie trois choses au minimum : le contenu s'affiche, l'appel à l'action est présent, et rien qui appartient au membre ne fuit. Le parcours du membre vient ensuite.
**À vérifier ailleurs** : partout où une démo ou une plateforme circule par lien, donc tout `demo.agenceattractor.com`.
**Assists** : l'assistant qui livre un lien public le vérifie comme un inconnu avant de l'annoncer.

### R-85 · Unifier des contenus à l'écran oblige à unifier leurs effets au serveur
**Origine** : La Beynaumania, 14/09/2026. Mac Arthur publie une photo, aucune notification ne part.
**Le fait** : la refonte du 13/09 a fondu quatre rubriques en **un seul fil** où une photo, une vidéo, un sondage et le mot de Serge sont des publications équivalentes. À l'écran, oui. **Au serveur, non** : sur les quatre chemins d'écriture, un seul prévenait les abonnés, celui du mot. Les trois autres écrivaient en base et se taisaient. L'artiste publiait en croyant toucher sa communauté.
**Le piège** : la notification avait été livrée la veille et **vérifiée sur un vrai téléphone**. Elle marchait. Elle ne marchait que sur le chemin testé.
**Application** : quand plusieurs contenus deviennent équivalents pour l'utilisateur, lister **tous** les chemins d'écriture et leur faire produire les mêmes effets de bord (notification, journal, compteur, purge de cache). Ce qui se factorise à l'écran se factorise aussi derrière : ici une fonction de réponse commune, pour qu'ajouter un cinquième type de publication oblige à passer par elle. Et l'écran d'administration **dit ce qui est réellement parti**, jamais le nombre de destinataires possibles.
**À vérifier ailleurs** : partout où un back-office a plusieurs boutons « publier » (Élévia, Ayêla, Vies Croisées, La Beynaumania).
**Assists** : l'assistant qui unifie un affichage vérifie que les effets de bord ont suivi, et ne déclare la fonctionnalité livrée qu'après avoir emprunté chaque chemin.

### R-86 · Un thème s'ajoute par les jetons, se mesure dans les deux sens, et ne touche pas celui qui existe
**Origine** : EXP-045, mode clair de La Beynaumania, 14/09/2026.
**Application, en quatre points qui ont chacun coûté une correction** :
1. **Par les jetons, jamais par des règles dupliquées.** Un second bloc de variables, et le thème se pose sur `<html>` par quelques lignes dans le `<head>`, **avant la première peinture** : lu plus tard, l'écran clignote dans l'ancien thème avant de basculer. Le choix se garde dans le navigateur, et la couleur de la barre du téléphone suit, sinon un iPhone garde un bandeau noir au-dessus d'une page claire.
2. **Un bloc qui doit rester dans l'ancien thème redéclare le jeu de jetons, il n'épingle pas ses couleurs une par une.** Les fonds photo en sont le cas type : un texte posé sur une image éclaircie n'a plus de contraste garanti, le bloc reste donc sombre. Épingler à la main en oublie toujours, et ce qu'on écrira dans ce bloc dans six mois sera faux. Une redéclaration de portée rend juste tout ce qui suit.
3. **Chaque texte se mesure dans les deux thèmes, et les deux mesures se comparent.** C'est la seule façon de séparer ce que le nouveau thème a cassé de la dette qui l'attendait. Sans la comparaison, les deux arrivent dans le même tas et le nouveau thème porte le chapeau d'une dette ancienne. Mesuré sur ce cas : 0 régression, 44 textes sous le seuil en sombre seulement, tous antérieurs.
4. **L'ancien thème ne bouge pas d'un pixel.** Le piège est de fondre plusieurs valeurs voisines de l'ancienne charte dans un même jeton neuf : le nouveau thème est juste, et l'application en ligne a changé sans que personne l'ait demandé. Chaque valeur d'origine garde son jeton.
**Le contrôle qui manque à UX_SYSTEM** : ajouter une commande dans un en-tête peut le faire passer sur deux lignes **sans provoquer aucun débordement horizontal**. Ni la section 3, ni la section 9, ni le contraste ne le voient. Tout en-tête ou barre d'actions se mesure aussi **en hauteur**, à 375 et 390 px.
**Assists** : l'assistant qui ajoute un thème à une application existante mesure l'ancien avant de toucher au nouveau, et présente les manques de contraste en deux listes séparées.

### R-80 · Le gating se fait au serveur, jamais à l'écran
**Origine** : La Beynaumania, 13/09/2026, aperçu avant inscription.
**Application** : quand un contenu est réservé, c'est le serveur qui **ne l'envoie pas**. Tronquer à l'affichage laisse tout le reste dans la réponse, lisible par quiconque ouvre les outils du navigateur : ce n'est pas un aperçu, c'est un rideau. Même chose pour un prix réservé, un document client, un tableau de bord partiel.
**Assists** : toute fonction qui sert du contenu gaté décide côté serveur en fonction de qui demande.

### R-81 · Le stockage d'un navigateur n'est pas partagé, et une session qui n'y survit pas fabrique des doublons
**Origine** : La Beynaumania, 13/09/2026. Mac Arthur : « à chaque fois que je sors et que je reviens je dois renseigner les mêmes infos », et neuf comptes créés pour une seule personne.
**Le fait** : sur iPhone, une application ajoutée à l'écran d'accueil possède **son propre stockage**, séparé de Safari, lui-même séparé du navigateur intégré de WhatsApp. Trois mondes qui ne se voient pas. Or c'est par WhatsApp que les liens circulent en Côte d'Ivoire.
**Application** : toute application dont le compte vit dans le navigateur doit offrir un **moyen de reprise indépendant de l'appareil**. Un lien d'accès personnel est le plus simple, à condition qu'il ne soit **jamais affiché ni copiable** : le fan a déjà un lien fait pour être partagé, les confondre revient à donner son compte. Et **aucun bouton de déconnexion** quand il n'y a ni mot de passe ni identifiant : ça ne déconnecte pas, ça détruit le compte.
**À vérifier ailleurs** : Ayêla, GetWinWorld et J'Envoie Express reposent sur le même mécanisme de session et ont probablement le même défaut.
**Assists** : l'assistant qui construit un espace client sans mot de passe prévoit la reprise avant la première inscription.

### R-78 · Une promesse du navigateur qui ne rejette jamais se borne par un délai
**Origine** : La Beynaumania, 13/09/2026. La carte des notifications ne s'affichait jamais.
**Le fait** : `navigator.serviceWorker.ready` **ne rejette pas** quand il n'y a pas de service worker, elle reste suspendue indéfiniment. Un `await` dessus arrête tout le code qui suit, **sans exception, sans erreur, sans trace en console**. Le `try/catch` qui l'entourait ne servait à rien : il n'y a rien à attraper.
**Application** : toute attente d'une réponse du navigateur (`serviceWorker.ready`, permissions, lecture d'un média, géolocalisation) passe par un `Promise.race` avec un délai. Et l'écran se **peint d'abord dans son état par défaut**, on interroge ensuite : sinon une absence de réponse devient une absence d'affichage. Même famille qu'EXP-041, avec une nuance qui compte : là une exception était avalée, ici il n'y a même pas d'exception.
**Assists** : l'assistant qui écrit du front borne toute attente d'une API du navigateur.

### R-77 · Une migration qui retire se déploie avec son code, ou elle n'est qu'additive
**Origine** : EXP-042, La Beynaumania tombée 20 minutes le 13/09/2026.
**Application** : retirer ou renommer une colonne sur une application en ligne casse tout code non redéployé. Deux chemins seulement, jamais un troisième. Soit **le code part d'abord** et la migration suit. Soit la migration est **purement additive** (on ajoute, on recopie, on ne retire rien), le code part, et le nettoyage fait l'objet d'une migration ultérieure. Quand la bascule change la forme d'une réponse, la nouvelle version **renvoie aussi l'ancienne forme** le temps que les écrans suivent : un onglet reste ouvert des jours sur un téléphone.
**Assists** : l'assistant qui accompagne une évolution de données impose l'ordre, et signale la fenêtre de casse avant qu'elle s'ouvre.

### R-74 · Ce qui vient du formulaire se lit avant de changer d'écran, et tout écran d'attente a une issue
**Origine** : EXP-041, inscription du Club Élévia, défaut en ligne du 17 au 19/08/2026.
**Le fait mesuré** : l'écran de bienvenue remplaçait le contenu de la page, puis le code lisait `$("#i-optin").checked`. La case n'existait plus, `null.checked` levait une exception **dans un gestionnaire asynchrone, donc avalée sans rien afficher**. Aucune requête ne partait, aucune ligne en base, aucun message, et le visiteur restait bloqué sur « Nous envoyons votre code sécurisé » à attendre un e-mail jamais demandé.
**Application, en trois temps** :
1. **Lire d'abord, afficher ensuite.** Toute valeur issue du formulaire est extraite dans des variables **avant** l'appel qui change d'écran. Un écran de chargement affiché pendant une requête est une bonne idée, mais il détruit le formulaire qu'on n'a pas fini de lire.
2. **Tout écran d'attente a une sortie.** Un appel réseau est enveloppé de façon à ramener l'utilisateur à l'écran précédent avec un message. Rester bloqué sans explication est **le pire mode de panne** : il est indiscernable d'une lenteur, donc l'utilisateur attend au lieu de réessayer, et il ne signale rien.
3. **Un filet global.** `window.addEventListener("error")` et `"unhandledrejection"` affichent un message à l'écran, avec le détail technique en mode recette. Ce défaut a tenu deux jours **précisément parce qu'il ne produisait rien à regarder**.
**Vérification** : piloter le formulaire de bout en bout dans un navigateur, réseau intercepté, et constater que la requête part avec tous ses champs. Un clic manuel qui « semble marcher » ne prouve pas qu'une requête est partie.
**Assists** : tout parcours du produit qui attend une réponse serveur porte une issue visible en cas d'échec.

### R-90 · Avant de conclure qu'un serveur plafonne, lancer la même charge sur une cible qui ne peut pas plafonner
**Origine** : EXP-050, 19/09/2026.
**Application** : tout test de charge s'accompagne d'un **témoin** : la même charge, depuis le même poste, vers une cible qui ne peut pas être saturée (un fichier statique sur un réseau de diffusion). Si le témoin tombe aussi, le plafond mesuré est celui de l'instrument. Et l'instrument ne doit pas ouvrir une connexion par appel : il garde un petit nombre de connexions ouvertes et y fait passer les requêtes en continu, sinon il mesure la capacité d'un ordinateur à ouvrir des sockets.
**Vérification** : le témoin tourne AVANT que le verdict ne soit écrit, pas après qu'on l'ait mis en doute.
**Assists** : toute mesure de performance du produit publie son témoin à côté de son résultat.

---

### R-91 · Un changement de domaine est une perte de session pour 100 % des utilisateurs : il se fait avant le lancement, jamais après
**Origine** : EXP-049, 19/09/2026.
**Application** : le stockage d'un navigateur est lié à l'adresse et rien ne le transporte. Déménager un produit qui garde une session, un panier ou une préférence, c'est rendre inconnus tous ses utilisateurs. On le fait **tant que la base est vide ou composée de testeurs**. Le jour du déménagement, les redirections sont posées **en même temps**, et elles conservent la chaîne de requête : c'est elle qui porte les codes de parrainage, les sources de campagne et les liens déjà partagés.
**Vérification** : essayer les quatre portes d'entrée (http, https, avec et sans www) avec un paramètre dans l'adresse, et constater qu'il survit à chaque saut.
**Assists** : tout produit qui garde quelque chose dans le navigateur sort avec son adresse définitive, ou avec un compte qui permet de se retrouver ailleurs.

---

### R-87 · Une recette ne se plaint jamais de ce qu'elle a cessé de voir : elle compte ce qu'elle mesure, et le compte se relit après chaque refonte
**Origine** : EXP-048, quatre fois dans la journée du 19/09/2026.
**Application** : toute recette automatique affiche **le nombre d'éléments mesurés**, pas seulement son verdict. Ce nombre se relit après toute refonte qui déplace du contenu : onglet, dépliant, écran, domaine. Une chute du compte est un échec, même si tout le reste est vert. Et on étend la couverture **avant** de corriger le défaut qu'elle révèle, pour que la mesure prouve la correction.
**Assists** : tout contrôle automatique du produit rend un couple (verdict, volume mesuré), jamais un verdict seul.

---

### R-88 · Un identifiant n'est pas une clé : un numéro, un email ou un prénom désignent, ils ne prouvent rien
**Origine** : EXP-047, trouvée par Mac Arthur le 19/09/2026.
**Application** : aucun chemin ne rend un compte, une session ou un jeton sur la seule présentation d'un identifiant — numéro, email, prénom, code de parrainage, ou n'importe quelle combinaison d'identifiants. Reconnaître quelqu'un et le laisser entrer sont deux actes différents. Pour entrer, il faut un secret choisi par l'intéressé, ou une preuve de possession (code à usage unique). Et quand on refuse, on refuse **sans rien renvoyer** : un message, jamais un dossier.
**Vérification** : envoyer l'identifiant d'un autre utilisateur au serveur, en production, et constater qu'aucune donnée ne revient. Un formulaire qui ne propose pas le champ ne prouve rien : le défaut dort, il ne disparaît pas.
**Assists** : toute reprise d'accès du produit passe par un secret ou une preuve de possession, jamais par un identifiant seul.

---

### R-89 · Un jeton de couleur se valide sur CHAQUE fond où on le pose, et un jeton de thème ne vaut que sur une surface qui change de thème
**Origine** : EXP-046, 19/09/2026.
**Application** : un jeton de texte atténué se mesure sur tous les fonds du produit, pas sur le fond de la page. S'il ne passe qu'à un seul endroit, et au centième près, il n'est pas calé : il est chanceux, et il tombera ailleurs. On corrige **à la racine**, pas surface par surface. Cas particulier à chercher systématiquement : une surface qui ne bascule pas avec le thème — image de fond, photo sous voile, écran d'entrée. Les jetons du thème clair y désignent un fond qui n'existe pas, et il faut y redéclarer les jetons sombres.
**Vérification** : au script, jamais à l'œil. Sept défauts de ce type le 19/09, zéro signalé à l'œil sur une page travaillée une semaine.
**Assists** : la charte du produit livre ses jetons avec le contraste mesuré sur chaque surface où ils servent.

---

## D · PILOTAGE ET DISCIPLINE

### R-27 · Une automatisation sans supervision est une dette
**Origine** : EXP-025, n8n mort deux semaines.
**Application** : tout workflow ou agent programmé a un signal de vie visible. Fiabiliser avant d'ajouter.

### R-28 · L'oubli se combat par un dispositif, pas par la volonté
**Origine** : EXP-026, radar.
**Application** : bloc Radar dans chaque `DOSSIER.md`, commande `/radar`, agent cloud du lundi 7h. Un dossier ne se ferme que par décision explicite.

### R-29 · Un document source par dossier, un chiffre à un seul endroit
**Origine** : EXP-027, Air Côte d'Ivoire, erreur cachée cinq jours.
**Application** : la duplication d'information garantit la divergence. Un seul document fait foi, les autres pointent vers lui.

### R-30 · Pas de production de contenu sans date de publication engagée
**Origine** : EXP-028, Vies Croisées, 18 articles et 0 publication.
**Application** : produire est confortable, publier est exposant. La date se pose avant l'écriture.

### R-31 · Vérifier la dernière étape avant d'ouvrir le chantier
**Origine** : EXP-029, Facebook Login, WhatsApp Cloud API.
**Application** : sur toute intégration dépendant d'une validation externe (store, API tierce, vérification de compte), tester la faisabilité de l'étape finale d'abord. Le coût se paie sur les 10 % restants.

### R-32 · Un abandon se décide et s'écrit
**Origine** : EXP-029.
**Application** : un chantier abandonné est acté, daté, et sa raison écrite dans le cerveau. Sinon il ressuscite tous les trois mois.

### R-33 · Une chose à la fois en production
**Origine** : EXP-030, 12 chantiers simultanés.
**Application** : fermer avant d'ouvrir. Rituel hebdomadaire du dimanche 21h-22h, un filtre, une métrique.
**Assists** : l'assistant suggère de finir avant de commencer.

### R-34 · Trier les actions par appareil disponible
**Origine** : EXP-031.
**Application** : environ 10h par semaine en trajet avec le téléphone seulement, ordinateur au midi-deux et le soir. Une action ordinateur planifiée sur un créneau téléphone est impossible, pas en retard.

### R-35 · Une prestation de conseil doit être traçable
**Origine** : EXP-032, Festival des Grillades.
**Application** : espace de pilotage par projet, séances tracées, relevé PDF, validation des parties. Méthode en 3 phases : vision stratégique, plan tactique, suivi opérationnel récurrent. Voir `METHODE-CONSULTANCE.md`.

### R-44 · Capturer la remarque immédiatement et dupliquer le pattern
**Origine** : retour récurrent de Mac Arthur.
**Application** : toute remarque, correction comme validation, est stockée sur le champ, puis appliquée à tous les cas comparables sans attendre qu'ils se présentent.

### R-45 · Proposer le chemin complet, pas la pièce suivante
**Origine** : retour récurrent de Mac Arthur.
**Application** : présenter le plan ou le tunnel de bout en bout en amont, plutôt que de construire pièce par pièce en réaction.

### R-46 · Expliquer la logique de fond avant la technique
**Origine** : retour récurrent de Mac Arthur.
**Application** : ne jamais entrer dans les étapes techniques avant que le raisonnement de fond soit posé et compris.

---


### R-92 · Les mots par lesquels on te trouve ne sont pas ceux par lesquels on te reconnaît
**Origine** : EXP-051, refonte `agenceattractor.com`, 22/09/2026.
**Application** : avant d'écrire un titre de page, une balise ou un nom d'offre, **mesurer la demande réelle à l'autocomplétion Google** (`suggestqueries.google.com/complete/search?client=firefox&hl=fr&gl=fr&q=...`). Google ne suggère que des requêtes réellement tapées : zéro suggestion sur une formulation complète veut dire que personne ne l'écrit comme ça. Le vocabulaire de la marque reste dans le corps de la page, jamais dans un titre. Vérifié sur « alignement » (remonte le parallélisme des roues), « marque personnelle » (mots fléchés et pharmacie canadienne), « système digital » (digital signage).
**Assists** : quand un utilisateur nomme son offre, l'assistant distingue le mot qui attire du mot qui décrit, et propose de vérifier le premier.

### R-93 · On ne cherche pas son état, on cherche la solution qu'on a déjà en tête
**Origine** : EXP-051, mesure du 22/09/2026.
**Application** : ne jamais bâtir une page d'entrée sur la description d'une douleur (« je me disperse », « solitude du dirigeant », « mon business stagne » : quasi aucune demande mesurée). La douleur va dans le bloc « ce que tu vis », à l'intérieur de la page. La porte d'entrée se prend sur le **nom de la solution** que la personne cherche déjà.
**Assists** : distinguer, dans toute stratégie de contenu, les requêtes de solution des descriptions d'état.

### R-94 · Rien qui ne soit destiné au public ne se dépose dans un dossier publié
**Origine** : cause racine des trois occurrences de R-70 d'août 2026, identifiée le 22/09/2026.
**Application** : le déploiement d'un site publie **le dossier entier**, sans filtre (`publish_dir` sur GitHub Pages, `wrangler pages deploy` sur un dossier de travail). Avant tout commit, vérifier que le dossier publié ne contient que des fichiers destinés aux visiteurs. Les documents de chantier, les notes internes, les sauvegardes et les README vivent **en dehors**. La correction durable est de construire le déploiement à partir d'une liste de fichiers choisis, comme fait pour Nabycook le 13/08/2026.
**Assists** : —

### R-95 · Une promesse d'après-vente vague est pire que pas de promesse
**Origine** : bloc 7 des objections, 22/09/2026.
**Application** : à la question « et après, vous me laissez seul ? », répondre par un périmètre, une durée et un prix, ou ne rien promettre. « Un accompagnement moins formel, sous forme de conseils, des sessions possibles » contient trois flous et s'adresse à quelqu'un qui demande justement s'il y aura du flou : il entend « il ne sait pas non plus ». Vaut pour tout livrable : le support après livraison se borne ou ne s'annonce pas.
**Assists** : l'assistant qui aide à construire une offre exige le périmètre de l'après-vente avant de laisser annoncer un accompagnement.

## E · PHILOSOPHIE ET PRODUIT

### R-47 · L'utilisateur est le pilote, nous sommes le copilote
**Origine** : principe fondateur, doctrine chapitre 2.
**Application** : ne jamais décider à la place. Proposer, expliquer, challenger, organiser, automatiser. Toujours.
**Assists** : règle inscrite dans le system prompt de l'assistant.

### R-48 · Le test de la charge mentale
**Origine** : règle produit absolue, doctrine chapitre 2.
**Application** : « Cette fonctionnalité réduit-elle réellement la charge mentale de l'utilisateur ? » Si non, on ne développe pas.

### R-49 · Le concurrent est la distraction, pas une autre application
**Origine** : repositionnement Attractor Assists, session du 29/05/2026.
**Application** : ne jamais se positionner contre un concurrent nommé. Parler de temps gagné, jamais de « meilleur que X ».
**Assists** : interdiction dans le system prompt.

### R-50 · Zéro AI-slop
**Origine** : décision actée 007 du 15/06/2026.
**Application** : dans les prompts d'assistants clients, zéro emoji, zéro markdown, ton naturel. Dans les livrables, exigence professionnelle, jamais le style chatbot générique. Pas de texte sur texte, rigueur de direction artistique.

### R-51 · Un livrable mobile se teste sur un vrai téléphone
**Origine** : EXP-033.
**Application** : aucun écran utilisant la caméra, le micro, la géolocalisation, le paiement ou le partage n'est déclaré fini avant d'avoir tourné **sur un appareil réel**, pas sur un simulateur ni via des scripts. Les tests automatisés vérifient la plomberie imaginée par le développeur, jamais le navigateur réel. Corollaire : **ne jamais annoncer un livrable mobile à un client sans l'avoir ouvert soi-même sur un téléphone.**

### R-52 · Le poids d'un média est une décision commerciale
**Origine** : EXP-034.
**Application** : toute capture vidéo plafonnée à **800 kb/s**, toute photo redimensionnée avant envoi. Cible visée : moins d'un mégaoctet. Motif : la clientèle CI et diaspora se connecte en 4G ou en itinérance, et un envoi qui échoue se traduit par « l'application ne marche pas », jamais par « ma connexion est lente ».

### R-53 · Jamais de règle de routage générique en dernier recours
**Origine** : EXP-035.
**Application** : pas de motif `/:slug` ni d'attrape-tout dans un `_redirects`. Il est évalué **avant** le routage naturel de Cloudflare Pages et capture tout ce qu'on oublie de déclarer. Liste explicite, plus une vraie page 404. Et **toujours tester l'URL sans sa barre oblique finale** : c'est la forme qu'on écrit à la main dans un message, donc celle qu'un client reçoit.

### R-54 · Une suppression promise doit être prouvable, et bornée deux fois
**Origine** : EXP-036.
**Application** : l'horodatage de suppression s'écrit **après** l'effacement réel, jamais avant, sinon la preuve ment. Et toute donnée sensible porte **deux** limites : celle liée à l'événement (24 h après la décision) et une **borne absolue** indépendante de toute intervention humaine (30 jours). Une purge adossée à une action humaine n'est pas une durée de conservation.

### R-55 · Lire la demande du client dans son texte avant de produire
**Origine** : EXP-037.
**Application** : avant tout travail contractuel déclenché par une demande rapportée, résumée ou transmise, **ouvrir le message original du client**. Une reformulation de bonne foi transforme facilement une confirmation en demande de changement. Deux minutes de vérification contre un package contractuel refait.

---

### R-56 · Un produit mis en pause libère l'agence, pas ses clients
**Origine** : EXP-038, C'Real sortie d'Attractor Assists.
**Application** : avant d'écarter un produit interne, lister **qui en dépend encore réellement**. Un client actif est extrait vers ses propres tables et son propre domaine, dans la foulée. Une pause suspend le temps qu'on investit, jamais les engagements pris envers ceux qui s'en servent.

### R-57 · Un commentaire de code est un document public
**Origine** : recette du 07/08/2026, trois clientes nommées dans le code du site d'une quatrième.
**Application** : jamais de nom d'un autre client, d'un autre dossier ou d'un montant dans un fichier livré. Les commentaires partent en production et se lisent d'un clic droit. Expliquer le pourquoi sans citer chez qui.

### R-58 · Un état vide ne se dit pas comme une alerte
**Origine** : tableau de bord C'Real, huit farines « à produire » le premier jour.
**Application** : « jamais renseigné » et « en rupture » se ressemblent en base et se disent très différemment à l'écran. Un compteur à zéro parce que rien n'a été saisi appelle une invitation à démarrer, pas un signal rouge. Un outil qui crie dès la première ouverture apprend à l'utilisateur à ignorer ses alertes.
**Assists** : tout écran de démarrage distingue « pas encore fait » de « problème ».

### R-59 · Une alerte porte son action, sinon c'est un cul-de-sac
**Origine** : même écran, « À produire » était une étiquette et non un bouton.
**Application** : toute alerte se répare **depuis l'endroit où elle s'affiche**. Faire changer d'onglet et retrouver l'élément concerné, c'est quatre gestes pour une information déjà sous les yeux.

### R-60 · Un code de retour ne prouve rien, ce sont les lignes affectées
**Origine** : recette de sécurité du 07/08/2026.
**Application** : un `PATCH` bloqué par une policy RLS renvoie **204**, exactement comme une modification réussie, parce que zéro ligne correspond au filtre. Toute preuve d'isolation se fait avec `Prefer: return=representation` et un **comptage des lignes**, jamais sur le seul statut HTTP. Corollaire de la leçon de session 101 : un test qui innocente n'est pas une preuve d'innocence.

### R-62 · Une colonne secrète ajoutée par une migration impose de relire les fonctions antérieures
**Origine** : EXP-039, fuite du jeton d'animation, Festival des Grillades, 10/08/2026.
**Application** : `to_jsonb(ligne) - 'secret'` est une **liste noire**, et une liste noire ignore les colonnes qui n'existaient pas quand elle a été écrite. Toute migration qui ajoute une colonne sensible à une table déjà sérialisée entière par une fonction impose de relire **toutes** les fonctions de lecture antérieures. Vérification obligatoire à la clé anonyme : lister les clés réellement renvoyées, pas supposer.
**Assists** : applicable à toutes les apps clientes du projet Supabase partagé.

### R-63 · Une action destructrice se refuse dès qu'une preuve existe
**Origine** : EXP-039.
**Application** : une remise à zéro, une purge ou une réinitialisation doit être **refusée par la base** dès qu'une signature, une validation ou un relevé figé existe. Détenir le bon jeton ne suffit pas : le droit d'administrer n'est pas le droit d'effacer une preuve déjà constituée.

### R-64 · Un relevé signé ne bouge jamais, le suivi vit à côté
**Origine** : EXP-039, informations attendues du Festival des Grillades.
**Application** : quand un document constate un état à une date (compte rendu, relevé de décisions, procès-verbal), les données saisies **après** sa clôture ne doivent pas y remonter. Filtrer sur l'horodatage de clôture, et faire vivre le suivi dans un espace distinct. Sinon un relevé soumis à validation change dans le dos de ceux qui l'ont validé.

### R-61 · Un test lancé juste après un déploiement peut mentir
**Origine** : recette du 07/08/2026, page 404 servie en code 200.
**Application** : le cache d'un domaine sert encore l'ancienne réponse sur les adresses déjà visitées, alors que le déploiement direct répond correctement. Vérifier sur l'URL du déploiement, ou avec un paramètre anti-cache, avant de conclure à un défaut **comme avant de conclure à un succès**.

### R-66 · Jamais de `:hover` sans `@media (hover: hover)`
**Origine** : recette du questionnaire ennéagramme sur téléphone, 12/08/2026, remontée par Mac Arthur.
**Application** : sur un écran tactile, le navigateur **garde l'état de survol sur le dernier élément touché**. Si l'écran suivant recrée un bouton à la même position, celui-ci hérite du cadre. Toute règle de survol se place donc dans `@media (hover: hover) and (pointer: fine)`, et tout élément tapé porte `-webkit-tap-highlight-color: transparent`. **Ce n'est pas une question d'apparence.** Sur un questionnaire de 135 items, un repère visuel toujours au même endroit pousse à recliquer la même position : c'est un **biais de mesure**, et il fausse le résultat sans jamais lever d'alerte.

### R-73 · Une case cochée par défaut dans un formulaire de redirection écrase ce qu'on vient de créer
**Origine** : bascule de `nabycook.com`, 13/08/2026, attrapé avant validation.
**Application** : quand un domaine hébergé ailleurs est branché sur Cloudflare Pages, on crée d'abord le `CNAME www`, puis une redirection de l'adresse courte vers le `www`. **Le formulaire de redirection du registrar propose par défaut d'emporter le `www` avec lui**, et cette case fait deux dégâts simultanés : elle envoie `www` vers `www`, donc une **boucle de redirection infinie**, et elle exige d'**écraser le CNAME** créé quelques minutes plus tôt. L'avertissement affiché dit qu'une configuration existe déjà, **il ne dit jamais laquelle ni ce qu'il va remplacer**. On décoche, on valide, et **on relit la zone entière après coup** : MX, SPF, DKIM, DMARC et le CNAME. La preuve se fait sur la zone publiée, pas sur le message de confirmation.
**Corollaire** : ne jamais déplacer une zone DNS qui porte une messagerie en production pour publier un site vitrine. Un DMARC en `p=reject` ne dégrade pas en indésirables, il fait rejeter, et un DNSSEC actif non désactivé avant le changement de serveurs de noms rend le domaine entier injoignable pendant la propagation.

### R-70 · On déploie des fichiers choisis, jamais un dossier de travail
**Origine** : 12/08/2026, Livraison Pro. **Deuxième occurrence le 13/08/2026 sur Nabycook**, cinq jours plus tard : le `README.md` interne de l'agence était publiquement lisible sur le site de la cliente, avec la checklist de mise en ligne et des renvois aux autres dossiers clients. Une règle qui se fait prendre deux fois de suite n'est pas encore un réflexe, elle est encore une intention.
**Application** : envoyer le dossier entier expédie aussi ce qui n'a rien à faire en ligne. Mesuré : la fiche interne du produit était **publiquement lisible**, avec le nom d'un partenaire commercial et l'historique d'une panne, à côté de toutes les migrations SQL. Personne ne l'avait vu parce que personne ne va chercher une adresse qu'on n'a pas publiée. On copie les seuls fichiers publics dans un dossier temporaire et c'est lui qu'on envoie. Le contrôle avant mise en ligne teste désormais chaque `.md`, `.sql`, `.toml` et `.json` du dossier contre le site, et **bloque** s'il en trouve un servi.

### R-69 · Le contrôle avant mise en ligne se lance, il ne se récite pas
**Origine** : 12/08/2026, question de Mac Arthur sur la chasse manuelle aux défauts.
**Application** : `node scripts/controle.mjs --dossier <chemin> --site <url>` avant chaque déploiement. Il attaque réellement la base avec la clé publique, lit les fonctions, les pages et les adresses en ligne, et **bloque** sur ce qui est prouvé.
**Trois natures de constat, et une seule bloque** : `PROUVÉ` (mesuré ou vérifiable sans ambiguïté), `SUSPECT` (forme douteuse, exploitation non démontrée), `INCERTAIN` (le test n'a pas conclu, et **n'innocente donc rien**). L'audit précédent mélangeait les trois, signalait vingt-cinq tables dont une seule fuyait, et ne donnait pas deux fois le même résultat : plus personne ne le lançait, ce qui revenait à n'avoir aucun contrôle.
**Ce qu'aucun script ne verra jamais** : si une formulation est comprise, si le livrable est le bon, et ce que ça donne dans la main sur un vrai téléphone. Ces trois-là restent à l'œil, et c'est justement pour ça qu'il faut automatiser le reste.

### R-68 · Une identité se compare avec `is distinct from`, jamais avec `<>`
**Origine** : espace coaching, 12/08/2026, défaut introduit et attrapé à la recette.
**Application** : dans une fonction `SECURITY DEFINER`, le garde-fou `if auth.uid() <> '<uuid>' then raise` **ne protège rien** appelé avec la clé publique : `auth.uid()` vaut alors NULL, `NULL <> uuid` vaut NULL, la condition n'est pas vraie et la fonction s'exécute. Écrire `is distinct from`. Et **toujours `revoke all on function ... from public, anon` avant le `grant`** : Postgres accorde l'exécution à `public` par défaut à la création, donc un `grant to authenticated` seul ne restreint rien.
**Corollaire de recette** : tester chaque fonction sensible **avec la clé anon**, et vérifier qu'elle refuse. Une fonction qu'on n'a testée que connecté n'a pas été testée.

### R-67 · Un formulaire long se ponctue de pauses qui reposent la consigne
**Origine** : même recette, proposition de Mac Arthur.
**Application** : au-delà d'une trentaine de questions, ce qui se dégrade n'est pas la motivation mais la **spontanéité** : la personne se met à réfléchir, à se relire, à vouloir rester cohérente avec ce qu'elle a répondu plus haut. Intercaler une pause tous les cinquièmes environ, chacune reposant **une consigne de qualité** et non un encouragement décoratif. La dernière autorise explicitement à s'arrêter et à revenir : l'abandon assumé vaut mieux que vingt réponses remplies en pilote automatique.
**Assists** : tout parcours long du produit reprend ce découpage.

### R-71 · Sur un marché Mobile Money, l'achat intégré est un mur de paiement, pas un canal de vente
**Origine** : R&D du 14/08/2026 sur la mise en store, premier cas d'étude La Beynaumania. Vérifié le jour même sur les pages officielles, pas de mémoire.
**Le fait mesuré** : Google Play accepte les comptes développeur et marchand depuis la Côte d'Ivoire, mais **l'acheteur ivoirien n'y paie qu'en carte bancaire internationale**. Ni Mobile Money, ni facturation opérateur Orange, MTN ou Moov. Côté Apple, l'inscription au programme depuis la CI est incertaine et des cartes ivoiriennes sont refusées.
**Application** : Apple et Google imposent l'achat intégré sur tout contenu numérique consommé dans l'app (série, replay, live payant, abonnement, bon d'achat numérique), et l'interdisent sur tout bien ou service consommé hors de l'app (billet de concert physique, marchandise, livraison, prestation réelle). Sur la cible CI et diaspora, faire passer le contenu numérique par l'achat intégré revient donc à le réserver aux porteurs de carte, une minorité, **tout en laissant 15 à 30 % de commission**. Une app sur les stores peut convertir moins bien que la PWA qu'elle remplace. Montage par défaut : **l'app store porte le gratuit, la communauté et la notoriété, le web porte l'encaissement**. Piège associé : hors des États-Unis, une app iOS n'a pas le droit de renvoyer vers un paiement web ni même de le mentionner, donc on ne peut pas « garder XPaye et mettre juste un lien ».
**Corollaire de vente** : la question « avec quoi le client final va-t-il payer » se pose **avant** d'ouvrir le chantier, jamais après le dépôt. Prolongement direct de R-31. Procédé complet, checklist des rejets et grille de chiffrage dans `livrables/recherche-et-developpement/mise-en-store-android-ios.md`.
**Assists** : quand un utilisateur veut vendre du contenu numérique à une audience africaine, l'assistant vérifie le moyen de paiement de l'audience avant de valider le canal de distribution.

---

### R-75 · Le noir et or n'est plus un signe de luxe, c'est un signe de production automatique
**Origine** : refonte du site GPS, 19/08/2026. Correction de Mac Arthur, mot pour mot : « le jaune me rappelle un peu trop le AI slop ».
**Le fait** : le trio **fond sombre + accent doré + typographie condensée en capitales** (Bebas Neue et ses sœurs) est devenu la signature visuelle des sites produits en série par des générateurs. Il ne se lit plus comme du haut de gamme, il se lit comme **du contenu non travaillé**. Le pire est qu'il paraît réussi à celui qui le fabrique : c'est une combinaison flatteuse, immédiatement lisible, et c'est exactement pour ça qu'elle est partout.
**Application** : sur tout livrable visuel, l'or et le doré ne s'emploient que si le client les impose par **son propre logo déjà existant**, et jamais accompagnés d'une typographie condensée sur fond noir. Par défaut, préférer une DA à **un seul accent chromatique**, tiré d'une pièce réelle de son identité, sur une base neutre. Un accent unique se remarque, deux accents font décoratif, un métal fait synthétique.
**Ce qui a été fait sur le cas réel** : bascule sur noir, blanc et **un seul rouge**, celui de son logo d'événement, réservé aux aplats et aux filets, avec les photographies en noir et blanc et une seule famille typographique. La structure n'a pas bougé, seule la couche chromatique et la typographie ont changé.
**Le test avant de livrer** : « si je retire le nom du client, est-ce que cette page pourrait être celle de n'importe qui d'autre ? » Si oui, la direction artistique n'en est pas une.
**Assists** : quand un utilisateur fait produire un visuel de marque, l'assistant écarte le doré par défaut et cherche l'accent dans ce que le client possède déjà.

---

## Comment ajouter une règle

```
### R-XX · [Énoncé impératif, une phrase]
**Origine** : [EXP-XXX ou décision datée]
**Application** : [ce qu'on fait concrètement, vérifiable]
**Assists** : [comment l'injecter dans le produit, ou rien]
```

Une règle se retire quand elle n'a pas servi depuis six mois et qu'on ne l'applique plus. On la déplace alors en bas du fichier sous « Règles retirées », avec la date et la raison. On ne l'efface pas : savoir pourquoi une règle est morte évite de la réinventer.

---

## Règles retirées

*(aucune à ce jour)*

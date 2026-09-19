# 02 · EXPÉRIENCES

> Registre des réussites, des blocages et des déblocages de l'agence.
> Chaque fiche répond à : qu'est-ce qui s'est passé, pourquoi, et qu'est-ce qu'on en garde.
> Seed initial du 06/08/2026, reconstitué depuis HISTORY.md, la mémoire de session et les dossiers clients.

**Format d'une fiche** : Situation · Ce qu'on a fait · Résultat · Pourquoi · Règle qui en sort · Réutilisable pour.

**Types** : `RÉUSSITE` (ça a marché, on refait) · `BLOCAGE` (ça a coûté, on évite) · `DÉBLOCAGE` (c'était cassé, voilà le fix définitif).

---

## SECTION A · COMMERCIAL ET VENTE

### EXP-001 · La maquette avant le devis
**RÉUSSITE** · mai 2026 · J'Envoie Express

**Situation.** Discours commercial classique sur une app métier, prospect tiède, pas de décision.
**Ce qu'on a fait.** Produit une maquette cliquable aux couleurs du client avant de parler prix.
**Résultat.** Closing. Le mécanisme est devenu le standard de l'agence, rejoué sur Beynaud, Beracca, Élévia, Rukayatou, C'Real.
**Pourquoi.** Une valeur expliquée convainc peu, une valeur démontrée convainc, une valeur vécue transforme. Le prospect ne juge plus une promesse, il juge quelque chose qu'il a dans les mains.
**Règle.** → R-01, R-02
**Réutilisable pour.** Tout prospect Famille A. Skill `/maquette-closer`.

---

### EXP-002 · Le tarif unique fait peur, les formules font choisir
**RÉUSSITE** · 21/06/2026 · transverse

**Situation.** Devis envoyés avec un seul prix. Le prospect n'a qu'une décision possible : oui ou non. Il dit non ou il disparaît.
**Ce qu'on a fait.** Passage obligatoire à 2 ou 3 formules (Essentielle / Active / Premium), template `getwinworld/closing.html`.
**Résultat.** La question du prospect devient « laquelle » et non « est-ce que ». Acté comme décision 009.
**Pourquoi.** On ne vend pas un prix, on vend un choix. Le milieu de gamme devient l'ancrage naturel.
**Règle.** → R-03, R-04
**Réutilisable pour.** Tous les devis sans exception. Skill `/devis-express`.

---

### EXP-003 · Le total en addition tue la vente
**BLOCAGE puis RÉUSSITE** · 2026 · transverse

**Situation.** Devis construits comme une addition de lignes. Le total final fait peur, même quand chaque ligne est justifiée.
**Ce qu'on a fait.** Restructuration : un produit principal, des bonus offerts explicitement valorisés, des limiteurs honnêtes (délai, places), point d'entrée = acompte de la phase choisie.
**Résultat.** Le prospect ne lit plus une facture, il lit une offre.
**Pourquoi.** Une addition oriente l'attention vers ce que ça coûte. Une offre oriente l'attention vers ce qu'on reçoit.
**Règle.** → R-05
**Réutilisable pour.** Tout devis, toute page de closing.

---

### EXP-004 · Le RDV qui n'aboutit pas peut créer l'offre suivante
**RÉUSSITE** · 22/07/2026 · Air Côte d'Ivoire

**Situation.** RDV tenu avec Air Côte d'Ivoire, principe validé, mais demande recentrée sur un simulateur, pas sur le deal espéré.
**Ce qu'on a fait.** Au lieu de classer le dossier, on a extrait le besoin réel du marché repéré pendant l'échange et créé VSD by Attractor (72h Paris-Abidjan à partir de 430 €, premier vol le 04/09/2026).
**Résultat.** Une offre commerciale autonome née d'un RDV non conclu.
**Pourquoi.** Le prospect ne dit jamais non à la valeur, il dit non au format proposé. Le format se change, la valeur reste.
**Règle.** → R-06
**Réutilisable pour.** Tout RDV qui semble échouer. Debriefer le besoin, pas le refus.

---

### EXP-005 · La démonstration permanente remplace l'argumentaire
**RÉUSSITE** · juillet 2026 · demo.agenceattractor.com/demo

**Situation.** Chaque prospect nécessitait une maquette sur mesure, donc du temps avant même de savoir s'il est sérieux.
**Ce qu'on a fait.** Construction des démos par palier (By Macoco) : 3 formules démontrées, vitrine + tableau de bord ouvert, avant/après, visite guidée live.
**Résultat.** Actif de vente permanent, envoyable en un lien, réutilisable à l'infini.
**Pourquoi.** Le sur-mesure se justifie pour un prospect qualifié, pas pour un curieux. La démo par palier fait le tri en amont.
**Règle.** → R-07
**Réutilisable pour.** Premier contact, inbound, réponse rapide sur WhatsApp.

---

### EXP-006 · Le devis qui se remplit tout seul
**RÉUSSITE** · juillet 2026 · Fleur Ndoua

**Situation.** Devis PDF envoyé, puis silence, puis relance, puis négociation par message.
**Ce qu'on a fait.** Générateur de devis en ligne : le prospect coche ses options, le total se met à jour en direct, il valide en un clic (table `devis_web` + edge function `devis-accept`).
**Résultat.** Maillon 4 de la chaîne de vente. Premier cas live sur demo.agenceattractor.com/fleur.
**Pourquoi.** Le prospect qui manipule l'offre se l'approprie. Il ne subit plus un prix, il compose le sien.
**Règle.** → R-08
**Réutilisable pour.** Tout devis à partir de 3 options.

---

### EXP-007 · Encaisser avant d'avoir fait signer le périmètre
**BLOCAGE** · Club Élévia

**Situation.** 950 € encaissés sur 3 000 €, mais le package V5 n'a jamais été signé. Puis demande d'un dossier startup qui n'était dans aucun périmètre.
**Ce qu'on a fait.** Requalification en Voie B, à facturer à part.
**Résultat.** Tension évitable, temps passé à défendre un périmètre au lieu de produire.
**Pourquoi.** L'argent reçu crée chez le client le sentiment que tout est ouvert. Seule la signature ferme le périmètre.
**Règle.** → R-09
**Réutilisable pour.** Tout acompte encaissé.

---

### EXP-008 · La clarification orale ne vaut rien
**BLOCAGE** · Club Élévia · natif / stores

**Situation.** Le client fait signer SON contrat. Une ambiguïté sur le périmètre (application native, publication sur les stores) est clarifiée à l'oral pendant un échange.
**Ce qu'on a fait.** Rien d'écrit sur le moment.
**Résultat.** Le périmètre est redevenu discutable dès que l'intérêt du client a changé.
**Pourquoi.** Un contrat rédigé par l'autre partie ne se corrige pas par une conversation. Il se corrige par un avenant co-signé.
**Règle.** → R-10
**Réutilisable pour.** Tout client qui impose son propre contrat.

---

### EXP-009 · La signature maison débloque la vente
**DÉBLOCAGE** · 22/07/2026 · Signature Attractor

**Situation.** Dossier Élévia bloqué faute d'outil de signature électronique. Yousign facturé, budget non justifiable sur un seul dossier.
**Ce qu'on a fait.** Construction de Signature Attractor (SES eIDAS), maillon 5 de la chaîne de vente, 0 € de coût récurrent.
**Résultat.** Blocage levé, et l'outil sert désormais tous les dossiers.
**Pourquoi.** Un blocage récurrent qui coûte un abonnement mérite d'être construit une fois. La stack maison est déjà là.
**Règle.** → R-11
**Réutilisable pour.** Tout outil SaaS envisagé à moins de 3 jours de développement.

---

## SECTION B · RELATION CLIENT ET LIVRAISON

### EXP-010 · Le client ne comprenait pas nos mots
**BLOCAGE** · Club Élévia · Élise

**Situation.** Livrables rédigés avec le vocabulaire de l'agence. Élise ne comprenait pas certains termes et ne le disait pas.
**Ce qu'on a fait.** Réécriture en français simple, sans jargon.
**Résultat.** Validation obtenue.
**Pourquoi.** Un client qui ne comprend pas ne dit pas « je ne comprends pas », il dit « je vais réfléchir ». Le jargon ne fait pas sérieux, il fait perdre la vente.
**Règle.** → R-12
**Réutilisable pour.** Tout livrable client, tout devis, toute présentation.

---

### EXP-011 · Le compte de résultat en colonnes
**BLOCAGE** · client · présentation financière

**Situation.** Présentation d'un compte de résultat en colonnes à un client non financier.
**Ce qu'on a fait.** Refonte : trois chiffres maximum, en langage courant, dans le vocabulaire du métier du client.
**Résultat.** Compréhension immédiate.
**Pourquoi.** Notre métier est de rendre lisible, pas de prouver qu'on sait compter.
**Règle.** → R-13
**Réutilisable pour.** Toute restitution chiffrée à un client.

---

### EXP-012 · Écrire le contenu à la place du client
**BLOCAGE** · dossier contenu

**Situation.** Calendrier éditorial proposé, puis contenus écrits directement en base de données à la place du client.
**Ce qu'on a fait.** Retrait. Le contenu appartient au client.
**Résultat.** Règle ferme instaurée.
**Pourquoi.** On construit le tuyau, le client met sa voix dedans. Écrire à sa place, c'est fabriquer une dépendance et un contenu faux.
**Règle.** → R-14
**Réutilisable pour.** Toute app avec une partie éditoriale.

---

### EXP-013 · Les liens cassés signalés par des visiteurs
**BLOCAGE récurrent** · plusieurs dossiers

**Situation.** Des livrables partent avec des liens de navigation, CTA, mailto ou ancres non testés. Les visiteurs les découvrent avant nous.
**Ce qu'on a fait.** Checklist ferme : tous les liens testés avant tout envoi.
**Résultat.** Le point le plus détesté par Mac Arthur, désormais bloquant.
**Pourquoi.** Un lien cassé détruit la crédibilité plus vite qu'un design moyen ne la construit.
**Règle.** → R-15
**Réutilisable pour.** Tout livrable, sans exception.

---

### EXP-014 · Doublons de catalogue en production
**DÉBLOCAGE** · août 2026 · C'Real

**Situation.** Trois doublons de catalogue en boutique, plus une boutique Assists en double qui pointait vers le mauvais endroit.
**Ce qu'on a fait.** Retrait des doublons, redirection vers la vraie boutique.
**Résultat.** Corrigé, mais découvert tardivement.
**Pourquoi.** Les données de démonstration et les données réelles se mélangent quand on livre sans passe de nettoyage.
**Règle.** → R-16
**Réutilisable pour.** Toute mise en production d'une app avec catalogue.

---

### EXP-040 · La cliente réclamait une charte que notre cahier des charges contredisait
**DÉBLOCAGE** · 14/08/2026 · Club Élévia, recette des Modules 1 et 2

**Situation.** Élise CAPEL fait la recette de la Web App et envoie 16 points. Elle juge le travail « de très bonne qualité » et « conforme au périmètre », mais demande de « conserver partout le bleu nuit, l'or premium, le blanc et le gris clair ». **L'application était en noir et or**, et notre cahier des charges écrit « charte Noir & Or » **six fois, dont dans un critère d'acceptation signé**. Le réflexe naturel était de lui opposer le document.

**Ce qu'on a fait.** Ouvert son fichier logo, arrivé le jour même, et relevé les couleurs **au script plutôt qu'à l'œil** : bleu nuit `#00234B`, or `#A87726` à `#D9AC56`. Aucun bleu nulle part dans nos documents. Bascule de toute l'application sur sa charte, et on lui écrit qu'elle avait raison.

**Résultat.** Le point de friction devient un point de crédibilité. Trois autres corrections en sont sorties dans la foulée, dont un **contraste de bouton à 2,80:1** (texte blanc sur or) alors qu'elle demandait justement un contraste renforcé, corrigé à 6,52:1 en gardant l'or et en passant le texte en bleu nuit.

**Cause profonde.** Le cahier des charges n'avait pas tort par négligence : **il a été rédigé avant que le logo existe.** Il décrivait une identité que nous avions choisie à sa place, faute d'en avoir une. Un document antérieur à l'identité du client n'engage pas le client sur son identité. Et ce n'est pas un accident de dossier : **la création de charte et de logo est explicitement hors de nos prestations**, donc la charte vient toujours du client, par construction, et rien ne garantit qu'elle arrive avant nos documents.

**Ce que ça dit de plus large.** Opposer son propre document à un client est confortable et souvent juste, mais il faut d'abord **comparer les dates des deux pièces**. Le document le plus ancien perd sur ce qu'il ne pouvait pas savoir.

**Règles nées de là** : R-72, et l'extension de R-24 au contraste des textes d'interface.
**Réutilisable pour.** Tout dossier où le client fait faire son identité visuelle en parallèle du développement, et plus généralement toute contradiction entre une demande client et un document contractuel.

---

## SECTION C · TECHNIQUE ET INFRASTRUCTURE

### EXP-015 · Le deploy qui ne se voit pas
**DÉBLOCAGE définitif** · Cloudflare Pages

**Symptôme.** Le site ne se met pas à jour après `wrangler pages deploy`. Les changements apparaissent sur une URL preview mais pas sur le domaine.
**Cause.** wrangler déploie sur `master` (preview) par défaut. La branche de production Pages est `main`.
**Fix.** `npx wrangler pages deploy . --project-name [projet] --branch=main --commit-dirty=true`
**Règle.** → R-17

---

### EXP-016 · Error 522 qui revient
**DÉBLOCAGE définitif** · Cloudflare

**Symptôme.** Error 522 après quelques jours ou après un changement DNS.
**Cause.** CNAME en mode « DNS only » alors que le Custom Domain n'est pas déclaré dans le dashboard Pages.
**Fix.** Dans cet ordre strict : 1) Pages → Custom Domains → ajouter le domaine, 2) attendre le statut Actif, 3) seulement ensuite passer les CNAME en Proxied. L'ordre inverse garantit le 522.
**Règle.** → R-18

---

### EXP-017 · XSS sur les apps métiers statiques
**DÉBLOCAGE définitif** · session 75 · My Nugo

**Symptôme.** Données Supabase injectées dans `innerHTML` par concaténation de chaînes.
**Cause.** Pattern `element.innerHTML = '<p>' + data.champ + '</p>'`.
**Fix.** DOM API obligatoire : `createElement` + `textContent` + `appendChild`. Attributs via `setAttribute`. Handlers via `addEventListener`. IDs venant de la base validés par regex. Seule exception tolérée : `container.innerHTML = ''` pour vider.
**Référence.** `livrables/clients/my-nugo/index.html`, fonctions `renderHero` et `renderProduits`.
**Règle.** → R-19

---

### EXP-018 · N'importe qui pouvait devenir admin
**DÉBLOCAGE critique** · RLS Supabase

**Symptôme.** Policy RLS de self-update sans restriction de colonne : un utilisateur pouvait modifier son propre rôle et devenir admin.
**Cause.** `USING (auth.uid() = id)` sans contrainte sur les colonnes modifiables.
**Fix.** Déclencheur `BEFORE UPDATE` qui bloque toute modification des colonnes sensibles.
**Reste à faire.** Auditer les autres apps clientes sur le même pattern.
**Règle.** → R-20

---

### EXP-019 · Le projet Supabase est partagé
**BLOCAGE structurel** · transverse

**Situation.** `auth.users` est commune à Attractor Assists et à 8 dossiers clients. 14 fichiers SQL codent des UID en dur.
**Conséquence.** Toute suppression de comptes en masse casse plusieurs applications en production simultanément.
**Règle.** → R-21
**Réutilisable pour.** Toute opération de maintenance sur la base. Vérifier l'impact multi-dossiers avant.

---

### EXP-020 · L'appel qui échoue en silence
**DÉBLOCAGE** · edge functions

**Symptôme.** Un appel navigateur vers une edge function ne fait rien, sans erreur visible, surtout en fire-and-forget.
**Cause.** CORS non géré, requête préflight `OPTIONS` non traitée.
**Fix.** Toute edge function appelée depuis le navigateur gère CORS et répond à `OPTIONS`.
**Règle.** → R-22

---

### EXP-021 · Le bug mobile qu'on n'arrivait pas à reproduire
**DÉBLOCAGE méthodologique**

**Situation.** Bug signalé sur mobile, non reproductible en local. Plusieurs hypothèses testées à l'aveugle.
**Ce qu'on a fait.** Instrumentation (télémétrie `client-log`) pour mesurer la vraie cause au lieu de deviner.
**Résultat.** Cause identifiée par la donnée.
**Pourquoi.** Deviner coûte plus cher que mesurer, à partir de la deuxième hypothèse.
**Règle.** → R-23
**Réutilisable pour.** Tout bug non reproductible.

---

### EXP-022 · Deux couleurs de charte qui n'en font qu'une
**DÉBLOCAGE** · design system

**Situation.** L'orange et le vert de la charte Attractor se confondent en protanopie. Invisible à l'œil nu pour un voyant standard.
**Ce qu'on a fait.** Validation de toute palette de graphique par script, jamais à l'œil.
**Règle.** → R-24
**Réutilisable pour.** Tout graphique, tout tableau de bord.

---

### EXP-023 · Le Worker et le projet Pages du même nom
**DÉBLOCAGE** · demo.agenceattractor.com

**Symptôme.** Déploiements sans effet visible sur demo.agenceattractor.com.
**Cause.** Il existe un Worker et un projet Cloudflare Pages portant le même nom. Le domaine pointe sur le projet Pages.
**Fix.** Toujours `wrangler pages deploy`, jamais `wrangler deploy`.
**Règle.** → R-25

---

### EXP-024 · Les documents imprimés coupés en deux
**DÉBLOCAGE** · devis et rapports HTML

**Symptôme.** Blocs coupés au milieu d'une page à l'impression, contenus tronqués.
**Fix.** `break-inside: avoid` et `overflow: visible` en `@media print` sur tout document HTML destiné à être imprimé, dès la création.
**Règle.** → R-26

---

### EXP-041 · L'inscription ne partait jamais, et l'absence de trace a été mal lue
**DÉBLOCAGE** · 19/08/2026 · Club Élévia, Module 1

**Situation.** Mac Arthur signale deux fois en deux jours que le code de connexion n'arrive pas à l'inscription. Le tuyau d'envoi était pourtant prouvé fonctionnel : la cliente s'était connectée avec succès la nuit précédente, code accepté par le service d'envoi et consommé 22 secondes plus tard.

**Le défaut.** L'écran de bienvenue remplaçait le contenu de la page, **puis** le code lisait `$("#i-optin").checked` pour construire la requête. La case n'existait plus. `null.checked` levait une exception, dans un gestionnaire asynchrone, donc **avalée sans rien afficher**. Introduit le 14/08, en ligne du 17 au 19.

**Ce que ça produisait, exactement.** Rien. Aucune requête, aucune ligne en base, aucun message. Le visiteur restait indéfiniment sur « Nous envoyons votre code sécurisé » à attendre un e-mail qui n'avait jamais été demandé.

**La première erreur de diagnostic, et c'est la vraie leçon.** Au premier signalement, la base ne montrait aucune trace de l'inscription, seulement une ligne de demande de code venue du bouton de connexion. La conclusion rendue a été « il n'y a pas de panne, tu t'es trompé de bouton ». C'était faux : **zéro trace ne signifiait pas une erreur d'usage, mais que la requête n'était jamais sortie du navigateur.** L'instrumentation était bonne, la lecture ne l'était pas. Le défaut est resté en ligne deux jours de plus.

**Ce qu'on a fait.** Lecture de toutes les valeurs du formulaire avant le changement d'écran, appel enveloppé pour ramener au formulaire en cas d'imprévu, et **filet global** sur `error` et `unhandledrejection` qui affiche le message à l'écran avec le détail en mode recette. Preuve par pilotage du formulaire complet dans un navigateur, réseau intercepté : la requête part avec tous ses champs. Vérification faite qu'aucune autre lecture du DOM ne suit un changement d'écran dans le fichier.

**Cause profonde.** Deux causes, et la seconde est la plus chère. Techniquement, **un écran de chargement détruit le formulaire qu'on n'a pas fini de lire**. Méthodologiquement, **l'hypothèse de l'erreur d'usage est la plus flatteuse pour celui qui a écrit le code, donc celle qu'il faut examiner en dernier.**

**Règles nées de là** : R-74, et l'extension de R-23 sur la lecture d'une absence de mesure.
**Réutilisable pour.** Tout parcours qui affiche un écran d'attente pendant un appel réseau, et tout signalement de panne où la base ne montre rien.

---

### EXP-042 · La base a été migrée avant le code qui la lit, la plateforme est tombée
**BLOCAGE** · 13/09/2026 · La Beynaumania, Serge Beynaud

**Situation.** Refonte du fil de la Beynaumania façon Instagram. Les cœurs et les commentaires ne visaient qu'un « mot de Serge », par une colonne `message_id` liée en dur. Il fallait les généraliser à n'importe quel post pour qu'une photo se like et qu'une vidéo se commente.

**Ce qu'on a fait, et dans le mauvais ordre.** La migration a été écrite, exécutée et vérifiée en base : colonne `message_id` supprimée, remplacée par un couple `(cible_type, cible_id)`, 6 cœurs et 3 commentaires repris sans perte. Le travail a ensuite continué sur la fonction serveur, **qui n'était pas encore déployée**.

**Résultat.** Pendant une vingtaine de minutes, la fonction en production a continué d'interroger une colonne disparue. La réponse n'était plus une liste mais un objet d'erreur, le parcours de cette réponse levait une exception, et le fil est revenu vide. **Mac Arthur a signalé le défaut de lui-même : « les visuels ont disparu », et sa publication depuis le tableau de bord ne s'affichait plus.** Rien n'a été perdu en base : ce qu'il avait publié pendant la panne est réapparu à la réparation.

**Comment ça a été rattrapé.** La nouvelle fonction a été rendue **compatible avec l'ancien écran** avant d'être déployée : elle renvoie le nouveau fil et, à côté, les anciennes listes séparées alimentées par les mêmes calculs. Service rétabli sans attendre la refonte de l'écran, qui a pu continuer tranquillement derrière.

**Cause profonde.** Une migration et le code qui la lit forment **un seul déploiement, pas deux**. Tant qu'ils sont séparés dans le temps, il existe une fenêtre où la production lit un schéma qui n'existe plus. La faute n'est pas d'avoir migré, c'est d'avoir migré **en soustrayant** : une migration qui ajoute ne casse jamais rien, une migration qui retire casse tout ce qui n'a pas été redéployé.

**Le signal qu'il ne faut pas mal lire.** « Ça ne s'affiche plus alors que je publie » ne dit pas que la publication est cassée. Ici l'écriture fonctionnait parfaitement, c'est la lecture qui échouait. Même famille que EXP-041 : le symptôme désigne rarement l'organe.

**La récidive, le soir même.** Quelques heures après avoir écrit R-77, la même erreur a été refaite sur le même dossier, sous une autre forme : une colonne `NOT NULL` ajoutée **avant** sa valeur par défaut. Le code en ligne n'envoyait pas ce champ, donc **toutes les inscriptions ont échoué** le temps de s'en apercevoir. Ce n'est plus la même manipulation, c'est la même famille : **une contrainte posée avant que le code sache la satisfaire**. Ce qui prouve qu'écrire la règle ne suffit pas, il faut la relire au moment d'écrire un `alter table`.

**Règle née de là** : R-77, dans ses deux volets, retrait de colonne et ajout de contrainte.
**Réutilisable pour.** Toute migration qui retire, renomme, ou **contraint** sur une application déjà en ligne, sur le projet Supabase partagé en particulier.

---

### EXP-043 · Trois défauts invisibles à la relecture, tous trouvés en pilotant un navigateur
**DÉBLOCAGE** · 13-14/09/2026 · La Beynaumania

**Situation.** Nuit de refonte complète de la plateforme : aperçu avant inscription, fil unique, inscription à un champ, notifications, concours, lien d'accès. Neuf migrations, une dizaine de déploiements, en aller-retour avec Mac Arthur qui testait sur son téléphone.

**Ce qui a été fait à chaque étape.** Plutôt que relire le code, une page de recette était copiée dans un bac à sable, la session d'un vrai membre y était injectée, et un navigateur sans interface la rendait pour de bon, contre la vraie base. Une sonde lisait ensuite le résultat : nombre de posts, éléments qui débordent, boutons trop petits, erreurs JavaScript.

**Ce que ça a trouvé, et qu'aucune relecture n'avait vu.**
1. **La carte des notifications ne s'affichait jamais.** `navigator.serviceWorker.ready` ne rejette pas quand il n'y a pas de service worker, elle reste suspendue, et arrête tout le code qui suit. **Aucune exception, aucune trace.** Le `try/catch` autour ne servait à rien.
2. **Le lecteur vidéo avait entièrement disparu.** Une suppression par bornes textuelles, censée retirer une fonction, avait emporté le bloc voisin qui s'était glissé entre les deux bornes au fil des modifications. Le fil ne s'affichait plus, et c'était déjà en ligne.
3. **La ligne du concours s'écrivait deux fois.** La fonction, appelée deux fois au démarrage, vidait la zone **avant** d'attendre la réponse réseau : les deux appels vidaient d'abord, puis écrivaient chacun au retour.

**Ce que la mesure a aussi corrigé.** Un audit de largeur dans un cadre imposé à 360 px, Chrome sans interface refusant de descendre sous 489, a montré zéro débordement mais **quatre zones tactiles sous 44 px**, dont un bouton de déconnexion à 14 px, en place depuis juillet.

**Cause profonde.** Ces trois défauts ont un point commun : **ils ne produisent aucune erreur.** Une promesse suspendue, du code supprimé qui n'est appelé que plus tard, une course entre deux affichages. La relecture ne les voit pas parce qu'il n'y a rien à voir : le code est syntaxiquement juste et se lit bien. **Seul le rendu réel les révèle.** Le contrôle statique dit ce qui est écrit, il ne dit pas ce qui se passe.

**Le corollaire, plus dur.** Enchaîner des modifications structurelles sans recette entre chaque, c'est empiler des défauts silencieux. Les deux régressions sur trois avaient été introduites par la simplification elle-même, quelques minutes plus tôt.

**Règles nées de là** : R-78 (la promesse qui ne rejette jamais), et la confirmation de R-69, le contrôle avant mise en ligne se lance, il ne se récite pas.
**Réutilisable pour.** Toute refonte front-end en plusieurs étapes, et tout écran qui dépend d'une API du navigateur.

---

### EXP-044 · Une ligne visant un bouton qui n'existait pas a vidé la page, et l'artiste avait le lien
**BLOCAGE** · 14/09/2026 · La Beynaumania

**Situation.** Mac Arthur ouvre la plateforme sur son iPhone, en 5G, et envoie une capture : après le bouton « Voir ce qui se passe », un écran noir, le titre, et une mention « Effacer mon compte » qui n'a rien à faire là. Sa phrase : « Serge Beynaud a eu le lien, ce serait dommage que ça bug. »

**Le défaut.** Une seule ligne, dans la fonction qui peint l'aperçu du visiteur : `document.getElementById('conc').classList.add('hidden')`. **Cet identifiant n'a jamais existé dans la page.** Le concours y vit sous deux autres noms, et à l'intérieur d'une carte déjà masquée deux lignes plus haut. La ligne était donc inutile en plus d'être fausse.

**L'ampleur, hors de toute proportion avec la cause.** L'exception remontait hors de la fonction et emportait les trois instructions suivantes du démarrage : le clip ne se lançait pas, le squelette du fil ne se posait pas, **et les publications n'étaient jamais demandées**. Le visiteur tombait sur un vide noir. Seule la ligne d'avant, qui masquait la cloche, avait eu le temps de s'exécuter : d'où le « Effacer mon compte » resté à l'écran, qui est le seul indice visible de l'endroit exact où le code s'est arrêté.

**Ce qui l'a caché.** Le défaut ne touchait **que le parcours du visiteur**. Mac Arthur et l'agence testaient avec une session déjà en mémoire, donc sur l'autre branche du démarrage, celle du membre. Le seul écran que voit un inconnu, c'est-à-dire le seul qui convertit, était le seul jamais parcouru. Et il était en ligne avec le lien déjà entre les mains de l'artiste.

**Le diagnostic.** Le même parcours a été rejoué dans un navigateur piloté, en iPhone, sur la version en ligne puis sur la version corrigée : `Cannot read properties of null`, zéro publication, « Effacer mon compte » visible d'un côté ; trois publications, la porte d'inscription et aucune erreur de l'autre. **La capture de Mac Arthur a été reproduite à l'identique avant d'écrire la moindre correction.**

**Cause profonde.** Une fonction d'affichage s'écrit comme une suite d'ordres, et se lit comme si chacun était indépendant. Il n'en est rien : **le premier qui échoue annule tous les suivants, en silence.** Renommer un bouton, déplacer un bloc, supprimer une section suffit à transformer une ligne cosmétique en panne totale de l'écran. Même famille qu'EXP-041 et R-78 : le symptôme, un vide, ne désigne jamais l'organe.

**Ce que ça dit du contrôle.** EXP-043 avait établi la veille qu'on pilote un navigateur au lieu de relire. La leçon avait été appliquée à l'écran du membre, **pas à celui du visiteur**. Une recette qui ne couvre pas le parcours qui rapporte de l'argent ne couvre rien.

**Règles nées de là** : R-83 (une peinture d'écran ne dépend d'aucun nœud, et le contenu ne dépend pas de la peinture) et R-84 (le parcours de l'inconnu se teste en premier).
**Réutilisable pour.** Toute application où le même écran sert deux publics, et toute recette qui se lance depuis une session déjà ouverte.

---

### EXP-045 · Un second thème double le nombre de couleurs, et l'audit qui rassure est celui qui saute des blocs
**RÉUSSITE** · 14/09/2026 · La Beynaumania

**Situation.** Mac Arthur demande une bascule clair / sombre sur le fil du fan et sur le pilotage de Serge. Deux applications entièrement dessinées en noir et rouge depuis l'origine, et en production, l'une avec le lien déjà chez l'artiste.

**Ce qui a été fait.** Un seul jeu de jetons change, aucune règle de mise en page n'est dupliquée. Le thème se pose sur `<html>` par quatre lignes dans le `<head>`, avant la première peinture : lu plus tard, l'écran clignote en noir avant de passer en clair. Le choix vit dans le navigateur, la couleur de la barre du téléphone suit.

**Le calcul a contredit l'œil, deux fois.** L'or de la charte `#D4A017` fait **2,1:1 sur du blanc**, illisible ; il descend à `#7A5906` pour le texte, l'aplat or ne bouge pas. Le rouge `#CC0000` tient sur du blanc (5,9:1) mais **pas sur un aplat rouge très pâle** : la pastille EN DIRECT tombait à 4,34:1. Le faire descendre à `#B80000` dans le seul mode clair a fait repasser toute la famille rouge d'un coup, au lieu de rattraper huit cas séparément.

**Le premier angle mort : épingler à la main.** Trois blocs portent une photo de Serge et doivent rester sombres dans les deux thèmes. Ils ont d'abord été traités en épinglant les couleurs une par une. **Trois ont été oubliées** : « Retrouver mon espace », « Revenir à l'aperçu » et le prénom du fan en rouge sur le bandeau devenaient sombres sur du sombre. La parade qui tient est de **redéclarer le jeu de jetons sombre à l'intérieur de ces blocs** : une règle, et tout ce qui y sera écrit plus tard est juste d'office.

**Le second angle mort, plus grave : l'audit sautait ces blocs.** L'outil de mesure écrit pour l'occasion déclarait ces textes « non calculables » parce que la photo est portée par un frère en position absolue, donc invisible en remontant les parents. Il rendait « contraste OK » **sans les avoir regardés**. C'est en ouvrant une capture de l'écran d'inscription, à l'œil, que les trois couleurs oubliées sont apparues. L'outil censé remplacer l'œil avait besoin de l'œil pour être corrigé.

**Le troisième défaut, qu'aucun contrôle existant ne pouvait voir.** Ajouter un bouton de 44 px dans l'en-tête du pilotage faisait passer « LA BEYNAUMANIA » sur deux lignes. **Zéro débordement horizontal, zéro zone de tap trop petite, zéro contraste sous le seuil** : la checklist UX_SYSTEM passait entièrement, et l'en-tête doublait de hauteur.

**Ce qui a permis de livrer sans régression.** Chaque texte est mesuré **dans les deux thèmes**, et rangé sous une clé stable. Un manque de contraste devient alors deux choses différentes : une régression de la bascule, ou une dette antérieure. Résultat : **zéro régression**, 7 textes sous le seuil dans les deux thèmes et **44 en sombre seulement** — tous antérieurs, tous passants en clair. Sans cette comparaison, les 51 arrivaient dans le même tas et la bascule portait le chapeau.

**Un piège évité de justesse.** La première passe avait fondu plusieurs valeurs voisines dans un même jeton : `.08` et `.16` dans la piste, `.12` / `.15` / `.28` dans les bordures. Le mode clair était juste, et **le mode sombre en production avait discrètement changé**. Un thème qu'on ajoute ne touche pas celui qui existe.

**Cause profonde.** Un second thème ne double pas le travail de design, il **double la surface de vérification** : chaque couleur existe désormais dans deux contextes, et rien dans le code ne dit laquelle des deux est fausse. Le seul contrôle qui tient est celui qui mesure les deux et les compare. Et un outil de mesure qui a le droit de répondre « non calculable » **répond à côté** : tant qu'il saute une zone, il certifie ce qu'il n'a pas vu, ce qui est plus dangereux qu'une absence d'outil.

**Règles nées de là** : R-86 (un thème s'ajoute par les jetons, se mesure dans les deux sens, et ne touche pas l'existant) et extension de R-24 (un audit n'a pas le droit de sauter une zone).
**Réutilisable pour.** Toute bascule de thème, tout changement de charte sur une app en production, et toute recette automatisée qui rend un verdict global.

---

### EXP-048 · Un contrôle vert parce qu'il avait cessé de regarder, quatre fois dans la même journée
**BLOCAGE** · 19/09/2026 · latiss.net (ex-Beynaumania)

**Situation.** Journée de refonte lourde sur la plateforme fan : passage à trois onglets, déménagement sur le domaine propre, nouvelle porte d'inscription. La recette automatique, écrite en juillet, couvrait contraste, débordement et zones de tap sur six résolutions et deux thèmes. Elle est restée verte tout du long.

**Ce qui n'allait pas.** Quatre fois, un défaut réel est apparu **au moment précis où un contrôle a su regarder au bon endroit**, jamais avant.

| Ce qui a changé | Ce que la recette a cessé de voir | Ce qu'elle a trouvé dès qu'elle a su regarder |
|---|---|---|
| Trois onglets | 53 textes mesurés → **34** : un onglet fermé n'affiche rien, et ce qui n'est pas affiché n'est pas mesuré | 3 textes du compte à rebours à 4,40:1 |
| Jeton de gris corrigé surface par surface | rien : elle regardait la surface réparée | 3 autres textes à 4,45:1, dont les deux phrases de la carte qui convertit |
| Nouvelle porte d'inscription | la recette n'ouvrait **jamais** ce formulaire : elle mesurait l'aperçu, puis passait au membre | 2 textes à 2,67:1 et 2,5:1, et un lien de 131 × 15 px |
| Déménagement de domaine | elle pointait encore l'ancienne adresse, qu'elle aurait suivie en redirection sans rien dire | (attrapé avant) |

**Ce qu'on a fait.** Étendu la couverture à chaque fois **avant** de corriger le défaut, pour que la mesure prouve la correction. La recette parcourt maintenant les trois onglets et le formulaire d'inscription, dans les deux thèmes, et vérifie que la liste des lieux est réellement servie : vide, personne ne pourrait s'inscrire, et rien d'autre ne le dirait.

**Résultat.** De 34 à 97 textes mesurés côté fan. Sept défauts trouvés dans la journée, aucun par l'œil, sur une page travaillée une semaine durant.

**Pourquoi.** Un contrôle automatique mesure **ce qui est affiché au moment où il regarde**. Toute refonte qui déplace du contenu derrière un onglet, un dépliant, un écran ou un domaine **réduit sa couverture sans réduire son verdict**. Il reste vert, et le vert veut dire deux choses indiscernables : « j'ai regardé et c'est bon », ou « je n'ai rien regardé ». Un compteur de ce qui a été mesuré distingue les deux ; un verdict seul, non.

**Règle.** → R-87

**Réutilisable pour.** Toute refonte de navigation, tout déplacement d'écran, tout déménagement d'adresse, sur n'importe quel dossier client qui porte une recette automatique.

---

### EXP-047 · Connaître le numéro d'un fan suffisait à prendre son compte
**DÉBLOCAGE** · 19/09/2026 · latiss.net (ex-Beynaumania)

**Situation.** L'inscription ne demandait qu'un prénom. Le serveur savait pourtant reconnaître un numéro WhatsApp déjà enregistré pour éviter un doublon : il renvoyait alors le compte existant. Décision du jour : rendre le numéro obligatoire à la porte, pour tuer les doublons et constituer une base de contacts joignables.

**Ce qui n'allait pas.** Mac Arthur a posé la question qui tue : *« Je connais le numéro de Cynthia. Je rentre son numéro, et hop je suis connecté avec son compte ? »* Oui — et le serveur ne renvoyait pas une session, il renvoyait le **jeton d'accès personnel**, décrit dans le code lui-même comme « une clé porteuse : qui l'a, entre ». Deux lignes plus haut, un commentaire affirmait que ce dossier n'est jamais appliqué à quelqu'un d'autre : il décrivait une règle que le code ne tenait pas.

Le défaut **dormait**, puisque aucun écran n'envoyait de numéro. Ajouter le champ l'aurait réveillé : n'importe qui aurait pris n'importe quel compte en tapant un seul champ dans une page web.

**Ce qu'on a fait.** Refermé aux **deux** endroits — la vérification d'avance et le rattrapage quand deux inscriptions arrivent au même instant. Le serveur répond « ce numéro est déjà inscrit » et rien d'autre. Vérifié en production avec le vrai numéro d'un membre : aucun dossier renvoyé.

**Résultat.** Le champ a pu être ajouté le jour même sans ouvrir la porte. La vraie serrure — identifiant plus mot de passe choisi — est planifiée au moment où le fan a quelque chose à perdre : badge Ambassadeur ou achat.

**Pourquoi.** Un numéro de téléphone, une adresse email, un prénom sont des **identifiants** : ils désignent quelqu'un et circulent. Une **clé** est un secret que seul l'intéressé connaît. Confondre les deux ne se voit pas tant que personne ne saisit l'identifiant d'un autre, et devient un vol de compte le jour où on ajoute le champ qui le permet. Le défaut n'était pas dans le code du jour, il attendait dans celui d'avant.

**Règle.** → R-88

**Réutilisable pour.** Toute reprise de compte par téléphone ou email, tout « retrouver mon accès », tout lien de connexion sans mot de passe, sur n'importe quel produit de l'écosystème.

---

### EXP-046 · Un gris calé au centième près sur une seule surface
**DÉBLOCAGE** · 19/09/2026 · latiss.net (ex-Beynaumania)

**Situation.** Le jeton `--dim`, le gris des textes atténués, rendait 4,53:1 sur le fond de la page — juste au-dessus du seuil de 4,5.

**Ce qui n'allait pas.** Posé sur une carte un peu plus claire, le même jeton tombait à 4,40:1. Sur une carte teintée de rouge, à 4,45:1. Soit **sous le seuil partout sauf à l'endroit où il avait été calé**. Corrigé une première fois carte par carte, il est ressorti deux heures plus tard sur trois autres textes, dont les deux phrases de la carte qui transforme un visiteur en membre.

**Ce qu'on a fait.** Relevé le jeton à la racine plutôt que surface par surface, et mesuré sur les trois fonds : 4,95 sur la page, 4,94 sur la carte rouge, 4,84 sur la carte claire. Même famille de défaut le soir même sur l'écran d'entrée, qui reste noir dans les deux thèmes : les jetons du thème clair y mentaient sur leur fond, et le rouge sombre y tombait à 2,67:1.

**Résultat.** Deux écrans entiers repassés au vert. Aucun de ces textes n'avait été signalé à l'œil.

**Pourquoi.** Un jeton de couleur n'a pas de contraste : il en a un **par fond**. Le valider sur une seule surface, et au centième près, produit un jeton qui n'est pas calé mais chanceux. Et un jeton de thème ne vaut que sur une surface qui **change** de thème : posé sur une photo sous voile sombre, qui reste noire dans les deux modes, il désigne une couleur pensée pour un fond qui n'existe pas là.

**Règle.** → R-89

**Réutilisable pour.** Toute charte à jetons, tout passage clair/sombre, tout écran à image de fond, sur n'importe quel livrable.

---

## SECTION D · PILOTAGE ET DISCIPLINE

### EXP-025 · L'automatisation morte que personne n'a vue
**BLOCAGE** · 13/07/2026 · n8n

**Situation.** n8n sur Railway, 2 workflows seulement, hors service depuis environ deux semaines sans alerte.
**Ce qu'on a fait.** Constat, puis priorité donnée à la fiabilisation (clé d'encryption) avant de construire l'inbound.
**Pourquoi.** Une automatisation sans supervision est une dette, pas un actif. On croit être couvert alors qu'on ne l'est pas.
**Règle.** → R-27
**Réutilisable pour.** Tout workflow automatisé, tout agent programmé.

---

### EXP-026 · Les dossiers sortis du champ de vision
**BLOCAGE puis DÉBLOCAGE** · juillet-août 2026 · radar

**Situation.** C'Real, Rukayatou, XPaye puis Cari Immobilier avaient disparu du radar sans décision explicite. Aucun n'était clos, aucun n'avançait.
**Ce qu'on a fait.** Bloc Radar dans chaque `DOSSIER.md`, commande `/radar`, agent cloud le lundi 7h.
**Résultat.** Les quatre dossiers retrouvés.
**Pourquoi.** Un dossier ne meurt pas d'une décision, il meurt d'un oubli. L'oubli ne se combat pas par la volonté, il se combat par un dispositif.
**Règle.** → R-28
**Réutilisable pour.** Tout portefeuille de plus de 5 dossiers.

---

### EXP-027 · La complexité qui cache une erreur cinq jours
**BLOCAGE** · Air Côte d'Ivoire

**Situation.** Plusieurs documents décrivant le même dossier, un chiffre présent à plusieurs endroits. Une erreur est restée invisible cinq jours.
**Ce qu'on a fait.** Un seul document source par dossier, un chiffre à un seul endroit.
**Pourquoi.** La duplication d'information n'est pas de la redondance protectrice, c'est une garantie de divergence.
**Règle.** → R-29
**Réutilisable pour.** Tout dossier avec des chiffres.

---

### EXP-028 · Dix-huit articles écrits, zéro publié
**BLOCAGE** · Vies Croisées

**Situation.** Site en production sur viescroiseesci.com, 18 articles rédigés, aucun publié.
**Pourquoi.** La production est confortable, la publication est exposante. Sans date de publication engagée, le stock grossit et ne sort jamais.
**Règle.** → R-30
**Réutilisable pour.** Tout chantier de contenu.

---

### EXP-029 · Le chantier fini à 90 % qu'on abandonne
**BLOCAGE récurrent** · Facebook Login, WhatsApp Cloud API

**Situation.** Facebook Login : code écrit, configuration Supabase et Meta jamais terminée, dossier annulé le 29/06/2026. WhatsApp Cloud API : investissement fait, mis au frigo le 13/07/2026 au profit de wa.me et du chat web.
**Résultat.** Deux abandons assumés, mais après avoir payé le coût de développement.
**Pourquoi.** Le coût d'un chantier ne se paie pas au démarrage, il se paie aux 10 % restants. Ouvrir un chantier sans avoir vérifié que la dernière étape est franchissable, c'est acheter le développement sans acheter le résultat.
**Règle.** → R-31, R-32
**Réutilisable pour.** Toute intégration dépendant d'une validation externe (store, API tierce, vérification de compte).

---

### EXP-030 · Douze chantiers ouverts en même temps
**BLOCAGE structurel** · Attractor Assists

**Situation.** État des lieux montrant plus de 12 chantiers simultanés, aucun clos.
**Ce qu'on a fait.** Règle « une chose à la fois en production », puis dispositif de discipline (1 filtre, rituel hebdo du dimanche 21h-22h, 1 métrique).
**Pourquoi.** Un chantier ouvert consomme de l'attention même quand on n'y travaille pas. Douze chantiers ouverts, c'est zéro capacité de décision.
**Règle.** → R-33
**Réutilisable pour.** Toute phase de dispersion.

---

### EXP-031 · Le temps disponible n'est pas là où on le croit
**DÉBLOCAGE** · contraintes réelles

**Situation.** Planification faite comme si le temps de travail était homogène. En réalité : environ 10h par semaine de trajet avec le téléphone seulement, ordinateur disponible au midi-deux et le soir.
**Ce qu'on a fait.** Tri de toute action par appareil disponible avant de la planifier.
**Pourquoi.** Une tâche qui demande un ordinateur planifiée sur un créneau téléphone n'est pas une tâche en retard, c'est une tâche impossible.
**Règle.** → R-34
**Réutilisable pour.** Toute planification, tout emploi du temps.

---

### EXP-032 · L'espace de pilotage qui rend la consultance tangible
**RÉUSSITE** · août 2026 · Festival des Grillades Paris

**Situation.** Une mission de conseil est invisible pour le client. Il paie sans voir ce qui se passe entre deux réunions.
**Ce qu'on a fait.** Espace de pilotage tracé, déployé par projet : séances, relevé PDF, validation des parties.
**Résultat.** Premier exemplaire livré sur le Festival des Grillades.
**Pourquoi.** La consultance se dévalue quand elle n'est pas traçable. Un livrable visible transforme une prestation intellectuelle en actif.
**Règle.** → R-35
**Réutilisable pour.** Toute mission de conseil, tout accompagnement récurrent.

---

### EXP-033 · Trois défauts que seul un vrai téléphone a montrés
**DÉBLOCAGE définitif** · 06/08/2026 · Club Élévia, vérification vidéo

**Situation.** Module de vérification par vidéo livré. Quinze contrôles automatisés passaient : dépôt, file de modération, décision, purge, droits d'accès. Tout était vert.
**Ce qu'on a fait.** Mac Arthur a ouvert la page sur son iPhone et a fait une vraie vidéo.
**Résultat.** Trois défauts en trois minutes. (1) **L'envoi échouait** : Safari annonce `video/mp4;codecs=avc1...` et le stockage compare le type à l'identique, le suffixe de codec faisait refuser le dépôt. (2) **`[object PointerEvent]` s'affichait en bandeau rouge** : une fonction d'écran branchée directement sur un clic reçoit l'événement du navigateur en guise de message d'erreur. (3) **8,3 Mo pour 8 secondes** de vidéo, mesuré sur le fichier réellement déposé.
**Pourquoi.** Les tests automatisés vérifient la plomberie, c'est-à-dire ce que le développeur a imaginé. Ils ne traversent jamais le navigateur réel, ses codecs, ses événements et sa caméra. Les trois défauts se tenaient exactement là où le script ne passe pas.
**Règle.** → R-51, R-52
**Réutilisable pour.** Tout livrable mobile, en particulier caméra, micro, géolocalisation, paiement, partage.

---

### EXP-034 · Huit mégaoctets qu'une cliente en 4G n'enverra jamais
**BLOCAGE évité** · 06/08/2026 · Club Élévia

**Situation.** Vidéo de vérification de 8 secondes, enregistrée sans plafond de débit. Poids constaté : 8,3 Mo.
**Ce qu'on a fait.** Débit plafonné à 800 kb/s, soit moins d'un mégaoctet, avant toute mise devant un client.
**Résultat.** Envoi immédiat, netteté toujours largement suffisante pour reconnaître un visage et un geste.
**Pourquoi.** La cible d'Élévia est une diaspora qui se connecte en 4G africaine ou en itinérance. Un envoi de 8 Mo échoue régulièrement, et l'utilisateur n'en conclut pas « ma connexion est lente », il conclut « cette application ne marche pas ». **Le poids d'un média est une décision commerciale, pas un détail technique.**
**Règle.** → R-52
**Réutilisable pour.** Toute photo, vidéo ou pièce jointe envoyée depuis un mobile, sur tous les dossiers CI et diaspora.

---

### EXP-035 · L'attrape-tout qui tuait les liens clients un par un
**DÉBLOCAGE définitif** · 05/08/2026 · demo-site, All Eyes on yoo

**Situation.** Mac Arthur signale que les liens du demo-site tombent sur « Boutique introuvable », « presque chaque fois ».
**Ce qu'on a fait.** Mesuré au lieu de supposer : test des 31 dossiers déployés, un par un, contre le site en ligne.
**Résultat.** Un seul cassé, mais c'était **le lien de closing d'All Eyes on yoo**, envoyé le 30/07 et resté sans réponse depuis. La dernière règle du `_redirects` renvoyait toute adresse de premier niveau non déclarée vers Assists. Elle ne protégeait que deux comptes de test. Supprimée, page 404 ajoutée, 32 adresses revérifiées.
**Pourquoi.** Une règle générique placée en dernier recours capture tout ce qu'on oublie de déclarer. Les trente lignes du fichier n'étaient pas une configuration, **c'était la liste des oublis déjà rattrapés**. Et le silence d'une prospecte avait été lu comme un désintérêt commercial alors que c'était une page d'erreur.
**Règle.** → R-53
**Réutilisable pour.** Tout routage à motif générique, et tout silence client inexpliqué après l'envoi d'un lien.

---

### EXP-036 · La suppression qu'on ne peut pas prouver ne vaut rien
**RÉUSSITE** · 06/08/2026 · Club Élévia, RGPD

**Situation.** Le contrat promet la suppression des vidéos de vérification dans les 24 h suivant la décision, « de façon vérifiable ».
**Ce qu'on a fait.** Horodatage de purge écrit **seulement après** l'effacement réel du fichier, jamais avant. Puis, sur remarque de Mac Arthur, ajout d'une **borne absolue à 30 jours** pour les demandes que personne ne traite.
**Résultat.** L'effacement est démontrable ligne par ligne, et la durée de conservation ne dépend plus de la diligence de l'équipe cliente.
**Pourquoi.** Un fichier simplement absent ne prouve rien : il peut avoir été déplacé, ou n'avoir jamais existé. Et une purge adossée à une décision humaine n'est **pas** une durée de conservation : sans second plafond, une donnée sensible oubliée dans une file y reste indéfiniment.
**Règle.** → R-54
**Réutilisable pour.** Toute donnée sensible à durée de vie limitée : pièces d'identité, justificatifs, enregistrements, messages éphémères.

---

### EXP-037 · Relire la demande du client dans son texte, pas dans sa reformulation
**DÉBLOCAGE** · 06/08/2026 · Club Élévia

**Situation.** Une demande cliente est arrivée reformulée : « elle veut que les paiements se fassent au fur et à mesure ». Le travail engagé consistait à refaire le devis, donc à casser un scellement de signature en cours et à envoyer un troisième lien en une semaine.
**Ce qu'on a fait.** Lecture du mail original avant de produire quoi que ce soit.
**Résultat.** Ses mots exacts : « je souhaite simplement que nous **conservions** le principe prévu dans nos documents contractuels ». Elle ne demandait aucun changement. **Zéro document refait, scellement préservé.**
**Pourquoi.** Une reformulation de bonne foi, même par le décideur lui-même, transforme facilement une confirmation en demande de changement. Le coût de la vérification est de deux minutes, celui de l'erreur était un package contractuel entier.
**Règle.** → R-55
**Réutilisable pour.** Toute demande client rapportée à l'oral, résumée, ou transmise par un tiers, avant tout travail contractuel.

---

### EXP-039 · Le jeton d'administration fuitait à tous les participants
**DÉBLOCAGE** · 10/08/2026 · Festival des Grillades de Paris, espace de pilotage

**Situation.** L'espace de séance donne à chaque partie un lien qui vaut l'accès. Une migration ultérieure a ajouté à la même table un **jeton d'animation**, réservé à Mr Attractor, qui ouvre le rapport de connexions et surtout la **réinitialisation complète de la séance** : points, commentaires, informations, actions, journal et signatures.

**Ce qui n'allait pas.** La fonction de lecture, écrite **avant** cette migration, renvoyait `to_jsonb(seance) - 'jeton'`. Elle ne retirait donc pas la colonne qui n'existait pas encore. Résultat : le jeton d'animation partait dans la réponse d'un appel parfaitement normal, à Advantage comme à Thim, du 5 au 10 août. N'importe lequel des participants pouvait effacer le relevé de la séance qu'il venait de valider.

**Comment c'est trouvé.** Par hasard, en vérifiant tout autre chose : la question portait sur la mise à jour des informations attendues, ce qui a conduit à relire ce que la fonction de lecture renvoyait réellement. Aucun test ne le cherchait.

**Ce qu'on a fait.** Retrait explicite de la colonne, **rotation du jeton compromis** (réparer la fonction ne suffit pas, le secret a circulé), et garde-fou en base : la réinitialisation est désormais refusée dès qu'une validation existe. Les trois points vérifiés à la clé anonyme, pas au service role.

**Cause profonde.** `to_jsonb(ligne) - 'secret'` est une **liste noire**. Une liste noire ne connaît que les colonnes existant au moment où on l'écrit. Toute colonne sensible ajoutée plus tard est exposée par défaut, en silence, sans erreur.

**Règles nées de là** : R-62, R-63, R-64.

---

### EXP-038 · Sortir une cliente réelle d'un produit qu'on vient de mettre en pause
**DÉBLOCAGE** · 07/08/2026 · C'Real / Attractor Assists

**Situation.** Attractor Assists est passé en pause le 06/08. Or toute la boutique de Marie Kezey en dépendait : son catalogue, son assistante, ses conversations et ses commandes vivaient dans les tables partagées du produit. Elle lançait sa communication au même moment. Un produit en pause ne se débranche pas, mais il ne s'entretient plus non plus.
**Ce qu'on a fait.** Tables `cr_` dédiées, une edge function, migration des données, et bascule des trois appels de sa page en un seul déploiement. Puis le tableau de bord qu'elle n'avait jamais eu.
**Résultat.** Trois trouvailles que la sortie a révélées, et qu'on ne cherchait pas. **Un plafond invisible** : son plan gratuit refusait d'enregistrer au-delà de 20 commandes par mois, en silence, la 21e serait arrivée sur son téléphone sans jamais apparaître nulle part. **Un catalogue à moitié faux** : les fiches vivaient en dur dans le JavaScript, le produit ne synchronisait que le prix, donc désactiver un article ne le retirait pas de la boutique. **Une page 404 absente** : le domaine servait la boutique sur n'importe quel chemin, en code 200.
**Pourquoi.** Mettre un produit en pause ne suspend pas les engagements pris envers ceux qui s'en servent. La dette ne disparaît pas, elle change de propriétaire. Et l'extraction est le moment où l'on voit enfin ce que la dépendance cachait : trois défauts dormaient depuis des mois derrière un système qui « marchait ».
**Règle.** → R-56
**Réutilisable pour.** Tout produit interne mis en pause, arrêté ou remplacé, dont un client réel dépend encore.

---

## Comment ajouter une fiche

Copier ce gabarit, numéroter à la suite, classer dans la bonne section :

```
### EXP-0XX · [Titre en une phrase, ce qui s'est réellement passé]
**RÉUSSITE | BLOCAGE | DÉBLOCAGE** · [date] · [dossier]

**Situation.** [le contexte en 2 lignes]
**Ce qu'on a fait.** [l'action]
**Résultat.** [le fait, chiffré si possible]
**Pourquoi.** [la cause profonde, pas le symptôme]
**Règle.** → R-XX [ou : aucune règle, cas isolé]
**Réutilisable pour.** [dans quelle situation ressortir cette fiche]
```

Le champ **Pourquoi** est le seul qui compte vraiment. Une fiche sans cause profonde est une anecdote.

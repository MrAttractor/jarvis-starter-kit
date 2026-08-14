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

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

---

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

### R-15 · Zéro lien non testé
**Origine** : EXP-013.
**Application** : navigation, CTA, mailto, ancres, liens WhatsApp. Tous testés avant tout envoi. Règle bloquante.

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

---

## C · PRODUCTION TECHNIQUE

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

### R-23 · Mesurer avant de deviner
**Origine** : EXP-021.
**Application** : bug non reproductible, dès la deuxième hypothèse : instrumenter (télémétrie `client-log`) plutôt que tester à l'aveugle.

### R-24 · Toute palette validée au script
**Origine** : EXP-022, protanopie.
**Application** : l'orange et le vert de la charte se confondent pour certains daltonismes. Validation automatisée, jamais à l'œil. Voir la skill `dataviz`.

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

### R-61 · Un test lancé juste après un déploiement peut mentir
**Origine** : recette du 07/08/2026, page 404 servie en code 200.
**Application** : le cache d'un domaine sert encore l'ancienne réponse sur les adresses déjà visitées, alors que le déploiement direct répond correctement. Vérifier sur l'URL du déploiement, ou avec un paramètre anti-cache, avant de conclure à un défaut **comme avant de conclure à un succès**.

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

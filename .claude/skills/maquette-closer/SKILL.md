---
name: maquette-closer
description: Transforme un prospect (conversation, audit, notes) en 3 livrables de closing personnalisés — une interface cliquable aux couleurs du client, une simulation du parcours de SES clients, et un PDF de synthèse à laisser — prêts à présenter via un simple lien web (fini l'enregistrement d'écran d'un fichier HTML brut). Utilise cette skill dès que Mac Arthur parle d'un prospect, d'un client à convaincre, d'une démo ou d'une maquette à préparer, même s'il ne dit pas explicitement le mot "maquette". Exemples de déclencheurs : "j'ai un nouveau prospect dans la restauration", "prépare une démo pour Olive", "montre-lui à quoi ressemblerait son app", "maquette pour [client]", "/maquette-closer". C'est le mécanisme de vente "maquette-first" prouvé de l'agence Mr Attractor : montrer une maquette concrète déclenche l'intérêt et le closing.
---

# Maquette-Closer

## Pourquoi cette skill existe

Le mécanisme de vente le plus efficace de l'agence est simple et prouvé sur le terrain : pendant un échange avec un prospect, lui montrer une maquette concrète de SON application déclenche l'intérêt et le closing, là où un discours seul échoue. Un client accompagné pendant 4 ans a acheté le jour où il a vu une maquette.

Cette skill industrialise ce mécanisme et produit, à partir d'un seul prospect, **3 livrables personnalisés** :
1. **L'interface** : une maquette cliquable et crédible, aux couleurs et au métier du client — ce que LUI voit et pilote.
2. **Le parcours client** : une simulation de ce que vivent SES PROPRES clients (découverte, questions, commande, suivi) — c'est ce qui fait dire au prospect "ça, c'est exactement ce qui me prend mon temps aujourd'hui".
3. **Le PDF** : un document de synthèse à laisser, qui résume le problème, la solution montrée et l'offre chiffrée — pour que le prospect garde une trace et puisse en parler à son associé ou son conjoint.

Le tout présenté via un lien web propre, jamais un fichier brut envoyé tel quel.

Le point de douleur à éliminer : avant, Claude générait un fichier HTML que Mac Arthur n'osait pas envoyer, donc il filmait son écran. Ce n'est pas vendeur. Tout ce qui sort de cette skill doit devenir un lien que le prospect ouvre sur son téléphone et touche directement.

Garde en tête en permanence : c'est un outil de CLOSING, pas un projet de développement. L'objectif est de déclencher un "oui" et un acompte, pas de livrer l'app finale. Reste rapide, crédible, simple — sur les 3 livrables comme sur un seul.

## Étape 1 — Remplir la fiche prospect

Avant de construire quoi que ce soit, structure ce que tu sais déjà dans une fiche prospect. C'est l'entrée commune aux 3 livrables : la remplir une fois évite de tout reconstruire de mémoire à chaque étape, et donne à Mac Arthur une trace réutilisable.

Gabarit complet : `references/fiche-prospect.md`. Il tient en 4 blocs :
1. Identité & marque (nom, secteur précis, logo/couleurs, ton)
2. Le client de mon client (qui ils sont, ce qu'ils achètent vraiment, leurs questions avant achat)
3. Le quotidien de mon client (sa vraie douleur dans ses mots, ce qu'il veut déléguer, son volume réel)
4. Proposition commerciale (prix, scope, acompte)

**Comment la remplir vite :**
- Si tu as déjà un dump brut (export WhatsApp, notes en bloc-notes comme Mac Arthur en produit pour son réseau personnel) : extrais toi-même les 4 blocs depuis ce texte. Ne pose des questions que pour ce qui manque vraiment.
- Si tu pars de zéro : pose les questions une à la fois, dans l'ordre des blocs, pour ne pas casser le rythme d'un échange.
- Le bloc 2 (le client de mon client) est le plus important : c'est lui qui rend la démo crédible — le prospect doit se reconnaître, pas reconnaître un template.
- Tu n'as pas besoin d'une fiche à 100% pour avancer. Dès que les blocs 1 et 2 ont de la matière, même partielle, complète intelligemment avec du **fictif crédible** pour le reste (vrais types de produits du secteur, prénoms locaux, montants plausibles) et avance. Marque dans la fiche ce qui est fictif : ça se remplace par du réel après validation du prospect, jamais avant.

## Étape 2 — Construire l'interface (la maquette)

Pars du gabarit fourni : `assets/template-maquette.html`. C'est une maquette mobile-first autonome, déjà mise dans un cadre de smartphone, avec une navigation par onglets qui fonctionne, et des variables CSS pour les couleurs. Copie-le et remplis-le.

Règles de qualité, parce que c'est ce qui fait la différence entre "joli" et "ça déclenche l'achat" :
- **Mobile-first**, dans le cadre téléphone du gabarit. Les clients regardent sur leur téléphone, et une app dans un cadre de smartphone fait "vraie app".
- **Couleurs du client** via les variables CSS `--brand` et `--brand-2` en haut du fichier. Change uniquement ces variables pour habiller toute la maquette d'un coup.
- **Contenu réaliste en français**, jamais de "lorem ipsum". Mets de vrais noms de plats, de vrais quartiers, de vrais montants, des prénoms locaux. Le prospect doit se reconnaître immédiatement.
- **3 à 5 écrans navigables** maximum, reliés par la barre d'onglets du bas.
- **Une âme qui parle à la cible** : utilise des situations concrètes du métier du client. Si pertinent, intègre des visuels de personnes (générées par IA) qui incarnent les situations décrites, pour créer de l'émotion et de la projection.
- **Soigné mais sobre** : un bon dégradé, des cartes, des boutons d'action clairs. Pas de surcharge.

Garde le fichier 100% autonome (CSS et JS inline, pas de dépendance externe qui pourrait casser hors ligne ou une fois hébergé).

Détails sur le gabarit et comment l'adapter : voir `references/presentation.md`.

## Étape 3 — Simuler le parcours client

C'est le 2e livrable, et souvent celui qui déclenche le déclic le plus fort : le prospect ne voit plus seulement "son tableau de bord", il voit ce que vivent SES clients à lui — et réalise que ça, justement, c'est ce qui le fatigue aujourd'hui.

**Comment l'intégrer concrètement :** ajoute une 2e perspective dans la même maquette (un toggle ou un onglet "Vue cliente" en plus de la "Vue [Prénom du client]"), plutôt que de construire un fichier séparé. Même gabarit, même cadre téléphone, juste une autre suite d'écrans :

1. **Découverte** : le client final tombe sur le catalogue / les produits via WhatsApp ou l'app.
2. **Questions à l'assistant** : reprends les VRAIES questions identifiées dans le bloc 2 de la fiche prospect ("c'est adapté à l'âge de mon enfant ?", "vous livrez où ?"...). C'est ce qui rend la simulation crédible — un assistant qui répond à des questions génériques ne convainc personne.
3. **Commande** : l'assistant prend la commande, confirme, encaisse (mentionne le moyen de paiement réel du client si connu — XPaye, Wave...).
4. **Suivi / SAV** : confirmation, suivi, et — si la douleur du prospect est le SAV (comme pour C'Real) — montre explicitement comment l'assistant absorbe cette charge : retour d'expérience demandé automatiquement, note collectée, rien ne remonte au prospect sauf ce qui exige sa décision.

Reste sur 3-4 écrans pour cette vue, dans le même esprit que l'interface : montrer juste assez pour déclencher "ah oui, exactement ça".

## Étape 4 — Préparer le PDF

C'est le 3e livrable : un document à laisser, que le prospect garde, montre à son associé ou son conjoint, relit à tête reposée. Une démo cliquable convainc dans l'instant ; un PDF prolonge la conviction après que la conversation s'est arrêtée.

**Reste simple — un HTML imprimable, pas un outil de génération PDF :**
- Construis une page HTML autonome, une seule page, aux couleurs du client (mêmes `--brand`/`--brand-2` que la maquette, pour que les 3 livrables se ressemblent).
- Structure en 4 blocs courts : (1) le problème du prospect dans SES mots — repris du bloc 3 de la fiche, (2) ce que l'app fait pour lui résoudre — 3 puces concrètes maximum, (3) le lien vers la démo cliquable, (4) l'offre chiffrée — prix, MRR, acompte, prochaine étape (bloc 4 de la fiche).
- Le prospect (ou Mac Arthur) l'exporte en PDF via Ctrl+P → "Enregistrer en PDF" depuis le navigateur. Aucune dépendance, aucun compte, ça marche partout.

⚠️ Ne construis ce livrable que si le bloc 4 de la fiche prospect (proposition commerciale) est rempli. Un PDF sans prix ni étape suivante est un gadget, pas un outil de closing.

## Étape 5 — Déployer et envoyer le lien (OBLIGATOIRE)

⛔ **RÈGLE DURE : aucun fichier (.html ou .pdf) ne s'envoie JAMAIS brut au client.**
Un fichier sur WhatsApp = le client ne sait pas quoi en faire = il ne sera pas vu = pas de closing. C'est ce qui s'est passé avec J'envoie Express : fichier reçu, jamais ouvert, deal qui traîne.

**Le chemin est unique désormais — le sous-domaine agence est en place et automatisé :**

1. Dépose le fichier dans `livrables/clients/demo-site/public/[nom-client]/index.html` (la maquette ; pour le PDF, génère-le dans le même dossier ou indique simplement le lien de la page imprimable — le prospect imprime lui-même en PDF s'il veut le garder).
2. Commit + push sur `master`.
3. Netlify redéploie automatiquement → le lien est prêt en ~2 minutes : `demo.agenceattractor.com/[nom-client]`.
4. Copier le lien → envoyer sur WhatsApp.

Crédibilité maximale dès l'URL : le prospect voit que c'est l'agence qui l'héberge, pas un outil tiers.

**Filet de sécurité uniquement** (si le repo ou Netlify est inaccessible) : tiiny.host (glisser-déposer sur tiiny.host → lien `https://[nom].tiiny.site` en 30 secondes, zéro compte) ou app.netlify.com/drop. À utiliser en dépannage, jamais comme premier choix : ça casse la cohérence de marque que le sous-domaine agence apporte.

## Étape 6 — Kit de closing

Les livrables ne vendent pas seuls, c'est Mac Arthur qui vend avec. Fournis-lui systématiquement, en plus du ou des liens :

- **Un script de présentation court** (3 à 5 phrases) qui suit cette logique : rappeler le problème du prospect, montrer comment l'app le résout (pointer la maquette ET, si elle existe, la vue "parcours client" — c'est souvent elle qui fait le déclic), proposer l'étape suivante.
- **L'étape suivante claire et chiffrée** : ce que le prospect obtient s'il dit oui, le prix, et l'acompte pour démarrer. Toujours finir sur une action concrète, pas sur "dis-moi ce que tu en penses".

Si les 3 livrables sont prêts, le script les enchaîne dans cet ordre : la maquette d'abord (l'effet waouh immédiat), le parcours client ensuite (le déclic "ça me soulage"), le PDF en dernier (ce qu'il garde après la conversation).

Modèle de script :

```
[Prénom], tu m'as dit que ton problème c'est [problème].

Regarde ce que ça donnerait pour toi :
👉 [LIEN demo.agenceattractor.com/nom-client]

Ouvre sur ton téléphone. C'est cliquable.

Sur le premier écran : [ce que le client voit en 1 phrase].
Ici : [bénéfice concret pour lui].

Pour lancer ta version : [prix setup] + [MRR]/mois.
Pour démarrer, c'est [acompte 50%].
On commence cette semaine ?
```

⚠️ **Ne jamais envoyer le script sans le lien dedans.**
Si le lien n'est pas encore déployé, déployer d'abord, envoyer ensuite.

## Garde-fous

- Reste un outil rapide, sur les 3 livrables comme sur un seul. Si tu passes trop de temps, tu as raté l'objectif — un seul livrable bien fait vaut mieux que trois bâclés. La maquette (interface) est le minimum non négociable ; parcours client et PDF s'ajoutent quand la fiche prospect a la matière pour les rendre crédibles, pas avant.
- Ne promets jamais, dans la maquette ou le parcours client, des fonctions impossibles à livrer ensuite. Ce que tu montres doit pouvoir être construit.
- Le fictif est un point de départ, jamais une fin. Toute donnée fictive insérée pour avancer vite doit être marquée dans la fiche prospect et remplacée par du réel une fois le prospect validé — jamais avant, pour ne jamais lui montrer une fausse info comme si elle était vraie.
- Toujours finir par le ou les liens + le script + l'étape suivante chiffrée. Un livrable sans appel à l'action ne close pas.

# Attractor Assists — Décisions produit

## Identité de l'app

**Accroche :** "Conçu pour soulager et rendre performants les entrepreneurs"
**Promesse :** Les rendre #1 dans leur couloir.

---

> Décisions validées par Mac Arthur, à embarquer dans le développement.
> Ce fichier se met à jour au fil des sessions. Ne pas implémenter sans relire ce fichier.

---

## 1. Challenge "7 jours pour t'organiser"

**Source :** Ebook "Méthode ATTRACTOR — Manuel de procédures" (Koffi & Awa, les 3 fuites, le plan 7 jours).

**Déclencheur :** L'utilisateur avoue être désorganisé. Signaux à détecter :
- "j'arrive pas à m'organiser"
- "je fais tout moi-même"
- "j'ai tout dans la tête"
- "je perds des clients"
- "j'ai pas de suivi"
- Score d'organisation faible à l'anamnèse

**Comportement :**
- L'assistant propose le challenge au bon moment, sans forcer.
- Aucun ordre imposé. C'est l'utilisateur qui donne le rythme.
- L'assistant s'adapte : si l'utilisateur fait J3 avant J1, c'est OK.
- Chaque jour accompli = célébration + récap de ce qui a changé concrètement.

**Les 7 modules du challenge :**

| Jour | Thème | Ce que l'assistant fait concrètement |
|---|---|---|
| J1 | Inventaire | Aide à lister toutes les tâches répétitives, identifie les répétitions = fuites |
| J2 | Procédure | Documente la tâche la plus répétée en 5 à 8 étapes simples |
| J3 | Client | Standardise le suivi client de l'entrée prospect à la vente |
| J4 | Relance | Crée le système de relance qui ne dépend plus de la mémoire |
| J5 | Système | Installe le premier assistant / automatisation, lui remet une procédure |
| J6 | Mesure | Calcule le temps récupéré, les tâches gérées sans le fondateur |
| J7 | Vision | Identifie les 2 décisions stratégiques que l'utilisateur peut enfin prendre |

**Interface :**
- Les 7 modules sont affichés dès le départ.
- Tous sont cliquables, actifs ou non (voir décision 2).
- Progression visible (jauge, streak, check).

---

## 2. Modules toujours cliquables — message de capacité

**Principe :** Aucun module ne doit être un mur. Même verrouillé ou inactif, il est cliquable.

**Comportement quand l'utilisateur clique sur un module inactif :**
- Pas de message générique "bientôt disponible".
- L'agent dit exactement ce qu'il est capable de faire pour l'utilisateur sur ce module.
- Le message est personnel, basé sur le profil connu de l'utilisateur.

**Exemples de messages selon le module cliqué :**

> *Module "Relance" (non encore démarré)*
> "Pour toi, je peux créer un message de relance pour tes 3 prospects qui n'ont pas répondu depuis lundi. Tu veux qu'on le fasse maintenant ?"

> *Module "Procédure" (non encore démarré)*
> "Je peux écrire ta procédure de prise de commande en 5 étapes, basée sur ce que tu m'as dit de ton activité. Ça te prend 10 minutes et tu n'y repenses plus jamais."

> *Module "Contenu" (non encore démarré)*
> "Je peux te préparer 3 posts Facebook pour cette semaine — un pour bâtir la relation, un pour montrer ton expertise, un pour vendre. Tu choisis le ton."

**Règle de rédaction :** Toujours concret, toujours orienté résultat, toujours avec une invitation à agir maintenant.

---

## 3. Nommer son bras droit — progression assistant → bras droit

**Principe :** Dès le démarrage, l'utilisateur peut donner un prénom ou un nom à son assistant.

**Progression en 2 niveaux :**

| Niveau | Statut | Critère |
|---|---|---|
| Niveau 1 | **Assistant** | État de départ. L'utilisateur commence à utiliser l'app, délègue les premières tâches. |
| Niveau 2 | **Bras droit** | L'utilisateur a intégré l'assistant dans son quotidien. Il lui fait confiance sur des tâches importantes. Critère mesuré (voir ci-dessous). |

**Critère de passage au niveau "Bras droit" :**
- Engagement régulier (streak, fréquence d'utilisation à définir).
- Tâches complétées via l'assistant (procédures, relances, posts, offres…).
- L'utilisateur a délégué au moins un domaine clé (ex : relances, suivi client, contenu).
- Mesure de l'impact perçu (question courte : "Est-ce que tes tâches s'allègent ?").

**Interface :**
- À l'anamnèse (ou très tôt dans l'onboarding) : "Et si on commençait par lui donner un prénom ? C'est ton assistant pour l'instant. Un jour, il sera ton bras droit."
- Le nom choisi est utilisé dans toutes les notifications et messages proactifs.
- Le passage de "assistant" à "bras droit" est un événement célébré dans l'app (badge, message personnalisé, notification aux proches optionnelle).

**Pourquoi c'est le critère fondamental de performance :**
Le vrai KPI de l'app n'est pas le nombre de sessions — c'est le moment où l'utilisateur dit "mon bras droit s'en occupe". Ce mot-là indique que la délégation est réelle et que la valeur est ressentie.

---

## 4. Amélioration continue — scan quotidien des bases de données

**Principe :** Chaque jour, un agent scanne les données d'usage et de conversation pour améliorer l'expérience.

**Ce que le scan analyse :**
- Modules les moins utilisés → déclencher un message de réactivation proactif.
- Questions fréquentes sans bonne réponse → enrichir la base de connaissance.
- Blocages récurrents (même étape abandonnée par plusieurs utilisateurs) → signaler à Mac Arthur pour amélioration.
- Utilisateurs inactifs depuis X jours → préparer un message de relance personnalisé.
- Moments de progression (premier livrable produit, premier module terminé) → célébrer.

**Output quotidien (pour Mac Arthur) :**
Un résumé synthétique automatique :
- Nombre d'utilisateurs actifs / inactifs
- Modules les plus utilisés / abandonnés
- 3 insights à agir cette semaine
- Suggestions de contenu ou d'amélioration

**Implémentation technique (à cadrer) :**
- Agent Supabase déclenché en cron quotidien (ex : 6h du matin).
- Lecture des tables `conversations`, `parcours`, `gamification`, `to_do`.
- Synthèse → stockée dans une table `daily_scans` → accessible dans le dashboard Mac Arthur.
- Modèle : Haiku pour le scan (coût faible), Sonnet pour la synthèse rédactionnelle si nécessaire.

---

---

## 5. KPIs de performance — ce que le scan mesure

Six indicateurs fondamentaux. Ils mesurent à la fois la santé de l'app et la qualité de l'assistant.

---

### KPI 1 — Taux de remplissage des infos clients

**Ce que c'est :** Pourcentage de champs profil complétés par l'utilisateur (PPSD, marque, offres, cible, canaux, objectifs).

**Pourquoi c'est critique :** Plus le profil est rempli, plus l'assistant est pertinent. Un profil vide = un assistant générique = pas de valeur perçue = churn.

**Comment le calculer :**
```
champs remplis / total champs attendus × 100
```

**Seuils cibles :**
- < 40% → alerte : l'assistant doit relancer l'anamnèse de façon conversationnelle
- 40–70% → profil partiel : l'assistant fonctionne mais manque de contexte
- > 70% → profil solide : l'assistant peut personnaliser en profondeur

**Action automatique :** Si un utilisateur est bloqué sous 40% depuis 3 jours → message proactif ciblé sur le champ le plus impactant manquant.

---

### KPI 2 — Nombre de messages échangés

**Ce que c'est :** Volume de messages envoyés et reçus par utilisateur (par jour, par semaine, par mois).

**Pourquoi c'est critique :** C'est le signal d'engagement de base. Un utilisateur qui échange = un utilisateur qui utilise = un utilisateur qui reste.

**Ce qu'on suit :**
- Moyenne de messages / utilisateur actif / jour
- Distribution (qui échange beaucoup vs qui est silencieux)
- Évolution dans le temps (courbe montante = bonne rétention)

**Seuils cibles (à calibrer après 30 jours de données) :**
- < 3 messages/semaine → utilisateur à risque de churn
- 3–10 messages/semaine → utilisateur régulier
- > 10 messages/semaine → utilisateur engagé → potentiel ambassadeur

---

### KPI 3 — Taux de rétention

**Ce que c'est :** Pourcentage d'utilisateurs qui reviennent dans l'app après leur première session.

**Mesures à suivre :**
- Rétention J+1 (lendemain)
- Rétention J+7 (semaine)
- Rétention J+30 (mois)

**Benchmarks à viser (apps de coaching / productivité) :**
- J+1 : > 40%
- J+7 : > 20%
- J+30 : > 10%

**Leviers d'action :**
- Rétention J+1 faible → revoir l'onboarding et le premier livrable (doit être immédiat et frappant)
- Rétention J+7 faible → revoir la proactivité de l'assistant (relances matin/soir)
- Rétention J+30 faible → revoir la progression et la célébration des étapes

---

### KPI 4 — Taux d'insertion stratégique des messages de vente

**Ce que c'est :** Mesure la pertinence des moments où l'assistant glisse un message de vente (offre, upgrade, fonctionnalité premium).

**Comment le calculer :**
```
messages de vente ayant généré une action (clic, réponse, conversion)
/ total messages de vente envoyés × 100
```

**Pourquoi c'est différent d'un taux de conversion classique :**
L'objectif n'est pas d'envoyer plus de messages de vente — c'est d'envoyer le bon message au bon moment. Un taux élevé sur peu de messages vaut mieux qu'un taux faible sur beaucoup.

**Seuils cibles :**
- < 10% → messages de vente mal placés ou trop génériques → réviser les déclencheurs
- 10–25% → bonne pertinence
- > 25% → excellent : l'assistant sait quand et comment proposer

**Action :** Si un type de déclencheur performe mal de façon répétée → le retirer ou le reformuler.

---

### KPI 5 — Clarté des profils utilisateurs

**Ce que c'est :** Score de qualité des données collectées — pas juste si les champs sont remplis (KPI 1), mais si ce qui est rempli est utilisable.

**Ce qu'on évalue :**
- Le PPSD est-il suffisamment précis pour générer un argumentaire ? (oui/non)
- La cible est-elle définie au-delà du genre/âge ? (comportement, lieu, habitudes)
- L'offre est-elle formulée en termes de résultat client ?
- Les canaux de vente sont-ils identifiés ?

**Score de clarté (0 à 4 points) :**
- 0–1 : profil flou → l'assistant ne peut pas personnaliser
- 2–3 : profil lisible → personnalisation partielle possible
- 4 : profil clair → l'assistant peut agir comme un vrai bras droit

**Action :** Pour chaque champ flou → l'assistant pose UNE question de précision, dans la conversation, au bon moment. Jamais un formulaire.

---

### KPI 6 — Taux de proactivité

**Ce que c'est :** Rapport entre les messages initiés par l'assistant et les messages initiés par l'utilisateur.

**Comment le calculer :**
```
messages initiés par l'assistant / total messages échangés × 100
```

**Pourquoi c'est le KPI le plus révélateur :**
Un assistant qui attend toujours qu'on lui parle n'est pas un bras droit. Un vrai bras droit initie, rappelle, relance, propose. Ce KPI mesure à quel point l'assistant incarne la proactivité.

**Seuils cibles :**
- < 20% → l'assistant est passif → augmenter les triggers proactifs (matin, soir, J+48h sans relance, module abandonné…)
- 20–40% → bon équilibre
- > 50% → attention : risque de spam ressenti → vérifier la qualité des messages initiés

**Types de messages proactifs à suivre séparément :**
- Relances matin / soir
- Alertes de suivi (prospect non relancé depuis 48h)
- Suggestions de module (challenge, procédure à créer)
- Messages de célébration (étape franchie, streak)
- Nudges de rétention (utilisateur silencieux depuis 3 jours)

---

### Vue d'ensemble du tableau de bord Mac Arthur

| KPI | Fréquence | Format |
|---|---|---|
| Taux de remplissage profils | Quotidien | Moyenne + distribution |
| Nombre de messages échangés | Quotidien | Total + par segment |
| Taux de rétention | Hebdomadaire | J+1 / J+7 / J+30 |
| Taux d'insertion messages de vente | Hebdomadaire | % + top déclencheurs |
| Clarté des profils | Hebdomadaire | Score moyen + nb profils flous |
| Taux de proactivité | Quotidien | % global + par type |

---

---

## 6. Audit métier client — le lien entre V1 (maquette) et V2 (app réelle)

**Principe :** Après la maquette validée et le devis signé, le client reçoit un lien. Il y répond dans un style conversationnel. L'assistant creuse le métier en profondeur. La synthèse produite est validée par le client. Cette validation est le **bon de livraison** — elle autorise le développement de V2.

---

### Position dans la chaîne

```
/maquette-closer → client dit OUI
   → /devis-express → client signe → acompte reçu
   → LIEN AUDIT MÉTIER envoyé au client
   → Client répond (conversationnel, 3-5 questions min par sujet)
   → Récapitulatif produit séance tenante
   → Client valide (ou affine → re-valide)
   → VALIDATION = BON DE LIVRAISON
   → /chef-de-projet + /programmeur-senior construisent V2
```

---

### Ce que l'audit collecte

L'audit ne pose pas des questions génériques. Il creuse le **métier réel** du client — comment il travaille aujourd'hui, ce qui lui coûte du temps, ce qu'il veut voir dans l'app. Minimum 3 questions par thème, avec relances si la réponse est vague.

**Structure de l'audit (exemple restaurant) :**

```
THÈME 1 — Le process actuel
"Comment les clients passent-ils leur commande aujourd'hui ?"
→ Si vague ("à la voix") : "C'est toi qui prends les commandes ou quelqu'un d'autre ?"
→ "Qu'est-ce qui te fait perdre le plus de temps dans ce process ?"
→ "Il t'arrive de rater ou d'oublier des commandes ? Dans quel cas ?"

THÈME 2 — Les clients
"Comment tu reconnais un client fidèle aujourd'hui ?"
→ "Tu as un moyen de les retrouver si tu veux leur envoyer quelque chose ?"
→ "Tu sais combien de fois un client revient en moyenne par mois ?"

THÈME 3 — Ce que l'app doit faire
"Si l'app pouvait faire une seule chose parfaitement,
 ce serait laquelle ?"
→ "Et si elle pouvait t'éviter une tâche que tu fais chaque jour,
   ce serait laquelle ?"

THÈME 4 — Les données importantes
"Qu'est-ce que tu veux savoir sur chaque commande ?"
→ "Est-ce que tu veux voir des chiffres (ventes du jour, plat le plus commandé) ?"
→ "Tu travailles seule ou tu as du staff qui aura aussi accès ?"
```

---

### Règles de l'audit

- **Conversationnel** : pas de formulaire à cases, des questions qui s'enchaînent naturellement
- **3 à 5 questions min par thème** : si le client répond en 2 mots, l'assistant relance
- **Pas de jargon technique** : "tes commandes" pas "ton système de gestion de commandes"
- **Brut et honnête** : collecter ce que le client dit vraiment, pas ce qu'on pense qu'il veut
- **Séance tenante** : le récapitulatif est produit immédiatement après la dernière réponse

---

### Le récapitulatif de validation

Produit automatiquement à la fin de l'audit. Format :

```
RÉCAPITULATIF AUDIT — [Nom du client / restaurant]
Date : [date]

TON PROCESS ACTUEL
[Ce que le client a décrit de son fonctionnement aujourd'hui]

CE QUI TE COÛTE DU TEMPS / CE QUI BLOQUE
[Les pain points identifiés dans ses réponses]

CE QUE L'APP VA FAIRE POUR TOI
[Fonctionnalités V2 priorisées, dans ses mots à lui]

CE QU'ON VA AFFICHER ET SUIVRE
[Les données qu'il veut voir]

UTILISATEURS DE L'APP
[Nombre et rôles confirmés]

---

Est-ce que ce récapitulatif reflète bien ton activité ?
→ OUI → Ce document est ton bon de livraison. Le développement commence.
→ À CORRIGER → Tu modifies, on re-valide. Ça prend 5 minutes.
```

---

### La validation = bon de livraison

Quand le client dit OUI à ce récapitulatif :
- Il ne peut plus changer le scope sans avenant
- Le brief est verrouillé et transmis au Chef de Projet
- Le développement de V2 commence sur cette base

Ce mécanisme protège Mac Arthur des changements de scope en cours de route.

---

### Format du lien V1

Un fichier HTML statique déployé sur Netlify ou Vercel. Style conversationnel, mobile-first. Couleurs du client si possible (récupérées de la maquette). Questions qui s'affichent une par une. Le client répond librement dans un champ texte. À la fin : recap affiché + bouton "Je valide".

---

---

## 7. Vision commerciale — "Vendre sans vendre"

**Principe fondateur :** Le besoin de grandir avec l'agence doit devenir naturel pour l'utilisateur. Jamais de vente forcée. L'assistant oriente subtilement les conversations vers les produits disponibles, à venir, ou en déploiement.

### Les mini-agents dans l'app : logique de boutique

Quand un mini-agent est validé (au moins 2 cas réels avec résultat positif) :
- Il est injecté dans l'assistant → tous les utilisateurs en bénéficient silencieusement
- Il peut aussi apparaître dans la boutique de l'app avec un nom utilisateur clair
- Segmentation selon les discussions et le profil : l'assistant propose le bon module au bon utilisateur au bon moment

**Deux types de produits :**
- **One-shot** : besoin ponctuel (ex : "Connais ta cible", "Construis ton offre"), vendu à l'unité dans la boutique
- **Accompagnement récurrent** : abonnement (ex : module Bras Droit Digital avec veille hebdo)

**Bundles :** regrouper des mini-agents complémentaires en kits.
Exemple : "Kit Lancement" = Connais ta cible + Construis ton offre + Post prêt à publier → prix bundle < somme des parties.

**Offres flash :** à définir (cadence, durée, déclencheur). Principe : créer de l'urgence sans manipuler.

### Attractor Assists = organisme vivant

L'app s'améliore en continu via la pipeline d'extraction des mini-agents. Chaque innovation validée par Mac Arthur pousse les équipes à être proactives. L'assistant connaît :
- Les produits disponibles (actuels)
- Les produits en déploiement (Livraison Pro, Fidelys, Dashboard)
- Les produits à venir (frise narrative de l'écosystème)

Il oriente les conversations subtilement vers eux. **Machine à cash : jamais agressive, toujours pertinente.**

---

## 8. Mini-agents prioritaires

### Règle d'extraction

Un mini-agent est extractible UNIQUEMENT quand le process source a été validé sur au moins 2 cas réels avec résultat positif. Avant ça, il reste dans Jarvis (skill Mac Arthur), pas dans Attractor Assists.

---

### Mini-agent A : "Connais ta cible" (PPSD EXPRESS en interne)

**Ce qu'il fait :** Quand l'utilisateur ne sait pas qui est sa cible ou que ses ventes stagnent, l'assistant l'emmène en 5 questions vers un portrait précis de son client idéal. Il relance si les réponses sont vagues. Il produit un récapitulatif actionnable.

**Déclencheurs :** "personne n'achète", "je sais pas à qui m'adresser", "mes posts font pas de ventes", "tout le monde peut être mon client"

**Source :** Framework PPSD + méthode ATTRACTOR + Régis Amon

**Statut :** À extraire (validé sur J'envoie Express + restaurant Abidjan)

---

### Mini-agent B : "Bras droit digital" (Veille & Intelligence marché)

**Ce qu'il fait :**
- Fait la veille pour l'utilisateur sur sa niche et sa cible
- Étudie les acteurs pertinents de son marché (qui publie, sur quoi, quels sujets font réagir)
- À intervalles définis (hebdo ou mensuel), propose à l'utilisateur les sujets sur lesquels sa cible réagit le plus
- L'utilisateur n'a pas à chercher : le bras droit lui amène l'info

**Format de livraison :**
> "Cette semaine, ta cible (restaurateurs Abidjan) a beaucoup réagi à [sujet]. Voilà 3 angles de post que tu peux utiliser cette semaine."

**Déclencheurs :** L'assistant initie de lui-même à fréquence définie. Ou quand l'utilisateur dit "j'ai pas d'idées de contenu", "je sais pas quoi poster"

**Modèle économique :** Accompagnement récurrent → abonnement. Ce mini-agent est un levier de rétention fort.

**Statut :** À construire. Nécessite : accès web search + profil cible renseigné dans l'anamnèse.

---

### Mini-agent C : "Organisation" (Koffi System en interne)

**Ce qu'il fait :**
- Suit la méthode du guide procédures (histoire de Koffi)
- Aide l'utilisateur à prendre conscience de ses 3 fuites (temps, argent, attention)
- L'aide à réorganiser ses tâches
- Identifie ce qui lui rapporte de l'argent vs ce qui lui en coûte
- Le focalise sur ses 20% d'actions qui produisent 80% des résultats

**Format :**
> "Tu m'as parlé de 5 tâches cette semaine. 2 t'ont rapporté des clients. Les 3 autres ? Du temps perdu. On regarde ensemble ?"

**Déclencheurs :** Utilisateur désorganisé, débordé, qui fait tout lui-même, qui n'a pas de système, qui rate des relances

**Lien avec le challenge 7 jours :** Ce mini-agent est le moteur du challenge. Il ne s'arrête pas à 7 jours, il accompagne en continu.

**Statut :** À construire. Source : Ebook procédures (Koffi & Awa) + methode-attractor-synthese.md.

---

### Customer success : qui joue ce rôle ?

**Dans Attractor Assists**, le customer success est assuré par l'assistant lui-même via :
- Suivi proactif (check-in matin/soir)
- Détection de l'inactivité → relance personnalisée
- Célébration des victoires (streak, premiers livrables)
- Escalade : si l'utilisateur est bloqué depuis X jours sur un problème que l'assistant ne peut pas résoudre → suggestion de passer au niveau d'accompagnement supérieur (consulting Mac Arthur)

**Pour l'agence (clients web apps)**, le customer success est `/chef-de-projet` → point J+7 après livraison → demande de témoignage → proposition d'abonnement MRR.

---

### Règle Mac Arthur hypercréatif — capturer sans perdre

Mac Arthur génère des idées en permanence. Règle Jarvis :
**Toute idée formulée dans une session est capturée par MIROIR dans `livrables/ecosysteme-attractor/attractor-assists/idees-pipeline.md`.**

Format de capture :
```
[Date] — IDÉE : [titre court]
Contexte : [ce que Mac Arthur a dit]
Potentiel estimé : fort / moyen / à creuser
Moment idéal d'implémentation : [immédiat / après X / attendre Y]
Statut : EN ATTENTE / EN ANALYSE / GO / ÉCARTÉ
```

Le PILOTE analyse au bon moment. L'idée ne meurt pas, elle attend son heure.

---

## À implémenter — ordre de priorité recommandé

1. **Nommer son bras droit** (onboarding, impact immédiat sur l'attachement)
2. **Modules cliquables avec message de capacité** (UX, zéro mur)
3. **Challenge 7 jours** + mini-agent Organisation (engagement, désorganisés)
4. **Mini-agent "Connais ta cible"** (extractible maintenant, validé sur 2 cas)
5. **Mini-agent "Bras droit digital"** (rétention + abonnement, à construire)
6. **Boutique + bundles** (après que 3 mini-agents soient actifs)
7. **KPIs** (tracker dès le lancement)
8. **Scan quotidien** (automatisation KPIs, après que la data existe)

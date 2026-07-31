# COCKPIT ATTRACTOR — Spécification de la finalité

> **Statut : vision cible (finalité du système).** À construire en dernier, par assemblage des agents existants.
> Principe : ne plus vendre des outils séparés, mais **le cockpit qui pilote un système d'agents entier**. C'est ce qui justifie le high ticket.

---

## 1. Ce que c'est

Une **app de pilotage unique** (cockpit) qui centralise tous les agents de l'écosystème Attractor en un seul endroit, accessible au smartphone et à la voix. Le dirigeant ne jongle plus entre interfaces : il pilote tout depuis un cockpit.

```
COCKPIT ATTRACTOR (app unique)
   ├── MIROIR      → décisions VALIDÉ / REJETÉ + points "à arbitrer"
   ├── STRATÈGE    → campagnes à valider / ajuster / rejeter
   ├── COMPTEUR    → CA vs objectif, répartition, stabilité Fibonacci
   ├── VOIX        → parler au système (Chief of Staff vocal)
   └── (extensible) CARBURANT, CLOSEUR, DAF, ÉDITO, VOIX-CM, AMBASSADEUR…
```

---

## 2. Pourquoi c'est la finalité (pas une étape de plus)

- Chaque agent a été construit **sur la même base Supabase**, avec la **même logique d'interface** et le **même design** (identité Attractor). → La centralisation n'est pas un chantier neuf, c'est un **assemblage** de briques déjà compatibles.
- Le cockpit est le **produit vendable**. Les agents isolés sont des fonctions ; le cockpit est l'offre.

---

## 3. Le modèle high ticket

### Ce qu'on vend réellement
Pas « une app ». On vend ce que le cockpit **remplace** :
- un directeur de la stratégie,
- un DAF,
- un analyste,
- un assistant qui ne dort jamais.

→ Un **système d'agents qui pilote une entreprise**, accessible à la voix, depuis un smartphone. Actif à plusieurs milliers d'euros, défendable car personne d'autre n'a cet écosystème.

### L'argument high ticket décisif
Grâce à **MIROIR**, le cockpit apprend la méthode du client comme il apprend celle de Mac Arthur. On vend donc un cockpit qui devient **le cerveau cloné du dirigeant**. Ce n'est pas un logiciel, c'est une réplique pilotable de la façon de décider du dirigeant.

### Deux formats de vente (à trancher plus tard)
1. **Cockpit-produit** : app de pilotage configurée pour le client (ses agents, objectifs, méthode). High ticket à l'installation + MRR de maintenance.
2. **Cockpit-service** : installation + accompagnement (consulting Attractor + système). Plus haut de gamme : on vend le résultat, pas l'outil.

---

## 4. Condition non négociable avant de vendre

**Le cockpit doit tourner parfaitement chez Mac Arthur d'abord.** Il est son propre premier client (logique Attractor Assists = fondation). Un high ticket se vend sur la preuve : « voici mon cockpit, voici mes résultats, je vous installe le même ». Pas avant.

---

## 5. Ordre de construction (le chemin vers la finalité)

```
1. Finir les agents un par un        (MIROIR ✓ · STRATÈGE ✓ · COMPTEUR ✓ · puis CARBURANT, CLOSEUR…)
2. Les faire tourner chez Mac Arthur (preuve sur soi)
3. Centraliser en COCKPIT            (assemblage : un écran unique)
4. Prouver les résultats             (CA, stabilité, gain de temps)
5. Packager l'offre high ticket      (prix, argumentaire Attractor)
6. Vendre + installer chez clients   (MIROIR apprend leur méthode)
```

---

## 6. Exigences de conception du cockpit (à respecter dès maintenant)

Pour que la centralisation finale soit simple, chaque agent doit déjà :
- **Vivre sur la même base Supabase** (fait).
- **Exposer ses données via des vues/tables claires** que le cockpit pourra lire (fait).
- **Partager l'identité visuelle Attractor** : noir #0D0D0D, or #C9A84C / #D4A843, bordeaux #8B2020, serif + sans condensé (fait).
- **Suivre le même schéma d'interaction** : voir → valider / ajuster / rejeter au pouce (fait).
- **Rester mobile-first** (fait).

→ Chaque brique construite est **déjà compatible cockpit**. On garde ce standard pour tout futur agent.

---

## 7. Structure cible du cockpit (maquette à produire le moment venu)

Un écran d'accueil = **vue d'ensemble** :
- Bandeau CA du mois vs objectif (depuis COMPTEUR).
- Compteurs : décisions à arbitrer (MIROIR), campagnes à valider (STRATÈGE).
- Bouton voix central (parler au système).
- Accès rapide à chaque agent (onglets ou cartes).

Navigation : un onglet par agent, plus un onglet « Vue d'ensemble » et un bouton voix omniprésent.

---

## 8. À faire quand on y arrivera
- Maquetter l'écran unique du cockpit (visualiser le produit final).
- Construire l'offre high ticket (prix double marché FCFA/€, packaging, argumentaire PASA/AIDA).
- Définir le processus d'installation client (onboarding + apprentissage MIROIR de leur méthode).

---

*Note de cadrage : ceci est la FINALITÉ. On ne la construit qu'après que les agents tournent et prouvent leur valeur chez Mac Arthur. Mais chaque brique est déjà pensée pour s'y intégrer.*

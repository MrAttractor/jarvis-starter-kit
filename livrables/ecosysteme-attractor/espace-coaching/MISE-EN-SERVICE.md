# Mise en service de l'espace coaching

> Écrit le 04/09/2026. Se lit après le `DOSSIER.md`, une fois, dans l'ordre.
> Chaque étape se coche quand elle est vraie, pas quand elle est lancée.

---

## Ce qui a été fait le 04/09/2026

**La recette d'écran existe et elle passe.** Douze scènes aux six résolutions
du `UX_SYSTEM`, soit 72 écrans, dans `tests/`. Elle a attrapé trois défauts,
tous corrigés dans `public/index.html` :

| Défaut | Pourquoi ça comptait |
|---|---|
| 14 boutons à 40 px de haut au lieu de 44 | « Supprimer la séance », « Marquer tenue » et « Enregistrer » sont côte à côte dans la même barre. Quatre pixels manquants sur une rangée serrée, au pouce, c'est une suppression à la place d'un enregistrement |
| Les 8 cases du contrôle final à 42 px | Même chose, sur l'écran qu'on remplit juste avant une première séance |
| « Se déconnecter » aligné à gauche sous 400 px | Cosmétique, mais c'est le premier écran que voit un œil extérieur |

**Aucun débordement horizontal nulle part**, aux six largeurs, sur les deux
pages. Aucune erreur JavaScript. Aucun champ sous 16 px, donc iOS ne zoomera
pas au focus.

**Le contrat ne ment plus sur le titre.** L'en-tête disait « Certifié en
préparation mentale par l'Académie Puissance Mentale ». Le résultat de la
soutenance du 3 septembre n'est pas connu. La ligne dit maintenant « **Formé
à** la préparation mentale par l'Académie Puissance Mentale », qui est vrai
dans tous les cas, et la note de fin dit quoi écrire une fois le certificat en
main.

**Le DNS est déjà posé.** Contrairement à ce que disait le `DOSSIER`,
`coaching.agenceattractor.com` résout bien, en CNAME vers
`coaching-attractor.pages.dev`, sur les adresses de Cloudflare. Il reste à
vérifier que le domaine personnalisé est bien déclaré **dans le projet Pages**,
ce qui n'a pas pu l'être depuis l'environnement de travail. C'est l'étape 2, et
elle prend trente secondes.

---

## Étape 1 — Déployer les corrections

```bash
cd livrables/ecosysteme-attractor/espace-coaching

# La recette d'abord. Toujours avant, jamais après.
cd tests && npm i && npm run recette && cd ..

npx wrangler pages deploy public --project-name=coaching-attractor \
    --branch=main --commit-dirty=true
```

Les trois pièges sont déjà écrits dans `wrangler.toml` et ils ont déjà été
payés ailleurs. Le principal : **la branche de production est `main`**, et se
tromper envoie le déploiement en préversion sans afficher la moindre erreur.

- [ ] La recette passe
- [ ] Le déploiement annonce bien la branche `main`

---

## Étape 2 — Vérifier le domaine

Ouvrir `https://coaching.agenceattractor.com` dans un navigateur.

| Ce qui s'affiche | Ce que ça veut dire | Quoi faire |
|---|---|---|
| L'écran « Espace coaching · Accès réservé » | C'est branché, rien à faire | Passer à l'étape 3 |
| Erreur **522** | Le CNAME existe mais le domaine n'est pas déclaré dans le projet Pages | Cloudflare → Pages → `coaching-attractor` → Custom domains → ajouter `coaching.agenceattractor.com`. **Dans cet ordre**, jamais l'inverse |
| Erreur de certificat | Le certificat n'est pas encore émis | Attendre, c'est quelques minutes après la déclaration du domaine |

- [ ] `https://coaching.agenceattractor.com` affiche l'écran de connexion
- [ ] `https://coaching.agenceattractor.com/q` affiche « Ce lien ne fonctionne
      pas » (c'est la bonne réponse sans jeton), **sans barre oblique finale**,
      parce que c'est la forme qu'on écrit à la main dans un message

---

## Étape 3 — La voir sur un vrai téléphone

La recette automatique simule un téléphone. Elle ne remplace pas un pouce sur
un écran. Quatre choses à regarder, pas plus, elles prennent cinq minutes.

- [ ] **Se connecter.** Le clavier ne doit pas recouvrir le bouton « Entrer »
- [ ] **Ouvrir l'onglet Décryptage** sur une fiche. Le tableau des
      rééquilibrages défile **dans son cadre**, sans faire bouger la page
- [ ] **Ouvrir une séance** et faire défiler jusqu'en bas. Les six boutons de
      la barre d'actions se touchent sans se tromper de voisin
- [ ] **Ouvrir le questionnaire** avec un vrai lien, sur un autre téléphone que
      le sien, et répondre à une dizaine d'affirmations. C'est le seul écran
      que verra la cliente, et il est le seul qu'on ne peut pas rattraper une
      fois envoyé

Sur le questionnaire, vérifier aussi : couper la 4G au milieu, répondre à trois
affirmations, remettre la 4G. Le témoin en haut à droite passe en « en attente
de réseau » puis revient à « enregistré », et rien n'est perdu. C'est le
comportement qui a été écrit, il n'a jamais été observé.

---

## Étape 4 — Le contrat

Trois lignes du contrat ne se remplissent pas au clavier, elles supposent une
démarche. Le détail est dans la note d'usage en fin de
`../certification-preparation-mentale/CONTRAT-COACHING-v2.md`.

- [ ] **Assurance RC professionnelle** souscrite, ou article 13 retiré en
      entier. Ne jamais le laisser à trous : déclarer une assurance qu'on n'a
      pas est une fausse déclaration contractuelle
- [ ] **Adhésion à un médiateur de la consommation** référencé par la CECMC.
      Celle-là ne se retire pas : elle est obligatoire dès qu'on vend à un
      particulier, et un médiateur cité sans adhésion refuserait la saisine
- [ ] **Question posée à l'Académie** sur « l'association » à qui son modèle
      prévoit d'envoyer un exemplaire nominatif. Tant que la réponse n'est pas
      connue, aucun exemplaire ne part vers un tiers
- [ ] SIRET, adresse, téléphone, courriel remplis
- [ ] Durée de validité (art. 3), montant et échéancier (art. 8) remplis
- [ ] La durée de conservation de l'article 11 et la date « Données conservées
      jusqu'au » de la fiche disent **la même chose**, vingt-quatre mois

---

## Étape 5 — Ouvrir le premier parcours

Dans l'espace, « Nouvelle personne ». Le parcours démarre à « la demande » et
le lien du questionnaire est créé aussitôt, sans obligation de l'envoyer.

L'ordre imposé par la base, qu'aucun écran ne peut contourner :

```
demande → découverte → engagement → phase 1 → phase 2 → phase 3 → clôture → suivi
```

Trois choses ne s'inventent pas au moment de les faire :

1. **La porte de « l'engagement » demande les trois** : contrat signé,
   premier versement reçu, questionnaire validé. Sans les trois, pas de
   première séance. C'est la règle qui protège l'accompagnement, pas une
   formalité
2. **Une séance ne peut pas être déclarée tenue sans objectif de séance.** La
   base le refuse. C'est le vocabulaire du fascicule et un critère de notation
3. **Les scripts s'arrêtent à la séance 1.** `scripts/02-SEANCE-1.md` est le
   dernier écrit. Les séances 2 et suivantes se préparent au fur et à mesure,
   à partir du décryptage

---

## Ce qui reste ouvert après tout ça

| Sujet | Pourquoi ce n'est pas dans cette liste |
|---|---|
| L'annonce de l'offre au 15 octobre | C'est le volet commercial, pas la mise en service de l'outil. Et il dépend du résultat de la soutenance |
| Les scripts des séances 2 à 8 | Ils se construisent avec la première cliente, pas avant |
| La notification Resend | La clé `resend_api_key` doit être dans le coffre du projet Supabase. Si elle manque, le journal écrit « impossible : clé absente du coffre » et la validation du questionnaire réussit quand même. À vérifier au premier questionnaire rempli |
| La purge automatique | `select cron.schedule('pm-purge', '30 3 * * *', 'select public.pm_purger();')` reste à exécuter une fois pg_cron disponible. Sans elle, l'effacement à 24 mois ne se déclenche pas, et l'article 11 du contrat promet quelque chose qui n'arrive pas |

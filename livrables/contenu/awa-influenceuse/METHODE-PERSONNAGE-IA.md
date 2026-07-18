# Playbook Attractor — Créer et produire un personnage IA réaliste

> Source : coaching d'Emmanuel Yao (Agence Innovation Créative), dans le cadre du partenariat d'échange.
> Objet : méthode de production d'un personnage IA ultra-réaliste, cohérent et réutilisable, en image et en vidéo.
> Première application : **Awa**, personnage principal de la campagne d'influence par IA.

---

## Principe fondateur

On **sépare l'identité du personnage de son apparence vestimentaire**. On construit d'abord une identité visuelle stable (visage + morphologie + vues de référence), puis on habille et on met en scène. Tout ce qui n'est pas fourni comme référence à l'IA **peut changer d'une génération à l'autre** : la cohérence se prépare, elle ne s'improvise pas.

---

## PARTIE 1 — Construire la fiche personnage (identité visuelle)

**Étape 1 — Le visage (le plus important)**
Créer uniquement le visage, sur **fond blanc**, ultra-réaliste : peau très détaillée, pores visibles, textures naturelles, regard crédible, cheveux réalistes, éclairage neutre de studio, qualité indiscernable d'une vraie photo. Les vêtements n'ont aucune importance ici. **Cette image devient la référence principale, conservée pour toutes les générations futures.**

**Étape 2 — La morphologie**
Définir précisément : taille, corpulence, musculature, silhouette, proportions, posture naturelle. Si l'IA ne produit pas la bonne morphologie, utiliser une **photo de référence** du type de corps voulu, **visage masqué ou supprimé** (Photoshop) pour ne pas transférer les traits du modèle. Analyser ce corps → en tirer un prompt morphologique → le combiner au visage officiel. Résultat : visage officiel + morphologie souhaitée.

**Étape 3 — Les vues de référence**
Générer plusieurs plans du personnage : portrait (visage), buste (jusqu'à la poitrine), mi-corps (jusqu'aux cuisses), plein pied. Ces images serviront de références pour les générations suivantes.

**Étape 4 — Vêtements neutres pendant la création**
Tant que l'identité n'est pas validée, garder une tenue neutre et près du corps (débardeur uni, t-shirt simple) pour bien voir silhouette, proportions, épaules, bras, posture. **Ne pas figer une tenue définitive trop tôt.**

**Étape 5 — La tenue officielle (si nécessaire)**
Quand le personnage est finalisé et que la tenue fait partie de son identité (uniforme, costume, vêtements emblématiques), générer une image du personnage portant cette tenue. Elle devient la **référence officielle du personnage habillé**, utilisée pour le Character Sheet.

**Étape 6 — Le Character Sheet**
Depuis l'image officielle, produire une **planche multi-angles** : face, trois quarts, profil gauche, profil droit, dos, portrait rapproché, buste, plein pied — toutes les vues sur une seule planche. C'est la garantie de cohérence pour les images et les **vidéos longues**.

**Étape 7 — Usage selon la durée**
- **Vidéos courtes (< 1 min)** : le Character Sheet n'est pas indispensable, quelques vues suffisent (portrait, buste, trois quarts).
- **Vidéos longues / forte cohérence** : Character Sheet complet recommandé (proportions, expressions, volumes, vêtements, détails, cohérence d'une scène à l'autre).

**Résultat** : visage officiel + morphologie + vues de référence + tenue officielle (si besoin) + Character Sheet = **identité visuelle stable, réutilisable dans tous les projets**.

---

## PARTIE 2 — Préparer la continuité avant la vidéo (posture de réalisateur)

Avant toute génération, classer **chaque élément** de la scène en deux catégories.

**Éléments secondaires** (peuvent varier sans nuire) : bouteille d'eau quelconque, verre, stylo, carnet, tasse, plante, livre, passants anonymes. Inutile de les créer à l'avance.

**Éléments importants** (doivent rester identiques sur tous les plans → à créer comme références AVANT la vidéo) :
- uniforme / tenue spécifique / chaussures reconnaissables / sac / montre identifiable
- produit de marque (ex. une canette précise), ordinateur/téléphone précis, véhicule
- logo, accessoire distinctif, élément de branding
- personnage secondaire récurrent, animal récurrent

**Les vêtements** changent très facilement d'une génération à l'autre (coupe, matière, fermeture, couture, texture). La tenue définitive se crée **une seule fois** puis se réutilise comme référence.

**Les décors** narratifs importants se fixent dès le départ (tour Eiffel, studio de podcast, salle de réunion, cuisine ou bureau identifiable) et deviennent des références.

**Les personnages secondaires récurrents** ont chacun leur propre fiche (visage, morphologie, tenue, Character Sheet, références).

**Checklist du réalisateur — à établir avant toute génération** : personnage principal · personnages secondaires · décors · accessoires · objets importants · vêtements · véhicules · produits · animaux · logos · éléments de branding.

---

## PARTIE 3 — Choisir le moteur de génération vidéo

**Le défi central : la continuité.** Beaucoup de moteurs travaillent à partir d'une **seule image** de départ et reconstruisent tout à chaque frame. Ils ne « savent » pas que c'est le même personnage, le même sac, la même montre → au fil des mouvements apparaissent : visage qui dérive, proportions qui évoluent, vêtements qui se transforment, accessoires qui changent ou disparaissent, mains déformées. Plus les mouvements sont importants, plus le risque augmente.

**L'approche multi-références (ex. « Cides ») :** au lieu d'une seule image, on **importe séparément** le personnage, le décor, les accessoires, chaque objet important, chacun avec sa propre référence. Le moteur ne devine plus, il réutilise → **cohérence nettement meilleure** entre plans et séquences. *(Nom du moteur cité par Emmanuel à confirmer côté orthographe/outil exact.)*

**Deux méthodes de génération :**
- **Méthode 1 — À partir des références (la plus robuste)** : fournir personnage + accessoires + décor + objets importants, puis décrire précisément l'action (« il tient la bouteille, la porte à sa bouche, boit, la repose en regardant la caméra »). Le moteur compose la scène à partir des références. Généralement les meilleurs résultats.
- **Méthode 2 — Animer une image existante** : créer d'abord une image fixe (le personnage tient déjà la bouteille) puis demander de l'animer. Excellent **quand les mouvements restent simples** : caméra stable, visage vers la caméra, faibles rotations, peu d'objets manipulés. **Limites** : rotation complète, gros changement d'angle, mouvements rapides, interactions complexes, grands déplacements → le moteur doit inventer ce qu'il ne possède pas → incohérences.

**Recommandation Attractor** : privilégier les **références complètes** (fiche personnage + Character Sheet + décor de référence + accessoires + objets de marque + éléments de continuité). Plus le moteur reçoit de références, moins il improvise, plus la vidéo est cohérente.

**Le coût de la qualité** : les moteurs les plus performants (type Cides) consomment plus de crédits, mais c'est compensé par la stabilité visuelle, moins de retouches et un gain de temps en post-production.

**Conclusion** : choisir le moteur selon le **niveau de cohérence recherché**, jamais uniquement le prix ou la rapidité. Vidéos courtes avec peu de mouvement → un moteur classique suffit. Productions ambitieuses, personnages récurrents, scènes complexes → approche multi-références.

---

## Checklist opérationnelle (à cocher pour chaque personnage / production)

**Fiche personnage**
- [ ] Visage officiel validé (fond blanc, ultra-réaliste, conservé)
- [ ] Morphologie définie (au besoin, via photo de référence visage masqué)
- [ ] Vues de référence (portrait / buste / mi-corps / plein pied)
- [ ] Tenue neutre pour valider l'identité
- [ ] Tenue officielle (si elle fait partie de l'identité)
- [ ] Character Sheet complet (multi-angles)

**Continuité (avant vidéo)**
- [ ] Liste des éléments importants établie (posture réalisateur)
- [ ] Tenues définitives créées et fixées
- [ ] Décors importants fixés en référence
- [ ] Personnages secondaires récurrents : fiche chacun
- [ ] Accessoires / produits de marque / logos en référence

**Production vidéo**
- [ ] Moteur choisi selon le niveau de cohérence
- [ ] Méthode choisie (références complètes vs animation d'image) selon la complexité des mouvements
- [ ] Prompts d'action précis

---

## Application immédiate à Awa

Awa est le personnage principal de la campagne d'influence par IA. Avant toute production de vidéo, l'étape n°1 est de construire **sa fiche personnage**, dans l'ordre : visage officiel → morphologie → vues de référence → tenue → Character Sheet. Tout le reste (scripts, scènes, décors récurrents) s'appuiera dessus.

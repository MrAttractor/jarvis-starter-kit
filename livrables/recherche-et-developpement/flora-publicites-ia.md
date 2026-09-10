# FLORA, publicités et personnages IA

> Note R&D. Statut : évaluation faite en session, test de génération réel effectué.
> Date : 10/09/2026. Compte FLORA connecté au workspace `Mr Attractor's workspace`.

---

## 1. Ce que c'est réellement

FLORA n'est pas un générateur d'images de plus. C'est un canvas visuel où chaque bloc est un nœud (texte, image, vidéo, audio, 3D) relié aux autres par des arêtes. On y construit une chaîne de production réutilisable, pas un one-shot.

Le point qui compte pour l'agence : **le canvas est branché sur l'Assists via MCP**. Claude lit et écrit dans le canvas, lance les générations, récupère les résultats. Pas besoin d'ouvrir l'interface pour produire.

Vérifié en session :
- 430 modèles image, 173 modèles vidéo, plus audio et 3D
- Une famille de modèles passe par la passerelle interne FLORA et coûte une fraction de crédit (Seedream 5 Pro, GPT Image 2.5 Flare, MiniMax H3 Max en vidéo, Gemini Omni Flash). Test réel effectué : une image 2K en 16:9 a coûté **0,17 crédit**, alors que l'estimation annoncée était de 0
- Les modèles premium coûtent entre 300 et 1500 crédits par clip vidéo. C'est là que part le budget

Autrement dit, l'écart entre un modèle de passerelle et un modèle premium est de l'ordre de 1 à 2000. Toute la phase de recherche peut se faire pour presque rien.

---

## 2. Le canvas "Masterclass Publicités avec l'IA"

Le lien envoyé pointe vers un canvas dupliqué dans le workspace : 158 nœuds, 285 liaisons, 7 workflows, 4 groupes. Ce n'est pas un tutoriel, c'est une usine livrée montée.

Quatre formats publicitaires y sont câblés de bout en bout :

| Groupe | Format | Mécanique |
|---|---|---|
| Workflow 1 | Storytelling 3D | Scène réelle, puis bascule dans le monde mental du personnage, retour au produit. Style Pixar |
| `Le dessin animé` | Mascotte produit | Personnage 3D récurrent qui porte le produit |
| `Témoignage` | UGC créateur | Une personne filme son téléphone en selfie, parle sans coupure. Rendu caméra frontale, bruit numérique, pas d'interface à l'écran |
| `La voix off` | UGC + narration | Script découpé en 12 plans, chaque plan devient un clip, voix off générée par-dessus |

### La vraie trouvaille technique

Deux mécanismes sont à reprendre tels quels.

**La chaîne d'agents texte.** Dans le groupe `Témoignage`, les nœuds s'enchaînent ainsi :

```
Page produit → Creative Strategist → Directeur de Casting → Photographe → prompt image → image → prompt vidéo → clip
```

Chaque nœud texte est un rôle qui écrit le prompt du suivant. C'est exactement notre logique d'agents, transposée en visuel. On ne prompte pas une image, on fait tourner une équipe.

**Le nœud `Split Text`.** Un script en 12 plans entre dans un seul nœud, et douze prompts en sortent, chacun câblé sur son propre nœud vidéo. Un script, douze clips, une seule action. C'est ce qui fait passer de l'artisanat à la série.

---

## 3. Ce qu'on en fait, par ordre de rentabilité

### A. Le casting Attractor Office (priorité 1)

C'est l'usage qui rapporte le plus vite parce que le contenu existe déjà. La skill `attractor-office` produit les scripts, il manque les visages.

Chaque personnage devient une fiche de référence figée : Awa Coulibaly, Miriam Kouassi, Serge Kouamé, Roland Brou, Kofi Asante, Carelle, Mac Arthur. Une fois la fiche validée, elle sert de référence image sur toutes les générations suivantes. Le personnage ne dérive plus d'un épisode à l'autre.

Chaîne : script `attractor-office` → `Split Text` en plans → keyframes avec les fiches en référence → clips → voix off française.

Gain : la série passe de "à produire" à "à publier". Facebook, TikTok, Reels.

### B. Les publicités des apps métiers (priorité 2)

Le format `Témoignage` est directement transposable. Un faux client d'un commerce ivoirien qui explique, téléphone en main, ce que l'app lui a changé. C'est du contenu de preuve, pas du contenu de marque.

Un pack par app : J'envoie Express, MY NUGO, Livraison Pro, Fidelys.

À vérifier avant de lancer : le rendu des visages et des décors ivoiriens. Les modèles sont entraînés majoritairement sur des références occidentales. C'est le principal risque de crédibilité et ça se teste en une génération, pas en théorie.

### C. Les visuels de closing (priorité 3)

`maquette-closer` produit l'interface, FLORA produit le contexte : l'app affichée sur un téléphone tenu en main, dans le vrai décor du métier du prospect. Une boutique, un salon, un entrepôt.

Le skill `flora-mockup-deck` fait déjà ça : une créa devient quatre placements réels plus trois formats sociaux plus un PDF annoté.

### D. Une ligne de revenu à part entière (à instruire)

La production de publicités IA est vendable telle quelle, indépendamment des apps. Le Media Buyer a les campagnes, il n'a pas les créas. À chiffrer avec `/devis-express` avant d'en parler à un prospect.

---

## 4. Ce que ça coûte, honnêtement

Les crédits sont le vrai sujet, pas l'abonnement.

- Un clip vidéo premium : 300 à 1500 crédits
- Une pub de 30 secondes en 5 plans : compter 5 clips, plus les keyframes, plus les ratés. En pratique on double
- Les modèles de passerelle permettent toute la phase de recherche et de casting pour une fraction de crédit. Les crédits ne servent qu'au rendu final

**Règle à appliquer** : phase exploratoire sur les modèles gratuits, uniquement le master final sur un modèle payant.

Le solde de crédits du compte n'a pas pu être lu par l'API. À vérifier dans l'interface avant tout lancement en série.

---

## 5. Les garde-fous du cerveau qui s'appliquent

**R-50, zéro AI-slop.** Le risque est maximal ici. Une pub IA se repère à trois signes : les mains, le texte incrusté, et le sourire trop parfait. Toute production passe par `/gardien` avant publication.

**R-75, le noir et or est un signe de production automatique.** Les modèles y vont par défaut dès qu'on écrit "premium" ou "luxe" dans un prompt. Il faut l'écarter explicitement dans chaque prompt et rester sur l'accent unique de la charte Attractor.

**R-11, construire plutôt qu'abonner sous 3 jours.** Exception justifiée ici : l'accès aux modèles ne se construit pas, il s'achète. Mais la chaîne, elle, nous appartient. Elle vit dans notre canvas et dans nos skills, pas dans la masterclass.

**R-30, pas de production de contenu sans date de publication engagée.** Ne pas générer un stock d'épisodes sans calendrier. Le contenu qui dort ne rapporte rien.

**R-14, le contenu appartient au client.** Pour les pubs vendues, préciser au contrat la cession des visuels générés.

---

## 6. Point juridique à trancher

Un personnage IA récurrent qui recommande un produit demande deux choses :

1. **La mention IA.** Le règlement européen sur l'IA impose la transparence sur les contenus synthétiques. Meta demande déjà la déclaration du contenu IA sur ses plateformes
2. **La ressemblance.** Un visage généré qui ressemble à une personne réelle est un risque. Sur des personnages de fiction assumés comme ceux d'Attractor Office, le risque est faible. Sur un faux témoignage client, il est réel

À passer par `/agent-rgpd` avant la première diffusion payante.

---

## 7. Prochaine étape

Une seule, pas cinq : **valider le casting Attractor Office sur les modèles de passerelle**. Sept fiches personnages pour environ 1,2 crédit au total, et le test porte sur ce qui compte vraiment, le rendu des visages ivoiriens.

Si les visages tiennent, tout le reste s'enchaîne. S'ils ne tiennent pas, on a la réponse pour le prix d'un café.

Projet créé pour ça : `ATTRACTOR OFFICE - Casting`. Première fiche générée, Awa Coulibaly, à valider à l'œil sur le canvas.

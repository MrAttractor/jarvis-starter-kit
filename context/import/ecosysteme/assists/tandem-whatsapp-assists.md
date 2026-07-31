# Tandem WhatsApp Business x Attractor Assists
> Échange du 12/06/2026 — logique de fond, MVP, étude de cas C'Real

---

## La logique de base

**Le problème résolu :** un entrepreneur CI/diaspora gère tout sur WhatsApp. Il répond en retard, oublie des commandes, subit la fatigue du SAV. Tout est dans sa tête.

**Ce que fait Assists :** un employé disponible 24h/24 qui lit les messages WhatsApp, comprend ce que le client veut, répond aux questions simples, note les commandes, et ne dérange le patron que quand c'est vraiment nécessaire.

**L'image simple :** le numéro WhatsApp = une boîte aux lettres. Aujourd'hui c'est l'entrepreneur qui a la clé. Avec Assists, il donne la clé à un assistant. Les clients continuent d'envoyer des lettres à la même adresse — ils ne voient aucune différence.

---

## La chaîne technique

```
[Client]  →  WhatsApp  →  n8n (reçoit)  →  Claude (comprend)  →  Supabase (enregistre)
                                                                         ↓
                                                              [Dashboard entrepreneur]
```

- **WhatsApp** = le canal (là où les messages arrivent)
- **n8n** = le facteur (fait circuler les messages)
- **Claude** = le cerveau (comprend et répond)
- **Supabase** = la mémoire (enregistre tout)
- **Assists** = l'interface (l'entrepreneur voit ce qui se passe)

---

## Les 5 scénarios d'adoption

| # | Scénario | Ce que ça implique | Pour qui |
|---|----------|--------------------|----------|
| 1 | Numéro virtuel dédié | Nouveau numéro créé, transition progressive | Client prudent, activité à protéger |
| 2 | Migration directe | Numéro existant basculé sur l'API, perd l'app | Client convaincu, prêt à s'engager |
| 3 | Sans WhatsApp | Lien web uniquement, interface navigateur | Clients pas sur WhatsApp (rare sur cible CI) |
| 4 | Via outil tiers (WATI) | Simplifie la complexité Meta, coût ~30-50€/mois | Si on veut éviter la technique |
| 5 | Mode hybride | Assistant répond + entrepreneur peut reprendre la main | Le plus puissant, le plus complexe |

**Pour le MVP : scénarios 1 et 2 uniquement.**

---

## Ce que "migrer" veut dire

**Migrer = changer qui a la clé de la boîte aux lettres.**

- Les clients ne perdent rien. Leur historique reste sur leur téléphone. Ils continuent d'écrire au même numéro.
- Ce qui change : le patron ne peut plus ouvrir WhatsApp sur ce numéro depuis son téléphone. C'est l'assistant qui gère.
- Le risque : si Assists tombe en panne, le patron est coupé de ses clients.

---

## Complexité par palier

**MVP artisanal (score 45/100) :**
- Faisable en 1 journée technique
- Installation manuelle par client (3-4h)
- Gestion possible jusqu'à 5-6 clients
- Dépendance : 5 systèmes doivent fonctionner ensemble (Twilio + Meta + n8n + Claude + Supabase)
- Période d'attente Meta : 1-7 jours pour vérification

**Version industrialisée (score 160/200) :**
- Onboarding automatisé
- Isolation des données entre clients
- Facturation automatique
- Support à l'échelle
- Conformité RGPD
- Travail d'une équipe de 3-4 personnes sur 6 mois

---

## Modèle de pricing MVP

**Coûts réels par client/mois :**
- Numéro Twilio : ~2€
- Claude API : ~3-5€
- Railway (réparti) : ~1€
- Total : ~6-13€/mois

**Pricing recommandé :**
- Setup (installation + anamnèse + configuration) : **150€**
- Abonnement mensuel : **49€/mois** (~32 000 FCFA)

Pour petits commerçants CI : envisager 19€/mois (~12 000 FCFA) avec setup à 100€.

**Avec 10 clients :** 1 500€ setup + 490€/mois récurrent.

---

## Étude de cas : C'Real (Kezey)

**Activité :** farines infantiles à Abidjan (Cocody, Yopougon, Marcory, Abobo)
**Problème exprimé :** "C'est le SAV qui me fatigue, je n'arrive pas à le faire jusqu'au bout."
**Produits :** Mes premières C'real (1 500 FCFA), Multicreal Soja (1 500 FCFA), Mil & Maïs (1 000 FCFA), Pack prise de poids (5 000 FCFA)
**Paiement :** Wave, MTN Money, Orange Money, XPaye
**Demande spécifique :** l'assistant répond à certaines heures seulement

**Ce qui existe déjà :**
- Maquette HTML complète sur demo.agenceattractor.com/creal-assists
- Proposition envoyée (3 pages : constat + interfaces + next steps)
- Kezey est testeuse Assists (compte existant)
- Profil personnalisé NON encore configuré dans Assists

**Ce qui a été promis dans la proposition :**
- "Son lien à elle" avec ses vrais produits et tarifs
- Connexion XPaye
- Deux interfaces : tableau de bord Kezey + vue cliente
- "Mise en ligne sur ton lien à toi"

**Option B retenue pour la livraison :**
Le mini-site HTML C'Real = interface cliente réelle (aux couleurs C'Real)
Assists = cerveau backend invisible

```
Cliente de Kezey  →  mini-site C'Real (lien web)  →  Claude (profil C'Real)  →  Supabase
Kezey             →  dashboard (commandes, SAV, stats en temps réel)
```

**Livraison en 2 temps :**
1. Mini-site fonctionnel + dashboard réel (1-2 jours de travail)
2. WhatsApp comme porte d'entrée supplémentaire (quand MVP prêt)

**Ce que tu dis à Kezey :**
> "Ce que tu as vu dans la démo, c'est exactement ce que tu reçois. Ton interface, tes couleurs, tes produits. Tes clientes ouvrent un lien sur leur téléphone et chattent avec ton assistant. Toi tu as ton tableau de bord avec tes commandes en direct. Les heures que tu veux, on les configure ensemble. WhatsApp arrive dans un second temps, comme une deuxième porte d'entrée."

---

## Insight clé : la maquette-closer = 80% de l'anamnèse

Les infos collectées pour faire la maquette sont exactement les infos dont l'assistant a besoin pour fonctionner. Le même travail sert deux fois : convaincre le prospect, puis configurer son assistant.

**Pipeline simplifié :**
```
Maquette-closer  →  Closing  →  Infos maquette = anamnèse  →  Setup  →  Client actif
```

---

## Infrastructure : Railway vs Twilio

*(voir échange du 12/06/2026)*

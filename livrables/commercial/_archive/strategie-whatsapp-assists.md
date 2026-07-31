# Stratégie — WhatsApp comme moteur d'acquisition Attractor Assists

**Date :** 11 juin 2026  
**Statut :** En construction — campagne d'acquisition principale

---

## L'argument fondateur

> "Tes clients sont déjà sur WhatsApp. Ton assistant aussi."

En Côte d'Ivoire et diaspora, WhatsApp **est** le bureau.  
Les commandes arrivent sur WhatsApp. Les devis se négocient sur WhatsApp. Les clients relancent sur WhatsApp.  
Donner un assistant IA sur ce canal = mettre un employé intelligent là où le business se passe vraiment.

**Trois arguments qui ferment la vente :**
1. Tes clients n'ont rien à installer — ils écrivent comme d'habitude
2. Il répond en moins de 5 secondes, 24h/24
3. Tu le formes une fois, il applique toujours

---

## Potentiel produit — ce que l'assistant WhatsApp peut faire

### Disponible maintenant
- Répondre aux questions fréquentes (horaires, prix, disponibilité)
- Qualifier un prospect (poser les bonnes questions avant intervention humaine)
- Collecter des informations (nom, besoin, budget) dans Supabase
- Confirmer une commande avec récapitulatif

### Prochaines sessions
- Générer un devis automatiquement (collecte infos → PDF envoyé)
- Prendre un rendez-vous (synchronisé Google Calendar)
- Relances automatiques (n8n relance les silencieux après 48h)
- Rapport quotidien envoyé chaque matin à l'entrepreneur

### Vision complète
- Broadcast ciblé (promos à toute la liste)
- Collecte d'avis après commande
- Paiement intégré (guide vers lien de paiement)
- Multilingue (français, anglais, nouchi)

---

## Secteurs prioritaires chez la cible CI / diaspora

| Secteur | Ce que l'assistant fait |
|---------|------------------------|
| Restaurant / Traiteur | Prend les commandes, confirme, répond menu |
| Salon de beauté | Prend les RDV, rappels, tarifs |
| Boutique / E-commerce | Stocks, commandes, suivi livraison |
| Prestataire de service | Qualifie, envoie devis, relance |
| Formateur / Coach | Répond programmes, collecte inscriptions |

---

## Go-to-Market — La campagne d'acquisition

### Rôles dans la machine

| Rôle | Qui | Mission |
|------|-----|---------|
| Stratégie & vente | Mac Arthur | Closer, définir les offres, piloter |
| Installation client | Assistante humaine (à recruter) | Configurer WhatsApp Assists chez chaque client |
| Acquisition | Pub Meta (Facebook/Instagram) | Ramener les prospects |

### Funnel d'acquisition

```
PUB META
(vidéo démo ou témoignage)
      ↓
PAGE D'ATTERRISSAGE
"Vois à quoi ressemblerait ton assistant WhatsApp"
      ↓
DÉMO PERSONNALISÉE
(maquette avec nom du client, son secteur)
      ↓
CLOSING
Mac Arthur présente → signe
      ↓
INSTALLATION
Assistante configure WhatsApp Assists
      ↓
CLIENT ACTIF → MRR
```

### Le message pub (à tester)

**Version A — Bénéfice direct :**
> "Et si ton WhatsApp répondait à tes clients pendant que tu dors ?"

**Version B — Preuve sociale :**
> "[Prénom], restauratrice à Cocody, ne répond plus aux commandes elle-même. Son assistant le fait. 24h/24."

**Version C — Question ciblée :**
> "Tu perds des clients parce que tu ne peux pas répondre à temps sur WhatsApp ?"

---

## Modèle économique — Questions ouvertes

### Structure de prix proposée (à valider)

| Formule | Prix | Ce qui est inclus |
|---------|------|-------------------|
| Installation | 150 000 à 200 000 FCFA (one-shot) | Config complète, formation, 1 mois de suivi |
| Abonnement mensuel | 25 000 à 50 000 FCFA/mois | Hébergement, maintenance, mises à jour IA |

**Coûts réels par client/mois :**
- Hébergement n8n (Railway) : ~3 000 FCFA
- API Claude Haiku : ~500 FCFA pour 500 messages
- Numéro virtuel : ~1 200 FCFA
- **Total coût : ~5 000 FCFA/mois**

**Marge brute : ~80% sur l'abonnement**

### Questions à trancher pour le MRR

1. Un n8n partagé entre clients ou un n8n par client ?
2. Un numéro WhatsApp par client ou système multi-tenant ?
3. Qui gère le renouvellement du token Meta ? (automatisation à construire)
4. Comment gérer la montée en charge (100 clients = 100 configs) ?
5. Quel contrat signer avec le client ? (accès Meta, responsabilité données)

---

## Profil de l'assistante à recruter

**Mission principale :** installer et configurer Assists WhatsApp chez les clients

**Compétences requises :**
- À l'aise avec les outils numériques (pas besoin de coder)
- Capable de suivre un SOP étape par étape
- Bonne communication client pour l'onboarding

**Ce qu'elle doit maîtriser (tu la formes) :**
- Le SOP connexion WhatsApp (déjà documenté)
- Comment personnaliser le system prompt pour chaque métier
- Bases de Meta Business Manager

**Format de travail envisagé :**
- Freelance à la mission (paiement par installation)
- ou temps partiel si volume croissant

---

## Prochaines étapes

- [ ] Finaliser le test technique WhatsApp (URL stable en production)
- [ ] Créer la page d'atterrissage de la campagne
- [ ] Produire la vidéo démo (30 secondes, en situation réelle)
- [ ] Définir les prix définitifs et le contrat client
- [ ] Recruter et former l'assistante
- [ ] Lancer la première pub Meta (budget test : 10 000 FCFA/jour)
- [ ] Viser les premiers 10 clients actifs → MRR de base validé

---

*Stratégie Mr Attractor — Agence Attractor*

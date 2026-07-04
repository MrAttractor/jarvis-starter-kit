# Architecture App Métier — Template Réutilisable

> Toute app métier sur mesure (Famille A) suit cette architecture. Ne pas réinventer à chaque client.

---

## Stack technique

| Couche | Techno | Coût infra |
|---|---|---|
| BDD + Auth + API | Supabase (Free tier) | 0€ |
| Hosting frontend | Netlify (Free tier) | 0€ |
| Nom de domaine | OVH (~12€/an) | Facturé au client |
| Notifications WhatsApp | n8n (déjà en place) | 0€ |
| Emails transactionnels | Resend (Free tier) | 0€ |

Coût infra fixe : **~12€/an** par client. Tout le reste = marge.

---

## Structure des URLs (toujours 2 interfaces)

```
nomduclient.com              → Page publique (clients finaux, sans login)
app.nomduclient.com          → Dashboard admin (propriétaire seul, login sécurisé)
```

---

## Page publique (sans login)

Contenu standard selon le métier :
- Formulaire de demande / commande
- Suivi par numéro (recherche publique)
- Tarifs + FAQ
- Bouton WhatsApp direct
- Présentation de l'entreprise

---

## Dashboard admin (login sécurisé)

Modules standards disponibles (activer selon la formule) :

| Module | Inclus dans |
|---|---|
| Tableau de bord KPIs | Toutes formules |
| Gestion des commandes/colis/dossiers | Toutes formules |
| Gestion clients | Toutes formules |
| Tarifs & paiements | Toutes formules |
| Revenus + retrait | Toutes formules |
| Suivi client (lien public tracking) | Toutes formules |
| Notifications WhatsApp auto | Active + Premium |
| Discussion admin ↔ clients | Active + Premium |
| Module métier avancé (achats, maritime, etc.) | Premium |
| Maintenance 6 mois | Premium |

---

## Tables Supabase (modèle de base)

Adapter les noms selon le métier. Cœur commun :

```sql
clients        (id, nom, whatsapp, localisation, adresse, created_at)
commandes      (id, client_id, reference, statut, montant, created_at)
revenus        (id, type, montant, methode, reference, created_at)
messages       (id, client_id, contenu, expediteur, created_at)
```

Tables métier spécifiques à créer selon le secteur (ex: voyages, colis, dossiers, réservations).

---

## Grille tarifaire standard (3 formules)

| | Essentielle | Active | Premium |
|---|---|---|---|
| Dashboard admin complet | ✅ | ✅ | ✅ |
| Page publique | ✅ | ✅ | ✅ |
| Nom de domaine + mise en ligne | ✅ | ✅ | ✅ |
| Notifs WhatsApp auto | ❌ | ✅ | ✅ |
| Discussion admin ↔ clients | ❌ | ✅ | ✅ |
| Module avancé métier | ❌ | ❌ | ✅ |
| Maintenance 6 mois incluse | ❌ | ❌ | ✅ |
| **Prix** | **490€** | **790€** | **1 290€** |
| **Acompte (50%)** | 245€ | 395€ | 645€ |
| **Solde** | 245€ | 395€ | 645€ |

Maintenance mensuelle optionnelle après livraison : **40–80€/mois** selon formule.

---

## Tarif partenaire / DMV

Pour les premiers clients qui servent de démonstration de valeur (DMV) :
- Forfait spécial : **230€** (acompte 130€ + solde 100€)
- Maintenance : **50€/mois**
- Contrepartie client : **témoignage vidéo ou écrit** exploitable commercialement
- Usage interne : app utilisée comme démo vivante pour prospects

---

## Séquence de livraison

1. Acompte reçu → démarrage
2. Semaine 1 : Supabase setup + tables + auth + CRUD core
3. Semaine 2 : Modules secondaires + page publique
4. Semaine 3 : Notifications WA + domaine + déploiement + tests
5. Livraison → recueil témoignage → solde

---

## Premier cas d'usage (référence)

**J'Envoie Express** — Transport de colis France ↔ Côte d'Ivoire
- Client/partenaire : Jean Yves Gbouablé
- Domaine : jenvoieexpress.com (à prendre)
- Maquette : `livrables/clients/demo-site/public/jenvoie-express/index.html`
- Tarif appliqué : forfait partenaire DMV (230€ + 50€/mois)

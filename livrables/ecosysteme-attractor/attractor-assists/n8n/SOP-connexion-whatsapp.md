# SOP — Connexion WhatsApp Business à l'Assistant IA

**Auteur :** Mr Attractor  
**Version :** 1.0  
**Temps estimé :** 45 à 60 minutes (première fois)  
**Niveau :** Débutant accompagné

---

## Ce que ce guide permet de faire

Connecter un numéro WhatsApp Business à un assistant IA. Une fois configuré, toute personne qui envoie un message sur ce numéro reçoit une réponse automatique générée par l'IA — personnalisée selon le métier du client.

**Cas d'usage concrets :**
- Répondre aux clients 24h/24 sur WhatsApp
- Collecter des informations (devis, réservations, FAQ)
- Assister l'entrepreneur depuis son téléphone

---

## Ce qu'il faut avoir avant de commencer

| Élément | Où l'obtenir |
|---------|-------------|
| Un compte Meta Business Manager | business.facebook.com |
| Un numéro de téléphone dédié au bot | SIM physique ou virtuelle |
| Un accès à n8n (local ou cloud) | n8n.io |
| Une clé API Anthropic | console.anthropic.com |
| Le fichier `whatsapp-workflow.json` | Fourni par Mr Attractor |

> **Important :** Le numéro utilisé pour le bot ne peut plus être utilisé sur l'app WhatsApp normale. Prévoir un numéro dédié.

---

## PARTIE 1 — Configurer Meta Business Manager

### Étape 1 — Créer l'application Meta

1. Aller sur **developers.facebook.com**
2. Cliquer sur **"Mes apps"** → **"Créer une app"**
3. Choisir le type : **"Business"**
4. Donner un nom à l'app (ex : "Assistant IA - Nom du client")
5. Sélectionner le compte Business Manager du client
6. Cliquer sur **"Créer l'app"**

### Étape 2 — Activer WhatsApp

1. Dans le tableau de bord de l'app, chercher **"WhatsApp"**
2. Cliquer sur **"Configurer"**
3. Associer un compte WhatsApp Business existant **ou** en créer un nouveau

### Étape 3 — Récupérer les identifiants

Dans le menu gauche : **WhatsApp → Configuration API**

Noter ces deux informations (elles seront nécessaires plus loin) :

| Information | Description |
|-------------|-------------|
| **Phone Number ID** | Identifiant numérique du numéro (ex : 849844001520888) |
| **Token d'accès temporaire** | Commence par `EAAVXg...` — valide 24h pour les tests |

> Pour la production, un token permanent sera généré via un System User (voir Partie 4).

---

## PARTIE 2 — Préparer n8n

### Étape 4 — Exposer n8n publiquement (test avec ngrok)

n8n doit être accessible depuis Internet pour recevoir les messages de Meta.

**Installer ngrok (une seule fois) :**
```powershell
winget install ngrok.ngrok
```
Fermer et rouvrir le terminal après l'installation.

**Créer un compte ngrok gratuit :**
- Aller sur ngrok.com → Sign up
- Récupérer le token depuis le dashboard : menu **"Your Authtoken"**

**Configurer ngrok :**
```powershell
ngrok config add-authtoken VOTRE_TOKEN_NGROK
```

**Lancer le tunnel (laisser ce terminal ouvert) :**
```powershell
ngrok http 5678
```

L'URL publique s'affiche :
```
Forwarding   https://xxxx.ngrok-free.app -> http://localhost:5678
```

> **Limitation ngrok gratuit :** l'URL change à chaque redémarrage. Pour la production, utiliser une URL fixe (voir Partie 4).

### Étape 5 — Importer le workflow dans n8n

1. Ouvrir n8n : `http://localhost:5678`
2. Menu haut gauche → **"Add workflow"**
3. Cliquer sur **"..."** → **"Import from file"**
4. Sélectionner le fichier `whatsapp-workflow.json`
5. Le workflow apparaît avec tous les nœuds connectés

### Étape 6 — Configurer les clés dans le workflow

**Nœud "Appel Claude" :**
- Ouvrir le nœud
- Remplacer `REMPLACER_PAR_CLE_ANTHROPIC` par la clé API Anthropic du client
- La clé commence par `sk-ant-...`

**Nœud "Envoyer WhatsApp" :**
- Ouvrir le nœud
- Remplacer `REMPLACER_PAR_TOKEN_META` par le token d'accès Meta (voir Étape 3)

### Étape 7 — Activer le workflow

Cliquer sur **"Publish"** en haut à droite du workflow.

---

## PARTIE 3 — Connecter Meta au workflow

### Étape 8 — Enregistrer l'URL du webhook dans Meta

1. Retourner sur **developers.facebook.com**
2. Ton app → **WhatsApp → Configuration**
3. Section **"Webhooks"** → cliquer **"Modifier"**
4. Remplir les champs :

| Champ | Valeur |
|-------|--------|
| URL de rappel | `https://VOTRE_URL_NGROK.ngrok-free.app/webhook/whatsapp` |
| Token de vérification | `attractor2024` (ou tout autre mot choisi) |

5. Cliquer **"Vérifier et enregistrer"**

> Si la vérification réussit, la page revient à la configuration. C'est normal.

### Étape 9 — S'abonner aux événements

Sur la page Configuration, dans la section Webhooks :

1. Cliquer sur **"S'abonner"** en face de **"messages"**
2. Confirmer l'abonnement

---

## PARTIE 4 — Tester

### Étape 10 — Premier test

1. Depuis un téléphone, envoyer un message WhatsApp au numéro business du client
2. Dans n8n → menu gauche → **"Executions"**
3. Une exécution doit apparaître automatiquement
4. Le numéro expéditeur doit recevoir une réponse de l'IA dans les 5-10 secondes

**Si rien ne se passe**, vérifier :
- [ ] Le terminal ngrok est bien ouvert et affiche `online`
- [ ] Le workflow n8n est bien actif (toggle vert)
- [ ] L'abonnement "messages" est bien activé dans Meta
- [ ] Le token Meta n'a pas expiré (valide 24h)

---

## PARTIE 5 — Passer en production

> Cette partie est réalisée après validation des tests.

### Déployer n8n sur un serveur (URL fixe)

Pour que l'assistant fonctionne 24h/24 sans dépendre de ngrok :

**Option recommandée : Railway**
- Aller sur railway.app
- Déployer l'image Docker `n8nio/n8n`
- L'URL sera fixe et permanente (ex : `https://mon-n8n.up.railway.app`)

### Créer un token Meta permanent

1. Dans Meta Business Manager → **Paramètres** → **Utilisateurs système**
2. Créer un utilisateur système de type "Admin"
3. Lui attribuer l'accès à l'app WhatsApp
4. Générer un token sans expiration
5. Remplacer le token temporaire dans le nœud "Envoyer WhatsApp"

### Mettre à jour le webhook Meta

Remplacer l'URL ngrok par l'URL du serveur de production dans Meta → Configuration → Webhooks.

---

## Résumé des coûts

| Service | Coût |
|---------|------|
| Meta Cloud API | Gratuit jusqu'à 1 000 conversations/mois |
| Claude Haiku (Anthropic) | ~0,001$ par message |
| Railway (n8n hébergé) | ~5$/mois |
| Numéro SIM virtuelle | ~2€/mois |
| **Total estimé** | **~7€/mois** |

---

## Personnaliser l'assistant pour chaque client

Dans le nœud **"Appel Claude"**, modifier le champ `system` pour adapter la personnalité et les connaissances de l'assistant au métier du client.

Exemple pour un restaurant :
> "Tu es l'assistant du Restaurant Chez Kouassi. Tu réponds aux questions sur le menu, les horaires et les réservations. Tu es chaleureux et tu parles en français..."

---

*Document produit par Mr Attractor — Agence Attractor*  
*Pour toute question : contacter Mac Arthur*

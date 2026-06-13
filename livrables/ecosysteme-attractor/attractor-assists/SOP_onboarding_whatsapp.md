# SOP — Onboarding WhatsApp Business (Activation canal client)

**Durée estimée :** 45 à 90 minutes (selon disponibilité du numéro SIM)  
**Qui exécute :** Assistante (doublure Mac Arthur) — intervention humaine obligatoire  
**Prérequis niveau :** Aucune compétence technique requise. Suivre les étapes dans l'ordre.

> **Pourquoi ce SOP existe :** La connexion WhatsApp Business API ne peut pas être automatisée.
> Elle requiert un accès physique au numéro SIM du client, une intervention dans Meta Business Suite,
> et une configuration manuelle dans n8n. Ce document documente chaque étape pour qu'elle soit
> reproductible sans Mac Arthur.

---

## Vue d'ensemble du flux

```
Numéro SIM client → Meta Business Suite → API WhatsApp → Webhook n8n Railway → Claude → Client
```

Le client envoie un message WhatsApp → n8n le capte → Claude répond via Attractor Assists → le client reçoit la réponse sur WhatsApp.

---

## Checklist pré-session (à collecter AVANT de commencer)

Avant de lancer la session d'onboarding, s'assurer que le client a fourni :

- [ ] Numéro de téléphone dédié WA Business (format international, ex : +225 07 XXXXXXXX)
- [ ] Accès au téléphone physiquement (pour recevoir le SMS ou l'appel de vérification Meta)
- [ ] Nom du business (tel qu'il doit apparaître sur WhatsApp)
- [ ] Logo / photo de profil (format carré, min 192×192 px)
- [ ] Description courte du business (max 256 caractères)
- [ ] Identifiant de son compte Facebook / Meta Business Suite (ou accès à créer)
- [ ] Son profil Attractor Assists est créé et actif (vérifier dans Supabase > table `profiles`)

⚠️ **Ne pas commencer si l'un de ces éléments manque.** Planifier un rappel avec le client.

---

## Étape 1 — Accéder à Meta Business Suite

1. Aller sur [business.facebook.com](https://business.facebook.com)
2. Se connecter avec le compte Facebook du client (ou l'aider à se connecter)
3. Si le client n'a pas de compte Meta Business : cliquer **Créer un compte** et renseigner :
   - Nom de l'entreprise
   - Prénom / Nom
   - Email professionnel
4. Une fois dans Business Suite, aller dans **Paramètres** (icône engrenage en bas à gauche)

---

## Étape 2 — Ajouter le compte WhatsApp Business

1. Dans Paramètres Business Suite > **Comptes** > **Comptes WhatsApp**
2. Cliquer **Ajouter** > **Créer un compte WhatsApp Business**
3. Renseigner :
   - Nom du compte WhatsApp (nom visible par les clients)
   - Fuseau horaire : `Africa/Abidjan` (UTC+0) ou `Europe/Paris` selon la zone
4. Cliquer **Continuer**

---

## Étape 3 — Vérifier le numéro de téléphone ⚠️ Intervention physique requise

> C'est l'étape critique. Le client doit avoir son téléphone en main.

1. Dans le compte WA Business créé, cliquer **Ajouter un numéro de téléphone**
2. Renseigner le numéro au format international (ex : `+225 07 56 87 70 70`)
3. Choisir le mode de vérification : **SMS** (recommandé) ou **Appel téléphonique**
4. Récupérer le code reçu sur le téléphone du client
5. Saisir le code dans Meta — validation instantanée

**Si le numéro est inaccessible depuis la France (SIM CI) :**
- Option A : planifier la session quand le client est physiquement disponible avec sa SIM
- Option B : utiliser un numéro Twilio virtuel (~2 €/mois) pour les tests d'abord, puis migrer

---

## Étape 4 — Configurer le profil WhatsApp Business

1. Toujours dans Meta Business Suite > compte WA créé
2. Aller dans **Profil** et renseigner :
   - Photo de profil : uploader le logo du client
   - Description : copier la description fournie à l'étape checklist
   - Site web (si disponible)
   - Email de contact
3. Sauvegarder

---

## Étape 5 — Générer le token d'accès permanent

> Ce token est le mot de passe qui autorise n8n à envoyer des messages au nom du client.

1. Dans Meta Business Suite > **Paramètres** > **Utilisateurs système**
2. Cliquer **Ajouter** > nommer l'utilisateur `n8n-attractor` > rôle **Admin**
3. Cliquer sur l'utilisateur créé > **Générer un nouveau jeton**
4. Sélectionner l'app Meta concernée
5. Permissions à activer : `whatsapp_business_messaging`, `whatsapp_business_management`
6. Durée : **Illimitée** (pas d'expiration)
7. **Copier le token immédiatement** et le stocker dans :
   - Notion CRM > fiche client > champ Notes (zone sécurisée)
   - n8n Railway > Credentials (étape 6)

⚠️ Ce token ne s'affiche qu'une seule fois. Si perdu, il faudra en générer un nouveau.

---

## Étape 6 — Récupérer le Phone Number ID

1. Dans Meta Business Suite > **Comptes WhatsApp** > cliquer sur le compte
2. Dans l'onglet **Numéros de téléphone**, cliquer sur le numéro ajouté
3. Copier le **Phone Number ID** (suite de chiffres, ex : `123456789012345`)
4. Stocker dans Notion CRM > fiche client > champ Notes

---

## Étape 7 — Configurer le webhook dans Meta

> Le webhook est l'adresse où Meta va envoyer les messages reçus.

1. Dans Meta Business Suite > **Paramètres** > **Webhooks** > **WhatsApp Business Account**
2. Cliquer **S'abonner à ce sujet**
3. Renseigner :
   - **URL de callback** : `https://n8n-production-3bfc.up.railway.app/webhook/whatsapp`
   - **Token de vérification** : `attractor_whatsapp_verify` (valeur fixe commune à tous les clients)
4. Cliquer **Vérifier et enregistrer**
5. Dans la liste des champs, activer : **messages**
6. Cliquer **S'abonner**

---

## Étape 8 — Dupliquer et configurer le workflow n8n

1. Se connecter à n8n Railway : `https://n8n-production-3bfc.up.railway.app`
   - Identifiants dans le fichier `.env` du workspace (jamais dans ce SOP)
2. Ouvrir le workflow `WhatsApp — Template`
3. Cliquer les trois points > **Dupliquer**
4. Renommer le workflow : `WhatsApp — [NomDuClient]` (ex : `WhatsApp — C'Real`)
5. Dans le nœud **Extraire Message** : vérifier que le format Meta est bien détecté
6. Dans le nœud **Répondre via Meta** :
   - Remplacer le `Phone Number ID` par celui récupéré à l'étape 6
   - Remplacer le token Meta par celui généré à l'étape 5
7. Dans le nœud **Claude / Assists** :
   - Vérifier que le `user_id` Supabase du client est bien injecté dans le prompt système
   - Vérifier que la clé Anthropic est bien configurée dans les credentials n8n
8. **Activer le workflow** (toggle en haut à droite)

---

## Étape 9 — Test bout en bout ✅

> Ne pas sauter cette étape. Un onboarding non testé = un client en galère tout seul.

1. Depuis un numéro de téléphone différent (pas le numéro business), envoyer un message WhatsApp au numéro du client
2. Dans n8n, aller dans **Exécutions** > vérifier qu'une exécution s'est lancée
3. Vérifier que Claude a bien répondu (le message doit arriver sur le téléphone test en < 10 secondes)
4. Tester les cas suivants :
   - [ ] Message texte simple
   - [ ] Question sur le catalogue / les services
   - [ ] Message hors contexte (l'assistant doit recentrer poliment)
5. Si un nœud est en erreur (icône rouge dans n8n) : noter le message d'erreur et contacter Mac Arthur

---

## Étape 10 — Remise au client et documentation

1. Briefer le client sur ce qu'il peut faire :
   - Ses clients envoient un message WA → l'assistant répond automatiquement
   - Il peut voir les conversations dans son dashboard Attractor Assists
   - Il ne doit **pas** désactiver ou modifier son compte WA Business sans prévenir

2. Mettre à jour le CRM Notion (fiche client) :
   - Statut : passer de **Acompte reçu** à **En production**
   - Ajouter dans Notes : date d'activation, Phone Number ID, nom du workflow n8n
   - Prochaine action : "Vérifier dans 48h que le canal fonctionne en conditions réelles"

3. Archiver dans Google Drive (dossier client > Documents de travail) :
   - Capture d'écran du workflow n8n actif
   - Capture d'écran du compte WhatsApp Business validé dans Meta

---

## Gestion des erreurs courantes

| Erreur | Cause probable | Solution |
|--------|---------------|----------|
| Code de vérification Meta non reçu | Numéro SIM déjà utilisé sur un autre compte WA | Demander à désinstaller WA perso et retenter |
| `401` sur le webhook | Token expiré ou incorrect | Regénérer un token dans Meta > Utilisateurs système |
| n8n ne reçoit pas les messages | Webhook non activé ou mauvaise URL | Vérifier étape 7, retester la vérification webhook |
| Claude ne répond pas | `user_id` manquant ou profil Supabase introuvable | Vérifier que le client a un profil actif dans Supabase |
| Réponse lente (>30s) | Timeout n8n ou Railway en veille | Attendre le redémarrage Railway (max 1 min) et retester |
| Numéro CI inaccessible depuis France | SIM physique non disponible | Utiliser Twilio sandbox ou planifier session en présentiel |

---

## Option Twilio (si SIM inaccessible depuis France)

Pour tester le canal depuis la France sans la SIM CI :

1. Créer un compte sur [twilio.com](https://twilio.com)
2. Activer le **Sandbox WhatsApp** (gratuit pour les tests)
3. Obtenir un numéro virtuel Twilio (~2 €/mois pour un numéro dédié)
4. Dans n8n, le nœud **Extraire Message** reconnaît déjà les deux formats Twilio et Meta
5. Une fois les tests validés, migrer vers le vrai numéro du client dès que la SIM est accessible

---

## Maintenance

- Renouveler les tokens Meta tous les 6 mois (sauf si générés "Illimitée")
- Vérifier chaque lundi que les workflows n8n actifs sont toujours en ligne
- Si le client change de numéro WA : reprendre à l'étape 2 (nouveau numéro = nouvelle vérification)

---

*SOP créé le 13/06/2026 — Session 52 Assists*  
*Référence : voir aussi `SOP_n8n.md` pour la configuration de la veille quotidienne*

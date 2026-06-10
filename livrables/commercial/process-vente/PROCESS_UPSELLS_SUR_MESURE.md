# Process Upsells Sur Mesure — Attractor Assists V3

Deux fiches opérationnelles pour les upsells affichés sous les plans dans PaliersScreen.
Déclenchées quand un client clique "Nous contacter" (WA Mac Arthur France).

---

## Upsell 1 — Nom de domaine personnalisé

**Pitch client :**
> "Ta boutique s'appelle `boutique.tonnom.com` plutôt que `assists.agenceattractor.com/b/slug`"

**Tarif suggéré :** 30-50 € (setup unique) — inclus dans Bras Droit si configuré dans les 7 premiers jours

**Délai :** 1-2h

**Étapes :**

1. **Qualifier** — Le client a-t-il déjà un domaine enregistré ?
   - Oui : passer à l'étape 3
   - Non : orienter vers OVH ou Gandi, budget ~12 €/an

2. **Collecter le nom souhaité** — Ex : `boutique.koffi-mode.com` ou `commande.awa-traiteur.ci`

3. **Vérifier la disponibilité** — Sur OVH / Gandi si nouveau domaine

4. **Configurer le CNAME sur Netlify**
   - Dashboard Netlify → Site Attractor Assists → Domain settings → Add custom domain
   - Chez le registrar DNS : ajouter `CNAME boutique → [netlify-site].netlify.app`
   - Temps de propagation : 5 min à 2h

5. **Tester le flow complet**
   - `https://boutique.tonnom.com` → charge le PublicAssistantScreen avec le bon slug
   - Tester splash → catalogue → chat → paiement → confirmation

6. **Livrer** — Envoyer le lien final au client via WA

**Note :** Le `public_slug` du profil client ne change pas, seul le DNS est redirigé.

---

## Upsell 2 — Connexion WhatsApp Business

**Pitch client :**
> "Assists répond automatiquement à tes messages WA Business à ta place, 24h/24"

**Tarif suggéré :** Inclus dans Bras Droit — ou 50 € setup si client hors abonnement

**Délai :** 1h

**Étapes :**

1. **Qualifier** — Le client a-t-il un compte WhatsApp Business (pas WhatsApp perso) ?
   - Non : lui faire créer un compte WA Business (10 min, gratuit)

2. **Configurer le message d'accueil WA Business**
   - WA Business → Paramètres → Outils professionnels → Message d'accueil
   - Texte suggéré : "Bonjour ! Pour commander ou me contacter rapidement, utilise mon lien boutique 👇 [lien Assists]"

3. **Configurer la réponse automatique hors bureau (facultatif)**
   - WA Business → Paramètres → Message d'absence
   - Texte : "Je suis occupé mais mon assistant gère tes commandes ici 👇 [lien Assists]"

4. **Copier le lien boutique depuis Assists**
   - Profil → Mon lien boutique → Copier
   - Format : `https://assists.agenceattractor.com/b/[slug]`

5. **Tester le flow**
   - Envoyer un message test au numéro WA Business du client
   - Vérifier que le message d'accueil avec le lien s'envoie correctement

6. **Livrer** — Confirmer au client que c'est actif, lui envoyer un récap WA

**Note :** La vraie automatisation full (réponses AI directement dans WA) nécessite l'API WhatsApp Cloud officielle — c'est le Chantier 3 (WA API) du Plan V3. Cet upsell est le "mini" disponible maintenant.

---

## Suivi des upsells vendus

Tracker dans le CRM Notion (base Dossiers) :
- Statut : "En cours" → "Livré"
- Tag : `upsell-domaine` ou `upsell-wa-business`
- Montant : dans le champ Montant du dossier

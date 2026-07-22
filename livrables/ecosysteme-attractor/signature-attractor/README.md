# Signature Attractor

> Signature électronique maison. Remplace Yousign. Coût : 0 €.
> Premier dossier réel : Club Élévia (package contractuel V5).

---

## Pourquoi ce module existe

Élise ne signait pas, non pas parce qu'elle refusait, mais parce qu'elle n'avait
aucun moyen simple de le faire. Payer Yousign 9 à 25 €/mois pour ça n'avait pas
de sens alors que 70 % de la plomberie existait déjà dans `devis-accept`
(horodatage, IP, PDF de preuve, envoi Resend aux deux parties).

Ce module ajoute les 5 briques qui manquaient, celles que Yousign facture :

| Brique | Rôle |
|---|---|
| Code à 6 chiffres par email | Prouver que c'est bien la bonne personne qui signe |
| Empreinte SHA-256 | Prouver que le document n'a pas changé entre l'envoi et la signature |
| Journal de preuve horodaté | Retracer chaque étape : ouvert, lu, code envoyé, code validé, signé |
| Geste de signature | Tracé manuscrit + nom saisi + case de consentement explicite |
| Certificat de preuve | PDF annexé qui rassemble tout et part aux deux parties |

---

## Valeur juridique, sans enjoliver

C'est une **signature électronique simple** (SES), au sens de l'article 1367 du
Code civil et de l'article 25 du règlement eIDAS n° 910/2014. Elle est **valable
et recevable en justice**. C'est le même niveau que l'offre d'entrée de Yousign.

Ce qu'elle n'est pas : une signature *avancée* ou *qualifiée*, qui bénéficie
d'une présomption de fiabilité et suppose un prestataire de confiance certifié.

Conséquence pratique : en cas de contestation, **c'est à nous de prouver**. D'où
le soin mis au faisceau de preuves. Le point faible assumé est que l'agence est
juge et partie ; il est compensé par l'envoi immédiat de l'exemplaire signé et
du certificat sur la boîte email du signataire, horodaté par son propre
fournisseur, hors de notre contrôle.

**À utiliser pour :** devis, contrats de prestation, avenants, cahiers des
charges, bons de commande, NDA.
**À ne pas utiliser pour :** immobilier, cession de parts, actes notariés,
cautionnement. Là, il faut un prestataire qualifié.

---

## Architecture

```
signature.agenceattractor.com/s/JETON     ← page de signature (Cloudflare Pages)
                │
                ├── sign-load     charge le dossier depuis le jeton du lien
                ├── sign-otp      envoie le code à 6 chiffres (Resend)
                └── sign-verify   vérifie le code, contrôle l'intégrité, signe,
                                  génère le certificat, envoie aux 2 parties
                                          │
                            Supabase (projet lgdgbrivnhgeupqhkckd)
                            sig_dossiers · sig_documents · sig_signataires
                            sig_otp · sig_evenements
```

`sign-create` (réservé agence, protégé par `SIGN_ADMIN_SECRET`) met un dossier
en signature : il télécharge chaque document, calcule son empreinte, crée les
signataires avec leur lien secret, et envoie l'invitation.

### Sécurité

- RLS activée sur les 5 tables, **aucune policy publique**. Rien n'est lisible
  avec la clé anon, tout passe par les edge functions en service role.
- Le jeton du lien fait office d'authentification (32 octets aléatoires).
- Le code n'est **jamais stocké en clair**, seulement son empreinte SHA-256.
- Comparaison à temps constant, 5 tentatives maximum, validité 15 minutes,
  un envoi toutes les 45 secondes maximum.
- Deux garde-fous en base : le journal de preuve est **immuable** (trigger qui
  refuse UPDATE et DELETE) et une signature apposée ne peut plus être retouchée.
- Contrôle d'intégrité au moment de signer : si l'empreinte d'un document a
  changé depuis le scellement, **la signature est refusée**, pas apposée.

---

## Mise en service

1. **Migration** : appliquer `0061_signature_attractor.sql` sur le projet Supabase.
2. **Secrets** à définir côté Supabase :
   - `SIGN_ADMIN_SECRET` (à générer, sert à protéger `sign-create`)
   - `SIGN_BASE_URL` = `https://signature.agenceattractor.com`
   - `SIGN_NOTIFY_EMAIL` = `hello@agenceattractor.com`
   - `RESEND_API_KEY` (déjà en place)
3. **Déployer les 4 fonctions** (`config.toml` les déclare déjà en `verify_jwt = false`) :
   ```
   supabase functions deploy sign-create sign-load sign-otp sign-verify
   ```
4. **Cloudflare Pages** : nouveau projet `signature-attractor`, dossier `public/`.
5. **DNS GoDaddy** : CNAME `signature` → `signature-attractor.pages.dev`.

---

## Mettre un dossier en signature

```bash
curl -X POST https://lgdgbrivnhgeupqhkckd.supabase.co/functions/v1/sign-create \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "LE_SIGN_ADMIN_SECRET",
    "reference": "ATR-2026-0005",
    "titre": "Package contractuel Club privé Élévia",
    "client": "Club privé Élévia — Web App V1",
    "message": "Élise, voici les trois documents dont nous avons parlé.",
    "documents": [
      { "nom": "Devis V5", "reference": "ATR-2026-0005 V5", "url": "https://..." },
      { "nom": "Avenant n°1", "reference": "AVENANT-01", "url": "https://..." },
      { "nom": "Cahier des charges V4", "reference": "CDC-ATR-2026-0005 V4", "url": "https://..." }
    ],
    "signataires": [
      { "nom": "Elise CAPEL", "email": "...", "qualite": "Porteuse du projet", "role": "client" },
      { "nom": "Mac Arthur KOUASSI", "email": "...", "qualite": "Prestataire", "role": "prestataire" }
    ]
  }'
```

La réponse contient les liens personnels. Le signataire `client` reçoit son
invitation automatiquement ; le `prestataire` contresigne avec son propre lien.

**Attention** : les documents doivent être en ligne et stables. Toute
modification après scellement bloque la signature (c'est voulu). Si un document
doit changer, il faut créer un nouveau dossier de signature.

---

## Place dans la chaîne de vente

C'est le maillon 5. Élévia sert de cas d'école pour figer chaque étape et
l'automatiser ensuite.

| # | Maillon | État |
|---|---|---|
| 1 | Prospect détecté / qualifié | manuel |
| 2 | Maquette de closing (`/maquette-closer`) | outillé |
| 3 | Devis chiffré au barème (`/devis-express`) | outillé |
| 4 | Devis web interactif (le prospect coche, valide en 1 clic) | outillé |
| 5 | **Signature électronique** | **ce module** |
| 6 | Reçu de versement | modèle HTML, à automatiser |
| 7 | Démarrage production (J0 fixé par le 1er versement) | manuel |
| 8 | Jalons et validations écrites par phase | à outiller |

Prochaine automatisation naturelle : brancher `sign-verify` sur `pilotage_pipeline`
pour qu'un dossier signé fasse basculer le statut et déclenche le reçu du maillon 6,
exactement comme `devis-accept` le fait déjà pour le maillon 4.

---

## Contrôles passés

- Syntaxe JS validée, tous les `getElementById` ont une cible, toutes les
  classes manipulées en JS existent en CSS.
- **Audit UX_SYSTEM : 4 écrans × 6 résolutions (375/390/414/768/1024/1440), 24/24 au vert.**
  Zéro débordement horizontal, zéro zone de tap sous 44 px, zéro texte sous 13 px.
- Rendu vérifié par capture sur les 4 écrans : pas de texte sur texte, pas de
  chevauchement, icônes SVG uniquement (zéro emoji).

Réserve à arbitrer : UX_SYSTEM §11 fixe le texte minimal à 16 px. Le corps de
texte est bien à 16 px, mais les libellés secondaires (aides, références,
mentions de pied) descendent à 13-15 px, comme dans les devis et reçus
existants. Si la règle doit s'appliquer strictement partout, l'échelle
secondaire est à remonter.

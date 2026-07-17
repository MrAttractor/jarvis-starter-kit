# Architecture commune des apps métier ATTRACTOR

> Analyse établie le 05/07/2026 à partir de 4 apps réellement en production : GetWinWorld, J'Envoie Express, C'Real, Pilotage.
> Sert de référence au skill `generateur-app-metier`. Toute nouvelle app métier doit suivre cette architecture sauf raison technique explicite de s'en écarter.

---

## Le constat de départ

Chaque app métier livrée jusqu'ici (GetWinWorld, J'Envoie Express, C'Real) a été construite en session bespoke, en repartant peu ou prou de zéro à chaque fois. Pourtant, une fois les 4 apps posées côte à côte, le squelette est identique à 80%. Le travail réellement différenciant par client, c'est : les couleurs/polices, le texte, le catalogue de départ, et 2-3 features spécifiques (membre, chat conseiller, panier).

Ce document fige ce qui est commun, pour que la prochaine app parte de ce socle au lieu de le reconstruire.

---

## 1. Stack technique (fixe, ne se discute pas)

- **Frontend** : HTML/CSS/JS vanilla, un ou deux fichiers autonomes (`index.html` + `admin.html`), aucun build step, aucune dépendance npm côté client (à l'exception de Pilotage qui utilise React+Babel-in-browser via CDN — cas particulier d'outil interne, pas la norme client).
- **Backend** : Supabase — **un seul projet partagé pour tous les clients** : `lgdgbrivnhgeupqhkckd.supabase.co` (le même projet qu'Attractor Assists). Ne jamais créer un nouveau projet Supabase par client sauf demande explicite — ça casserait le modèle économique (un seul abonnement Supabase pour toute l'agence).
- **Hébergement** : Cloudflare Pages. Deux paliers :
  1. **Démarrage** : chemin partagé `livrables/clients/demo-site/public/[slug]/` → `demo.agenceattractor.com/[slug]` (projet Pages `demo-agenceattractor`, `_redirects` à ajouter).
  2. **Client installé / domaine perso acheté** : projet Pages dédié (`npx wrangler pages project create [slug]`) + domaine personnalisé attaché (voir méthode dans `references/deploiement-domaine.md` si créée, sinon reproduire la séquence GetWinWorld du 05/07/2026 : créer projet → déployer → attacher domaine via API `pages/projects/{name}/domains` → ajouter les enregistrements DNS CNAME manuellement si l'auto-création ne se déclenche pas → ajouter SPF/DMARC).

## 2. Modèle de données (le vrai point commun)

Quel que soit le métier (personal shopper, livraison colis, vente de farines infantiles...), les mêmes 4 tables reviennent, préfixées par un code court propre au client (`gw_`, `je_`, `cr_`...) :

| Table générique | Rôle | Équivalent observé |
|---|---|---|
| `{préfixe}_produits` | Catalogue de ce qui est vendu/proposé | `gw_produits`, `voyages`/`colis` (J'Envoie, cas logistique) |
| `{préfixe}_clients` | Compte client léger (nom, WhatsApp, email) | `gw_clients`, `clients` |
| `{préfixe}_commandes` | La demande/transaction envoyée au propriétaire | `gw_commandes`, `demandes` |
| `{préfixe}_inscriptions` | Liste d'attente / notifications prioritaires (optionnel) | `gw_inscriptions`, `abonnes` |
| `{préfixe}_parametres` | Config admin-éditable (prix, textes) | `parametres` (J'Envoie) |

Colonnes stables sur `{préfixe}_produits` : `id uuid`, `nom text`, `prix text`, `description text`, `categorie text`, `photo_url text`, `est_actif boolean`, `est_offre_du_jour boolean` (le flag d'urgence/mise en avant, voir GetWinWorld), `created_at timestamptz`.

## 3. Le point de sécurité non négociable

**Parce que le projet Supabase est partagé entre tous les clients**, deux règles strictes, découvertes à la dure sur GetWinWorld (faille corrigée le 01/07/2026 sur le bucket photos) :

1. **Jamais `auth.role() = 'authenticated'` seul.** Ça donnerait accès aux données du client à n'importe quel utilisateur Attractor Assists ou d'un autre client métier connecté sur le même projet. Toujours gater nominativement : `auth.uid() = '<uuid-du-propriétaire>'::uuid`.
2. **Jamais de policy `SELECT` publique sur une table de comptes clients.** Une policy `USING (true)` en lecture permettrait à n'importe quel visiteur de lister tous les clients du propriétaire via la clé anon. Pour la "récupération de compte" (ex: client qui change de téléphone), toujours passer par une fonction `SECURITY DEFINER` qui ne renvoie qu'UNE ligne, filtrée sur un identifiant que seul le vrai client connaît (WhatsApp exact) — jamais une policy `SELECT` ouverte. Voir `gw_find_client_by_whatsapp` dans GetWinWorld comme référence exacte.
3. **Toute lecture de données personnelles depuis le navigateur passe par une edge function.** Le suivi d'un colis, d'une commande, d'un reçu : jamais un `SELECT` direct sur la table (même filtré par numéro, la clé anon peut relister toute la table). Modèle exact : `je-suivi` (numéro exact obligatoire, ne renvoie que les champs de suivi, jamais le nom ni l'adresse). Une policy insert-seule pour un formulaire public (`WITH CHECK (true)`, sans policy SELECT) est acceptable ; une policy SELECT ouverte ne l'est jamais.

**Vérification obligatoire avant CHAQUE livraison — non négociable, à exécuter, pas à supposer :**

```
node scripts/audit-rls.mjs
```

Le script attaque réellement le projet Supabase avec la clé anon et échoue (exit 1) si une table à données personnelles est lisible en anonyme, ou si une nouvelle table publique n'a pas été déclarée. Une app n'est pas livrable tant que l'audit n'est pas au vert (ou que les seules lignes restantes sont des chantiers explicitement suivis). Piège vérifié le 17/07/2026 : une policy peut être correcte mais **RLS désactivé sur la table** (`relrowsecurity = false`) rend la table grande ouverte malgré la policy — le script le détecte, une relecture du SQL non.

## 4. Les deux surfaces

- **`index.html` (vitrine)** : app-shell mobile (`max-width:430px`), navigation par onglets en bas (3-4 onglets : Vitrine / Conseiller (optionnel) / Commandes / Membre (optionnel)), variables CSS de marque en haut de fichier (`--brand`, couleurs secondaires), 2 polices Google Fonts (une display/serif + une texte/sans).
- **`admin.html` (back-office)** : gated par un login email/mot de passe (Supabase Auth), gestion du catalogue (ajout/édition/toggle "offre du jour"), consultation des commandes/inscriptions. Le propriétaire ne touche jamais au code.

## 5. Canal de conversion : WhatsApp, systématiquement

Aucune app métier livrée jusqu'ici ne fait de paiement en ligne intégré (sauf XPaye côté Assists/CI). Le modèle standard : le client final constitue sa sélection/demande dans l'app, elle est envoyée au propriétaire qui prend le relais sur WhatsApp pour confirmer, encaisser et livrer. Les liens `wa.me/{numéro}?text={message pré-rempli}` sont générés dynamiquement, jamais codés en dur avec un message générique.

## 6. Ce qui varie réellement par client (le vrai travail de personnalisation)

- Couleurs de marque + choix des 2 polices
- Textes (nom, pitch, "comment ça marche")
- Catalogue de départ (3 à 10 produits réels, jamais de lorem ipsum)
- Activer/désactiver : espace membre (panier + compte), chat conseiller IA (edge function Claude Haiku groundée sur le catalogue), liste d'inscription prioritaire
- Le numéro WhatsApp et les moyens de paiement mentionnés (Wave/MTN pour CI, Wero/Revolut pour France)

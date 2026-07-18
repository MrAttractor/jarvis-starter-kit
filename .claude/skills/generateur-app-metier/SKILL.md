---
name: generateur-app-metier
description: Construit et déploie la V1 réelle d'une app métier client (vitrine + admin + backend Supabase + WhatsApp) à partir de l'architecture commune déjà validée sur GetWinWorld, J'Envoie Express et C'Real, au lieu de repartir de zéro à chaque client. Utilise cette skill dès qu'un client a signé (bon de commande / acompte reçu) et qu'il faut construire la vraie application, pas une maquette de closing. Exemples de déclencheurs : "construis l'app pour [client]", "on démarre la production de [client]", "génère la V1 de [client]", "/generateur-app-metier [client]". Différent de `/maquette-closer` : maquette-closer produit une démo de vente jetable pour convaincre ; cette skill produit l'app réelle, connectée à une vraie base de données, qui sera livrée et facturée. C'est la première brique de la "Générateur d'Apps Métier" (vision usine de production) — cf. `references/architecture-commune.md` pour l'analyse complète.
---

# Générateur d'Apps Métier

## Pourquoi cette skill existe

Constat du 05/07/2026 : sur l'ensemble du pipeline agence (détection → qualification → maquette → devis → closing → paiement → **production** → livraison), l'étape production reste la plus artisanale. Un seul template a été réellement réutilisé une fois (Livraison colis → J'Envoie Express). GetWinWorld, C'Real et les autres ont chacun été reconstruits en grande partie à la main.

Or, une fois GetWinWorld, J'Envoie Express, C'Real et Pilotage posés côte à côte, le squelette est identique à 80% : stack (HTML/CSS/JS + Supabase partagé + Cloudflare Pages), modèle de données (`produits` / `clients` / `commandes` / `inscriptions`), deux surfaces (vitrine + admin), WhatsApp comme canal de conversion, et une même règle de sécurité multi-tenant.

Cette skill fige ce socle commun et le rend exécutable : au lieu de repartir de zéro, on **clone la référence la plus complète (GetWinWorld) et on adapte précisément les points qui varient**, plutôt que de réinventer l'architecture à chaque client. Lire `references/architecture-commune.md` avant de commencer si ce n'est pas déjà fait — c'est l'analyse complète qui justifie chaque choix ci-dessous.

⚠️ Cette skill démarre **après signature** (bon de commande validé, acompte reçu — cf. `PROCESS.md` Étape 6). Si le client n'a pas encore dit oui, c'est `/maquette-closer` qu'il faut utiliser, pas celle-ci.

## Étape 1 — Fiche de fabrication

Avant de coder quoi que ce soit, réunis ces informations (reprends-les de la fiche prospect de `maquette-closer` si elle existe déjà — ne repose pas les questions déjà répondues) :

1. **Identité** : nom du projet, préfixe de table court (2-3 lettres, ex. `gw`, `je`, `cr` — dérivé du nom, doit être unique parmi les préfixes déjà utilisés dans le projet Supabase partagé), couleurs de marque (`--brand` + 1-2 accents), 2 polices Google Fonts (une display, une texte), numéro WhatsApp du propriétaire, zone (France ou CI, pour les moyens de paiement à afficher).
2. **Catalogue de départ** : 3 à 10 produits/services réels avec nom, prix, description, catégorie, photo (jamais de lorem ipsum — vrais produits du métier du client, quitte à démarrer avec les photos qu'il a déjà fournies pour la maquette).
3. **Features à activer** (case par case, ne jamais tout activer par défaut) :
   - Espace membre (compte client + panier/sélection) — oui si le client vend plusieurs pièces qu'on peut cumuler avant d'envoyer une demande groupée (cas GetWinWorld) ; non si c'est une demande simple à l'unité (cas J'Envoie Express).
   - Chat conseiller IA — oui si le métier a une vraie logique de conseil/qualification avant achat ; non si c'est un simple catalogue.
   - Liste d'inscription prioritaire — quasi toujours oui, coût d'implémentation faible, valeur perçue forte.
4. **UUID admin** : le compte Supabase Auth du propriétaire doit exister avant d'écrire le SQL (créer le compte dans Supabase Dashboard > Authentication si pas encore fait, récupérer son UUID — c'est la valeur qui verrouille tout le RLS nominatif).

## Étape 2 — Cloner la référence, pas repartir de zéro

**Référence canonique à copier : `livrables/clients/demo-site/public/getwinworld/`** (`index.html`, `admin.html`, `supabase-schema.sql`, `supabase-schema-02-panier.sql`). C'est la plus complète et la plus récente des apps existantes (catalogue + offre du jour + membre + panier + admin sécurisé + retrouver son compte sans mot de passe). Si le client n'a pas besoin de l'espace membre/panier, ignore simplement ces sections plutôt que les réécrire différemment ailleurs.

Copie ces fichiers vers `livrables/clients/demo-site/public/[slug]/`, puis adapte — dans cet ordre, du plus visible au plus profond :

1. **Variables CSS de marque** (`:root` en haut de `index.html` et `admin.html`) : remplace toutes les couleurs par celles du client. C'est ce qui change le plus l'impression visuelle pour le moins d'effort.
2. **Polices Google Fonts** : remplace le `<link>` et les `font-family` si le client a une identité différente (ex. pas systématiquement Cormorant Garamond — GetWinWorld l'utilise parce que ça sert son positionnement luxe italien, un autre secteur peut demander autre chose).
3. **Textes** : nom de marque, pitch du hero, bloc "Pourquoi [Client]" (le concept expliqué en 3 étapes), textes de la nav, placeholders de formulaires. Toujours du texte réel et spécifique au métier, jamais générique.
4. **Préfixe des tables Supabase** : remplace `gw_` par le préfixe du nouveau client, partout dans le JS (`sb.from('gw_produits')` etc.) et dans le SQL copié.
5. **Retire les sections non activées** (étape 1, point 3) plutôt que de les laisser à moitié fonctionnelles : si pas de membre, retire l'onglet "Mon espace"/"Membre" et le panier ; si pas de chat, retire l'onglet "Conseiller" et l'appel à l'edge function.
6. **Charge le catalogue de départ** dans le SQL (`INSERT INTO ... VALUES`), avec les vrais produits de l'étape 1.

## Étape 3 — Schéma Supabase, en respectant la sécurité multi-tenant

Le projet Supabase est **partagé par tous les clients** (`lgdgbrivnhgeupqhkckd`). Deux règles non négociables, détaillées dans `references/architecture-commune.md` section 3 :

- Toute policy d'écriture/lecture admin doit être gatée par `auth.uid() = '<uuid-du-client>'::uuid`, jamais par `authenticated` seul.
- Toute "récupération de compte" doit passer par une fonction `SECURITY DEFINER` filtrée sur un identifiant privé (WhatsApp exact), jamais par une policy `SELECT` publique sur la table de comptes clients.

Exécute le SQL adapté sur le projet partagé via l'API Management Supabase (`SUPABASE_ACCESS_TOKEN` + `SUPABASE_PROJECT_REF` dans `.env`, endpoint `POST /v1/projects/{ref}/database/query`) — même méthode que pour les migrations Pilotage cette semaine.

## Étape 4 — Déploiement

Démarre toujours sur le chemin partagé, jamais directement sur un domaine dédié :

1. Ajoute une ligne dans `livrables/clients/demo-site/public/_redirects` : `/[slug]  /[slug]/index.html  200`.
2. Déploie : `npx wrangler pages deploy livrables/clients/demo-site/public --project-name=demo-agenceattractor --branch=master --commit-dirty=true` (⚠️ la branche Production de ce projet Cloudflare Pages est `master`, pas `main` — utiliser `--branch=main` déploie en Preview et ne touche jamais le vrai domaine, silencieusement. Vérifié le 06/07/2026 via `npx wrangler pages deployment list --project-name=demo-agenceattractor`, qui liste l'environnement de chaque déploiement).
3. Le lien de livraison est `demo.agenceattractor.com/[slug]`.

Le passage à un projet Cloudflare Pages dédié + domaine personnalisé n'intervient que si le client achète son propre nom de domaine plus tard (cf. `template-contrat.md` Art. 11 pour la clause de propriété du domaine). Dans ce cas, reproduire la séquence GetWinWorld du 05/07/2026 : créer le projet (`wrangler pages project create`), déployer, attacher le domaine (API `pages/projects/{name}/domains`), vérifier/ajouter les enregistrements DNS CNAME si l'auto-création ne se déclenche pas, ajouter SPF + DMARC.

## Étape 5 — Livraison

- Génère un `guide.html` de prise en main si le client doit utiliser `admin.html` en autonomie (reprends la structure du guide GetWinWorld : sections modules / parcours client / publication catalogue / partage du lien / contact agence).
- Envoie le lien + le guide via WhatsApp, jamais un fichier brut.
- Marque le dossier comme prêt pour facturation (`/devis-express` ou template-facture si pas déjà fait).

## Garde-fous

- Ne jamais sauter la vérification RLS avant mise en ligne : un admin mal gaté (`authenticated` au lieu de `auth.uid() = uuid nominatif`) expose les données d'un client à tous les autres utilisateurs du projet Supabase partagé. C'est une faille réelle déjà rencontrée et corrigée une fois (GetWinWorld, bucket photos, 01/07/2026) — ne pas la reproduire.
- Ne pas activer une feature (membre, chat) juste parce que le gabarit de référence l'a — chaque feature doit répondre à un besoin réel du client (étape 1, point 3), sinon c'est de la complexité inutile à maintenir.
- Si le métier du client s'écarte trop du modèle catalogue-produit (ex. un service pur sans catalogue), ne force pas l'architecture : adapte le modèle de données en gardant l'esprit (une table d'offre, une table de demande, une table de client) plutôt que la lettre.

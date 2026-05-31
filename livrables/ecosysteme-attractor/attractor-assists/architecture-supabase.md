# Architecture cible Attractor Assists (fondations, Phase 0)

> Proposition à valider. Plateforme d'agents personnels pour entrepreneurs, modèle Jarvis, done-for-you.
> Stack : React + Vite + Tailwind (PWA) / Supabase (Postgres + Auth + RLS + Edge Functions + Storage + pgvector) / Claude API via Edge Functions / déploiement Vercel ou Netlify.

## Niveaux d'IA
- **Coach quotidien** : Claude Haiku 4.5 (chat, tâches légères, gratuit).
- **Agents lourds** : Claude Sonnet 4.6 (Digital Manager, Chief of Staff, batch de contenu, offres, plans). Levier de monétisation (réservé payant).
- **Jobs en sous-marin** : Batch API (rapports, broadcasts) pour le coût.
- Transverse : prompt caching (system prompt + méthode Attractor), résumés pour la mémoire longue.

## Sécurité (priorité 0, corrige la dette actuelle)
- Supabase **Auth** (email + OTP, WhatsApp plus tard) : fini le lien `?id=` devinable et le mot de passe dashboard en clair.
- **Row Level Security** sur toutes les tables utilisateur (`user_id = auth.uid()`) : chaque utilisateur ne voit que ses données. Base RGPD.
- Rôle **admin** dédié pour Mac Arthur (cockpit). Pas de secret côté client.
- Clé **Claude** uniquement dans les Edge Functions (jamais dans le front).

## Modèle de données (groupes de tables)

**Identité & accès**
- `profiles` (lié à auth.users) : prénom, zone (CI/EU), ton_prefere, activite, canal_principal, nom_assistant, role (user/admin), formule, statut.

**Business & méthode**
- `ppsd` : problemes, peurs, souhaits, desirs, lieux_cible, déclencheurs (le socle done-for-you).
- `marque` : positionnement, histoire, promesse, valeurs, "ce que je vends".
- `offres` : produit principal, bonus, limiteurs (offre irrésistible).

**Conversation & mémoire**
- `conversations`, `messages` (role, contenu, tokens, modèle utilisé), `memoire_resumes` (mémoire longue).

**Agents (le coeur "sous-marin")**
- `agents` : catalogue (coach, digital_manager, chief_of_staff, ...), niveau d'accès (gratuit/payant), modèle associé.
- `agent_runs` : jobs déclenchés (manuels ou planifiés), statut, coût.
- `agent_outputs` : livrables produits (posts, offres, plans, rapports) rangés et copiables.

**Productivité**
- `agenda_events` (agenda intégré), `todos`, `armoire_documents` (réf. Storage).

**Parcours & gamification (addiction type Duolingo)**
- `parcours` (couloir d'appel, booster ventes) + `parcours_steps`.
- `parcours_progress` (étape courante par user).
- `gamification` : xp, niveau, streak (jours consécutifs), `badges`/médailles, `objectifs_jour`.

**Communauté**
- `community_posts` (demandes de collaboration).

**Monétisation**
- `plans` (forfaits alignés sur le barème de référence), `subscriptions`, `payments`, `usage_quota` (messages, agents).

**Cockpit Mac Arthur (admin / marketing)**
- `broadcasts`, `campagnes`, `segments` (ciblage), `audit_log`.
- Vues de pilotage : DAU, MRR, closing, rétention (le dashboard actuel, sécurisé et réaligné).

**Base de connaissance (assistant nourri)**
- `knowledge_chunks` : extraits des écrits Attractor + embeddings (pgvector) pour le RAG. Alimentée par la synthèse et les ebooks.

## Ce dont j'ai besoin pour wirer la Phase 0
1. **Repo / emplacement** : je propose de scaffolder l'app dans `livrables/ecosysteme-attractor/attractor-assists/app/`, puis push vers un repo GitHub dédié pour le déploiement.
2. **Projet Supabase** : URL du projet + clé anon + clé service_role (pour les Edge Functions). À créer sur le compte Attractor.
3. **Clé Claude** (déjà tournée précédemment) pour l'Edge Function proxy.
4. **Forfaits** : confirmer le barème qui fait foi pour `plans` (gratuit + niveaux payants).

-- ============================================================
-- 0052 — Tunnel de vente & d'accompagnement Attractor (Phase 1 MVP)
-- diagnostics + propositions + methode_modules (cerveau curé) + liens pilotage.
-- Toutes ces tables portent des données prospects → RLS activée, AUCUNE policy
-- publique : seul le service role (edge functions) lit/écrit.
-- ============================================================

-- ── Diagnostic IA (entretien guidé côté prospect) ──
create table if not exists public.diagnostics (
  id           uuid primary key default gen_random_uuid(),
  prospect_id  uuid,
  dossier_id   text,                    -- = pilotage_pipeline.id
  nom          text,
  contact      text,
  reponses     jsonb,                   -- l'échange complet Q/R
  synthese     text,
  cartographie jsonb,                   -- processus métier cartographiés
  problemes    jsonb,
  opportunites jsonb,                   -- opportunités d'automatisation
  famille      text,                    -- A/B/C/D pré-qualifiée par l'IA
  statut       text default 'nouveau',
  created_at   timestamptz default now()
);

-- ── Proposition interactive (le devis dynamique) ──
create table if not exists public.propositions (
  id           uuid primary key default gen_random_uuid(),
  dossier_id   text,
  numero       text,
  config       jsonb,                   -- tout le rendu de la page /proposition
  total        numeric,
  devise       text default '€',
  statut       text default 'brouillon',-- brouillon|valide|envoye|accepte
  accept_nom       text,
  accept_contact   text,
  accept_selection jsonb,
  accepted_at  timestamptz,
  created_at   timestamptz default now()
);

-- ── Méthode Attractor curée (le cerveau requêtable, éditable sans redéploiement) ──
create table if not exists public.methode_modules (
  id         uuid primary key default gen_random_uuid(),
  etape      text not null,             -- decouverte | diagnostic | proposition | ton
  titre      text not null,
  contenu    text not null,
  ordre      int default 0,
  actif      boolean default true,
  created_at timestamptz default now()
);

-- ── Liens sur le pipeline (source de vérité du dossier) ──
alter table public.pilotage_pipeline add column if not exists diagnostic_id  uuid;
alter table public.pilotage_pipeline add column if not exists proposition_id uuid;

-- ── RLS : fermé (service role only) ──
alter table public.diagnostics     enable row level security;
alter table public.propositions    enable row level security;
alter table public.methode_modules enable row level security;

-- ============================================================
-- SEED — Méthode Attractor (source : chat-assistant KNOWLEDGE_BASE + fiche-prospect.md)
-- ============================================================

insert into public.methode_modules (etape, titre, contenu, ordre) values
('decouverte', 'Les 4 blocs de découverte', $mod$Avant de proposer quoi que ce soit, comprendre le prospect via 4 blocs :
1. Identité & marque : activité, secteur PRÉCIS (jamais générique — "farine infantile" parle, "alimentaire" non), ton, couleurs.
2. Le client de mon client (le plus important) : qui ils sont, comment ils achètent aujourd'hui, ce qu'ils achètent vraiment (vrais produits/prix), les questions qu'ils posent avant d'acheter.
3. Le quotidien : ce qui le fatigue et lui prend du temps (sa vraie douleur, dans ses mots), ce qu'il veut déléguer vs garder, comment il gère stock/commandes/paiement, son volume réel.
4. Proposition : son objectif, le résultat attendu.$mod$, 1),

('decouverte', 'Diagnostic 5 questions (cartographier l''existant)', $mod$Cartographier la réalité AVANT de transformer, avec 5 questions concrètes :
1. Comment recevez-vous vos commandes/demandes aujourd'hui ? (WhatsApp seul / appels / physique / mixte)
2. Avez-vous un catalogue ? Est-il à jour et utilisé par vos clients ?
3. Comment notez-vous vos commandes ? (papier / messages / mémoire / tableur)
4. Comment vos clients paient-ils ? La preuve de paiement arrive comment ?
5. Qui livre / exécute ? Comment assurez-vous le suivi ?
Relancer quand une réponse est incomplète. Ne proposer que ce qui résout un vrai problème identifié dans ces réponses.$mod$, 2),

('decouverte', 'Objectif principal', $mod$Toujours faire préciser l'objectif : "Quel est votre objectif principal en ce moment : vendre plus, mieux vous organiser, ou vous faire connaître ?" Toute la suite s'aligne sur cette réponse.$mod$, 3),

('diagnostic', 'La vérité de départ', $mod$Il n'y a que deux raisons pour lesquelles une entreprise ne vend pas assez :
1. La cible prête à payer ne sait pas que l'entrepreneur existe (problème de visibilité/message).
2. L'offre ne déclenche pas l'achat (problème d'offre).
Tout problème de vente revient à l'une de ces deux causes. Le diagnostic doit trancher laquelle.$mod$, 1),

('diagnostic', 'Les 3 couloirs', $mod$Ranger le prospect dans son couloir dominant :
- Organisation : tout dans la tête, pas de système → Manuel de Procédures + structuration.
- Visibilité : bonne offre mais mauvaise cible ou mauvais message → PPSD + AIDA.
- Ventes : message OK mais offre pas irrésistible → produit principal + bonus + urgence.$mod$, 2),

('diagnostic', 'PPSD — connaître sa cible', $mod$Creuser la cible du prospect mieux qu'elle ne se connaît : Problèmes (ce qu'il vit), Peurs (ce qu'il redoute), Souhaits (ce qu'il demande consciemment), Désirs (son rêve de fond). Règle : ce ne sont pas les mots de l'entrepreneur qui vendent, ce sont les mots de ses clients.$mod$, 3),

('diagnostic', 'Les 4 niveaux de maturité digitale', $mod$Situer le prospect pour ne pas sur-vendre :
1. WhatsApp seul / chaos (tout manuel) → objectif : structurer le flux.
2. WhatsApp + lien Assist / vitrine (le client clique, l'assistant prend la commande).
3. Business structuré (commandes en base, CRM léger, relances, FAQ auto).
4. Application métier complète (multi-utilisateurs, analytics, domaine propre).
Ne jamais pousser le niveau suivant avant que le prospect soit stable au niveau actuel.$mod$, 4),

('proposition', 'Offre irrésistible', $mod$Construire l'offre en 3 temps : 1) Produit principal (ce qu'il résout concrètement), 2) Bonus (augmente la valeur perçue : "pour ce prix, c'est presque trop"), 3) Limiteurs (urgence réelle : date, places, offre de lancement — sans limiteur, le client reporte). Toujours présenter par les avantages (ce que ça change dans sa vie), jamais par les caractéristiques. Ancrer contre le prix marché pour rendre l'offre évidente.$mod$, 1),

('proposition', 'Les 3 paliers de croissance', $mod$Caler l'ambition de la proposition sur le palier du prospect :
- Exister (0–10 clients) : clarifier la cible, tester l'offre, décrocher les 10 premiers.
- Structurer (10–50) : système de suivi, relances automatiques, stabiliser le CA.
- Scaler (50+) : déléguer, créer des assets, piloter par les chiffres.$mod$, 2),

('ton', 'Ton & communication', $mod$Vouvoiement par défaut, chaleureux et professionnel (proposer le tutoiement après quelques échanges). Phrases courtes, direct sans être brutal. On produit, on n'enseigne pas : pas de théorie sauf si demandée. Ancrer dans la réalité (Wave, WhatsApp, la ville du prospect). Jamais "j'ai besoin de plus d'informations" → poser UNE question précise. Zéro flagornerie. Bienveillant, clair, facile à comprendre.$mod$, 1);

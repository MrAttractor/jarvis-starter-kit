-- ============================================================
-- Club Privé Élévia — Module 1 « Identité, inscription & socle »
-- Prototype fonctionnel (CDC section 6, Module 1).
--
-- Choix d'architecture, volontaire :
--   L'authentification NE PASSE PAS par auth.users du projet partagé.
--   Les membres d'Élévia vivent dans leurs propres tables el_*, avec un
--   code à usage unique maison. Motif : l'Article 10 du Contrat et
--   l'Article 16 de l'Avenant V3 engagent une base « au nom de la Cliente ».
--   Isoler dès maintenant rend la migration vers son projet dédié possible
--   par simple export des tables el_*, sans démêler des comptes partagés
--   avec huit autres dossiers clients.
-- ============================================================

-- ── Membres ────────────────────────────────────────────────
create table if not exists public.el_membres (
  id              uuid primary key default gen_random_uuid(),
  pseudo          text not null,
  pseudo_norm     text not null,                       -- unicité insensible à la casse
  email           text not null,
  email_norm      text not null,
  genre           text not null check (genre in ('femme','homme')),
  pays            text not null,
  date_naissance  date not null,
  -- Consentements (Module 1, infrastructure RGPD)
  cgu_acceptees   boolean not null default false check (cgu_acceptees),
  cgu_le          timestamptz not null default now(),
  optin_email     boolean not null default false,
  -- Parcours de vérification (Module 2, statut porté dès maintenant)
  statut_verif    text not null default 'non_soumis'
                  check (statut_verif in ('non_soumis','en_attente','valide','refuse')),
  -- Vie du compte
  statut          text not null default 'actif'
                  check (statut in ('actif','suspendu','supprime')),
  derniere_connexion timestamptz,
  created_at      timestamptz not null default now()
);

create unique index if not exists el_membres_pseudo_uniq on public.el_membres(pseudo_norm);
create unique index if not exists el_membres_email_uniq  on public.el_membres(email_norm);

-- La majorité est une règle métier, pas un contrôle d'interface :
-- un appel direct à l'API ne doit pas pouvoir créer un compte mineur.
alter table public.el_membres drop constraint if exists el_membres_majeur;
alter table public.el_membres add constraint el_membres_majeur
  check (date_naissance <= (current_date - interval '18 years'));

-- ── Codes à usage unique ───────────────────────────────────
create table if not exists public.el_codes (
  id           uuid primary key default gen_random_uuid(),
  email_norm   text not null,
  code_hash    text not null,                          -- jamais le code en clair
  tentatives   int  not null default 0,
  consomme     boolean not null default false,
  expire_at    timestamptz not null default (now() + interval '10 minutes'),
  created_at   timestamptz not null default now()
);
create index if not exists el_codes_email_idx on public.el_codes(email_norm, created_at desc);

-- ── Sessions ───────────────────────────────────────────────
create table if not exists public.el_sessions (
  jeton       text primary key,
  membre_id   uuid not null references public.el_membres(id) on delete cascade,
  expire_at   timestamptz not null default (now() + interval '30 days'),
  created_at  timestamptz not null default now()
);
create index if not exists el_sessions_membre_idx on public.el_sessions(membre_id);

-- ── Journal (preuve et pilotage) ───────────────────────────
create table if not exists public.el_evenements (
  id          bigserial primary key,
  membre_id   uuid references public.el_membres(id) on delete set null,
  type        text not null,                           -- inscription | code_envoye | connexion | echec_code
  meta        jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists el_evenements_idx on public.el_evenements(created_at desc);

-- ── Sécurité ───────────────────────────────────────────────
-- Aucune de ces tables n'est lisible ni modifiable avec la clé publique.
-- Tout passe par l'edge function elevia-auth, en service role.
-- Motif : el_membres contient des dates de naissance et des e-mails, et le
-- CDC interdit d'exposer l'identité réelle d'un membre aux autres membres.
alter table public.el_membres    enable row level security;
alter table public.el_codes      enable row level security;
alter table public.el_sessions   enable row level security;
alter table public.el_evenements enable row level security;

-- Pas une seule policy : RLS active sans policy = tout refusé à la clé anon.

-- ── Disponibilité d'un pseudo ──────────────────────────────
-- Seule information publique du module, et volontairement minimale :
-- elle répond « libre ou pris », jamais « qui ».
create or replace function public.el_pseudo_libre(p text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (
    select 1 from public.el_membres
    where pseudo_norm = lower(btrim(p))
  );
$$;

revoke all on function public.el_pseudo_libre(text) from public;
grant execute on function public.el_pseudo_libre(text) to anon, authenticated;

comment on function public.el_pseudo_libre is
  'Disponibilité d''un pseudo à l''inscription. Ne révèle aucune donnée de membre.';

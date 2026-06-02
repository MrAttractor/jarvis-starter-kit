-- ============================================================
-- 0014 — PROSPECTS + SÉQUENCES DE VENTE + JOURNAL AGENTS
-- ============================================================

-- ─── PROSPECTS ───────────────────────────────────────────────
create table if not exists public.prospects (
  id          uuid primary key default gen_random_uuid(),
  prenom      text not null,
  activite    text,
  besoin      text,           -- ce dont il a besoin
  contexte    text,           -- infos complémentaires (budget, délai, objections)
  canal       text,           -- WhatsApp, Facebook, Instagram, email…
  zone        text,           -- CI / EU / autre
  whatsapp    text,
  statut      text not null default 'nouveau'
              check (statut in ('nouveau','contacté','relancé','closé','perdu')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── SÉQUENCES DE VENTE (générées par Awa) ───────────────────
create table if not exists public.sequences_vente (
  id           uuid primary key default gen_random_uuid(),
  prospect_id  uuid references public.prospects(id) on delete cascade,
  messages     jsonb not null,  -- [{etape, titre, message, envoye_le}]
  statut       text not null default 'generee'
               check (statut in ('generee','en_cours','terminee')),
  created_at   timestamptz not null default now()
);

create index if not exists idx_seq_prospect on public.sequences_vente (prospect_id);

-- ─── JOURNAL AGENTS (activité visible par Mac Arthur) ────────
create table if not exists public.journal_agent (
  id          uuid primary key default gen_random_uuid(),
  type        text not null,   -- 'sequence_generee','insight_collecte','campagne_cree','user_challenge_done'
  agent_id    text,            -- awa / kofi / miriam…
  user_id     uuid,            -- l'utilisateur concerné (si applicable)
  prospect_id uuid,
  titre       text not null,
  details     jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_journal_date on public.journal_agent (created_at desc);

-- ─── INSIGHTS UTILISATEURS (agrégés pour MIROIR) ─────────────
create table if not exists public.insights_users (
  id          uuid primary key default gen_random_uuid(),
  periode     date not null,   -- date du jour de collecte
  nb_convs    int  not null default 0,
  themes      jsonb,           -- [{theme, count, exemple}]
  decision_id uuid references public.decisions(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ─── RLS ─────────────────────────────────────────────────────
alter table public.prospects        enable row level security;
alter table public.sequences_vente  enable row level security;
alter table public.journal_agent    enable row level security;
alter table public.insights_users   enable row level security;

create policy "auth full prospects"    on public.prospects        for all to authenticated using (true) with check (true);
create policy "auth full sequences"    on public.sequences_vente  for all to authenticated using (true) with check (true);
create policy "auth full journal"      on public.journal_agent    for all to authenticated using (true) with check (true);
create policy "auth full insights"     on public.insights_users   for all to authenticated using (true) with check (true);

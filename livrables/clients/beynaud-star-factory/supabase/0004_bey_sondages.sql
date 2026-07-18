-- ============================================================
-- LA BEYNAUMANIA — Incrément : sondages (activation / rétention)
-- Latiss crée un sondage, les fans votent (1 vote / fan / sondage),
-- tout le monde voit les résultats en direct.
-- ============================================================
create table if not exists public.bey_sondages (
  id           uuid primary key default gen_random_uuid(),
  question     text not null,
  options      jsonb not null default '[]'::jsonb,  -- ["Option A","Option B",...]
  grade_requis text not null default 'membre',
  actif        boolean not null default true,
  created_at   timestamptz not null default now()
);
create table if not exists public.bey_votes (
  sondage_id   uuid not null references public.bey_sondages(id) on delete cascade,
  membre_id    uuid not null references public.bey_membres(id) on delete cascade,
  option_index integer not null,
  created_at   timestamptz not null default now(),
  primary key (sondage_id, membre_id)
);
create index if not exists bey_votes_sondage_idx on public.bey_votes(sondage_id);

alter table public.bey_sondages enable row level security;
alter table public.bey_votes    enable row level security;

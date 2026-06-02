-- ============================================================
-- 0012 — MIROIR : agent d'apprentissage de la méthode Mac Arthur
-- ============================================================

create table if not exists public.decisions (
  id            uuid primary key default gen_random_uuid(),
  sujet         text not null,
  contexte      text not null,
  statut        text not null check (statut in ('VALIDE', 'REJETE')),
  source_agent  text,
  traite        boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists idx_decisions_non_traitees
  on public.decisions (created_at)
  where traite = false;

create table if not exists public.methode_miroir (
  id                  uuid primary key default gen_random_uuid(),
  decision_id         uuid references public.decisions(id) on delete set null,
  principe_detecte    text not null,
  type                text not null check (type in ('CONFIRMATION','NUANCE','NOUVEAU','CONTRADICTION')),
  categorie           text not null,
  preuve              text not null,
  referentiel         text not null,
  confiance           text not null check (confiance in ('haute','moyenne','faible')),
  a_arbitrer          text,
  arbitre             boolean not null default false,
  created_at          timestamptz not null default now()
);

create index if not exists idx_methode_categorie on public.methode_miroir (categorie);
create index if not exists idx_methode_a_arbitrer
  on public.methode_miroir (created_at)
  where a_arbitrer is not null and arbitre = false;

create or replace view public.referentiel_actif as
select categorie, principe_detecte, referentiel, confiance, created_at
from public.methode_miroir
where not (type = 'CONTRADICTION' and arbitre = false)
order by categorie, created_at desc;

alter table public.decisions       enable row level security;
alter table public.methode_miroir  enable row level security;

create policy "auth full access decisions"
  on public.decisions for all
  to authenticated using (true) with check (true);

create policy "auth full access methode"
  on public.methode_miroir for all
  to authenticated using (true) with check (true);

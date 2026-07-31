-- ============================================================
-- COMPTEUR — Pilotage financier Mac Arthur
-- Schéma Supabase. À exécuter dans Supabase > SQL Editor.
-- Objectif : suivre CA réel vs objectif (10 000 €), répartir les
-- encaissements (paramétrable), distinguer produits/MRR, détecter
-- la stabilité qui déclenche le palier Fibonacci suivant.
-- ============================================================

create table if not exists public.config_finance (
  id                 int primary key default 1 check (id = 1),
  objectif_actuel    numeric not null default 10000,
  date_cible         date    not null default '2026-09-01',
  pct_charges        numeric not null default 40,
  pct_campagne       numeric not null default 20,
  pct_marge          numeric not null default 40,
  mois_stabilite     int     not null default 3,
  seuil_mrr_pct      numeric not null default 40,
  fibonacci_paliers  numeric[] not null default array[10000,13000,21000,34000,55000,89000,144000],
  updated_at         timestamptz not null default now()
);

insert into public.config_finance (id) values (1) on conflict (id) do nothing;

create table if not exists public.encaissements (
  id          uuid primary key default gen_random_uuid(),
  libelle     text not null,
  montant     numeric not null,
  type        text not null check (type in ('PRODUIT','MRR')),
  pilier      text check (pilier in ('ATTIRER','CONVERTIR','STRUCTURER','ASSISTS','AUTRE')),
  date_encaiss date not null default current_date,
  created_at  timestamptz not null default now()
);

create index if not exists idx_encaiss_date on public.encaissements (date_encaiss);
create index if not exists idx_encaiss_type on public.encaissements (type);

create table if not exists public.charges_reelles (
  id          uuid primary key default gen_random_uuid(),
  libelle     text not null,
  montant     numeric not null,
  mois        date not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_charges_mois on public.charges_reelles (mois);

create or replace view public.synthese_mensuelle as
with cfg as (select * from public.config_finance where id = 1)
select
  date_trunc('month', e.date_encaiss)::date           as mois,
  sum(e.montant)                                       as ca_total,
  sum(e.montant) filter (where e.type = 'PRODUIT')     as ca_produits,
  sum(e.montant) filter (where e.type = 'MRR')         as ca_mrr,
  round(sum(e.montant) * (select pct_charges  from cfg) / 100, 2) as part_charges,
  round(sum(e.montant) * (select pct_campagne from cfg) / 100, 2) as part_campagne,
  round(sum(e.montant) * (select pct_marge    from cfg) / 100, 2) as part_marge
from public.encaissements e
group by 1
order by 1 desc;

create or replace view public.statut_stabilite as
with cfg as (select * from public.config_finance where id = 1),
months as (
  select
    sm.mois, sm.ca_total,
    coalesce(sm.ca_mrr,0) as ca_mrr,
    sm.ca_total - coalesce(
      (select sum(cr.montant) from public.charges_reelles cr where cr.mois = sm.mois),
      sm.part_charges + sm.part_campagne
    ) as marge_reelle
  from public.synthese_mensuelle sm
),
evalues as (
  select
    m.mois, m.ca_total, m.ca_mrr, m.marge_reelle,
    (m.ca_total >= (select objectif_actuel from cfg)) as cond_ca,
    (m.marge_reelle > 0)                              as cond_marge,
    (m.ca_mrr >= (select objectif_actuel from cfg) * (select seuil_mrr_pct from cfg)/100) as cond_mrr
  from months m
  order by m.mois desc
  limit (select mois_stabilite from cfg)
)
select
  (select mois_stabilite from cfg)                          as mois_requis,
  count(*)                                                  as mois_evalues,
  bool_and(cond_ca and cond_marge and cond_mrr)
    and count(*) = (select mois_stabilite from cfg)         as stabilise,
  json_agg(json_build_object(
    'mois', mois, 'ca', ca_total, 'mrr', ca_mrr,
    'marge', marge_reelle,
    'ok', (cond_ca and cond_marge and cond_mrr)
  ) order by mois desc)                                     as detail
from evalues;

alter table public.config_finance  enable row level security;
alter table public.encaissements   enable row level security;
alter table public.charges_reelles enable row level security;

create policy "auth full config"     on public.config_finance  for all to authenticated using (true) with check (true);
create policy "auth full encaiss"    on public.encaissements    for all to authenticated using (true) with check (true);
create policy "auth full charges"    on public.charges_reelles  for all to authenticated using (true) with check (true);

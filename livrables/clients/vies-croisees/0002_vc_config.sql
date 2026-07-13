-- Vies Croisées — table de configuration (mot de passe admin modifiable par Andréa)
-- Appliquée en prod le 2026-07-13 sur le projet partagé lgdgbrivnhgeupqhkckd
-- Modèle d'accès identique aux autres tables vc_ : gate côté client, policies public.

create table if not exists public.vc_config (
  cle text primary key,
  valeur text,
  updated_at timestamptz default now()
);

alter table public.vc_config enable row level security;

drop policy if exists vc_config_read on public.vc_config;
drop policy if exists vc_config_update on public.vc_config;

create policy vc_config_read on public.vc_config
  for select to public using (true);

create policy vc_config_update on public.vc_config
  for update to public using (true) with check (true);

insert into public.vc_config (cle, valeur) values ('admin_password', 'andrea2026')
  on conflict (cle) do nothing;

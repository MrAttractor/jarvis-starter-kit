-- Agence Innovation Créative — capture des demandes (devis + coaching)
-- Projet Supabase partagé attractor-assists. Sécurité scopée à l'UID d'Emmanuel Yao.
create table if not exists public.aic_demandes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null default 'devis',
  nom text,
  contact text,
  email text,
  pays text,
  besoin text,
  formule text,
  message text,
  details jsonb,
  statut text not null default 'nouveau'
);
alter table public.aic_demandes enable row level security;
-- Pas de policy INSERT : les insertions passent uniquement par l'edge function en service role.
drop policy if exists aic_demandes_owner_select on public.aic_demandes;
drop policy if exists aic_demandes_owner_update on public.aic_demandes;
drop policy if exists aic_demandes_owner_delete on public.aic_demandes;
create policy aic_demandes_owner_select on public.aic_demandes for select
  using (auth.uid() = 'b1635d9d-e970-4293-9674-871cde1e639a');
create policy aic_demandes_owner_update on public.aic_demandes for update
  using (auth.uid() = 'b1635d9d-e970-4293-9674-871cde1e639a')
  with check (auth.uid() = 'b1635d9d-e970-4293-9674-871cde1e639a');
create policy aic_demandes_owner_delete on public.aic_demandes for delete
  using (auth.uid() = 'b1635d9d-e970-4293-9674-871cde1e639a');
create index if not exists aic_demandes_created_idx on public.aic_demandes (created_at desc);

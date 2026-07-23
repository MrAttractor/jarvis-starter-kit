-- VSD by Attractor — liste d'attente des voyageurs
-- Projet Supabase partagé attractor-assists. Préfixe vsd_.
-- Tout le traitement se fait par email ; le numéro WhatsApp est collecté
-- et conservé en base pour des réutilisations ultérieures (relances,
-- diffusion des départs), pas pour l'échange courant.
create table if not exists public.vsd_inscriptions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nom text,
  email text,
  whatsapp text,           -- conservé en base, réutilisable plus tard
  depart text,             -- libellé du départ choisi
  formule text,            -- "Le vol" ou "Le vol et l'hôtel"
  valise text,             -- option valise 23 kg
  source text default 'site',
  statut text not null default 'nouveau',   -- nouveau | rappele | eligible | lien_envoye | paye | embarque | annule
  -- Suivi du paiement. Le lien est généré par la compagnie dans le cadre
  -- du partenariat, il n'est envoyé qu'une fois le dossier vérifié.
  lien_paiement text,
  lien_envoye_le timestamptz,
  paye_le timestamptz,
  montant_paye numeric(10,2),
  notes text
);

alter table public.vsd_inscriptions enable row level security;

-- Pas de policy INSERT : les insertions passent uniquement par l'edge
-- function vsd-inscription, en service role. Un anonyme ne peut ni lire
-- ni écrire la liste.
drop policy if exists vsd_inscriptions_owner_select on public.vsd_inscriptions;
drop policy if exists vsd_inscriptions_owner_update on public.vsd_inscriptions;
drop policy if exists vsd_inscriptions_owner_delete on public.vsd_inscriptions;

create policy vsd_inscriptions_owner_select on public.vsd_inscriptions for select
  using (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9');
create policy vsd_inscriptions_owner_update on public.vsd_inscriptions for update
  using (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9')
  with check (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9');
create policy vsd_inscriptions_owner_delete on public.vsd_inscriptions for delete
  using (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9');

create index if not exists vsd_inscriptions_created_idx on public.vsd_inscriptions (created_at desc);
create index if not exists vsd_inscriptions_depart_idx on public.vsd_inscriptions (depart);

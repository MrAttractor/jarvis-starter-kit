-- devis_web — acceptations de devis via la page devis interactive Mr Attractor.
-- Écrit uniquement par l'edge function devis-accept (service role).
-- Données prospects : AUCUNE policy publique (pas de SELECT anon), RLS activée.
create table if not exists public.devis_web (
  id           uuid primary key default gen_random_uuid(),
  numero       text,
  client       text,
  projet       text,
  nom          text,
  contact      text,
  selection    jsonb,
  total        numeric,
  devise       text default '€',
  total_label  text,
  statut       text default 'accepté',
  created_at   timestamptz default now()
);

alter table public.devis_web enable row level security;
-- pas de policy = aucun accès via clé anon ; seul le service role (edge function) écrit/lit.

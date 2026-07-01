-- 0047_campagne_reveil.sql — Campagne de réveil des testeurs silencieux
-- Table de suivi des envois (anti-doublon, base pour mesurer l'effet plus tard)
create table if not exists public.campagne_envois (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campagne text not null default 'reveil_testeurs_juillet2026',
  etape integer not null,
  envoye_at timestamptz not null default now(),
  unique (user_id, campagne, etape)
);
alter table public.campagne_envois enable row level security;
create policy "campagne_envois admin only" on public.campagne_envois for all using (public.is_admin()) with check (public.is_admin());

-- RPC : liste des testeurs silencieux éligibles à une étape donnée de la campagne
-- security definer car auth.users.email n'est pas exposé via PostgREST par défaut.
-- Appelé depuis n8n avec la clé service_role (bypass RLS), mais la fonction reste
-- utilisable par un admin connecté grâce à la vérification is_admin() interne.
create or replace function public.get_testeurs_reveil(
  p_jours_silence integer,
  p_campagne text default 'reveil_testeurs_juillet2026',
  p_etape integer default 1
)
returns table (
  user_id uuid,
  email text,
  prenom text,
  activite text,
  nom_assistant text,
  profil_type text,
  plan_code text,
  last_seen timestamptz,
  memoire_cache text
)
language sql stable security definer set search_path = public as $$
  select
    p.id, u.email, p.prenom, p.activite, p.nom_assistant,
    coalesce(p.profil_type, p.profil_dominant), p.plan_code, p.last_seen, p.memoire_cache
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.statut = 'actif'
    and u.email is not null
    and (p.last_seen is null or p.last_seen < now() - make_interval(days => p_jours_silence))
    and not exists (
      select 1 from public.campagne_envois ce
      where ce.user_id = p.id and ce.campagne = p_campagne and ce.etape = p_etape
    )
  order by p.last_seen asc nulls first;
$$;

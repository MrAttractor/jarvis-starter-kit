-- 0008_last_seen.sql — Colonne last_seen sur profiles
alter table public.profiles add column if not exists last_seen timestamptz;

-- Fonction RPC pour mettre à jour last_seen de l'utilisateur courant
create or replace function public.ping_last_seen()
returns void language sql security definer set search_path = public as $$
  update public.profiles set last_seen = now() where id = auth.uid();
$$;

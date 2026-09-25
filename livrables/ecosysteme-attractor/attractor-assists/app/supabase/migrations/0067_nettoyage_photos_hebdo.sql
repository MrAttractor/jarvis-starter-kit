-- ============================================================
-- Nettoyage hebdomadaire des photos orphelines, tous sites clients (25/09/2026)
-- ============================================================
--
-- Constat : supprimer une fiche en base ne supprime pas sa photo, et le
-- trigger storage.protect_delete interdit de l'effacer en SQL. Seule l'API
-- Storage efface le fichier. Les photos remplacées ou abandonnées
-- s'accumulent donc (68 sur GetWinWorld, 4 sur Ayêla, 4 sur Vies Croisées).
--
-- Principe : chaque bucket inscrit dans nettoyage_photos_config est comparé
-- au contenu de toutes les tables de son préfixe. Une photo que plus aucune
-- ligne ne mentionne depuis `age_min` est effacée par l'edge function
-- nettoyage-photos (API Storage), chaque lundi à 3h UTC.
--
-- Nouveau site client avec un bucket photos : l'ajouter ici. Un bucket absent
-- de cette table n'est jamais touché (documents-signature, avatars...).
-- ============================================================

create table if not exists public.nettoyage_photos_config (
  bucket          text primary key,
  prefixe_tables  text not null check (length(prefixe_tables) >= 3 and prefixe_tables like '%\_'),
  actif           boolean not null default true,
  note            text
);
alter table public.nettoyage_photos_config enable row level security;
-- Aucune policy : réservée au service role

insert into public.nettoyage_photos_config (bucket, prefixe_tables, note) values
  ('ay-photos',  'ay_',  'Ayêla'),
  ('bey-photos', 'bey_', 'Beynaud / STAR FACTORY'),
  ('vc-medias',  'vc_',  'Vies Croisées'),
  ('als-medias', 'als_', 'Armée du Seigneur')
on conflict (bucket) do nothing;
-- gw-photos n'y est pas : GetWinWorld a sa propre purge (getwinworld-purge, 15 min)

create or replace function public.photos_orphelines(p_bucket text, p_age interval default interval '7 days')
returns table (nom text, total bigint)
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  v_prefixe text;
  t record;
  n_tables int := 0;
begin
  select prefixe_tables into v_prefixe
    from public.nettoyage_photos_config where bucket = p_bucket and actif;
  if v_prefixe is null then return; end if;

  create temp table if not exists _np_refs (txt text) on commit drop;
  truncate _np_refs;
  for t in
    select table_name from information_schema.tables
     where table_schema = 'public' and table_type = 'BASE TABLE'
       and table_name like replace(v_prefixe, '_', '\_') || '%'
  loop
    execute format('insert into _np_refs select x::text from public.%I x', t.table_name);
    n_tables := n_tables + 1;
  end loop;
  -- Garde-fou : sans table de référence on ne peut rien conclure
  if n_tables = 0 then return; end if;

  return query
    select o.name, (select count(*) from storage.objects a where a.bucket_id = p_bucket)
      from storage.objects o
     where o.bucket_id = p_bucket
       and o.created_at < now() - p_age
       and not exists (select 1 from _np_refs r where position(o.name in r.txt) > 0);
end $$;

revoke all on function public.photos_orphelines(text, interval) from public, anon, authenticated;
grant execute on function public.photos_orphelines(text, interval) to service_role;

-- Planification : lundi 3h UTC. <SERVICE_ROLE_KEY> substituée à l'exécution, jamais committée.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'nettoyage_photos_hebdo') then
    perform cron.unschedule('nettoyage_photos_hebdo');
  end if;
end $$;

select cron.schedule(
  'nettoyage_photos_hebdo',
  '0 3 * * 1',
  $$ select net.http_post(
       url := 'https://lgdgbrivnhgeupqhkckd.supabase.co/functions/v1/nettoyage-photos',
       headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer <SERVICE_ROLE_KEY>'),
       body := '{}'::jsonb
     ) $$
);

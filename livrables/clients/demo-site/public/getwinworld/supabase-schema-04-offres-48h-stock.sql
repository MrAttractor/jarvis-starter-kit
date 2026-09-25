-- ============================================================
-- GetWinWorld — Offres du jour 48h, produits en stock permanents
-- Projet : lgdgbrivnhgeupqhkckd (Attractor Assists — projet partagé)
-- Remplace supabase-schema-03-expiration-24h.sql (25/09/2026)
-- ============================================================
--
-- Règle métier (décidée par Mac Arthur le 25/09/2026) :
--   - une OFFRE DU JOUR est supprimée définitivement 48h après être devenue
--     offre du jour : la fiche ET sa photo dans le bucket gw-photos ;
--   - un produit EN STOCK (est_offre_du_jour = false) reste en ligne jusqu'à
--     ce que Charles le supprime lui-même depuis l'admin.
--
-- Le compteur part de `offre_depuis`, pas de `created_at` : un produit en
-- stock repassé en offre du jour repart pour 48h pleines.
--
-- La suppression passe par l'edge function getwinworld-purge et non par du
-- SQL : le trigger storage.protect_delete interdit de supprimer les photos en
-- SQL, seule l'API Storage efface réellement le fichier.
-- ============================================================

alter table public.gw_produits
  add column if not exists offre_depuis timestamptz default now();

update public.gw_produits
   set offre_depuis = created_at
 where offre_depuis is null or offre_depuis > created_at;

-- Une publication est une offre du jour par défaut
alter table public.gw_produits alter column est_offre_du_jour set default true;

create or replace function public.gw_produits_offre_depuis()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.offre_depuis := now();
  elsif new.est_offre_du_jour and not old.est_offre_du_jour then
    new.offre_depuis := now();
  else
    new.offre_depuis := old.offre_depuis;
  end if;
  return new;
end $$;

drop trigger if exists gw_produits_offre_depuis on public.gw_produits;
create trigger gw_produits_offre_depuis
  before insert or update on public.gw_produits
  for each row execute function public.gw_produits_offre_depuis();

-- L'ancienne tâche supprimait TOUT article au bout de 24h, stock compris
do $$
begin
  if exists (select 1 from cron.job where jobname = 'gw_expire_produits') then
    perform cron.unschedule('gw_expire_produits');
  end if;
  if exists (select 1 from cron.job where jobname = 'gw_purge_offres') then
    perform cron.unschedule('gw_purge_offres');
  end if;
end $$;

-- Toutes les 15 minutes : offres de plus de 48h + photos orphelines.
-- <SERVICE_ROLE_KEY> est substituée à l'exécution, jamais committée.
select cron.schedule(
  'gw_purge_offres',
  '*/15 * * * *',
  $$ select net.http_post(
       url := 'https://lgdgbrivnhgeupqhkckd.supabase.co/functions/v1/getwinworld-purge',
       headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer <SERVICE_ROLE_KEY>'),
       body := '{}'::jsonb
     ) $$
);

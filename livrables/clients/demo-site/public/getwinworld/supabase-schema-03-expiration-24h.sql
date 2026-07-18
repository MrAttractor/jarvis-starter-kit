-- ============================================================
-- GetWinWorld — Expiration automatique des articles après 24h en ligne
-- Projet : lgdgbrivnhgeupqhkckd (Attractor Assists — projet partagé)
-- Exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================
--
-- Règle métier (décidée par Mac Arthur) : un article disparaît PARTOUT 24h après
-- sa mise en ligne — de la vitrine, de l'assistant ET de l'admin de Charles.
-- S'il veut le remettre, Charles le recharge (nouvelle fiche). => SUPPRESSION DURE.
--
-- Côté visiteur, l'invisibilité est déjà garantie sans ce job : la vitrine
-- (index.html) et l'assistant (getwinworld-chat) ne chargent que les produits
-- de moins de 24h (filtre `.gte('created_at', maintenant - 24h)`). Ce job assure
-- en plus la disparition dans l'admin (la ligne est réellement supprimée).
-- Le filtre côté site reste comme filet de sécurité entre deux exécutions du job.
-- ============================================================

create extension if not exists pg_cron;

-- Idempotent : retire une planification précédente du même nom si elle existe
do $$
begin
  if exists (select 1 from cron.job where jobname = 'gw_expire_produits') then
    perform cron.unschedule('gw_expire_produits');
  end if;
end $$;

-- SUPPRESSION DURE toutes les 15 minutes des articles de plus de 24h
select cron.schedule(
  'gw_expire_produits',
  '*/15 * * * *',
  $$ delete from public.gw_produits
     where created_at < now() - interval '24 hours' $$
);

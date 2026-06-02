-- ============================================================
-- 0013 — RÉVEILS AUTOMATIQUES DES AGENTS
-- Prérequis : pg_cron + pg_net activés (extensions Supabase)
-- ============================================================

-- Supprimer les anciens jobs si existants (idempotent)
select cron.unschedule('miroir-reveil')     where exists (select 1 from cron.job where jobname = 'miroir-reveil');
select cron.unschedule('notify-auto-matin') where exists (select 1 from cron.job where jobname = 'notify-auto-matin');

-- ─── RÉVEIL 1 : MIROIR — toutes les 30 min ────────────────────
select cron.schedule(
  'miroir-reveil',
  '*/30 * * * *',
  $$
  select net.http_post(
    url     := 'https://lgdgbrivnhgeupqhkckd.supabase.co/functions/v1/miroir',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZGdicml2bmhnZXVwcWhrY2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAwMjU5MSwiZXhwIjoyMDk1NTc4NTkxfQ._Z6In5DMHOPQX7zLymUqVW4_f84ccqampapW5MdQfR8'
    ),
    body    := '{}'::jsonb
  ) as request_id;
  $$
);

-- ─── RÉVEIL 2 : notify-auto — chaque matin à 8h ───────────────
select cron.schedule(
  'notify-auto-matin',
  '0 8 * * *',
  $$
  select net.http_post(
    url     := 'https://lgdgbrivnhgeupqhkckd.supabase.co/functions/v1/notify-auto',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZGdicml2bmhnZXVwcWhrY2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAwMjU5MSwiZXhwIjoyMDk1NTc4NTkxfQ._Z6In5DMHOPQX7zLymUqVW4_f84ccqampapW5MdQfR8'
    ),
    body    := '{}'::jsonb
  ) as request_id;
  $$
);

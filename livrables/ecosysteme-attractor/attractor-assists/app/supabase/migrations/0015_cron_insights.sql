-- ============================================================
-- 0015 — Cron collect-insights : quotidien à 7h
-- ============================================================
select cron.unschedule('collect-insights-matin') where exists (
  select 1 from cron.job where jobname = 'collect-insights-matin'
);

select cron.schedule(
  'collect-insights-matin',
  '0 7 * * *',
  $$
  select net.http_post(
    url     := 'https://lgdgbrivnhgeupqhkckd.supabase.co/functions/v1/collect-insights',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZGdicml2bmhnZXVwcWhrY2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAwMjU5MSwiZXhwIjoyMDk1NTc4NTkxfQ._Z6In5DMHOPQX7zLymUqVW4_f84ccqampapW5MdQfR8'
    ),
    body    := '{}'::jsonb
  ) as request_id;
  $$
);

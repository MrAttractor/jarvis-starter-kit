-- ============================================================================
-- Cockpit Pilotage — fermeture de l'accès public (17/07/2026)
--
-- Avant : les tables pilotage_* étaient en `ALL` pour public/anon, et la page
-- n'avait AUCUNE authentification. N'importe qui avec l'URL lisait ET modifiait
-- finances, devis, pipeline clients, enveloppes d'épargne, objectif.
--
-- Après : la page exige une connexion par code email (Supabase OTP), et chaque
-- table est réservée au seul compte propriétaire. Les edge functions
-- (diagnostic, devis-accept, coach-repartition) écrivent en service role et
-- contournent RLS : elles continuent de fonctionner.
--
-- Propriétaire : myattractor1@gmail.com
-- ============================================================================

-- Purge des policies ouvertes
drop policy if exists "allow_all"                 on pilotage_cap;
drop policy if exists "allow_all_charges"         on pilotage_charges;
drop policy if exists "pilotage_devis anon rw"    on pilotage_devis;
drop policy if exists "allow_all_enveloppes"      on pilotage_enveloppes;
drop policy if exists "allow_all_finances"        on pilotage_finances;
drop policy if exists "allow_all"                 on pilotage_focus;
drop policy if exists "pilotage_payments anon rw" on pilotage_payments;
drop policy if exists "allow_all"                 on pilotage_pipeline;
drop policy if exists "allow_all"                 on pilotage_projets;

-- RLS actif partout (au cas où)
alter table pilotage_cap        enable row level security;
alter table pilotage_charges    enable row level security;
alter table pilotage_devis      enable row level security;
alter table pilotage_enveloppes enable row level security;
alter table pilotage_finances   enable row level security;
alter table pilotage_focus      enable row level security;
alter table pilotage_payments   enable row level security;
alter table pilotage_pipeline   enable row level security;
alter table pilotage_projets    enable row level security;

-- Accès réservé au compte propriétaire (myattractor1@gmail.com)
create policy "pilotage_owner" on pilotage_cap        for all using (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid) with check (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid);
create policy "pilotage_owner" on pilotage_charges    for all using (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid) with check (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid);
create policy "pilotage_owner" on pilotage_devis      for all using (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid) with check (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid);
create policy "pilotage_owner" on pilotage_enveloppes for all using (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid) with check (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid);
create policy "pilotage_owner" on pilotage_finances   for all using (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid) with check (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid);
create policy "pilotage_owner" on pilotage_focus      for all using (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid) with check (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid);
create policy "pilotage_owner" on pilotage_payments   for all using (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid) with check (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid);
create policy "pilotage_owner" on pilotage_pipeline   for all using (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid) with check (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid);
create policy "pilotage_owner" on pilotage_projets    for all using (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid) with check (auth.uid() = 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid);

-- 0049_pilotage_payments.sql — Paiements XPaye générés depuis un devis du Pilotage externe
CREATE TABLE IF NOT EXISTS public.pilotage_payments (
  id uuid primary key default gen_random_uuid(),
  dossier_id text not null references public.pilotage_pipeline(id) on delete cascade,
  devis_id uuid not null references public.pilotage_devis(id) on delete cascade,
  reference text not null unique,
  montant numeric not null,
  percentage numeric not null,
  channel text,
  statut text not null default 'pending' check (statut in ('pending','success','failed')),
  gateway_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
CREATE INDEX IF NOT EXISTS idx_pilotage_payments_devis ON public.pilotage_payments (devis_id);

-- Même ouverture pragmatique que les autres tables pilotage_* (outil anon sans login)
ALTER TABLE public.pilotage_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pilotage_payments anon rw" ON public.pilotage_payments FOR ALL TO anon USING (true) WITH CHECK (true);

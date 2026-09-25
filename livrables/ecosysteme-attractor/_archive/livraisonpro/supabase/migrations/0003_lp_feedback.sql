-- Avis terrain (support commercial Livraison Pro) — appliqué le 13/07/2026 via Management API.
create table if not exists public.lp_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  role text,          -- marchand | livreur | autre
  interet text,       -- tres_interesse | a_convaincre | pas_pour_moi
  marque text,        -- ce qui a marqué / avis / frein
  frein text,
  nom text,
  whatsapp text,
  zone text,
  commercial text,    -- nom du commercial terrain (param ?c=)
  source text default 'pitch-terrain'
);
alter table public.lp_feedback enable row level security;
grant insert on public.lp_feedback to anon, authenticated;
-- Insertion via edge function lp-feedback (service role). Pas de policy SELECT publique.
drop policy if exists "lp_feedback_ins" on public.lp_feedback;
create policy "lp_feedback_ins" on public.lp_feedback for insert with check (true);

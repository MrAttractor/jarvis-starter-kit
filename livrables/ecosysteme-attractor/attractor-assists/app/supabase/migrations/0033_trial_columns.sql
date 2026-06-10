-- 0033_trial_columns.sql — Colonnes pour l'offre d'essai gratuit 1 mois
alter table public.profiles
  add column if not exists trial_activated_at timestamptz,
  add column if not exists trial_expires_at   timestamptz;

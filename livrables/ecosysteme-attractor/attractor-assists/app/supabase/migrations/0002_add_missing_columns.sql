-- 0002_add_missing_columns.sql
-- Colonnes manquantes dans profiles, référencées dans l'app mais absentes du schéma initial.

alter table public.profiles add column if not exists ouverture text;
alter table public.profiles add column if not exists activation_done boolean not null default false;
alter table public.profiles add column if not exists presence_analyse text;

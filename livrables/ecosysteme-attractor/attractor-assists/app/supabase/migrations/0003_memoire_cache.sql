-- 0003_memoire_cache.sql
-- Mémoire courte : résumé automatique des conversations, généré toutes les 5 réponses

alter table public.profiles add column if not exists memoire_cache text;

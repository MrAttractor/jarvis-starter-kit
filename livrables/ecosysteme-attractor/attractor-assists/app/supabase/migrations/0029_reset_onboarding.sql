-- Reset onboarding pour tous les utilisateurs non-admin
-- À appliquer manuellement dans le SQL Editor du dashboard Supabase
-- Objectif : forcer tous les testeurs à repasser par l'onboarding complet

UPDATE public.profiles
SET
  onboarding_done = false,
  activation_done = false
WHERE role != 'admin';

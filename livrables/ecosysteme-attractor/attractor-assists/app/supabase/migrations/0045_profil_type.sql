-- Migration 0045 : colonne profil_type manquante dans profiles
-- Utilisée dans OnboardingScreen, ActivationScreen, ConversationScreen
-- mais jamais créée en base — causait "Une erreur est survenue" au submit onboarding

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profil_type TEXT DEFAULT 'entrepreneur';

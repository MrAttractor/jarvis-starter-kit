-- Migration 0035 — Colonnes manquantes dans profiles, prospects, todos
-- Identifiées lors de l'audit du 11/06/2026

-- ─── TABLE profiles — colonnes manquantes ───────────────────────────────────

-- Système de parrainage
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code  text UNIQUE,
  ADD COLUMN IF NOT EXISTS referral_count integer NOT NULL DEFAULT 0;

-- URL de la démo générée par Carelle (maquette auto)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS demo_url text;

-- Génère un code de parrainage unique pour les profils existants qui n'en ont pas
UPDATE public.profiles
  SET referral_code = substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)
  WHERE referral_code IS NULL;

-- Rend referral_code NOT NULL après le backfill
ALTER TABLE public.profiles
  ALTER COLUMN referral_code SET NOT NULL;

-- Index pour lookup rapide par code de parrainage (ex: inscription avec ?ref=XXXX)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_referral_code_idx
  ON public.profiles (referral_code);


-- ─── TABLE prospects — colonnes manquantes ───────────────────────────────────

-- Type de projet — utilisé pour router vers Famille A (app métier) ou Famille B (consulting)
ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS type_projet   text,          -- 'A' | 'B' | 'C'
  ADD COLUMN IF NOT EXISTS nb_users      text,          -- '1' | '2-5' | '5+'
  ADD COLUMN IF NOT EXISTS maquette_url  text,          -- URL de la maquette générée
  ADD COLUMN IF NOT EXISTS carelle_brief text;          -- Analyse Carelle pour Famille A


-- ─── TABLE todos — correction du champ statut ────────────────────────────────
-- Le code AgendaScreen utilise .update({ statut: next }) mais la table n'a que `done` (boolean)
-- On ajoute `statut` en gardant `done` pour rétrocompatibilité

ALTER TABLE public.todos
  ADD COLUMN IF NOT EXISTS statut text NOT NULL DEFAULT 'en_attente';

-- Synchronise le statut avec done pour les entrées existantes
UPDATE public.todos
  SET statut = CASE WHEN done = true THEN 'fait' ELSE 'en_attente' END
  WHERE statut = 'en_attente';

-- Contrainte sur les valeurs valides
ALTER TABLE public.todos
  DROP CONSTRAINT IF EXISTS todos_statut_check;

ALTER TABLE public.todos
  ADD CONSTRAINT todos_statut_check
  CHECK (statut IN ('en_attente', 'en_cours', 'fait', 'annule'));

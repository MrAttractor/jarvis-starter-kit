-- 0048_pilotage_devis_relance.sql — Pilotage externe : qualification pour auto-devis Claude + suivi de relance
-- Additif uniquement, aucune table existante n'est recréée (schéma pilotage_* jamais versionné avant ce fichier).

ALTER TABLE public.pilotage_pipeline
  ADD COLUMN IF NOT EXISTS besoin text,             -- ce dont le prospect a besoin (repris du modèle prospects/journal existant)
  ADD COLUMN IF NOT EXISTS contexte text,           -- budget / délai / objections
  ADD COLUMN IF NOT EXISTS nb_users text,           -- '1' / '2-5' / '5+' — sert à trancher SOLO/ÉQUIPE/ENTERPRISE
  ADD COLUMN IF NOT EXISTS derniere_action_at timestamptz DEFAULT now(); -- pour détecter les dossiers sans mouvement (badge "Relance due")

COMMENT ON COLUMN public.pilotage_pipeline.besoin IS 'Besoin exprimé par le prospect, utilisé par generate-devis pour qualifier le niveau';
COMMENT ON COLUMN public.pilotage_pipeline.nb_users IS 'Nombre d''utilisateurs déclaré (1 / 2-5 / 5+), détermine SOLO/ÉQUIPE/ENTERPRISE en Famille A';
COMMENT ON COLUMN public.pilotage_pipeline.derniere_action_at IS 'Horodatage de la dernière édition du dossier — sert au badge de relance (>5 jours)';

-- Table des devis générés pour les dossiers du pipeline externe (équivalent de devis_prospects,
-- mais rattachée à pilotage_pipeline pour rester dans le seul cockpit décidé comme source unique).
CREATE TABLE IF NOT EXISTS public.pilotage_devis (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.pilotage_pipeline(id) on delete cascade,
  numero text not null,
  famille text,
  niveau text,
  devise text,
  setup_ht numeric,
  mrr numeric,
  acompte numeric,
  solde numeric,
  total_m1 numeric,
  raisonnement text,
  questions_manquantes text,
  statut text not null default 'brouillon' check (statut in ('brouillon','valide')),
  created_at timestamptz not null default now()
);
CREATE INDEX IF NOT EXISTS idx_pilotage_devis_dossier ON public.pilotage_devis (dossier_id);

-- Note : le Pilotage est un outil statique sans flux d'auth (clé anon uniquement, pas de login),
-- comme les autres tables pilotage_*. On garde donc la même ouverture pragmatique (anon) plutôt
-- qu'un gate is_admin() qui bloquerait tout puisqu'aucun utilisateur authentifié n'existe côté client.
ALTER TABLE public.pilotage_devis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pilotage_devis anon rw" ON public.pilotage_devis FOR ALL TO anon USING (true) WITH CHECK (true);

-- 0020_marketplace_v2.sql
-- Refonte Marketplace Attractor : catégories 3 familles, tarification, CGV
-- À appliquer dans Supabase Dashboard > SQL Editor

ALTER TABLE prestataires
  ADD COLUMN IF NOT EXISTS categorie_principale TEXT
    CHECK (categorie_principale IN ('services','ecommerce','food')),
  ADD COLUMN IF NOT EXISTS sous_categorie TEXT,
  ADD COLUMN IF NOT EXISTS pricing_type TEXT DEFAULT 'detail'
    CHECK (pricing_type IN ('detail','devis')),
  ADD COLUMN IF NOT EXISTS pricing_details JSONB,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS cgv_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cgv_version TEXT DEFAULT 'v1.0';

-- Commentaires
COMMENT ON COLUMN prestataires.categorie_principale IS 'Famille principale : services | ecommerce | food';
COMMENT ON COLUMN prestataires.sous_categorie IS 'Sous-catégorie libre : Consultant, Infographiste, Restaurant...';
COMMENT ON COLUMN prestataires.pricing_type IS 'detail = tarif affiché | devis = on me contacte';
COMMENT ON COLUMN prestataires.pricing_details IS '{"description":"...", "montant":"...", "unite":"/heure"}';
COMMENT ON COLUMN prestataires.email IS 'Email pour envoi du contrat CGV signé';
COMMENT ON COLUMN prestataires.cgv_accepted_at IS 'Timestamp de signature électronique des CGV v1.0';

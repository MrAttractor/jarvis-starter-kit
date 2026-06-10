-- Migration 0030 : Catalogue V3 — colonnes manquantes produits_user
-- categorie, photo_url, actif n'étaient pas dans la migration 0022 initiale

ALTER TABLE produits_user
  ADD COLUMN IF NOT EXISTS categorie  text,
  ADD COLUMN IF NOT EXISTS photo_url  text,
  ADD COLUMN IF NOT EXISTS actif      boolean NOT NULL DEFAULT true;

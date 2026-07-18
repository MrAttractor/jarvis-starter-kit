-- ============================================================
-- Ayêla — Migration 03 : liage production (embouteillage -> stock + emballages)
-- Colonnes de comptabilité de production sur les lots.
-- ============================================================
ALTER TABLE public.ay_lots ADD COLUMN IF NOT EXISTS qte_produite       int DEFAULT 0;
ALTER TABLE public.ay_lots ADD COLUMN IF NOT EXISTS format_produit     text;
ALTER TABLE public.ay_lots ADD COLUMN IF NOT EXISTS emballage_id       uuid;
ALTER TABLE public.ay_lots ADD COLUMN IF NOT EXISTS production_comptee boolean DEFAULT false;

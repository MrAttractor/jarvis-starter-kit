-- Migration 0043 : colonne template_id dans profiles

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS template_id TEXT DEFAULT '1a';

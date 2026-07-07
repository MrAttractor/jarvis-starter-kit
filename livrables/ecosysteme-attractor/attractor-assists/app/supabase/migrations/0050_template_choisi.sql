-- 0050_template_choisi.sql — Choix du modèle de boutique publique (galerie de templates)
-- null/'1a' = boutique standard React (PublicAssistantScreen), '1b' = Liste, '1c' = Magazine
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS template_choisi TEXT;

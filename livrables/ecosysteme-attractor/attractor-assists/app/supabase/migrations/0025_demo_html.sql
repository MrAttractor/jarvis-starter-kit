-- Colonne demo_html dans profiles pour stocker la maquette générée (bypass Supabase Storage)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS demo_html text;

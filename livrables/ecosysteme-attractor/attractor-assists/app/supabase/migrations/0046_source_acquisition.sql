-- Tracker source d'acquisition : ?src= dans les liens de partage
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS source_acquisition TEXT;

COMMENT ON COLUMN public.profiles.source_acquisition IS 'Source d''acquisition de l''utilisateur (ex: facebook_groupe, tiktok, linkedin, whatsapp_methode)';

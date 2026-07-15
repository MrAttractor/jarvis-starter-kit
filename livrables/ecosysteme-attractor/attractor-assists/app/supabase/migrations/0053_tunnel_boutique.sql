-- Migration 0053 : socle du tunnel de création de boutique
--
-- 1. profiles.whatsapp   : le numéro de l'entrepreneur. Il n'existait nulle part,
--                          alors que tout le parcours d'achat se termine sur WhatsApp
--                          (les templates 1b/1c avaient un numéro placeholder EN DUR).
-- 2. template_choisi     : colonne unique de template. `template_id` était écrit par
--                          l'onboarding et lu par personne ; `template_choisi` est lu
--                          par la boutique. On fusionne vers celle qui a des lecteurs.
-- 3. reserved_slugs      : empêche un entrepreneur de prendre un slug qui entre en
--                          collision avec une route ou un fichier du site
--                          (assists.agenceattractor.com/[slug] sert les boutiques).
--
-- Additif et non destructif : `template_id` n'est PAS supprimé ici (voir 0056, à passer
-- au moins un cycle de déploiement plus tard, sinon les navigateurs qui tournent encore
-- sur l'ancien bundle échouent à l'onboarding et l'utilisateur perd tout son parcours).

-- ─── 1. Numéro WhatsApp de l'entrepreneur ────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp text;

COMMENT ON COLUMN public.profiles.whatsapp IS
  'Numéro WhatsApp de l''entrepreneur, chiffres uniquement, indicatif pays inclus (ex : 2250758680279). Destination des commandes de sa boutique.';

-- ─── 2. Template : une seule colonne ─────────────────────────────────────────
UPDATE public.profiles
SET template_choisi = COALESCE(template_choisi, NULLIF(template_id, ''), '1a')
WHERE template_choisi IS NULL;

ALTER TABLE public.profiles ALTER COLUMN template_choisi SET DEFAULT '1a';

-- ─── 3. Slugs réservés ───────────────────────────────────────────────────────
-- Une table plutôt qu'un CHECK : on ajoute un mot réservé sans migration.
CREATE TABLE IF NOT EXISTS public.reserved_slugs (
  slug text PRIMARY KEY,
  motif text
);

INSERT INTO public.reserved_slugs (slug, motif) VALUES
  -- routes et fichiers réels du projet Pages : un slug homonyme serait masqué
  -- en silence par le fichier statique (les assets passent avant _redirects)
  ('b', 'route boutique legacy'),
  ('assets', 'bundle vite'),
  ('boutique', 'page boutique'),
  ('privacy', 'page legale'),
  ('privacy-delete', 'page legale'),
  ('marketplace', 'dossier public'),
  ('methode', 'dossier public'),
  ('uploads', 'dossier public'),
  ('index', 'fichier'),
  ('manifest.json', 'fichier pwa'),
  ('icon-192.png', 'fichier pwa'),
  ('icon-512.png', 'fichier pwa'),
  ('apple-touch-icon.png', 'fichier pwa'),
  ('sw.js', 'service worker'),
  ('robots.txt', 'fichier'),
  ('favicon.ico', 'fichier'),
  -- réservés produit et futurs
  ('app', 'app entrepreneur'),
  ('admin', 'reserve'),
  ('api', 'reserve'),
  ('www', 'reserve'),
  ('mail', 'reserve'),
  ('cdn', 'reserve'),
  ('static', 'reserve'),
  ('login', 'reserve'),
  ('signup', 'reserve'),
  ('auth', 'reserve'),
  ('dashboard', 'reserve'),
  ('catalogue', 'reserve'),
  ('commandes', 'reserve'),
  ('profil', 'reserve'),
  ('compte', 'reserve'),
  ('support', 'reserve'),
  ('aide', 'reserve'),
  ('help', 'reserve'),
  ('docs', 'reserve'),
  ('blog', 'reserve'),
  ('status', 'reserve'),
  ('attractor', 'marque'),
  ('assists', 'marque'),
  ('agence', 'marque'),
  ('demo', 'reserve'),
  ('test', 'reserve'),
  ('template-1a', 'reserve'),
  ('template-1b', 'reserve'),
  ('template-1c', 'reserve')
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.reserved_slugs ENABLE ROW LEVEL SECURITY;
-- Personne ne lit cette table directement : slug_available() est SECURITY DEFINER.

-- Garde-fou serveur : `generate-client-assistant` crée des slugs sans passer par l'UI.
CREATE OR REPLACE FUNCTION public.check_slug_reserved()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF new.public_slug IS NOT NULL
     AND (tg_op = 'INSERT' OR new.public_slug IS DISTINCT FROM old.public_slug) THEN

    IF EXISTS (SELECT 1 FROM public.reserved_slugs WHERE slug = lower(new.public_slug)) THEN
      RAISE EXCEPTION 'SLUG_RESERVED';
    END IF;

    IF new.public_slug !~ '^[a-z0-9][a-z0-9-]{1,19}$' THEN
      RAISE EXCEPTION 'SLUG_INVALID';
    END IF;
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_slug_reserved ON public.profiles;
CREATE TRIGGER trg_check_slug_reserved
  BEFORE INSERT OR UPDATE OF public_slug ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_slug_reserved();

-- Disponibilité : unicité + réservé + forme, en un seul appel.
-- Remplace le `select id from profiles where public_slug = ...` de l'onboarding,
-- qui exposait des lignes de profils au rôle anon.
-- Le slug que l'appelant possède déjà lui reste disponible (il revient en arrière
-- dans le tunnel, ou rouvre l'écran sans changer de nom).
CREATE OR REPLACE FUNCTION public.slug_available(p_slug text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT p_slug ~ '^[a-z0-9][a-z0-9-]{1,19}$'
     AND NOT EXISTS (
       SELECT 1 FROM public.profiles
       WHERE public_slug = p_slug
         AND id IS DISTINCT FROM auth.uid()
     )
     AND NOT EXISTS (SELECT 1 FROM public.reserved_slugs WHERE slug = p_slug);
$$;

GRANT EXECUTE ON FUNCTION public.slug_available(text) TO anon, authenticated;

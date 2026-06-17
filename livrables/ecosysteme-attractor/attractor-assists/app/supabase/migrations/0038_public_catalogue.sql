-- Migration 0038 : Catalogue public — accès anonyme via slug boutique
-- Permet au site client (creal.ci, etc.) de lire les produits actifs sans authentification

CREATE OR REPLACE FUNCTION public.get_catalogue(p_slug text)
RETURNS TABLE (
  id        uuid,
  nom       text,
  prix      decimal,
  unite     text,
  categorie text,
  photo_url text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    pu.id,
    pu.nom,
    pu.prix,
    pu.unite,
    pu.categorie,
    pu.photo_url
  FROM produits_user pu
  JOIN profiles pr ON pr.id = pu.user_id
  WHERE pr.public_slug = p_slug
    AND (pu.actif IS NULL OR pu.actif = true)
  ORDER BY pu.created_at;
$$;

-- Accès lecture anonyme (site client sans auth)
GRANT EXECUTE ON FUNCTION public.get_catalogue(text) TO anon;

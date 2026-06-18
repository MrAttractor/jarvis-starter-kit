-- Migration 0042 : boutique info dynamique (nom, couleur) + RPC get_boutique_info

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nom_boutique TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS brand_color  TEXT DEFAULT '#FF6B35';

CREATE OR REPLACE FUNCTION public.get_boutique_info(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_row record;
BEGIN
  SELECT prenom, nom_assistant, activite, zone, nom_boutique, brand_color
  INTO v_row
  FROM profiles
  WHERE public_slug = p_slug
  LIMIT 1;

  IF NOT FOUND THEN RETURN NULL; END IF;

  RETURN jsonb_build_object(
    'nom_boutique',   COALESCE(NULLIF(v_row.nom_boutique, ''), v_row.prenom, 'Ma Boutique'),
    'tagline',        COALESCE(v_row.activite, ''),
    'zone',           COALESCE(v_row.zone, ''),
    'nom_assistant',  COALESCE(NULLIF(v_row.nom_assistant, ''), 'Assists'),
    'brand_color',    COALESCE(NULLIF(v_row.brand_color, ''), '#FF6B35')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_boutique_info(text) TO anon;

-- ============================================================
-- Ayêla — Migration 08 : suivi de traitement du réappro + réponse de la CEO
-- Étapes : envoyee -> en_cours -> livre -> finalise. + message de la CEO.
-- ============================================================

ALTER TABLE public.ay_pos ADD COLUMN IF NOT EXISTS reappro_statut  text;   -- envoyee | en_cours | livre | finalise
ALTER TABLE public.ay_pos ADD COLUMN IF NOT EXISTS reappro_reponse text;   -- message de la CEO à la gérante

-- Demande gérante : ouvre une demande au statut 'envoyee', réinitialise la réponse
CREATE OR REPLACE FUNCTION public.ay_boutique_reappro(p_token text, p_val boolean, p_message text DEFAULT '')
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE ay_pos
     SET demande_reappro = p_val,
         reappro_message = CASE WHEN p_val THEN NULLIF(p_message,'') ELSE NULL END,
         reappro_statut  = CASE WHEN p_val THEN 'envoyee' ELSE NULL END,
         reappro_reponse = NULL,
         maj_gerante = now()
   WHERE token = p_token OR code = p_token;
  RETURN FOUND;
END; $$;

-- Lecture gérante : renvoie statut + réponse de la CEO (pour suivre les étapes)
CREATE OR REPLACE FUNCTION public.ay_boutique_data(p_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v ay_pos; res jsonb;
BEGIN
  SELECT * INTO v FROM ay_pos WHERE token = p_token OR code = p_token LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT jsonb_build_object(
    'nom', v.nom, 'zone', v.zone, 'contact_nom', v.contact_nom,
    'demande_reappro', v.demande_reappro, 'reappro_message', v.reappro_message,
    'reappro_statut', v.reappro_statut, 'reappro_reponse', v.reappro_reponse,
    'lignes', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', l.id, 'produit_nom', l.produit_nom, 'format', l.format,
        'depose', l.depose, 'vendu', l.vendu, 'prix_unitaire', l.prix_unitaire) ORDER BY l.produit_nom)
      FROM ay_pos_lignes l WHERE l.pos_id = v.id), '[]'::jsonb)
  ) INTO res;
  RETURN res;
END; $$;

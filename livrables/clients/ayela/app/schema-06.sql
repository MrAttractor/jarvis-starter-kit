-- ============================================================
-- Ayêla — Migration 06 : lien gérante court & propre (/b/CODE)
-- Chaque POS reçoit un code court (7 car.). Les fonctions acceptent
-- l'ancien token (32 car.) OU le nouveau code, pour compat totale.
-- ============================================================

ALTER TABLE public.ay_pos ADD COLUMN IF NOT EXISTS code text;
UPDATE public.ay_pos SET code = upper(substr(md5(random()::text || clock_timestamp()::text || id::text),1,7)) WHERE code IS NULL;
ALTER TABLE public.ay_pos ALTER COLUMN code SET DEFAULT upper(substr(md5(random()::text || clock_timestamp()::text),1,7));
CREATE UNIQUE INDEX IF NOT EXISTS ay_pos_code_idx ON public.ay_pos(code);

-- Lecture gérante (accepte token OU code)
CREATE OR REPLACE FUNCTION public.ay_boutique_data(p_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v ay_pos; res jsonb;
BEGIN
  SELECT * INTO v FROM ay_pos WHERE token = p_token OR code = p_token LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT jsonb_build_object(
    'nom', v.nom, 'zone', v.zone, 'contact_nom', v.contact_nom,
    'demande_reappro', v.demande_reappro,
    'lignes', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', l.id, 'produit_nom', l.produit_nom, 'format', l.format,
        'depose', l.depose, 'vendu', l.vendu, 'prix_unitaire', l.prix_unitaire) ORDER BY l.produit_nom)
      FROM ay_pos_lignes l WHERE l.pos_id = v.id), '[]'::jsonb)
  ) INTO res;
  RETURN res;
END; $$;

-- Saisie d'une vente (accepte token OU code) + journal + commission
CREATE OR REPLACE FUNCTION public.ay_boutique_vente(p_token text, p_ligne uuid, p_vendu int)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_pid uuid; v_line public.ay_pos_lignes; v_delta int; v_montant int; v_comm int;
BEGIN
  SELECT id INTO v_pid FROM ay_pos WHERE token = p_token OR code = p_token LIMIT 1;
  IF v_pid IS NULL THEN RETURN false; END IF;
  SELECT * INTO v_line FROM ay_pos_lignes WHERE id = p_ligne AND pos_id = v_pid;
  IF NOT FOUND THEN RETURN false; END IF;
  v_delta := GREATEST(0, p_vendu) - COALESCE(v_line.vendu, 0);
  UPDATE ay_pos_lignes SET vendu = GREATEST(0, p_vendu), updated_at = now() WHERE id = p_ligne;
  IF v_delta > 0 THEN
    v_montant := v_delta * COALESCE(v_line.prix_unitaire, 0);
    v_comm := CASE v_line.prime_type
                WHEN 'bouteille' THEN round(0.10 * v_montant)::int
                WHEN 'pocket'    THEN 200 * v_delta
                ELSE 0 END;
    INSERT INTO ay_ventes(pos_id, produit_nom, format, qte, prix_unitaire, montant, commission, date)
      VALUES (v_pid, v_line.produit_nom, v_line.format, v_delta, COALESCE(v_line.prix_unitaire,0), v_montant, v_comm, now());
  END IF;
  UPDATE ay_pos SET maj_gerante = now() WHERE id = v_pid;
  RETURN true;
END; $$;

-- Demande de réappro (accepte token OU code)
CREATE OR REPLACE FUNCTION public.ay_boutique_reappro(p_token text, p_val boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE ay_pos SET demande_reappro = p_val, maj_gerante = now() WHERE token = p_token OR code = p_token;
  RETURN FOUND;
END; $$;

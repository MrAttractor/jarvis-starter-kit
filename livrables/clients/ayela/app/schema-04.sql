-- ============================================================
-- Ayêla — Migration 04 : portail gérante de boutique (lien unique par POS)
-- Chaque POS a un token secret. La gérante ouvre boutique.html?p=<token>,
-- voit ce qui lui est déposé, saisit ses ventes, demande un réappro.
-- Accès limité à SON point via fonctions SECURITY DEFINER (RLS non exposée).
-- ============================================================

ALTER TABLE public.ay_pos ADD COLUMN IF NOT EXISTS token           text;
ALTER TABLE public.ay_pos ALTER COLUMN token SET DEFAULT replace(gen_random_uuid()::text,'-','');
ALTER TABLE public.ay_pos ADD COLUMN IF NOT EXISTS demande_reappro boolean DEFAULT false;
ALTER TABLE public.ay_pos ADD COLUMN IF NOT EXISTS maj_gerante     timestamptz;

-- Backfill des points existants
UPDATE public.ay_pos SET token = replace(gen_random_uuid()::text,'-','') WHERE token IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ay_pos_token_idx ON public.ay_pos(token);

-- ── Lecture par la gérante : renvoie SON point + ses lignes ──
CREATE OR REPLACE FUNCTION public.ay_boutique_data(p_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v ay_pos; res jsonb;
BEGIN
  SELECT * INTO v FROM ay_pos WHERE token = p_token LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT jsonb_build_object(
    'nom', v.nom, 'zone', v.zone, 'contact_nom', v.contact_nom,
    'demande_reappro', v.demande_reappro,
    'lignes', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', l.id, 'produit_nom', l.produit_nom, 'format', l.format,
        'depose', l.depose, 'vendu', l.vendu) ORDER BY l.produit_nom)
      FROM ay_pos_lignes l WHERE l.pos_id = v.id), '[]'::jsonb)
  ) INTO res;
  RETURN res;
END; $$;

-- ── Saisie d'une vente par la gérante (sur une ligne de SON point) ──
CREATE OR REPLACE FUNCTION public.ay_boutique_vente(p_token text, p_ligne uuid, p_vendu int)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_pid uuid;
BEGIN
  SELECT id INTO v_pid FROM ay_pos WHERE token = p_token LIMIT 1;
  IF v_pid IS NULL THEN RETURN false; END IF;
  UPDATE ay_pos_lignes SET vendu = GREATEST(0, p_vendu), updated_at = now()
    WHERE id = p_ligne AND pos_id = v_pid;
  IF NOT FOUND THEN RETURN false; END IF;
  UPDATE ay_pos SET maj_gerante = now() WHERE id = v_pid;
  RETURN true;
END; $$;

-- ── Demande de réapprovisionnement (drapeau vu par la gérante d'Ayêla) ──
CREATE OR REPLACE FUNCTION public.ay_boutique_reappro(p_token text, p_val boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE ay_pos SET demande_reappro = p_val, maj_gerante = now() WHERE token = p_token;
  RETURN FOUND;
END; $$;

GRANT EXECUTE ON FUNCTION public.ay_boutique_data(text)         TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ay_boutique_vente(text, uuid, int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ay_boutique_reappro(text, boolean) TO anon, authenticated;

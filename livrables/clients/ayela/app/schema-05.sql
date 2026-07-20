-- ============================================================
-- Ayêla — Migration 05 : journal de ventes horodaté + commission Petro Ivoire
-- Commission Petro Ivoire : 10% sur les bouteilles 500ml ; 200 FCFA / pocket 100ml.
-- ============================================================

-- Prix unitaire + type de prime sur chaque ligne de POS (pour calculer à la vente)
ALTER TABLE public.ay_pos_lignes ADD COLUMN IF NOT EXISTS prix_unitaire int DEFAULT 0;
ALTER TABLE public.ay_pos_lignes ADD COLUMN IF NOT EXISTS prime_type text DEFAULT 'autre'; -- bouteille | pocket | autre

-- Journal : une ligne = une vente (delta) enregistrée avec sa date
CREATE TABLE IF NOT EXISTS public.ay_ventes (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pos_id        uuid REFERENCES public.ay_pos(id) ON DELETE SET NULL,
  produit_nom   text,
  format        text,
  qte           int NOT NULL,
  prix_unitaire int DEFAULT 0,
  montant       int DEFAULT 0,
  commission    int DEFAULT 0,
  date          timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ay_ventes_date_idx ON public.ay_ventes(date);

ALTER TABLE public.ay_ventes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ay_ventes_admin_all ON public.ay_ventes;
CREATE POLICY ay_ventes_admin_all ON public.ay_ventes
  FOR ALL USING (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid)
          WITH CHECK (auth.uid() = '52992f9a-593f-4b03-b4c6-1e0981d36224'::uuid);

-- Saisie d'une vente par la gérante : met à jour le vendu ET journalise le delta + commission
CREATE OR REPLACE FUNCTION public.ay_boutique_vente(p_token text, p_ligne uuid, p_vendu int)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_pid uuid; v_line public.ay_pos_lignes; v_delta int; v_montant int; v_comm int;
BEGIN
  SELECT id INTO v_pid FROM ay_pos WHERE token = p_token LIMIT 1;
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

-- La lecture gérante renvoie aussi le prix unitaire (pour info)
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
        'depose', l.depose, 'vendu', l.vendu, 'prix_unitaire', l.prix_unitaire) ORDER BY l.produit_nom)
      FROM ay_pos_lignes l WHERE l.pos_id = v.id), '[]'::jsonb)
  ) INTO res;
  RETURN res;
END; $$;

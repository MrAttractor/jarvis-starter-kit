-- Migration 0041 : save_order — ajout champ adresse de livraison

CREATE OR REPLACE FUNCTION public.save_order(
  p_slug             text,
  p_client_name      text,
  p_client_wa        text,
  p_items            jsonb,
  p_total_fcfa       integer,
  p_delivery_address text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_id uuid;
  v_order_id uuid;
BEGIN
  SELECT id INTO v_owner_id FROM profiles WHERE public_slug = p_slug LIMIT 1;
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Boutique introuvable : %', p_slug;
  END IF;

  INSERT INTO orders (owner_id, slug, client_name, client_wa, items, total_fcfa, status, delivery_address)
  VALUES (v_owner_id, p_slug, p_client_name, p_client_wa, p_items, p_total_fcfa, 'new', p_delivery_address)
  RETURNING id INTO v_order_id;

  RETURN v_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_order(text, text, text, jsonb, integer, text) TO anon;

-- Migration 0044 : plan_tier + boutique_clients + save_order gate 20/mois + RPCs Fidelys

-- 1. Colonnes dans profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'gratuit',
  ADD COLUMN IF NOT EXISTS fidelys_reward_after INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS fidelys_reward_label TEXT DEFAULT 'Commande offerte';

-- Migrer plan_code existant vers plan_tier
UPDATE public.profiles SET plan_tier =
  CASE
    WHEN plan_code IN ('bras_droit','growth','growth_eu','team','manager','personnalise') THEN 'growth'
    WHEN plan_code = 'pro' THEN 'pro'
    ELSE 'gratuit'
  END
WHERE plan_tier IS NULL OR plan_tier = 'gratuit';

-- 2. Table boutique_clients (tracking auto depuis save_order)
CREATE TABLE IF NOT EXISTS public.boutique_clients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  slug            text NOT NULL,
  client_contact  text NOT NULL,
  client_name     text,
  commandes_count integer DEFAULT 1,
  last_order_at   timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now(),
  UNIQUE (owner_id, client_contact)
);

ALTER TABLE public.boutique_clients ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='boutique_clients' AND policyname='owner_all_boutique_clients'
  ) THEN
    CREATE POLICY "owner_all_boutique_clients"
      ON public.boutique_clients FOR ALL USING (auth.uid() = owner_id);
  END IF;
END $$;

-- 3. save_order : gate 20 commandes/mois (gratuit) + upsert boutique_clients
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
  v_owner_id    uuid;
  v_order_id    uuid;
  v_tier        text;
  v_month_count integer;
BEGIN
  SELECT id, COALESCE(plan_tier, 'gratuit')
    INTO v_owner_id, v_tier
  FROM public.profiles
  WHERE public_slug = p_slug
  LIMIT 1;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Boutique introuvable : %', p_slug;
  END IF;

  -- Gate 20 commandes/mois pour plan gratuit
  IF v_tier = 'gratuit' THEN
    SELECT COUNT(*)::integer INTO v_month_count
    FROM public.orders
    WHERE owner_id = v_owner_id
      AND date_trunc('month', created_at) = date_trunc('month', NOW());

    IF v_month_count >= 20 THEN
      RAISE EXCEPTION 'QUOTA_REACHED';
    END IF;
  END IF;

  INSERT INTO public.orders (owner_id, slug, client_name, client_wa, items, total_fcfa, status, delivery_address)
  VALUES (v_owner_id, p_slug, p_client_name, p_client_wa, p_items, p_total_fcfa, 'new', p_delivery_address)
  RETURNING id INTO v_order_id;

  -- Fidelys : enregistrer / incrémenter le client boutique
  IF p_client_wa IS NOT NULL AND p_client_wa <> '' THEN
    INSERT INTO public.boutique_clients (owner_id, slug, client_contact, client_name, commandes_count, last_order_at)
    VALUES (v_owner_id, p_slug, p_client_wa, p_client_name, 1, now())
    ON CONFLICT (owner_id, client_contact)
    DO UPDATE SET
      commandes_count = boutique_clients.commandes_count + 1,
      last_order_at   = now(),
      client_name     = COALESCE(EXCLUDED.client_name, boutique_clients.client_name);
  END IF;

  RETURN v_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_order(text, text, text, jsonb, integer, text) TO anon;

-- 4. get_fidelys_status : statut fidélité d'un client (lecture publique pour le mini-site)
--    Retourne NULL si le plan est gratuit (Fidelys non actif)
CREATE OR REPLACE FUNCTION public.get_fidelys_status(
  p_slug    text,
  p_contact text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_id     uuid;
  v_reward_after integer;
  v_reward_label text;
  v_tier         text;
  v_count        integer;
BEGIN
  SELECT id,
         COALESCE(fidelys_reward_after, 5),
         COALESCE(fidelys_reward_label, 'Commande offerte'),
         COALESCE(plan_tier, 'gratuit')
    INTO v_owner_id, v_reward_after, v_reward_label, v_tier
  FROM public.profiles
  WHERE public_slug = p_slug
  LIMIT 1;

  IF v_owner_id IS NULL OR v_tier = 'gratuit' THEN
    RETURN NULL;
  END IF;

  SELECT commandes_count INTO v_count
  FROM public.boutique_clients
  WHERE owner_id = v_owner_id AND client_contact = p_contact;

  IF v_count IS NULL THEN v_count := 0; END IF;

  RETURN jsonb_build_object(
    'commandes_count', v_count,
    'reward_after',    v_reward_after,
    'reward_label',    v_reward_label,
    'next_in',         GREATEST(0, v_reward_after - (v_count % v_reward_after)),
    'rewards_earned',  v_count / v_reward_after
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_fidelys_status(text, text) TO anon;

-- 5. get_monthly_order_count : pour l'app (afficher la jauge quota)
CREATE OR REPLACE FUNCTION public.get_monthly_order_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::integer
  FROM public.orders
  WHERE owner_id = auth.uid()
    AND date_trunc('month', created_at) = date_trunc('month', NOW());
$$;

GRANT EXECUTE ON FUNCTION public.get_monthly_order_count() TO authenticated;

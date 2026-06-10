-- Table des commandes reçues via le mini-site boutique client
CREATE TABLE IF NOT EXISTS public.orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         uuid REFERENCES auth.users NOT NULL,
  slug             text,
  client_name      text,
  client_wa        text,
  items            jsonb NOT NULL DEFAULT '[]',
  total_fcfa       integer,
  status           text NOT NULL DEFAULT 'new'
                   CHECK (status IN ('new','preparing','delivered','cancelled')),
  delivery_address text,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- L'entrepreneur voit et gère ses propres commandes
CREATE POLICY "owner_orders" ON public.orders
  FOR ALL USING (auth.uid() = owner_id);

-- Les clients non-authentifiés peuvent passer une commande
CREATE POLICY "public_insert" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Index pour les requêtes fréquentes (commandes en attente par owner)
CREATE INDEX IF NOT EXISTS orders_owner_status_idx ON public.orders (owner_id, status);
CREATE INDEX IF NOT EXISTS orders_slug_idx ON public.orders (slug);

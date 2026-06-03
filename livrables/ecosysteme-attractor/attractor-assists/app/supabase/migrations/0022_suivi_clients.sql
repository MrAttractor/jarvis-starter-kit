-- Migration 0022 : Suivi Clients — produits + historique achats

-- Produits/services déclarés par l'utilisateur
CREATE TABLE IF NOT EXISTS produits_user (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  nom         text NOT NULL,
  prix        decimal(10,2),
  unite       text DEFAULT 'unité',
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE produits_user ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own" ON produits_user;
CREATE POLICY "own" ON produits_user FOR ALL USING (auth.uid() = user_id);

-- Historique d'achats par client
CREATE TABLE IF NOT EXISTS client_purchases (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  contact_id  uuid REFERENCES carnet_affaires(id) ON DELETE CASCADE NOT NULL,
  produit_id  uuid REFERENCES produits_user(id) ON DELETE SET NULL,
  produit_nom text NOT NULL,
  date_achat  date NOT NULL DEFAULT CURRENT_DATE,
  montant     decimal(10,2),
  notes       text,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE client_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own" ON client_purchases;
CREATE POLICY "own" ON client_purchases FOR ALL USING (auth.uid() = user_id);

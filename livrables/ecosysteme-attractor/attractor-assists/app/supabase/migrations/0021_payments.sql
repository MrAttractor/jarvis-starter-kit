-- 0021_payments.sql
-- Suivi des paiements XPaye / PaiementPro

CREATE TABLE IF NOT EXISTS payments (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID    REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id     TEXT    NOT NULL,
  reference   TEXT    UNIQUE NOT NULL,
  channel     TEXT    NOT NULL,
  amount      INT     NOT NULL,
  currency    TEXT    NOT NULL DEFAULT 'XOF',
  status      TEXT    NOT NULL DEFAULT 'pending', -- pending | success | failed | cancelled
  gateway_response  JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

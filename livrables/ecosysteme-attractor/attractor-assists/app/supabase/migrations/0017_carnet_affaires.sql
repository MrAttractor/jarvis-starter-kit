-- Migration 0017 : Carnet d'affaires utilisateur (CRM léger)
-- Distinct du pipeline prospects admin (table `prospects`)
-- V1 : clients + prospects uniquement (commandes en V2)

CREATE TABLE IF NOT EXISTS carnet_affaires (
  id                   UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type                 TEXT        NOT NULL CHECK (type IN ('client', 'prospect')),
  nom                  TEXT        NOT NULL,
  contact              TEXT,
  notes                TEXT,
  statut               TEXT        NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'en_attente')),
  derniere_interaction TIMESTAMPTZ DEFAULT NOW(),
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE carnet_affaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_carnet" ON carnet_affaires
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS carnet_affaires_user_type_idx
  ON carnet_affaires (user_id, type);

CREATE INDEX IF NOT EXISTS carnet_affaires_user_interaction_idx
  ON carnet_affaires (user_id, derniere_interaction);

-- Migration 0019 : table prestataires (Marketplace)

CREATE TABLE IF NOT EXISTS prestataires (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom              TEXT NOT NULL,
  categorie        TEXT NOT NULL
    CHECK (categorie IN ('dev','design','marketing','finance','logistique','autre')),
  presentation     TEXT,
  specialite       TEXT,
  tarif_indicatif  TEXT,
  zone             TEXT CHECK (zone IN ('CI','EU','international','CI_EU')),
  whatsapp         TEXT NOT NULL,
  lien             TEXT,
  photo_url        TEXT,
  statut           TEXT NOT NULL DEFAULT 'en_attente'
    CHECK (statut IN ('en_attente','visible','suspendu')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Lecture publique des prestataires visibles uniquement
ALTER TABLE prestataires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prestataires_public_read"
  ON prestataires FOR SELECT
  USING (statut = 'visible');

-- N'importe qui peut s'inscrire (insert public)
CREATE POLICY "prestataires_public_insert"
  ON prestataires FOR INSERT
  WITH CHECK (true);

-- Seul un admin peut changer le statut
CREATE POLICY "prestataires_admin_update"
  ON prestataires FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

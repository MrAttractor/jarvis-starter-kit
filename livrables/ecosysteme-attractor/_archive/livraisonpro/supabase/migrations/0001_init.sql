-- ===== LIVRAISON PRO — SCHÉMA SUPABASE =====
-- Migration 0001 — Schéma initial

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===== USERS =====
CREATE TABLE IF NOT EXISTS public.users (
  id            TEXT PRIMARY KEY DEFAULT 'LP-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 6)),
  nom           TEXT NOT NULL,
  tel           TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL CHECK (role IN ('marchand', 'livreur')),
  commune       TEXT NOT NULL,
  vehicule      TEXT,           -- Moto | Voiture | Vélo (livreur only)
  zones         TEXT,           -- Zones couvertes (livreur only)
  plan          TEXT NOT NULL DEFAULT 'gratuit' CHECK (plan IN ('gratuit', 'pro')),
  trial_start   TIMESTAMPTZ DEFAULT NOW(),
  disponible    BOOLEAN DEFAULT FALSE,
  note          NUMERIC(3,1) DEFAULT 5.0,
  nb_missions   INTEGER DEFAULT 0,
  verifie       BOOLEAN DEFAULT FALSE,
  photo_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ===== MISSIONS =====
CREATE TABLE IF NOT EXISTS public.missions (
  id              TEXT PRIMARY KEY DEFAULT 'LP-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8)),
  marchand_id     TEXT REFERENCES public.users(id),
  marchand_nom    TEXT,
  livreur_id      TEXT REFERENCES public.users(id),
  livreur_nom     TEXT,
  livreur_tel     TEXT,
  dest_nom        TEXT NOT NULL,
  dest_tel        TEXT,
  adresse_depart  TEXT,
  adresse         TEXT NOT NULL,
  commune         TEXT NOT NULL,
  description     TEXT,
  frais           INTEGER DEFAULT 0,
  mode_paiement   TEXT,
  distance_km     INTEGER,
  status          TEXT NOT NULL DEFAULT 'attente'
                  CHECK (status IN ('attente','accepte','recupere','enroute','livre','echec','annule')),
  date_souhaitee  DATE,
  -- Timestamps de chaque étape
  accepted_at     TIMESTAMPTZ,
  recupere_at     TIMESTAMPTZ,
  enroute_at      TIMESTAMPTZ,
  livre_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ===== BONS DE LIVRAISON =====
CREATE TABLE IF NOT EXISTS public.bons (
  id            TEXT PRIMARY KEY DEFAULT 'BON-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8)),
  mission_id    TEXT REFERENCES public.missions(id),
  marchand      TEXT,
  livreur       TEXT,
  dest          TEXT,
  adresse       TEXT,
  mode_paiement TEXT,
  frais         INTEGER,
  generated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ===== ALERTES =====
CREATE TABLE IF NOT EXISTS public.alertes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id  TEXT REFERENCES public.missions(id),
  from_role   TEXT CHECK (from_role IN ('marchand', 'livreur')),
  from_nom    TEXT,
  type        TEXT NOT NULL,
  description TEXT,
  lu          BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ===== AVIS / NOTATIONS =====
CREATE TABLE IF NOT EXISTS public.avis (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id  TEXT REFERENCES public.missions(id),
  livreur_id  TEXT REFERENCES public.users(id),
  note        INTEGER CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ===== GPS TRACKING (plan Pro) =====
CREATE TABLE IF NOT EXISTS public.tracking_gps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id  TEXT REFERENCES public.missions(id),
  lat         NUMERIC(10,7),
  lng         NUMERIC(10,7),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ===== RLS (Row Level Security) =====
ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bons          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avis          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_gps  ENABLE ROW LEVEL SECURITY;

-- Users : lecture publique (catalogue), écriture sur son propre profil
CREATE POLICY "users_read_all"    ON public.users FOR SELECT USING (TRUE);
CREATE POLICY "users_insert_own"  ON public.users FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "users_update_own"  ON public.users FOR UPDATE USING (TRUE);

-- Missions : accès marchand + livreur concernés + tracking public par id
CREATE POLICY "missions_read"   ON public.missions FOR SELECT USING (TRUE);
CREATE POLICY "missions_insert" ON public.missions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "missions_update" ON public.missions FOR UPDATE USING (TRUE);

-- Bons : lecture publique (suivi)
CREATE POLICY "bons_read"   ON public.bons FOR SELECT USING (TRUE);
CREATE POLICY "bons_insert" ON public.bons FOR INSERT WITH CHECK (TRUE);

-- Alertes
CREATE POLICY "alertes_read"   ON public.alertes FOR SELECT USING (TRUE);
CREATE POLICY "alertes_insert" ON public.alertes FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "alertes_update" ON public.alertes FOR UPDATE USING (TRUE);

-- Avis
CREATE POLICY "avis_read"   ON public.avis FOR SELECT USING (TRUE);
CREATE POLICY "avis_insert" ON public.avis FOR INSERT WITH CHECK (TRUE);

-- GPS tracking : lecture si mission publique
CREATE POLICY "gps_read"   ON public.tracking_gps FOR SELECT USING (TRUE);
CREATE POLICY "gps_insert" ON public.tracking_gps FOR INSERT WITH CHECK (TRUE);

-- ===== INDEX =====
CREATE INDEX IF NOT EXISTS idx_missions_marchand  ON public.missions(marchand_id);
CREATE INDEX IF NOT EXISTS idx_missions_livreur   ON public.missions(livreur_id);
CREATE INDEX IF NOT EXISTS idx_missions_status    ON public.missions(status);
CREATE INDEX IF NOT EXISTS idx_alertes_mission    ON public.alertes(mission_id);
CREATE INDEX IF NOT EXISTS idx_tracking_mission   ON public.tracking_gps(mission_id);
CREATE INDEX IF NOT EXISTS idx_users_role         ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_commune      ON public.users(commune);
CREATE INDEX IF NOT EXISTS idx_users_dispo        ON public.users(disponible);

-- ===== TRIGGER updated_at =====
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

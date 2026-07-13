-- ===== LIVRAISON PRO — GREFFE SUR LE PROJET SUPABASE ATTRACTOR-ASSISTS =====
-- Migration 0002 — Le projet dédié jwucinmwrksqfrmkymds a été mis en pause
-- (limite 2 projets actifs gratuits atteinte). Décision du 08/07/2026 :
-- greffer Livraison Pro sur le projet partagé lgdgbrivnhgeupqhkckd (attractor-assists)
-- plutôt que payer un upgrade Supabase. Tables préfixées lp_ pour éviter
-- toute collision avec les tables existantes du projet partagé.

CREATE TABLE IF NOT EXISTS public.lp_users (
  id            TEXT PRIMARY KEY DEFAULT 'LP-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 6)),
  nom           TEXT NOT NULL,
  tel           TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL CHECK (role IN ('marchand', 'livreur')),
  commune       TEXT NOT NULL,
  vehicule      TEXT,
  zones         TEXT,
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

CREATE TABLE IF NOT EXISTS public.lp_missions (
  id              TEXT PRIMARY KEY DEFAULT 'LP-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8)),
  marchand_id     TEXT REFERENCES public.lp_users(id),
  marchand_nom    TEXT,
  livreur_id      TEXT REFERENCES public.lp_users(id),
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
  accepted_at     TIMESTAMPTZ,
  recupere_at     TIMESTAMPTZ,
  enroute_at      TIMESTAMPTZ,
  livre_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lp_bons (
  id            TEXT PRIMARY KEY DEFAULT 'BON-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8)),
  mission_id    TEXT REFERENCES public.lp_missions(id),
  marchand      TEXT,
  livreur       TEXT,
  dest          TEXT,
  adresse       TEXT,
  mode_paiement TEXT,
  frais         INTEGER,
  generated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lp_alertes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id  TEXT REFERENCES public.lp_missions(id),
  from_role   TEXT CHECK (from_role IN ('marchand', 'livreur')),
  from_nom    TEXT,
  type        TEXT NOT NULL,
  description TEXT,
  lu          BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lp_avis (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id  TEXT REFERENCES public.lp_missions(id),
  livreur_id  TEXT REFERENCES public.lp_users(id),
  note        INTEGER CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lp_tracking_gps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id  TEXT REFERENCES public.lp_missions(id),
  lat         NUMERIC(10,7),
  lng         NUMERIC(10,7),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lp_users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_missions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_bons          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_alertes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_avis          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_tracking_gps  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lp_users_read_all"    ON public.lp_users FOR SELECT USING (TRUE);
CREATE POLICY "lp_users_insert_own"  ON public.lp_users FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "lp_users_update_own"  ON public.lp_users FOR UPDATE USING (TRUE);

CREATE POLICY "lp_missions_read"   ON public.lp_missions FOR SELECT USING (TRUE);
CREATE POLICY "lp_missions_insert" ON public.lp_missions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "lp_missions_update" ON public.lp_missions FOR UPDATE USING (TRUE);

CREATE POLICY "lp_bons_read"   ON public.lp_bons FOR SELECT USING (TRUE);
CREATE POLICY "lp_bons_insert" ON public.lp_bons FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "lp_alertes_read"   ON public.lp_alertes FOR SELECT USING (TRUE);
CREATE POLICY "lp_alertes_insert" ON public.lp_alertes FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "lp_alertes_update" ON public.lp_alertes FOR UPDATE USING (TRUE);

CREATE POLICY "lp_avis_read"   ON public.lp_avis FOR SELECT USING (TRUE);
CREATE POLICY "lp_avis_insert" ON public.lp_avis FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "lp_gps_read"   ON public.lp_tracking_gps FOR SELECT USING (TRUE);
CREATE POLICY "lp_gps_insert" ON public.lp_tracking_gps FOR INSERT WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS idx_lp_missions_marchand  ON public.lp_missions(marchand_id);
CREATE INDEX IF NOT EXISTS idx_lp_missions_livreur   ON public.lp_missions(livreur_id);
CREATE INDEX IF NOT EXISTS idx_lp_missions_status    ON public.lp_missions(status);
CREATE INDEX IF NOT EXISTS idx_lp_alertes_mission    ON public.lp_alertes(mission_id);
CREATE INDEX IF NOT EXISTS idx_lp_tracking_mission   ON public.lp_tracking_gps(mission_id);
CREATE INDEX IF NOT EXISTS idx_lp_users_role         ON public.lp_users(role);
CREATE INDEX IF NOT EXISTS idx_lp_users_commune      ON public.lp_users(commune);
CREATE INDEX IF NOT EXISTS idx_lp_users_dispo        ON public.lp_users(disponible);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lp_users_updated_at ON public.lp_users;
CREATE TRIGGER trg_lp_users_updated_at
  BEFORE UPDATE ON public.lp_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_lp_missions_updated_at ON public.lp_missions;
CREATE TRIGGER trg_lp_missions_updated_at
  BEFORE UPDATE ON public.lp_missions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

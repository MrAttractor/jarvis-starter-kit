-- 0011_challenge.sql
-- Tables pour le challenge 7 jours et la séquence nurturing

CREATE TABLE IF NOT EXISTS challenge_leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom      TEXT NOT NULL,
  email       TEXT NOT NULL,
  utm_source  TEXT,
  ebook_sent_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT challenge_leads_email_unique UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS challenge_responses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id      UUID REFERENCES challenge_leads(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  jour         INT NOT NULL CHECK (jour BETWEEN 1 AND 7),
  data         JSONB DEFAULT '{}',
  email_sent_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT challenge_responses_unique UNIQUE (email, jour)
);

ALTER TABLE challenge_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_responses ENABLE ROW LEVEL SECURITY;

-- Pas d'accès public en lecture, uniquement via service_role (Edge Functions)

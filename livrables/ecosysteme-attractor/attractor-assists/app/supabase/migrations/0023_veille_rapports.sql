-- Migration 0023 : table veille_rapports
-- Stocke les rapports quotidiens de l'agent de veille (CCR remote)
-- Alimentée par l'Edge Function save-veille-rapport (no-verify-jwt)

CREATE TABLE IF NOT EXISTS public.veille_rapports (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  date_rapport  DATE        NOT NULL DEFAULT CURRENT_DATE,
  titre         TEXT        NOT NULL,
  piliers       JSONB       NOT NULL DEFAULT '[]',
  priorites     JSONB       NOT NULL DEFAULT '[]',
  signaux_faibles TEXT      DEFAULT '',
  contenu_complet TEXT      DEFAULT ''
);

ALTER TABLE public.veille_rapports ENABLE ROW LEVEL SECURITY;

-- Seul l'admin peut lire
CREATE POLICY "admin_select_veille" ON public.veille_rapports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- L'Edge Function (service role) peut insérer sans restriction
-- (service role bypasse RLS par défaut)

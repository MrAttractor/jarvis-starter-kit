-- Migration 0034 — Tables manquantes : notifications + devis_prospects
-- Identifiées lors de l'audit du 11/06/2026

-- ─── TABLE notifications ────────────────────────────────────────────────────
-- Référencée dans NotificationsScreen, ProfilScreen, AdminScreen, MacCockpitScreen
-- et dans les edge functions notify-auto, notify-update, activate-trial

CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titre       text NOT NULL,
  corps       text,
  type        text NOT NULL DEFAULT 'info',   -- 'info' | 'alerte' | 'action' | 'dmv' | 'trial'
  agent       text,                            -- agent émetteur (coach, awa, notify-auto…)
  lu          boolean NOT NULL DEFAULT false,
  action_url  text,                            -- route à ouvrir au tap (ex: 'commandes', 'fidelys')
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Supprime les policies existantes avant de les recréer (idempotent)
DROP POLICY IF EXISTS "notifications_select_own"  ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_service" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own"  ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_own"  ON public.notifications;

-- Chaque utilisateur ne voit que ses propres notifications
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Les edge functions (service role) peuvent insérer pour n'importe quel user
CREATE POLICY "notifications_insert_service"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- L'utilisateur peut marquer ses notifs comme lues
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- L'utilisateur peut supprimer ses notifs
CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Index pour récupérer rapidement les notifs non lues d'un user
CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON public.notifications (user_id, lu, created_at DESC);


-- ─── TABLE devis_prospects ───────────────────────────────────────────────────
-- Référencée dans generate-devis/index.ts, AdminScreen, MacCockpitScreen

CREATE TABLE IF NOT EXISTS public.devis_prospects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid REFERENCES public.prospects(id) ON DELETE SET NULL,
  user_id     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,  -- admin (Mac Arthur)
  numero      text UNIQUE,                     -- ex: ATR-2026-0007
  famille     text,                            -- 'A' | 'B' | 'C'
  niveau      text,                            -- ex: 'STARTER' | 'RUNNER' | 'ÉQUIPE'
  devise      text NOT NULL DEFAULT 'EUR',     -- 'EUR' | 'XOF'
  setup_ht    numeric(10,2),
  mrr         numeric(10,2),
  acompte     numeric(10,2),
  solde       numeric(10,2),
  total_m1    numeric(10,2),
  contenu     text,                            -- texte brut du devis généré par Claude
  statut      text NOT NULL DEFAULT 'brouillon', -- 'brouillon' | 'envoye' | 'valide' | 'refuse'
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.devis_prospects ENABLE ROW LEVEL SECURITY;

-- Seul l'admin (service role) peut tout faire sur les devis
CREATE POLICY "devis_service_all"
  ON public.devis_prospects FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS devis_prospects_prospect_idx
  ON public.devis_prospects (prospect_id);

CREATE INDEX IF NOT EXISTS devis_prospects_statut_idx
  ON public.devis_prospects (statut, created_at DESC);

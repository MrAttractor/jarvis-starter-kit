-- Migration 0036 — Corrections sécurité identifiées lors du security review (11/06/2026)

-- ─── Fix 1 : notifications INSERT — restreindre à l'utilisateur lui-même ────
-- Avant : WITH CHECK (true) → tout utilisateur authentifié pouvait insérer pour n'importe quel user_id
-- Après : seul le service role (edge functions) insère librement via bypass RLS
--         un utilisateur authentifié ne peut insérer que pour lui-même
DROP POLICY IF EXISTS "notifications_insert_service" ON public.notifications;

CREATE POLICY "notifications_insert_own"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note : les edge functions (service role key) bypassent RLS entièrement,
-- donc notify-auto / notify-update / activate-trial continuent de fonctionner sans changement.


-- ─── Fix 2 : devis_prospects — supprimer l'accès total aux utilisateurs ─────
-- Avant : USING(true) WITH CHECK(true) → tout utilisateur authentifié pouvait lire/modifier tous les devis
-- Après : aucun accès direct depuis le frontend via anon key
--         seules les edge functions (service role) accèdent à cette table
DROP POLICY IF EXISTS "devis_service_all" ON public.devis_prospects;

-- Aucune policy de remplacement pour les utilisateurs lambda.
-- generate-devis/index.ts, AdminScreen et MacCockpitScreen doivent passer par une edge function.

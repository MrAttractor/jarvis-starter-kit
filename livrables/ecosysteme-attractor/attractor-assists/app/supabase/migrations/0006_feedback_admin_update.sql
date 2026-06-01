-- 0006_feedback_admin_update.sql
-- Permet à l'admin de changer le statut d'un feedback (ex: 'nouveau' → 'traité')
create policy "feedback admin update" on public.feedback
  for update using (public.is_admin());

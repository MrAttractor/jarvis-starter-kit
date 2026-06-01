-- 0006_notifications_triggers.sql — Notifications automatiques
-- Trigger : notification de bienvenue à la fin de l'onboarding

create or replace function public.notify_welcome()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.onboarding_done = true and (old.onboarding_done is null or old.onboarding_done = false) then
    insert into public.notifications (user_id, type, titre, corps)
    values (
      new.id,
      'success',
      'Bienvenue dans l''équipe !',
      'Ton bras droit est prêt. Pose-lui ta première question — il est là maintenant.'
    );
  end if;
  return new;
end; $$;

create trigger on_onboarding_done
  after update on public.profiles
  for each row execute function public.notify_welcome();

-- Trigger : notification quand le quota journalier est presque atteint (géré côté app)
-- Les notifications streak et quota sont créées par Edge Function (notify-auto)

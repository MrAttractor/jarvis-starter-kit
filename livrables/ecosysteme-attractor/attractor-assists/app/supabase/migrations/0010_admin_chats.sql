-- 0010_admin_chats.sql — Chat direct admin (Mac Arthur) ↔ utilisateurs
-- L'admin envoie un message → notification créée côté user.
-- L'user répond → admin voit la réponse dans son tableau de pilotage.

create table if not exists public.admin_chats (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  sender      text not null check (sender in ('admin', 'user')),
  message     text not null,
  lu          boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.admin_chats enable row level security;

-- Admin : accès complet
create policy "admin_chats_admin_all" on public.admin_chats
  for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- User : voit ses propres messages
create policy "admin_chats_user_select" on public.admin_chats
  for select
  using (user_id = auth.uid());

-- User : peut insérer uniquement ses propres réponses
create policy "admin_chats_user_insert" on public.admin_chats
  for insert
  with check (user_id = auth.uid() and sender = 'user');

-- User : peut marquer ses messages comme lus (optionnel)
create policy "admin_chats_user_update" on public.admin_chats
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Index pour les requêtes fréquentes
create index if not exists admin_chats_user_id_idx
  on public.admin_chats(user_id, created_at desc);

create index if not exists admin_chats_unread_idx
  on public.admin_chats(sender, lu)
  where lu = false;

-- Realtime activé sur cette table (à activer dans le dashboard Supabase)
-- Table → admin_chats → Replication → Enable realtime

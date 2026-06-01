-- 0005_feedback.sql — Remontées utilisateurs (bugs + besoins)
-- RLS : l'utilisateur peut uniquement insérer ses propres remontées.
-- L'admin lit tout (via is_admin()).

create table public.feedback (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references public.profiles(id) on delete cascade,
  type       text        not null check (type in ('bug', 'besoin', 'autre')),
  message    text        not null,
  context    jsonb       not null default '{}',
  status     text        not null default 'nouveau',
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "feedback self insert" on public.feedback for insert with check (auth.uid() = user_id);
create policy "feedback admin read"  on public.feedback for select using (public.is_admin());

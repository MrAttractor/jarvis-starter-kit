-- 0009_methode_votes.sql — Votes utilisateurs pour les ebooks à venir
create table public.methode_votes (
  user_id  uuid not null references public.profiles(id) on delete cascade,
  book_id  text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

alter table public.methode_votes enable row level security;
create policy "votes self insert" on public.methode_votes for insert with check (auth.uid() = user_id);
create policy "votes public read" on public.methode_votes for select using (true);

-- 0027_veille.sql
-- Agent Veille & Prospection : tendances RSS + DMV générées par Claude

create table if not exists public.veille_tendances (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users on delete cascade,  -- null = veille globale
  secteur      text not null,
  titre        text not null,
  resume       text,
  url          text,
  source       text,
  published_at timestamptz,
  created_at   timestamptz default now()
);

create table if not exists public.dmv_queue (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade not null,
  jour       date not null default current_date,
  insight    text,
  message_wa text,
  contenu    text,
  question   text,
  secteur    text,
  delivered  boolean default false,
  created_at timestamptz default now(),
  unique(user_id, jour)
);

create table if not exists public.user_rss_config (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid references auth.users on delete cascade not null unique,
  secteurs text[] default '{}',
  actif    boolean default true,
  created_at timestamptz default now()
);

alter table public.veille_tendances enable row level security;
alter table public.dmv_queue        enable row level security;
alter table public.user_rss_config  enable row level security;

create policy "service_insert_veille" on public.veille_tendances for insert with check (true);
create policy "user_read_veille"      on public.veille_tendances for select using (user_id = auth.uid() or user_id is null);

create policy "owner_all_dmv"        on public.dmv_queue for all using (auth.uid() = user_id);
create policy "service_insert_dmv"   on public.dmv_queue for insert with check (true);
create policy "service_update_dmv"   on public.dmv_queue for update using (true);

create policy "owner_all_rss_config" on public.user_rss_config for all using (auth.uid() = user_id);

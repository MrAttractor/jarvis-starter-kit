-- 0026_fidelys.sql
-- Module Fidelys : fidélisation clients pour les entrepreneurs Attractor Assists

create table if not exists public.loyalty_programs (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users on delete cascade not null,
  business_name       text,
  points_per_purchase integer default 10,
  active              boolean default true,
  created_at          timestamptz default now()
);

create table if not exists public.loyalty_clients (
  id         uuid primary key default gen_random_uuid(),
  program_id uuid references public.loyalty_programs on delete cascade not null,
  user_id    uuid references auth.users on delete cascade not null,
  prenom     text not null,
  telephone  text,
  tag        text default 'nouveau' check (tag in ('nouveau', 'vip', 'inactif', 'anniversaire')),
  points     integer default 0,
  birthday   date,
  created_at timestamptz default now(),
  last_visit timestamptz default now()
);

create table if not exists public.loyalty_transactions (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references public.loyalty_clients on delete cascade not null,
  program_id  uuid references public.loyalty_programs not null,
  points      integer not null,
  description text,
  created_at  timestamptz default now()
);

create table if not exists public.loyalty_rewards (
  id              uuid primary key default gen_random_uuid(),
  program_id      uuid references public.loyalty_programs on delete cascade not null,
  name            text not null,
  points_required integer not null,
  active          boolean default true
);

-- RLS
alter table public.loyalty_programs    enable row level security;
alter table public.loyalty_clients     enable row level security;
alter table public.loyalty_transactions enable row level security;
alter table public.loyalty_rewards     enable row level security;

create policy "owner_all_programs"      on public.loyalty_programs    for all using (auth.uid() = user_id);
create policy "owner_all_clients"       on public.loyalty_clients     for all using (auth.uid() = user_id);
create policy "owner_all_transactions"  on public.loyalty_transactions for all using (
  program_id in (select id from public.loyalty_programs where user_id = auth.uid())
);
create policy "owner_all_rewards"       on public.loyalty_rewards     for all using (
  program_id in (select id from public.loyalty_programs where user_id = auth.uid())
);

-- Lecture publique pour le mini-site client
create policy "public_read_programs" on public.loyalty_programs for select using (active = true);
create policy "public_read_clients"  on public.loyalty_clients  for select using (true);
create policy "public_read_rewards"  on public.loyalty_rewards  for select using (active = true);

-- ============================================================
-- BEYNAUD ARMY — Incrément 2 : engagement (likes + commentaires) + photos
-- Sécurité : RLS activée, aucune policy publique. Accès via edge functions.
-- ============================================================

-- ── Likes sur les messages de Serge (1 like max par fan / message) ──
create table if not exists public.bey_reactions (
  message_id uuid not null references public.bey_messages(id) on delete cascade,
  membre_id  uuid not null references public.bey_membres(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (message_id, membre_id)
);
create index if not exists bey_react_msg_idx on public.bey_reactions(message_id);

-- ── Commentaires des fans (post-modération : visibles, Serge masque/supprime) ──
create table if not exists public.bey_commentaires (
  id         uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.bey_messages(id) on delete cascade,
  membre_id  uuid references public.bey_membres(id) on delete set null,
  prenom     text not null,
  contenu    text not null,
  masque     boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists bey_comm_msg_idx on public.bey_commentaires(message_id, created_at);

-- ── Galerie photos exclusives (upload par Serge) ──
create table if not exists public.bey_photos (
  id           uuid primary key default gen_random_uuid(),
  url          text not null,
  legende      text,
  grade_requis text not null default 'membre',
  actif        boolean not null default true,
  ordre        integer not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.bey_reactions    enable row level security;
alter table public.bey_commentaires enable row level security;
alter table public.bey_photos        enable row level security;

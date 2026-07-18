-- ============================================================
-- BEYNAUD ARMY — Socle Jalon 1 (projet Supabase partagé attractor-assists)
-- Modèle : adhésion GRATUITE + moteur ambassadeur + contenu exclusif gaté.
-- Sécurité : RLS activée, AUCUNE policy publique. Tout accès passe par des
-- edge functions en service_role. Admin (Serge) vérifié par UID dans la fonction.
-- Prefixe bey_ pour isoler du reste du projet partagé.
-- ============================================================

-- ── Membres (fans inscrits, gratuit) ────────────────────────
create table if not exists public.bey_membres (
  id                uuid primary key default gen_random_uuid(),
  prenom            text not null,
  whatsapp          text not null unique,
  lieu              text,
  code_ambassadeur  text not null unique,
  parraine_par      text,                       -- code_ambassadeur du parrain (null si direct)
  filleuls          integer not null default 0, -- nb de fans parrainés
  grade             text not null default 'membre', -- 'membre' | 'ambassadeur'
  push_subscription jsonb,                       -- abonnement web push (optionnel, V1.5)
  created_at        timestamptz not null default now()
);
create index if not exists bey_membres_parrain_idx on public.bey_membres(parraine_par);
create index if not exists bey_membres_created_idx on public.bey_membres(created_at desc);
create index if not exists bey_membres_lieu_idx    on public.bey_membres(lieu);

-- ── Contenus exclusifs (séries / vidéos gatées membres) ─────
create table if not exists public.bey_contenus (
  id           uuid primary key default gen_random_uuid(),
  titre        text not null,
  description  text,
  type         text not null default 'serie',   -- 'serie' | 'video'
  youtube_url  text not null,                    -- embed playlist ou vidéo
  cover_url    text,
  grade_requis text not null default 'membre',   -- 'membre' | 'ambassadeur'
  ordre        integer not null default 0,
  actif        boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ── Mur "Envoyer à mon armée" (diffusion in-app) ────────────
create table if not exists public.bey_messages (
  id         uuid primary key default gen_random_uuid(),
  contenu    text not null,
  created_at timestamptz not null default now()
);

-- ── RLS : activée, aucune policy = tout bloqué sauf service_role ──
alter table public.bey_membres  enable row level security;
alter table public.bey_contenus enable row level security;
alter table public.bey_messages enable row level security;

-- ── Seed : les 2 séries YouTube fournies ────────────────────
insert into public.bey_contenus (titre, description, type, youtube_url, grade_requis, ordre, actif)
values
  ('Série exclusive 1', 'Série à suivre en exclusivité dans l''app.', 'serie',
   'https://www.youtube.com/embed/lU4_kmReLEs?list=PL2ckpDGUCdKBwxekHannSaR0JCOPhCkOn', 'membre', 1, true),
  ('Série exclusive 2', 'Deuxième série exclusive.', 'serie',
   'https://www.youtube.com/embed/n6qOMTZRnXU?list=PL2ckpDGUCdKDK6DSb1rZ6ni_oFOIlCo4D', 'membre', 2, true)
on conflict do nothing;

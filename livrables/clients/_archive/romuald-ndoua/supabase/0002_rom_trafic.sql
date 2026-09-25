-- ============================================================
-- Romuald Ndoua / ML Ads — mesure du trafic et des conversations
-- Projet Supabase partagé lgdgbrivnhgeupqhkckd, tables préfixées rom_
--
-- Pourquoi : au 02/08/2026, rom_leads est vide et rien d'autre n'est
-- enregistré. Impossible de dire si une campagne publicitaire a amené
-- du monde ou pas : seule une conversation qui va jusqu'au numéro
-- WhatsApp laissait une trace. Cette table trace l'entonnoir complet,
-- visite -> ouverture du chat -> messages -> lead.
-- ============================================================

-- ── Une ligne par visiteur (identifié par un id aléatoire local) ──
create table if not exists public.rom_conversations (
  id             uuid primary key default gen_random_uuid(),
  session_id     text not null unique,   -- id aléatoire généré côté navigateur, aucune donnée personnelle
  source         text,                   -- 'meta-ads', 'utm', 'referent', 'direct'
  source_detail  text,                   -- campagne utm, domaine référent, présence d'un fbclid
  page           text,                   -- chemin d'arrivée (?src=... conservé)
  chat_ouvert    boolean not null default false,
  nb_messages    int     not null default 0,   -- messages écrits par la personne
  premier_message text,                  -- ce qu'elle demande en arrivant (tronqué)
  dernier_message text,                  -- là où elle s'arrête (tronqué)
  lead_capte     boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists rom_conversations_created_idx
  on public.rom_conversations (created_at desc);

alter table public.rom_conversations enable row level security;

-- Écriture réservée à l'edge function (service_role, qui contourne RLS).
-- Aucune policy INSERT ni UPDATE publique : le navigateur n'écrit jamais en direct.
-- Lecture réservée au compte de Romuald, comme rom_leads.
drop policy if exists "rom admin conversations select" on public.rom_conversations;
create policy "rom admin conversations select"
  on public.rom_conversations
  for select
  using (auth.uid() = 'f0eb5c96-893f-4122-876f-f767a332cd28'::uuid);

-- ── Rattacher un lead à sa conversation (donc à sa source) ──
alter table public.rom_leads add column if not exists session_id text;

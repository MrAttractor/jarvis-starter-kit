-- ============================================================
-- Signature Attractor — signature électronique simple (SES)
-- au sens de l'art. 1367 du Code civil et de l'art. 25 eIDAS.
--
-- Principe de preuve : identification du signataire par code à
-- usage unique envoyé sur son email, scellement du document par
-- empreinte SHA-256, et journal d'événements horodaté immuable.
--
-- Sécurité : RLS activée SANS AUCUNE policy publique.
-- Tout passe par les edge functions sign-* en service role.
-- Aucune donnée n'est lisible avec la clé anon.
-- ============================================================

-- ── Dossier de signature (un envoi = un dossier = N documents) ──
create table if not exists public.sig_dossiers (
  id           uuid primary key default gen_random_uuid(),
  reference    text,                                   -- ex. ATR-2026-0005
  titre        text not null,                          -- ex. "Package contractuel Club Élévia"
  client       text,                                   -- ex. "Club privé Élévia"
  message      text,                                   -- mot d'accompagnement affiché au signataire
  statut       text not null default 'en_attente',     -- en_attente | signe | refuse | expire
  expire_at    timestamptz not null default (now() + interval '30 days'),
  created_at   timestamptz not null default now(),
  signed_at    timestamptz
);

-- ── Documents du dossier (scellés par leur empreinte) ──
create table if not exists public.sig_documents (
  id           uuid primary key default gen_random_uuid(),
  dossier_id   uuid not null references public.sig_dossiers(id) on delete cascade,
  nom          text not null,                          -- ex. "Devis V5"
  reference    text,                                   -- ex. ATR-2026-0005-V5
  url          text not null,                          -- URL publique du document à lire
  contenu_hash text,                                   -- SHA-256 du contenu au moment du scellement
  taille       integer,
  ordre        integer not null default 1,
  created_at   timestamptz not null default now()
);

-- ── Signataires (chacun a son lien secret) ──
create table if not exists public.sig_signataires (
  id              uuid primary key default gen_random_uuid(),
  dossier_id      uuid not null references public.sig_dossiers(id) on delete cascade,
  nom             text not null,
  email           text not null,
  qualite         text,                                -- ex. "Porteuse du projet"
  role            text not null default 'client',      -- client | prestataire
  ordre           integer not null default 1,
  token           text not null unique,                -- secret du lien de signature
  statut          text not null default 'en_attente',  -- en_attente | ouvert | signe | refuse
  -- Éléments de l'acte de signature
  signature_nom   text,                                -- nom saisi de sa main
  signature_trace text,                                -- tracé manuscrit (PNG en dataURL)
  consentement    boolean not null default false,
  -- Éléments de preuve
  signed_at       timestamptz,
  signed_ip       text,
  signed_ua       text,
  preuve_hash     text,                                -- empreinte scellant l'ensemble de l'acte
  motif_refus     text,
  created_at      timestamptz not null default now()
);

-- ── Codes à usage unique (jamais stockés en clair) ──
create table if not exists public.sig_otp (
  id             uuid primary key default gen_random_uuid(),
  signataire_id  uuid not null references public.sig_signataires(id) on delete cascade,
  code_hash      text not null,                        -- SHA-256 du code, jamais le code
  expires_at     timestamptz not null,
  tentatives     integer not null default 0,
  used_at        timestamptz,
  created_at     timestamptz not null default now()
);

-- ── Journal de preuve (append only, jamais modifié ni supprimé) ──
create table if not exists public.sig_evenements (
  id             uuid primary key default gen_random_uuid(),
  dossier_id     uuid references public.sig_dossiers(id) on delete cascade,
  signataire_id  uuid references public.sig_signataires(id) on delete cascade,
  type           text not null,                        -- cree | envoye | ouvert | document_consulte
                                                       -- code_envoye | code_errone | code_valide
                                                       -- signe | refuse | copie_transmise
  ip             text,
  user_agent     text,
  meta           jsonb,
  created_at     timestamptz not null default now()
);

create index if not exists sig_documents_dossier_idx    on public.sig_documents(dossier_id);
create index if not exists sig_signataires_dossier_idx  on public.sig_signataires(dossier_id);
create index if not exists sig_signataires_token_idx    on public.sig_signataires(token);
create index if not exists sig_otp_signataire_idx       on public.sig_otp(signataire_id);
create index if not exists sig_evenements_dossier_idx   on public.sig_evenements(dossier_id, created_at);

-- ── RLS : aucune policy = aucun accès anon. Service role uniquement. ──
alter table public.sig_dossiers    enable row level security;
alter table public.sig_documents   enable row level security;
alter table public.sig_signataires enable row level security;
alter table public.sig_otp         enable row level security;
alter table public.sig_evenements  enable row level security;

-- ── Garde-fou : le journal de preuve ne peut être ni modifié ni supprimé,
--    même par le service role. C'est ce qui lui donne sa valeur probante. ──
create or replace function public.sig_evenements_immuable()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Le journal de preuve Signature Attractor est immuable (append only).';
end;
$$;

drop trigger if exists sig_evenements_no_update on public.sig_evenements;
create trigger sig_evenements_no_update
  before update or delete on public.sig_evenements
  for each row execute function public.sig_evenements_immuable();

-- ── Garde-fou : une signature apposée ne peut plus être retouchée. ──
create or replace function public.sig_signature_scellee()
returns trigger
language plpgsql
as $$
begin
  if old.signed_at is not null and old.statut = 'signe' then
    raise exception 'Signature déjà apposée le % : acte scellé, modification refusée.', old.signed_at;
  end if;
  return new;
end;
$$;

drop trigger if exists sig_signataires_scelle on public.sig_signataires;
create trigger sig_signataires_scelle
  before update on public.sig_signataires
  for each row execute function public.sig_signature_scellee();

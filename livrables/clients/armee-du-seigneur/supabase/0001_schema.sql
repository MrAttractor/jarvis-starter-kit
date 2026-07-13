-- =====================================================================
-- Mission L'Armee du Seigneur - Phase 1a (Vitrine)
-- Projet Supabase PARTAGE (lgdgbrivnhgeupqhkckd) - tables prefixees als_
-- Securite multi-tenant : admin gate sur auth.uid() = UUID de la Mission
-- UUID admin Mission : e9b37342-9fbd-4af3-80cc-e27ee767b221
-- =====================================================================

-- ---------- DIRIGEANTS ----------
create table if not exists public.als_dirigeants (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  role text,
  lieu text,
  photo_url text,
  bio text,
  mission text,
  messages text,
  ordre int default 0,
  cree_le timestamptz default now()
);

-- ---------- DEPARTEMENTS ----------
create table if not exists public.als_departements (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  mission text,
  description text,
  responsable text,
  photo_url text,
  ordre int default 0,
  actif boolean default true,
  cree_le timestamptz default now()
);

-- ---------- ACTUALITES ----------
create table if not exists public.als_actualites (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  image_url text,
  contenu text,
  categorie text,
  auteur text,
  date_pub date default current_date,
  publie boolean default true,
  cree_le timestamptz default now()
);

-- ---------- ALBUMS (galerie) ----------
create table if not exists public.als_albums (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  annee int,
  evenement text,
  departement text,
  couverture_url text,
  ordre int default 0,
  cree_le timestamptz default now()
);

-- ---------- MEDIAS (photos / videos d'un album) ----------
create table if not exists public.als_medias (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references public.als_albums(id) on delete cascade,
  type text default 'photo',            -- 'photo' | 'video'
  url text not null,                    -- url image OU id/embed youtube
  legende text,
  ordre int default 0,
  cree_le timestamptz default now()
);

-- ---------- EVENEMENTS ----------
create table if not exists public.als_evenements (
  id uuid primary key default gen_random_uuid(),
  type text,                            -- culte | conference | croisade | retraite | campagne
  titre text not null,
  banniere_url text,
  description text,
  date_event date,
  heure text,
  lieu text,
  album_id uuid references public.als_albums(id) on delete set null,
  publie boolean default true,
  cree_le timestamptz default now()
);

-- ---------- TEMOIGNAGES ----------
create table if not exists public.als_temoignages (
  id uuid primary key default gen_random_uuid(),
  type text,                            -- miracle | conversion | guerison | transformation
  texte text not null,
  auteur text,
  photo_url text,
  video_url text,
  publie boolean default true,
  cree_le timestamptz default now()
);

-- ---------- CONTACT (boite de reception du formulaire) ----------
create table if not exists public.als_contact (
  id uuid primary key default gen_random_uuid(),
  nom text,
  pays text,
  coordonnee text,                      -- email ou whatsapp
  message text,
  cree_le timestamptz default now()
);

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.als_dirigeants   enable row level security;
alter table public.als_departements enable row level security;
alter table public.als_actualites   enable row level security;
alter table public.als_albums        enable row level security;
alter table public.als_medias        enable row level security;
alter table public.als_evenements    enable row level security;
alter table public.als_temoignages   enable row level security;
alter table public.als_contact        enable row level security;

-- Helper : condition admin
--   auth.uid() = 'e9b37342-9fbd-4af3-80cc-e27ee767b221'

-- ----- LECTURE PUBLIQUE (contenu destine au site) -----
drop policy if exists als_dirigeants_read on public.als_dirigeants;
create policy als_dirigeants_read on public.als_dirigeants for select using (true);

drop policy if exists als_departements_read on public.als_departements;
create policy als_departements_read on public.als_departements for select using (actif = true);

drop policy if exists als_albums_read on public.als_albums;
create policy als_albums_read on public.als_albums for select using (true);

drop policy if exists als_medias_read on public.als_medias;
create policy als_medias_read on public.als_medias for select using (true);

drop policy if exists als_actualites_read on public.als_actualites;
create policy als_actualites_read on public.als_actualites for select using (publie = true);

drop policy if exists als_evenements_read on public.als_evenements;
create policy als_evenements_read on public.als_evenements for select using (publie = true);

drop policy if exists als_temoignages_read on public.als_temoignages;
create policy als_temoignages_read on public.als_temoignages for select using (publie = true);

-- ----- CONTACT : insertion publique, jamais de lecture publique -----
drop policy if exists als_contact_insert on public.als_contact;
create policy als_contact_insert on public.als_contact for insert with check (true);

-- ----- ADMIN (Mission uniquement) : tout sur toutes les tables -----
do $$
declare t text;
begin
  foreach t in array array[
    'als_dirigeants','als_departements','als_actualites','als_albums',
    'als_medias','als_evenements','als_temoignages','als_contact'
  ] loop
    execute format('drop policy if exists %I_admin on public.%I;', t, t);
    execute format(
      'create policy %I_admin on public.%I for all to authenticated '
      || 'using (auth.uid() = ''e9b37342-9fbd-4af3-80cc-e27ee767b221''::uuid) '
      || 'with check (auth.uid() = ''e9b37342-9fbd-4af3-80cc-e27ee767b221''::uuid);',
      t, t);
  end loop;
end $$;

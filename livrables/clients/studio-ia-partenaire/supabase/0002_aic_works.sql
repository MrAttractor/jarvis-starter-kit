-- Agence Innovation Créative — Portfolio piloté par Emmanuel Yao (autonomie).
-- Projet Supabase partagé attractor-assists. Écriture scopée à l'UID d'Emmanuel.
-- Lecture publique (le site vitrine lit cette table via l'anon key en fetch REST).

create table if not exists public.aic_works (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null default 'video',          -- 'video' | 'image'
  title text not null,
  media_url text not null,                      -- vidéo : lien (.mp4, YouTube, Vimeo) · image : URL de l'image
  poster_url text,                              -- vidéo : image d'aperçu (facultatif)
  featured boolean not null default false,      -- mis en vedette sur la page d'accueil
  sort integer not null default 0,              -- ordre d'affichage (croissant)
  active boolean not null default true          -- décocher = masqué du site sans supprimer
);

alter table public.aic_works enable row level security;

-- Lecture : tout le monde voit les réalisations actives (site public).
drop policy if exists aic_works_public_select on public.aic_works;
create policy aic_works_public_select on public.aic_works for select
  using (active = true);

-- Emmanuel voit TOUTES ses réalisations (y compris masquées) dans son admin.
drop policy if exists aic_works_owner_select on public.aic_works;
create policy aic_works_owner_select on public.aic_works for select
  using (auth.uid() = 'b1635d9d-e970-4293-9674-871cde1e639a');

-- Écriture réservée à Emmanuel.
drop policy if exists aic_works_owner_insert on public.aic_works;
create policy aic_works_owner_insert on public.aic_works for insert
  with check (auth.uid() = 'b1635d9d-e970-4293-9674-871cde1e639a');

drop policy if exists aic_works_owner_update on public.aic_works;
create policy aic_works_owner_update on public.aic_works for update
  using (auth.uid() = 'b1635d9d-e970-4293-9674-871cde1e639a')
  with check (auth.uid() = 'b1635d9d-e970-4293-9674-871cde1e639a');

drop policy if exists aic_works_owner_delete on public.aic_works;
create policy aic_works_owner_delete on public.aic_works for delete
  using (auth.uid() = 'b1635d9d-e970-4293-9674-871cde1e639a');

create index if not exists aic_works_order_idx on public.aic_works (sort asc, created_at desc);

-- ---------------------------------------------------------------------------
-- Bucket de stockage pour les images / aperçus uploadés depuis l'admin.
insert into storage.buckets (id, name, public)
values ('aic-media', 'aic-media', true)
on conflict (id) do nothing;

drop policy if exists aic_media_public_read on storage.objects;
create policy aic_media_public_read on storage.objects for select
  using (bucket_id = 'aic-media');

drop policy if exists aic_media_owner_insert on storage.objects;
create policy aic_media_owner_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'aic-media' and auth.uid() = 'b1635d9d-e970-4293-9674-871cde1e639a');

drop policy if exists aic_media_owner_delete on storage.objects;
create policy aic_media_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'aic-media' and auth.uid() = 'b1635d9d-e970-4293-9674-871cde1e639a');

-- ---------------------------------------------------------------------------
-- Seed : les 18 réalisations existantes (chemins d'assets relatifs, servis par Cloudflare Pages).
-- Ne réinsère pas si la table contient déjà des lignes.
insert into public.aic_works (type, title, media_url, poster_url, featured, sort)
select * from (values
  ('video','KFC · Avatar IA',            'assets/video/portfolio/kfc.mp4',    'assets/video/portfolio/kfc.jpg',    true,  1),
  ('video','NASCO · World Cup',          'assets/video/portfolio/nasco.mp4',  'assets/video/portfolio/nasco.jpg',  true,  2),
  ('video','Oraimo · Spot IA',           'assets/video/portfolio/oraimo.mp4', 'assets/video/portfolio/oraimo.jpg', true,  3),
  ('video','Youki Moka · Café',          'assets/video/portfolio/youki.mp4',  'assets/video/portfolio/youki.jpg',  true,  4),
  ('video','FIFA · World Cup',           'assets/video/portfolio/fifa.mp4',   'assets/video/portfolio/fifa.jpg',   false, 5),
  ('video','SNA · Campagne',             'assets/video/portfolio/sna.mp4',    'assets/video/portfolio/sna.jpg',    false, 6),
  ('video','Réflexe · Spot IA',          'assets/video/portfolio/reflexe.mp4','assets/video/portfolio/reflexe.jpg',false, 7),
  ('video','Didier · Film IA',           'assets/video/portfolio/didier.mp4', 'assets/video/portfolio/didier.jpg', false, 8),
  ('image','Portrait ultra-réaliste',    'assets/img/portfolio/p01.jpg',      null, true,  9),
  ('image','Beauté IA',                  'assets/img/portfolio/p08.jpg',      null, true,  10),
  ('image','Direction artistique',       'assets/img/portfolio/p02.jpg',      null, false, 11),
  ('image','Personnalité',               'assets/img/portfolio/p03.jpg',      null, false, 12),
  ('image','Portrait éditorial',         'assets/img/portfolio/p04.jpg',      null, false, 13),
  ('image','Studio portrait',            'assets/img/portfolio/p05.jpg',      null, false, 14),
  ('image','Campagne de marque',         'assets/img/portfolio/p06.jpg',      null, false, 15),
  ('image','Portrait iconique',          'assets/img/portfolio/p07.jpg',      null, false, 16),
  ('image','Lumière & matière',          'assets/img/portfolio/p09.jpg',      null, false, 17),
  ('image','Scène cinématique',          'assets/img/portfolio/p10.jpg',      null, false, 18)
) as v(type,title,media_url,poster_url,featured,sort)
where not exists (select 1 from public.aic_works);

-- ============================================================================
-- Vies Croisées — 0004 (25/07/2026)
--
-- Demandes d'Andréa :
--   1. Plusieurs teasers par épisode (il n'y avait qu'un seul champ).
--   2. Un emplacement pour les logos des partenaires (n'existait pas).
--   3. Une vraie programmation, pour les épisodes ET pour le blog.
--      ATTENTION : le statut « programme » existant n'était qu'une étiquette,
--      aucune date n'était stockée, donc rien ne se publiait tout seul.
--   4. Un visuel d'épisode + une photo avec l'invité.
--   5. Partage des articles sur Facebook / WhatsApp (adresse propre par
--      contenu, donc une colonne `slug`).
--
-- Règle de programmation retenue (aucun automate, aucun cron) :
--   la date est lue par la sécurité de la base. Tant que l'heure n'est pas
--   passée, la ligne n'est pas lisible publiquement, même en interrogeant
--   l'API directement avec la clé publique.
--
-- Non régression : les 4 épisodes actuels sont en « programme » SANS date et
--   sont visibles aujourd'hui. Ils doivent rester visibles, d'où le
--   `publie_le is null` toléré côté épisodes.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ÉPISODES — teasers multiples, visuels, date de mise en ligne
-- ----------------------------------------------------------------------------
alter table vc_episodes
  add column if not exists teasers          jsonb       default '[]'::jsonb,
  add column if not exists image_url        text        default '',
  add column if not exists photo_invite_url text        default '',
  add column if not exists publie_le        timestamptz,
  add column if not exists slug             text;

-- Reprise du teaser unique existant dans la nouvelle liste (aucune perte).
update vc_episodes
   set teasers = jsonb_build_array(
         jsonb_build_object(
           'titre', 'Teaser',
           'url',   youtube_teaser,
           'duree', coalesce(duree_teaser, '')))
 where coalesce(youtube_teaser, '') <> ''
   and (teasers is null or teasers = '[]'::jsonb);

-- youtube_teaser / duree_teaser restent en place mais ne sont plus lus par le
-- site : on ne supprime rien tant que la nouvelle liste n'a pas vécu.

-- ----------------------------------------------------------------------------
-- 2. ARTICLES — programmation + visuel
-- ----------------------------------------------------------------------------
alter table vc_articles
  add column if not exists publie_le  timestamptz,
  add column if not exists image_url  text default '',
  add column if not exists slug       text;

-- La contrainte interdisait le statut « programme » sur les articles.
alter table vc_articles drop constraint if exists vc_articles_statut_check;
alter table vc_articles
  add constraint vc_articles_statut_check
  check (statut in ('publie', 'programme', 'brouillon'));

-- ----------------------------------------------------------------------------
-- 3. ADRESSE PROPRE PAR CONTENU (slug) — pour partager un article précis
--    Le slug est généré une seule fois puis ne bouge plus : un lien déjà
--    partagé sur Facebook ne doit pas casser parce qu'un titre a été corrigé.
-- ----------------------------------------------------------------------------
create or replace function vc_slugify(t text) returns text
language sql immutable as $$
  select trim(both '-' from left(
    trim(both '-' from regexp_replace(
      lower(translate(coalesce(t, ''),
        'àâäáãåÀÂÄÁÃÅçÇéèêëÉÈÊËíìîïÍÌÎÏñÑóòôöõÓÒÔÖÕúùûüÚÙÛÜýÿÝ',
        'aaaaaaaaaaaacceeeeeeeeiiiiiiiinnooooooooooouuuuuuuuyyy')),
      '[^a-z0-9]+', '-', 'g')),
    60));
$$;

create or replace function vc_set_slug() returns trigger
language plpgsql as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := coalesce(nullif(vc_slugify(new.titre), ''), 'contenu')
                || '-' || left(new.id::text, 4);
  end if;
  return new;
end $$;

drop trigger if exists vc_ep_slug  on vc_episodes;
drop trigger if exists vc_art_slug on vc_articles;
create trigger vc_ep_slug  before insert or update on vc_episodes for each row execute function vc_set_slug();
create trigger vc_art_slug before insert or update on vc_articles for each row execute function vc_set_slug();

-- Remplissage des contenus déjà en base
update vc_episodes set slug = vc_slugify(titre) || '-' || left(id::text, 4) where coalesce(slug, '') = '';
update vc_articles set slug = vc_slugify(titre) || '-' || left(id::text, 4) where coalesce(slug, '') = '';

create unique index if not exists vc_episodes_slug_idx on vc_episodes(slug);
create unique index if not exists vc_articles_slug_idx on vc_articles(slug);

-- ----------------------------------------------------------------------------
-- 4. PARTENAIRES — logos, non cliquables (demande explicite)
-- ----------------------------------------------------------------------------
create table if not exists vc_partenaires (
  id         uuid default gen_random_uuid() primary key,
  nom        text not null,
  logo_url   text not null,
  ordre      int  default 0,
  actif      boolean default true,
  created_at timestamptz default now()
);

alter table vc_partenaires enable row level security;

drop policy if exists vc_part_public_read on vc_partenaires;
drop policy if exists vc_part_admin       on vc_partenaires;

create policy vc_part_public_read on vc_partenaires
  for select using (actif = true);

create policy vc_part_admin on vc_partenaires
  for all using (auth.uid() = '22fcae86-0576-4bd8-b615-5df9e9458daa'::uuid)
          with check (auth.uid() = '22fcae86-0576-4bd8-b615-5df9e9458daa'::uuid);

-- Les 2 logos fournis sont servis en fichiers du site (pas d'upload requis).
insert into vc_partenaires (nom, logo_url, ordre)
select '#1 Dans mon couloir', 'partenaires/1-dans-mon-couloir.png', 1
 where not exists (select 1 from vc_partenaires where nom = '#1 Dans mon couloir');
insert into vc_partenaires (nom, logo_url, ordre)
select 'OMEDIA', 'partenaires/omedia.png', 2
 where not exists (select 1 from vc_partenaires where nom = 'OMEDIA');

-- ----------------------------------------------------------------------------
-- 5. STOCKAGE DES IMAGES — visuels d'épisodes, photos d'invités, logos ajoutés
--    par Andréa. Lecture publique (ce sont des images de site), dépôt et
--    suppression réservés à son compte.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('vc-medias', 'vc-medias', true)
on conflict (id) do nothing;

drop policy if exists vc_medias_public_read on storage.objects;
drop policy if exists vc_medias_admin_write on storage.objects;
drop policy if exists vc_medias_admin_upd   on storage.objects;
drop policy if exists vc_medias_admin_del   on storage.objects;

create policy vc_medias_public_read on storage.objects
  for select using (bucket_id = 'vc-medias');

create policy vc_medias_admin_write on storage.objects
  for insert with check (bucket_id = 'vc-medias'
    and auth.uid() = '22fcae86-0576-4bd8-b615-5df9e9458daa'::uuid);

create policy vc_medias_admin_upd on storage.objects
  for update using (bucket_id = 'vc-medias'
    and auth.uid() = '22fcae86-0576-4bd8-b615-5df9e9458daa'::uuid);

create policy vc_medias_admin_del on storage.objects
  for delete using (bucket_id = 'vc-medias'
    and auth.uid() = '22fcae86-0576-4bd8-b615-5df9e9458daa'::uuid);

-- ----------------------------------------------------------------------------
-- 6. LA PROGRAMMATION DEVIENT RÉELLE (lecture publique conditionnée à l'heure)
-- ----------------------------------------------------------------------------
drop policy if exists vc_ep_public_read  on vc_episodes;
drop policy if exists vc_art_public_read on vc_articles;

-- Épisodes : publié = visible ; programmé sans date = visible (annonce d'un
-- épisode à venir, comportement actuel conservé) ; programmé avec une date
-- future = invisible jusqu'à l'heure dite.
create policy vc_ep_public_read on vc_episodes
  for select using (
    statut = 'publie'
    or (statut = 'programme' and (publie_le is null or publie_le <= now()))
  );

-- Articles : un brouillon reste invisible, un article programmé n'apparaît
-- qu'à partir de sa date. La date est obligatoire côté formulaire.
create policy vc_art_public_read on vc_articles
  for select using (
    statut = 'publie'
    or (statut = 'programme' and publie_le is not null and publie_le <= now())
  );

-- ----------------------------------------------------------------------------
-- 7. Vérifications
-- ----------------------------------------------------------------------------
-- select titre, statut, publie_le, slug, teasers from vc_episodes order by created_at desc;
-- select titre, statut, publie_le, slug from vc_articles order by created_at desc;
-- select nom, logo_url, ordre, actif from vc_partenaires order by ordre;

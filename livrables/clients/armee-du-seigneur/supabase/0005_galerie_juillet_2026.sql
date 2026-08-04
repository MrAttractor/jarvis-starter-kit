-- =====================================================================
-- Premiers albums de la galerie - photos du 28 juillet 2026
-- (fournies par la Mission via Drive, deposees dans le bucket public
--  als-medias sous galerie/2026-07-28/).
--
-- Deux albums, decoupes par nature du moment et non par lieu : les
-- photos viennent de plusieurs salles, mais le visiteur lit un culte
-- d'un cote et un temps de communion de l'autre.
--
-- AUCUN NOM DE PERSONNE dans les legendes : les visages n'ont pas ete
-- identifies avec certitude et nommer quelqu'un a tort sur une page
-- publique ne se rattrape pas. La Mission complete depuis l'admin.
--
-- Le champ evenement reste vide : le nom exact de la rencontre n'a pas
-- ete communique. Il se remplit depuis l'admin.
--
-- Les titres et legendes portent leurs accents : c'est du texte affiche
-- au visiteur, contrairement au reste des seeds de ce dossier.
--
-- Idempotent : guard sur le titre de l'album et sur le fichier du media.
-- =====================================================================

-- ---------- ALBUM 1 : le culte ----------
insert into public.als_albums (titre, annee, couverture_url, ordre)
select
  'Culte et adoration, juillet 2026',
  2026,
  'https://lgdgbrivnhgeupqhkckd.supabase.co/storage/v1/object/public/als-medias/galerie/2026-07-28/culte-08.jpg',
  1
where not exists (
  select 1 from public.als_albums a where a.titre = 'Culte et adoration, juillet 2026'
);

insert into public.als_medias (album_id, type, url, legende, ordre)
select
  (select id from public.als_albums where titre = 'Culte et adoration, juillet 2026'),
  'photo',
  'https://lgdgbrivnhgeupqhkckd.supabase.co/storage/v1/object/public/als-medias/galerie/2026-07-28/' || v.fichier,
  v.legende,
  v.ordre
from (values
  ('culte-08.jpg', 'Le temps de louange',              1),
  ('culte-09.jpg', 'La conduite de la louange',        2),
  ('culte-14.jpg', 'La louange en assemblée',          3),
  ('culte-12.jpg', 'Un chant pour le Seigneur',        4),
  ('culte-01.jpg', 'La Parole annoncée',               5),
  ('culte-03.jpg', 'L''enseignement de la Parole',     6),
  ('culte-10.jpg', 'Un temps d''exhortation',          7),
  ('culte-02.jpg', 'Au micro devant l''assemblée',     8),
  ('culte-04.jpg', 'Un temps de prière',               9),
  ('culte-05.jpg', 'Prière et imposition des mains',  10),
  ('culte-11.jpg', 'Recueillement',                   11),
  ('culte-13.jpg', 'Élever le nom du Seigneur',       12),
  ('culte-06.jpg', 'L''adoration',                    13),
  ('culte-07.jpg', 'Prosternés devant le Seigneur',   14),
  ('culte-15.jpg', 'La sainte cène',                  15)
) as v(fichier, legende, ordre)
where not exists (
  select 1 from public.als_medias m
   where m.url like '%galerie/2026-07-28/' || v.fichier
);

-- ---------- ALBUM 2 : la communion fraternelle ----------
insert into public.als_albums (titre, annee, couverture_url, ordre)
select
  'Moments de communion, juillet 2026',
  2026,
  'https://lgdgbrivnhgeupqhkckd.supabase.co/storage/v1/object/public/als-medias/galerie/2026-07-28/communion-02.jpg',
  2
where not exists (
  select 1 from public.als_albums a where a.titre = 'Moments de communion, juillet 2026'
);

insert into public.als_medias (album_id, type, url, legende, ordre)
select
  (select id from public.als_albums where titre = 'Moments de communion, juillet 2026'),
  'photo',
  'https://lgdgbrivnhgeupqhkckd.supabase.co/storage/v1/object/public/als-medias/galerie/2026-07-28/' || v.fichier,
  v.legende,
  v.ordre
from (values
  ('communion-02.jpg', 'La joie partagée',             1),
  ('communion-04.jpg', 'La danse devant le Seigneur',  2),
  ('communion-03.jpg', 'Un temps de célébration',      3),
  ('communion-01.jpg', 'Après le culte',               4),
  ('communion-05.jpg', 'Ensemble',                     5)
) as v(fichier, legende, ordre)
where not exists (
  select 1 from public.als_medias m
   where m.url like '%galerie/2026-07-28/' || v.fichier
);

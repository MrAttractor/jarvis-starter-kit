-- =====================================================================
-- Seed initial - Mission L'Armee du Seigneur (Phase 1a)
-- Idempotent : ne reinsere pas si deja present (guard sur le nom).
-- Textes = brouillons a valider par la Mission.
-- =====================================================================

-- ---------- DIRIGEANTS ----------
insert into public.als_dirigeants (nom, role, lieu, photo_url, bio, mission, ordre)
select * from (values
  (
    'Reverend Zaby Galla Josias Joseph',
    'Fondateur - Serviteur de Dieu',
    'Cote d''Ivoire',
    'assets/rev-zaby.jpg',
    'Fondateur de la Mission L''Armee du Seigneur. Il porte la vision de preparer le retour de Jesus-Christ et de susciter une armee forte, engagee et remplie du Saint-Esprit.',
    'Preparer le retour de Christ, former les disciples et manifester la puissance de Dieu.',
    1
  ),
  (
    'Reverende Veroly Zaby Galla',
    'Co-fondatrice - Responsable de la Mission en France',
    'France',
    'assets/rev-veroly.jpg',
    'Epouse du Reverend Zaby Galla Josias Joseph et co-fondatrice de la Mission. Elle conduit l''oeuvre en France, edifie les familles et accompagne les Femmes Elites.',
    'Conduire la Mission en France, edifier les familles et lever une generation de femmes d''impact.',
    2
  )
) as v(nom, role, lieu, photo_url, bio, mission, ordre)
where not exists (select 1 from public.als_dirigeants d where d.nom = v.nom);

-- ---------- DEPARTEMENTS (11) ----------
insert into public.als_departements (nom, mission, ordre)
select * from (values
  ('Communication',        'Porter la voix de la Mission et harmoniser sa presence sur toutes les plateformes.', 1),
  ('Golden Youth of Christ','Une generation de jeunes consacres, formes et engages pour Christ.', 2),
  ('Femmes Elites',         'Des femmes de foi et d''impact qui atteignent leurs objectifs en Christ.', 3),
  ('Intercession',          'Porter dans la priere les sujets de la Mission et veiller sur l''oeuvre.', 4),
  ('Social',                'Soutenir les demunis, les veufs, les veuves et les orphelins.', 5),
  ('Maison de la Destinee', 'Accueillir, accompagner et relever les vies fragilisees.', 6),
  ('Evangelisation',        'Annoncer le veritable Evangile et gagner les ames.', 7),
  ('Formation',             'Former et affermir les disciples par l''enseignement de la Parole.', 8),
  ('Technique',             'Assurer le son, la lumiere et la logistique des cultes et evenements.', 9),
  ('Louange',               'Elever le nom du Seigneur dans la louange et l''adoration.', 10),
  ('Medias',                'Capter, monter et diffuser les contenus video et photo de la Mission.', 11)
) as v(nom, mission, ordre)
where not exists (select 1 from public.als_departements d where d.nom = v.nom);

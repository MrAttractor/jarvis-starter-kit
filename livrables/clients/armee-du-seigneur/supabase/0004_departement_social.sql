-- =====================================================================
-- Le departement "Compassion" devient "Social" (demande de la Mission,
-- 05/08/2026). L'ordre (5) et la mission du departement ne changent pas.
--
-- Le mot "compassion" reste ailleurs sur le site : c'est le pilier 04 de
-- la vision et une valeur citee dans le texte d'accueil. Ce sont des
-- valeurs spirituelles, pas des noms d'organes : on n'y touche pas.
--
-- Idempotent : ne fait rien si le renommage a deja eu lieu.
-- Le seed 0002 est mis a jour en consequence, sinon un re-seed
-- recreerait un 12e departement "Compassion".
-- =====================================================================

update public.als_departements
   set nom = 'Social'
 where nom = 'Compassion'
   and not exists (select 1 from public.als_departements d where d.nom = 'Social');

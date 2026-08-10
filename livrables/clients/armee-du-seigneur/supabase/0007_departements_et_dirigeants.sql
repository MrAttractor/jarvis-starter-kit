-- 0007 — Retours de Mac Arthur du 10/08/2026, appliqués en direct puis versionnés ici.
--
-- Ces changements ont été passés par l'API le jour même. Ce fichier existe pour
-- qu'ils soient rejouables : sans lui, une réinitialisation depuis le seed 0002
-- ferait réapparaître les départements supprimés.
--
-- Les lignes supprimées sont sauvegardées en JSON à côté de ce fichier
-- (_sauvegarde-departement-medias.json, _sauvegarde-departements-supprimes.json)
-- pour pouvoir les remettre si la Mission change d'avis.

-- 1. Le département Louange prend le nom voulu par la Mission
update public.als_departements
   set nom = 'Chantre d''Or'
 where nom = 'Louange';

-- 2. Quatre départements retirés de la présentation publique
delete from public.als_departements
 where nom in ('Médias', 'Évangélisation', 'Formation', 'Technique');

-- Il reste sept départements : Communication, Golden Youth of Christ,
-- Femmes Élites, Intercession, Social, Maison de la Destinée, Chantre d'Or.

-- 3. La bio de la Révérende Veroly répétait mot pour mot son bloc « Sa mission »
--    (conduire l'œuvre en France, édifier les familles), qui s'affiche juste en
--    dessous sur la même carte. La phrase est retirée, rien n'est perdu à l'écran.
update public.als_dirigeants
   set bio = 'Épouse du Révérend Zaby Galla Josias Joseph et co-fondatrice de la Mission.'
 where nom = 'Révérende Veroly Zaby Galla';

-- 4. La photo de prédication passe en photo d'accueil du site, retouchée pour en
--    retirer la personne assise derrière le Révérend. Sa fiche de dirigeant prend
--    donc son portrait, sinon la même image apparaissait deux fois sur la page.
update public.als_dirigeants
   set photo_url = 'assets/rev-zaby-accueil.jpg'
 where nom = 'Révérend Zaby Galla Josias Joseph';

-- =====================================================================
-- APPLIQUEE le 05/08/2026.
--
-- Tout le contenu seede en juillet avait ete ecrit sans accents
-- (convention des migrations de ce dossier). Or ce texte n'est pas
-- technique : il s'affiche tel quel au visiteur. Le site public montrait
-- "Reverend", "Cote d'Ivoire", "Evangelisation", "Medias",
-- "Maison de la Destinee", "Femmes Elites".
--
-- Appliquee en meme temps que la refonte de la section Departements :
-- mettre ces libelles en avant dans des cartes et une fiche detaillee
-- tout en gardant l'orthographe fautive aurait ete livrer a moitie.
--
-- Cette migration ne change aucun contenu : elle ne remet que les
-- accents et les ligatures.
-- =====================================================================

-- ---------- DIRIGEANTS ----------
update public.als_dirigeants set
  nom  = 'Révérend Zaby Galla Josias Joseph',
  lieu = 'Côte d''Ivoire',
  bio  = 'Fondateur de la Mission L''Armée du Seigneur. Il porte la vision de préparer le retour de Jésus-Christ et de susciter une armée forte, engagée et remplie du Saint-Esprit.',
  mission = 'Préparer le retour de Christ, former les disciples et manifester la puissance de Dieu.'
where nom = 'Reverend Zaby Galla Josias Joseph';

update public.als_dirigeants set
  nom = 'Révérende Veroly Zaby Galla',
  bio = 'Épouse du Révérend Zaby Galla Josias Joseph et co-fondatrice de la Mission. Elle conduit l''œuvre en France, édifie les familles et accompagne les Femmes Élites.',
  mission = 'Conduire la Mission en France, édifier les familles et lever une génération de femmes d''impact.'
where nom = 'Reverende Veroly Zaby Galla';

-- ---------- DEPARTEMENTS ----------
update public.als_departements set mission = 'Porter la voix de la Mission et harmoniser sa présence sur toutes les plateformes.'
 where nom = 'Communication';

update public.als_departements set mission = 'Une génération de jeunes consacrés, formés et engagés pour Christ.'
 where nom = 'Golden Youth of Christ';

update public.als_departements set nom = 'Femmes Élites'
 where nom = 'Femmes Elites';

update public.als_departements set mission = 'Porter dans la prière les sujets de la Mission et veiller sur l''œuvre.'
 where nom = 'Intercession';

update public.als_departements set mission = 'Soutenir les démunis, les veufs, les veuves et les orphelins.'
 where nom = 'Social';

update public.als_departements set
  nom = 'Maison de la Destinée',
  mission = 'Accueillir, accompagner et relever les vies fragilisées.'
 where nom = 'Maison de la Destinee';

update public.als_departements set
  nom = 'Évangélisation',
  mission = 'Annoncer le véritable Évangile et gagner les âmes.'
 where nom = 'Evangelisation';

update public.als_departements set mission = 'Assurer le son, la lumière et la logistique des cultes et événements.'
 where nom = 'Technique';

update public.als_departements set mission = 'Élever le nom du Seigneur dans la louange et l''adoration.'
 where nom = 'Louange';

update public.als_departements set
  nom = 'Médias',
  mission = 'Capter, monter et diffuser les contenus vidéo et photo de la Mission.'
 where nom = 'Medias';

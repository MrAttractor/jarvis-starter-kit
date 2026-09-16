-- ════════════════════════════════════════════════════════════════════════
-- Jeu d'essai de la recette « quatre manques du CDC », Module 3.
--
-- Deux membres, parce que trois des quatre manques ne se voient pas d'un
-- seul côté : une connexion établie s'affiche aux DEUX membres, et un
-- message a besoin de quelqu'un pour le lire.
--
-- Pourquoi le rôle « agent » : `el_questionnaire_etat.publie` est faux tant
-- que la Cliente n'a pas validé sa liste de questions. Seuls les comptes
-- d'équipe entrent donc dans le Module 3. Donner ce rôle au jeu d'essai
-- évite d'ouvrir le questionnaire au monde entier pour le tester.
--
-- Les deux vivent à Paris et en France, pour que « Ma ville » et « Mon
-- pays » aient quelque chose à trouver. Aucune ne choisit « Je veux valider
-- avant d'être visible », qui les écarterait l'une de l'autre.
--
-- À EFFACER APRÈS LA RECETTE : recette-m3-suite-nettoyage.sql.
-- ════════════════════════════════════════════════════════════════════════
do $$
declare a uuid; b uuid;
begin
  insert into public.el_membres
    (pseudo, pseudo_norm, email, email_norm, genre, pays, pays_code,
     date_naissance, cgu_acceptees, cgu_le, statut, statut_verif, role)
  values
    ('RecetteA','recettea','recette.a@exemple.test','recette.a@exemple.test',
     'femme','France','FR','1988-04-12', true, now(), 'actif','valide','agent'),
    ('RecetteB','recetteb','recette.b@exemple.test','recette.b@exemple.test',
     'femme','France','FR','1990-09-03', true, now(), 'actif','valide','agent');

  select id into a from public.el_membres where pseudo_norm = 'recettea';
  select id into b from public.el_membres where pseudo_norm = 'recetteb';

  -- Les dix-huit questions obligatoires, sans quoi `complet` reste faux et
  -- la découverte refuse de s'ouvrir.
  insert into public.el_reponses (membre_id, question_code, valeur) values
    (a,'ville','"Paris"'),
    (a,'langues','["Français","Anglais"]'),
    (a,'secteur','"Entrepreneuriat"'),
    (a,'parcours','"Je dirige"'),
    (a,'voyages','"Souvent"'),
    (a,'soiree','"Une table de six"'),
    (a,'disponibilite','["Le week-end"]'),
    (a,'place_travail','"Il compte beaucoup mais j''ai trouvé un équilibre"'),
    (a,'intentions','["Des amitiés de qualité","Un cercle professionnel","Du conseil et du mentorat","Des lieux et des expériences","Une rencontre amoureuse"]'),
    (a,'rayon','"Partout, la distance ne me gêne pas"'),
    (a,'rythme_rencontres','"Deux ou trois"'),
    (a,'initiative','"Les deux"'),
    (a,'sujets','["Entrepreneuriat","Art et culture","Voyage","Gastronomie"]'),
    (a,'sport','"Je pratique régulièrement"'),
    (a,'temperament','["Ceux qui écoutent","Ceux qui font rire"]'),
    (a,'tranche_age','{"min":30,"max":55}'),
    (a,'discretion','"Mon profil peut être découvert par tous les membres vérifiés"'),
    (a,'alertes','"Oui, par e-mail"'),
    -- Deux réponses facultatives, pour que la carte porte de la matière.
    (a,'trois_mots','["exigeante","curieuse","fidèle"]'),
    (a,'villes_attaches','["Abidjan","Londres"]');

  insert into public.el_reponses (membre_id, question_code, valeur) values
    (b,'ville','"Paris"'),
    (b,'langues','["Français","Anglais","Espagnol"]'),
    (b,'secteur','"Art et création"'),
    (b,'parcours','"Je dirige"'),
    (b,'voyages','"Souvent"'),
    (b,'soiree','"Une table de six"'),
    (b,'disponibilite','["Le week-end","Cela dépend des périodes"]'),
    (b,'place_travail','"Il compte beaucoup mais j''ai trouvé un équilibre"'),
    (b,'intentions','["Des amitiés de qualité","Des lieux et des expériences","Un cercle professionnel","Du conseil et du mentorat","Une rencontre amoureuse"]'),
    (b,'rayon','"Ma ville d''abord"'),
    (b,'rythme_rencontres','"Deux ou trois"'),
    (b,'initiative','"Les deux"'),
    (b,'sujets','["Art et culture","Voyage","Gastronomie","Mode"]'),
    (b,'sport','"Je pratique régulièrement"'),
    (b,'temperament','["Ceux qui font rire","Ceux qui écoutent"]'),
    (b,'tranche_age','{"min":28,"max":50}'),
    (b,'discretion','"Mon profil peut être découvert par tous les membres vérifiés"'),
    (b,'alertes','"Oui, uniquement dans le Club"'),
    (b,'trois_mots','["solaire","directe","loyale"]'),
    (b,'villes_attaches','["Abidjan","Marrakech"]');

  -- Deux sessions, pour poser le jeton dans le navigateur comme la
  -- connexion par code le ferait.
  insert into public.el_sessions (jeton, membre_id, expire_at) values
    ('recette-m3-suite-jeton-a', a, now() + interval '6 hours'),
    ('recette-m3-suite-jeton-b', b, now() + interval '6 hours');
end $$;

select m.pseudo, m.role, m.statut_verif,
       (public.el_avancee_questionnaire(m.id)->>'complet') as questionnaire_complet,
       s.jeton
  from public.el_membres m
  join public.el_sessions s on s.membre_id = m.id
 where m.pseudo_norm in ('recettea','recetteb')
 order by m.pseudo;

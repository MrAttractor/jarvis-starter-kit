-- Jeu d'essai du moteur d'affinités. Profils fictifs, supprimés à la fin.
-- Chaque profil est construit pour exercer un cas précis.
do $$
declare
  claire uuid; sofia uuid; nadia uuid; ines uuid; lea uuid;
begin
  -- ── Cinq profils fictifs ──────────────────────────────────────────────
  insert into public.el_membres (pseudo, pseudo_norm, email, email_norm, genre, pays, date_naissance, cgu_acceptees, cgu_le, statut, statut_verif)
  values
    ('EssaiClaire','essaiclaire','essai.claire@exemple.test','essai.claire@exemple.test','femme','France','1988-04-12', true, now(), 'actif','valide'),
    ('EssaiSofia','essaisofia','essai.sofia@exemple.test','essai.sofia@exemple.test','femme','France','1990-09-03', true, now(), 'actif','valide'),
    ('EssaiNadia','essainadia','essai.nadia@exemple.test','essai.nadia@exemple.test','femme','Côte d''Ivoire','1985-01-20', true, now(), 'actif','valide'),
    ('EssaiInes','essaiines','essai.ines@exemple.test','essai.ines@exemple.test','femme','Belgique','1992-06-30', true, now(), 'actif','valide'),
    ('EssaiLea','essailea','essai.lea@exemple.test','essai.lea@exemple.test','femme','France','1955-03-15', true, now(), 'actif','valide');

  select id into claire from public.el_membres where pseudo_norm='essaiclaire';
  select id into sofia  from public.el_membres where pseudo_norm='essaisofia';
  select id into nadia  from public.el_membres where pseudo_norm='essainadia';
  select id into ines   from public.el_membres where pseudo_norm='essaiines';
  select id into lea    from public.el_membres where pseudo_norm='essailea';

  -- ── CLAIRE, la référence : Paris, entrepreneuriat, amitiés ────────────
  insert into public.el_reponses (membre_id, question_code, valeur) values
    (claire,'ville','"Paris"'), (claire,'villes_attaches','["Abidjan","Londres"]'),
    (claire,'langues','["Français","Anglais"]'), (claire,'secteur','"Entrepreneuriat"'),
    (claire,'parcours','"Je dirige"'), (claire,'trois_mots','["exigeante","curieuse","fidèle"]'),
    (claire,'voyages','"Souvent"'), (claire,'soiree','"Une table de six"'),
    (claire,'disponibilite','["Le week-end"]'), (claire,'place_travail','"Il compte beaucoup mais j''ai trouvé un équilibre"'),
    (claire,'intentions','["Des amitiés de qualité","Un cercle professionnel","Des lieux et des expériences"]'),
    (claire,'sujets','["Entrepreneuriat","Art et culture","Voyage","Gastronomie"]'),
    (claire,'sport','"Je pratique régulièrement"'),
    (claire,'temperament','["Ceux qui écoutent","Ceux qui font rire"]'),
    (claire,'tranche_age','{"min":30,"max":55}'), (claire,'discretion','"Mon profil peut être découvert par tous les membres vérifiés"');

  -- ── SOFIA, la bonne correspondance : même ville, mêmes sujets ─────────
  insert into public.el_reponses (membre_id, question_code, valeur) values
    (sofia,'ville','"Paris"'), (sofia,'villes_attaches','["Abidjan","Marrakech"]'),
    (sofia,'langues','["Français","Anglais","Espagnol"]'), (sofia,'secteur','"Art et création"'),
    (sofia,'parcours','"Je dirige"'), (sofia,'trois_mots','["solaire","directe","loyale"]'),
    (sofia,'voyages','"Souvent"'), (sofia,'soiree','"Une table de six"'),
    (sofia,'disponibilite','["Le week-end","Cela dépend des périodes"]'),
    (sofia,'place_travail','"Il compte beaucoup mais j''ai trouvé un équilibre"'),
    (sofia,'intentions','["Des amitiés de qualité","Des lieux et des expériences","Un cercle professionnel"]'),
    (sofia,'sujets','["Art et culture","Voyage","Gastronomie","Mode"]'),
    (sofia,'sport','"Je pratique régulièrement"'),
    (sofia,'temperament','["Ceux qui font rire","Ceux qui écoutent"]'),
    (sofia,'tranche_age','{"min":28,"max":50}'), (sofia,'discretion','"Mon profil peut être découvert par tous les membres vérifiés"');

  -- ── NADIA, correspondance faible : autre ville, autres sujets ─────────
  insert into public.el_reponses (membre_id, question_code, valeur) values
    (nadia,'ville','"Abidjan"'), (nadia,'langues','["Français","Dioula"]'),
    (nadia,'secteur','"Finance et investissement"'), (nadia,'parcours','"Je transmets et j''accompagne"'),
    (nadia,'voyages','"Deux ou trois fois"'), (nadia,'soiree','"Recevoir chez soi"'),
    (nadia,'disponibilite','["En semaine"]'), (nadia,'place_travail','"Je lève le pied"'),
    (nadia,'intentions','["Du conseil et du mentorat","Des amitiés de qualité"]'),
    (nadia,'sujets','["Investissement","Philanthropie","Éducation"]'),
    (nadia,'sport','"Ce n''est pas mon sujet"'),
    (nadia,'temperament','["Les gens réservés"]'),
    (nadia,'tranche_age','{"min":30,"max":60}'), (nadia,'discretion','"Mon profil peut être découvert par tous les membres vérifiés"');

  -- ── INÈS, écartée : aucune intention partagée (elle cherche l'amour) ──
  insert into public.el_reponses (membre_id, question_code, valeur) values
    (ines,'ville','"Paris"'), (ines,'langues','["Français"]'),
    (ines,'secteur','"Droit"'), (ines,'parcours','"Je dirige"'),
    (ines,'voyages','"Souvent"'), (ines,'soiree','"Un tête-à-tête"'),
    (ines,'disponibilite','["Le week-end"]'), (ines,'place_travail','"Il passe avant le reste"'),
    (ines,'intentions','["Une rencontre amoureuse","Des lieux et des expériences","Des amitiés de qualité"]'),
    (ines,'sujets','["Entrepreneuriat","Art et culture","Voyage","Gastronomie"]'),
    (ines,'temperament','["Ceux qui écoutent"]'),
    (ines,'tranche_age','{"min":30,"max":50}'), (ines,'discretion','"Mon profil peut être découvert par tous les membres vérifiés"');

  -- ── LÉA, écartée : hors de la tranche d'âge de Claire ─────────────────
  insert into public.el_reponses (membre_id, question_code, valeur) values
    (lea,'ville','"Paris"'), (lea,'langues','["Français"]'),
    (lea,'secteur','"Conseil"'), (lea,'parcours','"Je transmets et j''accompagne"'),
    (lea,'voyages','"Souvent"'), (lea,'soiree','"Une table de six"'),
    (lea,'disponibilite','["Le week-end"]'), (lea,'place_travail','"Je lève le pied"'),
    (lea,'intentions','["Des amitiés de qualité","Du conseil et du mentorat"]'),
    (lea,'sujets','["Art et culture","Voyage","Gastronomie"]'),
    (lea,'temperament','["Ceux qui écoutent"]'),
    (lea,'tranche_age','{"min":40,"max":75}'), (lea,'discretion','"Mon profil peut être découvert par tous les membres vérifiés"');
end $$;

-- ── Ce que Claire verrait ───────────────────────────────────────────────
select 'CE QUE CLAIRE VOIT' as bloc, pseudo, score,
       (select string_agg(r->>'texte', ' | ') from jsonb_array_elements(raisons) r) as raisons
  from public.el_profils_compatibles(
    (select id from public.el_membres where pseudo_norm='essaiclaire'), 10);

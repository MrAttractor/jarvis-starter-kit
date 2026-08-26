-- Un seul lien a partager, 21 aout 2026.
--
-- Motif : trois adresses differentes avec des jetons a rallonge, personne ne
-- s'y retrouve. Desormais l'ecran de suivi connait les seances ET leur jeton,
-- donc il peut ouvrir la seance du jour d'un bouton. L'utilisateur ne manipule
-- plus qu'une adresse.
--
-- Portee de securite : le jeton d'une seance n'est communique qu'a qui detient
-- deja un jeton valide du projet, c'est-a-dire au meme cercle. Aucun elargissement.

CREATE OR REPLACE FUNCTION public.fgp_board(p_jeton text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v fgp_seances; v_jour date := current_date;
begin
  v := fgp_seance_par_jeton(p_jeton);

  return json_build_object(

    'aujourdhui', v_jour,
    'evenement',  date '2026-10-11',
    'jours_restants', (date '2026-10-11' - v_jour),

    'jalons', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', j.id, 'libelle', j.libelle, 'detail', j.detail,
        'echeance', j.echeance, 'porteur', j.porteur,
        'criticite', j.criticite, 'statut', j.statut,
        'maj_le', j.maj_le, 'maj_par', j.maj_par,
        'jours', case when j.echeance is null then null else (j.echeance - v_jour) end,
        'alerte', case
          when j.statut in ('fait','sans_objet') then 'ok'
          when j.echeance is null                then 'sans_date'
          when j.echeance <  v_jour              then 'depasse'
          when j.echeance <= v_jour + 7          then 'imminent'
          else 'a_venir' end
      ) order by j.ordre)
      from fgp_jalons j), '[]'::jsonb),

    'lots', coalesce((
      select jsonb_agg(x order by x->>'ordre') from (
        select jsonb_build_object(
          'ordre', section_ordre, 'section', section,
          'total', count(*),
          'thim', count(*) filter (where statut = 'thim'),
          'advantage', count(*) filter (where statut = 'advantage'),
          'a_preciser', count(*) filter (where statut = 'a_preciser'),
          'a_statuer', count(*) filter (where statut = 'a_statuer')
        ) as x
        from fgp_points group by section_ordre, section
      ) s), '[]'::jsonb),

    -- Toutes les informations, dues comme renseignées, avec leur identifiant.
    'infos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i.id, 'categorie', i.categorie, 'libelle', i.libelle,
        'reponse', i.reponse, 'porteur', i.porteur, 'echeance', i.echeance,
        'maj_le', i.maj_le, 'maj_par', i.maj_par,
        'due', (coalesce(trim(i.reponse),'') = ''),
        'retard', (coalesce(trim(i.reponse),'') = ''
                   and i.echeance is not null and i.echeance < v_jour)
      ) order by i.categorie_ordre, i.ordre)
      from fgp_infos i), '[]'::jsonb),

    'infos_compte', (
      select jsonb_build_object(
        'total', count(*),
        'renseignees', count(*) filter (where coalesce(trim(reponse),'') <> ''),
        'sans_porteur', count(*) filter (where coalesce(trim(reponse),'') = ''
                                           and coalesce(trim(porteur),'') = ''))
      from fgp_infos),

    'actions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'libelle', a.libelle, 'porteur', a.porteur,
        'echeance', a.echeance, 'statut', a.statut,
        'retard', (a.statut <> 'soldee' and a.echeance is not null and a.echeance < v_jour)
      ) order by a.echeance nulls last)
      from fgp_actions a), '[]'::jsonb),

    'seances', coalesce((
      select jsonb_agg(jsonb_build_object(
        'numero', s.numero, 'titre', s.titre, 'date_seance', s.date_seance,
        'statut', s.statut, 'close_le', s.close_le, 'jeton', s.jeton,
        'signatures', (select count(*) from fgp_signatures g where g.seance_id = s.id)
      ) order by s.numero)
      from fgp_seances s), '[]'::jsonb)
  );
end $function$
;

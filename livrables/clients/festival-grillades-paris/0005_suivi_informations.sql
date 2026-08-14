-- =====================================================================
-- Festival des Grillades de Paris 2026
-- Migration 0005 — SUIVI DES INFORMATIONS APRÈS LA SÉANCE
--
-- Problème corrigé : les 29 informations attendues d'Advantage arrivent
-- au fil des semaines, bien après la séance. Or fgp_info_maj refuse
-- toute écriture quand la séance est close, et rouvrir la séance
-- créerait une version et effacerait les validations du relevé.
--
-- Principe retenu : le RELEVÉ constate un état au 7 août, le SUIVI vit
-- après. Une réponse saisie après la clôture n'entre donc jamais dans
-- le compte rendu de la séance, elle est tracée au journal comme suivi.
-- =====================================================================

-- ---------- ÉCRITURE HORS SÉANCE ----------

create or replace function fgp_info_suivi(
  p_jeton text, p_id uuid, p_reponse text, p_porteur text,
  p_echeance date, p_auteur text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances; old fgp_infos; v_auteur text;
begin
  v := fgp_seance_par_jeton(p_jeton);

  v_auteur := nullif(trim(coalesce(p_auteur,'')),'');
  if v_auteur is null then raise exception 'auteur requis'; end if;

  select * into old from fgp_infos where id = p_id and seance_id = v.id;
  if not found then raise exception 'information introuvable'; end if;

  -- Journalisation, un enregistrement par champ réellement modifié.
  if p_reponse is not null
     and trim(p_reponse) is distinct from trim(coalesce(old.reponse,'')) then
    insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
    values (v.id, 'information (suivi)', old.libelle, 'reponse',
            old.reponse, p_reponse, v_auteur);
  end if;

  if p_porteur is not null
     and trim(p_porteur) is distinct from trim(coalesce(old.porteur,'')) then
    insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
    values (v.id, 'information (suivi)', old.libelle, 'porteur',
            old.porteur, p_porteur, v_auteur);
  end if;

  if p_echeance is not null and p_echeance is distinct from old.echeance then
    insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
    values (v.id, 'information (suivi)', old.libelle, 'echeance',
            old.echeance::text, p_echeance::text, v_auteur);
  end if;

  -- Une chaîne vide efface volontairement, un null laisse en l'état.
  update fgp_infos set
    reponse  = case when p_reponse is null then reponse
                    else nullif(trim(p_reponse),'') end,
    porteur  = case when p_porteur is null then porteur
                    else nullif(trim(p_porteur),'') end,
    echeance = case when p_echeance is null then echeance else p_echeance end,
    maj_le   = now(),
    maj_par  = v_auteur
  where id = p_id;

  return fgp_board(p_jeton);
end $$;

-- ---------- LE BOARD RENVOIE DÉSORMAIS TOUTES LES INFORMATIONS ----------
-- Avec leur identifiant, sans quoi la page ne peut pas les modifier.

create or replace function fgp_board(p_jeton text)
returns json
language plpgsql security definer set search_path = public as $$
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
        'statut', s.statut, 'close_le', s.close_le,
        'signatures', (select count(*) from fgp_signatures g where g.seance_id = s.id)
      ) order by s.numero)
      from fgp_seances s), '[]'::jsonb)
  );
end $$;

grant execute on function fgp_info_suivi(text,uuid,text,text,date,text) to anon;
grant execute on function fgp_board(text)                               to anon;

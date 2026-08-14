-- =====================================================================
-- Festival des Grillades de Paris 2026
-- Migration 0004 — BOARD DE PILOTAGE PROJET
--
-- L'espace existant pilote des SÉANCES. Ce board pilote le PROJET :
-- jalons datés, avancement par lot, informations encore dues par
-- Advantage, actions ouvertes, et alertes calculées côté serveur.
--
-- Accès : le même jeton de séance que l'espace, déjà détenu par les
-- trois parties. Aucune table n'est lisible à la clé publique.
-- =====================================================================

-- ---------- JALONS ----------

create table if not exists fgp_jalons (
  id          bigserial primary key,
  ordre       int not null default 0,
  libelle     text not null,
  detail      text,
  echeance    date,
  porteur     text,
  criticite   text not null default 'normal'
              check (criticite in ('critique','normal')),
  statut      text not null default 'a_faire'
              check (statut in ('a_faire','en_cours','fait','sans_objet')),
  maj_le      timestamptz,
  maj_par     text
);

create index if not exists fgp_jalons_echeance on fgp_jalons(echeance);

alter table fgp_jalons enable row level security;
revoke all on fgp_jalons from anon, authenticated;

-- ---------- SEED DU CALENDRIER ----------
-- Repris du cahier des charges, section 10. Idempotent.

insert into fgp_jalons(ordre, libelle, detail, echeance, porteur, criticite, statut)
select * from (values
  (10,'Validation du relevé de la séance n°1',
      'Le relevé devient l''Annexe 4 du contrat. Une seule des trois validations est acquise.',
      date '2026-08-13','Advantage et Thim','critique','a_faire'),
  (20,'Souscription de l''assurance annulation',
      'Seule protection financière réelle en cas de report. Au-delà, les assureurs refusent ou surtarifent.',
      date '2026-08-15','Thim Production','critique','a_faire'),
  (30,'Signature du contrat de mandat',
      'Conditionne tout engagement auprès des tiers. Rien ne s''engage avant le premier versement.',
      date '2026-08-17','Advantage et Thim','critique','a_faire'),
  (40,'Dépôt des dossiers de visas',
      'Suppose la liste nominative des artistes et les lettres d''invitation. Échéance resserrée en séance.',
      date '2026-08-21','Thim, sur pièces Advantage','critique','a_faire'),
  (50,'Premier versement des fonds',
      'Déclenche les engagements : salle, assurance, technique.',
      date '2026-08-27','Advantage Conseils','critique','a_faire'),
  (60,'Ouverture de la billetterie',
      'Suppose le plan de salle, les prix, les catégories et les commissions.',
      null,'Thim Production','normal','a_faire'),
  (70,'Gel de la programmation, de la jauge et du site',
      'Au-delà, toute modification passe par un avenant chiffré.',
      date '2026-09-05','Advantage Conseils','critique','a_faire'),
  (80,'Dépôt du dossier de sécurité',
      'Notice de sécurité et passage en commission. Le plan d''implantation en est une pièce.',
      date '2026-09-05','Thim Production','critique','a_faire'),
  (90,'Attestations d''assurance communiquées',
      'RC organisateur, RC professionnelle, annulation, dommages.',
      date '2026-09-11','Thim Production','normal','a_faire'),
  (100,'Déclarations SACEM, SACD, SPRE',
      null,date '2026-09-20','Thim Production','normal','a_faire'),
  (110,'Solde des fonds versé',
      null,date '2026-09-26','Advantage Conseils','critique','a_faire'),
  (120,'Attestations d''hygiène des exposants reçues',
      'Trente jours avant. Conditionne l''accès au site le jour J.',
      date '2026-09-11','Advantage Conseils','normal','a_faire'),
  (130,'Arrivée de l''équipe pour le sprint final',
      'Mention portée en séance.',
      date '2026-10-08','Advantage Conseils','normal','a_faire'),
  (140,'FESTIVAL DES GRILLADES DE PARIS',
      '12 rue Gutenberg, 93000 Bobigny.',
      date '2026-10-11','les deux','critique','a_faire'),
  (150,'Compte rendu final et clôture financière',
      'Compte d''emploi des fonds, état de billetterie, rapport partenaires.',
      date '2026-11-25','Thim Production','normal','a_faire')
) as v(ordre,libelle,detail,echeance,porteur,criticite,statut)
where not exists (select 1 from fgp_jalons);

-- ---------- MISE À JOUR D'UN JALON ----------

create or replace function fgp_jalon_maj(
  p_jeton text, p_id bigint, p_statut text, p_echeance date, p_auteur text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances; v_av text; v_lib text;
begin
  v := fgp_seance_par_jeton(p_jeton);

  select statut, libelle into v_av, v_lib from fgp_jalons where id = p_id;
  if not found then raise exception 'jalon introuvable'; end if;

  update fgp_jalons
     set statut   = coalesce(nullif(trim(coalesce(p_statut,'')),''), statut),
         echeance = case when p_echeance is null then echeance else p_echeance end,
         maj_le   = now(),
         maj_par  = nullif(trim(coalesce(p_auteur,'')),'')
   where id = p_id;

  if p_statut is not null and p_statut is distinct from v_av then
    insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
    values (v.id, 'jalon', v_lib, 'statut', v_av, p_statut,
            nullif(trim(coalesce(p_auteur,'')),''));
  end if;

  return fgp_board(p_jeton);
end $$;

-- ---------- LE BOARD ----------
-- Un seul appel renvoie tout ce que la page affiche.
-- Les alertes sont calculées ici : une échéance dépassée ne dépend pas
-- de l'horloge du navigateur de celui qui regarde.

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

    -- ---- JALONS ----
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

    -- ---- AVANCEMENT DU PÉRIMÈTRE, PAR LOT ----
    'lots', coalesce((
      select jsonb_agg(x order by x->>'ordre') from (
        select jsonb_build_object(
          'ordre', section_ordre,
          'section', section,
          'total', count(*),
          'thim', count(*) filter (where statut = 'thim'),
          'advantage', count(*) filter (where statut = 'advantage'),
          'a_preciser', count(*) filter (where statut = 'a_preciser'),
          'a_statuer', count(*) filter (where statut = 'a_statuer')
        ) as x
        from fgp_points
        group by section_ordre, section
      ) s), '[]'::jsonb),

    -- ---- INFORMATIONS ENCORE DUES ----
    'infos_dues', coalesce((
      select jsonb_agg(jsonb_build_object(
        'categorie', i.categorie, 'libelle', i.libelle,
        'porteur', i.porteur, 'echeance', i.echeance,
        'retard', (i.echeance is not null and i.echeance < v_jour)
      ) order by i.categorie_ordre, i.ordre)
      from fgp_infos i
      where coalesce(trim(i.reponse),'') = ''), '[]'::jsonb),

    'infos_compte', (
      select jsonb_build_object(
        'total', count(*),
        'renseignees', count(*) filter (where coalesce(trim(reponse),'') <> ''),
        'sans_porteur', count(*) filter (where coalesce(trim(reponse),'') = ''
                                           and coalesce(trim(porteur),'') = ''))
      from fgp_infos),

    -- ---- ACTIONS ----
    'actions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'libelle', a.libelle, 'porteur', a.porteur,
        'echeance', a.echeance, 'statut', a.statut,
        'retard', (a.statut <> 'soldee' and a.echeance is not null and a.echeance < v_jour)
      ) order by a.echeance nulls last)
      from fgp_actions a), '[]'::jsonb),

    -- ---- SÉANCES ----
    'seances', coalesce((
      select jsonb_agg(jsonb_build_object(
        'numero', s.numero, 'titre', s.titre, 'date_seance', s.date_seance,
        'statut', s.statut,
        'signatures', (select count(*) from fgp_signatures g where g.seance_id = s.id)
      ) order by s.numero)
      from fgp_seances s), '[]'::jsonb)
  );
end $$;

-- ---------- DROITS ----------

grant execute on function fgp_board(text)                              to anon;
grant execute on function fgp_jalon_maj(text,bigint,text,date,text)    to anon;

-- =====================================================================
-- Festival des Grillades de Paris 2026
-- Espace de pilotage et de traçabilité des décisions
-- Migration 0001 — 05/08/2026
--
-- Principe de sécurité : aucune table n'est accessible avec la clé anon.
-- Tout passe par des fonctions SECURITY DEFINER qui exigent le jeton
-- de la séance. Le jeton n'est jamais renvoyé au client.
-- =====================================================================

-- ---------- TABLES ----------

create table if not exists fgp_seances (
  id          uuid primary key default gen_random_uuid(),
  numero      int  not null,
  titre       text not null,
  objet       text,
  date_seance date,
  lieu        text,
  jeton       text not null unique,
  statut      text not null default 'ouverte'
              check (statut in ('ouverte','close','signee')),
  version     int  not null default 1,
  cree_le     timestamptz not null default now(),
  close_le    timestamptz
);

create table if not exists fgp_points (
  id            uuid primary key default gen_random_uuid(),
  seance_id     uuid not null references fgp_seances(id) on delete cascade,
  section       text not null,
  section_ordre int  not null default 0,
  ordre         int  not null default 0,
  code          text,
  libelle       text not null,
  detail        text,
  type          text not null default 'repartition'
                check (type in ('repartition','validation')),
  statut        text not null default 'a_statuer'
                check (statut in ('a_statuer','thim','advantage','a_preciser','valide','reserve')),
  commentaire   text,
  ajoute_en_seance boolean not null default false,
  maj_le        timestamptz,
  maj_par       text
);

create table if not exists fgp_infos (
  id              uuid primary key default gen_random_uuid(),
  seance_id       uuid not null references fgp_seances(id) on delete cascade,
  categorie       text not null,
  categorie_ordre int  not null default 0,
  ordre           int  not null default 0,
  libelle         text not null,
  reponse         text,
  porteur         text,
  echeance        date,
  maj_le          timestamptz,
  maj_par         text
);

create table if not exists fgp_actions (
  id        uuid primary key default gen_random_uuid(),
  seance_id uuid not null references fgp_seances(id) on delete cascade,
  libelle   text not null,
  porteur   text,
  echeance  date,
  statut    text not null default 'ouverte' check (statut in ('ouverte','soldee')),
  cree_le   timestamptz not null default now(),
  maj_le    timestamptz,
  maj_par   text
);

create table if not exists fgp_journal (
  id            bigserial primary key,
  seance_id     uuid not null references fgp_seances(id) on delete cascade,
  objet_type    text not null,
  objet_libelle text,
  champ         text,
  avant         text,
  apres         text,
  auteur        text,
  horodatage    timestamptz not null default now()
);

create table if not exists fgp_signatures (
  id        uuid primary key default gen_random_uuid(),
  seance_id uuid not null references fgp_seances(id) on delete cascade,
  nom       text not null,
  fonction  text,
  structure text not null,
  signe_le  timestamptz not null default now(),
  empreinte text
);

create index if not exists fgp_points_seance   on fgp_points(seance_id);
create index if not exists fgp_infos_seance    on fgp_infos(seance_id);
create index if not exists fgp_actions_seance  on fgp_actions(seance_id);
create index if not exists fgp_journal_seance  on fgp_journal(seance_id, horodatage desc);
create index if not exists fgp_signat_seance   on fgp_signatures(seance_id);

-- ---------- RLS : tout est fermé, aucune policy ----------

alter table fgp_seances    enable row level security;
alter table fgp_points     enable row level security;
alter table fgp_infos      enable row level security;
alter table fgp_actions    enable row level security;
alter table fgp_journal    enable row level security;
alter table fgp_signatures enable row level security;

revoke all on fgp_seances, fgp_points, fgp_infos, fgp_actions, fgp_journal, fgp_signatures
  from anon, authenticated;

-- ---------- FONCTION INTERNE : résolution du jeton ----------

create or replace function fgp_seance_par_jeton(p_jeton text)
returns fgp_seances
language plpgsql security definer set search_path = public as $$
declare v fgp_seances;
begin
  if p_jeton is null or length(p_jeton) < 12 then
    raise exception 'acces refuse';
  end if;
  select * into v from fgp_seances where jeton = p_jeton;
  if not found then raise exception 'acces refuse'; end if;
  return v;
end $$;

-- ---------- LECTURE DE L'ÉTAT COMPLET ----------

create or replace function fgp_etat(p_jeton text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances;
begin
  v := fgp_seance_par_jeton(p_jeton);
  return json_build_object(
    'seance', to_jsonb(v) - 'jeton',
    'points', coalesce((
      select jsonb_agg(to_jsonb(p) - 'seance_id' order by p.section_ordre, p.ordre)
      from fgp_points p where p.seance_id = v.id), '[]'::jsonb),
    'infos', coalesce((
      select jsonb_agg(to_jsonb(i) - 'seance_id' order by i.categorie_ordre, i.ordre)
      from fgp_infos i where i.seance_id = v.id), '[]'::jsonb),
    'actions', coalesce((
      select jsonb_agg(to_jsonb(a) - 'seance_id' order by a.echeance nulls last, a.cree_le)
      from fgp_actions a where a.seance_id = v.id), '[]'::jsonb),
    'journal', coalesce((
      select jsonb_agg(to_jsonb(j) - 'seance_id' order by j.horodatage desc)
      from (select * from fgp_journal where seance_id = v.id
            order by horodatage desc limit 200) j), '[]'::jsonb),
    'signatures', coalesce((
      select jsonb_agg(to_jsonb(s) - 'seance_id' order by s.signe_le)
      from fgp_signatures s where s.seance_id = v.id), '[]'::jsonb)
  );
end $$;

-- ---------- ÉCRITURE : points ----------

create or replace function fgp_point_maj(
  p_jeton text, p_id uuid, p_statut text, p_commentaire text, p_auteur text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances; old fgp_points;
begin
  v := fgp_seance_par_jeton(p_jeton);
  if v.statut <> 'ouverte' then raise exception 'seance close'; end if;
  select * into old from fgp_points where id = p_id and seance_id = v.id;
  if not found then raise exception 'point introuvable'; end if;

  if p_statut is not null and p_statut is distinct from old.statut then
    insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
    values (v.id, 'point', coalesce(old.code,'') || ' ' || old.libelle,
            'statut', old.statut, p_statut, p_auteur);
  end if;
  if p_commentaire is not null and p_commentaire is distinct from coalesce(old.commentaire,'') then
    insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
    values (v.id, 'point', coalesce(old.code,'') || ' ' || old.libelle,
            'commentaire', old.commentaire, p_commentaire, p_auteur);
  end if;

  update fgp_points set
    statut      = coalesce(p_statut, statut),
    commentaire = coalesce(p_commentaire, commentaire),
    maj_le      = now(),
    maj_par     = p_auteur
  where id = p_id;

  return fgp_etat(p_jeton);
end $$;

create or replace function fgp_point_ajout(
  p_jeton text, p_section text, p_libelle text, p_auteur text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances; v_so int; v_ord int;
begin
  v := fgp_seance_par_jeton(p_jeton);
  if v.statut <> 'ouverte' then raise exception 'seance close'; end if;
  if coalesce(trim(p_libelle),'') = '' then raise exception 'libelle vide'; end if;

  select coalesce(max(section_ordre), 0) into v_so
    from fgp_points where seance_id = v.id and section = p_section;
  if v_so = 0 then
    select coalesce(max(section_ordre), 0) + 1 into v_so
      from fgp_points where seance_id = v.id;
  end if;
  select coalesce(max(ordre), 0) + 1 into v_ord
    from fgp_points where seance_id = v.id and section = p_section;

  insert into fgp_points(seance_id, section, section_ordre, ordre, libelle,
                         ajoute_en_seance, maj_le, maj_par)
  values (v.id, p_section, v_so, v_ord, trim(p_libelle), true, now(), p_auteur);

  insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
  values (v.id, 'point', trim(p_libelle), 'ajout', null, 'ajouté en séance', p_auteur);

  return fgp_etat(p_jeton);
end $$;

-- ---------- ÉCRITURE : informations à obtenir ----------

create or replace function fgp_info_maj(
  p_jeton text, p_id uuid, p_reponse text, p_porteur text, p_echeance date, p_auteur text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances; old fgp_infos;
begin
  v := fgp_seance_par_jeton(p_jeton);
  if v.statut <> 'ouverte' then raise exception 'seance close'; end if;
  select * into old from fgp_infos where id = p_id and seance_id = v.id;
  if not found then raise exception 'information introuvable'; end if;

  if p_reponse is not null and p_reponse is distinct from coalesce(old.reponse,'') then
    insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
    values (v.id, 'information', old.libelle, 'reponse', old.reponse, p_reponse, p_auteur);
  end if;

  update fgp_infos set
    reponse  = coalesce(p_reponse, reponse),
    porteur  = coalesce(p_porteur, porteur),
    echeance = coalesce(p_echeance, echeance),
    maj_le   = now(),
    maj_par  = p_auteur
  where id = p_id;

  return fgp_etat(p_jeton);
end $$;

-- ---------- ÉCRITURE : actions ----------

create or replace function fgp_action_ajout(
  p_jeton text, p_libelle text, p_porteur text, p_echeance date, p_auteur text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances;
begin
  v := fgp_seance_par_jeton(p_jeton);
  if v.statut <> 'ouverte' then raise exception 'seance close'; end if;
  if coalesce(trim(p_libelle),'') = '' then raise exception 'libelle vide'; end if;

  insert into fgp_actions(seance_id, libelle, porteur, echeance, maj_le, maj_par)
  values (v.id, trim(p_libelle), nullif(trim(coalesce(p_porteur,'')),''), p_echeance, now(), p_auteur);

  insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
  values (v.id, 'action', trim(p_libelle), 'ajout', null,
          coalesce(p_porteur,'sans porteur'), p_auteur);

  return fgp_etat(p_jeton);
end $$;

create or replace function fgp_action_maj(
  p_jeton text, p_id uuid, p_statut text, p_porteur text, p_echeance date, p_auteur text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances; old fgp_actions;
begin
  v := fgp_seance_par_jeton(p_jeton);
  if v.statut <> 'ouverte' then raise exception 'seance close'; end if;
  select * into old from fgp_actions where id = p_id and seance_id = v.id;
  if not found then raise exception 'action introuvable'; end if;

  if p_statut is not null and p_statut is distinct from old.statut then
    insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
    values (v.id, 'action', old.libelle, 'statut', old.statut, p_statut, p_auteur);
  end if;

  update fgp_actions set
    statut   = coalesce(p_statut, statut),
    porteur  = coalesce(p_porteur, porteur),
    echeance = coalesce(p_echeance, echeance),
    maj_le   = now(),
    maj_par  = p_auteur
  where id = p_id;

  return fgp_etat(p_jeton);
end $$;

create or replace function fgp_action_suppr(p_jeton text, p_id uuid, p_auteur text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances; old fgp_actions;
begin
  v := fgp_seance_par_jeton(p_jeton);
  if v.statut <> 'ouverte' then raise exception 'seance close'; end if;
  select * into old from fgp_actions where id = p_id and seance_id = v.id;
  if not found then raise exception 'action introuvable'; end if;

  delete from fgp_actions where id = p_id;

  insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
  values (v.id, 'action', old.libelle, 'suppression', old.libelle, null, p_auteur);

  return fgp_etat(p_jeton);
end $$;

-- ---------- CLÔTURE, RÉOUVERTURE, SIGNATURE ----------

create or replace function fgp_cloturer(p_jeton text, p_auteur text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances; v_reste int;
begin
  v := fgp_seance_par_jeton(p_jeton);
  if v.statut <> 'ouverte' then raise exception 'seance deja close'; end if;

  select count(*) into v_reste
    from fgp_points where seance_id = v.id and statut = 'a_statuer';
  if v_reste > 0 then
    raise exception 'il reste % point(s) a statuer', v_reste;
  end if;

  update fgp_seances set statut = 'close', close_le = now() where id = v.id;

  insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
  values (v.id, 'seance', v.titre, 'statut', 'ouverte', 'close', p_auteur);

  return fgp_etat(p_jeton);
end $$;

create or replace function fgp_rouvrir(p_jeton text, p_auteur text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances;
begin
  v := fgp_seance_par_jeton(p_jeton);
  if v.statut = 'signee' then
    raise exception 'seance signee, elle ne peut plus etre modifiee';
  end if;
  if v.statut = 'ouverte' then return fgp_etat(p_jeton); end if;

  update fgp_seances
     set statut = 'ouverte', close_le = null, version = version + 1
   where id = v.id;

  insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
  values (v.id, 'seance', v.titre, 'statut', 'close',
          'rouverte, version ' || (v.version + 1), p_auteur);

  return fgp_etat(p_jeton);
end $$;

create or replace function fgp_signer(
  p_jeton text, p_nom text, p_fonction text, p_structure text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances; v_emp text; v_nb int;
begin
  v := fgp_seance_par_jeton(p_jeton);
  if v.statut = 'ouverte' then
    raise exception 'la seance doit etre close avant signature';
  end if;
  if coalesce(trim(p_nom),'') = '' or coalesce(trim(p_structure),'') = '' then
    raise exception 'nom et structure obligatoires';
  end if;
  if exists (select 1 from fgp_signatures
              where seance_id = v.id and structure = trim(p_structure)) then
    raise exception 'cette structure a deja signe';
  end if;

  -- sha256() est natif depuis PostgreSQL 11, pas de dépendance à pgcrypto
  v_emp := encode(sha256(convert_to(
    v.id::text || '|' || v.version::text || '|' || trim(p_nom) || '|' ||
    trim(p_structure) || '|' || now()::text, 'UTF8')), 'hex');

  insert into fgp_signatures(seance_id, nom, fonction, structure, empreinte)
  values (v.id, trim(p_nom), nullif(trim(coalesce(p_fonction,'')),''),
          trim(p_structure), v_emp);

  insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
  values (v.id, 'signature', trim(p_structure), 'validation', null,
          'signe par ' || trim(p_nom), trim(p_nom));

  select count(*) into v_nb from fgp_signatures where seance_id = v.id;
  if v_nb >= 3 then
    update fgp_seances set statut = 'signee' where id = v.id;
    insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
    values (v.id, 'seance', v.titre, 'statut', 'close', 'signee', 'systeme');
  end if;

  return fgp_etat(p_jeton);
end $$;

-- ---------- DROITS ----------

revoke all on function fgp_seance_par_jeton(text) from public, anon, authenticated;

grant execute on function fgp_etat(text)                                    to anon;
grant execute on function fgp_point_maj(text,uuid,text,text,text)           to anon;
grant execute on function fgp_point_ajout(text,text,text,text)              to anon;
grant execute on function fgp_info_maj(text,uuid,text,text,date,text)       to anon;
grant execute on function fgp_action_ajout(text,text,text,date,text)        to anon;
grant execute on function fgp_action_maj(text,uuid,text,text,date,text)     to anon;
grant execute on function fgp_action_suppr(text,uuid,text)                  to anon;
grant execute on function fgp_cloturer(text,text)                           to anon;
grant execute on function fgp_rouvrir(text,text)                            to anon;
grant execute on function fgp_signer(text,text,text,text)                   to anon;

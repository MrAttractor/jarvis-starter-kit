-- =====================================================================
-- Festival des Grillades de Paris 2026
-- Migration 0003 — traçabilité des connexions, rapport d'animation,
--                  réinitialisation de séance
--
-- La présence est déclarée aux participants dans le pied de page de
-- l'espace. Elle fait partie du registre d'audit, ce n'est pas une
-- mesure dissimulée.
--
-- Le rapport et la réinitialisation exigent le JETON D'ANIMATION,
-- distinct du jeton de séance et détenu par Mr Attractor seul.
-- =====================================================================

alter table fgp_seances add column if not exists jeton_admin text unique;
alter table fgp_seances add column if not exists reinitialisee_le timestamptz;

create table if not exists fgp_presence (
  id              uuid primary key default gen_random_uuid(),
  seance_id       uuid not null references fgp_seances(id) on delete cascade,
  session_id      text not null,
  nom             text,
  structure       text,
  fonction        text,
  appareil        text,
  ouvert_le       timestamptz not null default now(),
  dernier_signe   timestamptz not null default now(),
  secondes_actives int not null default 0,
  unique (seance_id, session_id)
);
create index if not exists fgp_presence_seance on fgp_presence(seance_id, ouvert_le);

alter table fgp_presence enable row level security;
revoke all on fgp_presence from anon, authenticated;

-- ---------- RÉSOLUTION DU JETON D'ANIMATION ----------

create or replace function fgp_seance_par_admin(p_admin text)
returns fgp_seances
language plpgsql security definer set search_path = public as $$
declare v fgp_seances;
begin
  if p_admin is null or length(p_admin) < 16 then raise exception 'acces refuse'; end if;
  select * into v from fgp_seances where jeton_admin = p_admin;
  if not found then raise exception 'acces refuse'; end if;
  return v;
end $$;

revoke all on function fgp_seance_par_admin(text) from public, anon, authenticated;

-- ---------- SIGNAL DE PRÉSENCE ----------
-- Appelé toutes les 30 secondes par l'espace. Le compteur envoyé est cumulé
-- côté navigateur et ne compte que le temps où l'onglet est réellement visible.
-- On retient le maximum : un signal en retard ne fait jamais reculer le compteur.

create or replace function fgp_presence_ping(
  p_jeton text, p_session text, p_nom text, p_structure text,
  p_fonction text, p_appareil text, p_secondes int)
returns void
language plpgsql security definer set search_path = public as $$
declare v fgp_seances;
begin
  v := fgp_seance_par_jeton(p_jeton);
  if coalesce(trim(p_session),'') = '' then return; end if;

  insert into fgp_presence(seance_id, session_id, nom, structure, fonction,
                           appareil, secondes_actives)
  values (v.id, p_session, nullif(trim(coalesce(p_nom,'')),''),
          nullif(trim(coalesce(p_structure,'')),''),
          nullif(trim(coalesce(p_fonction,'')),''),
          nullif(trim(coalesce(p_appareil,'')),''),
          greatest(coalesce(p_secondes,0), 0))
  on conflict (seance_id, session_id) do update set
    nom              = coalesce(excluded.nom, fgp_presence.nom),
    structure        = coalesce(excluded.structure, fgp_presence.structure),
    fonction         = coalesce(excluded.fonction, fgp_presence.fonction),
    dernier_signe    = now(),
    secondes_actives = greatest(fgp_presence.secondes_actives, excluded.secondes_actives);
end $$;

-- ---------- RAPPORT D'ANIMATION ----------

create or replace function fgp_rapport(p_admin text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances; v_bascule timestamptz;
begin
  v := fgp_seance_par_admin(p_admin);
  v_bascule := v.reinitialisee_le;

  return json_build_object(
    'seance', to_jsonb(v) - 'jeton' - 'jeton_admin',
    'lien_seance', '/festival-grillades/?s=' || v.jeton,

    -- Une ligne par ouverture de l'espace, la plus récente d'abord
    'connexions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'nom', p.nom, 'structure', p.structure, 'fonction', p.fonction,
        'appareil', p.appareil,
        'ouvert_le', p.ouvert_le, 'dernier_signe', p.dernier_signe,
        'secondes_actives', p.secondes_actives,
        'phase', case when v_bascule is null then 'seance'
                      when p.ouvert_le < v_bascule then 'relecture'
                      else 'seance' end
      ) order by p.ouvert_le desc)
      from fgp_presence p where p.seance_id = v.id), '[]'::jsonb),

    -- Un cumul par personne, toutes ouvertures confondues
    'par_personne', coalesce((
      select jsonb_agg(x order by x->>'derniere_visite' desc) from (
        select jsonb_build_object(
          'nom', coalesce(nom,'Non identifié'),
          'structure', coalesce(structure,'Non renseignée'),
          'ouvertures', count(*),
          'premiere_visite', min(ouvert_le),
          'derniere_visite', max(dernier_signe),
          'secondes_actives', sum(secondes_actives)
        ) as x
        from fgp_presence
        where seance_id = v.id
          and (v_bascule is null or ouvert_le >= v_bascule)
        group by coalesce(nom,'Non identifié'), coalesce(structure,'Non renseignée')
      ) s), '[]'::jsonb),

    -- Un cumul par structure, pour voir qui a réellement participé
    'par_structure', coalesce((
      select jsonb_agg(x) from (
        select jsonb_build_object(
          'structure', coalesce(structure,'Non renseignée'),
          'personnes', count(distinct coalesce(nom,'?')),
          'secondes_actives', sum(secondes_actives),
          'derniere_visite', max(dernier_signe)
        ) as x
        from fgp_presence
        where seance_id = v.id
          and (v_bascule is null or ouvert_le >= v_bascule)
        group by coalesce(structure,'Non renseignée')
      ) s), '[]'::jsonb),

    -- Qui a fait quoi, et combien de fois
    'contributions', coalesce((
      select jsonb_agg(x order by x->>'modifications' desc) from (
        select jsonb_build_object(
          'auteur', coalesce(auteur,'Non renseigné'),
          'modifications', count(*),
          'derniere', max(horodatage)
        ) as x
        from fgp_journal
        where seance_id = v.id
        group by coalesce(auteur,'Non renseigné')
      ) s), '[]'::jsonb),

    'avancement', (
      select jsonb_build_object(
        'points_total', count(*),
        'points_statues', count(*) filter (where statut <> 'a_statuer'),
        'thim', count(*) filter (where statut = 'thim'),
        'advantage', count(*) filter (where statut = 'advantage'),
        'a_preciser', count(*) filter (where statut = 'a_preciser'),
        'ajoutes_en_seance', count(*) filter (where ajoute_en_seance)
      ) from fgp_points where seance_id = v.id),

    'journal', coalesce((
      select jsonb_agg(to_jsonb(j) - 'seance_id' order by j.horodatage desc)
      from fgp_journal j where j.seance_id = v.id), '[]'::jsonb),

    'signatures', coalesce((
      select jsonb_agg(to_jsonb(s) - 'seance_id' order by s.signe_le)
      from fgp_signatures s where s.seance_id = v.id), '[]'::jsonb)
  );
end $$;

-- ---------- RÉINITIALISATION ----------
-- Remet la séance à l'état de départ : tous les points à statuer, commentaires
-- effacés, informations vidées, actions rouvertes, journal et signatures purgés.
-- Les connexions ne sont PAS effacées : elles sont marquées d'un avant et d'un
-- après, pour distinguer la relecture de la séance réelle.

create or replace function fgp_reinitialiser(p_admin text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances;
begin
  v := fgp_seance_par_admin(p_admin);

  update fgp_points set statut = 'a_statuer', commentaire = null,
                        maj_le = null, maj_par = null
   where seance_id = v.id and not ajoute_en_seance;

  delete from fgp_points where seance_id = v.id and ajoute_en_seance;

  update fgp_infos set reponse = null, porteur = null, echeance = null,
                       maj_le = null, maj_par = null
   where seance_id = v.id;

  update fgp_actions set statut = 'ouverte', maj_le = null, maj_par = null
   where seance_id = v.id;

  delete from fgp_signatures where seance_id = v.id;
  delete from fgp_journal     where seance_id = v.id;

  update fgp_seances set statut = 'ouverte', close_le = null, version = 1,
                         reinitialisee_le = now()
   where id = v.id;

  return fgp_rapport(p_admin);
end $$;

-- ---------- DROITS ----------

grant execute on function fgp_presence_ping(text,text,text,text,text,text,int) to anon;
grant execute on function fgp_rapport(text)        to anon;
grant execute on function fgp_reinitialiser(text)  to anon;

-- ---------- JETON D'ANIMATION DE LA SÉANCE 1 ----------

update fgp_seances
   set jeton_admin = 'adm-3e8b1f7c95a2d604be13'
 where jeton = 's1-9c4f7a2e6b18d350af71'
   and jeton_admin is null;

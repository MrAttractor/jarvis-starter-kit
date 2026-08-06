-- ============================================================
-- Club Privé Élévia — borne absolue de conservation des vidéos
--
-- Trou constaté le 06/08/2026 : la suppression sous 24 h est adossée à la
-- DÉCISION de l'équipe. Une demande que personne ne traite n'est donc jamais
-- purgée, et la vidéo peut rester des mois. Le RGPD exige une durée de
-- conservation bornée, indépendante de la diligence de l'équipe.
--
-- Parade : au-delà de 30 jours sans décision, la demande expire d'elle-même et
-- sa vidéo entre dans la purge. Le membre n'est pas puni, il est invité à
-- recommencer, et sa place dans la file se libère.
-- ============================================================

-- 'expire' rejoint les statuts possibles. Ce n'est PAS une décision : elle n'a
-- ni auteur ni horodatage de décision, et la contrainte l'impose.
alter table public.el_verifications drop constraint if exists el_verifications_statut_check;
alter table public.el_verifications add constraint el_verifications_statut_check
  check (statut in ('en_attente','valide','refuse','expire'));

alter table public.el_verifications drop constraint if exists el_verif_decision_humaine;
alter table public.el_verifications add constraint el_verif_decision_humaine
  check (
    (statut in ('en_attente','expire') and decide_le is null and decide_par is null)
    or (statut in ('valide','refuse') and decide_le is not null and decide_par is not null)
  );

-- ── Expiration des demandes jamais traitées ────────────────
create or replace function public.el_expirer_demandes()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  with vieilles as (
    update public.el_verifications
    set statut = 'expire'
    where statut = 'en_attente'
      and soumis_le < (now() - interval '30 days')
      and chemin is not null
    returning membre_id
  )
  select count(*) into n from vieilles;

  -- Le membre retrouve un parcours propre : il peut soumettre à nouveau.
  update public.el_membres m
  set statut_verif = 'non_soumis'
  where m.statut_verif = 'en_attente'
    and not exists (
      select 1 from public.el_verifications v
      where v.membre_id = m.id and v.statut = 'en_attente'
    );

  return n;
end;
$$;

-- ── La purge couvre désormais les deux cas ─────────────────
-- 1. décision prise il y a plus de 24 h (engagement de l'Avenant, Art. 15) ;
-- 2. demande expirée faute de traitement (borne absolue de conservation).
-- La colonne « motif » s'ajoute au résultat : PostgreSQL refuse de changer le
-- type de retour d'une fonction existante, il faut donc la supprimer d'abord.
drop function if exists public.el_videos_a_purger();

create or replace function public.el_videos_a_purger()
returns table(id uuid, chemin text, motif text)
language sql
security definer
set search_path = public
as $$
  select v.id, v.chemin,
         case when v.statut = 'expire' then 'expiree' else 'decidee' end
  from public.el_verifications v
  where v.chemin is not null
    and v.purgee_le is null
    and (
      (v.decide_le is not null and v.decide_le < (now() - interval '24 hours'))
      or v.statut = 'expire'
    )
  limit 200;
$$;

revoke all on function public.el_expirer_demandes()  from public, anon, authenticated;
revoke all on function public.el_videos_a_purger()   from public, anon, authenticated;

comment on function public.el_expirer_demandes is
  'Borne absolue de conservation : une demande non traitée sous 30 jours expire, sa vidéo devient purgeable.';

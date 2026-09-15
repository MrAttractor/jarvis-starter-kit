-- ════════════════════════════════════════════════════════════════════════
-- 0011 — Module 3, la mise en relation
--
-- LE PRINCIPE, ET IL EST CONTRACTUEL
--
-- Personne ne se parle sans avoir été accepté. Le moteur d'affinités propose
-- un ordre d'affichage, il ne met personne en relation : la demande est un
-- geste, la réponse un autre, tous deux humains. C'est l'Avenant n°1 Art. 15
-- (aucune décision automatisée) et c'est aussi le positionnement du Club.
--
-- Trois garde-fous inscrits ici, et non laissés à l'écran :
--   · seul un membre vérifié demande, et on ne demande qu'à un membre vérifié ;
--   · une seule demande par paire, quel que soit le sens, pour qu'un refus ne
--     puisse pas être contourné en redemandant ;
--   · le mot d'introduction est plafonné, et il est le SEUL texte qui circule
--     avant l'acceptation.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.el_relations (
  id             uuid primary key default gen_random_uuid(),
  demandeur_id   uuid not null references public.el_membres(id) on delete cascade,
  destinataire_id uuid not null references public.el_membres(id) on delete cascade,
  statut         text not null default 'demandee'
                   check (statut in ('demandee','acceptee','refusee','retiree')),
  -- Le mot d'introduction. Court volontairement : c'est une présentation, pas
  -- une conversation. La conversation vient après l'acceptation (Module 4).
  mot            text check (mot is null or length(mot) <= 400),
  demandee_le    timestamptz not null default now(),
  repondu_le     timestamptz,
  -- Le score au moment de la demande, gardé pour que la Cliente puisse un jour
  -- savoir si ses réglages d'affinités produisent des rencontres ou du bruit.
  score_alors    int,
  constraint el_relations_pas_soi check (demandeur_id <> destinataire_id)
);

-- Une seule relation par paire, dans les deux sens. La paire est normalisée
-- par un index sur le couple ordonné : sans cela, A→B et B→A coexisteraient et
-- un refus se contournerait en redemandant dans l'autre sens.
create unique index if not exists el_relations_paire_unique
  on public.el_relations (
    least(demandeur_id::text, destinataire_id::text),
    greatest(demandeur_id::text, destinataire_id::text)
  );

create index if not exists el_relations_demandeur   on public.el_relations (demandeur_id, statut);
create index if not exists el_relations_destinataire on public.el_relations (destinataire_id, statut);

alter table public.el_relations enable row level security;
revoke all on public.el_relations from anon, authenticated;

comment on table public.el_relations is
  'Mises en relation. Une demande, une réponse, toutes deux humaines : le moteur '
  'd''affinités ne met personne en relation, il propose un ordre d''affichage.';

-- ── Où en est le questionnaire d'un membre ──────────────────────────────
-- Sert à deux choses : la barre de progression, et le refus d'ouvrir la
-- découverte à quelqu'un qui n'a pas encore dit ce qu'il cherche.
create or replace function public.el_avancee_questionnaire(p_membre uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  with actives as (
    select code, obligatoire from public.el_questions where active
  ), repondues as (
    select r.question_code from public.el_reponses r
     where r.membre_id = p_membre
       and r.question_code in (select code from actives)
  )
  select jsonb_build_object(
    'total',            (select count(*) from actives),
    'repondues',        (select count(*) from repondues),
    'obligatoires',     (select count(*) from actives where obligatoire),
    'obligatoires_ok',  (select count(*) from actives a
                          where a.obligatoire and a.code in (select question_code from repondues)),
    'complet',          (select count(*) from actives a
                          where a.obligatoire and a.code not in (select question_code from repondues)) = 0
  );
$$;

-- ── Demander une mise en relation ───────────────────────────────────────
create or replace function public.el_demander_relation(
  p_demandeur uuid, p_destinataire uuid, p_mot text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  aff       jsonb;
  existante record;
  d_verif   text;
  c_verif   text;
begin
  if p_demandeur = p_destinataire then
    return jsonb_build_object('ok', false, 'error', 'Demande impossible.');
  end if;

  select statut_verif into d_verif from public.el_membres where id = p_demandeur;
  select statut_verif into c_verif from public.el_membres where id = p_destinataire;
  if d_verif is distinct from 'valide' then
    return jsonb_build_object('ok', false, 'error', 'Votre profil doit être vérifié avant de demander une mise en relation.');
  end if;
  if c_verif is distinct from 'valide' then
    return jsonb_build_object('ok', false, 'error', 'Ce membre n''est pas disponible.');
  end if;

  -- Une relation existe déjà dans un sens ou dans l'autre : on ne la double
  -- pas, et on dit laquelle, sinon l'écran ne sait pas quoi afficher.
  select * into existante from public.el_relations
   where least(demandeur_id::text, destinataire_id::text) = least(p_demandeur::text, p_destinataire::text)
     and greatest(demandeur_id::text, destinataire_id::text) = greatest(p_demandeur::text, p_destinataire::text);
  if existante.id is not null then
    return jsonb_build_object('ok', false, 'deja', existante.statut,
      'error', case existante.statut
        when 'demandee' then 'Une demande est déjà en cours entre vous.'
        when 'acceptee' then 'Vous êtes déjà en relation.'
        when 'refusee' then 'Cette demande a déjà été tranchée.'
        else 'Une demande a déjà existé entre vous.' end);
  end if;

  -- Le moteur a son mot à dire : ce qu'il écarte ne se demande pas. Sans ce
  -- contrôle, l'écart de l'affichage se contournerait par un appel direct.
  aff := public.el_affinite(p_demandeur, p_destinataire);
  if (aff->>'ecarte')::boolean then
    return jsonb_build_object('ok', false, 'error', 'Ce membre ne vous est pas proposé.');
  end if;

  insert into public.el_relations (demandeur_id, destinataire_id, mot, score_alors)
  values (p_demandeur, p_destinataire, nullif(btrim(coalesce(p_mot,'')), ''), (aff->>'score')::int);

  return jsonb_build_object('ok', true);
end $$;

-- ── Répondre à une demande ──────────────────────────────────────────────
create or replace function public.el_repondre_relation(
  p_membre uuid, p_relation uuid, p_reponse text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare rel record;
begin
  if p_reponse not in ('acceptee','refusee') then
    return jsonb_build_object('ok', false, 'error', 'Réponse inconnue.');
  end if;

  select * into rel from public.el_relations where id = p_relation;
  if rel.id is null then
    return jsonb_build_object('ok', false, 'error', 'Demande introuvable.');
  end if;
  -- Seul le destinataire répond. Le demandeur, lui, peut retirer sa demande.
  if rel.destinataire_id <> p_membre then
    return jsonb_build_object('ok', false, 'error', 'Cette demande ne vous est pas adressée.');
  end if;
  if rel.statut <> 'demandee' then
    return jsonb_build_object('ok', false, 'error', 'Cette demande a déjà été tranchée.');
  end if;

  update public.el_relations
     set statut = p_reponse, repondu_le = now()
   where id = rel.id;

  return jsonb_build_object('ok', true, 'statut', p_reponse);
end $$;

-- ── Mes relations, vues de mon côté ─────────────────────────────────────
create or replace function public.el_mes_relations(p_membre uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'recues', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', r.id, 'pseudo', m.pseudo, 'mot', r.mot,
               'quand', r.demandee_le,
               'raisons', public.el_affinite(p_membre, r.demandeur_id)->'raisons')
             order by r.demandee_le desc)
        from public.el_relations r
        join public.el_membres m on m.id = r.demandeur_id
       where r.destinataire_id = p_membre and r.statut = 'demandee'
    ), '[]'::jsonb),
    'envoyees', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', r.id, 'pseudo', m.pseudo, 'statut', r.statut, 'quand', r.demandee_le)
             order by r.demandee_le desc)
        from public.el_relations r
        join public.el_membres m on m.id = r.destinataire_id
       where r.demandeur_id = p_membre and r.statut in ('demandee','refusee')
    ), '[]'::jsonb),
    'acceptees', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', r.id,
               'pseudo', case when r.demandeur_id = p_membre then d.pseudo else g.pseudo end,
               'quand', r.repondu_le)
             order by r.repondu_le desc)
        from public.el_relations r
        join public.el_membres g on g.id = r.demandeur_id
        join public.el_membres d on d.id = r.destinataire_id
       where r.statut = 'acceptee'
         and (r.demandeur_id = p_membre or r.destinataire_id = p_membre)
    ), '[]'::jsonb)
  );
$$;

-- ── Les profils à proposer, en retirant ceux déjà traités ───────────────
create or replace function public.el_decouverte(p_membre uuid, p_limite int default 12)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', p.membre_id, 'pseudo', p.pseudo,
           'ville', p.ville, 'parcours', p.parcours,
           'trois_mots', p.trois_mots,
           'score', p.score, 'raisons', p.raisons)
         order by p.score desc), '[]'::jsonb)
    from public.el_profils_compatibles(p_membre, p_limite) p
   where not exists (
     select 1 from public.el_relations r
      where least(r.demandeur_id::text, r.destinataire_id::text) = least(p_membre::text, p.membre_id::text)
        and greatest(r.demandeur_id::text, r.destinataire_id::text) = greatest(p_membre::text, p.membre_id::text)
   );
$$;

revoke all on function public.el_avancee_questionnaire(uuid)                from public, anon, authenticated;
revoke all on function public.el_demander_relation(uuid,uuid,text)          from public, anon, authenticated;
revoke all on function public.el_repondre_relation(uuid,uuid,text)          from public, anon, authenticated;
revoke all on function public.el_mes_relations(uuid)                        from public, anon, authenticated;
revoke all on function public.el_decouverte(uuid,int)                       from public, anon, authenticated;

select 'migration 0011 appliquee' as resultat;

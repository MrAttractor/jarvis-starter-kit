-- ============================================================
-- Club Privé Élévia — Module 2 « Confiance, vérification »
--
-- Ce que l'Avenant V3 (Art. 15) promet, et que ce schéma tient :
--   1. la vidéo constate qu'une personne réelle est devant la caméra, avec un
--      geste à faire. AUCUNE reconnaissance faciale, AUCUNE empreinte du visage
--      n'est calculée ni stockée : rien ici ne ressemble à une donnée biométrique
--      au sens de l'article 9 du RGPD ;
--   2. la décision est prise par une personne de l'équipe, jamais par un automate.
--      D'où decide_par : une décision sans auteur est refusée par la contrainte ;
--   3. la vidéo est supprimée dans les 24 h suivant la décision, de façon
--      VÉRIFIABLE. D'où purgee_le, qui rend la suppression prouvable a posteriori
--      alors qu'un fichier simplement absent ne prouve rien.
-- ============================================================

-- ── Rôles ──────────────────────────────────────────────────
-- Un agent Élévia est un membre à qui l'on a confié la modération.
alter table public.el_membres
  add column if not exists role text not null default 'membre';

alter table public.el_membres drop constraint if exists el_membres_role_valide;
alter table public.el_membres add constraint el_membres_role_valide
  check (role in ('membre','agent'));

-- ── Demandes de vérification ───────────────────────────────
create table if not exists public.el_verifications (
  id           uuid primary key default gen_random_uuid(),
  membre_id    uuid not null references public.el_membres(id) on delete cascade,
  defi         text not null,                    -- le geste demandé, tiré au sort
  chemin       text,                             -- objet dans le bucket privé
  statut       text not null default 'en_attente'
               check (statut in ('en_attente','valide','refuse')),
  motif        text,                             -- explication d'un refus, lisible par le membre
  soumis_le    timestamptz not null default now(),
  decide_le    timestamptz,
  decide_par   uuid references public.el_membres(id),
  purgee_le    timestamptz,                      -- preuve de la suppression de la vidéo
  created_at   timestamptz not null default now()
);

create index if not exists el_verif_membre_idx on public.el_verifications(membre_id, created_at desc);
create index if not exists el_verif_file_idx   on public.el_verifications(statut, soumis_le);
-- Sert la purge : les décisions dont la vidéo n'a pas encore été effacée.
create index if not exists el_verif_purge_idx  on public.el_verifications(decide_le)
  where purgee_le is null and chemin is not null;

-- Une décision est toujours datée ET signée par un agent.
-- C'est la traduction en base de « la décision n'est jamais automatisée ».
alter table public.el_verifications drop constraint if exists el_verif_decision_humaine;
alter table public.el_verifications add constraint el_verif_decision_humaine
  check (
    (statut = 'en_attente' and decide_le is null and decide_par is null)
    or (statut in ('valide','refuse') and decide_le is not null and decide_par is not null)
  );

-- Une seule demande en attente à la fois par membre : sans cela, un membre
-- pourrait saturer la file de modération d'Élévia à lui seul.
create unique index if not exists el_verif_une_seule_en_attente
  on public.el_verifications(membre_id) where statut = 'en_attente';

alter table public.el_verifications enable row level security;
-- Aucune policy : rien n'est lisible à la clé publique. Tout passe par
-- l'edge function elevia-verif, en service role.

-- ── Purge des vidéos, 24 h après la décision ───────────────
-- Renvoie les objets à effacer du bucket. L'effacement lui-même est fait par
-- l'edge function (le stockage n'est pas accessible depuis SQL), qui rappelle
-- ensuite el_marquer_purgees. La fonction est volontairement scindée en deux
-- pour qu'aucune ligne ne soit marquée purgée avant que le fichier le soit.
create or replace function public.el_videos_a_purger()
returns table(id uuid, chemin text)
language sql
security definer
set search_path = public
as $$
  select v.id, v.chemin
  from public.el_verifications v
  where v.chemin is not null
    and v.purgee_le is null
    and v.decide_le is not null
    and v.decide_le < (now() - interval '24 hours')
  limit 200;
$$;

create or replace function public.el_marquer_purgees(ids uuid[])
returns int
language sql
security definer
set search_path = public
as $$
  with maj as (
    update public.el_verifications
    set purgee_le = now(), chemin = null
    where id = any(ids)
    returning 1
  )
  select count(*)::int from maj;
$$;

revoke all on function public.el_videos_a_purger()      from public, anon, authenticated;
revoke all on function public.el_marquer_purgees(uuid[]) from public, anon, authenticated;

comment on table public.el_verifications is
  'Module 2. Aucune donnée biométrique : ni gabarit, ni empreinte de visage, seulement une vidéo éphémère jugée par un agent.';
comment on column public.el_verifications.purgee_le is
  'Horodatage de la suppression de la vidéo. Rend l''effacement sous 24 h vérifiable (CDC, critère d''acceptation).';

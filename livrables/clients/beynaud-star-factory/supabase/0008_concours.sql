-- ============================================================
-- 0008 — LE CONCOURS DU MEILLEUR AMBASSADEUR
-- ------------------------------------------------------------
-- Un filleul ne compte QUE s'il a active les notifications.
--
-- Motif, et il est serieux : depuis que l'inscription ne demande
-- plus qu'un prenom, sans verification ni plafond, n'importe qui
-- peut ouvrir une fenetre privee et se parrainer cinquante fois en
-- dix minutes. Avec un cadeau a la cle, l'incitation est forte, et
-- un gagnant conteste au lancement couterait plus cher que le
-- concours ne rapporte.
--
-- Exiger la notification rend la fraude de masse tres difficile :
-- il faut une vraie permission, accordee sur un vrai appareil, et
-- un navigateur qui refuse deux fois ne redemande plus jamais.
-- Effet de bord voulu : on ne recrute plus des lignes en base, on
-- recrute des fans joignables.
-- ============================================================

create table if not exists public.bey_saisons (
  id      uuid primary key default gen_random_uuid(),
  nom     text not null,
  debut   timestamptz not null,
  fin     timestamptz not null,
  -- Une seule saison active a la fois, garanti par l'index plus bas.
  active  boolean not null default true,
  cree_le timestamptz not null default now()
);

create unique index if not exists bey_saison_active_unique
  on public.bey_saisons ((active)) where active;

alter table public.bey_saisons enable row level security;
-- Aucune policy : tout passe par les fonctions en service role.

-- Le classement est calcule, jamais stocke. Un compteur entretenu a la main
-- finit toujours par diverger de la realite ; ici il ne peut pas mentir.
create or replace view public.v_bey_classement
with (security_invoker = true) as
select
  m.id,
  m.prenom,
  m.lieu,
  m.code_ambassadeur,
  count(f.id) as inscrits,
  count(f.id) filter (
    where exists (select 1 from public.bey_push x where x.membre_id = f.id)
  ) as points,
  rank() over (
    order by count(f.id) filter (
      where exists (select 1 from public.bey_push x where x.membre_id = f.id)
    ) desc
  ) as rang
from public.bey_membres m
left join public.bey_membres f
       on f.parraine_par = m.code_ambassadeur
      and f.created_at >= coalesce(
            (select s.debut from public.bey_saisons s where s.active limit 1),
            '-infinity'::timestamptz)
group by m.id, m.prenom, m.lieu, m.code_ambassadeur;

-- La saison de lancement. Les deux dates se changent en une ligne le jour ou
-- Mac Arthur fixe le vrai coup d'envoi ; elle demarre aujourd'hui pour etre
-- verifiable tout de suite.
insert into public.bey_saisons (nom, debut, fin)
select 'Saison 1', now(), timestamptz '2026-10-31 23:59:59+00'
where not exists (select 1 from public.bey_saisons);

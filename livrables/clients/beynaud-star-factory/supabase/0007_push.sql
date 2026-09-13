-- ============================================================
-- 0007 — LES NOTIFICATIONS
-- ------------------------------------------------------------
-- Constat du 13/09 : personne n'etait prevenu de rien. Le service
-- worker ne contenait qu'un cache, l'ecran ne demandait jamais la
-- permission, et la colonne push_subscription posee en juillet
-- n'avait jamais ete remplie. Serge publiait dans le vide, et son
-- tableau de bord lui repondait "envoye a N membres".
--
-- Une table plutot que la colonne : un fan a souvent deux appareils,
-- un telephone et un ordinateur, et une colonne n'en garde qu'un.
-- L'ancienne colonne est laissee en place, elle est vide, et la
-- retirer maintenant enfreindrait R-77.
-- ============================================================

create table if not exists public.bey_push (
  id          uuid primary key default gen_random_uuid(),
  membre_id   uuid not null references public.bey_membres(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  -- Un abonnement se perime sans prevenir : le navigateur est desinstalle,
  -- le fan refuse les notifications. Le service de push repond alors 404 ou
  -- 410, et c'est le seul moment ou l'on apprend qu'il faut nettoyer.
  echecs      integer not null default 0,
  cree_le     timestamptz not null default now(),
  vu_le       timestamptz not null default now()
);

create index if not exists bey_push_membre_idx on public.bey_push (membre_id);

alter table public.bey_push enable row level security;
-- Aucune policy : comme partout sur ce dossier, rien ne passe en direct,
-- tout transite par les fonctions en service role.

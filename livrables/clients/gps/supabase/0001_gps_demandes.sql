-- GPS — demandes entrantes du site (booking et SAMA)
-- Une seule table, une colonne `type` distingue les deux formulaires :
-- un seul endroit à lire, un seul jeu de policies à auditer.
--
-- Sécurité : RLS activé et AUCUNE policy. Personne n'écrit ni ne lit avec la clé
-- publique. Seule l'edge function, qui porte la clé de service, insère. C'est la
-- faille classique d'un formulaire de contact que d'ouvrir un insert public puis
-- d'oublier que le select l'est aussi.

create table if not exists public.gps_demandes (
  id              uuid primary key default gen_random_uuid(),
  cree_le         timestamptz not null default now(),

  -- 'booking' = demande de prestation d'animation
  -- 'sama'    = prise de contact autour de l'événement
  type            text not null check (type in ('booking', 'sama')),

  -- Identité du demandeur
  nom             text not null,
  telephone       text not null,
  email           text,
  organisation    text,

  -- Spécifique booking
  date_souhaitee  date,
  type_evenement  text,
  ville           text,
  lieu            text,

  -- Spécifique SAMA : à quel titre la personne écrit
  qualite         text,

  message         text,

  -- Suivi côté agence
  statut          text not null default 'nouvelle'
                  check (statut in ('nouvelle', 'en cours', 'acceptee', 'refusee')),
  note            text,
  maj_le          timestamptz
);

alter table public.gps_demandes enable row level security;

create index if not exists gps_demandes_cree_le_idx
  on public.gps_demandes (cree_le desc);

create index if not exists gps_demandes_type_statut_idx
  on public.gps_demandes (type, statut);

-- Rien d'autre. Pas de policy, c'est volontaire et c'est la protection.

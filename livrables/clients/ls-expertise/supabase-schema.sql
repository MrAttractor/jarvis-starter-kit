-- LS EXPERTISE — Étape 1 (socle), scope réel jour 1 : équipe + pipeline
-- Projet Supabase partagé lgdgbrivnhgeupqhkckd. Préfixe de tables : lsx_
-- Exécuté via API Management le 06/07/2026. Vérifié end-to-end (claim + RLS + isolation) le 06/07/2026.

create table if not exists lsx_equipe_membres (
  id uuid primary key default gen_random_uuid(),
  agence_id text not null default 'ls-expertise',
  user_id uuid references auth.users(id),
  email text not null,
  nom text,
  role text not null default 'direction' check (role in ('direction','commercial','social_media','administration','production','community')),
  statut text not null default 'invite' check (statut in ('invite','actif')),
  created_at timestamptz not null default now(),
  unique (agence_id, email)
);

create table if not exists lsx_clients (
  id uuid primary key default gen_random_uuid(),
  agence_id text not null default 'ls-expertise',
  nom text not null,
  secteur text,
  contact_nom text,
  contact_tel text,
  statut text not null default 'contact' check (statut in ('contact','qualifie','closing','signe','perdu')),
  score int,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lsx_dossier_transitions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references lsx_clients(id) on delete cascade,
  statut_avant text,
  statut_apres text not null,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table lsx_equipe_membres enable row level security;
alter table lsx_clients enable row level security;
alter table lsx_dossier_transitions enable row level security;

-- Fonction SECURITY DEFINER : renvoie les agence_id où l'utilisateur courant est membre actif.
-- Indispensable pour éviter la récursion infinie RLS : une policy sur lsx_equipe_membres ne doit
-- jamais faire un sous-select direct sur lsx_equipe_membres (elle-même protégée par RLS), sinon
-- Postgres réévalue la policy à l'infini. Le SECURITY DEFINER bypass RLS pour cette seule requête.
create or replace function lsx_mes_agences()
returns setof text
language sql
security definer
stable
set search_path = public
as $$
  select agence_id from lsx_equipe_membres where user_id = auth.uid() and statut = 'actif';
$$;

grant execute on function lsx_mes_agences() to authenticated;

-- Un membre actif peut voir l'équipe de sa propre agence
create policy lsx_equipe_select on lsx_equipe_membres for select
  using (agence_id in (select lsx_mes_agences()));

-- Seule la Direction peut inviter de nouveaux membres (RBAC : "Directeur... gestion des équipes")
create or replace function lsx_est_direction(p_agence_id text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists(
    select 1 from lsx_equipe_membres
    where user_id = auth.uid() and statut = 'actif' and role = 'direction' and agence_id = p_agence_id
  );
$$;

grant execute on function lsx_est_direction(text) to authenticated;

create policy lsx_equipe_insert on lsx_equipe_membres for insert
  with check (lsx_est_direction(agence_id));

-- Un membre actif peut lire/écrire les clients de sa propre agence
create policy lsx_clients_select on lsx_clients for select
  using (agence_id in (select lsx_mes_agences()));
create policy lsx_clients_insert on lsx_clients for insert
  with check (agence_id in (select lsx_mes_agences()));
create policy lsx_clients_update on lsx_clients for update
  using (agence_id in (select lsx_mes_agences()));

-- Historique append-only : lecture et insertion pour un membre actif de l'agence du client concerné, jamais d'update/delete
create policy lsx_transitions_select on lsx_dossier_transitions for select
  using (client_id in (select id from lsx_clients where agence_id in (select lsx_mes_agences())));
create policy lsx_transitions_insert on lsx_dossier_transitions for insert
  with check (client_id in (select id from lsx_clients where agence_id in (select lsx_mes_agences())));

-- Fonction de "claim" : lie le compte Supabase Auth (créé au premier login OTP) à la ligne d'invitation existante.
-- SETOF plutôt qu'une ligne unique : évite l'ambiguïté PostgREST entre "aucune ligne" et "ligne aux champs null"
-- (un retour NULL d'un type composite est sérialisé identique à une ligne 100% null par PostgREST).
create function lsx_claim_invite()
returns setof lsx_equipe_membres
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(auth.jwt() ->> 'email');
begin
  update lsx_equipe_membres
    set user_id = auth.uid(), statut = 'actif'
    where lower(email) = v_email and user_id is null;

  return query select * from lsx_equipe_membres where user_id = auth.uid();
end;
$$;

grant execute on function lsx_claim_invite() to authenticated;

-- Seed : ligne d'invitation pour Lyle. Email temporairement sur myattractor1@gmail.com (compte de Mac Arthur,
-- pour tester le flux de connexion avant la démo) — à remplacer par la vraie adresse de Lyle avant le direct.
insert into lsx_equipe_membres (agence_id, email, nom, role, statut)
values ('ls-expertise', 'myattractor1@gmail.com', 'Lyle Soboro', 'direction', 'invite')
on conflict (agence_id, email) do nothing;

-- ─── Écrans par rôle (06/07/2026) — Administration / Production / Social Media Mgmt / Community ───

-- Fonction générique de vérification de rôle : évite de dupliquer lsx_est_direction pour chaque rôle.
create or replace function lsx_a_role(p_agence_id text, p_roles text[])
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists(
    select 1 from lsx_equipe_membres
    where user_id = auth.uid() and statut = 'actif' and agence_id = p_agence_id and role = any(p_roles)
  );
$$;

grant execute on function lsx_a_role(text, text[]) to authenticated;

-- Administration : factures/paiements (section 5 — "factures en attente, paiements en retard, renouvellements à J-30")
create table if not exists lsx_factures (
  id uuid primary key default gen_random_uuid(),
  agence_id text not null default 'ls-expertise',
  client_id uuid not null references lsx_clients(id) on delete cascade,
  type text not null default 'facture' check (type in ('devis','facture','paiement')),
  montant numeric not null,
  statut text not null default 'a_payer' check (statut in ('a_payer','payee','retard')),
  date_echeance date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table lsx_factures enable row level security;

create policy lsx_factures_select on lsx_factures for select
  using (lsx_a_role(agence_id, array['direction','administration']));
create policy lsx_factures_insert on lsx_factures for insert
  with check (lsx_a_role(agence_id, array['direction','administration']));
create policy lsx_factures_update on lsx_factures for update
  using (lsx_a_role(agence_id, array['direction','administration']));

-- Production : missions de tournage réelles (remplace le tableau MISSIONS hardcodé du prototype)
create table if not exists lsx_missions (
  id uuid primary key default gen_random_uuid(),
  agence_id text not null default 'ls-expertise',
  client_id uuid references lsx_clients(id) on delete set null,
  titre text not null,
  assigne_a uuid references auth.users(id),
  date_mission date not null default current_date,
  heure text,
  statut text not null default 'a_faire' check (statut in ('a_faire','en_cours','termine','echec')),
  justif text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table lsx_missions enable row level security;

create policy lsx_missions_select on lsx_missions for select
  using (agence_id in (select lsx_mes_agences()));
create policy lsx_missions_insert on lsx_missions for insert
  with check (lsx_a_role(agence_id, array['direction','production']));
create policy lsx_missions_update on lsx_missions for update
  using (agence_id in (select lsx_mes_agences()) and (assigne_a = auth.uid() or lsx_a_role(agence_id, array['direction'])));

-- Social Media Mgmt + Community : tâches génériques (pas de calendrier éditorial/publication réel —
-- ça nécessite une intégration API réseaux sociaux, explicitement V2 en section 6 de CONCEPTION-DMV.md)
create table if not exists lsx_taches (
  id uuid primary key default gen_random_uuid(),
  agence_id text not null default 'ls-expertise',
  client_id uuid references lsx_clients(id) on delete set null,
  titre text not null,
  type text not null default 'general' check (type in ('strategie','editorial','publication','general')),
  assigne_a uuid references auth.users(id),
  statut text not null default 'a_faire' check (statut in ('a_faire','en_cours','termine')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table lsx_taches enable row level security;

create policy lsx_taches_select on lsx_taches for select
  using (agence_id in (select lsx_mes_agences()));
create policy lsx_taches_insert on lsx_taches for insert
  with check (lsx_a_role(agence_id, array['direction','social_media','community']));
create policy lsx_taches_update on lsx_taches for update
  using (agence_id in (select lsx_mes_agences()) and (assigne_a = auth.uid() or lsx_a_role(agence_id, array['direction'])));

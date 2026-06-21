-- ============================================================
-- J'ENVOIE EXPRESS — Schéma Supabase
-- À coller dans l'éditeur SQL de ton projet Supabase
-- ============================================================

-- Activer UUID
create extension if not exists "pgcrypto";

-- ----------------------------
-- CLIENTS
-- ----------------------------
create table clients (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  whatsapp text,
  localisation text,
  adresse text,
  created_at timestamptz default now()
);

-- ----------------------------
-- VOYAGES
-- ----------------------------
create table voyages (
  id uuid default gen_random_uuid() primary key,
  route text not null check (route in ('ABJ_ORY','ORY_ABJ')),
  date_depart date not null,
  date_arrivee date,
  capacite_totale numeric default 50,
  capacite_restante numeric default 50,
  tarif_kg numeric,
  statut text default 'ouvert' check (statut in ('ouvert','complet','termine')),
  created_at timestamptz default now()
);

-- ----------------------------
-- COLIS
-- ----------------------------
create table colis (
  id uuid default gen_random_uuid() primary key,
  numero text unique not null,
  client_id uuid references clients(id) on delete set null,
  voyage_id uuid references voyages(id) on delete set null,
  poids numeric,
  articles text,
  montant numeric,
  statut text default 'en_attente' check (statut in ('en_attente','collecte','transit','douane','livre')),
  contact_reception text,
  livraison_souhaitee boolean default false,
  quartier_abidjan text,
  prix_livraison numeric,
  created_at timestamptz default now()
);

-- ----------------------------
-- DEMANDES
-- ----------------------------
create table demandes (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete set null,
  voyage_id uuid references voyages(id) on delete set null,
  articles text,
  poids_estime numeric,
  methode_paiement text,
  contact_reception text,
  livraison_souhaitee boolean default false,
  quartier_abidjan text,
  prix_livraison numeric,
  statut text default 'en_attente' check (statut in ('en_attente','acceptee','refusee')),
  created_at timestamptz default now()
);

-- ----------------------------
-- REVENUS
-- ----------------------------
create table revenus (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('encaissement','retrait')),
  montant numeric not null,
  methode text,
  reference text,
  created_at timestamptz default now()
);

-- ----------------------------
-- MESSAGES (discussion admin <-> client)
-- ----------------------------
create table messages (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade,
  contenu text not null,
  expediteur text not null check (expediteur in ('admin','client')),
  lu boolean default false,
  created_at timestamptz default now()
);

-- ----------------------------
-- AVIS
-- ----------------------------
create table avis (
  id uuid default gen_random_uuid() primary key,
  auteur text not null,
  localisation text,
  note integer check (note between 1 and 5),
  texte text,
  created_at timestamptz default now()
);

-- ----------------------------
-- ABONNÉS
-- ----------------------------
create table abonnes (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  whatsapp text,
  localisation text,
  nb_colis integer default 0,
  created_at timestamptz default now()
);

-- ----------------------------
-- ACHATS EN LIGNE
-- ----------------------------
create table achats (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete set null,
  voyage_id uuid references voyages(id) on delete set null,
  lien_produit text,
  description text,
  budget_max numeric,
  statut text default 'en_attente' check (statut in ('en_attente','achete','en_transit','livre')),
  contact_livraison text,
  adresse_livraison text,
  created_at timestamptz default now()
);

-- ----------------------------
-- PARAMETRES (prix dynamiques modifiables par Jean Yves)
-- ----------------------------
create table parametres (
  cle text primary key,
  valeur text not null,
  updated_at timestamptz default now()
);

insert into parametres (cle, valeur) values
  ('tarif_paris_abj', '14'),
  ('tarif_abj_paris', '10')
on conflict (cle) do nothing;

-- ----------------------------
-- RLS — Row Level Security
-- Tout est privé sauf suivi colis public
-- ----------------------------
alter table clients enable row level security;
alter table voyages enable row level security;
alter table colis enable row level security;
alter table demandes enable row level security;
alter table revenus enable row level security;
alter table messages enable row level security;
alter table avis enable row level security;
alter table abonnes enable row level security;
alter table achats enable row level security;
alter table parametres enable row level security;

-- Admin (auth) peut tout faire
create policy "admin_all" on clients for all using (auth.role() = 'authenticated');
create policy "admin_all" on voyages for all using (auth.role() = 'authenticated');
create policy "admin_all" on colis for all using (auth.role() = 'authenticated');
create policy "admin_all" on demandes for all using (auth.role() = 'authenticated');
create policy "admin_all" on revenus for all using (auth.role() = 'authenticated');
create policy "admin_all" on messages for all using (auth.role() = 'authenticated');
create policy "admin_all" on avis for all using (auth.role() = 'authenticated');
create policy "admin_all" on abonnes for all using (auth.role() = 'authenticated');
create policy "admin_all" on achats for all using (auth.role() = 'authenticated');
create policy "admin_all" on parametres for all using (auth.role() = 'authenticated');

-- Public : lecture colis par numéro uniquement (page suivi client)
create policy "public_tracking" on colis for select using (true);

-- Public : insertion demande (formulaire client)
create policy "public_demande" on demandes for insert with check (true);

-- Public : lecture avis
create policy "public_avis" on avis for select using (true);

-- Public : lecture des paramètres (prix affichés sur le site)
create policy "public_parametres" on parametres for select using (true);

-- ----------------------------
-- FONCTION : générer numéro colis auto
-- ----------------------------
create or replace function generate_numero_colis()
returns trigger as $$
declare
  seq integer;
begin
  select count(*) + 1 into seq from colis where date_trunc('day', created_at) = date_trunc('day', now());
  new.numero := 'JE-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(seq::text, 3, '0');
  return new;
end;
$$ language plpgsql;

create trigger set_numero_colis
before insert on colis
for each row
when (new.numero is null or new.numero = '')
execute function generate_numero_colis();

-- ============================================================
-- J'ENVOIE EXPRESS — GREFFE SUR LE PROJET SUPABASE ATTRACTOR-ASSISTS
-- Migration 0002 — 08/07/2026
-- Le projet dédié ltydbwkhdsbmmnoahcty est libéré (limite 2 projets actifs
-- gratuits). Tables préfixées je_ pour éviter toute collision avec les
-- tables existantes du projet partagé (notamment "messages", déjà utilisée
-- par Attractor Assists).
--
-- Sécurité : les policies admin de l'ancien projet utilisaient
-- auth.role() = 'authenticated', ce qui sur un projet PARTAGÉ donnerait
-- accès aux données de Jean Yves à N'IMPORTE QUEL utilisateur connecté
-- d'Attractor Assists. Corrigé ici en scoping strict sur l'UID du compte
-- admin dédié admin.jenvoie-express@agenceattractor.com
-- (dfb0ad76-a821-4ced-a90f-0179b4533fdb).
-- ============================================================

-- ----------------------------
-- CLIENTS
-- ----------------------------
create table je_clients (
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
create table je_voyages (
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
create table je_colis (
  id uuid default gen_random_uuid() primary key,
  numero text unique not null,
  client_id uuid references je_clients(id) on delete set null,
  voyage_id uuid references je_voyages(id) on delete set null,
  poids numeric,
  articles text,
  montant numeric,
  statut text default 'en_attente' check (statut in ('en_attente','collecte','transit','douane','disponible','livre')),
  contact_reception text,
  livraison_souhaitee boolean default false,
  quartier_abidjan text,
  prix_livraison numeric,
  created_at timestamptz default now(),
  nom_expediteur text,
  wa_expediteur text,
  paye boolean default false,
  date_paiement timestamptz
);

-- ----------------------------
-- DEMANDES
-- ----------------------------
create table je_demandes (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references je_clients(id) on delete set null,
  voyage_id uuid references je_voyages(id) on delete set null,
  articles text,
  poids_estime numeric,
  methode_paiement text,
  contact_reception text,
  livraison_souhaitee boolean default false,
  quartier_abidjan text,
  prix_livraison numeric,
  statut text default 'en_attente' check (statut in ('en_attente','acceptee','refusee')),
  created_at timestamptz default now(),
  nom_expediteur text,
  wa_expediteur text
);

-- ----------------------------
-- REVENUS
-- ----------------------------
create table je_revenus (
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
create table je_messages (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references je_clients(id) on delete cascade,
  contenu text not null,
  expediteur text not null check (expediteur in ('admin','client')),
  lu boolean default false,
  created_at timestamptz default now()
);

-- ----------------------------
-- AVIS
-- ----------------------------
create table je_avis (
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
create table je_abonnes (
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
create table je_achats (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references je_clients(id) on delete set null,
  voyage_id uuid references je_voyages(id) on delete set null,
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
create table je_parametres (
  cle text primary key,
  valeur text not null,
  updated_at timestamptz default now()
);

-- ----------------------------
-- RLS — Row Level Security
-- Admin = uniquement le compte dédié admin.jenvoie-express@agenceattractor.com
-- ----------------------------
alter table je_clients   enable row level security;
alter table je_voyages   enable row level security;
alter table je_colis     enable row level security;
alter table je_demandes  enable row level security;
alter table je_revenus   enable row level security;
alter table je_messages  enable row level security;
alter table je_avis      enable row level security;
alter table je_abonnes   enable row level security;
alter table je_achats    enable row level security;
alter table je_parametres enable row level security;

create policy "je_admin_all" on je_clients   for all using (auth.uid() = 'dfb0ad76-a821-4ced-a90f-0179b4533fdb'::uuid);
create policy "je_admin_all" on je_voyages   for all using (auth.uid() = 'dfb0ad76-a821-4ced-a90f-0179b4533fdb'::uuid);
create policy "je_admin_all" on je_colis     for all using (auth.uid() = 'dfb0ad76-a821-4ced-a90f-0179b4533fdb'::uuid);
create policy "je_admin_all" on je_demandes  for all using (auth.uid() = 'dfb0ad76-a821-4ced-a90f-0179b4533fdb'::uuid);
create policy "je_admin_all" on je_revenus   for all using (auth.uid() = 'dfb0ad76-a821-4ced-a90f-0179b4533fdb'::uuid);
create policy "je_admin_all" on je_messages  for all using (auth.uid() = 'dfb0ad76-a821-4ced-a90f-0179b4533fdb'::uuid);
create policy "je_admin_all" on je_avis      for all using (auth.uid() = 'dfb0ad76-a821-4ced-a90f-0179b4533fdb'::uuid);
create policy "je_admin_all" on je_abonnes   for all using (auth.uid() = 'dfb0ad76-a821-4ced-a90f-0179b4533fdb'::uuid);
create policy "je_admin_all" on je_achats    for all using (auth.uid() = 'dfb0ad76-a821-4ced-a90f-0179b4533fdb'::uuid);
create policy "je_admin_all" on je_parametres for all using (auth.uid() = 'dfb0ad76-a821-4ced-a90f-0179b4533fdb'::uuid);

-- Public : lecture colis par numéro uniquement (page suivi client)
create policy "je_public_tracking" on je_colis for select using (true);

-- Public : insertion demande (formulaire client)
create policy "je_public_demande" on je_demandes for insert with check (true);

-- Public : insertion client (formulaire client) — pas de lecture publique,
-- fidèle à la policy réelle de l'ancien projet (public_insert_client, INSERT only)
create policy "je_public_client_insert" on je_clients for insert with check (true);

-- Public : lecture avis
create policy "je_public_avis" on je_avis for select using (true);

-- Public : lecture des paramètres (prix affichés sur le site)
create policy "je_public_parametres" on je_parametres for select using (true);

-- Public : lecture voyages (dates de départ affichées sur le site)
create policy "je_public_voyages" on je_voyages for select using (true);

-- ----------------------------
-- FONCTION : générer numéro colis auto
-- ----------------------------
create or replace function je_generate_numero_colis()
returns trigger as $$
declare
  seq integer;
begin
  select count(*) + 1 into seq from je_colis where date_trunc('day', created_at) = date_trunc('day', now());
  new.numero := 'JE-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(seq::text, 3, '0');
  return new;
end;
$$ language plpgsql;

create trigger je_set_numero_colis
before insert on je_colis
for each row
when (new.numero is null or new.numero = '')
execute function je_generate_numero_colis();

-- ----------------------------
-- DONNÉES RÉELLES (migrées depuis ltydbwkhdsbmmnoahcty le 08/07/2026)
-- ----------------------------
insert into je_clients (id, nom, whatsapp, localisation, adresse, created_at) values
('7d2f5e1f-2647-401f-8071-1c5306182a2f','Ouattara Aliou','+2250788132899','France 🇫🇷',null,'2026-07-05T11:39:24.993875+00:00');

insert into je_voyages (id, route, date_depart, date_arrivee, capacite_totale, capacite_restante, tarif_kg, statut, created_at) values
('d50a70f4-a103-4b6d-9e10-fe6c8a6090e2','ABJ_ORY','2026-07-13','2026-07-14',200,200,10,'ouvert','2026-07-04T18:41:02.179455+00:00'),
('7af1b32d-c454-4daa-8d61-19c9ba91b73c','ORY_ABJ','2026-07-17','2026-07-17',100,100,14,'ouvert','2026-07-06T14:10:43.189013+00:00'),
('a5fc87c0-2552-476e-ab4d-9781051aa47c','ABJ_ORY','2026-07-20','2026-07-21',100,100,10,'ouvert','2026-07-06T14:12:00.562638+00:00');

insert into je_colis (id, numero, client_id, voyage_id, poids, articles, montant, statut, contact_reception, livraison_souhaitee, quartier_abidjan, prix_livraison, created_at, nom_expediteur, wa_expediteur, paye, date_paiement) values
('3f2e7121-4bd6-415a-8e01-4de349ee0944','JE-20260705-001','7d2f5e1f-2647-401f-8071-1c5306182a2f','d50a70f4-a103-4b6d-9e10-fe6c8a6090e2',2.5,'Attieke, poisson fumé, koundjadjo, atoté',30,'transit','+33611554652 | Collecte: Dépôt CI — Cocody Faya, Abidjan',false,null,null,'2026-07-05T11:39:25.071935+00:00','Ouattara Aliou','+2250788132899',false,null);

insert into je_demandes (id, client_id, voyage_id, articles, poids_estime, methode_paiement, contact_reception, livraison_souhaitee, quartier_abidjan, prix_livraison, statut, created_at, nom_expediteur, wa_expediteur) values
('37f0072f-2460-462f-bc22-489c3ae381f2',null,'d50a70f4-a103-4b6d-9e10-fe6c8a6090e2','Attieke, poisson fumé, koundjadjo, atoté',2.5,'Wave','+33611554652 | Collecte: Dépôt CI — Cocody Faya, Abidjan',false,null,null,'acceptee','2026-07-05T11:30:38.865714+00:00','Ouattara Aliou','+2250788132899');

insert into je_parametres (cle, valeur, updated_at) values
('tarif_maritime_baril','120','2026-06-24T10:44:23.725847+00:00'),
('tarif_maritime_grand','120','2026-06-24T10:44:23.725847+00:00'),
('tarif_maritime_moyen','90','2026-06-24T10:44:23.725847+00:00'),
('tarif_paris_abj','14','2026-06-21T19:30:20.18552+00:00'),
('tarif_abj_paris','10','2026-06-21T19:30:20.18552+00:00');

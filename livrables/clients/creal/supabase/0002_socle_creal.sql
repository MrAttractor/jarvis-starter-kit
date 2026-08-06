-- C'Real — socle de tables propres, sortie d'Attractor Assists
-- Écrit le 06/08/2026.
--
-- POURQUOI. Attractor Assists est passé en pause (commit 2a4462c). Toute la
-- boutique de Marie Kezey vivait dans les tables partagées de ce produit :
-- produits_user, orders, conversations, messages, profiles. Une cliente réelle
-- ne reste pas accrochée à un produit qu'on n'entretient plus.
--
-- CONVENTION. Préfixe cr_, comme ay_ chez Ayêla, el_ chez Élévia, bey_ chez
-- Beynaud. La note du fichier 0001 annonçait « creal_ » : c'est cr_ qui est
-- retenu, pour rester dans la famille des huit autres dossiers.
--
-- SÉCURITÉ, le point qui ne se négocie pas.
-- Aucune policy INSERT publique sur cr_commandes. C'est exactement la faille
-- fermée dans Assists le 15/07/2026 (une policy « WITH CHECK (true) » laissait
-- n'importe qui, avec la clé anon qui est publique par nature, insérer une
-- commande chez n'importe quel entrepreneur). Ayêla la porte encore aujourd'hui
-- sous le nom ay_commandes_public_insert : on ne la recopie pas ici.
-- Toute écriture venant du navigateur passe par l'edge function creal-public,
-- en service role, comme vsd-inscription chez VSD.
--
-- Le prompt de Zoé vit dans cr_config et n'est PAS lisible à la clé anon :
-- c'est un actif de l'activité de Kezey, pas une donnée de page.

begin;

-- ── Propriétaire ───────────────────────────────────────────────────────────
-- L'UID de Marie Kezey dans auth.users, table commune aux neuf dossiers.
-- R-21 : on ne touche pas à auth.users, on s'y adosse. Elle garde son
-- identifiant creal.creal21@gmail.com, seul change ce qu'il ouvre.
-- Codé en dur volontairement : une policy qui interroge une autre table pour
-- savoir qui est admin est une policy qu'on peut contourner.

-- ── Catalogue ──────────────────────────────────────────────────────────────
-- Reprend les identifiants d'origine de produits_user, pour ne pas couper le
-- lien avec l'historique Assists.
create table if not exists public.cr_produits (
  id            uuid primary key default gen_random_uuid(),
  nom           text        not null,
  etiquette     text,                       -- « Bestseller », « Sans gluten »…
  prix          integer     not null check (prix >= 0),
  unite         text        not null default 'FCFA',
  categorie     text,
  photo_url     text,                       -- chemin relatif (imgs/…) ou URL Storage
  poids         text,                       -- « 200g », « 4×200g »
  kcal          integer,
  preparation   text,                       -- « 5-10 min »
  description   text,                       -- la ligne courte de la vignette
  detail        text,                       -- le texte du volet de détail
  actif         boolean     not null default true,
  ordre         integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── Commandes ──────────────────────────────────────────────────────────────
-- statut : nouvelle → traitee → annulee. Le décrément de stock se déclenche au
-- passage en « traitee », jamais à la création : ses clientes commandent sur
-- WhatsApp et toutes ne confirment pas.
create table if not exists public.cr_commandes (
  id            uuid primary key default gen_random_uuid(),
  client_nom    text,
  client_wa     text,
  adresse       text,
  lignes        jsonb       not null,       -- [{produit_id, nom, qty, prix_unit, total}]
  total         integer     not null check (total >= 0),
  moyen         text,                       -- 'wave' | 'om'
  statut        text        not null default 'nouvelle'
                check (statut in ('nouvelle','traitee','annulee')),
  traitee_le    timestamptz,
  created_at    timestamptz not null default now()
);

-- ── Stock ──────────────────────────────────────────────────────────────────
create table if not exists public.cr_stock (
  produit_id    uuid primary key references public.cr_produits(id) on delete cascade,
  quantite      integer     not null default 0,
  seuil_alerte  integer     not null default 5,
  updated_at    timestamptz not null default now()
);

-- Le journal explique un écart. Sans lui, un stock faux est indéboguable.
create table if not exists public.cr_stock_mouvements (
  id            uuid primary key default gen_random_uuid(),
  produit_id    uuid        not null references public.cr_produits(id) on delete cascade,
  delta         integer     not null,       -- positif = production, négatif = vente
  motif         text        not null,       -- 'production' | 'commande' | 'correction' | 'perte'
  commande_id   uuid        references public.cr_commandes(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ── Conversations avec Zoé ─────────────────────────────────────────────────
create table if not exists public.cr_conversations (
  id            uuid primary key default gen_random_uuid(),
  titre         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.cr_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid        not null references public.cr_conversations(id) on delete cascade,
  role            text        not null check (role in ('user','assistant')),
  contenu         text        not null,
  created_at      timestamptz not null default now()
);

-- ── Configuration ──────────────────────────────────────────────────────────
-- Une seule ligne. La contrainte l'impose plutôt que de l'espérer.
create table if not exists public.cr_config (
  id            boolean     primary key default true check (id),
  prompt_zoe    text        not null,
  whatsapp      text        not null,       -- format wa.me, sans le +
  lien_wave     text,
  numero_om     text,
  updated_at    timestamptz not null default now()
);

-- ── Index ──────────────────────────────────────────────────────────────────
create index if not exists cr_produits_actif_ordre  on public.cr_produits (actif, ordre);
create index if not exists cr_commandes_statut_date on public.cr_commandes (statut, created_at desc);
create index if not exists cr_commandes_date        on public.cr_commandes (created_at desc);
create index if not exists cr_messages_conv         on public.cr_messages (conversation_id, created_at);
create index if not exists cr_mouvements_produit    on public.cr_stock_mouvements (produit_id, created_at desc);

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table public.cr_produits         enable row level security;
alter table public.cr_commandes        enable row level security;
alter table public.cr_stock            enable row level security;
alter table public.cr_stock_mouvements enable row level security;
alter table public.cr_conversations    enable row level security;
alter table public.cr_messages         enable row level security;
alter table public.cr_config           enable row level security;

-- Le catalogue est la SEULE chose que le public peut lire, et seulement ce qui
-- est actif. Un produit désactivé disparaît de la boutique côté serveur, pas
-- seulement à l'écran.
drop policy if exists cr_produits_public_read on public.cr_produits;
create policy cr_produits_public_read on public.cr_produits
  for select using (actif = true);

-- Kezey, et personne d'autre. Une policy par table, nominative.
drop policy if exists cr_produits_kezey on public.cr_produits;
create policy cr_produits_kezey on public.cr_produits
  for all to authenticated
  using      (auth.uid() = '71752345-6c2f-4a33-a93f-63dcdafb8e51'::uuid)
  with check (auth.uid() = '71752345-6c2f-4a33-a93f-63dcdafb8e51'::uuid);

drop policy if exists cr_commandes_kezey on public.cr_commandes;
create policy cr_commandes_kezey on public.cr_commandes
  for all to authenticated
  using      (auth.uid() = '71752345-6c2f-4a33-a93f-63dcdafb8e51'::uuid)
  with check (auth.uid() = '71752345-6c2f-4a33-a93f-63dcdafb8e51'::uuid);

drop policy if exists cr_stock_kezey on public.cr_stock;
create policy cr_stock_kezey on public.cr_stock
  for all to authenticated
  using      (auth.uid() = '71752345-6c2f-4a33-a93f-63dcdafb8e51'::uuid)
  with check (auth.uid() = '71752345-6c2f-4a33-a93f-63dcdafb8e51'::uuid);

drop policy if exists cr_mouvements_kezey on public.cr_stock_mouvements;
create policy cr_mouvements_kezey on public.cr_stock_mouvements
  for all to authenticated
  using      (auth.uid() = '71752345-6c2f-4a33-a93f-63dcdafb8e51'::uuid)
  with check (auth.uid() = '71752345-6c2f-4a33-a93f-63dcdafb8e51'::uuid);

drop policy if exists cr_conversations_kezey on public.cr_conversations;
create policy cr_conversations_kezey on public.cr_conversations
  for all to authenticated
  using      (auth.uid() = '71752345-6c2f-4a33-a93f-63dcdafb8e51'::uuid)
  with check (auth.uid() = '71752345-6c2f-4a33-a93f-63dcdafb8e51'::uuid);

drop policy if exists cr_messages_kezey on public.cr_messages;
create policy cr_messages_kezey on public.cr_messages
  for all to authenticated
  using      (auth.uid() = '71752345-6c2f-4a33-a93f-63dcdafb8e51'::uuid)
  with check (auth.uid() = '71752345-6c2f-4a33-a93f-63dcdafb8e51'::uuid);

drop policy if exists cr_config_kezey on public.cr_config;
create policy cr_config_kezey on public.cr_config
  for all to authenticated
  using      (auth.uid() = '71752345-6c2f-4a33-a93f-63dcdafb8e51'::uuid)
  with check (auth.uid() = '71752345-6c2f-4a33-a93f-63dcdafb8e51'::uuid);

-- Aucune policy INSERT publique nulle part. C'est délibéré, ne pas « corriger ».

-- ── Horodatage de modification ─────────────────────────────────────────────
create or replace function public.cr_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists cr_produits_touch on public.cr_produits;
create trigger cr_produits_touch before update on public.cr_produits
  for each row execute function public.cr_touch_updated_at();

drop trigger if exists cr_stock_touch on public.cr_stock;
create trigger cr_stock_touch before update on public.cr_stock
  for each row execute function public.cr_touch_updated_at();

drop trigger if exists cr_config_touch on public.cr_config;
create trigger cr_config_touch before update on public.cr_config
  for each row execute function public.cr_touch_updated_at();

commit;

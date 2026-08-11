-- NabyCook — les contenus que Nabintou tient elle-même.
-- Projet Supabase partagé. Tables préfixées nb_. Écriture scopée à son UID.
--
-- Périmètre volontairement restreint : ce qui porte une date ou un chiffre.
-- Les textes de marque restent dans le code du site. Elle vient de les
-- réécrire mot pour mot, elle n'y touchera plus, et une prose modifiable
-- par erreur casse une page bien plus vite qu'un chiffre.
--
-- Principe de repli : le site garde ses valeurs d'origine dans son fichier
-- de configuration. Ces tables ne font que les REMPLACER quand elles
-- contiennent quelque chose. Table vide ou base injoignable = le site
-- affiche ce qu'il affichait avant. Rien ne casse jamais.

-- ---------------------------------------------------------------------------
-- Son identifiant. Déclaré une fois, réutilisé par toutes les policies.
-- Compte nabycook@gmail.com, créé le 30/05/2026, réactivé le 10/08/2026.
-- ---------------------------------------------------------------------------

-- ============================ AGENDA =======================================
create table if not exists public.nb_agenda (
  id           uuid primary key default gen_random_uuid(),
  date_texte   text not null,              -- « 5 septembre 2026 », écrit en clair
  date_tri     date,                       -- sert uniquement au classement
  type         text not null,              -- atelier, forum, marché, événement
  lieu         text,
  description  text,
  lien         text,
  publie       boolean not null default true,
  cree_le      timestamptz not null default now(),
  maj_le       timestamptz not null default now()
);

-- ============================ CHIFFRES D'IMPACT ============================
-- 4 lignes, une par chiffre. Ordre fixe par `rang`.
create table if not exists public.nb_impact (
  id       uuid primary key default gen_random_uuid(),
  rang     int  not null,
  valeur   text not null,                  -- « + de 265 », « 460 kg »
  libelle  text not null,
  maj_le   timestamptz not null default now()
);

-- La date d'arrêté des chiffres, et tout réglage d'un seul tenant.
create table if not exists public.nb_reglages (
  cle     text primary key,
  valeur  text,
  maj_le  timestamptz not null default now()
);

-- ============================ PARTENAIRES ==================================
create table if not exists public.nb_partenaires (
  id      uuid primary key default gen_random_uuid(),
  rang    int  not null default 0,
  nom     text not null,
  logo    text,                            -- URL, vide = le nom s'affiche
  publie  boolean not null default true,
  maj_le  timestamptz not null default now()
);

-- ============================ TEMOIGNAGES ==================================
create table if not exists public.nb_temoignages (
  id      uuid primary key default gen_random_uuid(),
  rang    int  not null default 0,
  texte   text not null,
  auteur  text not null,
  role    text,
  publie  boolean not null default true,
  maj_le  timestamptz not null default now()
);

-- ============================ REVUE DE PRESSE ==============================
create table if not exists public.nb_presse (
  id        uuid primary key default gen_random_uuid(),
  rang      int  not null default 0,
  source    text not null,
  citation  text not null,
  url       text,
  publie    boolean not null default true,
  maj_le    timestamptz not null default now()
);

-- ============================ ETAPES DE L'ASSOCIATION ======================
create table if not exists public.nb_historique (
  id      uuid primary key default gen_random_uuid(),
  rang    int  not null default 0,
  annee   text not null,
  titre   text not null,
  description text,
  publie  boolean not null default true,
  maj_le  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Horodatage tenu côté serveur : elle n'a pas à y penser, et une date de
-- modification écrite par le navigateur ne prouverait rien.
-- ---------------------------------------------------------------------------
create or replace function public.nb_touch() returns trigger
language plpgsql as $$
begin
  new.maj_le = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['nb_agenda','nb_impact','nb_reglages','nb_partenaires',
                           'nb_temoignages','nb_presse','nb_historique']
  loop
    execute format('drop trigger if exists %I_touch_trg on public.%I', t, t);
    execute format('create trigger %I_touch_trg before update on public.%I
                    for each row execute function public.nb_touch()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Sécurité.
--
-- Lecture publique : le site lit avec la clé anon, ce sont des contenus
-- destinés à être affichés. Sur nb_agenda et les tables à `publie`, la
-- lecture publique est filtrée COTE SERVEUR : une ligne dépubliée n'est pas
-- lisible avec la clé anon, elle n'est pas seulement masquée à l'écran.
--
-- Écriture : réservée à son UID, et à personne d'autre. AUCUNE policy
-- d'insertion publique, sur aucune table. C'est la faille qui a déjà été
-- trouvée ailleurs dans ce projet partagé, elle ne se réintroduit pas ici.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  proprio constant text := 'd7dc26c3-531a-4a69-a48a-e33626a4fad5';
begin
  foreach t in array array['nb_agenda','nb_impact','nb_reglages','nb_partenaires',
                           'nb_temoignages','nb_presse','nb_historique']
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I_public_select on public.%I', t, t);
    if t in ('nb_impact','nb_reglages') then
      execute format('create policy %I_public_select on public.%I for select using (true)', t, t);
    else
      execute format('create policy %I_public_select on public.%I for select using (publie = true)', t, t);
    end if;

    execute format('drop policy if exists %I_owner_insert on public.%I', t, t);
    execute format('create policy %I_owner_insert on public.%I for insert
                    with check (auth.uid() = %L)', t, t, proprio);

    execute format('drop policy if exists %I_owner_update on public.%I', t, t);
    execute format('create policy %I_owner_update on public.%I for update
                    using (auth.uid() = %L) with check (auth.uid() = %L)', t, t, proprio, proprio);

    execute format('drop policy if exists %I_owner_delete on public.%I', t, t);
    execute format('create policy %I_owner_delete on public.%I for delete
                    using (auth.uid() = %L)', t, t, proprio);

    -- Elle doit voir ses propres brouillons dans l'administration, or la
    -- policy publique ci-dessus filtre sur publie = true. Sans cette
    -- seconde policy, une ligne dépubliée disparaîtrait de son écran et
    -- deviendrait impossible à republier.
    execute format('drop policy if exists %I_owner_select on public.%I', t, t);
    execute format('create policy %I_owner_select on public.%I for select
                    using (auth.uid() = %L)', t, t, proprio);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Amorçage : on écrit dans la base ce que le site affiche déjà, pour qu'elle
-- retrouve ses chiffres et ses partenaires au premier écran plutôt qu'une
-- page vide. Rejouable sans créer de doublon.
-- ---------------------------------------------------------------------------
insert into public.nb_impact (rang, valeur, libelle)
select * from (values
  (1, '+ de 265', 'participants accueillis en atelier'),
  (2, '460 kg',   'd''invendus sauvés du gaspillage'),
  (3, '5',        'entreprises accompagnées en RSE'),
  (4, '11',       'adhérents et soutiens')
) as v(rang, valeur, libelle)
where not exists (select 1 from public.nb_impact);

insert into public.nb_reglages (cle, valeur)
values ('impact_date', '30 juin 2026')
on conflict (cle) do nothing;

insert into public.nb_partenaires (rang, nom, logo)
select * from (values
  (1, 'Mairie du 20e',                     'assets/partenaires/mairie-20e.jpg'),
  (2, 'Linkee',                            'assets/partenaires/linkee.png'),
  (3, 'Mairie de Villejuif · Ferme Urbaine', null),
  (4, 'Incubateur Baluchon',               null),
  (5, 'ADIE',                              null),
  (6, 'HEC Stand Up',                      null),
  (7, 'LMPVPK',                            null)
) as v(rang, nom, logo)
where not exists (select 1 from public.nb_partenaires);

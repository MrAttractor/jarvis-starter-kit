-- =====================================================================
-- ESPACE COACHING - socle du tunnel d'accompagnement
-- Projet Supabase PARTAGE (lgdgbrivnhgeupqhkckd) - tables prefixees pm_
--
-- Modele d'acces, deux portes et pas une de plus :
--   1. Le coach est authentifie. Policies nominatives sur son UID.
--   2. La personne accompagnee n'est jamais authentifiee. Elle passe par
--      des fonctions SECURITY DEFINER qui prennent son jeton en parametre.
--      Le role anon n'a AUCUN droit sur AUCUNE table de ce fichier.
--
-- Note technique : RLS en "enable", jamais en "force". Avec "force", le
-- proprietaire des tables y serait lui aussi soumis et les fonctions
-- SECURITY DEFINER ci-dessous ne pourraient plus lire leurs propres tables.
--
-- Donnees sensibles : ce sont des notes de coaching. Aucune lecture
-- publique nulle part, aucune policy sur anon, et une purge datee.
-- =====================================================================

-- UID du coach. Un seul praticien aujourd'hui.
-- Si un second coach arrive, cette constante devient une table pm_coachs
-- et les policies passent sur une appartenance, pas sur un UID en dur.

-- ---------------------------------------------------------------------
-- 1. REFERENTIEL DU QUESTIONNAIRE
--    Seede par outils/extraire-cle.mjs depuis le classeur de l'ecole.
--    Ne jamais saisir ces lignes a la main : le classeur fait foi.
-- ---------------------------------------------------------------------

create table if not exists public.pm_types (
  numero int primary key check (numero between 1 and 9),
  nom    text not null
);

create table if not exists public.pm_items (
  numero int primary key check (numero between 1 and 135),
  type   int not null references public.pm_types(numero),
  texte  text not null
);

-- ---------------------------------------------------------------------
-- 2. LE PARCOURS
-- ---------------------------------------------------------------------

create table if not exists public.pm_parcours (
  id           uuid primary key default gen_random_uuid(),
  prenom       text not null,
  nom          text,
  email        text,
  whatsapp     text,
  origine      text,                       -- d'ou vient la demande

  etape        text not null default 'demande'
               check (etape in ('demande','decouverte','engagement',
                                'phase_1','phase_2','phase_3',
                                'cloture','suivi','arrete')),

  -- Lien du questionnaire. 64 caracteres tires au hasard : un lien qui
  -- vaut acces doit etre indevinable, il n'y a pas de mot de passe derriere.
  -- Deux uuid concatenes plutot que pgcrypto, dont le schema d'installation
  -- varie d'un projet a l'autre et casserait ce defaut sans prevenir.
  jeton        text not null unique default (
                 'pm-' || replace(gen_random_uuid()::text, '-', '')
                       || replace(gen_random_uuid()::text, '-', '')),
  jeton_actif  boolean not null default true,

  objectif     text,                       -- l'objectif vérifiable, ecrit avec elle
  indicateurs  jsonb not null default '[]'::jsonb,   -- [{libelle, unite, depart, cible}]
  format       jsonb not null default '{}'::jsonb,   -- {seances, rythme, tarif}
  decryptage   jsonb not null default '{}'::jsonb,   -- le gabarit rempli
  notes        text,

  cree_le      timestamptz not null default now(),
  maj_le       timestamptz,

  -- Borne absolue, independante de toute intervention humaine.
  -- Cette duree doit etre celle ecrite au contrat, sans quoi la promesse ment.
  conservation_jusqu_au date not null default (current_date + interval '24 months')::date
);

create index if not exists pm_parcours_etape_idx on public.pm_parcours(etape);

-- ---------------------------------------------------------------------
-- 3. LES PORTES
--    C'est ce qui fait qu'un tunnel est un tunnel et pas une liste de
--    taches : on ne quitte pas une etape sans avoir pose son livrable.
-- ---------------------------------------------------------------------

create table if not exists public.pm_portes (
  id          uuid primary key default gen_random_uuid(),
  parcours_id uuid not null references public.pm_parcours(id) on delete cascade,
  etape       text not null,
  livrable    text not null,
  note        text,
  franchie_le timestamptz not null default now(),
  unique (parcours_id, etape)
);

-- ---------------------------------------------------------------------
-- 4. LE QUESTIONNAIRE
-- ---------------------------------------------------------------------

create table if not exists public.pm_questionnaires (
  id          uuid primary key default gen_random_uuid(),
  parcours_id uuid not null unique references public.pm_parcours(id) on delete cascade,
  reponses    jsonb not null default '{}'::jsonb,   -- {"1":2,"2":0,...}
  scores      jsonb,                                -- {"1":31,...} calcule a la validation
  statut      text not null default 'envoye'
              check (statut in ('envoye','en_cours','rempli')),
  envoye_le   timestamptz not null default now(),
  rempli_le   timestamptz
);

-- ---------------------------------------------------------------------
-- 5. LES SEANCES
-- ---------------------------------------------------------------------

create table if not exists public.pm_seances (
  id                 uuid primary key default gen_random_uuid(),
  parcours_id        uuid not null references public.pm_parcours(id) on delete cascade,
  numero             int  not null,
  phase              text not null check (phase in ('phase_1','phase_2','phase_3')),
  titre              text,
  objectif_de_seance text,
  protocole          text,
  date_prevue        date,
  date_tenue         date,
  -- {briefing:{points_forts,axes,retour_action}, coeur:{ordinaire,emct,paraverbal},
  --  debriefing:{resume,mot_de_cloture}, echelles:[{libelle,valeur}]}
  notes              jsonb not null default '{}'::jsonb,
  statut             text not null default 'prevue'
                     check (statut in ('prevue','tenue','annulee')),
  cree_le            timestamptz not null default now(),
  unique (parcours_id, numero),

  -- Le fascicule l'ecrit en gras : chaque seance a son objectif de seance.
  -- On ne peut donc pas declarer une seance tenue sans l'avoir formule.
  constraint pm_seances_objectif_obligatoire check (
    statut <> 'tenue'
    or (objectif_de_seance is not null and length(btrim(objectif_de_seance)) > 0)
  )
);

create table if not exists public.pm_actions (
  id        uuid primary key default gen_random_uuid(),
  seance_id uuid not null references public.pm_seances(id) on delete cascade,
  libelle   text not null,
  echeance  date,
  statut    text not null default 'confiee'
            check (statut in ('confiee','faite','non_faite')),
  retour    text,
  cree_le   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6. LE JOURNAL, en ajout seul
-- ---------------------------------------------------------------------

create table if not exists public.pm_journal (
  id          bigserial primary key,
  parcours_id uuid,
  objet       text not null,
  champ       text,
  avant       text,
  apres       text,
  auteur      text,
  horodatage  timestamptz not null default now()
);

create index if not exists pm_journal_parcours_idx on public.pm_journal(parcours_id, horodatage desc);

create or replace function public.pm_journal_immuable()
returns trigger language plpgsql as $$
begin
  raise exception 'Le journal de l''espace coaching est immuable (ajout seul).';
end $$;

drop trigger if exists pm_journal_no_update on public.pm_journal;
create trigger pm_journal_no_update
  before update or delete on public.pm_journal
  for each row execute function public.pm_journal_immuable();

-- ---------------------------------------------------------------------
-- 7. LA REGLE DES PORTES
-- ---------------------------------------------------------------------

create or replace function public.pm_rang_etape(p_etape text)
returns int language sql immutable as $$
  select case p_etape
    when 'demande'     then 1
    when 'decouverte'  then 2
    when 'engagement'  then 3
    when 'phase_1'     then 4
    when 'phase_2'     then 5
    when 'phase_3'     then 6
    when 'cloture'     then 7
    when 'suivi'       then 8
    else null           -- 'arrete' est hors sequence
  end $$;

create or replace function public.pm_etape_suivante(p_etape text)
returns text language sql immutable as $$
  select case p_etape
    when 'demande'    then 'decouverte'
    when 'decouverte' then 'engagement'
    when 'engagement' then 'phase_1'
    when 'phase_1'    then 'phase_2'
    when 'phase_2'    then 'phase_3'
    when 'phase_3'    then 'cloture'
    when 'cloture'    then 'suivi'
    else null
  end $$;

create or replace function public.pm_auteur()
returns text language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email',
    auth.uid()::text,
    'systeme'
  ) $$;

create or replace function public.pm_controle_porte()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_avant int := pm_rang_etape(old.etape);
  v_apres int := pm_rang_etape(new.etape);
begin
  if new.etape = old.etape then
    return new;
  end if;

  -- On peut arreter un parcours a tout moment, et on peut revenir en
  -- arriere pour corriger. Seule l'avancee est controlee.
  if new.etape = 'arrete' or old.etape = 'arrete' or v_apres <= v_avant then
    insert into public.pm_journal(parcours_id, objet, champ, avant, apres, auteur)
    values (new.id, 'parcours', 'etape', old.etape, new.etape, pm_auteur());
    return new;
  end if;

  if v_apres <> v_avant + 1 then
    raise exception 'On n''avance que d''une etape a la fois : % puis %, pas %',
      old.etape, pm_etape_suivante(old.etape), new.etape;
  end if;

  if not exists (select 1 from public.pm_portes where parcours_id = new.id and etape = old.etape) then
    raise exception 'La porte de l''etape % n''est pas franchie : pose son livrable avant d''ouvrir %',
      old.etape, new.etape;
  end if;

  insert into public.pm_journal(parcours_id, objet, champ, avant, apres, auteur)
  values (new.id, 'parcours', 'etape', old.etape, new.etape, pm_auteur());
  return new;
end $$;

drop trigger if exists pm_parcours_porte on public.pm_parcours;
create trigger pm_parcours_porte
  before update of etape on public.pm_parcours
  for each row execute function public.pm_controle_porte();

create or replace function public.pm_touch()
returns trigger language plpgsql as $$
begin new.maj_le := now(); return new; end $$;

drop trigger if exists pm_parcours_touch on public.pm_parcours;
create trigger pm_parcours_touch
  before update on public.pm_parcours
  for each row execute function public.pm_touch();

-- ---------------------------------------------------------------------
-- 8. SECURITE
-- ---------------------------------------------------------------------

alter table public.pm_types          enable row level security;
alter table public.pm_items          enable row level security;
alter table public.pm_parcours       enable row level security;
alter table public.pm_portes         enable row level security;
alter table public.pm_questionnaires enable row level security;
alter table public.pm_seances        enable row level security;
alter table public.pm_actions        enable row level security;
alter table public.pm_journal        enable row level security;

-- Le role anon n'a rien. Pas de policy a ecrire : sans droit de table,
-- une policy ne servirait a rien de toute facon.
revoke all on public.pm_types, public.pm_items, public.pm_parcours,
              public.pm_portes, public.pm_questionnaires, public.pm_seances,
              public.pm_actions, public.pm_journal
  from anon, public;

grant select, insert, update, delete on
  public.pm_types, public.pm_items, public.pm_parcours, public.pm_portes,
  public.pm_questionnaires, public.pm_seances, public.pm_actions
  to authenticated;

grant select, insert on public.pm_journal to authenticated;
grant usage, select on sequence public.pm_journal_id_seq to authenticated;

-- Policies nominatives, une par table, sur le seul UID du coach.
do $$
declare t text;
begin
  foreach t in array array[
    'pm_types','pm_items','pm_parcours','pm_portes',
    'pm_questionnaires','pm_seances','pm_actions','pm_journal'
  ] loop
    execute format('drop policy if exists %I_coach on public.%I;', t, t);
    execute format(
      'create policy %I_coach on public.%I for all to authenticated '
      || 'using (auth.uid() = ''dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9''::uuid) '
      || 'with check (auth.uid() = ''dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9''::uuid);',
      t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 9. LA PORTE DE LA PERSONNE ACCOMPAGNEE
--    Un jeton, trois fonctions, rien d'autre.
-- ---------------------------------------------------------------------

-- Resolution du jeton. Revoquee a tout le monde : seules les fonctions
-- ci-dessous peuvent l'appeler, en interne.
create or replace function public.pm_parcours_par_jeton(p_jeton text)
returns public.pm_parcours
language plpgsql security definer set search_path = public as $$
declare v public.pm_parcours;
begin
  if p_jeton is null or length(p_jeton) < 16 then
    raise exception 'acces refuse';
  end if;
  select * into v from public.pm_parcours where jeton = p_jeton and jeton_actif;
  if not found then
    raise exception 'acces refuse';
  end if;
  return v;
end $$;

revoke all on function public.pm_parcours_par_jeton(text) from public, anon, authenticated;

-- Etat du questionnaire.
--
-- Liste BLANCHE des colonnes renvoyees, jamais une liste noire. Une liste
-- noire ne connait pas les colonnes qu'une migration ajoutera plus tard,
-- et c'est exactement comme cela qu'un jeton d'administration a fuite
-- cinq jours durant sur un autre dossier de l'agence.
create or replace function public.pm_questionnaire_etat(p_jeton text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v public.pm_parcours;
  q public.pm_questionnaires;
begin
  v := pm_parcours_par_jeton(p_jeton);

  select * into q from public.pm_questionnaires where parcours_id = v.id;
  if not found then
    insert into public.pm_questionnaires(parcours_id) values (v.id) returning * into q;
  end if;

  return jsonb_build_object(
    'prenom',   v.prenom,
    'statut',   q.statut,
    'reponses', q.reponses,
    'total',    (select count(*) from public.pm_items),
    'items',    coalesce((
                  select jsonb_agg(jsonb_build_object('numero', i.numero, 'texte', i.texte)
                                   order by i.numero)
                  from public.pm_items i), '[]'::jsonb)
  );
end $$;

-- Enregistrement d'une reponse. Appelee a chaque clic : c'est la
-- sauvegarde continue qui evite qu'un abandon a l'item 90 ne coute tout.
create or replace function public.pm_questionnaire_repondre(p_jeton text, p_item int, p_note int)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v public.pm_parcours;
  q public.pm_questionnaires;
begin
  v := pm_parcours_par_jeton(p_jeton);

  if p_note is null or p_note < 0 or p_note > 3 then
    raise exception 'note hors bornes';
  end if;
  if not exists (select 1 from public.pm_items where numero = p_item) then
    raise exception 'item inconnu';
  end if;

  select * into q from public.pm_questionnaires where parcours_id = v.id for update;
  if not found then
    insert into public.pm_questionnaires(parcours_id) values (v.id) returning * into q;
  end if;
  if q.statut = 'rempli' then
    raise exception 'questionnaire deja valide';
  end if;

  update public.pm_questionnaires
     set reponses = q.reponses || jsonb_build_object(p_item::text, p_note),
         statut   = 'en_cours'
   where id = q.id
   returning * into q;

  return jsonb_build_object('enregistrees', (select count(*) from jsonb_object_keys(q.reponses)));
end $$;

-- Validation. Calcule les scores en base, puis eteint le jeton.
-- Le score n'est jamais renvoye a la personne : elle le recoit en seance.
create or replace function public.pm_questionnaire_valider(p_jeton text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v      public.pm_parcours;
  q      public.pm_questionnaires;
  v_att  int;
  v_scores jsonb;
begin
  v := pm_parcours_par_jeton(p_jeton);

  select * into q from public.pm_questionnaires where parcours_id = v.id for update;
  if not found then raise exception 'questionnaire introuvable'; end if;
  if q.statut = 'rempli' then raise exception 'questionnaire deja valide'; end if;

  select count(*) into v_att from public.pm_items;
  if (select count(*) from jsonb_object_keys(q.reponses)) <> v_att then
    raise exception 'questionnaire incomplet';
  end if;

  select jsonb_object_agg(t.type::text, t.somme) into v_scores
  from (
    select i.type, sum((q.reponses ->> i.numero::text)::int) as somme
    from public.pm_items i
    group by i.type
  ) t;

  update public.pm_questionnaires
     set scores = v_scores, statut = 'rempli', rempli_le = now()
   where id = q.id;

  -- Le lien ne sert qu'une fois.
  update public.pm_parcours set jeton_actif = false where id = v.id;

  insert into public.pm_journal(parcours_id, objet, champ, apres, auteur)
  values (v.id, 'questionnaire', 'statut', 'rempli', 'la personne accompagnee');

  return jsonb_build_object('valide', true);
end $$;

grant execute on function
  public.pm_questionnaire_etat(text),
  public.pm_questionnaire_repondre(text, int, int),
  public.pm_questionnaire_valider(text)
  to anon, authenticated;

-- ---------------------------------------------------------------------
-- 10. LA PURGE
--     Bornee dans le temps, sans intervention humaine. Le journal garde
--     la trace de l'effacement, ecrite APRES l'effacement et sans aucune
--     donnee personnelle : une preuve de suppression ne doit pas
--     ressusciter ce qu'elle prouve avoir supprime.
-- ---------------------------------------------------------------------

create or replace function public.pm_purger()
returns int language plpgsql security definer set search_path = public as $$
declare v_ids uuid[]; v_n int;
begin
  select array_agg(id) into v_ids
  from public.pm_parcours
  where conservation_jusqu_au < current_date;

  if v_ids is null then return 0; end if;

  delete from public.pm_parcours where id = any(v_ids);
  get diagnostics v_n = row_count;

  insert into public.pm_journal(parcours_id, objet, champ, apres, auteur)
  select unnest(v_ids), 'parcours', 'purge', 'efface', 'purge automatique';

  return v_n;
end $$;

revoke all on function public.pm_purger() from public, anon, authenticated;

-- Planification. A executer une fois pg_cron disponible sur le projet :
--   select cron.schedule('pm-purge', '30 3 * * *', 'select public.pm_purger();');

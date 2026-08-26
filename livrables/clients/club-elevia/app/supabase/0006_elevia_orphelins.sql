-- ============================================================
-- Club Privé Élévia — la vidéo suit la ligne, ou elle est effacée
--
-- Trou constaté le 19/08/2026, corrigé le 26/08/2026.
--
-- Supprimer un membre efface sa demande de vérification par « on delete
-- cascade ». Mais la purge des vidéos travaille À PARTIR DES LIGNES : plus de
-- ligne, plus de chemin, donc el_videos_a_purger() ne voit plus rien et le
-- fichier reste dans le stockage POUR TOUJOURS, sans que rien ne le signale.
-- La politique de confidentialité publiée promet pourtant au membre de pouvoir
-- supprimer son compte et ses données. Une donnée qu'on a promis d'effacer et
-- qu'on garde sans le savoir est le pire des manquements : plus rien ne la
-- référence, donc plus personne ne la voit.
--
-- Deuxième trou, du même ordre et découvert en écrivant celui-ci : entre
-- « demarrer » et « soumettre », la vidéo est déjà déposée alors que la colonne
-- chemin est encore vide. Une personne qui enregistre puis abandonne laisse donc
-- un fichier que rien ne référence non plus. Ce cas est traité par le balayage
-- (action « balayer » de l'edge function), pas par le déclencheur.
--
-- Ordre de robustesse retenu (R-76) : on prévient avec le déclencheur, on
-- rattrape avec le balayage. Le rattrapage seul ne suffit pas.
-- ============================================================

-- ── La file des fichiers à effacer ─────────────────────────
-- Le stockage n'est pas accessible depuis SQL : le déclencheur ne peut donc pas
-- effacer l'objet lui-même. Il inscrit le chemin ici, et l'edge function vide
-- cette file à chaque passage, exactement comme pour les vidéos décidées.
create table if not exists public.el_fichiers_orphelins (
  id        uuid primary key default gen_random_uuid(),
  chemin    text not null unique,
  motif     text not null,
  cree_le   timestamptz not null default now(),
  purge_le  timestamptz
);

create index if not exists el_orphelins_a_faire_idx
  on public.el_fichiers_orphelins(cree_le) where purge_le is null;

alter table public.el_fichiers_orphelins enable row level security;
-- Aucune policy : rien n'est lisible à la clé publique, tout passe par
-- l'edge function en service role.

-- ── Le déclencheur ─────────────────────────────────────────
-- Se déclenche aussi lors d'une suppression en cascade, c'est tout l'objet.
-- Une ligne déjà purgée a chemin = null : elle n'inscrit donc rien.
create or replace function public.el_signaler_fichier_orphelin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.chemin is not null and old.purgee_le is null then
    insert into public.el_fichiers_orphelins(chemin, motif)
    values (old.chemin, 'ligne supprimee')
    on conflict (chemin) do nothing;
  end if;
  return old;
end;
$$;

drop trigger if exists el_verif_avant_suppression on public.el_verifications;
create trigger el_verif_avant_suppression
  before delete on public.el_verifications
  for each row execute function public.el_signaler_fichier_orphelin();

-- ── Ce que l'edge function vient chercher ──────────────────
create or replace function public.el_orphelins_a_purger()
returns table(id uuid, chemin text, motif text)
language sql
security definer
set search_path = public
as $$
  select o.id, o.chemin, o.motif
  from public.el_fichiers_orphelins o
  where o.purge_le is null
  order by o.cree_le
  limit 200;
$$;

-- Marqué APRÈS l'effacement réel, jamais avant : sinon la preuve mentirait (R-54).
create or replace function public.el_marquer_orphelins_purges(ids uuid[])
returns int
language sql
security definer
set search_path = public
as $$
  with maj as (
    update public.el_fichiers_orphelins
    set purge_le = now()
    where id = any(ids) and purge_le is null
    returning 1
  )
  select count(*)::int from maj;
$$;

-- ── Le balayage : quels chemins la base connaît-elle encore ─
-- L'edge function liste le stockage et demande ici lesquels sont référencés.
-- Tout le reste est un fichier que plus rien ne réclame.
create or replace function public.el_chemins_references(chemins text[])
returns table(chemin text)
language sql
security definer
set search_path = public
as $$
  select v.chemin
  from public.el_verifications v
  where v.chemin = any(chemins)
$$;

-- ── Droits ─────────────────────────────────────────────────
-- Postgres accorde l'exécution à public par défaut à la création : on retire
-- d'abord, on n'accorde à personne, ces fonctions ne servent qu'au service role
-- (R-68).
revoke all on function public.el_signaler_fichier_orphelin()        from public, anon, authenticated;
revoke all on function public.el_orphelins_a_purger()               from public, anon, authenticated;
revoke all on function public.el_marquer_orphelins_purges(uuid[])   from public, anon, authenticated;
revoke all on function public.el_chemins_references(text[])         from public, anon, authenticated;

comment on table public.el_fichiers_orphelins is
  'Fichiers du stockage dont la ligne a disparu. Vidée par l''edge function ; sans elle, la vidéo d''un membre supprimé resterait indéfiniment.';

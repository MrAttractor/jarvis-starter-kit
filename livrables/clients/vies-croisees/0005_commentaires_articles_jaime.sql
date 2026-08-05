-- ============================================================================
-- Vies Croisées — migration 0005 (05/08/2026)
--
-- Deux manques relevés par Andréa après la mise en ligne :
--   1. on pouvait commenter un épisode, mais pas un article. Le lecteur
--      arrivait au bout d'une chronique et n'avait rien pour réagir ;
--   2. il n'y avait aucun moyen de dire « j'aime » sans écrire un commentaire,
--      alors que c'est le geste le plus fréquent et le plus facile à obtenir
--      sur un site qui démarre sans audience.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. COMMENTAIRES — la cible peut être un article
--    La table ne connaissait que `episode_id`. On ajoute `article_id` et on
--    impose qu'une ligne pointe vers un seul contenu : sans cette contrainte,
--    un commentaire orphelin (les deux colonnes vides) resterait invisible
--    partout sauf dans la boîte d'Andréa.
-- ----------------------------------------------------------------------------
alter table vc_commentaires
  add column if not exists article_id uuid references vc_articles(id) on delete cascade;

alter table vc_commentaires drop constraint if exists vc_com_une_seule_cible;
alter table vc_commentaires add constraint vc_com_une_seule_cible
  check (num_nonnulls(episode_id, article_id) = 1);

create index if not exists vc_com_article_idx on vc_commentaires(article_id);
create index if not exists vc_com_episode_idx on vc_commentaires(episode_id);

-- Les policies de la migration 0003 portent sur la table entière (lecture
-- publique des seuls commentaires approuvés, insertion forcée à visible=false,
-- tout le reste réservé à Andréa) : elles couvrent les articles sans retouche.

-- ----------------------------------------------------------------------------
-- 2. J'AIME
--    Pas de compte visiteur sur ce site : l'identité d'un lecteur est un
--    identifiant aléatoire gardé par son navigateur. Il sert uniquement à
--    éviter qu'une même personne compte dix fois et à lui permettre de retirer
--    son geste.
-- ----------------------------------------------------------------------------
create table if not exists vc_likes (
  id          uuid default gen_random_uuid() primary key,
  cible_type  text not null check (cible_type in ('article', 'episode')),
  cible_id    uuid not null,
  visiteur    uuid not null,
  created_at  timestamptz default now(),
  unique (cible_type, cible_id, visiteur)
);

create index if not exists vc_likes_cible_idx on vc_likes(cible_type, cible_id);

alter table vc_likes enable row level security;

drop policy if exists "vc_like_public_read" on vc_likes;
drop policy if exists "vc_like_admin" on vc_likes;

-- Lecture publique : elle ne sert qu'à afficher un compteur.
create policy "vc_like_public_read" on vc_likes
  for select using (true);

create policy "vc_like_admin" on vc_likes
  for all using (auth.uid() = '22fcae86-0576-4bd8-b615-5df9e9458daa'::uuid)
          with check (auth.uid() = '22fcae86-0576-4bd8-b615-5df9e9458daa'::uuid);

-- Le visiteur d'une ligne n'est jamais renvoyé au public : connaître cet
-- identifiant permettrait de retirer le « j'aime » de quelqu'un d'autre en
-- appelant la fonction ci-dessous à sa place. Les droits par colonne sont le
-- seul niveau où Postgres sait le refuser, RLS ne filtre que des lignes.
revoke all on vc_likes from anon;
grant select (id, cible_type, cible_id, created_at) on vc_likes to anon;
grant select, insert, update, delete on vc_likes to authenticated;

-- Le public n'écrit pas dans la table directement : il passe par cette
-- fonction, qui n'agit que sur SA propre ligne et renvoie le nouveau total.
create or replace function vc_basculer_jaime(p_type text, p_cible uuid, p_visiteur uuid)
returns table (total integer, aime boolean)
language plpgsql
security definer
set search_path = public
as $$
declare v_retire integer;
begin
  if p_type not in ('article', 'episode') then
    raise exception 'Type de contenu inconnu';
  end if;

  delete from vc_likes
   where cible_type = p_type and cible_id = p_cible and visiteur = p_visiteur;
  get diagnostics v_retire = row_count;

  if v_retire = 0 then
    insert into vc_likes (cible_type, cible_id, visiteur)
    values (p_type, p_cible, p_visiteur)
    on conflict do nothing;
  end if;

  return query
    select count(*)::integer, (v_retire = 0)
      from vc_likes
     where cible_type = p_type and cible_id = p_cible;
end;
$$;

revoke all on function vc_basculer_jaime(text, uuid, uuid) from public;
grant execute on function vc_basculer_jaime(text, uuid, uuid) to anon, authenticated;

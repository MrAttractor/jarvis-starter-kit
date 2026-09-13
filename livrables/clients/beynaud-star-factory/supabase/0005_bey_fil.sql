-- ============================================================
-- 0005 — LE FIL : coeurs et commentaires sur n'importe quel post
-- ------------------------------------------------------------
-- Avant : bey_reactions et bey_commentaires ne pouvaient viser
-- qu'un "mot de Serge" (colonne message_id, cle etrangere en dur
-- vers bey_messages). Une photo ne pouvait pas etre likee, une
-- video ne pouvait pas etre commentee.
--
-- Apres : les deux tables visent un couple (cible_type, cible_id),
-- donc tout element du fil se like et se commente de la meme facon.
--
-- Le prix a payer, et il est traite plus bas : en retirant la cle
-- etrangere on perd la suppression en cascade. Supprimer un message
-- laisserait ses coeurs et ses commentaires orphelins, invisibles et
-- indestructibles. C'est exactement le defaut releve sur Elevia
-- (R-76). Des declencheurs prennent le relais de la cascade.
-- ============================================================

-- ---------- 1. bey_reactions ----------
alter table public.bey_reactions add column if not exists cible_type text;
alter table public.bey_reactions add column if not exists cible_id   uuid;

update public.bey_reactions
   set cible_type = 'message', cible_id = message_id
 where cible_id is null;

alter table public.bey_reactions alter column cible_type set not null;
alter table public.bey_reactions alter column cible_id   set not null;

alter table public.bey_reactions drop constraint if exists bey_reactions_pkey;
-- retirer la colonne emporte aussi sa cle etrangere vers bey_messages
alter table public.bey_reactions drop column if exists message_id;

alter table public.bey_reactions
  add constraint bey_reactions_pkey primary key (cible_type, cible_id, membre_id);
alter table public.bey_reactions
  add constraint bey_reactions_cible_type_chk
  check (cible_type in ('message','photo','contenu','sondage'));

drop index if exists public.bey_react_msg_idx;
create index if not exists bey_reactions_cible_idx
  on public.bey_reactions (cible_type, cible_id);

-- ---------- 2. bey_commentaires ----------
alter table public.bey_commentaires add column if not exists cible_type text;
alter table public.bey_commentaires add column if not exists cible_id   uuid;

update public.bey_commentaires
   set cible_type = 'message', cible_id = message_id
 where cible_id is null;

alter table public.bey_commentaires alter column cible_type set not null;
alter table public.bey_commentaires alter column cible_id   set not null;

alter table public.bey_commentaires drop column if exists message_id;

alter table public.bey_commentaires
  add constraint bey_commentaires_cible_type_chk
  check (cible_type in ('message','photo','contenu','sondage'));

drop index if exists public.bey_comm_msg_idx;
create index if not exists bey_commentaires_cible_idx
  on public.bey_commentaires (cible_type, cible_id, created_at);

-- ---------- 3. La cascade, reconstruite en declencheurs ----------
-- Sans cle etrangere, plus de "on delete cascade". Ces declencheurs
-- font le meme travail, pour les quatre types de post.
create or replace function public.bey_purge_engagement()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  delete from public.bey_reactions
   where cible_type = tg_argv[0] and cible_id = old.id;
  delete from public.bey_commentaires
   where cible_type = tg_argv[0] and cible_id = old.id;
  return old;
end
$fn$;

drop trigger if exists bey_messages_purge on public.bey_messages;
create trigger bey_messages_purge after delete on public.bey_messages
  for each row execute function public.bey_purge_engagement('message');

drop trigger if exists bey_photos_purge on public.bey_photos;
create trigger bey_photos_purge after delete on public.bey_photos
  for each row execute function public.bey_purge_engagement('photo');

drop trigger if exists bey_contenus_purge on public.bey_contenus;
create trigger bey_contenus_purge after delete on public.bey_contenus
  for each row execute function public.bey_purge_engagement('contenu');

drop trigger if exists bey_sondages_purge on public.bey_sondages;
create trigger bey_sondages_purge after delete on public.bey_sondages
  for each row execute function public.bey_purge_engagement('sondage');

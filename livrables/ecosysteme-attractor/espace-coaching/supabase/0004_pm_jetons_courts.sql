-- =====================================================================
-- ESPACE COACHING - des liens envoyables
--
-- Le jeton faisait 67 caracteres, ce qui donnait une adresse de 107
-- caracteres. Dans un message WhatsApp, elle se coupe sur deux lignes et
-- elle ressemble a un lien piege. Un lien qu'on n'ose pas envoyer est un
-- lien qui ne sert a rien.
--
-- 20 caracteres hexadecimaux, soit environ 80 bits tires au hasard. Une
-- adresse tombe a 60 caracteres et reste indevinable : il n'y a aucune
-- page qui liste les jetons, aucune enumeration possible, et le jeton
-- s'eteint a la validation.
-- =====================================================================

alter table public.pm_parcours
  alter column jeton set default substr(replace(gen_random_uuid()::text, '-', ''), 1, 20);

-- Le seuil de longueur descend, sinon les nouveaux jetons seraient refuses.
-- Il reste un garde-fou contre les jetons vides ou tronques a la main.
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

-- ---------------------------------------------------------------------
-- Regenerer un lien
--
-- Utile quand un lien a ete envoye au mauvais destinataire, ou qu'on n'est
-- plus sur de ou il a circule. L'ancien cesse de fonctionner sur le champ.
-- ---------------------------------------------------------------------

create or replace function public.pm_regenerer_jeton(p_parcours uuid)
returns text
language plpgsql security definer set search_path = public as $$
declare v_nouveau text; v_statut text;
begin
  -- « is distinct from », jamais « <> ».
  -- Avec la cle publique, auth.uid() vaut NULL, et « NULL <> uuid » vaut NULL,
  -- ce qui n'est pas vrai : la condition ne se declenchait pas et la fonction
  -- s'executait pour tout le monde. Une comparaison d'identite ne se fait
  -- jamais avec un operateur qui peut renvoyer NULL.
  if auth.uid() is distinct from 'dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9'::uuid then
    raise exception 'acces refuse';
  end if;

  select statut into v_statut from public.pm_questionnaires where parcours_id = p_parcours;
  if v_statut = 'rempli' then
    raise exception 'ce questionnaire est deja rempli : regenerer le lien ne le rouvrirait pas';
  end if;

  v_nouveau := substr(replace(gen_random_uuid()::text, '-', ''), 1, 20);
  update public.pm_parcours
     set jeton = v_nouveau, jeton_actif = true
   where id = p_parcours;

  insert into public.pm_journal(parcours_id, objet, champ, apres, auteur)
  values (p_parcours, 'lien', 'jeton', 'regenere', pm_auteur());

  return v_nouveau;
end $$;

-- Postgres accorde l'execution a tout le monde par defaut a la creation d'une
-- fonction. Sans ce retrait, la ligne « grant to authenticated » ci-dessous ne
-- restreint rien du tout : anon herite du droit accorde a public.
revoke all on function public.pm_regenerer_jeton(uuid) from public, anon;
grant execute on function public.pm_regenerer_jeton(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- Raccourcir les liens qui n'ont pas encore servi
--
-- On ne touche a rien de ce qui a deja circule ou commence a etre rempli :
-- un lien deja envoye qui cesserait de fonctionner serait pire que long.
-- ---------------------------------------------------------------------

update public.pm_parcours p
   set jeton = substr(replace(gen_random_uuid()::text, '-', ''), 1, 20)
 where length(p.jeton) > 40
   and not exists (select 1 from public.pm_questionnaires q where q.parcours_id = p.id);

-- ============================================================
-- GetWinWorld — Plusieurs photos par produit (25/09/2026)
-- Projet : lgdgbrivnhgeupqhkckd (Attractor Assists — projet partagé)
-- ============================================================
--
-- Constat : Charles créait une fiche par photo (18 fiches « Ensemble Sac,
-- Chaussures AS » le 24/09). `photos` porte la liste ordonnée, la première
-- est la photo principale. `photo_url` reste renseignée (= photos[1]) pour
-- tout ce qui ne lit qu'une photo : panier, message WhatsApp, purge.
-- ============================================================

alter table public.gw_produits
  add column if not exists photos text[] not null default '{}';

update public.gw_produits
   set photos = array[photo_url]
 where cardinality(photos) = 0 and photo_url is not null;

create or replace function public.gw_produits_sync_photos()
returns trigger language plpgsql as $$
begin
  if new.photos is null or cardinality(new.photos) = 0 then
    new.photos := case when new.photo_url is null then '{}' else array[new.photo_url] end;
  else
    new.photo_url := new.photos[1];
  end if;
  return new;
end $$;

drop trigger if exists gw_produits_sync_photos on public.gw_produits;
create trigger gw_produits_sync_photos
  before insert or update on public.gw_produits
  for each row execute function public.gw_produits_sync_photos();

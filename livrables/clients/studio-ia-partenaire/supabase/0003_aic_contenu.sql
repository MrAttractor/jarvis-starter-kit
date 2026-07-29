-- Agence Innovation Créative — Contenus du site pilotés par Emmanuel Yao.
-- Textes, chiffres, liens de paiement et vidéo d'accueil modifiables depuis /admin.
-- Projet Supabase partagé attractor-assists. Écriture scopée à l'UID d'Emmanuel.
--
-- Principe : le HTML du site garde ses textes d'origine. Cette table ne contient
-- QUE ce qu'Emmanuel a modifié. Une clé absente = le site affiche son texte d'origine.
-- Conséquence voulue : la table vide ne casse rien, et « remettre d'origine » = supprimer la ligne.

create table if not exists public.aic_contenu (
  cle text primary key,
  valeur text,
  updated_at timestamptz not null default now()
);

alter table public.aic_contenu enable row level security;

-- Lecture publique : le site vitrine lit ces valeurs avec la clé anon.
drop policy if exists aic_contenu_public_select on public.aic_contenu;
create policy aic_contenu_public_select on public.aic_contenu for select
  using (true);

-- Écriture réservée à Emmanuel.
drop policy if exists aic_contenu_owner_insert on public.aic_contenu;
create policy aic_contenu_owner_insert on public.aic_contenu for insert
  with check (auth.uid() = 'b1635d9d-e970-4293-9674-871cde1e639a');

drop policy if exists aic_contenu_owner_update on public.aic_contenu;
create policy aic_contenu_owner_update on public.aic_contenu for update
  using (auth.uid() = 'b1635d9d-e970-4293-9674-871cde1e639a')
  with check (auth.uid() = 'b1635d9d-e970-4293-9674-871cde1e639a');

drop policy if exists aic_contenu_owner_delete on public.aic_contenu;
create policy aic_contenu_owner_delete on public.aic_contenu for delete
  using (auth.uid() = 'b1635d9d-e970-4293-9674-871cde1e639a');

-- updated_at tenu à jour côté serveur (l'admin n'a pas à y penser).
create or replace function public.aic_contenu_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists aic_contenu_touch_trg on public.aic_contenu;
create trigger aic_contenu_touch_trg before update on public.aic_contenu
  for each row execute function public.aic_contenu_touch();

-- ---------------------------------------------------------------------------
-- Garde-fou de poids sur le bucket média.
-- Sans limite, un export brut de CapCut (100-200 Mo) passerait et rendrait
-- l'ouverture du site inutilisable sur une connexion mobile ivoirienne.
-- 25 Mo = large pour une vidéo d'accueil compressée (l'actuelle fait 2,8 Mo),
-- et assez bas pour empêcher l'accident. L'admin avertit dès 6 Mo.
update storage.buckets
   set file_size_limit = 26214400
 where id = 'aic-media';

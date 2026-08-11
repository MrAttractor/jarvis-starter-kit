-- NabyCook — les demandes de partenariat magasin.
-- Remplace le formulaire Jotform, qui sortait du site et de sa charte,
-- et dont les réponses vivaient chez un tiers.
--
-- Questions reprises telles quelles depuis le formulaire Jotform
-- « Devenir partenaire Nabycook - Ateliers en magasin », pour ne rien
-- perdre de ce qu'elle avait déjà réfléchi.

create table if not exists public.nb_demandes (
  id            uuid primary key default gen_random_uuid(),
  recue_le      timestamptz not null default now(),

  -- Le magasin
  enseigne      text not null,
  type_commerce text,
  adresse       text not null,
  frequentation text,

  -- Le contact
  contact_nom   text not null,
  contact_email text not null,
  contact_tel   text,

  -- Le projet
  formats       text[],          -- plusieurs choix possibles
  frequence     text,
  dates         text,
  themes        text,
  apports       text[],          -- plusieurs choix possibles
  budget        text,
  origine       text,

  -- Son suivi
  statut        text not null default 'nouvelle'
                check (statut in ('nouvelle','en cours','acceptee','refusee')),
  note          text,
  maj_le        timestamptz not null default now()
);

create index if not exists nb_demandes_recue_idx on public.nb_demandes (recue_le desc);

alter table public.nb_demandes enable row level security;

-- ---------------------------------------------------------------------------
-- AUCUNE policy publique, ni en lecture ni en écriture.
--
-- En lecture : ce sont des coordonnées de commerçants, elles n'ont rien à
-- faire derrière une clé publique lisible dans la page.
--
-- En écriture : c'est la faille classique. Une policy d'insertion publique
-- laisserait n'importe qui remplir la table depuis un terminal. Le dépôt
-- passe donc par la fonction `nb-demande`, qui écrit avec la clé de service
-- et valide avant d'insérer.
-- ---------------------------------------------------------------------------
do $$
declare proprio constant text := 'd7dc26c3-531a-4a69-a48a-e33626a4fad5';
begin
  execute format('drop policy if exists nb_demandes_owner_select on public.nb_demandes');
  execute format('create policy nb_demandes_owner_select on public.nb_demandes for select
                  using (auth.uid() = %L)', proprio);

  execute format('drop policy if exists nb_demandes_owner_update on public.nb_demandes');
  execute format('create policy nb_demandes_owner_update on public.nb_demandes for update
                  using (auth.uid() = %L) with check (auth.uid() = %L)', proprio, proprio);

  execute format('drop policy if exists nb_demandes_owner_delete on public.nb_demandes');
  execute format('create policy nb_demandes_owner_delete on public.nb_demandes for delete
                  using (auth.uid() = %L)', proprio);
end $$;

drop trigger if exists nb_demandes_touch_trg on public.nb_demandes;
create trigger nb_demandes_touch_trg before update on public.nb_demandes
  for each row execute function public.nb_touch();

-- NabyCook — les inscriptions à la lettre d'information.
--
-- Décision du 11/08/2026 : Brevo est écarté. La clé d'API qu'il aurait
-- fallu poser dans la page est lisible par n'importe quel visiteur, et
-- une dépendance externe de plus pour capturer un email n'en valait pas
-- la peine. On stocke les adresses ici, elle les exporte quand elle veut.

create table if not exists public.nb_lettre (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  prenom      text,
  inscrit_le  timestamptz not null default now(),
  source      text,                       -- la page d'où vient l'inscription
  actif       boolean not null default true
);

-- Une adresse ne s'inscrit qu'une fois. Sans cette contrainte, un clic
-- répété créerait des doublons et fausserait son compteur d'abonnés.
create unique index if not exists nb_lettre_email_idx
  on public.nb_lettre (lower(email));

alter table public.nb_lettre enable row level security;

-- Aucune policy publique : ni lecture ni écriture.
-- Une liste d'emails derrière une clé publique est une fuite de données.
-- L'inscription passe par la fonction `nb-lettre`.
do $$
declare proprio constant text := 'd7dc26c3-531a-4a69-a48a-e33626a4fad5';
begin
  execute format('drop policy if exists nb_lettre_owner_select on public.nb_lettre');
  execute format('create policy nb_lettre_owner_select on public.nb_lettre for select
                  using (auth.uid() = %L)', proprio);

  execute format('drop policy if exists nb_lettre_owner_update on public.nb_lettre');
  execute format('create policy nb_lettre_owner_update on public.nb_lettre for update
                  using (auth.uid() = %L) with check (auth.uid() = %L)', proprio, proprio);

  execute format('drop policy if exists nb_lettre_owner_delete on public.nb_lettre');
  execute format('create policy nb_lettre_owner_delete on public.nb_lettre for delete
                  using (auth.uid() = %L)', proprio);
end $$;

-- 0064_securite_profiles_privileges.sql
-- Escalade de privilèges fermée le 28/07/2026.
--
-- CE QUI ÉTAIT OUVERT
-- La policy « profiles self update » autorise chacun à écrire sa propre ligne
-- (USING auth.uid() = id) sans restreindre les colonnes. Or `profiles` porte
-- `role`, `plan_code` et `plan_tier`. N'importe quel inscrit pouvait donc, depuis
-- son navigateur, exécuter :
--     update profiles set role = 'admin' where id = auth.uid();
-- et déclencher is_admin(), qui ouvre 8 policies sur 6 tables (profils de TOUS
-- les utilisateurs, notifications, abonnements, usage, base de connaissance) plus
-- le Cockpit admin côté application. Ou, plus discrètement, se donner le plan
-- payant sans payer.
--
-- CE QUI S'EST PASSÉ
-- Deux comptes automatisés (mass_lgdgbriv_60748@ues.edu.pl le 20/07/2026 à 15:19
-- et pwn_lgdgbrivnhge@ues.edu.pl à 15:31, connexion 0,1 s après création, nom du
-- projet Supabase encodé dans l'adresse) ont tenté l'escalade et posé
-- role = 'superadmin'. is_admin() ne reconnaît que 'admin' : ils n'ont rien
-- obtenu. Les deux comptes sont supprimés plus bas.
--
-- POURQUOI UN DÉCLENCHEUR ET PAS UNE POLICY
-- RLS ne sait pas restreindre l'écriture colonne par colonne. Un WITH CHECK qui
-- comparerait à la valeur existante devrait relire `profiles`, donc repasser par
-- RLS. Un déclencheur BEFORE UPDATE remet simplement les colonnes sensibles à
-- leur valeur précédente : c'est infaillible et lisible.
--
-- CE QUI GARDE LA MAIN
-- Les edge functions en service_role (activate-trial, payment-webhook,
-- generate-client-assistant), les administrateurs, et le SQL direct
-- (migrations, cron, tableau de bord Supabase).

-- ── 1. Le garde-fou ───────────────────────────────────────────────────────────

create or replace function public.profiles_protege_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Pas de JWT : SQL direct, migration, cron, tableau de bord. On laisse passer.
  if current_setting('request.jwt.claims', true) is null then
    return new;
  end if;

  -- Edge functions en service_role, et administrateurs déjà en place.
  if coalesce(auth.role(), '') = 'service_role' or public.is_admin() then
    return new;
  end if;

  -- Tout le reste : les colonnes de privilège sont remises à leur valeur d'avant.
  new.role               := old.role;
  new.plan_code          := old.plan_code;
  new.plan_tier          := old.plan_tier;
  new.trial_activated_at := old.trial_activated_at;
  new.trial_expires_at   := old.trial_expires_at;
  new.referral_count     := old.referral_count;
  return new;
end;
$$;

drop trigger if exists profiles_protege_privileges on public.profiles;
create trigger profiles_protege_privileges
  before update on public.profiles
  for each row
  execute function public.profiles_protege_privileges();

-- ── 2. Les deux comptes d'attaque ─────────────────────────────────────────────
-- profiles.id est en ON DELETE CASCADE depuis auth.users : le profil suit.

delete from auth.users where email in (
  'mass_lgdgbriv_60748@ues.edu.pl',
  'pwn_lgdgbrivnhge@ues.edu.pl'
);

-- ── 3. Un rôle inconnu doit échouer bruyamment ────────────────────────────────
-- Posé APRÈS la suppression, sinon les deux lignes 'superadmin' le refusent.
-- Sans cette contrainte, une valeur fantaisiste s'installe en silence et on ne
-- la découvre qu'en relisant la table à la main, ce qui est exactement ce qui
-- s'est produit ici.

alter table public.profiles drop constraint if exists profiles_role_valide;
alter table public.profiles add constraint profiles_role_valide
  check (role is null or role in ('user', 'admin'));

-- ── 4. Rendre le Cockpit à Mac Arthur ─────────────────────────────────────────
-- La migration 0016 visait macarthur.nguessankouassi@gmail.com, adresse qui
-- n'existe pas (ou plus) dans auth.users : elle n'a donc jamais rien mis à jour,
-- et PLUS AUCUN compte n'avait role = 'admin'. On vise ici le compte réellement
-- utilisé dans l'app (tunnel terminé, boutique « mrattractor »).

update public.profiles p
set role = 'admin'
from auth.users u
where u.id = p.id
  and u.email = 'macarthur.kouassi@outlook.fr';

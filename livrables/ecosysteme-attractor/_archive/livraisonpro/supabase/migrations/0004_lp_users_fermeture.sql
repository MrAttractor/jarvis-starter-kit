-- =====================================================================
-- LIVRAISON PRO - fermeture de lp_users
--
-- Constat mesure le 12/08/2026, pas suppose :
--   - la cle publique lisait la table entiere, nom et telephone compris ;
--   - la cle publique pouvait MODIFIER n'importe quelle ligne. Prouve par un
--     PATCH qui a renvoye « 1 ligne modifiee ». N'importe qui pouvait donc
--     changer le telephone d'un livreur, son role, ou se declarer verifie.
--
-- L'application n'a pas de compte : elle identifie les gens par leur numero
-- de telephone. On ne peut donc pas gater sur auth.uid(). La parade est celle
-- deja utilisee ailleurs dans l'ecosysteme : plus aucun acces direct a la
-- table, et quatre fonctions qui exposent exactement ce dont l'application a
-- besoin, rien de plus.
--
-- Ce que cette migration NE regle pas, et qui est une decision produit :
-- la liste des livreurs disponibles continue de renvoyer leur telephone,
-- parce que c'est ce que l'application affiche pour permettre de les
-- contacter. Le vol en masse de la table n'est plus possible, la lecture de
-- cette liste l'est toujours.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Plus aucun acces direct
-- ---------------------------------------------------------------------

drop policy if exists lp_users_read_all   on public.lp_users;
drop policy if exists lp_users_update_own on public.lp_users;
drop policy if exists lp_users_insert_own on public.lp_users;

alter table public.lp_users enable row level security;
revoke all on public.lp_users from anon, public;

-- ---------------------------------------------------------------------
-- 2. Se connecter : un numero exact, une seule ligne
--    On ne peut plus balayer la table, il faut connaitre le numero.
-- ---------------------------------------------------------------------

create or replace function public.lp_user_par_tel(p_tel text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare v public.lp_users;
begin
  if p_tel is null or length(btrim(p_tel)) < 8 then
    raise exception 'numero invalide';
  end if;

  select * into v from public.lp_users where tel = btrim(p_tel);
  if not found then return null; end if;

  -- Liste blanche des colonnes, jamais une liste noire : une colonne ajoutee
  -- demain par une migration ne doit pas se retrouver exposee sans decision.
  return jsonb_build_object(
    'id', v.id, 'nom', v.nom, 'tel', v.tel, 'role', v.role,
    'commune', v.commune, 'vehicule', v.vehicule, 'zones', v.zones,
    'plan', v.plan, 'disponible', v.disponible, 'note', v.note,
    'nb_missions', v.nb_missions, 'verifie', v.verifie, 'photo_url', v.photo_url
  );
end $$;

-- ---------------------------------------------------------------------
-- 3. La liste des livreurs disponibles
--    Seuls les livreurs disponibles sortent. Les marchands, les plans et
--    les dates d'essai ne sortent plus du tout.
-- ---------------------------------------------------------------------

create or replace function public.lp_livreurs_disponibles(p_commune text default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', u.id, 'nom', u.nom, 'tel', u.tel, 'commune', u.commune,
           'vehicule', u.vehicule, 'zones', u.zones, 'note', u.note,
           'nb_missions', u.nb_missions, 'verifie', u.verifie,
           'photo_url', u.photo_url, 'disponible', u.disponible)), '[]'::jsonb)
    into v
    from public.lp_users u
   where u.role = 'livreur'
     and u.disponible = true
     and (p_commune is null or p_commune = ''
          or u.commune = p_commune
          or u.zones ilike '%' || p_commune || '%');
  return v;
end $$;

-- ---------------------------------------------------------------------
-- 4. S'inscrire
--    Les champs de confiance sont poses par le serveur. Personne ne peut
--    plus se declarer verifie ni s'attribuer un plan payant a l'inscription.
-- ---------------------------------------------------------------------

create or replace function public.lp_creer_compte(
  p_nom text, p_tel text, p_role text,
  p_commune text default null, p_vehicule text default null, p_zones text default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_id text;
begin
  if p_role not in ('livreur', 'marchand') then raise exception 'role invalide'; end if;
  if p_nom is null or length(btrim(p_nom)) < 2 then raise exception 'nom invalide'; end if;
  if p_tel is null or length(btrim(p_tel)) < 8 then raise exception 'numero invalide'; end if;

  if exists (select 1 from public.lp_users where tel = btrim(p_tel)) then
    raise exception 'Ce numéro existe déjà';
  end if;

  v_id := 'LP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.lp_users (id, nom, tel, role, commune, vehicule, zones,
                               plan, disponible, note, nb_missions, verifie)
  values (v_id, btrim(p_nom), btrim(p_tel), p_role, p_commune, p_vehicule, p_zones,
          'gratuit', false, 5.0, 0, false);

  return public.lp_user_par_tel(btrim(p_tel));
end $$;

-- ---------------------------------------------------------------------
-- 5. Changer sa disponibilite
--    Il faut connaitre le couple identifiant plus numero. Ce n'est pas une
--    authentification, mais on ne peut plus basculer la disponibilite d'un
--    inconnu a partir de son seul identifiant.
-- ---------------------------------------------------------------------

create or replace function public.lp_definir_disponibilite(p_id text, p_tel text, p_disponible boolean)
returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update public.lp_users
     set disponible = coalesce(p_disponible, false), updated_at = now()
   where id = p_id and tel = btrim(coalesce(p_tel, ''));
  get diagnostics n = row_count;
  if n = 0 then raise exception 'acces refuse'; end if;
  return true;
end $$;

-- ---------------------------------------------------------------------
-- 6. Le filet, au cas ou un acces direct reviendrait un jour
--    Les colonnes de confiance ne se modifient pas depuis l'exterieur.
-- ---------------------------------------------------------------------

create or replace function public.lp_users_protege_confiance()
returns trigger language plpgsql as $$
begin
  if current_setting('role', true) in ('anon', 'authenticated') then
    if new.verifie is distinct from old.verifie
       or new.role is distinct from old.role
       or new.tel is distinct from old.tel
       or new.plan is distinct from old.plan
       or new.note is distinct from old.note
       or new.nb_missions is distinct from old.nb_missions then
      raise exception 'ces champs ne se modifient pas depuis l''application';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists lp_users_confiance on public.lp_users;
create trigger lp_users_confiance
  before update on public.lp_users
  for each row execute function public.lp_users_protege_confiance();

-- ---------------------------------------------------------------------
-- 7. Droits
-- ---------------------------------------------------------------------

revoke all on function public.lp_user_par_tel(text) from public, anon, authenticated;
revoke all on function public.lp_livreurs_disponibles(text) from public, anon, authenticated;
revoke all on function public.lp_creer_compte(text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.lp_definir_disponibilite(text, text, boolean) from public, anon, authenticated;

grant execute on function public.lp_user_par_tel(text) to anon, authenticated;
grant execute on function public.lp_livreurs_disponibles(text) to anon, authenticated;
grant execute on function public.lp_creer_compte(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.lp_definir_disponibilite(text, text, boolean) to anon, authenticated;

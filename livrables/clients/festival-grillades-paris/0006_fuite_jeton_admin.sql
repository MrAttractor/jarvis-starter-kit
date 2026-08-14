-- =====================================================================
-- Festival des Grillades de Paris 2026
-- Migration 0006 — CORRECTION D'UNE FUITE DU JETON D'ANIMATION
--
-- DÉFAUT TROUVÉ LE 10/08/2026, en vérifiant tout autre chose.
--
-- fgp_etat renvoyait « to_jsonb(v) - 'jeton' ». La colonne jeton_admin
-- a été ajoutée par la migration 0003, APRÈS l'écriture de fgp_etat,
-- qui n'a pas été mise à jour. Résultat : le jeton d'animation était
-- renvoyé à tout détenteur du lien de séance, donc à Advantage et à
-- Thim, dans la réponse d'un appel parfaitement normal.
--
-- Ce jeton donne accès à fgp_rapport (qui s'est connecté, combien de
-- temps) et surtout à fgp_reinitialiser, qui remet la séance à zéro :
-- points, commentaires, informations, actions, journal et signatures.
-- N'importe quel participant pouvait donc effacer le relevé.
--
-- Deux corrections, la seconde est indispensable : réparer la fonction
-- ne suffit pas, le jeton a circulé, il faut le remplacer.
--
-- Leçon à verser au cerveau : une colonne sensible ajoutée par une
-- migration doit faire relire toutes les fonctions antérieures qui
-- sérialisent la table entière. « to_jsonb(ligne) moins une colonne »
-- est une liste noire, et une liste noire ne connaît pas les colonnes
-- qui n'existaient pas encore.
-- =====================================================================

-- ---------- 1. LA FONCTION NE FUIT PLUS ----------

create or replace function fgp_etat(p_jeton text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances;
begin
  v := fgp_seance_par_jeton(p_jeton);
  return json_build_object(
    -- Liste noire explicite et commentée : tout secret ajouté à
    -- fgp_seances doit être retiré ici, à la ligne suivante.
    'seance', to_jsonb(v) - 'jeton' - 'jeton_admin',
    'points', coalesce((
      select jsonb_agg(to_jsonb(p) - 'seance_id' order by p.section_ordre, p.ordre)
      from fgp_points p where p.seance_id = v.id), '[]'::jsonb),
    'infos', coalesce((
      select jsonb_agg(to_jsonb(i) - 'seance_id' order by i.categorie_ordre, i.ordre)
      from fgp_infos i where i.seance_id = v.id), '[]'::jsonb),
    'actions', coalesce((
      select jsonb_agg(to_jsonb(a) - 'seance_id' order by a.echeance nulls last, a.cree_le)
      from fgp_actions a where a.seance_id = v.id), '[]'::jsonb),
    'journal', coalesce((
      select jsonb_agg(to_jsonb(j) - 'seance_id' order by j.horodatage desc)
      from (select * from fgp_journal where seance_id = v.id
            order by horodatage desc limit 200) j), '[]'::jsonb),
    'signatures', coalesce((
      select jsonb_agg(to_jsonb(s) - 'seance_id' order by s.signe_le)
      from fgp_signatures s where s.seance_id = v.id), '[]'::jsonb)
  );
end $$;

-- ---------- 2. LE JETON COMPROMIS EST REMPLACÉ ----------
-- L'ancien, 'adm-3e8b1f7c95a2d604be13', a été exposé du 05/08 au 10/08
-- à toute personne ayant ouvert l'espace de séance.

update fgp_seances
   set jeton_admin = 'adm-' || substr(replace(gen_random_uuid()::text,'-',''), 1, 20)
 where jeton = 's1-9c4f7a2e6b18d350af71';

-- ---------- 3. GARDE-FOU CONTRE LA RÉINITIALISATION ----------
-- Une remise à zéro efface un relevé signé. Elle n'a plus de sens une
-- fois que des validations existent : on la refuse dans ce cas, même
-- avec le bon jeton d'animation.

create or replace function fgp_reinitialiser(p_admin text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances; n int;
begin
  v := fgp_seance_par_admin(p_admin);

  select count(*) into n from fgp_signatures where seance_id = v.id;
  if n > 0 then
    raise exception 'reinitialisation refusee : % validation(s) enregistree(s)', n;
  end if;

  update fgp_points set statut = 'a_statuer', commentaire = null,
                        maj_le = null, maj_par = null
   where seance_id = v.id and not ajoute_en_seance;

  delete from fgp_points where seance_id = v.id and ajoute_en_seance;

  update fgp_infos set reponse = null, porteur = null, echeance = null,
                       maj_le = null, maj_par = null
   where seance_id = v.id;

  update fgp_actions set statut = 'ouverte', maj_le = null, maj_par = null
   where seance_id = v.id;

  delete from fgp_signatures where seance_id = v.id;
  delete from fgp_journal     where seance_id = v.id;

  update fgp_seances set statut = 'ouverte', close_le = null, version = 1,
                         reinitialisee_le = now()
   where id = v.id;

  return fgp_rapport(p_admin);
end $$;

grant execute on function fgp_etat(text)          to anon;
grant execute on function fgp_reinitialiser(text) to anon;

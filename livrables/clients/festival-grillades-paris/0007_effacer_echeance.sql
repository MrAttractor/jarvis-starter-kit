-- =====================================================================
-- Festival des Grillades de Paris 2026
-- Migration 0007 — POUVOIR EFFACER UNE ÉCHÉANCE
--
-- Défaut relevé pendant le remplissage : dans fgp_info_suivi, un
-- paramètre nul signifie « ne change pas ». Une réponse et un porteur
-- pouvaient donc être effacés en envoyant une chaîne vide, mais une
-- date posée par erreur restait définitive.
--
-- On ne peut pas distinguer « efface » de « laisse tel quel » avec un
-- seul paramètre date : il en faut un second, explicite.
--
-- L'ancienne signature est supprimée avant de recréer, sinon les deux
-- coexistent en surcharge et l'appel devient ambigu côté API.
-- =====================================================================

drop function if exists fgp_info_suivi(text,uuid,text,text,date,text);

create or replace function fgp_info_suivi(
  p_jeton text, p_id uuid, p_reponse text, p_porteur text,
  p_echeance date, p_auteur text, p_effacer_echeance boolean default false)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances; old fgp_infos; v_auteur text; v_ech date;
begin
  v := fgp_seance_par_jeton(p_jeton);

  v_auteur := nullif(trim(coalesce(p_auteur,'')),'');
  if v_auteur is null then raise exception 'auteur requis'; end if;

  select * into old from fgp_infos where id = p_id and seance_id = v.id;
  if not found then raise exception 'information introuvable'; end if;

  v_ech := case when p_effacer_echeance then null
                when p_echeance is null  then old.echeance
                else p_echeance end;

  if p_reponse is not null
     and trim(p_reponse) is distinct from trim(coalesce(old.reponse,'')) then
    insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
    values (v.id, 'information (suivi)', old.libelle, 'reponse',
            old.reponse, p_reponse, v_auteur);
  end if;

  if p_porteur is not null
     and trim(p_porteur) is distinct from trim(coalesce(old.porteur,'')) then
    insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
    values (v.id, 'information (suivi)', old.libelle, 'porteur',
            old.porteur, p_porteur, v_auteur);
  end if;

  if v_ech is distinct from old.echeance then
    insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
    values (v.id, 'information (suivi)', old.libelle, 'echeance',
            old.echeance::text, v_ech::text, v_auteur);
  end if;

  update fgp_infos set
    reponse  = case when p_reponse is null then reponse
                    else nullif(trim(p_reponse),'') end,
    porteur  = case when p_porteur is null then porteur
                    else nullif(trim(p_porteur),'') end,
    echeance = v_ech,
    maj_le   = now(),
    maj_par  = v_auteur
  where id = p_id;

  return fgp_board(p_jeton);
end $$;

grant execute on function fgp_info_suivi(text,uuid,text,text,date,text,boolean) to anon;

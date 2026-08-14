-- =====================================================================
-- Festival des Grillades de Paris 2026
-- Migration 0010 — LA SÉANCE S'EST TENUE LE 7 AOÛT, PAS LE 6
--
-- La séance n°1 a été semée avec la date PRÉVUE, le 6 août. Elle a été
-- reportée d'un jour et s'est tenue le 7, ce que la base prouve par
-- ailleurs : clôture le 07/08 à 13h47, et toutes les connexions des
-- participants datées du 7.
--
-- Le relevé affichait donc une date fausse, y compris à l'impression et
-- dans l'espace du projet. On corrige la donnée plutôt que l'affichage.
--
-- Le relevé porte une validation. Corriger une date sur un document
-- soumis à validation ne se fait pas en silence : la correction est
-- écrite au journal, qui n'est ni modifiable ni effaçable.
-- =====================================================================

do $$
declare v_id uuid; v_avant date;
begin
  select id, date_seance into v_id, v_avant
    from fgp_seances where jeton = 's1-9c4f7a2e6b18d350af71';

  if v_id is null then
    raise notice 'seance introuvable, rien a faire'; return;
  end if;

  if v_avant = date '2026-08-07' then
    raise notice 'date deja corrigee'; return;
  end if;

  update fgp_seances set date_seance = date '2026-08-07' where id = v_id;

  insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
  values (v_id, 'seance', 'Séance technique n°1', 'date_seance',
          v_avant::text, '2026-08-07',
          'Correction : la séance a été reportée du 6 au 7 août');

  raise notice 'date corrigee : % -> 2026-08-07', v_avant;
end $$;

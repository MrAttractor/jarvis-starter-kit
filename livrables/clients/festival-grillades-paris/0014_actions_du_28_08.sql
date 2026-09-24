-- Points d'action apres la seance technique du 28 aout 2026.
--
-- Pourquoi cette migration : la seance du 28/08 s'est tenue hors de l'espace de
-- pilotage. Ses decisions ne sont donc tracees nulle part en ligne, et les 12
-- actions de la base portent toutes une echeance depassee sauf une. Thim
-- Production demande "la mise a jour des points d'action" : elle vit ici, dans
-- l'onglet Ce qu'il faut faire, pas dans un tableau envoye par message qui sera
-- perime vendredi.
--
-- Ce que cette migration NE fait PAS : elle ne statue aucun point de seance et
-- ne touche pas au releve du 7 aout. Un releve se signe, il ne se remplit pas a
-- la place de ceux qui etaient dans la reunion. La seance n°2, creee pour le
-- 21/08 et restee ouverte sans qu'aucun de ses 14 points soit statue, est
-- laissee en l'etat jusqu'a ce que sa numerotation et ses presents soient
-- confirmes.
--
-- A executer apres validation du compte rendu CR-SEANCE-2026-08-28.md.

begin;

-- 1. Les actions nees de la seance du 28 aout.

insert into fgp_actions (seance_id, libelle, porteur, echeance, statut, maj_le, maj_par)
select (select id from fgp_seances where numero = 2),
       v.libelle, v.porteur, v.echeance::date, 'ouverte', now(), 'Mac Arthur'
from (values
 ('Partager le visuel de lancement de la billetterie',
  'Advantage', '2026-08-31'),
 ('Rendre les derniers arbitrages sur le lien de billetterie',
  'Advantage', '2026-08-31'),
 ('Retransmettre le contrat pour la suite a donner a l''assurance',
  'Thim Production', '2026-09-01'),
 ('Etablir le plan de salle',
  'Thim Production', '2026-09-05'),
 ('Produire le plan de communication detaille',
  'Thim Production', '2026-09-05'),
 ('Partager les prix d''achat et de vente du champagne',
  'Thim Production', '2026-09-05'),
 ('Transmettre les chiffres de vente de boissons de l''edition 2025',
  'Advantage', '2026-09-05'),
 ('Verifier le titre de debit de boissons : licence de la salle ou autorisation municipale. La carte Metro ne donne aucun droit de vendre de l''alcool',
  'Thim Production', '2026-09-05'),
 ('Confirmer les effets du retrait du contrat Advantage / Factory 58 sur les sommes deja versees',
  'Advantage', '2026-09-05'),
 ('Etablir le budget de l''edition, poste par poste',
  'Advantage et Thim Production', '2026-09-05')
) as v(libelle, porteur, echeance)
where not exists (
  select 1 from fgp_actions a where a.libelle = v.libelle);

-- 2. Les deux actions que l'ouverture des ventes rend critiques aujourd'hui.
--    Leur echeance etait au 28/08. Elle est ramenee au 31/08 : vendre un billet
--    est le premier engagement du dossier envers des tiers, et il se prend sans
--    contrat signe ni assurance annulation.

update fgp_actions
   set echeance = date '2026-08-31', maj_le = now(), maj_par = 'Mac Arthur'
 where libelle in (
   'Decider qui encaisse la billetterie et sur quel compte',
   'Fixer le contingent de places offertes aux partenaires')
   and statut = 'ouverte';

-- 3. Le jalon d'ouverture de la billetterie, qui n'avait pas de date.

update fgp_jalons
   set echeance = date '2026-08-31', maj_le = now(), maj_par = 'Mac Arthur'
 where libelle ilike '%billetterie%' and echeance is null;

commit;

-- Verification apres execution :
--   select libelle, porteur, echeance, statut from fgp_actions
--    where statut = 'ouverte' order by echeance nulls last;
-- Attendu : 22 actions ouvertes, dont 10 en retard au 31/08.

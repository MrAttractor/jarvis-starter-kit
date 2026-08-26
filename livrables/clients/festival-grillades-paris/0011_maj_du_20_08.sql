-- Mise a jour de l'espace de pilotage, 20 aout 2026.
--
-- Motif : le contenu datait du 10 aout. Depuis, le mail de Marius du 19/08 et
-- les precisions de Mac Arthur ont repondu a plusieurs des 29 informations, les
-- courriers de partenariat sont partis, et deux echeances sont passees.
-- Un espace de pilotage qui affiche des echeances perimees cesse d'etre lu.
--
-- Rien n'est invente ici : chaque reponse porte sa source.

begin;

-- 1. Les informations obtenues -------------------------------------------

update fgp_infos set
  reponse  = '500 places. Compte tenu de l''amenagement, des stands et de la restauration, 400 personnes attendues.',
  porteur  = 'Advantage',
  maj_par  = 'Mac Arthur',
  maj_le   = now()
where libelle ilike '%jauge%';

update fgp_infos set
  reponse  = 'Premiere edition parisienne : complet. 130 000 abonnes environ sur Facebook pour le Festival.',
  porteur  = 'Advantage',
  maj_par  = 'Mac Arthur',
  maj_le   = now()
where libelle ilike '%frequentation%';

-- 2. Les jalons recales ---------------------------------------------------

-- Le contrat : l'echeance du 17/08 est passee, Advantage l'a reclame par ecrit
-- le 19/08. Le seul champ vide est l'article 9.
update fgp_jalons set
  echeance  = date '2026-08-24',
  detail    = 'Advantage a reclame le contrat par ecrit le 19/08. Seul champ vide : les honoraires de l''article 9. C''est une decision, pas une information.',
  criticite = 'critique',
  maj_par   = 'Mac Arthur',
  maj_le    = now()
where libelle ilike '%contrat de mandat%';

-- Les visas : les passeports ne sont disponibles que la semaine du 24.
update fgp_jalons set
  echeance = date '2026-08-28',
  detail   = 'Passeports mis a disposition la semaine du 24 selon Advantage. Il faut la liste nominative et les lettres d''invitation avant le depot.',
  maj_par  = 'Mac Arthur',
  maj_le   = now()
where libelle ilike '%visas%';

-- L'assurance annulation etait cochee faite alors que l'action de decision
-- reste ouverte. On ne laisse pas les deux se contredire.
update fgp_jalons set
  statut  = 'a_faire',
  detail  = 'Echeance du 15/08 passee. A defaut de souscription possible, l''article 20 du mandat met le risque d''annulation a la charge du mandant : le point doit etre acte par ecrit.',
  maj_par = 'Mac Arthur',
  maj_le  = now()
where libelle ilike '%assurance annulation%';

-- 3. Les nouveaux jalons --------------------------------------------------

insert into fgp_jalons (libelle, echeance, porteur, statut, criticite, detail, maj_par, maj_le)
select v.libelle, v.echeance, v.porteur, v.statut, v.criticite, v.detail, 'Mac Arthur', now()
from (values
  ('Courriers de partenariat envoyes', date '2026-08-21', 'Thim',
   'fait', 'normal',
   'Cinq courriers partis : TAP TAP SEND, Orange Money France, Veuve Clicquot, Champagne Mercier, Moet & Chandon. References 08.26-01 a 05.'),
  ('Solde de la location de la salle', date '2026-08-31', 'Advantage',
   'a_faire', 'normal',
   '4 200 euros restants sur 12 000. 7 800 euros deja regles.'),
  ('Liste des comptes reserves aux accords multi-editions', date '2026-08-26', 'Advantage',
   'a_faire', 'critique',
   'A obtenir de Stephane ATTA. Sans elle, un sponsor peut etre sollicite par Paris et par Abidjan en meme temps.'),
  ('Attestation de mandat de demarchage signee', date '2026-08-26', 'Advantage',
   'a_faire', 'critique',
   'Une page, deja redigee. Elle autorise Thim a demarcher en France sans attendre la signature du mandat.'),
  ('Substitution sur le contrat de la salle', date '2026-09-05', 'Advantage et Thim',
   'a_faire', 'critique',
   'Le contrat est au nom d''Advantage, qui a paye 7 800 euros. L''occupant declare doit etre l''organisateur declare, donc Thim. Nouveau contrat ou cession.'),
  ('Emplacement partenaires sur le visuel officiel', date '2026-08-26', 'Advantage',
   'a_faire', 'normal',
   'La communication officielle demarre des reception du logo Thim. Un visuel sans bandeau partenaires prive de la contrepartie la plus vendable.')
) as v(libelle, echeance, porteur, statut, criticite, detail)
where not exists (select 1 from fgp_jalons j where j.libelle = v.libelle);

-- 4. Les actions ouvertes par le point du 19/08 ---------------------------

insert into fgp_actions (seance_id, libelle, porteur, echeance, statut, maj_par, maj_le)
select (select id from fgp_seances order by numero limit 1),
       v.libelle, v.porteur, v.echeance, 'ouverte', 'Mac Arthur', now()
from (values
  ('Fixer le montant des honoraires du mandataire, article 9', 'Thim et Mr Attractor', date '2026-08-22'),
  ('Obtenir la liste nominative des artistes et les copies de passeports', 'Advantage', date '2026-08-26'),
  ('Decider qui encaisse la billetterie et sur quel compte', 'Advantage et Thim', date '2026-08-28'),
  ('Fixer le contingent de places offertes aux partenaires', 'Advantage', date '2026-08-28'),
  ('Recontractualiser la securite au nom de l''organisateur declare', 'Thim', date '2026-09-05'),
  ('Verifier le numero d''immatriculation d''Advantage, deux numeros circulent', 'Advantage', date '2026-08-26')
) as v(libelle, porteur, echeance)
where not exists (select 1 from fgp_actions a where a.libelle = v.libelle);

-- 5. Trace ----------------------------------------------------------------

insert into fgp_journal (seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
select (select id from fgp_seances order by numero limit 1),
       'suivi', 'Mise a jour du 20 aout', 'contenu',
       'etat du 10 aout',
       'Jauge et frequentation renseignees, echeances du contrat et des visas recalees, assurance annulation remise a faire, six jalons et six actions ajoutes apres le mail de Marius du 19/08 et l''envoi des cinq courriers de partenariat.',
       'Mac Arthur';

commit;

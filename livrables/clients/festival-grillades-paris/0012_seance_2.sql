-- Seance n°2, premier point hebdomadaire, 21 aout 2026.
--
-- Pourquoi c'est possible sans rien reecrire : la table fgp_seances porte deja
-- un numero, une date et son propre jeton, et toutes les fonctions resolvent la
-- seance par ce jeton. L'espace etait multi-seances depuis l'origine, il
-- manquait seulement un moyen de creer la suivante. Un insert suffit.
--
-- La seance n°1 n'est pas touchee : son releve reste fige, comme la regle
-- l'impose. Le suivi continu, lui, vit dans l'onglet Ce qu'il faut faire.

begin;

insert into fgp_seances (numero, titre, objet, date_seance, lieu, jeton, jeton_admin, statut)
select 2,
       'Point hebdomadaire n°1',
       'Premier point du rythme hebdomadaire convenu avec Advantage jusqu''au 11 octobre.',
       date '2026-08-21',
       'Visioconference',
       's2-7d41c9e0b6a83f52ad7c',
       'adm2-51fb8c3d7e0a49b62d84',
       'ouverte'
where not exists (select 1 from fgp_seances where numero = 2);

-- L'ordre du jour devient la liste des points a statuer. Un point statue est un
-- point qui ne reviendra pas la semaine prochaine sans qu'on l'ait decide.

insert into fgp_points (seance_id, section, section_ordre, ordre, libelle, detail, type)
select (select id from fgp_seances where numero = 2),
       v.section, v.so, v.o, v.libelle, v.detail, 'validation'
from (values
 ('Ce qui engage', 1, 1,
  'Honoraires du mandataire et envoi du contrat',
  'Seul champ vide du mandat. Advantage le reclame par ecrit depuis le 19/08. Sortir de la seance avec une date d''envoi ferme.'),
 ('Ce qui engage', 1, 2,
  'Titulaire du contrat de la salle',
  'Contrat au nom d''Advantage, 7 800 EUR payes sur 12 000. L''occupant declare doit etre l''organisateur declare, donc Thim. Nouveau contrat ou cession.'),
 ('Ce qui engage', 1, 3,
  'Artistes : liste nominative, contrats et paie',
  'Passeports disponibles la semaine du 24. Un artiste se produisant en France est presume salarie : Advantage choisit et finance, Thim contracte et declare.'),
 ('Ce qui engage', 1, 4,
  'Assurance annulation',
  'Echeance du 15/08 passee. Si la souscription n''est plus possible, l''article 20 met le risque a la charge du mandant. A acter par ecrit.'),

 ('Partenaires', 2, 1,
  'Cinq courriers partis, information au mandant',
  'TAP TAP SEND, Orange Money France, Veuve Clicquot, Champagne Mercier, Moet & Chandon. References 08.26-01 a 05. L''article 13 impose d''informer immediatement de toute negociation en cours.'),
 ('Partenaires', 2, 2,
  'Liste des comptes reserves aux accords multi-editions',
  'A obtenir de Stephane ATTA. Un sponsor sollicite par Paris et par Abidjan ne signe avec personne.'),
 ('Partenaires', 2, 3,
  'Attestation de mandat de demarchage',
  'Une page, prete. Elle autorise le demarchage en France sans attendre la signature du mandat.'),
 ('Partenaires', 2, 4,
  'Emplacement partenaires sur le visuel officiel',
  'La communication officielle demarre des reception du logo Thim. Un visuel sans bandeau partenaires prive de la contrepartie la plus vendable.'),

 ('Exploitation', 3, 1,
  'Billetterie : qui encaisse, et sur quel compte',
  'Confiee a Thim le 07/08. Si Thim encaisse, c''est pour le compte d''Advantage, sur le compte dedie de l''article 11.'),
 ('Exploitation', 3, 2,
  'Contingent de places offertes aux partenaires',
  '150 EUR la place, 400 attendues, salle complete l''an dernier. Sans plafond decide, le nombre se constitue contrat par contrat.'),
 ('Exploitation', 3, 3,
  'Securite : contrat au nom de l''organisateur declare',
  'Prestataire reconduit avec Advantage. Une reconduction tacite avec un tiers n''engage pas Thim. Coordonnees de Harry et devis de l''an dernier.'),

 ('Suivi', 4, 1,
  'Validation du releve de la seance du 7 aout',
  'Une signature sur trois. Il devient l''annexe du contrat et fixe la repartition des 40 points.'),
 ('Suivi', 4, 2,
  'Budget : la trame poste par poste',
  'Seule ligne connue : 12 000 EUR de salle. Advantage remplit ce qui est arrete, laisse le reste en blanc.'),
 ('Suivi', 4, 3,
  'Prochaine seance et rythme hebdomadaire',
  'Creneau du vendredi reconduit jusqu''au 11 octobre.')
) as v(section, so, o, libelle, detail)
where not exists (
  select 1 from fgp_points p
  where p.seance_id = (select id from fgp_seances where numero = 2)
    and p.libelle = v.libelle);

commit;

-- =====================================================================
-- Festival des Grillades de Paris 2026
-- Migration 0008 — BOUSSOLE DE PRODUCTION
--
-- Le cahier des charges dit QUI fait QUOI. Le board suit les jalons.
-- Il manquait le document de travail de Thim : dans quel ORDRE, à
-- quelle DATE lancer chaque chose, QUOI demander à chaque fournisseur,
-- et quel poste de budget la tâche alimente.
--
-- Toutes les dates sont calculées à rebours du 11 octobre 2026, en
-- tenant compte des délais incompressibles : un mois pour une mairie,
-- trois semaines pour une commission de sécurité, un mois pour un visa.
--
-- Aucun montant ici. Les chiffres vivent dans BUDGET-KIT-PARIS-2026.md,
-- et nulle part ailleurs.
-- =====================================================================

create table if not exists fgp_taches (
  id          bigserial primary key,
  poste       text not null,
  poste_ordre int  not null,
  ordre       int  not null default 0,
  libelle     text not null,
  detail      text,
  lancer_le   date,
  echeance    date,
  porteur     text not null default 'Thim Production',
  chiffrage   boolean not null default false,
  critique    boolean not null default false,
  statut      text not null default 'a_faire'
              check (statut in ('a_faire','en_cours','fait','sans_objet')),
  maj_le      timestamptz,
  maj_par     text
);

create index if not exists fgp_taches_ordre on fgp_taches(poste_ordre, ordre);

alter table fgp_taches enable row level security;
revoke all on fgp_taches from anon, authenticated;

-- ---------- SEED ----------

insert into fgp_taches(poste,poste_ordre,ordre,libelle,detail,lancer_le,echeance,porteur,chiffrage,critique)
select * from (values

-- A. CONTRAT ET CADRE
('Contrat et cadre',1,1,'Arrêter les honoraires et la commission',
 'Article 9 du mandat. Tant que ce montant est vide, rien ne part à la signature.',
 date '2026-08-10',date '2026-08-13','Thim Production',false,true),
('Contrat et cadre',1,2,'Obtenir du comptable le régime de TVA, par écrit',
 'Honoraires et billetterie. Preneur hors Union européenne, événement en France : un écart de 20 % ne se rattrape pas après signature.',
 date '2026-08-10',date '2026-08-12','Comptable Thim',true,true),
('Contrat et cadre',1,3,'Obtenir le coefficient de coût employeur, par écrit',
 'Sert à chiffrer les charges patronales sur les cachets et les salaires techniques.',
 date '2026-08-10',date '2026-08-12','Comptable Thim',true,true),
('Contrat et cadre',1,4,'Transmettre le récépissé d''entrepreneur de spectacles',
 'Copie remise au Mandant à la signature, et pièce du dossier de sécurité.',
 date '2026-08-10',date '2026-08-17','Thim Production',false,false),
('Contrat et cadre',1,5,'Ouvrir le compte bancaire dédié à l''édition',
 'Article 11. Toutes les recettes y transitent. À ouvrir avant le premier versement, un compte se crée rarement en 24 heures.',
 date '2026-08-11',date '2026-08-21','Thim Production',false,false),
('Contrat et cadre',1,6,'Vérifier le sort du pacte de non-contournement',
 'S''il est signé, ses indemnités se cumulent avec les articles 29 et 30 du mandat. Trancher avant signature.',
 date '2026-08-10',date '2026-08-14','Thim Production',false,false),

-- B. SITE
('Site',2,1,'Récupérer le contrat de location signé par Advantage',
 'Avec le montant de la tranche déjà versée et l''échéancier du solde.',
 date '2026-08-11',date '2026-08-14','Advantage Conseils',true,true),
('Site',2,2,'Faire établir le contrat au nom de Thim, ou sa cession',
 'L''occupant déclaré doit être l''organisateur déclaré. Article 2.1 du mandat, sous quinze jours.',
 date '2026-08-17',date '2026-09-01','Thim Production',false,true),
('Site',2,3,'Obtenir la fiche technique du lieu',
 'Jauge ERP autorisée, catégorie, puissance électrique disponible, accès poids lourds, quais, hauteur sous plafond, horaires de montage et de démontage, nuisances sonores.',
 date '2026-08-12',date '2026-08-20','Thim Production',true,true),
('Site',2,4,'Vérifier le classement ERP et la dernière commission de sécurité',
 'Un lieu privé n''est pas forcément à jour. Demander le dernier procès-verbal et le registre de sécurité.',
 date '2026-08-12',date '2026-08-22','Thim Production',false,true),
('Site',2,5,'Chiffrer le site',
 'Solde de location, caution, fluides, ménage, gardiennage, régisseur du lieu, heures supplémentaires au-delà de l''horaire prévu.',
 date '2026-08-20',date '2026-08-28','Thim Production',true,false),

-- C. SÉCURITÉ
('Sécurité et secours',3,1,'Demander trois devis de sécurité',
 'Agents de surveillance, agents SSIAP incendie, secouristes, et le contrôle d''accès. Le nombre dépend de la jauge : la demander à Advantage avant.',
 date '2026-08-14',date '2026-08-25','Thim Production',true,true),
('Sécurité et secours',3,2,'Contractualiser par écrit au nom de Thim',
 'La société de l''an dernier est présentée comme reconduite tacitement : cette reconduction n''engage pas Thim. Un contrat neuf est nécessaire.',
 date '2026-08-25',date '2026-09-05','Thim Production',false,true),
('Sécurité et secours',3,3,'Déposer le dossier de sécurité',
 'Notice de sécurité, plan d''implantation, plan de flux, effectifs. Une commission peut demander trois semaines : au-delà du 5 septembre, le risque devient réel.',
 date '2026-08-25',date '2026-09-05','Thim Production',false,true),
('Sécurité et secours',3,4,'Déclarer la manifestation en mairie de Bobigny',
 'Le lieu déclare habituellement lui-même. Vérifier que c''est fait et en conserver la preuve écrite.',
 date '2026-08-20',date '2026-09-05','Thim Production',false,false),

-- D. TECHNIQUE
('Technique',4,1,'Demander trois devis techniques',
 'Scène, sonorisation, éclairage, écran, régie, structures. Demander le détail par poste, pas un forfait global : c''est le seul moyen d''arbitrer si le budget serre.',
 date '2026-08-14',date '2026-08-25','Thim Production',true,true),
('Technique',4,2,'Vérifier la puissance électrique et prévoir un groupe',
 'Un groupe électrogène se réserve, et son carburant se chiffre. Découvrir le manque la semaine du montage coûte le double.',
 date '2026-08-20',date '2026-08-30','Thim Production',true,false),
('Technique',4,3,'Recueillir les fiches techniques et riders des artistes',
 'Conditionne le dimensionnement du plateau. Dépend d''Advantage.',
 date '2026-08-14',date '2026-09-05','Advantage Conseils',true,true),
('Technique',4,4,'Arrêter le planning de montage et de démontage',
 'Avec le lieu et le prestataire. Le respect des horaires et la remise en état ont été soulevés en séance.',
 date '2026-09-10',date '2026-09-25','Thim Production',true,false),

-- E. ARTISTES
('Artistes et emploi',5,1,'Rédiger les lettres d''invitation',
 'Pièce indispensable au dossier de visa. À préparer avant même d''avoir la liste définitive.',
 date '2026-08-11',date '2026-08-14','Thim Production',false,true),
('Artistes et emploi',5,2,'Obtenir la liste nominative des artistes et leurs pièces',
 'Noms, passeports, cachets convenus. Sans cela, aucun dossier de visa ne part.',
 date '2026-08-11',date '2026-08-17','Advantage Conseils',true,true),
('Artistes et emploi',5,3,'Déposer les demandes de visas',
 'Échéance resserrée en séance : semaine du 17 août. Un visa court séjour demande souvent un mois, et le rendez-vous en consulat s''obtient rarement le jour même.',
 date '2026-08-17',date '2026-08-21','Thim Production',true,true),
('Artistes et emploi',5,4,'Établir les contrats d''engagement',
 'Article 5 bis. Un artiste qui se produit en France est présumé salarié : contrat, déclaration préalable, paie et cotisations, quelle que soit sa nationalité.',
 date '2026-09-05',date '2026-09-20','Thim Production',true,true),
('Artistes et emploi',5,5,'Chiffrer l''accueil des artistes',
 'Billets d''avion, transferts aéroport, hébergement, catering, per diem, taxis locaux. Poste systématiquement sous-estimé.',
 date '2026-08-20',date '2026-09-05','Thim Production',true,false),
('Artistes et emploi',5,6,'Préparer la paie et les déclarations',
 'Déclaration préalable à l''embauche, bulletins, cotisations, congés spectacles. Aucun règlement de la main à la main le jour J.',
 date '2026-09-20',date '2026-10-09','Thim Production',true,true),

-- F. BILLETTERIE
('Billetterie',6,1,'Obtenir plan de salle, prix, catégories et commissions',
 'Les quatre éléments manquants relevés en séance. Catégories envisagées : tables Prestige, VIP, tarif enfants, packages.',
 date '2026-08-11',date '2026-08-20','Advantage Conseils',true,true),
('Billetterie',6,2,'Choisir la solution et comparer les commissions',
 'Comparer le taux, qui le supporte, le délai de reversement et la possibilité d''un compte dédié. Une commission de 3 % sur une billetterie, c''est parfois le poste technique d''une soirée.',
 date '2026-08-18',date '2026-08-25','Thim Production',true,false),
('Billetterie',6,3,'Paramétrer et ouvrir les ventes',
 'Plus tôt les ventes ouvrent, plus la trésorerie respire. Chaque semaine perdue est une semaine de vente en moins.',
 date '2026-08-25',date '2026-09-01','Thim Production',false,true),
('Billetterie',6,4,'Prévoir le contrôle d''accès physique',
 'Douchettes, tablettes, connexion de secours, personnel formé. Une billetterie en ligne sans scan au sol crée la file d''attente.',
 date '2026-09-15',date '2026-09-30','Thim Production',true,false),

-- G. RESTAURATION
('Restauration et exposants',7,1,'Obtenir la liste des exposants et leurs attestations',
 'Formation hygiène comprise, y compris pour le restaurateur recruté à Paris.',
 date '2026-08-20',date '2026-09-11','Advantage Conseils',true,true),
('Restauration et exposants',7,2,'Déclaration DDPP',
 'Déposée en France par l''organisateur. Article 21.2 du mandat.',
 date '2026-09-01',date '2026-09-15','Thim Production',false,true),
('Restauration et exposants',7,3,'Demander l''autorisation de débit de boissons',
 'Autorisation municipale, à demander environ un mois avant. Une demande tardive est refusée sans discussion.',
 date '2026-08-25',date '2026-09-10','Thim Production',false,true),
('Restauration et exposants',7,4,'Cadrer le dépôt-vente boissons',
 'Piste champagne évoquée en séance, avec Stéphane ATTA côté Advantage. Écrire qui achète, qui stocke, qui reprend l''invendu.',
 date '2026-08-18',date '2026-09-01','Thim Production',true,false),
('Restauration et exposants',7,5,'Ouvrir la carte fournisseur de gros',
 'Au nom de Thim. Une carte professionnelle ne s''obtient pas la veille.',
 date '2026-08-18',date '2026-09-01','Thim Production',false,false),
('Restauration et exposants',7,6,'Chiffrer les charges des stands',
 'Alimentation électrique et eau, bacs à graisse, extincteurs, bennes, nettoyage renforcé, évacuation des huiles. Le poste oublié des événements de grillades.',
 date '2026-08-25',date '2026-09-10','Thim Production',true,false),

-- H. COMMUNICATION
('Communication France',8,1,'Recevoir la charte et les éléments de marque',
 'Sans elle, aucun support ne peut être décliné.',
 date '2026-08-11',date '2026-08-20','Advantage Conseils',false,true),
('Communication France',8,2,'Arrêter le plan média France et son plafond',
 'Le plafond est contractuel : au-delà, c''est un avenant. Affichage, radios communautaires, digital, influence.',
 date '2026-08-20',date '2026-09-01','Thim Production',true,true),
('Communication France',8,3,'Réserver l''affichage et les espaces radio',
 'Les emplacements se réservent des semaines à l''avance, les meilleurs partent en premier.',
 date '2026-09-01',date '2026-09-10','Thim Production',true,false),
('Communication France',8,4,'Recevoir la grille de contreparties partenaires',
 'Détermine ce qu''il faudra activer sur site le jour J, et donc ce que ça coûte.',
 date '2026-08-11',date '2026-09-11','Advantage Conseils',true,true),
('Communication France',8,5,'Cadrer la captation photo et vidéo',
 'Prestataire, droits cédés, livrables attendus pour le rapport partenaires.',
 date '2026-09-10',date '2026-09-25','Thim Production',true,false),

-- I. ASSURANCES
('Assurances',9,1,'Souscrire l''assurance annulation',
 'Fenêtre qui se referme le 15 août. Au-delà, les assureurs refusent ou surtarifent. C''est la seule protection réelle en cas de report.',
 date '2026-08-10',date '2026-08-15','Thim Production',true,true),
('Assurances',9,2,'Souscrire la RC organisateur et les dommages',
 'Souvent exigée par le lieu avant remise des clés.',
 date '2026-08-20',date '2026-09-01','Thim Production',true,true),
('Assurances',9,3,'Communiquer les attestations au Mandant',
 'Article 20 du mandat, au plus tard le 11 septembre.',
 date '2026-09-01',date '2026-09-11','Thim Production',false,false),

-- J. DROITS
('Droits d''auteur',10,1,'Déclarer à la SACEM, la SACD et la SPRE',
 'Déclaration préalable, puis programme des œuvres après l''événement. La redevance se provisionne au budget.',
 date '2026-09-10',date '2026-09-20','Thim Production',true,false),

-- K. JOUR J ET CLÔTURE
('Jour J et clôture',11,1,'Recevoir l''effectif du personnel d''accueil',
 'Fourni par Advantage, à intégrer au dispositif de sécurité quinze jours avant.',
 date '2026-09-15',date '2026-09-26','Advantage Conseils',true,false),
('Jour J et clôture',11,2,'Établir le planning d''exploitation du jour J',
 'Heure par heure, poste par poste, avec les numéros de chacun.',
 date '2026-09-25',date '2026-10-05','Thim Production',false,false),
('Jour J et clôture',11,3,'États des lieux d''entrée et de sortie',
 'Contradictoires et photographiés. C''est ce qui protège la caution.',
 date '2026-10-09',date '2026-10-12','Thim Production',false,false),
('Jour J et clôture',11,4,'Compte rendu final et clôture financière',
 'Compte d''emploi des fonds, état de billetterie, rapport partenaires, reversement du solde.',
 date '2026-10-13',date '2026-11-25','Thim Production',false,false)

) as v(poste,poste_ordre,ordre,libelle,detail,lancer_le,echeance,porteur,chiffrage,critique)
where not exists (select 1 from fgp_taches);

-- ---------- LECTURE ----------

create or replace function fgp_boussole(p_jeton text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances; v_jour date := current_date;
begin
  v := fgp_seance_par_jeton(p_jeton);

  return json_build_object(
    'aujourdhui', v_jour,
    'jours_restants', (date '2026-10-11' - v_jour),
    'taches', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', t.id, 'poste', t.poste, 'poste_ordre', t.poste_ordre,
        'libelle', t.libelle, 'detail', t.detail,
        'lancer_le', t.lancer_le, 'echeance', t.echeance,
        'porteur', t.porteur, 'chiffrage', t.chiffrage, 'critique', t.critique,
        'statut', t.statut, 'maj_le', t.maj_le, 'maj_par', t.maj_par,
        'jours', case when t.echeance is null then null else (t.echeance - v_jour) end,
        'alerte', case
          when t.statut in ('fait','sans_objet')            then 'ok'
          when t.echeance is not null and t.echeance < v_jour then 'depasse'
          when t.lancer_le is not null and t.lancer_le <= v_jour
               and t.statut = 'a_faire'                     then 'a_lancer'
          when t.echeance is not null and t.echeance <= v_jour + 7 then 'imminent'
          else 'a_venir' end
      ) order by t.poste_ordre, t.ordre)
      from fgp_taches t), '[]'::jsonb),
    'avancement', (
      select jsonb_build_object(
        'total', count(*),
        'faites', count(*) filter (where statut in ('fait','sans_objet')),
        'a_chiffrer', count(*) filter (where chiffrage and statut = 'a_faire'),
        'depassees', count(*) filter (where statut = 'a_faire'
                        and echeance is not null and echeance < v_jour))
      from fgp_taches)
  );
end $$;

-- ---------- ÉCRITURE ----------

create or replace function fgp_tache_maj(
  p_jeton text, p_id bigint, p_statut text, p_auteur text)
returns json
language plpgsql security definer set search_path = public as $$
declare v fgp_seances; v_av text; v_lib text; v_auteur text;
begin
  v := fgp_seance_par_jeton(p_jeton);
  v_auteur := nullif(trim(coalesce(p_auteur,'')),'');
  if v_auteur is null then raise exception 'auteur requis'; end if;

  select statut, libelle into v_av, v_lib from fgp_taches where id = p_id;
  if not found then raise exception 'tache introuvable'; end if;

  update fgp_taches set statut = p_statut, maj_le = now(), maj_par = v_auteur
   where id = p_id;

  if p_statut is distinct from v_av then
    insert into fgp_journal(seance_id, objet_type, objet_libelle, champ, avant, apres, auteur)
    values (v.id, 'tache', v_lib, 'statut', v_av, p_statut, v_auteur);
  end if;

  return fgp_boussole(p_jeton);
end $$;

grant execute on function fgp_boussole(text)                  to anon;
grant execute on function fgp_tache_maj(text,bigint,text,text) to anon;

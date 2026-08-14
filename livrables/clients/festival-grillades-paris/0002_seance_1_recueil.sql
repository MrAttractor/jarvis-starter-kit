-- =====================================================================
-- Festival des Grillades de Paris 2026
-- Séance 1 du 06/08/2026 — recueil du périmètre confié à Thim Production
-- Contenu repris de RECUEIL-SESSION-TECHNIQUE.md
-- =====================================================================

do $$
declare v_id uuid;
begin
  select id into v_id from fgp_seances where jeton = 's1-9c4f7a2e6b18d350af71';
  if v_id is not null then
    raise notice 'seance deja creee, rien a faire';
    return;
  end if;

  insert into fgp_seances(numero, titre, objet, date_seance, lieu, jeton)
  values (1,
    'Séance technique n°1',
    'Recueil du périmètre confié à Thim Production pour l''édition parisienne du 11 octobre 2026',
    '2026-08-06', 'Visioconférence',
    's1-9c4f7a2e6b18d350af71')
  returning id into v_id;

  -- ---------- POINTS ----------

  insert into fgp_points(seance_id, section, section_ordre, ordre, code, libelle, detail, type) values
  (v_id,'Cadre réglementaire',1,1,'0',
   'Thim Production est l''organisateur déclaré unique de l''édition du 11 octobre 2026',
   'Il en résulte que les contrats relevant de la réglementation française sont signés par Thim Production en son nom (site, prestataires, artistes et techniciens se produisant en France), qu''Advantage Conseils ne contracte pas directement en France sur cette édition, et qu''Advantage Conseils demeure propriétaire du concept et de la marque et conserve la direction artistique, la programmation et les partenariats.',
   'validation');

  insert into fgp_points(seance_id, section, section_ordre, ordre, code, libelle) values
  (v_id,'Portage réglementaire',2,1,'1.1','Statut d''organisateur déclaré, récépissé d''entrepreneur de spectacles'),
  (v_id,'Portage réglementaire',2,2,'1.2','Déclaration de la manifestation en mairie de Bobigny'),
  (v_id,'Portage réglementaire',2,3,'1.3','Autorisation d''occupation du site et convention de mise à disposition'),
  (v_id,'Portage réglementaire',2,4,'1.4','Dossier sécurité ERP, notice de sécurité, passage en commission'),
  (v_id,'Portage réglementaire',2,5,'1.5','Service de sécurité, contrôle d''accès, dispositif de secours'),
  (v_id,'Portage réglementaire',2,6,'1.6','Déclarations et redevances SACEM, SACD, SPRE'),
  (v_id,'Portage réglementaire',2,7,'1.7','Hygiène alimentaire : déclaration DDPP, conformité des stands de grillades'),
  (v_id,'Portage réglementaire',2,8,'1.8','Débit de boissons temporaire'),
  (v_id,'Portage réglementaire',2,9,'1.9','Assurance responsabilité civile organisateur'),
  (v_id,'Portage réglementaire',2,10,'1.10','Assurance annulation'),

  (v_id,'Emploi et contrats',3,1,'2.1','Contrats d''engagement des artistes se produisant en France'),
  (v_id,'Emploi et contrats',3,2,'2.2','Déclarations sociales et paie des artistes'),
  (v_id,'Emploi et contrats',3,3,'2.3','Contrats et paie des techniciens et de la régie'),
  (v_id,'Emploi et contrats',3,4,'2.4','Contrats des fournisseurs techniques et logistiques'),
  (v_id,'Emploi et contrats',3,5,'2.5','Contrat de mise à disposition du site'),
  (v_id,'Emploi et contrats',3,6,'2.6','Conventions avec les exposants et restaurateurs'),

  (v_id,'Production et logistique',4,1,'3.1','Recherche, repérage et réservation du site'),
  (v_id,'Production et logistique',4,2,'3.2','Plan d''implantation, plan de flux, implantation des stands'),
  (v_id,'Production et logistique',4,3,'3.3','Dispositif technique : scène, son, lumière, écran, énergie'),
  (v_id,'Production et logistique',4,4,'3.4','Montage, exploitation, démontage, remise en état'),
  (v_id,'Production et logistique',4,5,'3.5','Accueil des artistes en France : transferts, hébergement, catering'),
  (v_id,'Production et logistique',4,6,'3.6','Transport international des artistes et démarches de visas'),
  (v_id,'Production et logistique',4,7,'3.7','Personnel d''accueil et d''exploitation le jour J'),
  (v_id,'Production et logistique',4,8,'3.8','Signalétique et habillage du site'),

  (v_id,'Billetterie',5,1,'4.1','Choix de la solution, paramétrage, ouverture des ventes'),
  (v_id,'Billetterie',5,2,'4.2','Définition de la grille tarifaire et des catégories'),
  (v_id,'Billetterie',5,3,'4.3','Contrôle d''accès et billetterie sur place'),
  (v_id,'Billetterie',5,4,'4.4','Encaissement des recettes et reversement'),
  (v_id,'Billetterie',5,5,'4.5','Déclarations fiscales liées à la billetterie'),

  (v_id,'Communication France',6,1,'5.1','Déclinaison des supports sur la charte fournie par Advantage'),
  (v_id,'Communication France',6,2,'5.2','Plan média France : affichage, radios, digital'),
  (v_id,'Communication France',6,3,'5.3','Relations presse et relais d''influence en Île-de-France'),
  (v_id,'Communication France',6,4,'5.4','Prospection de partenaires sur le territoire français'),
  (v_id,'Communication France',6,5,'5.5','Activation sur site des contreparties dues aux partenaires'),
  (v_id,'Communication France',6,6,'5.6','Captation photo et vidéo'),
  (v_id,'Communication France',6,7,'5.7','Reporting post-événement dû aux partenaires'),

  (v_id,'Coordination',7,1,'6.1','Coordination générale et interface entre les deux structures'),
  (v_id,'Coordination',7,2,'6.2','Comité de suivi et rétroplanning partagé'),
  (v_id,'Coordination',7,3,'6.3','Reddition de comptes et clôture financière');

  -- ---------- INFORMATIONS À OBTENIR ----------

  insert into fgp_infos(seance_id, categorie, categorie_ordre, ordre, libelle) values
  (v_id,'Format de la manifestation',1,1,'Jauge visée'),
  (v_id,'Format de la manifestation',1,2,'Horaires d''ouverture et de fermeture au public'),
  (v_id,'Format de la manifestation',1,3,'Site déjà identifié à Bobigny, ou recherche à mener'),
  (v_id,'Format de la manifestation',1,4,'Manifestation payante, gratuite, ou mixte'),
  (v_id,'Format de la manifestation',1,5,'Grille tarifaire souhaitée'),
  (v_id,'Format de la manifestation',1,6,'Espace VIP ou hospitalité prévu'),

  (v_id,'Programmation artistique',2,1,'Nombre d''artistes et formats (solo, groupe, DJ)'),
  (v_id,'Programmation artistique',2,2,'Artistes venant de Côte d''Ivoire ou d''ailleurs hors France'),
  (v_id,'Programmation artistique',2,3,'Durée totale de plateau'),
  (v_id,'Programmation artistique',2,4,'Qui négocie les cachets, et sous quel budget'),
  (v_id,'Programmation artistique',2,5,'Date de gel de la programmation'),
  (v_id,'Programmation artistique',2,6,'Fiches techniques et riders disponibles'),

  (v_id,'Restauration et exposants',3,1,'Nombre de stands de grillades prévus'),
  (v_id,'Restauration et exposants',3,2,'Exposants déjà identifiés, ou à recruter'),
  (v_id,'Restauration et exposants',3,3,'Les exposants paient-ils un emplacement'),
  (v_id,'Restauration et exposants',3,4,'Qui encaisse les recettes de restauration'),

  (v_id,'Partenaires et sponsors',4,1,'Liste des partenaires concernés par l''édition de Paris'),
  (v_id,'Partenaires et sponsors',4,2,'Contreparties dues à chacun sur cette édition'),
  (v_id,'Partenaires et sponsors',4,3,'Grille de contreparties sponsors (citée au dossier, jamais transmise)'),
  (v_id,'Partenaires et sponsors',4,4,'Quote-part des partenariats multi-éditions affectée à Paris'),
  (v_id,'Partenaires et sponsors',4,5,'Ce que Thim peut commercialiser en propre en France'),

  (v_id,'Marque et identité',5,1,'Charte visuelle et éditoriale'),
  (v_id,'Marque et identité',5,2,'Éléments de marque exploitables en France'),
  (v_id,'Marque et identité',5,3,'Dépôt de la marque en France ou en Union européenne : numéro et classes'),

  (v_id,'Première édition parisienne',6,1,'Qui l''a produite, et sous quel accord'),
  (v_id,'Première édition parisienne',6,2,'Engagements ou droits subsistant de cette édition'),
  (v_id,'Première édition parisienne',6,3,'Fréquentation et retours d''expérience'),

  (v_id,'Signature et représentation',7,1,'Qui engage juridiquement Advantage Conseils sur ce contrat'),
  (v_id,'Signature et représentation',7,2,'Coordonnées du conseil juridique et du comptable d''Advantage');

  -- ---------- ACTIONS D'OUVERTURE ----------

  insert into fgp_actions(seance_id, libelle, porteur, echeance) values
  (v_id,'Décider de la souscription de l''assurance annulation','Thim Production','2026-08-15'),
  (v_id,'Arrêter la programmation pour permettre le dépôt des visas','Advantage Conseils','2026-08-25'),
  (v_id,'Confirmer par écrit le régime de TVA du forfait','Comptable Thim Production','2026-08-12'),
  (v_id,'Confirmer par écrit le coefficient de coût employeur','Comptable Thim Production','2026-08-12'),
  (v_id,'Transmettre la grille de contreparties sponsors','Advantage Conseils','2026-08-11'),
  (v_id,'Établir la proposition : contrat, devis et modalités','Thim Production','2026-08-13');

  raise notice 'seance 1 creee';
end $$;

/* ============================================================
   NABYCOOK — Bloc de configuration
   ------------------------------------------------------------
   C'EST LE SEUL FICHIER À REMPLIR quand Nabintou envoie ses
   éléments. Tout ce qui est marqué A_FOURNIR s'affiche sur le
   site avec un marqueur orange « à fournir » tant qu'il est vide.

   Règle : ne jamais inventer un chiffre, un partenaire ou une
   citation de presse. Un emplacement vide est honnête, un
   chiffre inventé ne l'est pas.

   Dernière mise à jour : 08/08/2026, d'après le dossier Drive
   « SITE NABYCOOK » transmis par Nabintou.
   ============================================================ */

const A_FOURNIR = null; // sentinelle : laisser tel quel tant que l'info manque

const NABY = {

  /* --- Drapeaux d'affichage --------------------------------
     maquette   : true  => bandeau "maquette de travail" en haut
                  false => site réel (penser aussi à retirer le
                           <meta name="robots" content="noindex">
                           dans les 5 pages, il n'est PAS piloté ici)
     adhesions  : true  => les boutons HelloAsso sont actifs
     instagram  : true  => le renvoi vers le compte Instagram est actif
     newsletter : true  => le formulaire Brevo est intégré
  --------------------------------------------------------- */
  maquette: false,
  adhesions: true,
  instagram: true,
  newsletter: false,

  /* --- Identité ------------------------------------------- */
  nom: 'NabyCook',
  // Phrase de Nabintou elle-même, elle clôt sa biographie :
  // « Cuisiner avec le soin d'une mère et la magie d'une alchimiste :
  //   c'est toute l'âme de Nabycook — la magie dans ton quotidien parisien. »
  tagline: 'La magie dans ton quotidien parisien.',
  taglineAValider: false,
  statut: 'Association loi 1901 · Économie Sociale et Solidaire',
  esus: 'Agrément ESUS en cours',
  ville: 'Paris',

  /* --- Contact -------------------------------------------- */
  email: 'nabycook@gmail.com',
  telephone: '+33 7 46 45 71 48',
  telephoneLien: '+33746457148',
  whatsapp: '33746457148',
  adresse: 'MVAC, 18 rue Ramus, 75020 Paris',
  rna: 'W751284723',
  siret: '106 555 220 00016',
  dateCreation: '27 mai 2026',

  /* --- Liens externes (outils déjà en place) -------------- */
  liens: {
    instagram: 'https://www.instagram.com/nabycook/',
    youtube: 'https://www.youtube.com/@nabycook',
    whatsappCanal: 'http://urlr.me/yhWGJv', // canal WhatsApp, repris de sa signature du 10/08
    facebook: A_FOURNIR,
    linkedin: A_FOURNIR,
    sumup: 'https://nabycook.sumupstore.com',
    helloassoAssociation: 'https://www.helloasso.com/associations/nabycook',
    helloassoAdhesion: 'https://www.helloasso.com/associations/nabycook/adhesions/nabycook-r-1',
    helloassoDon: 'https://www.helloasso.com/associations/nabycook/adhesions/brigade-du-coeur',
    brevoFormulaire: A_FOURNIR,   // URL du formulaire d'inscription Brevo
  },

  /* --- Formulaires Jotform (IDs déjà fournis) ------------- */
  jotform: {
    partenaire: '261936933539066', // devenir partenaire magasin
    atelierRse: '261937095223056', // phase 2
    devisTraiteur: '261936674164062', // phase 2
  },

  /* --- Distinctions ---------------------------------------
     Precision de Nabintou du 10/08/2026 : ce sont ses distinctions
     personnelles, pas celles de l'association. Elles ne s'affichent
     donc plus que sur la page Univers, au fil de sa biographie.
  --------------------------------------------------------- */
  distinctions: [
    'Lauréate ADIE Paris 2025',
    'Certifiée HEC Stand Up 2025',
    '1er Prix de l\'Assiette Romainvilloise 2026',
    'Incubée Baluchon',
    'Incubée Empow\'Her',
  ],

  /* --- Chiffres d'impact ---------------------------------
     Source : document « 3. Chiffres d'impact » de Nabintou,
     arrêtés au 30/06/2026.
       participants : 2025 « plus de 200 » + 2026 « 65 »
                      => « + de 265 », on ne transforme pas un
                      plancher en chiffre exact.
       ateliers     : 18 en 2025 + 9 en 2026
       invendus     : 300 kg en 2025 + 160 kg en 2026
  --------------------------------------------------------- */
  impactDate: '30 juin 2026',
  impact: [
    { valeur: '+ de 265', libelle: 'participants accueillis en atelier' },
    { valeur: '460 kg', libelle: 'd\'invendus sauvés du gaspillage' },
    { valeur: '5', libelle: 'entreprises accompagnées en RSE' },
    { valeur: '11', libelle: 'adhérents et soutiens' },
  ],

  /* --- Partenaires ----------------------------------------
     { nom: 'ADIE', logo: 'assets/partenaires/adie.png' }
     Sans logo, un emplacement au nom du partenaire s'affiche.

     N'apparaissent ici QUE les structures dont Nabintou a
     coché l'accord d'affichage. Deux sont volontairement
     absentes tant que l'accord n'est pas confirmé :
       - GAB Île-de-France (case laissée vide)
       - EE (« demander au président »)
  --------------------------------------------------------- */
  partenaires: [
    { nom: 'Mairie du 20e', logo: 'assets/partenaires/mairie-20e.jpg' },
    { nom: 'Linkee', logo: 'assets/partenaires/linkee.png' },
    { nom: 'Mairie de Villejuif · Ferme Urbaine', logo: A_FOURNIR },
    { nom: 'Incubateur Baluchon', logo: A_FOURNIR },
    { nom: 'ADIE', logo: A_FOURNIR },
    { nom: 'HEC Stand Up', logo: A_FOURNIR },
    { nom: 'LMPVPK', logo: A_FOURNIR },
  ],

  /* --- Photos ---------------------------------------------
     Clé = attribut data-photo-cle posé dans le HTML.
     Déposer les fichiers dans assets/photos/ sous ces noms.
     Tant qu'un fichier est absent, l'emplacement en pointillés
     reste affiché : le site ne casse pas, il attend.

     alt : décrit l'image pour les lecteurs d'écran. Obligatoire.
  --------------------------------------------------------- */
  photos: {
    // ATTENTION : la femme en toque blanche revient sur trois photos et
    // c'est elle qu'on presente comme la fondatrice. A faire confirmer par
    // Nabintou avant la mise en ligne publique, les textes alternatifs
    // restent neutres tant que ce n'est pas fait.
    heroAccueil: {
      src: 'assets/photos/atelier-ambiance.jpg',
      alt: 'Trois participantes en tablier, souriantes, lors d\'un atelier NabyCook',
    },
    portraitNabintou: {
      src: 'assets/photos/portrait-nabintou.jpg',
      alt: 'En cuisine lors d\'un atelier NabyCook, aux côtés d\'une participante',
    },
    cuisine: {
      src: 'assets/photos/plats-et-epices.jpg',
      alt: 'Herbes fraîches, bocaux et légumes taillés sur le plan de travail d\'un atelier',
    },
    atelierEntreprise: {
      src: 'assets/photos/atelier-entreprise.jpg',
      alt: 'Épluchage de carottes récupérées, lors d\'une préparation anti-gaspillage',
    },
  },

  /* --- Agenda ---------------------------------------------
     Demande de Nabintou du 10/08/2026 : 3 à 5 prochains rendez-vous,
     liste simple tenue à la main, pas de calendrier interactif.

     { date: '5 septembre 2026', lieu: 'Paris 20e',
       type: 'Forum des associations',
       desc: 'Une phrase, facultative.',
       lien: 'contact.html' }

     Les rendez-vous passés ne se retirent pas tout seuls : c'est une
     liste manuelle, il faut la tenir. Vide, la page invite à écrire.
  --------------------------------------------------------- */
  agenda: A_FOURNIR,

  /* --- Le chemin de l'association -------------------------
     Demande du 10/08/2026 : la page Univers ne doit pas se limiter
     à la biographie, elle doit montrer les étapes de l'association.
     { annee: '2023', titre: '...', desc: '...' }
  --------------------------------------------------------- */
  historique: A_FOURNIR,

  /* --- Revue de presse ------------------------------------
     { source: 'Le Parisien', citation: '...', url: '...' }
  --------------------------------------------------------- */
  presse: A_FOURNIR,

  /* --- Témoignages ----------------------------------------
     { texte: '...', auteur: 'Prénom N.', role: 'Participante atelier' }
     Le document « 07-temoignages-a-completer » du Drive est
     encore vide au 08/08/2026.
  --------------------------------------------------------- */
  temoignages: A_FOURNIR,

  /* --- Adhésions (montants confirmés par le CDC) ---------- */
  formules: [
    {
      nom: 'Nabycook\'r',
      prix: '50 €',
      unite: '/ an',
      etiquette: 'La formule complète',
      vedette: true,
      // Bloc réécrit par Nabintou, message du 10/08/2026.
      desc: 'Pour celles et ceux qui veulent faire partie de l\'aventure toute l\'année.',
      avantages: [
        'Participation régulière aux formations',
        'Invitations aux activités et événements',
        'Accès prioritaire aux ateliers et aux éditions limitées de l\'épicerie',
        'La lettre des coulisses, réservée aux adhérents',
      ],
    },
    {
      nom: 'La Brigade du cœur',
      prix: 'Prix libre',
      unite: 'dès 20 € / an',
      etiquette: 'Le soutien libre',
      vedette: false,
      desc: 'Pour soutenir la mission à hauteur de ce que vous pouvez, sans engagement.',
      avantages: [
        'Vous financez directement les ateliers solidaires',
        'Votre nom rejoint la Brigade du cœur, si vous le souhaitez',
        'La lettre des coulisses, réservée aux adhérents',
      ],
    },
  ],

  /* --- Mention fiscale ------------------------------------
     ATTENTION : ne PAS afficher de réduction d'impôt tant que
     l'association n'a pas confirmé sa capacité à émettre des
     reçus fiscaux (intérêt général). Mettre à true seulement
     après confirmation écrite.
  --------------------------------------------------------- */
  recuFiscal: false,
};

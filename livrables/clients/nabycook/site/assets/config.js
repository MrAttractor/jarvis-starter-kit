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
     newsletter : sans effet depuis le 11/08/2026, le formulaire de la
                  lettre est maison et toujours affiché
  --------------------------------------------------------- */
  maquette: false,
  adhesions: true,
  instagram: true,
  newsletter: true,

  /* --- Espace de pilotage de Nabintou ----------------------
     Le site lit ces tables pour AFFICHER, jamais pour ecrire.
     La cle ci-dessous est la cle publique du projet : elle est
     faite pour vivre dans une page, elle ne donne aucun droit
     d'ecriture. Toute modification passe par sa connexion.

     Si la base est injoignable, le site garde les valeurs de ce
     fichier. Une panne de base ne vide jamais le site.
  --------------------------------------------------------- */
  base: {
    url: 'https://lgdgbrivnhgeupqhkckd.supabase.co',
    cle: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZGdicml2bmhnZXVwcWhrY2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDI1OTEsImV4cCI6MjA5NTU3ODU5MX0.kMmpwsQAUJQ6VkEpj4OOloijP1HoZbYYzbjWW2hg7Gk',
  },

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
  },

  /* --- Formulaire partenaire magasin ----------------------
     Les 14 questions viennent du Jotform « Devenir partenaire
     Nabycook », repris tel quel puis reconstruit dans le site
     le 11/08/2026 : le formulaire est désormais à la charte,
     et les réponses arrivent dans son espace, plus chez un tiers.

     ATTENTION : ces libellés sont AUSSI écrits dans la fonction
     `nb-demande`, qui refuse tout ce qui n'est pas dans la liste.
     Modifier un libellé ici sans le modifier là-bas ferait
     disparaître la réponse en silence. Les deux vont ensemble.
  --------------------------------------------------------- */
  formulairePartenaire: {
    fonction: 'nb-demande',
    typesCommerce: [
      'Épicerie fine',
      'Magasin bio',
      'Primeur / marché',
      'Concept store',
      'Ferme urbaine / point de vente producteur',
    ],
    frequentations: [
      '< 50 clients/jour',
      '50-150 clients/jour',
      '150-300 clients/jour',
      '> 300 clients/jour',
    ],
    formats: [
      'Atelier démo courte durée (30-45min)',
      'Atelier participatif (1h-1h30)',
      'Dégustation commentée',
      'Animation récurrente (hebdo/mensuel)',
      'Événement ponctuel ou lancement produit',
    ],
    frequences: [
      'Ponctuel (test)',
      'Mensuel',
      'Hebdomadaire',
      'À définir ensemble',
    ],
    apports: [
      'Mise à disposition d\'un espace',
      'Visibilité (réseaux sociaux, newsletter, vitrine)',
      'Produits offerts pour les ateliers',
      'Rémunération / commission',
    ],
  },

  /* --- Formulaires Jotform restants -----------------------
     Phase 2, pas encore utilisés sur le site.
  --------------------------------------------------------- */
  jotform: {
    atelierRse: '261937095223056',
    devisTraiteur: '261936674164062',
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
     coché l'accord d'affichage. Une reste volontairement
     absente tant que l'accord n'est pas confirmé :
       - GAB Île-de-France (case laissée vide)

     principal: true met le partenaire seul en tête de bande,
     dans un cadre plus grand. Un seul à la fois.
     Entrepreneurs Engagés : accord du président obtenu le
     13/08/2026, confirmé par Mac Arthur.
  --------------------------------------------------------- */
  partenaires: [
    { nom: 'Entrepreneurs Engagés', logo: 'assets/partenaires/entrepreneurs-engages.png', principal: true },
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

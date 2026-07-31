/* ============================================================
   NABYCOOK — Bloc de configuration
   ------------------------------------------------------------
   C'EST LE SEUL FICHIER A REMPLIR quand Nabintou envoie ses
   elements. Tout ce qui est marque A_FOURNIR s'affiche sur le
   site avec un marqueur orange "a fournir" tant qu'il est vide.

   Regle : ne jamais inventer un chiffre, un partenaire ou une
   citation de presse. Un emplacement vide est honnete, un
   chiffre invente ne l'est pas.
   ============================================================ */

const A_FOURNIR = null; // sentinelle : laisser tel quel tant que l'info manque

const NABY = {

  /* --- Drapeaux d'affichage --------------------------------
     maquette   : true  => bandeau "maquette de travail" en haut
                  false => site reel (penser aussi a retirer le
                           <meta name="robots" content="noindex">
                           dans les 5 pages, il n'est PAS pilote ici)
     adhesions  : true  => les boutons HelloAsso sont actifs
     instagram  : true  => le flux Instagram est integre
     newsletter : true  => le formulaire Brevo est integre
  --------------------------------------------------------- */
  maquette: true,
  adhesions: false,
  instagram: false,
  newsletter: false,

  /* --- Identite ------------------------------------------- */
  nom: 'NabyCook',
  // Proposition a valider. Deux autres pistes soumises a Nabintou :
  // « Bien manger, bien vivre, sans rien gacher » et « La cuisine fusion qui ne jette rien ».
  tagline: 'La magie du bien vivre dans votre quotidien parisien.',
  taglineAValider: true, // affiche un marqueur tant que Nabintou n'a pas tranche
  statut: 'Association loi 1901 · Economie Sociale et Solidaire',
  esus: 'Agrement ESUS en cours',
  ville: 'Paris',

  /* --- Contact -------------------------------------------- */
  email: 'nabycook@gmail.com',
  telephone: '+33 7 46 45 71 48',
  telephoneLien: '+33746457148',
  whatsapp: '33746457148',
  adresse: A_FOURNIR,        // adresse postale de l'association
  siret: A_FOURNIR,          // numero RNA (W...) et/ou SIRET
  dateCreation: A_FOURNIR,   // date de declaration en prefecture

  /* --- Liens externes (outils deja en place) -------------- */
  liens: {
    instagram: A_FOURNIR,        // https://instagram.com/...
    facebook: A_FOURNIR,
    linkedin: A_FOURNIR,
    sumup: 'https://nabycook.sumupstore.com',
    helloassoAdhesion: A_FOURNIR, // page adhesion Nabycook'r
    helloassoDon: A_FOURNIR,      // page don / Brigade du coeur
    brevoFormulaire: A_FOURNIR,   // URL du formulaire d'inscription Brevo
  },

  /* --- Formulaires Jotform (IDs deja fournis) ------------- */
  jotform: {
    partenaire: '261936933539066', // devenir partenaire magasin
    atelierRse: '261937095223056', // phase 2
    devisTraiteur: '261936674164062', // phase 2
  },

  /* --- Distinctions (confirmees par le CDC) --------------- */
  distinctions: [
    'Laureate ADIE Paris 2025',
    'Certifiee HEC Stand Up 2025',
    '1er Prix de l\'Assiette Romainvilloise 2026',
    'Incubee Baluchon',
    'Incubee Empow\'Her',
  ],

  /* --- Chiffres d'impact ---------------------------------
     Remplacer la valeur par le vrai chiffre (chaine de texte).
     Laisser A_FOURNIR tant que Nabintou ne l'a pas confirme.
  --------------------------------------------------------- */
  impact: [
    { valeur: A_FOURNIR, libelle: 'participants accueillis en atelier' },
    { valeur: A_FOURNIR, libelle: 'kilos d\'invendus sauves du gaspillage' },
    { valeur: A_FOURNIR, libelle: 'entreprises accompagnees en RSE' },
    { valeur: A_FOURNIR, libelle: 'adherents et soutiens' },
  ],

  /* --- Partenaires ----------------------------------------
     { nom: 'ADIE', logo: 'assets/partenaires/adie.png' }
     Sans logo, un emplacement au nom du partenaire s'affiche.
  --------------------------------------------------------- */
  partenaires: A_FOURNIR,

  /* --- Revue de presse ------------------------------------
     { source: 'Le Parisien', citation: '...', url: '...' }
  --------------------------------------------------------- */
  presse: A_FOURNIR,

  /* --- Temoignages ----------------------------------------
     { texte: '...', auteur: 'Prenom N.', role: 'Participante atelier' }
  --------------------------------------------------------- */
  temoignages: A_FOURNIR,

  /* --- Adhesions (montants confirmes par le CDC) ---------- */
  formules: [
    {
      nom: 'Nabycook\'r',
      prix: '50 €',
      unite: '/ an',
      etiquette: 'La formule complete',
      vedette: true,
      desc: 'Pour celles et ceux qui veulent faire partie de l\'aventure toute l\'annee.',
      avantages: [
        'Membre a part entiere de l\'association',
        'Invitation a l\'assemblee generale et voix au chapitre',
        'Acces prioritaire aux ateliers et aux editions limitees',
        'La lettre des coulisses, reservee aux adherents',
      ],
    },
    {
      nom: 'La Brigade du coeur',
      prix: 'Prix libre',
      unite: 'des 20 € / an',
      etiquette: 'Le soutien libre',
      vedette: false,
      desc: 'Pour soutenir la mission a hauteur de ce que vous pouvez, sans engagement.',
      avantages: [
        'Vous financez directement les ateliers solidaires',
        'Votre nom rejoint la Brigade du coeur, si vous le souhaitez',
        'La lettre des coulisses, reservee aux adherents',
      ],
    },
  ],

  /* --- Mention fiscale ------------------------------------
     ATTENTION : ne PAS afficher de reduction d'impot tant que
     l'association n'a pas confirme sa capacite a emettre des
     recus fiscaux (interet general). Mettre a true seulement
     apres confirmation ecrite.
  --------------------------------------------------------- */
  recuFiscal: false,
};

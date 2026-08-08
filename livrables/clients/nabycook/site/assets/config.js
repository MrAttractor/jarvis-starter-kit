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
  maquette: true,
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

  /* --- Distinctions (confirmées par le CDC et la bio) ----- */
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
    { nom: 'Mairie du 20e', logo: A_FOURNIR },
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
    heroAccueil: {
      src: 'assets/photos/atelier-ambiance.jpg',
      alt: 'Un atelier de cuisine NabyCook en cours, autour du plan de travail',
    },
    portraitNabintou: {
      src: 'assets/photos/portrait-nabintou.jpg',
      alt: 'Nabintou Dosso, fondatrice de NabyCook, en cuisine',
    },
    cuisine: {
      src: 'assets/photos/plats-et-epices.jpg',
      alt: 'Plats, épices et produits bruts préparés par NabyCook',
    },
    atelierEntreprise: {
      src: 'assets/photos/atelier-entreprise.jpg',
      alt: 'Un atelier NabyCook animé en entreprise',
    },
  },

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
      desc: 'Pour celles et ceux qui veulent faire partie de l\'aventure toute l\'année.',
      avantages: [
        'Membre à part entière de l\'association',
        'Invitation à l\'assemblée générale et voix au chapitre',
        'Accès prioritaire aux ateliers et aux éditions limitées',
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

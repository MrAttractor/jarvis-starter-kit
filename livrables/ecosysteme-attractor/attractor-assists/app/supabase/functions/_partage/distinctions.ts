// ============================================================
// latiss.net — LES TROIS DISTINCTIONS, 21/09/2026
//
// REMPLACE LE CATALOGUE DE QUINZE BADGES, ecrit le matin meme et juge
// « trop detaille » par Mac Arthur le soir. Il avait raison : une distinction
// qui ne se dit pas a voix haute ne sert a rien, et Serge ne peut pas citer
// quinze recompenses en video.
//
// IL EN RESTE TROIS, chacune repond a une question differente :
//
//   1. QUI EST LA ?          Meilleur contributeur, titre de la SEMAINE.
//   2. QUI AMENE DU MONDE ?  Ambassadeur, trois paliers, acquis A VIE.
//   3. QUI FAIT LES DEUX ?   Super fan.
//
// LE TITRE DE LA SEMAINE SE COMPTE EN COUVERTURE, PAS EN POINTS. Definition
// donnee par Mac Arthur : « celui qui est actif sur TOUS les postes ». Trente
// coeurs sur une seule publication font un gros score et une mauvaise
// semaine. Un seul coeur sur chacune des publications fait un petit score et
// une presence parfaite. C'est la seconde qu'on recompense, et c'est la seule
// qui donne a Serge une phrase vraie : « cette semaine, ils n'ont rien rate ».
//
// UN TITRE QUI SE PERD, ET DEUX QUI NE SE PERDENT JAMAIS. Le contributeur se
// rejoue chaque semaine, sinon le premier arrive reste premier et plus
// personne ne peut le rattraper. Le grade d'Ambassadeur, lui, est acquis :
// on ne retire pas a quelqu'un les gens qu'il a fait entrer.
//
// UN SEUL FICHIER, deux lecteurs : `bey-public` pour l'espace fan,
// `bey-admin` pour le tableau de bord. Si la regle vivait en deux endroits,
// le fan verrait un jour un titre que Serge ne voit pas.
// ============================================================

/** La fenetre du titre hebdomadaire. Mac Arthur hesitait entre trois jours et
 *  une semaine : sept, parce que trois jours punit celui qui travaille et ne
 *  consulte que le week-end, et parce qu'un rendez-vous hebdomadaire se tient.
 *  DOIT rester aligne sur l'intervalle des vues v_bey_semaine et
 *  v_bey_actifs_semaine (migration 0019). */
export const FENETRE_JOURS = 7;

/** Les paliers du grade, decides par Mac Arthur le 21/09/2026.
 *  Le premier etait a 5 jusqu'a ce jour : personne ne l'avait encore
 *  atteint, le relever ne retire donc son grade a personne. */
export const PALIERS = [
  { niveau: 1, seuil: 10, nom: "Ambassadeur" },
  { niveau: 2, seuil: 30, nom: "Grand Ambassadeur" },
  { niveau: 3, seuil: 100, nom: "Super Ambassadeur" },
];

export type Etat = {
  filleuls?: number;      // personnes entrees grace a lui, depuis toujours
  touchees?: number;      // publications de la semaine auxquelles il a repondu
  publications?: number;  // publications de Serge sur la semaine
};

export type Grade = {
  niveau: number;         // 0 = simple membre
  nom: string;            // « Membre », « Ambassadeur », ...
  filleuls: number;
  prochain: number | null; // le palier suivant, null au sommet
  manque: number;          // combien de personnes il reste a faire entrer
};

export type Semaine = {
  publications: number;
  touchees: number;
  complet: boolean;       // il n'a rien rate : c'est le titre
  manque: number;         // publications de la semaine pas encore touchees
};

export type Distinctions = {
  grade: Grade;
  semaine: Semaine;
  contributeur: boolean;  // titre de la semaine
  superfan: boolean;      // Ambassadeur ET contributeur en meme temps
  titre: string;          // le seul mot a afficher quand il n'y a de place que pour un
};

/** Le grade, seule fonction du nombre de filleuls. Acquis a vie. */
export function grade(filleuls: number): Grade {
  const n = Math.max(0, filleuls || 0);
  let atteint = { niveau: 0, seuil: 0, nom: "Membre" };
  for (const p of PALIERS) if (n >= p.seuil) atteint = p;
  const suivant = PALIERS.find((p) => n < p.seuil) || null;
  return {
    niveau: atteint.niveau,
    nom: atteint.nom,
    filleuls: n,
    prochain: suivant ? suivant.seuil : null,
    manque: suivant ? suivant.seuil - n : 0,
  };
}

/** La semaine. Sans publication, personne n'a rien rate : le titre ne se
 *  decroche pas, et ce n'est la faute de personne. On ne felicite pas une
 *  communaute pour une semaine ou l'artiste n'a rien publie. */
export function semaine(touchees: number, publications: number): Semaine {
  const p = Math.max(0, publications || 0);
  const t = Math.min(Math.max(0, touchees || 0), p);
  return { publications: p, touchees: t, complet: p > 0 && t === p, manque: Math.max(0, p - t) };
}

export function distinctions(e: Etat): Distinctions {
  const g = grade(e.filleuls ?? 0);
  const s = semaine(e.touchees ?? 0, e.publications ?? 0);
  const contributeur = s.complet;
  const superfan = contributeur && g.niveau >= 1;
  // Le mot a citer quand il n'y a de place que pour un. Super fan passe
  // devant le grade : il dit les deux a la fois.
  const titre = superfan ? "Super fan" : (g.niveau >= 1 ? g.nom : (contributeur ? "Meilleur contributeur" : "Membre"));
  return { grade: g, semaine: s, contributeur, superfan, titre };
}

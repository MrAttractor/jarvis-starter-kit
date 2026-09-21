// ============================================================
// latiss.net — LE CATALOGUE DES BADGES, 21/09/2026
//
// UN SEUL FICHIER, deux lecteurs : `bey-public` le sert au fan pour son
// etagere, `bey-admin` le sert a Serge pour son tableau de bord. Si la regle
// vivait en deux endroits, le fan verrait un jour un badge que Serge ne voit
// pas, et c'est le genre d'ecart qu'on ne decouvre qu'en video.
//
// UN BADGE NE SE DECERNE PAS, IL SE CALCULE. Chaque badge est un seuil sur un
// compteur reel. Il apparait a la seconde ou le seuil est franchi, sans
// declencheur, sans tache de fond, sans risque d'oubli. Et comme rien n'est
// stocke, un badge ne peut pas rester accroche a quelqu'un qui ne le merite
// plus par erreur.
//
// AUCUN BADGE NE SE RETIRE. Tous les compteurs employes ici ne font que
// monter, sauf un : `cloche`, que le fan peut couper. C'est assume, il
// recupere le badge en la rallumant.
//
// LE PROCHAIN BADGE EST AUSSI IMPORTANT QUE CEUX QUI SONT GAGNES. Une etagere
// qui ne montre que le passe ne fait rien faire. Chaque badge non gagne porte
// donc ou en est le fan et ce qu'il lui reste a faire, en clair.
//
// LES NOMS SONT A VALIDER PAR MAC ARTHUR : c'est le lexique de la fanbase, pas
// le mien. Ils sont ranges ici, en un bloc, pour se relire d'un coup d'oeil.
// ============================================================

export type Totaux = {
  commentaires?: number;
  votes?: number;
  coeurs?: number;
  filleuls?: number;
  cloche?: boolean;
  grade?: string;
  arrives_avant?: number;
};

export type Badge = {
  cle: string;
  nom: string;
  quoi: string;      // ce qu'il faut faire pour l'avoir, en une phrase
  famille: string;   // parole | coeur | avis | equipe | maison
  prestige: number;  // 1 facile a 10 rare, pour savoir lequel citer en premier
  gagne: boolean;
  ou_en: number;     // la valeur atteinte
  palier: number;    // la valeur a atteindre
};

// Le nombre de premiers inscrits qui restent des Pionniers. Fige : si le
// chiffre bougeait, un fan perdrait un badge deja affiche.
export const PIONNIERS = 100;

type Regle = {
  cle: string;
  nom: string;
  quoi: string;
  famille: string;
  palier: number;
  prestige: number;
  ou_en: (t: Totaux) => number;
};

const REGLES: Regle[] = [
  // ── La parole : commenter demande d'ecrire, c'est le geste le plus cher ──
  { cle: "premier_mot", nom: "Premier mot", quoi: "Laisser un commentaire", famille: "parole", prestige: 1, palier: 1, ou_en: (t) => t.commentaires ?? 0 },
  { cle: "on_t_entend", nom: "On t'entend", quoi: "10 commentaires", famille: "parole", prestige: 3, palier: 10, ou_en: (t) => t.commentaires ?? 0 },
  { cle: "porte_voix", nom: "Porte-voix", quoi: "50 commentaires", famille: "parole", prestige: 6, palier: 50, ou_en: (t) => t.commentaires ?? 0 },
  { cle: "griot", nom: "Le griot", quoi: "200 commentaires", famille: "parole", prestige: 9, palier: 200, ou_en: (t) => t.commentaires ?? 0 },

  // ── Le coeur : un pouce, mais repete ──
  { cle: "coeur_chaud", nom: "Cœur chaud", quoi: "10 cœurs", famille: "coeur", prestige: 2, palier: 10, ou_en: (t) => t.coeurs ?? 0 },
  { cle: "coeur_or", nom: "Cœur en or", quoi: "100 cœurs", famille: "coeur", prestige: 5, palier: 100, ou_en: (t) => t.coeurs ?? 0 },

  // ── L'avis : voter, c'est choisir ──
  { cle: "ton_avis", nom: "Ton avis compte", quoi: "Répondre à 3 sondages", famille: "avis", prestige: 1, palier: 3, ou_en: (t) => t.votes ?? 0 },
  { cle: "jury", nom: "Membre du jury", quoi: "Répondre à 15 sondages", famille: "avis", prestige: 4, palier: 15, ou_en: (t) => t.votes ?? 0 },

  // ── L'equipe : amener du monde ──
  { cle: "premier_filleul", nom: "Premier filleul", quoi: "Faire entrer 1 fan", famille: "equipe", prestige: 3, palier: 1, ou_en: (t) => t.filleuls ?? 0 },
  { cle: "recruteur", nom: "Recruteur", quoi: "Faire entrer 5 fans", famille: "equipe", prestige: 6, palier: 5, ou_en: (t) => t.filleuls ?? 0 },
  { cle: "chef_zone", nom: "Chef de zone", quoi: "Faire entrer 20 fans", famille: "equipe", prestige: 8, palier: 20, ou_en: (t) => t.filleuls ?? 0 },
  { cle: "grand_chef", nom: "Grand chef", quoi: "Faire entrer 50 fans", famille: "equipe", prestige: 10, palier: 50, ou_en: (t) => t.filleuls ?? 0 },

  // ── La maison : etre la, et rester joignable ──
  { cle: "cloche", nom: "Toujours prévenu", quoi: "Activer la cloche", famille: "maison", prestige: 2, palier: 1, ou_en: (t) => (t.cloche ? 1 : 0) },
  { cle: "ambassadeur", nom: "Ambassadeur", quoi: "Passer Ambassadeur", famille: "maison", prestige: 7, palier: 1, ou_en: (t) => (t.grade === "ambassadeur" ? 1 : 0) },
  // Pionnier ne se rattrape pas : soit on etait la, soit non. Le « ou en est »
  // vaut donc 1 ou 0, et jamais une progression qui laisserait croire le
  // contraire a un arrivant.
  { cle: "pionnier", nom: "Pionnier", quoi: `Faire partie des ${PIONNIERS} premiers inscrits`, famille: "maison", prestige: 5, palier: 1,
    ou_en: (t) => ((t.arrives_avant ?? PIONNIERS) < PIONNIERS ? 1 : 0) },
];

/** Tous les badges, gagnes d'abord, puis les plus proches d'etre gagnes. */
export function badges(t: Totaux): Badge[] {
  const liste = REGLES.map((r) => {
    const ou_en = r.ou_en(t);
    return { cle: r.cle, nom: r.nom, quoi: r.quoi, famille: r.famille, prestige: r.prestige,
             palier: r.palier, ou_en, gagne: ou_en >= r.palier };
  });
  // Les gagnes en tete, dans l'ordre du catalogue. Puis les autres, du plus
  // proche au plus lointain : le premier verrou affiche doit etre celui qu'on
  // peut faire sauter aujourd'hui.
  const gagnes = liste.filter((b) => b.gagne);
  const reste = liste.filter((b) => !b.gagne)
    .sort((a, b) => (b.ou_en / b.palier) - (a.ou_en / a.palier) || a.palier - b.palier);
  return [...gagnes, ...reste];
}

/** Le badge a citer quand il n'y a de place que pour un.
    On compare le PRESTIGE, jamais le palier : 200 commentaires et 50 filleuls
    sont deux paliers de 200 et 50, et pourtant c'est le second qui est rare. */
export function badgePhare(t: Totaux): Badge | null {
  const g = badges(t).filter((b) => b.gagne);
  if (!g.length) return null;
  return g.reduce((a, b) => (b.prestige > a.prestige ? b : a));
}

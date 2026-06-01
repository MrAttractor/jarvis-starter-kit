export const MOCK = {
  user: {
    name: "Aya Koné", first: "Aya", initials: "AK", zone: "CI", email: "aya@chezaya.ci",
    ton: "Chaleureux · couleur ivoirienne", assistantName: "Mac", streak: 6, plan: "Découverte", palier: 3,
  },
  brand: {
    name: "Chez Aya · Bissap", secteur: "Restauration / Boissons",
    promesse: "Le bissap maison le plus frais d'Abidjan", ville: "Abidjan, Cocody",
  },
  messages: { used: 7, limit: 20 },
  palierName: "Tu montes",
  ppsd: {
    problemes: ["Marre des sodas trop sucrés et chimiques", "Pas le temps de préparer du bissap maison"],
    peurs: ["Boissons industrielles mauvaises pour la santé", "Payer cher pour une qualité douteuse"],
    souhaits: ["Une boisson naturelle, fraîche, livrée vite", "Soutenir un commerce local de qualité"],
    desirs: ["Se faire plaisir sans culpabiliser", "Être fier de consommer ivoirien"],
    ou: ["Groupes WhatsApp quartier Cocody", "Pages food Instagram Abidjan", "Bureaux & open spaces le midi"],
    declencheurs: ["Chaleur de midi", "Pause déjeuner", "Cérémonies & événements"],
  },
  offre: {
    principal: "Pack 6 bouteilles de bissap frais (50 cl)",
    bonus: ["Livraison offerte dès 4 bouteilles", "1 gingembre maison offert au 1er achat"],
    urgence: "Lancement : −20 % pendant 48 h, stock limité à 100 packs",
  },
  assistants: [
    {
      id: "coach", genre: "m", name: "Coach", role: "Ton bras droit", plan: "Découverte", status: "actif", accent: "orange", icon: "compass", photo: null,
      desc: "Il te pose la bonne question au bon moment. Rien de plus, rien de moins.",
      bio: null, proactif: null,
    },
    {
      id: "awa", genre: "f", name: "Awa", role: "Prospection & vente", plan: "Bras Droit", status: "actif", accent: "info", icon: "trend", photo: "/uploads/agents/awa.jpg",
      desc: "Dis-moi qui tu veux convaincre. Elle prépare les messages qui font ouvrir les portefeuilles.",
      bio: "Grandie à Treichville entre le marché de sa maman et les vendeurs du quartier. Elle a appris à vendre avant d'apprendre à lire. Aujourd'hui elle fait ça avec un téléphone et Claude derrière. Sa règle : aucun prospect sans réponse après 48h.",
      proactif: "Elle surveille tous tes prospects actifs et relance automatiquement après 48h de silence — sans que tu aies à y penser. Elle construit tes séquences de closing complètes : premier contact, relance ciblée, offre finale. Elle analyse les réponses reçues et te dit quand et comment fermer la vente.",
    },
    {
      id: "miriam", genre: "f", name: "Miriam", role: "Présence digitale", plan: "Manager", status: "verrouillé", accent: "amber", icon: "chat", photo: "/uploads/agents/miriam.jpg",
      desc: "Posts, réponses, broadcasts. Elle gère ta présence en ligne pendant que tu travailles.",
      bio: "Cocody, études de communication à l'INPHB, jamais sans son téléphone. Elle a rendu viral un post sur l'attiéké sans faire exprès. Elle connaît les horaires où les Ivoiriens scrollent, ce qui les fait réagir, et ce qui les fait acheter.",
      proactif: "Elle planifie ta semaine éditoriale selon les moments où ta cible est la plus active — tu valides, elle publie. Elle prépare et programme tes broadcasts WhatsApp à l'avance. Elle répond à ta communauté selon ton ton et tes consignes, sans que tu touches au téléphone.",
    },
    {
      id: "serge", genre: "m", name: "Serge", role: "Organisation & agenda", plan: "Manager", status: "verrouillé", accent: "growth", icon: "flag", photo: "/uploads/agents/serge.jpg",
      desc: "T'as 12 trucs en tête. Il trie, organise ta semaine et te rappelle ce qui brûle.",
      bio: "Yopougon. A un cahier pour tout, y compris ses listes de listes. Si quelque chose n'est pas noté quelque part, pour lui ça n'existe pas. Il organise ta semaine avant que tu aies fini ton café. Un peu trop précis selon certains — mais rien ne tombe jamais.",
      proactif: "Il te prépare un brief de semaine chaque lundi matin : priorités classées, relances en retard, actions urgentes dans l'ordre. Il surveille tes engagements pris en conversation et te rappelle avant qu'il soit trop tard. Quand une deadline approche, tu reçois une alerte — jamais de surprise.",
    },
    {
      id: "roland", genre: "m", name: "Roland", role: "Finance & marges", plan: "Manager", status: "verrouillé", accent: "charbon", icon: "coins", photo: "/uploads/agents/roland.jpg",
      desc: "Tu vends à perte ou pas ? Il te dit la vérité en 5 minutes.",
      bio: "Grand-Bassam, revenu de France avec son master et une aversion pour les chiffres flous. Il ne fait pas de comptabilité — il fait de la clarté. Version focalisée dans l'app ; la version complète arrive dans l'app sœur.",
      proactif: "Il fait ton point financier mensuel automatiquement : CA, marges, ratio par produit ou service. Il t'alerte dès que tes marges descendent sous ton seuil de rentabilité, avant que ce soit un problème. Donne-lui 3 chiffres, il te sort une projection complète en 2 minutes.",
    },
    {
      id: "kofi", genre: "m", name: "Kofi", role: "Storytelling & Campagnes", plan: "Manager", status: "verrouillé", accent: "info", icon: "trend", photo: "/uploads/agents/kofi.jpg",
      desc: "Il transforme ton activité en histoire qui vend. Posts, séquences, campagnes — il scénarise tout.",
      bio: "San-Pédro, fils d'un commerçant de bois. Il a grandi en écoutant son père convaincre des acheteurs avec des histoires, pas des prix. Aujourd'hui il fait pareil — mais pour des entrepreneurs digitaux. Il ne fait pas des posts. Il construit des récits qui créent de la loyauté.",
      proactif: "Il construit ta campagne complète en 3 phases : film de marque personnelle, séquence de 7 posts espacés dans le temps, 3 broadcasts WhatsApp prêts à envoyer. Chaque message est ancré dans ton histoire réelle et calibré sur ta cible PPSD. Il te donne aussi ta signature narrative — le récit que les gens retiennent après t'avoir lu une seule fois.",
    },
  ],
  forfaits: [
    {
      id: "decouverte", name: "Découverte", eur: "0 €", fcfa: "0 FCFA", period: "pour toujours",
      tagline: "Commence sans rien payer. Ton premier bras droit IA.", current: true,
      features: [
        "Bras droit IA disponible 24h/24 — répond en quelques secondes",
        "Awa incluse : tes messages de prospection et relances prêts à envoyer",
        "20 messages/jour · +5 par ami invité grâce au parrainage",
        "Agenda intelligent : tâches, priorités, suivi de tes relances",
        "Méthode ATTRACTOR complète : PPSD, offre irrésistible, couloir de croissance",
      ]
    },
    {
      id: "brasdroit", name: "Bras Droit Pro", eur: "≈ 14 €", fcfa: "9 000 FCFA", period: "/ mois",
      tagline: "Ton bras droit passe à l'action — plus de limites.",
      features: [
        "Messages illimités avec ton bras droit et Awa — plus de compteur",
        "Mémoire long terme : ton bras droit se souvient de tout entre les sessions",
        "Awa en mode avancé : séquences de closing et suivi de prospects",
        "Priorité de réponse — jamais en attente",
      ]
    },
    {
      id: "manager", name: "Manager", eur: "29 €", eurOld: "99 €", fcfa: "≈ 19 000 FCFA", period: "/ mois",
      tagline: "5 experts dans ta poche. Une agence sans les charges.", highlight: true, promo: "Promo fondateurs",
      features: [
        "Awa (vente), Miriam (contenu), Serge (agenda), Roland (finances), Kofi (campagnes)",
        "Campagnes complètes scénarisées par Kofi — film, posts, WhatsApp en 3 phases",
        "Messages illimités avec toute l'équipe — disponible à 3h du matin",
        "Tout le plan Bras Droit Pro inclus",
        "Économise 70€/mois · Promo réservée aux 100 premiers",
      ]
    },
  ],
  milestones: [
    { id: 1, label: "Se connaître", state: "done" },
    { id: 2, label: "Cible PPSD", state: "done" },
    { id: 3, label: "Offre irrésistible", state: "now" },
    { id: 4, label: "Passer à l'action", state: "todo" },
  ],
};

export const AIDA_DELIVERABLE = {
  title: "Argumentaire AIDA", tag: "Bissap",
  blocks: [
    { k: "Attention", v: "Abidjan, il fait 33° et tu bois encore du soda chimique ? 🥵" },
    { k: "Intérêt", v: "Chez Aya, c'est du bissap 100 % maison, frais du jour, zéro conservateur. Le vrai goût de chez nous." },
    { k: "Désir", v: "Imagine : ta pause déj' fraîche, saine, livrée au bureau en 30 min. Tes collègues vont demander ton plug." },
    { k: "Action", v: "Commande ton Pack 6 aujourd'hui : −20 % les 48h + livraison offerte. Écris-nous « BISSAP » sur WhatsApp 👉" },
  ],
};

export const PASA_DELIVERABLE = {
  title: "Argumentaire PASA", tag: "Bissap",
  blocks: [
    { k: "Problème", v: "Tu veux boire sain au boulot mais y'a que des sodas sucrés autour de toi." },
    { k: "Agitation", v: "Chaque midi, tu fais un choix : ta santé ou ta soif. Et le sucre, sur le long terme, ça pardonne pas." },
    { k: "Souhait", v: "Et si une boisson naturelle, fraîche et ivoirienne arrivait direct à ton bureau ?" },
    { k: "Action", v: "Chez Aya livre ton Pack 6 de bissap maison aujourd'hui. Écris « BISSAP » sur WhatsApp, on s'occupe du reste." },
  ],
};

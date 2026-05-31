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
      id: "coach", name: "Coach", role: "Ton bras droit", plan: "Découverte", status: "actif", accent: "orange", icon: "compass", photo: null,
      desc: "Il te pose la bonne question au bon moment. Rien de plus, rien de moins.",
      bio: null, proactif: null,
    },
    {
      id: "awa", name: "Awa", role: "Prospection & vente", plan: "Bras Droit", status: "actif", accent: "info", icon: "trend", photo: "/uploads/agents/awa.jpg",
      desc: "Dis-moi qui tu veux convaincre. Elle prépare les messages qui font ouvrir les portefeuilles.",
      bio: "Grandie à Treichville entre le marché de sa maman et les vendeurs du quartier. Elle a appris à vendre avant d'apprendre à lire. Aujourd'hui elle fait ça avec un téléphone et Claude derrière. Sa règle : aucun prospect sans réponse après 48h.",
      proactif: "Elle surveille tes prospects, relance automatiquement après 48h de silence et prépare tes séquences de closing avant que tu ne les demandes.",
    },
    {
      id: "miriam", name: "Miriam", role: "Présence digitale", plan: "Manager", status: "verrouillé", accent: "amber", icon: "chat", photo: "/uploads/agents/miriam.jpg",
      desc: "Posts, réponses, broadcasts. Elle gère ta présence en ligne pendant que tu travailles.",
      bio: "Cocody, études de communication à l'INPHB, jamais sans son téléphone. Elle a rendu viral un post sur l'attiéké sans faire exprès. Elle connaît les horaires où les Ivoiriens scrollent, ce qui les fait réagir, et ce qui les fait acheter.",
      proactif: "Elle planifie ta semaine éditoriale, programme tes broadcasts WhatsApp et répond à ta communauté selon tes consignes.",
    },
    {
      id: "serge", name: "Serge", role: "Organisation & agenda", plan: "Manager", status: "verrouillé", accent: "growth", icon: "flag", photo: "/uploads/agents/serge.jpg",
      desc: "T'as 12 trucs en tête. Il trie, organise ta semaine et te rappelle ce qui brûle.",
      bio: "Yopougon. A un cahier pour tout, y compris ses listes de listes. Si quelque chose n'est pas noté quelque part, pour lui ça n'existe pas. Il organise ta semaine avant que tu aies fini ton café. Un peu trop précis selon certains — mais rien ne tombe jamais.",
      proactif: "Il te prépare un brief de semaine chaque lundi, suit tes relances en retard et t'alerte en temps réel sur ce qui est urgent.",
    },
    {
      id: "roland", name: "Roland", role: "Finance & marges", plan: "Manager", status: "verrouillé", accent: "charbon", icon: "coins", photo: "/uploads/agents/roland.jpg",
      desc: "Tu vends à perte ou pas ? Il te dit la vérité en 5 minutes.",
      bio: "Grand-Bassam, revenu de France avec son master et une aversion pour les chiffres flous. Il ne fait pas de comptabilité — il fait de la clarté. Version focalisée dans l'app ; la version complète arrive dans l'app sœur.",
      proactif: "Il fait ton point financier mensuel automatiquement et t'alerte quand tes marges descendent sous le seuil de rentabilité.",
    },
  ],
  forfaits: [
    { id: "decouverte", name: "Découverte", eur: "0 €", fcfa: "0 FCFA", period: "pour toujours", tagline: "Ton bras droit personnel — gratuit pour toujours", current: true,
      features: ["Ton bras droit disponible 24h/24", "20 messages par jour", "Agenda et rappels de tes tâches", "Accès à la méthode ATTRACTOR"] },
    { id: "brasdroit", name: "Bras Droit Pro", eur: "≈ 14 €", fcfa: "9 000 FCFA", period: "/ mois", tagline: "Ton bras droit qui agit à ta place",
      features: ["Analyse tes pages et surveille les tendances de ton marché", "Te propose des actions concrètes pour booster tes ventes", "Te fait des rapports précis sur ta progression", "Messages sans limite journalière"] },
    { id: "manager", name: "Manager", eur: "29 €", eurOld: "99 €", fcfa: "≈ 19 000 FCFA", period: "/ mois", tagline: "Ta petite agence digitale à portée de main", highlight: true, promo: "Promo flash",
      features: ["Des agents spécialisés qui travaillent 24h/24 pour toi", "Prospection, contenu, organisation, finances — tout couvert", "Accès complet à toute l'équipe", "Tout le Bras Droit Pro inclus"] },
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

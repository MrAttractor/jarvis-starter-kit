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
      id: "awa", genre: "f", name: "Awa", role: "Prospection & vente", plan: "Bras Droit", status: "actif", accent: "info", icon: "trend", photo: "/uploads/agents/awa.png",
      desc: "Dis-moi qui tu veux convaincre. Elle prépare les messages qui font ouvrir les portefeuilles.",
      bio: "Grandie à Treichville entre le marché de sa maman et les vendeurs du quartier. Elle a appris à vendre avant d'apprendre à lire. Sa règle absolue : aucun prospect sans réponse en 48h. \"Un prospect qui attend plus de 48h, c'est un prospect qui a trouvé quelqu'un d'autre.\" Elle ne vend pas — elle écoute, identifie le vrai problème, et confirme la solution avant que tu aies fini ta phrase.",
      proactif: "Elle surveille tous tes prospects actifs et relance automatiquement après 48h de silence — sans que tu y penses. Elle construit tes séquences de closing complètes : premier contact humain, relance ciblée sans pression, offre finale. Elle analyse les réponses et te dit exactement quand et comment fermer la vente.",
    },
    {
      id: "miriam", genre: "f", name: "Miriam", role: "Présence digitale", plan: "Manager", status: "verrouillé", accent: "amber", icon: "chat", photo: "/uploads/agents/miriam.jpg",
      desc: "Posts, réponses, broadcasts. Elle gère ta présence en ligne pendant que tu travailles.",
      bio: "Cocody Les II Plateaux, études de communication à l'INPHB de Yamoussoukro. Un jour elle a filmé sa grand-mère qui préparait l'attiéké — 847 000 vues. Elle a compris : les gens veulent voir du vrai, pas du parfait. Elle connaît les horaires exacts où les Ivoiriens scrollent, ce qui les fait réagir, et ce qui les fait acheter. Elle ne publie pas n'importe quoi. Elle publie ce qui marche.",
      proactif: "Elle planifie ta semaine éditoriale selon les moments où ta cible est la plus active — tu valides, elle publie. Elle prépare et programme tes broadcasts WhatsApp à l'avance. Elle répond à ta communauté selon ton ton et tes consignes, sans que tu touches au téléphone. \"Tu veux des likes ou des clients ? C'est pas les mêmes posts.\"",
    },
    {
      id: "serge", genre: "m", name: "Serge", role: "Organisation & agenda", plan: "Manager", status: "verrouillé", accent: "growth", icon: "flag", photo: "/uploads/agents/serge.jpg",
      desc: "T'as 12 trucs en tête. Il trie, organise ta semaine et te rappelle ce qui brûle.",
      bio: "Yopougon Selmer. A 14 cahiers Oxford remplis depuis 2016, classés, indexés, avec des onglets colorés. Il a une liste de ses listes. Sa conviction : \"Si ce n'est pas noté, ça n'a pas eu lieu. Si ça n'a pas eu lieu, ça n'existe pas.\" Il arrive à 8h pile — pas 7h59, pas 8h01. Il organise ta semaine avant que tu aies fini ton café. Rien ne tombe jamais avec lui.",
      proactif: "Il te prépare un brief de semaine chaque lundi : priorités classées, relances en retard, actions urgentes dans l'ordre. Il surveille tes engagements pris en conversation et te rappelle avant qu'il soit trop tard. Quand une deadline approche, tu reçois une alerte. \"Laisse-moi te préparer ça. Ce soir ou demain matin ?\"",
    },
    {
      id: "roland", genre: "m", name: "Roland", role: "Finance & marges", plan: "Manager", status: "verrouillé", accent: "charbon", icon: "coins", photo: "/uploads/agents/roland.jpg",
      desc: "Tu vends à perte ou pas ? Il te dit la vérité en 5 minutes.",
      bio: "Grand-Bassam. Fils d'un pêcheur et d'une commerçante de pagnes — il a appris à calculer les marges avant même de connaître le mot. Master finance à Bordeaux, 6 ans en France, puis retour. \"À Bordeaux j'expliquais des chiffres à des gens qui avaient de l'argent. Ici j'explique des chiffres à des gens qui ont des idées. C'est beaucoup plus intéressant.\" Il ne fait pas de comptabilité — il fait de la clarté.",
      proactif: "Il fait ton point financier mensuel : CA, marges, ratio par produit ou service. Il t'alerte dès que tes marges descendent sous ton seuil de rentabilité, avant que ce soit un problème. Donne-lui 3 chiffres, il te sort une projection en 2 minutes. \"Une marge trop faible, c'est un filet avec des trous. Tu attrapes mais tu gardes rien.\"",
    },
    {
      id: "kofi", genre: "m", name: "Kofi", role: "Storytelling & Campagnes", plan: "Manager", status: "verrouillé", accent: "info", icon: "trend", photo: "/uploads/agents/kofi.jpg",
      desc: "Il transforme ton activité en histoire qui vend. Posts, séquences, campagnes — il scénarise tout.",
      bio: "Adjamé. Son grand-père était griot. Kofi a grandi avec les histoires comme d'autres grandissent avec les mathématiques. Il ne sait pas expliquer un concept sans en faire une histoire. \"Mon grand-père disait : une vérité bien racontée vaut mieux que dix vérités bien prouvées.\" Il ne fait pas des posts. Il construit des récits qui créent de la loyauté.",
      proactif: "Il construit ta campagne complète en 3 phases : film de marque personnelle (script 5 actes), séquence de posts espacés dans le temps, broadcasts WhatsApp prêts à envoyer. Chaque message est ancré dans ton histoire réelle. Il te donne aussi ta signature narrative — le récit que les gens retiennent après t'avoir lu une seule fois.",
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

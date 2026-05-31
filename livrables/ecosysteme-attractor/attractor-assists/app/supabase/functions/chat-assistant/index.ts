import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── System prompts par agent ──────────────────────────────────────────────

const KNOWLEDGE_BASE = `
## BASE DE CONNAISSANCE ATTRACTOR

**Diagnostic universel :** Si un business ne vend pas assez → 2 causes : manque de visibilité auprès de la cible prête à payer, OU absence d'offre irrésistible.

**Framework PPSD :**
- Problèmes : ce que vit le client (pas superficiellement)
- Peurs : ce qui pourrait lui arriver de pire s'il ne résout pas son problème
- Souhaits : ce qu'il désire obtenir
- Désirs : ce qu'il veut ressentir
→ Où trouver la cible ? Quels endroits fréquente-t-elle ? Sur quels sujets réagit-elle ?

**Argumentaires :**
- AIDA : Attention → Intérêt → Désir → Action
- PASA : Problème → Agitation → Souhait → Action
- PAASA : Problème → Aggravation → Agitation → Souhait → Action

**Offre irrésistible :** Produit principal (fonctionnel) + Bonus (valeur perçue) + Limiteur (urgence). Jamais vendre le produit — vendre le résultat. Modèle : "J'aide [cible] à [résultat] en évitant [douleur]."

**Les 3 niveaux de marque :**
1. Réassurance transactionnelle (besoin urgent, rapport qualité-prix)
2. Attente identitaire (le client s'identifie à la marque)
3. Attente sociétale (valeurs, engagement, idéal commun)

**Passer de commerçant à bâtisseur :** Manuel de Procédures, systèmes, délégation. Le business doit tourner sans toi. Les 3 fuites à corriger : temps / argent / attention.

**Facebook (Lyle Soboro) :** 70% profil / 30% page. Posts texte long avec accroche choc. Vidéo native (pas YouTube). Facebook Live = meilleur engagement. Publier aux heures d'affluence : 7h–9h, 11h–13h, 16h–18h, après 21h.

**Les 3 couloirs :**
- Organisation : tout dans la tête, pas de système → Manuel de Procédures + challenge 7 jours
- Visibilité : bonne offre, mauvaise cible ou mauvais message → PPSD + AIDA
- Ventes : message OK mais offre pas irrésistible → offre principale + bonus + urgence

**Agenda/Organisation :** Pour les questions d'agenda, de planning, de todo → orienter vers Serge (Chief of Staff) qui gère ça. Le bras droit peut noter et transmettre mais Serge est le spécialiste.
`;

const COACH_SYSTEM = `Tu es le bras droit personnel de l'utilisateur — son assistant IA qui le décharge mentalement au quotidien.

## QUI TU ES
Tu t'appelles comme l'utilisateur t'a prénommé (son nom d'assistant). Tu n'es pas un coach générique. Tu connais son contexte, son activité, ses objectifs. Tu travailles pour lui, pas pour lui apprendre des concepts.

## TON RÔLE
Décharger mentalement l'utilisateur. Il te parle de tout ce qui touche son business et sa vie d'entrepreneur. Tu ne refuses jamais d'aider. Si une question touche le domaine d'un spécialiste de l'équipe (agenda → Serge, contenu → Miriam, prospection → Awa, finances → Roland), tu l'aides quand même et tu mentionnes qui peut aller plus loin.

## TON COMPORTEMENT — RÈGLE ABSOLUE
- **Maximum 3 phrases par réponse.** Pas plus. Jamais.
- Si tu produis quelque chose (post, message, offre) : le texte prêt à copier, puis UNE question courte.
- Tutoiement. Phrases courtes. Pas de listes à puces sauf si demandé.
- Tu poses UNE question pour avancer. Pas deux.
- Tu produis, tu n'enseignes pas. Pas de cours, pas de théorie non demandée.
- Tu ancres dans la réalité CI : prénoms ivoiriens, Wave, WhatsApp Business, Abidjan.

${KNOWLEDGE_BASE}`;

const AWA_SYSTEM = `Tu t'appelles Awa. Tu es la spécialiste Prospection & Vente de l'équipe Attractor Assists.

Tu produis : messages de prospection WhatsApp, scripts d'approche client, relances froides et chaudes, propositions commerciales courtes, argumentaires de vente AIDA et PASA.

Tu connais la vente terrain en CI : tu sais que le premier contact doit être humain, pas commercial. Tu sais que la relance doit être courte et sans pression. Tu sais que WhatsApp est le CRM de l'entrepreneur africain.

Style : tutoiement, direct, chaleureux. Prénoms ivoiriens dans les exemples. Textes prêts à copier-coller.

Quand tu produis : donne le texte final, pas des conseils sur comment l'écrire.`;

const MIRIAM_SYSTEM = `Tu t'appelles Miriam. Tu es la spécialiste Présence Digitale de l'équipe Attractor Assists — tu gères à la fois la création de contenu ET l'animation de communauté.

Tu produis : posts Facebook/Instagram, scripts vidéo 60s, légendes, messages de broadcast WhatsApp, calendriers éditoriaux, réponses aux commentaires.

Tu connais la règle 80/20 : 80% de contenu qui donne de la valeur, 20% qui vend.
Tu sais que Facebook Live convertit mieux que tout autre format en CI.
Tu sais que le bouche-à-oreille WhatsApp (gbairè positif) est le canal numéro 1.

Style : tutoiement, ancré CI, prénoms ivoiriens dans les exemples, phrases courtes. Textes prêts à copier.`;

const SERGE_SYSTEM = `Tu t'appelles Serge. Tu es le spécialiste Organisation & Agenda de l'équipe Attractor Assists.

Tu aides à : organiser la semaine, prioriser les actions, planifier les rendez-vous, suivre les relances, trier les échanges clients, construire des plans d'action.

Tu produis : briefs de semaine, listes de priorités, plans d'action, récaps d'échanges, rappels de relances.

Tu connais le principe des 3 fuites (temps / argent / attention). Quand l'utilisateur te parle d'une tâche ou d'un RDV, tu proposes de l'intégrer dans une organisation concrète.

Style : précis, direct, sans bavardage. Tu poses une question si le contexte manque, puis tu produis.`;

const ROLAND_SYSTEM = `Tu t'appelles Roland. Tu es le spécialiste Finance & Marges de l'équipe Attractor Assists.

Tu aides à : vérifier si un prix est rentable, calculer les marges, projeter le chiffre d'affaires mensuel, comprendre les charges, préparer les RDV avec un comptable.

IMPORTANT : Tu n'es pas expert-comptable. Pour les décisions fiscales critiques (déclarations, impôts), tu orientes vers un professionnel.

Style : clair, direct. Tu simplifies les chiffres sans les déformer. Tu montres les calculs étape par étape.`;

const PASSIVE_SUFFIX = `

IMPORTANT — MODE PASSIF :
Tu peux répondre à toutes les questions générales dans ton domaine.
Quand la demande touche quelque chose de très spécifique qui nécessite l'accès complet au profil de l'utilisateur pour un résultat vraiment personnalisé : réponds partiellement puis ajoute "Pour aller jusqu'au bout avec ton activité spécifique, c'est dans le plan [PLAN_NAME]."
Ne refuse pas. Commence toujours par apporter de la valeur.`;

const SYSTEMS: Record<string, string> = {
  coach:  COACH_SYSTEM,
  awa:    AWA_SYSTEM,
  miriam: MIRIAM_SYSTEM + PASSIVE_SUFFIX.replace("[PLAN_NAME]", "Manager"),
  serge:  SERGE_SYSTEM  + PASSIVE_SUFFIX.replace("[PLAN_NAME]", "Manager"),
  roland: ROLAND_SYSTEM + PASSIVE_SUFFIX.replace("[PLAN_NAME]", "Manager"),
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const {
      messages,
      assistant_id = "coach",
      profile = {},
      ppsd = {},
      memoire_cache = "",
    } = await req.json();

    const systemBase = SYSTEMS[assistant_id] ?? SYSTEMS.coach;

    // Contexte profil
    const contextBlock = profile.activite
      ? `\n\nCONTEXTE UTILISATEUR :\nPrénom : ${profile.prenom || "l'entrepreneur"}\nNom assistant : ${profile.nom_assistant || "Attractor"}\nActivité : ${profile.activite}\nCanal principal : ${profile.canal_principal || "non précisé"}`
      : `\n\nPrénom : ${profile.prenom || "l'entrepreneur"}\nNom assistant : ${profile.nom_assistant || "Attractor"}`;

    // Mémoire courte — injecte les échanges résumés des sessions précédentes
    const memoireBlock = memoire_cache
      ? `\n\nCE QU'ON A DÉJÀ FAIT ENSEMBLE :\n${memoire_cache}`
      : "";

    const system = systemBase + contextBlock + memoireBlock;

    const formattedMessages = (messages as Array<{ from: string; text: string }>).map((m) => ({
      role: m.from === "me" ? "user" : "assistant",
      content: m.text,
    }));

    const model = "claude-haiku-4-5-20251001";
    const max_tokens = assistant_id === "coach" ? 350 : 500;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens, system, messages: formattedMessages }),
    });

    const data = await response.json();
    const reply = data?.content?.[0]?.text?.trim() ?? "Je reviens vers toi dans un instant.";

    // Mémoire courte — générer un résumé toutes les 5 réponses du bot
    let nouveau_resume: string | null = null;
    const botCount = formattedMessages.filter(m => m.role === "assistant").length;
    if (botCount > 0 && botCount % 5 === 0) {
      const derniersMsgs = formattedMessages.slice(-8)
        .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${(m.content as string).substring(0, 120)}`)
        .join("\n");
      const resumeRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model, max_tokens: 120,
          system: "Résume en 2 phrases ce que cet entrepreneur a fait/demandé. Commence par 'Nous avons'. Sois concis.",
          messages: [{ role: "user", content: derniersMsgs }],
        }),
      });
      const resumeData = await resumeRes.json();
      nouveau_resume = resumeData?.content?.[0]?.text?.trim() ?? null;
    }

    return new Response(JSON.stringify({ reply, nouveau_resume }), {
      headers: { "Content-Type": "application/json", ...CORS },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  }
});

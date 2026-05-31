import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tu es Mac Arthur Kouassi, fondateur de Mr Attractor — expert en développement de marques et business coaching pour les entrepreneurs ivoiriens et de la diaspora.

Tu génères une séquence d'activation personnalisée pour un nouvel utilisateur de l'app Attractor Assists.

Ton style : direct, chaleureux, tutoiement, français ivoirien. Jamais générique. Chaque phrase parle à SA situation spécifique.

Réponds UNIQUEMENT en JSON valide. Aucun texte avant ou après. Aucun markdown.`;

const buildPrompt = (data: Record<string, string>) => {
  const { prenom, ouverture, activite, cible, probleme, souhait, canal, profil } = data;

  const isOrganisation = profil === "salarie" || profil === "mix" ||
    (ouverture && (ouverture.toLowerCase().includes("organis") ||
      ouverture.toLowerCase().includes("procédure") ||
      ouverture.toLowerCase().includes("gérer")));

  const couloir = isOrganisation ? "organisation" : "ventes";

  return `PROFIL :
Prénom : ${prenom || "l'entrepreneur"}
Profil : ${profil || "entrepreneur"}
Activité : ${activite || "non précisé"}
Cible : ${cible || "non précisé"}
Douleur principale : ${probleme || "non précisé"}
Souhait : ${souhait || "non précisé"}
Canal principal : ${canal || "Facebook"}
Ce qu'il veut que son bras droit fasse : ${ouverture || "m'aider à avancer"}

COULOIR détecté : ${couloir}

Génère ce JSON exact :
{
  "couloir": "${couloir}",
  "mirroring": "Reformulation de l'ouverture en 2-3 phrases. Commence par 'Tu m'as dit que tu voulais...' Identifie le besoin implicite en 1 phrase. Ton chaleureux, direct, ancré dans SA réalité.",
  "research_steps": [
    "Étape 1 courte (8-10 mots max) visible pendant la recherche — ex: Analyse du secteur [activite]...",
    "Étape 2 courte — ex: Comportement d'achat : [cible]...",
    "Étape 3 courte — ex: Canaux actifs : [canal]..."
  ],
  "insight": "${couloir === "organisation"
    ? "2 paragraphes sur la surcharge mentale et les 3 fuites (temps, argent, attention) visibles dans son activité. Concret, basé sur ses données. Pas de conseil — un miroir précis de sa situation."
    : "2 paragraphes sur le comportement d'achat de SA cible spécifique + 1 comportement précis sur SON canal. Données comportementales réelles, pas de statistiques génériques."
  }",
  "victoire_label": "${couloir === "organisation"
    ? "Phrase courte qui invite à lister ses 5 tâches les plus lourdes mentalement"
    : "Phrase courte qui invite à partager son lien de présence en ligne (page, site, Instagram)"
  }",
  "victoire_placeholder": "${couloir === "organisation"
    ? "Ex : gérer les commandes WhatsApp, faire les devis, relancer les clients..."
    : "Ex : facebook.com/tonbusiness, instagram.com/..., tonsite.com"
  }"
}`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const body = await req.json();

    const userPrompt = buildPrompt(body);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    const data = await response.json();
    const raw = data?.content?.[0]?.text?.trim() ?? "{}";

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        couloir: "ventes",
        mirroring: `Tu m'as dit que tu voulais ${body.ouverture || "avancer dans ton business"}. Ce que j'entends derrière ça, c'est que tu as besoin d'un système qui travaille pour toi. On commence.`,
        research_steps: ["Analyse du secteur en cours...", "Comportement de ta cible...", "Canaux les plus actifs..."],
        insight: "Je vois une activité qui a du potentiel mais qui manque de visibilité auprès de la bonne cible. On va corriger ça.",
        victoire_label: "Donne-moi un lien — ta page, ton site, ou ton Instagram.",
        victoire_placeholder: "facebook.com/tonbusiness, instagram.com/...",
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json", ...CORS },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  }
});

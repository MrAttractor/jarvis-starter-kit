import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tu es le bras droit IA de Mac Arthur Kouassi (Mr Attractor).
Tu lis les réponses d'un entrepreneur à 5 questions d'onboarding et tu produis deux choses uniquement :

1. couloir : "organisation" si l'utilisateur a besoin de structure, système, clarté mentale, délégation, procédures. "ventes" s'il cherche des clients, de la visibilité, des revenus.

2. mirroring : 2-3 phrases qui reformulent exactement ce que l'utilisateur a dit avec ses propres mots. Tu parles de SA situation concrète, pas de business en général. Tu ne fais pas de conseil. Tu ne fais pas d'analyse. Tu es un miroir, pas un expert qui évalue.

Règles absolues :
- Commence par "Tu m'as dit que..."
- Utilise ses mots exacts, pas des synonymes génériques
- Ne dis jamais "visibilité", "potentiel", "cible" si l'utilisateur n'a pas utilisé ces mots
- Si l'utilisateur a écrit du texte sans sens, dis "Je n'ai pas bien compris ce que tu voulais dire. Dis-moi en une phrase ce que tu aimerais que je fasse pour toi."

Réponds UNIQUEMENT en JSON valide, rien d'autre : {"couloir": "...", "mirroring": "..."}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const body = await req.json();
    const { prenom, ouverture, activite, attente, epuisement, vision, ville_canal } = body;

    const userPrompt = `Prénom : ${prenom || "l'entrepreneur"}

Ce qu'il veut que son bras droit fasse (ouverture) :
"${ouverture || "non répondu"}"

Sa journée type :
"${activite || "non répondu"}"

Ce qu'il attend en ce moment :
"${attente || "non répondu"}"

Ce qui l'épuise le plus :
"${epuisement || "non répondu"}"

Sa vision dans 6 mois :
"${vision || "non répondu"}"

Sa ville et comment il trouve ses clients :
"${ville_canal || "non répondu"}"

Produis le JSON.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    const data = await response.json();
    const raw = data?.content?.[0]?.text?.trim() ?? "{}";

    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        couloir: "ventes",
        mirroring: `Tu m'as dit que tu voulais "${ouverture}". On commence par ça.`,
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

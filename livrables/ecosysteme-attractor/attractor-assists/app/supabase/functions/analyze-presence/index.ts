import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractText(html: string): string {
  // Extraire title et meta description
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "";
  const desc = html.match(/name="description"\s+content="([^"]+)"/i)?.[1] ??
    html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1] ?? "";
  const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/i)?.[1] ?? "";
  const ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1] ?? "";

  // Extraire le texte visible (basique — supprime les tags HTML)
  const noScript = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  const noStyle = noScript.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  const noTags = noStyle.replace(/<[^>]+>/g, " ");
  const cleaned = noTags.replace(/\s+/g, " ").trim().slice(0, 2000);

  return `TITLE: ${title || ogTitle}
DESC: ${desc || ogDesc}
CONTENU: ${cleaned}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { url, activite, cible, profil_type } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: "URL manquante" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    // Fetch de la page
    let pageContent = "";
    try {
      const pageRes = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; AttractorBot/1.0)" },
        signal: AbortSignal.timeout(6000),
      });
      const html = await pageRes.text();
      pageContent = extractText(html);
    } catch {
      pageContent = "Impossible de lire la page (accès restreint ou lien invalide).";
    }

    const systemPrompt = `Tu es Mac Arthur Kouassi, expert en branding et marketing digital pour entrepreneurs ivoiriens.

Tu analyses la présence en ligne d'un entrepreneur et tu lui donnes un retour direct, précis, ancré dans sa réalité.

Style : tutoiement, direct, chaleureux. Pas de jargon marketing. Pas de liste à puces — paragraphes courts.

Réponds UNIQUEMENT en JSON valide.`;

    const angle = profil_type === "organisation"
      ? "Analyse la régularité et la cohérence de la présence. Un manque de régularité révèle un manque de système. Dis-le clairement."
      : "Analyse si la promesse de valeur est visible, si la cible est claire, si on comprend pourquoi choisir cette personne plutôt qu'une autre.";

    const userPrompt = `ENTREPRENEUR :
Activité : ${activite || "non précisé"}
Cible : ${cible || "non précisé"}
Profil : ${profil_type || "ventes"}

CONTENU DE SA PAGE :
${pageContent}

ANGLE D'ANALYSE : ${angle}

Génère ce JSON :
{
  "strengths": "1-2 phrases sur ce qui fonctionne déjà (ou ce qui manque si rien ne fonctionne). Spécifique, pas générique.",
  "gap": "1-2 phrases sur le problème principal visible. Direct, sans ménager. Ancré dans les données de sa page.",
  "positioning": "1 phrase sur comment il est perçu VS comment sa cible cherche. L'écart entre les deux.",
  "next": "1 action concrète et immédiate à faire cette semaine pour corriger le gap."
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system: systemPrompt,
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
        strengths: "J'ai regardé ta page.",
        gap: "Je vois quelques points à corriger pour mieux toucher ta cible.",
        positioning: "La différence entre ce que tu montres et ce que ta cible cherche.",
        next: "Commence par clarifier ta promesse principale en une seule phrase.",
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

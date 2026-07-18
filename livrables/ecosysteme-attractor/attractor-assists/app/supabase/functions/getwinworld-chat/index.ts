import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY      = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT_BASE = `Tu es le conseiller virtuel de GetWinWorld, l'atelier de style et de concierge privé de Charles — un dénicheur de bonnes affaires qui sélectionne des chaussures et costumes de maisons italiennes pour ses clients exigeants.

Positionnement :
- Charles travaille en 0 stock : chaque pièce est commandée sur demande auprès de ses maisons partenaires italiennes.
- Délai de livraison habituel : 5 à 8 jours pour les chaussures, 7 à 12 jours pour les costumes.
- Charles est le seul à valider la disponibilité finale et à finaliser chaque commande.

Ton rôle :
1. Accueillir avec un ton raffiné, direct, sans superlatifs creux.
2. Qualifier le besoin en 1 à 2 questions maximum : occasion, style recherché, budget si pertinent, taille/pointure.
3. Présenter 1 à 3 pièces précises, tirées UNIQUEMENT du catalogue fourni ci-dessous. Ne jamais inventer un produit, un prix ou une maison absente du catalogue.
4. Toujours orienter vers WhatsApp avec Charles pour finaliser la commande.
5. Si la pièce demandée n'est pas dans le catalogue, le dire honnêtement et proposer une alternative proche, ou inviter à contacter Charles qui peut sourcer une pièce spécifique.
6. Ne jamais promettre un délai, un stock ou un prix qui ne figure pas explicitement dans le catalogue fourni.

Style : phrases courtes, vocabulaire élégant et précis. Jamais de formules génériques ("N'hésitez pas à...", "Je suis ravi de..."). Aucun emoji. Vouvoiement systématique.`;

// Le visiteur choisit sa langue sur le site (FR/EN). On force la langue de réponse
// pour rester cohérent avec le bouton choisi. Le catalogue est stocké en français :
// l'assistant traduit les descriptions à la volée quand il répond en anglais, mais
// ne modifie jamais les noms de maisons ni les prix.
function langInstruction(lang: string): string {
  if (lang === "en") {
    return `\n\nLANGUAGE: Reply ONLY in English, regardless of the language of the catalogue below. Keep house names and prices exactly as written; translate product descriptions into natural English. Same refined, concise tone. No emoji. Use a polite, professional register.`;
  }
  return `\n\nLANGUE : Réponds UNIQUEMENT en français.`;
}

const FALLBACK = {
  fr: "Je reviens vers vous dans un instant.",
  en: "I'll get back to you in a moment.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { messages, lang } = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Articles retirés après 24h en ligne : l'assistant ne propose que les pièces
    // mises en ligne il y a moins de 24h (cohérent avec la vitrine publique).
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    let catalogueBlock = "";
    try {
      const { data: produits } = await supabase
        .from("gw_produits")
        .select("nom, prix, categorie, maison, note_delai, description")
        .eq("est_actif", true)
        .gte("created_at", since)
        .order("categorie");

      if (produits && produits.length > 0) {
        const lines = produits.map((p: any) =>
          `- ${p.nom} (${p.categorie}${p.maison ? `, ${p.maison}` : ""}) : ${p.prix} — ${p.note_delai}`
        ).join("\n");
        catalogueBlock = `\n\nCATALOGUE ACTUEL :\n${lines}`;
      }
    } catch { /* non-bloquant */ }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: SYSTEM_PROMPT_BASE + catalogueBlock + langInstruction(lang),
        messages,
      }),
    });

    const data = await res.json();
    const reply = data?.content?.[0]?.text?.trim()
      ?? FALLBACK[lang === "en" ? "en" : "fr"];

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json", ...CORS },
    });
  } catch {
    return new Response(JSON.stringify({ reply: FALLBACK.fr }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  }
});

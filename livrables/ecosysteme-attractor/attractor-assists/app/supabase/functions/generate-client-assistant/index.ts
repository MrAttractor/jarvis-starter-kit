// ============================================================
// generate-client-assistant — Génère le system_prompt personnalisé
// de l'assistant CLIENT d'un entrepreneur (à partir de son anamnèse)
// + un slug public unique, et les écrit dans profiles.
// ============================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? Deno.env.get("CLAUDE_KEY") ?? "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY       = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GENERATION_PROMPT = `Tu es un générateur de prompts système pour Attractor Assists.

Ta mission : écrire le PROMPT SYSTÈME complet d'un assistant IA qui va répondre, en direct et sans supervision, aux CLIENTS d'un entrepreneur — pas à l'entrepreneur lui-même. C'est la duplication numérique de son activité, pas un chatbot générique.

RÈGLES ABSOLUES POUR LE PROMPT QUE TU ÉCRIS :
- L'assistant se présente comme l'assistant DE l'activité (ex : "Je suis l'assistant de [activité/prénom]"), jamais comme une IA générique
- Il connaît par cœur et utilise activement : ce que vend l'entrepreneur, ses clients types, sa FAQ, sa gestion de stock, ses modes de paiement, sa livraison
- Il prend en charge les clients 24h/24 : répond aux questions produits, prend les commandes, rassure sur les réclamations simples
- Il demande tôt et naturellement le prénom et le contact WhatsApp du client, pour permettre le suivi par l'entrepreneur
- Si une question dépasse ce qu'il sait (négociation hors barème, réclamation grave, urgence) → il note la demande et dit que l'entrepreneur revient vers le client rapidement (sous 24h)
- Ton chaleureux, phrases courtes, jamais robotique ; ancré dans la réalité de la zone (FCFA/Wave/WhatsApp si CI, euros/Stripe si Europe)
- Tutoiement par défaut sauf si l'activité appelle clairement le vouvoiement (ex : services premium, B2B)

FORMAT DE RÉPONSE : uniquement le texte du prompt système final, sans backtick ni commentaire autour — prêt à être injecté tel quel dans un autre modèle.`;

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { user_id } = await req.json();
    if (!user_id) return json({ error: "user_id requis" }, 400);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const [{ data: profile, error: pErr }, { data: anamnese }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user_id).single(),
      supabase.from("business_anamnese").select("*").eq("user_id", user_id).maybeSingle(),
    ]);
    if (pErr || !profile) return json({ error: "Profil introuvable" }, 404);

    const activite = profile.activite || "son activité";
    const brief = [
      `Prénom de l'entrepreneur : ${profile.prenom || "lui"}`,
      `Nom donné à son assistant : ${profile.nom_assistant || "Assistant"}`,
      `Activité : ${activite}`,
      profile.zone ? `Zone géographique : ${profile.zone}` : null,
      anamnese?.ce_quil_vend   ? `Ce qu'il vend précisément : ${anamnese.ce_quil_vend}` : null,
      anamnese?.clients        ? `Ses clients (qui ils sont, comment ils achètent) : ${anamnese.clients}` : null,
      anamnese?.faq            ? `Questions fréquentes et réponses : ${JSON.stringify(anamnese.faq)}` : null,
      anamnese?.stock          ? `Gestion du stock : ${anamnese.stock}` : null,
      anamnese?.paiement       ? `Modes de paiement acceptés : ${anamnese.paiement}` : null,
      anamnese?.livraison      ? `Livraison : ${anamnese.livraison}` : null,
      anamnese?.ce_qui_fatigue ? `Ce qu'il veut déléguer / ce qui le fatigue : ${anamnese.ce_qui_fatigue}` : null,
      ``,
      `Écris le prompt système complet de l'assistant client de ${profile.prenom || "cet entrepreneur"}, prêt à être utilisé tel quel.`,
    ].filter(Boolean).join("\n");

    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        system: GENERATION_PROMPT,
        messages: [{ role: "user", content: brief }],
      }),
    });

    if (!apiRes.ok) {
      const errBody = await apiRes.text();
      console.error("Anthropic API error:", apiRes.status, errBody);
      return json({ error: `Anthropic API error ${apiRes.status}`, detail: errBody.slice(0, 300) }, 502);
    }

    const apiData = await apiRes.json();
    const systemPrompt = (apiData?.content ?? [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")
      .trim();

    if (!systemPrompt) return json({ error: "Prompt vide généré par Claude" }, 502);

    // Slug stable une fois généré ; sinon prenom-activite-xxxx avec retry anti-collision
    let slug = profile.public_slug as string | null;
    if (!slug) {
      const base = slugify(`${profile.prenom || "assistant"}-${activite}`).slice(0, 40) || "assistant";
      for (let i = 0; i < 5; i++) {
        const candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
        const { data: exists } = await supabase.from("profiles").select("id").eq("public_slug", candidate).maybeSingle();
        if (!exists) { slug = candidate; break; }
      }
      if (!slug) return json({ error: "Impossible de générer un lien unique, réessaie" }, 500);
    }

    const { error: saveErr } = await supabase
      .from("profiles")
      .update({
        public_slug: slug,
        client_assistant_prompt: systemPrompt,
        client_assistant_ready: true,
      })
      .eq("id", user_id);
    if (saveErr) return json({ error: saveErr.message }, 500);

    await supabase.from("journal_agent").insert({
      agent_id: "carelle",
      type: "assistant_client_genere",
      titre: `Assistant client généré — ${profile.prenom || user_id}`,
      details: { user_id, slug },
    }).catch(() => {});

    return json({ slug, url: `https://assists.agenceattractor.com/?c=${slug}` });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "content-type": "application/json" },
  });
}

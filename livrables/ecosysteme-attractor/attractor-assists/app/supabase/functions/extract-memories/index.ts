import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY      = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `Tu extrais les faits importants d'une conversation entre un entrepreneur et son assistant IA.

Produis un tableau JSON de mémoires. Chaque mémoire a :
- categorie : "projet" | "client" | "decision" | "livrable" | "contexte"
- contenu : 1 phrase factuelle courte, précise, avec les détails concrets (montants, noms, dates)
- importance : 1 (normal) | 2 (important) | 3 (critique)

Règles :
- N'extrait que ce qui est concret et réutilisable dans une prochaine session
- Ignore les échanges de politesse, les questions générales
- Garde les montants, noms de clients, décisions prises, projets mentionnés
- Maximum 10 mémoires par extraction
- Si rien d'important : retourne []

Réponds UNIQUEMENT avec le JSON valide. Aucun texte avant ou après.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { user_id, messages } = await req.json();
    if (!user_id || !messages?.length) {
      return new Response(JSON.stringify({ ok: true, extracted: 0 }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Le user_id du body ne prouve rien : cette fonction écrit avec la clé de
    // service, donc sans ce contrôle n'importe qui pouvait injecter des souvenirs
    // dans la mémoire du coach d'un autre entrepreneur. Même contrôle que
    // chat-assistant.
    const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const { data: { user: jwtUser }, error: jwtError } = await supabase.auth.getUser(token);
    if (jwtError || !jwtUser || jwtUser.id !== user_id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Formater la conversation pour Claude
    const conv = messages
      .map((m: { role: string; content: string }) => `${m.role === "user" ? "Utilisateur" : "Assistant"}: ${m.content}`)
      .join("\n");

    // Extraire les mémoires avec Claude Haiku
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        system: SYSTEM,
        messages: [{ role: "user", content: `Conversation à analyser :\n\n${conv}` }],
      }),
    });

    const aiData = await res.json();
    const raw = aiData?.content?.[0]?.text?.trim() ?? "[]";

    let extracted: Array<{ categorie: string; contenu: string; importance: number }> = [];
    try { extracted = JSON.parse(raw); } catch { extracted = []; }

    if (extracted.length === 0) {
      return new Response(JSON.stringify({ ok: true, extracted: 0 }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // Dédoublonnage : l'extraction repasse sur tout l'historique de la conversation,
    // donc les mêmes faits ressortent à chaque appel. Sans ce filtre, la mémoire se
    // remplit de doublons et finit par chasser les vrais souvenirs (le coach n'en
    // relit que les 20 derniers).
    const { data: existantes } = await supabase
      .from("memories")
      .select("contenu")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(100);

    const norm = (s: string) => (s || "").toLowerCase().trim().replace(/\s+/g, " ");
    const deja = new Set((existantes ?? []).map((m: any) => norm(m.contenu)));

    const rows = extracted
      .filter(m => m.contenu && !deja.has(norm(m.contenu)))
      .map(m => ({
        user_id,
        categorie: m.categorie,
        contenu:   m.contenu,
        importance: m.importance || 1,
      }));

    if (rows.length === 0) {
      return new Response(JSON.stringify({ ok: true, extracted: 0, doublons: extracted.length }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const { error: insErr } = await supabase.from("memories").insert(rows);
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ ok: true, extracted: rows.length }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

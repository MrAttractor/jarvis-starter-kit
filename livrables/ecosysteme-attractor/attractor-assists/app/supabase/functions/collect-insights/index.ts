// ============================================================
// collect-insights — Lit les conversations des dernières 24h,
// extrait les thèmes récurrents, crée une décision pour MIROIR.
// Cron : quotidien à 7h.
// ============================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY       = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const SYSTEM = `Tu es un analyste de comportement utilisateur pour l'app Attractor Assists.
Tu reçois des extraits de conversations entre utilisateurs et les agents IA de l'app.
Ton but : extraire les patterns et besoins récurrents pour améliorer l'app.

FORMAT DE RÉPONSE : JSON strict.
{
  "themes": [
    {
      "theme": "nom court du thème",
      "count": "nb de fois observé (approximatif)",
      "exemple": "extrait représentatif anonymisé",
      "opportunite": "ce qu'on devrait améliorer dans l'app pour répondre à ce besoin"
    }
  ],
  "synthese": "2 phrases sur ce que les utilisateurs veulent vraiment en ce moment",
  "decision_suggere": "Une décision concrète à valider par Mac Arthur pour améliorer l'app"
}`;

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Récupérer les conversations des dernières 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: convs, error } = await supabase
      .from("conversations")
      .select("messages, assistant_id, created_at")
      .gte("created_at", since)
      .limit(100);

    if (error) throw error;
    if (!convs || convs.length === 0) {
      return json({ message: "Aucune conversation récente à analyser." });
    }

    // Extraire un échantillon des messages utilisateurs (anonymisés)
    const echantillon = convs
      .flatMap((c: any) => {
        const msgs = Array.isArray(c.messages) ? c.messages : [];
        return msgs
          .filter((m: any) => m.from === "me")
          .slice(0, 2)
          .map((m: any) => `[${c.assistant_id}] ${String(m.text || "").slice(0, 120)}`);
      })
      .slice(0, 50)
      .join("\n");

    if (!echantillon.trim()) {
      return json({ message: "Pas assez de contenu à analyser." });
    }

    // Appel Claude
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        system: SYSTEM,
        messages: [{ role: "user", content: `${convs.length} conversations analysées :\n\n${echantillon}` }],
      }),
    });

    const apiData = await apiRes.json();
    const raw = (apiData?.content ?? [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      return json({ error: "JSON invalide", raw }, 502);
    }

    // Sauvegarder les insights
    const today = new Date().toISOString().slice(0, 10);
    const { data: insight } = await supabase
      .from("insights_users")
      .insert({
        periode:  today,
        nb_convs: convs.length,
        themes:   parsed.themes,
      })
      .select()
      .single();

    // Créer une décision pour MIROIR si une opportunité est détectée
    if (parsed.decision_suggere) {
      const { data: dec } = await supabase
        .from("decisions")
        .insert({
          sujet:       `[INSIGHT USERS] ${parsed.synthese?.slice(0, 80) ?? "Insight quotidien"}`,
          contexte:    `Observation basée sur ${convs.length} conversations du ${today}.\n${parsed.decision_suggere}\n\nThèmes : ${parsed.themes?.map((t: any) => t.theme).join(", ")}`,
          statut:      "VALIDE",
          source_agent: "collect-insights",
        })
        .select()
        .single();

      // Lier la décision à l'insight
      if (dec && insight) {
        await supabase.from("insights_users").update({ decision_id: dec.id }).eq("id", insight.id);
      }
    }

    // Journaliser
    await supabase.from("journal_agent").insert({
      type:    "insight_collecte",
      agent_id: "miroir",
      titre:   `${convs.length} conversations analysées — ${parsed.themes?.length ?? 0} thèmes détectés`,
      details: { themes: parsed.themes, synthese: parsed.synthese },
    });

    return json({ convs_analysees: convs.length, themes: parsed.themes, synthese: parsed.synthese });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

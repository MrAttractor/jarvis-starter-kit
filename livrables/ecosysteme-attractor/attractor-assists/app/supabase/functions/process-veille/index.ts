// process-veille — lit les tendances RSS du jour, génère une DMV personnalisée par Claude
// pour chaque utilisateur Growth+ actif. Tournée via cron 7h ou en cascade depuis receive-veille.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const CLAUDE_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? Deno.env.get("CLAUDE_KEY") ?? "";

async function callClaude(prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key":           CLAUDE_KEY,
      "anthropic-version":   "2023-06-01",
      "content-type":        "application/json",
    },
    body: JSON.stringify({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages:   [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

Deno.serve(async () => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // Tendances globales du jour (user_id IS NULL = veille commune)
    const { data: tendances } = await supabase
      .from("veille_tendances")
      .select("secteur, titre, resume")
      .is("user_id", null)
      .gte("created_at", `${today}T00:00:00Z`)
      .order("created_at", { ascending: false })
      .limit(15);

    if (!tendances || tendances.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, msg: "Aucune tendance aujourd'hui" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Utilisateurs Growth+ avec onboarding terminé
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, prenom, activite, plan_code, zone")
      .in("plan_code", ["growth", "growth_eu", "team", "team_eu"])
      .eq("onboarding_done", true);

    let processed = 0;

    for (const p of profiles ?? []) {
      // Ne pas regénérer si une DMV existe déjà pour aujourd'hui
      const { data: existing } = await supabase
        .from("dmv_queue")
        .select("id")
        .eq("user_id", p.id)
        .eq("jour", today)
        .maybeSingle();

      if (existing) continue;

      // Prépare le contexte
      const secteurLabel = p.activite || "commerce";
      const zone         = p.zone === "eu" ? "diaspora africaine en France" : "Côte d'Ivoire";
      const tendancesText = tendances
        .slice(0, 6)
        .map((t) => `- ${t.titre}${t.resume ? " : " + t.resume.slice(0, 100) : ""}`)
        .join("\n");

      const prompt = `Tu es le bras droit IA d'un entrepreneur. Il s'appelle ${p.prenom || "Entrepreneur"}, il fait : ${secteurLabel}, sa zone : ${zone}.

Tendances du jour dans son secteur et aux alentours :
${tendancesText}

Génère une DMV (Démonstration de Valeur) proactive. Réponds UNIQUEMENT avec du JSON valide, sans bloc markdown, sans commentaires :
{
  "insight": "1 phrase courte : ce que les clients cherchent ce matin, ancré dans ses tendances",
  "message_wa": "Message WhatsApp prêt à envoyer à un prospect (2-3 lignes max, tutoiement, ton chaleureux CI, prénom fictif ivoirien dans l'exemple)",
  "contenu": "Idée de post Instagram OU statut WhatsApp rédigé (4 lignes max, texte complet, pas de placeholder)",
  "question": "1 question courte et directe à poser à ses clients aujourd'hui pour déclencher un achat"
}`;

      const raw   = await callClaude(prompt);
      let dmv: Record<string, string> = {};

      try {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) dmv = JSON.parse(match[0]);
      } catch { continue; }

      if (!dmv.insight) continue;

      await supabase.from("dmv_queue").upsert(
        {
          user_id:    p.id,
          jour:       today,
          insight:    dmv.insight,
          message_wa: dmv.message_wa ?? null,
          contenu:    dmv.contenu    ?? null,
          question:   dmv.question   ?? null,
          secteur:    secteurLabel,
          delivered:  false,
        },
        { onConflict: "user_id,jour" }
      );

      processed++;
    }

    return new Response(
      JSON.stringify({ ok: true, processed }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

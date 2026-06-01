// notify-update — Edge Function déclenchée par webhook Netlify après chaque déploiement réussi.
// Transforme le commit message en notification user-friendly via Claude (Haiku).
// Header attendu : x-webhook-secret: [WEBHOOK_SECRET depuis Supabase env]
// Payload Netlify : { title: "commit message", branch: "master", ... }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.24.0";
import { PENSEES } from "../_shared/pensees.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  // Vérification du secret webhook
  const secret = Deno.env.get("WEBHOOK_SECRET") || "";
  const provided = req.headers.get("x-webhook-secret") || "";
  if (secret && provided !== secret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    let titre = "Ton app s'améliore";
    let corps = "Une mise à jour vient d'être déployée. Explore les nouveautés.";

    // Parser le body Netlify ou un appel manuel
    let rawCommit = "";
    if (req.method === "POST") {
      try {
        const body = await req.json();
        // Appel manuel avec titre/corps déjà rédigés
        if (body.titre) {
          titre = body.titre;
          corps = body.corps || corps;
          rawCommit = "";
        } else {
          // Webhook Netlify : le champ "title" contient le commit message
          rawCommit = body.title || body.commit_message || "";
        }
      } catch { /* body vide */ }
    }

    // Générer un message friendly depuis le commit message via Claude Haiku
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (rawCommit && apiKey) {
      try {
        const anthropic = new Anthropic({ apiKey });
        const msg = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 120,
          messages: [
            {
              role: "user",
              content: `Tu es le bras droit d'un entrepreneur ivoirien. Transforme ce commit technique en notification mobile courte (tutoiement, chaleureux, axé bénéfice utilisateur).

Commit : "${rawCommit}"

Réponds UNIQUEMENT avec ce JSON (pas de markdown) :
{"titre":"max 5 mots percutants","corps":"1-2 phrases max, bénéfice concret pour l'utilisateur"}`,
            },
          ],
        });

        const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
        const match = text.match(/\{[\s\S]*?\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (parsed.titre) titre = parsed.titre;
          if (parsed.corps) corps = parsed.corps;
        }
      } catch { /* Claude indisponible → on garde les valeurs par défaut */ }
    }

    // Éviter un doublon le même jour (même type success déjà envoyé)
    const today = new Date().toISOString().slice(0, 10);
    const { count: already } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("type", "success")
      .gte("created_at", `${today}T00:00:00Z`);

    if (already && already > 0) {
      return new Response(
        JSON.stringify({ ok: true, skipped: "already_sent_today" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Récupérer tous les users actifs onboardés
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("onboarding_done", true)
      .eq("statut", "actif");

    if (error) throw error;

    const inserts = (profiles || []).map((p) => ({
      user_id: p.id,
      type: "success",
      titre,
      corps,
    }));

    if (inserts.length > 0) {
      await supabase.from("notifications").insert(inserts);
    }

    return new Response(
      JSON.stringify({ ok: true, notified: inserts.length, titre, corps }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

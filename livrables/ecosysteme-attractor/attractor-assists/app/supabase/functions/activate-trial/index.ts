// activate-trial — Active l'essai gratuit 1 mois Bras Droit pour l'utilisateur connecté
// POST {} — aucun body requis

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Non autorisé" }, 401);

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authErr } = await supabaseUser.auth.getUser();
    if (authErr || !user) return json({ error: "Non autorisé" }, 401);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Vérifier que l'essai n'a pas déjà été activé
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("plan_code, trial_activated_at")
      .eq("id", user.id)
      .single();

    if (profile?.trial_activated_at) {
      return json({ error: "Essai déjà activé" }, 400);
    }
    if (["bras_droit", "growth", "growth_eu", "team", "manager", "personnalise"].includes(profile?.plan_code)) {
      return json({ error: "Tu as déjà un plan payant" }, 400);
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 jours

    // Activer le plan
    await supabaseAdmin
      .from("profiles")
      .update({
        plan_code: "bras_droit",
        trial_activated_at: now.toISOString(),
        trial_expires_at: expiresAt.toISOString(),
      })
      .eq("id", user.id);

    // Notification in-app de bienvenue
    await supabaseAdmin.from("notifications").insert({
      user_id: user.id,
      type: "success",
      titre: "Bras Droit activé — 30 jours offerts !",
      corps: "Toutes les fonctionnalités sont débloquées. Assists illimité, DMV quotidienne, Fidelys… explore tout.",
    });

    return json({ success: true, trial_expires_at: expiresAt.toISOString() });
  } catch (e) {
    console.error(e);
    return json({ error: "Erreur serveur" }, 500);
  }
});

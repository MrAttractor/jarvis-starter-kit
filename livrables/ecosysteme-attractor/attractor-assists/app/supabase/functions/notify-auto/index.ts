// notify-auto — Edge Function appelée par un cron Supabase chaque jour à 8h
// Crée des notifications automatiques selon l'état de chaque utilisateur actif.
// Règles : streak à risque (3j sans connexion), quota presque épuisé (> 80%)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async () => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);

    // Récupérer tous les profils actifs
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, prenom, nom_assistant, plan_code, onboarding_done")
      .eq("statut", "actif")
      .eq("onboarding_done", true);

    if (error) throw error;

    const inserts: object[] = [];

    for (const p of profiles || []) {
      const nomAss = p.nom_assistant || "ton bras droit";
      const prenom = p.prenom || "toi";

      // Vérifier la dernière activité (dernier message envoyé)
      const { data: lastUsage } = await supabase
        .from("usage_daily")
        .select("jour")
        .eq("user_id", p.id)
        .order("jour", { ascending: false })
        .limit(1)
        .maybeSingle();

      const lastDay = lastUsage?.jour || null;

      // Streak à risque : pas de connexion depuis 3 jours
      if (lastDay && lastDay <= threeDaysAgo) {
        // Vérifier qu'on n'a pas déjà envoyé cette notif aujourd'hui
        const { count } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", p.id)
          .eq("type", "alert")
          .gte("created_at", `${today}T00:00:00Z`);

        if (!count) {
          inserts.push({
            user_id: p.id,
            type: "alert",
            titre: `${nomAss} t'attend`,
            corps: `3 jours sans se parler, ${prenom}. Reprends là où tu t'es arrêté — 2 minutes suffisent.`,
          });
        }
      }

      // Quota presque épuisé (> 80% des messages utilisés aujourd'hui)
      const { data: usage } = await supabase
        .from("usage_daily")
        .select("nb_messages")
        .eq("user_id", p.id)
        .eq("jour", today)
        .maybeSingle();

      const baseLimit = p.plan_code === "decouverte" ? 20 : null;
      if (baseLimit && usage?.nb_messages >= Math.floor(baseLimit * 0.8)) {
        const { count } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", p.id)
          .eq("type", "info")
          .gte("created_at", `${today}T00:00:00Z`);

        if (!count) {
          inserts.push({
            user_id: p.id,
            type: "info",
            titre: "Quota presque atteint",
            corps: `Il te reste peu de messages aujourd'hui. Invite un ami pour en gagner 5 de plus, ou passe au plan Bras Droit.`,
          });
        }
      }
    }

    if (inserts.length > 0) {
      await supabase.from("notifications").insert(inserts);
    }

    return new Response(JSON.stringify({ ok: true, created: inserts.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

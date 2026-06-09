// notify-auto — Edge Function cron Supabase, chaque jour à 8h.
// Règles (par priorité) :
// 1. Streak à risque : 3j sans connexion → alerte
// 2. Quota presque épuisé (>80%) → info
// 3. Si aucune mise à jour (type success) envoyée aujourd'hui
//    ET user sans notif ce matin → pensée du jour tirée des écrits Mac Arthur

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PENSEES } from "../_shared/pensees.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async () => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, prenom, nom_assistant, plan_code, onboarding_done")
      .eq("statut", "actif")
      .eq("onboarding_done", true);

    if (error) throw error;

    const inserts: object[] = [];
    const notifiedUserIds = new Set<string>();

    for (const p of profiles || []) {
      const nomAss = p.nom_assistant || "ton bras droit";
      const prenom = p.prenom || "toi";

      // Dernière activité
      const { data: lastUsage } = await supabase
        .from("usage_daily")
        .select("jour")
        .eq("user_id", p.id)
        .order("jour", { ascending: false })
        .limit(1)
        .maybeSingle();

      const lastDay = lastUsage?.jour || null;

      // Streak à risque
      if (lastDay && lastDay <= threeDaysAgo) {
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
          notifiedUserIds.add(p.id);
        }
      }

      // Quota presque épuisé
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
          notifiedUserIds.add(p.id);
        }
      }
    }

    // Pensée du jour : si pas de déploiement aujourd'hui
    const { count: updateToday } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("type", "success")
      .gte("created_at", `${today}T00:00:00Z`);

    if (!updateToday) {
      // Pensée aléatoire unique pour aujourd'hui (même pour tous les users)
      const thought = PENSEES[new Date().getDate() % PENSEES.length];

      for (const p of profiles || []) {
        if (notifiedUserIds.has(p.id)) continue;

        const { count: alreadyThought } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", p.id)
          .eq("type", "agent")
          .gte("created_at", `${today}T00:00:00Z`);

        if (!alreadyThought) {
          inserts.push({
            user_id: p.id,
            type: "agent",
            titre: thought.titre,
            corps: thought.corps,
          });
        }
      }
    }

    // DMV du jour : notif pour les utilisateurs Growth+ qui ont une DMV non livrée
    const today = new Date().toISOString().slice(0, 10);
    const { data: pendingDmvs } = await supabase
      .from("dmv_queue")
      .select("user_id, insight")
      .eq("jour", today)
      .eq("delivered", false);

    for (const dmv of pendingDmvs ?? []) {
      const prof = (profiles ?? []).find((p) => p.id === dmv.user_id);
      if (!prof) continue;
      if (notifiedUserIds.has(dmv.user_id)) continue;
      inserts.push({
        user_id: dmv.user_id,
        type: "agent",
        titre: `Ton action du jour est prête`,
        corps: dmv.insight ?? "Awa a préparé une action personnalisée pour toi ce matin.",
      });
      notifiedUserIds.add(dmv.user_id);
    }

    // Marquer les DMV comme livrées
    if ((pendingDmvs ?? []).length > 0) {
      const ids = (pendingDmvs ?? []).map((d) => d.user_id);
      await supabase
        .from("dmv_queue")
        .update({ delivered: true })
        .in("user_id", ids)
        .eq("jour", today);
    }

    if (inserts.length > 0) {
      await supabase.from("notifications").insert(inserts);
    }

    return new Response(
      JSON.stringify({ ok: true, created: inserts.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

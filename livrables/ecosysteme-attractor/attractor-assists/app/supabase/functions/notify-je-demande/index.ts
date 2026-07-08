const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const result: Record<string, unknown> = {};
  try {
    const { nom, wa, route, poids, articles } = await req.json();

    const routeLabel = route === "ABJ_ORY" ? "Abidjan → Paris" : route === "ORY_ABJ" ? "Paris → Abidjan" : "—";
    const detailLignes = [
      `${nom || "Client"} · ${wa || "—"}`,
      routeLabel,
      poids ? `${poids} kg estimé` : null,
      articles ? `Articles : ${articles}` : null,
    ].filter(Boolean);

    // --- WhatsApp via CallMeBot (si configuré) ---
    const apikey = Deno.env.get("CALLMEBOT_JE_APIKEY");
    const phone = Deno.env.get("CALLMEBOT_JE_PHONE");
    if (apikey && phone) {
      const waText = ["📬 Nouvelle demande J'Envoie Express", ...detailLignes, "", "jenvoiexpress.com/app.html"].join("\n");
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(waText)}&apikey=${encodeURIComponent(apikey)}`;
      const waRes = await fetch(url);
      result.whatsapp = { ok: waRes.ok, body: await waRes.text() };
    } else {
      result.whatsapp = { ok: false, error: "CallMeBot non configuré" };
    }

    // --- Email via Resend ---
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("NOTIFY_JE_EMAIL");
    if (resendKey && notifyEmail) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "J'Envoie Express <noreply@agenceattractor.com>",
          to: [notifyEmail],
          subject: `Nouvelle demande — ${nom || "Client"}`,
          text: [...detailLignes, "", "Voir : https://jenvoiexpress.com/app.html"].join("\n"),
        }),
      });
      result.email = { ok: emailRes.ok, body: await emailRes.text() };
    } else {
      result.email = { ok: false, error: "Email non configuré" };
    }

    return new Response(JSON.stringify({ ok: true, ...result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err), ...result }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

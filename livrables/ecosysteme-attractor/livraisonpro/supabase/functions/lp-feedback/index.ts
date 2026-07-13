// ============================================================
// lp-feedback — capture des avis à chaud du terrain (support commercial).
// POST { role, interet, marque, frein, nom, whatsapp, zone, commercial }
//   → insert dans lp_feedback (service role) + notif email optionnelle.
// Public (no-verify-jwt), CORS géré.
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const b = await req.json();
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const clean = (v: unknown) => (v == null ? null : String(v).slice(0, 800).trim() || null);
    const { error } = await supabase.from("lp_feedback").insert({
      role: clean(b.role), interet: clean(b.interet), marque: clean(b.marque),
      frein: clean(b.frein), nom: clean(b.nom), whatsapp: clean(b.whatsapp),
      zone: clean(b.zone), commercial: clean(b.commercial), source: "pitch-terrain",
    });
    if (error) return json({ ok: false, error: error.message }, 200);

    // Notif email optionnelle (best effort)
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("NOTIFY_DEVIS_EMAIL") || "myattractor1@gmail.com";
    if (resendKey) {
      const html = `<div style="font-family:'Segoe UI',system-ui,sans-serif;color:#1A1714">
        <h2 style="margin:0 0 6px">Avis terrain — Livraison Pro</h2>
        <p style="margin:0 0 4px"><strong>${clean(b.nom) || "Anonyme"}</strong> · ${clean(b.role) || "?"} · intérêt : ${clean(b.interet) || "?"}</p>
        <p style="margin:0 0 4px">Ce qui l'a marqué : ${clean(b.marque) || "—"}</p>
        <p style="margin:0 0 4px">Frein : ${clean(b.frein) || "—"}</p>
        <p style="margin:0 0 4px">WhatsApp : ${clean(b.whatsapp) || "—"} · Zone : ${clean(b.zone) || "—"} · Commercial : ${clean(b.commercial) || "—"}</p>
      </div>`;
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "Livraison Pro <noreply@agenceattractor.com>", to: [notifyEmail], subject: `Avis terrain — ${clean(b.nom) || "?"} (${clean(b.interet) || "?"})`, html }),
      }).catch(() => {});
    }
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 200);
  }
});

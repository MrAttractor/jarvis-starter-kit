// ============================================================
// notify-lead — Alerte email immédiate quand un lead arrive
// dans pilotage_pipeline (site agenceattractor.com, ou toute
// autre source future). Fire-and-forget, jamais bloquant.
// ============================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
// Adresse pro par défaut, surchargeable via le secret NOTIFY_LEAD_EMAIL sans redéployer.
const NOTIFY_TO = Deno.env.get("NOTIFY_LEAD_EMAIL") ?? "hello@agenceattractor.com";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { nom, activite, besoin, zone, contact, source } = await req.json();

    const waNumber = (contact || "").replace(/[\s+\-()]/g, "");
    const waLink = waNumber ? `https://wa.me/${waNumber}` : null;

    const html = `
      <h2 style="color:#F25C05">Nouveau lead — ${nom || "Visiteur"}</h2>
      <table style="border-collapse:collapse">
        <tr><td style="padding:6px 12px 6px 0;color:#666">Activité</td><td style="padding:6px 0"><b>${activite || "—"}</b></td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#666">Besoin</td><td style="padding:6px 0"><b>${besoin || "—"}</b></td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#666">Zone</td><td style="padding:6px 0"><b>${zone || "—"}</b></td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#666">Contact</td><td style="padding:6px 0"><b>${contact || "—"}</b></td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#666">Source</td><td style="padding:6px 0">${source || "—"}</td></tr>
      </table>
      ${waLink ? `<p><a href="${waLink}" style="display:inline-block;margin-top:14px;padding:10px 18px;background:#25D366;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">Répondre sur WhatsApp</a></p>` : ""}
      <p style="color:#999;font-size:12px;margin-top:20px">Voir le dossier complet : demo.agenceattractor.com/pilotage</p>
    `;

    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Pilotage <noreply@agenceattractor.com>",
          to: NOTIFY_TO,
          subject: `Nouveau lead — ${nom || "Visiteur"} (${activite || "activité inconnue"})`,
          html,
        }),
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json", ...CORS },
    });
  } catch (e) {
    // Non-bloquant : une notif ratée ne doit jamais faire échouer la capture du lead
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  }
});

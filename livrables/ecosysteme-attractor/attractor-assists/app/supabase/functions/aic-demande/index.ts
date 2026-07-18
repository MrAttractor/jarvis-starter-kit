// ============================================================
// aic-demande — Agence Innovation Créative (aicreatioon.com)
// Capture les demandes (devis + coaching) du site : insertion en
// base (service role) + notification email immédiate à Emmanuel.
// Fire-and-forget côté client, mais l'insertion garantit qu'aucune
// demande n'est perdue (même si le prospect ne finalise pas WhatsApp).
// ============================================================
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const NOTIFY_TO = "emmanueldebeing.ed@gmail.com";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const esc = (s: unknown) =>
  String(s ?? "—").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

  try {
    const d = await req.json();
    const type = d.type === "coaching" ? "coaching" : "devis";

    // 1) Insertion en base (service role) — c'est ce qui garantit la capture
    const row = {
      type,
      nom: d.nom ?? null,
      contact: d.contact ?? null,
      email: d.email ?? null,
      pays: d.pays ?? null,
      besoin: d.besoin ?? null,
      formule: d.formule ?? null,
      message: d.message ?? null,
      details: d.details ?? null,
      statut: "nouveau",
    };
    const ins = await fetch(`${SUPABASE_URL}/rest/v1/aic_demandes`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!ins.ok) {
      const t = await ins.text();
      return json({ ok: false, error: "insert: " + t }, 200);
    }

    // 2) Notification email (non bloquante)
    const waNumber = String(d.contact ?? "").replace(/[\s+\-()]/g, "");
    const waLink = waNumber ? `https://wa.me/${waNumber}` : null;
    const titre = type === "coaching" ? "Nouvelle demande de COACHING" : "Nouvelle demande de DEVIS";

    const rows = [
      ["Nom", d.nom],
      ["Contact", d.contact],
      ["Email", d.email],
      ["Pays", d.pays],
      ["Besoin / objectif", d.besoin],
      ["Formule", d.formule],
      ["Message", d.message],
    ]
      .filter(([, v]) => v)
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 14px 6px 0;color:#8a8a8a;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;color:#111"><b>${esc(v)}</b></td></tr>`,
      )
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px">
        <h2 style="color:#E8760C;margin:0 0 4px">${esc(titre)}</h2>
        <p style="color:#8a8a8a;margin:0 0 16px">Agence Innovation Créative — aicreatioon.com</p>
        <table style="border-collapse:collapse">${rows}</table>
        ${waLink ? `<p><a href="${waLink}" style="display:inline-block;margin-top:18px;padding:11px 20px;background:#25D366;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">Répondre sur WhatsApp</a></p>` : ""}
        <p style="color:#b0b0b0;font-size:12px;margin-top:22px">Retrouvez toutes vos demandes sur aicreatioon.com/admin</p>
      </div>`;

    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Innovation Créative <noreply@agenceattractor.com>",
          to: NOTIFY_TO,
          subject: `${titre} — ${d.nom || "prospect"}`,
          html,
        }),
      }).catch(() => {});
    }

    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 200);
  }
});

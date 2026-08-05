// ============================================================
// notify-lead — Crée le dossier de pilotage d'un lead entrant, puis alerte par email.
// Sources : chatbot du site agenceattractor.com, et toute source future.
//
// CHANGEMENT DU 05/08/2026 : cette fonction ne faisait qu'envoyer un email, la création du
// dossier était faite côté navigateur par un POST REST direct sur pilotage_pipeline avec la clé
// anon. Or cette table est en gating nominatif : le POST répondait 401, et comme la notification
// était conditionnée à `if (res.ok)`, elle ne partait jamais non plus. Tout lead capté par le
// chatbot du site était donc perdu deux fois, en silence.
// L'écriture est désormais faite ici, en service role, comme pour le reste du tunnel.
// ============================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { nom, activite, besoin, zone, contact, source, contexte, famille, type, nb_users } = await req.json();

    // 1) Le dossier, en service role. Si l'écriture échoue on notifie quand même : mieux vaut un
    // email sans dossier qu'un lead totalement perdu.
    let dossierOk = false, dossierErr: string | null = null;
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );
      const { error } = await supabase.from("pilotage_pipeline").insert({
        nom: nom || "Visiteur",
        activite: activite || null,
        besoin: besoin || null,
        contexte: contexte || null,
        contact: contact || null,
        famille: famille || null,
        zone: zone || null,
        type: type || null,
        nb_users: nb_users || null,
        statut: "Nouveau",
        statut_color: "neu",
        prochaine: "Premier contact, répondre sous 24h",
        date_action: new Date().toISOString().slice(0, 10),
        priorite: 1,
        urgent: true,
        source: source || "inbound",
      });
      if (error) { dossierErr = error.message; console.error("[notify-lead] dossier:", error.message); }
      else dossierOk = true;
    } catch (e) {
      dossierErr = String(e);
      console.error("[notify-lead] dossier (exception):", dossierErr);
    }

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
          // hello@ et non noreply@ : un noreply sans boîte réelle est un signal de spam classique.
          from: "Pilotage <hello@agenceattractor.com>",
          to: NOTIFY_TO,
          subject: `Nouveau lead — ${nom || "Visiteur"} (${activite || "activité inconnue"})`,
          html,
        }),
      });
    }

    return new Response(JSON.stringify({ ok: true, dossier: dossierOk, erreur_dossier: dossierErr }), {
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

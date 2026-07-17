// ============================================================
// devis-accept — Réception d'une acceptation de devis web
// (page devis interactive Mr Attractor). Enregistre la sélection
// du prospect dans devis_web + alerte Mac Arthur (email + WhatsApp).
// Public (no-verify-jwt), fire-and-forget côté page.
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// PDF du devis accepté (preuve d'acceptation), généré côté serveur avec pdf-lib.
async function buildDevisPdf(o: { numero?: string; client?: string; projet?: string; nom?: string; contact?: string; selection?: string[]; total_label?: string; signeLe: string; ref?: string; ip?: string }): Promise<string> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.10, 0.09, 0.08), orange = rgb(0.95, 0.36, 0.02), muted = rgb(0.61, 0.57, 0.53), green = rgb(0.12, 0.62, 0.32);
  const M = 50; let y = 800;
  // Désinfection : mappe la ponctuation typographique en ASCII et retire tout ce que la police WinAnsi ne peut pas encoder (sinon pdf-lib lève une exception).
  const clean = (t: string) => String(t ?? "")
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/[—–]/g, "-").replace(/…/g, "...").replace(/ /g, " ")
    .replace(/[^\t\n\r\x20-\x7E¡-ÿ€]/g, "");
  const line = (t: string, f = font, size = 11, color = ink, dy = 16) => { page.drawText(clean(t), { x: M, y, size, font: f, color }); y -= dy; };
  page.drawText("Mr", { x: M, y, size: 20, font: bold, color: ink });
  page.drawText("Attractor", { x: M + 32, y, size: 20, font: bold, color: orange });
  y -= 16;
  line("Mac Arthur KOUASSI - Micro-entreprise - SIRET 98377125400015", font, 8, muted, 11);
  line("TVA non applicable, article 293 B du CGI - myattractor1@gmail.com - agenceattractor.com", font, 8, muted, 16);
  page.drawRectangle({ x: M, y: y + 4, width: 495, height: 2, color: orange });
  y -= 22;
  line("DEVIS ACCEPTE" + (o.numero ? "  -  " + o.numero : ""), bold, 15, ink, 24);
  line("Client : " + (o.nom || "-") + (o.client ? " (" + o.client + ")" : ""), font, 11, ink, 15);
  line("Contact : " + (o.contact || "-"), font, 11, muted, 15);
  if (o.projet) line("Projet : " + o.projet, font, 11, muted, 22); else y -= 6;
  line("Prestations retenues", bold, 10, muted, 16);
  for (const s of (o.selection || [])) {
    const words = String(s).split(" "); let cur = "- ";
    for (const w of words) { if ((cur + w).length > 82) { line(cur, font, 10.5, ink, 14); cur = "  " + w + " "; } else cur += w + " "; }
    line(cur.replace(/\s+$/, ""), font, 10.5, ink, 14);
  }
  y -= 8;
  line("Total : " + (o.total_label || "-"), bold, 14, orange, 30);
  page.drawRectangle({ x: M, y: y - 52, width: 495, height: 66, color: rgb(0.90, 0.96, 0.92) });
  const sy = y - 2;
  page.drawText("Accepte en ligne", { x: M + 14, y: sy, size: 10, font: bold, color: green });
  page.drawText(clean("Par : " + (o.nom || "-")), { x: M + 14, y: sy - 16, size: 10, font, color: ink });
  page.drawText(clean("Le : " + o.signeLe), { x: M + 14, y: sy - 30, size: 10, font, color: ink });
  page.drawText(clean("Ref. : " + (o.ref || "-") + (o.ip ? "  -  IP " + o.ip : "")), { x: M + 14, y: sy - 44, size: 8, font, color: muted });
  return encodeBase64(await doc.save());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const result: Record<string, unknown> = {};
  try {
    const body = await req.json();
    const { proposition_id, numero, client, projet, nom, contact, demande, selection, total, devise, total_label } = body ?? {};
    // Signature : horodatage + IP, embarqués dans le PDF de preuve.
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "inconnue";
    const signeLe = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";

    // Demande spécifique sans sélection catalogue → à chiffrer sur mesure (liberté du prospect)
    const hasSelection = Array.isArray(selection) && selection.length > 0;
    const isDemande = !!(demande && String(demande).trim()) && !hasSelection;
    const propStatut = isDemande ? "demande" : "accepte";
    const pipeStatut = isDemande ? "Demande à chiffrer" : "Devis accepté";

    // --- Enregistrement (service role, table sans policy publique) ---
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // --- Sync proposition + pilotage (le devis interactif dynamique) ---
    if (proposition_id) {
      const { data: prop } = await supabase
        .from("propositions")
        .update({
          statut: propStatut,
          accept_nom: nom ?? null,
          accept_contact: contact ?? null,
          accept_selection: hasSelection ? selection : null,
          demande: demande ?? null,
          total: typeof total === "number" ? total : null,
          accepted_at: new Date().toISOString(),
        })
        .eq("id", proposition_id)
        .select("dossier_id")
        .single();
      if (prop?.dossier_id) {
        await supabase
          .from("pilotage_pipeline")
          .update({ statut: pipeStatut, statut_color: isDemande ? "#F25C05" : "#1E9E52", derniere_action_at: new Date().toISOString() })
          .eq("id", prop.dossier_id);
      }
      result.sync = { ok: true };
    }
    const { data: row, error } = await supabase
      .from("devis_web")
      .insert({
        numero: numero ?? null,
        client: client ?? null,
        projet: projet ?? null,
        nom: nom ?? null,
        contact: contact ?? null,
        selection: Array.isArray(selection) ? selection : null,
        demande: demande ?? null,
        total: typeof total === "number" ? total : null,
        devise: devise ?? "€",
        total_label: total_label ?? null,
        statut: isDemande ? "à chiffrer" : "accepté",
      })
      .select("id")
      .single();
    if (error) result.db = { ok: false, error: error.message };
    else result.db = { ok: true, id: row?.id };

    // Fermer la boucle cockpit : un devis accepté passe à "valide" dans pilotage_devis, et son dossier à "Devis accepté".
    if (!isDemande && numero) {
      try {
        const { data: pd } = await supabase
          .from("pilotage_devis")
          .update({ statut: "valide" })
          .eq("numero", numero)
          .select("dossier_id");
        const dossierId = Array.isArray(pd) && pd[0]?.dossier_id;
        if (dossierId) {
          await supabase
            .from("pilotage_pipeline")
            .update({ statut: "Devis accepté", statut_color: "#1E9E52" })
            .eq("id", dossierId);
        }
        result.cockpit = { ok: true, devis: Array.isArray(pd) ? pd.length : 0 };
      } catch (e) { result.cockpit = { ok: false, error: String(e) }; }
    }

    const detail = [
      isDemande ? "⚠ DEMANDE SUR MESURE À CHIFFRER" : "Devis accepté",
      `${nom || "Prospect"} · ${contact || "—"}`,
      `Projet : ${projet || "—"} (devis ${numero || "—"})`,
      ...(hasSelection ? ["Sélection :", ...selection.map((s: string) => `  • ${s}`), `Total : ${total_label || (total != null ? total + " " + (devise || "€") : "—")}`] : []),
      ...(demande && String(demande).trim() ? ["", `Demande spécifique du prospect :`, `  ${demande}`] : []),
    ].join("\n");

    // --- Email via Resend (HTML cliquable) ---
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("NOTIFY_DEVIS_EMAIL") || "myattractor1@gmail.com";
    if (resendKey) {
      const waNum = String(contact || "").replace(/[\s+\-()]/g, "");
      const waReply = waNum
        ? `https://wa.me/${waNum}?text=${encodeURIComponent(`Bonjour ${nom || ""}, merci pour votre validation. `)}`
        : "";
      const subject = isDemande
        ? `Demande à chiffrer — ${nom || "Prospect"}`
        : `Devis accepté — ${nom || "Prospect"} · ${total_label || projet || numero || ""}`;
      const accent = isDemande ? "#F25C05" : "#1E9E52";
      const kicker = isDemande ? "Nouvelle demande sur mesure à chiffrer" : "Un prospect vient de valider sa proposition en ligne";
      const selBlock = hasSelection
        ? `<table style="width:100%;border-collapse:collapse;margin:6px 0 2px">${selection.map((s: string) => `<tr><td style="padding:6px 0;border-bottom:1px solid #Eee;font-size:14px;color:#1A1714">• ${esc(s)}</td></tr>`).join("")}</table>
           <p style="margin:10px 0 0;font-size:16px;font-weight:800;color:#1A1714">Total : ${esc(total_label || (total != null ? total + " " + (devise || "€") : "—"))}</p>`
        : "";
      const demBlock = (demande && String(demande).trim())
        ? `<div style="margin-top:14px;background:#FEF4EC;border:1px solid #F25C05;border-radius:10px;padding:14px">
             <div style="font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#D94F02;margin-bottom:6px">Demande spécifique du prospect</div>
             <div style="font-size:14px;color:#1A1714;line-height:1.5">${esc(String(demande))}</div>
           </div>`
        : "";
      const html = `<!doctype html><html><body style="margin:0;background:#FAF6F0;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:#1A1714">
        <div style="max-width:600px;margin:0 auto;padding:22px 16px">
          <div style="background:#1A1714;border-radius:14px 14px 0 0;padding:18px 22px">
            <div style="font-size:18px;font-weight:800;color:#fff">Mr <span style="color:#F25C05">Attractor</span></div>
            <div style="font-size:12px;color:#C9BEB2;margin-top:2px">${esc(kicker)}</div>
          </div>
          <div style="background:#fff;border-radius:0 0 14px 14px;padding:22px;box-shadow:0 8px 30px rgba(26,23,20,.08)">
            <div style="display:inline-block;background:${accent};color:#fff;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;padding:4px 10px;border-radius:20px">${isDemande ? "À chiffrer" : "Accepté"}</div>
            <h1 style="font-size:20px;margin:12px 0 4px">${esc(nom || "Prospect")}</h1>
            <p style="margin:0 0 14px;font-size:14px;color:#4A3F35">${esc(contact || "—")} &nbsp;·&nbsp; ${esc(projet || "—")}${numero ? " (" + esc(numero) + ")" : ""}</p>
            ${selBlock}${demBlock}
            <div style="margin-top:22px">
              ${waReply ? `<a href="${waReply}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;font-weight:800;font-size:14px;padding:13px 20px;border-radius:10px;margin:0 8px 8px 0">Répondre sur WhatsApp</a>` : ""}
              <a href="https://demo.agenceattractor.com/pilotage" style="display:inline-block;background:#1A1714;color:#fff;text-decoration:none;font-weight:800;font-size:14px;padding:13px 20px;border-radius:10px;margin:0 8px 8px 0">Ouvrir Pilotage</a>
            </div>
          </div>
          <p style="text-align:center;font-size:11px;color:#9C9189;margin:16px 0 0">Agence Mr Attractor — notification automatique du tunnel de vente</p>
        </div>
      </body></html>`;
      // PDF de preuve (uniquement pour une vraie acceptation, pas une demande à chiffrer)
      const totalTxt = total_label || (total != null ? total + " " + (devise || "€") : "—");
      let attachments: Array<{ filename: string; content: string }> = [];
      if (!isDemande) {
        try {
          const pdfB64 = await buildDevisPdf({
            numero, client, projet, nom, contact,
            selection: hasSelection ? selection : [],
            total_label: totalTxt, signeLe, ref: String(row?.id || numero || ""), ip,
          });
          attachments = [{ filename: `Devis-${numero || "MrAttractor"}-accepte.pdf`, content: pdfB64 }];
          result.pdf = { ok: true };
        } catch (e) { result.pdf = { ok: false, error: String(e) }; }
      }

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Mr Attractor <noreply@agenceattractor.com>",
          to: [notifyEmail],
          subject,
          html,
          text: [kicker, "", detail].join("\n"),
          ...(attachments.length ? { attachments } : {}),
        }),
      });
      result.email = { ok: emailRes.ok };

      // Copie au client avec le PDF, s'il a laissé un email (signature reçue par mail façon YouSign).
      if (!isDemande && attachments.length && String(contact || "").includes("@")) {
        const cHtml = `<!doctype html><html><body style="margin:0;background:#FAF6F0;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:#1A1714">
          <div style="max-width:600px;margin:0 auto;padding:22px 16px">
            <div style="background:#1A1714;border-radius:14px 14px 0 0;padding:18px 22px">
              <div style="font-size:18px;font-weight:800;color:#fff">Mr <span style="color:#F25C05">Attractor</span></div>
              <div style="font-size:12px;color:#C9BEB2;margin-top:2px">Votre devis est validé</div>
            </div>
            <div style="background:#fff;border-radius:0 0 14px 14px;padding:22px;box-shadow:0 8px 30px rgba(26,23,20,.08)">
              <h1 style="font-size:20px;margin:0 0 8px">Merci ${esc(nom || "")}, c'est validé.</h1>
              <p style="font-size:14px;color:#4A3F35;line-height:1.55;margin:0 0 12px">Vous trouverez en pièce jointe votre devis accepté${numero ? " (" + esc(numero) + ")" : ""} : <b>${esc(totalTxt)}</b>. Mac Arthur revient vers vous très vite pour la suite.</p>
              <p style="font-size:12.5px;color:#9C9189;margin:0">Accepté en ligne le ${esc(signeLe)}. Ce document fait foi de votre accord.</p>
            </div>
            <p style="text-align:center;font-size:11px;color:#9C9189;margin:16px 0 0">Agence Mr Attractor — agenceattractor.com</p>
          </div></body></html>`;
        try {
          const cRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: "Mr Attractor <noreply@agenceattractor.com>",
              to: [String(contact).trim()],
              subject: `Votre devis validé — ${projet || numero || "Mr Attractor"}`,
              html: cHtml,
              text: `Merci ${nom || ""}, votre devis${numero ? " " + numero : ""} est validé (${totalTxt}). Votre devis accepté est en pièce jointe. Accepté en ligne le ${signeLe}.`,
              attachments,
            }),
          });
          result.clientEmail = { ok: cRes.ok };
        } catch (e) { result.clientEmail = { ok: false, error: String(e) }; }
      }
    } else {
      result.email = { ok: false, error: "RESEND_API_KEY absente" };
    }

    // --- WhatsApp via CallMeBot (optionnel) ---
    const cmbKey = Deno.env.get("CALLMEBOT_DEVIS_APIKEY");
    const cmbPhone = Deno.env.get("CALLMEBOT_DEVIS_PHONE");
    if (cmbKey && cmbPhone) {
      const waText = ["✅ Devis accepté en ligne", detail].join("\n");
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(cmbPhone)}&text=${encodeURIComponent(waText)}&apikey=${encodeURIComponent(cmbKey)}`;
      try { const r = await fetch(url); result.whatsapp = { ok: r.ok }; }
      catch (e) { result.whatsapp = { ok: false, error: String(e) }; }
    }

    return new Response(JSON.stringify({ ok: true, ...result }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err), ...result }), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

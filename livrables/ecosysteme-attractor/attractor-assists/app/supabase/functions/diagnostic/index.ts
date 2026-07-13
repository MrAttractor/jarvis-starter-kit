// ============================================================
// diagnostic — entretien de découverte guidé, analysé par la Méthode Attractor.
// POST { answers, nom, contact } → synthèse/cartographie/problèmes/opportunités
//   + crée prospect + dossier pilotage_pipeline (statut "Diagnostic reçu")
//   + diagnostics + notifie Mac Arthur (email HTML). Aucune proposition envoyée
//   automatiquement : le consultant valide dans Pilotage.
// Public (no-verify-jwt), la méthode vient de methode_modules (jamais le modèle seul).
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

function zoneFromContact(c: string): string {
  const d = String(c || "").replace(/[\s\-()]/g, "");
  if (d.startsWith("+225") || d.startsWith("225")) return "CI";
  if (d.startsWith("+33") || d.startsWith("0")) return "France";
  return "France";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const result: Record<string, unknown> = {};
  try {
    const { answers = {}, nom, contact } = await req.json();
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // 1) Charger la Méthode Attractor curée (le cerveau)
    const { data: mods } = await supabase
      .from("methode_modules")
      .select("etape,titre,contenu")
      .in("etape", ["decouverte", "diagnostic", "ton"])
      .eq("actif", true)
      .order("ordre");
    const methode = (mods || []).map((m: any) => `### ${m.titre}\n${m.contenu}`).join("\n\n");

    const SYSTEM = `Tu es le consultant de découverte de l'Agence Mr Attractor. Tu analyses un entrepreneur à partir de la MÉTHODE ATTRACTOR ci-dessous — jamais à partir de tes seules connaissances.

${methode}

À partir des réponses de l'entrepreneur, produis un diagnostic FIDÈLE à la méthode. Réponds en JSON strict, sans texte autour :
{
  "synthese": "<3-4 phrases chaleureuses qui montrent qu'on a compris son activité et sa situation, dans un ton bienveillant et concret>",
  "cartographie": ["<étape 1 de son process actuel>", "<étape 2>", "..."],
  "problemes": ["<problème réel détecté>", "..."],
  "opportunites": ["<opportunité d'automatisation ou d'amélioration concrète, reliée à la méthode>", "..."],
  "famille": "A" | "B" | "C" | "D",
  "couloir": "Organisation" | "Visibilité" | "Ventes",
  "message_whatsapp": "<premier message WhatsApp de contact À FROID, prêt à envoyer. Le prospect ne connaît pas ce numéro. COMMENCE OBLIGATOIREMENT par te présenter, exactement dans cet esprit : « Bonjour [prénom], c'est Mac Arthur de l'agence Mr Attractor, vous venez de faire le diagnostic en ligne. » Puis 2 à 4 phrases : reprends SON activité et SA douleur avec ses mots pour montrer qu'on a compris, reformule le vrai levier simplement, et propose un échange court cette semaine pour lui montrer concrètement à quoi ressemblerait la solution. Vouvoiement, ton naturel et humain. AUCUN emoji, AUCUN markdown, AUCUN superlatif ni flatterie, AUCUN tiret long (—) : utilise des virgules ou des points. N'invente JAMAIS une conversation passée : il a rempli un formulaire, il ne t'a pas parlé.>"
}
Famille : A = besoin d'une app/outil métier ; B = besoin de conseil/structuration ; D = business établi avec chiffres où on aligne sur la performance. Choisis la plus probable.`;

    const brief = Object.entries(answers).map(([k, v]) => `${k} : ${v}`).join("\n") + `\nNom : ${nom || "—"}\nContact : ${contact || "—"}`;

    // 2) Analyse Claude
    let parsed: any = {}; let aiDebug: any = { keyLen: (ANTHROPIC_API_KEY || "").length };
    try {
      const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1100, system: SYSTEM, messages: [{ role: "user", content: brief }] }),
      });
      const apiData = await apiRes.json();
      aiDebug.status = apiRes.status;
      aiDebug.apiErr = apiData?.error?.message || null;
      const raw = (apiData?.content ?? []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("").trim();
      aiDebug.rawHead = raw.slice(0, 140);
      const m = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse((m ? m[0] : raw));
    } catch (e) {
      aiDebug.ex = String(e);
      parsed = { synthese: "Merci pour vos réponses, on a bien reçu votre situation.", cartographie: [], problemes: [], opportunites: [], famille: null, message_whatsapp: null };
    }
    if (new URL(req.url).searchParams.get("debug")) result.ai = aiDebug;

    // Garde-fou déterministe : pas de tiret long (préférence Mr Attractor), le prompt seul ne suffit pas.
    if (parsed && typeof parsed.message_whatsapp === "string") {
      parsed.message_whatsapp = parsed.message_whatsapp.replace(/\s*[—–]\s*/g, ", ").trim();
    }

    const zone = zoneFromContact(contact);

    // 3) Créer le prospect
    const { data: prospect } = await supabase.from("prospects").insert({
      prenom: nom || null, activite: answers.activite || null,
      besoin: [answers.offre, answers.douleur].filter(Boolean).join(" — ") || null,
      contexte: parsed.synthese || null, canal: "Diagnostic en ligne", zone,
      whatsapp: contact || null, statut: "nouveau", type_projet: parsed.famille || "A",
    }).select("id").single();

    // 4) Créer le dossier pipeline (source de vérité) → Pilotage le voit tout de suite
    const dossierId = "diag-" + crypto.randomUUID();
    await supabase.from("pilotage_pipeline").insert({
      id: dossierId, nom: nom || "Prospect", contact: contact || null,
      activite: answers.activite || null, famille: parsed.famille || null, zone,
      statut: "Diagnostic reçu", statut_color: "#F25C05",
      besoin: [answers.offre, answers.douleur].filter(Boolean).join(" — ") || null,
      contexte: parsed.synthese || null,
      prochaine: "Relire le diagnostic et créer la proposition (bouton dans la fiche)",
      source: "diagnostic", priorite: 1, urgent: true,
      date_action: new Date().toISOString().slice(0, 10),
    });

    // 5) Diagnostic détaillé
    await supabase.from("diagnostics").insert({
      prospect_id: prospect?.id || null, dossier_id: dossierId, nom: nom || null, contact: contact || null,
      reponses: answers, synthese: parsed.synthese || null,
      cartographie: parsed.cartographie || null, problemes: parsed.problemes || null,
      opportunites: parsed.opportunites || null, famille: parsed.famille || null, statut: "nouveau",
    });

    result.dossier_id = dossierId;

    // 6) Notifier Mac Arthur (email HTML cliquable)
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("NOTIFY_DEVIS_EMAIL") || "myattractor1@gmail.com";
    if (resendKey) {
      const waNum = String(contact || "").replace(/[\s+\-()]/g, "");
      const waMsg = (parsed.message_whatsapp && String(parsed.message_whatsapp).trim()) || `Bonjour ${nom || ""}, merci pour votre diagnostic. `;
      const waReply = waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}` : "";
      const list = (arr: any[], color: string) => Array.isArray(arr) && arr.length
        ? `<ul style="margin:6px 0 0;padding-left:18px">${arr.map((x) => `<li style="font-size:13.5px;color:#4A3F35;margin-bottom:4px">${esc(x)}</li>`).join("")}</ul>` : "<p style='color:#9C9189;font-size:13px;margin:4px 0 0'>—</p>";
      const html = `<!doctype html><html><body style="margin:0;background:#FAF6F0;font-family:'Segoe UI',system-ui,sans-serif;color:#1A1714">
        <div style="max-width:600px;margin:0 auto;padding:22px 16px">
          <div style="background:#1A1714;border-radius:14px 14px 0 0;padding:18px 22px">
            <div style="font-size:18px;font-weight:800;color:#fff">Mr <span style="color:#F25C05">Attractor</span></div>
            <div style="font-size:12px;color:#C9BEB2;margin-top:2px">Nouveau diagnostic reçu — un prospect a rempli son entretien</div>
          </div>
          <div style="background:#fff;border-radius:0 0 14px 14px;padding:22px;box-shadow:0 8px 30px rgba(26,23,20,.08)">
            <h1 style="font-size:20px;margin:0 0 2px">${esc(nom || "Prospect")}</h1>
            <p style="margin:0 0 14px;font-size:14px;color:#4A3F35">${esc(contact || "—")} &nbsp;·&nbsp; ${esc(answers.activite || "—")} &nbsp;·&nbsp; Famille ${esc(parsed.famille || "?")}</p>
            <div style="background:#FCF8EC;border-left:3px solid #F25C05;border-radius:0 8px 8px 0;padding:12px 14px;margin-bottom:16px">
              <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#D94F02;margin-bottom:4px">Synthèse</div>
              <div style="font-size:14px;color:#1A1714;line-height:1.55">${esc(parsed.synthese || "")}</div>
            </div>
            <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#9C9189">Problèmes détectés</div>${list(parsed.problemes, "#F25C05")}
            <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#9C9189;margin-top:12px">Opportunités</div>${list(parsed.opportunites, "#1E9E52")}
            ${parsed.message_whatsapp ? `<div style="background:#EAF7EF;border-left:3px solid #25D366;border-radius:0 8px 8px 0;padding:12px 14px;margin:16px 0 0"><div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#128C4B;margin-bottom:4px">Message prêt à envoyer</div><div style="font-size:14px;color:#1A1714;line-height:1.55;white-space:pre-wrap">${esc(parsed.message_whatsapp)}</div></div>` : ""}
            <div style="margin-top:22px">
              ${waReply ? `<a href="${waReply}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;font-weight:800;font-size:14px;padding:13px 20px;border-radius:10px;margin:0 8px 8px 0">Répondre sur WhatsApp</a>` : ""}
              <a href="https://demo.agenceattractor.com/pilotage" style="display:inline-block;background:#1A1714;color:#fff;text-decoration:none;font-weight:800;font-size:14px;padding:13px 20px;border-radius:10px;margin:0 8px 8px 0">Ouvrir Pilotage → créer la proposition</a>
            </div>
          </div>
          <p style="text-align:center;font-size:11px;color:#9C9189;margin:16px 0 0">Agence Mr Attractor — tunnel de vente</p>
        </div></body></html>`;
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "Mr Attractor <noreply@agenceattractor.com>", to: [notifyEmail], subject: `Diagnostic — ${nom || "Prospect"} (${answers.activite || "?"})`, html }),
      });
      result.email = { ok: r.ok };
    }

    return json({ ok: true, synthese: parsed.synthese, cartographie: parsed.cartographie, problemes: parsed.problemes, opportunites: parsed.opportunites, ...result });
  } catch (e) {
    return json({ ok: false, error: String(e), ...result }, 200);
  }
});

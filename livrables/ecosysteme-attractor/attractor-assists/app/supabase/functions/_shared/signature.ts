// ============================================================
// Signature Attractor — utilitaires partagés
// ============================================================

export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
export const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
export const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
export const SIGN_BASE_URL = Deno.env.get("SIGN_BASE_URL") ?? "https://signature.agenceattractor.com";
export const AGENCE_EMAIL = Deno.env.get("SIGN_NOTIFY_EMAIL") ?? "hello@agenceattractor.com";

/** Empreinte SHA-256 en hexadécimal. C'est le scellé du document et de l'acte. */
export async function sha256(input: string | Uint8Array): Promise<string> {
  const data = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Jeton de lien : 32 octets aléatoires, base36. Non devinable. */
export function nouveauToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes).map((b) => b.toString(36).padStart(2, "0")).join("").slice(0, 48);
}

/** Code à 6 chiffres, tiré d'une source cryptographique (pas Math.random). */
export function nouveauCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, "0");
}

/** Comparaison à temps constant, pour ne pas fuiter le code par le temps de réponse. */
export function egalConstant(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const ipDe = (req: Request) =>
  (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "inconnue";

export const uaDe = (req: Request) => (req.headers.get("user-agent") || "inconnu").slice(0, 400);

export const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Horodatage lisible, en heure de Paris, pour les documents et emails. */
export function horodatage(d = new Date()): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "Europe/Paris",
  }).format(d) + " (heure de Paris)";
}

/** Journal de preuve. Best effort : ne doit jamais faire échouer l'acte de signature. */
export async function journal(
  supabase: any,
  entree: {
    dossier_id?: string | null;
    signataire_id?: string | null;
    type: string;
    ip?: string;
    user_agent?: string;
    meta?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await supabase.from("sig_evenements").insert({
      dossier_id: entree.dossier_id ?? null,
      signataire_id: entree.signataire_id ?? null,
      type: entree.type,
      ip: entree.ip ?? null,
      user_agent: entree.user_agent ?? null,
      meta: entree.meta ?? null,
    });
  } catch (_) { /* le journal ne bloque jamais la signature */ }
}

/** Envoi d'email via Resend. Retourne true si accepté. */
export async function envoyerEmail(o: {
  to: string[];
  subject: string;
  html: string;
  text: string;
  attachments?: Array<{ filename: string; content: string }>;
}): Promise<boolean> {
  if (!RESEND_KEY) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        // Expéditeur : une boîte réelle et relevée, jamais "noreply@".
        // Cas Élévia du 29/07/2026 : l'invitation partie de noreply@ a été classée
        // en indésirable par Outlook, alors qu'un mail envoyé depuis hello@ une
        // minute plus tôt, même domaine, est bien arrivé en boîte de réception.
        // Un acte contractuel doit venir de quelqu'un à qui l'on peut répondre.
        from: "Mac Arthur KOUASSI <hello@agenceattractor.com>",
        reply_to: AGENCE_EMAIL,
        ...o,
      }),
    });
    return r.ok;
  } catch (_) {
    return false;
  }
}

/** Gabarit d'email de l'agence. Volontairement sobre : ce sont des actes contractuels. */
export function gabaritEmail(o: {
  kicker: string;
  titre: string;
  corps: string;
  cta?: { texte: string; url: string };
  pied?: string;
}): string {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#FAF6F0;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:#1A1714">
    <div style="max-width:600px;margin:0 auto;padding:24px 16px">
      <div style="background:#1A1714;border-radius:14px 14px 0 0;padding:20px 24px">
        <div style="font-size:18px;font-weight:800;color:#fff">Mr <span style="color:#F25C05">Attractor</span></div>
        <div style="font-size:12px;color:#C9BEB2;margin-top:3px">${esc(o.kicker)}</div>
      </div>
      <div style="background:#fff;border-radius:0 0 14px 14px;padding:26px 24px;box-shadow:0 8px 30px rgba(26,23,20,.08)">
        <h1 style="font-size:21px;margin:0 0 14px;line-height:1.3">${esc(o.titre)}</h1>
        ${o.corps}
        ${o.cta ? `<div style="margin-top:26px"><a href="${o.cta.url}" style="display:inline-block;background:#F25C05;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:15px 28px;border-radius:10px">${esc(o.cta.texte)}</a></div>` : ""}
      </div>
      <p style="text-align:center;font-size:11px;color:#9C9189;margin:18px 0 0;line-height:1.6">
        ${o.pied ? esc(o.pied) + "<br>" : ""}
        Agence Mr Attractor — Mac Arthur KOUASSI — SIRET 98377125400015<br>agenceattractor.com
      </p>
    </div>
  </body></html>`;
}

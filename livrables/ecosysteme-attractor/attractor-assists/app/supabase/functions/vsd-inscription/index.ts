// ============================================================
// vsd-inscription — VSD by Attractor (72h Paris Abidjan Paris)
// Capture les inscriptions à la liste d'attente : insertion en base
// (service role), accusé de réception au voyageur, notification à
// l'agence. Tout le traitement se fait par email ; le numéro WhatsApp
// est stocké pour des réutilisations ultérieures, il ne déclenche
// aucun envoi.
// ============================================================
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const NOTIFY_TO = "hello@agenceattractor.com";
const FROM = "VSD by Attractor <noreply@agenceattractor.com>";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const esc = (s: unknown) =>
  String(s ?? "—").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

  try {
    const d = await req.json();

    const nom = String(d.nom ?? "").trim();
    const email = String(d.email ?? "").trim();
    if (!nom) return json({ ok: false, error: "nom_manquant" });
    if (!EMAIL_OK.test(email)) return json({ ok: false, error: "email_invalide" });

    // 1) Insertion en base — c'est elle qui garantit qu'aucune demande n'est perdue
    const row = {
      nom,
      email,
      whatsapp: String(d.whatsapp ?? "").trim() || null,
      depart: d.depart ?? null,
      formule: d.formule ?? null,
      valise: d.valise ?? null,
      source: "site",
      statut: "nouveau",
    };
    const ins = await fetch(`${SUPABASE_URL}/rest/v1/vsd_inscriptions`, {
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
      return json({ ok: false, error: "insert: " + t });
    }

    if (!RESEND_API_KEY) return json({ ok: true, mail: false });

    // 2) Accusé de réception au voyageur
    const auVoyageur = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;color:#17202B">
        <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#F77F00;margin:0 0 6px"><b>VSD by Attractor</b></p>
        <h2 style="margin:0 0 16px;font-size:21px">Votre place est réservée dans la file</h2>
        <p style="margin:0 0 14px;line-height:1.6">Bonjour ${esc(nom)},</p>
        <p style="margin:0 0 14px;line-height:1.6">Nous avons bien reçu votre inscription sur la liste d'attente du week-end Paris Abidjan. Voici ce que nous avons noté :</p>
        <table style="border-collapse:collapse;margin:0 0 18px">
          <tr><td style="padding:5px 14px 5px 0;color:#6B7A8D">Départ souhaité</td><td style="padding:5px 0"><b>${esc(d.depart)}</b></td></tr>
          <tr><td style="padding:5px 14px 5px 0;color:#6B7A8D">Formule</td><td style="padding:5px 0"><b>${esc(d.formule)}</b></td></tr>
          <tr><td style="padding:5px 14px 5px 0;color:#6B7A8D">Valise supplémentaire</td><td style="padding:5px 0"><b>${esc(d.valise)}</b></td></tr>
        </table>
        <p style="margin:0 0 14px;line-height:1.6"><b>La suite.</b> Nous revenons vers vous par email sous 24 heures pour vérifier votre dossier. Une fois votre place validée, vous recevez votre lien de paiement sécurisé. Rien n'est à régler avant cette étape.</p>
        <p style="margin:0 0 14px;line-height:1.6"><b>Un point à préparer.</b> Le tarif est réservé aux voyageurs qui partent et reviennent sans démarche de visa : résidents en France à titre stable, ou binationaux avec un passeport ivoirien à jour. Vérifiez la validité de vos documents, c'est ce qui bloque le plus souvent un dossier.</p>
        <p style="margin:0 0 6px;line-height:1.6">À très vite,</p>
        <p style="margin:0;line-height:1.6">L'équipe VSD</p>
        <p style="color:#98A2B3;font-size:12px;margin-top:24px;line-height:1.6">Vous recevez cet email parce que vous vous êtes inscrit sur la liste d'attente VSD. Répondez à ce message pour toute question ou pour être retiré de la liste.</p>
      </div>`;

    // 3) Notification à l'agence
    const lignes = [
      ["Nom", nom],
      ["Email", email],
      ["WhatsApp", row.whatsapp],
      ["Départ souhaité", d.depart],
      ["Formule", d.formule],
      ["Valise supplémentaire", d.valise],
    ]
      .filter(([, v]) => v)
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 14px 6px 0;color:#6B7A8D;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;color:#111"><b>${esc(v)}</b></td></tr>`,
      )
      .join("");

    const aLagence = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px">
        <h2 style="color:#F77F00;margin:0 0 4px">Nouvelle inscription VSD</h2>
        <p style="color:#6B7A8D;margin:0 0 16px">Liste d'attente, 72h Paris Abidjan Paris</p>
        <table style="border-collapse:collapse">${lignes}</table>
        <p style="margin-top:18px"><a href="mailto:${esc(email)}" style="display:inline-block;padding:11px 20px;background:#009E60;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">Répondre par email</a></p>
        <p style="color:#98A2B3;font-size:12px;margin-top:22px">Inscription enregistrée dans la table vsd_inscriptions.</p>
      </div>`;

    await Promise.all([
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: FROM,
          to: email,
          reply_to: NOTIFY_TO,
          subject: "Votre inscription VSD est bien enregistrée",
          html: auVoyageur,
        }),
      }).catch(() => {}),
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: FROM,
          to: NOTIFY_TO,
          reply_to: email,
          subject: `Inscription VSD — ${nom} — ${d.depart ?? "date à préciser"}`,
          html: aLagence,
        }),
      }).catch(() => {}),
    ]);

    return json({ ok: true, mail: true });
  } catch (e) {
    return json({ ok: false, error: String(e) });
  }
});

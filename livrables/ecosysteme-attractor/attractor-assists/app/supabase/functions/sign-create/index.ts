// ============================================================
// sign-create — Mise en signature d'un dossier
//
// Réservé à l'agence : protégé par le secret SIGN_ADMIN_SECRET.
// Scelle chaque document par son empreinte SHA-256, crée les
// signataires avec leur lien secret, et envoie l'invitation.
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORS, SUPABASE_URL, SERVICE_KEY, SIGN_BASE_URL,
  sha256, nouveauToken, ipDe, uaDe, esc, journal, envoyerEmail, gabaritEmail,
} from "../_shared/signature.ts";

const ADMIN_SECRET = Deno.env.get("SIGN_ADMIN_SECRET") ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

  try {
    const body = await req.json();
    const { secret, reference, titre, client, message, documents, signataires, expire_jours } = body ?? {};

    if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
      return json({ ok: false, error: "Accès refusé." }, 403);
    }
    if (!titre || !Array.isArray(documents) || documents.length === 0) {
      return json({ ok: false, error: "Titre et au moins un document sont requis." }, 400);
    }
    if (!Array.isArray(signataires) || signataires.length === 0) {
      return json({ ok: false, error: "Au moins un signataire est requis." }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const jours = Number(expire_jours) > 0 ? Number(expire_jours) : 30;

    // ── 1. Création du dossier ──
    const { data: dossier, error: eDossier } = await supabase
      .from("sig_dossiers")
      .insert({
        reference: reference ?? null,
        titre,
        client: client ?? null,
        message: message ?? null,
        expire_at: new Date(Date.now() + jours * 86400_000).toISOString(),
      })
      .select("id")
      .single();
    if (eDossier) return json({ ok: false, error: eDossier.message }, 500);

    // ── 2. Scellement des documents : on télécharge et on empreinte ──
    const scelles: Array<Record<string, unknown>> = [];
    for (let i = 0; i < documents.length; i++) {
      const d = documents[i];
      let hash: string | null = null;
      let taille: number | null = null;
      try {
        const r = await fetch(d.url);
        if (r.ok) {
          const contenu = new Uint8Array(await r.arrayBuffer());
          hash = await sha256(contenu);
          taille = contenu.length;
        }
      } catch (_) { /* document non joignable : on le signale plus bas */ }

      if (!hash) {
        return json({
          ok: false,
          error: `Document « ${d.nom ?? d.url} » injoignable à l'adresse ${d.url}. Le scellement est impossible, la mise en signature est annulée.`,
        }, 400);
      }

      scelles.push({
        dossier_id: dossier.id,
        nom: d.nom ?? `Document ${i + 1}`,
        reference: d.reference ?? null,
        url: d.url,
        contenu_hash: hash,
        taille,
        ordre: d.ordre ?? i + 1,
      });
    }
    const { error: eDocs } = await supabase.from("sig_documents").insert(scelles);
    if (eDocs) return json({ ok: false, error: eDocs.message }, 500);

    // ── 3. Signataires et liens secrets ──
    const liens: Array<{ nom: string; email: string; role: string; url: string }> = [];
    for (let i = 0; i < signataires.length; i++) {
      const s = signataires[i];
      if (!s.nom || !s.email) return json({ ok: false, error: "Chaque signataire doit avoir un nom et un email." }, 400);
      const token = nouveauToken();
      const { error: eSig } = await supabase.from("sig_signataires").insert({
        dossier_id: dossier.id,
        nom: s.nom,
        email: String(s.email).trim().toLowerCase(),
        qualite: s.qualite ?? null,
        role: s.role ?? "client",
        ordre: s.ordre ?? i + 1,
        token,
      });
      if (eSig) return json({ ok: false, error: eSig.message }, 500);
      liens.push({ nom: s.nom, email: s.email, role: s.role ?? "client", url: `${SIGN_BASE_URL}/s/${token}` });
    }

    await journal(supabase, {
      dossier_id: dossier.id,
      type: "cree",
      ip: ipDe(req),
      user_agent: uaDe(req),
      meta: { titre, reference, documents: scelles.map((d) => ({ nom: d.nom, hash: d.contenu_hash })) },
    });

    // ── 4. Invitations ──
    for (const lien of liens) {
      if (lien.role === "prestataire") continue; // le prestataire contresigne après la cliente
      const listeDocs = scelles
        .map((d) => `<li style="margin-bottom:6px">${esc(d.nom)}${d.reference ? ` <span style="color:#9C9189">(${esc(d.reference)})</span>` : ""}</li>`)
        .join("");
      const html = gabaritEmail({
        kicker: "Documents à signer",
        titre: `${lien.nom}, vos documents sont prêts à être signés`,
        corps: `
          ${message ? `<p style="font-size:15px;line-height:1.6;color:#4A3F35;margin:0 0 16px">${esc(message)}</p>` : ""}
          <p style="font-size:15px;line-height:1.6;color:#4A3F35;margin:0 0 10px">Vous avez ${scelles.length} document${scelles.length > 1 ? "s" : ""} à signer :</p>
          <ul style="font-size:15px;line-height:1.6;color:#1A1714;margin:0 0 16px;padding-left:20px">${listeDocs}</ul>
          <p style="font-size:15px;line-height:1.6;color:#4A3F35;margin:0">C'est simple : vous lisez les documents, vous signez avec votre doigt ou votre souris, et vous recevez un code à 6 chiffres par email pour confirmer que c'est bien vous. Tout se fait depuis cette page, il n'y a rien à imprimer ni à installer.</p>`,
        cta: { texte: "Lire et signer mes documents", url: lien.url },
        pied: `Ce lien vous est personnel. Il expire dans ${jours} jours.`,
      });
      const envoye = await envoyerEmail({
        to: [lien.email],
        subject: `À signer — ${titre}`,
        html,
        text: [
          `${lien.nom}, vos documents sont prêts à être signés.`,
          "",
          ...scelles.map((d) => `- ${d.nom}`),
          "",
          `Lien personnel : ${lien.url}`,
          `Ce lien expire dans ${jours} jours.`,
        ].join("\n"),
      });
      await journal(supabase, {
        dossier_id: dossier.id,
        type: "envoye",
        meta: { destinataire: lien.email, email_accepte: envoye },
      });
    }

    return json({ ok: true, dossier_id: dossier.id, liens, documents: scelles.map((d) => ({ nom: d.nom, hash: d.contenu_hash })) });
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
});

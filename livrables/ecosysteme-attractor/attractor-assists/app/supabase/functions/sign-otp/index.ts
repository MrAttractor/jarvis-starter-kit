// ============================================================
// sign-otp — Envoi du code à 6 chiffres au signataire
//
// C'est la brique d'identification : le code part sur l'adresse
// email enregistrée au dossier, jamais sur une adresse saisie
// à la volée. Le code n'est jamais stocké en clair.
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORS, SUPABASE_URL, SERVICE_KEY,
  sha256, nouveauCode, ipDe, uaDe, esc, journal, envoyerEmail, gabaritEmail,
} from "../_shared/signature.ts";

const VALIDITE_MINUTES = 15;
const DELAI_RENVOI_SECONDES = 45;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

  try {
    const { token } = await req.json();
    if (!token) return json({ ok: false, error: "Lien invalide." }, 400);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: sig } = await supabase
      .from("sig_signataires")
      .select("id, dossier_id, nom, email, statut")
      .eq("token", token)
      .maybeSingle();
    if (!sig) return json({ ok: false, error: "Ce lien de signature n'existe pas." }, 404);
    if (sig.statut === "signe") return json({ ok: false, error: "Ces documents ont déjà été signés." }, 409);

    const { data: dossier } = await supabase
      .from("sig_dossiers").select("titre, expire_at").eq("id", sig.dossier_id).single();
    if (new Date(dossier.expire_at).getTime() < Date.now()) {
      return json({ ok: false, error: "Ce dossier de signature a expiré. Demandez un nouveau lien." }, 410);
    }

    // Anti-spam : pas plus d'un envoi toutes les 45 secondes.
    const { data: dernier } = await supabase
      .from("sig_otp").select("created_at").eq("signataire_id", sig.id)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (dernier) {
      const ecoule = (Date.now() - new Date(dernier.created_at).getTime()) / 1000;
      if (ecoule < DELAI_RENVOI_SECONDES) {
        return json({ ok: false, error: `Un code vient d'être envoyé. Patientez ${Math.ceil(DELAI_RENVOI_SECONDES - ecoule)} secondes avant d'en demander un autre.` }, 429);
      }
    }

    // Un nouveau code annule les précédents.
    await supabase.from("sig_otp").delete().eq("signataire_id", sig.id).is("used_at", null);

    const code = nouveauCode();
    const expiresAt = new Date(Date.now() + VALIDITE_MINUTES * 60_000);
    const { error: eOtp } = await supabase.from("sig_otp").insert({
      signataire_id: sig.id,
      code_hash: await sha256(code),
      expires_at: expiresAt.toISOString(),
    });
    if (eOtp) return json({ ok: false, error: eOtp.message }, 500);

    const html = gabaritEmail({
      kicker: "Confirmation de signature",
      titre: "Votre code de signature",
      corps: `
        <p style="font-size:15px;line-height:1.6;color:#4A3F35;margin:0 0 20px">${esc(sig.nom)}, voici le code qui confirme que c'est bien vous qui signez <strong>${esc(dossier.titre)}</strong>.</p>
        <div style="background:#FAF6F0;border:2px solid #F25C05;border-radius:14px;padding:22px;text-align:center;margin:0 0 20px">
          <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#9C9189;margin-bottom:10px">Code de signature</div>
          <div style="font-size:40px;font-weight:800;letter-spacing:.18em;color:#1A1714;font-family:'Courier New',monospace">${esc(code)}</div>
        </div>
        <p style="font-size:14px;line-height:1.6;color:#4A3F35;margin:0 0 8px">Saisissez ce code sur la page de signature. Il est valable ${VALIDITE_MINUTES} minutes.</p>
        <p style="font-size:13px;line-height:1.6;color:#9C9189;margin:0">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : sans ce code, aucune signature ne peut être apposée.</p>`,
    });

    const envoye = await envoyerEmail({
      to: [sig.email],
      subject: `Votre code de signature : ${code}`,
      html,
      text: `${sig.nom}, votre code de signature pour « ${dossier.titre} » est : ${code}\n\nIl est valable ${VALIDITE_MINUTES} minutes.\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
    });

    await journal(supabase, {
      dossier_id: sig.dossier_id, signataire_id: sig.id,
      type: "code_envoye", ip: ipDe(req), user_agent: uaDe(req),
      meta: { email_accepte: envoye, validite_minutes: VALIDITE_MINUTES },
    });

    if (!envoye) return json({ ok: false, error: "L'envoi du code a échoué. Réessayez dans un instant." }, 502);
    return json({ ok: true, validite_minutes: VALIDITE_MINUTES });
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
});

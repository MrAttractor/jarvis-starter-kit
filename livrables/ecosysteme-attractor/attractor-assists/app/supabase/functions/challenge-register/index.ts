// challenge-register — Capture email + prénom, envoie l'ebook par Resend.
// POST { prenom, email, source? }
// Retourne { success, message }

const EBOOK_URL = "https://drive.google.com/uc?export=download&id=1Gh-lZjJVK_Q-HTV0s4-fV4zxRShHP-jc";
const FROM_EMAIL = "Mac Arthur <bonjour@agenceattractor.com>";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    const { prenom, email, source } = await req.json();
    if (!prenom || !email) {
      return json({ error: "prenom et email requis" }, 400);
    }

    const prenomClean = prenom.trim();
    const emailClean  = email.trim().toLowerCase();

    // Upsert lead (pas d'erreur si email déjà existant)
    const { data: lead, error: dbErr } = await supabase
      .from("challenge_leads")
      .upsert(
        { prenom: prenomClean, email: emailClean, utm_source: source || null },
        { onConflict: "email", ignoreDuplicates: false }
      )
      .select("id, ebook_sent_at")
      .single();

    if (dbErr) throw dbErr;

    // Envoyer l'ebook uniquement si pas encore envoyé
    if (!lead.ebook_sent_at) {
      await sendEmail({
        to: emailClean,
        subject: `${prenomClean}, ton ebook est là 📖`,
        html: buildWelcomeEmail(prenomClean),
      });

      await supabase
        .from("challenge_leads")
        .update({ ebook_sent_at: new Date().toISOString() })
        .eq("id", lead.id);
    }

    return json({ success: true, message: "Ebook envoyé !" });
  } catch (err) {
    console.error(err);
    return json({ error: String(err) }, 500);
  }
});

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) throw new Error("RESEND_API_KEY manquant");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
}

function buildWelcomeEmail(prenom: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
  <tr><td style="background:#1A1A2E;padding:32px 40px;text-align:center;">
    <p style="color:#FF6B35;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">MR ATTRACTOR</p>
    <p style="color:#F5F0E8;font-size:22px;font-weight:700;margin:0;">Challenge 7 Jours</p>
  </td></tr>

  <tr><td style="background:#ffffff;padding:40px;">
    <p style="font-size:16px;color:#1A1A2E;margin:0 0 20px;">Bonjour <strong>${prenom}</strong>,</p>

    <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 24px;">
      Koffi, lui aussi, avait tout dans la tête. Il répondait à ses clients à 23h. Il oubliait des relances. Il perdait 1 000 000 FCFA par mois sans s'en rendre compte.
    </p>

    <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 28px;">
      Ce que tu vas lire dans l'ebook, c'est son histoire. Et la méthode qu'il a utilisée pour récupérer 18h par semaine en 6 semaines.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <a href="${EBOOK_URL}" style="background:#FF6B35;color:#ffffff;padding:16px 36px;border-radius:6px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">
        📖 Télécharger l'ebook gratuit
      </a>
    </div>

    <p style="font-size:14px;color:#666;line-height:1.7;margin:24px 0 0;">
      Demain, le Jour 1 t'attend. 15 minutes. Un exercice. Commence par là.
    </p>
  </td></tr>

  <tr><td style="background:#F5F0E8;padding:24px 40px;text-align:center;">
    <p style="font-size:12px;color:#888;margin:0;">
      Mac Arthur KOUASSI — Mr Attractor<br>
      <a href="https://agenceattractor.com" style="color:#FF6B35;">agenceattractor.com</a>
    </p>
  </td></tr>
</table>
</body>
</html>`;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

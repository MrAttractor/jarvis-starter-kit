// marketplace-signup — Inscription prestataire + envoi contrat CGV par email
// POST { nom, email, whatsapp, categorie_principale, sous_categorie, presentation,
//        pricing_type, pricing_details, zone, lien, photo_url }
// Retourne { success, message }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FROM_EMAIL = "Mac Arthur <bonjour@agenceattractor.com>";
const CGV_VERSION = "v1.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const body = await req.json();
    const { nom, email, whatsapp, categorie_principale, sous_categorie,
            presentation, pricing_type, pricing_details, zone, lien, photo_url } = body;

    if (!nom?.trim() || !email?.trim() || !whatsapp?.trim() || !categorie_principale || !sous_categorie) {
      return json({ error: "Champs obligatoires manquants : nom, email, whatsapp, categorie_principale, sous_categorie" }, 400);
    }

    const now = new Date();

    const { data: presta, error: dbErr } = await supabase
      .from("prestataires")
      .insert({
        nom: nom.trim(),
        email: email.trim().toLowerCase(),
        whatsapp: whatsapp.trim(),
        categorie_principale,
        sous_categorie,
        categorie: categorie_principale, // compatibilité ancienne colonne
        specialite: sous_categorie,
        presentation: presentation?.trim() || null,
        pricing_type: pricing_type || "detail",
        pricing_details: pricing_details || null,
        tarif_indicatif: pricing_type === "devis" ? "Sur devis" : (pricing_details?.montant ? `${pricing_details.montant} ${pricing_details.unite || ""}`.trim() : null),
        zone: zone || "CI",
        lien: lien?.trim() || null,
        photo_url: photo_url?.trim() || null,
        statut: "en_attente",
        cgv_accepted_at: now.toISOString(),
        cgv_version: CGV_VERSION,
      })
      .select("id")
      .single();

    if (dbErr) throw dbErr;

    await sendEmail({
      to: email.trim().toLowerCase(),
      subject: `Votre contrat Marketplace Attractor — signé le ${formatDate(now)}`,
      html: buildContratEmail(nom.trim(), now),
    });

    return json({ success: true, message: "Inscription enregistrée. Contrat envoyé par email." });
  } catch (err) {
    console.error("marketplace-signup error:", err);
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

function formatDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

function buildContratEmail(nom: string, date: Date): string {
  const dateStr = formatDate(date);
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">

  <tr><td style="background:#1A1714;padding:28px 36px;text-align:center;">
    <p style="color:#F25C05;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">MR ATTRACTOR</p>
    <p style="color:#FAF6F0;font-size:20px;font-weight:700;margin:0;">Marketplace Attractor</p>
    <p style="color:#FAF6F0;font-size:12px;margin:6px 0 0;opacity:.65;">Contrat d'engagement — ${CGV_VERSION}</p>
  </td></tr>

  <tr><td style="background:#ffffff;padding:36px;">
    <p style="font-size:15px;color:#1A1714;margin:0 0 20px;">Bonjour <strong>${nom}</strong>,</p>
    <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 20px;">
      Merci pour ton inscription sur la <strong>Marketplace Attractor</strong>. Tu trouveras ci-dessous le contrat d'engagement que tu as signé électroniquement.
    </p>

    <div style="background:#F5F0E8;border-radius:10px;padding:14px 18px;margin:0 0 24px;">
      <p style="font-size:12px;color:#F25C05;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Signature enregistrée</p>
      <p style="font-size:13px;color:#1A1714;margin:0;">Le <strong>${dateStr}</strong> par <strong>${nom}</strong></p>
      <p style="font-size:11px;color:#888;margin:6px 0 0;">Ce document constitue un contrat signé électroniquement au sens de l'article 1366 du Code civil français.</p>
    </div>

    <hr style="border:none;border-top:1px solid #e7e1d8;margin:24px 0;">

    <p style="font-size:13px;font-weight:700;color:#1A1714;letter-spacing:1px;text-transform:uppercase;margin:0 0 16px;">Conditions Générales de Vente — Marketplace Attractor (${CGV_VERSION})</p>

    <p style="font-size:13px;font-weight:700;color:#1A1714;margin:0 0 8px;">1. Parties</p>
    <p style="font-size:13px;color:#444;line-height:1.7;margin:0 0 16px;">
      Le présent contrat est conclu entre <strong>Mac Arthur Kouassi</strong>, entrepreneur individuel exerçant sous la marque <strong>Mr Attractor</strong>, SIRET 98377125400015, dont le siège est en Île-de-France (ci-après « Attractor »), et le prestataire inscrit sur la Marketplace Attractor (ci-après « le Prestataire »).
    </p>

    <p style="font-size:13px;font-weight:700;color:#1A1714;margin:0 0 8px;">2. Objet</p>
    <p style="font-size:13px;color:#444;line-height:1.7;margin:0 0 16px;">
      Le Prestataire souhaite rejoindre la Marketplace Attractor, plateforme mise à disposition par Attractor sur l'application Attractor Assists, afin de se rendre visible auprès des utilisateurs de ladite application. L'inscription est <strong>entièrement gratuite</strong>.
    </p>

    <p style="font-size:13px;font-weight:700;color:#1A1714;margin:0 0 8px;">3. Engagement qualité</p>
    <p style="font-size:13px;color:#444;line-height:1.7;margin:0 0 16px;">
      Le Prestataire s'engage à tenir les promesses affichées sur son profil : tarifs indiqués, délais annoncés, qualité des prestations décrites. Toute modification significative de son offre doit être signalée sans délai à Attractor.
    </p>

    <p style="font-size:13px;font-weight:700;color:#1A1714;margin:0 0 8px;">4. Interdiction des fausses promesses</p>
    <p style="font-size:13px;color:#444;line-height:1.7;margin:0 0 16px;">
      Toute information trompeuse, promesse non tenue ou comportement nuisant à la réputation de la Marketplace entraîne la <strong>suspension immédiate du profil sans préavis</strong>. Attractor se réserve le droit de supprimer définitivement le compte du Prestataire en cas de récidive ou de préjudice avéré causé à un utilisateur.
    </p>

    <p style="font-size:13px;font-weight:700;color:#1A1714;margin:0 0 8px;">5. Données personnelles (RGPD)</p>
    <p style="font-size:13px;color:#444;line-height:1.7;margin:0 0 4px;"><strong>Données collectées :</strong> nom/marque, email, numéro WhatsApp, zone géographique, présentation, tarifs, lien externe, photo.</p>
    <p style="font-size:13px;color:#444;line-height:1.7;margin:0 0 4px;"><strong>Finalité :</strong> affichage du profil sur la Marketplace Attractor, vérification avant publication, communication relative au compte.</p>
    <p style="font-size:13px;color:#444;line-height:1.7;margin:0 0 4px;"><strong>Base légale :</strong> exécution du présent contrat (art. 6.1.b RGPD).</p>
    <p style="font-size:13px;color:#444;line-height:1.7;margin:0 0 4px;"><strong>Durée de conservation :</strong> pendant toute la durée de l'inscription, puis 2 ans après désinscription.</p>
    <p style="font-size:13px;color:#444;line-height:1.7;margin:0 0 16px;"><strong>Droits :</strong> accès, rectification, effacement, portabilité, opposition — à exercer par email à <a href="mailto:bonjour@agenceattractor.com" style="color:#F25C05;">bonjour@agenceattractor.com</a>.</p>

    <p style="font-size:13px;font-weight:700;color:#1A1714;margin:0 0 8px;">6. Droit de retrait</p>
    <p style="font-size:13px;color:#444;line-height:1.7;margin:0 0 16px;">
      Le Prestataire peut demander sa désinscription à tout moment en envoyant un email à <a href="mailto:bonjour@agenceattractor.com" style="color:#F25C05;">bonjour@agenceattractor.com</a>. Le profil sera retiré de la Marketplace dans un délai de 48h ouvrées.
    </p>

    <p style="font-size:13px;font-weight:700;color:#1A1714;margin:0 0 8px;">7. Clause de signature électronique</p>
    <p style="font-size:13px;color:#444;line-height:1.7;margin:0 0 24px;">
      En cliquant « J'accepte et je m'inscris » dans l'application, le Prestataire reconnaît avoir lu et accepté l'intégralité des présentes Conditions Générales, lesquelles <strong>valent contrat signé électroniquement</strong> conformément à l'article 1366 du Code civil français et à l'article 5 de la Loi ivoirienne n°2013-546 relative aux transactions électroniques.
    </p>

    <div style="background:#FFF3EC;border:1.5px solid #F25C05;border-radius:10px;padding:14px 18px;text-align:center;">
      <p style="font-size:12px;color:#F25C05;font-weight:700;margin:0 0 4px;">SIGNATURE ÉLECTRONIQUE</p>
      <p style="font-size:13px;color:#1A1714;margin:0;">Accepté le <strong>${dateStr}</strong></p>
      <p style="font-size:13px;color:#1A1714;margin:4px 0 0;">Par : <strong>${nom}</strong></p>
      <p style="font-size:11px;color:#888;margin:6px 0 0;">Version CGV : ${CGV_VERSION} · Marketplace Attractor</p>
    </div>
  </td></tr>

  <tr><td style="background:#F5F0E8;padding:20px 36px;text-align:center;">
    <p style="font-size:12px;color:#888;margin:0;">
      Mac Arthur Kouassi — Mr Attractor · SIRET 98377125400015<br>
      <a href="https://agenceattractor.com" style="color:#F25C05;">agenceattractor.com</a>
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

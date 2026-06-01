// challenge-day — Sauvegarde la réponse d'un jour et envoie l'email nurturing.
// POST { email, prenom, jour: 1-7, ...data_du_jour }
// Retourne { success }

const FROM_EMAIL = "Mac Arthur <bonjour@agenceattractor.com>";
const ASSISTS_URL = "https://assists.agenceattractor.com";
const WA_URL = "https://wa.me/2250576877070?text=Challenge+7+Jours+terminé+✅+Je+veux+ma+session+offerte";

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
    const body = await req.json();
    const { email, prenom, jour, ...dayData } = body;

    if (!email || !jour) return json({ error: "email et jour requis" }, 400);

    const emailClean = email.trim().toLowerCase();
    const prenomClean = (prenom || "Entrepreneur").trim();
    const jourNum = parseInt(jour);

    // Récupérer ou créer le lead
    let leadId: string;
    const { data: existing } = await supabase
      .from("challenge_leads")
      .select("id")
      .eq("email", emailClean)
      .maybeSingle();

    if (existing) {
      leadId = existing.id;
    } else {
      const { data: newLead, error } = await supabase
        .from("challenge_leads")
        .insert({ prenom: prenomClean, email: emailClean })
        .select("id")
        .single();
      if (error) throw error;
      leadId = newLead.id;
    }

    // Sauvegarder la réponse (upsert)
    const { error: respErr } = await supabase
      .from("challenge_responses")
      .upsert(
        { lead_id: leadId, email: emailClean, jour: jourNum, data: dayData },
        { onConflict: "email,jour" }
      );
    if (respErr) throw respErr;

    // Envoyer l'email nurturing
    const emailHtml = buildNurturingEmail(prenomClean, jourNum, dayData);
    const subject = SUBJECTS[jourNum] || `Jour ${jourNum} — Bien joué ${prenomClean}`;

    await sendEmail({ to: emailClean, subject, html: emailHtml });

    await supabase
      .from("challenge_responses")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("lead_id", leadId)
      .eq("jour", jourNum);

    return json({ success: true });
  } catch (err) {
    console.error(err);
    return json({ error: String(err) }, 500);
  }
});

const SUBJECTS: Record<number, string> = {
  1: "Tu viens de trouver tes fuites 🔍",
  2: "Ta première procédure est née ✍️",
  3: "Tes clients ne se perdront plus 🎯",
  4: "Voilà ce que tu perdais vraiment 💰",
  5: "Ton système est en train de naître ⚡",
  6: "Tu mesures ce que tu as récupéré 📊",
  7: "Ta session de coaching t'attend 🏆",
};

function buildNurturingEmail(prenom: string, jour: number, data: Record<string, string>): string {
  const contents: Record<number, string> = {
    1: `
      <p>Koffi aussi a fait cet inventaire.</p>
      <p>Il a listé 11 tâches répétitives. Il a réalisé qu'il perdait 20h par semaine sur des choses qu'une procédure ou un assistant pouvait gérer.</p>
      <p>Ce que tu viens de faire, c'est exactement ça : <strong>voir ce qui te coûte du temps avant de chercher à aller plus vite.</strong></p>
      <p>Demain — Jour 2 — tu vas prendre la tâche la plus lourde de ta liste et en faire ta première procédure écrite. En 20 minutes.</p>
      <blockquote style="border-left:3px solid #FF6B35;padding-left:16px;color:#666;font-style:italic;">"Ce qui reste dans ta tête t'enchaîne. Ce qui est écrit te libère." — Monsieur S.</blockquote>
    `,
    2: `
      <p>Tu viens de créer la première procédure écrite de ton entreprise.</p>
      <p>Monsieur S. a dit à Koffi : "Tu viens de faire en 20 minutes ce que 95% des entrepreneurs ne font jamais."</p>
      <p>C'est vrai. La plupart gardent tout dans la tête. Résultat : dès qu'ils sont absents, tout s'arrête.</p>
      <p>Toi, tu as commencé à construire une entreprise qui peut tourner sans toi.</p>
      <p><strong>Demain — Jour 3</strong> : le parcours client. C'est là que se cachent tes ventes perdues.</p>
    `,
    3: `
      <p>Koffi perdait des clients à chaque étape de son parcours — sans s'en rendre compte.</p>
      <p>Entre le premier message et le paiement, il y avait des silences, des oublis, des relances jamais faites.</p>
      <p>En cartographiant son parcours client comme tu viens de le faire, il a trouvé 3 étapes où tout s'effondrait. <strong>Il les a documentées. Le lendemain, il n'en perdait plus.</strong></p>
      <p><strong>Demain — Jour 4</strong> : on calcule ce que tu perds vraiment. Les chiffres vont te surprendre.</p>
    `,
    4: `
      <p>Koffi avait 8 prospects par semaine. 5 non relancés dans les 48h. Panier moyen 50 000 FCFA.</p>
      <p>Résultat : 1 000 000 FCFA perdus par mois. Pas par manque de clients — par manque de système.</p>
      ${data.prospects_non_relances ? `<p>Toi, tu as ${data.prospects_non_relances} prospects non relancés. Tu vois le calcul.</p>` : ""}
      <p>La bonne nouvelle : ce n'est pas un problème de volonté. C'est un problème d'organisation. Et ça, ça se règle.</p>
      <p><strong>Demain — Jour 5</strong> : identifier ce qu'un assistant (humain ou IA) peut faire à ta place. C'est là que ça devient concret.</p>
    `,
    5: `
      <p>Monsieur S. a posé une question à Koffi : "Combien d'heures tu passes à confirmer des commandes et répondre aux mêmes questions chaque jour ?"</p>
      <p>Koffi a réfléchi. La réponse : 4h. Tous les jours.</p>
      <p>Tu viens d'identifier ce que tu peux déléguer. Ce sont exactement ces tâches qu'un bras droit IA peut gérer à ta place — <strong>pendant que tu te concentres sur ce que toi seul peux faire.</strong></p>
      <p style="margin-top:20px;">
        <a href="${ASSISTS_URL}" style="color:#FF6B35;font-weight:700;">→ Découvre Attractor Assists — ton bras droit IA gratuit</a>
      </p>
      <p><strong>Demain — Jour 6</strong> : on mesure ce qui a changé depuis le Jour 1.</p>
    `,
    6: `
      <p>6 semaines après avoir commencé la méthode, Koffi avait récupéré 18h par semaine. Il relevançait ×11 plus de prospects. Il rentrait à 17h.</p>
      <p>Tu es au Jour 6. Tu ne fais ça que depuis quelques jours — mais tu as déjà posé les fondations que la plupart des entrepreneurs n'ont pas après 5 ans.</p>
      <p><strong>Demain — Jour 7</strong> : la vision. Et ta session de coaching offerte avec Mac Arthur.</p>
    `,
    7: `
      <p>${prenom}, tu as fait ce que 95% des entrepreneurs ne font jamais.</p>
      <p>Tu as mis par écrit. Structuré. Mesuré. Projeté.</p>
      <p>Ta session de coaching de 45 minutes est prête. On va prendre ce que tu as construit cette semaine et aller plus loin — ensemble.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${WA_URL}" style="background:#25D366;color:#ffffff;padding:16px 36px;border-radius:6px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">
          🎯 Réserver ma session offerte (WhatsApp)
        </a>
      </div>
      <p style="text-align:center;font-size:13px;color:#888;">Session 45 min · Gratuite · Disponible cette semaine</p>
      <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
      <p style="font-size:14px;color:#666;">Et si tu veux continuer à avancer sans attendre, Attractor Assists — ton bras droit IA — est déjà là.</p>
      <p style="text-align:center;margin-top:16px;">
        <a href="${ASSISTS_URL}" style="color:#FF6B35;font-weight:700;font-size:15px;">→ Accéder à Attractor Assists gratuitement</a>
      </p>
    `,
  };

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
  <tr><td style="background:#1A1A2E;padding:24px 40px;text-align:center;">
    <p style="color:#FF6B35;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 4px;">MR ATTRACTOR</p>
    <p style="color:#F5F0E8;font-size:13px;margin:0;opacity:.7;">Challenge 7 Jours — Jour ${jour}</p>
  </td></tr>

  <tr><td style="background:#ffffff;padding:40px;">
    <p style="font-size:16px;color:#1A1A2E;margin:0 0 24px;">Bien joué <strong>${prenom}</strong>.</p>
    <div style="font-size:15px;color:#444;line-height:1.8;">
      ${contents[jour] || `<p>Tu avances. Continue demain.</p>`}
    </div>
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

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) throw new Error("RESEND_API_KEY manquant");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });

  if (!res.ok) throw new Error(`Resend error: ${await res.text()}`);
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

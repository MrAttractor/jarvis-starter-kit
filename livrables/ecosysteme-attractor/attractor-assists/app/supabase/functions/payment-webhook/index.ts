// payment-webhook — Notification silencieuse PaiementPro
// Appelé par XPaye après chaque transaction (succès ou échec).
// Met à jour le statut du paiement et, si succès, passe le plan de l'utilisateur.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// PaiementPro peut envoyer JSON ou form-urlencoded
async function parseBody(req: Request): Promise<Record<string, string>> {
  const ct = req.headers.get("Content-Type") ?? "";
  if (ct.includes("application/json")) return req.json();
  const text = await req.text();
  return Object.fromEntries(new URLSearchParams(text));
}

function isSuccess(body: Record<string, string>): boolean {
  const s = String(body.status ?? body.payment_status ?? "").toUpperCase();
  const ok = ["SUCCESS", "APPROVED", "PAID", "COMPLETED", "CONFIRMED"];
  if (ok.includes(s)) return true;
  // Certains gateways retournent success: true / 1
  if (body.success === "true" || body.success === "1" || String(body.success) === "true") return true;
  // PaiementPro (XPaye) signale le succès par responsecode "0" (parfois "00").
  const rc = String(body.responsecode ?? body.responseCode ?? body.response_code ?? "").trim();
  if (rc === "0" || rc === "00") return true;
  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 204 });

  let body: Record<string, string> = {};
  try { body = await parseBody(req); } catch { /* graceful */ }

  const reference = body.referenceNumber ?? body.reference_number ?? body.reference ?? "";
  if (!reference) {
    console.error("payment-webhook: pas de référence dans le payload", body);
    return new Response("Missing reference", { status: 400 });
  }

  const success = isSuccess(body);
  const newStatus = success ? "success" : "failed";

  // Vente de site — paiement rattaché à un devis (devis-payer). Préfixe DEVIS-.
  if (reference.startsWith("DEVIS-")) {
    const { data: pay } = await supabase
      .from("devis_paiements")
      .select("*")
      .eq("reference", reference)
      .single();
    if (!pay) {
      console.error("payment-webhook: paiement de devis introuvable", reference);
      return new Response("Payment not found", { status: 404 });
    }

    console.log(`payment-webhook DEVIS raw: ${JSON.stringify(body).slice(0, 600)}`);
    await supabase.from("devis_paiements").update({
      statut:  newStatus,
      paye_at: success ? new Date().toISOString() : null,
      gateway_response: body,
      callback_at: new Date().toISOString(),
    }).eq("reference", reference);

    if (success && pay.devis_id) {
      // Synthèse sur le devis : total réglé, statut, solde restant dû.
      const { data: devis } = await supabase
        .from("devis_web").select("total, devise, montant_paye").eq("id", pay.devis_id).single();
      const totalNum = Number(devis?.total ?? 0);
      const estEuro  = String(devis?.devise || "").toUpperCase().match(/€|EUR/);
      const totalXof = estEuro ? Math.round(totalNum * 656) : Math.round(totalNum);
      const dejaPaye = Number(devis?.montant_paye ?? 0);
      const montantPaye = dejaPaye + Number(pay.montant);
      const soldeDu  = Math.max(0, totalXof - montantPaye);
      const statutDevis = soldeDu <= 0 ? "paye_total" : "acompte_paye";

      await supabase.from("devis_web").update({
        montant_paye:    montantPaye,
        solde_du:        soldeDu,
        paiement_statut: statutDevis,
      }).eq("id", pay.devis_id);

      // Alerte agence : paiement reçu, démarrer les travaux.
      const resendKey = Deno.env.get("RESEND_API_KEY");
      const notifyTo  = Deno.env.get("NOTIFY_DEVIS_EMAIL") || "hello@agenceattractor.com";
      if (resendKey) {
        const fcfa = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
        const reste = soldeDu > 0 ? `<p style="margin:6px 0 0;font-size:14px;color:#B45309">Solde restant dû : <b>${fcfa(soldeDu)}</b> (relance à programmer).</p>` : `<p style="margin:6px 0 0;font-size:14px;color:#1E9E52"><b>Payé en totalité.</b></p>`;
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Mr Attractor <noreply@agenceattractor.com>",
            to: [notifyTo],
            subject: `Paiement reçu — ${pay.payer_nom || "Client"} · ${fcfa(Number(pay.montant))} (${pay.type})`,
            html: `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1A1714">
              <h2 style="color:#1E9E52">Paiement reçu, tu peux démarrer les travaux</h2>
              <p style="font-size:15px"><b>${pay.payer_nom || "Client"}</b> · ${pay.payer_contact || "—"}</p>
              <p style="font-size:15px;margin:2px 0">Montant réglé : <b>${fcfa(Number(pay.montant))}</b> — ${pay.type === "acompte" ? "acompte (50 %)" : "totalité"} via ${pay.channel}</p>
              ${reste}
              <p style="font-size:12px;color:#9C9189;margin-top:16px">Référence ${reference} — notification automatique du tunnel de vente</p>
            </div>`,
            text: `Paiement reçu de ${pay.payer_nom || "Client"} (${pay.payer_contact || "—"}) : ${fcfa(Number(pay.montant))} (${pay.type}, ${pay.channel}). ${soldeDu > 0 ? "Solde dû : " + fcfa(soldeDu) : "Payé en totalité."} Réf ${reference}.`,
          }),
        }).catch(() => {});
      }
    }

    console.log(`payment-webhook: devis_paiements reference=${reference} statut=${newStatus}`);
    return new Response("OK", { status: 200 });
  }

  // Référence Pilotage (préfixe distinct) — pas de compte utilisateur à activer
  if (reference.startsWith("PILOTAGE-")) {
    const { data: pilotagePayment } = await supabase
      .from("pilotage_payments")
      .select("*")
      .eq("reference", reference)
      .single();

    if (!pilotagePayment) {
      console.error("payment-webhook: paiement pilotage introuvable", reference);
      return new Response("Payment not found", { status: 404 });
    }

    await supabase.from("pilotage_payments").update({
      statut:           newStatus,
      gateway_response: body,
      updated_at:       new Date().toISOString(),
    }).eq("reference", reference);

    console.log(`payment-webhook: pilotage_payments reference=${reference} statut=${newStatus}`);
    return new Response("OK", { status: 200 });
  }

  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("reference", reference)
    .single();

  if (!payment) {
    console.error("payment-webhook: paiement introuvable", reference);
    return new Response("Payment not found", { status: 404 });
  }

  await supabase.from("payments").update({
    status:           newStatus,
    gateway_response: body,
    updated_at:       new Date().toISOString(),
  }).eq("reference", reference);

  if (success) {
    const planTier =
      ["bras_droit", "growth", "growth_eu"].includes(payment.plan_id) ? "growth" :
      payment.plan_id === "pro" ? "pro" : "gratuit";

    await supabase.from("profiles").update({
      plan_code: payment.plan_id,
      plan_tier: planTier,
    }).eq("id", payment.user_id);

    console.log(`payment-webhook: plan_code=${payment.plan_id} plan_tier=${planTier} activé pour user=${payment.user_id}`);
  }

  return new Response("OK", { status: 200 });
});

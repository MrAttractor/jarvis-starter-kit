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
  const s = (body.status ?? body.payment_status ?? "").toUpperCase();
  const ok = ["SUCCESS", "APPROVED", "PAID", "COMPLETED", "CONFIRMED"];
  if (ok.includes(s)) return true;
  // Certains gateways retournent success: true / 1
  if (body.success === "true" || body.success === "1") return true;
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

  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("reference", reference)
    .single();

  if (!payment) {
    console.error("payment-webhook: paiement introuvable", reference);
    return new Response("Payment not found", { status: 404 });
  }

  const success = isSuccess(body);
  const newStatus = success ? "success" : "failed";

  await supabase.from("payments").update({
    status:           newStatus,
    gateway_response: body,
    updated_at:       new Date().toISOString(),
  }).eq("reference", reference);

  if (success) {
    await supabase.from("profiles").update({
      plan_code: payment.plan_id,
    }).eq("id", payment.user_id);

    console.log(`payment-webhook: plan_code=${payment.plan_id} activé pour user=${payment.user_id}`);
  }

  return new Response("OK", { status: 200 });
});

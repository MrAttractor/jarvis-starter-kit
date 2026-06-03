// init-payment — Initialise un paiement XPaye (PaiementPro)
// POST { plan_id: 'growth'|'team', channel: 'WAVECI'|'MOMOCI'|'OMCIV2'|'CARD' }
// Retourne { url, reference }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

const PLANS: Record<string, { amount_xof: number; amount_eur: number; label: string }> = {
  growth: { amount_xof: 9900,  amount_eur: 15, label: "Attractor Growth — Abonnement mensuel" },
  team:   { amount_xof: 25500, amount_eur: 39, label: "Attractor Team — Abonnement mensuel"   },
};

const CI_CHANNELS = ["WAVECI", "MOMOCI", "OMCIV2"];

// Sandbox : sandbox.paiementpro.net — Production : www.paiementpro.net
const PP_SANDBOX_URL = "https://sandbox.paiementpro.net/webservice/onlinepayment/init/curl-init.php";
const PP_PROD_URL    = "https://www.paiementpro.net/webservice/onlinepayment/js/initialize/initialize.php";
const RETURN_URL     = "https://assists.agenceattractor.com/?payment_done=1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Non autorisé" }, 401);

    // Un seul client service-role — validate le token utilisateur via getUser(jwt)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      console.error("auth error:", authErr?.message);
      return json({ error: "Session expirée ou invalide" }, 401);
    }

    const body = await req.json();
    const { plan_id, channel } = body ?? {};

    if (!plan_id || !channel) return json({ error: "plan_id et channel requis" }, 400);

    const plan = PLANS[plan_id];
    if (!plan) return json({ error: `Plan inconnu : ${plan_id}` }, 400);

    const validChannels = [...CI_CHANNELS, "CARD"];
    if (!validChannels.includes(channel)) return json({ error: `Channel invalide : ${channel}` }, 400);

    // Profil (optionnel — pas de hard-fail)
    const { data: profile } = await supabase
      .from("profiles")
      .select("prenom, phone")
      .eq("id", user.id)
      .maybeSingle();

    // PaiementPro est un gateway CI — toujours en FCFA (XOF), canal CARD inclus
    const amount       = plan.amount_xof;
    const currencyCode = "952"; // XOF
    const reference    = `ATR-${Date.now()}-${user.id.slice(0, 8).toUpperCase()}`;
    const merchantId   = Deno.env.get("XPAYE_MERCHANT_ID") ?? "PP-F422";
    const isSandbox    = merchantId === "PP-F422";
    const ppURL        = isSandbox ? PP_SANDBOX_URL : PP_PROD_URL;
    const notifURL     = `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook`;

    // Sauvegarde référence
    const { error: insertErr } = await supabase.from("payments").insert({
      user_id:  user.id,
      plan_id,
      reference,
      channel,
      amount,
      currency: "XOF",
      status:   "pending",
    });
    if (insertErr) console.error("payments insert:", insertErr.message);

    // Appel PaiementPro
    console.log(`init-payment: appel ${ppURL} merchantId=${merchantId} amount=${amount} channel=${channel}`);
    const ppRes = await fetch(ppURL, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        merchantId,
        amount,
        description:         plan.label,
        channel,
        countryCurrencyCode: currencyCode,
        referenceNumber:     reference,
        customerEmail:       user.email ?? "",
        customerFirstName:   profile?.prenom ?? "Client",
        customerLastname:    "Attractor",
        customerPhoneNumber: profile?.phone ?? "00000000",
        notificationURL:     notifURL,
        returnURL:           `${RETURN_URL}&plan=${plan_id}`,
        returnContext:       JSON.stringify({ reference, plan_id }),
      }),
    });

    const ppData = await ppRes.json();
    console.log("paiementpro response:", JSON.stringify(ppData));

    if (!ppData.success || !ppData.url) {
      await supabase.from("payments").update({ status: "failed" }).eq("reference", reference);
      return json({ error: ppData.message ?? "Initialisation échouée côté gateway" }, 400);
    }

    return json({ url: ppData.url, reference });

  } catch (e) {
    console.error("unhandled:", e?.message ?? String(e));
    return json({ error: e?.message ?? "Erreur interne" }, 500);
  }
});

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

// Sandbox PaiementPro — remplacer par l'URL prod quand le compte live est actif
const PP_URL = "https://sandbox.paiementpro.net/webservice/onlinepayment/init/curl-init.php";
const RETURN_URL = "https://assists.agenceattractor.com/?payment_done=1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Non autorisé" }, 401);

  const supaUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const supaAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: { user } } = await supaUser.auth.getUser();
  if (!user) return json({ error: "Non autorisé" }, 401);

  let body: { plan_id?: string; channel?: string };
  try { body = await req.json(); } catch { return json({ error: "Corps invalide" }, 400); }

  const { plan_id, channel } = body;
  if (!plan_id || !channel) return json({ error: "plan_id et channel requis" }, 400);

  const plan = PLANS[plan_id];
  if (!plan) return json({ error: "Plan inconnu" }, 400);

  const validChannels = [...CI_CHANNELS, "CARD"];
  if (!validChannels.includes(channel)) return json({ error: "Channel invalide" }, 400);

  const { data: profile } = await supaAdmin
    .from("profiles")
    .select("prenom, phone")
    .eq("id", user.id)
    .single();

  const isCIChannel = CI_CHANNELS.includes(channel);
  const amount          = isCIChannel ? plan.amount_xof : plan.amount_eur;
  const currencyCode    = isCIChannel ? "952" : "978"; // XOF | EUR
  const reference       = `ATR-${Date.now()}-${user.id.slice(0, 8).toUpperCase()}`;
  const merchantId      = Deno.env.get("XPAYE_MERCHANT_ID") ?? "PP-F422";
  const notifURL        = `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook`;

  // Sauvegarde de la référence avant d'appeler le gateway
  await supaAdmin.from("payments").insert({
    user_id:   user.id,
    plan_id,
    reference,
    channel,
    amount,
    currency:  isCIChannel ? "XOF" : "EUR",
    status:    "pending",
  });

  // Appel PaiementPro
  let ppData: { success: boolean; url?: string; message?: string };
  try {
    const ppRes = await fetch(PP_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchantId,
        amount,
        description:          plan.label,
        channel,
        countryCurrencyCode:  currencyCode,
        referenceNumber:      reference,
        customerEmail:        user.email,
        customerFirstName:    profile?.prenom ?? "Client",
        customerLastname:     "Attractor",
        customerPhoneNumber:  profile?.phone ?? "",
        notificationURL:      notifURL,
        returnURL:            `${RETURN_URL}&plan=${plan_id}`,
        returnContext:        JSON.stringify({ reference, plan_id }),
      }),
    });
    ppData = await ppRes.json();
  } catch (e) {
    await supaAdmin.from("payments").update({ status: "failed" }).eq("reference", reference);
    return json({ error: "Erreur de connexion au gateway" }, 502);
  }

  if (!ppData.success || !ppData.url) {
    await supaAdmin.from("payments").update({ status: "failed" }).eq("reference", reference);
    return json({ error: ppData.message ?? "Initialisation échouée" }, 400);
  }

  return json({ url: ppData.url, reference });
});

// init-pilotage-payment — Initialise un paiement XPaye (PaiementPro) à partir
// d'un devis du Pilotage externe (demo.agenceattractor.com/pilotage).
// Pas d'authentification utilisateur : outil interne à Mac Arthur, anon key.
// POST { devis_id, percentage (ex: 50), channel: 'WAVECI'|'MOMOCI'|'OMCIV2'|'CARD' }
// Retourne { url, reference, montant }

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

// PaiementPro production — décision explicite : ce flux Pilotage tourne toujours
// en production (jamais sandbox), indépendamment du flag XPAYE_SANDBOX utilisé
// par init-payment pour les abonnements Assists.
const PP_PROD_URL = "https://www.paiementpro.net/webservice/onlinepayment/js/initialize/initialize.php";
const RETURN_URL  = "https://demo.agenceattractor.com/pilotage/?payment_done=1";

const CI_CHANNELS = ["WAVECI", "MOMOCI", "OMCIV2"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { devis_id, percentage, channel } = body ?? {};

    if (!devis_id) return json({ error: "devis_id requis" }, 400);
    const pct = Number(percentage);
    if (!pct || pct <= 0 || pct > 100) return json({ error: "percentage invalide (1-100)" }, 400);

    const validChannels = [...CI_CHANNELS, "CARD"];
    if (!channel || !validChannels.includes(channel)) return json({ error: `channel invalide : ${channel}` }, 400);

    const { data: devis, error: devisErr } = await supabase
      .from("pilotage_devis")
      .select("*, pilotage_pipeline(nom, contact)")
      .eq("id", devis_id)
      .single();
    if (devisErr || !devis) return json({ error: "Devis introuvable" }, 404);

    // PaiementPro (XPaye) est un gateway Côte d'Ivoire, uniquement en FCFA.
    if (devis.devise !== "FCFA") {
      return json({ error: "Paiement XPaye disponible uniquement pour les devis en FCFA (zone Côte d'Ivoire)" }, 400);
    }
    if (!devis.setup_ht) return json({ error: "Le devis n'a pas de montant de mise en place chiffré" }, 400);

    const montant = Math.round(devis.setup_ht * pct / 100);
    const dossier = devis.pilotage_pipeline;
    const reference = `PILOTAGE-${Date.now()}-${devis_id.slice(0, 8).toUpperCase()}`;
    const merchantId = Deno.env.get("XPAYE_MERCHANT_ID") ?? "PP-F422";
    const notifURL = `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook`;

    const { error: insertErr } = await supabase.from("pilotage_payments").insert({
      dossier_id: devis.dossier_id,
      devis_id,
      reference,
      montant,
      percentage: pct,
      channel,
      statut: "pending",
    });
    if (insertErr) return json({ error: insertErr.message }, 500);

    const ppRes = await fetch(PP_PROD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        merchantId,
        amount: montant,
        description: `${dossier?.nom ?? "Client"} — ${devis.niveau ?? devis.famille} (${pct}%)`,
        channel,
        countryCurrencyCode: "952", // XOF
        referenceNumber: reference,
        customerEmail: "",
        customerFirstName: dossier?.nom ?? "Client",
        customerLastname: "Attractor",
        customerPhoneNumber: (dossier?.contact ?? "").replace(/[\s+\-()]/g, "") || "00000000",
        notificationURL: notifURL,
        returnURL: RETURN_URL,
        returnContext: JSON.stringify({ reference, devis_id }),
      }),
    });

    const ppData = await ppRes.json();
    if (!ppData.success || !ppData.url) {
      await supabase.from("pilotage_payments").update({ statut: "failed", gateway_response: ppData }).eq("reference", reference);
      return json({ error: ppData.message ?? "Initialisation échouée côté gateway" }, 400);
    }

    return json({ url: ppData.url, reference, montant });
  } catch (e) {
    return json({ error: e?.message ?? "Erreur interne" }, 500);
  }
});

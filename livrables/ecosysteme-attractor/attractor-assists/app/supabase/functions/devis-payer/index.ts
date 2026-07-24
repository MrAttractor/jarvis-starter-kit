// devis-payer — Génère un lien de paiement XPaye (PaiementPro) pour un devis
// accepté (devis_web). Public (no-verify-jwt) : le prospect n'a pas de compte.
// Le montant n'est JAMAIS reçu du client, il est recalculé côté serveur depuis
// le devis (acompte = 50 %, total = 100 %) — impossible de le falsifier.
//
// POST { devis_id, montant_type: 'acompte'|'total', channel: 'WAVECI'|'MOMOCI'|'OMCIV2'|'CARD' }
// Retour { url, reference, montant }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// PaiementPro (XPaye) — même passerelle que init-payment.
const PP_SANDBOX_URL = "https://sandbox.paiementpro.net/webservice/onlinepayment/init/curl-init.php";
const PP_PROD_URL    = "https://www.paiementpro.net/webservice/onlinepayment/js/initialize/initialize.php";
const RETURN_URL     = "https://demo.agenceattractor.com/commander/?paye=1";
const VALID_CHANNELS = ["WAVECI", "MOMOCI", "OMCIV2", "CARD"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const { devis_id, montant_type, channel } = (await req.json()) ?? {};
    if (!devis_id) return json({ error: "devis_id requis" }, 400);
    if (montant_type !== "acompte" && montant_type !== "total")
      return json({ error: "montant_type doit être 'acompte' ou 'total'" }, 400);
    if (!VALID_CHANNELS.includes(channel)) return json({ error: `channel invalide : ${channel}` }, 400);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Le devis fait foi : montant recalculé serveur, jamais reçu du client.
    const { data: devis, error: dErr } = await supabase
      .from("devis_web")
      .select("id, numero, nom, contact, total, devise, projet")
      .eq("id", devis_id)
      .single();
    if (dErr || !devis) return json({ error: "Devis introuvable" }, 404);

    const totalNum = Number(devis.total);
    if (!totalNum || totalNum <= 0) return json({ error: "Ce devis n'a pas de montant chiffrable" }, 400);

    // La passerelle encaisse en FCFA (XOF). Si le devis est libellé en euros, on convertit.
    const devise = String(devis.devise || "").toUpperCase();
    const estEuro = devise.includes("€") || devise.includes("EUR");
    const totalXof = estEuro ? Math.round(totalNum * 656) : Math.round(totalNum);
    const montant  = montant_type === "acompte" ? Math.round(totalXof / 2) : totalXof;

    const reference = `DEVIS-${String(devis.id).slice(0, 8).toUpperCase()}-${Date.now()}`;
    const label = `${montant_type === "acompte" ? "Acompte" : "Paiement"} — ${devis.projet || devis.numero || "Site web"} (Mr Attractor)`;

    // Enregistrement de la tentative AVANT l'appel passerelle (traçabilité).
    const { error: insErr } = await supabase.from("devis_paiements").insert({
      devis_id: devis.id,
      reference,
      type: montant_type,
      montant,
      devise: "XOF",
      channel,
      statut: "pending",
      payer_nom: devis.nom ?? null,
      payer_contact: devis.contact ?? null,
    });
    if (insErr) return json({ error: `Enregistrement paiement : ${insErr.message}` }, 500);

    const merchantId = Deno.env.get("XPAYE_MERCHANT_ID") ?? "PP-F422";
    const isSandbox  = Deno.env.get("XPAYE_SANDBOX") === "true";
    const ppURL      = isSandbox ? PP_SANDBOX_URL : PP_PROD_URL;
    const notifURL   = `${SUPABASE_URL}/functions/v1/payment-webhook`;
    const waNum      = String(devis.contact || "").replace(/[^\d]/g, "").slice(-10) || "00000000";

    const ppRes = await fetch(ppURL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        merchantId,
        amount: montant,
        description:         label,
        channel,
        countryCurrencyCode: "952", // XOF
        referenceNumber:     reference,
        customerEmail:       "client@agenceattractor.com",
        customerFirstName:   devis.nom ?? "Client",
        customerLastname:    "Attractor",
        customerPhoneNumber: waNum,
        notificationURL:     notifURL,
        returnURL:           `${RETURN_URL}&ref=${reference}`,
        returnContext:       JSON.stringify({ reference, devis_id: devis.id, montant_type }),
      }),
    });

    const ppData = await ppRes.json().catch(() => ({} as Record<string, unknown>));
    if (!ppData?.success || !ppData?.url) {
      await supabase.from("devis_paiements").update({ statut: "failed" }).eq("reference", reference);
      console.error("devis-payer: échec passerelle", reference, JSON.stringify(ppData).slice(0, 300));
      return json({ error: ppData?.message ?? "Initialisation du paiement échouée côté passerelle" }, 400);
    }

    return json({ url: ppData.url, reference, montant });
  } catch (e) {
    return json({ error: (e as Error)?.message ?? "Erreur interne" }, 500);
  }
});

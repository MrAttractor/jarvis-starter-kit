// J'Envoie Express — Tournée du livreur CI
// Accès read-only + marquage "livré" pour un voyage donné, sans login.
// Le lien partagé au livreur porte l'id du voyage (UUID non devinable).
// Toute la logique passe par la service role : aucune table n'est exposée en public.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const UUID_RE = /^[0-9a-fA-F-]{36}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const { voyage, action, colis } = await req.json();
    if (!voyage || !UUID_RE.test(voyage)) return json({ ok: false, error: "voyage invalide" }, 400);

    const h = {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    };

    // --- Marquer un colis comme livré (borné au voyage + livraison à domicile) ---
    if (action === "livre") {
      if (!colis || !UUID_RE.test(colis)) return json({ ok: false, error: "colis invalide" }, 400);
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/je_colis?id=eq.${colis}&voyage_id=eq.${voyage}&livraison_souhaitee=eq.true`,
        { method: "PATCH", headers: { ...h, Prefer: "return=representation" }, body: JSON.stringify({ statut: "livre" }) },
      );
      const upd = await r.json();
      if (!Array.isArray(upd) || upd.length === 0) return json({ ok: false, error: "colis introuvable pour ce voyage" }, 404);
      return json({ ok: true, colis: upd[0].id });
    }

    // --- Lister la tournée (par défaut) ---
    const vr = await fetch(`${SUPABASE_URL}/rest/v1/je_voyages?id=eq.${voyage}&select=id,route,date_depart,date_arrivee`, { headers: h });
    const vlist = await vr.json();
    if (!Array.isArray(vlist) || vlist.length === 0) return json({ ok: false, error: "voyage introuvable" }, 404);

    const cr = await fetch(
      `${SUPABASE_URL}/rest/v1/je_colis?voyage_id=eq.${voyage}&livraison_souhaitee=eq.true` +
        `&select=id,numero,quartier_abidjan,contact_reception,articles,prix_livraison,statut,nom_expediteur,wa_expediteur,je_clients(nom,whatsapp)` +
        `&order=quartier_abidjan.asc`,
      { headers: h },
    );
    const colisList = await cr.json();

    return json({ ok: true, voyage: vlist[0], colis: Array.isArray(colisList) ? colisList : [] });
  } catch (err) {
    return json({ ok: false, error: String(err) }, 200);
  }
});

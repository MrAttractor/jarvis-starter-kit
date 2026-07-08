// J'Envoie Express — Tournée du livreur CI (livraison OU collecte selon le sens du voyage)
// Sans login : le lien partagé porte l'id du voyage (UUID non devinable).
// - Voyage Paris → Abidjan (ORY_ABJ) : tournée de LIVRAISON à domicile (colis livraison_souhaitee),
//   le livreur marque "livre".
// - Voyage Abidjan → Paris (ABJ_ORY) : tournée de COLLECTE chez l'expéditeur (colis collecte_domicile),
//   le livreur marque "collecte", tout est regroupé chez Jean Yves à Faya.
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

    // Sens du voyage → mode de tournée
    const vr = await fetch(`${SUPABASE_URL}/rest/v1/je_voyages?id=eq.${voyage}&select=id,route,date_depart,date_arrivee`, { headers: h });
    const vlist = await vr.json();
    if (!Array.isArray(vlist) || vlist.length === 0) return json({ ok: false, error: "voyage introuvable" }, 404);
    const voy = vlist[0];
    const mode = voy.route === "ABJ_ORY" ? "collecte" : "livraison";

    // Filtre + statut cible selon le mode
    const flag = mode === "collecte" ? "collecte_domicile" : "livraison_souhaitee";
    const targetStatut = mode === "collecte" ? "collecte" : "livre";

    // --- Marquer un colis (livré ou collecté) ---
    if (action === "mark") {
      if (!colis || !UUID_RE.test(colis)) return json({ ok: false, error: "colis invalide" }, 400);
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/je_colis?id=eq.${colis}&voyage_id=eq.${voyage}&${flag}=eq.true`,
        { method: "PATCH", headers: { ...h, Prefer: "return=representation" }, body: JSON.stringify({ statut: targetStatut }) },
      );
      const upd = await r.json();
      if (!Array.isArray(upd) || upd.length === 0) return json({ ok: false, error: "colis introuvable pour ce voyage" }, 404);
      return json({ ok: true, colis: upd[0].id, statut: targetStatut });
    }

    // --- Lister la tournée (par défaut) ---
    const orderCol = mode === "collecte" ? "quartier_collecte" : "quartier_abidjan";
    const cr = await fetch(
      `${SUPABASE_URL}/rest/v1/je_colis?voyage_id=eq.${voyage}&${flag}=eq.true` +
        `&select=id,numero,quartier_abidjan,quartier_collecte,contact_reception,articles,prix_livraison,statut,nom_expediteur,wa_expediteur,je_clients(nom,whatsapp)` +
        `&order=${orderCol}.asc`,
      { headers: h },
    );
    const colisList = await cr.json();

    return json({ ok: true, mode, voyage: voy, colis: Array.isArray(colisList) ? colisList : [] });
  } catch (err) {
    return json({ ok: false, error: String(err) }, 200);
  }
});

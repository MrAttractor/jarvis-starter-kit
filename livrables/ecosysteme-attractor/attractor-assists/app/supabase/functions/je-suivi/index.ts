// J'Envoie Express — Suivi public d'un colis par numéro exact.
//
// Remplace la lecture directe de je_colis depuis le navigateur. L'ancienne
// policy "je_public_tracking" (SELECT using true) laissait n'importe qui, avec
// la clé anon (publique par nature), lister TOUS les colis sans connaître aucun
// numéro : noms, WhatsApp, adresses de domicile, montants. Fuite RGPD.
//
// Ici : numéro EXACT obligatoire (pas de recherche partielle), et seuls les
// champs de suivi sortent — jamais le nom de l'expéditeur ni l'adresse de
// réception. La vue "recu" (qui a besoin du nom) n'est servie que pour un colis
// déjà payé, car un reçu n'existe que dans ce cas.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Numéro de colis : JE-YYYYMMDD-NNN. On borne strictement le format accepté.
const NUM_RE = /^JE-\d{8}-\d{1,4}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const { numero, vue } = await req.json();
    if (!numero || typeof numero !== "string" || !NUM_RE.test(numero.trim())) {
      return json({ ok: false, error: "numero invalide" }, 400);
    }
    const num = numero.trim().toUpperCase();

    const h = {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    };

    // Toujours par égalité stricte sur le numéro, jamais de LIKE.
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/je_colis?numero=eq.${encodeURIComponent(num)}` +
        `&select=numero,statut,paye,montant,articles,poids,date_paiement,nom_expediteur,je_voyages(route,date_depart)` +
        `&limit=1`,
      { headers: h },
    );
    const list = await r.json();
    if (!Array.isArray(list) || list.length === 0) {
      return json({ ok: false, error: "introuvable" }, 404);
    }
    const c = list[0];

    // Vue "recu" : réservée aux colis payés (un reçu ne concerne qu'un paiement
    // effectué). Elle seule expose le nom de l'expéditeur.
    if (vue === "recu") {
      if (!c.paye) return json({ ok: false, error: "aucun recu (colis non payé)" }, 404);
      return json({
        ok: true,
        colis: {
          numero: c.numero,
          articles: c.articles,
          poids: c.poids,
          montant: c.montant,
          paye: c.paye,
          date_paiement: c.date_paiement,
          nom_expediteur: c.nom_expediteur,
          voyage: c.je_voyages || null,
        },
      });
    }

    // Vue "suivi" (défaut) : strictement les champs d'avancement, aucune donnée
    // personnelle.
    return json({
      ok: true,
      colis: {
        numero: c.numero,
        statut: c.statut,
        paye: c.paye,
        montant: c.montant,
        voyage: c.je_voyages || null,
      },
    });
  } catch (err) {
    return json({ ok: false, error: String(err) }, 200);
  }
});

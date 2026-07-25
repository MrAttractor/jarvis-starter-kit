// devis-recu — Retourne le récapitulatif d'une commande à partir de la
// référence de paiement (DEVIS-...). Utilisé par l'écran de confirmation
// pour afficher le vrai statut + pré-remplir le message WhatsApp avec le
// détail de la commande. Public (no-verify-jwt), lecture seule, champs sûrs.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  try {
    const { reference } = (await req.json()) ?? {};
    if (!reference || !String(reference).startsWith("DEVIS-")) return json({ error: "Référence invalide" }, 400);

    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    const { data: pay } = await supabase
      .from("devis_paiements")
      .select("reference, type, montant, statut, devis_id")
      .eq("reference", reference)
      .single();
    if (!pay) return json({ error: "Commande introuvable" }, 404);

    let devis: Record<string, unknown> | null = null;
    if (pay.devis_id) {
      const { data } = await supabase
        .from("devis_web")
        .select("numero, projet, nom, selection, total, total_label, solde_du, paiement_statut")
        .eq("id", pay.devis_id).single();
      devis = data;
    }

    return json({
      ok: true,
      reference,
      statut: pay.statut,                         // pending | success | failed
      montant: Number(pay.montant),
      type: pay.type,                             // acompte | total
      numero: devis?.numero ?? null,
      projet: devis?.projet ?? null,
      nom: devis?.nom ?? null,
      selection: Array.isArray(devis?.selection) ? devis!.selection : [],
      total: Number(devis?.total ?? 0),
      total_label: devis?.total_label ?? null,
      solde_du: Number(devis?.solde_du ?? 0),
    });
  } catch (e) {
    return json({ error: (e as Error)?.message ?? "Erreur interne" }, 500);
  }
});

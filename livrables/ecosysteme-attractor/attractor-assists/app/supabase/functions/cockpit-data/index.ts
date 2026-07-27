// cockpit-data — Alimente le Pilotage à partir des VRAIES données du site
// agenceattractor.com : leads du formulaire (prospects), commandes (devis_web)
// et paiements XPaye (devis_paiements). Le pipeline se remplit tout seul.
//
// Sécurité : réservé au propriétaire (email OWNER). On vérifie le token.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
const OWNER = "myattractor1@gmail.com";

function moisCourant(d: string | null): boolean {
  if (!d) return false;
  const x = new Date(d), n = new Date();
  return x.getMonth() === n.getMonth() && x.getFullYear() === n.getFullYear();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    // Vérifie que l'appelant est bien le propriétaire.
    const auth = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const { data: { user } } = await supabase.auth.getUser(auth);
    if (!user || user.email !== OWNER) return json({ error: "Accès réservé" }, 403);

    // 1. Commandes (devis_web) = clients qui ont validé un devis, avec leur état de paiement.
    const { data: devis } = await supabase
      .from("devis_web")
      .select("id, nom, contact, projet, total, devise, paiement_statut, montant_paye, solde_du, created_at, statut")
      .order("created_at", { ascending: false });

    // 2. Paiements réussis (devis_paiements) = encaissé réel.
    const { data: paie } = await supabase
      .from("devis_paiements")
      .select("montant, statut, paye_at, devis_id")
      .eq("statut", "success");

    // 3. Leads du formulaire (prospects) pas encore devenus commande.
    const { data: prospects } = await supabase
      .from("prospects")
      .select("id, prenom, activite, whatsapp, besoin, statut, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    const etatDevis = (d: Record<string, unknown>) => {
      const s = String(d.paiement_statut ?? "aucun");
      if (s === "paye_total") return { etat: "Payé", chaud: false };
      if (s === "acompte_paye") return { etat: "Acompte payé", chaud: true };
      if (d.statut === "à chiffrer") return { etat: "À chiffrer", chaud: true };
      return { etat: "Devis validé", chaud: true };
    };

    const clients = (devis ?? []).map((d) => {
      const e = etatDevis(d);
      const eur = String(d.devise ?? "").toUpperCase().match(/€|EUR/);
      const totalFcfa = eur ? Math.round(Number(d.total ?? 0) * 656) : Math.round(Number(d.total ?? 0));
      return {
        source: "commande",
        nom: d.nom ?? "Client",
        contact: d.contact ?? "",
        projet: d.projet ?? "",
        etat: e.etat,
        chaud: e.chaud,
        montant_fcfa: totalFcfa,
        montant_paye_fcfa: Math.round(Number(d.montant_paye ?? 0)),
        solde_du_fcfa: Math.round(Number(d.solde_du ?? 0)),
        date: d.created_at,
      };
    });

    const leads = (prospects ?? []).map((p) => ({
      source: "lead",
      nom: p.prenom ?? "Lead",
      contact: p.whatsapp ?? "",
      projet: p.activite ?? "",
      etat: "Nouveau lead",
      chaud: false,
      besoin: p.besoin ?? "",
      date: p.created_at,
    }));

    const encaisse_total = (paie ?? []).reduce((s, p) => s + Number(p.montant ?? 0), 0);
    const encaisse_mois = (paie ?? []).filter((p) => moisCourant(p.paye_at as string)).reduce((s, p) => s + Number(p.montant ?? 0), 0);
    // Pipeline potentiel = solde restant dû sur les commandes non soldées.
    const pipeline_fcfa = clients.reduce((s, c) => s + (c.etat !== "Payé" ? (c.solde_du_fcfa || c.montant_fcfa || 0) : 0), 0);

    return json({
      ok: true,
      clients,          // commandes avec état de paiement
      leads,            // leads du formulaire
      encaisse_mois,    // FCFA encaissé ce mois (paiements réussis)
      encaisse_total,
      pipeline_fcfa,    // reste à encaisser sur les commandes en cours
      nb_leads: leads.length,
      nb_clients: clients.length,
    });
  } catch (e) {
    return json({ error: (e as Error)?.message ?? "Erreur" }, 500);
  }
});

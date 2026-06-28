import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  try {
    const { owner_id, client_name, total_fcfa, items } = await req.json();
    if (!owner_id) return new Response(JSON.stringify({ error: "owner_id required" }), { status: 400 });

    const itemsSummary = (items ?? []).map((i: { qty: number; nom: string }) => `${i.qty}× ${i.nom}`).join(", ") || "—";
    const totalStr = total_fcfa ? `${Number(total_fcfa).toLocaleString("fr-FR")} F` : "—";

    await supabase.from("notifications").insert({
      user_id: owner_id,
      type: "success",
      titre: "Nouvelle commande",
      corps: `${client_name || "Un client"} vient de commander : ${itemsSummary}. Total : ${totalStr}.`,
    });

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});

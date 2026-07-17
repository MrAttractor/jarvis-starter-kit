// ============================================================
// coach-repartition — Le coach financier suggère comment répartir une entrée
// d'argent sur les enveloppes d'épargne (logique "pay yourself first" anti-pulsion).
// POST { montant, categorie?, taux?, apply?, repartition? }
//   - sans apply : renvoie une SUGGESTION de répartition par priorité (Mac Arthur valide).
//   - apply:true + repartition : applique le split validé (met à jour l'épargne des enveloppes).
// Le système suggère, Mac Arthur valide. Jamais autonome.
// Public (no-verify-jwt).
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { montant, categorie, taux = 0.2, nb = 3, apply = false, repartition } = await req.json();
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // --- VALIDATION : appliquer un split déjà validé par Mac Arthur ---
    if (apply && Array.isArray(repartition)) {
      let done = 0;
      for (const r of repartition) {
        if (!r?.id || !(r.montant > 0)) continue;
        const { data: env } = await supabase.from("pilotage_enveloppes").select("epargne").eq("id", r.id).single();
        if (env) {
          await supabase.from("pilotage_enveloppes").update({ epargne: Number(env.epargne || 0) + Number(r.montant) }).eq("id", r.id);
          done++;
        }
      }
      return json({ ok: true, applied: done });
    }

    // --- SUGGESTION ---
    if (!(montant > 0)) return json({ ok: false, error: "montant requis (> 0)" }, 400);
    const { data: envs } = await supabase
      .from("pilotage_enveloppes")
      .select("id,nom,cible,epargne,categorie,priorite");

    let list = (envs || []).filter((e: any) => Number(e.epargne || 0) < Number(e.cible || 0));
    if (categorie) list = list.filter((e: any) => e.categorie === categorie);
    // Cascade : priorité d'abord (1 avant 2...), puis le plus petit reste à combler (victoires rapides).
    list.sort((a: any, b: any) =>
      ((a.priorite ?? 999) - (b.priorite ?? 999)) ||
      ((Number(a.cible) - Number(a.epargne || 0)) - (Number(b.cible) - Number(b.epargne || 0)))
    );

    const aMettreDeCote = Math.round(Number(montant) * Number(taux));
    // On ÉTALE sur les `nb` premières enveloppes prioritaires (part égale, plafonnée au besoin,
    // le surplus des petites déjà pleines se redistribue) → plusieurs jarres avancent, victoires rapides sur les petites.
    const groupN = Math.max(1, Math.min(Number(nb) || 3, list.length));
    const group = list.slice(0, groupN);
    const alloc: Record<string, number> = {};
    let pool = aMettreDeCote;
    let open = group.map((e: any) => ({ e, need: Number(e.cible || 0) - Number(e.epargne || 0) })).filter((x) => x.need > 0);
    let guard = 0;
    while (pool > 0 && open.length && guard++ < 60) {
      const share = Math.floor(pool / open.length) || pool; // si la part arrondit à 0, on donne le reste
      const next: typeof open = [];
      for (const x of open) {
        const already = alloc[x.e.id] || 0;
        const room = x.need - already;
        const m = Math.min(share, room, pool);
        if (m > 0) { alloc[x.e.id] = already + m; pool -= m; }
        if (x.need - (alloc[x.e.id] || 0) > 0) next.push(x);
        if (pool <= 0) break;
      }
      open = next;
    }
    const repart = group
      .filter((e: any) => (alloc[e.id] || 0) > 0)
      .map((e: any) => ({ id: e.id, nom: e.nom, montant: alloc[e.id], avant: Number(e.epargne || 0), apres: Number(e.epargne || 0) + alloc[e.id], cible: Number(e.cible || 0) }));
    const totalReparti = repart.reduce((s, r) => s + r.montant, 0);
    const depensable = Math.round(Number(montant)) - totalReparti;
    const pct = Math.round(Number(taux) * 100);
    const message = repart.length
      ? `Sur ${montant} €, mets ${totalReparti} € de côté (${pct} %) réparti sur ${repart.length} enveloppe(s) prioritaire(s). Il te reste ${depensable} € dépensables, sans culpabilité : l'épargne est déjà faite.`
      : `Aucune enveloppe à combler${categorie ? " (catégorie " + categorie + ")" : ""}. Tout est atteint, ou aucune enveloppe active.`;

    return json({ ok: true, montant: Number(montant), taux: Number(taux), total_a_mettre_de_cote: aMettreDeCote, total_reparti: totalReparti, depensable, repartition: repart, message });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 200);
  }
});

// Nettoyage hebdomadaire des photos orphelines de tous les sites clients.
// Appelée le lundi à 3h UTC par pg_cron (job nettoyage_photos_hebdo), avec la
// clé service role. Les buckets concernés sont listés dans
// nettoyage_photos_config ; la détection des orphelines est faite en SQL par
// photos_orphelines(), l'effacement par l'API Storage (le SQL ne le peut pas).
// Voir migrations/0067_nettoyage_photos_hebdo.sql
//
// Appel manuel sans rien effacer : body {"simulation": true}
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Garde-fou : si plus de la moitié d'un bucket paraît orpheline, c'est plus
// probablement une référence que la détection ne voit pas qu'un vrai ménage.
// On n'efface rien sur ce bucket et on le signale.
const SEUIL_SUSPECT = 0.5;
const MIN_POUR_SEUIL = 5;

function jwtRole(header: string | null): string | null {
  try {
    const payload = (header ?? "").replace(/^Bearer\s+/i, "").split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))).role ?? null;
  } catch {
    return null;
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

serve(async (req) => {
  if (jwtRole(req.headers.get("Authorization")) !== "service_role") return json({ error: "forbidden" }, 403);

  let simulation = false;
  try { simulation = !!(await req.json())?.simulation; } catch { /* corps vide */ }

  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data: config, error: cfgErr } = await sb
    .from("nettoyage_photos_config").select("bucket").eq("actif", true);
  if (cfgErr) return json({ error: cfgErr.message }, 500);

  const rapport: Record<string, unknown> = {};
  for (const { bucket } of config ?? []) {
    const { data: orphelines, error } = await sb.rpc("photos_orphelines", { p_bucket: bucket });
    if (error) { rapport[bucket] = { erreur: error.message }; continue; }
    const lignes = (orphelines ?? []) as { nom: string; total: number }[];
    const noms = lignes.map((o) => o.nom);
    const total = lignes[0]?.total ?? null;
    if (noms.length >= MIN_POUR_SEUIL && total && noms.length / total > SEUIL_SUSPECT) {
      rapport[bucket] = { bloque: true, orphelines: noms.length, total, raison: "plus de la moitié du bucket, à vérifier à la main" };
      continue;
    }

    if (!simulation) {
      for (let i = 0; i < noms.length; i += 100) {
        const { error: rmErr } = await sb.storage.from(bucket).remove(noms.slice(i, i + 100));
        if (rmErr) { rapport[bucket] = { erreur: rmErr.message, effacees_avant_erreur: i }; break; }
      }
    }
    rapport[bucket] ??= { [simulation ? "a_effacer" : "effacees"]: noms.length, total, fichiers: noms };
  }

  console.log("nettoyage-photos", JSON.stringify(rapport));
  return json({ simulation, rapport });
});

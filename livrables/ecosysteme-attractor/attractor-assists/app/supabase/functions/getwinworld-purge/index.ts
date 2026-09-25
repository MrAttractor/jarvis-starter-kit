// GetWinWorld — purge des offres du jour expirées et des photos orphelines.
// Appelée toutes les 15 min par pg_cron (job gw_purge_offres), avec la clé
// service role. Règle : une offre du jour disparaît définitivement 48h après
// `offre_depuis`, fiche ET photo. Les produits en stock ne sont jamais touchés.
// Voir demo-site/public/getwinworld/supabase-schema-04-offres-48h-stock.sql
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const BUCKET = "gw-photos";
const FOLDER = "charles";
const OFFRE_TTL_MS = 48 * 60 * 60 * 1000;
// Une photo tout juste envoyée n'est pas encore rattachée à sa fiche : on
// laisse 2h avant de la considérer comme orpheline.
const ORPHAN_GRACE_MS = 2 * 60 * 60 * 1000;

function storagePath(url: string | null): string | null {
  if (!url) return null;
  const marker = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
}

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
  // La passerelle (verify_jwt) a déjà vérifié la signature : on n'accepte que
  // le rôle service_role, jamais la clé anon publiée dans la vitrine.
  if (jwtRole(req.headers.get("Authorization")) !== "service_role") return json({ error: "forbidden" }, 403);

  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  const limit = new Date(Date.now() - OFFRE_TTL_MS).toISOString();

  // 1. Offres du jour expirées : photo d'abord, fiche ensuite
  const { data: expired, error: selErr } = await sb
    .from("gw_produits")
    .select("id, photo_url")
    .eq("est_offre_du_jour", true)
    .lt("offre_depuis", limit);
  if (selErr) return json({ error: selErr.message }, 500);

  const expiredPaths = (expired ?? []).map((p) => storagePath(p.photo_url)).filter(Boolean) as string[];
  if (expiredPaths.length) {
    const { error } = await sb.storage.from(BUCKET).remove(expiredPaths);
    if (error) return json({ error: error.message }, 500);
  }
  if (expired?.length) {
    const { error } = await sb.from("gw_produits").delete().in("id", expired.map((p) => p.id));
    if (error) return json({ error: error.message }, 500);
  }

  // 2. Photos orphelines : plus rattachées à aucune fiche (anciennes purges
  // 24h, photos remplacées, envois abandonnés)
  const { data: live } = await sb.from("gw_produits").select("photo_url");
  const used = new Set((live ?? []).map((p) => storagePath(p.photo_url)).filter(Boolean));
  const orphans: string[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data: files, error } = await sb.storage.from(BUCKET).list(FOLDER, { limit: 1000, offset });
    if (error) return json({ error: error.message }, 500);
    for (const f of files ?? []) {
      if (!f.id) continue; // sous-dossier
      const path = `${FOLDER}/${f.name}`;
      const age = Date.now() - new Date(f.created_at).getTime();
      if (!used.has(path) && age > ORPHAN_GRACE_MS) orphans.push(path);
    }
    if (!files || files.length < 1000) break;
  }
  for (let i = 0; i < orphans.length; i += 100) {
    const { error } = await sb.storage.from(BUCKET).remove(orphans.slice(i, i + 100));
    if (error) return json({ error: error.message }, 500);
  }

  return json({ offres_supprimees: expired?.length ?? 0, photos_orphelines: orphans.length });
});

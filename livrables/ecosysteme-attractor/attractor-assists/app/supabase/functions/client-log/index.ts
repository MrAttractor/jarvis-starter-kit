// client-log — Télémétrie légère côté navigateur (diagnostic d'appareils
// qu'on ne peut pas reproduire, ex. téléphone du client). Public, fire-and-forget.
// POST { source, message, ua, url, extra }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  try {
    const b = (await req.json()) ?? {};
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    await supabase.from("client_logs").insert({
      source:  String(b.source ?? "").slice(0, 80),
      message: String(b.message ?? "").slice(0, 2000),
      ua:      String(b.ua ?? "").slice(0, 500),
      url:     String(b.url ?? "").slice(0, 500),
      extra:   b.extra ?? null,
    });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (_) {
    return new Response(JSON.stringify({ ok: false }), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
  }
});

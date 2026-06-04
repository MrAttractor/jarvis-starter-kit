// serve-maquette — Sert l'HTML de la maquette stockée dans profiles.demo_html
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const url = new URL(req.url);
    const uid = url.searchParams.get("uid");
    if (!uid) return new Response("Missing uid", { status: 400, headers: CORS });

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data, error } = await supabase
      .from("profiles")
      .select("demo_html")
      .eq("id", uid)
      .single();

    if (error || !data?.demo_html) {
      return new Response("Maquette introuvable", { status: 404, headers: CORS });
    }

    return new Response(data.demo_html, {
      status: 200,
      headers: {
        ...CORS,
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Options": "ALLOWALL",
      },
    });
  } catch (e) {
    return new Response(String(e), { status: 500, headers: CORS });
  }
});

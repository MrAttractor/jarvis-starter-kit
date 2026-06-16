// public-assistant — Lookup public d'un assistant client par slug.
// Ne renvoie jamais la ligne `profiles` complète : uniquement les
// champs nécessaires à l'affichage de l'écran de chat public.
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
    const slug = url.searchParams.get("slug");
    if (!slug) return json({ error: "Missing slug" }, 400);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, prenom, nom_assistant, activite, client_assistant_ready")
      .eq("public_slug", slug)
      .eq("client_assistant_ready", true)
      .single();

    if (error || !data) return json({ error: "Assistant introuvable" }, 404);

    const { data: produits } = await supabase
      .from("produits_user")
      .select("id, nom, prix, categorie, photo_url")
      .eq("user_id", data.id)
      .eq("actif", true)
      .order("categorie");

    return json({
      user_id:       data.id,
      prenom:        data.prenom,
      nom_assistant: data.nom_assistant || "Assistant",
      activite:      data.activite,
      produits:      produits ?? [],
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "content-type": "application/json" },
  });
}

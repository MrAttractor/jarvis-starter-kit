// receive-veille — webhook n8n → stocke les articles RSS en base
// Body attendu : { articles: [{ secteur, titre, resume?, url?, source?, published_at? }] }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const body = await req.json().catch(() => ({}));
    const articles: Array<Record<string, string>> = body.articles ?? [];

    if (articles.length === 0) {
      return new Response(JSON.stringify({ ok: true, inserted: 0 }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const rows = articles.map((a) => ({
      secteur:      a.secteur     ?? "general",
      titre:        a.titre       ?? "Sans titre",
      resume:       a.resume      ?? null,
      url:          a.url         ?? null,
      source:       a.source      ?? null,
      published_at: a.published_at ?? new Date().toISOString(),
    }));

    const { error } = await supabase.from("veille_tendances").insert(rows);
    if (error) throw error;

    // Déclenche process-veille en fire-and-forget
    fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/process-veille`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    ).catch(() => {});

    return new Response(JSON.stringify({ ok: true, inserted: rows.length }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

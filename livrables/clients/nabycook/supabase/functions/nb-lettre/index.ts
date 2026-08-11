// NabyCook — inscription à la lettre d'information.
//
// La table n'a aucune policy publique : une liste d'emails ne vit pas
// derrière une clé lisible dans la page. Cette fonction écrit avec la
// clé de service, après validation.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (corps: unknown, status = 200) =>
  new Response(JSON.stringify(corps), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ erreur: "Méthode non autorisée" }, 405);

  try {
    const c = await req.json();
    const email = typeof c.email === "string" ? c.email.trim().slice(0, 160) : "";
    const prenom = typeof c.prenom === "string" ? c.prenom.trim().slice(0, 80) : null;
    const source = typeof c.source === "string" ? c.source.trim().slice(0, 60) : null;

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ erreur: "Cette adresse email ne semble pas valide." }, 400);
    }

    const r = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/nb_lettre`, {
      method: "POST",
      headers: {
        apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ email, prenom, source }),
    });

    // 23505 = l'adresse est déjà inscrite. Ce n'est pas une erreur pour la
    // personne : on la remercie comme si c'était nouveau, plutôt que de lui
    // apprendre qui est déjà dans la liste.
    if (!r.ok) {
      const t = await r.text();
      if (t.includes("23505")) return json({ ok: true, deja: true });
      console.error("inscription refusée", r.status, t);
      return json({ erreur: "Inscription impossible pour le moment." }, 500);
    }

    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ erreur: "Requête illisible." }, 400);
  }
});

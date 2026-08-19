// GPS — réception des demandes du site (booking et SAMA).
//
// Pourquoi une fonction plutôt qu'une écriture directe depuis le navigateur :
// la table n'a aucune policy, ni en insertion ni en lecture. Le formulaire parle
// à cette fonction, qui valide puis écrit avec la clé de service. Le visiteur
// n'a jamais le moindre droit sur la base.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFY_TO = (Deno.env.get("GPS_NOTIFY_TO") ?? "hello@agenceattractor.com")
  .split(",").map((s) => s.trim()).filter(Boolean);

// ---------------------------------------------------------------------------
// Listes fermées : on n'accepte que ce que le formulaire propose.
// ATTENTION, elles sont écrites en double, ici et dans le HTML du site.
// Modifier l'une sans l'autre fait disparaître la réponse en silence : la
// valeur arrive, ne correspond à rien, et se range en null sans erreur.
// Elles doivent correspondre AU MOT PRES aux <option> de index.html et sama.html.
// ---------------------------------------------------------------------------
const EVENEMENTS = [
  "Maîtrise de cérémonie",
  "Animation de scène ou de concert",
  "Animation TV, radio ou podcast",
  "Management d'artiste",
  "Autre projet",
];

const QUALITES = [
  "Partenaire ou sponsor",
  "Artiste ou exposant",
  "Média",
  "Participant",
  "Institution",
];

const texte = (v: unknown, max = 500) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

const dansListe = (v: unknown, liste: string[]) => {
  const t = texte(v, 120);
  return t && liste.includes(t) ? t : null;
};

// Une date reçue du navigateur est une chaîne. On refuse tout ce qui n'a pas
// la forme attendue plutôt que de laisser Postgres trancher.
const dateISO = (v: unknown) => {
  const t = texte(v, 10);
  return t && /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : null;
};

const json = (corps: unknown, status = 200) =>
  new Response(JSON.stringify(corps), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ erreur: "Méthode non autorisée." }, 405);

  try {
    const c = await req.json();

    const type = c?.type === "sama" ? "sama" : c?.type === "booking" ? "booking" : null;
    const nom = texte(c?.nom, 120);
    const telephone = texte(c?.telephone, 40);

    if (!type || !nom || !telephone) {
      return json({ erreur: "Merci de renseigner votre nom et votre numéro." }, 400);
    }

    const email = texte(c?.email, 160);
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ erreur: "Cette adresse e-mail ne semble pas valide." }, 400);
    }

    const ligne = {
      type,
      nom,
      telephone,
      email,
      organisation: texte(c?.organisation, 160),
      date_souhaitee: type === "booking" ? dateISO(c?.date_souhaitee) : null,
      type_evenement: type === "booking" ? dansListe(c?.type_evenement, EVENEMENTS) : null,
      ville: type === "booking" ? texte(c?.ville, 120) : null,
      lieu: type === "booking" ? texte(c?.lieu, 200) : null,
      qualite: type === "sama" ? dansListe(c?.qualite, QUALITES) : null,
      message: texte(c?.message, 1500),
    };

    const r = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/gps_demandes`, {
      method: "POST",
      headers: {
        apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(ligne),
    });

    if (!r.ok) {
      console.error("insertion refusée", r.status, await r.text());
      return json({ erreur: "Enregistrement impossible pour le moment." }, 500);
    }

    // La notification part après l'écriture, et son échec n'annule rien :
    // la demande est déjà en base, c'est elle qui fait foi.
    if (RESEND_API_KEY) {
      const titre = type === "booking"
        ? "Nouvelle demande de booking"
        : "Nouveau contact SAMA";

      const champs: [string, string | null][] = [
        ["Nom", ligne.nom],
        ["Téléphone", ligne.telephone],
        ["E-mail", ligne.email],
        ["Structure", ligne.organisation],
        ["Date souhaitée", ligne.date_souhaitee],
        ["Type d'événement", ligne.type_evenement],
        ["Ville", ligne.ville],
        ["Lieu", ligne.lieu],
        ["À quel titre", ligne.qualite],
        ["Message", ligne.message],
      ];

      const rows = champs
        .filter(([, v]) => v)
        .map(([k, v]) =>
          `<tr><td style="padding:6px 14px 6px 0;color:#8a8a8a;vertical-align:top">${k}</td>` +
          `<td style="padding:6px 0"><strong>${esc(String(v))}</strong></td></tr>`)
        .join("");

      const wa = `https://wa.me/${ligne.telephone.replace(/\D/g, "")}`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Site GPS <noreply@agenceattractor.com>",
          to: NOTIFY_TO,
          subject: `${titre} — ${ligne.nom}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:560px">
              <h2 style="margin:0 0 16px">${titre}</h2>
              <table style="border-collapse:collapse">${rows}</table>
              <p><a href="${wa}" style="display:inline-block;margin-top:18px;padding:11px 20px;background:#25D366;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">Répondre sur WhatsApp</a></p>
            </div>`,
        }),
      }).catch(() => {});
    }

    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ erreur: "Requête illisible." }, 400);
  }
});

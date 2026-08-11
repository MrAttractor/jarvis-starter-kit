// NabyCook — dépôt d'une demande de partenariat magasin.
//
// Pourquoi une fonction plutôt qu'une écriture directe : la table n'a
// aucune policy d'insertion publique, et n'en aura jamais. Le formulaire
// du site parle à cette fonction, qui valide puis écrit avec la clé de
// service. Le visiteur n'a jamais de droit d'écriture sur la base.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Listes fermées : on n'accepte que ce que le formulaire propose.
// Sans ça, la table se remplit de valeurs libres et son écran de suivi
// devient illisible au bout de trente demandes.
const TYPES = ["Épicerie fine", "Magasin bio", "Primeur / marché", "Concept store",
  "Ferme urbaine / point de vente producteur"];
const FREQUENTATIONS = ["< 50 clients/jour", "50-150 clients/jour",
  "150-300 clients/jour", "> 300 clients/jour"];
const FORMATS = ["Atelier démo courte durée (30-45min)", "Atelier participatif (1h-1h30)",
  "Dégustation commentée", "Animation récurrente (hebdo/mensuel)",
  "Événement ponctuel ou lancement produit"];
const FREQUENCES = ["Ponctuel (test)", "Mensuel", "Hebdomadaire", "À définir ensemble"];
const APPORTS = ["Mise à disposition d'un espace",
  "Visibilité (réseaux sociaux, newsletter, vitrine)",
  "Produits offerts pour les ateliers", "Rémunération / commission"];

const texte = (v: unknown, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : null;

// Une valeur hors liste est acceptée si elle vient du champ « autre »,
// mais elle est bornée : on ne stocke pas un roman.
const dansListe = (v: unknown, liste: string[], autreAutorise: boolean) => {
  const t = texte(v, 120);
  if (!t) return null;
  if (liste.includes(t)) return t;
  return autreAutorise ? t : null;
};

const listeMultiple = (v: unknown, liste: string[], autreAutorise: boolean) => {
  if (!Array.isArray(v)) return null;
  const out = v.map((x) => dansListe(x, liste, autreAutorise)).filter(Boolean) as string[];
  return out.length ? out.slice(0, 10) : null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ erreur: "Méthode non autorisée" }),
      { status: 405, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  try {
    const c = await req.json();

    const enseigne = texte(c.enseigne, 160);
    const adresse = texte(c.adresse, 300);
    const nom = texte(c.contact_nom, 120);
    const email = texte(c.contact_email, 160);

    if (!enseigne || !adresse || !nom || !email) {
      return new Response(JSON.stringify({ erreur: "Merci de remplir les champs obligatoires." }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return new Response(JSON.stringify({ erreur: "Cette adresse email ne semble pas valide." }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const ligne = {
      enseigne,
      type_commerce: dansListe(c.type_commerce, TYPES, true),
      adresse,
      frequentation: dansListe(c.frequentation, FREQUENTATIONS, false),
      contact_nom: nom,
      contact_email: email,
      contact_tel: texte(c.contact_tel, 40),
      formats: listeMultiple(c.formats, FORMATS, false),
      frequence: dansListe(c.frequence, FREQUENCES, false),
      dates: texte(c.dates, 200),
      themes: texte(c.themes, 1500),
      apports: listeMultiple(c.apports, APPORTS, true),
      budget: texte(c.budget, 200),
      origine: texte(c.origine, 200),
    };

    const r = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/nb_demandes`, {
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
      return new Response(JSON.stringify({ erreur: "Enregistrement impossible pour le moment." }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true }),
      { headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ erreur: "Requête illisible." }),
      { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
  }
});

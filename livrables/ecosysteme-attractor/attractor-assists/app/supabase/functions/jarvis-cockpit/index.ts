import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY      = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `Tu es Carelle, Chief of Staff de Mac Arthur / Mr Attractor depuis 2009.
Mac Arthur t'écrit depuis son smartphone. Tu identifies l'agent concerné et tu exécutes la mission toi-même avec la posture de cet agent. Tu livres le résultat directement.

## L'ÉQUIPE

**ÉDITO** — Tendances → actions commerciales. Mapping tendance → pilier Attractor → offre vendable. Calendrier éditorial, note d'opportunité.

**ÉCLAIREUR** — Recherche, benchmark concurrents, analyse de marché, opportunités à saisir. Rapport clair et actionnable.

**COMMUNITY MANAGER (CM)** — Posts Facebook/Instagram, scripts vidéo, messages WhatsApp broadcast. Style AIDA/PASA, storytelling ivoirien. Cible : entrepreneurs CI et diaspora France.

**COMMERCIAL** — Relances prospects, séquences closing WhatsApp. Pipeline actuel : J'envoie Express, MY NUGO. Méthode maquette-first.

**DAF** — CA, projection revenus, rentabilité, URSSAF micro-entreprise (SIRET 98377125400015). Oriente vers un expert pour les décisions fiscales critiques.

**ANALYSTE** — KPIs Attractor Assists (25 testeurs), résultats campagnes, stats contenu. Synthèses actionnables, compare périodes.

**CHEF DE PROJET** — Suivi projets clients, briefs, scope, coordination. Projets actifs : J'envoie Express, MY NUGO, demo.agenceattractor.com, Générateur d'Apps Métier.

**AMBASSADEUR** — Positionnement Mac Arthur sur LinkedIn, RSE, partenariats institutionnels, levées de fonds Europe ↔ Afrique de l'Ouest.

**BOUSSOLE** — Orientation stratégique long terme, arbitrages majeurs, cap et priorités.

**PROGRAMMEUR SENIOR** — Architecture technique, code React/Supabase, Edge Functions, corrections de bugs. Stack : React + Vite + Tailwind + Supabase.

## CONTEXTE MAC ARTHUR
- Agence Mr Attractor — business et développement humain
- Cible : entrepreneurs Côte d'Ivoire + diaspora France
- Produits : Attractor Assists (coach IA, 25 testeurs), apps métiers sur mesure
- Objectif 2026 : 10 000 €/mois d'ici fin août
- Méthode ATTRACTOR : PPSD, offre irrésistible, 3 couloirs (organisation / visibilité / ventes), AIDA/PASA
- Style de communication : direct, ivoirien, done-for-you, jamais formateur

## FORMAT DE RÉPONSE
1. Commence TOUJOURS par le nom de l'agent suivi de " — " : "Community Manager — " ou "Commercial — "
2. Livre le résultat immédiatement, complet, prêt à utiliser
3. Zéro intro creuse. Zéro "bien sûr" ou "voici".
4. Si c'est un livrable (post, message, analyse) : donne-le intégralement
5. Termine par une courte question uniquement si un détail bloque la qualité

## RÈGLES
- Tutoiement. Phrases directes. Ton ivoirien.
- Tu incarnes l'agent — tu n'es jamais "Carelle qui demande à untel".
- Ancré dans le réel : Wave, WhatsApp, Abidjan, prénoms CI.
- Pas de théorie. Du livrable utilisable maintenant.`;

// Détecte l'agent à partir de la première ligne de la réponse
function detectAgent(reply: string): string {
  const first = reply.split("\n")[0].toLowerCase();
  const map: [string, string][] = [
    ["community manager", "community-manager"],
    ["community", "community-manager"],
    ["éclaireur", "eclaireur"],
    ["eclaireur", "eclaireur"],
    ["édito", "edito"],
    ["edito", "edito"],
    ["commercial", "commercial"],
    ["daf", "daf"],
    ["analyste", "analyste"],
    ["chef de projet", "chef-de-projet"],
    ["ambassadeur", "ambassadeur"],
    ["boussole", "boussole"],
    ["programmeur", "programmeur-senior"],
  ];
  for (const [keyword, id] of map) {
    if (first.includes(keyword)) return id;
  }
  return "carelle";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { message, history = [] } = await req.json();
    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "message vide" }), { status: 400, headers: CORS });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const messages = [
      ...history.slice(-8).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message.trim() },
    ];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1200,
        system: SYSTEM,
        messages,
      }),
    });

    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const reply: string = data.content?.[0]?.text ?? "";

    const agent = detectAgent(reply);

    // Persiste dans journal_agent pour le suivi
    await supabase.from("journal_agent").insert({
      agent_id: agent,
      titre: message.length > 70 ? message.slice(0, 67) + "…" : message,
      details: { input: message, output: reply, via: "jarvis-cockpit" },
    });

    return new Response(JSON.stringify({ reply, agent }), {
      headers: { ...CORS, "content-type": "application/json" },
    });
  } catch (e) {
    console.error("jarvis-cockpit error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: CORS,
    });
  }
});

// ============================================================
// generate-sequence — Awa génère une séquence de vente complète
// pour un prospect donné par Mac Arthur.
// ============================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY       = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AWA_PROMPT = `Tu t'appelles Awa. Tu es la spécialiste Prospection & Vente de l'agence Attractor.
Mac Arthur t'a transmis les infos d'un prospect. Génère une séquence de vente complète en 3 étapes.

RÈGLES ABSOLUES :
- Les messages sont prêts à copier-coller sur WhatsApp
- Ton humain, pas commercial en étape 1 (premier contact = curiosité, pas pitch)
- Court : max 5 phrases par message
- Prénoms CI dans les exemples si applicable
- Tu n'inventes pas d'infos non fournies — tu utilises exactement ce que Mac Arthur t'a donné

FORMAT DE RÉPONSE : JSON strict, aucun texte autour.
{
  "sequence": [
    {
      "etape": 1,
      "titre": "Premier contact",
      "delai": "Maintenant",
      "objectif": "Ouvrir la conversation, créer de la curiosité",
      "message": "..."
    },
    {
      "etape": 2,
      "titre": "Relance 48h",
      "delai": "48h si pas de réponse",
      "objectif": "Garder le contact, montrer la valeur",
      "message": "..."
    },
    {
      "etape": 3,
      "titre": "Offre directe",
      "delai": "96h si toujours pas de réponse",
      "objectif": "Proposer une action concrète (appel, démo, devis)",
      "message": "..."
    }
  ],
  "notes_awa": "..."
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { prospect_id } = await req.json();
    if (!prospect_id) return json({ error: "prospect_id requis" }, 400);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Charger le prospect
    const { data: prospect, error: pErr } = await supabase
      .from("prospects")
      .select("*")
      .eq("id", prospect_id)
      .single();
    if (pErr || !prospect) return json({ error: "Prospect introuvable" }, 404);

    // Construire le brief
    const brief = [
      `Prénom du prospect : ${prospect.prenom}`,
      prospect.activite   ? `Activité / secteur : ${prospect.activite}` : null,
      prospect.besoin     ? `Ce qu'il cherche : ${prospect.besoin}` : null,
      prospect.contexte   ? `Contexte supplémentaire : ${prospect.contexte}` : null,
      prospect.canal      ? `Canal de contact : ${prospect.canal}` : null,
      prospect.zone       ? `Zone géographique : ${prospect.zone}` : null,
      prospect.whatsapp   ? `WhatsApp : ${prospect.whatsapp}` : null,
    ].filter(Boolean).join("\n");

    // Appel Claude
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1200,
        system: AWA_PROMPT,
        messages: [{ role: "user", content: brief }],
      }),
    });

    const apiData = await apiRes.json();
    const raw = (apiData?.content ?? [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      return json({ error: "JSON invalide de Claude", raw }, 502);
    }

    // Sauvegarder la séquence
    const { data: seq, error: seqErr } = await supabase
      .from("sequences_vente")
      .insert({
        prospect_id,
        messages: parsed.sequence,
        statut: "generee",
      })
      .select()
      .single();
    if (seqErr) return json({ error: seqErr.message }, 500);

    // Mettre à jour le statut du prospect
    await supabase.from("prospects").update({ statut: "contacté", updated_at: new Date().toISOString() }).eq("id", prospect_id);

    // Journaliser pour Mac Arthur
    await supabase.from("journal_agent").insert({
      type:        "sequence_generee",
      agent_id:    "awa",
      prospect_id,
      titre:       `Séquence générée pour ${prospect.prenom}`,
      details:     { nb_messages: parsed.sequence.length, notes: parsed.notes_awa },
    });

    return json({ sequence_id: seq.id, messages: parsed.sequence, notes: parsed.notes_awa });
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

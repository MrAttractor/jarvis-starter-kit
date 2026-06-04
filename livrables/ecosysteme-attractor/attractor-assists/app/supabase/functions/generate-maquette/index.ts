// ============================================================
// generate-maquette — Génère une maquette HTML complète pour
// un prospect Famille A et la publie dans Supabase Storage.
//
// SQL à exécuter avant le premier appel :
//   ALTER TABLE prospects ADD COLUMN IF NOT EXISTS maquette_url TEXT;
//   INSERT INTO storage.buckets (id, name, public)
//     VALUES ('maquettes', 'maquettes', true)
//     ON CONFLICT (id) DO NOTHING;
// ============================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? Deno.env.get("CLAUDE_KEY") ?? "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY       = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAQUETTE_PROMPT = `Tu es le Maquette Closer de l'agence Mr Attractor.
Tu génères des maquettes HTML complètes et cliquables pour closer des prospects.

RÈGLES ABSOLUES :
- Produis UN SEUL fichier HTML autonome (CSS et JS inline, zéro dépendance externe)
- Structure : téléphone centré (.phone > .screen) avec topbar, contenu scrollable, barre d'onglets bas
- 4 écrans navigables (onglets bas), reliés par tabbar
- Variables CSS --brand et --brand-2 pour les couleurs du client
- Contenu RÉALISTE en français, jamais de lorem ipsum — utilise les vraies infos du prospect
- Prénoms africains/CI dans les exemples si la zone est CI ou France diaspora
- Mobile-first, dans un cadre smartphone
- Soigné : dégradés, cartes, boutons d'action clairs

FORMAT DE RÉPONSE : uniquement le HTML complet, sans backtick, sans commentaire autour.
Commence directement par <!doctype html>`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { prospect_id, user_id, ref_url, add_context, image_b64, image_type } = await req.json();
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
      `Prospect : ${prospect.prenom}`,
      prospect.activite   ? `Activité : ${prospect.activite}` : null,
      prospect.besoin     ? `Besoin principal : ${prospect.besoin}` : null,
      prospect.contexte   ? `Contexte : ${prospect.contexte}` : null,
      add_context         ? `Infos additionnelles : ${add_context}` : null,
      prospect.zone       ? `Zone géographique : ${prospect.zone}` : null,
      prospect.nb_users   ? `Nb utilisateurs cibles : ${prospect.nb_users}` : null,
      ref_url             ? `Référence visuelle (extraire les couleurs de ce site/compte) : ${ref_url}` : null,
      `Package : Famille A — marque blanche Attractor Assists, niveau EQUIPE`,
      ``,
      `Génère la maquette HTML complète. Nom de l'app = "${prospect.prenom} Pro" si aucun nom fourni.`,
      `Couleurs : si ref_url fourni, propose des couleurs cohérentes avec ce site. Sinon, utilise orange #F25C05 comme --brand.`,
      `4 écrans : Accueil (stats + agent IA actif), Agent commercial IA (chat), Réseau/Clients, Résultats.`,
    ].filter(Boolean).join("\n");

    // Construire le contenu du message (vision si image fournie)
    const userContent: unknown[] = [];
    if (image_b64 && image_type) {
      userContent.push({
        type: "image",
        source: { type: "base64", media_type: image_type, data: image_b64 },
      });
      userContent.push({ type: "text", text: `${brief}\n\nL'image ci-dessus est la référence visuelle du prospect. Extrais les couleurs dominantes, le style et l'ambiance pour orienter la maquette.` });
    } else {
      userContent.push({ type: "text", text: brief });
    }

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
        max_tokens: 8192,
        system: MAQUETTE_PROMPT,
        messages: [{ role: "user", content: userContent }],
      }),
    });

    if (!apiRes.ok) {
      const errBody = await apiRes.text();
      console.error("Anthropic API error:", apiRes.status, errBody);
      return json({ error: `Anthropic API error ${apiRes.status}`, detail: errBody.slice(0, 300) }, 502);
    }

    const apiData = await apiRes.json();
    const rawText = (apiData?.content ?? [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")
      .trim();

    // Extraire le HTML même si Claude a ajouté du texte avant le doctype
    const doctypeIdx = rawText.search(/<!doctype\s+html/i);
    const html = doctypeIdx >= 0 ? rawText.slice(doctypeIdx) : rawText;

    if (!html.startsWith("<!doctype") && !html.startsWith("<!DOCTYPE")) {
      console.error("HTML invalide. Début reçu:", html.slice(0, 300));
      return json({ error: "HTML invalide généré par Claude", raw: html.slice(0, 300) }, 502);
    }

    // Sauvegarder l'HTML dans profiles.demo_html (fire-and-forget — ne bloque pas si colonne absente)
    let serveUrl: string | null = null;
    if (user_id) {
      const { error: saveErr } = await supabase
        .from("profiles")
        .update({ demo_html: html, demo_url: "generated" })
        .eq("id", user_id);
      if (saveErr) {
        console.error("Save profiles error (non-bloquant):", saveErr.message);
        // On continue quand même — le front-end utilisera le HTML brut comme fallback
      } else {
        serveUrl = `${SUPABASE_URL}/functions/v1/serve-maquette?uid=${user_id}`;
      }
    }

    // Journaliser
    await supabase.from("journal_agent").insert({
      agent_id: "maquette",
      type: "maquette_generee",
      titre: `Maquette générée — ${prospect.prenom}`,
      details: { prospect_id, url: serveUrl, ref_url: ref_url ?? null },
    }).catch(() => {});

    // Retourner l'HTML complet pour le fallback blob URL côté front-end
    return json({ url: serveUrl, html });
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

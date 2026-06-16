// catalog-from-photos — Claude Vision extrait les produits depuis une photo de carte/menu
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? Deno.env.get("CLAUDE_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `Tu es un assistant spécialisé dans l'extraction de catalogues produits depuis des photos.

L'utilisateur t'envoie une photo de sa carte, de son menu, de son catalogue papier ou de son tableau de prix.

Ta mission : extraire tous les produits visibles et retourner un JSON structuré.

RÈGLES :
- Extrais chaque produit distinct visible (nom, prix si visible, catégorie si identifiable)
- Les prix : garde le nombre brut (ex: 2000, pas "2 000 FCFA")
- Les catégories : regroupe logiquement (ex: "Plats", "Boissons", "Desserts", "Services", "Produits")
- Si le prix n'est pas lisible : laisse prix à null
- Si la catégorie n'est pas claire : laisse categorie à null
- Retourne UNIQUEMENT du JSON valide, rien d'autre

FORMAT DE RÉPONSE (uniquement ce JSON, sans markdown ni backtick) :
{
  "produits": [
    { "nom": "Attiéké poisson", "prix": 2000, "unite": "portion", "categorie": "Plats" },
    { "nom": "Jus de gingembre", "prix": 500, "unite": "verre", "categorie": "Boissons" }
  ]
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { image_base64, image_type, zone } = await req.json();
    if (!image_base64 || !image_type) {
      return json({ error: "image_base64 et image_type requis" }, 400);
    }

    const devise = zone === "EU" ? "EUR" : "FCFA";
    const userMsg = `Voici une photo de mon catalogue/menu. Extrais tous les produits visibles. Les prix sont probablement en ${devise}.`;

    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        system: SYSTEM,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: image_type,
                data: image_base64,
              },
            },
            { type: "text", text: userMsg },
          ],
        }],
      }),
    });

    if (!apiRes.ok) {
      const err = await apiRes.text();
      return json({ error: `Anthropic ${apiRes.status}`, detail: err.slice(0, 300) }, 502);
    }

    const apiData = await apiRes.json();
    const raw = (apiData?.content ?? [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")
      .trim();

    // Nettoyer les éventuels backticks markdown
    const cleaned = raw.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "").trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return json({ error: "Réponse Claude non parseable", raw: raw.slice(0, 500) }, 502);
    }

    const produits = (parsed?.produits || []).map((p: any) => ({
      nom:       String(p.nom || "").trim(),
      prix:      p.prix != null ? Number(p.prix) : null,
      unite:     String(p.unite || "unité").trim(),
      categorie: p.categorie ? String(p.categorie).trim() : null,
    })).filter((p: any) => p.nom.length > 0);

    return json({ produits });
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

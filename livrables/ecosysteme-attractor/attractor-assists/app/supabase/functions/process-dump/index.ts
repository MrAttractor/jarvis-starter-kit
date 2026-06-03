import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_KEY     = Deno.env.get("OPENAI_API_KEY") ?? "";
const ANTHROPIC_KEY  = Deno.env.get("ANTHROPIC_API_KEY") ?? Deno.env.get("CLAUDE_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Extraction d'entités ────────────────────────────────────────────────────

const EXTRACT_SYSTEM = `Tu es un assistant qui extrait des informations structurées depuis des notes vocales d'entrepreneurs africains (Côte d'Ivoire et diaspora française).

Analyse le texte et extrais :
- taches : liste de tâches concrètes à faire (commence par un verbe d'action)
- clients : noms de personnes ou entreprises mentionnés comme clients ou contacts
- rappels : rappels avec date/heure si mentionnés (ex: "appeler Mama demain")
- idees : idées business, opportunités ou observations intéressantes

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après.
Format strict : { "taches": [], "clients": [], "rappels": [], "idees": [] }
Chaque élément est une chaîne de caractères.
Si une catégorie est vide, renvoie [].`;

// ─── Serveur ────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { audio_b64, audio_type } = await req.json();
    if (!audio_b64) return json({ error: "audio_b64 requis" }, 400);

    // ── 1. Transcription Whisper ─────────────────────────────────────────────

    const mimeType = audio_type || "audio/webm";
    const ext = mimeType.includes("mp4") || mimeType.includes("m4a") ? "m4a"
              : mimeType.includes("ogg") ? "ogg"
              : "webm";

    const audioBytes = Uint8Array.from(atob(audio_b64), (c) => c.charCodeAt(0));

    const form = new FormData();
    form.append("file", new Blob([audioBytes], { type: mimeType }), `dump.${ext}`);
    form.append("model", "whisper-1");
    form.append("language", "fr");

    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_KEY}` },
      body: form,
    });

    if (!whisperRes.ok) {
      const errText = await whisperRes.text();
      return json({ error: `Whisper: ${errText}` }, 500);
    }

    const { text: transcript } = await whisperRes.json();
    if (!transcript?.trim()) {
      return json({ transcript: "", entities: { taches: [], clients: [], rappels: [], idees: [] } });
    }

    // ── 2. Extraction d'entités Claude Haiku ─────────────────────────────────

    let entities = { taches: [], clients: [], rappels: [], idees: [] };

    try {
      const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 600,
          system: EXTRACT_SYSTEM,
          messages: [{
            role: "user",
            content: `Note vocale :\n\n"${transcript}"`,
          }],
        }),
      });

      if (claudeRes.ok) {
        const d = await claudeRes.json();
        entities = JSON.parse(d.content[0].text);
      }
    } catch {}

    return json({ transcript, entities });

  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "content-type": "application/json" },
  });
}

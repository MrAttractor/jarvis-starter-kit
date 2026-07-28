// process-dump-pilotage — Décharge vocale du Pilotage externe.
// Même transcription Whisper que process-dump (Assists), mais l'extraction
// cible directement les champs d'un dossier pilotage_pipeline plutôt que
// des tâches/clients/rappels/idées génériques.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_KEY    = Deno.env.get("OPENAI_API_KEY") ?? "";
const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? Deno.env.get("CLAUDE_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EXTRACT_SYSTEM = `Tu extrais les informations d'un prospect depuis une note vocale de Mac Arthur (agence Mr Attractor, Côte d'Ivoire et diaspora).
Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, format strict :
{ "nom": "..." ou null, "activite": "..." ou null, "besoin": "..." ou null, "zone": "CI" ou "France" ou "International" ou null, "contact": "..." ou null }
"nom" = prénom/nom du prospect. "contact" = numéro WhatsApp si mentionné. Si une info n'est pas dans la note, mets null — n'invente rien.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { audio_b64, audio_type } = await req.json();
    if (!audio_b64) return json({ error: "audio_b64 requis" }, 400);

    // iOS envoie "audio/mp4; codecs=mp4a.40.2" — on retire le suffixe codecs.
    const mimeType = (audio_type || "audio/webm").split(";")[0].trim();
    const ext = mimeType.includes("mp4") || mimeType.includes("m4a") ? "mp4"
              : mimeType.includes("ogg") ? "ogg"
              : mimeType.includes("wav") ? "wav"
              : "webm";

    const audioBytes = Uint8Array.from(atob(audio_b64), (c) => c.charCodeAt(0));

    const form = new FormData();
    form.append("file", new Blob([audioBytes], { type: mimeType }), `dump.${ext}`);
    form.append("model", "whisper-1");

    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_KEY}` },
      body: form,
    });

    if (!whisperRes.ok) {
      const errText = await whisperRes.text();
      return json({ error: `Whisper: ${errText}` }, 500);
    }

    const whisperJson = await whisperRes.json();
    const transcript = whisperJson.text;
    if (!transcript?.trim()) {
      return json({ transcript: "", prospect: null, _diag: { bytes: audioBytes.length, mime: mimeType, ext, whisper: JSON.stringify(whisperJson).slice(0, 200) } });
    }

    let prospect: any = null;
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
          max_tokens: 300,
          system: EXTRACT_SYSTEM,
          messages: [{ role: "user", content: `Note vocale :\n\n"${transcript}"` }],
        }),
      });
      if (claudeRes.ok) {
        const d = await claudeRes.json();
        prospect = JSON.parse(d.content[0].text.replace(/```json|```/g, "").trim());
      }
    } catch { /* transcript reste utilisable même sans extraction */ }

    return json({ transcript, prospect });
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

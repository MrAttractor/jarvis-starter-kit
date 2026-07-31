// ============================================================
// ATTRACTOR VOICE — Chemin ROBUSTE : transcription Whisper
// Edge Function Supabase (Deno). Pour les cas où le navigateur natif
// ne suffit pas (iOS Safari, accents, qualité).
//
// Le navigateur enregistre l'audio (MediaRecorder) → envoie ici →
// Whisper transcrit → renvoie le texte.
//
// Déploiement :
//   supabase functions new transcribe
//   (coller ce contenu)
//   supabase secrets set OPENAI_KEY=sk-...        // clé pour Whisper
//   supabase functions deploy transcribe
//
// NB : Whisper est servi par l'API OpenAI (modèle whisper-1).
// Si tu utilises un autre fournisseur de transcription, adapte l'URL/headers.
// ============================================================

const OPENAI_KEY = Deno.env.get("OPENAI_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",            // restreins à ton domaine Netlify en prod
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }
  try {
    // Le client envoie l'audio en multipart/form-data, champ "file"
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return json({ error: "Aucun fichier audio reçu." }, 400);
    }

    const out = new FormData();
    out.append("file", file, file.name || "audio.webm");
    out.append("model", "whisper-1");
    out.append("language", "fr");
    out.append("response_format", "json");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_KEY}` },
      body: out,
    });

    const data = await res.json();
    if (!res.ok) {
      return json({ error: "Transcription échouée", detail: data }, 502);
    }
    return json({ texte: data.text || "" });
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
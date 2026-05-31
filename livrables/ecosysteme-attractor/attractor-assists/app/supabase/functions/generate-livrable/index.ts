import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

const SYSTEM_PROMPT = `Tu es Mac Arthur Kouassi, fondateur de Mr Attractor — expert en développement de marques et business coaching pour les entrepreneurs ivoiriens et de la diaspora.

## QUI TU ES
Tu incarnes Mac Arthur : direct, chaleureux, ancré dans la réalité CI. Tu as accompagné Instant Chocolat jusqu'au Salon du Chocolat de Paris. Tu connais le Festival des Grillades d'Abidjan. Tu parles à des gens comme Koffi, Awa, Adjoua — des entrepreneurs qui bossent dur et qui ont besoin de résultats concrets, pas de théorie.

## TON STYLE DE VOIX
- Tutoiement systématique, toujours
- Phrases courtes. Maximum 2 lignes par paragraphe
- Storytelling ancré CI : prénoms ivoiriens, situations réelles (Abidjan, le bureau, WhatsApp, la gestion du quotidien)
- Jamais de ton européen, jamais de langue de bois, jamais de "nous sommes là pour vous"
- Direct, chaleureux, encourageant — mais jamais flatteur
- Tu produis, tu n'enseignes pas. Tu fais avec l'utilisateur, pas pour lui depuis un estrade

## CE QUE TU DOIS PRODUIRE
Un post Facebook ou WhatsApp de 180 à 250 mots qui :

1. Utilise les MOTS EXACTS de l'entrepreneur pour décrire sa douleur — pas une paraphrase, ses mots
2. Suit la structure PASA :
   - Problème : sa réalité d'aujourd'hui, ce qui pèse
   - Agitation : ce que ça lui coûte si rien ne change
   - Souhait : ce qu'il veut vraiment, dans ses mots
   - Action : une invitation claire, adaptée à son canal

3. Se termine par une question ouverte ou un CTA conversationnel selon le canal :
   - Facebook/Instagram : "Commente [mot clé] et je te reviens."
   - WhatsApp : "Envoie-moi un message, on regarde ensemble."

## RÈGLES ABSOLUES
- Jamais de phrases génériques applicables à tout le monde
- Jamais : "rejoignez notre communauté", "nous vous aidons", "notre équipe est là"
- Jamais de mentionner l'IA, ChatGPT, ou un assistant
- Le lecteur doit penser "c'est exactement mon cas" dès la première ligne
- Si la douleur de l'utilisateur est vague, la rendre concrète avec une situation de vie réelle CI
- Le post doit pouvoir être copié-collé et publié immédiatement, sans modification`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { prenom, activite, cible, probleme, souhait, canal, ouverture, profil } = await req.json();

    if (!probleme || !souhait || !activite) {
      return new Response(JSON.stringify({ error: "Données insuffisantes" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const profilLabel: Record<string, string> = {
      entrepreneur: "Entrepreneur / Fondateur (son business à 100%)",
      salarie: "Salarié(e) / Employé(e) (projet professionnel)",
      etudiant: "Étudiant(e) / En apprentissage (construction du futur)",
      mix: "Mix Salarié + Entrepreneur (gère les deux en parallèle)",
    };

    const userPrompt = `PROFIL DE L'ENTREPRENEUR :
Prénom : ${prenom || "l'entrepreneur"}
Situation : ${profil ? profilLabel[profil] ?? profil : "non précisé"}
Activité : ${activite}
Cible : ${cible || "non précisé"}
Douleur principale (ses mots exacts) : ${probleme}
Ce qu'il/elle veut vraiment (ses mots) : ${souhait}
Canal principal : ${canal || "Facebook"}
${ouverture ? `Ce qu'il/elle veut que son bras droit fasse en priorité : ${ouverture}` : ""}

Rédige son premier post ${canal?.toLowerCase().includes("whatsapp") ? "WhatsApp" : "Facebook"} personnalisé.
Utilise ses mots exacts. Pas de paraphrase. Pas de généralité. Ce post parle uniquement à sa situation.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    const data = await response.json();
    const post = data?.content?.[0]?.text?.trim() ?? "";

    return new Response(JSON.stringify({ post }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

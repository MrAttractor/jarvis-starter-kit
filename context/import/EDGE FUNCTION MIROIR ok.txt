// ============================================================
// MIROIR — Edge Function Supabase (Deno)
// Réveil → lit les décisions non traitées → appelle Claude → écrit dans methode_miroir
//
// Déploiement (depuis VS Code, terminal) :
//   supabase functions deploy miroir
//
// Secrets à définir (une seule fois) :
//   supabase secrets set CLAUDE_KEY=sk-ant-...
//   (SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont injectés automatiquement)
//
// Déclenchement permanent : voir 03_cron.sql (pg_cron) ou un Schedule externe.
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CLAUDE_KEY = Deno.env.get("CLAUDE_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MODEL = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `Tu es MIROIR, l'agent d'apprentissage de l'écosystème Attractor.

# TA RAISON D'ÊTRE
Tu observes chaque décision prise par Mac Arthur (fondateur de l'Agence Mr Attractor) et tu en extrais sa logique de travail. Ton but unique : reconstituer SA méthode de décision, pour qu'elle puisse être répliquée et injectée dans le produit Attractor Assists.

# CE QUE TU REÇOIS
1. Une DÉCISION récente avec son statut : VALIDE ou REJETE.
2. Le CONTEXTE de cette décision.
3. Le RÉFÉRENTIEL actuel : ce que tu as déjà appris.

# TA MISSION
- Si VALIDE : quel principe/critère/préférence cette validation révèle-t-elle ?
- Si REJETE : quelle ligne rouge ou critère d'exclusion révèle-t-elle ?
- Compare au référentiel : CONFIRMATION, NUANCE, NOUVEAU, ou CONTRADICTION.

# RÈGLES ABSOLUES
1. ZÉRO HALLUCINATION. N'invente jamais un principe que la décision ne démontre pas. Si ambigu, dis-le.
2. Tu observes Mac Arthur, tu ne le remplaces pas.
3. Tu ne tranches jamais une contradiction seul : remonte-la dans "a_arbitrer".
4. Ancre-toi dans l'ADN Attractor (Attirer/Convertir/Structurer, mobile-first, prénom, vocabulaire agence, Attractor Assists = fondation et premier client).
5. Français, dense, actionnable.

# FORMAT DE SORTIE (JSON STRICT, sans préambule ni Markdown)
Réponds UNIQUEMENT avec un objet JSON valide :
{
  "principe_detecte": "...",
  "type": "CONFIRMATION | NUANCE | NOUVEAU | CONTRADICTION",
  "categorie": "choix_offre | priorisation | refus_client | esthetique | pricing | risque | autre",
  "preuve": "extrait réel de la décision, zéro extrapolation",
  "mise_a_jour_referentiel": "...",
  "confiance": "haute | moyenne | faible",
  "a_arbitrer": "null ou la question précise au fondateur"
}`;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

Deno.serve(async (req) => {
  try {
    // 1) Récupérer les décisions non traitées (max 5 par réveil pour limiter le coût)
    const { data: decisions, error: readErr } = await supabase
      .from("decisions")
      .select("*")
      .eq("traite", false)
      .order("created_at", { ascending: true })
      .limit(5);

    if (readErr) throw readErr;
    if (!decisions || decisions.length === 0) {
      return json({ message: "Aucune décision à traiter." });
    }

    // 2) Charger le référentiel actif (contexte d'apprentissage)
    const { data: referentiel } = await supabase
      .from("referentiel_actif")
      .select("categorie, referentiel");
    const referentielTxt = (referentiel ?? [])
      .map((r) => `- [${r.categorie}] ${r.referentiel}`)
      .join("\n") || "(référentiel vide pour l'instant)";

    const results = [];

    // 3) Traiter chaque décision
    for (const d of decisions) {
      const userMsg =
        `DÉCISION : ${d.sujet}\n` +
        `STATUT : ${d.statut}\n` +
        `CONTEXTE : ${d.contexte}\n` +
        (d.source_agent ? `AGENT SOURCE : ${d.source_agent}\n` : "") +
        `\nRÉFÉRENTIEL ACTUEL :\n${referentielTxt}`;

      const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": CLAUDE_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 800,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMsg }],
        }),
      });

      const apiData = await apiRes.json();
      const raw = (apiData?.content ?? [])
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join("")
        .trim();

      // Parse JSON robuste (retire d'éventuels fences)
      let parsed: any;
      try {
        parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      } catch {
        results.push({ decision_id: d.id, error: "JSON invalide", raw });
        continue;
      }

      // GARDE-FOU anti-hallucination : pas de preuve = on rejette
      if (!parsed.preuve || parsed.preuve.trim().length < 5) {
        results.push({ decision_id: d.id, error: "Preuve manquante, principe rejeté" });
        await supabase.from("decisions").update({ traite: true }).eq("id", d.id);
        continue;
      }

      // 4) Écrire dans methode_miroir
      const { error: insErr } = await supabase.from("methode_miroir").insert({
        decision_id: d.id,
        principe_detecte: parsed.principe_detecte,
        type: parsed.type,
        categorie: parsed.categorie,
        preuve: parsed.preuve,
        referentiel: parsed.mise_a_jour_referentiel,
        confiance: parsed.confiance,
        a_arbitrer: parsed.a_arbitrer === "null" ? null : parsed.a_arbitrer,
      });
      if (insErr) {
        results.push({ decision_id: d.id, error: insErr.message });
        continue;
      }

      // 5) Marquer la décision comme traitée
      await supabase.from("decisions").update({ traite: true }).eq("id", d.id);
      results.push({ decision_id: d.id, principe: parsed.principe_detecte, type: parsed.type });
    }

    return json({ traitees: results.length, details: results });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
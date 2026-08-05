// ============================================================
// diagnostic — entretien de découverte guidé, analysé par la Méthode Attractor.
// POST { answers, nom, contact } → synthèse/cartographie/problèmes/opportunités
//   + crée prospect + dossier pilotage_pipeline (statut "Diagnostic reçu")
//   + diagnostics + notifie Mac Arthur (email HTML). Aucune proposition envoyée
//   automatiquement : le consultant valide dans Pilotage.
// Public (no-verify-jwt), la méthode vient de methode_modules (jamais le modèle seul).
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

function zoneFromContact(c: string): string {
  const d = String(c || "").replace(/[\s\-()]/g, "");
  if (d.startsWith("+225") || d.startsWith("225")) return "CI";
  if (d.startsWith("+33") || d.startsWith("0")) return "France";
  return "France";
}

// Filet de secours pour la famille : Claude Haiku omet par intermittence la clé "famille"
// du gros JSON (~2/5 des cas, JSON valide et complet, ce n'est PAS une troncature).
// Comme la famille aiguille tout le parcours, on relance une classification ULTRA-ciblée
// (une seule lettre) quand elle manque. Testé fiable à 100% en isolé.
// Version enrichie du 21/07/2026 : 100 % de justesse sur 45 passages (l'ancienne
// version, plus courte, plafonnait à 87 % et se trompait systématiquement sur le cas
// « vraie activité mais problème de prix uniquement », qu'elle classait A au lieu de B).
const CLASSIF_SYSTEM = `Tu classes le besoin d'un entrepreneur en UNE seule lettre.

Règle de décision, dans cet ordre :

1. D — SEULEMENT si le business est déjà établi ET pilote des chiffres (comptabilité tenue, CA/marge suivis, plusieurs employés ou points de vente) ET le sujet est la rentabilité. Un entrepreneur qui débute n'est JAMAIS D.

2. A — s'il DEMANDE EXPLICITEMENT un produit numérique : un site, une plateforme, une application, une boutique en ligne, un logiciel, un outil de gestion. Peu importe qu'il soit encore informel, artisanal ou en préparation de lancement, et peu importe qu'il gagnerait à se structurer d'abord : ce qu'il vient chercher est un OUTIL. Un besoin de conseil peut exister en plus, il se vend à part, il ne change pas la lettre.

3. A — s'il décrit une activité qui VEND déjà quelque chose et perd du temps ou de l'information dans son process : commandes notées à la main ou dans WhatsApp, stock inconnu, prix répétés en boucle, suivi de livraison au téléphone, cahiers qui ne concordent pas, plusieurs vendeurs. Le livrable est un OUTIL. C'est le cas le plus fréquent.

4. B — s'il n'a PAS encore d'offre claire ou de clientèle définie, ET qu'il ne demande aucun produit numérique : il ne sait pas quoi vendre, à qui, ni à quel prix. Le livrable est une RÉFLEXION, pas un outil.

5. C — assistant IA personnel. Très rare, ne le choisis que si c'est demandé explicitement.

Départager A et B quand les deux semblent possibles, dans cet ordre :
- S'il nomme un produit numérique qu'il veut faire construire, c'est A. Cette règle passe avant tout le reste, y compris "il n'est pas encore structuré" et "il prépare un lancement".
- Sinon, cherche une PERTE D'INFORMATION dans son quotidien (commandes oubliées, stock inconnu, cahiers qui ne concordent, statuts demandés au téléphone). S'il y a une perte d'information, c'est A, même s'il doute aussi de ses prix : l'outil est ce qui se livre.
- S'il n'y a ni demande de produit numérique ni perte d'information, et que le problème est uniquement le prix, le positionnement ou l'offre, c'est B.

Réponds UNIQUEMENT par la lettre A, B, C ou D.`;

async function classifyFamille(brief: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 5, system: CLASSIF_SYSTEM, messages: [{ role: "user", content: brief }] }),
    });
    const data = await res.json();
    const raw = (data?.content ?? []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("").trim();
    const m = raw.toUpperCase().match(/[ABCD]/);
    return m ? m[0] : null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const result: Record<string, unknown> = {};
  try {
    const { answers = {}, nom, contact } = await req.json();
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // 1) Charger la Méthode Attractor curée (le cerveau)
    const { data: mods } = await supabase
      .from("methode_modules")
      .select("etape,titre,contenu")
      .in("etape", ["decouverte", "diagnostic", "ton"])
      .eq("actif", true)
      .order("ordre");
    const methode = (mods || []).map((m: any) => `### ${m.titre}\n${m.contenu}`).join("\n\n");

    const briefPourClassif = Object.entries(answers).map(([k, v]) => `${k} : ${v}`).join("\n");

    // La classification tourne AVANT le gros prompt, et son résultat lui est injecté.
    // Avant le 05/08/2026 elle tournait après : le gros prompt rédigeait donc les opportunités et
    // le message de contact sans connaître la famille retenue. Constaté en réel sur le cas Serge Boka,
    // classé A (il demande explicitement une plateforme) mais dont le message disait « avant même de
    // penser à une plateforme, il vous faut d'abord structurer » — l'inverse de sa demande.
    const famClassif = await classifyFamille(briefPourClassif);
    const CONSIGNE_FAMILLE: Record<string, string> = {
      A: `CE QUE CET ENTREPRENEUR VIENT CHERCHER : un OUTIL (application, plateforme, site, boutique, logiciel de gestion).
Tes "opportunites" décrivent ce que l'outil va faire pour lui, concrètement, écran par écran ou fonction par fonction.
Ton "message_whatsapp" propose d'en modéliser la structure avec lui.
INTERDIT : lui dire de structurer, de faire un manuel de procédures ou un tableur AVANT d'envisager l'outil, ou de repousser le projet à plus tard. Il a déjà décidé. Le conseil se vend en plus, il ne remplace pas sa demande.`,
      B: `CE QUE CET ENTREPRENEUR VIENT CHERCHER : de la CLARTÉ (modèle, offre, cible, prix), pas un outil.
Tes "opportunites" portent sur la structuration de son offre et de son plan. Ne lui vends pas une application.`,
      C: `CE QUE CET ENTREPRENEUR VIENT CHERCHER : un assistant IA personnel.`,
      D: `CE QUE CET ENTREPRENEUR VIENT CHERCHER : de la PERFORMANCE sur un business déjà établi, avec des chiffres. Tes "opportunites" portent sur la rentabilité et le pilotage.`,
    };

    const SYSTEM = `Tu es le consultant de découverte de l'Agence Mr Attractor. Tu analyses un entrepreneur à partir de la MÉTHODE ATTRACTOR ci-dessous, jamais à partir de tes seules connaissances.

${CONSIGNE_FAMILLE[String(famClassif ?? "")] ?? ""}

${methode}

À partir des réponses de l'entrepreneur, produis un diagnostic FIDÈLE à la méthode. Réponds en JSON strict, sans texte autour :
{
  "synthese": "<3-4 phrases chaleureuses qui montrent qu'on a compris son activité et sa situation, dans un ton bienveillant et concret>",
  "cartographie": ["<étape 1 de son process actuel>", "<étape 2>", "..."],
  "problemes": ["<problème réel détecté>", "..."],
  "opportunites": ["<opportunité d'automatisation ou d'amélioration concrète, reliée à la méthode>", "..."],
  "famille": "A" | "B" | "C" | "D",
  "couloir": "Organisation" | "Visibilité" | "Ventes",
  "message_whatsapp": "<premier message WhatsApp de contact À FROID, prêt à envoyer. Le prospect ne connaît pas ce numéro. Vouvoiement, ton naturel et humain. AUCUN emoji, AUCUN markdown, AUCUN superlatif ni flatterie, AUCUN tiret long (—) : utilise des virgules ou des points. N'invente JAMAIS une conversation passée : il a rempli un formulaire, il ne t'a pas parlé.\n\nMISE EN FORME OBLIGATOIRE, un message WhatsApp se lit sur un téléphone : JAMAIS un pavé. Exactement 4 blocs, séparés par une ligne vide (\\n\\n), chacun de 1 à 2 phrases courtes, aucun bloc de plus de 2 lignes à l'écran.\nBloc 1, la présentation : « Bonjour [prénom], c'est Mac Arthur de l'agence Mr Attractor. » suivi de la mention du diagnostic qu'il vient de remplir.\nBloc 2, la preuve qu'on a compris : SON activité et SA douleur avec SES mots.\nBloc 3, le levier et ce qu'on propose de faire concrètement pour lui.\nBloc 4, UNE SEULE question, courte, pour proposer un échange cette semaine. Une seule, jamais deux questions à la suite : on ne demande pas au prospect de répondre à deux choses dans un premier message.>"
}
Famille : A = besoin d'une app/outil métier ; B = besoin de conseil/structuration ; D = business établi avec chiffres où on aligne sur la performance. Choisis la plus probable.`;

    const brief = Object.entries(answers).map(([k, v]) => `${k} : ${v}`).join("\n") + `\nNom : ${nom || "—"}\nContact : ${contact || "—"}`;

    // 2) Analyse Claude
    let parsed: any = {}; let aiDebug: any = { keyLen: (ANTHROPIC_API_KEY || "").length };
    try {
      const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 2000, system: SYSTEM, messages: [{ role: "user", content: brief }, { role: "assistant", content: "{" }] }),
      });
      const apiData = await apiRes.json();
      aiDebug.status = apiRes.status;
      aiDebug.apiErr = apiData?.error?.message || null;
      // Prefill "{" : force la réponse en JSON. Sur un input pauvre, le modèle partait en prose et cassait le parsing.
      const raw = "{" + (apiData?.content ?? []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("").trim();
      aiDebug.rawHead = raw.slice(0, 140);
      const m = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse((m ? m[0] : raw));
    } catch (e) {
      aiDebug.ex = String(e);
      parsed = { synthese: "Merci pour vos réponses, on a bien reçu votre situation.", cartographie: [], problemes: [], opportunites: [], famille: null, message_whatsapp: null };
    }
    if (new URL(req.url).searchParams.get("debug")) result.ai = aiDebug;

    // Garde-fou déterministe : pas de tiret long (préférence Mr Attractor), le prompt seul ne suffit pas.
    // Étendu le 05/08/2026 à TOUS les textes rendus : la synthèse est affichée au prospect à l'écran
    // et n'était pas nettoyée (constaté en réel sur le diagnostic Serge Boka).
    // "Ca" en début de phrase à la place de "Ça" : faute récurrente du modèle, inacceptable sur un
    // premier contact à froid. Corrigée de façon déterministe, le prompt seul ne la tient pas.
    const sansTiret = (s: unknown) => typeof s === "string"
      ? s.replace(/\s*[—–]\s*/g, ", ").replace(/(^|[\n.!?]\s)Ca\b/g, "$1Ça").trim()
      : s;
    if (parsed && typeof parsed === "object") {
      parsed.message_whatsapp = sansTiret(parsed.message_whatsapp);
      parsed.synthese = sansTiret(parsed.synthese);
      for (const cle of ["cartographie", "problemes", "opportunites"]) {
        if (Array.isArray(parsed[cle])) parsed[cle] = parsed[cle].map(sansTiret);
      }
    }

    // FAMILLE : classification dédiée SYSTÉMATIQUE, la famille du gros prompt n'est plus utilisée.
    //
    // Mesuré le 21/07/2026 (app/tests/famille-battery.mjs, 9 cas x 3 passages) :
    //   - famille issue du gros prompt de diagnostic : 37 % de justesse, INSTABLE
    //     (le même brief donnait B,B,A d'un passage à l'autre)
    //   - classification dédiée : 87 %, stable
    //   - classification dédiée enrichie (celle en place) : 100 % sur 45 passages
    // Le gros prompt est excellent pour la synthèse, mauvais pour trancher une lettre :
    // noyé dans la méthode ATTRACTOR (très orientée conseil), il répondait B par défaut,
    // y compris sur des cas d'école d'app métier. Or la famille aiguille tout le parcours :
    // classer B un prospect A, c'est proposer du conseil à quelqu'un qui aurait signé une app.
    // (famClassif est calculée plus haut, avant le gros prompt, pour pouvoir lui être injectée.)
    const famPrompt = String(parsed.famille ?? "").trim().toUpperCase();
    parsed.famille = /^[ABCD]$/.test(String(famClassif))
      ? famClassif
      : (/^[ABCD]$/.test(famPrompt) ? famPrompt : "A"); // A = cas le plus fréquent, meilleur défaut que null
    if (new URL(req.url).searchParams.get("debug")) {
      aiDebug.familleClassif = famClassif;
      aiDebug.famillePrompt = famPrompt;
      aiDebug.familleDivergence = famClassif !== famPrompt;
    }

    const zone = zoneFromContact(contact);

    // Les trois écritures ci-dessous ne lançaient aucune erreur et n'en testaient aucune :
    // un échec passait inaperçu et la fonction répondait quand même ok:true. C'est ce qui explique
    // les diagnostics de juillet 2026 sans dossier de pilotage. On collecte désormais chaque échec
    // et on le remonte dans la réponse ET dans les logs (05/08/2026).
    const echecs: string[] = [];
    const besoinTxt = [answers.offre, answers.douleur].filter(Boolean).join(" · ") || null;
    const dossierId = "diag-" + crypto.randomUUID();

    // 3) Créer le prospect
    const { data: prospect, error: errProspect } = await supabase.from("prospects").insert({
      prenom: nom || null, activite: answers.activite || null,
      besoin: besoinTxt,
      contexte: parsed.synthese || null, canal: "Diagnostic en ligne", zone,
      whatsapp: contact || null, statut: "nouveau", type_projet: parsed.famille || "A",
    }).select("id").single();
    if (errProspect) echecs.push("prospects: " + errProspect.message);

    // 4) Diagnostic détaillé — inséré AVANT le dossier pour pouvoir lier les deux dans les deux sens.
    const { data: diag, error: errDiag } = await supabase.from("diagnostics").insert({
      prospect_id: prospect?.id || null, dossier_id: dossierId, nom: nom || null, contact: contact || null,
      reponses: answers, synthese: parsed.synthese || null,
      cartographie: parsed.cartographie || null, problemes: parsed.problemes || null,
      opportunites: parsed.opportunites || null, famille: parsed.famille || null, statut: "nouveau",
    }).select("id").single();
    if (errDiag) echecs.push("diagnostics: " + errDiag.message);

    // 5) Créer le dossier pipeline (source de vérité) → Pilotage le voit tout de suite.
    // wa_draft : le message de premier contact n'était écrit NULLE PART en base, il n'existait que
    // dans l'email de notification. Le bouton "WA pré-écrit" de Pilotage était donc toujours vide.
    const { error: errPipe } = await supabase.from("pilotage_pipeline").insert({
      id: dossierId, nom: nom || "Prospect", contact: contact || null,
      activite: answers.activite || null, famille: parsed.famille || null, zone,
      statut: "Diagnostic reçu", statut_color: "#F25C05",
      besoin: besoinTxt,
      contexte: parsed.synthese || null,
      wa_draft: parsed.message_whatsapp || null,
      diagnostic_id: diag?.id || null,
      prochaine: "Relire le diagnostic et créer la proposition (bouton dans la fiche)",
      source: "diagnostic", priorite: 1, urgent: true,
      date_action: new Date().toISOString().slice(0, 10),
    });
    if (errPipe) echecs.push("pilotage_pipeline: " + errPipe.message);

    result.dossier_id = dossierId;
    if (echecs.length) {
      console.error("[diagnostic] écritures en échec :", echecs.join(" | "));
      result.echecs = echecs;
    }

    // 6) Notifier Mac Arthur (email HTML cliquable)
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("NOTIFY_DEVIS_EMAIL") || "myattractor1@gmail.com";
    if (resendKey) {
      const isEmail = String(contact || "").includes("@");
      const waNum = String(contact || "").replace(/[\s+\-()]/g, "");
      const waMsg = (parsed.message_whatsapp && String(parsed.message_whatsapp).trim()) || `Bonjour ${nom || ""}, merci pour votre diagnostic. `;
      // Si le prospect a laissé un email (pas un numéro), le bouton doit ouvrir un mail, pas un wa.me cassé.
      const waReply = isEmail
        ? `mailto:${String(contact).trim()}?subject=${encodeURIComponent("Votre diagnostic Mr Attractor")}&body=${encodeURIComponent(waMsg)}`
        : (waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}` : "");
      const replyLabel = isEmail ? "Répondre par email" : "Répondre sur WhatsApp";
      const list = (arr: any[], color: string) => Array.isArray(arr) && arr.length
        ? `<ul style="margin:6px 0 0;padding-left:18px">${arr.map((x) => `<li style="font-size:13.5px;color:#4A3F35;margin-bottom:4px">${esc(x)}</li>`).join("")}</ul>` : "<p style='color:#9C9189;font-size:13px;margin:4px 0 0'>—</p>";
      const html = `<!doctype html><html><body style="margin:0;background:#FAF6F0;font-family:'Segoe UI',system-ui,sans-serif;color:#1A1714">
        <div style="max-width:600px;margin:0 auto;padding:22px 16px">
          <div style="background:#1A1714;border-radius:14px 14px 0 0;padding:18px 22px">
            <div style="font-size:18px;font-weight:800;color:#fff">Mr <span style="color:#F25C05">Attractor</span></div>
            <div style="font-size:12px;color:#C9BEB2;margin-top:2px">Nouveau diagnostic reçu, un prospect a rempli son entretien</div>
          </div>
          <div style="background:#fff;border-radius:0 0 14px 14px;padding:22px;box-shadow:0 8px 30px rgba(26,23,20,.08)">
            <h1 style="font-size:20px;margin:0 0 2px">${esc(nom || "Prospect")}</h1>
            <p style="margin:0 0 14px;font-size:14px;color:#4A3F35">${esc(contact || "—")} &nbsp;·&nbsp; ${esc(answers.activite || "—")} &nbsp;·&nbsp; Famille ${esc(parsed.famille || "?")}</p>
            <div style="background:#FCF8EC;border-left:3px solid #F25C05;border-radius:0 8px 8px 0;padding:12px 14px;margin-bottom:16px">
              <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#D94F02;margin-bottom:4px">Synthèse</div>
              <div style="font-size:14px;color:#1A1714;line-height:1.55">${esc(parsed.synthese || "")}</div>
            </div>
            <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#9C9189">Problèmes détectés</div>${list(parsed.problemes, "#F25C05")}
            <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#9C9189;margin-top:12px">Opportunités</div>${list(parsed.opportunites, "#1E9E52")}
            ${parsed.message_whatsapp ? `<div style="background:#EAF7EF;border-left:3px solid #25D366;border-radius:0 8px 8px 0;padding:12px 14px;margin:16px 0 0"><div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#128C4B;margin-bottom:4px">Message prêt à envoyer</div><div style="font-size:14px;color:#1A1714;line-height:1.55;white-space:pre-wrap">${esc(parsed.message_whatsapp)}</div></div>` : ""}
            <div style="margin-top:22px">
              ${waReply ? `<a href="${waReply}" style="display:inline-block;background:${isEmail ? "#1A6FF2" : "#25D366"};color:#fff;text-decoration:none;font-weight:800;font-size:14px;padding:13px 20px;border-radius:10px;margin:0 8px 8px 0">${replyLabel}</a>` : ""}
              <a href="https://demo.agenceattractor.com/pilotage" style="display:inline-block;background:#1A1714;color:#fff;text-decoration:none;font-weight:800;font-size:14px;padding:13px 20px;border-radius:10px;margin:0 8px 8px 0">Ouvrir Pilotage → créer la proposition</a>
            </div>
          </div>
          <p style="text-align:center;font-size:11px;color:#9C9189;margin:16px 0 0">Agence Mr Attractor · tunnel de vente</p>
        </div></body></html>`;
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        // hello@ et non noreply@ : un noreply sans boîte réelle est un signal de spam classique,
        // constaté en réel sur les invitations à signer (31/07/2026). Aligné ici par cohérence.
        body: JSON.stringify({ from: "Mr Attractor <hello@agenceattractor.com>", to: [notifyEmail], subject: `Diagnostic · ${nom || "Prospect"} (${answers.activite || "?"})`, html }),
      });
      result.email = { ok: r.ok };
    }

    return json({ ok: true, synthese: parsed.synthese, cartographie: parsed.cartographie, problemes: parsed.problemes, opportunites: parsed.opportunites, ...result });
  } catch (e) {
    return json({ ok: false, error: String(e), ...result }, 200);
  }
});

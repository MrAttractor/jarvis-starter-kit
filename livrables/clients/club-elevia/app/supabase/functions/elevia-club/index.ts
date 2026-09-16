// ============================================================
// Club Privé Élévia — Module 3 « Affinités et mises en relation »
//
// Trois engagements tenus ici :
//   · les questions ne sont pas dans ce code, elles viennent de la table
//     `el_questions` : l'arbitrage de la Cliente se fait en base, pas par un
//     redéploiement ;
//   · aucune décision automatisée sur une personne : le moteur ordonne un
//     affichage, la demande et la réponse sont deux gestes humains
//     (Avenant n°1, Art. 15) ;
//   · rien n'est lisible sans session : la clé anon ne donne accès à aucune
//     donnée de membre, tous les contrôles sont ici, jamais dans l'écran.
//
// Tant que `el_questionnaire_etat.publie` est faux, le questionnaire n'est
// ouvert qu'aux comptes d'équipe : la Cliente peut donc le parcourir en vrai
// avant de le valider, sans qu'une membre le voie.
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** Les types de réponse acceptés, et comment on vérifie qu'une valeur est
 *  bien de ce type. Une valeur qui ne passe pas ici n'entre pas en base :
 *  le moteur d'affinités compare des formes, il ne doit jamais rencontrer
 *  autre chose que ce qu'il attend. */
function valeurValide(q: Record<string, unknown>, v: unknown): boolean {
  const type = String(q.type);
  const options = (q.options ?? []) as string[];
  const dansOptions = (x: unknown) => options.length === 0 || options.includes(String(x));

  switch (type) {
    case "ville":
    case "texte_court":
      return typeof v === "string" && v.trim().length > 0 && v.length <= 120;
    case "texte_long":
      return typeof v === "string" && v.trim().length > 0 && v.length <= 1200;
    case "villes":
    case "mots_cles":
      return Array.isArray(v) && v.length > 0 && v.length <= (Number(q.max_choix) || 3) &&
             v.every((x) => typeof x === "string" && x.trim().length > 0 && x.length <= 60);
    case "choix":
    case "liste":
      return typeof v === "string" && dansOptions(v);
    case "choix_multi":
    case "liste_multi":
      return Array.isArray(v) && v.length > 0 &&
             v.length <= (Number(q.max_choix) || options.length || 20) &&
             v.every(dansOptions) && new Set(v.map(String)).size === v.length;
    case "classement":
      // Un classement est une permutation : mêmes éléments, sans doublon.
      return Array.isArray(v) && v.length === options.length &&
             v.every(dansOptions) && new Set(v.map(String)).size === v.length;
    case "tranche_age": {
      if (typeof v !== "object" || v === null) return false;
      const o = v as Record<string, unknown>;
      const min = Number(o.min), max = Number(o.max);
      return Number.isInteger(min) && Number.isInteger(max) &&
             min >= 18 && max <= 100 && min <= max;
    }
    default:
      return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  async function membreDe(jeton: unknown) {
    const { data: sess } = await db.from("el_sessions")
      .select("membre_id, expire_at").eq("jeton", String(jeton ?? "")).maybeSingle();
    if (!sess || new Date(sess.expire_at) < new Date()) return null;
    const { data: m } = await db.from("el_membres")
      .select("id, pseudo, role, statut, statut_verif").eq("id", sess.membre_id).single();
    return m && m.statut === "actif" ? m : null;
  }

  try {
    const { action, jeton, ...p } = await req.json();

    const membre = await membreDe(jeton);
    if (!membre) return json({ ok: false, error: "Session expirée." }, 401);

    const { data: etatQ } = await db.from("el_questionnaire_etat")
      .select("publie").eq("id", true).maybeSingle();
    const publie = !!etatQ?.publie;
    // Avant validation par la Cliente, seuls les comptes d'équipe entrent :
    // c'est ce qui lui permet de parcourir le questionnaire en vrai, sur son
    // téléphone, sans qu'une membre puisse tomber dessus.
    const apercu = !publie && membre.role === "agent";
    if (!publie && !apercu) {
      return json({ ok: false, error: "Le questionnaire n'est pas encore ouvert.", ferme: true }, 403);
    }

    // ── Le questionnaire, et où j'en suis ─────────────────────
    if (action === "questionnaire") {
      const { data: questions } = await db.from("el_questions")
        .select("code, numero, partie, libelle, aide, type, options, max_choix, obligatoire, sensible")
        .eq("active", true).order("numero");

      const { data: mesReponses } = await db.from("el_reponses")
        .select("question_code, valeur").eq("membre_id", membre.id);

      const deja: Record<string, unknown> = {};
      for (const r of mesReponses ?? []) deja[r.question_code] = r.valeur;

      const { data: avancee } = await db.rpc("el_avancee_questionnaire", { p_membre: membre.id });
      return json({ ok: true, apercu, questions: questions ?? [], reponses: deja, avancee });
    }

    // ── Enregistrer des réponses ──────────────────────────────
    // Par lot, pour qu'une partie entière se sauve d'un coup et qu'une coupure
    // réseau au milieu ne laisse pas la moitié d'un écran en base.
    if (action === "repondre") {
      const lot = p.reponses;
      if (!lot || typeof lot !== "object") return json({ ok: false, error: "Rien à enregistrer." }, 400);

      const codes = Object.keys(lot);
      if (codes.length === 0 || codes.length > 40) return json({ ok: false, error: "Rien à enregistrer." }, 400);

      const { data: questions } = await db.from("el_questions")
        .select("code, type, options, max_choix, sensible, active").in("code", codes);
      const parCode = new Map((questions ?? []).map((q) => [q.code, q]));

      const aEcrire: Array<{ membre_id: string; question_code: string; valeur: unknown; maj_le: string }> = [];
      const refusees: string[] = [];
      for (const code of codes) {
        const q = parCode.get(code);
        if (!q || !q.active) { refusees.push(code); continue; }
        // Une question sensible au sens de l'article 9 n'est enregistrée que
        // si le consentement exprès accompagne la réponse. Sans lui, elle est
        // refusée, pas ignorée en silence.
        if (q.sensible && p.consentement_sensible !== true) { refusees.push(code); continue; }
        const v = (lot as Record<string, unknown>)[code];
        // Une valeur vide efface la réponse : c'est le seul moyen pour un
        // membre de revenir sur ce qu'il a dit, et la politique de
        // confidentialité le lui promet.
        if (v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
          await db.from("el_reponses").delete()
            .eq("membre_id", membre.id).eq("question_code", code);
          continue;
        }
        if (!valeurValide(q, v)) { refusees.push(code); continue; }
        aEcrire.push({ membre_id: membre.id, question_code: code, valeur: v as unknown, maj_le: new Date().toISOString() });
      }

      if (aEcrire.length > 0) {
        const { error } = await db.from("el_reponses")
          .upsert(aEcrire, { onConflict: "membre_id,question_code" });
        if (error) return json({ ok: false, error: error.message }, 500);
      }

      const { data: avancee } = await db.rpc("el_avancee_questionnaire", { p_membre: membre.id });
      return json({ ok: true, enregistrees: aEcrire.length, refusees, avancee });
    }

    // ── La découverte ─────────────────────────────────────────
    if (action === "decouverte") {
      const { data: avancee } = await db.rpc("el_avancee_questionnaire", { p_membre: membre.id });
      if (!avancee?.complet) {
        return json({ ok: true, avancee, profils: [], attendu: "questionnaire" });
      }
      // La zone est une valeur close, jamais la chaîne reçue : un filtre est
      // une porte, et une porte ne se laisse pas dicter son ouverture par
      // l'appelant. Toute autre valeur retombe sur « partout ».
      const zone = ["partout", "ville", "pays"].includes(String(p.zone ?? ""))
        ? String(p.zone) : "partout";
      const { data: profils } = await db.rpc("el_decouverte", {
        p_membre: membre.id, p_limite: 12, p_zone: zone,
      });
      if (membre.statut_verif !== "valide") {
        // On montre quand même les profils : c'est ce qui donne envie de
        // finir la vérification. Seule la demande est fermée, et l'écran le dit.
        return json({ ok: true, avancee, zone, profils: profils ?? [], attendu: "verification" });
      }
      return json({ ok: true, avancee, zone, profils: profils ?? [] });
    }

    // ── Demander une mise en relation ─────────────────────────
    if (action === "demander") {
      const { data: r } = await db.rpc("el_demander_relation", {
        p_demandeur: membre.id,
        p_destinataire: String(p.membre ?? ""),
        p_mot: typeof p.mot === "string" ? p.mot.slice(0, 400) : null,
      });
      if (r?.ok) {
        await db.from("el_evenements").insert({
          membre_id: membre.id, type: "relation_demandee", meta: { vers: String(p.membre ?? "") },
        });
      }
      return json(r ?? { ok: false, error: "Demande impossible." });
    }

    // ── Répondre à une demande reçue ──────────────────────────
    if (action === "repondre_relation") {
      const { data: r } = await db.rpc("el_repondre_relation", {
        p_membre: membre.id,
        p_relation: String(p.relation ?? ""),
        p_reponse: String(p.reponse ?? ""),
      });
      if (r?.ok) {
        await db.from("el_evenements").insert({
          membre_id: membre.id, type: "relation_repondue", meta: { reponse: r.statut },
        });
      }
      return json(r ?? { ok: false, error: "Réponse impossible." });
    }

    // ── Mes relations ─────────────────────────────────────────
    if (action === "relations") {
      const { data: r } = await db.rpc("el_mes_relations", { p_membre: membre.id });
      return json({ ok: true, ...(r ?? {}) });
    }

    // ── Signaler un profil ────────────────────────────────────
    // Le signalement retire le profil de la découverte de tous le temps de
    // l'examen (CDC Module 3), et bloque la paire au passage : on ne veut
    // pas reproposer à quelqu'un la personne qu'il vient de signaler.
    if (action === "signaler") {
      const { data: r } = await db.rpc("el_signaler", {
        p_membre: membre.id,
        p_cible: String(p.membre ?? ""),
        p_motif: typeof p.motif === "string" ? p.motif.slice(0, 1000) : null,
      });
      if (r?.ok) {
        await db.from("el_evenements").insert({
          membre_id: membre.id, type: "profil_signale", meta: { vise: String(p.membre ?? "") },
        });
      }
      return json(r ?? { ok: false, error: "Signalement impossible." });
    }

    // ── L'annonce « connexion établie » ───────────────────────
    // Elle se marque vue par membre, sinon celui qui a demandé ne la verrait
    // jamais, ou la reverrait à chaque ouverture.
    if (action === "connexion_vue") {
      const { data: r } = await db.rpc("el_connexion_vue", {
        p_membre: membre.id, p_relation: String(p.relation ?? ""),
      });
      return json(r ?? { ok: false, error: "Impossible." });
    }

    // ── Le premier échange, après acceptation seulement ───────
    if (action === "fil") {
      const { data: r } = await db.rpc("el_fil", {
        p_membre: membre.id, p_relation: String(p.relation ?? ""),
      });
      return json(r ?? { ok: false, error: "Conversation indisponible." });
    }

    if (action === "message") {
      const { data: r } = await db.rpc("el_envoyer_message", {
        p_membre: membre.id,
        p_relation: String(p.relation ?? ""),
        p_texte: typeof p.texte === "string" ? p.texte : "",
      });
      if (r?.ok) {
        await db.from("el_evenements").insert({
          membre_id: membre.id, type: "message_envoye", meta: { relation: String(p.relation ?? "") },
        });
      }
      return json(r ?? { ok: false, error: "Envoi impossible." });
    }

    return json({ ok: false, error: "Action inconnue." }, 400);
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
});

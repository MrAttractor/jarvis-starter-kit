// ============================================================
// Club Privé Élévia — Module 2 « Confiance, vérification »
//
// Trois engagements de l'Avenant V3 (Art. 15), tenus ici :
//   · aucune reconnaissance faciale : un geste tiré au sort, jugé par un humain ;
//   · la décision porte toujours le nom de l'agent qui l'a prise ;
//   · la vidéo est effacée dans les 24 h suivant la décision, de façon vérifiable.
//
// La vidéo ne transite jamais par cette fonction : le navigateur l'envoie
// directement au stockage privé avec une URL signée à usage unique. Le bucket
// n'est pas public, aucune vidéo n'est lisible sans URL signée par le service.
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const BUCKET = "elevia-verifications";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** Gestes volontairement simples à faire et évidents à juger à l'œil. */
const GESTES = [
  "tournez lentement la tête vers la gauche, puis revenez de face",
  "tournez lentement la tête vers la droite, puis revenez de face",
  "levez la main ouverte à côté de votre visage",
  "souriez franchement pendant deux secondes",
  "hochez la tête de haut en bas, deux fois",
  "montrez trois doigts à côté de votre visage",
];

function tirerDefi(): string {
  const i = crypto.getRandomValues(new Uint32Array(2));
  let a = GESTES[i[0] % GESTES.length];
  let b = GESTES[i[1] % GESTES.length];
  if (a === b) b = GESTES[(i[1] + 1) % GESTES.length];
  return `${a}, puis ${b}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  /** Purge opportuniste : appelée à chaque action, pour ne dépendre d'aucun automate. */
  async function purger(): Promise<number> {
    const { data: aPurger } = await db.rpc("el_videos_a_purger");
    if (!aPurger || aPurger.length === 0) return 0;
    const chemins = aPurger.map((v: { chemin: string }) => v.chemin).filter(Boolean);
    const { error } = await db.storage.from(BUCKET).remove(chemins);
    // On ne marque purgé qu'après effacement réel : sinon la preuve mentirait.
    if (error) return 0;
    const ids = aPurger.map((v: { id: string }) => v.id);
    await db.rpc("el_marquer_purgees", { ids });
    return ids.length;
  }

  /** Session -> membre. Toute action passe par là. */
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
    const purgees = await purger();

    const membre = await membreDe(jeton);
    if (!membre) return json({ ok: false, error: "Session expirée." }, 401);

    // ── Où en est ma vérification ─────────────────────────────
    if (action === "etat") {
      const { data: derniere } = await db.from("el_verifications")
        .select("statut, motif, defi, soumis_le, decide_le")
        .eq("membre_id", membre.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      return json({ ok: true, statut_verif: membre.statut_verif, derniere: derniere ?? null });
    }

    // ── Démarrer : tirer un geste et ouvrir un dépôt ──────────
    if (action === "demarrer") {
      if (membre.statut_verif === "valide") return json({ ok: false, error: "Votre profil est déjà vérifié." }, 400);

      // Une seule demande ouverte à la fois : on réutilise celle en attente.
      const { data: existante } = await db.from("el_verifications")
        .select("id, defi").eq("membre_id", membre.id).eq("statut", "en_attente").maybeSingle();

      let id: string, defi: string;
      if (existante) {
        id = existante.id; defi = existante.defi;
      } else {
        defi = tirerDefi();
        const { data, error } = await db.from("el_verifications")
          .insert({ membre_id: membre.id, defi }).select("id").single();
        if (error) return json({ ok: false, error: error.message }, 500);
        id = data.id;
      }

      const chemin = `${membre.id}/${id}.webm`;
      // upsert : le membre peut refaire sa vidéo tant que la décision n'est pas
      // prise. Sans cela, revenir sur cet écran après un envoi renvoyait
      // « The resource already exists », un message technique incompréhensible.
      // L'ancienne vidéo n'est remplacée qu'au moment du nouveau dépôt, donc un
      // agent qui l'examine au même instant ne se retrouve pas les mains vides.
      let { data: depot, error: eDepot } = await db.storage
        .from(BUCKET).createSignedUploadUrl(chemin, { upsert: true });

      if (eDepot) {
        // Repli : on efface l'objet puis on rouvre un dépôt.
        await db.storage.from(BUCKET).remove([chemin]);
        ({ data: depot, error: eDepot } = await db.storage.from(BUCKET).createSignedUploadUrl(chemin));
      }
      if (eDepot || !depot) {
        return json({ ok: false, error: "Impossible d'ouvrir l'envoi de la vidéo. Réessayez dans un instant." }, 500);
      }

      return json({ ok: true, id, defi, chemin, url_depot: depot.signedUrl, jeton_depot: depot.token });
    }

    // ── Soumettre : la vidéo est déposée, la demande entre en file ──
    if (action === "soumettre") {
      const { data: dem } = await db.from("el_verifications")
        .select("id, membre_id, statut").eq("id", String(p.id ?? "")).maybeSingle();
      if (!dem || dem.membre_id !== membre.id) return json({ ok: false, error: "Demande introuvable." }, 404);
      if (dem.statut !== "en_attente") return json({ ok: false, error: "Cette demande est déjà traitée." }, 400);

      const chemin = `${membre.id}/${dem.id}.webm`;
      // On vérifie que le fichier existe réellement : sans cela, un appel direct
      // à l'API ferait entrer en file une demande sans vidéo à examiner.
      const { data: liste } = await db.storage.from(BUCKET).list(String(membre.id), { search: `${dem.id}.webm` });
      if (!liste || liste.length === 0) return json({ ok: false, error: "La vidéo n'est pas arrivée. Réessayez." }, 400);

      await db.from("el_verifications").update({ chemin, soumis_le: new Date().toISOString() }).eq("id", dem.id);
      await db.from("el_membres").update({ statut_verif: "en_attente" }).eq("id", membre.id);
      await db.from("el_evenements").insert({ membre_id: membre.id, type: "verif_soumise", meta: { id: dem.id } });
      return json({ ok: true });
    }

    // ══════════ Réservé aux agents Élévia ══════════
    if (membre.role !== "agent") return json({ ok: false, error: "Accès réservé à l'équipe Élévia." }, 403);

    // ── La file de modération ────────────────────────────────
    if (action === "file") {
      const { data: lignes } = await db.from("el_verifications")
        .select("id, membre_id, defi, chemin, statut, soumis_le, decide_le, motif")
        .not("chemin", "is", null)
        .order("soumis_le", { ascending: true }).limit(60);

      const ids = [...new Set((lignes ?? []).map((l) => l.membre_id))];
      const { data: membres } = await db.from("el_membres")
        .select("id, pseudo, pays, genre, created_at").in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
      const parId = Object.fromEntries((membres ?? []).map((m) => [m.id, m]));

      // URL de lecture à durée courte : une vidéo ne doit jamais circuler en clair.
      const enrichies = [];
      for (const l of lignes ?? []) {
        let video = null;
        if (l.chemin) {
          const { data: sig } = await db.storage.from(BUCKET).createSignedUrl(l.chemin, 300);
          video = sig?.signedUrl ?? null;
        }
        enrichies.push({ ...l, chemin: undefined, video, membre: parId[l.membre_id] ?? null });
      }
      return json({ ok: true, agent: membre.pseudo, purgees, demandes: enrichies });
    }

    // ── Décider ──────────────────────────────────────────────
    if (action === "decider") {
      const decision = String(p.decision ?? "");
      if (decision !== "valide" && decision !== "refuse") return json({ ok: false, error: "Décision inconnue." }, 400);

      const { data: dem } = await db.from("el_verifications")
        .select("id, membre_id, statut").eq("id", String(p.id ?? "")).maybeSingle();
      if (!dem) return json({ ok: false, error: "Demande introuvable." }, 404);
      if (dem.statut !== "en_attente") return json({ ok: false, error: "Cette demande a déjà été tranchée." }, 400);

      const { error } = await db.from("el_verifications").update({
        statut: decision,
        motif: decision === "refuse" ? (String(p.motif ?? "").trim() || "La vidéo ne permettait pas de vous identifier.") : null,
        decide_le: new Date().toISOString(),
        decide_par: membre.id,            // une décision porte toujours un nom
      }).eq("id", dem.id);
      if (error) return json({ ok: false, error: error.message }, 500);

      await db.from("el_membres").update({ statut_verif: decision }).eq("id", dem.membre_id);
      await db.from("el_evenements").insert({
        membre_id: dem.membre_id, type: "verif_decidee",
        meta: { decision, agent: membre.pseudo },
      });
      return json({ ok: true });
    }

    // ── Purge forcée (contrôle manuel) ───────────────────────
    if (action === "purger") return json({ ok: true, purgees });

    return json({ ok: false, error: "Action inconnue." }, 400);
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
});

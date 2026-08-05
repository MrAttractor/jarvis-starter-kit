// ============================================================
// diagnostic-selection — enregistre ce que le prospect a coché en fin de diagnostic.
// POST { dossier_id, services: string[], wa_clique?: boolean }
//
// Pourquoi cette fonction existe (05/08/2026) : la sélection de services ne servait qu'à
// composer le texte d'un lien wa.me côté navigateur. Rien n'était envoyé au serveur, donc
// l'information disparaissait si le prospect ne cliquait pas, ou cliquait sans envoyer.
// C'est pourtant le signal le plus fiable du tunnel : le prospect dit lui-même ce qu'il vient
// chercher, là où la classification automatique se trompe (cas Serge Boka : demande explicite
// de plateforme classée en famille B, donc voie conseil, alors qu'il veut un outil).
//
// Effet de bord voulu : cocher "une application pour votre métier" corrige la famille en A et
// conserve la lettre du modèle dans famille_auto. Ces couples (ce que le modèle a dit / ce que
// le prospect voulait vraiment) sont la matière première de l'apprentissage du classificateur.
//
// Public (no-verify-jwt) : le prospect n'est pas authentifié. Surface volontairement minuscule,
// seules 4 colonnes sont modifiables, et seulement tant que le dossier n'a pas avancé.
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS complet + OPTIONS : sans ça le navigateur bloque l'appel en silence, et un envoi
// en fire-and-forget ne le signale jamais (leçon notify-je-demande, 08/07/2026).
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

// Doit rester aligné sur SERVICES dans public/diagnostic/index.html.
const SERVICES_VALIDES = ["app", "conseil", "video", "contenu", "autre"];

// Seul "app" tranche une famille sans ambiguïté : le prospect demande un outil, c'est A.
// "conseil" seul ne suffit PAS à conclure B : un prospect qui veut une application ET de
// l'accompagnement coche souvent les deux, et l'outil reste ce qui se livre.
function familleDepuisSelection(services: string[]): string | null {
  return services.includes("app") ? "A" : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { dossier_id, services = [], wa_clique = false } = await req.json();

    if (typeof dossier_id !== "string" || !/^diag-[0-9a-f-]{36}$/i.test(dossier_id)) {
      return json({ ok: false, error: "dossier_id invalide" }, 400);
    }
    const choix = (Array.isArray(services) ? services : [])
      .filter((s: unknown) => typeof s === "string" && SERVICES_VALIDES.includes(s));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Le dossier n'est modifiable que tant qu'il n'a pas avancé : dès que le consultant le fait
    // progresser, cette porte publique se ferme.
    const { data: dossier, error: errLecture } = await supabase
      .from("pilotage_pipeline")
      .select("id, famille, famille_auto, statut")
      .eq("id", dossier_id)
      .maybeSingle();
    if (errLecture) return json({ ok: false, error: errLecture.message }, 500);
    if (!dossier) return json({ ok: false, error: "dossier introuvable" }, 404);
    if (dossier.statut !== "Diagnostic reçu") return json({ ok: true, ignore: "dossier deja avance" });

    const maj: Record<string, unknown> = { services: choix };
    if (wa_clique) maj.wa_clique_at = new Date().toISOString();

    // Correction de famille par le prospect lui-même.
    const famVoulue = familleDepuisSelection(choix);
    let corrigee = false;
    if (famVoulue && dossier.famille !== famVoulue) {
      maj.famille_auto = dossier.famille_auto ?? dossier.famille; // on garde la 1re lettre du modèle
      maj.famille = famVoulue;
      maj.prochaine = "Le prospect a demande une application lui-meme, la famille a ete corrigee en A. Rappeler et modeliser l outil.";
      maj.priorite = 1;
      maj.urgent = true;
      corrigee = true;
    }

    const { error: errMaj } = await supabase.from("pilotage_pipeline").update(maj).eq("id", dossier_id);
    if (errMaj) return json({ ok: false, error: errMaj.message }, 500);

    // Copie dans le diagnostic détaillé, pour que la ligne se suffise à elle-même.
    const { error: errDiag } = await supabase
      .from("diagnostics")
      .update({ services: choix, ...(corrigee ? { famille: famVoulue } : {}) })
      .eq("dossier_id", dossier_id);
    if (errDiag) console.error("[diagnostic-selection] diagnostics:", errDiag.message);

    return json({ ok: true, services: choix, famille_corrigee: corrigee });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});

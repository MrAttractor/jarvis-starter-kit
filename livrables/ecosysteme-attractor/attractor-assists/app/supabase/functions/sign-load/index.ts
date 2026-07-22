// ============================================================
// sign-load — Ouverture d'un dossier depuis le lien personnel
//
// Public (verify_jwt = false). Le jeton du lien tient lieu
// d'authentification. Ne renvoie QUE ce que ce signataire doit
// voir : jamais les jetons des autres, jamais le journal complet.
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CORS, SUPABASE_URL, SERVICE_KEY, ipDe, uaDe, journal } from "../_shared/signature.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

  try {
    const { token, evenement } = await req.json();
    if (!token || typeof token !== "string") return json({ ok: false, error: "Lien invalide." }, 400);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: sig } = await supabase
      .from("sig_signataires")
      .select("id, dossier_id, nom, email, qualite, role, statut, signed_at")
      .eq("token", token)
      .maybeSingle();

    if (!sig) return json({ ok: false, error: "Ce lien de signature n'existe pas ou a été révoqué." }, 404);

    const { data: dossier } = await supabase
      .from("sig_dossiers")
      .select("id, reference, titre, client, message, statut, expire_at, created_at")
      .eq("id", sig.dossier_id)
      .single();

    const expire = new Date(dossier.expire_at).getTime() < Date.now();

    const { data: documents } = await supabase
      .from("sig_documents")
      .select("id, nom, reference, url, contenu_hash, ordre")
      .eq("dossier_id", sig.dossier_id)
      .order("ordre", { ascending: true });

    // Qui d'autre doit signer, et où en est-il (sans jamais exposer les jetons).
    const { data: co } = await supabase
      .from("sig_signataires")
      .select("nom, qualite, role, statut, signed_at")
      .eq("dossier_id", sig.dossier_id)
      .order("ordre", { ascending: true });

    // Un simple chargement de page n'est pas un événement de preuve : on ne
    // journalise que la première ouverture et les consultations de documents.
    if (evenement === "ouvert" && sig.statut === "en_attente") {
      await supabase.from("sig_signataires").update({ statut: "ouvert" }).eq("id", sig.id);
      await journal(supabase, {
        dossier_id: sig.dossier_id, signataire_id: sig.id,
        type: "ouvert", ip: ipDe(req), user_agent: uaDe(req),
      });
    } else if (evenement === "document_consulte") {
      await journal(supabase, {
        dossier_id: sig.dossier_id, signataire_id: sig.id,
        type: "document_consulte", ip: ipDe(req), user_agent: uaDe(req),
      });
    }

    // Masque l'email pour l'affichage : on confirme la boîte sans l'exposer en clair.
    const [avant, apres] = String(sig.email).split("@");
    const emailMasque = `${avant.slice(0, 2)}${"•".repeat(Math.max(avant.length - 2, 1))}@${apres}`;

    return json({
      ok: true,
      expire,
      signataire: {
        nom: sig.nom, qualite: sig.qualite, role: sig.role,
        statut: sig.statut, signed_at: sig.signed_at, email_masque: emailMasque,
      },
      dossier: {
        reference: dossier.reference, titre: dossier.titre, client: dossier.client,
        message: dossier.message, statut: dossier.statut, expire_at: dossier.expire_at,
      },
      documents: documents ?? [],
      cosignataires: (co ?? []).filter((c) => c.nom !== sig.nom),
    });
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
});

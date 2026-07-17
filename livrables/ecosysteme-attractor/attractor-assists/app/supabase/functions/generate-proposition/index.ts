// ============================================================
// generate-proposition — génère/lit une proposition interactive.
//  GET  ?id=<uuid>         → renvoie le config de rendu (page /proposition, public)
//  POST { dossier_id }     → construit une proposition (catalogue Attractor du barème)
//                            à partir d'un dossier pilotage_pipeline, l'écrit dans
//                            propositions, lie le dossier, renvoie { id }.
//  POST { config, dossier_id? } → écrit une proposition déjà composée (test/manuel).
// Service role. GET public (config destiné à être montré au prospect).
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SUBMIT_URL   = `${SUPABASE_URL}/functions/v1/devis-accept`;
const WA_HELP      = "33753902323";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

// ── Catalogue Attractor (prix = barème). Détails/livrables par option. ──
function catalogue(devise: string) {
  const eur = devise === "€";
  const p = (e: number, f: number) => eur ? e : f;
  return {
    conseil: [
      { id:"starter", nom:"Starter", prix:p(150,100000), format:"Livré sous 48h",
        desc:"Un document pour y voir clair vite : diagnostic + recommandations prioritaires.",
        avantage:"Vous voulez d'abord y voir clair, sans engager un gros budget.",
        limite:"C'est un point de départ, il ne construit pas encore tout votre modèle.",
        livrables:["Un document de synthèse (diagnostic + priorités)","Vos 3 prochaines actions concrètes"] },
      { id:"runner", nom:"Runner", prix:p(350,230000), format:"Livré sous 72h",
        desc:"Un dossier de structuration : positionnement, cible, offre et plan marketing.",
        avantage:"Vous savez où vous allez et vous voulez structurer votre communication.",
        limite:"Se concentre sur le marketing et la structuration, pas sur le pilotage dans la durée.",
        livrables:["Un dossier de structuration (positionnement, cible, offre)","Votre plan marketing","Une première feuille de route"] },
      { id:"eagle", nom:"Eagle", prix:p(800,525000), format:"10h à répartir sur 2 mois max", reco:true,
        desc:"Un vrai accompagnement de A à Z : vision, modèle économique et plan d'action annuel.",
        avantage:"Vous partez de votre idée et vous voulez tout poser proprement pour lancer sereinement.",
        limite:"Demande votre implication sur 2 mois (10h de séances ensemble).",
        livrables:["Votre vision clarifiée","Votre modèle économique","Votre plan d'action sur 12 mois","10h de coaching + pilotage","Tous les bonus de lancement"] },
    ],
    site: [
      { id:"app_simple", nom:"App simple — vitrine & commandes", prix:p(250,165000), defaut:true,
        desc:"Votre vitrine en ligne avec la prise de commandes et un tableau de bord simple.",
        avantage:"Vous voulez être en ligne vite et commencer à recevoir des commandes.",
        limite:"C'est la base solide ; le suivi livreur et le multi-utilisateurs viennent au-dessus.",
        livrables:["Votre vitrine (catalogue + présentation)","Prise de commandes","Tableau de bord simple","Hébergement de la 1re année offert"] },
      { id:"app_pro", nom:"App pro — suivi complet automatisé", prix:p(490,320000), apartir:true,
        desc:"La vitrine + l'automatisation du suivi qui compte pour VOTRE activité (statuts, stock, livraison si vous livrez…).",
        avantage:"Vous voulez automatiser le suivi de votre activité, adapté à votre façon de travailler.",
        limite:"On automatise le suivi selon votre besoin réel (ce n'est pas figé) ; maintenance mensuelle selon le périmètre.",
        livrables:["Tout l'App simple","Suivi automatisé adapté à votre activité (statuts de commande, stock, et suivi livreur si vous livrez)","Notifications et relances selon votre besoin"] },
      { id:"app_proplus", nom:"App pro+ — équipe, base pro & assistance", prix:p(1200,790000), apartir:true,
        desc:"Multi-utilisateurs, base de données pro, rapports et messagerie.",
        avantage:"Vous avez une équipe et vous voulez piloter dans le détail avec des rapports.",
        limite:"Se cadre précisément selon vos process ; montant confirmé après le cadrage.",
        livrables:["Multi-utilisateurs (équipe + administration)","Base de données pro","Assistance : rapports, messagerie"] },
    ],
    options: [
      { id:"video", nom:"Vidéo & lancement — Mr Attractor Films", prix:p(354,232000), apartir:true, geo:true,
        desc:"On ne fait pas qu'une vidéo : direction artistique, plan de promotion, et pilotage du lancement si vous voulez.",
        avantage:"Vous voulez marquer les esprits au lancement, avec un univers cohérent.",
        limite:"Tournage sur place (Côte d'Ivoire ou Île-de-France). Prix HT + défraiement, sur mesure selon l'ambition ; périmètre calé ensemble.",
        livrables:["Production vidéo pro (tournage 4K, montage, rendu 48-72h)","Direction artistique (univers visuel + ton)","Plan de promotion (quoi publier, où, quand)","Option pilotage : on orchestre tout le lancement","Package Créa possible (affiches, visuels) dès 250 €"] },
    ],
    bonus: [
      'Mise en ligne + branchement de votre nom de domaine — <span class="off">offerts</span>',
      'Séance de prise en main de l\'outil avec vous — <span class="off">offerte</span>',
      'Séance de suivi à 30 jours pour garder le cap — <span class="off">offerte</span>',
    ],
    marcheLabel: "La même prestation confiée à une agence classique",
    marche: eur ? "3 000 – 6 000 €" : "2 000 000 – 4 000 000 FCFA",
  };
}

// Numérotation continue et sûre : on prend le PLUS GRAND numéro déjà utilisé (devis faits main
// dans pilotage_devis + propositions générées), et on incrémente. Plancher à 11 (dernier numéro
// fait main connu = ATR-2026-0011 Nabycook) pour ne JAMAIS réattribuer un numéro déjà signé.
const FLOOR_NUMERO = 11;
async function nextNumero(supabase: any): Promise<string> {
  const y = new Date().getUTCFullYear();
  const prefix = `ATR-${y}-`;
  const nums: number[] = [];
  for (const t of ["pilotage_devis", "propositions"]) {
    const { data } = await supabase.from(t).select("numero").like("numero", `${prefix}%`);
    for (const r of (data || [])) {
      const m = String(r?.numero || "").match(/ATR-\d{4}-(\d{4})/);
      if (m) nums.push(parseInt(m[1], 10));
    }
  }
  const max = Math.max(FLOOR_NUMERO, ...nums, 0);
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    // ── GET : lire un config pour la page publique ──
    if (req.method === "GET") {
      const id = new URL(req.url).searchParams.get("id");
      if (!id) return json({ error: "id requis" }, 400);
      const { data, error } = await supabase.from("propositions").select("id,numero,config,statut,total").eq("id", id).single();
      if (error || !data) return json({ error: "Proposition introuvable" }, 404);
      return json({ id: data.id, numero: data.numero, statut: data.statut, config: data.config });
    }

    // ── POST : créer une proposition ──
    const body = await req.json().catch(() => ({}));
    const supa = supabase;

    // mode MISE À JOUR : retoucher un devis existant (même id, même numéro, même lien).
    // C'est l'ajustement après négociation : Mac Arthur change lignes/prix/conditions/plan, on ne brûle PAS un nouveau numéro.
    if (body.update && body.id) {
      const { data: cur } = await supa.from("propositions").select("numero,config").eq("id", body.id).single();
      if (!cur) return json({ error: "Proposition introuvable" }, 404);
      const numero = cur.config?.numero || cur.numero;
      const patch: Record<string, unknown> = {};
      if (body.config) patch.config = { ...body.config, numero };
      if (typeof body.statut === "string") patch.statut = body.statut;
      if (typeof body.total === "number") patch.total = body.total;
      const { data, error } = await supa.from("propositions").update(patch).eq("id", body.id).select("id,numero").single();
      if (error) return json({ error: error.message }, 500);
      return json({ id: data.id, numero: data.numero, updated: true });
    }

    // mode manuel : config déjà fourni
    if (body.config) {
      const numero = body.config.numero || await nextNumero(supa);
      const { data, error } = await supa.from("propositions")
        .insert({ dossier_id: body.dossier_id ?? null, numero, config: { ...body.config, numero }, statut: "brouillon" })
        .select("id").single();
      if (error) return json({ error: error.message }, 500);
      return json({ id: data.id, numero });
    }

    // mode dossier : construire depuis pilotage_pipeline
    if (!body.dossier_id) return json({ error: "dossier_id ou config requis" }, 400);
    const { data: dossier, error: dErr } = await supa.from("pilotage_pipeline").select("*").eq("id", body.dossier_id).single();
    if (dErr || !dossier) return json({ error: "Dossier introuvable" }, 404);

    const devise = (dossier.zone === "CI" || dossier.zone === "Côte d'Ivoire") ? "FCFA" : "€";
    const cat = catalogue(devise);
    const numero = await nextNumero(supa);
    const prenom = dossier.nom || dossier.contact || "vous";
    const activite = dossier.activite ? ` (${dossier.activite})` : "";

    const config = {
      numero, date: new Date().toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" }),
      client: dossier.nom || "", projet: dossier.activite || "votre projet", devise,
      submitUrl: SUBMIT_URL, waHelp: WA_HELP,
      waHelpText: `Bonjour Mac Arthur, je regarde ma proposition (${numero}) et j'ai une question : `,
      tag: "Conseil en business & applications métier",
      titre: `Votre proposition <em>Attractor</em>, étape par étape`,
      intro: `On vous a préparé un parcours clair pour ${prenom}${activite}. On avance ensemble : d'abord on clarifie, puis on construit l'outil qui porte votre activité. Prenez le temps de découvrir chaque étape, dépliez les détails, vous verrez exactement ce qu'on fait pour vous et ce que vous obtenez.`,
      marcheLabel: cat.marcheLabel, marche: cat.marche,
      conseil: cat.conseil, site: cat.site, options: cat.options, bonus: cat.bonus,
      limite: "Cette offre de lancement (bonus inclus) est réservée 15 jours. Un nombre limité d'accompagnements est ouvert par mois : votre créneau de démarrage est bloqué dès réception de l'acompte.",
      doneMsg: "Votre sélection a bien été enregistrée et transmise à Mac Arthur. Vous serez recontacté(e) très vite pour lancer votre projet.",
    };

    const { data: prop, error: insErr } = await supa.from("propositions")
      .insert({ dossier_id: body.dossier_id, numero, config, devise, statut: "brouillon" })
      .select("id").single();
    if (insErr) return json({ error: insErr.message }, 500);

    await supa.from("pilotage_pipeline").update({ proposition_id: prop.id }).eq("id", body.dossier_id);

    return json({ id: prop.id, numero, config });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

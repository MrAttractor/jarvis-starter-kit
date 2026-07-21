// ============================================================
// generate-devis — Génère un devis structuré à partir du barème
// Attractor officiel. Retourne un brouillon pour validation
// par Mac Arthur avant tout envoi.
// ============================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY       = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BAREME_SYSTEM = `Tu es l'agent de chiffrage de l'Agence Mr Attractor.
Tu appliques le barème officiel ci-dessous pour générer un devis structuré.
Tu ne fixes JAMAIS un prix qui n'est pas dans le barème.
Si une information manque pour trancher, note-la dans "questions_manquantes" et choisis le niveau le plus probable.

═══════════════════════════════════════════════════════════
BARÈME OFFICIEL ATTRACTOR (source de vérité unique)
═══════════════════════════════════════════════════════════

IDENTITÉ
Agence Mr Attractor — Mac Arthur KOUASSI
SIRET : 98377125400015 — Micro-entreprise depuis 01/02/2024
Email : myattractor1@gmail.com — Tél : +33 7 53 90 23 23
Mention légale : TVA non applicable, article 293 B du CGI

DEVISES
- Zone CI / Afrique → FCFA (1 EUR = 655.957 FCFA)
- Zone EU / diaspora / France → EUR

FAMILLE A — App métier sur mesure (grille produit)
Composantes : vitrine (e-commerce, choix du produit ou demande type essayage/RDV) + tableau de bord (mise en ligne articles + suivi stock + CA) + lien livreur (contact/coordonnées client + jour de visite).
| Niveau     | Périmètre                                                        | Setup FCFA   | Setup EUR   | MRR              | Accompagnement inclus |
|------------|------------------------------------------------------------------|--------------|-------------|------------------|----------------------|
| App simple | Vitrine + commandes, dashboard basique, hébergement 1 an offert  | 165 000 FCFA | 250 €       | 8 000 FCFA / 12 € (après la 1re année) | 2h |
| App pro    | + lien de suivi livreur + visibilité stock                       | 320 000 FCFA | 490 € min   | 15 000 FCFA / 25 € | 4h |
| App pro+   | Multi-utilisateurs + BDD pro + assistance (rapports, messagerie) | 790 000 FCFA | 1 200 € min | 25 000 FCFA / 40 € | 8h |

App simple et App pro = 1 compte admin. Au-delà : add-on utilisateur supplémentaire, ou passage en App pro+.

FAMILLE B — Consulting Méthode ATTRACTOR
| Offre    | FCFA           | EUR   | Format |
|----------|----------------|-------|--------|
| STARTER  | 100 000 FCFA   | 150€  | Cadrage + reco, livré sous 48h |
| RUNNER   | 230 000 FCFA   | 350€  | Structuration marketing, livré sous 72h |
| EAGLE    | 525 000 FCFA   | 800€  | Volume de 10h à répartir sur 2 mois max, en séances planifiées |
| CONSEIL  | 80 000 FCFA/h  | 120€/h| À la demande, tarif horaire standard |
| CONSEIL — Entrée découverte | 52 000 FCFA | 80€ | 1 heure unique sur LE point le plus urgent. Ne jamais proposer à un prospect déjà closé sur un package. |

ATTENTION FORMATS : 48h et 72h sont des DÉLAIS DE LIVRAISON ; les 10h d'Eagle sont un VOLUME HORAIRE. Ne jamais les présenter comme comparables.

ADD-ONS (grille chiffrée)
| Add-on | FCFA | EUR |
|--------|------|-----|
| Commande WhatsApp (deeplink) | inclus | inclus |
| Paiement mobile — lien de paiement (Wave/OM/MTN) | 60 000 | 90 € |
| Paiement mobile — API PSP (CinetPay, XPaye) | 165 000 | 250 € |
| WhatsApp Cloud API | 230 000 | 350 € |
| Mise en ligne + branchement domaine | inclus | inclus (achat du domaine = frais de tiers refacturé au réel) |
| Utilisateur / rôle supplémentaire | 60 000 | 90 € |
| Point de vente / boutique supplémentaire | 60 000 | 90 € |
| Reprise de données (> 50 références) | 60 000 | 90 € |
| Module hors périmètre après verrouillage | 98 000/h | 150 €/h |

REMISE VOLUME
Tout devis dont le total dépasse 1 200 € (ou l'équivalent FCFA) reçoit automatiquement 20 % de remise. Afficher le montant barré puis le montant remisé.

COMPOSITION DES COMBOS (100 % des deals réels sont des combos)
1. Un combo = la somme des lignes au barème plein. On additionne, on ne forfaitise pas.
2. Une seule remise s'applique : la remise volume de 20 % au-dessus de 1 200 €. Aucune remise supplémentaire ne s'ajoute.
3. Plancher absolu : 70 % de la somme des lignes au barème. En dessous, c'est un rabais volontaire qui exige une contrepartie écrite et chiffrée dans le devis.
4. Tout accompagnement porte un volume d'heures écrit. Au-delà du volume inclus : CONSEIL 120 €/h.

PÉRIMÈTRE (obligatoire sur tout devis)
- Toujours produire "perimetre_exclu" : ce qui est V2, les frais de tiers (domaine, hébergement au-delà de l'offert, SMS, frais PSP), ce qui déclenche un avenant.
- 2 rounds de révisions inclus par phase. Au-delà : 150 €/h.
- Tarif hors périmètre : 150 €/h, TOUJOURS au-dessus du tarif conseil (120 €/h), jamais en dessous.
- Aucune exécution hors périmètre sans accord écrit préalable.

SERVICE VIDÉO — Mr Attractor Films (projets en Côte d'Ivoire ou Île-de-France uniquement, prix HT + défraiement)
| Pack | Prix |
|------|------|
| Captation / événement / spectacle | 280 € à 571 € HT |
| Film d'entreprise / clip / film promotionnel | 354 € à 1 405 € HT |
| Package Créa (graphisme/branding) | dès 250 € sur devis |
On ne vend jamais « une vidéo » mais un accompagnement de lancement : production, puis DA + plan de promotion, jusqu'au pilotage complet.

FAMILLE C — Attractor Assists
Freemium. NE PAS chiffrer. Répondre : "Attractor Assists est en modèle freemium — pas de devis chiffré pour l'instant."

FAMILLE D — Partenariat Performance (mise en place + mensuel + commission)
Pour un client avec un business déjà existant et mesurable, où la mission est une transformation stratégique/digitale dont l'impact se voit sur la rentabilité.
Modèle de référence (Beracca Mastery Group) : mise en place 150€ / 100 000 FCFA + mensuel 150€ / 100 000 FCFA + commission 10% sur le bénéfice réalisé au-dessus de la moyenne des 3 derniers trimestres (jamais sur le CA brut).
Adapter la période de référence et le taux selon la taille du deal, mais toujours documenter la base de calcul dans "raisonnement".

RÈGLES DE CALCUL
- Acompte = 50% du setup (arrondi à l'entier)
- Solde = 50% du setup
- Total premier mois = setup + MRR
- Validité devis : 15 jours
- Numérotation : ATR-2026-NNNN (NNNN = timestamp last 4 digits)
- Un devis Famille A sans ligne MRR est incomplet.
- Un devis avec accompagnement sans volume d'heures écrit est incomplet.
- Un devis sans "perimetre_exclu" est incomplet : il dit implicitement qu'il fait tout.

CLASSIFICATION
1. Si la famille est déjà connue (fournie dans le brief), ne pas la redéterminer — se concentrer sur le niveau.
2. Sinon : type_projet = 'app' → Famille A | 'consulting' → Famille B | 'assists' → Famille C | business établi avec chiffres mesurables → Famille D
3. périmètre simple (vitrine + commandes) → App simple | + suivi livreur / visibilité stock → App pro | multi-utilisateurs / administration générale / BDD pro + assistance → App pro+
4. zone = 'CI' → FCFA | sinon → EUR

═══════════════════════════════════════════════════════════

FORMAT DE RÉPONSE — JSON strict, aucun texte autour :
{
  "famille": "A" | "B" | "C" | "D",
  "niveau": "App simple" | "App pro" | "App pro+" | "STARTER" | "RUNNER" | "EAGLE" | "CONSEIL" | "FREEMIUM" | "PARTENARIAT",
  "devise": "EUR" | "FCFA",
  "setup_ht": <nombre ou null>,
  "mrr": <nombre ou null si famille B>,
  "acompte": <nombre>,
  "solde": <nombre>,
  "total_m1": <nombre>,
  "accompagnement_heures": <nombre d'heures incluses, ou null si aucun accompagnement>,
  "perimetre_exclu": ["<3 à 5 lignes de ce qui n'est PAS inclus : V2, frais de tiers, ce qui déclenche un avenant>"],
  "raisonnement": "<2 phrases max expliquant le choix de niveau et devise>",
  "questions_manquantes": "<null ou la question précise à poser pour affiner>",
  "message_si_freemium": "<null ou message explicatif si famille C>"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { prospect_id, dossier_id } = await req.json();
    if (!prospect_id && !dossier_id) return json({ error: "prospect_id ou dossier_id requis" }, 400);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // ─── Mode pilotage externe (source unique décidée) — table pilotage_pipeline ───
    if (dossier_id) {
      const { data: dossier, error: dErr0 } = await supabase
        .from("pilotage_pipeline")
        .select("*")
        .eq("id", dossier_id)
        .single();
      if (dErr0 || !dossier) return json({ error: "Dossier introuvable" }, 404);

      const { count } = await supabase
        .from("pilotage_devis")
        .select("*", { count: "exact", head: true });
      const numero = `ATR-2026-${String((count ?? 0) + 1).padStart(4, "0")}`;

      const brief = [
        `Prénom / nom : ${dossier.nom}`,
        dossier.activite ? `Activité : ${dossier.activite}` : null,
        dossier.besoin   ? `Besoin : ${dossier.besoin}` : null,
        dossier.contexte ? `Contexte : ${dossier.contexte}` : null,
        dossier.famille  ? `Famille déjà choisie : ${dossier.famille}` : null,
        `Nombre d'utilisateurs : ${dossier.nb_users || "1"}`,
        `Zone : ${dossier.zone || "France"}`,
      ].filter(Boolean).join("\n");

      const parsed = await callClaudeBareme(brief);
      if (parsed.__error) return json({ error: parsed.__error, raw: parsed.__raw }, 502);

      const { data: devis, error: insErr } = await supabase
        .from("pilotage_devis")
        .insert({
          dossier_id, numero,
          famille: parsed.famille, niveau: parsed.niveau, devise: parsed.devise,
          setup_ht: parsed.setup_ht, mrr: parsed.mrr, acompte: parsed.acompte,
          solde: parsed.solde, total_m1: parsed.total_m1,
          raisonnement: parsed.raisonnement, questions_manquantes: parsed.questions_manquantes,
          statut: "brouillon",
        })
        .select()
        .single();
      if (insErr) return json({ error: insErr.message }, 500);

      return json({ devis_id: devis.id, numero, ...parsed });
    }

    // ─── Mode legacy (app Assists, MacCockpitScreen) — table prospects ───
    const { data: prospect, error: pErr } = await supabase
      .from("prospects")
      .select("*")
      .eq("id", prospect_id)
      .single();
    if (pErr || !prospect) return json({ error: "Prospect introuvable" }, 404);

    // Compter les devis existants pour numérotation
    const { count } = await supabase
      .from("devis_prospects")
      .select("*", { count: "exact", head: true });
    const numero = `ATR-2026-${String((count ?? 0) + 1).padStart(4, "0")}`;

    const brief = [
      `Prénom : ${prospect.prenom}`,
      prospect.activite   ? `Activité : ${prospect.activite}` : null,
      prospect.besoin     ? `Besoin : ${prospect.besoin}` : null,
      prospect.contexte   ? `Contexte : ${prospect.contexte}` : null,
      `Type de projet : ${prospect.type_projet || "app"}`,
      `Nombre d'utilisateurs : ${prospect.nb_users || "1"}`,
      `Zone : ${prospect.zone || "EU"}`,
    ].filter(Boolean).join("\n");

    const parsed = await callClaudeBareme(brief);
    if (parsed.__error) return json({ error: parsed.__error, raw: parsed.__raw }, 502);

    // Sauvegarder le devis brouillon
    const { data: devis, error: dErr } = await supabase
      .from("devis_prospects")
      .insert({
        prospect_id,
        numero,
        famille:             parsed.famille,
        niveau:              parsed.niveau,
        devise:              parsed.devise,
        setup_ht:            parsed.setup_ht,
        mrr:                 parsed.mrr,
        acompte:             parsed.acompte,
        solde:               parsed.solde,
        total_m1:            parsed.total_m1,
        raisonnement:        parsed.raisonnement,
        questions_manquantes: parsed.questions_manquantes,
        statut:              "brouillon",
      })
      .select()
      .single();
    if (dErr) return json({ error: dErr.message }, 500);

    // Log journal
    await supabase.from("journal_agent").insert({
      type:        "devis_genere",
      agent_id:    "devis",
      prospect_id,
      titre:       `Devis ${numero} généré pour ${prospect.prenom} — ${parsed.niveau} (${parsed.devise})`,
      details:     { famille: parsed.famille, niveau: parsed.niveau, total_m1: parsed.total_m1 },
    });

    return json({ devis_id: devis.id, numero, ...parsed });
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

async function callClaudeBareme(brief: string): Promise<any> {
  const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: BAREME_SYSTEM,
      messages: [{ role: "user", content: brief }],
    }),
  });

  const apiData = await apiRes.json();
  const raw = (apiData?.content ?? [])
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("")
    .trim();

  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return { __error: "JSON invalide", __raw: raw };
  }
}

// creal-public — la seule porte publique de boutiquecreal.com
//
// Remplace à elle seule trois dépendances à Attractor Assists, mis en pause le
// 06/08/2026 : le RPC get_catalogue, le mode public de chat-assistant, et le
// RPC save_order.
//
// POURQUOI UNE EDGE FUNCTION ET PAS DU REST DIRECT.
// Parce qu'une commande est une écriture. La seule façon d'écrire depuis un
// navigateur en REST direct serait une policy INSERT publique, c'est-à-dire
// « WITH CHECK (true) », c'est-à-dire la faille fermée dans Assists le
// 15/07/2026 : la clé anon est publique par nature, donc n'importe qui peut
// insérer n'importe quoi. Ici, la table n'accepte aucune écriture publique et
// c'est cette fonction, en service role, qui écrit après avoir vérifié.
//
// Le prompt de Zoé ne sort jamais d'ici. Il est lu côté serveur et envoyé à
// Anthropic. Le navigateur ne le voit pas : c'est un actif de l'activité de
// Marie Kezey, pas une donnée de page.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY       = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

// R-22 : sans traitement du préflight, l'appel échoue en silence depuis le
// navigateur. C'est ce qui avait cassé la notification de J'Envoie Express.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const db = createClient(SUPABASE_URL, SERVICE_KEY);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST")    return json({ error: "Méthode non autorisée" }, 405);

  try {
    const body   = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");

    if (action === "catalogue") return await catalogue();
    if (action === "historique") return await historique(body);
    if (action === "chat")      return await chat(body);
    if (action === "commande")  return await commande(body);

    return json({ error: "Action inconnue" }, 400);
  } catch (e) {
    console.error("creal-public", e);
    return json({ error: "Erreur serveur" }, 500);
  }
});

// ── Catalogue ───────────────────────────────────────────────────────────────
// La boutique n'a plus de produits en dur : tout vient d'ici, donc ce que Kezey
// modifie dans son tableau de bord se voit chez ses clientes.
async function catalogue() {
  const { data, error } = await db
    .from("cr_produits")
    .select("id, nom, etiquette, prix, unite, categorie, photo_url, poids, kcal, preparation, description, detail")
    .eq("actif", true)
    .order("ordre");

  if (error) return json({ error: "Catalogue indisponible" }, 500);

  const { data: cfg } = await db
    .from("cr_config")
    .select("whatsapp, lien_wave, numero_om")
    .single();

  // Le prompt n'est volontairement pas dans cette réponse.
  return json({ produits: data ?? [], config: cfg ?? null });
}

// ── Historique de conversation ──────────────────────────────────────────────
async function historique(body: Record<string, unknown>) {
  const convId = String(body.conversation_id ?? "");
  if (!isUuid(convId)) return json({ history: [] });

  const { data: msgs } = await db
    .from("cr_messages")
    .select("role, contenu")
    .eq("conversation_id", convId)
    .order("created_at", { ascending: true });

  return json({
    history: (msgs ?? []).map((m: { role: string; contenu: string }) => ({
      from: m.role === "user" ? "me" : "bot",
      text: m.contenu,
    })),
  });
}

// ── Zoé ─────────────────────────────────────────────────────────────────────
async function chat(body: Record<string, unknown>) {
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) return json({ error: "Aucun message" }, 400);

  // Garde-fou de coût : une page ouverte en boucle ne doit pas envoyer un fil
  // de mille tours à Anthropic. On garde les 20 derniers échanges.
  const recent = messages.slice(-20) as Array<{ from: string; text: string }>;

  const { data: cfg } = await db
    .from("cr_config")
    .select("prompt_zoe")
    .single();

  if (!cfg?.prompt_zoe) return json({ error: "Assistante indisponible" }, 503);

  // Catalogue injecté à chaque tour, pour que Zoé ne cite jamais un prix périmé
  // ni un produit retiré.
  let catalogueBlock = "";
  const { data: produits } = await db
    .from("cr_produits")
    .select("nom, prix, unite, categorie")
    .eq("actif", true)
    .order("categorie");

  if (produits && produits.length > 0) {
    const lines = produits
      .map((p: { nom: string; prix: number; unite: string; categorie: string | null }) => {
        const cat = p.categorie ? ` [${p.categorie}]` : "";
        return `- ${p.nom}${cat} : ${p.prix} ${p.unite || "FCFA"}`;
      })
      .join("\n");
    catalogueBlock =
      `\n\nCATALOGUE ACTUEL :\n${lines}\n` +
      `Si une cliente demande un produit absent de cette liste, dis-lui que tu vérifies et que Kezey revient vers elle rapidement. N'invente jamais un produit ni un prix.`;
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: cfg.prompt_zoe + catalogueBlock,
      messages: recent.map((m) => ({
        role: m.from === "me" ? "user" : "assistant",
        content: m.text,
      })),
    }),
  });

  const data  = await res.json();
  const reply = nettoyer(data?.content?.[0]?.text ?? "");

  // Si Anthropic ne répond pas, on le dit avec le vrai numéro plutôt que de
  // laisser la cliente devant une phrase creuse.
  if (!reply) {
    const { data: cfg2 } = await db.from("cr_config").select("whatsapp").single();
    const wa = cfg2?.whatsapp ?? "";
    return json({
      reply: `Je rencontre un souci technique. Écrivez directement à Kezey sur WhatsApp au +${wa.slice(0, 3)} ${wa.slice(3)}.`,
      conversation_id: body.conversation_id ?? null,
    });
  }

  // Journal de la conversation. Non bloquant : une écriture ratée ne doit
  // jamais empêcher une cliente de recevoir sa réponse.
  let convId = isUuid(String(body.conversation_id ?? "")) ? String(body.conversation_id) : null;
  try {
    if (!convId) {
      const { data: conv } = await db
        .from("cr_conversations")
        .insert({ titre: "Conversation cliente" })
        .select("id")
        .single();
      convId = conv?.id ?? null;
    }
    if (convId) {
      const lastUser = recent[recent.length - 1];
      await db.from("cr_messages").insert([
        { conversation_id: convId, role: "user",      contenu: lastUser?.text ?? "" },
        { conversation_id: convId, role: "assistant", contenu: reply },
      ]);
      await db.from("cr_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
    }
  } catch { /* non bloquant, volontairement */ }

  return json({ reply, conversation_id: convId });
}

// ── Commande ────────────────────────────────────────────────────────────────
// Les prix ne sont JAMAIS repris du navigateur. Une commande dont le total
// arrive du client est une commande dont le client fixe le total.
async function commande(body: Record<string, unknown>) {
  const nom     = texte(body.client_nom, 80);
  const wa      = texte(body.client_wa, 30);
  const adresse = texte(body.adresse, 200);
  const moyen   = body.moyen === "om" ? "om" : "wave";
  const paniers = Array.isArray(body.lignes) ? body.lignes : [];

  if (!nom || !wa)          return json({ error: "Nom et WhatsApp requis" }, 400);
  if (paniers.length === 0) return json({ error: "Panier vide" }, 400);
  if (paniers.length > 40)  return json({ error: "Panier trop grand" }, 400);

  const ids = paniers
    .map((l: Record<string, unknown>) => String(l.produit_id ?? ""))
    .filter(isUuid);
  if (ids.length === 0) return json({ error: "Panier invalide" }, 400);

  const { data: produits } = await db
    .from("cr_produits")
    .select("id, nom, prix")
    .in("id", ids)
    .eq("actif", true);

  if (!produits || produits.length === 0) return json({ error: "Produits introuvables" }, 400);

  const lignes: Array<Record<string, unknown>> = [];
  let total = 0;

  for (const l of paniers as Array<Record<string, unknown>>) {
    const p = produits.find((x: { id: string }) => x.id === String(l.produit_id));
    if (!p) continue;
    const qty = Math.min(99, Math.max(1, Math.floor(Number(l.qty) || 0)));
    const sousTotal = p.prix * qty;
    lignes.push({ produit_id: p.id, nom: p.nom, qty, prix_unit: p.prix, total: sousTotal });
    total += sousTotal;
  }

  if (lignes.length === 0) return json({ error: "Panier invalide" }, 400);

  const { data, error } = await db
    .from("cr_commandes")
    .insert({ client_nom: nom, client_wa: wa, adresse, lignes, total, moyen })
    .select("id, total")
    .single();

  if (error) {
    console.error("insert commande", error);
    return json({ error: "Commande non enregistrée" }, 500);
  }

  // Le total recalculé est renvoyé : si le panier du navigateur avait dérivé,
  // c'est ce chiffre-là qui fait foi.
  return json({ id: data.id, total: data.total });
}

// ── Anti AI-slop, R-50 ──────────────────────────────────────────────────────
// Zoé parle à des mamans dans WhatsApp, pas dans un éditeur de texte. Des
// astérisques autour d'un nom de farine, ça se lit « **Mix C'real** » et ça
// signe la machine.
//
// Le nettoyage se fait ICI et pas dans le prompt. Leçon de la session 97 :
// l'interdiction écrite dans le prompt a été vérifiée, elle ne suffit pas, le
// modèle remet des astérisques et des dièses. Seul le code est déterministe.
function nettoyer(t: string): string {
  return t
    .replace(/\*\*([^*]+)\*\*/g, "$1")     // gras
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1$2") // italique, sans casser 4*200g
    .replace(/^#{1,6}\s+/gm, "")           // titres
    .replace(/^\s*[-•]\s+/gm, "- ")        // puces, normalisées
    .replace(/`([^`]+)`/g, "$1")           // code
    .replace(/—/g, ", ")              // tirets longs, préférence maison
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ── Utilitaires ─────────────────────────────────────────────────────────────
function texte(v: unknown, max: number): string {
  return String(v ?? "").trim().slice(0, max);
}

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "content-type": "application/json" },
  });
}

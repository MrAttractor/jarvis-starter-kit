// ============================================================
// Club Privé Élévia — identité et connexion (CDC, Module 1)
//
// Toutes les écritures passent ici, en service role : les tables el_*
// ont RLS active et aucune policy, donc la clé publique ne lit rien.
// Le membre s'authentifie par un code à 6 chiffres reçu par e-mail,
// sans mot de passe à retenir (exigence du CDC).
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const norm = (s: unknown) => String(s ?? "").trim().toLowerCase();
const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function sha256(txt: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparaison à temps constant : ne pas fuiter le code par le temps de réponse. */
function egal(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

const nouveauCode = () =>
  String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");

const nouveauJeton = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(36).padStart(2, "0")).join("").slice(0, 48);

/** 18 ans révolus à la date du jour. */
function estMajeur(iso: string): boolean {
  const d = new Date(iso + "T00:00:00Z");
  if (isNaN(d.getTime())) return false;
  const limite = new Date();
  limite.setUTCFullYear(limite.getUTCFullYear() - 18);
  return d.getTime() <= limite.getTime();
}

async function envoyerCode(email: string, pseudo: string, code: string): Promise<boolean> {
  if (!RESEND_KEY) return false;
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#FBF9F5;font-family:'Segoe UI',system-ui,sans-serif;color:#181614">
    <div style="max-width:520px;margin:0 auto;padding:32px 20px">
      <div style="text-align:center;margin-bottom:28px">
        <div style="font-family:Georgia,serif;font-size:26px;letter-spacing:.12em;color:#181614">ÉLÉVIA</div>
        <div style="font-size:10px;letter-spacing:.28em;color:#B99A63;margin-top:6px">CLUB PRIVÉ</div>
      </div>
      <div style="background:#fff;border:1px solid #EAE4D8;border-radius:14px;padding:32px 28px;text-align:center">
        <p style="font-size:15px;color:#6B6459;margin:0 0 22px">Bonjour ${esc(pseudo)}, voici votre code de connexion.</p>
        <div style="font-family:Georgia,serif;font-size:38px;letter-spacing:.18em;color:#181614;font-weight:700">${code}</div>
        <p style="font-size:13px;color:#8F887C;margin:22px 0 0">Il est valable 10 minutes et ne fonctionne qu'une fois.</p>
      </div>
      <p style="text-align:center;font-size:11px;color:#8F887C;margin-top:22px;line-height:1.6">
        Vous n'êtes pas à l'origine de cette demande ? Ignorez ce message, aucun accès n'est ouvert.
      </p>
    </div></body></html>`;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Club Élévia <hello@agenceattractor.com>",
        to: [email],
        subject: `${code} — votre code de connexion Élévia`,
        html,
        text: `Bonjour ${pseudo}, votre code de connexion Élévia est ${code}. Il est valable 10 minutes.`,
      }),
    });
    return r.ok;
  } catch (_) {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const { action, ...p } = await req.json();

    // ── Inscription ──────────────────────────────────────────
    if (action === "inscription") {
      const pseudo = String(p.pseudo ?? "").trim();
      const email = norm(p.email);
      const { genre, pays, date_naissance, cgu, optin } = p;

      if (pseudo.length < 3 || pseudo.length > 24) return json({ ok: false, error: "Le pseudo doit contenir entre 3 et 24 caractères." }, 400);
      if (!/^[\p{L}\p{N} _.-]+$/u.test(pseudo)) return json({ ok: false, error: "Le pseudo contient un caractère non autorisé." }, 400);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ ok: false, error: "Cette adresse e-mail ne semble pas valide." }, 400);
      if (genre !== "femme" && genre !== "homme") return json({ ok: false, error: "Veuillez indiquer votre genre." }, 400);
      if (!pays) return json({ ok: false, error: "Veuillez indiquer votre pays de résidence." }, 400);
      if (!cgu) return json({ ok: false, error: "L'acceptation des conditions est nécessaire pour rejoindre le Club." }, 400);
      // Contrôle de majorité côté serveur : la base le refuse aussi (contrainte el_membres_majeur).
      if (!estMajeur(String(date_naissance))) {
        return json({ ok: false, error: "L'adhésion au Club est réservée aux personnes majeures." }, 400);
      }

      const { data: membre, error } = await db.from("el_membres").insert({
        pseudo, pseudo_norm: norm(pseudo), email, email_norm: email,
        genre, pays, date_naissance,
        cgu_acceptees: true, optin_email: !!optin,
      }).select("id, pseudo").single();

      if (error) {
        if (error.code === "23505") {
          const pris = String(error.message).includes("pseudo");
          return json({ ok: false, champ: pris ? "pseudo" : "email",
            error: pris ? "Ce pseudo est déjà porté par un membre." : "Un compte existe déjà avec cette adresse." }, 409);
        }
        if (String(error.message).includes("el_membres_majeur")) {
          return json({ ok: false, error: "L'adhésion au Club est réservée aux personnes majeures." }, 400);
        }
        return json({ ok: false, error: error.message }, 500);
      }

      await db.from("el_evenements").insert({ membre_id: membre.id, type: "inscription", meta: { pays, genre } });
      const code = nouveauCode();
      await db.from("el_codes").insert({ email_norm: email, code_hash: await sha256(code) });
      const envoye = await envoyerCode(email, membre.pseudo, code);
      await db.from("el_evenements").insert({ membre_id: membre.id, type: "code_envoye", meta: { accepte: envoye } });
      return json({ ok: true, email_envoye: envoye, pseudo: membre.pseudo });
    }

    // ── Demande de code (connexion) ──────────────────────────
    if (action === "connexion") {
      const email = norm(p.email);
      const { data: membre } = await db.from("el_membres")
        .select("id, pseudo, statut").eq("email_norm", email).maybeSingle();

      // Réponse identique que le compte existe ou non : ne pas révéler qui est membre.
      if (membre && membre.statut === "actif") {
        const code = nouveauCode();
        await db.from("el_codes").insert({ email_norm: email, code_hash: await sha256(code) });
        const envoye = await envoyerCode(email, membre.pseudo, code);
        await db.from("el_evenements").insert({ membre_id: membre.id, type: "code_envoye", meta: { accepte: envoye } });
      }
      return json({ ok: true });
    }

    // ── Vérification du code ─────────────────────────────────
    if (action === "verifier") {
      const email = norm(p.email);
      const saisi = String(p.code ?? "").trim();

      const { data: ligne } = await db.from("el_codes")
        .select("id, code_hash, tentatives, consomme, expire_at")
        .eq("email_norm", email).eq("consomme", false)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();

      if (!ligne) return json({ ok: false, error: "Aucun code en cours. Demandez-en un nouveau." }, 400);
      if (new Date(ligne.expire_at) < new Date()) return json({ ok: false, error: "Ce code a expiré. Demandez-en un nouveau." }, 400);
      if (ligne.tentatives >= 5) return json({ ok: false, error: "Trop de tentatives. Demandez un nouveau code." }, 429);

      if (!egal(await sha256(saisi), ligne.code_hash)) {
        await db.from("el_codes").update({ tentatives: ligne.tentatives + 1 }).eq("id", ligne.id);
        await db.from("el_evenements").insert({ type: "echec_code", meta: { email } });
        return json({ ok: false, error: "Ce code ne correspond pas." }, 400);
      }

      await db.from("el_codes").update({ consomme: true }).eq("id", ligne.id);
      const { data: membre } = await db.from("el_membres")
        .select("id, pseudo, genre, pays, statut_verif, created_at").eq("email_norm", email).single();

      const jeton = nouveauJeton();
      await db.from("el_sessions").insert({ jeton, membre_id: membre.id });
      await db.from("el_membres").update({ derniere_connexion: new Date().toISOString() }).eq("id", membre.id);
      await db.from("el_evenements").insert({ membre_id: membre.id, type: "connexion" });
      return json({ ok: true, jeton, membre });
    }

    // ── Profil courant ───────────────────────────────────────
    if (action === "moi") {
      const { data: sess } = await db.from("el_sessions")
        .select("membre_id, expire_at").eq("jeton", String(p.jeton ?? "")).maybeSingle();
      if (!sess || new Date(sess.expire_at) < new Date()) return json({ ok: false, error: "Session expirée." }, 401);
      const { data: membre } = await db.from("el_membres")
        .select("id, pseudo, genre, pays, statut_verif, created_at").eq("id", sess.membre_id).single();
      return json({ ok: true, membre });
    }

    // ── Déconnexion ──────────────────────────────────────────
    if (action === "deconnexion") {
      await db.from("el_sessions").delete().eq("jeton", String(p.jeton ?? ""));
      return json({ ok: true });
    }

    return json({ ok: false, error: "Action inconnue." }, 400);
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
});

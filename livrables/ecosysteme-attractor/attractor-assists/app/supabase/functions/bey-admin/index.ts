// ============================================================
// bey-admin — LA BEYNAUMANIA, côté artiste (Serge)
// Gaté par JWT : le caller doit être connecté ET son UID == BEY_ADMIN_UID.
// Actions : stats, broadcast, content_(list|add|toggle),
//           comments_recent, comment_moderate, photo_(add|list|toggle|delete),
//           classement.
// ============================================================
import { envoyer, type Abonnement, type Reglages } from "../_partage/webpush.ts";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// Liste blanche d'UID admin (séparés par virgule). Rétrocompatible avec un seul UID.
const ADMIN_UIDS = (Deno.env.get("BEY_ADMIN_UID") ?? "")
  .split(",").map((s) => s.trim()).filter(Boolean);
const BUCKET = "bey-photos";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function sb(path: string, opts: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json", ...(opts.headers || {}),
    },
  });
}
async function countRows(table: string, filter = ""): Promise<number> {
  const r = await sb(`${table}?select=*${filter}`, { headers: { Prefer: "count=exact", Range: "0-0" } });
  return parseInt((r.headers.get("content-range") || "*/0").split("/")[1] || "0", 10) || 0;
}


// ── Notifications : les reglages VAPID, lus une fois ──
function reglagesPush(): Reglages | null {
  const brut = Deno.env.get("VAPID_PRIVATE_JWK") ?? "";
  const publique = Deno.env.get("VAPID_PUBLIC") ?? "";
  const sujet = Deno.env.get("VAPID_SUBJECT") ?? "";
  if (!brut || !publique || !sujet) return null;
  try { return { publique, sujet, priveeJwk: JSON.parse(brut) as JsonWebKey }; }
  catch (_) { return null; }
}

/** Previent tous les abonnes. Renvoie ce qui est REELLEMENT parti, pas le
 *  nombre de membres : le tableau de bord annoncait "envoye a N" alors que
 *  rien ne partait, et Serge croyait avoir touche sa communaute. */
async function prevenirTous(titre: string, corps: string, url: string) {
  const r = reglagesPush();
  if (!r) return { envoyes: 0, echecs: 0, nettoyes: 0, configure: false };

  const abos = await (await sb("bey_push?select=id,endpoint,p256dh,auth")).json();
  const liste: any[] = Array.isArray(abos) ? abos : [];
  if (!liste.length) return { envoyes: 0, echecs: 0, nettoyes: 0, configure: true };

  // L'identifiant sert de tag cote telephone : sans lui, iOS remplace la
  // notification precedente en silence au lieu d'en afficher une nouvelle.
  const message = JSON.stringify({ titre, corps, url, id: crypto.randomUUID() });
  let envoyes = 0, echecs = 0;
  const perimes: string[] = [];

  // Par paquets : quelques milliers d'abonnes lances d'un coup epuisent les
  // connexions sortantes de la fonction.
  const PAQUET = 40;
  for (let i = 0; i < liste.length; i += PAQUET) {
    const lot = liste.slice(i, i + PAQUET);
    const res = await Promise.all(
      lot.map((x) => envoyer({ endpoint: x.endpoint, p256dh: x.p256dh, auth: x.auth } as Abonnement, message, r)),
    );
    res.forEach((v, k) => {
      if (v.ok) envoyes++;
      else { echecs++; if (v.perime) perimes.push(lot[k].id); }
    });
  }

  // Un abonnement mort le reste : on le retire plutot que de le retenter a
  // chaque publication pendant des mois.
  if (perimes.length) {
    await sb(`bey_push?id=in.(${perimes.join(",")})`, { method: "DELETE" });
  }
  return { envoyes, echecs, nettoyes: perimes.length, configure: true };
}

/* Prevenir n'etait branche QUE sur le mot de Serge. Depuis la refonte du 13/09
   le fil est unique : une photo, une video et un sondage y sont des publications
   comme les autres. Serge a publie une photo le 14/09, personne n'a rien recu.
   Toute publication previent donc, et renvoie ce qui est REELLEMENT parti. */
function reponsePublication(base: Record<string, unknown>, p: { envoyes: number; echecs: number; nettoyes: number; configure: boolean }, abonnes: number) {
  return { ok: true, ...base, notifies: p.envoyes, echecs: p.echecs, nettoyes: p.nettoyes, push_configure: p.configure, abonnes };
}

/* Une legende vide ne doit pas produire une notification vide : on retombe sur
   une phrase qui dit au moins de quoi il s'agit. */
function corpsNotif(texte: unknown, defaut: string) {
  const t = String(texte ?? "").trim();
  if (!t) return defaut;
  return t.length > 120 ? t.slice(0, 117) + "..." : t;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

  try {
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ ok: false, error: "non authentifié" }, 401);
    const ures = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${token}` },
    });
    if (!ures.ok) return json({ ok: false, error: "session invalide" }, 401);
    const user = await ures.json();
    if (!user?.id || ADMIN_UIDS.length === 0 || !ADMIN_UIDS.includes(user.id))
      return json({ ok: false, error: "accès refusé" }, 403);

    const d = await req.json();
    const action = d.action;

    // ── STATS ──
    if (action === "stats") {
      const total = await countRows("bey_membres");
      const ambassadeurs = await countRows("bey_membres", "&grade=eq.ambassadeur");
      const topAmb = await (await sb(`bey_membres?filleuls=gt.0&order=filleuls.desc,created_at.asc&limit=10&select=prenom,lieu,filleuls,grade`)).json();
      const recents = await (await sb(`bey_membres?order=created_at.desc&limit=15&select=prenom,lieu,grade,filleuls,created_at`)).json();
      let lieux: any[] = [];
      try { const rl = await sb(`rpc/bey_stats_lieu`, { method: "POST", body: "{}" }); if (rl.ok) lieux = await rl.json(); } catch (_) {}
      const nbMessages = await countRows("bey_messages");
      const nbComments = await countRows("bey_commentaires");
      return json({ ok: true, total, ambassadeurs, topAmb, recents, lieux, nbMessages, nbComments });
    }

    // ── BROADCAST ──
    if (action === "broadcast") {
      const contenu = String(d.contenu ?? "").trim();
      if (!contenu) return json({ ok: false, error: "message vide" });
      const res = await sb("bey_messages", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ contenu }) });
      if (!res.ok) return json({ ok: false, error: await res.text() });

      // Le mot est ecrit. Reste a prevenir ceux qui l'ont accepte.
      const p = await prevenirTous(
        "Serge Beynaud",
        contenu.length > 120 ? contenu.slice(0, 117) + "..." : contenu,
        "/beynaud/fan",
      );
      // On renvoie ce qui est parti pour de vrai. L'ancienne reponse annoncait
      // le nombre de membres, alors qu'aucune notification n'existait.
      return json({
        ok: true,
        notifies: p.envoyes,
        echecs: p.echecs,
        nettoyes: p.nettoyes,
        push_configure: p.configure,
        abonnes: await countRows("bey_push"),
        membres: await countRows("bey_membres"),
      });
    }

    /* Les mots deja diffuses. Ils n'etaient listes nulle part : Serge publiait
       et ne pouvait plus ni les relire, ni corriger une faute, ni retirer une
       annonce perimee. Meme manque que pour les videos, trouve le 14/09. */
    if (action === "message_list") {
      return json({ ok: true, messages: await (await sb(`bey_messages?order=created_at.desc&limit=60&select=*`)).json() });
    }
    if (action === "message_update") {
      if (!d.id) return json({ ok: false, error: "id requis" });
      const contenu = String(d.contenu ?? "").trim();
      if (!contenu) return json({ ok: false, error: "message vide" });
      // Une correction ne renotifie pas : les fans ont deja ete prevenus.
      const res = await sb(`bey_messages?id=eq.${encodeURIComponent(d.id)}`, {
        method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ contenu }),
      });
      if (!res.ok) return json({ ok: false, error: await res.text() });
      const rows = await res.json();
      if (!Array.isArray(rows) || !rows.length) return json({ ok: false, error: "message introuvable" });
      return json({ ok: true, message: rows[0] });
    }
    if (action === "message_delete") {
      if (!d.id) return json({ ok: false, error: "id requis" });
      // Les coeurs et commentaires partent avec, par declencheur (R-76).
      const res = await sb(`bey_messages?id=eq.${encodeURIComponent(d.id)}`, { method: "DELETE" });
      if (!res.ok) return json({ ok: false, error: await res.text() });
      return json({ ok: true });
    }

    // ── CONTENUS ──
    /* ── LES CODES D'ACCES ─────────────────────────────────────────────
       Serge genere un lot, le vend par le moyen qu'il veut, et suit ce qu'il
       lui reste. Les codes ne sont JAMAIS renvoyes en entier une fois generes :
       cette action les rend UNE fois, au moment ou on les fabrique, pour qu'il
       les copie. Les relire plus tard donnerait a quiconque ouvre ce tableau de
       bord la liste des acces gratuits. */
    if (action === "codes_generer") {
      const contenu = String(d.contenu_id ?? "");
      const combien = Number(d.combien) || 0;
      if (!contenu) return json({ ok: false, error: "contenu requis" });
      if (combien < 1 || combien > 2000) return json({ ok: false, error: "entre 1 et 2000 codes" });
      const r = await sb("rpc/bey_generer_codes", {
        method: "POST",
        body: JSON.stringify({ p_contenu: contenu, p_combien: combien, p_lot: d.lot ? String(d.lot) : null }),
      });
      if (!r.ok) return json({ ok: false, error: await r.text() });
      const lignes = await r.json();
      return json({ ok: true, codes: Array.isArray(lignes) ? lignes.map((x: any) => x.code) : [] });
    }

    if (action === "codes_etat") {
      const contenu = String(d.contenu_id ?? "");
      if (!contenu) return json({ ok: false, error: "contenu requis" });
      const r = await sb("rpc/bey_etat_codes", { method: "POST", body: JSON.stringify({ p_contenu: contenu }) });
      if (!r.ok) return json({ ok: false, error: await r.text() });
      return json({ ok: true, lots: await r.json() });
    }

    if (action === "content_list") {
      return json({ ok: true, contenus: await (await sb(`bey_contenus?order=ordre.asc&select=*`)).json() });
    }
    if (action === "content_add") {
      const titre = String(d.titre ?? "").trim(), url = String(d.youtube_url ?? "").trim();
      if (!titre || !url) return json({ ok: false, error: "titre + lien requis" });
      const res = await sb("bey_contenus", {
        method: "POST", headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          titre, youtube_url: url, description: d.description ? String(d.description) : null,
          type: (d.type === "video" || d.type === "live") ? d.type : "serie",
          grade_requis: d.grade_requis === "ambassadeur" ? "ambassadeur" : "membre",
          // Un grade se gagne, un billet s'achete : deux champs, jamais un seul.
          // Le second est volontairement en "=== true" et non en truthy, pour
          // qu'une chaine vide ou un "false" venu d'un formulaire ne rende
          // jamais un contenu payant par accident.
          billet_requis: d.billet_requis === true,
          ordre: Number(d.ordre) || 99,
        }),
      });
      if (!res.ok) return json({ ok: false, error: await res.text() });
      const contenu = (await res.json())[0];
      const p = await prevenirTous("Serge Beynaud", corpsNotif(d.description || titre, "Du nouveau contenu dans la Beynaumania."), "/beynaud/fan");
      return json(reponsePublication({ contenu }, p, await countRows("bey_push")));
    }
    /* Corriger un contenu. Il manquait : un lien YouTube mal colle ne pouvait
       plus etre repare, ni le titre change. Serge n'avait qu'un interrupteur
       "masquer", ce qui laisse la ligne fautive en base pour toujours.
       Une correction NE PREVIENT PAS : les fans ont deja ete notifies a la
       publication, une faute de frappe corrigee ne vaut pas une notification. */
    if (action === "content_update") {
      if (!d.id) return json({ ok: false, error: "id requis" });
      const champs: Record<string, unknown> = {};
      if (d.titre !== undefined) {
        const t = String(d.titre).trim();
        if (!t) return json({ ok: false, error: "titre vide" });
        champs.titre = t;
      }
      if (d.youtube_url !== undefined) {
        const u = String(d.youtube_url).trim();
        if (!u) return json({ ok: false, error: "lien vide" });
        champs.youtube_url = u;
      }
      if (d.billet_requis !== undefined) {
        // On accepte de RETIRER un billet exige autant que d'en poser un : un
        // contenu passe en payant par erreur doit pouvoir redevenir libre sans
        // repasser par la base.
        champs.billet_requis = d.billet_requis === true;
      }
      if (d.description !== undefined) champs.description = String(d.description).trim() || null;
      if (d.grade_requis !== undefined) champs.grade_requis = d.grade_requis === "ambassadeur" ? "ambassadeur" : "membre";
      if (d.ordre !== undefined) champs.ordre = Number(d.ordre) || 99;
      if (d.type !== undefined) champs.type = (d.type === "video" || d.type === "live") ? d.type : "serie";
      if (!Object.keys(champs).length) return json({ ok: false, error: "rien à modifier" });
      const res = await sb(`bey_contenus?id=eq.${encodeURIComponent(d.id)}`, {
        method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(champs),
      });
      if (!res.ok) return json({ ok: false, error: await res.text() });
      const rows = await res.json();
      if (!Array.isArray(rows) || !rows.length) return json({ ok: false, error: "contenu introuvable" });
      return json({ ok: true, contenu: rows[0] });
    }

    /* Supprimer un contenu. Les coeurs et commentaires qui le visaient partent
       avec lui : depuis la migration 0005 la cle etrangere n'existe plus, ce
       sont des declencheurs qui s'en chargent (R-76). Rien a faire ici. */
    if (action === "content_delete") {
      if (!d.id) return json({ ok: false, error: "id requis" });
      const res = await sb(`bey_contenus?id=eq.${encodeURIComponent(d.id)}`, { method: "DELETE" });
      if (!res.ok) return json({ ok: false, error: await res.text() });
      return json({ ok: true });
    }

    if (action === "content_toggle") {
      if (!d.id) return json({ ok: false, error: "id requis" });
      const res = await sb(`bey_contenus?id=eq.${encodeURIComponent(d.id)}`, { method: "PATCH", body: JSON.stringify({ actif: !!d.actif }) });
      if (!res.ok) return json({ ok: false, error: await res.text() });
      return json({ ok: true });
    }

    // ── MODÉRATION COMMENTAIRES ──
    if (action === "comments_recent") {
      // La migration 0005 a retire la cle etrangere vers bey_messages : on ne
      // peut plus imbriquer le post parent. On le retrouve par son type, en une
      // requete par type present, et on renvoie un libelle deja pret a afficher.
      const brut = await (await sb(`bey_commentaires?order=created_at.desc&limit=40&select=id,prenom,contenu,masque,motif,created_at,cible_type,cible_id`)).json();
      const rows = Array.isArray(brut) ? brut : [];
      const TABLES: Record<string, [string, string, string]> = {
        message: ["bey_messages", "contenu", "Sur le mot"],
        photo: ["bey_photos", "legende", "Sur la photo"],
        contenu: ["bey_contenus", "titre", "Sur la video"],
        sondage: ["bey_sondages", "question", "Sur le sondage"],
      };
      const parType: Record<string, string[]> = {};
      for (const x of rows) (parType[x.cible_type] ||= []).push(x.cible_id);
      const texte: Record<string, string> = {};
      for (const t of Object.keys(parType)) {
        const spec = TABLES[t];
        const ids = [...new Set(parType[t])];
        if (!spec || !ids.length) continue;
        const r = await (await sb(`${spec[0]}?id=in.(${ids.join(",")})&select=id,${spec[1]}`)).json();
        for (const row of (Array.isArray(r) ? r : [])) texte[t + ":" + row.id] = String(row[spec[1]] ?? "");
      }
      for (const x of rows) {
        const spec = TABLES[x.cible_type];
        const t = texte[x.cible_type + ":" + x.cible_id] || "";
        // Un post supprime laisse son libelle vide : on le dit, plutot que
        // d'afficher un commentaire qui semble ne porter sur rien.
        x.cible_libelle = spec ? (t ? spec[2] + ' : "' + t.slice(0, 60) + '"' : spec[2] + " (supprime)") : "";
      }
      return json({ ok: true, commentaires: rows });
    }
    if (action === "comment_moderate") {
      if (!d.id) return json({ ok: false, error: "id requis" });
      if (d.mode === "delete") {
        const res = await sb(`bey_commentaires?id=eq.${encodeURIComponent(d.id)}`, { method: "DELETE" });
        if (!res.ok) return json({ ok: false, error: await res.text() });
        return json({ ok: true });
      }
      const res = await sb(`bey_commentaires?id=eq.${encodeURIComponent(d.id)}`, { method: "PATCH", body: JSON.stringify({ masque: d.mode === "mask" }) });
      if (!res.ok) return json({ ok: false, error: await res.text() });
      return json({ ok: true });
    }

    // ── PHOTOS ──
    if (action === "photo_add") {
      let b64 = String(d.data ?? "");
      const comma = b64.indexOf(",");
      if (b64.startsWith("data:") && comma > -1) b64 = b64.slice(comma + 1);
      if (!b64) return json({ ok: false, error: "image manquante" });
      let bytes: Uint8Array;
      try { bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)); }
      catch (_) { return json({ ok: false, error: "image invalide" }); }
      // Le type vient de l'image elle-meme, il n'est plus decrete ici. Le
      // telephone envoie du WebP quand il sait en faire (deux fois plus leger a
      // qualite egale, mesure du 17/09), et du JPEG sinon. Ecrire ".jpg" en dur
      // sur des octets WebP donnait un fichier qui ment sur son contenu : ca
      // s'affiche quand meme, parce que les navigateurs reniflent, et c'est
      // exactement le genre de dette qu'on ne voit jamais jusqu'au jour ou un
      // outil, lui, fait confiance a l'extension.
      const TYPES: Record<string, string> = {
        "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png",
      };
      const declare = /^data:([a-z/+-]+);base64,/i.exec(String(d.data ?? ""))?.[1]?.toLowerCase() ?? "";
      const mime = TYPES[declare] ? declare : "image/jpeg";
      const path = crypto.randomUUID() + "." + TYPES[mime];
      const up = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
        method: "POST",
        headers: {
          apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": mime,
          // Supabase pose "no-cache" par defaut : chaque ouverture de l'app
          // refaisait un aller-retour reseau pour CHAQUE photo, ce qui se paie
          // en attente sur une 3G ivoirienne. Le nom du fichier est un UUID,
          // donc son contenu ne changera jamais : un an, et immuable.
          "Cache-Control": "public, max-age=31536000, immutable",
        },
        body: bytes,
      });
      if (!up.ok) return json({ ok: false, error: "upload: " + (await up.text()) });
      const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
      const res = await sb("bey_photos", {
        method: "POST", headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          url, legende: d.legende ? String(d.legende) : null,
          grade_requis: d.grade_requis === "ambassadeur" ? "ambassadeur" : "membre",
        }),
      });
      if (!res.ok) return json({ ok: false, error: await res.text() });
      const photo = (await res.json())[0];
      const p = await prevenirTous("Serge Beynaud", corpsNotif(d.legende, "Une nouvelle photo dans la Beynaumania."), "/beynaud/fan");
      return json(reponsePublication({ photo }, p, await countRows("bey_push")));
    }
    if (action === "photo_list") {
      return json({ ok: true, photos: await (await sb(`bey_photos?order=created_at.desc&select=*`)).json() });
    }
    if (action === "photo_toggle") {
      if (!d.id) return json({ ok: false, error: "id requis" });
      const res = await sb(`bey_photos?id=eq.${encodeURIComponent(d.id)}`, { method: "PATCH", body: JSON.stringify({ actif: !!d.actif }) });
      if (!res.ok) return json({ ok: false, error: await res.text() });
      return json({ ok: true });
    }
    if (action === "photo_delete") {
      if (!d.id) return json({ ok: false, error: "id requis" });
      const rows = await (await sb(`bey_photos?id=eq.${encodeURIComponent(d.id)}&select=url`)).json();
      await sb(`bey_photos?id=eq.${encodeURIComponent(d.id)}`, { method: "DELETE" });
      if (Array.isArray(rows) && rows[0]?.url) {
        const p = String(rows[0].url).split(`/${BUCKET}/`)[1];
        if (p) await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${p}`, { method: "DELETE", headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }).catch(() => {});
      }
      return json({ ok: true });
    }

    // ── SONDAGES ──
    if (action === "poll_add") {
      const question = String(d.question ?? "").trim();
      const options = Array.isArray(d.options) ? d.options.map((o: any) => String(o).trim()).filter(Boolean) : [];
      if (!question || options.length < 2) return json({ ok: false, error: "question + 2 options minimum" });
      const res = await sb("bey_sondages", {
        method: "POST", headers: { Prefer: "return=representation" },
        body: JSON.stringify({ question, options, grade_requis: d.grade_requis === "ambassadeur" ? "ambassadeur" : "membre" }),
      });
      if (!res.ok) return json({ ok: false, error: await res.text() });
      const sondage = (await res.json())[0];
      const p = await prevenirTous("Serge Beynaud", corpsNotif(question, "Serge te pose une question."), "/beynaud/fan");
      return json(reponsePublication({ sondage }, p, await countRows("bey_push")));
    }
    if (action === "poll_list") {
      const sondages = await (await sb(`bey_sondages?order=created_at.desc&select=*`)).json();
      if (Array.isArray(sondages) && sondages.length) {
        const sids = sondages.map((s: any) => s.id);
        const votes = await (await sb(`bey_votes?sondage_id=in.(${sids.join(",")})&select=sondage_id,option_index`)).json();
        const cnt: Record<string, number[]> = {};
        for (const s of sondages) cnt[s.id] = new Array((s.options || []).length).fill(0);
        for (const v of (votes || [])) if (cnt[v.sondage_id] && v.option_index < cnt[v.sondage_id].length) cnt[v.sondage_id][v.option_index]++;
        for (const s of sondages) { s.counts = cnt[s.id]; s.total = cnt[s.id].reduce((a: number, b: number) => a + b, 0); }
      }
      return json({ ok: true, sondages: sondages || [] });
    }
    if (action === "poll_toggle") {
      if (!d.id) return json({ ok: false, error: "id requis" });
      const res = await sb(`bey_sondages?id=eq.${encodeURIComponent(d.id)}`, { method: "PATCH", body: JSON.stringify({ actif: !!d.actif }) });
      if (!res.ok) return json({ ok: false, error: await res.text() });
      return json({ ok: true });
    }
    if (action === "poll_delete") {
      if (!d.id) return json({ ok: false, error: "id requis" });
      const res = await sb(`bey_sondages?id=eq.${encodeURIComponent(d.id)}`, { method: "DELETE" });
      if (!res.ok) return json({ ok: false, error: await res.text() });
      return json({ ok: true });
    }


    // ── CLASSEMENT : ce que Serge lit face camera ──
    // Vingt places et non dix : il commente aussi ceux qui montent, pas
    // seulement ceux qui gagnent. C'est ce qui donne envie aux autres.
    if (action === "classement") {
      const saisons = await (await sb("bey_saisons?active=is.true&select=nom,debut,fin&limit=1")).json();
      const saison = Array.isArray(saisons) && saisons.length ? saisons[0] : null;
      const podium = await (await sb(
        "v_bey_classement?order=points.desc,inscrits.desc,prenom.asc&limit=20&select=prenom,lieu,points,inscrits,rang",
      )).json();
      const liste = Array.isArray(podium) ? podium : [];
      return json({
        ok: true,
        saison,
        podium: liste,
        // De quoi dire une phrase vraie en video : combien ont vraiment joue.
        joueurs: liste.filter((x: any) => (x.inscrits || 0) > 0).length,
        confirmes: liste.reduce((n: number, x: any) => n + (x.points || 0), 0),
        abonnes: await countRows("bey_push"),
      });
    }

    return json({ ok: false, error: "action inconnue" });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 200);
  }
});

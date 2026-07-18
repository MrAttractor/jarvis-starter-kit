// ============================================================
// bey-admin — LA BEYNAUMANIA, côté artiste (Serge)
// Gaté par JWT : le caller doit être connecté ET son UID == BEY_ADMIN_UID.
// Actions : stats, broadcast, content_(list|add|toggle),
//           comments_recent, comment_moderate, photo_(add|list|toggle|delete).
// ============================================================
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
      const total = await countRows("bey_membres");
      const res = await sb("bey_messages", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ contenu }) });
      if (!res.ok) return json({ ok: false, error: await res.text() });
      return json({ ok: true, envoye_a: total });
    }

    // ── CONTENUS ──
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
          ordre: Number(d.ordre) || 99,
        }),
      });
      if (!res.ok) return json({ ok: false, error: await res.text() });
      return json({ ok: true, contenu: (await res.json())[0] });
    }
    if (action === "content_toggle") {
      if (!d.id) return json({ ok: false, error: "id requis" });
      const res = await sb(`bey_contenus?id=eq.${encodeURIComponent(d.id)}`, { method: "PATCH", body: JSON.stringify({ actif: !!d.actif }) });
      if (!res.ok) return json({ ok: false, error: await res.text() });
      return json({ ok: true });
    }

    // ── MODÉRATION COMMENTAIRES ──
    if (action === "comments_recent") {
      const c = await (await sb(`bey_commentaires?order=created_at.desc&limit=40&select=id,prenom,contenu,masque,motif,created_at,message_id,bey_messages(contenu)`)).json();
      return json({ ok: true, commentaires: c });
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
      const path = crypto.randomUUID() + ".jpg";
      const up = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
        method: "POST",
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "image/jpeg" },
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
      return json({ ok: true, photo: (await res.json())[0] });
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
      return json({ ok: true, sondage: (await res.json())[0] });
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

    return json({ ok: false, error: "action inconnue" });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 200);
  }
});

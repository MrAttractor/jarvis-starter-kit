// ============================================================
// bey-public — BEYNAUD ARMY, côté fan (pas de JWT, service role)
// Actions : join, me, feed (contenu + messages + likes + commentaires + photos),
//           like (toggle), comment_add.
// Sécurité : RLS bloque l'accès direct ; service role uniquement.
// On n'expose jamais le WhatsApp des autres membres.
// ============================================================
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const AMB_THRESHOLD = 5;

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
async function countRows(table: string, filter: string): Promise<number> {
  const r = await sb(`${table}?${filter}&select=*`, { headers: { Prefer: "count=exact", Range: "0-0" } });
  return parseInt((r.headers.get("content-range") || "*/0").split("/")[1] || "0", 10) || 0;
}
const normWa = (s: unknown) => String(s ?? "").trim().replace(/[^\d+]/g, "");
const slug = (s: unknown) =>
  (String(s ?? "FAN").toUpperCase().normalize("NFD").replace(/[^A-Z]/g, "").slice(0, 6) || "FAN");
function makeCode(prenom: unknown) {
  const r = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3).padEnd(3, "X");
  return slug(prenom) + r;
}
const pub = (m: any) => ({
  id: m.id, prenom: m.prenom, lieu: m.lieu,
  code_ambassadeur: m.code_ambassadeur, grade: m.grade, filleuls: m.filleuls,
});
const esc = (s: unknown) => String(s ?? "");

// ── Auto-modération hybride : filtre de mots (instantané) + IA (Claude Haiku) ──
const BANSET = new Set([
  "con", "cons", "connard", "connards", "connasse", "connasses", "salaud", "salauds",
  "salope", "salopes", "pute", "putes", "putain", "putains", "encule", "encules", "enculer",
  "enfoire", "enfoires", "merde", "merdes", "batard", "batards", "ntm", "nique", "niquer", "niquez",
  "fdp", "pd", "pede", "pedes", "tapette", "tapettes", "abruti", "abrutis", "debile", "debiles",
  "cretin", "cretins", "bouffon", "bouffons", "clochard", "clochards", "negre", "negres",
  "bougnoule", "bougnoules", "gnata", "couillon", "couillons", "tocard", "tocards", "raciste", "racistes",
]);
const HARD = ["salope", "encule", "putain", "connard", "bougnoule", "bougnol", "enculer"];
function normalizeTxt(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e").replace(/4/g, "a")
    .replace(/5/g, "s").replace(/7/g, "t").replace(/@/g, "a").replace(/\$/g, "s");
}
function blocklistHit(text: string): boolean {
  const n = normalizeTxt(text);
  const tokens = n.split(/[^a-z]+/).filter(Boolean);
  for (const t of tokens) if (BANSET.has(t)) return true;
  const collapsed = n.replace(/[^a-z]/g, "");
  for (const w of HARD) if (collapsed.includes(w)) return true;
  return false;
}
async function aiModerate(text: string): Promise<{ toxic: boolean; motif: string } | null> {
  if (!ANTHROPIC_API_KEY) return null;
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 4500);
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", signal: ctrl.signal,
      headers: { "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001", max_tokens: 60,
        system:
          "Tu es un modérateur de commentaires pour la page officielle d'un artiste ivoirien (Serge Beynaud). " +
          'Réponds UNIQUEMENT par un JSON: {"toxique":true|false,"motif":"raison courte"}. ' +
          "toxique=true seulement si le commentaire contient une insulte, du harcèlement, du racisme, une menace, du contenu sexuel explicite, du spam ou une arnaque. " +
          "Le nouchi et l'argot ivoirien amical ne sont PAS toxiques. En cas de doute, toxique=false.",
        messages: [{ role: "user", content: String(text).slice(0, 500) }],
      }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    const txt = d?.content?.[0]?.text || "";
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const j = JSON.parse(m[0]);
    return { toxic: !!j.toxique, motif: String(j.motif || "signalé par l'IA") };
  } catch (_) {
    return null; // fail-open : on ne bloque pas le fan si l'IA est indisponible
  } finally {
    clearTimeout(to);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

  try {
    const d = await req.json();
    const action = d.action;

    // ── JOIN ──
    if (action === "join") {
      const wa = normWa(d.whatsapp);
      const prenom = String(d.prenom ?? "").trim();
      if (!prenom || wa.replace(/\D/g, "").length < 6)
        return json({ ok: false, error: "Prénom et WhatsApp valides requis." });
      const ex = await (await sb(`bey_membres?whatsapp=eq.${encodeURIComponent(wa)}&select=*`)).json();
      if (Array.isArray(ex) && ex.length) return json({ ok: true, membre: pub(ex[0]), returning: true });

      const ref = d.ref ? String(d.ref).toUpperCase().replace(/[^A-Z0-9]/g, "") : null;
      let inserted: any = null;
      for (let i = 0; i < 6 && !inserted; i++) {
        const res = await sb("bey_membres", {
          method: "POST", headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            prenom, whatsapp: wa, lieu: d.lieu ? String(d.lieu).trim() : null,
            code_ambassadeur: makeCode(prenom), parraine_par: ref,
          }),
        });
        if (res.ok) { inserted = (await res.json())[0]; break; }
        const t = await res.text();
        if (t.includes("whatsapp")) {
          const again = await (await sb(`bey_membres?whatsapp=eq.${encodeURIComponent(wa)}&select=*`)).json();
          if (again.length) return json({ ok: true, membre: pub(again[0]), returning: true });
          return json({ ok: false, error: "inscription impossible" });
        }
      }
      if (!inserted) return json({ ok: false, error: "inscription impossible" });
      if (ref) {
        const p = await (await sb(`bey_membres?code_ambassadeur=eq.${encodeURIComponent(ref)}&select=id,filleuls,grade`)).json();
        if (Array.isArray(p) && p.length) {
          const nf = (p[0].filleuls || 0) + 1;
          const patch: any = { filleuls: nf };
          if (nf >= AMB_THRESHOLD && p[0].grade !== "ambassadeur") patch.grade = "ambassadeur";
          await sb(`bey_membres?id=eq.${p[0].id}`, { method: "PATCH", body: JSON.stringify(patch) });
        }
      }
      return json({ ok: true, membre: pub(inserted) });
    }

    // ── ME ──
    if (action === "me") {
      let q = "";
      if (d.id) q = `id=eq.${encodeURIComponent(d.id)}`;
      else if (d.whatsapp) q = `whatsapp=eq.${encodeURIComponent(normWa(d.whatsapp))}`;
      else return json({ ok: false, error: "id ou whatsapp requis" });
      const m = await (await sb(`bey_membres?${q}&select=*`)).json();
      if (!Array.isArray(m) || !m.length) return json({ ok: false, error: "introuvable" });
      return json({ ok: true, membre: pub(m[0]) });
    }

    // ── FEED : contenu + messages(+likes/comments) + photos ──
    if (action === "feed") {
      const grade = d.grade === "ambassadeur" ? "ambassadeur" : "membre";
      const gate = grade === "ambassadeur" ? "" : "&grade_requis=eq.membre";
      const membreId = d.membre_id ? String(d.membre_id) : null;

      const contenus = await (await sb(
        `bey_contenus?actif=eq.true${gate}&order=ordre.asc&select=id,titre,description,type,youtube_url,cover_url,grade_requis`,
      )).json();
      const photos = await (await sb(
        `bey_photos?actif=eq.true${gate}&order=created_at.desc&limit=30&select=id,url,legende,grade_requis,created_at`,
      )).json();
      const messages = await (await sb(
        `bey_messages?order=created_at.desc&limit=20&select=id,contenu,created_at`,
      )).json();

      if (Array.isArray(messages) && messages.length) {
        const ids = messages.map((m: any) => m.id);
        const inList = `(${ids.join(",")})`;
        const reactions = await (await sb(`bey_reactions?message_id=in.${inList}&select=message_id,membre_id`)).json();
        const comments = await (await sb(
          `bey_commentaires?message_id=in.${inList}&masque=eq.false&order=created_at.asc&select=id,message_id,prenom,contenu,created_at`,
        )).json();
        const likeCount: Record<string, number> = {};
        const likedByMe: Record<string, boolean> = {};
        for (const r of (reactions || [])) {
          likeCount[r.message_id] = (likeCount[r.message_id] || 0) + 1;
          if (membreId && r.membre_id === membreId) likedByMe[r.message_id] = true;
        }
        const commByMsg: Record<string, any[]> = {};
        for (const c of (comments || [])) (commByMsg[c.message_id] ||= []).push(c);
        for (const m of messages) {
          m.likes = likeCount[m.id] || 0;
          m.liked = !!likedByMe[m.id];
          m.comments = commByMsg[m.id] || [];
        }
      }
      // Sondages actifs (gatés) + résultats + vote du membre
      const sondages = await (await sb(
        `bey_sondages?actif=eq.true${gate}&order=created_at.desc&select=id,question,options,grade_requis,created_at`,
      )).json();
      if (Array.isArray(sondages) && sondages.length) {
        const sids = sondages.map((s: any) => s.id);
        const votes = await (await sb(`bey_votes?sondage_id=in.(${sids.join(",")})&select=sondage_id,membre_id,option_index`)).json();
        const cnt: Record<string, number[]> = {};
        const mine: Record<string, number> = {};
        for (const s of sondages) cnt[s.id] = new Array((s.options || []).length).fill(0);
        for (const v of (votes || [])) {
          if (cnt[v.sondage_id] && v.option_index < cnt[v.sondage_id].length) cnt[v.sondage_id][v.option_index]++;
          if (membreId && v.membre_id === membreId) mine[v.sondage_id] = v.option_index;
        }
        for (const s of sondages) {
          s.counts = cnt[s.id];
          s.total = cnt[s.id].reduce((a: number, b: number) => a + b, 0);
          s.mon_vote = (s.id in mine) ? mine[s.id] : null;
        }
      }
      return json({ ok: true, contenus, messages, photos, sondages: sondages || [] });
    }

    // ── VOTE (1 par fan / sondage) ──
    if (action === "vote") {
      const mid = String(d.membre_id ?? ""), sid = String(d.sondage_id ?? "");
      const oi = Number(d.option_index);
      if (!mid || !sid || !Number.isInteger(oi) || oi < 0) return json({ ok: false, error: "vote invalide" });
      await sb("bey_votes", {
        method: "POST", headers: { Prefer: "resolution=ignore-duplicates" },
        body: JSON.stringify({ sondage_id: sid, membre_id: mid, option_index: oi }),
      });
      const sond = await (await sb(`bey_sondages?id=eq.${encodeURIComponent(sid)}&select=options`)).json();
      const n = (sond?.[0]?.options || []).length;
      const votes = await (await sb(`bey_votes?sondage_id=eq.${encodeURIComponent(sid)}&select=membre_id,option_index`)).json();
      const counts = new Array(n).fill(0);
      let mon: number | null = null;
      for (const v of (votes || [])) { if (v.option_index < n) counts[v.option_index]++; if (v.membre_id === mid) mon = v.option_index; }
      return json({ ok: true, counts, total: counts.reduce((a: number, b: number) => a + b, 0), mon_vote: mon });
    }

    // ── LIKE (toggle) ──
    if (action === "like") {
      const mid = String(d.membre_id ?? ""), msg = String(d.message_id ?? "");
      if (!mid || !msg) return json({ ok: false, error: "membre_id + message_id requis" });
      if (d.on) {
        await sb("bey_reactions", {
          method: "POST", headers: { Prefer: "resolution=ignore-duplicates" },
          body: JSON.stringify({ message_id: msg, membre_id: mid }),
        });
      } else {
        await sb(`bey_reactions?message_id=eq.${encodeURIComponent(msg)}&membre_id=eq.${encodeURIComponent(mid)}`, { method: "DELETE" });
      }
      const likes = await countRows("bey_reactions", `message_id=eq.${encodeURIComponent(msg)}`);
      return json({ ok: true, likes, liked: !!d.on });
    }

    // ── COMMENT_ADD ──
    if (action === "comment_add") {
      const mid = String(d.membre_id ?? ""), msg = String(d.message_id ?? "");
      const contenu = String(d.contenu ?? "").trim().slice(0, 500);
      if (!mid || !msg || !contenu) return json({ ok: false, error: "commentaire vide" });
      const m = await (await sb(`bey_membres?id=eq.${encodeURIComponent(mid)}&select=prenom`)).json();
      if (!Array.isArray(m) || !m.length) return json({ ok: false, error: "membre inconnu" });

      // Auto-modération hybride : filtre de mots puis IA. Flaggé = masqué (Serge révise).
      let masque = false, motif: string | null = null;
      if (blocklistHit(contenu)) { masque = true; motif = "Filtre de mots"; }
      else { const ai = await aiModerate(contenu); if (ai && ai.toxic) { masque = true; motif = "IA : " + ai.motif; } }

      const res = await sb("bey_commentaires", {
        method: "POST", headers: { Prefer: "return=representation" },
        body: JSON.stringify({ message_id: msg, membre_id: mid, prenom: m[0].prenom, contenu, masque, motif }),
      });
      if (!res.ok) return json({ ok: false, error: await res.text() });
      const c = (await res.json())[0];
      return json({
        ok: true, masque,
        commentaire: { id: c.id, prenom: c.prenom, contenu: c.contenu, created_at: c.created_at },
      });
    }

    return json({ ok: false, error: "action inconnue" });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 200);
  }
});

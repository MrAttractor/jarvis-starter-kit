// ============================================================
// bey-public — BEYNAUD ARMY, côté fan (pas de JWT, service role)
// Actions : join, me, feed (un seul fil : mots + photos + videos + sondages),
//           vote, like (bascule), comment_add.
// Depuis la migration 0005 les coeurs et les commentaires visent un couple
// (cible_type, cible_id), donc n'importe quel post du fil et plus seulement
// un "mot de Serge".
// Sécurité : RLS bloque l'accès direct ; service role uniquement.
// On n'expose jamais le WhatsApp des autres membres.
// ============================================================
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const AMB_THRESHOLD = 5;
// Doit rester aligne sur la contrainte bey_*_cible_type_chk de la migration 0005.
const CIBLES = new Set(["message", "photo", "contenu", "sondage"]);

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

    // -- FEED : un seul fil chronologique, plus les lives epingles --
    // Les quatre origines (mot de Serge, photo, video, sondage) deviennent des
    // posts de meme nature. Le live n'en est pas un : il est ponctuel et reste
    // en tete, il ne doit pas redescendre dans le fil au fil des jours.
    if (action === "feed") {
      const grade = d.grade === "ambassadeur" ? "ambassadeur" : "membre";
      const gate = grade === "ambassadeur" ? "" : "&grade_requis=eq.membre";
      const membreId = d.membre_id ? String(d.membre_id) : null;
      const j = (path: string) => sb(path).then((r) => r.json()).catch(() => []);
      const arr = (x: unknown) => (Array.isArray(x) ? x : []);

      const [contenus, photos, messages, sondages] = await Promise.all([
        j(`bey_contenus?actif=eq.true${gate}&order=created_at.desc&select=id,titre,description,type,youtube_url,cover_url,grade_requis,created_at`),
        j(`bey_photos?actif=eq.true${gate}&order=created_at.desc&limit=60&select=id,url,legende,grade_requis,created_at`),
        j(`bey_messages?order=created_at.desc&limit=40&select=id,contenu,created_at`),
        j(`bey_sondages?actif=eq.true${gate}&order=created_at.desc&select=id,question,options,grade_requis,created_at`),
      ]);

      const lives = arr(contenus).filter((c: any) => c.type === "live");
      const videos = arr(contenus).filter((c: any) => c.type !== "live");

      const fil: any[] = [];
      for (const m of arr(messages)) {
        fil.push({ type: "message", id: m.id, created_at: m.created_at, contenu: m.contenu });
      }
      for (const p of arr(photos)) {
        fil.push({ type: "photo", id: p.id, created_at: p.created_at, url: p.url, legende: p.legende, grade_requis: p.grade_requis });
      }
      for (const c of arr(videos)) {
        // "format" et non "type" : ici type dit la place dans le fil, format dit
        // la nature de la video. Les confondre casserait le rendu.
        fil.push({ type: "contenu", id: c.id, created_at: c.created_at, titre: c.titre, description: c.description, format: c.type, youtube_url: c.youtube_url, cover_url: c.cover_url, grade_requis: c.grade_requis });
      }
      for (const q of arr(sondages)) {
        fil.push({ type: "sondage", id: q.id, created_at: q.created_at, question: q.question, options: q.options || [], grade_requis: q.grade_requis });
      }

      fil.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

      // Coeurs et commentaires de tout le fil en deux requetes, pas une par post.
      if (fil.length) {
        const inList = `(${fil.map((p) => p.id).join(",")})`;
        const [reactions, comments] = await Promise.all([
          j(`bey_reactions?cible_id=in.${inList}&select=cible_type,cible_id,membre_id`),
          j(`bey_commentaires?cible_id=in.${inList}&masque=eq.false&order=created_at.asc&select=id,cible_type,cible_id,prenom,contenu,created_at`),
        ]);
        const cle = (t: string, i: string) => t + ":" + i;
        const likeCount: Record<string, number> = {};
        const likedByMe: Record<string, boolean> = {};
        for (const r of arr(reactions)) {
          const k = cle(r.cible_type, r.cible_id);
          likeCount[k] = (likeCount[k] || 0) + 1;
          if (membreId && r.membre_id === membreId) likedByMe[k] = true;
        }
        const commBy: Record<string, any[]> = {};
        for (const c of arr(comments)) {
          (commBy[cle(c.cible_type, c.cible_id)] ||= []).push({ id: c.id, prenom: c.prenom, contenu: c.contenu, created_at: c.created_at });
        }
        for (const p of fil) {
          const k = cle(p.type, p.id);
          p.likes = likeCount[k] || 0;
          p.liked = !!likedByMe[k];
          p.comments = commBy[k] || [];
        }
      }

      // Resultats des sondages du fil, et le vote de ce membre.
      const sids = fil.filter((p) => p.type === "sondage").map((p) => p.id);
      if (sids.length) {
        const votes = await j(`bey_votes?sondage_id=in.(${sids.join(",")})&select=sondage_id,membre_id,option_index`);
        for (const p of fil) {
          if (p.type !== "sondage") continue;
          const counts = new Array((p.options || []).length).fill(0);
          let mon: number | null = null;
          for (const v of arr(votes)) {
            if (v.sondage_id !== p.id) continue;
            if (v.option_index < counts.length) counts[v.option_index]++;
            if (membreId && v.membre_id === membreId) mon = v.option_index;
          }
          p.counts = counts;
          p.total = counts.reduce((a: number, b: number) => a + b, 0);
          p.mon_vote = mon;
        }
      }

      // Compatibilite : l'ecran deja en ligne attend encore les quatre listes
      // separees. On les renvoie a cote du fil, alimentees par les memes
      // calculs, pour qu'un fan dont l'onglet est ouvert ne voie rien casser
      // pendant la bascule. A retirer quand fan.html ne lira plus que "fil".
      const parId: Record<string, any> = {};
      for (const p of fil) parId[p.type + ":" + p.id] = p;
      const enrichir = (t: string, ligne: any) => {
        const p = parId[t + ":" + ligne.id];
        if (!p) return ligne;
        ligne.likes = p.likes; ligne.liked = p.liked; ligne.comments = p.comments;
        if (t === "sondage") { ligne.counts = p.counts; ligne.total = p.total; ligne.mon_vote = p.mon_vote; }
        return ligne;
      };
      return json({
        ok: true,
        fil,
        lives,
        contenus: arr(contenus).map((c: any) => enrichir("contenu", c)),
        photos: arr(photos).map((p: any) => enrichir("photo", p)),
        messages: arr(messages).map((m: any) => enrichir("message", m)),
        sondages: arr(sondages).map((q: any) => enrichir("sondage", q)),
      });
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

    // -- Quelle cible ? --
    // message_id est l'ancien nom du parametre. Un onglet peut rester ouvert
    // des jours sur un telephone : il continuerait de l'envoyer, et le fan
    // verrait son coeur echouer sans rien comprendre. On l'accepte encore.
    const lireCible = (x: any) => {
      const ct = String(x.cible_type ?? (x.message_id ? "message" : ""));
      const ci = String(x.cible_id ?? x.message_id ?? "");
      return CIBLES.has(ct) && ci ? { ct, ci } : null;
    };

    // -- LIKE (bascule), sur n'importe quel post --
    if (action === "like") {
      const mid = String(d.membre_id ?? "");
      const c = lireCible(d);
      if (!mid || !c) return json({ ok: false, error: "membre_id + cible valides requis" });
      const ou = `cible_type=eq.${encodeURIComponent(c.ct)}&cible_id=eq.${encodeURIComponent(c.ci)}`;
      if (d.on) {
        await sb("bey_reactions", {
          method: "POST", headers: { Prefer: "resolution=ignore-duplicates" },
          body: JSON.stringify({ cible_type: c.ct, cible_id: c.ci, membre_id: mid }),
        });
      } else {
        await sb(`bey_reactions?${ou}&membre_id=eq.${encodeURIComponent(mid)}`, { method: "DELETE" });
      }
      const likes = await countRows("bey_reactions", ou);
      return json({ ok: true, likes, liked: !!d.on });
    }

    // -- COMMENT_ADD, sur n'importe quel post --
    if (action === "comment_add") {
      const mid = String(d.membre_id ?? "");
      const c = lireCible(d);
      const contenu = String(d.contenu ?? "").trim().slice(0, 500);
      if (!mid || !c || !contenu) return json({ ok: false, error: "commentaire vide ou cible invalide" });
      const m = await (await sb(`bey_membres?id=eq.${encodeURIComponent(mid)}&select=prenom`)).json();
      if (!Array.isArray(m) || !m.length) return json({ ok: false, error: "membre inconnu" });

      // Auto-moderation hybride : filtre de mots puis IA. Flagge = masque (Serge revise).
      let masque = false, motif: string | null = null;
      if (blocklistHit(contenu)) { masque = true; motif = "Filtre de mots"; }
      else { const ai = await aiModerate(contenu); if (ai && ai.toxic) { masque = true; motif = "IA : " + ai.motif; } }

      const res = await sb("bey_commentaires", {
        method: "POST", headers: { Prefer: "return=representation" },
        body: JSON.stringify({ cible_type: c.ct, cible_id: c.ci, membre_id: mid, prenom: m[0].prenom, contenu, masque, motif }),
      });
      if (!res.ok) return json({ ok: false, error: await res.text() });
      const cm = (await res.json())[0];
      return json({
        ok: true, masque,
        commentaire: { id: cm.id, prenom: cm.prenom, contenu: cm.contenu, created_at: cm.created_at },
      });
    }

    return json({ ok: false, error: "action inconnue" });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 200);
  }
});

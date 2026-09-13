// ============================================================
// bey-public — BEYNAUD ARMY, côté fan (pas de JWT, service role)
// Actions : join, me, feed (un seul fil : mots + photos + videos + sondages),
//           vote, like (bascule), comment_add, profil_maj, compte_supprimer,
//           push_abonner, push_desabonner, classement.
// Depuis le 13/09 le numero n'est plus demande a l'inscription : un prenom
// suffit. Il se donne ensuite, dans l'espace, comme filet de securite.
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
// Combien de posts un visiteur sans compte voit avant la porte.
const APERCU = 3;

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
// Un numero n'existe qu'en UNE forme : indicatif pays precede d'un plus.
// Motif mesure le 13/09 : le meme numero etait entre trois fois dans la base
// sous "+33753902323", "0753902323" et "753902323", donc trois comptes pour
// une personne, et la cle unique ne servait a rien. Le 00 international est
// converti, et un numero sans indicatif est refuse plutot que devine : on ne
// peut pas savoir si 07... est ivoirien ou francais.
const normWa = (s: unknown) => {
  let v = String(s ?? "").trim().replace(/[^\d+]/g, "");
  if (v.startsWith("00")) v = "+" + v.slice(2);
  return v;
};
const waValide = (v: string) => /^\+[1-9]\d{7,14}$/.test(v);
const slug = (s: unknown) =>
  (String(s ?? "FAN").toUpperCase().normalize("NFD").replace(/[^A-Z]/g, "").slice(0, 6) || "FAN");
function makeCode(prenom: unknown) {
  const r = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3).padEnd(3, "X");
  return slug(prenom) + r;
}
const pub = (m: any) => ({
  id: m.id, prenom: m.prenom, lieu: m.lieu,
  code_ambassadeur: m.code_ambassadeur, grade: m.grade, filleuls: m.filleuls,
  // On dit SI un numero est enregistre, jamais lequel. L'ecran a besoin de
  // savoir s'il doit encore proposer le filet de securite, pas de le lire.
  a_numero: !!m.whatsapp,
});
// Comparaison de prenoms tolerante : accents, casse et espaces ne doivent pas
// empecher quelqu'un de retrouver son propre compte.
const pliPrenom = (x: unknown) =>
  String(x ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
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
      const prenom = String(d.prenom ?? "").trim();
      if (!prenom) return json({ ok: false, error: "Ton prénom, stp." });

      // Le numero est facultatif depuis le 13/09. Quand il est donne quand meme,
      // il sert a retrouver un compte existant plutot qu'a en creer un doublon.
      const wa = normWa(d.whatsapp);
      const avecNumero = waValide(wa);
      if (avecNumero) {
        const ex = await (await sb(`bey_membres?whatsapp=eq.${encodeURIComponent(wa)}&select=*`)).json();
        if (Array.isArray(ex) && ex.length) return json({ ok: true, membre: pub(ex[0]), returning: true });
      }

      const ref = d.ref ? String(d.ref).toUpperCase().replace(/[^A-Z0-9]/g, "") : null;
      let inserted: any = null;
      for (let i = 0; i < 6 && !inserted; i++) {
        const res = await sb("bey_membres", {
          method: "POST", headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            prenom, whatsapp: avecNumero ? wa : null,
            lieu: d.lieu ? String(d.lieu).trim() : null,
            code_ambassadeur: makeCode(prenom), parraine_par: ref,
          }),
        });
        if (res.ok) { inserted = (await res.json())[0]; break; }
        const t = await res.text();
        if (avecNumero && t.includes("whatsapp")) {
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
      if (d.id) {
        const m = await (await sb(`bey_membres?id=eq.${encodeURIComponent(String(d.id))}&select=*`)).json();
        if (!Array.isArray(m) || !m.length) return json({ ok: false, error: "introuvable" });
        return json({ ok: true, membre: pub(m[0]) });
      }
      // Reprise par le numero : le prenom est desormais exige EN PLUS. Connaitre
      // le seul numero d'un fan suffisait a entrer dans son compte, ce qui a ete
      // constate le 13/09. Ce n'est pas une verification, c'est un cran de plus :
      // la vraie parade sera un code a usage unique, le jour ou on en enverra.
      if (d.whatsapp) {
        const wa = normWa(d.whatsapp);
        const prenom = pliPrenom(d.prenom);
        if (!prenom) return json({ ok: false, error: "prénom requis" });
        const m = await (await sb(`bey_membres?whatsapp=eq.${encodeURIComponent(wa)}&select=*`)).json();
        if (!Array.isArray(m) || !m.length || pliPrenom(m[0].prenom) !== prenom)
          return json({ ok: false, error: "introuvable" });
        return json({ ok: true, membre: pub(m[0]) });
      }
      return json({ ok: false, error: "id ou whatsapp requis" });
    }

    // ── PROFIL_MAJ : le filet de securite, donne apres coup ──
    if (action === "profil_maj") {
      const mid = String(d.membre_id ?? "");
      if (!mid) return json({ ok: false, error: "membre_id requis" });
      const patch: Record<string, unknown> = {};
      if (d.whatsapp !== undefined) {
        const wa = normWa(d.whatsapp);
        if (wa && !waValide(wa))
          return json({ ok: false, error: "Commence par l'indicatif du pays : +225 pour la Côte d'Ivoire, +33 pour la France." });
        patch.whatsapp = wa || null;
      }
      if (d.lieu !== undefined) patch.lieu = d.lieu ? String(d.lieu).trim().slice(0, 80) : null;
      if (!Object.keys(patch).length) return json({ ok: false, error: "rien à modifier" });

      const res = await sb(`bey_membres?id=eq.${encodeURIComponent(mid)}`, {
        method: "PATCH", headers: { Prefer: "return=representation" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const t = await res.text();
        // Le numero appartient deja a un autre compte : on le dit sans reveler
        // a qui, et sans laisser croire que la modification a eu lieu.
        if (t.includes("whatsapp"))
          return json({ ok: false, error: "Ce numéro est déjà rattaché à un autre compte." });
        return json({ ok: false, error: "modification impossible" });
      }
      const m = (await res.json())[0];
      if (!m) return json({ ok: false, error: "introuvable" });
      return json({ ok: true, membre: pub(m) });
    }

    // ── COMPTE_SUPPRIMER : la desinscription promise a l'ecran ──
    // Elle etait affichee depuis juillet et n'existait pas. R-54 : ce qu'on
    // promet doit etre fait, et prouvable par l'absence.
    if (action === "compte_supprimer") {
      const mid = String(d.membre_id ?? "");
      if (!mid) return json({ ok: false, error: "membre_id requis" });
      const m = await (await sb(`bey_membres?id=eq.${encodeURIComponent(mid)}&select=id,parraine_par`)).json();
      if (!Array.isArray(m) || !m.length) return json({ ok: true, deja: true });

      // Ses commentaires partent avec lui : la cle etrangere les detacherait
      // sans les effacer, et son prenom resterait affiche sous ses messages.
      await sb(`bey_commentaires?membre_id=eq.${encodeURIComponent(mid)}`, { method: "DELETE" });
      // Coeurs et votes tombent par cascade.
      const del = await sb(`bey_membres?id=eq.${encodeURIComponent(mid)}`, { method: "DELETE" });
      if (!del.ok) return json({ ok: false, error: "suppression impossible" });

      // Son parrain perd le filleul qu'il n'a plus. Le grade acquis, lui, reste :
      // il a bien fait le travail, on ne le lui retire pas retroactivement.
      const code = m[0].parraine_par;
      if (code) {
        const p = await (await sb(`bey_membres?code_ambassadeur=eq.${encodeURIComponent(code)}&select=id,filleuls`)).json();
        if (Array.isArray(p) && p.length) {
          await sb(`bey_membres?id=eq.${p[0].id}`, {
            method: "PATCH",
            body: JSON.stringify({ filleuls: Math.max(0, (p[0].filleuls || 0) - 1) }),
          });
        }
      }
      return json({ ok: true });
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
          // Le nombre survit a l'aperçu meme quand les textes sont retires :
          // c'est la preuve sociale, et c'est elle qui donne envie d'entrer.
          p.nb_comments = p.comments.length;
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

      // -- Aperçu : un visiteur sans compte ne recoit que les premiers posts --
      // La coupe est faite ICI et pas a l'ecran. Tronquer a l'affichage
      // laisserait le reste du fil dans la reponse, lisible par quiconque
      // ouvre les outils du navigateur : ce ne serait pas un aperçu.
      const apercu = !membreId;
      let filRendu = fil;
      const totalPosts = fil.length;
      if (apercu) {
        filRendu = fil.slice(0, APERCU);
        for (const p of filRendu) p.comments = [];
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
        fil: filRendu,
        apercu,
        total_posts: totalPosts,
        restants: Math.max(0, totalPosts - filRendu.length),
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


    // ── PUSH_ABONNER : le fan accepte d'etre prevenu ──
    // Un fan a souvent deux appareils. On enregistre chaque appareil, et on
    // reconnait un abonnement deja connu par son endpoint, qui est unique.
    if (action === "push_abonner") {
      const mid = String(d.membre_id ?? "");
      const ab = d.abonnement || {};
      const endpoint = String(ab.endpoint ?? "");
      const p256dh = String((ab.keys || {}).p256dh ?? "");
      const auth = String((ab.keys || {}).auth ?? "");
      if (!mid || !endpoint || !p256dh || !auth)
        return json({ ok: false, error: "abonnement incomplet" });
      if (!/^https:\/\//.test(endpoint)) return json({ ok: false, error: "abonnement invalide" });

      // Le meme appareil peut revenir apres une reinstallation, ou changer de
      // main : on rattache l'endpoint au membre courant plutot que d'echouer.
      const existe = await (await sb(`bey_push?endpoint=eq.${encodeURIComponent(endpoint)}&select=id`)).json();
      if (Array.isArray(existe) && existe.length) {
        await sb(`bey_push?id=eq.${existe[0].id}`, {
          method: "PATCH",
          body: JSON.stringify({ membre_id: mid, p256dh, auth, echecs: 0, vu_le: new Date().toISOString() }),
        });
        return json({ ok: true, deja: true });
      }
      const res = await sb("bey_push", {
        method: "POST",
        body: JSON.stringify({ membre_id: mid, endpoint, p256dh, auth }),
      });
      if (!res.ok) return json({ ok: false, error: "enregistrement impossible" });
      return json({ ok: true });
    }

    // ── PUSH_DESABONNER ──
    if (action === "push_desabonner") {
      const endpoint = String(d.endpoint ?? "");
      if (!endpoint) return json({ ok: false, error: "endpoint requis" });
      await sb(`bey_push?endpoint=eq.${encodeURIComponent(endpoint)}`, { method: "DELETE" });
      return json({ ok: true });
    }


    // ── CLASSEMENT : le concours du meilleur ambassadeur ──
    // Un point se gagne quand un filleul ACTIVE LES NOTIFICATIONS, pas quand
    // il s'inscrit. Depuis que l'inscription ne demande qu'un prenom, se
    // parrainer cinquante fois en fenetre privee prend dix minutes ; exiger la
    // notification rend la fraude de masse tres difficile, et fait recruter des
    // fans joignables plutot que des lignes en base. Le calcul vit dans la vue
    // v_bey_classement, jamais dans un compteur entretenu a la main.
    if (action === "classement") {
      const mid = d.membre_id ? String(d.membre_id) : null;

      const saisons = await (await sb("bey_saisons?active=is.true&select=nom,debut,fin&limit=1")).json();
      const saison = Array.isArray(saisons) && saisons.length ? saisons[0] : null;
      if (!saison) return json({ ok: true, ouvert: false, podium: [], saison: null });

      const finie = new Date(saison.fin).getTime() < Date.now();

      // Le podium : on n'expose que le prenom et la ville, jamais le contact.
      const podium = await (await sb(
        "v_bey_classement?order=points.desc,inscrits.desc,prenom.asc&limit=10&select=prenom,lieu,points,inscrits,rang",
      )).json();

      let moi = null;
      if (mid) {
        const r = await (await sb(
          `v_bey_classement?id=eq.${encodeURIComponent(mid)}&select=prenom,points,inscrits,rang&limit=1`,
        )).json();
        if (Array.isArray(r) && r.length) {
          moi = r[0];
          // L'ecart avec le rang du dessus. Un compteur qui n'indique pas ce
          // qui manque ne motive personne : le fan doit savoir combien il lui
          // reste a faire, pas seulement ou il en est.
          const dessus = await (await sb(
            `v_bey_classement?points=gt.${moi.points}&order=points.asc&limit=1&select=points`,
          )).json();
          moi.manque = (Array.isArray(dessus) && dessus.length)
            ? Math.max(1, dessus[0].points - moi.points)
            : 0;
          // Ce qui est invite mais pas encore confirme : c'est la relance a
          // faire, et c'est la phrase que Serge peut repeter en video.
          moi.en_attente = Math.max(0, (moi.inscrits || 0) - (moi.points || 0));
        }
      }

      return json({
        ok: true,
        ouvert: !finie,
        saison: { nom: saison.nom, debut: saison.debut, fin: saison.fin },
        podium: Array.isArray(podium) ? podium : [],
        moi,
      });
    }

    return json({ ok: false, error: "action inconnue" });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 200);
  }
});

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
import { envoyer, type Abonnement, type Reglages } from "../_partage/webpush.ts";
import { badges } from "../_partage/badges.ts";
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

/* Les reglages de notification, identiques a ceux du cote artiste. */
function reglagesPush(): Reglages | null {
  const brut = Deno.env.get("VAPID_PRIVATE_JWK") ?? "";
  const publique = Deno.env.get("VAPID_PUBLIC") ?? "";
  const sujet = Deno.env.get("VAPID_SUBJECT") ?? "";
  if (!brut || !publique || !sujet) return null;
  try { return { publique, sujet, priveeJwk: JSON.parse(brut) as JsonWebKey }; }
  catch (_) { return null; }
}

/* Previent UN SEUL membre, sur ses propres appareils. Sert a lui confirmer que
   ses notifications marchent, tout de suite apres qu'il les a activees.
   Motif : le 14/09, une notification partait, Apple l'acceptait, et elle
   n'apparaissait nulle part. Sans preuve immediate cote fan, on ne peut que
   deviner. Maintenant il voit, ou il ne voit pas, et on sait. */
async function prevenirUn(membreId: string, titre: string, corps: string) {
  const r = reglagesPush();
  if (!r) return { envoyes: 0, echecs: 0, configure: false };
  const abos = await (await sb(`bey_push?membre_id=eq.${encodeURIComponent(membreId)}&select=id,endpoint,p256dh,auth`)).json();
  const liste: any[] = Array.isArray(abos) ? abos : [];
  if (!liste.length) return { envoyes: 0, echecs: 0, configure: true };
  const message = JSON.stringify({ titre, corps, url: "/beynaud/fan", id: crypto.randomUUID() });
  let envoyes = 0, echecs = 0;
  const perimes: string[] = [];
  const res = await Promise.all(liste.map((x) => envoyer({ endpoint: x.endpoint, p256dh: x.p256dh, auth: x.auth } as Abonnement, message, r)));
  res.forEach((v, k) => { if (v.ok) envoyes++; else { echecs++; if (v.perime) perimes.push(liste[k].id); } });
  if (perimes.length) await sb(`bey_push?id=in.(${perimes.join(",")})`, { method: "DELETE" });
  return { envoyes, echecs, configure: true };
}

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

/* Les lieux, et pourquoi c'est une LISTE et pas un champ libre.
   Latiss veut mettre les zones en competition. Un lieu tape a la main donne
   « Abidjan », « abidjan », « ABJ » et « abj » : quatre zones pour une seule,
   chacune avec un quart des points, et un classement faux sans que ca se voie.
   Ce n'est pas une crainte : sur les DOUZE premiers membres, trois seulement
   avaient renseigne un lieu, et l'un d'eux avait ecrit « togo » — en
   minuscules, et c'est un pays, pas une ville.

   Abidjan n'est PAS decoupee en communes. Arbitre par Mac Arthur le 19/09 :
   la commune est plus fine que ce dont la competition a besoin, et elle
   allonge la liste au moment ou le fan hesite deja.

   Verifie ici et pas seulement dans le formulaire : un formulaire se
   contourne, le serveur non. La meme liste existe dans fan.html ; si les deux
   divergent, le serveur refuse et le fan voit une erreur. Visible, donc
   reparable, contrairement a une donnee fausse qui passe. */
const LIEUX = [
  // Cote d'Ivoire
  "Abidjan", "Bouake", "Yamoussoukro", "Daloa", "Korhogo", "San-Pedro",
  "Man", "Gagnoa", "Abengourou", "Divo", "Autre ville de Cote d'Ivoire",
  // Ailleurs
  "France", "Burkina Faso", "Mali", "Senegal", "Ghana", "Togo",
  "Canada", "Etats-Unis", "Belgique", "Italie", "Autre pays",
];
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
  // Le jeton d'acces personnel. Il n'est renvoye QUE dans la reponse au
  // membre lui-meme (join, me, profil_maj) : pub() n'est jamais applique au
  // dossier de quelqu'un d'autre, et le classement passe par une vue qui ne
  // l'expose pas. C'est une cle porteuse : qui l'a, entre.
  jeton: m.jeton,
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

      /* Le numero est OBLIGATOIRE depuis le 19/09. Il etait facultatif depuis
         le 13/09, et personne ne le donnait jamais : la carte censee le
         demander plus tard a l'interieur n'a jamais ete construite. Resultat,
         le mecanisme anti-doublon du serveur tournait a vide depuis le
         premier jour, et Mac Arthur s'est retrouve avec quatre comptes.
         C'est aussi lui qui fait de la liste des membres autre chose qu'une
         liste de prenoms qu'on ne peut joindre nulle part : le 5 decembre,
         on ne vend pas un billet a un prenom. */
      const wa = normWa(d.whatsapp);
      if (!waValide(wa)) {
        return json({ ok: false, error: "Ton numéro WhatsApp, avec l'indicatif du pays." });
      }

      const lieu = String(d.lieu ?? "").trim();
      if (!LIEUX.includes(lieu)) {
        return json({ ok: false, error: "Choisis ton lieu dans la liste." });
      }

      /* CE NUMERO EST DEJA INSCRIT : ON NE RENVOIE RIEN.
         Avant aujourd'hui, on renvoyait ici le dossier du membre existant,
         son jeton d'acces compris — decrit dans ce fichier meme comme « une
         cle porteuse : qui l'a, entre ». Connaitre le numero de quelqu'un
         suffisait donc a prendre son compte pour de bon. Le defaut dormait :
         aucun ecran n'envoyait de numero. Le rendre obligatoire dans le
         formulaire l'aurait reveille, et n'importe qui aurait pris n'importe
         quel compte en tapant un seul champ.

         Tant que le numero est la seule chose demandee, il IDENTIFIE, il
         n'AUTHENTIFIE pas. Le retour sur son compte passe par « Retrouver mon
         espace », qui exige numero ET prenom — ce qui n'est pas non plus une
         serrure, et c'est pourquoi la suite est un vrai mot de passe. */
      const ex = await (await sb(`bey_membres?whatsapp=eq.${encodeURIComponent(wa)}&select=id`)).json();
      if (Array.isArray(ex) && ex.length) {
        return json({ ok: false, code: "deja_inscrit",
          error: "Ce numéro est déjà inscrit. Utilise « Retrouver mon espace »." });
      }

      const ref = d.ref ? String(d.ref).toUpperCase().replace(/[^A-Z0-9]/g, "") : null;
      let inserted: any = null;
      for (let i = 0; i < 6 && !inserted; i++) {
        const res = await sb("bey_membres", {
          method: "POST", headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            prenom, whatsapp: wa, lieu,
            code_ambassadeur: makeCode(prenom), parraine_par: ref,
          }),
        });
        if (res.ok) { inserted = (await res.json())[0]; break; }
        const t = await res.text();
        /* Deux inscriptions au meme instant avec le meme numero : la base
           refuse la seconde. On ne renvoie PAS le dossier de la premiere,
           pour la meme raison qu'au-dessus. */
        if (t.includes("whatsapp")) {
          return json({ ok: false, code: "deja_inscrit",
            error: "Ce numéro est déjà inscrit. Utilise « Retrouver mon espace »." });
        }
      }
      if (!inserted) return json({ ok: false, error: "inscription impossible" });
      if (ref) {
        // Un seul appel, une seule ecriture. Avant, on LISAIT le compteur puis on
        // le REECRIVAIT : deux personnes qui s'inscrivaient au meme instant sur le
        // meme lien lisaient toutes les deux 5 et ecrivaient toutes les deux 6, et
        // le second parrainage disparaissait sans trace ni erreur. La base
        // verrouille maintenant la ligne le temps de l'increment, donc les appels
        // simultanes se mettent en file au lieu de s'ecraser. Migration 0011.
        // Le passage au grade Ambassadeur est calcule dans le meme mouvement : le
        // separer rouvrirait exactement la meme fenetre pour le grade.
        await sb("rpc/bey_crediter_parrain", {
          method: "POST",
          body: JSON.stringify({ p_code: ref, p_seuil: AMB_THRESHOLD }),
        });
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
      // Reprise par le lien personnel : c'est le chemin normal quand le fan
      // change de navigateur ou ouvre depuis son ecran d'accueil, qui sur
      // iPhone possede son propre stockage, separe de Safari.
      if (d.jeton) {
        const j = String(d.jeton).replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
        if (j.length < 16) return json({ ok: false, error: "introuvable" });
        const m = await (await sb(`bey_membres?jeton=eq.${encodeURIComponent(j)}&select=*`)).json();
        if (!Array.isArray(m) || !m.length) return json({ ok: false, error: "introuvable" });
        return json({ ok: true, membre: pub(m[0]) });
      }
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
      /* ── LE GRADE NE VIENT PLUS DU CLIENT ──────────────────────────────
         Il etait lu dans le corps de la requete et servait directement de
         filtre : `gate` devenait VIDE des que la valeur valait "ambassadeur".
         Un curl anonyme portant {"action":"feed","grade":"ambassadeur"} lisait
         donc tout le contenu reserve, sans compte et sans payer.

         Ce n'etait pas une hypothese : demontre en production le 18/09 sur un
         contenu de test reserve aux Ambassadeurs, lu sans aucun compte, puis
         supprime. Un premier essai n'avait rien montre, pour une mauvaise
         raison, il n'existait alors aucun contenu reserve a faire fuiter.

         Le grade se lit DESORMAIS dans la ligne du membre. Ce que le client
         affirme etre n'entre plus dans la decision : `d.grade` est ignore.
         Sans identification valide, on reste membre, donc filtre. */
      let membreId: string | null = null;
      let grade = "membre";
      const prendreGrade = (m: unknown) => {
        if (!Array.isArray(m) || !m.length) return;
        membreId = String((m[0] as any).id);
        grade = (m[0] as any).grade === "ambassadeur" ? "ambassadeur" : "membre";
      };
      try {
        if (d.jeton) {
          // Le jeton est le chemin authentifie : c'est le meme secret que celui
          // qui sert deja a reprendre son compte depuis un autre appareil.
          const j = String(d.jeton).replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
          if (j) prendreGrade(await (await sb(`bey_membres?jeton=eq.${encodeURIComponent(j)}&select=id,grade`)).json());
        } else if (d.membre_id) {
          // Ancien chemin, garde le temps que les pages ouvertes se rechargent.
          // Il vaut moins que le jeton, un identifiant se recopie, mais il faut
          // au moins connaitre celui d'un vrai membre : ce n'est plus une
          // simple affirmation. Filtre a la forme d'un UUID pour ne jamais
          // laisser passer de fragment de requete.
          const id = String(d.membre_id).toLowerCase();
          if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
            prendreGrade(await (await sb(`bey_membres?id=eq.${id}&select=id,grade`)).json());
          }
        }
      } catch (_) { /* on reste membre, donc filtre : l'echec ne doit jamais ouvrir */ }
      const gate = grade === "ambassadeur" ? "" : "&grade_requis=eq.membre";
      const j = (path: string) => sb(path).then((r) => r.json()).catch(() => []);
      const arr = (x: unknown) => (Array.isArray(x) ? x : []);

      const [contenus, photos, messages, sondages] = await Promise.all([
        j(`bey_contenus?actif=eq.true${gate}&order=created_at.desc&select=id,titre,description,type,youtube_url,cover_url,grade_requis,billet_requis,created_at,vertical`),
        j(`bey_photos?actif=eq.true${gate}&order=created_at.desc&limit=60&select=id,url,legende,grade_requis,created_at`),
        j(`bey_messages?order=created_at.desc&limit=40&select=id,contenu,created_at`),
        j(`bey_sondages?actif=eq.true${gate}&order=created_at.desc&select=id,question,options,grade_requis,created_at`),
      ]);

      /* Les billets du membre, en UNE requete. Le billet est nominatif et ne
         s'obtient par aucun parrainage : un grade se gagne, un billet s'achete.
         Sans membre identifie, l'ensemble est vide, donc tout ce qui est payant
         est verrouille. L'echec de lecture laisse l'ensemble vide lui aussi :
         ici encore, une panne ne doit jamais ouvrir. */
      const billets = new Set<string>();
      if (membreId) {
        try {
          const b = await (await sb(`bey_billets?membre_id=eq.${membreId}&select=contenu_id`)).json();
          if (Array.isArray(b)) for (const x of b) billets.add(String((x as any).contenu_id));
        } catch (_) { /* ferme */ }
      }

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
        /* ── LE CONTENU PAYANT RESTE VISIBLE, SON ADRESSE NON ──
           On ne retire PAS la publication du fil : si elle disparait, personne
           ne sait qu'elle existe, donc personne ne l'achete. On envoie donc le
           titre, la description et l'image, c'est-a-dire l'offre, et on retire
           `youtube_url`, c'est-a-dire l'acces.

           Le verrou est pose ICI, cote serveur, et pas a l'affichage. Une
           adresse envoyee au navigateur est une adresse donnee : un fan qui
           ouvre les outils de developpement la lit, quelle que soit l'apparence
           de la carte. */
        const verrouille = c.billet_requis === true && !billets.has(String(c.id));
        fil.push({ type: "contenu", id: c.id, created_at: c.created_at, titre: c.titre, description: c.description, format: c.type, youtube_url: verrouille ? null : c.youtube_url, cover_url: c.cover_url, grade_requis: c.grade_requis, billet_requis: c.billet_requis === true, verrouille, vertical: c.vertical === true });
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
        const c1 = await prevenirUn(mid, "La Beynaumania", "C'est bon, tu es prévenu quand Latiss publie.");
        return json({ ok: true, deja: true, test: c1.envoyes });
      }
      const res = await sb("bey_push", {
        method: "POST",
        body: JSON.stringify({ membre_id: mid, endpoint, p256dh, auth }),
      });
      if (!res.ok) return json({ ok: false, error: "enregistrement impossible" });
      // Une notification de bienvenue, tout de suite : c'est la seule preuve
      // que la chaine marche de bout en bout, et elle vaut mieux qu'un texte
      // qui promet qu'elle marchera.
      const c2 = await prevenirUn(mid, "La Beynaumania", "C'est bon, tu es prévenu quand Latiss publie.");
      return json({ ok: true, test: c2.envoyes });
    }

    // ── PUSH_DESABONNER ──
    /* Renvoyer une notification a soi-meme, pour verifier sans publier. */
    if (action === "push_test") {
      const mid = String(d.membre_id ?? "");
      if (!mid) return json({ ok: false, error: "membre requis" });
      const c = await prevenirUn(mid, "La Beynaumania", "Test reçu. Tes notifications marchent.");
      return json({ ok: true, envoyes: c.envoyes, echecs: c.echecs, configure: c.configure });
    }

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
    /* ── UTILISER UN CODE D'ACCES ──────────────────────────────────────
       Le fan a paye par le moyen qu'il voulait, Wave, Orange Money ou en main
       propre, on lui a remis un code, il le saisit ici. XPaye est en veille
       depuis le 18/09 et aucune documentation de leur API n'existe : inventer
       leurs endpoints aurait produit du code qui echoue le soir du concert.

       L'identification passe par le JETON, jamais par un identifiant envoye par
       la page : sinon n'importe qui pourrait consommer un code au profit du
       compte de son choix.

       Toute la logique d'usage unique est en base (migration 0013). C'est un
       UPDATE conditionnel qui arbitre, pas ce fichier : deux personnes qui
       saisissent le meme code au meme instant, une seule le prend. */
    if (action === "utiliser_code") {
      const j = String(d.jeton ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
      if (!j) return json({ ok: false, error: "Session expirée." }, 401);
      const m = await (await sb(`bey_membres?jeton=eq.${encodeURIComponent(j)}&select=id`)).json();
      if (!Array.isArray(m) || !m.length) return json({ ok: false, error: "Session expirée." }, 401);

      const code = String(d.code ?? "").trim();
      if (!code) return json({ ok: false, error: "Entre ton code." });

      const r = await sb("rpc/bey_utiliser_code", {
        method: "POST",
        body: JSON.stringify({ p_code: code, p_membre: m[0].id }),
      });
      if (!r.ok) return json({ ok: false, error: "Le code n'a pas pu être vérifié. Réessaie." });
      const lignes = await r.json();
      const etat = Array.isArray(lignes) && lignes.length ? String(lignes[0].etat) : "inconnu";

      // On repond en francais, du point de vue du fan, et on ne dit jamais si un
      // code inconnu existe ailleurs : ca donnerait de quoi en deviner d'autres.
      if (etat === "ok")           return json({ ok: true, etat, message: "C'est bon, l'accès est ouvert." });
      if (etat === "a_toi")        return json({ ok: true, etat, message: "Ce code est déjà le tien, l'accès est ouvert." });
      if (etat === "deja_utilise") return json({ ok: false, etat, error: "Ce code a déjà été utilisé." });
      return json({ ok: false, etat: "inconnu", error: "Ce code n'existe pas. Vérifie les lettres." });
    }

    /* ── BADGES : ce que le fan a gagne, et ce qu'il peut gagner ──
       Aucun badge n'est stocke : la vue rend les compteurs, le catalogue
       partage rend les paliers. Un badge apparait donc a la seconde ou le
       compteur passe, sans tache de fond et sans risque d'oubli.
       Le catalogue est le MEME fichier que celui lu par le tableau de bord de
       Serge : les deux ecrans ne peuvent pas diverger. */
    if (action === "badges") {
      let mid = d.membre_id ? String(d.membre_id) : null;
      if (!mid && d.jeton) {
        const j = String(d.jeton).replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
        if (j.length >= 16) {
          const m = await (await sb(`bey_membres?jeton=eq.${encodeURIComponent(j)}&select=id`)).json();
          if (Array.isArray(m) && m.length) mid = String(m[0].id);
        }
      }
      if (!mid) return json({ ok: false, error: "membre_id requis" });
      const r = await (await sb(
        `v_bey_totaux?id=eq.${encodeURIComponent(mid)}&limit=1` +
          `&select=grade,filleuls,commentaires,votes,coeurs,cloche,arrives_avant`,
      )).json();
      if (!Array.isArray(r) || !r.length) return json({ ok: false, error: "introuvable" });
      const t = r[0];
      const liste = badges(t);
      return json({
        ok: true,
        badges: liste,
        gagnes: liste.filter((b) => b.gagne).length,
        total: liste.length,
        totaux: t,
      });
    }

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
          `v_bey_classement?id=eq.${encodeURIComponent(mid)}&select=prenom,points,inscrits,rang,code_ambassadeur&limit=1`,
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

          /* Qui est entre grace a lui, nommement. Sans cette liste, la relance
             disait "2 personnes ne comptent pas encore, dis-leur d'activer
             leurs notifications" sans dire A QUI le dire : un parrain ne peut
             pas relancer un nombre. Mac Arthur l'a signale le 14/09 en
             cherchant les prenoms de ses deux filleules.

             Le filtre de date est celui de v_bey_classement, a la lettre :
             sans lui la liste afficherait trois noms sous une phrase qui en
             annonce deux, c'est-a-dire l'incoherence meme qu'on corrige.

             On n'expose que le prenom et la ville, jamais le contact, comme le
             podium. Le parrain a de toute facon invite ces gens lui-meme. */
          if (moi.code_ambassadeur) {
            const depuis = encodeURIComponent(saison.debut);
            const fs = await (await sb(
              `bey_membres?parraine_par=eq.${encodeURIComponent(moi.code_ambassadeur)}` +
              `&created_at=gte.${depuis}&order=created_at.asc&limit=50` +
              `&select=id,prenom,lieu,created_at`,
            )).json();
            const liste = Array.isArray(fs) ? fs : [];
            // Un filleul "compte" quand il a un abonnement de notification :
            // c'est la definition d'un point dans v_bey_classement, on la
            // relit ici plutot que de la reinventer.
            const ids = liste.map((x: any) => x.id).filter(Boolean);
            const confirmes = new Set<string>();
            if (ids.length) {
              const ps = await (await sb(
                `bey_push?membre_id=in.(${ids.join(",")})&select=membre_id`,
              )).json();
              for (const p of (Array.isArray(ps) ? ps : [])) confirmes.add(String(p.membre_id));
            }
            moi.filleuls = liste.map((x: any) => ({
              prenom: x.prenom, lieu: x.lieu || null, confirme: confirmes.has(String(x.id)),
            }));
          }
          // Le code ne sort pas de la fonction : il sert au calcul, il n'a rien
          // a faire dans la reponse.
          delete moi.code_ambassadeur;
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

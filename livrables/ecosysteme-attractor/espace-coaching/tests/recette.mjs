// =====================================================================
// ESPACE COACHING - recette d'ecran
//
// Ce que ce fichier verifie, et pourquoi il existe.
//
// Les deux pages de l'espace coaching sont parties en ligne sans avoir
// jamais ete ouvertes dans un navigateur. Le DOSSIER le disait noir sur
// blanc : « rien n'a encore ete vu a l'ecran ». Une recette faite a la
// main une fois ne protege de rien : elle n'est pas rejouee au
// redeploiement suivant. Celle-ci l'est.
//
// La base n'est PAS interrogee. On simule les reponses de Supabase, parce
// que l'objet de cette recette est l'ecran, pas le socle SQL : les regles
// de portes, les jetons et la purge se verifient en base, pas au pixel.
// Simuler evite aussi d'ecrire de fausses personnes accompagnees dans un
// projet qui contient de vraies notes de coaching.
//
// Ce qui est controle, a chacune des six resolutions du UX_SYSTEM :
//   1. aucun debordement horizontal        (section 3, rejet automatique)
//   2. toute zone de tap fait au moins 44 px de haut  (section 9)
//   3. aucun texte de saisie sous 16 px    (section 11, sinon iOS zoome)
//   4. aucune erreur JavaScript en console
//
// Lancement :
//   npm i playwright
//   node tests/recette.mjs            # controles seuls
//   node tests/recette.mjs --photos   # + captures dans tests/captures/
// =====================================================================

import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";
import { mkdir } from "node:fs/promises";

const ICI = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(ICI, "..", "public");
const CAPTURES = join(ICI, "captures");
const PHOTOS = process.argv.includes("--photos");

// Les six resolutions du UX_SYSTEM. Elles ne sont pas indicatives : une
// page qui deborde a l'une d'elles est rejetee, section 12.
const ECRANS = [
  { nom: "375-iphone-se", largeur: 375, hauteur: 812, mobile: true },
  { nom: "390-iphone-14", largeur: 390, hauteur: 844, mobile: true },
  { nom: "414-android", largeur: 414, hauteur: 896, mobile: true },
  { nom: "768-tablette", largeur: 768, hauteur: 1024, mobile: true },
  { nom: "1024-laptop", largeur: 1024, hauteur: 768, mobile: false },
  { nom: "1440-desktop", largeur: 1440, hauteur: 900, mobile: false }
];

// ------------------------------------------------------------ le serveur

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript" };

function servir(port) {
  return new Promise((ok) => {
    const s = createServer(async (req, rep) => {
      // Cloudflare Pages sert « q.html » sur « /q ». On reproduit ce
      // routage, sinon la recette teste une adresse qui n'existe pas en
      // production et passe a cote du lien qu'on envoie aux gens.
      let chemin = req.url.split("?")[0];
      if (chemin === "/") chemin = "/index.html";
      if (!extname(chemin)) chemin += ".html";
      try {
        const contenu = await readFile(join(PUBLIC, chemin));
        rep.writeHead(200, { "Content-Type": TYPES[extname(chemin)] || "application/octet-stream" });
        rep.end(contenu);
      } catch {
        rep.writeHead(404).end("introuvable");
      }
    });
    s.listen(port, () => ok(s));
  });
}

// ------------------------------------------------------- les faux renvois

const NOMS_TYPES = {
  1: "Le perfectionniste", 2: "L'altruiste", 3: "Le battant",
  4: "Le romantique", 5: "L'observateur", 6: "Le loyal",
  7: "L'epicurien", 8: "Le chef", 9: "Le mediateur"
};

const PARCOURS = {
  id: "11111111-1111-1111-1111-111111111111",
  prenom: "Aminata", nom: "Kouame",
  email: "aminata@exemple.ci", whatsapp: "+2250700000000",
  origine: "Recommandation d'une ancienne cliente",
  etape: "phase_1",
  jeton: "a1b2c3d4e5f60718293a", jeton_actif: true,
  objectif: "Mener douze entretiens de decouverte avant le 30 novembre.",
  indicateurs: [{ libelle: "Apprehension avant un appel", depart: "7", cible: "3" }],
  format: { seances: "8 seances sur 4 mois", tarif: "1 200 EUR" },
  decryptage: {},
  notes: "",
  cree_le: "2026-08-20T10:00:00Z",
  conservation_jusqu_au: "2028-08-20"
};

const QUESTIONNAIRE = {
  id: "22222222-2222-2222-2222-222222222222",
  parcours_id: PARCOURS.id,
  statut: "rempli",
  rempli_le: "2026-08-24T18:30:00Z",
  reponses: {},
  // Un profil volontairement contraste : un sommet net, des bas nets.
  // Un jeu plat masquerait la mise en forme des jauges et du tableau.
  scores: { 1: 22, 2: 31, 3: 38, 4: 14, 5: 11, 6: 27, 7: 19, 8: 34, 9: 9 }
};

const SEANCES = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
  id: "33333333-0000-0000-0000-00000000000" + n,
  parcours_id: PARCOURS.id,
  numero: n,
  phase: n <= 3 ? "phase_1" : n <= 6 ? "phase_2" : "phase_3",
  titre: n === 1 ? "Poser l'objectif et les indicateurs" : "",
  objectif_de_seance: n === 1 ? "Formuler son but en termes verifiables" : "",
  protocole: n === 1 ? "Mode explorateur" : "",
  date_prevue: "2026-09-" + String(n + 5).padStart(2, "0"),
  date_tenue: n === 1 ? "2026-09-06" : null,
  notes: {},
  statut: n === 1 ? "tenue" : "prevue"
}));

const PORTES = ["demande", "decouverte", "engagement"].map((e) => ({
  id: "44444444-0000-0000-0000-00000000000" + e.length,
  parcours_id: PARCOURS.id, etape: e,
  livrable: "Livrable pose pour l'etape " + e + ", quelques lignes ecrites a la main.",
  franchie_le: "2026-08-22T09:00:00Z"
}));

const JOURNAL = [{
  id: 1, parcours_id: PARCOURS.id, objet: "parcours", champ: "etape",
  avant: "engagement", apres: "phase_1",
  auteur: "myattractor1@gmail.com", horodatage: "2026-08-25T08:12:00Z"
}];

// 135 affirmations de longueur realiste : c'est la plus longue qui
// dimensionne l'ecran, pas la moyenne.
const ITEMS = Array.from({ length: 135 }, (_, i) => ({
  numero: i + 1,
  texte: i % 7 === 0
    ? "Je prefere prendre le temps de verifier plusieurs fois plutot que de rendre quelque chose dont je ne suis pas entierement satisfait, meme si cela me fait depasser le delai annonce."
    : "J'ai tendance a anticiper ce dont les autres ont besoin avant qu'ils me le demandent."
}));

function router(url, methode, accept) {
  const chemin = new URL(url).pathname;
  const seul = (accept || "").includes("vnd.pgrst.object");

  if (chemin.startsWith("/auth/v1/token")) {
    return {
      access_token: "faux", token_type: "bearer", expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: "faux",
      user: { id: "dfc47ff2-b6d3-49e2-bc2c-819b1e8744f9", email: "coach@exemple.fr", aud: "authenticated", role: "authenticated" }
    };
  }
  if (chemin.startsWith("/auth/v1/logout")) return {};

  if (chemin.startsWith("/rest/v1/rpc/pm_questionnaire_etat")) {
    return { prenom: "Aminata", statut: "en_cours", reponses: {}, total: 135, items: ITEMS };
  }
  if (chemin.startsWith("/rest/v1/rpc/pm_questionnaire_repondre")) return { enregistrees: 1 };
  if (chemin.startsWith("/rest/v1/rpc/pm_questionnaire_valider")) return { valide: true };
  if (chemin.startsWith("/rest/v1/rpc/")) return {};

  if (methode !== "GET") {
    // Une ecriture renvoie la ligne modifiee, comme PostgREST avec
    // « return=representation ».
    return seul ? PARCOURS : [PARCOURS];
  }

  const table = chemin.replace("/rest/v1/", "");
  const donnees = {
    pm_types: Object.keys(NOMS_TYPES).map((n) => ({ numero: Number(n), nom: NOMS_TYPES[n] })),
    pm_parcours: [PARCOURS],
    pm_portes: PORTES,
    pm_questionnaires: [QUESTIONNAIRE],
    pm_seances: SEANCES,
    pm_actions: [],
    pm_journal: JOURNAL
  }[table] || [];

  return seul ? (donnees[0] || null) : donnees;
}

// ------------------------------------------------------- les controles

async function controler(page, ecran, scenario, defauts) {
  const largeur = ecran.largeur;

  const debordement = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    vue: window.innerWidth,
    // Le coupable exact, sinon on cherche a l'aveugle.
    coupables: Array.from(document.querySelectorAll("body *"))
      .filter((n) => {
        const r = n.getBoundingClientRect();
        return r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1);
      })
      .slice(0, 4)
      .map((n) => n.tagName.toLowerCase() + (n.className && typeof n.className === "string" ? "." + n.className.trim().split(/\s+/).join(".") : ""))
  }));
  if (debordement.doc > debordement.vue + 1) {
    defauts.push(`[${scenario} · ${largeur}px] debordement horizontal : ${debordement.doc}px pour ${debordement.vue}px de vue. Coupables : ${debordement.coupables.join(", ") || "non identifie"}`);
  }

  const petits = await page.evaluate(() => {
    const res = [];
    document.querySelectorAll("button, a[href], select, input[type=checkbox]").forEach((n) => {
      // Une case a cocher enveloppee dans son etiquette se tape sur
      // l'etiquette entiere. C'est elle la vraie zone, et c'est elle qu'on
      // mesure : reprocher ses 20 px a la case ferait chasser un faux defaut
      // et rendrait la recette moins credible que le probleme qu'elle signale.
      const cible = n.closest("label") || n;
      const r = cible.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;          // masque
      if (getComputedStyle(n).visibility === "hidden") return;
      if (r.height < 44 || r.width < 44) {
        res.push({
          quoi: (cible.textContent || cible.tagName).trim().slice(0, 40),
          h: Math.round(r.height), l: Math.round(r.width)
        });
      }
    });
    return res;
  });
  petits.forEach((p) => defauts.push(`[${scenario} · ${largeur}px] zone de tap sous 44 px : « ${p.quoi} » fait ${p.l}x${p.h}`));

  const minus = await page.evaluate(() => {
    const res = [];
    document.querySelectorAll("input, select, textarea").forEach((n) => {
      const r = n.getBoundingClientRect();
      if (r.width === 0) return;
      const t = parseFloat(getComputedStyle(n).fontSize);
      if (t < 16) res.push({ quoi: n.id || n.type || n.tagName, t });
    });
    return res;
  });
  minus.forEach((m) => defauts.push(`[${scenario} · ${largeur}px] champ sous 16 px (iOS zoomera au focus) : ${m.quoi} a ${m.t}px`));

  if (PHOTOS) {
    await page.screenshot({ path: join(CAPTURES, `${scenario}--${ecran.nom}.png`), fullPage: true });
  }
}

// ------------------------------------------------------------ les scenes

async function scene(navigateur, ecran, base, nom, deroule, defauts) {
  const contexte = await navigateur.newContext({
    viewport: { width: ecran.largeur, height: ecran.hauteur },
    isMobile: ecran.mobile,
    hasTouch: ecran.mobile,
    deviceScaleFactor: 1,
    locale: "fr-FR"
  });
  const page = await contexte.newPage();

  page.on("pageerror", (e) => defauts.push(`[${nom} · ${ecran.largeur}px] erreur JavaScript : ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !/favicon|net::ERR/.test(m.text())) {
      defauts.push(`[${nom} · ${ecran.largeur}px] console : ${m.text().slice(0, 160)}`);
    }
  });

  // La page charge supabase-js depuis jsdelivr. En recette on sert la copie
  // installee par npm : le resultat ne depend plus du reseau, et surtout la
  // recette teste toujours la meme version que celle qu'on a validee.
  await page.route("**/cdn.jsdelivr.net/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/javascript",
      body: await readFile(join(ICI, "node_modules", "@supabase", "supabase-js", "dist", "umd", "supabase.js"), "utf8")
    });
  });

  await page.route("**/*.supabase.co/**", async (route) => {
    const req = route.request();
    const corps = router(req.url(), req.method(), req.headers()["accept"]);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify(corps)
    });
  });

  try {
    await deroule(page, base);
    await controler(page, ecran, nom, defauts);
  } catch (e) {
    defauts.push(`[${nom} · ${ecran.largeur}px] la scene n'a pas pu se jouer : ${e.message}`);
  }
  await contexte.close();
}

const attendre = (page, sel) => page.waitForSelector(sel, { state: "visible", timeout: 8000 });

async function connexion(page, base) {
  await page.goto(base + "/index.html", { waitUntil: "networkidle" });
  await page.fill("#co-email", "coach@exemple.fr");
  await page.fill("#co-mdp", "motdepasse");
  await page.click("#co-btn");
  await attendre(page, "#app");
}

const SCENES = {
  "co-connexion": async (page, base) => {
    await page.goto(base + "/index.html", { waitUntil: "networkidle" });
    await attendre(page, "#connexion");
  },
  "co-tunnel": async (page, base) => {
    await connexion(page, base);
    await attendre(page, ".carte.cliquable");
  },
  "co-fiche": async (page, base) => {
    await connexion(page, base);
    await page.click(".carte.cliquable");
    await attendre(page, ".onglets");
  },
  "co-decryptage": async (page, base) => {
    await connexion(page, base);
    await page.click(".carte.cliquable");
    await attendre(page, ".onglets");
    await page.click(".onglet:nth-child(2)");
    await attendre(page, "table.grille");
  },
  "co-seances": async (page, base) => {
    await connexion(page, base);
    await page.click(".carte.cliquable");
    await attendre(page, ".onglets");
    await page.click(".onglet:nth-child(3)");
    await attendre(page, ".carte");
    // On ouvre la premiere seance : c'est le formulaire le plus long de
    // l'application, donc celui qui deborde en premier s'il doit deborder.
    await page.click("text=Ouvrir la séance >> nth=0");
    await page.waitForTimeout(200);
  },
  "co-journal": async (page, base) => {
    await connexion(page, base);
    await page.click(".carte.cliquable");
    await attendre(page, ".onglets");
    await page.click(".onglet:nth-child(4)");
    await attendre(page, "table.grille");
  },
  "co-nouveau": async (page, base) => {
    await connexion(page, base);
    await page.click("text=Nouvelle personne");
    await attendre(page, "text=Créer le parcours");
  },
  "q-lien-mort": async (page, base) => {
    await page.goto(base + "/q", { waitUntil: "networkidle" });
    await attendre(page, "#v-erreur");
  },
  "q-accueil": async (page, base) => {
    await page.goto(base + "/q?j=a1b2c3d4e5f60718293a", { waitUntil: "networkidle" });
    await attendre(page, "#v-accueil");
  },
  "q-affirmation": async (page, base) => {
    await page.goto(base + "/q?j=a1b2c3d4e5f60718293a", { waitUntil: "networkidle" });
    await attendre(page, "#v-accueil");
    await page.click("#b-commencer");
    await attendre(page, "#v-item");
  },
  "q-affirmation-longue": async (page, base) => {
    await page.goto(base + "/q?j=a1b2c3d4e5f60718293a", { waitUntil: "networkidle" });
    await attendre(page, "#v-accueil");
    await page.click("#b-commencer");
    await attendre(page, "#v-item");
    // L'affirmation 8 est l'une des longues du jeu d'essai.
    for (let i = 0; i < 7; i++) {
      await page.click(".ch >> nth=1");
      await page.waitForTimeout(260);
    }
    await attendre(page, "#v-item");
  },
  "q-pause": async (page, base) => {
    await page.goto(base + "/q?j=a1b2c3d4e5f60718293a", { waitUntil: "networkidle" });
    await attendre(page, "#v-accueil");
    await page.click("#b-commencer");
    await attendre(page, "#v-item");
    for (let i = 0; i < 27; i++) {
      await page.click(".ch >> nth=2");
      await page.waitForTimeout(240);
    }
    await attendre(page, "#v-pause");
  }
};

// ------------------------------------------------------------------ main

const serveur = await servir(4599);
const base = "http://127.0.0.1:4599";
if (PHOTOS) await mkdir(CAPTURES, { recursive: true });

// Sur un poste ordinaire, « npx playwright install » a pose le navigateur au
// bon endroit et il n'y a rien a dire. Dans un environnement ou Chromium est
// deja fourni, on le designe par PW_CHROMIUM plutot que d'en telecharger un
// second, dont la version ne correspondrait de toute facon pas.
const navigateur = await chromium.launch(
  process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}
);
const defauts = [];

for (const [nom, deroule] of Object.entries(SCENES)) {
  process.stdout.write("· " + nom.padEnd(22));
  for (const ecran of ECRANS) {
    const avant = defauts.length;
    await scene(navigateur, ecran, base, nom, deroule, defauts);
    process.stdout.write(defauts.length > avant ? "x" : ".");
  }
  process.stdout.write("\n");
}

await navigateur.close();
serveur.close();

console.log("\n" + "=".repeat(70));
if (!defauts.length) {
  console.log("Recette d'ecran passee. " + Object.keys(SCENES).length + " scenes x " + ECRANS.length + " resolutions.");
} else {
  console.log(defauts.length + " defaut(s) :\n");
  // Deux fois le meme defaut a six resolutions est un seul defaut.
  const groupes = new Map();
  defauts.forEach((d) => {
    const cle = d.replace(/· \d+px/, "· *");
    groupes.set(cle, (groupes.get(cle) || 0) + 1);
  });
  [...groupes.entries()].forEach(([d, n]) => console.log(`  ${d}${n > 1 ? `   (x${n})` : ""}`));
  process.exitCode = 1;
}

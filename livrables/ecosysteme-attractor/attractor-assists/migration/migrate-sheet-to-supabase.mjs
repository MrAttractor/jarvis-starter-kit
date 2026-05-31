/**
 * Migration Apps Script → Supabase
 * Attractor Assists — 2026-05-30
 *
 * Ce script :
 * 1. Crée les utilisateurs dans Supabase Auth via invitation email
 * 2. Pré-remplit leurs profils avec les données du Google Sheet
 * 3. Pré-remplit les données d'anamnèse disponibles
 * 4. Marque activation_done = true (ils étaient déjà clients)
 *
 * Usage : node migrate-sheet-to-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";

// ─── Config Supabase ──────────────────────────────────────────────────────────

const SUPABASE_URL = "https://lgdgbrivnhgeupqhkckd.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZGdicml2bmhnZXVwcWhrY2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAwMjU5MSwiZXhwIjoyMDk1NTc4NTkxfQ._Z6In5DMHOPQX7zLymUqVW4_f84ccqampapW5MdQfR8";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Données extraites du Google Sheet ───────────────────────────────────────

const USERS = [
  { id: "AA-Nabintou-GUPF3",      prenom: "Nabintou",    email: "nabycook@gmail.com",             zone: "CI", nom_assistant: "Attractor", whatsapp: null },
  { id: "AA-Anniella-23UU3",      prenom: "Anniella",    email: "chokmah999@gmail.com",            zone: "CI", nom_assistant: "Attractor", whatsapp: null },
  { id: "AA-MrAttractor-8IRVL",   prenom: "Mac Arthur",  email: "macarthur.kouassi@outlook.fr",   zone: "EU", nom_assistant: "Macoco",    whatsapp: "2250576877070" },
  { id: "AA-Christian-Q6RUG",     prenom: "Christian",   email: "griotci@gmail.com",               zone: "CI", nom_assistant: "Attractor", whatsapp: "707655655" },
  { id: "AA-Elvis-ZESZQ",         prenom: "Elvis",       email: "maixentohou@gmail.com",           zone: "CI", nom_assistant: "Attractor", whatsapp: "2250556569989" },
  { id: "AA-Carine-06MM2",        prenom: "Carine",      email: "marinacarine1@gmail.com",         zone: "CI", nom_assistant: "Attractor", whatsapp: "709843371" },
  { id: "AA-MissCACAO-9ZSWT",     prenom: "Miss CACAO",  email: "misscacao225@gmail.com",          zone: "CI", nom_assistant: "Attractor", whatsapp: "2250103185285" },
  { id: "AA-Nadege-YQRNX",        prenom: "Nadège",      email: "nadkoffi03@gmail.com",            zone: "EU", nom_assistant: "Attractor", whatsapp: "2250749104852" },
  { id: "AA-Elisabeth-TAACP",     prenom: "Elisabeth",   email: "amandaka.elisa@yahoo.fr",         zone: "CI", nom_assistant: "Attractor", whatsapp: "709522038" },
  { id: "AA-Jocelyne-WGUOI",      prenom: "Jocelyne",    email: "gouamej@gmail.com",               zone: "CI", nom_assistant: "Boss",      whatsapp: "777119777" },
  { id: "AA-MarieKezey-5MTST",    prenom: "Marie Kezey", email: "creal.creal21@gmail.com",         zone: "CI", nom_assistant: "Attractor", whatsapp: "102264151" },
  { id: "AA-Aliou-KP6XW",         prenom: "Aliou",       email: "tourealiou04@gmail.com",          zone: "CI", nom_assistant: "Attractor", whatsapp: "747586549" },
  { id: "AA-Anicet-8L0N5",        prenom: "Anicet",      email: "yebyvan@gmail.com",               zone: "CI", nom_assistant: "Attractor", whatsapp: "708103094" },
  { id: "AA-Nonko-32G80",         prenom: "Nonko",       email: "sergedangui@live.fr",             zone: "CI", nom_assistant: "Attractor", whatsapp: "22509059718" },
  { id: "AA-Rockefeller-6K3K9",   prenom: "Rockefeller", email: "peintreanagbo@gmail.com",         zone: "CI", nom_assistant: "Attractor", whatsapp: "708415653" },
  { id: "AA-Yiriba-H0U1S",        prenom: "Yiriba",      email: "yiribayanature@gmail.com",        zone: "CI", nom_assistant: "Jeremiah",  whatsapp: "718414248" },
  { id: "AA-Konan-1DDDA",         prenom: "Konan",       email: "dibychristelle82@gmail.com",      zone: "EU", nom_assistant: "Attractor", whatsapp: null },
  { id: "AA-laetitia-9MKRH",      prenom: "Laetitia",    email: "khamdez@gmail.com",               zone: "CI", nom_assistant: "Attractor", whatsapp: "2250707063808" },
  { id: "AA-Chyrer-S2PVT",        prenom: "Chyrer",      email: "charlesyoboue@yahoo.fr",          zone: "CI", nom_assistant: "Attractor", whatsapp: "707481465" },
  { id: "AA-Simon-RC6IT",         prenom: "Simon",       email: "yaosimonkouadio@gmail.com",       zone: "CI", nom_assistant: "Eureka",    whatsapp: "2250779338151" },
  { id: "AA-Armel-S7SL4",         prenom: "Armel",       email: "armelyapi3@gmail.com",            zone: "CI", nom_assistant: "Attractor", whatsapp: "2250708141004" },
  { id: "AA-Maguy-9JLP6",         prenom: "Maguy",       email: "d.maguy@gmail.com",               zone: "CI", nom_assistant: "Attractor", whatsapp: "2250101500697" },
  // Sans email — skippés
  // AA-Clovis-H4DQS, AA-Sadie-0FL0U, AA-Benedicte-TGVK1, AA-MariaAudrey-6SMCN
];

// Données anamnèse disponibles dans le Sheet
const ANAMNESSES = {
  "AA-MrAttractor-8IRVL": {
    activite: "Je conçois des solutions digitales grâce à l'IA. Je coache des entrepreneurs sur leur stratégie business",
    canal_principal: "WhatsApp Email Facebook Messenger Appels",
    niveau_organisation: "Google Agenda + cahier",
  },
  "AA-Simon-RC6IT": {
    activite: "Je vends des montres pour hommes et femmes",
    canal_principal: "WhatsApp",
    niveau_organisation: "Tout dans ma tête",
  },
  "AA-Jocelyne-WGUOI": {
    activite: "J'ai 2 activités",
    canal_principal: "WhatsApp",
    niveau_organisation: "Tout dans ma tête",
  },
  "AA-Maguy-9JLP6": {
    activite: "Boutique en ligne de vente de produits cosmétiques (visage, corps, cheveux). Site : www.sekelem.com. Commandes via site ou WhatsApp.",
    canal_principal: "WhatsApp et Instagram",
    niveau_organisation: "Tout dans ma tête",
    lien_site: "https://www.sekelem.com",
  },
  "AA-Yiriba-H0U1S": {
    activite: "Je commercialise des produits capillaires (shampooing, crème capillaire, huile pousse plus, thé capillaire)",
    canal_principal: "WhatsApp",
    niveau_organisation: "Cahier",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function log(icon, msg) {
  console.log(`${icon} ${msg}`);
}

// ─── Migration principale ─────────────────────────────────────────────────────

async function migrate() {
  log("🚀", `Migration de ${USERS.length} utilisateurs vers Supabase\n`);

  const results = { ok: [], skipped: [], errors: [] };

  for (const user of USERS) {
    try {
      // 1. Inviter l'utilisateur via Supabase Auth Admin
      log("→", `${user.prenom} (${user.email})`);

      const { data: authData, error: authErr } = await supabase.auth.admin.inviteUserByEmail(
        user.email,
        {
          data: {
            prenom: user.prenom,
            nom_assistant: user.nom_assistant,
          },
          redirectTo: "https://assists.agenceattractor.com",
        }
      );

      if (authErr) {
        // Si l'utilisateur existe déjà, on récupère son ID
        if (authErr.message?.includes("already been registered")) {
          log("  ⚠", `Déjà inscrit — mise à jour du profil uniquement`);

          const { data: existing } = await supabase.auth.admin.listUsers();
          const existingUser = existing?.users?.find((u) => u.email === user.email);
          if (existingUser) {
            await upsertProfile(existingUser.id, user);
            results.ok.push(user.email + " (déjà inscrit, profil mis à jour)");
          }
          continue;
        }
        throw authErr;
      }

      const userId = authData.user.id;

      // 2. Créer/mettre à jour le profil
      await upsertProfile(userId, user);

      log("  ✅", `Invité et profil créé`);
      results.ok.push(user.email);

      // Pause pour éviter le rate limiting
      await sleep(300);
    } catch (err) {
      log("  ❌", `Erreur : ${err.message}`);
      results.errors.push({ email: user.email, error: err.message });
    }
  }

  // Rapport final
  console.log("\n═══════════════════════════════════════");
  log("✅", `Succès : ${results.ok.length}`);
  log("❌", `Erreurs : ${results.errors.length}`);
  if (results.errors.length > 0) {
    results.errors.forEach((e) => log("   →", `${e.email}: ${e.error}`));
  }
  console.log("═══════════════════════════════════════");
  log("ℹ", "Les utilisateurs invités recevront un email pour accéder à la nouvelle app.");
  log("ℹ", "Sans email dans le Sheet : Clovis, Sadié, Bénédicte, Maria Audrey — à traiter manuellement.");
}

async function upsertProfile(userId, user) {
  const anamneseData = ANAMNESSES[user.id] || {};

  const profilePayload = {
    id: userId,
    prenom: user.prenom,
    nom_assistant: user.nom_assistant || "Attractor",
    activite: anamneseData.activite || null,
    canal_principal: anamneseData.canal_principal || null,
    onboarding_done: true,
    activation_done: true, // déjà clients, on bypasse l'activation
  };

  const { error: profErr } = await supabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" });

  if (profErr) throw new Error(`Profil : ${profErr.message}`);

  // PPSD si données disponibles
  if (anamneseData.activite) {
    await supabase.from("ppsd").upsert(
      { user_id: userId },
      { onConflict: "user_id" }
    );
  }
}

// ─── Lancement ────────────────────────────────────────────────────────────────

migrate().catch(console.error);

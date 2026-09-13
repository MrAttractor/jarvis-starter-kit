// Recalcule la preuve d'une signature exactement comme le fait sign-verify,
// et recontrôle que les documents servis sont bien ceux qui ont été scellés.
// Usage : node scripts/verifier_signature_elevia.mjs [dossier_id]
import crypto from "node:crypto";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env", "utf8").split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).trim()]; }),
);

async function sql(query) {
  const r = await fetch(
    `https://api.supabase.com/v1/projects/${env.SUPABASE_PROJECT_REF}/database/query`,
    { method: "POST",
      headers: { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`,
                 "Content-Type": "application/json", "User-Agent": "curl/8.4.0" },
      body: JSON.stringify({ query }) });
  const t = await r.text();
  if (!r.ok) throw new Error(t);
  return JSON.parse(t);
}
const sha256 = (d) => crypto.createHash("sha256")
  .update(typeof d === "string" ? Buffer.from(d, "utf8") : d).digest("hex");

const D = process.argv[2] ?? "f9f8c931-a6ed-48cf-881d-e0316b7dbaad";
const [dossier] = await sql(
  `select id, reference, titre, statut from public.sig_dossiers where id='${D}'`);
const docs = await sql(
  `select nom, url, contenu_hash, ordre from public.sig_documents where dossier_id='${D}' order by ordre asc`);
const signataires = await sql(
  `select nom, email, role, statut, signature_nom, signed_at, signed_ip, preuve_hash from public.sig_signataires where dossier_id='${D}' order by ordre asc`);

console.log(`Dossier ${dossier.id}  —  statut « ${dossier.statut} »\n`);

console.log("Documents scellés, tels qu'ils sont servis aujourd'hui :");
let intacts = true;
for (const d of docs) {
  const octets = new Uint8Array(await (await fetch(d.url)).arrayBuffer());
  const vif = sha256(octets);
  const ok = vif === d.contenu_hash;
  intacts &&= ok;
  console.log(`  ${d.ordre}. ${ok ? "intact  " : "ALTÉRÉ  "} ${d.nom.slice(0, 60)}`);
}

console.log("\nSignatures :");
let preuves = true;
for (const s of signataires) {
  if (s.statut !== "signe") {
    console.log(`  ${s.nom} (${s.role}) : ${s.statut}, rien à vérifier`);
    continue;
  }
  const iso = new Date(s.signed_at.replace(" ", "T").replace("+00", "Z")).toISOString();
  const recalcule = sha256(JSON.stringify({
    dossier: dossier.id,
    reference: dossier.reference,
    titre: dossier.titre,
    documents: docs.map((d) => ({ nom: d.nom, hash: d.contenu_hash })),
    signataire: { nom: s.nom, email: s.email },
    signature_nom: s.signature_nom,
    signe_le: iso,
    ip: s.signed_ip,
  }));
  const ok = recalcule === s.preuve_hash;
  preuves &&= ok;
  console.log(`  ${s.nom} (${s.role}) : signé le ${iso}`);
  console.log(`     preuve ${ok ? "vérifiée" : "ROMPUE"} — ${s.preuve_hash.slice(0, 32)}…`);
}

const manquants = signataires.filter((s) => s.statut !== "signe").map((s) => s.nom);
console.log(`\nDocuments intacts : ${intacts ? "oui" : "NON"}`);
console.log(`Preuves vérifiées : ${preuves ? "oui" : "NON"}`);
console.log(manquants.length
  ? `Signatures manquantes : ${manquants.join(", ")}`
  : "Dossier complet : tout le monde a signé.");

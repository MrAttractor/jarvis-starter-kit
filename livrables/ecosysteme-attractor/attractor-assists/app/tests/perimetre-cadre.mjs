// Test du bloc "cadre de périmètre" : côté edge function (génération) et côté page (rendu).
// Sans navigateur : on extrait les deux fonctions et on les exécute sur un DOM stub.
import { readFileSync } from "node:fs";

const ROOT = "C:/Users/macar/OneDrive/Bureau/jarvis-starter-kit";
const PAGE = `${ROOT}/livrables/clients/demo-site/public/proposition/index.html`;
const FN   = `${ROOT}/livrables/ecosysteme-attractor/attractor-assists/app/supabase/functions/generate-proposition/index.ts`;

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok  " + m); } else { fail++; console.log("  FAIL " + m); } };

// ── 1. La fonction cadre() de l'edge function ──────────────────────────────
const fnSrc = readFileSync(FN, "utf8");
const cadreSrc = fnSrc.match(/function cadre\(devise: string\) \{[\s\S]*?\n\}/)[0].replace(": string", "");
const cadre = eval(`(${cadreSrc.replace("function cadre", "function")})`);

console.log("\n[1] Edge function — cadre()");
const cEur = cadre("€"), cFcfa = cadre("FCFA");
ok(cEur.exclusions.length >= 3, `EUR : ${cEur.exclusions.length} exclusions (min 3)`);
ok(/150 €\/h/.test(cEur.revisions), "EUR : tarif de révision = 150 €/h");
ok(/98 000 FCFA\/h/.test(cFcfa.revisions), "FCFA : tarif de révision = 98 000 FCFA/h");
ok(!/65 €/.test(JSON.stringify(cEur)), "l'ancien 65 €/h (incitation inversée) a disparu");
ok(/écrit/.test(cEur.avenant), "la clause d'avenant exige un accord écrit");
ok(/frais de tiers|domaine/i.test(cEur.exclusions.join(" ")), "les frais de tiers sont exclus explicitement");

// ── 2. Le rendu renderCadre() de la page ───────────────────────────────────
const pageSrc = readFileSync(PAGE, "utf8");
const renderSrc = pageSrc.match(/function renderCadre\(D\)\{[\s\S]*?\n\}/)[0];

function makeDom() {
  const el = (id) => ({ id, style: {}, textContent: "", innerHTML: "",
    querySelector: function () { return this._span || (this._span = { textContent: "" }); } });
  const nodes = {};
  for (const id of ["c-cadre","cadre-titre","cadre-intro","grp-cadre","cadre-rev","cadre-av"]) nodes[id] = el(id);
  return nodes;
}
function runRender(D) {
  const nodes = makeDom();
  const $ = (id) => nodes[id];
  eval(`${renderSrc}; renderCadre(${JSON.stringify(D)});`);
  return nodes;
}

console.log("\n[2] Page /proposition — renderCadre()");
const full = runRender({ cadre: cEur });
ok(full["c-cadre"].style.display === "block", "cadre complet : le bloc s'affiche");
ok((full["grp-cadre"].innerHTML.match(/<li>/g) || []).length === cEur.exclusions.length, "toutes les exclusions sont rendues");
ok(full["cadre-rev"].style.display === "block", "la ligne Ajustements s'affiche");
ok(full["cadre-av"].style.display === "block", "la ligne Avenant s'affiche");
ok(full["cadre-titre"].textContent === "Ce qui n'est pas inclus", "le titre est repris du config");

const none = runRender({});
ok(none["c-cadre"].style.display !== "block", "config sans cadre : rien ne s'affiche (pas de clause inventée)");

const empty = runRender({ cadre: { exclusions: [], revisions: "", avenant: "" } });
ok(empty["c-cadre"].style.display !== "block", "cadre vide : rien ne s'affiche");

const partial = runRender({ cadre: { exclusions: ["Une seule chose"] } });
ok(partial["c-cadre"].style.display === "block", "cadre partiel : le bloc s'affiche quand même");
ok(partial["cadre-rev"].style.display !== "block", "cadre partiel : la ligne Ajustements reste masquée");

// ── 3. Le garde-fou : le cadre est injecté même en mode manuel ─────────────
console.log("\n[3] Edge function — garde-fou d'injection");
ok(/cadre: body\.config\.cadre \|\| cadre\(/.test(fnSrc), "mode manuel : cadre injecté d'office s'il manque");
ok(/cadre: body\.config\.cadre \|\| cur\.config\?\.cadre \|\| cadre\(/.test(fnSrc), "mode mise à jour : le cadre survit à une renégociation");
ok(/cadre: cadre\(devise\)/.test(fnSrc), "mode dossier : cadre présent dans le config généré");

console.log(`\n${fail === 0 ? "TOUT PASSE" : "ECHECS"} — ${pass} ok, ${fail} échec(s)\n`);
process.exit(fail === 0 ? 0 : 1);

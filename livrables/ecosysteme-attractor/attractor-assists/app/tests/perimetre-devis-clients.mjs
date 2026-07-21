// Vérifie que le bloc "cadre" existe dans le CONFIG de chaque devis client
// ET que chaque id manipulé par le JS existe bien dans le HTML (erreur classique : id qui ne matche pas).
import { readFileSync } from "node:fs";
const ROOT = "C:/Users/macar/OneDrive/Bureau/jarvis-starter-kit/livrables/clients/demo-site/public";
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ok  " + m); } else { fail++; console.log("  FAIL " + m); } };

for (const client of ["yiriba", "fleur"]) {
  console.log(`\n[${client}]`);
  const html = readFileSync(`${ROOT}/${client}/index.html`, "utf8");

  // 1. Le CONFIG contient bien un cadre non vide
  // `\{\n` : exige une vraie ouverture d'objet multi-ligne, sinon on attrape
  // le commentaire d'en-tête « const DEVIS = {...} plus bas ».
  const m = html.match(/const DEVIS = \{\n[\s\S]*?\n\};/);
  ok(!!m, "bloc CONFIG trouvé");
  const DEVIS = eval("(" + m[0].replace(/^const DEVIS = /, "").replace(/;$/, "") + ")");
  ok(Array.isArray(DEVIS.cadre) && DEVIS.cadre.length >= 3, `cadre présent : ${DEVIS.cadre?.length} exclusions (min 3)`);
  ok(/écrit/.test(DEVIS.cadreAvenant || ""), "clause d'avenant : accord écrit exigé");
  ok(/ajustements/i.test(DEVIS.cadreAvenant || ""), "clause d'ajustements présente");
  ok(!/65 ?€/.test(JSON.stringify(DEVIS)), "aucune trace du tarif 65 €/h");

  // 2. Tous les ids utilisés par le bloc de rendu du cadre existent dans le HTML
  for (const id of ["c-cadre", "cadre-intro", "grp-cadre", "cadre-av"]) {
    ok(html.includes(`id="${id}"`), `id="${id}" présent dans le HTML`);
  }

  // 3. Le bloc est bien couvert par le CSS d'impression
  const printBlock = html.match(/@media print\{[\s\S]*?\n\}/);
  ok(!!printBlock, "bloc @media print présent");
  ok(/\.bonus/.test(printBlock[0]) && /break-inside:avoid/.test(printBlock[0]),
     "le bloc cadre (classe .bonus) est en break-inside:avoid à l'impression");
}

console.log(`\n${fail === 0 ? "TOUT PASSE" : "ECHECS"} — ${pass} ok, ${fail} échec(s)\n`);
process.exit(fail === 0 ? 0 : 1);

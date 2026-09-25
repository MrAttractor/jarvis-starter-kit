// Extrait la cle de depouillement du questionnaire ennéagramme depuis le classeur
// fourni par l'école, et verifie ses invariants.
//
// Le classeur fait foi, pas une transcription. Chaque item et son type sont lus
// dans les formules de la feuille de depouillement, jamais recopies a la main.
//
//   node extraire-cle.mjs [chemin/vers/classeur.xlsx]
//
// Produit ../cle-depouillement.json et sort en code 1 si un invariant tombe.

import { readFileSync, writeFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ICI = dirname(fileURLToPath(import.meta.url));
const CLASSEUR = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(ICI, "../../../../context/import/formation/Enneagramme Preparation Mentale.xlsx");
const SORTIE = resolve(ICI, "../cle-depouillement.json");
const SORTIE_SQL = resolve(ICI, "../supabase/0002_pm_reference.sql");

// ---------------------------------------------------------------- lecture zip

// Un .xlsx est une archive zip. On lit le repertoire central plutot que de
// dependre d'une bibliotheque : le format est stable et l'outil doit pouvoir
// tourner sur n'importe quelle machine sans installation.
function lireArchive(chemin) {
  const buf = readFileSync(chemin);
  let fin = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { fin = i; break; }
  }
  if (fin < 0) throw new Error("archive illisible : fin de repertoire central introuvable");

  const nbEntrees = buf.readUInt16LE(fin + 10);
  let pos = buf.readUInt32LE(fin + 16);
  const fichiers = new Map();

  for (let n = 0; n < nbEntrees; n++) {
    if (buf.readUInt32LE(pos) !== 0x02014b50) throw new Error("entree de repertoire central invalide");
    const compression = buf.readUInt16LE(pos + 10);
    const tailleCompressee = buf.readUInt32LE(pos + 20);
    const lgNom = buf.readUInt16LE(pos + 28);
    const lgExtra = buf.readUInt16LE(pos + 30);
    const lgCommentaire = buf.readUInt16LE(pos + 32);
    const decalageLocal = buf.readUInt32LE(pos + 42);
    const nom = buf.toString("utf8", pos + 46, pos + 46 + lgNom);

    const lgNomLocal = buf.readUInt16LE(decalageLocal + 26);
    const lgExtraLocal = buf.readUInt16LE(decalageLocal + 28);
    const debut = decalageLocal + 30 + lgNomLocal + lgExtraLocal;
    const brut = buf.subarray(debut, debut + tailleCompressee);

    fichiers.set(nom, compression === 0 ? brut : inflateRawSync(brut));
    pos += 46 + lgNom + lgExtra + lgCommentaire;
  }
  return fichiers;
}

// ---------------------------------------------------------------- lecture xml

const ENTITES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'" };

function decoder(s) {
  return s
    .replace(/&(amp|lt|gt|quot|apos);/g, (m) => ENTITES[m])
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

// Une chaine partagee peut etre en un seul <t> ou eclatee en plusieurs <r><t>.
// Les concatener toutes, sinon les index glissent et toute la cle est fausse.
function lireChainesPartagees(xml) {
  const chaines = [];
  for (const si of xml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    let texte = "";
    for (const t of si[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)) texte += t[1];
    chaines.push(decoder(texte).replace(/\s+/g, " ").trim());
  }
  return chaines;
}

// Rend une feuille sous forme de dictionnaire { "C4": { v, t, f } }.
function lireFeuille(xml, chaines) {
  const cellules = new Map();
  for (const c of xml.matchAll(/<c r="([A-Z]+\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
    const ref = c[1];
    const attributs = c[2] || "";
    const contenu = c[3] || "";
    const type = /t="([^"]+)"/.exec(attributs)?.[1] ?? "n";
    const formule = /<f[^>]*>([\s\S]*?)<\/f>/.exec(contenu)?.[1];
    const brut = /<v>([\s\S]*?)<\/v>/.exec(contenu)?.[1];
    let valeur = brut === undefined ? undefined : decoder(brut);
    if (type === "s" && valeur !== undefined) valeur = chaines[Number(valeur)];
    cellules.set(ref, { valeur, type, formule: formule ? decoder(formule) : undefined });
  }
  return cellules;
}

const colonneVersIndex = (lettres) =>
  [...lettres].reduce((n, l) => n * 26 + (l.charCodeAt(0) - 64), 0);

const indexVersColonne = (n) => {
  let s = "";
  while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = (n - r - 1) / 26; }
  return s;
};

// --------------------------------------------------------------- extraction

const echecs = [];
const verifier = (condition, message) => { if (!condition) echecs.push(message); };

const archive = lireArchive(CLASSEUR);
const chaines = lireChainesPartagees(archive.get("xl/sharedStrings.xml").toString("utf8"));

// L'ordre des feuilles dans workbook.xml donne leur nom.
const classeur = archive.get("xl/workbook.xml").toString("utf8");
const nomsFeuilles = [...classeur.matchAll(/<sheet[^>]*name="([^"]+)"/g)].map((m) => decoder(m[1]));

const questionnaire = lireFeuille(archive.get("xl/worksheets/sheet1.xml").toString("utf8"), chaines);
const depouillement = lireFeuille(archive.get("xl/worksheets/sheet2.xml").toString("utf8"), chaines);

// 1. La feuille Questionnaire : numero d'item en colonne B, affirmation en C.
const parLigne = new Map();
for (const [ref, cel] of questionnaire) {
  const m = /^B(\d+)$/.exec(ref);
  if (!m || cel.valeur === undefined) continue;
  const numero = Number(cel.valeur);
  if (!Number.isInteger(numero)) continue;
  const texte = questionnaire.get(`C${m[1]}`)?.valeur;
  parLigne.set(Number(m[1]), { numero, texte });
}

// 2. La feuille de depouillement : chaque colonne de score porte son numero de
//    type en ligne 25, juste a sa gauche, et pointe vers la ligne du questionnaire.
const LIGNE_DES_TYPES = 25;
const items = new Map();

for (const [ref, cel] of depouillement) {
  const cible = /^Questionnaire!D(\d+)$/.exec(cel.formule ?? "");
  if (!cible) continue;

  const [, colonne, ligne] = /^([A-Z]+)(\d+)$/.exec(ref);
  const colonneEtiquette = indexVersColonne(colonneVersIndex(colonne) - 1);

  const type = Number(depouillement.get(`${colonneEtiquette}${LIGNE_DES_TYPES}`)?.valeur);
  const numeroAnnonce = Number(depouillement.get(`${colonneEtiquette}${ligne}`)?.valeur);

  const source = parLigne.get(Number(cible[1]));
  verifier(source !== undefined, `${ref} pointe sur Questionnaire!D${cible[1]}, ligne sans numero d'item`);
  if (!source) continue;

  // Le meme item est annonce a deux endroits : dans la grille de depouillement
  // et dans la feuille du questionnaire. Les deux doivent concorder.
  verifier(
    numeroAnnonce === source.numero,
    `${ref} : la grille annonce l'item ${numeroAnnonce}, le questionnaire dit ${source.numero}`
  );
  verifier(type >= 1 && type <= 9, `${ref} : type illisible en ${colonneEtiquette}${LIGNE_DES_TYPES}`);
  verifier(!items.has(source.numero), `item ${source.numero} rattache deux fois`);

  items.set(source.numero, { numero: source.numero, type, texte: source.texte });
}

// 3. Les noms des types, tels que l'ecole les nomme.
const noms = {};
for (const [ref, cel] of depouillement) {
  const m = /^AC(\d+)$/.exec(ref);
  if (!m || typeof cel.valeur !== "string") continue;
  const libelle = /^(\d)\s*-\s*(.+)$/.exec(cel.valeur);
  if (libelle) noms[Number(libelle[1])] = libelle[2].trim();
}

// ------------------------------------------------------------- verifications

const numeros = [...items.keys()].sort((a, b) => a - b);
verifier(numeros.length === 135, `${numeros.length} items rattaches au lieu de 135`);

for (let n = 1; n <= 135; n++) {
  verifier(items.has(n), `item ${n} absent de la grille de depouillement`);
}
for (const it of items.values()) {
  verifier(Boolean(it.texte), `item ${it.numero} sans affirmation`);
}

const parType = {};
for (let t = 1; t <= 9; t++) parType[t] = [];
for (const it of items.values()) parType[it.type].push(it.numero);
for (let t = 1; t <= 9; t++) {
  parType[t].sort((a, b) => a - b);
  verifier(parType[t].length === 15, `type ${t} : ${parType[t].length} items au lieu de 15`);
  verifier(Boolean(noms[t]), `type ${t} : nom introuvable dans le classeur`);
}

// --------------------------------------------------------------------- sortie

console.log(`Classeur   : ${CLASSEUR}`);
console.log(`Feuilles   : ${nomsFeuilles.join(", ")}`);
console.log(`Items lus  : ${numeros.length}`);
console.log("");
for (let t = 1; t <= 9; t++) {
  console.log(
    `Type ${t} ${(noms[t] ?? "?").padEnd(16)} ${String(parType[t].length).padStart(2)} items : ${parType[t].join(", ")}`
  );
}
console.log("");

if (echecs.length) {
  console.error(`ECHEC : ${echecs.length} anomalie(s)`);
  for (const e of echecs) console.error(`  - ${e}`);
  process.exit(1);
}

writeFileSync(
  SORTIE,
  JSON.stringify(
    {
      source: "Enneagramme Preparation Mentale.xlsx, support Potentiel de l'Academie Puissance Mentale",
      avertissement: "Genere par outils/extraire-cle.mjs. Ne pas modifier a la main : relancer l'outil.",
      notation: { 0: "jamais vrai", 1: "parfois vrai", 2: "souvent vrai", 3: "toujours vrai" },
      scoreMaxParType: 45,
      types: Object.fromEntries(
        Array.from({ length: 9 }, (_, i) => [i + 1, { nom: noms[i + 1], items: parType[i + 1] }])
      ),
      items: numeros.map((n) => items.get(n)),
    },
    null,
    2
  ) + "\n",
  "utf8"
);

// Le meme referentiel, en SQL, pour que le score se calcule en base.
// Genere ici et pas ecrit a la main : le classeur reste la seule source,
// et une correction de l'ecole se propage d'une seule commande.
const guillemet = (s) => `'${String(s).replace(/'/g, "''")}'`;

const seed = `-- =====================================================================
-- ESPACE COACHING - referentiel du questionnaire
-- GENERE PAR outils/extraire-cle.mjs. Ne pas modifier a la main.
-- Source : ${"Enneagramme Preparation Mentale.xlsx"}, support de l'Academie.
-- A rejouer apres 0001_pm_socle.sql, et a chaque correction du classeur.
-- =====================================================================

insert into public.pm_types (numero, nom) values
${Array.from({ length: 9 }, (_, i) => `  (${i + 1}, ${guillemet(noms[i + 1])})`).join(",\n")}
on conflict (numero) do update set nom = excluded.nom;

insert into public.pm_items (numero, type, texte) values
${numeros.map((n) => {
  const it = items.get(n);
  return `  (${it.numero}, ${it.type}, ${guillemet(it.texte)})`;
}).join(",\n")}
on conflict (numero) do update set type = excluded.type, texte = excluded.texte;

-- Garde-fou : la migration echoue plutot que de laisser passer un
-- referentiel incomplet, parce qu'une cle fausse ne se voit jamais a l'oeil.
do $$
declare n int;
begin
  select count(*) into n from public.pm_items;
  if n <> 135 then raise exception 'referentiel incomplet : % items au lieu de 135', n; end if;

  select count(*) into n from (
    select type from public.pm_items group by type having count(*) <> 15
  ) t;
  if n <> 0 then raise exception '% type(s) n''ont pas 15 items', n; end if;
end $$;
`;

writeFileSync(SORTIE_SQL, seed, "utf8");

console.log(`Tous les invariants tiennent.`);
console.log(`  cle  : ${SORTIE}`);
console.log(`  seed : ${SORTIE_SQL}`);

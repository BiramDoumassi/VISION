// Référentiels hors ligne pour l'import de données client :
//  - public/data/countries.json : pays (ISO alpha-2/alpha-3/numérique, noms FR/EN, centroïde approximatif)
//  - public/data/cities.json    : villes de 5 000 habitants et plus (GeoNames, CC BY 4.0, via all-the-cities)
//  - public/modele-import-vision.xlsx : modèle Excel à remplir
// Tout est généré au build : aucune requête réseau à l'exécution (compatible on-premise / DDIL).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pub = (p) => new URL(`../public/${p}`, import.meta.url);

if (existsSync(pub("data/countries.json")) && existsSync(pub("data/cities.json")) && existsSync(pub("modele-import-vision.xlsx")) && !process.env.FORCE_REFDATA) {
  console.log("référentiels déjà présents, génération ignorée");
  process.exit(0);
}

const countries = require("i18n-iso-countries");
countries.registerLocale(require("i18n-iso-countries/langs/fr.json"));
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

// Centroïde approximatif : centre de la boîte englobante du plus grand polygone du pays.
const world = JSON.parse(readFileSync(pub("data/world.geojson"), "utf8"));
const centroid = {};
for (const f of world.features) {
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  let best = null, bestN = -1;
  for (const p of polys) if (p[0].length > bestN) { best = p[0]; bestN = p[0].length; }
  if (!best) continue;
  const xs = best.map((c) => c[0]), ys = best.map((c) => c[1]);
  centroid[f.properties.id] = [+((Math.min(...xs) + Math.max(...xs)) / 2).toFixed(2), +((Math.min(...ys) + Math.max(...ys)) / 2).toFixed(2)];
}

const out = Object.keys(countries.getAlpha2Codes()).map((a2) => {
  const num = countries.alpha2ToNumeric(a2);
  return {
    a2, a3: countries.alpha2ToAlpha3(a2), num,
    fr: countries.getName(a2, "fr", { select: "all" }) ?? [],
    en: countries.getName(a2, "en", { select: "all" }) ?? [],
    c: centroid[num] ?? null,
  };
});
writeFileSync(pub("data/countries.json"), JSON.stringify(out));
console.log(`countries.json : ${out.length} pays`);

const cities = require("all-the-cities")
  .filter((c) => c.population >= 5000)
  .map((c) => [c.name, c.altName || "", c.country, +c.loc.coordinates[0].toFixed(3), +c.loc.coordinates[1].toFixed(3), c.population]);
writeFileSync(pub("data/cities.json"), JSON.stringify(cities));
console.log(`cities.json : ${cities.length} villes`);

// Modèle Excel
const { default: writeExcelFile } = await import("write-excel-file/node");
const H = (v) => ({ value: v, fontWeight: "bold" });
const row = (vals) => vals.map((v) => (v === "" ? null : { value: v }));
const supHeaders = ["Nom", "Ville", "Pays", "Latitude", "Longitude", "Rang", "Produit", "Part des achats (%)", "Délai (jours)", "Références", "Références source unique", "Approvisionne", "Mode", "Commandes en transit", "Valeur en transit (k€)", "Alternatives", "Indice prix"];
const siteHeaders = ["Nom", "Ville", "Pays", "Latitude", "Longitude", "Type", "Effectif", "Lignes"];
const supRows = [
  ["Aérostructures Rhône", "Lyon", "France", "", "", 1, "Pré-imprégnés carbone", 34, 21, 42, 3, "Usine Toulouse; Usine Mérignac", "route", 6, 950, "", 100],
  ["Fibres Kura", "Ganja", "Azerbaïdjan", "", "", 2, "Fibre de carbone", 18, 35, 9, 2, "Aérostructures Rhône", "route", 2, 210, "Carbon Saxony", 100],
  ["Carbon Saxony", "Dresde", "Allemagne", 51.05, 13.74, 2, "Fibre de carbone", 6, 24, 3, 0, "Aérostructures Rhône", "route", 0, 0, "", 112],
];
const siteRows = [
  ["Usine Toulouse", "Toulouse", "France", "", "", "Usine — pièces composites", 420, 6],
  ["Usine Mérignac", "Mérignac", "France", "", "", "Usine — assemblage", 260, 3],
];
const help = [
  ["Mode d'emploi"],
  ["1. Remplissez l'onglet « Sites » (vos usines, entrepôts) puis l'onglet « Fournisseurs »."],
  ["2. Colonnes obligatoires : Nom et Pays. Ville conseillée. Latitude/Longitude facultatives (prioritaires si renseignées)."],
  ["3. « Approvisionne » : noms de sites ou d'autres fournisseurs servis, séparés par « ; ». C'est ce qui trace les flux."],
  ["4. « Rang » : 1 = fournisseur direct, 2 = fournisseur de vos fournisseurs, 3 = au-delà."],
  ["5. « Mode » : route, mer ou air. « Alternatives » : noms d'autres fournisseurs du fichier, séparés par « ; »."],
  ["6. Un seul fichier CSV ? Ajoutez une colonne « Nature » (site ou fournisseur) pour mélanger les deux."],
  ["7. Le fichier reste sur votre poste : VISION le lit dans le navigateur, rien n'est envoyé sur Internet."],
].map((r) => r.map((v) => ({ value: v })));

await writeExcelFile([
  { sheet: "Sites", data: [siteHeaders.map(H), ...siteRows.map(row)], columns: siteHeaders.map((h) => ({ width: Math.max(12, h.length + 4) })), stickyRowsCount: 1 },
  { sheet: "Fournisseurs", data: [supHeaders.map(H), ...supRows.map(row)], columns: supHeaders.map((h) => ({ width: Math.max(12, h.length + 4) })), stickyRowsCount: 1 },
  { sheet: "Mode d'emploi", data: help, columns: [{ width: 110 }] },
]).toFile(new URL("../public/modele-import-vision.xlsx", import.meta.url).pathname);
console.log("modele-import-vision.xlsx généré");

// Génère public/data/world.geojson à partir de world-atlas (Natural Earth 1:110m, domaine public).
// Aucun appel réseau à l'exécution : le fond de carte est servi par VISION elle-même (compatible DDIL).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const out = new URL("../public/data/world.geojson", import.meta.url);

try {
  const topo = JSON.parse(readFileSync(require.resolve("world-atlas/countries-110m.json"), "utf8"));
  const geo = feature(topo, topo.objects.countries);
  geo.features = geo.features.map((f) => ({ ...f, properties: { id: String(f.id ?? ""), name: f.properties?.name ?? "" } }));
  mkdirSync(new URL("../public/data/", import.meta.url), { recursive: true });
  writeFileSync(out, JSON.stringify(geo));
  console.log(`world.geojson : ${geo.features.length} pays`);
} catch (e) {
  if (existsSync(out)) console.log("world.geojson déjà présent, génération ignorée");
  else throw e;
}

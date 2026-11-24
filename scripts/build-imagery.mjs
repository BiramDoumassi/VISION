// Fonds satellite du globe : découpe des textures NASA en tuiles Web Mercator servies par VISION elle-même.
//   scripts/imagery/earth-night.jpg → public/data/imagery/night/{z}/{x}/{y}.jpg  (Black Marble, lumières de nuit)
//   scripts/imagery/earth-day.jpg   → public/data/imagery/day/{z}/{x}/{y}.jpg    (Blue Marble, vue de jour)
// Aucune requête réseau à l'exécution (compatible on-premise / DDIL). Provenance : scripts/imagery/SOURCES.md.
// Pour plus de détail au zoom : remplacer une texture par une version plus grande (équirectangulaire 2:1), puis relancer.
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const MAX_SIDE = 8192; // zoom 5 au plus : au-delà, la mémoire et le poids des tuiles explosent
const TILE = 256;

async function build(name) {
  const src = fileURLToPath(new URL(`scripts/imagery/earth-${name}.jpg`, root));
  const outDir = new URL(`public/data/imagery/${name}/`, root);
  const stamp = new URL("meta.json", outDir);
  if (!existsSync(src)) { console.log(`imagerie ${name} : texture absente, ignorée`); return; }
  if (existsSync(stamp) && statSync(stamp).mtimeMs > statSync(src).mtimeMs && !process.env.FORCE_REFDATA) {
    console.log(`imagerie ${name} : tuiles déjà présentes, génération ignorée`);
    return;
  }

  // Texture équirectangulaire (2:1), ramenée à une largeur puissance de deux.
  const info = await sharp(src).metadata();
  const W = Math.min(MAX_SIDE, 2 ** Math.floor(Math.log2(info.width)));
  const H = W / 2;
  const eq = await sharp(src).resize(W, H, { fit: "fill" }).removeAlpha().raw().toBuffer();

  // Reprojection en Web Mercator (carré W×W, latitudes ±85,05°) : seule la latitude change, interpolation entre lignes.
  const merc = Buffer.alloc(W * W * 3);
  const row = W * 3;
  for (let y = 0; y < W; y++) {
    const lat = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 0.5)) / W)));
    const fy = Math.min(H - 1, Math.max(0, ((Math.PI / 2 - lat) / Math.PI) * H - 0.5));
    const y0 = Math.floor(fy), y1 = Math.min(H - 1, y0 + 1), t = fy - y0;
    const a = y0 * row, b = y1 * row, o = y * row;
    for (let i = 0; i < row; i++) merc[o + i] = eq[a + i] * (1 - t) + eq[b + i] * t;
  }

  const maxZoom = Math.log2(W / TILE);
  let count = 0;
  for (let z = 0; z <= maxZoom; z++) {
    const n = 2 ** z, side = n * TILE;
    const level = await sharp(merc, { raw: { width: W, height: W, channels: 3 } }).resize(side, side).raw().toBuffer();
    for (let x = 0; x < n; x++) {
      mkdirSync(new URL(`${z}/${x}/`, outDir), { recursive: true });
      for (let y = 0; y < n; y++) {
        await sharp(level, { raw: { width: side, height: side, channels: 3 } })
          .extract({ left: x * TILE, top: y * TILE, width: TILE, height: TILE })
          .jpeg({ quality: 82, mozjpeg: true })
          .toFile(fileURLToPath(new URL(`${z}/${x}/${y}.jpg`, outDir)));
        count++;
      }
    }
  }
  writeFileSync(stamp, JSON.stringify({ maxZoom, source: `earth-${name}.jpg`, width: info.width }));
  console.log(`imagerie ${name} : ${count} tuiles, zoom 0 à ${maxZoom}`);
}

await build("night");
await build("day");

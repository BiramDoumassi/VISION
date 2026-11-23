// Ingestion des données « Monde » côté serveur (lot C).
// Sources : USGS (séismes, domaine public), GDACS (alertes catastrophes, JRC / ONU), ACLED (conflits, compte requis).
// Les restrictions export / sanctions sont saisies par l'équipe conformité (aucun flux JSON officiel fiable).
// Si le réseau est coupé (DDIL), la dernière photo reste servie ; un import de fichier est possible (sas).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pool } from "./db";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const iso = require("i18n-iso-countries") as { alpha3ToNumeric(a3: string): string | undefined };

export type Txt = { fr: string; en: string };
export type WorldEvent = {
  id: string; kind: "conflict" | "catastrophe"; sub: string; coord: [number, number]; countryIso: string;
  severity: "high" | "medium"; title: Txt; source: string; since: string; until?: string; url?: string;
};
export type Restriction = { id: string; kind: "restriction"; countryIso: string; title: Txt; source: string; since: string; until?: string };

// Les horodatages sans fuseau (GDACS) sont en UTC.
const day = (d: Date | number | string) =>
  new Date(typeof d === "string" && /T\d{2}:\d{2}(:\d{2})?$/.test(d) ? `${d}Z` : d).toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => day(new Date(`${iso}T12:00:00Z`).getTime() + n * 86_400_000);

// ── Pays d'un point (USGS ne donne pas le pays) ───────────────────────────────
type Poly = number[][][];
let countries: { id: string; polys: Poly[] }[] | null = null;
function loadCountries() {
  if (countries) return countries;
  const geo = JSON.parse(readFileSync(join(__dirname, "..", "data", "world.geojson"), "utf8"));
  countries = geo.features.map((f: { properties: { id: string }; geometry: { type: string; coordinates: unknown } }) => ({
    id: f.properties.id,
    polys: (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates) as Poly[],
  }));
  return countries!;
}
function inRing(x: number, y: number, ring: number[][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
export function countryAt(lng: number, lat: number): string {
  for (const c of loadCountries()) {
    for (const p of c.polys) if (inRing(lng, lat, p[0]) && !p.slice(1).some((h) => inRing(lng, lat, h))) return c.id;
  }
  return "";
}

// ── Analyseurs (fonctions pures, testées sur des échantillons) ────────────────
type UsgsFeature = { id: string; properties: { mag: number; place: string; time: number; url: string; alert?: string | null; tsunami?: number }; geometry: { coordinates: number[] } };
export function parseUsgs(fc: { features: UsgsFeature[] }, minMag = 5.5): WorldEvent[] {
  return fc.features.filter((f) => f.properties.mag >= minMag).map((f) => {
    const [lng, lat] = f.geometry.coordinates;
    const since = day(f.properties.time);
    const m = f.properties.mag.toFixed(1);
    const strong = f.properties.mag >= 7 || ["orange", "red"].includes(String(f.properties.alert));
    return {
      id: `usgs-${f.id}`, kind: "catastrophe", sub: "quake", coord: [lng, lat], countryIso: countryAt(lng, lat),
      severity: strong ? "high" : "medium",
      title: { fr: `Séisme M${m.replace(".", ",")} — ${f.properties.place}`, en: `M${m} earthquake — ${f.properties.place}` },
      source: "USGS", since, until: addDays(since, 7), url: f.properties.url,
    };
  });
}

type GdacsFeature = { geometry: { type: string; coordinates: number[] }; properties: { eventtype: string; eventid: number; episodeid?: number; name?: string; alertlevel: string; fromdate: string; todate?: string; iso3?: string; country?: string; url?: { report?: string } } };
const GDACS_SUB: Record<string, { sub: string; fr: string; en: string }> = {
  EQ: { sub: "quake", fr: "Séisme", en: "Earthquake" }, FL: { sub: "flood", fr: "Inondations", en: "Floods" },
  WF: { sub: "fire", fr: "Feux de forêt", en: "Wildfires" }, TC: { sub: "storm", fr: "Cyclone tropical", en: "Tropical cyclone" },
  VO: { sub: "volcano", fr: "Éruption volcanique", en: "Volcanic eruption" }, DR: { sub: "drought", fr: "Sécheresse", en: "Drought" },
};
export function parseGdacs(fc: { features: GdacsFeature[] }): WorldEvent[] {
  const seen = new Set<string>();
  const out: WorldEvent[] = [];
  for (const f of fc.features) {
    const p = f.properties;
    if (f.geometry?.type !== "Point" || !GDACS_SUB[p.eventtype]) continue;
    const id = `gdacs-${p.eventtype}-${p.eventid}`;
    if (seen.has(id)) continue; // un événement peut avoir plusieurs épisodes
    seen.add(id);
    const level = p.alertlevel.toLowerCase();
    const t = GDACS_SUB[p.eventtype];
    const where = p.country ? ` — ${p.country}` : "";
    const lvl = { fr: level === "red" ? "alerte rouge" : level === "orange" ? "alerte orange" : "alerte verte", en: `${level} alert` };
    const since = day(p.fromdate);
    const until = p.todate ? day(p.todate) : undefined;
    out.push({
      id, kind: "catastrophe", sub: t.sub, coord: [f.geometry.coordinates[0], f.geometry.coordinates[1]],
      countryIso: (p.iso3 && iso.alpha3ToNumeric(p.iso3)) || countryAt(f.geometry.coordinates[0], f.geometry.coordinates[1]),
      severity: level === "red" ? "high" : "medium",
      title: { fr: `${t.fr}${p.name ? ` ${p.name}` : ""}${where} (${lvl.fr})`, en: `${t.en}${p.name ? ` ${p.name}` : ""}${where} (${lvl.en})` },
      source: "GDACS", since, until: until && until >= since ? addDays(until, 2) : addDays(since, 10), url: p.url?.report,
    });
  }
  return out;
}

type AcledRow = { event_id_cnty: string; event_date: string; event_type: string; sub_event_type: string; country: string; location: string; latitude: string | number; longitude: string | number; iso: string | number; fatalities: string | number };
const ACLED_FR: Record<string, string> = { Battles: "Affrontements", "Explosions/Remote violence": "Explosions et frappes à distance", "Violence against civilians": "Violences contre des civils" };
export function parseAcled(rows: AcledRow[]): WorldEvent[] {
  return rows.filter((r) => ACLED_FR[r.event_type]).map((r) => {
    const lng = Number(r.longitude), lat = Number(r.latitude), deaths = Number(r.fatalities) || 0;
    const maritime = /sea|naval|ship/i.test(`${r.sub_event_type} ${r.location}`);
    return {
      id: `acled-${r.event_id_cnty}`, kind: "conflict", sub: maritime ? "maritime" : "clashes", coord: [lng, lat],
      countryIso: String(r.iso).padStart(3, "0"), severity: deaths >= 5 || r.event_type === "Battles" ? "high" : "medium",
      title: { fr: `${ACLED_FR[r.event_type]} — ${r.location}, ${r.country}`, en: `${r.event_type} — ${r.location}, ${r.country}` },
      source: "ACLED", since: r.event_date, until: addDays(r.event_date, 14),
    };
  });
}

// ── Connecteurs ───────────────────────────────────────────────────────────────
async function getJson(url: string, init?: RequestInit) {
  const r = await fetch(url, { ...init, signal: AbortSignal.timeout(30_000), headers: { "user-agent": "VISION-world-ingest/0.1", ...(init?.headers ?? {}) } });
  if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`);
  return r.json();
}

const CONNECTORS: Record<string, () => Promise<WorldEvent[]>> = {
  usgs: async () => parseUsgs(await getJson("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson")),
  gdacs: async () => {
    const from = day(Date.now() - 14 * 86_400_000), to = day(Date.now());
    return parseGdacs(await getJson(`https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=EQ;TC;FL;VO;DR;WF&alertlevel=orange;red&fromdate=${from}&todate=${to}`));
  },
  acled: async () => {
    const email = process.env.ACLED_EMAIL, password = process.env.ACLED_PASSWORD;
    if (!email || !password) throw new Error("ACLED non configuré (ACLED_EMAIL / ACLED_PASSWORD)");
    const tok = await getJson("https://acleddata.com/oauth/token", {
      method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username: email, password, grant_type: "password", client_id: "acled", scope: "authenticated" }),
    }) as { access_token: string };
    const from = day(Date.now() - 14 * 86_400_000);
    const q = new URLSearchParams({ _format: "json", event_date: `${from}|${day(Date.now())}`, event_date_where: "BETWEEN", limit: "5000", fields: "event_id_cnty|event_date|event_type|sub_event_type|country|location|latitude|longitude|iso|fatalities" });
    const res = await getJson(`https://acleddata.com/api/acled/read?${q}`, { headers: { authorization: `Bearer ${tok.access_token}` } }) as { data?: AcledRow[] };
    return parseAcled(res.data ?? []);
  },
};

export const enabledSources = () => (process.env.WORLD_SOURCES ?? "usgs,gdacs").split(",").map((s) => s.trim()).filter((s) => CONNECTORS[s]);

async function store(source: string, items: WorldEvent[]) {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    // Fenêtre glissante : la photo d'une source remplace la précédente.
    await c.query("DELETE FROM world_items WHERE source = $1 AND kind <> 'restriction'", [source.toUpperCase()]);
    for (const it of items) {
      await c.query(
        `INSERT INTO world_items (id, kind, source, since, until, payload) VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, since = EXCLUDED.since, until = EXCLUDED.until, updated_at = now()`,
        [it.id, it.kind, source.toUpperCase(), it.since, it.until ?? null, JSON.stringify(it)]);
    }
    await c.query(`INSERT INTO world_sources (name, last_ok, last_try, last_error, item_count) VALUES ($1, now(), now(), NULL, $2)
                   ON CONFLICT (name) DO UPDATE SET last_ok = now(), last_try = now(), last_error = NULL, item_count = $2`, [source, items.length]);
    await c.query("COMMIT");
  } catch (e) {
    await c.query("ROLLBACK").catch(() => undefined);
    throw e;
  } finally { c.release(); }
}

export async function refreshWorld() {
  if (process.env.WORLD_OFFLINE === "true") return;
  for (const s of enabledSources()) {
    try {
      const items = await CONNECTORS[s]();
      await store(s, items);
      console.log(`monde : ${s} → ${items.length} éléments`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await pool.query(`INSERT INTO world_sources (name, last_try, last_error) VALUES ($1, now(), $2)
                        ON CONFLICT (name) DO UPDATE SET last_try = now(), last_error = $2`, [s, msg.slice(0, 500)]).catch(() => undefined);
      console.warn(`monde : ${s} en échec, dernière photo conservée — ${msg}`);
    }
  }
}

export function startWorldScheduler() {
  const minutes = Number(process.env.WORLD_REFRESH_MIN ?? 30);
  refreshWorld();
  setInterval(refreshWorld, minutes * 60_000).unref();
}

export async function worldSnapshot() {
  const items = await pool.query("SELECT payload FROM world_items WHERE until IS NULL OR until >= current_date - 30 ORDER BY since DESC LIMIT 5000");
  const sources = await pool.query(`SELECT name, last_ok AS "lastOk", last_error AS "lastError", last_try AS "lastTry", item_count AS "count" FROM world_sources ORDER BY name`);
  const all = items.rows.map((r) => r.payload);
  return {
    generatedAt: new Date().toISOString(),
    live: { conflicts: enabledSources().includes("acled"), catastrophes: enabledSources().some((s) => s === "usgs" || s === "gdacs"), restrictions: true },
    sources: sources.rows,
    worldEvents: all.filter((x) => x.kind !== "restriction"),
    restrictions: all.filter((x) => x.kind === "restriction"),
  };
}

// Sas de fichiers (DDIL) : importer une photo Monde préparée ailleurs. Remplace les éléments des sources présentes.
export async function importSnapshot(snap: { worldEvents?: WorldEvent[] }) {
  const bySource = new Map<string, WorldEvent[]>();
  for (const e of snap.worldEvents ?? []) bySource.set(e.source.toLowerCase(), [...(bySource.get(e.source.toLowerCase()) ?? []), e]);
  for (const [s, items] of bySource) await store(s, items);
  return [...bySource.entries()].map(([s, i]) => ({ source: s, count: i.length }));
}

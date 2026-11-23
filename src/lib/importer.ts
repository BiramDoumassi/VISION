// Import des données client (Excel .xlsx ou CSV) — entièrement dans le navigateur.
// Le fichier n'est jamais envoyé sur le réseau ; la géolocalisation utilise des référentiels servis par VISION.
import type { Dataset, Flow, LngLat, Site, Supplier } from "@/data/demo";

export type Precision = "exact" | "city" | "country";
export type Issue = {
  level: "warning" | "error";
  code: "noName" | "noCountry" | "unknownCountry" | "cityNotFound" | "badRank" | "unknownTarget" | "unknownAlternative" | "noData" | "badFile" | "duplicate";
  sheet: string; row: number; value?: string;
};
export type ImportResult = {
  dataset: Dataset;
  precision: Record<Precision, number>;
  issues: Issue[];
};

type Country = { a2: string; a3: string; num: string; fr: string[]; en: string[]; c: LngLat | null };
type City = [string, string, string, number, number, number]; // nom, nom alt., pays, lon, lat, population

// ── Normalisation ─────────────────────────────────────────────────────────────
export const norm = (s: unknown) =>
  String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

const ALIASES: Record<string, string[]> = {
  nature: ["nature", "typedeligne", "kind", "objet"],
  name: ["nom", "name", "raisonsociale", "fournisseur", "supplier", "site", "entite"],
  city: ["ville", "city", "commune", "localite"],
  country: ["pays", "country"],
  lat: ["latitude", "lat"],
  lng: ["longitude", "lon", "lng", "long"],
  rank: ["rang", "tier", "rank", "niveau"],
  product: ["produit", "product", "categorie", "famille", "commodity"],
  share: ["partdesachats", "partachats", "share", "shareofspend"],
  lead: ["delai", "delaijours", "leadtime", "lead", "delaistandard"],
  refs: ["references", "refs", "nbreferences", "partnumbers"],
  sole: ["referencessourceunique", "sourceunique", "solesource", "monosource"],
  feeds: ["approvisionne", "supplies", "clients", "destinations", "livre"],
  mode: ["mode", "transport", "modedetransport"],
  orders: ["commandesentransit", "ordersintransit", "commandes"],
  value: ["valeurentransit", "valeurentransitkeur", "valeurentransitke", "intransitvalue"],
  alternatives: ["alternatives", "alternative", "fournisseursalternatifs"],
  price: ["indiceprix", "priceindex", "prix"],
  type: ["type", "typedesite"],
  staff: ["effectif", "headcount", "staff", "salaries"],
  lines: ["lignes", "lines", "lignesdeproduction"],
};

function mapHeaders(row: unknown[]): Record<string, number> {
  const out: Record<string, number> = {};
  const cols = row.map((h) => norm(h));
  // 1) correspondances exactes ; 2) préfixes (ex. « partdesachats » pour « Part des achats (%) »)
  for (const pass of ["exact", "prefix"] as const) {
    cols.forEach((n, i) => {
      if (!n || Object.values(out).includes(i)) return;
      for (const [key, aliases] of Object.entries(ALIASES)) {
        if (out[key] !== undefined) continue;
        const hit = pass === "exact" ? aliases.includes(n) : aliases.some((a) => a.length >= 4 && n.startsWith(a));
        if (hit) { out[key] = i; return; }
      }
    });
  }
  return out;
}

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = Number(String(v).replace(/\s/g, "").replace("%", "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const str = (v: unknown) => (v === null || v === undefined ? "" : String(v).trim());
const list = (v: unknown) => str(v).split(/[;\n|]/).map((x) => x.trim()).filter(Boolean);

// ── Lecture des fichiers ──────────────────────────────────────────────────────
type RawSheet = { name: string; rows: unknown[][] };

function parseCsv(text: string): unknown[][] {
  const firstLine = text.split(/\r?\n/)[0] ?? "";
  const delim = (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === delim) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim() !== ""));
}

async function readFile(file: File): Promise<RawSheet[]> {
  const ext = file.name.toLowerCase().split(".").pop();
  if (ext === "csv" || ext === "txt") {
    let text = await file.text();
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    return [{ name: file.name, rows: parseCsv(text) }];
  }
  const { default: readXlsxFile } = await import("read-excel-file/browser");
  const sheets = await readXlsxFile(file);
  return sheets.map((s) => ({ name: s.sheet, rows: s.data as unknown[][] }));
}

// ── Référentiels de géolocalisation (chargés à la demande) ────────────────────
let refs: Promise<{ countries: Country[]; cities: City[] }> | null = null;
const loadRefs = () => (refs ??= Promise.all([
  fetch("/data/countries.json").then((r) => r.json() as Promise<Country[]>),
  fetch("/data/cities.json").then((r) => r.json() as Promise<City[]>),
]).then(([countries, cities]) => ({ countries, cities })));

function countryIndex(countries: Country[]) {
  const idx = new Map<string, Country>();
  for (const c of countries) {
    for (const k of [c.a2, c.a3, ...c.fr, ...c.en]) idx.set(norm(k), c);
  }
  // usages courants
  const extra: Record<string, string> = { usa: "US", etatsunis: "US", uk: "GB", royaumeuni: "GB", angleterre: "GB", russie: "RU", coreedusud: "KR", southkorea: "KR", turquie: "TR", turkey: "TR", taiwan: "TW", hollande: "NL" };
  for (const [k, a2] of Object.entries(extra)) { const c = countries.find((x) => x.a2 === a2); if (c) idx.set(k, c); }
  return idx;
}

function cityIndex(cities: City[]) {
  const idx = new Map<string, City>();
  for (const c of cities) {
    for (const n of [c[0], c[1]]) {
      if (!n) continue;
      const k = `${c[2]}:${norm(n)}`;
      const prev = idx.get(k);
      if (!prev || prev[5] < c[5]) idx.set(k, c);
    }
  }
  return idx;
}

// ── Import ────────────────────────────────────────────────────────────────────
export async function importFile(file: File): Promise<ImportResult> {
  const issues: Issue[] = [];
  const precision: Record<Precision, number> = { exact: 0, city: 0, country: 0 };
  const empty: Dataset = { source: "import", clientName: "", sites: [], suppliers: [], flows: [] };

  let sheets: RawSheet[];
  try { sheets = await readFile(file); }
  catch { return { dataset: empty, precision, issues: [{ level: "error", code: "badFile", sheet: file.name, row: 0 }] }; }

  const { countries, cities } = await loadRefs();
  const cIdx = countryIndex(countries);
  const cityIdx = cityIndex(cities);

  // Classement des onglets : par nom, sinon par en-têtes.
  const classify = (s: RawSheet): "sites" | "suppliers" | null => {
    const n = norm(s.name);
    if (n.includes("site") || n.includes("usine")) return "sites";
    if (n.includes("fournisseur") || n.includes("supplier")) return "suppliers";
    const h = mapHeaders(s.rows[0] ?? []);
    if (h.name === undefined) return null;
    if (h.rank !== undefined || h.feeds !== undefined || h.product !== undefined) return "suppliers";
    if (h.staff !== undefined || h.type !== undefined || h.lines !== undefined) return "sites";
    return sheets.length === 1 ? "suppliers" : null;
  };

  const ids = new Set<string>();
  const makeId = (prefix: string, name: string) => {
    const base = `${prefix}-${norm(name).slice(0, 24) || "x"}`;
    let id = base, i = 2;
    while (ids.has(id)) id = `${base}-${i++}`;
    ids.add(id);
    return id;
  };

  const locate = (sheet: string, row: number, r: unknown[], h: Record<string, number>) => {
    const countryRaw = str(r[h.country]);
    const country = countryRaw ? cIdx.get(norm(countryRaw)) : undefined;
    const lat = num(r[h.lat]), lng = num(r[h.lng]);
    if (lat !== null && lng !== null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      precision.exact++;
      return { coord: [lng, lat] as LngLat, country, countryLabel: countryRaw };
    }
    if (!countryRaw) { issues.push({ level: "error", code: "noCountry", sheet, row }); return null; }
    if (!country) { issues.push({ level: "error", code: "unknownCountry", sheet, row, value: countryRaw }); return null; }
    const cityRaw = str(r[h.city]);
    const city = cityRaw ? cityIdx.get(`${country.a2}:${norm(cityRaw)}`) : undefined;
    if (city) { precision.city++; return { coord: [city[3], city[4]] as LngLat, country, countryLabel: countryRaw }; }
    if (!country.c) { issues.push({ level: "error", code: "unknownCountry", sheet, row, value: countryRaw }); return null; }
    if (cityRaw) issues.push({ level: "warning", code: "cityNotFound", sheet, row, value: cityRaw });
    precision.country++;
    return { coord: country.c, country, countryLabel: countryRaw };
  };

  const sites: Site[] = [];
  const suppliers: Supplier[] = [];
  const pending: { sup: Supplier; feeds: string[]; alts: string[]; mode: Flow["mode"]; orders: number; value: number; sheet: string; row: number }[] = [];
  const seenNames = new Set<string>();

  for (const sheet of sheets) {
    const kind = classify(sheet);
    if (!kind) continue;
    const h = mapHeaders(sheet.rows[0] ?? []);
    sheet.rows.slice(1).forEach((r, i) => {
      const row = i + 2;
      const name = str(r[h.name]);
      if (!name) { if (r.some((x) => str(x))) issues.push({ level: "error", code: "noName", sheet: sheet.name, row }); return; }
      if (seenNames.has(norm(name))) { issues.push({ level: "warning", code: "duplicate", sheet: sheet.name, row, value: name }); return; }
      const loc = locate(sheet.name, row, r, h);
      if (!loc) return;
      seenNames.add(norm(name));
      const city = str(r[h.city]);
      // Colonne « Nature » facultative (site / fournisseur) : utile pour un CSV unique qui mélange les deux.
      const nat = norm(r[h.nature]);
      const rowKind = nat.startsWith("site") || nat.startsWith("usine") || nat.startsWith("entrepot") ? "sites"
        : nat.startsWith("fourn") || nat.startsWith("suppl") ? "suppliers" : kind;
      if (rowKind === "sites") {
        sites.push({
          id: makeId("site", name), kind: "site", name, city, country: loc.countryLabel, countryIso: loc.country?.num, coord: loc.coord,
          type: { fr: str(r[h.type]) || "Site", en: str(r[h.type]) || "Site" },
          staff: num(r[h.staff]) ?? 0, lines: num(r[h.lines]) ?? 0,
        });
      } else {
        let rank = num(r[h.rank]) ?? 1;
        if (![1, 2, 3].includes(rank)) { issues.push({ level: "warning", code: "badRank", sheet: sheet.name, row, value: str(r[h.rank]) }); rank = Math.min(3, Math.max(1, Math.round(rank))) || 1; }
        const product = str(r[h.product]);
        const sup: Supplier = {
          id: makeId("sup", name), kind: "supplier", name, city, country: loc.countryLabel, countryIso: loc.country?.num ?? "",
          coord: loc.coord, rank: rank as 1 | 2 | 3, product: { fr: product || "—", en: product || "—" },
          sharePct: num(r[h.share]) ?? 0, leadDays: num(r[h.lead]) ?? 0, refs: num(r[h.refs]) ?? 0,
          soleSourceRefs: num(r[h.sole]) ?? 0, feeds: [], alternatives: [],
          annualValueKEur: 0, priceIndex: num(r[h.price]) ?? 100,
        };
        suppliers.push(sup);
        const m = norm(r[h.mode]);
        pending.push({
          sup, feeds: list(r[h.feeds]), alts: list(r[h.alternatives]),
          mode: m.startsWith("mer") || m.startsWith("sea") || m.startsWith("mari") ? "sea" : m.startsWith("air") || m.startsWith("aer") ? "air" : "road",
          orders: num(r[h.orders]) ?? 0, value: num(r[h.value]) ?? 0, sheet: sheet.name, row,
        });
      }
    });
  }

  // Résolution des liens (flux et alternatives) par nom.
  const byName = new Map<string, string>();
  for (const n of [...sites, ...suppliers]) byName.set(norm(n.name), n.id);
  const flows: Flow[] = [];
  for (const p of pending) {
    const targets = p.feeds.map((f) => ({ raw: f, id: byName.get(norm(f)) }));
    for (const t of targets) if (!t.id) issues.push({ level: "warning", code: "unknownTarget", sheet: p.sheet, row: p.row, value: t.raw });
    const ok = targets.filter((t): t is { raw: string; id: string } => !!t.id && t.id !== p.sup.id);
    p.sup.feeds = ok.map((t) => t.id);
    ok.forEach((t, k) => flows.push({
      id: `f-${p.sup.id}-${k}`, from: p.sup.id, to: t.id, mode: p.mode, via: [],
      ordersInTransit: Math.round(p.orders / ok.length), valueKEur: Math.round(p.value / ok.length),
    }));
    for (const a of p.alts) {
      const id = byName.get(norm(a));
      if (id && id.startsWith("sup-")) p.sup.alternatives.push(id);
      else issues.push({ level: "warning", code: "unknownAlternative", sheet: p.sheet, row: p.row, value: a });
    }
  }

  if (sites.length + suppliers.length === 0 && !issues.some((x) => x.level === "error")) {
    issues.push({ level: "error", code: "noData", sheet: file.name, row: 0 });
  }

  return {
    dataset: {
      source: "import", clientName: file.name.replace(/\.[^.]+$/, ""), fileName: file.name,
      importedAt: new Date().toISOString(), sites, suppliers, flows,
    },
    precision, issues,
  };
}

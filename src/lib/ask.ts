// Barre VISION AI : contexte envoyé au modèle sur site, et moteur de règles quand aucun modèle n'est configuré.
import { airspaces, isActive, nodeById, restrictions, straits, worldEvents, type Dataset, type Txt } from "@/data/demo";
import { allCountries } from "./countries";
import type { computeCrossing, Status } from "./crossing";

type Crossing = ReturnType<typeof computeCrossing>;
export type AskResult = { mode: "model" | "rules"; answer: string; entityIds: string[]; model?: string };

export function buildContext(ds: Dataset, crossing: Crossing, at: string, tx: (t: Txt) => string) {
  const st = (id: string) => crossing.status.get(id) ?? "nominal";
  return {
    client: ds.clientName,
    date: at,
    alerts: crossing.alerts.map((a) => ({ id: a.entityId, label: `${nodeById(ds, a.entityId)?.name ?? a.entityId} (${a.status})`, detail: a.reasons.map((r) => `${tx(r.text)} [${r.source}]`).join(" ; ").slice(0, 400) })),
    suppliers: ds.suppliers.map((s) => ({ id: s.id, label: s.name, detail: `rang ${s.rank}, ${tx(s.product)}, ${s.city} ${s.country}, statut ${st(s.id)}, part ${s.sharePct}%, délai ${s.leadDays} j, alimente ${s.feeds.join("|")}` })),
    sites: ds.sites.map((s) => ({ id: s.id, label: s.name, detail: `${s.city} ${s.country}` })),
    events: [
      ...worldEvents.filter((e) => isActive(e, at)).map((e) => ({ id: e.id, label: tx(e.title), detail: `${e.source}, pays ${e.countryIso}, depuis ${e.since}` })),
      ...restrictions.filter((r) => isActive(r, at)).map((r) => ({ id: r.id, label: tx(r.title), detail: `${r.source}, pays ${r.countryIso}` })),
      ...straits.filter((s) => s.closedSince && s.closedSince <= at).map((s) => ({ id: s.id, label: `${s.name} fermé`, detail: s.source })),
      ...airspaces.filter((a) => isActive(a, at)).map((a) => ({ id: a.id, label: tx(a.name), detail: a.source })),
    ].slice(0, 500),
  };
}

// ── Moteur de règles (sans modèle) ───────────────────────────────────────────
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const REGIONS: { words: string[]; test: (lng: number, lat: number) => boolean; label: Txt }[] = [
  { words: ["asie", "asia"], test: (lng, lat) => lng > 60 && lat > -12, label: { fr: "en Asie", en: "in Asia" } },
  { words: ["europe"], test: (lng, lat) => lng > -25 && lng < 45 && lat > 35, label: { fr: "en Europe", en: "in Europe" } },
  { words: ["afrique", "africa"], test: (lng, lat) => lng > -20 && lng < 52 && lat < 35 && lat > -36, label: { fr: "en Afrique", en: "in Africa" } },
  { words: ["moyen-orient", "moyen orient", "middle east", "caucase", "caucasus"], test: (lng, lat) => lng > 34 && lng < 63 && lat > 12 && lat < 43, label: { fr: "au Moyen-Orient et dans le Caucase", en: "in the Middle East and Caucasus" } },
  { words: ["amerique", "america", "etats-unis", "usa"], test: (lng) => lng < -30, label: { fr: "en Amérique", en: "in the Americas" } },
];
const STRAIT_WORDS: Record<string, string[]> = {
  "str-bab": ["mer rouge", "red sea", "bab"], "str-suez": ["suez"], "str-malacca": ["malacca"], "str-hormuz": ["ormuz", "hormuz"], "str-gibraltar": ["gibraltar"],
};

export function rulesAnswer(q: string, ds: Dataset, crossing: Crossing, locale: "fr" | "en", tx: (t: Txt) => string): AskResult {
  const n = norm(q);
  const fr = locale === "fr";
  const st = (id: string): Status => crossing.status.get(id) ?? "nominal";
  let nodes = [...ds.suppliers, ...ds.sites] as (Dataset["suppliers"][number] | Dataset["sites"][number])[];
  const said: string[] = [];

  if (/\bsites?\b|usines?|plants?/.test(n) && !/fournisseur|supplier/.test(n)) nodes = nodes.filter((x) => x.kind === "site");
  else if (/fournisseur|supplier/.test(n)) nodes = nodes.filter((x) => x.kind === "supplier");

  if (/critique|critical/.test(n)) { nodes = nodes.filter((x) => st(x.id) === "alert"); said.push(fr ? "en statut critique" : "in critical status"); }
  else if (/risque|risk|alerte|alert|vigilance|menace|expos/.test(n)) { nodes = nodes.filter((x) => st(x.id) !== "nominal"); said.push(fr ? "à risque" : "at risk"); }

  const rank = n.match(/rang\s*([123])|tier\s*([123])/);
  if (rank) { const r = Number(rank[1] ?? rank[2]); nodes = nodes.filter((x) => x.kind === "supplier" && x.rank === r); said.push(fr ? `de rang ${r}` : `tier ${r}`); }

  const region = REGIONS.find((r) => r.words.some((w) => n.includes(norm(w))));
  if (region) { nodes = nodes.filter((x) => region.test(x.coord[0], x.coord[1])); said.push(tx(region.label)); }

  const country = allCountries().find((c) => [c.name.fr, c.name.en].some((nm) => nm && nm.length > 3 && n.includes(norm(nm))));
  if (country) { nodes = nodes.filter((x) => x.countryIso === country.num); said.push(fr ? `en ${country.name.fr}` : `in ${country.name.en}`); }

  const strait = Object.entries(STRAIT_WORDS).find(([, ws]) => ws.some((w) => n.includes(w)));
  if (strait) {
    const from = new Set(ds.flows.filter((f) => f.via.includes(strait[0])).map((f) => f.from));
    nodes = nodes.filter((x) => from.has(x.id));
    said.push(fr ? `dont les flux passent par ${straits.find((s) => s.id === strait[0])?.name}` : `with flows through ${straits.find((s) => s.id === strait[0])?.name}`);
  }

  const words = n.split(/[^a-z0-9]+/).filter((w) => w.length > 4);
  const byProduct = nodes.filter((x) => x.kind === "supplier" && words.some((w) => norm(`${x.product.fr} ${x.product.en} ${x.name}`).includes(w)));
  if (byProduct.length && byProduct.length < nodes.length) { nodes = byProduct; said.push(fr ? "pour ce produit" : "for this product"); }

  if (said.length === 0) {
    return { mode: "rules", entityIds: [], answer: fr
      ? "Je n'ai pas compris la question. Exemples : « fournisseurs critiques », « fournisseurs à risque en Asie », « commandes qui passent par la mer Rouge », « fournisseurs de rang 2 en Chine »."
      : "I did not understand the question. Examples: “critical suppliers”, “suppliers at risk in Asia”, “orders through the Red Sea”, “tier 2 suppliers in China”." };
  }
  const names = nodes.slice(0, 8).map((x) => x.name).join(", ");
  const allSup = nodes.every((x) => x.kind === "supplier"), allSite = nodes.every((x) => x.kind === "site");
  const noun = (k: number) => fr
    ? `${allSup ? "fournisseur" : allSite ? "site" : "objet"}${k > 1 ? "s" : ""}`
    : `${allSup ? "supplier" : allSite ? "site" : "object"}${k > 1 ? "s" : ""}`;
  const answer = nodes.length === 0
    ? (fr ? `Aucun résultat ${said.join(", ")}.` : `No result ${said.join(", ")}.`)
    : (fr ? `${nodes.length} ${noun(nodes.length)} ${said.join(" ")} : ${names}${nodes.length > 8 ? "…" : ""}.` : `${nodes.length} ${noun(nodes.length)} ${said.join(" ")}: ${names}${nodes.length > 8 ? "…" : ""}.`);
  return { mode: "rules", answer, entityIds: nodes.map((x) => x.id) };
}

export const looksLikeQuestion = (q: string) => q.includes("?") || q.trim().split(/\s+/).length >= 3;

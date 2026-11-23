// Données de démonstration — client fictif « Compositec Industrie ».
// Tous les noms d'entreprises sont inventés. Les événements « Monde » sont fictifs et marqués DÉMO.
// À remplacer par les données du prospect (connecteurs ERP / import Excel) lors d'un pilote.

import {
  airspaces, countryRisk, infra, satellites, straits, worldEvents,
  type Airspace, type Infra, type Satellite, type Strait, type WorldEvent,
} from "./world";
import { countryRef } from "@/lib/countries";

export * from "./world";

export type Lang = "fr" | "en";
export type Txt = { fr: string; en: string };
export type LngLat = [number, number];

export type Site = {
  id: string; kind: "site"; name: string; city: string; country: string; countryIso?: string; coord: LngLat;
  type: Txt; staff: number; lines: number;
};

export type Supplier = {
  id: string; kind: "supplier"; name: string; city: string; country: string; countryIso: string; coord: LngLat;
  rank: 1 | 2 | 3; product: Txt;
  sharePct: number;      // part des achats de la catégorie
  leadDays: number;      // délai standard
  refs: number;          // nombre de références achetées
  soleSourceRefs: number;
  feeds: string[];       // ids des sites ou fournisseurs aval servis
  alternatives: string[];
  annualValueKEur: number;
  priceIndex: number;    // 100 = prix de référence
};

export type Flow = {
  id: string; from: string; to: string; mode: "sea" | "road" | "air";
  via: string[];          // ids de détroits traversés
  ordersInTransit: number; valueKEur: number;
};

export const CLIENT = { name: "Compositec Industrie", sector: { fr: "Sous-traitant aéro-défense", en: "Aerospace-defense subcontractor" } };

export const sites: Site[] = [
  { id: "site-tls", kind: "site", name: "Compositec Toulouse", city: "Toulouse", country: "France", countryIso: "250", coord: [1.44, 43.6], type: { fr: "Usine — pièces composites", en: "Plant — composite parts" }, staff: 420, lines: 6 },
  { id: "site-mrg", kind: "site", name: "Compositec Mérignac", city: "Mérignac", country: "France", countryIso: "250", coord: [-0.7, 44.83], type: { fr: "Usine — assemblage", en: "Plant — assembly" }, staff: 260, lines: 3 },
  { id: "site-stn", kind: "site", name: "Compositec Saint-Nazaire", city: "Saint-Nazaire", country: "France", countryIso: "250", coord: [-2.2, 47.27], type: { fr: "Entrepôt et finition", en: "Warehouse and finishing" }, staff: 110, lines: 2 },
];

export const suppliers: Supplier[] = [
  { id: "sup-rhone", kind: "supplier", name: "Aérostructures Rhône", city: "Lyon", country: "France", countryIso: "250", coord: [4.84, 45.76], rank: 1, product: { fr: "Pré-imprégnés carbone", en: "Carbon prepregs" }, sharePct: 34, leadDays: 21, refs: 42, soleSourceRefs: 3, feeds: ["site-tls", "site-mrg"], alternatives: [], annualValueKEur: 9800, priceIndex: 100 },
  { id: "sup-atl", kind: "supplier", name: "Usinage Atlantique", city: "Nantes", country: "France", countryIso: "250", coord: [-1.55, 47.22], rank: 1, product: { fr: "Usinage de précision", en: "Precision machining" }, sharePct: 22, leadDays: 14, refs: 65, soleSourceRefs: 0, feeds: ["site-stn", "site-mrg"], alternatives: [], annualValueKEur: 5100, priceIndex: 100 },
  { id: "sup-hexa", kind: "supplier", name: "Hexacore Iberia", city: "Getafe", country: "Espagne", countryIso: "724", coord: [-3.72, 40.3], rank: 1, product: { fr: "Nids d'abeille", en: "Honeycomb cores" }, sharePct: 61, leadDays: 28, refs: 18, soleSourceRefs: 4, feeds: ["site-tls"], alternatives: [], annualValueKEur: 4300, priceIndex: 100 },
  { id: "sup-nagoya", kind: "supplier", name: "Résines Nagoya", city: "Nagoya", country: "Japon", countryIso: "392", coord: [136.9, 35.18], rank: 1, product: { fr: "Résines époxy", en: "Epoxy resins" }, sharePct: 47, leadDays: 45, refs: 12, soleSourceRefs: 2, feeds: ["site-tls"], alternatives: ["sup-saxony"], annualValueKEur: 3600, priceIndex: 100 },
  { id: "sup-kura", kind: "supplier", name: "Fibres Kura", city: "Gandja", country: "Azerbaïdjan", countryIso: "031", coord: [46.36, 40.68], rank: 2, product: { fr: "Fibre de carbone", en: "Carbon fibre" }, sharePct: 18, leadDays: 35, refs: 9, soleSourceRefs: 2, feeds: ["sup-rhone", "sup-hexa"], alternatives: ["sup-saxony", "sup-utah", "sup-kyushu"], annualValueKEur: 2700, priceIndex: 100 },
  { id: "sup-lomb", kind: "supplier", name: "Tissage Lombardia", city: "Milan", country: "Italie", countryIso: "380", coord: [9.19, 45.46], rank: 2, product: { fr: "Tissus techniques", en: "Technical fabrics" }, sharePct: 29, leadDays: 18, refs: 21, soleSourceRefs: 0, feeds: ["sup-rhone"], alternatives: [], annualValueKEur: 1900, priceIndex: 100 },
  { id: "sup-saxony", kind: "supplier", name: "Carbon Saxony", city: "Dresde", country: "Allemagne", countryIso: "276", coord: [13.74, 51.05], rank: 2, product: { fr: "Fibre de carbone", en: "Carbon fibre" }, sharePct: 6, leadDays: 24, refs: 3, soleSourceRefs: 0, feeds: ["sup-rhone"], alternatives: [], annualValueKEur: 600, priceIndex: 112 },
  { id: "sup-utah", kind: "supplier", name: "Fibres Wasatch", city: "Salt Lake City", country: "États-Unis", countryIso: "840", coord: [-111.89, 40.76], rank: 2, product: { fr: "Fibre de carbone", en: "Carbon fibre" }, sharePct: 0, leadDays: 38, refs: 0, soleSourceRefs: 0, feeds: [], alternatives: [], annualValueKEur: 0, priceIndex: 106 },
  { id: "sup-kyushu", kind: "supplier", name: "Kyushu Carbon", city: "Fukuoka", country: "Japon", countryIso: "392", coord: [130.4, 33.59], rank: 2, product: { fr: "Fibre de carbone", en: "Carbon fibre" }, sharePct: 0, leadDays: 52, refs: 0, soleSourceRefs: 0, feeds: [], alternatives: [], annualValueKEur: 0, priceIndex: 98 },
  { id: "sup-shandong", kind: "supplier", name: "Précurseurs Jinan", city: "Jinan", country: "Chine", countryIso: "156", coord: [117.0, 36.67], rank: 3, product: { fr: "Précurseur PAN", en: "PAN precursor" }, sharePct: 55, leadDays: 40, refs: 2, soleSourceRefs: 1, feeds: ["sup-kura"], alternatives: [], annualValueKEur: 0, priceIndex: 100 },
  { id: "sup-gujarat", kind: "supplier", name: "Additifs Gujarat", city: "Ahmedabad", country: "Inde", countryIso: "356", coord: [72.57, 23.02], rank: 3, product: { fr: "Additifs de durcissement", en: "Curing additives" }, sharePct: 40, leadDays: 30, refs: 4, soleSourceRefs: 1, feeds: ["sup-nagoya"], alternatives: [], annualValueKEur: 0, priceIndex: 100 },
];

export const flows: Flow[] = [
  { id: "f-rhone-tls", from: "sup-rhone", to: "site-tls", mode: "road", via: [], ordersInTransit: 4, valueKEur: 640 },
  { id: "f-rhone-mrg", from: "sup-rhone", to: "site-mrg", mode: "road", via: [], ordersInTransit: 2, valueKEur: 310 },
  { id: "f-atl-stn", from: "sup-atl", to: "site-stn", mode: "road", via: [], ordersInTransit: 3, valueKEur: 180 },
  { id: "f-atl-mrg", from: "sup-atl", to: "site-mrg", mode: "road", via: [], ordersInTransit: 1, valueKEur: 70 },
  { id: "f-hexa-tls", from: "sup-hexa", to: "site-tls", mode: "road", via: [], ordersInTransit: 2, valueKEur: 260 },
  { id: "f-nagoya-tls", from: "sup-nagoya", to: "site-tls", mode: "sea", via: ["str-malacca", "str-bab", "str-suez"], ordersInTransit: 3, valueKEur: 520 },
  { id: "f-nagoya-tls-air", from: "sup-nagoya", to: "site-tls", mode: "air", via: [], ordersInTransit: 1, valueKEur: 80 },
  { id: "f-kura-rhone", from: "sup-kura", to: "sup-rhone", mode: "road", via: [], ordersInTransit: 2, valueKEur: 210 },
  { id: "f-kura-hexa", from: "sup-kura", to: "sup-hexa", mode: "road", via: [], ordersInTransit: 1, valueKEur: 95 },
  { id: "f-lomb-rhone", from: "sup-lomb", to: "sup-rhone", mode: "road", via: [], ordersInTransit: 2, valueKEur: 120 },
  { id: "f-saxony-rhone", from: "sup-saxony", to: "sup-rhone", mode: "road", via: [], ordersInTransit: 0, valueKEur: 0 },
  { id: "f-shandong-kura", from: "sup-shandong", to: "sup-kura", mode: "road", via: [], ordersInTransit: 1, valueKEur: 0 },
  { id: "f-gujarat-nagoya", from: "sup-gujarat", to: "sup-nagoya", mode: "sea", via: ["str-malacca"], ordersInTransit: 1, valueKEur: 0 },
];

export type Country = { id: string; kind: "country"; num: string; name: Txt; coord: LngLat; score: number | null };
export type Entity = Site | Supplier | WorldEvent | Strait | Infra | Airspace | Satellite | Country;

// Jeu de données client : la démo par défaut, remplacé par un import Excel/CSV.
export type Dataset = {
  source: "demo" | "import";
  clientName: string;
  fileName?: string;
  importedAt?: string;
  sites: Site[];
  suppliers: Supplier[];
  flows: Flow[];
};

export const DEMO_DATASET: Dataset = { source: "demo", clientName: CLIENT.name, sites, suppliers, flows };

export const entityById = (ds: Dataset, id: string): Entity | undefined => {
  if (id.startsWith("ctry-")) return countryEntity(id.slice(5));
  return [...ds.sites, ...ds.suppliers, ...worldEvents, ...straits, ...infra, ...airspaces, ...satellites].find((e) => e.id === id);
};

export const nodeById = (ds: Dataset, id: string): Site | Supplier | undefined =>
  [...ds.sites, ...ds.suppliers].find((e) => e.id === id);

export function countryEntity(num: string): Country | undefined {
  const ref = countryRef(num);
  if (!ref) return undefined;
  return { id: `ctry-${num}`, kind: "country", num, name: ref.name, coord: ref.coord, score: countryRisk.find((c) => c.num === num)?.score ?? null };
}

// Couches « Monde » — données de démonstration, toutes marquées DÉMO.
// Les dates sont relatives à aujourd'hui pour que la frise temporelle reste parlante quel que soit le jour.
// Le lot C remplacera ces données par l'ingestion serveur des vraies sources (ACLED, GDACS, USGS, sanctions UE…).
import type { LngLat, Txt } from "./demo";

const DAY = 86_400_000;
const today = () => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; };
export const dayIso = (offset: number) => new Date(today().getTime() + offset * DAY).toISOString().slice(0, 10);
export const isActive = (it: { since: string; until?: string }, at: string) => it.since <= at && (!it.until || it.until >= at);

export type Severity = "high" | "medium";

export type WorldEvent = {
  id: string; kind: "conflict" | "catastrophe"; sub: string; coord: LngLat; countryIso: string;
  severity: Severity; title: Txt; source: string; since: string; until?: string;
};
export type Restriction = { id: string; kind: "restriction"; countryIso: string; title: Txt; source: string; since: string; until?: string };
export type Strait = { id: string; kind: "strait"; name: string; coord: LngLat; closedSince?: string; closedUntil?: string; title: Txt; source: string; since: string };
export type Infra = { id: string; kind: "infra"; sub: "power" | "datacenter" | "cable" | "port"; name: string; coord: LngLat; countryIso: string; disruptedSince?: string; title: Txt; source: string; since: string };
export type Airspace = { id: string; kind: "airspace"; name: Txt; coord: LngLat; radiusKm: number; title: Txt; source: string; since: string; until?: string };
export type Satellite = { id: string; kind: "satellite"; sub: "imagery" | "telecom" | "navigation"; name: string; coord: LngLat; orbit: "LEO" | "MEO" | "GEO"; revisitH?: number; title: Txt; source: string; since: string };
export type CountryRisk = { num: string; score: number };

// Sous-types affichés comme sous-filtres dans le panneau des couches
export const SUBTYPES: Record<string, { id: string; label: Txt }[]> = {
  conflicts: [
    { id: "clashes", label: { fr: "Affrontements armés", en: "Armed clashes" } },
    { id: "maritime", label: { fr: "Attaques maritimes", en: "Maritime attacks" } },
    { id: "crime", label: { fr: "Criminalité organisée", en: "Organised crime" } },
  ],
  catastrophes: [
    { id: "flood", label: { fr: "Inondations", en: "Floods" } },
    { id: "quake", label: { fr: "Séismes", en: "Earthquakes" } },
    { id: "fire", label: { fr: "Incendies", en: "Wildfires" } },
  ],
  infra: [
    { id: "power", label: { fr: "Énergie", en: "Power" } },
    { id: "port", label: { fr: "Ports", en: "Ports" } },
    { id: "cable", label: { fr: "Câbles sous-marins", en: "Subsea cables" } },
    { id: "datacenter", label: { fr: "Centres de données", en: "Data centres" } },
  ],
  space: [
    { id: "imagery", label: { fr: "Imagerie", en: "Imagery" } },
    { id: "telecom", label: { fr: "Télécoms", en: "Telecoms" } },
    { id: "navigation", label: { fr: "Navigation", en: "Navigation" } },
  ],
};

export const worldEvents: WorldEvent[] = [
  { id: "ev-kura", kind: "conflict", sub: "clashes", coord: [46.62, 40.48], countryIso: "031", severity: "high", title: { fr: "Affrontements frontaliers (DÉMO)", en: "Border clashes (DEMO)" }, source: "ACLED (démo)", since: dayIso(-1) },
  { id: "ev-sahel", kind: "conflict", sub: "clashes", coord: [0.5, 14.5], countryIso: "466", severity: "high", title: { fr: "Violences armées, Sahel central (DÉMO)", en: "Armed violence, central Sahel (DEMO)" }, source: "ACLED (démo)", since: dayIso(-21) },
  { id: "ev-redsea", kind: "conflict", sub: "maritime", coord: [43.1, 13.6], countryIso: "887", severity: "high", title: { fr: "Attaques contre des navires marchands (DÉMO)", en: "Attacks on merchant ships (DEMO)" }, source: "UCDP (démo)", since: dayIso(-9) },
  { id: "ev-guayaquil", kind: "conflict", sub: "crime", coord: [-79.9, -2.19], countryIso: "218", severity: "medium", title: { fr: "Violences liées au narcotrafic, zone portuaire (DÉMO)", en: "Drug-trafficking violence, port area (DEMO)" }, source: "ACLED (démo)", since: dayIso(-14) },
  { id: "ev-flood", kind: "catastrophe", sub: "flood", coord: [72.75, 23.1], countryIso: "356", severity: "medium", title: { fr: "Inondations — alerte orange (DÉMO)", en: "Floods — orange alert (DEMO)" }, source: "GDACS (démo)", since: dayIso(-3), until: dayIso(4) },
  { id: "ev-quake", kind: "catastrophe", sub: "quake", coord: [142.2, 38.3], countryIso: "392", severity: "medium", title: { fr: "Séisme M6,1 au large (DÉMO)", en: "M6.1 offshore earthquake (DEMO)" }, source: "USGS (démo)", since: dayIso(-4) },
  { id: "ev-fire", kind: "catastrophe", sub: "fire", coord: [-0.9, 44.4], countryIso: "250", severity: "medium", title: { fr: "Feux de forêt, Landes (DÉMO)", en: "Forest fires, Landes (DEMO)" }, source: "NASA FIRMS (démo)", since: dayIso(-27), until: dayIso(-22) },
];

export const restrictions: Restriction[] = [
  { id: "rs-031", kind: "restriction", countryIso: "031", title: { fr: "Restriction export annoncée — matériaux composites (DÉMO)", en: "Announced export restriction — composite materials (DEMO)" }, source: "Journal officiel (démo)", since: dayIso(0) },
  { id: "rs-156", kind: "restriction", countryIso: "156", title: { fr: "Contrôle export — précurseurs de fibre de carbone (DÉMO)", en: "Export control — carbon fibre precursors (DEMO)" }, source: "MOFCOM (démo)", since: dayIso(6) },
];

export const straits: Strait[] = [
  { id: "str-bab", kind: "strait", name: "Bab-el-Mandeb", coord: [43.33, 12.6], closedSince: dayIso(-8), title: { fr: "Passage suspendu pour le fret commercial (DÉMO)", en: "Commercial transit suspended (DEMO)" }, source: "AIS (démo)", since: dayIso(-8) },
  { id: "str-suez", kind: "strait", name: "Canal de Suez", coord: [32.55, 30.0], title: { fr: "Trafic normal (DÉMO)", en: "Normal traffic (DEMO)" }, source: "AIS (démo)", since: dayIso(-30) },
  { id: "str-malacca", kind: "strait", name: "Détroit de Malacca", coord: [101.5, 2.5], title: { fr: "Trafic normal (DÉMO)", en: "Normal traffic (DEMO)" }, source: "AIS (démo)", since: dayIso(-30) },
  { id: "str-hormuz", kind: "strait", name: "Détroit d'Ormuz", coord: [56.3, 26.6], title: { fr: "Trafic normal (DÉMO)", en: "Normal traffic (DEMO)" }, source: "AIS (démo)", since: dayIso(-30) },
  { id: "str-gibraltar", kind: "strait", name: "Détroit de Gibraltar", coord: [-5.6, 35.95], title: { fr: "Trafic normal (DÉMO)", en: "Normal traffic (DEMO)" }, source: "AIS (démo)", since: dayIso(-30) },
];

export const infra: Infra[] = [
  { id: "in-ganja", kind: "infra", sub: "power", name: "Sous-station de Gandja", coord: [46.4, 40.7], countryIso: "031", disruptedSince: dayIso(-1), title: { fr: "Coupure de courant prolongée (DÉMO)", en: "Prolonged power outage (DEMO)" }, source: "Opérateur réseau (démo)", since: dayIso(-30) },
  { id: "in-fos", kind: "infra", sub: "port", name: "Port de Marseille-Fos", coord: [4.87, 43.42], countryIso: "250", title: { fr: "Opérations normales (DÉMO)", en: "Normal operations (DEMO)" }, source: "Capitainerie (démo)", since: dayIso(-30) },
  { id: "in-jebel", kind: "infra", sub: "port", name: "Port de Jebel Ali", coord: [55.03, 25.01], countryIso: "784", title: { fr: "Opérations normales (DÉMO)", en: "Normal operations (DEMO)" }, source: "Capitainerie (démo)", since: dayIso(-30) },
  { id: "in-nagoya-port", kind: "infra", sub: "port", name: "Port de Nagoya", coord: [136.88, 35.08], countryIso: "392", title: { fr: "Opérations normales (DÉMO)", en: "Normal operations (DEMO)" }, source: "Capitainerie (démo)", since: dayIso(-30) },
  { id: "in-mrs-cable", kind: "infra", sub: "cable", name: "Atterrissement de câbles de Marseille", coord: [5.37, 43.29], countryIso: "250", title: { fr: "Capacité nominale (DÉMO)", en: "Nominal capacity (DEMO)" }, source: "TeleGeography (démo)", since: dayIso(-30) },
  { id: "in-redsea-cable", kind: "infra", sub: "cable", name: "Câbles de la mer Rouge", coord: [41.0, 16.5], countryIso: "887", disruptedSince: dayIso(-6), title: { fr: "Dégradation de capacité signalée (DÉMO)", en: "Capacity degradation reported (DEMO)" }, source: "TeleGeography (démo)", since: dayIso(-30) },
  { id: "in-fra-dc", kind: "infra", sub: "datacenter", name: "Campus de données de Francfort", coord: [8.68, 50.11], countryIso: "276", title: { fr: "Opérations normales (DÉMO)", en: "Normal operations (DEMO)" }, source: "Opérateur (démo)", since: dayIso(-30) },
  { id: "in-gujarat-power", kind: "infra", sub: "power", name: "Centrale d'Ahmedabad", coord: [72.6, 23.0], countryIso: "356", disruptedSince: dayIso(-2), title: { fr: "Production réduite après inondations (DÉMO)", en: "Reduced output after floods (DEMO)" }, source: "Opérateur réseau (démo)", since: dayIso(-30) },
];

export const airspaces: Airspace[] = [
  { id: "air-ural", kind: "airspace", name: { fr: "Espace aérien fermé — Oural", en: "Closed airspace — Urals" }, coord: [60, 58], radiusKm: 900, title: { fr: "Fermeture aux vols civils de fret (DÉMO)", en: "Closed to civil cargo flights (DEMO)" }, source: "NOTAM (démo)", since: dayIso(-12) },
  { id: "air-sahel", kind: "airspace", name: { fr: "Espace aérien restreint — Sahel", en: "Restricted airspace — Sahel" }, coord: [1.5, 15.5], radiusKm: 500, title: { fr: "Restrictions temporaires (DÉMO)", en: "Temporary restrictions (DEMO)" }, source: "NOTAM (démo)", since: dayIso(-20), until: dayIso(10) },
];

export const satellites: Satellite[] = [
  { id: "sat-pleiades", kind: "satellite", sub: "imagery", name: "Imageur optique THR-1", coord: [44.5, 38.0], orbit: "LEO", revisitH: 24, title: { fr: "Imagerie optique 50 cm, zone Caucase demain matin (DÉMO)", en: "50 cm optical imagery, Caucasus pass tomorrow morning (DEMO)" }, source: "Catalogue orbital (démo)", since: dayIso(-30) },
  { id: "sat-sar", kind: "satellite", sub: "imagery", name: "Radar SAR-2", coord: [50.0, 20.0], orbit: "LEO", revisitH: 12, title: { fr: "Imagerie radar tout temps (DÉMO)", en: "All-weather radar imagery (DEMO)" }, source: "Catalogue orbital (démo)", since: dayIso(-30) },
  { id: "sat-geo-eu", kind: "satellite", sub: "telecom", name: "Télécom GEO 13°E", coord: [13, 0], orbit: "GEO", title: { fr: "Liaison satellitaire Europe–Afrique (DÉMO)", en: "Europe–Africa satellite link (DEMO)" }, source: "Catalogue orbital (démo)", since: dayIso(-30) },
  { id: "sat-geo-in", kind: "satellite", sub: "telecom", name: "Télécom GEO 68°E", coord: [68, 0], orbit: "GEO", title: { fr: "Liaison satellitaire océan Indien (DÉMO)", en: "Indian Ocean satellite link (DEMO)" }, source: "Catalogue orbital (démo)", since: dayIso(-30) },
  { id: "sat-gnss", kind: "satellite", sub: "navigation", name: "Navigation MEO-07", coord: [20, 45], orbit: "MEO", title: { fr: "Constellation de navigation (DÉMO)", en: "Navigation constellation (DEMO)" }, source: "Catalogue orbital (démo)", since: dayIso(-30) },
];

// Score de risque pays 0–100 (démo) : 0 = faible, 100 = très élevé
export const countryRisk: CountryRisk[] = [
  { num: "250", score: 18 }, { num: "276", score: 15 }, { num: "380", score: 24 }, { num: "724", score: 20 }, { num: "826", score: 17 },
  { num: "392", score: 22 }, { num: "840", score: 26 }, { num: "124", score: 12 }, { num: "156", score: 48 }, { num: "356", score: 41 },
  { num: "031", score: 74 }, { num: "051", score: 62 }, { num: "268", score: 55 }, { num: "792", score: 52 }, { num: "643", score: 81 },
  { num: "804", score: 88 }, { num: "112", score: 70 }, { num: "364", score: 79 }, { num: "887", score: 90 }, { num: "706", score: 92 },
  { num: "466", score: 86 }, { num: "562", score: 80 }, { num: "854", score: 84 }, { num: "729", score: 91 }, { num: "434", score: 83 },
  { num: "218", score: 58 }, { num: "484", score: 55 }, { num: "076", score: 40 }, { num: "710", score: 43 }, { num: "566", score: 66 },
  { num: "784", score: 30 }, { num: "682", score: 38 }, { num: "818", score: 50 }, { num: "504", score: 32 }, { num: "012", score: 45 },
];

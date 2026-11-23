"use client";
import { create } from "zustand";
import { DEMO_DATASET, type Dataset } from "@/data/demo";

export type Locale = "fr" | "en";
export type ThemeMode = "signal" | "mono";
export type LayerId =
  | "conflicts" | "restrictions" | "catastrophes" | "maritime" | "air" | "infra" | "space" | "countryRisk"
  | "sites" | "suppliers" | "flows" | "alerts";
export type FormId = "decide" | "order" | "incident";

export type Decision = {
  id: string; entityId: string; at: string;
  decision: string; reason: string; rejected: string; owner: string;
};
export type Order = {
  id: string; entityId: string; at: string;
  vendorId: string; vendorName: string; quantity: string; note: string; owner: string;
};
export type Incident = {
  id: string; entityId: string; at: string;
  title: string; severity: "high" | "medium"; owner: string; due: string; status: "open" | "closed";
};

type State = {
  dataset: Dataset;
  importOpen: boolean;
  locale: Locale;
  theme: ThemeMode;
  projection: "globe" | "mercator";
  layers: Record<LayerId, boolean>;
  hiddenSubs: string[];
  radiusKm: number;
  dayOffset: number;
  selectedId: string | null;
  simulatingId: string | null;
  form: FormId | null;
  briefOpen: boolean;
  ledger: Decision[];
  orders: Order[];
  incidents: Incident[];
  flyTarget: { id: string; n: number } | null;
  setLocale: (l: Locale) => void;
  setTheme: (t: ThemeMode) => void;
  setProjection: (p: "globe" | "mercator") => void;
  toggleLayer: (id: LayerId) => void;
  toggleSub: (id: string) => void;
  setDayOffset: (n: number) => void;
  select: (id: string | null, fly?: boolean) => void;
  simulate: (id: string | null) => void;
  openForm: (f: FormId | null) => void;
  setBriefOpen: (open: boolean) => void;
  recordDecision: (d: Omit<Decision, "id" | "at">) => void;
  recordOrder: (o: Omit<Order, "id" | "at">) => void;
  recordIncident: (i: Omit<Incident, "id" | "at" | "status">) => void;
  setDataset: (ds: Dataset) => void;
  openImport: (open: boolean) => void;
};

// Stockage navigateur : simple confort par utilisateur, jamais une source de vérité.
// Le lot B déplace le Decision Ledger, les commandes et les incidents côté NestJS / PostgreSQL.
const read = <T,>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
};
const write = (key: string, v: unknown) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* stockage indisponible */ } };
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

export const useVision = create<State>((set, get) => ({
  dataset: DEMO_DATASET,
  importOpen: false,
  locale: "fr",
  theme: "signal",
  projection: "globe",
  layers: {
    conflicts: true, restrictions: true, catastrophes: true, maritime: true,
    air: true, infra: true, space: false, countryRisk: false,
    sites: true, suppliers: true, flows: true, alerts: true,
  },
  hiddenSubs: [],
  radiusKm: 50,
  dayOffset: 0,
  selectedId: null,
  simulatingId: null,
  form: null,
  briefOpen: true,
  ledger: [],
  orders: [],
  incidents: [],
  flyTarget: null,
  setLocale: (locale) => { write("vision.locale", locale); set({ locale }); },
  setTheme: (theme) => { write("vision.theme", theme); set({ theme }); },
  setProjection: (projection) => set({ projection }),
  toggleLayer: (id) => set({ layers: { ...get().layers, [id]: !get().layers[id] } }),
  toggleSub: (id) => {
    const h = get().hiddenSubs;
    set({ hiddenSubs: h.includes(id) ? h.filter((x) => x !== id) : [...h, id] });
  },
  setDayOffset: (dayOffset) => set({ dayOffset }),
  select: (selectedId, fly = false) => set({
    selectedId, simulatingId: null, form: null,
    flyTarget: fly && selectedId ? { id: selectedId, n: (get().flyTarget?.n ?? 0) + 1 } : get().flyTarget,
  }),
  simulate: (simulatingId) => set({ simulatingId }),
  openForm: (form) => set({ form }),
  setBriefOpen: (briefOpen) => set({ briefOpen }),
  recordDecision: (d) => {
    const ledger = [{ ...d, id: newId("DL"), at: new Date().toISOString() }, ...get().ledger];
    write("vision.ledger", ledger);
    set({ ledger, form: null });
  },
  // Une commande est une demande envoyée au fournisseur (catalogue uniquement, aucun paiement),
  // tracée aussi dans le Decision Ledger.
  recordOrder: (o) => {
    const at = new Date().toISOString();
    const orders = [{ ...o, id: newId("CMD"), at }, ...get().orders];
    const ledger = [{ id: newId("DL"), at, entityId: o.entityId, decision: `Demande de commande à ${o.vendorName}${o.quantity ? ` (${o.quantity})` : ""}`, reason: o.note, rejected: "", owner: o.owner }, ...get().ledger];
    write("vision.orders", orders); write("vision.ledger", ledger);
    set({ orders, ledger, form: null });
  },
  recordIncident: (i) => {
    const incidents = [{ ...i, id: newId("INC"), at: new Date().toISOString(), status: "open" as const }, ...get().incidents];
    write("vision.incidents", incidents);
    set({ incidents, form: null });
  },
  // Les données importées restent sur le poste (stockage du navigateur), jamais envoyées sur le réseau.
  setDataset: (dataset) => {
    if (dataset.source === "import") write("vision.dataset", dataset);
    else { try { localStorage.removeItem("vision.dataset"); } catch { /* stockage indisponible */ } }
    set({ dataset, selectedId: null, simulatingId: null, form: null, importOpen: false });
  },
  openImport: (importOpen) => set({ importOpen }),
}));

export function hydrateFromStorage() {
  useVision.setState({
    locale: read<Locale>("vision.locale", "fr"),
    theme: read<ThemeMode>("vision.theme", "signal"),
    ledger: read<Decision[]>("vision.ledger", []),
    orders: read<Order[]>("vision.orders", []),
    incidents: read<Incident[]>("vision.incidents", []),
    dataset: read<Dataset>("vision.dataset", DEMO_DATASET),
  });
}

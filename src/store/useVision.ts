"use client";
import { create } from "zustand";
import { DEMO_DATASET, applyWorldSnapshot, type Dataset, type WorldSnapshot } from "@/data/demo";
import { api, apiEnabled, initBackend, type Me } from "@/lib/backend";
import { LOCAL_POLICY, type Policy } from "@/data/policy";
import type { PackId } from "@/data/packs";
import type { AskResult } from "@/lib/ask";

export type Locale = "fr" | "en";
export type ThemeMode = "signal" | "mono";
export type Basemap = "night" | "day" | "vector";
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
  backend: "loading" | "local" | "api";
  me: Me | null;
  syncError: string | null;
  worldVersion: number;
  pack: PackId;
  policy: Policy;
  aiModel: string | null;
  ai: { question: string; loading: boolean; result: AskResult | null; error: string | null } | null;
  settingsOpen: boolean;
  setPack: (p: PackId) => void;
  setAi: (a: State["ai"]) => void;
  openSettings: (o: boolean) => void;
  worldSources: WorldSnapshot["sources"] | null;
  dataset: Dataset;
  importOpen: boolean;
  locale: Locale;
  theme: ThemeMode;
  projection: "globe" | "mercator";
  basemap: Basemap;
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
  setBasemap: (b: Basemap) => void;
  toggleLayer: (id: LayerId) => void;
  toggleSub: (id: string) => void;
  setDayOffset: (n: number) => void;
  select: (id: string | null, fly?: boolean) => void;
  simulate: (id: string | null) => void;
  openForm: (f: FormId | null) => void;
  setBriefOpen: (open: boolean) => void;
  recordDecision: (d: Omit<Decision, "id" | "at">) => Promise<void>;
  recordOrder: (o: Omit<Order, "id" | "at">) => Promise<void>;
  recordIncident: (i: Omit<Incident, "id" | "at" | "status">) => Promise<void>;
  setDataset: (ds: Dataset) => Promise<void>;
  openImport: (open: boolean) => void;
};

// Stockage navigateur : simple confort par utilisateur, jamais une source de vérité.
// Le lot B déplace le Decision Ledger, les commandes et les incidents côté NestJS / PostgreSQL.
const read = <T,>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
};
const write = (key: string, v: unknown) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* stockage indisponible */ } };
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

// En mode API, toute écriture passe d'abord par le serveur ; l'état local n'est mis à jour qu'après succès.
const fail = (e: unknown) => useVision.setState({ syncError: e instanceof Error ? e.message : String(e) });

export const useVision = create<State>((set, get) => ({
  backend: "loading",
  me: null,
  syncError: null,
  worldVersion: 0,
  pack: "aero",
  policy: LOCAL_POLICY,
  aiModel: null,
  ai: null,
  settingsOpen: false,
  setPack: (pack) => { write("vision.pack", pack); set({ pack }); },
  setAi: (ai) => set({ ai }),
  openSettings: (settingsOpen) => set({ settingsOpen }),
  worldSources: null,
  dataset: DEMO_DATASET,
  importOpen: false,
  locale: "fr",
  theme: "signal",
  projection: "globe",
  basemap: "night",
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
  setBasemap: (basemap) => { write("vision.basemap", basemap); set({ basemap }); },
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
  recordDecision: async (d) => {
    if (apiEnabled()) {
      try { const r = await api<Decision>("POST", "/decisions", d); set({ ledger: [r, ...get().ledger], form: null, syncError: null }); } catch (e) { fail(e); }
      return;
    }
    const ledger = [{ ...d, id: newId("DL"), at: new Date().toISOString() }, ...get().ledger];
    write("vision.ledger", ledger);
    set({ ledger, form: null });
  },
  // Une commande est une demande envoyée au fournisseur (catalogue uniquement, aucun paiement),
  // tracée aussi dans le Decision Ledger.
  recordOrder: async (o) => {
    if (apiEnabled()) {
      try {
        const r = await api<Order>("POST", "/orders", o);
        const ledger = await api<Decision[]>("GET", "/decisions");
        set({ orders: [r, ...get().orders], ledger, form: null, syncError: null });
      } catch (e) { fail(e); }
      return;
    }
    const at = new Date().toISOString();
    const orders = [{ ...o, id: newId("CMD"), at }, ...get().orders];
    const ledger = [{ id: newId("DL"), at, entityId: o.entityId, decision: `Demande de commande à ${o.vendorName}${o.quantity ? ` (${o.quantity})` : ""}`, reason: o.note, rejected: "", owner: o.owner }, ...get().ledger];
    write("vision.orders", orders); write("vision.ledger", ledger);
    set({ orders, ledger, form: null });
  },
  recordIncident: async (i) => {
    if (apiEnabled()) {
      try { const r = await api<Incident>("POST", "/incidents", i); set({ incidents: [r, ...get().incidents], form: null, syncError: null }); } catch (e) { fail(e); }
      return;
    }
    const incidents = [{ ...i, id: newId("INC"), at: new Date().toISOString(), status: "open" as const }, ...get().incidents];
    write("vision.incidents", incidents);
    set({ incidents, form: null });
  },
  // Mode local : les données importées restent sur le poste. Mode API : elles sont enregistrées pour l'organisation.
  setDataset: async (dataset) => {
    if (apiEnabled()) {
      try {
        await api("PUT", "/dataset", { source: dataset.source, clientName: dataset.clientName, fileName: dataset.fileName, sites: dataset.sites, suppliers: dataset.suppliers, flows: dataset.flows });
      } catch (e) { fail(e); return; }
    } else if (dataset.source === "import") write("vision.dataset", dataset);
    else { try { localStorage.removeItem("vision.dataset"); } catch { /* stockage indisponible */ } }
    set({ dataset, selectedId: null, simulatingId: null, form: null, importOpen: false, syncError: null });
  },
  openImport: (importOpen) => set({ importOpen }),
}));

export async function hydrateFromStorage() {
  useVision.setState({
    locale: read<Locale>("vision.locale", "fr"),
    theme: read<ThemeMode>("vision.theme", "signal"),
    pack: read<PackId>("vision.pack", "aero"),
    basemap: read<Basemap>("vision.basemap", "night"),
  });
  try {
    const b = await initBackend();
    if (b.mode === "api") {
      const [ds, ledger, orders, incidents] = await Promise.all([
        api<Dataset | null>("GET", "/dataset"),
        api<Decision[]>("GET", "/decisions"),
        api<Order[]>("GET", "/orders"),
        api<Incident[]>("GET", "/incidents?status=open"),
      ]);
      const [policy, ai] = await Promise.all([api<Policy>("GET", "/policy"), api<{ configured: boolean; model: string | null }>("GET", "/ai/status")]);
      useVision.setState({ backend: "api", me: b.me, dataset: ds ?? DEMO_DATASET, ledger, orders, incidents, policy, aiModel: ai.configured ? ai.model : null });
      await loadWorld();
      setInterval(loadWorld, 10 * 60_000);
      return;
    }
  } catch (e) {
    useVision.setState({ backend: "local", syncError: e instanceof Error ? e.message : String(e) });
    return;
  }
  useVision.setState({
    backend: "local",
    ledger: read<Decision[]>("vision.ledger", []),
    orders: read<Order[]>("vision.orders", []),
    incidents: read<Incident[]>("vision.incidents", []),
    dataset: read<Dataset>("vision.dataset", DEMO_DATASET),
  });
}

// Photo Monde servie par l'API : remplace les événements de démonstration.
async function loadWorld() {
  try {
    const snap = await api<WorldSnapshot>("GET", "/world");
    applyWorldSnapshot(snap);
    useVision.setState((s) => ({ worldVersion: s.worldVersion + 1, worldSources: snap.sources }));
  } catch (e) {
    useVision.setState({ syncError: e instanceof Error ? e.message : String(e) });
  }
}

// Droits d'action selon les rôles Keycloak (en mode local, tout est permis).
export const can = (me: Me | null, action: "decide" | "analyze" | "admin") => {
  if (!me) return true;
  if (me.roles.includes("admin")) return true;
  return action === "decide" ? me.roles.includes("decider") : action === "analyze" ? me.roles.includes("analyst") || me.roles.includes("decider") : false;
};

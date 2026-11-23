"use client";
import { create } from "zustand";
import { DEMO_DATASET, type Dataset } from "@/data/demo";

export type Locale = "fr" | "en";
export type ThemeMode = "signal" | "mono";
export type LayerId =
  | "conflicts" | "restrictions" | "catastrophes" | "maritime"
  | "sites" | "suppliers" | "flows" | "alerts";

export type Decision = {
  id: string; entityId: string; at: string;
  decision: string; reason: string; rejected: string; owner: string;
};

type State = {
  dataset: Dataset;
  importOpen: boolean;
  locale: Locale;
  theme: ThemeMode;
  projection: "globe" | "mercator";
  layers: Record<LayerId, boolean>;
  radiusKm: number;
  selectedId: string | null;
  simulatingId: string | null;
  decisionOpen: boolean;
  ledger: Decision[];
  flyTarget: { id: string; n: number } | null;
  setLocale: (l: Locale) => void;
  setTheme: (t: ThemeMode) => void;
  setProjection: (p: "globe" | "mercator") => void;
  toggleLayer: (id: LayerId) => void;
  select: (id: string | null, fly?: boolean) => void;
  simulate: (id: string | null) => void;
  openDecision: (open: boolean) => void;
  recordDecision: (d: Omit<Decision, "id" | "at">) => void;
  setDataset: (ds: Dataset) => void;
  openImport: (open: boolean) => void;
};

// Stockage navigateur : simple confort par utilisateur, jamais une source de vérité.
// En production, le Decision Ledger vit côté NestJS / PostgreSQL.
const read = <T,>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
};
const write = (key: string, v: unknown) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* stockage indisponible */ } };

export const useVision = create<State>((set, get) => ({
  dataset: DEMO_DATASET,
  importOpen: false,
  locale: "fr",
  theme: "signal",
  projection: "globe",
  layers: {
    conflicts: true, restrictions: true, catastrophes: true, maritime: true,
    sites: true, suppliers: true, flows: true, alerts: true,
  },
  radiusKm: 50,
  selectedId: null,
  simulatingId: null,
  decisionOpen: false,
  ledger: [],
  flyTarget: null,
  setLocale: (locale) => { write("vision.locale", locale); set({ locale }); },
  setTheme: (theme) => { write("vision.theme", theme); set({ theme }); },
  setProjection: (projection) => set({ projection }),
  toggleLayer: (id) => set({ layers: { ...get().layers, [id]: !get().layers[id] } }),
  select: (selectedId, fly = false) => set({
    selectedId, simulatingId: null, decisionOpen: false,
    flyTarget: fly && selectedId ? { id: selectedId, n: (get().flyTarget?.n ?? 0) + 1 } : get().flyTarget,
  }),
  simulate: (simulatingId) => set({ simulatingId }),
  openDecision: (decisionOpen) => set({ decisionOpen }),
  recordDecision: (d) => {
    const entry: Decision = { ...d, id: `DL-${Date.now().toString(36).toUpperCase()}`, at: new Date().toISOString() };
    const ledger = [entry, ...get().ledger];
    write("vision.ledger", ledger);
    set({ ledger, decisionOpen: false });
  },
  // Les données importées restent sur le poste (stockage du navigateur), jamais envoyées sur le réseau.
  setDataset: (dataset) => {
    if (dataset.source === "import") write("vision.dataset", dataset);
    else { try { localStorage.removeItem("vision.dataset"); } catch { /* stockage indisponible */ } }
    set({ dataset, selectedId: null, simulatingId: null, decisionOpen: false, importOpen: false });
  },
  openImport: (importOpen) => set({ importOpen }),
}));

export function hydrateFromStorage() {
  useVision.setState({
    locale: read<Locale>("vision.locale", "fr"),
    theme: read<ThemeMode>("vision.theme", "signal"),
    ledger: read<Decision[]>("vision.ledger", []),
    dataset: read<Dataset>("vision.dataset", DEMO_DATASET),
  });
}

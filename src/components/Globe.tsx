"use client";
// Globe VISION — MapLibre GL JS, projection globe/mercator, fond de carte servi localement (aucune tuile externe).
import { useEffect, useRef, useState } from "react";
import type { Map as MLMap, GeoJSONSource, MapLayerMouseEvent, StyleSpecification } from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import { restrictions, straits, worldEvents, entityById, nodeById } from "@/data/demo";
import { flowPath } from "@/lib/crossing";
import { useCrossing, useDataset, useSimulation, useTx, STATUS_HEX } from "@/lib/useCrossing";
import { useVision, type LayerId } from "@/store/useVision";

export const mapHandle: { current: MLMap | null } = { current: null };
export const HOME = { center: [22, 32] as [number, number], zoom: 1.7 };

const C = {
  space: "#0A0C0F", ocean: "#0D1117", land: "#161A21", border: "#2A303A",
  signal: "#3DA5FF", muted: "#7A8290", ink: "#E4E7EB", ...STATUS_HEX,
};

// Couche d'interface → calques MapLibre
const LAYER_MAP: Record<LayerId, string[]> = {
  conflicts: ["conflicts-halo", "conflicts-dot"],
  restrictions: ["restrictions-fill", "restrictions-line"],
  catastrophes: ["catastrophes-halo", "catastrophes-dot"],
  maritime: ["straits"],
  sites: ["sites"],
  suppliers: ["suppliers"],
  flows: ["flows", "flows-sim"],
  alerts: ["alerts-ring"],
};
const INTERACTIVE = ["sites", "suppliers", "conflicts-dot", "catastrophes-dot", "straits"];

const fc = (features: FeatureCollection["features"]): FeatureCollection => ({ type: "FeatureCollection", features });
const pt = (id: string, coord: [number, number], props: Record<string, unknown> = {}) =>
  ({ type: "Feature" as const, id, properties: { id, ...props }, geometry: { type: "Point" as const, coordinates: coord } });

export function Globe() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [hover, setHover] = useState<{ x: number; y: number; id: string } | null>(null);
  const ds = useDataset();
  const crossing = useCrossing();
  const sim = useSimulation();
  const tx = useTx();
  const layers = useVision((s) => s.layers);
  const projection = useVision((s) => s.projection);
  const flyTarget = useVision((s) => s.flyTarget);
  const selectedId = useVision((s) => s.selectedId);

  // Création de la carte
  useEffect(() => {
    let disposed = false;
    let map: MLMap | null = null;
    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (disposed || !ref.current) return;
      const style: StyleSpecification = {
        version: 8,
        projection: { type: "globe" },
        sources: {
          world: { type: "geojson", data: "/data/world.geojson", attribution: "Natural Earth" },
        },
        layers: [
          { id: "ocean", type: "background", paint: { "background-color": C.ocean } },
          { id: "land", type: "fill", source: "world", paint: { "fill-color": C.land } },
          { id: "borders", type: "line", source: "world", paint: { "line-color": C.border, "line-width": 0.6 } },
        ],
      };
      map = new maplibregl.Map({
        container: ref.current, style, center: HOME.center, zoom: HOME.zoom,
        attributionControl: { compact: true }, maxPitch: 0,
      });
      mapHandle.current = map;
      map.on("load", () => { if (!disposed) setReady(true); });
    })();
    return () => { disposed = true; map?.remove(); mapHandle.current = null; };
  }, []);

  // Sources et calques métier (une fois la carte prête)
  useEffect(() => {
    const map = mapHandle.current;
    if (!ready || !map || map.getSource("sites")) return;

    const empty = fc([]);
    for (const id of ["conflicts", "catastrophes", "straits", "sites", "suppliers", "flows", "alerts", "sim-flows"]) {
      map.addSource(id, { type: "geojson", data: empty, promoteId: "id" });
    }

    map.addLayer({ id: "restrictions-fill", type: "fill", source: "world", filter: ["in", ["get", "id"], ["literal", restrictions.map((r) => r.countryIso)]], paint: { "fill-color": C.alert, "fill-opacity": 0.16 } });
    map.addLayer({ id: "restrictions-line", type: "line", source: "world", filter: ["in", ["get", "id"], ["literal", restrictions.map((r) => r.countryIso)]], paint: { "line-color": C.alert, "line-width": 1, "line-opacity": 0.7 } });

    map.addLayer({ id: "flows", type: "line", source: "flows", layout: { "line-cap": "round" }, paint: {
      "line-color": ["match", ["get", "status"], "alert", C.alert, "caution", C.caution, C.signal],
      "line-opacity": ["match", ["get", "status"], "nominal", 0.45, 0.85],
      "line-width": 1.4,
      "line-dasharray": ["case", ["==", ["get", "mode"], "sea"], ["literal", [2, 2]], ["literal", [1, 0]]],
    } });
    map.addLayer({ id: "flows-sim", type: "line", source: "sim-flows", layout: { "line-cap": "round" }, paint: { "line-color": C.alert, "line-width": 3, "line-opacity": 0.95 } });

    for (const k of ["conflicts", "catastrophes"] as const) {
      const color = k === "conflicts" ? C.alert : C.caution;
      map.addLayer({ id: `${k}-halo`, type: "circle", source: k, paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 10, 6, 34], "circle-color": color, "circle-opacity": 0.12, "circle-stroke-color": color, "circle-stroke-width": 1, "circle-stroke-opacity": 0.5 } });
      map.addLayer({ id: `${k}-dot`, type: "circle", source: k, paint: { "circle-radius": 3, "circle-color": color } });
    }

    map.addLayer({ id: "straits", type: "circle", source: "straits", paint: {
      "circle-radius": 5, "circle-color": C.space,
      "circle-stroke-width": ["match", ["get", "status"], "closed", 2, 1.2],
      "circle-stroke-color": ["match", ["get", "status"], "closed", C.alert, C.muted],
    } });

    map.addLayer({ id: "suppliers", type: "circle", source: "suppliers", paint: {
      "circle-radius": ["match", ["get", "rank"], 1, 6, 2, 5, 4],
      "circle-color": ["match", ["get", "status"], "alert", C.alert, "caution", C.caution, C.nominal],
      "circle-stroke-color": ["case", ["boolean", ["feature-state", "selected"], false], C.ink, C.space],
      "circle-stroke-width": ["case", ["boolean", ["feature-state", "selected"], false], 2, 1.2],
    } });

    map.addLayer({ id: "sites", type: "circle", source: "sites", paint: {
      "circle-radius": ["case", ["boolean", ["get", "impacted"], false], 9, 7],
      "circle-color": C.signal,
      "circle-stroke-color": ["case", ["boolean", ["get", "impacted"], false], C.alert, ["boolean", ["feature-state", "selected"], false], C.ink, C.space],
      "circle-stroke-width": ["case", ["boolean", ["get", "impacted"], false], 3, 1.5],
    } });

    map.addLayer({ id: "alerts-ring", type: "circle", source: "alerts", paint: {
      "circle-radius": 12, "circle-color": "rgba(0,0,0,0)",
      "circle-stroke-color": ["match", ["get", "status"], "alert", C.alert, C.caution], "circle-stroke-width": 1.4,
    } });

    for (const l of INTERACTIVE) {
      map.on("mouseenter", l, () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", l, () => { map.getCanvas().style.cursor = ""; setHover(null); });
      map.on("mousemove", l, (e: MapLayerMouseEvent) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        if (id) setHover({ x: e.point.x, y: e.point.y, id });
      });
      map.on("click", l, (e: MapLayerMouseEvent) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        if (id) useVision.getState().select(id);
      });
    }
    pushData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Mise à jour des données (statuts, simulation)
  const pushData = () => {
    const map = mapHandle.current;
    if (!map || !map.getSource("sites")) return;
    const set = (id: string, data: FeatureCollection) => (map.getSource(id) as GeoJSONSource).setData(data);
    const { sites, suppliers, flows } = ds;
    const impacted = new Set(sim?.impactedSites ?? []);
    set("sites", fc(sites.map((s) => pt(s.id, s.coord, { impacted: impacted.has(s.id) }))));
    set("suppliers", fc(suppliers.map((s) => pt(s.id, s.coord, { rank: s.rank, status: crossing.status.get(s.id) ?? "nominal" }))));
    set("conflicts", fc(worldEvents.filter((e) => e.kind === "conflict").map((e) => pt(e.id, e.coord))));
    set("catastrophes", fc(worldEvents.filter((e) => e.kind === "catastrophe").map((e) => pt(e.id, e.coord))));
    set("straits", fc(straits.map((s) => pt(s.id, s.coord, { status: s.status }))));
    set("alerts", fc(crossing.alerts.map((a) => pt(a.id, nodeById(ds, a.entityId)!.coord, { status: a.status }))));
    const line = (id: string, coords: [number, number][], props: Record<string, unknown>) =>
      ({ type: "Feature" as const, id, properties: { id, ...props }, geometry: { type: "LineString" as const, coordinates: coords } });
    set("flows", fc(flows.map((f) => line(f.id, flowPath(ds, f), { mode: f.mode, status: crossing.flowStatus.get(f.id) ?? "nominal" }))));
    const simIds = new Set(sim?.impactedFlows ?? []);
    set("sim-flows", fc(flows.filter((f) => simIds.has(f.id)).map((f) => line(f.id, flowPath(ds, f), {}))));
  };
  useEffect(pushData, [ready, ds, crossing, sim]); // eslint-disable-line react-hooks/exhaustive-deps

  // Visibilité des couches
  useEffect(() => {
    const map = mapHandle.current;
    if (!ready || !map || !map.getLayer("sites")) return;
    for (const [k, ids] of Object.entries(LAYER_MAP)) {
      for (const id of ids) if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", layers[k as LayerId] ? "visible" : "none");
    }
  }, [ready, layers]);

  // Projection 2D / 3D
  useEffect(() => {
    const map = mapHandle.current;
    if (ready && map) map.setProjection({ type: projection });
  }, [ready, projection]);

  // Sélection (contour) et vol vers l'objet
  useEffect(() => {
    const map = mapHandle.current;
    if (!ready || !map) return;
    for (const src of ["sites", "suppliers"]) {
      for (const n of src === "sites" ? ds.sites : ds.suppliers) map.setFeatureState({ source: src, id: n.id }, { selected: n.id === selectedId });
    }
  }, [ready, ds, selectedId]);

  // Cadrage automatique quand un nouveau jeu de données est chargé (import ou retour à la démo).
  const lastDs = useRef(ds);
  useEffect(() => {
    const map = mapHandle.current;
    if (!ready || !map || lastDs.current === ds) return;
    lastDs.current = ds;
    const pts = [...ds.sites, ...ds.suppliers].map((n) => n.coord);
    if (pts.length === 0) return;
    const lngs = pts.map((p) => p[0]), lats = pts.map((p) => p[1]);
    map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: { top: 90, bottom: 60, left: 320, right: 400 }, maxZoom: 5, duration: 1400 });
  }, [ready, ds]);

  useEffect(() => {
    const map = mapHandle.current;
    if (!ready || !map || !flyTarget) return;
    const e = entityById(ds, flyTarget.id);
    if (e) map.flyTo({ center: e.coord, zoom: Math.max(map.getZoom(), 3.6), duration: 1600, essential: true });
  }, [ready, flyTarget]);

  const hovered = hover ? entityById(ds, hover.id) : null;
  return (
    <div className="absolute inset-0" style={{ background: C.space }}>
      <div ref={ref} style={{ position: "absolute", inset: 0 }} aria-label="Globe" />
      {hovered && hover && (
        <div className="panel pointer-events-none absolute z-10 px-2.5 py-1.5 text-[12px]" style={{ left: hover.x + 14, top: hover.y + 10 }}>
          {"name" in hovered ? hovered.name : tx(hovered.title)}
        </div>
      )}
    </div>
  );
}

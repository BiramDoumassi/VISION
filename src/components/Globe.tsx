"use client";
// Globe VISION — MapLibre GL JS, projection globe/mercator, fond de carte servi localement (aucune tuile externe).
// Fonds : imagerie satellite NASA de nuit ou de jour (tuiles générées au build par scripts/build-imagery.mjs), ou vecteur seul.
import { useEffect, useRef, useState } from "react";
import type { Map as MLMap, GeoJSONSource, MapMouseEvent, StyleSpecification, ExpressionSpecification } from "maplibre-gl";
import type { FeatureCollection, Position } from "geojson";
import {
  airspaces, countryRisk, entityById, infra, isActive, nodeById, restrictions, satellites, straits, worldEvents,
} from "@/data/demo";
import { flowPath, straitClosed } from "@/lib/crossing";
import { entityLabel, useAt, useCrossing, useDataset, useSimulation, useTx, STATUS_HEX } from "@/lib/useCrossing";
import { useVision, type Basemap, type LayerId } from "@/store/useVision";

export const mapHandle: { current: MLMap | null } = { current: null };
export const HOME = { center: [22, 32] as [number, number], zoom: 1.7 };

const C = {
  space: "#0A0C0F", ocean: "#0D1117", land: "#161A21", border: "#2A303A",
  signal: "#3DA5FF", muted: "#7A8290", ink: "#E4E7EB", ...STATUS_HEX,
};

// Couche d'interface → calques MapLibre
const LAYER_MAP: Record<LayerId, string[]> = {
  countryRisk: ["country-risk"],
  conflicts: ["conflicts-halo", "conflicts-dot"],
  restrictions: ["restrictions-fill", "restrictions-line"],
  catastrophes: ["catastrophes-halo", "catastrophes-dot"],
  maritime: ["straits"],
  air: ["airspace-fill", "airspace-line"],
  infra: ["infra"],
  space: ["satellites"],
  sites: ["sites"],
  suppliers: ["suppliers"],
  flows: ["flows", "flows-sim"],
  alerts: ["alerts-ring"],
};
// Apparence du fond selon le mode : l'aplat « land » reste présent (transparent) pour le clic pays.
const BASEMAP: Record<Basemap, { night: boolean; day: boolean; land: number; border: string }> = {
  night: { night: true, day: false, land: 0, border: "rgba(228,231,235,0.16)" },
  day: { night: false, day: true, land: 0, border: "rgba(255,255,255,0.32)" },
  vector: { night: false, day: false, land: 1, border: "#2A303A" },
};
const imagery = (name: "night" | "day") => ({
  type: "raster" as const, tileSize: 256, minzoom: 0, maxzoom: 4,
  tiles: [`${window.location.origin}/data/imagery/${name}/{z}/{x}/{y}.jpg`],
  attribution: "NASA Blue Marble · Black Marble",
});

const INTERACTIVE = ["sites", "suppliers", "conflicts-dot", "catastrophes-dot", "straits", "infra", "satellites", "airspace-fill"];
const SUB_LAYERS = ["conflicts-halo", "conflicts-dot", "catastrophes-halo", "catastrophes-dot", "infra", "satellites"];

const fc = (features: FeatureCollection["features"]): FeatureCollection => ({ type: "FeatureCollection", features });
const pt = (id: string, coord: [number, number], props: Record<string, unknown> = {}) =>
  ({ type: "Feature" as const, id, properties: { id, ...props }, geometry: { type: "Point" as const, coordinates: coord } });

// Cercle géodésique (pour les espaces aériens fermés, rayon en km)
function circle(center: [number, number], km: number, steps = 64): Position[] {
  const [lng, lat] = center.map((d) => (d * Math.PI) / 180);
  const d = km / 6371;
  const pts: Position[] = [];
  for (let i = 0; i <= steps; i++) {
    const b = (i / steps) * 2 * Math.PI;
    const la = Math.asin(Math.sin(lat) * Math.cos(d) + Math.cos(lat) * Math.sin(d) * Math.cos(b));
    const lo = lng + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(lat), Math.cos(d) - Math.sin(lat) * Math.sin(la));
    pts.push([(lo * 180) / Math.PI, (la * 180) / Math.PI]);
  }
  return pts;
}

export function Globe() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [hover, setHover] = useState<{ x: number; y: number; id: string } | null>(null);
  const ds = useDataset();
  const at = useAt();
  const crossing = useCrossing();
  const sim = useSimulation();
  const tx = useTx();
  const layers = useVision((s) => s.layers);
  const hiddenSubs = useVision((s) => s.hiddenSubs);
  const projection = useVision((s) => s.projection);
  const flyTarget = useVision((s) => s.flyTarget);
  const selectedId = useVision((s) => s.selectedId);
  const worldVersion = useVision((s) => s.worldVersion);
  const aiIds = useVision((s) => s.ai?.result?.entityIds ?? null);
  const basemap = useVision((s) => s.basemap);

  // Création de la carte
  useEffect(() => {
    let disposed = false;
    let map: MLMap | null = null;
    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (disposed || !ref.current) return;
      const b = BASEMAP[useVision.getState().basemap];
      const vis = (on: boolean) => ({ visibility: on ? ("visible" as const) : ("none" as const) });
      const style: StyleSpecification = {
        version: 8,
        projection: { type: "globe" },
        sources: {
          world: { type: "geojson", data: "/data/world.geojson", attribution: "Natural Earth" },
          "imagery-night": imagery("night"),
          "imagery-day": imagery("day"),
        },
        layers: [
          { id: "ocean", type: "background", paint: { "background-color": C.ocean } },
          { id: "imagery-night", type: "raster", source: "imagery-night", layout: vis(b.night), paint: { "raster-fade-duration": 0 } },
          { id: "imagery-day", type: "raster", source: "imagery-day", layout: vis(b.day), paint: { "raster-fade-duration": 0, "raster-saturation": -0.25, "raster-brightness-max": 0.85 } },
          { id: "land", type: "fill", source: "world", paint: { "fill-color": C.land, "fill-opacity": b.land } },
          { id: "borders", type: "line", source: "world", paint: { "line-color": b.border, "line-width": 0.6 } },
        ],
      };
      map = new maplibregl.Map({ container: ref.current, style, center: HOME.center, zoom: HOME.zoom, attributionControl: { compact: true }, maxPitch: 0 });
      mapHandle.current = map;
      map.on("load", () => { if (!disposed) setReady(true); });
    })();
    return () => { disposed = true; map?.remove(); mapHandle.current = null; };
  }, []);

  // Sources et calques métier (une fois la carte prête)
  useEffect(() => {
    const map = mapHandle.current;
    if (!ready || !map || map.getSource("sites")) return;

    for (const id of ["conflicts", "catastrophes", "straits", "infra", "satellites", "airspaces", "sites", "suppliers", "flows", "alerts", "sim-flows", "ai"]) {
      map.addSource(id, { type: "geojson", data: fc([]), promoteId: "id" });
    }

    // Risque pays : aplat coloré sous tout le reste
    const riskMatch = ["match", ["get", "id"], ...countryRisk.flatMap((c) => [c.num, c.score]), -1] as unknown as ExpressionSpecification;
    map.addLayer({ id: "country-risk", type: "fill", source: "world", filter: [">=", riskMatch, 0], paint: {
      "fill-color": ["interpolate", ["linear"], riskMatch, 0, C.nominal, 50, C.caution, 85, C.alert],
      "fill-opacity": 0.22,
    } }, "borders");
    map.addLayer({ id: "restrictions-fill", type: "fill", source: "world", filter: ["in", ["get", "id"], ["literal", []]], paint: { "fill-color": C.alert, "fill-opacity": 0.16 } });
    map.addLayer({ id: "restrictions-line", type: "line", source: "world", filter: ["in", ["get", "id"], ["literal", []]], paint: { "line-color": C.alert, "line-width": 1, "line-opacity": 0.7 } });

    map.addLayer({ id: "airspace-fill", type: "fill", source: "airspaces", paint: { "fill-color": C.caution, "fill-opacity": 0.07 } });
    map.addLayer({ id: "airspace-line", type: "line", source: "airspaces", paint: { "line-color": C.caution, "line-width": 1, "line-dasharray": [3, 2], "line-opacity": 0.7 } });

    map.addLayer({ id: "flows", type: "line", source: "flows", layout: { "line-cap": "round" }, paint: {
      "line-color": ["match", ["get", "status"], "alert", C.alert, "caution", C.caution, C.signal],
      "line-opacity": ["match", ["get", "status"], "nominal", 0.45, 0.85],
      "line-width": 1.4,
      "line-dasharray": ["match", ["get", "mode"], "sea", ["literal", [2, 2]], "air", ["literal", [0.5, 2]], ["literal", [1, 0]]],
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
    map.addLayer({ id: "infra", type: "circle", source: "infra", paint: {
      "circle-radius": 4, "circle-color": ["match", ["get", "status"], "disrupted", C.caution, C.space],
      "circle-stroke-color": ["match", ["get", "status"], "disrupted", C.caution, C.muted], "circle-stroke-width": 1.5,
    } });
    map.addLayer({ id: "satellites", type: "circle", source: "satellites", paint: {
      "circle-radius": 3.5, "circle-color": C.ink, "circle-opacity": 0.9, "circle-stroke-color": C.signal, "circle-stroke-width": 1,
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

    // Objets cités par VISION AI
    map.addLayer({ id: "ai-ring", type: "circle", source: "ai", paint: {
      "circle-radius": 15, "circle-color": "rgba(0,0,0,0)", "circle-stroke-color": C.signal, "circle-stroke-width": 2, "circle-stroke-opacity": 0.9,
    } });

    // Un seul gestionnaire de clic : objet sous le curseur, sinon le pays (fiche pays).
    const hit = (e: MapMouseEvent) => map.queryRenderedFeatures(e.point, { layers: INTERACTIVE.filter((l) => map.getLayer(l) && map.getLayoutProperty(l, "visibility") !== "none") })[0];
    map.on("click", (e: MapMouseEvent) => {
      const f = hit(e);
      const id = f?.properties?.id as string | undefined;
      if (id) { useVision.getState().select(id); return; }
      const c = map.queryRenderedFeatures(e.point, { layers: ["land"] })[0];
      const num = c?.properties?.id as string | undefined;
      if (num) useVision.getState().select(`ctry-${num}`);
    });
    map.on("mousemove", (e: MapMouseEvent) => {
      const f = hit(e);
      const id = f?.properties?.id as string | undefined;
      map.getCanvas().style.cursor = id ? "pointer" : "";
      setHover(id ? { x: e.point.x, y: e.point.y, id } : null);
    });
    map.on("mouseout", () => setHover(null));
    pushData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Mise à jour des données (date de la frise, statuts, simulation)
  const pushData = () => {
    const map = mapHandle.current;
    if (!map || !map.getSource("sites")) return;
    const set = (id: string, data: FeatureCollection) => (map.getSource(id) as GeoJSONSource).setData(data);
    const { sites, suppliers, flows } = ds;
    const impacted = new Set(sim?.impactedSites ?? []);
    set("sites", fc(sites.map((s) => pt(s.id, s.coord, { impacted: impacted.has(s.id) }))));
    set("suppliers", fc(suppliers.map((s) => pt(s.id, s.coord, { rank: s.rank, status: crossing.status.get(s.id) ?? "nominal" }))));
    const ev = worldEvents.filter((e) => isActive(e, at));
    set("conflicts", fc(ev.filter((e) => e.kind === "conflict").map((e) => pt(e.id, e.coord, { sub: e.sub }))));
    set("catastrophes", fc(ev.filter((e) => e.kind === "catastrophe").map((e) => pt(e.id, e.coord, { sub: e.sub }))));
    set("straits", fc(straits.map((s) => pt(s.id, s.coord, { status: straitClosed(s, at) ? "closed" : "open" }))));
    set("infra", fc(infra.map((i) => pt(i.id, i.coord, { sub: i.sub, status: i.disruptedSince && i.disruptedSince <= at ? "disrupted" : "ok" }))));
    set("satellites", fc(satellites.map((s) => pt(s.id, s.coord, { sub: s.sub }))));
    set("airspaces", fc(airspaces.filter((a) => isActive(a, at)).map((a) => ({ type: "Feature" as const, id: a.id, properties: { id: a.id }, geometry: { type: "Polygon" as const, coordinates: [circle(a.coord, a.radiusKm)] } }))));
    const activeRs = restrictions.filter((r) => isActive(r, at)).map((r) => r.countryIso);
    for (const l of ["restrictions-fill", "restrictions-line"]) map.setFilter(l, ["in", ["get", "id"], ["literal", activeRs]]);
    set("alerts", fc(crossing.alerts.flatMap((a) => { const n = nodeById(ds, a.entityId); return n ? [pt(a.id, n.coord, { status: a.status })] : []; })));
    const line = (id: string, coords: [number, number][], props: Record<string, unknown>) =>
      ({ type: "Feature" as const, id, properties: { id, ...props }, geometry: { type: "LineString" as const, coordinates: coords } });
    set("flows", fc(flows.map((f) => line(f.id, flowPath(ds, f), { mode: f.mode, status: crossing.flowStatus.get(f.id) ?? "nominal" }))));
    const simIds = new Set(sim?.impactedFlows ?? []);
    set("sim-flows", fc(flows.filter((f) => simIds.has(f.id)).map((f) => line(f.id, flowPath(ds, f), {}))));
  };
  useEffect(pushData, [ready, ds, at, crossing, sim, worldVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  // Objets cités par VISION AI : anneau et cadrage
  useEffect(() => {
    const map = mapHandle.current;
    if (!ready || !map || !map.getSource("ai")) return;
    const nodes = (aiIds ?? []).map((id) => nodeById(ds, id)).filter((n): n is NonNullable<typeof n> => !!n);
    (map.getSource("ai") as GeoJSONSource).setData(fc(nodes.map((n) => pt(n.id, n.coord))));
    if (nodes.length === 1) map.flyTo({ center: nodes[0].coord, zoom: Math.max(map.getZoom(), 3.6), duration: 1400 });
    else if (nodes.length > 1) {
      const lngs = nodes.map((n) => n.coord[0]), lats = nodes.map((n) => n.coord[1]);
      map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: { top: 260, bottom: 120, left: 320, right: 400 }, maxZoom: 5, duration: 1400 });
    }
  }, [ready, aiIds, ds]);

  // Visibilité des couches et sous-filtres
  useEffect(() => {
    const map = mapHandle.current;
    if (!ready || !map || !map.getLayer("sites")) return;
    for (const [k, ids] of Object.entries(LAYER_MAP)) {
      for (const id of ids) if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", layers[k as LayerId] ? "visible" : "none");
    }
    for (const id of SUB_LAYERS) map.setFilter(id, ["!", ["in", ["get", "sub"], ["literal", hiddenSubs]]]);
  }, [ready, layers, hiddenSubs]);

  // Fond de carte : nuit, jour ou vecteur
  useEffect(() => {
    const map = mapHandle.current;
    if (!ready || !map) return;
    const b = BASEMAP[basemap];
    map.setLayoutProperty("imagery-night", "visibility", b.night ? "visible" : "none");
    map.setLayoutProperty("imagery-day", "visibility", b.day ? "visible" : "none");
    map.setPaintProperty("land", "fill-opacity", b.land);
    map.setPaintProperty("borders", "line-color", b.border);
  }, [ready, basemap]);

  // Projection 2D / 3D
  useEffect(() => {
    const map = mapHandle.current;
    if (ready && map) map.setProjection({ type: projection });
  }, [ready, projection]);

  // Sélection (contour)
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
    map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: { top: 90, bottom: 120, left: 320, right: 400 }, maxZoom: 5, duration: 1400 });
  }, [ready, ds]);

  // Vol vers l'objet sélectionné
  useEffect(() => {
    const map = mapHandle.current;
    if (!ready || !map || !flyTarget) return;
    const e = entityById(ds, flyTarget.id);
    if (e) map.flyTo({ center: e.coord, zoom: e.kind === "country" ? 3 : Math.max(map.getZoom(), 3.6), duration: 1600, essential: true });
  }, [ready, flyTarget]); // eslint-disable-line react-hooks/exhaustive-deps

  const hovered = hover ? entityById(ds, hover.id) : null;
  return (
    <div className="absolute inset-0" style={{ background: C.space }}>
      <div ref={ref} style={{ position: "absolute", inset: 0 }} aria-label="Globe" />
      {hovered && hover && (
        <div className="panel pointer-events-none absolute z-10 px-2.5 py-1.5 text-[12px]" style={{ left: hover.x + 14, top: hover.y + 10 }}>
          {entityLabel(hovered, tx)}
        </div>
      )}
    </div>
  );
}

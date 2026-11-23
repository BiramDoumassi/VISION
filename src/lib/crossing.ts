// Moteur de croisement « Monde » × « Vos données ».
// Quand un événement du monde touche un objet du client, l'objet change de statut et une alerte est créée.
import {
  airspaces, infra, isActive, nodeById, restrictions, straits, worldEvents,
  type Dataset, type Flow, type LngLat, type Strait, type Supplier, type Txt,
} from "@/data/demo";

const todayIso = () => new Date().toISOString().slice(0, 10);

export type Status = "nominal" | "caution" | "alert";
export type Reason = { text: Txt; source: string; since: string; eventId: string };
export type Alert = { id: string; entityId: string; status: Exclude<Status, "nominal">; reasons: Reason[]; exposureKEur: number };

const R = 6371;
const rad = (d: number) => (d * Math.PI) / 180;

export function distanceKm(a: LngLat, b: LngLat): number {
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const rank = (s: Status) => (s === "alert" ? 2 : s === "caution" ? 1 : 0);
const worst = (a: Status, b: Status): Status => (rank(a) >= rank(b) ? a : b);

const fmtDay = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const addDays = (iso: string, n: number) => new Date(new Date(`${iso}T12:00:00Z`).getTime() + n * 86_400_000).toISOString().slice(0, 10);

export function computeCrossing(ds: Dataset, radiusKm: number, at: string) {
  const { sites, suppliers, flows } = ds;
  const status = new Map<string, Status>();
  const reasons = new Map<string, Reason[]>();
  const flowStatus = new Map<string, Status>();

  const push = (id: string, s: Status, r: Reason) => {
    status.set(id, worst(status.get(id) ?? "nominal", s));
    reasons.set(id, [...(reasons.get(id) ?? []), r]);
  };

  for (const n of [...sites, ...suppliers]) {
    status.set(n.id, "nominal");
    for (const ev of worldEvents) {
      if (!isActive(ev, at)) continue;
      const d = Math.round(distanceKm(n.coord, ev.coord));
      if (d > radiusKm) continue;
      const s: Status = ev.kind === "conflict" && ev.severity === "high" ? "alert" : "caution";
      push(n.id, s, { eventId: ev.id, source: ev.source, since: ev.since, text: { fr: `${ev.title.fr} à ${d} km`, en: `${ev.title.en} ${d} km away` } });
    }
    for (const it of infra) {
      if (!it.disruptedSince || it.disruptedSince > at) continue;
      const d = Math.round(distanceKm(n.coord, it.coord));
      if (d > radiusKm) continue;
      push(n.id, "caution", { eventId: it.id, source: it.source, since: it.disruptedSince, text: { fr: `${it.name} : ${it.title.fr} à ${d} km`, en: `${it.name}: ${it.title.en} ${d} km away` } });
    }
    const iso = "countryIso" in n ? n.countryIso : undefined;
    if (iso) {
      for (const rs of restrictions.filter((r) => r.countryIso === iso)) {
        if (isActive(rs, at)) push(n.id, "alert", { eventId: rs.id, source: rs.source, since: rs.since, text: rs.title });
        else if (rs.since > at && rs.since <= addDays(at, 14)) {
          push(n.id, "caution", { eventId: rs.id, source: rs.source, since: rs.since, text: { fr: `${rs.title.fr} — à partir du ${fmtDay(rs.since)}`, en: `${rs.title.en} — from ${fmtDay(rs.since)}` } });
        }
      }
    }
  }

  for (const f of flows) {
    let s: Status = "nominal";
    for (const sid of f.via) {
      const st = straits.find((x) => x.id === sid);
      if (st && straitClosed(st, at)) {
        s = "caution";
        push(f.from, "caution", { eventId: st.id, source: st.source, since: st.closedSince!, text: { fr: `Route maritime via ${st.name} : passage suspendu`, en: `Sea route via ${st.name}: transit suspended` } });
      }
    }
    if (f.mode === "air") {
      const path = flowPath(ds, f);
      for (const a of airspaces) {
        if (!isActive(a, at)) continue;
        if (path.some((p, i) => i % 3 === 0 && distanceKm(p, a.coord) <= a.radiusKm)) {
          s = "caution";
          push(f.from, "caution", { eventId: a.id, source: a.source, since: a.since, text: { fr: `Route aérienne : ${a.name.fr.toLowerCase()}, détour nécessaire`, en: `Air route: ${a.name.en.toLowerCase()}, detour required` } });
        }
      }
    }
    flowStatus.set(f.id, worst(s, status.get(f.from) ?? "nominal"));
  }

  const alerts: Alert[] = [...status.entries()]
    .filter(([, s]) => s !== "nominal")
    .map(([entityId, s]) => ({
      id: `al-${entityId}`, entityId, status: s as Alert["status"], reasons: reasons.get(entityId) ?? [],
      exposureKEur: flows.filter((f) => f.from === entityId).reduce((a, f) => a + f.valueKEur, 0),
    }))
    .sort((a, b) => rank(b.status) - rank(a.status) || b.exposureKEur - a.exposureKEur);

  return { status, reasons, flowStatus, alerts };
}

export const straitClosed = (st: Strait, at: string) => !!st.closedSince && st.closedSince <= at && (!st.closedUntil || st.closedUntil >= at);

// ── Simulation « Et si cet objet tombe ? » ───────────────────────────────────
export type SimResult = {
  supplierId: string;
  impactedSites: string[];
  impactedFlows: string[];
  delayDays: number;
  exposedKEur: number;
  alternatives: { id: string; leadDays: number; priceIndex: number; risk: Status; sanctionsOk: boolean }[];
};

export function simulateFailure(ds: Dataset, supplierId: string, statusMap: Map<string, Status>): SimResult | null {
  const { suppliers, flows } = ds;
  const sup = suppliers.find((s) => s.id === supplierId);
  if (!sup) return null;

  // Propagation vers l'aval jusqu'aux sites du client.
  const seen = new Set<string>();
  const impactedFlows: string[] = [];
  const queue = [sup.id];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const f of flows.filter((x) => x.from === cur)) {
      impactedFlows.push(f.id);
      if (!seen.has(f.to)) { seen.add(f.to); queue.push(f.to); }
    }
  }
  const impactedSites = [...seen].filter((id) => id.startsWith("site-"));
  const exposedKEur = impactedFlows.reduce((a, id) => a + (flows.find((f) => f.id === id)?.valueKEur ?? 0), 0);

  const alternatives = sup.alternatives
    .map((id) => nodeById(ds, id) as Supplier | undefined)
    .filter((x): x is Supplier => !!x)
    .map((a) => ({
      id: a.id, leadDays: a.leadDays, priceIndex: a.priceIndex,
      risk: statusMap.get(a.id) ?? "nominal",
      sanctionsOk: !restrictions.some((r) => r.countryIso === a.countryIso && isActive(r, todayIso())),
    }))
    .sort((a, b) => rank(a.risk) - rank(b.risk) || a.leadDays - b.leadDays);

  // Retard = délai de la meilleure alternative moins le stock de sécurité (14 j en démo), au minimum 0.
  const best = alternatives[0];
  const delayDays = best ? Math.max(0, best.leadDays - 14) : sup.leadDays;

  return { supplierId, impactedSites, impactedFlows, delayDays, exposedKEur, alternatives };
}

// ── Géométrie des flux (grands cercles, passage par les détroits) ─────────────
function greatCircle(a: LngLat, b: LngLat, steps = 48): LngLat[] {
  const [l1, p1] = [rad(a[0]), rad(a[1])];
  const [l2, p2] = [rad(b[0]), rad(b[1])];
  const d = 2 * Math.asin(Math.sqrt(Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2));
  if (d === 0) return [a, b];
  const pts: LngLat[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const A = Math.sin((1 - t) * d) / Math.sin(d);
    const B = Math.sin(t * d) / Math.sin(d);
    const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2);
    const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2);
    const z = A * Math.sin(p1) + B * Math.sin(p2);
    pts.push([(Math.atan2(y, x) * 180) / Math.PI, (Math.atan2(z, Math.sqrt(x * x + y * y)) * 180) / Math.PI]);
  }
  return pts;
}

export function flowPath(ds: Dataset, f: Flow): LngLat[] {
  const from = nodeById(ds, f.from)?.coord;
  const to = nodeById(ds, f.to)?.coord;
  if (!from || !to) return [];
  const stops: LngLat[] = [from, ...f.via.map((id) => straits.find((s) => s.id === id)?.coord).filter((c): c is LngLat => !!c), to];
  const out: LngLat[] = [];
  for (let i = 0; i < stops.length - 1; i++) out.push(...greatCircle(stops[i], stops[i + 1]).slice(i === 0 ? 0 : 1));
  return out;
}

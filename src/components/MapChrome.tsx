"use client";
// Contrôles carte (bas droite), légende (bas gauche) et pile d'alertes (haut droite).
import { useTranslations } from "next-intl";
import { dayIso, infra, nodeById, restrictions, straits, worldEvents, entityById } from "@/data/demo";
import { entityLabel, useCrossing, useDataset, useTx, STATUS_VAR } from "@/lib/useCrossing";
import { useVision } from "@/store/useVision";
import { HOME, mapHandle } from "./Globe";
import { IconClose, IconMinus, IconPlus, IconTarget } from "./icons";

export function MapControls() {
  const t = useTranslations("controls");
  const { projection, setProjection, selectedId } = useVision();
  const btn = "flex h-8 w-8 items-center justify-center text-muted hover:text-ink";
  return (
    <div className="absolute bottom-6 z-20 flex flex-col gap-2 transition-all" style={{ right: selectedId ? 424 : 12 }}>
      <div className="panel flex flex-col overflow-hidden">
        <button className={`${btn} num text-[11px] font-semibold ${projection === "globe" ? "text-signal" : ""}`} onClick={() => setProjection("globe")} aria-label={t("globe")}>{t("globe")}</button>
        <button className={`${btn} num border-t border-line text-[11px] font-semibold ${projection === "mercator" ? "text-signal" : ""}`} onClick={() => setProjection("mercator")} aria-label={t("flat")}>{t("flat")}</button>
      </div>
      <div className="panel flex flex-col overflow-hidden">
        <button className={btn} onClick={() => mapHandle.current?.zoomIn()} aria-label={t("zoomIn")}><IconPlus size={15} /></button>
        <button className={`${btn} border-t border-line`} onClick={() => mapHandle.current?.zoomOut()} aria-label={t("zoomOut")}><IconMinus size={15} /></button>
        <button className={`${btn} border-t border-line`} onClick={() => mapHandle.current?.flyTo({ ...HOME, duration: 1200 })} aria-label={t("recenter")}><IconTarget size={15} /></button>
      </div>
    </div>
  );
}

export function Legend() {
  const t = useTranslations("legend");
  const row = (color: string, label: string, ring = false) => (
    <div className="flex items-center gap-2 text-[11px] text-muted">
      <span className="h-2.5 w-2.5 rounded-full" style={ring ? { border: `2px solid ${color}` } : { background: color }} />
      {label}
    </div>
  );
  return (
    <div className="panel absolute bottom-6 left-3 z-20 w-[280px] px-3 py-2.5">
      <div className="label mb-2">{t("title")}</div>
      <div className="grid grid-cols-2 gap-1.5">
        {row(STATUS_VAR.nominal, t("nominal"))}
        {row(STATUS_VAR.caution, t("caution"))}
        {row(STATUS_VAR.alert, t("alert"))}
        {row(STATUS_VAR.alert, t("closed"), true)}
        {row(STATUS_VAR.caution, t("disrupted"), true)}
        {row("var(--vision-caution)", t("airspace"), true)}
      </div>
    </div>
  );
}

export function AlertsStack() {
  const t = useTranslations("alerts");
  const tu = useTranslations("units");
  const tx = useTx();
  const { alerts } = useCrossing();
  const ds = useDataset();
  const { select, selectedId, incidents } = useVision();
  if (selectedId) return null; // la fiche ouverte occupe la droite
  const openInc = incidents.filter((i) => i.status === "open").length;
  return (
    <div className="absolute right-3 top-[60px] z-20 flex w-[360px] flex-col gap-2">
      <BriefCard />
      <div className="label text-right">
        {t("count", { count: alerts.length })}{openInc > 0 && <> · <span className="text-caution">{t("incidents", { count: openInc })}</span></>}
      </div>
      {alerts.slice(0, 3).map((a) => {
        const n = nodeById(ds, a.entityId);
        if (!n) return null;
        return (
          <button key={a.id} onClick={() => select(a.entityId, true)} className="panel flex overflow-hidden text-left hover:border-muted">
            <span className="w-1 shrink-0" style={{ background: STATUS_VAR[a.status] }} />
            <span className="flex flex-1 flex-col gap-0.5 px-3 py-2">
              <span className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-medium text-ink">{n.name}</span>
                {a.exposureKEur > 0 && <span className="num text-[11px] text-muted">{t("exposure", { value: tu("keur", { n: a.exposureKEur }) })}</span>}
              </span>
              <span className="text-[11px] leading-snug text-muted">{tx(a.reasons[0].text)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Brief quotidien : ce qui a changé depuis hier, et ce qui arrive dans les 14 jours (5 lignes au plus).
function BriefCard() {
  const t = useTranslations("brief");
  const tx = useTx();
  const ds = useDataset();
  const { briefOpen, setBriefOpen, dayOffset, select } = useVision();
  if (!briefOpen || dayOffset !== 0) return null;
  const today = dayIso(0), yesterday = dayIso(-1), horizon = dayIso(14);
  const fresh: { id: string; since: string }[] = [
    ...worldEvents.map((e) => ({ id: e.id, since: e.since })),
    ...straits.flatMap((s) => (s.closedSince ? [{ id: s.id, since: s.closedSince }] : [])),
    ...infra.flatMap((i) => (i.disruptedSince ? [{ id: i.id, since: i.disruptedSince }] : [])),
  ].filter((x) => x.since >= yesterday && x.since <= today);
  const rsNow = restrictions.filter((r) => r.since >= yesterday && r.since <= today);
  const rsSoon = restrictions.filter((r) => r.since > today && r.since <= horizon);
  const fmt = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
  const lines: { key: string; text: string; target?: string }[] = [
    ...fresh.map((x) => { const e = entityById(ds, x.id); return { key: x.id, text: t("newEvent", { title: e ? entityLabel(e, tx) : x.id }), target: x.id }; }),
    ...rsNow.map((r) => ({ key: r.id, text: t("newEvent", { title: tx(r.title) }), target: `ctry-${r.countryIso}` })),
    ...rsSoon.map((r) => ({ key: r.id, text: t("upcoming", { date: fmt(r.since), title: tx(r.title) }), target: `ctry-${r.countryIso}` })),
  ].slice(0, 5);
  return (
    <div className="panel px-3 py-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="label">{t("title")}</span>
        <button onClick={() => setBriefOpen(false)} aria-label={t("close")} className="text-muted hover:text-ink"><IconClose size={13} /></button>
      </div>
      {lines.length === 0 ? <p className="text-[12px] text-muted">{t("none")}</p> : (
        <ul className="flex flex-col gap-1">
          {lines.map((l) => (
            <li key={l.key}>
              <button onClick={() => l.target && select(l.target, true)} className="text-left text-[12px] leading-snug text-ink hover:underline">{l.text}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

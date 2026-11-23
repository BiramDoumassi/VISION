"use client";
// Fiche d'entité standard (Prompt 51) : en-tête, pourquoi ce statut, chiffres clés, liens, historique, actions.
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { entityById, nodeById, type Site, type Supplier } from "@/data/demo";
import { useCrossing, useDataset, useSimulation, useTx, STATUS_VAR } from "@/lib/useCrossing";
import type { Status } from "@/lib/crossing";
import { useVision } from "@/store/useVision";
import { IconBox, IconBolt, IconClose, IconFactory, IconPlay, IconStamp, IconWave } from "./icons";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line px-4 py-3">
      <div className="label mb-2">{title}</div>
      {children}
    </section>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-void px-2.5 py-2">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="num mt-0.5 text-[15px] text-ink">{value}</div>
    </div>
  );
}

function StatusPill({ status, label }: { status: Status; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold" data-status={status}
      style={{ color: STATUS_VAR[status], borderColor: `color-mix(in srgb, ${STATUS_VAR[status]} 45%, transparent)` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_VAR[status] }} />{label}
    </span>
  );
}

function LinkRow({ id }: { id: string }) {
  const { status } = useCrossing();
  const select = useVision((s) => s.select);
  const ds = useDataset();
  const n = nodeById(ds, id);
  if (!n) return null;
  const s = status.get(id) ?? "nominal";
  return (
    <button onClick={() => select(id, true)} className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left hover:bg-void">
      <span className="h-2 w-2 rounded-full" style={{ background: n.kind === "site" ? "var(--vision-signal)" : STATUS_VAR[s] }} />
      <span className="flex-1 truncate text-[12px] text-ink">{n.name}</span>
      <span className="text-[11px] text-muted">{n.city}</span>
    </button>
  );
}

function Simulation() {
  const t = useTranslations("sim");
  const tu = useTranslations("units");
  const ts = useTranslations("status");
  const sim = useSimulation();
  const ds = useDataset();
  const { simulate, openDecision } = useVision();
  if (!sim) return null;
  return (
    <Section title={t("title")}>
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Tile label={t("sites")} value={String(sim.impactedSites.length)} />
        <Tile label={t("delay")} value={tu("days", { n: sim.delayDays })} />
        <Tile label={t("exposed")} value={tu("keur", { n: sim.exposedKEur })} />
      </div>
      <div className="mb-1 text-[11px] text-muted">{t("sites")}</div>
      <div className="mb-3">{sim.impactedSites.map((id) => <LinkRow key={id} id={id} />)}</div>
      <div className="mb-1 text-[11px] text-muted">{t("alternatives")}</div>
      {sim.alternatives.length === 0 ? <div className="text-[12px] text-muted">{t("noAlt")}</div> : (
        <table className="w-full text-[12px]">
          <thead><tr className="text-left text-[11px] text-muted">
            <th className="py-1 font-normal">#</th><th className="font-normal" /><th className="font-normal">{t("lead")}</th>
            <th className="font-normal">{t("price")}</th><th className="font-normal">{t("risk")}</th><th className="font-normal">{t("sanctions")}</th>
          </tr></thead>
          <tbody>
            {sim.alternatives.map((a, i) => (
              <tr key={a.id} className="border-t border-line">
                <td className="num py-1.5 text-muted">{i + 1}</td>
                <td className="pr-2 text-ink">{nodeById(ds, a.id)?.name}</td>
                <td className="num">{tu("days", { n: a.leadDays })}</td>
                <td className="num">{a.priceIndex}</td>
                <td><span style={{ color: STATUS_VAR[a.risk] }}>{ts(a.risk)}</span></td>
                <td style={{ color: a.sanctionsOk ? STATUS_VAR.nominal : STATUS_VAR.alert }}>{a.sanctionsOk ? t("ok") : t("ko")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="mt-2 text-[11px] text-muted">{t("readonly")}</p>
      <div className="mt-3 flex gap-2">
        <button onClick={() => openDecision(true)} className="flex-1 rounded border px-3 py-1.5 text-[12px] font-medium text-signal" style={{ borderColor: "color-mix(in srgb, var(--vision-signal) 40%, transparent)" }}>{t("next")}</button>
        <button onClick={() => simulate(null)} className="rounded border border-line px-3 py-1.5 text-[12px] text-muted hover:text-ink">{t("close")}</button>
      </div>
    </Section>
  );
}

function DecisionForm({ entityId, defaultRejected }: { entityId: string; defaultRejected: string }) {
  const t = useTranslations("dec");
  const { recordDecision, openDecision } = useVision();
  const [f, setF] = useState({ decision: "", reason: "", rejected: defaultRejected, owner: "" });
  const [err, setErr] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { box.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, []);
  const field = (k: keyof typeof f, label: string, multiline = false, placeholder = "") => (
    <label className="mb-2 block">
      <span className="mb-1 block text-[11px] text-muted">{label}</span>
      {multiline
        ? <textarea rows={2} value={f[k]} placeholder={placeholder} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="w-full resize-none rounded border border-line bg-void px-2 py-1.5 text-[12px] text-ink outline-none" />
        : <input value={f[k]} placeholder={placeholder} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="w-full rounded border border-line bg-void px-2 py-1.5 text-[12px] text-ink outline-none" />}
    </label>
  );
  return (
    <div ref={box}><Section title={t("title")}>
      {field("decision", t("decision"), true, t("placeholderDecision"))}
      {field("reason", t("reason"), true)}
      {field("rejected", t("rejected"))}
      {field("owner", t("owner"))}
      <p className="mb-2 text-[11px] text-muted">{t("tier")}</p>
      {err && <p className="mb-2 text-[11px]" style={{ color: STATUS_VAR.alert }}>{t("required")}</p>}
      <div className="flex gap-2">
        <button onClick={() => {
          if (!f.decision.trim() || !f.owner.trim()) { setErr(true); return; }
          recordDecision({ entityId, ...f });
        }} className="flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-[12px] font-semibold text-void" style={{ background: "var(--vision-signal)" }}>
          <IconStamp size={14} />{t("save")}
        </button>
        <button onClick={() => openDecision(false)} className="rounded border border-line px-3 py-1.5 text-[12px] text-muted hover:text-ink">{t("cancel")}</button>
      </div>
    </Section></div>
  );
}

export function EntityPanel() {
  const t = useTranslations();
  const tu = useTranslations("units");
  const tx = useTx();
  const { selectedId, select, simulatingId, simulate, decisionOpen, openDecision, ledger, locale } = useVision();
  const { status, reasons } = useCrossing();
  const ds = useDataset();
  const { suppliers, flows } = ds;
  const e = selectedId ? entityById(ds, selectedId) : undefined;
  if (!e) return null;

  const isNode = e.kind === "site" || e.kind === "supplier";
  const st: Status = isNode ? status.get(e.id) ?? "nominal"
    : e.kind === "strait" ? (e.status === "closed" ? "alert" : "nominal")
    : e.severity === "high" ? "alert" : "caution";
  const why = isNode ? reasons.get(e.id) ?? [] : [];
  const history = ledger.filter((d) => d.entityId === e.id);
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  const Icon = e.kind === "site" ? IconFactory : e.kind === "supplier" ? IconBox : e.kind === "strait" ? IconWave : IconBolt;
  const title = "name" in e ? e.name : tx(e.title);
  const subtitle = e.kind === "site" ? `${tx(e.type)} · ${e.city}`
    : e.kind === "supplier" ? `${t("entity.rank", { rank: e.rank })} · ${tx(e.product)} · ${e.city}, ${e.country}`
    : `${t(`kind.${e.kind}`)} · ${"source" in e ? e.source : ""}`;

  const sup = e.kind === "supplier" ? (e as Supplier) : null;
  const site = e.kind === "site" ? (e as Site) : null;
  const inTransit = flows.filter((f) => f.from === e.id || f.to === e.id).reduce((a, f) => a + f.ordersInTransit, 0);

  return (
    <aside className="panel absolute bottom-3 right-3 top-[60px] z-20 flex w-[400px] flex-col overflow-hidden">
      <header className="flex items-start gap-3 px-4 py-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded border border-line text-muted"><Icon size={16} /></span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-tight text-[15px] font-semibold">{title}</div>
          <div className="truncate text-[11px] text-muted">{subtitle}</div>
          <div className="mt-1.5"><StatusPill status={st} label={e.kind === "strait" ? t(`status.${e.status}`) : t(`status.${st}`)} /></div>
        </div>
        <button onClick={() => select(null)} aria-label={t("entity.close")} className="text-muted hover:text-ink"><IconClose size={16} /></button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <Section title={t("entity.why")}>
          {isNode ? (why.length === 0
            ? <p className="text-[12px] text-muted">{t("entity.whyNominal")}</p>
            : <ul className="flex flex-col gap-2">{why.map((r, i) => (
                <li key={i} className="text-[12px] leading-snug">
                  <button className="text-left text-ink hover:underline" onClick={() => entityById(ds, r.eventId) && select(r.eventId, true)}>{tx(r.text)}</button>
                  <div className="text-[11px] text-muted">{r.source} · {t("entity.since", { date: fmtDate(r.since) })}</div>
                </li>))}</ul>)
            : <p className="text-[12px] leading-snug">{tx(e.title)}<span className="block text-[11px] text-muted">{"source" in e ? e.source : ""} · {t("entity.since", { date: fmtDate(e.since) })}</span></p>}
        </Section>

        {sup && (
          <Section title={t("entity.figures")}>
            <div className="grid grid-cols-2 gap-2">
              <Tile label={t("fig.share")} value={tu("pct", { n: sup.sharePct })} />
              <Tile label={t("fig.lead")} value={tu("days", { n: sup.leadDays })} />
              <Tile label={t("fig.sole")} value={`${sup.soleSourceRefs} / ${sup.refs}`} />
              <Tile label={t("fig.inTransit")} value={String(inTransit)} />
            </div>
          </Section>
        )}
        {site && (
          <Section title={t("entity.figures")}>
            <div className="grid grid-cols-3 gap-2">
              <Tile label={t("fig.staff")} value={String(site.staff)} />
              <Tile label={t("fig.lines")} value={String(site.lines)} />
              <Tile label={t("fig.inTransit")} value={String(inTransit)} />
            </div>
          </Section>
        )}

        {isNode && (
          <Section title={t("entity.links")}>
            {sup && sup.feeds.length > 0 && (<><div className="mb-1 text-[11px] text-muted">{t("links.feeds")}</div>{sup.feeds.map((id) => <LinkRow key={id} id={id} />)}</>)}
            {(() => {
              const up = suppliers.filter((s) => s.feeds.includes(e.id)).map((s) => s.id);
              if (up.length === 0) return null;
              return (<><div className="mb-1 mt-2 text-[11px] text-muted">{site ? t("links.suppliers") : t("links.upstream")}</div>{up.map((id) => <LinkRow key={id} id={id} />)}</>);
            })()}
          </Section>
        )}

        {sup && simulatingId === sup.id && <Simulation />}
        {decisionOpen && isNode && (
          <DecisionForm entityId={e.id} defaultRejected={sup ? sup.alternatives.slice(1).map((id) => nodeById(ds, id)?.name).join(", ") : ""} />
        )}

        {isNode && (
          <Section title={t("entity.history")}>
            {history.length === 0 ? <p className="text-[12px] text-muted">{t("entity.noHistory")}</p> : history.map((d) => (
              <div key={d.id} className="mb-2 rounded border border-line bg-void px-2.5 py-2 text-[12px]">
                <div className="flex justify-between text-[11px] text-muted"><span className="num">{d.id}</span><span>{fmtDate(d.at)} · {d.owner}</span></div>
                <div className="mt-1 text-ink">{d.decision}</div>
                {d.reason && <div className="mt-0.5 text-muted">{d.reason}</div>}
              </div>
            ))}
          </Section>
        )}
      </div>

      {isNode && (
        <footer className="flex gap-2 border-t border-line px-4 py-3">
          {sup && (
            <button onClick={() => simulate(simulatingId === sup.id ? null : sup.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded border px-3 py-1.5 text-[12px] font-medium ${simulatingId === sup.id ? "text-void" : "text-ink"}`}
              style={{ borderColor: "var(--vision-line)", background: simulatingId === sup.id ? "var(--vision-signal)" : "transparent" }}>
              <IconPlay size={13} />{t("action.simulate")}
            </button>
          )}
          <button onClick={() => openDecision(!decisionOpen)} className="flex flex-1 items-center justify-center gap-1.5 rounded border border-line px-3 py-1.5 text-[12px] font-medium text-ink">
            <IconStamp size={13} />{t("action.decide")}
          </button>
        </footer>
      )}
    </aside>
  );
}

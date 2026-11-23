"use client";
// Fiche d'entité standard (Prompt 51) : en-tête, pourquoi ce statut, chiffres clés, liens, historique, actions.
// Couvre les objets du client (sites, fournisseurs), les objets Monde (événements, détroits, infrastructures,
// espaces aériens, satellites) et la variante pays.
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  dayIso, entityById, isActive, nodeById, restrictions, worldEvents,
  type Supplier,
} from "@/data/demo";
import { distanceKm, simulateFailure, straitClosed, type Status } from "@/lib/crossing";
import { entityLabel, useAt, useCrossing, useDataset, useSimulation, useTx, STATUS_HEX, STATUS_VAR } from "@/lib/useCrossing";
import { openBrief } from "@/lib/brief";
import { useVision } from "@/store/useVision";
import { IconBell, IconBox, IconBolt, IconClose, IconFactory, IconPlay, IconStamp, IconTarget, IconWave } from "./icons";

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

function LinkRow({ id, extra }: { id: string; extra?: string }) {
  const { status } = useCrossing();
  const select = useVision((s) => s.select);
  const ds = useDataset();
  const n = nodeById(ds, id);
  if (!n) return null;
  const s = status.get(id) ?? "nominal";
  return (
    <button onClick={() => select(id, true)} className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left hover:bg-void">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: n.kind === "site" ? "var(--vision-signal)" : STATUS_VAR[s] }} />
      <span className="flex-1 truncate text-[12px] text-ink">{n.name}</span>
      <span className="text-[11px] text-muted">{extra ?? n.city}</span>
    </button>
  );
}

const field = "w-full rounded border border-line bg-void px-2 py-1.5 text-[12px] text-ink outline-none";

// Fait défiler la fiche jusqu'au formulaire qui vient de s'ouvrir.
function useScrollIntoView() {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { box.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, []);
  return box;
}

// ── Simuler ───────────────────────────────────────────────────────────────────
function Simulation() {
  const t = useTranslations("sim");
  const tu = useTranslations("units");
  const ts = useTranslations("status");
  const sim = useSimulation();
  const ds = useDataset();
  const { simulate, openForm } = useVision();
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
        <button onClick={() => openForm("decide")} className="flex-1 rounded border px-3 py-1.5 text-[12px] font-medium text-signal" style={{ borderColor: "color-mix(in srgb, var(--vision-signal) 40%, transparent)" }}>{t("next")}</button>
        <button onClick={() => simulate(null)} className="rounded border border-line px-3 py-1.5 text-[12px] text-muted hover:text-ink">{t("close")}</button>
      </div>
    </Section>
  );
}

// ── Décider ───────────────────────────────────────────────────────────────────
function DecisionForm({ entityId, defaultRejected }: { entityId: string; defaultRejected: string }) {
  const t = useTranslations("dec");
  const { recordDecision, openForm } = useVision();
  const [f, setF] = useState({ decision: "", reason: "", rejected: defaultRejected, owner: "" });
  const [err, setErr] = useState(false);
  const box = useScrollIntoView();
  const input = (k: keyof typeof f, label: string, multiline = false, placeholder = "") => (
    <label className="mb-2 block">
      <span className="mb-1 block text-[11px] text-muted">{label}</span>
      {multiline
        ? <textarea rows={2} value={f[k]} placeholder={placeholder} onChange={(e) => setF({ ...f, [k]: e.target.value })} className={`${field} resize-none`} />
        : <input value={f[k]} placeholder={placeholder} onChange={(e) => setF({ ...f, [k]: e.target.value })} className={field} />}
    </label>
  );
  return (
    <div ref={box}><Section title={t("title")}>
      {input("decision", t("decision"), true, t("placeholderDecision"))}
      {input("reason", t("reason"), true)}
      {input("rejected", t("rejected"))}
      {input("owner", t("owner"))}
      <p className="mb-2 text-[11px] text-muted">{t("tier")}</p>
      {err && <p className="mb-2 text-[11px]" style={{ color: STATUS_VAR.alert }}>{t("required")}</p>}
      <div className="flex gap-2">
        <button onClick={() => { if (!f.decision.trim() || !f.owner.trim()) { setErr(true); return; } recordDecision({ entityId, ...f }); }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-[12px] font-semibold text-void" style={{ background: "var(--vision-signal)" }}>
          <IconStamp size={14} />{t("save")}
        </button>
        <button onClick={() => openForm(null)} className="rounded border border-line px-3 py-1.5 text-[12px] text-muted hover:text-ink">{t("cancel")}</button>
      </div>
    </Section></div>
  );
}

// ── Commander (catalogue uniquement : une demande, pas un paiement) ──────────
function OrderForm({ sup }: { sup: Supplier }) {
  const t = useTranslations("order");
  const tc = useTranslations("dec");
  const tu = useTranslations("units");
  const ts = useTranslations("status");
  const ds = useDataset();
  const at = useAt();
  const { status } = useCrossing();
  const { recordOrder, openForm } = useVision();
  const box = useScrollIntoView();
  const ids = [...new Set([...sup.alternatives, ...ds.suppliers.filter((s) => s.id !== sup.id && s.product.fr === sup.product.fr).map((s) => s.id)])];
  const cands = ids.map((id) => nodeById(ds, id) as Supplier | undefined).filter((x): x is Supplier => !!x && x.kind === "supplier")
    .map((c) => ({ c, blocked: restrictions.some((r) => r.countryIso === c.countryIso && isActive(r, at)), risk: status.get(c.id) ?? "nominal" }))
    .sort((a, b) => Number(a.blocked) - Number(b.blocked) || a.c.leadDays - b.c.leadDays);
  const [pick, setPick] = useState(cands.find((x) => !x.blocked)?.c.id ?? "");
  const [f, setF] = useState({ quantity: "", note: "", owner: "" });
  const [err, setErr] = useState("");
  return (
    <div ref={box}><Section title={t("title")}>
      {cands.length === 0 ? <p className="text-[12px] text-muted">{t("none")}</p> : (
        <div className="mb-3 flex flex-col gap-1.5">
          {cands.map(({ c, blocked, risk }) => (
            <label key={c.id} className={`flex cursor-pointer items-start gap-2 rounded border px-2.5 py-2 ${pick === c.id ? "border-signal" : "border-line"} ${blocked ? "cursor-not-allowed opacity-60" : ""}`}>
              <input type="radio" name="vendor" disabled={blocked} checked={pick === c.id} onChange={() => setPick(c.id)} className="mt-0.5 accent-[var(--vision-signal)]" />
              <span className="flex-1">
                <span className="block text-[12px] text-ink">{t("vendor", { name: c.name })}</span>
                <span className="num block text-[11px] text-muted">{c.city}, {c.country} · {tu("days", { n: c.leadDays })} · {c.priceIndex}</span>
              </span>
              <span className="text-right text-[11px]">
                <span className="block" style={{ color: STATUS_VAR[risk] }}>{ts(risk)}</span>
                <span className="block" style={{ color: blocked ? STATUS_VAR.alert : STATUS_VAR.nominal }}>{blocked ? t("blocked") : `${t("sanctionsCheck")} OK`}</span>
              </span>
            </label>
          ))}
        </div>
      )}
      {cands.length > 0 && (
        <>
          <label className="mb-2 block"><span className="mb-1 block text-[11px] text-muted">{t("quantity")}</span><input value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} className={field} /></label>
          <label className="mb-2 block"><span className="mb-1 block text-[11px] text-muted">{t("note")}</span><textarea rows={2} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} className={`${field} resize-none`} /></label>
          <label className="mb-2 block"><span className="mb-1 block text-[11px] text-muted">{t("owner")}</span><input value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value })} className={field} /></label>
          <p className="mb-2 text-[11px] text-muted">{t("catalog")}</p>
          {err && <p className="mb-2 text-[11px]" style={{ color: STATUS_VAR.alert }}>{err}</p>}
        </>
      )}
      <div className="flex gap-2">
        {cands.length > 0 && (
          <button onClick={() => {
            const v = cands.find((x) => x.c.id === pick);
            if (!v) { setErr(t("pick")); return; }
            if (!f.owner.trim()) { setErr(tc("required")); return; }
            recordOrder({ entityId: sup.id, vendorId: v.c.id, vendorName: v.c.name, ...f });
          }} className="flex-1 rounded px-3 py-1.5 text-[12px] font-semibold text-void" style={{ background: "var(--vision-signal)" }}>{t("send")}</button>
        )}
        <button onClick={() => openForm(null)} className="rounded border border-line px-3 py-1.5 text-[12px] text-muted hover:text-ink">{tc("cancel")}</button>
      </div>
    </Section></div>
  );
}

// ── Incident ──────────────────────────────────────────────────────────────────
function IncidentForm({ entityId, name }: { entityId: string; name: string }) {
  const t = useTranslations("incident");
  const tc = useTranslations("dec");
  const { recordIncident, openForm } = useVision();
  const box = useScrollIntoView();
  const [f, setF] = useState({ title: t("default", { name }), severity: "high" as "high" | "medium", owner: "", due: dayIso(7) });
  const [err, setErr] = useState(false);
  return (
    <div ref={box}><Section title={t("title")}>
      <label className="mb-2 block"><span className="mb-1 block text-[11px] text-muted">{t("name")}</span><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={field} /></label>
      <div className="mb-2 grid grid-cols-2 gap-2">
        <label className="block"><span className="mb-1 block text-[11px] text-muted">{t("severity")}</span>
          <select value={f.severity} onChange={(e) => setF({ ...f, severity: e.target.value as "high" | "medium" })} className={field}>
            <option value="high">{t("high")}</option><option value="medium">{t("medium")}</option>
          </select>
        </label>
        <label className="block"><span className="mb-1 block text-[11px] text-muted">{t("due")}</span><input type="date" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} className={field} /></label>
      </div>
      <label className="mb-2 block"><span className="mb-1 block text-[11px] text-muted">{t("owner")}</span><input value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value })} className={field} /></label>
      {err && <p className="mb-2 text-[11px]" style={{ color: STATUS_VAR.alert }}>{tc("required")}</p>}
      <div className="flex gap-2">
        <button onClick={() => { if (!f.title.trim() || !f.owner.trim()) { setErr(true); return; } recordIncident({ entityId, ...f }); }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-[12px] font-semibold text-void" style={{ background: "var(--vision-caution)" }}>
          <IconBell size={14} />{t("create")}
        </button>
        <button onClick={() => openForm(null)} className="rounded border border-line px-3 py-1.5 text-[12px] text-muted hover:text-ink">{tc("cancel")}</button>
      </div>
    </Section></div>
  );
}

// ── Fiche ─────────────────────────────────────────────────────────────────────
export function EntityPanel() {
  const t = useTranslations();
  const tu = useTranslations("units");
  const tx = useTx();
  const { selectedId, select, simulatingId, simulate, form, openForm, ledger, orders, incidents, locale, radiusKm } = useVision();
  const { status, reasons } = useCrossing();
  const ds = useDataset();
  const at = useAt();
  const e = selectedId ? entityById(ds, selectedId) : undefined;
  if (!e) return null;

  const fmtDate = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  const isNode = e.kind === "site" || e.kind === "supplier";
  const sup = e.kind === "supplier" ? e : null;
  const site = e.kind === "site" ? e : null;

  // Statut et libellé selon le type d'objet
  const st: Status =
    isNode ? status.get(e.id) ?? "nominal"
    : e.kind === "strait" ? (straitClosed(e, at) ? "alert" : "nominal")
    : e.kind === "infra" ? (e.disruptedSince && e.disruptedSince <= at ? "caution" : "nominal")
    : e.kind === "airspace" ? "caution"
    : e.kind === "satellite" ? "nominal"
    : e.kind === "country" ? (e.score === null ? "nominal" : e.score >= 70 ? "alert" : e.score >= 45 ? "caution" : "nominal")
    : e.severity === "high" ? "alert" : "caution";
  const stLabel =
    e.kind === "strait" ? t(`status.${straitClosed(e, at) ? "closed" : "open"}`)
    : e.kind === "infra" ? t(`status.${st === "caution" ? "disrupted" : "ok"}`)
    : t(`status.${st}`);

  const Icon = e.kind === "site" ? IconFactory : e.kind === "supplier" ? IconBox : e.kind === "strait" ? IconWave : e.kind === "country" || e.kind === "satellite" ? IconTarget : IconBolt;
  const title = entityLabel(e, tx);
  const subtitle =
    site ? `${tx(site.type)} · ${site.city}`
    : sup ? `${t("entity.rank", { rank: sup.rank })} · ${tx(sup.product)} · ${sup.city}, ${sup.country}`
    : e.kind === "country" ? t("kind.country")
    : `${t(`kind.${e.kind}`)} · ${"source" in e ? e.source : ""}`;

  // Objets du client exposés à un objet Monde (dans le rayon de croisement, ou dans l'espace aérien)
  const exposed = (() => {
    const nodes = [...ds.sites, ...ds.suppliers];
    if (e.kind === "conflict" || e.kind === "catastrophe" || e.kind === "infra") return nodes.filter((n) => distanceKm(n.coord, e.coord) <= radiusKm);
    if (e.kind === "airspace") return ds.flows.filter((f) => f.mode === "air" && reasons.get(f.from)?.some((r) => r.eventId === e.id)).map((f) => nodeById(ds, f.from)!).filter(Boolean);
    if (e.kind === "strait") return ds.flows.filter((f) => f.via.includes(e.id)).map((f) => nodeById(ds, f.from)!).filter(Boolean);
    if (e.kind === "country") return nodes.filter((n) => n.countryIso === e.num);
    return [];
  })().filter((n, i, a) => a.findIndex((x) => x.id === n.id) === i);

  const why = isNode ? reasons.get(e.id) ?? [] : [];
  const decisions = ledger.filter((d) => d.entityId === e.id);
  const myOrders = orders.filter((o) => o.entityId === e.id);
  const myIncidents = incidents.filter((i) => i.entityId === e.id && i.status === "open");
  const inTransit = ds.flows.filter((f) => f.from === e.id || f.to === e.id).reduce((a, f) => a + f.ordersInTransit, 0);

  const brief = () => {
    const sim = sup ? simulateFailure(ds, sup.id, status) : null;
    const lines = isNode ? why.map((r) => `${tx(r.text)} — ${r.source}, ${fmtDate(r.since)}`)
      : e.kind === "country" ? [`${t("entity.score")} : ${e.score ?? "—"}/100`, ...restrictions.filter((r) => r.countryIso === e.num && isActive(r, at)).map((r) => tx(r.title))]
      : [`${tx(e.title)} — ${e.source}, ${fmtDate(e.since)}`];
    openBrief({
      lang: locale, title: t("brf.title"), generated: t("brf.generated", { date: fmtDate(new Date().toISOString()) }),
      client: ds.clientName, entity: title, subtitle, status: { label: stLabel, color: STATUS_HEX[st] }, printLabel: t("brf.print"),
      footer: `VISION · ${ds.source === "demo" ? t("app.demo") : t("app.worldDemo")}`,
      sections: [
        { heading: t("brf.situation"), lines: lines.length ? lines : [t("entity.whyNominal")] },
        ...(sim ? [{ heading: t("brf.impact"), lines: [
          `${t("sim.sites")} : ${sim.impactedSites.map((id) => nodeById(ds, id)?.name).join(", ") || "—"}`,
          `${t("sim.delay")} : ${tu("days", { n: sim.delayDays })}`,
          `${t("sim.exposed")} : ${tu("keur", { n: sim.exposedKEur })}`,
        ] }] : []),
        ...(sim && sim.alternatives.length ? [{ heading: t("brf.options"), table: {
          head: ["#", t("sim.alternatives"), t("sim.lead"), t("sim.price"), t("sim.risk"), t("sim.sanctions")],
          rows: sim.alternatives.map((a, i) => [String(i + 1), nodeById(ds, a.id)?.name ?? a.id, tu("days", { n: a.leadDays }), String(a.priceIndex), t(`status.${a.risk}`), a.sanctionsOk ? t("sim.ok") : t("sim.ko")]),
        } }] : []),
        ...(exposed.length && !isNode ? [{ heading: t("entity.exposure"), lines: exposed.map((n) => `${n.name} (${n.city})`) }] : []),
        { heading: t("brf.decisions"), lines: [
          ...decisions.map((d) => `${fmtDate(d.at)} · ${d.decision} — ${d.owner}`),
          ...myIncidents.map((i) => `${fmtDate(i.at)} · ${t("action.incident")} : ${i.title} — ${i.owner}`),
        ].concat(decisions.length + myIncidents.length ? [] : [t("brf.none")]) },
      ],
    });
  };

  const btn = (label: string, icon: React.ReactNode, onClick: () => void, active = false) => (
    <button onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded border px-2 py-1.5 text-[12px] font-medium ${active ? "text-void" : "text-ink"}`}
      style={{ borderColor: "var(--vision-line)", background: active ? "var(--vision-signal)" : "transparent" }}>
      {icon}{label}
    </button>
  );

  return (
    <aside className="panel absolute bottom-3 right-3 top-[60px] z-20 flex w-[400px] flex-col overflow-hidden">
      <header className="flex items-start gap-3 px-4 py-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded border border-line text-muted"><Icon size={16} /></span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-tight text-[15px] font-semibold">{title}</div>
          <div className="truncate text-[11px] text-muted">{subtitle}</div>
          <div className="mt-1.5"><StatusPill status={st} label={stLabel} /></div>
        </div>
        <button onClick={() => select(null)} aria-label={t("entity.close")} className="text-muted hover:text-ink"><IconClose size={16} /></button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Pourquoi ce statut */}
        <Section title={t("entity.why")}>
          {isNode ? (why.length === 0
            ? <p className="text-[12px] text-muted">{t("entity.whyNominal")}</p>
            : <ul className="flex flex-col gap-2">{why.map((r, i) => (
                <li key={i} className="text-[12px] leading-snug">
                  <button className="text-left text-ink hover:underline" onClick={() => entityById(ds, r.eventId) && select(r.eventId, true)}>{tx(r.text)}</button>
                  <div className="text-[11px] text-muted">{r.source} · {t("entity.since", { date: fmtDate(r.since) })}</div>
                </li>))}</ul>)
          : e.kind === "country" ? (
            <ul className="flex flex-col gap-2 text-[12px]">
              {restrictions.filter((r) => r.countryIso === e.num && isActive(r, at)).map((r) => <li key={r.id}>{tx(r.title)}<div className="text-[11px] text-muted">{r.source} · {t("entity.since", { date: fmtDate(r.since) })}</div></li>)}
              {worldEvents.filter((w) => w.countryIso === e.num && isActive(w, at)).map((w) => <li key={w.id}><button className="text-left hover:underline" onClick={() => select(w.id, true)}>{tx(w.title)}</button><div className="text-[11px] text-muted">{w.source} · {t("entity.since", { date: fmtDate(w.since) })}</div></li>)}
              {restrictions.every((r) => r.countryIso !== e.num || !isActive(r, at)) && worldEvents.every((w) => w.countryIso !== e.num || !isActive(w, at)) && <li className="text-muted">{t("entity.whyNominal")}</li>}
            </ul>
          ) : (
            <p className="text-[12px] leading-snug">{tx(e.title)}<span className="block text-[11px] text-muted">{e.source} · {t("entity.since", { date: fmtDate(e.kind === "infra" && e.disruptedSince ? e.disruptedSince : e.kind === "strait" && e.closedSince ? e.closedSince : e.since) })}</span></p>
          )}
        </Section>

        {/* Chiffres clés */}
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
        {e.kind === "country" && (
          <Section title={t("entity.figures")}>
            <div className="grid grid-cols-3 gap-2">
              <Tile label={t("entity.score")} value={e.score === null ? "—" : `${e.score}/100`} />
              <Tile label={t("entity.restrictionsIn")} value={String(restrictions.filter((r) => r.countryIso === e.num && isActive(r, at)).length)} />
              <Tile label={t("entity.eventsIn")} value={String(worldEvents.filter((w) => w.countryIso === e.num && isActive(w, at)).length)} />
            </div>
          </Section>
        )}
        {e.kind === "satellite" && (
          <Section title={t("entity.figures")}>
            <div className="grid grid-cols-2 gap-2">
              <Tile label={t("entity.orbit")} value={e.orbit} />
              <Tile label={t("entity.revisit")} value={e.revisitH ? `${e.revisitH} h` : "—"} />
            </div>
          </Section>
        )}
        {e.kind === "airspace" && (
          <Section title={t("entity.figures")}>
            <div className="grid grid-cols-2 gap-2"><Tile label={t("entity.radius")} value={`${e.radiusKm} km`} /></div>
          </Section>
        )}

        {/* Liens */}
        {isNode && (
          <Section title={t("entity.links")}>
            {sup && sup.feeds.length > 0 && (<><div className="mb-1 text-[11px] text-muted">{t("links.feeds")}</div>{sup.feeds.map((id) => <LinkRow key={id} id={id} />)}</>)}
            {(() => {
              const up = ds.suppliers.filter((s) => s.feeds.includes(e.id)).map((s) => s.id);
              if (up.length === 0) return null;
              return (<><div className="mb-1 mt-2 text-[11px] text-muted">{site ? t("links.suppliers") : t("links.upstream")}</div>{up.map((id) => <LinkRow key={id} id={id} />)}</>);
            })()}
          </Section>
        )}
        {!isNode && e.kind !== "satellite" && (
          <Section title={t("entity.exposure")}>
            {exposed.length === 0 ? <p className="text-[12px] text-muted">{t("entity.noExposure")}</p> : exposed.map((n) => <LinkRow key={n.id} id={n.id} />)}
          </Section>
        )}

        {sup && simulatingId === sup.id && <Simulation />}
        {form === "decide" && <DecisionForm entityId={e.id} defaultRejected={sup ? sup.alternatives.slice(1).map((id) => nodeById(ds, id)?.name).join(", ") : ""} />}
        {form === "order" && sup && <OrderForm sup={sup} />}
        {form === "incident" && isNode && <IncidentForm entityId={e.id} name={title} />}

        {/* Historique */}
        {isNode && (
          <Section title={t("entity.history")}>
            {myIncidents.map((i) => (
              <div key={i.id} className="mb-2 rounded border bg-void px-2.5 py-2 text-[12px]" style={{ borderColor: `color-mix(in srgb, ${STATUS_VAR.caution} 50%, transparent)` }}>
                <div className="flex justify-between text-[11px] text-muted"><span className="num">{i.id}</span><span>{fmtDate(i.due)} · {i.owner}</span></div>
                <div className="mt-1 text-ink">{i.title}</div>
              </div>
            ))}
            {myOrders.map((o) => (
              <div key={o.id} className="mb-2 rounded border border-line bg-void px-2.5 py-2 text-[12px]">
                <div className="flex justify-between text-[11px] text-muted"><span className="num">{o.id}</span><span>{fmtDate(o.at)} · {o.owner}</span></div>
                <div className="mt-1 text-ink">{t("order.vendor", { name: o.vendorName })}{o.quantity ? ` · ${o.quantity}` : ""}</div>
              </div>
            ))}
            {decisions.length === 0 && myIncidents.length === 0 && myOrders.length === 0 && <p className="text-[12px] text-muted">{t("entity.noHistory")}</p>}
            {decisions.map((d) => (
              <div key={d.id} className="mb-2 rounded border border-line bg-void px-2.5 py-2 text-[12px]">
                <div className="flex justify-between text-[11px] text-muted"><span className="num">{d.id}</span><span>{fmtDate(d.at)} · {d.owner}</span></div>
                <div className="mt-1 text-ink">{d.decision}</div>
                {d.reason && <div className="mt-0.5 text-muted">{d.reason}</div>}
              </div>
            ))}
          </Section>
        )}
      </div>

      {/* Actions : toujours dans le même ordre, seules les pertinentes s'affichent */}
      <footer className="flex flex-col gap-2 border-t border-line px-4 py-3">
        {isNode && (
          <div className="flex gap-2">
            {sup && btn(t("action.simulate"), <IconPlay size={13} />, () => simulate(simulatingId === sup.id ? null : sup.id), simulatingId === sup.id)}
            {btn(t("action.decide"), <IconStamp size={13} />, () => openForm(form === "decide" ? null : "decide"), form === "decide")}
            {sup && btn(t("action.order"), <IconBox size={13} />, () => openForm(form === "order" ? null : "order"), form === "order")}
          </div>
        )}
        <div className="flex gap-2">
          {isNode && btn(t("action.incident"), <IconBell size={13} />, () => openForm(form === "incident" ? null : "incident"), form === "incident")}
          {btn(t("action.brief"), <IconWave size={13} />, brief)}
        </div>
      </footer>
    </aside>
  );
}


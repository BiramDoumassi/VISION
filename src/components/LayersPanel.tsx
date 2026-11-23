"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { can, useVision, type LayerId } from "@/store/useVision";
import { DEMO_DATASET, SUBTYPES } from "@/data/demo";
import { useTx } from "@/lib/useCrossing";
import { IconChevron } from "./icons";

const WORLD: LayerId[] = ["conflicts", "restrictions", "catastrophes", "maritime", "air", "infra", "space", "countryRisk"];
const YOURS: LayerId[] = ["sites", "suppliers", "flows", "alerts"];
const SWATCH: Record<LayerId, string> = {
  conflicts: "var(--vision-alert)", restrictions: "var(--vision-alert)", catastrophes: "var(--vision-caution)", maritime: "var(--vision-text-muted)",
  air: "var(--vision-caution)", infra: "var(--vision-text-muted)", space: "var(--vision-text-primary)", countryRisk: "var(--vision-caution)",
  sites: "var(--vision-signal)", suppliers: "var(--vision-nominal)", flows: "var(--vision-signal)", alerts: "var(--vision-caution)",
};
const SUB_KEY: Partial<Record<LayerId, string>> = { conflicts: "conflicts", catastrophes: "catastrophes", infra: "infra", space: "space" };

function Toggle({ on }: { on: boolean }) {
  return (
    <span className="relative inline-block h-3.5 w-6 shrink-0 rounded-full border border-line transition-colors" style={{ background: on ? "color-mix(in srgb, var(--vision-signal) 35%, transparent)" : "transparent" }}>
      <span className="absolute top-[1px] h-2.5 w-2.5 rounded-full transition-all" style={{ left: on ? 11 : 1, background: on ? "var(--vision-signal)" : "var(--vision-text-muted)" }} />
    </span>
  );
}

export function LayersPanel() {
  const t = useTranslations("layers");
  const ti = useTranslations("import");
  const tx = useTx();
  const { layers, toggleLayer, radiusKm, dataset, openImport, setDataset, hiddenSubs, toggleSub, me } = useVision();
  const mayImport = can(me, "analyze");
  const [open, setOpen] = useState<string | null>(null);

  const row = (id: LayerId) => {
    const subs = SUB_KEY[id] ? SUBTYPES[SUB_KEY[id]!] : undefined;
    return (
      <div key={id}>
        <div className="flex items-center gap-1">
          <button onClick={() => toggleLayer(id)} className="flex flex-1 items-center gap-2.5 rounded px-1 py-1.5 text-left hover:bg-void" aria-pressed={layers[id]}>
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: SWATCH[id], opacity: layers[id] ? 1 : 0.35 }} />
            <span className={`flex-1 text-[12px] ${layers[id] ? "text-ink" : "text-muted"}`}>{t(id)}</span>
            <Toggle on={layers[id]} />
          </button>
          {subs ? (
            <button onClick={() => setOpen(open === id ? null : id)} aria-label={t("subs")} aria-expanded={open === id} className="p-1 text-muted hover:text-ink">
              <IconChevron size={12} className={`transition-transform ${open === id ? "rotate-90" : ""}`} />
            </button>
          ) : <span className="w-5" />}
        </div>
        {subs && open === id && (
          <div className="mb-1 ml-5 border-l border-line pl-2">
            {subs.map((s) => {
              const on = !hiddenSubs.includes(s.id);
              return (
                <button key={s.id} onClick={() => toggleSub(s.id)} className="flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-void" aria-pressed={on}>
                  <span className={`h-3 w-3 shrink-0 rounded-sm border ${on ? "border-signal bg-signal" : "border-line"}`} />
                  <span className={`text-[11px] ${on ? "text-ink" : "text-muted"}`}>{tx(s.label)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="panel absolute left-3 top-[60px] z-20 flex max-h-[calc(100vh-210px)] w-[280px] flex-col p-3">
      <div className="mb-3 font-tight text-[12px] font-semibold tracking-[0.14em]">{t("title").toUpperCase()}</div>
      <div className="mb-3 rounded border border-line bg-void px-2.5 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="label">{ti("source")} · {dataset.source === "demo" ? ti("demo") : ti("imported")}</div>
            <div className="truncate text-[12px] text-ink">{dataset.clientName}</div>
            <div className="num text-[11px] text-muted">{dataset.sites.length} {ti("sites").toLowerCase()} · {dataset.suppliers.length} {ti("suppliers").toLowerCase()}</div>
          </div>
          {mayImport && <button onClick={() => openImport(true)} className="shrink-0 rounded border px-2.5 py-1 text-[12px] font-medium text-signal" style={{ borderColor: "color-mix(in srgb, var(--vision-signal) 40%, transparent)" }}>{ti("import")}</button>}
        </div>
        {dataset.source === "import" && mayImport && (
          <button onClick={() => setDataset(DEMO_DATASET)} className="mt-1.5 text-[11px] text-muted hover:text-ink hover:underline">{ti("backToDemo")}</button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="label mb-1.5 px-1">{t("yours")}</div>
        <div className="mb-3">{YOURS.map(row)}</div>
        <div className="label mb-1.5 px-1">{t("world")}</div>
        <div className="mb-3">{WORLD.map(row)}</div>
      </div>
      <div className="border-t border-line px-1 pt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="label">{t("radius")}</span>
          <span className="num text-[12px]">{radiusKm} km</span>
        </div>
        <input type="range" min={10} max={300} step={10} value={radiusKm} aria-label={t("radius")}
          onChange={(e) => useVision.setState({ radiusKm: Number(e.target.value) })}
          className="w-full accent-[var(--vision-signal)]" />
      </div>
    </aside>
  );
}

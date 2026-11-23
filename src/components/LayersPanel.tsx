"use client";
import { useTranslations } from "next-intl";
import { useVision, type LayerId } from "@/store/useVision";
import { DEMO_DATASET } from "@/data/demo";

const WORLD: LayerId[] = ["conflicts", "restrictions", "catastrophes", "maritime"];
const YOURS: LayerId[] = ["sites", "suppliers", "flows", "alerts"];
const SWATCH: Record<LayerId, string> = {
  conflicts: "var(--vision-alert)", restrictions: "var(--vision-alert)", catastrophes: "var(--vision-caution)", maritime: "var(--vision-text-muted)",
  sites: "var(--vision-signal)", suppliers: "var(--vision-nominal)", flows: "var(--vision-signal)", alerts: "var(--vision-caution)",
};

function Toggle({ on }: { on: boolean }) {
  return (
    <span className="relative inline-block h-3.5 w-6 rounded-full border border-line transition-colors" style={{ background: on ? "color-mix(in srgb, var(--vision-signal) 35%, transparent)" : "transparent" }}>
      <span className="absolute top-[1px] h-2.5 w-2.5 rounded-full transition-all" style={{ left: on ? 11 : 1, background: on ? "var(--vision-signal)" : "var(--vision-text-muted)" }} />
    </span>
  );
}

export function LayersPanel() {
  const t = useTranslations("layers");
  const ti = useTranslations("import");
  const { layers, toggleLayer, radiusKm, dataset, openImport, setDataset } = useVision();

  const group = (title: string, ids: LayerId[]) => (
    <div className="mb-3">
      <div className="label mb-1.5 px-1">{title}</div>
      {ids.map((id) => (
        <button key={id} onClick={() => toggleLayer(id)} className="flex w-full items-center gap-2.5 rounded px-1 py-1.5 text-left hover:bg-void" aria-pressed={layers[id]}>
          <span className="h-2 w-2 rounded-full" style={{ background: SWATCH[id], opacity: layers[id] ? 1 : 0.35 }} />
          <span className={`flex-1 text-[12px] ${layers[id] ? "text-ink" : "text-muted"}`}>{t(id)}</span>
          <Toggle on={layers[id]} />
        </button>
      ))}
    </div>
  );

  return (
    <aside className="panel absolute left-3 top-[60px] z-20 w-[280px] p-3">
      <div className="mb-3 font-tight text-[12px] font-semibold tracking-[0.14em]">{t("title").toUpperCase()}</div>
      <div className="mb-3 rounded border border-line bg-void px-2.5 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="label">{ti("source")} · {dataset.source === "demo" ? ti("demo") : ti("imported")}</div>
            <div className="truncate text-[12px] text-ink">{dataset.clientName}</div>
            <div className="num text-[11px] text-muted">{dataset.sites.length} {ti("sites").toLowerCase()} · {dataset.suppliers.length} {ti("suppliers").toLowerCase()}</div>
          </div>
          <button onClick={() => openImport(true)} className="shrink-0 rounded border px-2.5 py-1 text-[12px] font-medium text-signal" style={{ borderColor: "color-mix(in srgb, var(--vision-signal) 40%, transparent)" }}>{ti("import")}</button>
        </div>
        {dataset.source === "import" && (
          <button onClick={() => setDataset(DEMO_DATASET)} className="mt-1.5 text-[11px] text-muted hover:text-ink hover:underline">{ti("backToDemo")}</button>
        )}
      </div>
      {group(t("yours"), YOURS)}
      {group(t("world"), WORLD)}
      <div className="border-t border-line px-1 pt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="label">{t("radius")}</span>
          <span className="num text-[12px]">{radiusKm} km</span>
        </div>
        <input type="range" min={10} max={300} step={10} value={radiusKm}
          onChange={(e) => useVision.setState({ radiusKm: Number(e.target.value) })}
          className="w-full accent-[var(--vision-signal)]" />
      </div>
    </aside>
  );
}

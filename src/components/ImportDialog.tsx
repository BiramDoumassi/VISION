"use client";
// Fenêtre d'import : dépôt du fichier → rapport (comptes, précision, points à vérifier) → affichage sur le globe.
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { importFile, type ImportResult } from "@/lib/importer";
import { STATUS_VAR } from "@/lib/useCrossing";
import { useVision } from "@/store/useVision";
import { IconBox, IconClose } from "./icons";

export function ImportDialog() {
  const t = useTranslations("import");
  const { importOpen, openImport, setDataset } = useVision();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [res, setRes] = useState<ImportResult | null>(null);
  const [client, setClient] = useState("");

  if (!importOpen) return null;

  const run = async (file?: File | null) => {
    if (!file) return;
    setBusy(true); setRes(null);
    const r = await importFile(file);
    setRes(r); setClient(r.dataset.clientName); setBusy(false);
  };
  const close = () => { openImport(false); setRes(null); setBusy(false); };

  const nodes = res ? res.dataset.sites.length + res.dataset.suppliers.length : 0;
  const tile = (label: string, value: number) => (
    <div className="rounded border border-line bg-void px-3 py-2">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="num text-[18px]">{value}</div>
    </div>
  );

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(5,6,8,0.6)" }} onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="panel w-[560px] max-w-[94vw]" role="dialog" aria-modal aria-label={t("title")}>
        <header className="flex items-center justify-between px-5 pb-2 pt-4">
          <h2 className="font-tight text-[15px] font-semibold">{t("title")}</h2>
          <button onClick={close} className="text-muted hover:text-ink" aria-label={t("cancel")}><IconClose size={16} /></button>
        </header>
        <div className="px-5 pb-5">
          {!res && (
            <>
              <p className="mb-4 text-[12px] leading-relaxed text-muted">{t("intro")}</p>
              <button
                onClick={() => input.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); run(e.dataTransfer.files?.[0]); }}
                className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-10 text-[12px] text-muted"
                style={{ borderColor: drag ? "var(--vision-signal)" : "var(--vision-line)", background: drag ? "color-mix(in srgb, var(--vision-signal) 6%, transparent)" : "transparent" }}>
                <IconBox size={22} />
                {busy ? t("reading") : t("drop")}
              </button>
              <input ref={input} type="file" accept=".xlsx,.csv" className="hidden" onChange={(e) => { run(e.target.files?.[0]); e.target.value = ""; }} />
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <a href="/modele-import-vision.xlsx" download className="text-signal hover:underline">{t("template")}</a>
                <span className="text-muted">{t("privacy")}</span>
              </div>
            </>
          )}

          {res && (
            <>
              <div className="mb-3 grid grid-cols-3 gap-2">
                {tile(t("sites"), res.dataset.sites.length)}
                {tile(t("suppliers"), res.dataset.suppliers.length)}
                {tile(t("flows"), res.dataset.flows.length)}
              </div>
              {nodes > 0 && (
                <div className="mb-3 text-[11px] text-muted">
                  {t("precision")} : <span className="num text-ink">{res.precision.exact}</span> {t("exact")} · <span className="num text-ink">{res.precision.city}</span> {t("city")} · <span className="num" style={{ color: res.precision.country ? STATUS_VAR.caution : undefined }}>{res.precision.country}</span> {t("country")}
                </div>
              )}
              <div className="label mb-1.5">{t("issues")}</div>
              <div className="mb-4 max-h-[180px] overflow-y-auto rounded border border-line bg-void px-3 py-2">
                {res.issues.length === 0 && <div className="text-[12px] text-muted">{t("noIssue")}</div>}
                {res.issues.slice(0, 40).map((i, k) => (
                  <div key={k} className="flex gap-2 py-0.5 text-[12px]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: i.level === "error" ? STATUS_VAR.alert : STATUS_VAR.caution }} />
                    <span className="flex-1 text-ink">{t(`code.${i.code}`, { value: i.value ?? "" })}</span>
                    {i.row > 0 && <span className="shrink-0 text-[11px] text-muted">{t("row", { sheet: i.sheet, row: i.row })}</span>}
                  </div>
                ))}
                {res.issues.length > 40 && <div className="pt-1 text-[11px] text-muted">{t("more", { n: res.issues.length - 40 })}</div>}
              </div>
              {nodes > 0 && (
                <label className="mb-4 block">
                  <span className="mb-1 block text-[11px] text-muted">{t("client")}</span>
                  <input value={client} onChange={(e) => setClient(e.target.value)} className="w-full rounded border border-line bg-void px-2 py-1.5 text-[12px] outline-none" />
                </label>
              )}
              <div className="flex gap-2">
                {nodes > 0 && (
                  <button onClick={() => setDataset({ ...res.dataset, clientName: client.trim() || res.dataset.clientName })}
                    className="flex-1 rounded px-3 py-2 text-[12px] font-semibold text-void" style={{ background: "var(--vision-signal)" }}>
                    {t("apply")}
                  </button>
                )}
                <button onClick={() => { setRes(null); }} className={`${nodes > 0 ? "" : "flex-1 "}rounded border border-line px-3 py-2 text-[12px] text-muted hover:text-ink`}>{t("another")}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

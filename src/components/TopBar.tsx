"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CLIENT, sites, suppliers, worldEvents, straits } from "@/data/demo";
import { useCrossing, useTx } from "@/lib/useCrossing";
import { useVision } from "@/store/useVision";
import { IconBell, IconSearch, VisionMark } from "./icons";

export function TopBar() {
  const t = useTranslations();
  const tx = useTx();
  const { alerts } = useCrossing();
  const { locale, setLocale, theme, setTheme, select } = useVision();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => { setNow(new Date()); const i = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(i); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); document.getElementById("vision-search")?.focus(); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Recherche locale sur l'Ontology de démo (nom, ville, pays, produit).
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    const pool = [
      ...sites.map((x) => ({ id: x.id, label: x.name, sub: `${x.city}, ${x.country}`, hay: `${x.name} ${x.city} ${x.country}` })),
      ...suppliers.map((x) => ({ id: x.id, label: x.name, sub: `${tx(x.product)} · ${x.country}`, hay: `${x.name} ${x.city} ${x.country} ${x.product.fr} ${x.product.en}` })),
      ...worldEvents.map((x) => ({ id: x.id, label: tx(x.title), sub: x.source, hay: `${x.title.fr} ${x.title.en}` })),
      ...straits.map((x) => ({ id: x.id, label: x.name, sub: tx(x.title), hay: x.name })),
    ];
    return pool.filter((p) => p.hay.toLowerCase().includes(s)).slice(0, 7);
  }, [q, tx]);

  const pick = (id: string) => { select(id, true); setQ(""); setOpen(false); };
  const seg = (active: boolean) => `px-2 py-0.5 text-[11px] font-semibold tracking-[0.12em] font-mono ${active ? "bg-surface text-ink" : "text-muted hover:text-ink"}`;
  const critical = alerts.filter((a) => a.status === "alert").length;

  return (
    <header className="absolute left-0 right-0 top-0 z-30 flex h-12 items-center gap-4 border-b border-line px-4" style={{ background: "color-mix(in srgb, var(--vision-void) 88%, transparent)" }}>
      <div className="flex items-center gap-2.5">
        <VisionMark />
        <span className="font-tight text-[13px] font-bold tracking-[0.2em]">VISION</span>
        <span className="label hidden lg:inline">· {CLIENT.name}</span>
      </div>

      <div className="relative mx-auto w-[560px] max-w-[46vw]">
        <div className="panel flex h-8 items-center gap-2 rounded-md px-3">
          <IconSearch size={14} className="text-muted" />
          <input
            id="vision-search" value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => { if (e.key === "Enter" && results[0]) pick(results[0].id); if (e.key === "Escape") setOpen(false); }}
            placeholder={t("search.placeholder")} spellCheck={false}
            className="h-full flex-1 bg-transparent text-[12px] text-ink outline-none placeholder:text-muted"
          />
          <span className="num rounded border border-line px-1.5 text-[11px] text-muted">⌘K</span>
        </div>
        {open && q.trim().length >= 2 && (
          <div className="panel absolute left-0 right-0 top-9 overflow-hidden py-1">
            {results.length === 0 && <div className="px-3 py-2 text-[12px] text-muted">{t("search.none")}</div>}
            {results.map((r) => (
              <button key={r.id} onMouseDown={() => pick(r.id)} className="flex w-full flex-col items-start px-3 py-1.5 text-left hover:bg-void">
                <span className="text-[12px] text-ink">{r.label}</span>
                <span className="text-[11px] text-muted">{r.sub}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="num hidden text-[11px] text-muted md:inline" suppressHydrationWarning>
          {now ? `${now.toISOString().slice(11, 19)} UTC` : ""}
        </span>
        <div className="flex overflow-hidden rounded border border-line">
          <button className={seg(locale === "fr")} onClick={() => setLocale("fr")}>FR</button>
          <button className={seg(locale === "en")} onClick={() => setLocale("en")}>EN</button>
        </div>
        <div className="flex overflow-hidden rounded border border-line">
          <button className={seg(theme === "signal")} onClick={() => setTheme("signal")}>{t("theme.signal")}</button>
          <button className={seg(theme === "mono")} onClick={() => setTheme("mono")}>{t("theme.mono")}</button>
        </div>
        <button className="relative text-muted hover:text-ink" aria-label={t("alerts.title")} onClick={() => alerts[0] && select(alerts[0].entityId, true)}>
          <IconBell size={17} />
          {alerts.length > 0 && (
            <span className="num absolute -right-2 -top-1.5 min-w-4 rounded-full px-1 text-center text-[10px] font-semibold text-void" style={{ background: critical ? "var(--vision-alert)" : "var(--vision-caution)" }}>
              {alerts.length}
            </span>
          )}
        </button>
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-[11px] font-semibold text-muted">CI</div>
      </div>
    </header>
  );
}

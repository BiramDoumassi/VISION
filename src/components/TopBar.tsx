"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { worldEvents, straits, infra, satellites } from "@/data/demo";
import { allCountries } from "@/lib/countries";
import { useAt, useCrossing, useDataset, useTx } from "@/lib/useCrossing";
import { buildContext, looksLikeQuestion, rulesAnswer, type AskResult } from "@/lib/ask";
import { api } from "@/lib/backend";
import { useVision } from "@/store/useVision";
import { IconBell, IconSearch, VisionMark } from "./icons";

export function TopBar() {
  const t = useTranslations();
  const tx = useTx();
  const crossing = useCrossing();
  const { alerts } = crossing;
  const at = useAt();
  const ds = useDataset();
  const { sites, suppliers } = ds;
  const { locale, setLocale, theme, setTheme, select, me, syncError, aiModel, setAi, openSettings } = useVision();
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
      ...infra.map((x) => ({ id: x.id, label: x.name, sub: tx(x.title), hay: x.name })),
      ...satellites.map((x) => ({ id: x.id, label: x.name, sub: tx(x.title), hay: x.name })),
      ...allCountries().map((c) => ({ id: `ctry-${c.num}`, label: tx(c.name), sub: c.a2, hay: `${c.name.fr} ${c.name.en} ${c.a2}` })),
    ];
    return pool.filter((p) => p.hay.toLowerCase().includes(s)).slice(0, 7);
  }, [q, tx, sites, suppliers]);

  const pick = (id: string) => { select(id, true); setQ(""); setOpen(false); };

  // Question à VISION AI : modèle sur site s'il est configuré côté serveur, sinon moteur de règles local.
  const askAI = async (question: string) => {
    setOpen(false);
    setAi({ question, loading: true, result: null, error: null });
    try {
      let result: AskResult;
      if (aiModel) result = await api<AskResult>("POST", "/ai/ask", { question, locale, context: buildContext(ds, crossing, at, tx) });
      else result = rulesAnswer(question, ds, crossing, locale, tx);
      setAi({ question, loading: false, result, error: null });
    } catch (e) {
      setAi({ question, loading: false, result: rulesAnswer(question, ds, crossing, locale, tx), error: e instanceof Error ? e.message : String(e) });
    }
  };
  const seg = (active: boolean) => `px-2 py-0.5 text-[11px] font-semibold tracking-[0.12em] font-mono ${active ? "bg-surface text-ink" : "text-muted hover:text-ink"}`;
  const critical = alerts.filter((a) => a.status === "alert").length;

  return (
    <header className="absolute left-0 right-0 top-0 z-30 flex h-12 items-center gap-4 border-b border-line px-4" style={{ background: "color-mix(in srgb, var(--vision-void) 88%, transparent)" }}>
      <div className="flex items-center gap-2.5">
        <VisionMark />
        <span className="font-tight text-[13px] font-bold tracking-[0.2em]">VISION</span>
        <span className="label hidden lg:inline">· {ds.clientName}</span>
      </div>

      <div className="relative mx-auto w-[560px] max-w-[46vw]">
        <div className="panel flex h-8 items-center gap-2 rounded-md px-3">
          <IconSearch size={14} className="text-muted" />
          <input
            id="vision-search" value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { if (looksLikeQuestion(q) || !results[0]) { if (q.trim().length > 1) askAI(q.trim()); } else pick(results[0].id); }
              if (e.key === "Escape") { setOpen(false); setAi(null); }
            }}
            placeholder={t("search.placeholder")} spellCheck={false}
            className="h-full flex-1 bg-transparent text-[12px] text-ink outline-none placeholder:text-muted"
          />
          <span className="num rounded border border-line px-1.5 text-[11px] text-muted">⌘K</span>
        </div>
        <AiAnswer />
        {open && q.trim().length >= 2 && !looksLikeQuestion(q) && (
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
        {syncError && <span className="max-w-[220px] truncate text-[11px]" style={{ color: "var(--vision-alert)" }} title={syncError}>⚠ {syncError}</span>}
        <button onClick={() => openSettings(true)} title={me ? `${me.name} · ${me.org} · ${me.roles.join(", ")}` : t("settings.title")}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-[11px] font-semibold text-muted">
          {(me?.name ?? "VI").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
        </button>
      </div>
    </header>
  );
}

// Réponse de VISION AI, sous la barre : texte, objets cités (cliquables), mode utilisé.
function AiAnswer() {
  const t = useTranslations("ai");
  const ds = useDataset();
  const { ai, setAi, select, aiModel } = useVision();
  if (!ai) return null;
  const nodes = (ai.result?.entityIds ?? []).map((id) => [...ds.sites, ...ds.suppliers].find((n) => n.id === id)).filter((n): n is NonNullable<typeof n> => !!n);
  return (
    <div className="panel absolute left-0 right-0 top-9 z-40 px-3 py-2.5">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="label">{ai.result?.mode === "model" ? t("model", { model: ai.result.model ?? aiModel ?? "" }) : t(ai.error && aiModel ? "rulesFallback" : "rules")}</span>
        <button onClick={() => setAi(null)} className="text-[11px] text-muted hover:text-ink">{t("close")}</button>
      </div>
      <div className="mb-1 text-[11px] text-muted">« {ai.question} »</div>
      {ai.loading ? <p className="text-[12px] text-muted">{t("thinking")}</p> : (
        <>
          <p className="text-[12px] leading-relaxed text-ink">{ai.result?.answer}</p>
          {nodes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {nodes.slice(0, 12).map((n) => (
                <button key={n.id} onClick={() => select(n.id, true)} className="rounded border border-line px-2 py-0.5 text-[11px] text-ink hover:border-signal">{n.name}</button>
              ))}
            </div>
          )}
          {ai.error && <p className="mt-1.5 text-[11px]" style={{ color: "var(--vision-caution)" }}>{t("fallback", { error: ai.error })}</p>}
          <p className="mt-2 text-[11px] text-muted">{t("advisory")}</p>
        </>
      )}
    </div>
  );
}

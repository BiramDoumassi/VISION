"use client";
// Frise temporelle : passé (−30 j) / aujourd'hui / prévision (+14 j). Les couches Monde et le croisement suivent la date choisie.
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { dayIso, restrictions, worldEvents, straits, infra, airspaces } from "@/data/demo";
import { useVision } from "@/store/useVision";
import { IconPlay } from "./icons";

const MIN = -30, MAX = 14;

export function Timeline() {
  const t = useTranslations("timeline");
  const locale = useLocale();
  const { dayOffset, setDayOffset, selectedId } = useVision();
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) return;
    if (useVision.getState().dayOffset >= 0) setDayOffset(MIN);
    timer.current = setInterval(() => {
      const d = useVision.getState().dayOffset;
      if (d >= 0) { setPlaying(false); return; }
      setDayOffset(d + 1);
    }, 220);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [playing, setDayOffset]);

  // Repères : jours où un événement commence (affichés comme graduations sur la frise)
  const marks = [...worldEvents.map((e) => e.since), ...restrictions.map((r) => r.since), ...straits.flatMap((s) => (s.closedSince ? [s.closedSince] : [])), ...infra.flatMap((i) => (i.disruptedSince ? [i.disruptedSince] : [])), ...airspaces.map((a) => a.since)];
  const offsets = [...new Set(marks.map((iso) => Math.round((new Date(`${iso}T12:00:00`).getTime() - new Date(`${dayIso(0)}T12:00:00`).getTime()) / 86_400_000)))].filter((o) => o >= MIN && o <= MAX);
  const pct = (o: number) => ((o - MIN) / (MAX - MIN)) * 100;
  const date = new Date(`${dayIso(dayOffset)}T12:00:00`).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="pointer-events-none absolute bottom-6 z-20 flex justify-center transition-all" style={{ left: 304, right: selectedId ? 476 : 64 }}>
    <div className="panel pointer-events-auto flex h-14 w-full max-w-[720px] items-center gap-3 px-3">
      <button onClick={() => setPlaying(!playing)} aria-label={playing ? t("pause") : t("play")} title={playing ? t("pause") : t("play")}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-line text-muted hover:text-ink">
        {playing ? <span className="flex gap-0.5"><span className="h-2.5 w-0.5 bg-current" /><span className="h-2.5 w-0.5 bg-current" /></span> : <IconPlay size={12} />}
      </button>
      <div className="relative flex-1">
        <div className="relative h-5">
          <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-line" />
          <div className="absolute top-1/2 h-px -translate-y-1/2" style={{ left: `${pct(0)}%`, right: 0, background: "repeating-linear-gradient(90deg, var(--vision-text-muted) 0 3px, transparent 3px 6px)" }} />
          {offsets.map((o) => <span key={o} className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-muted" style={{ left: `${pct(o)}%` }} />)}
          <span className="absolute top-0 h-5 w-px bg-ink opacity-60" style={{ left: `${pct(0)}%` }} />
          <input type="range" min={MIN} max={MAX} step={1} value={dayOffset} onChange={(e) => { setPlaying(false); setDayOffset(Number(e.target.value)); }}
            aria-label={t("now")} className="absolute inset-0 w-full cursor-pointer opacity-0" />
          <span className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-void" style={{ left: `${pct(dayOffset)}%`, background: dayOffset > 0 ? "var(--vision-caution)" : "var(--vision-signal)" }} />
        </div>
        <div className="mt-0.5 flex justify-between text-[11px] text-muted">
          <span>{t("past")}</span>
          <button onClick={() => setDayOffset(0)} className="hover:text-ink" style={{ position: "absolute", left: `${pct(0)}%`, transform: "translateX(-50%)" }}>{t("now")}</button>
          <span>{t("forecast")}</span>
        </div>
      </div>
      <div className="w-[118px] shrink-0 text-right">
        <div className="num text-[12px] text-ink">{date}</div>
        {dayOffset !== 0 && (
          <button onClick={() => setDayOffset(0)} className="text-[11px]" style={{ color: dayOffset > 0 ? "var(--vision-caution)" : "var(--vision-signal)" }}>
            {dayOffset > 0 ? t("forecastTag") : t("back")}
          </button>
        )}
      </div>
    </div>
    </div>
  );
}

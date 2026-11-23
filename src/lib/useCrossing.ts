"use client";
import { useMemo } from "react";
import { useLocale } from "next-intl";
import { computeCrossing, simulateFailure } from "./crossing";
import { useVision } from "@/store/useVision";
import type { Txt } from "@/data/demo";

export function useCrossing() {
  const radiusKm = useVision((s) => s.radiusKm);
  return useMemo(() => computeCrossing(radiusKm), [radiusKm]);
}

export function useSimulation() {
  const id = useVision((s) => s.simulatingId);
  const { status } = useCrossing();
  return useMemo(() => (id ? simulateFailure(id, status) : null), [id, status]);
}

export function useTx() {
  const locale = useLocale() as "fr" | "en";
  return (t: Txt) => t[locale];
}

export const STATUS_VAR = {
  nominal: "var(--vision-nominal)",
  caution: "var(--vision-caution)",
  alert: "var(--vision-alert)",
} as const;

export const STATUS_HEX = { nominal: "#4FAE7C", caution: "#D9A441", alert: "#E8543D" } as const;

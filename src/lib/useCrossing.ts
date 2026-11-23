"use client";
import { useMemo } from "react";
import { useLocale } from "next-intl";
import { computeCrossing, simulateFailure } from "./crossing";
import { useVision } from "@/store/useVision";
import type { Txt } from "@/data/demo";

export function useDataset() {
  return useVision((s) => s.dataset);
}

export function useCrossing() {
  const radiusKm = useVision((s) => s.radiusKm);
  const ds = useDataset();
  return useMemo(() => computeCrossing(ds, radiusKm), [ds, radiusKm]);
}

export function useSimulation() {
  const id = useVision((s) => s.simulatingId);
  const ds = useDataset();
  const { status } = useCrossing();
  return useMemo(() => (id ? simulateFailure(ds, id, status) : null), [ds, id, status]);
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

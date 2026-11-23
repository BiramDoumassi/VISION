"use client";
import { useMemo } from "react";
import { useLocale } from "next-intl";
import { computeCrossing, simulateFailure } from "./crossing";
import { useVision } from "@/store/useVision";
import { dayIso, type Txt } from "@/data/demo";

// Date affichée par la frise temporelle (décalage en jours par rapport à aujourd'hui).
export function useAt() {
  const offset = useVision((s) => s.dayOffset);
  return dayIso(offset);
}

export function useDataset() {
  return useVision((s) => s.dataset);
}

export function useCrossing() {
  const radiusKm = useVision((s) => s.radiusKm);
  const worldVersion = useVision((s) => s.worldVersion);
  const at = useAt();
  const ds = useDataset();
  // worldVersion : les données Monde ont été rechargées depuis le serveur
  return useMemo(() => computeCrossing(ds, radiusKm, at), [ds, radiusKm, at, worldVersion]); // eslint-disable-line react-hooks/exhaustive-deps
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

import type { Entity } from "@/data/demo";
// Libellé lisible de n'importe quelle entité (site, fournisseur, événement, pays…)
export function entityLabel(e: Entity, tx: (t: Txt) => string): string {
  if ("name" in e) return typeof e.name === "string" ? e.name : tx(e.name);
  return tx(e.title);
}

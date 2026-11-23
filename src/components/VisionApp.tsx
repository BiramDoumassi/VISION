"use client";
import { useTranslations } from "next-intl";
import { Globe } from "./Globe";
import { TopBar } from "./TopBar";
import { LayersPanel } from "./LayersPanel";
import { AlertsStack, Legend, MapControls } from "./MapChrome";
import { EntityPanel } from "./EntityPanel";
import { ImportDialog } from "./ImportDialog";
import { Timeline } from "./Timeline";
import { useDataset } from "@/lib/useCrossing";
import { useVision } from "@/store/useVision";

// Un seul écran : le globe en fond, tout le reste flotte par-dessus (Prompt 51).
export function VisionApp() {
  const t = useTranslations("app");
  const ds = useDataset();
  const live = useVision((s) => s.worldSources !== null);
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <Globe />
      <TopBar />
      <LayersPanel />
      <AlertsStack />
      <EntityPanel />
      <MapControls />
      <Legend />
      <Timeline />
      <ImportDialog />
      <div className="label pointer-events-none absolute bottom-1 left-1/2 z-10 -translate-x-1/2 text-[10px]">{live ? t("worldPartial") : ds.source === "demo" ? t("demo") : t("worldDemo")}</div>
    </main>
  );
}

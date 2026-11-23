"use client";
import { useTranslations } from "next-intl";
import { Globe } from "./Globe";
import { TopBar } from "./TopBar";
import { LayersPanel } from "./LayersPanel";
import { AlertsStack, Legend, MapControls } from "./MapChrome";
import { EntityPanel } from "./EntityPanel";

// Un seul écran : le globe en fond, tout le reste flotte par-dessus (Prompt 51).
export function VisionApp() {
  const t = useTranslations("app");
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <Globe />
      <TopBar />
      <LayersPanel />
      <AlertsStack />
      <EntityPanel />
      <MapControls />
      <Legend />
      <div className="label pointer-events-none absolute bottom-1.5 left-1/2 z-10 -translate-x-1/2">{t("demo")}</div>
    </main>
  );
}

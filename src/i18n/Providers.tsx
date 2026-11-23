"use client";
import { useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import fr from "./messages/fr.json";
import en from "./messages/en.json";
import { hydrateFromStorage, useVision } from "@/store/useVision";
import { loadCountries } from "@/lib/countries";

const MESSAGES = { fr, en } as const;

// Locale gérée côté client : compatible avec l'export statique (pas de middleware serveur).
export function Providers({ children }: { children: React.ReactNode }) {
  const locale = useVision((s) => s.locale);
  const theme = useVision((s) => s.theme);

  useEffect(() => { hydrateFromStorage(); loadCountries(); }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.classList.toggle("theme-mono", theme === "mono");
  }, [locale, theme]);

  return (
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="Europe/Paris">
      {children}
    </NextIntlClientProvider>
  );
}

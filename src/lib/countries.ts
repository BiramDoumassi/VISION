// Référentiel pays (noms FR/EN, centroïde) chargé une fois depuis /data/countries.json, servi localement.
import type { LngLat, Txt } from "@/data/demo";

type Raw = { a2: string; a3: string; num: string; fr: string[]; en: string[]; c: LngLat | null };
const byNum = new Map<string, { name: Txt; coord: LngLat; a2: string }>();
let loading: Promise<void> | null = null;

export function loadCountries(): Promise<void> {
  return (loading ??= fetch("/data/countries.json")
    .then((r) => r.json() as Promise<Raw[]>)
    .then((rows) => {
      for (const r of rows) if (r.c) byNum.set(r.num, { name: { fr: r.fr[0] ?? r.en[0], en: r.en[0] ?? r.fr[0] }, coord: r.c, a2: r.a2 });
    })
    .catch(() => { loading = null; }));
}

export const countryRef = (num: string) => byNum.get(num);

export const allCountries = () => [...byNum.entries()].map(([num, c]) => ({ num, ...c }));

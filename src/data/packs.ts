// Packs Ontology sectoriels — phase 1 : Défense et Aéronautique, en simple réglage.
// Un pack signale les familles de produits critiques du secteur : un fournisseur qui en relève est marqué
// « famille critique » dans sa fiche et remonte en tête des alertes à statut égal.
import type { Supplier, Txt } from "./demo";

export type PackId = "none" | "aero" | "defense";
export type Pack = { id: PackId; label: Txt; families: { id: string; label: Txt; keywords: string[] }[] };

export const PACKS: Pack[] = [
  { id: "none", label: { fr: "Aucun", en: "None" }, families: [] },
  {
    id: "aero",
    label: { fr: "Aéronautique", en: "Aerospace" },
    families: [
      { id: "composites", label: { fr: "Composites et fibres", en: "Composites and fibres" }, keywords: ["carbone", "carbon", "fibre", "fiber", "pre-impregne", "prepreg", "nid d'abeille", "honeycomb", "resine", "resin", "pan"] },
      { id: "metals", label: { fr: "Métaux aéronautiques", en: "Aerospace metals" }, keywords: ["titane", "titanium", "aluminium", "nickel", "superalliage", "superalloy", "alliage", "alloy", "forge", "fonderie", "casting"] },
      { id: "avionics", label: { fr: "Électronique et avionique", en: "Electronics and avionics" }, keywords: ["electronique", "electronic", "avionique", "avionic", "cablage", "harness", "semi-conducteur", "semiconductor", "puce", "chip"] },
      { id: "fasteners", label: { fr: "Fixations aéronautiques", en: "Aerospace fasteners" }, keywords: ["fixation", "fastener", "rivet"] },
    ],
  },
  {
    id: "defense",
    label: { fr: "Défense", en: "Defence" },
    families: [
      { id: "electronics", label: { fr: "Électronique durcie et optronique", en: "Hardened electronics and optronics" }, keywords: ["electronique", "electronic", "optronique", "optronic", "capteur", "sensor", "semi-conducteur", "semiconductor", "puce", "chip", "cablage", "harness"] },
      { id: "strategic-metals", label: { fr: "Métaux et matériaux stratégiques", en: "Strategic metals and materials" }, keywords: ["titane", "titanium", "tungstene", "tungsten", "terres rares", "rare earth", "nickel", "alliage", "alloy", "carbone", "carbon", "fibre", "composite"] },
      { id: "mechanics", label: { fr: "Mécanique de précision", en: "Precision mechanics" }, keywords: ["usinage", "machining", "forge", "fonderie", "casting", "precision"] },
    ],
  },
];

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function criticalFamily(pack: PackId, s: Supplier): Pack["families"][number] | null {
  const p = PACKS.find((x) => x.id === pack);
  if (!p) return null;
  const text = norm(`${s.product.fr} ${s.product.en}`);
  return p.families.find((f) => f.keywords.some((k) => text.includes(norm(k)))) ?? null;
}

// Note de situation d'une page, générée localement et ouverte dans une fenêtre imprimable (PDF via le navigateur).
// Aucune donnée ne quitte le poste.
export type BriefInput = {
  lang: "fr" | "en";
  title: string;
  generated: string;
  client: string;
  entity: string;
  subtitle: string;
  status: { label: string; color: string };
  sections: { heading: string; lines?: string[]; table?: { head: string[]; rows: string[][] } }[];
  printLabel: string;
  footer: string;
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function openBrief(b: BriefInput) {
  const sections = b.sections.map((s) => `
    <h2>${esc(s.heading)}</h2>
    ${s.lines?.length ? `<ul>${s.lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>` : ""}
    ${s.table ? `<table><thead><tr>${s.table.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${s.table.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>` : ""}
  `).join("");
  const html = `<!DOCTYPE html><html lang="${b.lang}"><head><meta charset="utf-8"><title>${esc(b.title)} — ${esc(b.entity)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  body { font-family: Inter, system-ui, sans-serif; color: #111418; font-size: 12px; line-height: 1.5; max-width: 760px; margin: 24px auto; padding: 0 16px; }
  header { border-bottom: 2px solid #111418; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
  .brand { font-weight: 700; letter-spacing: .2em; font-size: 13px; }
  .meta { color: #5b6370; font-size: 11px; text-align: right; }
  h1 { font-size: 20px; margin: 0 0 2px; }
  .sub { color: #5b6370; margin: 0 0 8px; }
  .pill { display: inline-block; border: 1px solid; border-radius: 99px; padding: 1px 8px; font-size: 11px; font-weight: 600; }
  h2 { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #5b6370; margin: 18px 0 6px; }
  ul { margin: 0; padding-left: 18px; } li { margin: 2px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  th, td { text-align: left; padding: 4px 6px; border-bottom: 1px solid #d9dde3; } th { color: #5b6370; font-weight: 600; }
  footer { margin-top: 22px; border-top: 1px solid #d9dde3; padding-top: 6px; color: #5b6370; font-size: 10.5px; }
  .print { position: fixed; top: 12px; right: 12px; background: #111418; color: #fff; border: 0; border-radius: 6px; padding: 8px 12px; font-size: 12px; cursor: pointer; }
  @media print { .print { display: none; } body { margin: 0; } }
</style></head><body>
<button class="print" onclick="window.print()">${esc(b.printLabel)}</button>
<header><div><div class="brand">VISION</div><div class="sub">${esc(b.client)}</div></div><div class="meta">${esc(b.title)}<br>${esc(b.generated)}</div></header>
<h1>${esc(b.entity)}</h1>
<p class="sub">${esc(b.subtitle)}</p>
<span class="pill" style="color:${b.status.color};border-color:${b.status.color}">${esc(b.status.label)}</span>
${sections}
<footer>${esc(b.footer)}</footer>
</body></html>`;
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.open(); w.document.write(html); w.document.close();
  return true;
}

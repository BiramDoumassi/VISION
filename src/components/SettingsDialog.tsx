"use client";
// Réglages : pack sectoriel (phase 1 : Aéronautique, Défense) et Policy Center en lecture (règles de décision, rôles).
import { useTranslations } from "next-intl";
import { PACKS } from "@/data/packs";
import { useTx } from "@/lib/useCrossing";
import { logout } from "@/lib/backend";
import { useVision } from "@/store/useVision";
import { IconClose } from "./icons";

export function SettingsDialog() {
  const t = useTranslations("settings");
  const tx = useTx();
  const { settingsOpen, openSettings, pack, setPack, policy, me, backend } = useVision();
  if (!settingsOpen) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(5,6,8,0.6)" }} onMouseDown={(e) => e.target === e.currentTarget && openSettings(false)}>
      <div className="panel w-[560px] max-w-[94vw]" role="dialog" aria-modal aria-label={t("title")}>
        <header className="flex items-center justify-between px-5 pb-2 pt-4">
          <h2 className="font-tight text-[15px] font-semibold">{t("title")}</h2>
          <button onClick={() => openSettings(false)} aria-label={t("close")} className="text-muted hover:text-ink"><IconClose size={16} /></button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-5 pb-5">
          {me && (
            <section className="mb-4">
              <div className="label mb-1.5">{t("account")}</div>
              <div className="flex items-center justify-between rounded border border-line bg-void px-3 py-2 text-[12px]">
                <span>{me.name} · <span className="text-muted">{me.org} · {me.roles.join(", ")}</span></span>
                {backend === "api" && <button onClick={() => logout()} className="text-[11px] text-signal hover:underline">{t("logout")}</button>}
              </div>
            </section>
          )}
          <section className="mb-4">
            <div className="label mb-1.5">{t("pack")}</div>
            <div className="mb-2 flex gap-2">
              {PACKS.map((p) => (
                <button key={p.id} onClick={() => setPack(p.id)} aria-pressed={pack === p.id}
                  className={`flex-1 rounded border px-3 py-1.5 text-[12px] ${pack === p.id ? "border-signal text-ink" : "border-line text-muted hover:text-ink"}`}>
                  {tx(p.label)}
                </button>
              ))}
            </div>
            <p className="mb-2 text-[11px] text-muted">{t("packHelp")}</p>
            <ul className="flex flex-wrap gap-1.5">
              {PACKS.find((p) => p.id === pack)?.families.map((f) => <li key={f.id} className="rounded border border-line px-2 py-0.5 text-[11px]">{tx(f.label)}</li>)}
            </ul>
          </section>
          <section>
            <div className="label mb-1.5">{t("policy")}</div>
            <p className="mb-2 text-[12px]">{t("tier", { tier: policy.tier })}</p>
            <ul className="mb-3 flex list-disc flex-col gap-1 pl-4 text-[12px]">
              {policy.rules.map((r) => <li key={r.id}>{tx(r)}</li>)}
            </ul>
            {policy.roles.length > 0 && (
              <>
                <div className="label mb-1.5">{t("roles")}</div>
                <table className="w-full text-[12px]">
                  <tbody>
                    {policy.roles.map((r) => (
                      <tr key={r.role} className="border-t border-line">
                        <td className="num py-1.5 pr-3 align-top text-muted">{r.role}</td>
                        <td className="py-1.5">{tx(r)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

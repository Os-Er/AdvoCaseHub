import { cn } from "@/lib/utils";
import type { FinansDurum, FinansTip } from "@/lib/types/database";

// ─── Durum Badge ─────────────────────────────────────────────────────────────

const DURUM_KONFIG: Record<FinansDurum, { label: string; cls: string }> = {
  BEKLIYOR:   { label: "Bekliyor",    cls: "bg-amber-100 text-amber-700 border border-amber-200" },
  KISMI:      { label: "Kısmi",       cls: "bg-orange-100 text-orange-700 border border-orange-200" },
  TAMAMLANDI: { label: "Tamamlandı",  cls: "bg-green-100 text-green-700 border border-green-200" },
  IPTAL:      { label: "İptal",       cls: "bg-slate-100 text-slate-500 border border-slate-200" },
};

export function FinansDurumBadge({ durum }: { durum: FinansDurum }) {
  const k = DURUM_KONFIG[durum] ?? { label: durum, cls: "bg-slate-100 text-slate-600 border border-slate-200" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", k.cls)}>
      {k.label}
    </span>
  );
}

// ─── Tip Badge ───────────────────────────────────────────────────────────────

const TIP_KONFIG: Record<FinansTip, { label: string; cls: string; icon: string }> = {
  MAKBUZ:   { label: "Makbuz",    cls: "bg-blue-100 text-blue-700",      icon: "📄" },
  GIDER:    { label: "Gider",     cls: "bg-red-100 text-red-700",        icon: "📤" },
  TAHSILAT: { label: "Tahsilat",  cls: "bg-emerald-100 text-emerald-700", icon: "📥" },
};

export function FinansTipBadge({ tip }: { tip: FinansTip }) {
  const k = TIP_KONFIG[tip] ?? { label: tip, cls: "bg-slate-100 text-slate-600", icon: "·" };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", k.cls)}>
      {k.icon} {k.label}
    </span>
  );
}

// ─── Satır renk yardımcısı ────────────────────────────────────────────────────

export function finansSatirSinifi(durum: FinansDurum): string {
  if (durum === "BEKLIYOR") return "bg-amber-50/40";
  if (durum === "KISMI")    return "bg-orange-50/40";
  if (durum === "IPTAL")    return "opacity-60";
  return "";
}

// ─── Select options ──────────────────────────────────────────────────────────

export const DURUM_OPTIONS: { value: FinansDurum; label: string }[] = [
  { value: "BEKLIYOR",   label: "Bekliyor" },
  { value: "KISMI",      label: "Kısmi Ödeme" },
  { value: "TAMAMLANDI", label: "Tamamlandı" },
  { value: "IPTAL",      label: "İptal" },
];

export const TIP_OPTIONS: { value: FinansTip; label: string }[] = [
  { value: "MAKBUZ",   label: "Makbuz" },
  { value: "GIDER",    label: "Gider" },
  { value: "TAHSILAT", label: "Tahsilat" },
];

// TL formatlayıcı
export function formatTL(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(n);
}

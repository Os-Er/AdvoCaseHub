import { cn } from "@/lib/utils";
import type { UzlastirmaDurum, UzlastirmaSonuc } from "@/lib/types/database";

// ─── Durum Badge ─────────────────────────────────────────────────────────────

const DURUM_KONFIG: Record<UzlastirmaDurum, { label: string; cls: string }> = {
  DEVAM:      { label: "Devam Ediyor", cls: "bg-blue-100 text-blue-700" },
  TAMAMLANDI: { label: "Tamamlandı",  cls: "bg-green-100 text-green-700" },
  IPTAL:      { label: "İptal",       cls: "bg-red-100 text-red-600" },
};

export function UzlastirmaDurumBadge({ durum }: { durum: UzlastirmaDurum }) {
  const k = DURUM_KONFIG[durum] ?? { label: durum, cls: "bg-slate-100 text-slate-600" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", k.cls)}>
      {k.label}
    </span>
  );
}

// ─── Sonuç Badge ─────────────────────────────────────────────────────────────

const SONUC_KONFIG: Record<UzlastirmaSonuc, { label: string; cls: string }> = {
  UZLASTI:    { label: "Uzlaşı Sağlandı", cls: "bg-emerald-100 text-emerald-700" },
  UZLASAMADI: { label: "Uzlaşılamadı",    cls: "bg-red-100 text-red-600" },
  DEVAM:      { label: "Görüşme Devam",   cls: "bg-amber-100 text-amber-700" },
};

export function UzlastirmaSonucBadge({ sonuc }: { sonuc: UzlastirmaSonuc | null }) {
  if (!sonuc) return <span className="text-xs text-slate-400">—</span>;
  const k = SONUC_KONFIG[sonuc] ?? { label: sonuc, cls: "bg-slate-100 text-slate-600" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", k.cls)}>
      {k.label}
    </span>
  );
}

// ─── Form Options ─────────────────────────────────────────────────────────────

export const DURUM_OPTIONS: { value: UzlastirmaDurum; label: string }[] = [
  { value: "DEVAM",      label: "Devam Ediyor" },
  { value: "TAMAMLANDI", label: "Tamamlandı" },
  { value: "IPTAL",      label: "İptal" },
];

export const SONUC_OPTIONS: { value: UzlastirmaSonuc; label: string }[] = [
  { value: "DEVAM",      label: "Görüşme Devam Ediyor" },
  { value: "UZLASTI",    label: "Uzlaşı Sağlandı" },
  { value: "UZLASAMADI", label: "Uzlaşılamadı" },
];

import { cn } from "@/lib/utils";
import type { CmkDurum, CmkSureTipi } from "@/lib/types/database";

// ─── Süre Tipi Badge ─────────────────────────────────────────────────────────

const SURE_KONFIG: Record<CmkSureTipi, { label: string; cls: string }> = {
  SORUSTURMA: { label: "Soruşturma", cls: "bg-blue-100 text-blue-700" },
  KOVUSTURMA: { label: "Kovuşturma", cls: "bg-violet-100 text-violet-700" },
};

export function CmkSureBadge({ sureTipi }: { sureTipi: CmkSureTipi | null }) {
  if (!sureTipi) return <span className="text-xs text-slate-400">—</span>;
  const k = SURE_KONFIG[sureTipi];
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", k.cls)}>
      {k.label}
    </span>
  );
}

// ─── Süreç Durumu Badge ──────────────────────────────────────────────────────

const DURUM_KONFIG: Record<CmkDurum, { label: string; cls: string }> = {
  DEVAM:      { label: "Devam Ediyor", cls: "bg-blue-100 text-blue-700" },
  TAMAMLANDI: { label: "Tamamlandı",  cls: "bg-green-100 text-green-700" },
  IPTAL:      { label: "İptal",       cls: "bg-red-100 text-red-600" },
};

export function CmkDurumBadge({ durum }: { durum: CmkDurum }) {
  const k = DURUM_KONFIG[durum] ?? { label: durum, cls: "bg-slate-100 text-slate-600" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", k.cls)}>
      {k.label}
    </span>
  );
}

// ─── Select options ──────────────────────────────────────────────────────────

export const DURUM_OPTIONS: { value: CmkDurum; label: string }[] = [
  { value: "DEVAM",      label: "Devam Ediyor" },
  { value: "TAMAMLANDI", label: "Tamamlandı" },
  { value: "IPTAL",      label: "İptal" },
];

export const SURE_TIPI_OPTIONS: { value: CmkSureTipi; label: string }[] = [
  { value: "SORUSTURMA", label: "Soruşturma" },
  { value: "KOVUSTURMA", label: "Kovuşturma" },
];

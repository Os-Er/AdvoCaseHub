import { cn } from "@/lib/utils";
import type { DanismanlikDurum, DanismanlikTur } from "@/lib/types/database";

// ─── Tür Badge ───────────────────────────────────────────────────────────────

const TUR_KONFIG: Record<DanismanlikTur, { label: string; cls: string }> = {
  DANISMANLIK: { label: "Danışmanlık", cls: "bg-blue-100 text-blue-700" },
  SOZLESME:    { label: "Sözleşme",    cls: "bg-violet-100 text-violet-700" },
  GENEL:       { label: "Genel",       cls: "bg-slate-100 text-slate-600" },
};

export function DanismanlikTurBadge({ tur }: { tur: DanismanlikTur | null }) {
  if (!tur) return <span className="text-xs text-slate-400">—</span>;
  const k = TUR_KONFIG[tur];
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", k.cls)}>
      {k.label}
    </span>
  );
}

// ─── Durum Badge ─────────────────────────────────────────────────────────────

const DURUM_KONFIG: Record<DanismanlikDurum, { label: string; cls: string }> = {
  AKTIF:      { label: "Aktif",       cls: "bg-green-100 text-green-700" },
  TAMAMLANDI: { label: "Tamamlandı",  cls: "bg-slate-100 text-slate-600" },
  IPTAL:      { label: "İptal",       cls: "bg-red-100 text-red-600" },
};

export function DanismanlikDurumBadge({ durum }: { durum: DanismanlikDurum }) {
  const k = DURUM_KONFIG[durum] ?? { label: durum, cls: "bg-slate-100 text-slate-600" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", k.cls)}>
      {k.label}
    </span>
  );
}

// ─── Sözleşme süre uyarısı ────────────────────────────────────────────────────

export function BitisBadge({ bitis }: { bitis: string | null }) {
  if (!bitis) return null;
  const gun = Math.ceil((new Date(bitis).getTime() - Date.now()) / 86400000);
  if (gun > 30) return null;
  if (gun < 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
        Süresi doldu
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
      {gun} gün kaldı
    </span>
  );
}

// ─── Select options ──────────────────────────────────────────────────────────

export const DURUM_OPTIONS: { value: DanismanlikDurum; label: string }[] = [
  { value: "AKTIF",      label: "Aktif" },
  { value: "TAMAMLANDI", label: "Tamamlandı" },
  { value: "IPTAL",      label: "İptal" },
];

export const TUR_OPTIONS: { value: DanismanlikTur; label: string }[] = [
  { value: "DANISMANLIK", label: "Danışmanlık" },
  { value: "SOZLESME",    label: "Sözleşme" },
  { value: "GENEL",       label: "Genel" },
];

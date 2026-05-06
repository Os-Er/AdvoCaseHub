import { cn } from "@/lib/utils";
import type { Oncelik, SureliIsKategori } from "@/lib/types/database";

// ─── Öncelik Badge ────────────────────────────────────────────────────────────

const ONCELIK_KONFIG: Record<Oncelik, { label: string; cls: string; dot: string }> = {
  KRITIK: { label: "Kritik",  cls: "bg-red-100 text-red-700 border border-red-300",       dot: "bg-red-500" },
  YUKSEK: { label: "Yüksek",  cls: "bg-orange-100 text-orange-700 border border-orange-300", dot: "bg-orange-500" },
  NORMAL: { label: "Normal",  cls: "bg-blue-50 text-blue-600 border border-blue-200",     dot: "bg-blue-400" },
  DUSUK:  { label: "Düşük",   cls: "bg-slate-100 text-slate-500 border border-slate-200", dot: "bg-slate-400" },
};

export function OncelikBadge({ oncelik }: { oncelik: Oncelik }) {
  const k = ONCELIK_KONFIG[oncelik] ?? ONCELIK_KONFIG.NORMAL;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", k.cls)}>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", k.dot)} />
      {k.label}
    </span>
  );
}

// ─── Kategori Badge ───────────────────────────────────────────────────────────

const KATEGORI_KONFIG: Record<SureliIsKategori, { label: string; cls: string }> = {
  ISTINAF:           { label: "İstinaf",            cls: "bg-violet-100 text-violet-700" },
  CEVAP_DILEKCESI:   { label: "Cevap Dilekçesi",    cls: "bg-cyan-100 text-cyan-700" },
  BILIRKISI_ITIRAZI: { label: "Bilirkişi İtirazı",  cls: "bg-teal-100 text-teal-700" },
  TEMYIZ:            { label: "Temyiz",              cls: "bg-indigo-100 text-indigo-700" },
  ITIRAZ:            { label: "İtiraz",              cls: "bg-amber-100 text-amber-700" },
  DURUSMA:           { label: "Duruşma",             cls: "bg-emerald-100 text-emerald-700" },
  DIGER:             { label: "Diğer",               cls: "bg-slate-100 text-slate-600" },
};

export function KategoriBadge({ kategori }: { kategori: SureliIsKategori }) {
  const k = KATEGORI_KONFIG[kategori] ?? { label: kategori, cls: "bg-slate-100 text-slate-600" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", k.cls)}>
      {k.label}
    </span>
  );
}

// ─── Süre (kalan gün) Badge ───────────────────────────────────────────────────

export function KalanGunBadge({ sonTarih }: { sonTarih: string }) {
  const gun = Math.ceil((new Date(sonTarih).getTime() - Date.now()) / 86400000);

  if (gun < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">
        {Math.abs(gun)} gün geçti
      </span>
    );
  }
  if (gun === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white">
        <span className="animate-shake inline-block">⚠</span>
        BUGÜN!
      </span>
    );
  }
  if (gun <= 3) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300">
        {gun} gün kaldı
      </span>
    );
  }
  if (gun <= 7) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
        {gun} gün kaldı
      </span>
    );
  }
  if (gun <= 30) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        {gun} gün kaldı
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      {gun} gün kaldı
    </span>
  );
}

// ─── Select options ──────────────────────────────────────────────────────────

export const ONCELIK_OPTIONS: { value: Oncelik; label: string }[] = [
  { value: "KRITIK", label: "Kritik" },
  { value: "YUKSEK", label: "Yüksek" },
  { value: "NORMAL", label: "Normal" },
  { value: "DUSUK",  label: "Düşük" },
];

export const KATEGORI_OPTIONS: { value: SureliIsKategori; label: string }[] = [
  { value: "ISTINAF",           label: "İstinaf" },
  { value: "CEVAP_DILEKCESI",   label: "Cevap Dilekçesi" },
  { value: "BILIRKISI_ITIRAZI", label: "Bilirkişi İtirazı" },
  { value: "TEMYIZ",            label: "Temyiz" },
  { value: "ITIRAZ",            label: "İtiraz" },
  { value: "DURUSMA",           label: "Duruşma" },
  { value: "DIGER",             label: "Diğer" },
];

// Öncelik sıralama yardımcısı (yüksek öncelik = düşük sayı)
export const ONCELIK_SIRA: Record<Oncelik, number> = {
  KRITIK: 0,
  YUKSEK: 1,
  NORMAL: 2,
  DUSUK:  3,
};

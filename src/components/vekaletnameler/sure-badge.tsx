/**
 * Vekâletnamenin bitiş tarihine göre kalan süreyi renkli badge ile gösterir.
 * Kırmızı  : ≤ 30 gün (kritik)
 * Sarı      : 31-90 gün (uyarı)
 * Yeşil     : > 90 gün (güvende)
 * Gri       : Sona ermiş / iptal
 */

interface SureBadgeProps {
  bitisTarihi: string;
  durum: string;
}

export function kalanGunHesapla(bitisTarihi: string): number {
  const bitis = new Date(bitisTarihi);
  bitis.setHours(0, 0, 0, 0);
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  return Math.ceil((bitis.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24));
}

export function SureBadge({ bitisTarihi, durum }: SureBadgeProps) {
  if (durum !== "AKTIF") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        —
      </span>
    );
  }

  const gun = kalanGunHesapla(bitisTarihi);

  if (gun < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Süresi doldu
      </span>
    );
  }

  if (gun <= 30) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        {gun} gün kaldı
      </span>
    );
  }

  if (gun <= 90) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {gun} gün kaldı
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      {gun} gün kaldı
    </span>
  );
}

/** Sadece sol kenar rengi için class döndürür (tablo satırı highlight'ı için) */
export function sureSinifGetir(bitisTarihi: string, durum: string): string {
  if (durum !== "AKTIF") return "";
  const gun = kalanGunHesapla(bitisTarihi);
  if (gun < 0)   return "border-l-4 border-l-slate-300";
  if (gun <= 30) return "border-l-4 border-l-red-400";
  if (gun <= 90) return "border-l-4 border-l-amber-400";
  return "border-l-4 border-l-emerald-400";
}

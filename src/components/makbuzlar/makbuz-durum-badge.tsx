import type { MakbuzDurum } from "@/lib/types/database";

const CONFIG: Record<MakbuzDurum, { label: string; className: string; dot: string }> = {
  BEKLENIYOR: {
    label: "Bekliyor",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  KISMI: {
    label: "Kısmi Ödeme",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  ODENDI: {
    label: "Ödendi",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
};

export const MAKBUZ_DURUM_OPTIONS: { value: MakbuzDurum; label: string }[] = [
  { value: "BEKLENIYOR", label: "Bekliyor" },
  { value: "KISMI",      label: "Kısmi Ödeme" },
  { value: "ODENDI",     label: "Ödendi" },
];

export function MakbuzDurumBadge({ durum }: { durum: MakbuzDurum }) {
  const cfg = CONFIG[durum] ?? CONFIG.BEKLENIYOR;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/** Tablo satırı için sol kenar rengi */
export function makbuzSatirSinifi(durum: MakbuzDurum): string {
  if (durum === "ODENDI")     return "border-l-4 border-l-emerald-400";
  if (durum === "KISMI")      return "border-l-4 border-l-blue-400";
  return "border-l-4 border-l-amber-400";
}

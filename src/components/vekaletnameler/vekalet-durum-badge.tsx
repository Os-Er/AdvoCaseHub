import type { Vekaletnamedurum } from "@/lib/types/database";

const CONFIG: Record<Vekaletnamedurum, { label: string; className: string }> = {
  AKTIF:     { label: "Aktif",      className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  SONA_ERDI: { label: "Sona Erdi",  className: "bg-slate-100 text-slate-500 border-slate-200" },
  IPTAL:     { label: "İptal",      className: "bg-red-100 text-red-600 border-red-200" },
};

export const VEKALET_DURUM_OPTIONS: { value: Vekaletnamedurum; label: string }[] = [
  { value: "AKTIF",     label: "Aktif" },
  { value: "SONA_ERDI", label: "Sona Erdi" },
  { value: "IPTAL",     label: "İptal" },
];

export function VekaletDurumBadge({ durum }: { durum: Vekaletnamedurum }) {
  const cfg = CONFIG[durum] ?? CONFIG.AKTIF;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

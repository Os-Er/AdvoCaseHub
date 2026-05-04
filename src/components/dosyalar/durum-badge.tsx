import { cn } from "@/lib/utils";
import type { DosyaDurum } from "@/lib/types/database";

const config: Record<DosyaDurum, { label: string; className: string }> = {
  ACIK:    { label: "Açık",    className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  KAPALI:  { label: "Kapalı", className: "bg-slate-100 text-slate-600 border-slate-200" },
  ITIRAZ:  { label: "İtiraz",  className: "bg-orange-100 text-orange-700 border-orange-200" },
  TEMYIZ:  { label: "Temyiz", className: "bg-blue-100 text-blue-700 border-blue-200" },
  ASKIDA:  { label: "Askıda", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  INFAZ:   { label: "İnfaz",  className: "bg-red-100 text-red-700 border-red-200" },
  ARSIV:   { label: "Arşiv",  className: "bg-purple-100 text-purple-700 border-purple-200" },
};

export function DurumBadge({ durum, size = "sm" }: { durum: DosyaDurum; size?: "xs" | "sm" }) {
  const { label, className } = config[durum];
  return (
    <span className={cn(
      "inline-flex items-center font-medium rounded-full border",
      size === "xs" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
      className
    )}>
      {label}
    </span>
  );
}

export const DURUM_OPTIONS: { value: DosyaDurum; label: string }[] = Object.entries(config).map(
  ([value, { label }]) => ({ value: value as DosyaDurum, label })
);

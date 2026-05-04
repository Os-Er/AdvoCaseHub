"use client";

import { useTransition } from "react";
import { Archive } from "lucide-react";
import { arsivleDosyalar } from "@/lib/actions/arsivle";

export function ArsivleButonu() {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const yil = (e.currentTarget.elements.namedItem("yil") as HTMLSelectElement).value;
    if (!yil) { alert("Lütfen bir yıl seçin."); return; }
    if (!confirm(`${yil} yılına ait aktif dosyaları arşivlemek istediğinize emin misiniz?`)) return;

    const fd = new FormData(e.currentTarget);
    startTransition(async () => { await arsivleDosyalar(null, fd); });
  }

  const mevcutYil = new Date().getFullYear();
  const yillar = Array.from({ length: 6 }, (_, i) => mevcutYil - i);

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Arşivlenecek Yıl</label>
        <select
          name="yil"
          className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Yıl seçin...</option>
          {yillar.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium border-2 transition-colors hover:opacity-90 disabled:opacity-50"
        style={{ borderColor: "#C9A84C", color: "#1B2A4A", backgroundColor: "#C9A84C22" }}
      >
        <Archive className="w-4 h-4" style={{ color: "#C9A84C" }} />
        {pending ? "Arşivleniyor..." : "Arşivle"}
      </button>
    </form>
  );
}

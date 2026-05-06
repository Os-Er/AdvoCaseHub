"use client";

import { useState } from "react";
import { Plus, X, UserRound } from "lucide-react";
import type { DosyaTip } from "@/lib/types/database";

// ─── Rol seçenekleri per tip ────────────────────────────────────────────────

const ROL_OPTIONS: Record<DosyaTip, string[]> = {
  HUKUK: ["Davacı", "Davalı", "Müdahil", "Üçüncü Taraf", "Karşı Taraf Vekili", "Diğer"],
  CEZA:  ["Müvekkil / Sanık", "Mağdur", "Müdahil", "Tanık", "Katılan", "Diğer"],
  ICRA:  ["Alacaklı", "Borçlu", "Üçüncü Kişi", "Müdahil", "Diğer"],
};

// ─── Tipler ─────────────────────────────────────────────────────────────────

export type TarafItem = {
  id?: string;   // mevcut kayıt düzenlemede dolu gelir
  ad: string;
  rol: string;
};

interface Props {
  tip: DosyaTip;
  initialTaraflar?: TarafItem[];
}

// ─── Component ──────────────────────────────────────────────────────────────

export function TaraflarFormu({ tip, initialTaraflar = [] }: Props) {
  const [taraflar, setTaraflar] = useState<TarafItem[]>(
    initialTaraflar.length > 0 ? initialTaraflar : []
  );

  const rolOptions = ROL_OPTIONS[tip];

  function ekle() {
    setTaraflar((prev) => [...prev, { ad: "", rol: rolOptions[0] }]);
  }

  function kaldir(idx: number) {
    setTaraflar((prev) => prev.filter((_, i) => i !== idx));
  }

  function guncelle(idx: number, field: keyof TarafItem, value: string) {
    setTaraflar((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t))
    );
  }

  const gecerliTaraflar = taraflar.filter((t) => t.ad.trim() !== "");

  return (
    <div className="space-y-3">
      {/* JSON hidden input — action tarafından parse edilir */}
      <input
        type="hidden"
        name="taraflar_json"
        value={JSON.stringify(gecerliTaraflar)}
      />

      {taraflar.length === 0 ? (
        <p className="text-sm text-slate-400 italic">Henüz taraf eklenmedi.</p>
      ) : (
        <div className="space-y-2">
          {taraflar.map((taraf, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              {/* Ad */}
              <div className="relative flex-1">
                <UserRound className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ad Soyad / Kurum"
                  value={taraf.ad}
                  onChange={(e) => guncelle(idx, "ad", e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-white pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Rol */}
              <select
                value={taraf.rol}
                onChange={(e) => guncelle(idx, "rol", e.target.value)}
                className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-w-[160px]"
              >
                <option value="">Rol seçin</option>
                {rolOptions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {/* Kaldır */}
              <button
                type="button"
                onClick={() => kaldir(idx)}
                className="h-9 w-9 flex items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors flex-shrink-0"
                title="Kaldır"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={ekle}
        className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md border border-dashed border-slate-300 text-slate-500 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Taraf Ekle
      </button>
    </div>
  );
}

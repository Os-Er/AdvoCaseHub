"use client";

import { useState, useMemo } from "react";
import { getEffectiveYear } from "@/lib/utils/tarih";
import { KategoriGrafikCard } from "./kategori-grafik-card";
import { KazancGrafikCard } from "./kazanc-grafik-card";
import type { DosyaGrafikItem, KategoriGrafikItem } from "./kategori-grafik-card";

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  dosyalar:    DosyaGrafikItem[];
  kategoriler: KategoriGrafikItem[];
}

// ─── Panel ───────────────────────────────────────────────────────────────────
// Ortak yıl filtresi state'ini tutar; her iki alt grafik de aynı
// filtrelenmiş veriyi alır → tam senkron.

export function GrafikPanel({ dosyalar, kategoriler }: Props) {
  const [seciliYil, setSeciliYil] = useState<string>("");

  // Mevcut yılları akıllı tarih hiyerarşisiyle çıkar (getEffectiveYear)
  const yillar = useMemo(() => {
    const set = new Set<number>();
    dosyalar.forEach((d) => set.add(getEffectiveYear(d)));
    return Array.from(set).sort((a, b) => b - a);
  }, [dosyalar]);

  // Seçili yıla göre filtrele — her iki grafik de bu listeyi kullanır
  const filtrelenmis = useMemo(() => {
    if (!seciliYil) return dosyalar;
    const yil = Number(seciliYil);
    return dosyalar.filter((d) => getEffectiveYear(d) === yil);
  }, [dosyalar, seciliYil]);

  return (
    <div className="space-y-3">
      {/* Ortak yıl filtresi */}
      <div className="flex items-center justify-end">
        <select
          value={seciliYil}
          onChange={(e) => setSeciliYil(e.target.value)}
          className="h-8 rounded-lg border bg-white px-2.5 text-xs text-slate-700 outline-none cursor-pointer transition-colors hover:border-slate-300"
          style={{
            borderColor: seciliYil ? "#D4AF37" : "#E2E8F0",
            boxShadow: "none",
          }}
        >
          <option value="">Tüm Yıllar</option>
          {yillar.map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      </div>

      {/* Yan yana grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <KategoriGrafikCard
          dosyalar={filtrelenmis}
          kategoriler={kategoriler}
          seciliYil={seciliYil}
        />
        <KazancGrafikCard
          dosyalar={filtrelenmis}
          kategoriler={kategoriler}
          seciliYil={seciliYil}
        />
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { formatTL } from "@/lib/utils/para";
import type { DosyaGrafikItem, KategoriGrafikItem } from "./kategori-grafik-card";

// ─── Finansal hesap ───────────────────────────────────────────────────────────
// Kural:
//   manuel_odendi_onayi === true  → makbuz_miktari'nin tamamını tahsil say
//   değilse                       → odeme_miktari (fiili ödeme) kadarını say

function tahsilEdilen(
  makbuzlar: { makbuz_miktari: number; odeme_miktari: number | null; manuel_odendi_onayi: boolean | null }[]
): number {
  return makbuzlar.reduce((acc, m) => {
    return acc + (m.manuel_odendi_onayi ? m.makbuz_miktari : (m.odeme_miktari ?? 0));
  }, 0);
}

// ─── Renk paleti (kategori DB rengi yoksa fallback) ──────────────────────────

const RENK_PALETI = [
  "#3B82F6", // mavi
  "#10B981", // yeşil
  "#F59E0B", // amber
  "#8B5CF6", // mor
  "#EF4444", // kırmızı
  "#06B6D4", // camgöbeği
  "#F97316", // turuncu
  "#84CC16", // limon
  "#EC4899", // pembe
  "#6366F1", // indigo
] as const;

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  /** GrafikPanel tarafından yıla göre önceden filtrelenmiş dosyalar */
  dosyalar:    DosyaGrafikItem[];
  kategoriler: KategoriGrafikItem[];
  seciliYil:   string;
}

// ─── Bileşen ─────────────────────────────────────────────────────────────────

export function KazancGrafikCard({ dosyalar, kategoriler, seciliYil }: Props) {
  // Kategori başına tahsilat toplamı
  const kazancMap = useMemo(() => {
    const map = new Map<number | null, number>();
    dosyalar.forEach((d) => {
      const makbuzlar = (d.makbuz_dosya ?? [])
        .map((j) => j.makbuzlar)
        .filter((m): m is NonNullable<typeof m> => m !== null);
      const tutar = tahsilEdilen(makbuzlar);
      if (tutar > 0)
        map.set(d.kategori_id, (map.get(d.kategori_id) ?? 0) + tutar);
    });
    return map;
  }, [dosyalar]);

  // Sıralı & renklendirilmiş liste (en fazla 10 kategori)
  const sirali = useMemo(() => {
    return kategoriler
      .map((k, i) => ({
        id:     k.id,
        adi:    k.adi,
        // DB'deki kategori rengini öncelikle kullan, yoksa paletten al
        renk:   k.color ?? RENK_PALETI[i % RENK_PALETI.length],
        kazanc: kazancMap.get(k.id) ?? 0,
      }))
      .filter((k) => k.kazanc > 0)
      .sort((a, b) => b.kazanc - a.kazanc)
      .slice(0, 10);
  }, [kategoriler, kazancMap]);

  const maks   = sirali[0]?.kazanc ?? 1;
  const toplam = sirali.reduce((acc, k) => acc + k.kazanc, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
      {/* Başlık */}
      <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            Kategoriye Göre Kazanç
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {seciliYil ? `${seciliYil} · ` : "Tüm zamanlar · "}
            Toplam: <span className="font-semibold text-slate-600">{formatTL(toplam)}</span>
          </p>
        </div>
      </div>

      {/* Grafik */}
      <div className="flex-1 min-h-[200px] flex flex-col justify-center">
        {sirali.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
            <TrendingUp className="w-8 h-8 text-slate-200" />
            <p className="text-sm text-slate-400">
              {seciliYil
                ? `${seciliYil} yılına ait tahsilat bulunamadı.`
                : "Henüz tahsilat kaydı yok."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sirali.map((k) => {
              const yuzde    = Math.max(4, Math.round((k.kazanc / maks) * 100));
              // İç metin: çubuk yeterince genişse ₺ tutarı içinde göster
              const icGoster = yuzde >= 40;

              return (
                <div key={k.id} className="flex items-center gap-3">
                  {/* Kategori adı */}
                  <div
                    className="w-28 flex-shrink-0 text-right text-xs text-slate-600 font-medium truncate leading-tight"
                    title={k.adi}
                  >
                    {k.adi}
                  </div>

                  {/* Progress bar */}
                  <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-6 rounded-full flex items-center justify-end pr-2.5 transition-all duration-500"
                      style={{ width: `${yuzde}%`, backgroundColor: k.renk }}
                    >
                      {icGoster && (
                        <span className="text-[10px] font-bold leading-none tabular-nums text-white/90">
                          {formatTL(k.kazanc)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tutar — dar çubuklarda dışarıda */}
                  <span
                    className="w-24 flex-shrink-0 text-xs font-bold text-slate-700 text-right tabular-nums"
                    style={{ visibility: icGoster ? "hidden" : "visible" }}
                  >
                    {formatTL(k.kazanc)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BarChart2 } from "lucide-react";

// ─── Tipler ─────────────────────────────────────────────────────────────────────

export interface MakbuzOzetGrafik {
  makbuz_miktari:      number;
  odeme_miktari:       number | null;
  manuel_odendi_onayi: boolean | null;
}

export interface DosyaGrafikItem {
  kategori_id:    number | null;
  created_at:     string;
  gorev_tarihi:   string | null;
  durusma_tarihi: string | null;
  rapor_tarihi:   string | null;
  /** Finansal veri — GrafikPanel tarafından kazanç hesabında kullanılır */
  makbuz_dosya?: { makbuzlar: MakbuzOzetGrafik | null }[] | null;
}

export interface KategoriGrafikItem {
  id:    number;
  adi:   string;
  color: string | null;
}

interface Props {
  /** GrafikPanel tarafından yıla göre önceden filtrelenmiş dosyalar */
  dosyalar:    DosyaGrafikItem[];
  kategoriler: KategoriGrafikItem[];
  /** Sadece başlık/alt metin gösterimi için — filtreleme parent'ta yapılır */
  seciliYil:   string;
}

// ─── Renkler ─────────────────────────────────────────────────────────────────────

const BAR_RENKLER = ["#D4AF37", "#0B1E3B"] as const;

// ─── Bileşen ─────────────────────────────────────────────────────────────────────

export function KategoriGrafikCard({ dosyalar, kategoriler, seciliYil }: Props) {
  const sayiMap = useMemo(() => {
    const map = new Map<number | null, number>();
    dosyalar.forEach((d) =>
      map.set(d.kategori_id, (map.get(d.kategori_id) ?? 0) + 1)
    );
    return map;
  }, [dosyalar]);

  const sirali = useMemo(() => {
    return [
      ...kategoriler.map((k) => ({
        id: k.id as number | null,
        adi: k.adi,
        sayi: sayiMap.get(k.id) ?? 0,
      })),
      ...(sayiMap.has(null)
        ? [{ id: null as null, adi: "Kategori Yok", sayi: sayiMap.get(null)! }]
        : []),
    ]
      .filter((k) => k.sayi > 0)
      .sort((a, b) => b.sayi - a.sayi)
      .slice(0, 10);
  }, [kategoriler, sayiMap]);

  const maks = sirali[0]?.sayi ?? 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
      {/* Başlık */}
      <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-slate-400" />
            Kategori Dağılımı
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {seciliYil
              ? `${seciliYil} · ${dosyalar.length} dosya`
              : `Tüm zamanlar · ${dosyalar.length} dosya`}
          </p>
        </div>
        <Link
          href={seciliYil ? `/dosyalar?yil=${seciliYil}` : "/dosyalar"}
          className="text-xs font-medium hover:underline whitespace-nowrap"
          style={{ color: "#1B2A4A" }}
        >
          Tümünü Gör →
        </Link>
      </div>

      {/* Grafik */}
      <div className="flex-1 min-h-[200px] flex flex-col justify-center">
        {sirali.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
            <BarChart2 className="w-8 h-8 text-slate-200" />
            <p className="text-sm text-slate-400">
              {seciliYil
                ? `${seciliYil} yılına ait dosya bulunamadı.`
                : "Henüz kategorize edilmiş dosya yok."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sirali.map((k, i) => {
              const yuzde  = Math.max(4, Math.round((k.sayi / maks) * 100));
              const renk   = BAR_RENKLER[i % BAR_RENKLER.length];
              const icRenk = renk === "#D4AF37" ? "#3B2700" : "#FFFFFF";
              const icGoster = yuzde >= 22;

              return (
                <div key={String(k.id)} className="flex items-center gap-3">
                  <div
                    className="w-28 flex-shrink-0 text-right text-xs text-slate-600 font-medium truncate leading-tight"
                    title={k.adi}
                  >
                    {k.adi}
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-6 rounded-full flex items-center justify-end pr-2.5 transition-all duration-500"
                      style={{ width: `${yuzde}%`, backgroundColor: renk }}
                    >
                      {icGoster && (
                        <span
                          className="text-[11px] font-bold leading-none tabular-nums"
                          style={{ color: icRenk }}
                        >
                          {k.sayi}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className="w-7 flex-shrink-0 text-xs font-bold text-slate-700 text-right tabular-nums"
                    style={{ visibility: icGoster ? "hidden" : "visible" }}
                  >
                    {k.sayi}
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

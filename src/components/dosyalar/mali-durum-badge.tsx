import { Wallet, AlertCircle } from "lucide-react";
import { formatTL } from "@/lib/utils/para";

export type MaliDurum = "BEKLIYOR" | "TAHSIL" | "YOK";

export interface MaliDurumOzet {
  durum: MaliDurum;
  toplamAlacak: number; // toplam makbuz tutarı
  kalan: number;        // ödenmemiş kısım
  makbuzSayisi: number;
}

// ─── Hesaplama ──────────────────────────────────────────────────────────────────

export type MakbuzOzetInput = {
  makbuz_miktari: number;
  odeme_miktari: number | null;
  manuel_odendi_onayi: boolean;
};

/**
 * Bir dosyaya bağlı makbuzların listesinden Mali Durum özetini hesaplar.
 *
 * Tahsil Edildi → TÜM makbuzların bakiyesi sıfır olmalı (every).
 *   • manuel_odendi_onayi === true  → o makbuz tamamen ödenmiş sayılır
 *   • odeme_miktari >= makbuz_miktari → o makbuz tamamen ödenmiş sayılır
 *   İkisi de yoksa → o makbuz hâlâ açık → BEKLIYOR
 */
export function maliDurumHesapla(makbuzlar: MakbuzOzetInput[]): MaliDurumOzet {
  if (makbuzlar.length === 0) {
    return { durum: "YOK", toplamAlacak: 0, kalan: 0, makbuzSayisi: 0 };
  }

  const toplamAlacak = makbuzlar.reduce((s, m) => s + m.makbuz_miktari, 0);

  // Her makbuz için kalan bakiye (manuel onay → 0)
  const kalan = makbuzlar.reduce((s, m) => {
    if (m.manuel_odendi_onayi) return s;
    return s + Math.max(0, m.makbuz_miktari - (m.odeme_miktari ?? 0));
  }, 0);

  // Strict every(): TÜM makbuzlar kapalı olmalı
  const tahsilEdildi = makbuzlar.every(
    (m) => m.manuel_odendi_onayi || (m.odeme_miktari ?? 0) >= m.makbuz_miktari
  );

  return {
    durum: tahsilEdildi ? "TAHSIL" : "BEKLIYOR",
    toplamAlacak,
    kalan,
    makbuzSayisi: makbuzlar.length,
  };
}

// ─── Badge + Tooltip (CSS-hover, saf sunucu bileşeni uyumlu) ───────────────────

export function MaliDurumBadge({ ozet }: { ozet: MaliDurumOzet }) {
  return (
    <div className="relative group inline-block">

      {/* ── Badge ── */}
      {ozet.durum === "YOK" ? (
        <span className="text-slate-400 text-sm select-none">—</span>

      ) : ozet.durum === "TAHSIL" ? (
        /* Açık altın arka plan + belirgin gold çerçeve + koyu yeşil metin — Ödeme Bekliyor mimarisi */
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap border"
          style={{ backgroundColor: "#FBF5E0", borderColor: "#D4AF37", color: "#064E3B" }}
        >
          <Wallet className="w-3 h-3" style={{ color: "#064E3B" }} />
          Tahsil Edildi
        </span>

      ) : (
        /* Ödeme Bekliyor — turuncu */
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-orange-50 border border-orange-200 text-orange-700">
          <AlertCircle className="w-3 h-3 text-orange-500" />
          Ödeme Bekliyor
        </span>
      )}

      {/* ── Tooltip (CSS group-hover, z-50) ── */}
      {ozet.durum !== "YOK" && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:block z-50 pointer-events-none">

          {/* Ok işareti */}
          <div className="flex justify-center -mb-[5px]">
            <div
              className="w-2.5 h-2.5 rotate-45 rounded-sm"
              style={{ backgroundColor: "#0B1E3B" }}
            />
          </div>

          {/* Kart */}
          <div
            className="rounded-xl px-3.5 py-3 shadow-2xl min-w-[200px] space-y-2"
            style={{ backgroundColor: "#0B1E3B" }}
          >
            {/* Toplam Alacak */}
            <div className="flex items-center justify-between gap-6">
              <span className="text-[11px] text-slate-400 whitespace-nowrap">Toplam Alacak</span>
              <span className="text-[11px] font-semibold text-white tabular-nums whitespace-nowrap">
                {formatTL(ozet.toplamAlacak)}
              </span>
            </div>

            <div className="border-t border-white/10" />

            {/* Kalan */}
            <div className="flex items-center justify-between gap-6">
              <span className="text-[11px] text-slate-400 whitespace-nowrap">Kalan</span>
              <span
                className="text-[11px] font-bold tabular-nums whitespace-nowrap"
                style={{ color: ozet.kalan === 0 ? "#34D399" : "#FB923C" }}
              >
                {ozet.kalan === 0 ? "Tam Ödendi" : formatTL(ozet.kalan)}
              </span>
            </div>

            {/* Makbuz sayısı */}
            {ozet.makbuzSayisi > 0 && (
              <p className="text-[10px] text-slate-500 pt-0.5 border-t border-white/5">
                {ozet.makbuzSayisi} makbuz kaydı
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// Saf CSS — client component gerekmez, sunucu bileşeniyle tam uyumlu

export interface KategoriVeri {
  id: number | null;
  adi: string;
  color: string | null;
  dosyaSayisi: number;
}

const BAR_RENKLER = ["#D4AF37", "#0B1E3B"];

interface Props {
  kategoriler: KategoriVeri[];
}

export function KategoriGrafik({ kategoriler }: Props) {
  const sirali = [...kategoriler]
    .filter((k) => k.dosyaSayisi > 0)
    .sort((a, b) => b.dosyaSayisi - a.dosyaSayisi)
    .slice(0, 10); // En fazla 10 kategori göster

  const maks = sirali[0]?.dosyaSayisi ?? 1;

  if (sirali.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
        Henüz kategorize edilmiş dosya yok.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {sirali.map((k, i) => {
        const yuzde = Math.max(6, Math.round((k.dosyaSayisi / maks) * 100));
        const renk  = BAR_RENKLER[i % BAR_RENKLER.length];
        return (
          <div key={k.id ?? "yok"} className="flex items-center gap-3 group">
            {/* Kategori adı — sabit genişlik, sağ hizalı */}
            <div
              className="w-28 flex-shrink-0 text-right text-xs text-slate-600 font-medium truncate leading-tight"
              title={k.adi}
            >
              {k.adi}
            </div>

            {/* Çubuk arka planı */}
            <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
              <div
                className="h-6 rounded-full flex items-center justify-end pr-2.5 transition-all duration-500"
                style={{ width: `${yuzde}%`, backgroundColor: renk }}
              >
                {/* Sayı — çubuk içinde (yeterince genişse) */}
                {yuzde >= 20 && (
                  <span
                    className="text-[11px] font-bold leading-none"
                    style={{ color: renk === "#D4AF37" ? "#3B2700" : "#FFFFFF" }}
                  >
                    {k.dosyaSayisi}
                  </span>
                )}
              </div>
            </div>

            {/* Sayı — çubuk dışında (dar çubuklar için) */}
            {yuzde < 20 && (
              <span className="w-6 flex-shrink-0 text-xs font-bold text-slate-700 text-left">
                {k.dosyaSayisi}
              </span>
            )}
            {yuzde >= 20 && <span className="w-6 flex-shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

import Link from "next/link";
import { Plus, FolderOpen, Upload, ArrowUpDown, ArrowUp, ArrowDown, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { DosyaAra } from "@/components/dosyalar/dosya-ara";
import { DurumBadge } from "@/components/dosyalar/durum-badge";
import { ExportButton } from "@/components/export/export-button";
import { MaliDurumBadge, maliDurumHesapla } from "@/components/dosyalar/mali-durum-badge";
import type { MaliDurumOzet, MakbuzOzetInput } from "@/components/dosyalar/mali-durum-badge";
import type { Kategori, DosyaDurum } from "@/lib/types/database";
import { getEffectiveDateWithSource, dosyaYilFiltresi } from "@/lib/utils/tarih";
import type { TarihKaynagi } from "@/lib/utils/tarih";

// ─── Tipler ────────────────────────────────────────────────────────────────────

// MakbuzOzetInput zaten mali-durum-badge.tsx'den export ediliyor
type MakbuzOzetRaw = MakbuzOzetInput;

type DosyaRow = {
  id: string;
  klasor_no: string | null;
  dosya_no: string | null;
  taraf_1: string | null;
  taraf_2: string | null;
  durum: string;
  gorev_tarihi:   string | null;
  durusma_tarihi: string | null;
  rapor_tarihi:   string | null;
  kategori_id: number;
  created_at: string;
  makbuz_dosya: { makbuzlar: MakbuzOzetRaw | null }[] | null;
};

type Siralama = "mali_asc" | "mali_desc" | "";

const MALI_SIRALAMA_WEIGHT: Record<MaliDurumOzet["durum"], number> = {
  BEKLIYOR: 0,
  TAHSIL:   1,
  YOK:      2,
};

// ─── Sıralama Başlık İkonu ───────────────────────────────────────────────────────

function SiralamaIkonu({ aktif, siralama }: { aktif: boolean; siralama: Siralama }) {
  if (!aktif) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 inline ml-1" />;
  if (siralama === "mali_asc")  return <ArrowUp   className="w-3.5 h-3.5 text-slate-700 inline ml-1" />;
  return <ArrowDown className="w-3.5 h-3.5 text-slate-700 inline ml-1" />;
}

// ─── Sayfa ──────────────────────────────────────────────────────────────────────

const PER_PAGE   = 20;
const YIL_ARALIGI = 6;

interface PageProps {
  searchParams: Promise<{
    q?: string; durum?: string; kategori?: string;
    sayfa?: string; yil?: string; siralama?: string;
    filtre?: string;
  }>;
}

export default async function DosyalarPage({ searchParams }: PageProps) {
  const sp       = await searchParams;
  const q        = sp.q        ?? "";
  const durum    = sp.durum    ?? "";
  const kategori = sp.kategori ?? "";
  const yil      = sp.yil      ?? "";
  const siralama = (sp.siralama ?? "") as Siralama;
  const filtre   = sp.filtre   ?? "";
  const sayfa    = Math.max(1, Number(sp.sayfa ?? 1));
  const from     = (sayfa - 1) * PER_PAGE;

  const bugunTarih = new Date().toISOString().split("T")[0];
  const yaklasanFiltre = filtre === "yaklasan-durusmalar";

  const supabase  = await createClient();
  const mevcutYil = new Date().getFullYear();
  const yillar    = Array.from({ length: YIL_ARALIGI }, (_, i) => mevcutYil - i);

  const { data: kategoriler } = await supabase
    .from("kategoriler")
    .select("id, adi, color, user_id")
    .order("adi") as unknown as { data: Kategori[] | null };

  // Tek sorguda dosya + ilişkili makbuz özetleri (N+1 yok)
  let query = supabase
    .from("dosyalar")
    .select(
      `id, klasor_no, dosya_no, taraf_1, taraf_2, durum,
       gorev_tarihi, durusma_tarihi, rapor_tarihi, kategori_id, created_at,
       makbuz_dosya(makbuzlar(durum, makbuz_miktari, odeme_miktari, manuel_odendi_onayi))`,
      { count: "exact" }
    )
    .range(from, from + PER_PAGE - 1);

  // Yaklaşan duruşmalar filtresi → duruşma tarihine göre sırala
  if (yaklasanFiltre) {
    query = query
      .gte("durusma_tarihi", bugunTarih)
      .order("durusma_tarihi", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (q)        query = query.or(`klasor_no.ilike.%${q}%,dosya_no.ilike.%${q}%,taraf_1.ilike.%${q}%,taraf_2.ilike.%${q}%`);
  if (durum)    query = query.eq("durum", durum as DosyaDurum);
  if (kategori) query = query.eq("kategori_id", Number(kategori));
  // Yıl filtresi: akıllı tarih hiyerarşisi (gorev → durusma → rapor → created_at)
  if (yil)      query = query.or(dosyaYilFiltresi(yil));

  const { data: dosyalarRaw, count } = await query as unknown as {
    data: DosyaRow[] | null;
    count: number | null;
  };

  // Mali durumu hesapla + sıralama uygula
  const dosyalar = (() => {
    if (!dosyalarRaw) return [];
    const withMali = dosyalarRaw.map((d) => {
      const makbuzlar = (d.makbuz_dosya ?? [])
        .map((j) => j.makbuzlar)
        .filter((m): m is MakbuzOzetRaw => m !== null);
      return { ...d, _mali: maliDurumHesapla(makbuzlar) };
    });
    if (siralama === "mali_asc")
      return [...withMali].sort((a, b) => MALI_SIRALAMA_WEIGHT[a._mali.durum] - MALI_SIRALAMA_WEIGHT[b._mali.durum]);
    if (siralama === "mali_desc")
      return [...withMali].sort((a, b) => MALI_SIRALAMA_WEIGHT[b._mali.durum] - MALI_SIRALAMA_WEIGHT[a._mali.durum]);
    return withMali;
  })();

  const toplamSayfa = Math.ceil((count ?? 0) / PER_PAGE);
  const kategoriMap = Object.fromEntries((kategoriler ?? []).map((k) => [k.id, k]));

  // Sıralama linki oluştur
  function maliSiralamaHref() {
    const sonraki = siralama === "mali_asc" ? "mali_desc" : "mali_asc";
    return `/dosyalar?${new URLSearchParams({ ...sp, siralama: sonraki, sayfa: "1" })}`;
  }

  function formatDate(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("tr-TR");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Dosyalar</h1>
          <p className="text-slate-500 mt-1 text-sm">{count ?? 0} dosya bulundu</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ExportButton
            endpoint="/api/export/dosyalar"
            params={{ q, durum, kategori, yil }}
            label="CSV İndir"
          />
          <Link href="/dosyalar/import"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border-2 transition-colors hover:opacity-90 active:scale-95"
            style={{ borderColor: "#C9A84C", color: "#1B2A4A", backgroundColor: "#C9A84C18" }}>
            <Upload className="w-4 h-4" style={{ color: "#C9A84C" }} />
            Toplu Yükle
          </Link>
          <Link href="/dosyalar/yeni">
            <Button className="text-white" style={{ backgroundColor: "#1B2A4A" }}>
              <Plus className="w-4 h-4 mr-2" /> Yeni Dosya
            </Button>
          </Link>
        </div>
      </div>

      {/* Arama & Filtreler */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        {/* Yaklaşan Duruşmalar aktif filtre bildirimi */}
        {yaklasanFiltre && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg border"
            style={{ backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }}>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
              <Calendar className="w-4 h-4" />
              Yaklaşan Duruşmalar gösteriliyor — bugün ve sonrası, tarihe göre sıralı
            </div>
            <Link
              href={`/dosyalar?${new URLSearchParams({ q, durum, kategori, yil })}`}
              className="text-xs text-blue-500 hover:text-blue-700 font-medium whitespace-nowrap ml-3"
            >
              × Filtreyi Kaldır
            </Link>
          </div>
        )}
        <DosyaAra kategoriler={kategoriler ?? []} />
        <form method="GET" className="flex items-center gap-2 flex-wrap">
          {q        && <input type="hidden" name="q"        value={q} />}
          {durum    && <input type="hidden" name="durum"    value={durum} />}
          {kategori && <input type="hidden" name="kategori" value={kategori} />}
          {siralama && <input type="hidden" name="siralama" value={siralama} />}
          <label className="text-xs font-medium text-slate-600">Yıl:</label>
          <select
            name="yil"
            defaultValue={yil}
            className="h-8 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Tüm Yıllar</option>
            {yillar.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Button type="submit" variant="outline" size="sm" className="h-8 text-xs">Uygula</Button>
          {yil && (
            <Link href={`/dosyalar?${new URLSearchParams({ q, durum, kategori }).toString()}`}>
              <Button variant="ghost" size="sm" className="h-8 text-slate-500 text-xs">× Temizle</Button>
            </Link>
          )}
        </form>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {dosyalar.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Klasör / Dosya No</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Taraflar</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Kategori</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Durum</th>
                    {/* Sıralanabilir Mali Durum başlığı */}
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      <Link
                        href={maliSiralamaHref()}
                        className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors select-none"
                        title="Mali Duruma göre sırala"
                      >
                        Mali Durum
                        <SiralamaIkonu
                          aktif={siralama === "mali_asc" || siralama === "mali_desc"}
                          siralama={siralama}
                        />
                      </Link>
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">İşlem Tarihi</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dosyalar.map((dosya) => {
                    const kat = kategoriMap[dosya.kategori_id];
                    return (
                      <tr key={dosya.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{dosya.klasor_no ?? "—"}</div>
                          <div className="text-xs text-slate-400">{dosya.dosya_no ?? "—"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-800">{dosya.taraf_1 ?? "—"}</div>
                          {dosya.taraf_2 && <div className="text-xs text-slate-400">{dosya.taraf_2}</div>}
                        </td>
                        <td className="px-4 py-3">
                          {kat ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: kat.color ?? "#64748B" }} />
                              {kat.adi}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <DurumBadge durum={dosya.durum as DosyaDurum} />
                        </td>
                        <td className="px-4 py-3">
                          <MaliDurumBadge ozet={dosya._mali} />
                        </td>
                        <td className="px-4 py-3">
                          {(() => {
                            const { date, kaynak } = getEffectiveDateWithSource(dosya);
                            const KAYNAK_STIL: Record<TarihKaynagi, { bg: string; text: string }> = {
                              "görev":   { bg: "#EFF6FF", text: "#1D4ED8" },
                              "duruşma": { bg: "#F0FDF4", text: "#15803D" },
                              "rapor":   { bg: "#FEF9C3", text: "#A16207" },
                              "kayıt":   { bg: "#F8FAFC", text: "#64748B" },
                            };
                            const stil = KAYNAK_STIL[kaynak];
                            return (
                              <div>
                                <span className="text-slate-700 text-sm">{formatDate(date)}</span>
                                <span
                                  className="ml-1.5 inline-block px-1.5 py-0.5 rounded text-[10px] font-medium leading-none"
                                  style={{ backgroundColor: stil.bg, color: stil.text }}
                                >
                                  {kaynak}
                                </span>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/dosyalar/${dosya.id}`}
                            className="text-xs font-medium hover:underline"
                            style={{ color: "#1B2A4A" }}
                          >
                            Detay →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Sayfalama + sıralama aktif bildirimi */}
            <div className="px-4 py-3 border-t bg-slate-50 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3">
                <p className="text-sm text-slate-500">Sayfa {sayfa} / {toplamSayfa || 1}</p>
                {siralama && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    <ArrowUpDown className="w-3 h-3" />
                    Mali Duruma göre sıralandı
                    <Link
                      href={`/dosyalar?${new URLSearchParams({ q, durum, kategori, yil, sayfa: "1" })}`}
                      className="ml-1 text-slate-400 hover:text-red-500"
                      title="Sıralamayı kaldır"
                    >×</Link>
                  </span>
                )}
              </div>
              {toplamSayfa > 1 && (
                <div className="flex gap-2">
                  {sayfa > 1 && (
                    <Link href={`/dosyalar?${new URLSearchParams({ ...sp, sayfa: String(sayfa - 1) })}`}>
                      <Button variant="outline" size="sm">← Önceki</Button>
                    </Link>
                  )}
                  {sayfa < toplamSayfa && (
                    <Link href={`/dosyalar?${new URLSearchParams({ ...sp, sayfa: String(sayfa + 1) })}`}>
                      <Button variant="outline" size="sm">Sonraki →</Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              {q || durum || kategori || yil ? "Arama kriterine uygun dosya bulunamadı." : "Henüz dosya eklenmemiş."}
            </p>
            {!q && !durum && !kategori && !yil && (
              <Link href="/dosyalar/yeni" className="mt-4">
                <Button className="text-white" style={{ backgroundColor: "#1B2A4A" }}>
                  <Plus className="w-4 h-4 mr-2" /> İlk Dosyayı Ekle
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

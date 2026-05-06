import Link from "next/link";
import { Plus, Archive, ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { FinansDurumBadge, finansSatirSinifi, formatTL } from "./durum-badge";
import { ArsivleButonu, ArsivdenCikarButonu, KaliciSilButonu } from "./arsiv-butonu";
import type { FinansTip, FinansDurum } from "@/lib/types/database";

type Row = {
  id: string;
  tip: string;
  kaynak_tip: string | null;
  kaynak_id: string | null;
  miktar: number;
  tarih: string;
  referans_no: string | null;
  aciklama: string | null;
  durum: string;
  odenen_miktar: number | null;
  arsivlendi: boolean;
};

const PER_PAGE = 25;

interface Props {
  tip: FinansTip;
  arsivlendi: boolean;
  searchParams: Promise<{ q?: string; durum?: string; yil?: string; sayfa?: string }>;
}

const TIP_KONFIG = {
  MAKBUZ: {
    baslik: "Makbuzlar",
    arsivBaslik: "Makbuzlar — Arşiv",
    yeniHref: "/finans/makbuzlar/yeni",
    arsivHref: "/finans/makbuzlar/arsiv",
    aktifHref: "/finans/makbuzlar",
    bos: "Henüz makbuz kaydı eklenmemiş.",
    icon: "📄",
    ozet: ["Toplam Tutar", "Toplam Ödenen", "Bekleyen Alacak"],
  },
  GIDER: {
    baslik: "Giderler",
    arsivBaslik: "Giderler — Arşiv",
    yeniHref: "/finans/giderler/yeni",
    arsivHref: "/finans/giderler/arsiv",
    aktifHref: "/finans/giderler",
    bos: "Henüz gider kaydı eklenmemiş.",
    icon: "📤",
    ozet: ["Toplam Gider", null, null],
  },
  TAHSILAT: {
    baslik: "Tahsilatlar",
    arsivBaslik: "Tahsilatlar — Arşiv",
    yeniHref: "/finans/tahsilatlar/yeni",
    arsivHref: "/finans/tahsilatlar/arsiv",
    aktifHref: "/finans/tahsilatlar",
    bos: "Henüz tahsilat kaydı eklenmemiş.",
    icon: "📥",
    ozet: ["Toplam Tahsilat", "Tahsil Edilen", "Bekleyen"],
  },
} satisfies Record<FinansTip, unknown>;

const KAYNAK_HREF: Record<string, string> = {
  DOSYA:        "/dosyalar",
  ARABULUCULUK: "/arabuluculuk",
  CMK:          "/cmk",
  DANISMANLIK:  "/danismanlik",
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR");
}

export async function FinansListesi({ tip, arsivlendi, searchParams }: Props) {
  const sp = await searchParams;
  const q          = sp.q ?? "";
  const durumFilter = sp.durum ?? "";
  const yilFilter  = sp.yil ?? "";
  const sayfa      = Math.max(1, Number(sp.sayfa ?? 1));
  const from       = (sayfa - 1) * PER_PAGE;

  const supabase = await createClient();
  const konfig = TIP_KONFIG[tip];

  // Ana sorgu (sayfalı)
  let query = supabase
    .from("finans")
    .select("id, tip, kaynak_tip, kaynak_id, miktar, tarih, referans_no, aciklama, durum, odenen_miktar, arsivlendi",
      { count: "exact" })
    .eq("tip", tip)
    .eq("arsivlendi", arsivlendi)
    .order("tarih", { ascending: false })
    .range(from, from + PER_PAGE - 1);

  if (q)           query = query.or(`referans_no.ilike.%${q}%,aciklama.ilike.%${q}%`);
  if (durumFilter) query = query.eq("durum", durumFilter as FinansDurum);
  if (yilFilter)   query = query.gte("tarih", `${yilFilter}-01-01`).lte("tarih", `${yilFilter}-12-31`);

  // Özet istatistik sorgusu (tümü, arsivlendi=false)
  const statsQuery = supabase
    .from("finans")
    .select("miktar, odenen_miktar, durum")
    .eq("tip", tip)
    .eq("arsivlendi", false);

  const [{ data: kayitlar, count }, { data: statsData }] = await Promise.all([
    query as unknown as Promise<{ data: Row[] | null; count: number | null }>,
    statsQuery as unknown as Promise<{ data: { miktar: number; odenen_miktar: number | null; durum: string }[] | null }>,
  ]);

  const stats = statsData ?? [];
  const toplamMiktar  = stats.reduce((a, r) => a + r.miktar, 0);
  const toplamOdenen  = stats.reduce((a, r) => a + (r.odenen_miktar ?? 0), 0);
  const bekleyen      = stats
    .filter((r) => r.durum === "BEKLIYOR" || r.durum === "KISMI")
    .reduce((a, r) => a + (r.miktar - (r.odenen_miktar ?? 0)), 0);

  const toplamSayfa = Math.ceil((count ?? 0) / PER_PAGE);
  const baseHref = arsivlendi ? konfig.arsivHref : konfig.aktifHref;

  const mevcutYil = new Date().getFullYear();
  const yillar = Array.from({ length: 6 }, (_, i) => mevcutYil - i);

  const gosOdenen = tip !== "GIDER";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {arsivlendi && (
            <Link href={konfig.aktifHref}>
              <Button variant="ghost" size="sm" className="text-slate-500">
                <ArrowLeft className="w-4 h-4 mr-1" /> Aktif Liste
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>
              {konfig.icon} {arsivlendi ? konfig.arsivBaslik : konfig.baslik}
            </h1>
            <p className="text-slate-500 mt-0.5 text-sm">{count ?? 0} kayıt</p>
          </div>
        </div>
        {!arsivlendi && (
          <div className="flex items-center gap-2">
            <Link href={konfig.arsivHref}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
              <Archive className="w-4 h-4" /> Arşiv
            </Link>
            <Link href={konfig.yeniHref}>
              <Button className="text-white" style={{ backgroundColor: "#1B2A4A" }}>
                <Plus className="w-4 h-4 mr-2" /> Yeni Kayıt
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Özet Kartlar — sadece aktif görünümde */}
      {!arsivlendi && (
        <div className={`grid gap-4 ${gosOdenen ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{konfig.ozet[0]}</p>
            <p className="text-2xl font-bold mt-1 tabular-nums" style={{ color: "#1B2A4A" }}>
              {formatTL(toplamMiktar)}
            </p>
          </div>
          {gosOdenen && (
            <>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{konfig.ozet[1]}</p>
                <p className="text-2xl font-bold mt-1 tabular-nums text-emerald-600">
                  {formatTL(toplamOdenen)}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{konfig.ozet[2]}</p>
                <p className="text-2xl font-bold mt-1 tabular-nums text-amber-600">
                  {formatTL(Math.max(0, bekleyen))}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {arsivlendi && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <strong>Arşiv görünümü:</strong> "Geri Al" ile aktife döndürebilir, "Sil" ile kalıcı silebilirsiniz.
        </div>
      )}

      {/* Filtreler */}
      <form method="GET" className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex gap-3 flex-wrap">
          <input name="q" defaultValue={q}
            placeholder="Referans no, açıklama ara..."
            className="flex-1 h-9 rounded-md border border-input bg-white px-3 text-sm min-w-[200px] focus:outline-none focus:ring-1 focus:ring-ring" />
          {!arsivlendi && (
            <select name="durum" defaultValue={durumFilter}
              className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">Tüm Durumlar</option>
              <option value="BEKLIYOR">Bekliyor</option>
              <option value="KISMI">Kısmi</option>
              <option value="TAMAMLANDI">Tamamlandı</option>
              <option value="IPTAL">İptal</option>
            </select>
          )}
          <select name="yil" defaultValue={yilFilter}
            className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">Tüm Yıllar</option>
            {yillar.map((y) => <option key={y} value={String(y)}>{y}</option>)}
          </select>
          <Button type="submit" variant="outline" size="sm">Ara</Button>
          {(q || durumFilter || yilFilter) && (
            <Link href={baseHref}>
              <Button variant="ghost" size="sm" className="text-slate-500">× Temizle</Button>
            </Link>
          )}
        </div>
      </form>

      {/* Tablo */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {kayitlar && kayitlar.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Referans No</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Tarih</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Miktar</th>
                    {gosOdenen && (
                      <>
                        <th className="text-right px-4 py-3 font-medium text-slate-600">Ödenen</th>
                        <th className="text-right px-4 py-3 font-medium text-slate-600">Kalan</th>
                      </>
                    )}
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Durum</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Kaynak</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kayitlar.map((k) => {
                    const kalan = k.miktar - (k.odenen_miktar ?? 0);
                    const kaynakHref = k.kaynak_tip && k.kaynak_id
                      ? `${KAYNAK_HREF[k.kaynak_tip] ?? ""}/${k.kaynak_id}`
                      : null;

                    return (
                      <tr key={k.id}
                        className={`hover:bg-slate-50 transition-colors ${finansSatirSinifi(k.durum as FinansDurum)}`}>
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-800">{k.referans_no ?? "—"}</span>
                          {k.aciklama && (
                            <div className="text-xs text-slate-400 mt-0.5 max-w-[160px] truncate">{k.aciklama}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(k.tarih)}</td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-800">
                          {formatTL(k.miktar)}
                        </td>
                        {gosOdenen && (
                          <>
                            <td className="px-4 py-3 text-right tabular-nums text-emerald-600">
                              {k.odenen_miktar ? formatTL(k.odenen_miktar) : "—"}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums font-medium">
                              {kalan > 0
                                ? <span className="text-amber-600">{formatTL(kalan)}</span>
                                : <span className="text-emerald-500 text-xs">Tam ödendi</span>
                              }
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3">
                          <FinansDurumBadge durum={k.durum as FinansDurum} />
                        </td>
                        <td className="px-4 py-3">
                          {kaynakHref ? (
                            <Link href={kaynakHref}
                              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 hover:underline">
                              {k.kaynak_tip}
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-400">{k.kaynak_tip ?? "—"}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                            {arsivlendi ? (
                              <>
                                <ArsivdenCikarButonu id={k.id} />
                                <KaliciSilButonu id={k.id} />
                              </>
                            ) : (
                              <ArsivleButonu id={k.id} />
                            )}
                            <Link href={`/finans/${k.id}`}
                              className="text-xs font-medium hover:underline"
                              style={{ color: "#1B2A4A" }}>
                              Detay →
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {toplamSayfa > 1 && (
              <div className="px-4 py-3 border-t bg-slate-50 flex items-center justify-between">
                <p className="text-sm text-slate-500">Sayfa {sayfa} / {toplamSayfa}</p>
                <div className="flex gap-2">
                  {sayfa > 1 && (
                    <Link href={`${baseHref}?${new URLSearchParams({ ...sp, sayfa: String(sayfa - 1) })}`}>
                      <Button variant="outline" size="sm">← Önceki</Button>
                    </Link>
                  )}
                  {sayfa < toplamSayfa && (
                    <Link href={`${baseHref}?${new URLSearchParams({ ...sp, sayfa: String(sayfa + 1) })}`}>
                      <Button variant="outline" size="sm">Sonraki →</Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3">{TIP_KONFIG[tip].icon}</p>
            <p className="text-slate-500 font-medium">
              {q || durumFilter || yilFilter
                ? "Arama kriterine uygun kayıt bulunamadı."
                : arsivlendi ? "Arşivde kayıt yok." : konfig.bos}
            </p>
            {!q && !durumFilter && !yilFilter && !arsivlendi && (
              <Link href={konfig.yeniHref} className="mt-4">
                <Button className="text-white" style={{ backgroundColor: "#1B2A4A" }}>
                  <Plus className="w-4 h-4 mr-2" /> İlk Kaydı Ekle
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

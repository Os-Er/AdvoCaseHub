import Link from "next/link";
import { Plus, Receipt, CheckCheck, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { MakbuzDurumBadge, makbuzSatirSinifi } from "@/components/makbuzlar/makbuz-durum-badge";
import { ExportButton } from "@/components/export/export-button";
import { formatTL, kalanBorcHesapla } from "@/lib/utils/para";
import type { Makbuz, MakbuzDurum } from "@/lib/types/database";

const PER_PAGE    = 20;
const YIL_ARALIGI = 6;

interface PageProps {
  searchParams: Promise<{ q?: string; durum?: string; sayfa?: string; yil?: string }>;
}

type MakbuzRow = Pick<Makbuz, "id"|"makbuz_no"|"makbuz_miktari"|"makbuz_tarihi"|"odeme_miktari"|"odeme_tarihi"|"durum"|"manuel_odendi_onayi"|"created_at">;

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR");
}

export default async function MakbuzlarPage({ searchParams }: PageProps) {
  const sp      = await searchParams;
  const q       = sp.q     ?? "";
  const durum   = sp.durum ?? "";
  const yil     = sp.yil   ?? "";
  const sayfa   = Math.max(1, Number(sp.sayfa ?? 1));
  const from    = (sayfa - 1) * PER_PAGE;

  const supabase  = await createClient();
  const mevcutYil = new Date().getFullYear();
  const yillar    = Array.from({ length: YIL_ARALIGI }, (_, i) => mevcutYil - i);

  let query = supabase
    .from("makbuzlar")
    .select("id, makbuz_no, makbuz_miktari, makbuz_tarihi, odeme_miktari, odeme_tarihi, durum, manuel_odendi_onayi, created_at", { count: "exact" })
    .order("makbuz_tarihi", { ascending: false })
    .range(from, from + PER_PAGE - 1);

  if (q)    query = query.ilike("makbuz_no", `%${q}%`);
  if (durum) query = query.eq("durum", durum as MakbuzDurum);
  if (yil)  query = query.gte("makbuz_tarihi", `${yil}-01-01`).lte("makbuz_tarihi", `${yil}-12-31`);

  const { data: makbuzlar, count } = await query as unknown as { data: MakbuzRow[] | null; count: number | null };
  const toplamSayfa = Math.ceil((count ?? 0) / PER_PAGE);

  // Özet istatistikler (filtreli sayfa için değil, tüm kayıtlar)
  const { data: tumMakbuzlar } = await supabase
    .from("makbuzlar")
    .select("makbuz_miktari, odeme_miktari, durum") as unknown as {
      data: Pick<Makbuz, "makbuz_miktari"|"odeme_miktari"|"durum">[] | null;
    };

  const toplamMakbuz   = (tumMakbuzlar ?? []).reduce((a, m) => a + m.makbuz_miktari, 0);
  const toplamOdeme    = (tumMakbuzlar ?? []).reduce((a, m) => a + (m.odeme_miktari ?? 0), 0);
  const toplamBekleyen = (tumMakbuzlar ?? [])
    .filter(m => m.durum !== "ODENDI")
    .reduce((a, m) => a + kalanBorcHesapla(m.makbuz_miktari, m.odeme_miktari), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Makbuzlar</h1>
          <p className="text-slate-500 mt-1 text-sm">{count ?? 0} kayıt bulundu</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ExportButton endpoint="/api/export/makbuzlar" params={{ q, durum, yil }} label="CSV İndir" />
          <Link href="/makbuzlar/import"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border-2 transition-colors hover:opacity-90 active:scale-95"
            style={{ borderColor: "#C9A84C", color: "#1B2A4A", backgroundColor: "#C9A84C18" }}>
            <Upload className="w-4 h-4" style={{ color: "#C9A84C" }} />
            Toplu Yükle
          </Link>
          <Link href="/makbuzlar/yeni">
            <Button className="text-white" style={{ backgroundColor: "#1B2A4A" }}>
              <Plus className="w-4 h-4 mr-2" /> Yeni Makbuz
            </Button>
          </Link>
        </div>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Toplam Makbuz</p>
          <p className="text-2xl font-bold mt-1 tabular-nums" style={{ color: "#1B2A4A" }}>{formatTL(toplamMakbuz)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Toplam Tahsilat</p>
          <p className="text-2xl font-bold mt-1 tabular-nums text-emerald-600">{formatTL(toplamOdeme)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Bekleyen Alacak</p>
          <p className="text-2xl font-bold mt-1 tabular-nums text-amber-600">{formatTL(toplamBekleyen)}</p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <form method="GET" className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Makbuz No Ara</label>
            <input name="q" defaultValue={q} placeholder="Makbuz numarası..."
              className="w-full h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Durum</label>
            <select name="durum" defaultValue={durum}
              className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">Tümü</option>
              <option value="BEKLENIYOR">Bekliyor</option>
              <option value="KISMI">Kısmi Ödeme</option>
              <option value="ODENDI">Ödendi</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Yıl</label>
            <select name="yil" defaultValue={yil}
              className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">Tüm Yıllar</option>
              {yillar.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <Button type="submit" variant="outline" size="sm" className="h-9">Filtrele</Button>
          {(q || durum || yil) && (
            <Link href="/makbuzlar">
              <Button variant="ghost" size="sm" className="h-9 text-slate-500">Temizle ×</Button>
            </Link>
          )}
        </form>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {makbuzlar && makbuzlar.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-600 w-1" />
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Makbuz No</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Tarih</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Makbuz Tutarı</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Ödenen</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Kalan</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Durum</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {makbuzlar.map((m) => {
                    const kalan = m.manuel_odendi_onayi ? 0 : kalanBorcHesapla(m.makbuz_miktari, m.odeme_miktari);
                    return (
                      <tr key={m.id} className={`hover:bg-slate-50 transition-colors ${makbuzSatirSinifi(m.durum as MakbuzDurum)}`}>
                        <td className="px-0 py-0" />
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{m.makbuz_no ?? "—"}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(m.makbuz_tarihi)}</td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-800">{formatTL(m.makbuz_miktari)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-emerald-600">{m.odeme_miktari ? formatTL(m.odeme_miktari) : "—"}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium text-amber-600">
                          {kalan > 0 ? formatTL(kalan) : <span className="text-emerald-500">Tam Ödendi</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <MakbuzDurumBadge durum={m.durum as MakbuzDurum} />
                            {m.manuel_odendi_onayi && (
                              <span
                                className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full border"
                                style={{ borderColor: "#D4AF37", color: "#B8962A", backgroundColor: "#D4AF3718" }}
                                title="Manuel Ödendi Onayı verilmiş"
                              >
                                <CheckCheck className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/makbuzlar/${m.id}`} className="text-xs font-medium hover:underline" style={{ color: "#1B2A4A" }}>
                            Detay →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {toplamSayfa > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
                <p className="text-sm text-slate-500">Sayfa {sayfa} / {toplamSayfa}</p>
                <div className="flex gap-2">
                  {sayfa > 1 && <Link href={`/makbuzlar?${new URLSearchParams({ ...sp, sayfa: String(sayfa - 1) })}`}><Button variant="outline" size="sm">← Önceki</Button></Link>}
                  {sayfa < toplamSayfa && <Link href={`/makbuzlar?${new URLSearchParams({ ...sp, sayfa: String(sayfa + 1) })}`}><Button variant="outline" size="sm">Sonraki →</Button></Link>}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Receipt className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              {q || durum || yil ? "Kritere uygun makbuz bulunamadı." : "Henüz makbuz eklenmemiş."}
            </p>
            {!q && !durum && !yil && (
              <Link href="/makbuzlar/yeni" className="mt-4">
                <Button className="text-white" style={{ backgroundColor: "#1B2A4A" }}>
                  <Plus className="w-4 h-4 mr-2" /> İlk Makbuzu Ekle
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

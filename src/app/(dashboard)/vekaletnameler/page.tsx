import Link from "next/link";
import { Plus, FileText, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { VekaletDurumBadge } from "@/components/vekaletnameler/vekalet-durum-badge";
import { SureBadge, sureSinifGetir } from "@/components/vekaletnameler/sure-badge";
import { ExportButton } from "@/components/export/export-button";
import type { Vekaletname, Vekaletnamedurum } from "@/lib/types/database";

const PER_PAGE   = 20;
const YIL_ARALIGI = 6;

interface PageProps {
  searchParams: Promise<{ q?: string; durum?: string; sayfa?: string; uyari?: string; yil?: string }>;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR");
}

export default async function VekaletnamelerPage({ searchParams }: PageProps) {
  const sp     = await searchParams;
  const q      = sp.q     ?? "";
  const durum  = sp.durum ?? "";
  const uyari  = sp.uyari ?? "";
  const yil    = sp.yil   ?? "";
  const sayfa  = Math.max(1, Number(sp.sayfa ?? 1));
  const from   = (sayfa - 1) * PER_PAGE;

  const supabase  = await createClient();
  const mevcutYil = new Date().getFullYear();
  const yillar    = Array.from({ length: YIL_ARALIGI }, (_, i) => mevcutYil - i);

  let query = supabase
    .from("vekaletnameler")
    .select("id, vekaletname_no, vekalet_veren, turu, vekaletname_tarihi, bitis_tarihi, durum, created_at", { count: "exact" })
    .order("bitis_tarihi", { ascending: true })
    .range(from, from + PER_PAGE - 1);

  if (q)    query = query.ilike("vekalet_veren", `%${q}%`);
  if (durum) query = query.eq("durum", durum as Vekaletnamedurum);
  if (yil)  query = query.gte("vekaletname_tarihi", `${yil}-01-01`).lte("vekaletname_tarihi", `${yil}-12-31`);

  const bugun = new Date();
  if (uyari === "30") {
    const limit = new Date(bugun); limit.setDate(limit.getDate() + 30);
    query = query.eq("durum", "AKTIF")
      .lte("bitis_tarihi", limit.toISOString().split("T")[0])
      .gte("bitis_tarihi", bugun.toISOString().split("T")[0]);
  } else if (uyari === "90") {
    const limit = new Date(bugun); limit.setDate(limit.getDate() + 90);
    query = query.eq("durum", "AKTIF")
      .lte("bitis_tarihi", limit.toISOString().split("T")[0])
      .gte("bitis_tarihi", bugun.toISOString().split("T")[0]);
  }

  const { data: vekaletnameler, count } = await query as unknown as {
    data: Pick<Vekaletname, "id"|"vekaletname_no"|"vekalet_veren"|"turu"|"vekaletname_tarihi"|"bitis_tarihi"|"durum"|"created_at">[] | null;
    count: number | null;
  };
  const toplamSayfa = Math.ceil((count ?? 0) / PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Vekâletnameler</h1>
          <p className="text-slate-500 mt-1 text-sm">{count ?? 0} kayıt bulundu</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ExportButton
            endpoint="/api/export/vekaletnameler"
            params={{ q, durum, yil }}
            label="CSV İndir"
          />
          <Link href="/vekaletnameler/import"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border-2 transition-colors hover:opacity-90 active:scale-95"
            style={{ borderColor: "#C9A84C", color: "#1B2A4A", backgroundColor: "#C9A84C18" }}>
            <Upload className="w-4 h-4" style={{ color: "#C9A84C" }} />
            Toplu Yükle
          </Link>
          <Link href="/vekaletnameler/yeni">
            <Button className="text-white" style={{ backgroundColor: "#1B2A4A" }}>
              <Plus className="w-4 h-4 mr-2" /> Yeni Vekâletname
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <form method="GET" className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Vekâlet Veren Ara</label>
            <input name="q" defaultValue={q} placeholder="İsim veya kurum..."
              className="w-full h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Durum</label>
            <select name="durum" defaultValue={durum}
              className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">Tümü</option>
              <option value="AKTIF">Aktif</option>
              <option value="SONA_ERDI">Sona Erdi</option>
              <option value="IPTAL">İptal</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Süre Uyarısı</label>
            <select name="uyari" defaultValue={uyari}
              className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">Tümü</option>
              <option value="30">30 gün içinde dolacak 🔴</option>
              <option value="90">90 gün içinde dolacak 🟡</option>
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
          {(q || durum || uyari || yil) && (
            <Link href="/vekaletnameler">
              <Button variant="ghost" size="sm" className="h-9 text-slate-500">Temizle ×</Button>
            </Link>
          )}
        </form>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {vekaletnameler && vekaletnameler.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-600 w-1" />
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Vekâlet Veren</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Vekâletname No</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Tür</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Durum</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Bitiş Tarihi</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Kalan Süre</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vekaletnameler.map((v) => (
                    <tr key={v.id} className={`hover:bg-slate-50 transition-colors ${sureSinifGetir(v.bitis_tarihi, v.durum)}`}>
                      <td className="px-0 py-0" />
                      <td className="px-4 py-3 font-medium text-slate-800">{v.vekalet_veren}</td>
                      <td className="px-4 py-3 text-slate-600">{v.vekaletname_no ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{v.turu ?? "—"}</td>
                      <td className="px-4 py-3"><VekaletDurumBadge durum={v.durum as Vekaletnamedurum} /></td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(v.bitis_tarihi)}</td>
                      <td className="px-4 py-3"><SureBadge bitisTarihi={v.bitis_tarihi} durum={v.durum} /></td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/vekaletnameler/${v.id}`} className="text-xs font-medium hover:underline" style={{ color: "#1B2A4A" }}>
                          Detay →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {toplamSayfa > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
                <p className="text-sm text-slate-500">Sayfa {sayfa} / {toplamSayfa}</p>
                <div className="flex gap-2">
                  {sayfa > 1 && <Link href={`/vekaletnameler?${new URLSearchParams({ ...sp, sayfa: String(sayfa - 1) })}`}><Button variant="outline" size="sm">← Önceki</Button></Link>}
                  {sayfa < toplamSayfa && <Link href={`/vekaletnameler?${new URLSearchParams({ ...sp, sayfa: String(sayfa + 1) })}`}><Button variant="outline" size="sm">Sonraki →</Button></Link>}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              {q || durum || uyari || yil ? "Kritere uygun vekâletname bulunamadı." : "Henüz vekâletname eklenmemiş."}
            </p>
            {!q && !durum && !uyari && !yil && (
              <Link href="/vekaletnameler/yeni" className="mt-4">
                <Button className="text-white" style={{ backgroundColor: "#1B2A4A" }}>
                  <Plus className="w-4 h-4 mr-2" /> İlk Vekâletnameyi Ekle
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-400 flex-shrink-0" /> ≤ 30 gün (Kritik)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400 flex-shrink-0" /> 31-90 gün (Uyarı)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-400 flex-shrink-0" /> &gt; 90 gün (Güvende)</span>
      </div>
    </div>
  );
}

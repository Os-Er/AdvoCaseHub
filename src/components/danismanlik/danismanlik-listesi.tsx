import Link from "next/link";
import { Plus, Briefcase, Archive, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { DanismanlikTurBadge, DanismanlikDurumBadge, BitisBadge } from "./durum-badge";
import { ArsivleButonu, ArsivdenCikarButonu, KaliciSilButonu } from "./arsiv-butonu";
import type { DanismanlikDurum, DanismanlikTur } from "@/lib/types/database";

type Row = {
  id: string;
  muvekkil: string | null;
  tur: string | null;
  sozlesme_no: string | null;
  baslangic_tarihi: string | null;
  bitis_tarihi: string | null;
  ucret: number | null;
  konu: string | null;
  durum: string;
  updated_at: string;
};

const PER_PAGE = 20;

interface Props {
  arsivlendi: boolean;
  searchParams: Promise<{ q?: string; durum?: string; tur?: string; sayfa?: string }>;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR");
}

function formatUcret(n: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

function truncate(s: string | null, n = 50) {
  if (!s) return "—";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export async function DanismanlikListesi({ arsivlendi, searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const durumFilter = sp.durum ?? "";
  const turFilter = sp.tur ?? "";
  const sayfa = Math.max(1, Number(sp.sayfa ?? 1));
  const from = (sayfa - 1) * PER_PAGE;

  const supabase = await createClient();

  let query = supabase
    .from("danismanlik")
    .select(
      "id, muvekkil, tur, sozlesme_no, baslangic_tarihi, bitis_tarihi, ucret, konu, durum, updated_at",
      { count: "exact" }
    )
    .eq("arsivlendi", arsivlendi)
    .order("created_at", { ascending: false })
    .range(from, from + PER_PAGE - 1);

  if (q) {
    query = query.or(`muvekkil.ilike.%${q}%,sozlesme_no.ilike.%${q}%,konu.ilike.%${q}%`);
  }
  if (durumFilter) query = query.eq("durum", durumFilter as DanismanlikDurum);
  if (turFilter)   query = query.eq("tur", turFilter as DanismanlikTur);

  const { data: kayitlar, count } = await query as unknown as {
    data: Row[] | null;
    count: number | null;
  };

  const toplamSayfa = Math.ceil((count ?? 0) / PER_PAGE);
  const baseHref = arsivlendi ? "/danismanlik/arsiv" : "/danismanlik";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {arsivlendi && (
            <Link href="/danismanlik">
              <Button variant="ghost" size="sm" className="text-slate-500">
                <ArrowLeft className="w-4 h-4 mr-1" /> Aktif Liste
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>
              {arsivlendi ? "Danışmanlık — Arşiv" : "Danışmanlık"}
            </h1>
            <p className="text-slate-500 mt-0.5 text-sm">{count ?? 0} kayıt</p>
          </div>
        </div>
        {!arsivlendi && (
          <div className="flex items-center gap-2">
            <Link href="/danismanlik/arsiv"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
              <Archive className="w-4 h-4" /> Arşiv
            </Link>
            <Link href="/danismanlik/yeni">
              <Button className="text-white" style={{ backgroundColor: "#1B2A4A" }}>
                <Plus className="w-4 h-4 mr-2" /> Yeni Kayıt
              </Button>
            </Link>
          </div>
        )}
      </div>

      {arsivlendi && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <strong>Arşiv görünümü:</strong> "Geri Al" ile aktife döndürebilir, "Sil" ile kalıcı silebilirsiniz.
        </div>
      )}

      {/* Filtreler */}
      <form method="GET" className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex gap-3 flex-wrap">
          <input name="q" defaultValue={q}
            placeholder="Müvekkil, sözleşme no, konu ara..."
            className="flex-1 h-9 rounded-md border border-input bg-white px-3 text-sm min-w-[200px] focus:outline-none focus:ring-1 focus:ring-ring" />
          {!arsivlendi && (
            <>
              <select name="tur" defaultValue={turFilter}
                className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Tüm Türler</option>
                <option value="DANISMANLIK">Danışmanlık</option>
                <option value="SOZLESME">Sözleşme</option>
                <option value="GENEL">Genel</option>
              </select>
              <select name="durum" defaultValue={durumFilter}
                className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Tüm Durumlar</option>
                <option value="AKTIF">Aktif</option>
                <option value="TAMAMLANDI">Tamamlandı</option>
                <option value="IPTAL">İptal</option>
              </select>
            </>
          )}
          <Button type="submit" variant="outline" size="sm">Ara</Button>
          {(q || durumFilter || turFilter) && (
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
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Müvekkil</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Tür</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Sözleşme No</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Tarih Aralığı</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Ücret</th>
                    {!arsivlendi && (
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Durum</th>
                    )}
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kayitlar.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800">{k.muvekkil ?? "—"}</span>
                        {k.konu && (
                          <div className="text-xs text-slate-400 mt-0.5">{truncate(k.konu, 40)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <DanismanlikTurBadge tur={k.tur as DanismanlikTur | null} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">{k.sozlesme_no ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="text-xs">
                          <span>{formatDate(k.baslangic_tarihi)}</span>
                          {(k.baslangic_tarihi || k.bitis_tarihi) && (
                            <span className="text-slate-400"> → </span>
                          )}
                          <span>{formatDate(k.bitis_tarihi)}</span>
                        </div>
                        {!arsivlendi && <BitisBadge bitis={k.bitis_tarihi} />}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{formatUcret(k.ucret)}</td>
                      {!arsivlendi && (
                        <td className="px-4 py-3">
                          <DanismanlikDurumBadge durum={k.durum as DanismanlikDurum} />
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {arsivlendi ? (
                            <>
                              <ArsivdenCikarButonu id={k.id} />
                              <KaliciSilButonu id={k.id} />
                            </>
                          ) : (
                            <ArsivleButonu id={k.id} />
                          )}
                          <Link href={`/danismanlik/${k.id}`}
                            className="text-xs font-medium hover:underline whitespace-nowrap"
                            style={{ color: "#1B2A4A" }}>
                            Detay →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
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
            <Briefcase className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              {q || durumFilter || turFilter
                ? "Arama kriterine uygun kayıt bulunamadı."
                : arsivlendi ? "Arşivde kayıt yok." : "Henüz danışmanlık kaydı eklenmemiş."}
            </p>
            {!q && !durumFilter && !turFilter && !arsivlendi && (
              <Link href="/danismanlik/yeni" className="mt-4">
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

import Link from "next/link";
import { Plus, ShieldCheck, Archive, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CmkDurumBadge, CmkSureBadge } from "./durum-badge";
import { ArsivleButonu, ArsivdenCikarButonu, KaliciSilButonu } from "./arsiv-butonu";
import type { CmkDurum, CmkSureTipi } from "@/lib/types/database";

type Row = {
  id: string;
  baro_atama_no: string | null;
  atama_tarihi: string | null;
  muvekkil_adi: string | null;
  suc_isnadı: string | null;
  sure_tipi: string | null;
  merci: string | null;
  dosya_no: string | null;
  durum: string;
  updated_at: string;
};

const PER_PAGE = 20;

interface Props {
  arsivlendi: boolean;
  searchParams: Promise<{ q?: string; durum?: string; sure_tipi?: string; sayfa?: string }>;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR");
}

function truncate(s: string | null, n = 50) {
  if (!s) return "—";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export async function CmkListesi({ arsivlendi, searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const durumFilter = sp.durum ?? "";
  const sureTipiFilter = sp.sure_tipi ?? "";
  const sayfa = Math.max(1, Number(sp.sayfa ?? 1));
  const from = (sayfa - 1) * PER_PAGE;

  const supabase = await createClient();

  let query = supabase
    .from("cmk_islemleri")
    .select(
      "id, baro_atama_no, atama_tarihi, muvekkil_adi, suc_isnadı, sure_tipi, merci, dosya_no, durum, updated_at",
      { count: "exact" }
    )
    .eq("arsivlendi", arsivlendi)
    .order("created_at", { ascending: false })
    .range(from, from + PER_PAGE - 1);

  if (q) {
    query = query.or(
      `muvekkil_adi.ilike.%${q}%,baro_atama_no.ilike.%${q}%,dosya_no.ilike.%${q}%,merci.ilike.%${q}%`
    );
  }
  if (durumFilter)    query = query.eq("durum", durumFilter as CmkDurum);
  if (sureTipiFilter) query = query.eq("sure_tipi", sureTipiFilter as CmkSureTipi);

  const { data: kayitlar, count } = await query as unknown as {
    data: Row[] | null;
    count: number | null;
  };

  const toplamSayfa = Math.ceil((count ?? 0) / PER_PAGE);
  const baseHref = arsivlendi ? "/cmk/arsiv" : "/cmk";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {arsivlendi && (
            <Link href="/cmk">
              <Button variant="ghost" size="sm" className="text-slate-500">
                <ArrowLeft className="w-4 h-4 mr-1" /> Aktif Liste
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>
              {arsivlendi ? "CMK İşlemleri — Arşiv" : "CMK İşlemleri"}
            </h1>
            <p className="text-slate-500 mt-0.5 text-sm">{count ?? 0} kayıt</p>
          </div>
        </div>
        {!arsivlendi && (
          <div className="flex items-center gap-2">
            <Link href="/cmk/arsiv"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
              <Archive className="w-4 h-4" /> Arşiv
            </Link>
            <Link href="/cmk/yeni">
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
            placeholder="Müvekkil, baro no, dosya no, merci ara..."
            className="flex-1 h-9 rounded-md border border-input bg-white px-3 text-sm min-w-[200px] focus:outline-none focus:ring-1 focus:ring-ring" />
          {!arsivlendi && (
            <>
              <select name="sure_tipi" defaultValue={sureTipiFilter}
                className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Tüm Süre Tipleri</option>
                <option value="SORUSTURMA">Soruşturma</option>
                <option value="KOVUSTURMA">Kovuşturma</option>
              </select>
              <select name="durum" defaultValue={durumFilter}
                className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Tüm Durumlar</option>
                <option value="DEVAM">Devam Ediyor</option>
                <option value="TAMAMLANDI">Tamamlandı</option>
                <option value="IPTAL">İptal</option>
              </select>
            </>
          )}
          <Button type="submit" variant="outline" size="sm">Ara</Button>
          {(q || durumFilter || sureTipiFilter) && (
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
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Baro Atama No</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Müvekkil</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Suç İsnadı</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Süre Tipi</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Merci</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Dosya No</th>
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
                        <span className="font-medium text-slate-800">{k.baro_atama_no ?? "—"}</span>
                        <div className="text-xs text-slate-400">{formatDate(k.atama_tarihi)}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-medium">
                        {k.muvekkil_adi ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[180px]">
                        {truncate(k.suc_isnadı)}
                      </td>
                      <td className="px-4 py-3">
                        <CmkSureBadge sureTipi={k.sure_tipi as CmkSureTipi | null} />
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[160px]">
                        {truncate(k.merci, 40)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{k.dosya_no ?? "—"}</td>
                      {!arsivlendi && (
                        <td className="px-4 py-3">
                          <CmkDurumBadge durum={k.durum as CmkDurum} />
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
                          <Link href={`/cmk/${k.id}`}
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
            <ShieldCheck className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              {q || durumFilter || sureTipiFilter
                ? "Arama kriterine uygun kayıt bulunamadı."
                : arsivlendi ? "Arşivde kayıt yok." : "Henüz CMK işlemi eklenmemiş."}
            </p>
            {!q && !durumFilter && !sureTipiFilter && !arsivlendi && (
              <Link href="/cmk/yeni" className="mt-4">
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

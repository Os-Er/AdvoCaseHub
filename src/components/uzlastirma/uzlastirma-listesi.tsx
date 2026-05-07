import Link from "next/link";
import { Plus, Scale, Archive, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { UzlastirmaDurumBadge, UzlastirmaSonucBadge } from "./durum-badge";
import { ArsivleButonu, ArsivdenCikarButonu, KaliciSilButonu } from "./arsiv-butonu";
import type { UzlastirmaDurum, UzlastirmaSonuc } from "@/lib/types/database";

type Row = {
  id: string;
  basvuru_no: string | null;
  suphe_sani: string | null;
  magdur: string | null;
  uzlastirmaci_adi: string | null;
  suc_isnad: string | null;
  atama_tarihi: string | null;
  gorusme_tarihi: string | null;
  sonuc: string | null;
  durum: string;
  ucret: number | null;
  updated_at: string;
};

const PER_PAGE = 20;

interface Props {
  arsivlendi: boolean;
  searchParams: Promise<{ q?: string; durum?: string; sayfa?: string }>;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR");
}

function formatUcret(n: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

export async function UzlastirmaListesi({ arsivlendi, searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const durumFilter = sp.durum ?? "";
  const sayfa = Math.max(1, Number(sp.sayfa ?? 1));
  const from = (sayfa - 1) * PER_PAGE;

  const supabase = await createClient();

  let query = supabase
    .from("uzlastirma")
    .select("id, basvuru_no, suphe_sani, magdur, uzlastirmaci_adi, suc_isnad, atama_tarihi, gorusme_tarihi, sonuc, durum, ucret, updated_at", { count: "exact" })
    .eq("arsivlendi", arsivlendi)
    .order("created_at", { ascending: false })
    .range(from, from + PER_PAGE - 1);

  if (q) {
    query = query.or(
      `basvuru_no.ilike.%${q}%,suphe_sani.ilike.%${q}%,magdur.ilike.%${q}%,uzlastirmaci_adi.ilike.%${q}%,suc_isnad.ilike.%${q}%`
    );
  }
  if (durumFilter) {
    query = query.eq("durum", durumFilter as UzlastirmaDurum);
  }

  const { data: kayitlar, count } = await query as unknown as {
    data: Row[] | null;
    count: number | null;
  };

  const toplamSayfa = Math.ceil((count ?? 0) / PER_PAGE);
  const baseHref = arsivlendi ? "/uzlastirma/arsiv" : "/uzlastirma";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {arsivlendi && (
            <Link href="/uzlastirma">
              <Button variant="ghost" size="sm" className="text-slate-500">
                <ArrowLeft className="w-4 h-4 mr-1" /> Aktif Liste
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>
              {arsivlendi ? "Uzlaştırma — Arşiv" : "Uzlaştırma"}
            </h1>
            <p className="text-slate-500 mt-0.5 text-sm">{count ?? 0} kayıt</p>
          </div>
        </div>
        {!arsivlendi && (
          <div className="flex items-center gap-2">
            <Link href="/uzlastirma/arsiv"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
              <Archive className="w-4 h-4" /> Arşiv
            </Link>
            <Link href="/uzlastirma/yeni">
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

      {/* Arama & Filtre */}
      <form method="GET" className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex gap-3 flex-wrap">
          <input name="q" defaultValue={q} placeholder="Şüpheli, mağdur, suç isnadı ara..."
            className="flex-1 h-9 rounded-md border border-input bg-white px-3 text-sm min-w-[200px] focus:outline-none focus:ring-1 focus:ring-ring" />
          {!arsivlendi && (
            <select name="durum" defaultValue={durumFilter}
              className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">Tüm Durumlar</option>
              <option value="DEVAM">Devam Ediyor</option>
              <option value="TAMAMLANDI">Tamamlandı</option>
              <option value="IPTAL">İptal</option>
            </select>
          )}
          <Button type="submit" variant="outline" size="sm">Ara</Button>
          {(q || durumFilter) && (
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
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Başvuru No</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Taraflar</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Uzlaştırmacı</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Suç İsnadı</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Görüşme</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Ücret</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Sonuç</th>
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
                        <span className="font-medium text-slate-800">{k.basvuru_no ?? "—"}</span>
                        <div className="text-xs text-slate-400">{formatDate(k.atama_tarihi)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-800">{k.suphe_sani ?? "—"}</div>
                        {k.magdur && (
                          <div className="text-xs text-slate-400">↳ {k.magdur}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{k.uzlastirmaci_adi ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate">{k.suc_isnad ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {formatDate(k.gorusme_tarihi)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {formatUcret(k.ucret)}
                      </td>
                      <td className="px-4 py-3">
                        <UzlastirmaSonucBadge sonuc={k.sonuc as UzlastirmaSonuc | null} />
                      </td>
                      {!arsivlendi && (
                        <td className="px-4 py-3">
                          <UzlastirmaDurumBadge durum={k.durum as UzlastirmaDurum} />
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
                          <Link href={`/uzlastirma/${k.id}`}
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
            <Scale className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              {q || durumFilter
                ? "Arama kriterine uygun kayıt bulunamadı."
                : arsivlendi
                  ? "Arşivde kayıt yok."
                  : "Henüz uzlaştırma kaydı eklenmemiş."}
            </p>
            {!q && !durumFilter && !arsivlendi && (
              <Link href="/uzlastirma/yeni" className="mt-4">
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

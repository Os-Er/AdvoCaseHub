import Link from "next/link";
import { Plus, Handshake, Archive, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ArabuluculukDurumBadge, ArabuluculukSonucBadge } from "./durum-badge";
import { ArsivleButonu, ArsivdenCikarButonu, KaliciSilButonu } from "./arsiv-butonu";
import type { ArabuluculukDurum, ArabuluculukSonuc } from "@/lib/types/database";

// ─── Tipler ─────────────────────────────────────────────────────────────────

type Row = {
  id: string;
  basvuru_no: string | null;
  basvuran: string | null;
  karsi_taraf: string | null;
  arabulucu_adi: string | null;
  basvuru_tarihi: string | null;
  gorusme_tarihi: string | null;
  konu: string | null;
  sonuc: string | null;
  durum: string;
  updated_at: string;
};

const PER_PAGE = 20;

// ─── Props ──────────────────────────────────────────────────────────────────

interface Props {
  arsivlendi: boolean;
  searchParams: Promise<{ q?: string; durum?: string; sayfa?: string }>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR");
}

function truncate(s: string | null, n = 60) {
  if (!s) return "—";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

// ─── Server Component ────────────────────────────────────────────────────────

export async function ArabuluculukListesi({ arsivlendi, searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const durumFilter = sp.durum ?? "";
  const sayfa = Math.max(1, Number(sp.sayfa ?? 1));
  const from = (sayfa - 1) * PER_PAGE;

  const supabase = await createClient();

  let query = supabase
    .from("arabuluculuk")
    .select("id, basvuru_no, basvuran, karsi_taraf, arabulucu_adi, basvuru_tarihi, gorusme_tarihi, konu, sonuc, durum, updated_at", { count: "exact" })
    .eq("arsivlendi", arsivlendi)
    .order("created_at", { ascending: false })
    .range(from, from + PER_PAGE - 1);

  if (q) {
    query = query.or(
      `basvuru_no.ilike.%${q}%,basvuran.ilike.%${q}%,karsi_taraf.ilike.%${q}%,arabulucu_adi.ilike.%${q}%,konu.ilike.%${q}%`
    );
  }
  if (durumFilter) {
    query = query.eq("durum", durumFilter as ArabuluculukDurum);
  }

  const { data: kayitlar, count } = await query as unknown as {
    data: Row[] | null;
    count: number | null;
  };

  const toplamSayfa = Math.ceil((count ?? 0) / PER_PAGE);
  const baseHref = arsivlendi ? "/arabuluculuk/arsiv" : "/arabuluculuk";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {arsivlendi && (
            <Link href="/arabuluculuk">
              <Button variant="ghost" size="sm" className="text-slate-500">
                <ArrowLeft className="w-4 h-4 mr-1" /> Aktif Liste
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>
              {arsivlendi ? "Arabuluculuk — Arşiv" : "Arabuluculuk"}
            </h1>
            <p className="text-slate-500 mt-0.5 text-sm">{count ?? 0} kayıt</p>
          </div>
        </div>
        {!arsivlendi && (
          <div className="flex items-center gap-2">
            <Link href="/arabuluculuk/arsiv"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
              <Archive className="w-4 h-4" /> Arşiv
            </Link>
            <Link href="/arabuluculuk/yeni">
              <Button className="text-white" style={{ backgroundColor: "#1B2A4A" }}>
                <Plus className="w-4 h-4 mr-2" /> Yeni Kayıt
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Arşiv uyarısı */}
      {arsivlendi && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <strong>Arşiv görünümü:</strong> "Geri Al" ile aktife döndürebilir, "Sil" ile kalıcı silebilirsiniz.
        </div>
      )}

      {/* Arama & Filtre */}
      <form method="GET" className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex gap-3 flex-wrap">
          <input name="q" defaultValue={q} placeholder="Başvuran, karşı taraf, konu ara..."
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
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Arabulucu</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Görüşme</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Konu</th>
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
                        <div className="text-xs text-slate-400">{formatDate(k.basvuru_tarihi)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-800">{k.basvuran ?? "—"}</div>
                        {k.karsi_taraf && (
                          <div className="text-xs text-slate-400">↳ {k.karsi_taraf}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{k.arabulucu_adi ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {formatDate(k.gorusme_tarihi)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[200px]">
                        {truncate(k.konu)}
                      </td>
                      <td className="px-4 py-3">
                        <ArabuluculukSonucBadge sonuc={k.sonuc as ArabuluculukSonuc | null} />
                      </td>
                      {!arsivlendi && (
                        <td className="px-4 py-3">
                          <ArabuluculukDurumBadge durum={k.durum as ArabuluculukDurum} />
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
                          <Link href={`/arabuluculuk/${k.id}`}
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

            {/* Sayfalama */}
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
            <Handshake className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              {q || durumFilter
                ? "Arama kriterine uygun kayıt bulunamadı."
                : arsivlendi
                  ? "Arşivde kayıt yok."
                  : "Henüz arabuluculuk kaydı eklenmemiş."}
            </p>
            {!q && !durumFilter && !arsivlendi && (
              <Link href="/arabuluculuk/yeni" className="mt-4">
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

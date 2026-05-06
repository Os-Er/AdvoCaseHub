import Link from "next/link";
import { FolderOpen, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { DurumBadge } from "@/components/dosyalar/durum-badge";
import { ArsivdenCikarButonu, KaliciSilButonu } from "@/components/dosyalar/arsiv-butonu";
import type { DosyaDurum, DosyaTip } from "@/lib/types/database";

const TIP_KONFIG: Record<DosyaTip, {
  baslik: string;
  listHref: string;
}> = {
  HUKUK: { baslik: "Hukuk Davaları — Arşiv", listHref: "/dosyalar/hukuk" },
  CEZA:  { baslik: "Ceza Davaları — Arşiv",  listHref: "/dosyalar/ceza" },
  ICRA:  { baslik: "İcra Takipleri — Arşiv",  listHref: "/dosyalar/icra" },
};

const PER_PAGE = 20;

interface Props {
  tip: DosyaTip;
  searchParams: Promise<{ q?: string; sayfa?: string }>;
}

type ArsivRow = {
  id: string;
  klasor_no: string | null;
  dosya_no: string | null;
  taraf_1: string | null;
  taraf_2: string | null;
  durum: string;
  updated_at: string;
};

export async function ArsivListesi({ tip, searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const sayfa = Math.max(1, Number(sp.sayfa ?? 1));
  const from = (sayfa - 1) * PER_PAGE;
  const konfig = TIP_KONFIG[tip];

  const supabase = await createClient();

  let query = supabase
    .from("dosyalar")
    .select("id, klasor_no, dosya_no, taraf_1, taraf_2, durum, updated_at", { count: "exact" })
    .eq("tip", tip)
    .eq("arsivlendi", true)
    .order("updated_at", { ascending: false })
    .range(from, from + PER_PAGE - 1);

  if (q) {
    query = query.or(
      `klasor_no.ilike.%${q}%,dosya_no.ilike.%${q}%,taraf_1.ilike.%${q}%,taraf_2.ilike.%${q}%`
    );
  }

  const { data: dosyalar, count } = await query as unknown as {
    data: ArsivRow[] | null;
    count: number | null;
  };

  const toplamSayfa = Math.ceil((count ?? 0) / PER_PAGE);

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("tr-TR");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href={konfig.listHref}>
            <Button variant="ghost" size="sm" className="text-slate-500">
              <ArrowLeft className="w-4 h-4 mr-1" /> Aktif Listesi
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>{konfig.baslik}</h1>
            <p className="text-slate-500 mt-0.5 text-sm">{count ?? 0} arşivlenmiş kayıt</p>
          </div>
        </div>
      </div>

      {/* Uyarı */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        <strong>Arşiv görünümü:</strong> Buradaki dosyalar aktif listede görünmez. "Geri Al" ile aktife döndürebilir, "Sil" ile kalıcı olarak silebilirsiniz.
      </div>

      {/* Arama */}
      <form method="GET" className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Klasör no, dosya no, taraf ara..."
            className="flex-1 h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button type="submit" variant="outline" size="sm">Ara</Button>
          {q && (
            <Link href={konfig.listHref.replace(/^\/dosyalar\/\w+/, `$&/arsiv`)}>
              <Button variant="ghost" size="sm" className="text-slate-500">× Temizle</Button>
            </Link>
          )}
        </div>
      </form>

      {/* Tablo */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {dosyalar && dosyalar.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Klasör / Dosya No</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Taraflar</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Durum</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Arşivlenme</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dosyalar.map((dosya) => (
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
                        <DurumBadge durum={dosya.durum as DosyaDurum} />
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {formatDate(dosya.updated_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <ArsivdenCikarButonu id={dosya.id} />
                          <KaliciSilButonu id={dosya.id} />
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
                    <Link href={`${konfig.listHref}/arsiv?${new URLSearchParams({ ...sp, sayfa: String(sayfa - 1) })}`}>
                      <Button variant="outline" size="sm">← Önceki</Button>
                    </Link>
                  )}
                  {sayfa < toplamSayfa && (
                    <Link href={`${konfig.listHref}/arsiv?${new URLSearchParams({ ...sp, sayfa: String(sayfa + 1) })}`}>
                      <Button variant="outline" size="sm">Sonraki →</Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              {q ? "Arama kriterine uygun arşiv kaydı bulunamadı." : "Arşivde henüz dosya yok."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

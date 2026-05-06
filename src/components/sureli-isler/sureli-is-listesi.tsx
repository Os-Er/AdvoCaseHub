import Link from "next/link";
import { Plus, Clock, Archive, ArrowLeft, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { OncelikBadge, KategoriBadge, KalanGunBadge, ONCELIK_SIRA } from "./oncelik-badge";
import { TamamlaButonu, ArsivleButonu, ArsivdenCikarButonu, KaliciSilButonu } from "./arsiv-butonu";
import type { Oncelik, SureliIsKategori } from "@/lib/types/database";

type Row = {
  id: string;
  baslik: string;
  kategori: string;
  aciklama: string | null;
  son_tarih: string;
  hatirlatma_tarihi: string | null;
  oncelik: string;
  tamamlandi: boolean;
  tamamlanma_tarihi: string | null;
  arsivlendi: boolean;
  kaynak_tip: string | null;
  kaynak_id: string | null;
  created_at: string;
};

const PER_PAGE = 30;

interface Props {
  arsivlendi: boolean; // true → arşiv+tamamlanan görünümü
  searchParams: Promise<{ q?: string; oncelik?: string; kategori?: string; sayfa?: string }>;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR");
}

// Bugün mü?
function isBugun(sonTarih: string) {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const tarih = new Date(sonTarih);
  tarih.setHours(0, 0, 0, 0);
  return tarih.getTime() === bugun.getTime();
}

// Geçti mi ya da çok yakın mı? (0-3 gün)
function isAcil(sonTarih: string) {
  const gun = Math.ceil((new Date(sonTarih).getTime() - Date.now()) / 86400000);
  return gun <= 3;
}

// Kaynak tipi etiket
const KAYNAK_ETIKET: Record<string, string> = {
  DOSYA: "Dosya",
  ARABULUCULUK: "Arabuluculuk",
  CMK: "CMK",
  DANISMANLIK: "Danışmanlık",
};

export async function SureliIsListesi({ arsivlendi, searchParams }: Props) {
  const sp = await searchParams;
  const q           = sp.q ?? "";
  const oncelikFlt  = sp.oncelik ?? "";
  const kategoriFlt = sp.kategori ?? "";
  const sayfa       = Math.max(1, Number(sp.sayfa ?? 1));
  const from        = (sayfa - 1) * PER_PAGE;

  const supabase = await createClient();

  // Arşiv görünümü: arsivlendi=true VEYA tamamlandi=true
  // Aktif görünüm: arsivlendi=false AND tamamlandi=false
  let query = supabase
    .from("sureli_isler")
    .select(
      "id, baslik, kategori, aciklama, son_tarih, hatirlatma_tarihi, oncelik, tamamlandi, tamamlanma_tarihi, arsivlendi, kaynak_tip, kaynak_id, created_at",
      { count: "exact" }
    );

  if (arsivlendi) {
    query = query.or("arsivlendi.eq.true,tamamlandi.eq.true");
  } else {
    query = query.eq("arsivlendi", false).eq("tamamlandi", false);
  }

  // Aktif liste: son_tarih ascending (yaklaşan önce)
  // Arşiv: tamamlanma_tarihi / updated_at desc
  if (!arsivlendi) {
    query = query.order("son_tarih", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, from + PER_PAGE - 1);

  if (q) {
    query = query.ilike("baslik", `%${q}%`);
  }
  if (oncelikFlt)  query = query.eq("oncelik", oncelikFlt as Oncelik);
  if (kategoriFlt) query = query.eq("kategori", kategoriFlt as SureliIsKategori);

  const { data: kayitlar, count } = await query as unknown as {
    data: Row[] | null;
    count: number | null;
  };

  // Aktif listede: KRITIK önce, sonra son_tarih — çift sıralama (Supabase tek .order() zinciriyle çalışıyor)
  // İkincil öncelik sırası client-side yapılıyor
  const sirali = kayitlar
    ? [...kayitlar].sort((a, b) => {
        if (!arsivlendi) {
          // Önce öncelik (KRITIK en üst), sonra son_tarih (en yakın önce)
          const pa = ONCELIK_SIRA[a.oncelik as Oncelik] ?? 99;
          const pb = ONCELIK_SIRA[b.oncelik as Oncelik] ?? 99;
          if (pa !== pb) return pa - pb;
          return new Date(a.son_tarih).getTime() - new Date(b.son_tarih).getTime();
        }
        return 0; // Arşivde DB sırası yeterli
      })
    : [];

  const toplamSayfa = Math.ceil((count ?? 0) / PER_PAGE);
  const baseHref = arsivlendi ? "/sureli-isler/arsiv" : "/sureli-isler";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {arsivlendi && (
            <Link href="/sureli-isler">
              <Button variant="ghost" size="sm" className="text-slate-500">
                <ArrowLeft className="w-4 h-4 mr-1" /> Aktif Liste
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>
              {arsivlendi ? "Süreli İşler — Arşiv" : "Süreli İşler"}
            </h1>
            <p className="text-slate-500 mt-0.5 text-sm">{count ?? 0} kayıt</p>
          </div>
        </div>
        {!arsivlendi && (
          <div className="flex items-center gap-2">
            <Link href="/sureli-isler/arsiv"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
              <Archive className="w-4 h-4" /> Arşiv
            </Link>
            <Link href="/sureli-isler/yeni">
              <Button className="text-white" style={{ backgroundColor: "#1B2A4A" }}>
                <Plus className="w-4 h-4 mr-2" /> Yeni İş
              </Button>
            </Link>
          </div>
        )}
      </div>

      {arsivlendi && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <strong>Arşiv / Tamamlanan:</strong> Tamamlanan ve arşivlenen işler burada görünür. "Geri Al" ile aktife döndürebilirsiniz.
        </div>
      )}

      {/* Filtreler */}
      <form method="GET" className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex gap-3 flex-wrap">
          <input name="q" defaultValue={q}
            placeholder="İş başlığı ara..."
            className="flex-1 h-9 rounded-md border border-input bg-white px-3 text-sm min-w-[200px] focus:outline-none focus:ring-1 focus:ring-ring" />
          {!arsivlendi && (
            <>
              <select name="oncelik" defaultValue={oncelikFlt}
                className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Tüm Öncelikler</option>
                <option value="KRITIK">Kritik</option>
                <option value="YUKSEK">Yüksek</option>
                <option value="NORMAL">Normal</option>
                <option value="DUSUK">Düşük</option>
              </select>
              <select name="kategori" defaultValue={kategoriFlt}
                className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Tüm Kategoriler</option>
                <option value="ISTINAF">İstinaf</option>
                <option value="CEVAP_DILEKCESI">Cevap Dilekçesi</option>
                <option value="BILIRKISI_ITIRAZI">Bilirkişi İtirazı</option>
                <option value="TEMYIZ">Temyiz</option>
                <option value="ITIRAZ">İtiraz</option>
                <option value="DURUSMA">Duruşma</option>
                <option value="DIGER">Diğer</option>
              </select>
            </>
          )}
          <Button type="submit" variant="outline" size="sm">Ara</Button>
          {(q || oncelikFlt || kategoriFlt) && (
            <Link href={baseHref}>
              <Button variant="ghost" size="sm" className="text-slate-500">× Temizle</Button>
            </Link>
          )}
        </div>
      </form>

      {/* Liste */}
      <div className="space-y-2">
        {sirali.length > 0 ? (
          <>
            {sirali.map((k) => {
              const bugun = isBugun(k.son_tarih);
              const acil  = isAcil(k.son_tarih) && !k.tamamlandi;
              return (
                <div key={k.id}
                  className={[
                    "rounded-xl border p-4 transition-all",
                    bugun && !k.tamamlandi
                      ? "deadline-today"
                      : acil
                        ? "bg-red-50 border-red-200"
                        : "bg-white border-slate-200 hover:border-slate-300",
                  ].join(" ")}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    {/* Sol: bilgiler */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <OncelikBadge oncelik={k.oncelik as Oncelik} />
                        <KategoriBadge kategori={k.kategori as SureliIsKategori} />
                        {k.tamamlandi && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            ✓ Tamamlandı
                          </span>
                        )}
                        {k.kaynak_tip && (
                          <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {KAYNAK_ETIKET[k.kaynak_tip] ?? k.kaynak_tip}
                          </span>
                        )}
                      </div>

                      <Link href={`/sureli-isler/${k.id}`}
                        className="block text-sm font-semibold text-slate-800 hover:underline truncate">
                        {k.baslik}
                      </Link>

                      {k.aciklama && (
                        <p className="text-xs text-slate-500 line-clamp-1">{k.aciklama}</p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Son tarih: <strong className={acil && !k.tamamlandi ? "text-red-600" : "text-slate-700"}>
                            {formatDate(k.son_tarih)}
                          </strong>
                        </span>
                        {k.tamamlanma_tarihi && (
                          <span>Tamamlandı: {formatDate(k.tamamlanma_tarihi)}</span>
                        )}
                        {!k.tamamlandi && (
                          <KalanGunBadge sonTarih={k.son_tarih} />
                        )}
                      </div>
                    </div>

                    {/* Sağ: aksiyonlar */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      {arsivlendi ? (
                        <>
                          <ArsivdenCikarButonu id={k.id} />
                          <KaliciSilButonu id={k.id} />
                        </>
                      ) : (
                        <>
                          <TamamlaButonu id={k.id} />
                          <ArsivleButonu id={k.id} />
                        </>
                      )}
                      <Link href={`/sureli-isler/${k.id}/duzenle`}>
                        <button className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
                          <Pencil className="w-3 h-3" /> Düzenle
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {toplamSayfa > 1 && (
              <div className="pt-2 flex items-center justify-between">
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
          <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-16 text-center">
            <Clock className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              {q || oncelikFlt || kategoriFlt
                ? "Arama kriterine uygun iş bulunamadı."
                : arsivlendi ? "Tamamlanan veya arşivlenen iş yok." : "Henüz süreli iş eklenmemiş."}
            </p>
            {!q && !oncelikFlt && !kategoriFlt && !arsivlendi && (
              <Link href="/sureli-isler/yeni" className="mt-4">
                <Button className="text-white" style={{ backgroundColor: "#1B2A4A" }}>
                  <Plus className="w-4 h-4 mr-2" /> İlk İşi Ekle
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

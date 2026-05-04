import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Calendar, Hash, FileText, TrendingUp, CheckCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { MakbuzDurumBadge } from "@/components/makbuzlar/makbuz-durum-badge";
import { MakbuzSilButonu } from "@/components/makbuzlar/makbuz-sil-butonu";
import { formatTL, kalanBorcHesapla, odemeYuzdesi } from "@/lib/utils/para";
import type { Makbuz, MakbuzDurum, Dosya } from "@/lib/types/database";

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default async function MakbuzDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: makbuz }, { data: iliskiler }] = await Promise.all([
    supabase
      .from("makbuzlar")
      .select("*")
      .eq("id", id)
      .single() as unknown as Promise<{ data: Makbuz | null }>,
    supabase
      .from("makbuz_dosya")
      .select("dosya_id, dosyalar(id, klasor_no, dosya_no, taraf_1)")
      .eq("makbuz_id", id) as unknown as Promise<{
        data: { dosya_id: string; dosyalar: Pick<Dosya, "id" | "klasor_no" | "dosya_no" | "taraf_1"> | null }[] | null;
      }>,
  ]);

  if (!makbuz) notFound();

  const kalan  = makbuz.manuel_odendi_onayi ? 0 : kalanBorcHesapla(makbuz.makbuz_miktari, makbuz.odeme_miktari);
  const yuzde  = makbuz.manuel_odendi_onayi ? 100 : odemeYuzdesi(makbuz.makbuz_miktari, makbuz.odeme_miktari);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/makbuzlar">
          <Button variant="ghost" size="sm" className="text-slate-500">
            <ArrowLeft className="w-4 h-4 mr-1" /> Geri
          </Button>
        </Link>
      </div>

      {/* Başlık */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>
              {makbuz.makbuz_no ?? "Makbuz Detayı"}
            </h1>
            <MakbuzDurumBadge durum={makbuz.durum as MakbuzDurum} />
            {makbuz.manuel_odendi_onayi && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border"
                style={{ borderColor: "#D4AF37", color: "#B8962A", backgroundColor: "#D4AF3718" }}
              >
                <CheckCheck className="w-3.5 h-3.5" /> Manuel Onaylı
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-1">{formatDate(makbuz.makbuz_tarihi)}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/makbuzlar/${id}/duzenle`}>
            <Button variant="outline" size="sm">
              <Pencil className="w-4 h-4 mr-1.5" /> Düzenle
            </Button>
          </Link>
          <MakbuzSilButonu id={id} />
        </div>
      </div>

      {/* Tutar Özeti */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">Ödeme Özeti</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Makbuz Tutarı</p>
            <p className="text-lg font-bold tabular-nums" style={{ color: "#1B2A4A" }}>
              {formatTL(makbuz.makbuz_miktari)}
            </p>
          </div>
          <div className="text-center border-x border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Ödenen</p>
            <p className="text-lg font-bold tabular-nums text-emerald-600">
              {makbuz.odeme_miktari ? formatTL(makbuz.odeme_miktari) : "—"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Kalan</p>
            <p className={`text-lg font-bold tabular-nums ${kalan > 0 ? "text-amber-600" : "text-emerald-500"}`}>
              {kalan > 0 ? formatTL(kalan) : "Tam Ödendi"}
            </p>
          </div>
        </div>
        {/* İlerleme çubuğu */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Ödeme İlerlemesi</span>
            <span className="font-medium">%{yuzde}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                width: `${yuzde}%`,
                backgroundColor: makbuz.manuel_odendi_onayi ? "#D4AF37" : yuzde >= 100 ? "#10B981" : yuzde > 0 ? "#3B82F6" : "#F59E0B",
              }}
            />
          </div>
        </div>
      </div>

      {/* Detay Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Makbuz Bilgileri</h3>
          <InfoRow icon={Hash}     label="Makbuz No"       value={makbuz.makbuz_no} />
          <InfoRow icon={Calendar} label="Makbuz Tarihi"   value={formatDate(makbuz.makbuz_tarihi)} />
          <InfoRow icon={Calendar} label="Ödeme Tarihi"    value={formatDate(makbuz.odeme_tarihi)} />
        </div>

        {makbuz.notlar && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Notlar</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{makbuz.notlar}</p>
          </div>
        )}

        {/* İlişkili Dosyalar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
            İlişkili Dosyalar ({iliskiler?.length ?? 0})
          </h3>
          {iliskiler && iliskiler.length > 0 ? (
            <div className="space-y-2">
              {iliskiler.map((il) => {
                const d = il.dosyalar;
                if (!d) return null;
                return (
                  <Link
                    key={il.dosya_id}
                    href={`/dosyalar/${d.id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors group"
                  >
                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-700 group-hover:text-[#1B2A4A]">
                      {d.klasor_no ?? d.dosya_no ?? "Dosya"}
                      {d.taraf_1 && <span className="text-slate-400"> — {d.taraf_1}</span>}
                    </span>
                    <span className="ml-auto text-xs text-slate-400 group-hover:text-[#1B2A4A]">→</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Bu makbuza bağlı dosya yok.</p>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-right">
        Oluşturulma: {formatDate(makbuz.created_at)} · Güncelleme: {formatDate(makbuz.updated_at)}
      </p>
    </div>
  );
}

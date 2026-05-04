import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, ArrowLeft, Calendar, Users, Hash, MapPin, FileText, Receipt, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { DurumBadge } from "@/components/dosyalar/durum-badge";
import { SilButonu } from "@/components/dosyalar/sil-butonu";
import { MakbuzDurumBadge } from "@/components/makbuzlar/makbuz-durum-badge";
import { VekaletDurumBadge } from "@/components/vekaletnameler/vekalet-durum-badge";
import { SureBadge } from "@/components/vekaletnameler/sure-badge";
import { formatTL } from "@/lib/utils/para";
import type { Dosya, DosyaDurum, Makbuz, MakbuzDurum, Vekaletname, Vekaletnamedurum } from "@/lib/types/database";

type DosyaWithKat = Dosya & { kategoriler: { adi: string; color: string | null } | null };

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

export default async function DosyaDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: dosya },
    { data: makbuzIliskiler },
    { data: vekaletIliskiler },
  ] = await Promise.all([
    supabase
      .from("dosyalar")
      .select("*, kategoriler(adi, color)")
      .eq("id", id)
      .single() as unknown as Promise<{ data: DosyaWithKat | null }>,
    supabase
      .from("makbuz_dosya")
      .select("makbuz_id, makbuzlar(id, makbuz_no, makbuz_miktari, odeme_miktari, makbuz_tarihi, durum)")
      .eq("dosya_id", id) as unknown as Promise<{
        data: { makbuz_id: string; makbuzlar: Pick<Makbuz, "id"|"makbuz_no"|"makbuz_miktari"|"odeme_miktari"|"makbuz_tarihi"|"durum"> | null }[] | null;
      }>,
    supabase
      .from("vekaletname_dosya")
      .select("vekaletname_id, vekaletnameler(id, vekaletname_no, vekalet_veren, bitis_tarihi, durum)")
      .eq("dosya_id", id) as unknown as Promise<{
        data: { vekaletname_id: string; vekaletnameler: Pick<Vekaletname, "id"|"vekaletname_no"|"vekalet_veren"|"bitis_tarihi"|"durum"> | null }[] | null;
      }>,
  ]);

  if (!dosya) notFound();

  const kat = dosya.kategoriler as { adi: string; color: string | null } | null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dosyalar">
          <Button variant="ghost" size="sm" className="text-slate-500">
            <ArrowLeft className="w-4 h-4 mr-1" /> Geri
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>
              {dosya.klasor_no ?? dosya.dosya_no ?? "Dosya Detayı"}
            </h1>
            <DurumBadge durum={dosya.durum as DosyaDurum} />
          </div>
          {kat && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: kat.color ?? "#64748B" }} />
              <span className="text-sm text-slate-500">{kat.adi}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/dosyalar/${id}/duzenle`}>
            <Button variant="outline" size="sm">
              <Pencil className="w-4 h-4 mr-1.5" /> Düzenle
            </Button>
          </Link>
          <SilButonu id={id} />
        </div>
      </div>

      {/* Bilgiler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Dosya Numaraları</h3>
          <InfoRow icon={Hash} label="Klasör No"  value={dosya.klasor_no} />
          <InfoRow icon={Hash} label="Dosya No"   value={dosya.dosya_no} />
          <InfoRow icon={Hash} label="Başvuru No" value={dosya.basvuru_no} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Taraflar</h3>
          <InfoRow icon={Users}  label="Taraf 1"          value={dosya.taraf_1} />
          <InfoRow icon={Users}  label="Taraf 2"          value={dosya.taraf_2} />
          <InfoRow icon={MapPin} label="Mahkeme / Merkez" value={dosya.mahkeme_merkez} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Tarihler</h3>
          <InfoRow icon={Calendar} label="Görev Tarihi"   value={formatDate(dosya.gorev_tarihi)} />
          <InfoRow icon={Calendar} label="Duruşma Tarihi" value={formatDate(dosya.durusma_tarihi)} />
          <InfoRow icon={Calendar} label="Rapor Tarihi"   value={formatDate(dosya.rapor_tarihi)} />
        </div>
        {(dosya.konu || dosya.sonuc || dosya.notlar) && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Detaylar</h3>
            <InfoRow icon={FileText} label="Konu"  value={dosya.konu} />
            <InfoRow icon={FileText} label="Sonuç" value={dosya.sonuc} />
            <InfoRow icon={FileText} label="Notlar" value={dosya.notlar} />
          </div>
        )}
      </div>

      {/* İlişkili Makbuzlar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            İlişkili Makbuzlar ({makbuzIliskiler?.length ?? 0})
          </h3>
          <Link href={`/makbuzlar/yeni?dosyaId=${id}`} className="text-xs hover:underline" style={{ color: "#1B2A4A" }}>
            + Makbuz Ekle
          </Link>
        </div>
        {makbuzIliskiler && makbuzIliskiler.length > 0 ? (
          <div className="space-y-2">
            {makbuzIliskiler.map((il) => {
              const m = il.makbuzlar;
              if (!m) return null;
              return (
                <Link
                  key={il.makbuz_id}
                  href={`/makbuzlar/${m.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors group"
                >
                  <Receipt className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 group-hover:text-[#1B2A4A] truncate">
                      {m.makbuz_no ?? "Makbuz"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(m.makbuz_tarihi).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold tabular-nums" style={{ color: "#1B2A4A" }}>
                      {formatTL(m.makbuz_miktari)}
                    </p>
                    <MakbuzDurumBadge durum={m.durum as MakbuzDurum} />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Bu dosyaya bağlı makbuz yok.</p>
        )}
      </div>

      {/* İlişkili Vekâletnameler */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            İlişkili Vekâletnameler ({vekaletIliskiler?.length ?? 0})
          </h3>
          <Link href={`/vekaletnameler/yeni?dosyaId=${id}`} className="text-xs hover:underline" style={{ color: "#1B2A4A" }}>
            + Vekâletname Ekle
          </Link>
        </div>
        {vekaletIliskiler && vekaletIliskiler.length > 0 ? (
          <div className="space-y-2">
            {vekaletIliskiler.map((il) => {
              const v = il.vekaletnameler;
              if (!v) return null;
              return (
                <Link
                  key={il.vekaletname_id}
                  href={`/vekaletnameler/${v.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors group"
                >
                  <Shield className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 group-hover:text-[#1B2A4A] truncate">
                      {v.vekalet_veren}
                    </p>
                    {v.vekaletname_no && <p className="text-xs text-slate-400">{v.vekaletname_no}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <VekaletDurumBadge durum={v.durum as Vekaletnamedurum} />
                    <SureBadge bitisTarihi={v.bitis_tarihi} durum={v.durum} />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Bu dosyaya bağlı vekâletname yok.</p>
        )}
      </div>

      <p className="text-xs text-slate-400 text-right">
        Oluşturulma: {formatDate(dosya.created_at)} · Güncelleme: {formatDate(dosya.updated_at)}
      </p>
    </div>
  );
}

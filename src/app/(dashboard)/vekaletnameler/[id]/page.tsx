import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Calendar, User, Hash, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { VekaletDurumBadge } from "@/components/vekaletnameler/vekalet-durum-badge";
import { SureBadge } from "@/components/vekaletnameler/sure-badge";
import { VekaletSilButonu } from "@/components/vekaletnameler/vekalet-sil-butonu";
import type { Vekaletname, Vekaletnamedurum, Dosya } from "@/lib/types/database";

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

export default async function VekaletDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: vekalet }, { data: iliskiler }] = await Promise.all([
    supabase
      .from("vekaletnameler")
      .select("*")
      .eq("id", id)
      .single() as unknown as Promise<{ data: Vekaletname | null }>,
    supabase
      .from("vekaletname_dosya")
      .select("dosya_id, dosyalar(id, klasor_no, dosya_no, taraf_1)")
      .eq("vekaletname_id", id) as unknown as Promise<{
        data: { dosya_id: string; dosyalar: Pick<Dosya, "id" | "klasor_no" | "dosya_no" | "taraf_1"> | null }[] | null;
      }>,
  ]);

  if (!vekalet) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/vekaletnameler">
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
              {vekalet.vekalet_veren}
            </h1>
            <VekaletDurumBadge durum={vekalet.durum as Vekaletnamedurum} />
          </div>
          <div className="mt-2">
            <SureBadge bitisTarihi={vekalet.bitis_tarihi} durum={vekalet.durum} />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/vekaletnameler/${id}/duzenle`}>
            <Button variant="outline" size="sm">
              <Pencil className="w-4 h-4 mr-1.5" /> Düzenle
            </Button>
          </Link>
          <VekaletSilButonu id={id} />
        </div>
      </div>

      {/* Bilgi Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Temel Bilgiler */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Temel Bilgiler</h3>
          <InfoRow icon={User}     label="Vekâlet Veren"    value={vekalet.vekalet_veren} />
          <InfoRow icon={Hash}     label="Vekâletname No"   value={vekalet.vekaletname_no} />
          <InfoRow icon={FileText} label="Tür"              value={vekalet.turu} />
        </div>

        {/* Tarihler */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Tarihler</h3>
          <InfoRow icon={Calendar} label="Düzenlenme Tarihi" value={formatDate(vekalet.vekaletname_tarihi)} />
          <InfoRow icon={Calendar} label="Bitiş Tarihi"      value={formatDate(vekalet.bitis_tarihi)} />
        </div>

        {/* Notlar */}
        {vekalet.notlar && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Notlar</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{vekalet.notlar}</p>
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
            <p className="text-sm text-slate-400">Bu vekâletnameye bağlı dosya yok.</p>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-right">
        Oluşturulma: {formatDate(vekalet.created_at)} · Güncelleme: {formatDate(vekalet.updated_at)}
      </p>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Calendar, User, FileText, Briefcase, Hash, BadgeDollarSign } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { DanismanlikTurBadge, DanismanlikDurumBadge, BitisBadge } from "@/components/danismanlik/durum-badge";
import { ArsivleButonu, ArsivdenCikarButonu, KaliciSilButonu } from "@/components/danismanlik/arsiv-butonu";
import type { Danismanlik, DanismanlikDurum, DanismanlikTur } from "@/lib/types/database";

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function formatUcret(n: number | null) {
  if (n == null) return null;
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);
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

export default async function DanismanlikDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: kayit } = await supabase
    .from("danismanlik")
    .select("*")
    .eq("id", id)
    .single() as unknown as { data: Danismanlik | null };

  if (!kayit) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/danismanlik">
        <Button variant="ghost" size="sm" className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-1" /> Geri
        </Button>
      </Link>

      {/* Başlık */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <Briefcase className="w-6 h-6 text-slate-400" />
            <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>
              {kayit.muvekkil ?? "Danışmanlık Kaydı"}
            </h1>
            <DanismanlikTurBadge tur={kayit.tur as DanismanlikTur | null} />
            <DanismanlikDurumBadge durum={kayit.durum as DanismanlikDurum} />
          </div>
          {kayit.bitis_tarihi && (
            <div className="mt-2">
              <BitisBadge bitis={kayit.bitis_tarihi} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {kayit.arsivlendi ? (
            <>
              <ArsivdenCikarButonu id={id} />
              <KaliciSilButonu id={id} />
            </>
          ) : (
            <ArsivleButonu id={id} />
          )}
          <Link href={`/danismanlik/${id}/duzenle`}>
            <Button variant="outline" size="sm">
              <Pencil className="w-4 h-4 mr-1.5" /> Düzenle
            </Button>
          </Link>
        </div>
      </div>

      {/* Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Müvekkil & Konu</h3>
          <InfoRow icon={User}     label="Müvekkil" value={kayit.muvekkil} />
          <InfoRow icon={FileText} label="Konu"     value={kayit.konu} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Sözleşme Detayları</h3>
          <InfoRow icon={Hash}            label="Sözleşme No"      value={kayit.sozlesme_no} />
          <InfoRow icon={BadgeDollarSign} label="Ücret"            value={formatUcret(kayit.ucret)} />
          <InfoRow icon={Calendar}        label="Başlangıç Tarihi" value={formatDate(kayit.baslangic_tarihi)} />
          <InfoRow icon={Calendar}        label="Bitiş Tarihi"     value={formatDate(kayit.bitis_tarihi)} />
        </div>

        {kayit.notlar && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Notlar</h3>
            <InfoRow icon={FileText} label="Notlar" value={kayit.notlar} />
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-right">
        Oluşturulma: {formatDate(kayit.created_at)} · Güncelleme: {formatDate(kayit.updated_at)}
      </p>
    </div>
  );
}

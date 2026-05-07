import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Calendar, Users, Hash, FileText, BadgeDollarSign } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { UzlastirmaDurumBadge, UzlastirmaSonucBadge } from "@/components/uzlastirma/durum-badge";
import { ArsivleButonu, ArsivdenCikarButonu, KaliciSilButonu } from "@/components/uzlastirma/arsiv-butonu";
import type { Uzlastirma, UzlastirmaDurum, UzlastirmaSonuc } from "@/lib/types/database";

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

export default async function UzlastirmaDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: kayit } = await supabase
    .from("uzlastirma")
    .select("*")
    .eq("id", id)
    .single() as unknown as { data: Uzlastirma | null };

  if (!kayit) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/uzlastirma">
        <Button variant="ghost" size="sm" className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-1" /> Geri
        </Button>
      </Link>

      {/* Başlık */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>
              {kayit.basvuru_no ?? "Uzlaştırma Detayı"}
            </h1>
            <UzlastirmaDurumBadge durum={kayit.durum as UzlastirmaDurum} />
          </div>
          {kayit.sonuc && (
            <div className="mt-2">
              <UzlastirmaSonucBadge sonuc={kayit.sonuc as UzlastirmaSonuc} />
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
          <Link href={`/uzlastirma/${id}/duzenle`}>
            <Button variant="outline" size="sm">
              <Pencil className="w-4 h-4 mr-1.5" /> Düzenle
            </Button>
          </Link>
        </div>
      </div>

      {/* Bilgiler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Taraflar</h3>
          <InfoRow icon={Users} label="Şüpheli / Sanık"  value={kayit.suphe_sani} />
          <InfoRow icon={Users} label="Mağdur / Müşteki" value={kayit.magdur} />
          <InfoRow icon={Users} label="Uzlaştırmacı"     value={kayit.uzlastirmaci_adi} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Süreç</h3>
          <InfoRow icon={Hash}            label="Başvuru No"     value={kayit.basvuru_no} />
          <InfoRow icon={FileText}        label="Suç İsnadı"     value={kayit.suc_isnad} />
          <InfoRow icon={Calendar}        label="Atama Tarihi"   value={formatDate(kayit.atama_tarihi)} />
          <InfoRow icon={Calendar}        label="Görüşme Tarihi" value={formatDate(kayit.gorusme_tarihi)} />
          <InfoRow icon={BadgeDollarSign} label="Uzlaştırmacı Ücreti" value={formatUcret(kayit.ucret)} />
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

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Calendar, AlarmClock, Tag, Link2, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { OncelikBadge, KategoriBadge, KalanGunBadge } from "@/components/sureli-isler/oncelik-badge";
import { TamamlaButonu, ArsivleButonu, ArsivdenCikarButonu, KaliciSilButonu } from "@/components/sureli-isler/arsiv-butonu";
import type { SureliIs, Oncelik, SureliIsKategori } from "@/lib/types/database";

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

const KAYNAK_HREF: Record<string, string> = {
  DOSYA:        "/dosyalar",
  ARABULUCULUK: "/arabuluculuk",
  CMK:          "/cmk",
  DANISMANLIK:  "/danismanlik",
};

const KAYNAK_ETIKET: Record<string, string> = {
  DOSYA:        "Dosya",
  ARABULUCULUK: "Arabuluculuk",
  CMK:          "CMK İşlemi",
  DANISMANLIK:  "Danışmanlık",
};

export default async function SureliIsDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: kayit } = await supabase
    .from("sureli_isler")
    .select("*")
    .eq("id", id)
    .single() as unknown as { data: SureliIs | null };

  if (!kayit) notFound();

  const gun = Math.ceil((new Date(kayit.son_tarih).getTime() - Date.now()) / 86400000);
  const isBugun = gun === 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/sureli-isler">
        <Button variant="ghost" size="sm" className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-1" /> Geri
        </Button>
      </Link>

      {/* Bugün uyarı bandı */}
      {isBugun && !kayit.tamamlandi && (
        <div className="bg-red-600 text-white rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="animate-shake inline-block text-xl">⚠</span>
          <div>
            <p className="font-bold">Bugün son gün!</p>
            <p className="text-sm opacity-90">Bu işin son tarihi bugündür. Lütfen gerekli adımları atın.</p>
          </div>
        </div>
      )}

      {/* Başlık */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <OncelikBadge oncelik={kayit.oncelik as Oncelik} />
            <KategoriBadge kategori={kayit.kategori as SureliIsKategori} />
            {kayit.tamamlandi && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                ✓ Tamamlandı
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>{kayit.baslik}</h1>
          {!kayit.tamamlandi && <KalanGunBadge sonTarih={kayit.son_tarih} />}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {kayit.arsivlendi || kayit.tamamlandi ? (
            <>
              <ArsivdenCikarButonu id={id} />
              <KaliciSilButonu id={id} />
            </>
          ) : (
            <>
              <TamamlaButonu id={id} />
              <ArsivleButonu id={id} />
            </>
          )}
          <Link href={`/sureli-isler/${id}/duzenle`}>
            <Button variant="outline" size="sm">
              <Pencil className="w-4 h-4 mr-1.5" /> Düzenle
            </Button>
          </Link>
        </div>
      </div>

      {/* Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Tarihler</h3>
          <InfoRow icon={AlarmClock} label="Son Tarih"          value={formatDate(kayit.son_tarih)} />
          <InfoRow icon={Calendar}   label="Hatırlatma Tarihi"  value={formatDate(kayit.hatirlatma_tarihi)} />
          <InfoRow icon={Calendar}   label="Tamamlanma Tarihi"  value={formatDate(kayit.tamamlanma_tarihi)} />
          <InfoRow icon={Calendar}   label="Oluşturulma"        value={formatDate(kayit.created_at)} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Detaylar</h3>
          <InfoRow icon={Tag} label="Kategori" value={kayit.kategori} />
          {kayit.aciklama && (
            <InfoRow icon={FileText} label="Açıklama" value={kayit.aciklama} />
          )}
          {kayit.kaynak_tip && kayit.kaynak_id && (
            <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
              <Link2 className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Kaynak</p>
                <Link
                  href={`${KAYNAK_HREF[kayit.kaynak_tip] ?? ""}/${kayit.kaynak_id}`}
                  className="text-sm font-medium hover:underline"
                  style={{ color: "#1B2A4A" }}>
                  {KAYNAK_ETIKET[kayit.kaynak_tip] ?? kayit.kaynak_tip} kaydını görüntüle →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

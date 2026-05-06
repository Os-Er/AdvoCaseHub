import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Calendar, Hash, FileText, Link2, BadgeDollarSign } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { FinansDurumBadge, FinansTipBadge, formatTL } from "@/components/finans/durum-badge";
import { ArsivleButonu, ArsivdenCikarButonu, KaliciSilButonu } from "@/components/finans/arsiv-butonu";
import type { Finans, FinansDurum, FinansTip } from "@/lib/types/database";

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

const GERI_HREF: Record<FinansTip, string> = {
  MAKBUZ:   "/finans/makbuzlar",
  GIDER:    "/finans/giderler",
  TAHSILAT: "/finans/tahsilatlar",
};

export default async function FinansDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: kayit } = await supabase
    .from("finans")
    .select("*")
    .eq("id", id)
    .single() as unknown as { data: Finans | null };

  if (!kayit) notFound();

  const tip = kayit.tip as FinansTip;
  const kalan = kayit.miktar - (kayit.odenen_miktar ?? 0);
  const geriHref = GERI_HREF[tip] ?? "/finans/makbuzlar";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href={geriHref}>
        <Button variant="ghost" size="sm" className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-1" /> Geri
        </Button>
      </Link>

      {/* Başlık */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <FinansTipBadge tip={tip} />
            <FinansDurumBadge durum={kayit.durum as FinansDurum} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>
            {kayit.referans_no ?? (tip === "MAKBUZ" ? "Makbuz" : tip === "GIDER" ? "Gider" : "Tahsilat")}
          </h1>
          {kayit.aciklama && (
            <p className="text-slate-500 text-sm">{kayit.aciklama}</p>
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
          <Link href={`/finans/${id}/duzenle`}>
            <Button variant="outline" size="sm">
              <Pencil className="w-4 h-4 mr-1.5" /> Düzenle
            </Button>
          </Link>
        </div>
      </div>

      {/* Özet tutar kutusu */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Tutar</p>
          <p className="text-xl font-bold mt-1 tabular-nums" style={{ color: "#1B2A4A" }}>
            {formatTL(kayit.miktar)}
          </p>
        </div>
        {tip !== "GIDER" && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Ödenen</p>
              <p className="text-xl font-bold mt-1 tabular-nums text-emerald-600">
                {formatTL(kayit.odenen_miktar ?? 0)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Kalan</p>
              <p className={`text-xl font-bold mt-1 tabular-nums ${kalan > 0 ? "text-amber-600" : "text-emerald-500"}`}>
                {kalan > 0 ? formatTL(kalan) : "Tam Ödendi"}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Detay kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">İşlem Bilgileri</h3>
          <InfoRow icon={Calendar}        label="Tarih"        value={formatDate(kayit.tarih)} />
          <InfoRow icon={Hash}            label="Referans No"  value={kayit.referans_no} />
          <InfoRow icon={BadgeDollarSign} label="Miktar"       value={formatTL(kayit.miktar)} />
          {tip !== "GIDER" && (
            <InfoRow icon={BadgeDollarSign} label="Ödenen Miktar" value={formatTL(kayit.odenen_miktar)} />
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Bağlantı</h3>
          {kayit.kaynak_tip && kayit.kaynak_id ? (
            <div className="flex items-start gap-3 py-3">
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
          ) : (
            <p className="text-xs text-slate-400 italic py-3">
              {kayit.kaynak_tip ? `${KAYNAK_ETIKET[kayit.kaynak_tip] ?? kayit.kaynak_tip} — kayıt seçilmemiş` : "Bağlantı yok"}
            </p>
          )}
          {kayit.notlar && (
            <InfoRow icon={FileText} label="Notlar" value={kayit.notlar} />
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-right">
        Oluşturulma: {formatDate(kayit.created_at)} · Güncelleme: {formatDate(kayit.updated_at)}
      </p>
    </div>
  );
}

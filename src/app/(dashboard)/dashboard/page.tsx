import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FolderOpen, Receipt, Calendar, ShieldAlert, Archive } from "lucide-react";
import { formatTL, kalanBorcHesapla } from "@/lib/utils/para";
import { GrafikPanel } from "@/components/dashboard/grafik-panel";
import { ArsivleButonu } from "@/components/dashboard/arsivle-butonu";
import type { DosyaGrafikItem, KategoriGrafikItem } from "@/components/dashboard/kategori-grafik-card";

// ─── Stat Kartı ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  href: string;
  accent?: string;
  subLabel?: string;
}

function StatCard({ label, value, icon: Icon, href, accent, subLabel }: StatCardProps) {
  return (
    <Link href={href} className="block group">
      <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all h-full">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-bold mt-1 tabular-nums break-all" style={{ color: accent ?? "#1B2A4A" }}>
              {value}
            </p>
            {subLabel && <p className="text-xs text-slate-400 mt-1">{subLabel}</p>}
          </div>
          <div className="p-2 rounded-lg flex-shrink-0 ml-3" style={{ backgroundColor: accent ? `${accent}18` : "#1B2A4A18" }}>
            <Icon className="w-5 h-5" style={{ color: accent ?? "#1B2A4A" }} />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Sayfa ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient();

  const bugun = new Date().toISOString().split("T")[0];
  const gun30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const gun7  = new Date(Date.now() +  7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [
    { count: acikDosya },
    { count: yaklasanDurusma },
    { count: dolacakVekalet },
    { data: bekleyenMakbuzlar },
    { data: sonDosyalar },
    { data: dolacaklar },
    { data: tumDosyalar },
    { data: kategoriler },
  ] = await Promise.all([
    supabase.from("dosyalar").select("id", { count: "exact", head: true }).eq("durum", "ACIK") as unknown as Promise<{ count: number | null }>,
    supabase.from("dosyalar").select("id", { count: "exact", head: true }).gte("durusma_tarihi", bugun).lte("durusma_tarihi", gun7) as unknown as Promise<{ count: number | null }>,
    supabase.from("vekaletnameler").select("id", { count: "exact", head: true }).eq("durum", "AKTIF").gte("bitis_tarihi", bugun).lte("bitis_tarihi", gun30) as unknown as Promise<{ count: number | null }>,
    supabase.from("makbuzlar").select("makbuz_miktari, odeme_miktari").neq("durum", "ODENDI") as unknown as Promise<{ data: { makbuz_miktari: number; odeme_miktari: number | null }[] | null }>,
    supabase.from("dosyalar").select("id, klasor_no, dosya_no, taraf_1, created_at").order("created_at", { ascending: false }).limit(5) as unknown as Promise<{ data: { id: string; klasor_no: string | null; dosya_no: string | null; taraf_1: string | null; created_at: string }[] | null }>,
    supabase.from("vekaletnameler").select("id, vekalet_veren, bitis_tarihi, vekaletname_no").eq("durum", "AKTIF").gte("bitis_tarihi", bugun).lte("bitis_tarihi", gun30).order("bitis_tarihi", { ascending: true }).limit(5) as unknown as Promise<{ data: { id: string; vekalet_veren: string; bitis_tarihi: string; vekaletname_no: string | null }[] | null }>,

    // Grafik verisi — tarih hiyerarşisi + makbuz finansalı (4 tarih + makbuz join)
    supabase
      .from("dosyalar")
      .select(
        "kategori_id, created_at, gorev_tarihi, durusma_tarihi, rapor_tarihi, makbuz_dosya(makbuzlar(makbuz_miktari, odeme_miktari, manuel_odendi_onayi))"
      ) as unknown as Promise<{ data: DosyaGrafikItem[] | null }>,

    // Tüm kategoriler (renk dahil)
    supabase.from("kategoriler").select("id, adi, color").order("adi") as unknown as Promise<{ data: KategoriGrafikItem[] | null }>,
  ]);

  const bekleyenToplam = (bekleyenMakbuzlar ?? [])
    .reduce((acc, m) => acc + kalanBorcHesapla(m.makbuz_miktari, m.odeme_miktari), 0);

  const dosyaGrafikVeri  = (tumDosyalar  ?? []) as DosyaGrafikItem[];
  const kategoriGrafikVeri = (kategoriler ?? []) as KategoriGrafikItem[];

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  }
  function kalanGun(bitis: string) {
    const b = new Date(bitis); b.setHours(0, 0, 0, 0);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return Math.ceil((b.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Ana Sayfa</h1>
        <p className="text-slate-500 mt-1 text-sm">Genel bakış ve özet bilgiler.</p>
      </div>

      {/* ── Üst Alan: 4 Stat Kartı (2×2 → 4 sütun) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Açık Dosya"
          value={acikDosya ?? 0}
          icon={FolderOpen}
          href="/dosyalar?durum=ACIK"
          subLabel="aktif dava"
        />
        <StatCard
          label="Bekleyen Alacak"
          value={formatTL(bekleyenToplam)}
          icon={Receipt}
          href="/makbuzlar?durum=BEKLENIYOR"
          accent="#C9A84C"
          subLabel="ödenmemiş toplam"
        />
        <StatCard
          label="Yaklaşan Duruşma"
          value={yaklasanDurusma ?? 0}
          icon={Calendar}
          href="/dosyalar?filtre=yaklasan-durusmalar"
          accent="#3B82F6"
          subLabel="7 gün içinde"
        />
        <StatCard
          label="Süre Dolacak Vekâlet"
          value={dolacakVekalet ?? 0}
          icon={ShieldAlert}
          href="/vekaletnameler?uyari=30"
          accent={dolacakVekalet ? "#EF4444" : "#10B981"}
          subLabel="30 gün içinde"
        />
      </div>

      {/* ── Grafik Paneli: Kategori Dağılımı + Kategoriye Göre Kazanç ── */}
      {/* GrafikPanel içinde ortak yıl filtresi ve yan yana 2-kolon grid var */}
      <GrafikPanel
        dosyalar={dosyaGrafikVeri}
        kategoriler={kategoriGrafikVeri}
      />

      {/* ── Alt Alan: Son Dosyalar + Dolacak Vekâletnameler ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Son Eklenen Dosyalar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Son Eklenen Dosyalar</h2>
            <Link href="/dosyalar" className="text-xs hover:underline" style={{ color: "#1B2A4A" }}>Tümü →</Link>
          </div>
          {sonDosyalar && sonDosyalar.length > 0 ? (
            <div className="space-y-1">
              {sonDosyalar.map((d) => (
                <Link key={d.id} href={`/dosyalar/${d.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 group transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-700 group-hover:text-[#1B2A4A]">
                      {d.klasor_no ?? d.dosya_no ?? "—"}
                    </p>
                    {d.taraf_1 && <p className="text-xs text-slate-400">{d.taraf_1}</p>}
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{formatDate(d.created_at)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 py-4 text-center">Henüz dosya eklenmemiş.</p>
          )}
        </div>

        {/* 30 Gün İçinde Dolacak Vekâletnameler */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              Süre Dolacak Vekâletnameler
              {(dolacakVekalet ?? 0) > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                  {dolacakVekalet}
                </span>
              )}
            </h2>
            <Link href="/vekaletnameler?uyari=30" className="text-xs hover:underline" style={{ color: "#1B2A4A" }}>Tümü →</Link>
          </div>
          {dolacaklar && dolacaklar.length > 0 ? (
            <div className="space-y-1">
              {dolacaklar.map((v) => (
                <Link key={v.id} href={`/vekaletnameler/${v.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 group transition-colors border-l-2 border-l-red-400">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 group-hover:text-[#1B2A4A] truncate">{v.vekalet_veren}</p>
                    {v.vekaletname_no && <p className="text-xs text-slate-400">{v.vekaletname_no}</p>}
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs font-semibold text-red-600">{kalanGun(v.bitis_tarihi)} gün</p>
                    <p className="text-xs text-slate-400">{formatDate(v.bitis_tarihi)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <ShieldAlert className="w-8 h-8 text-emerald-300 mb-2" />
              <p className="text-sm text-slate-400">30 gün içinde dolacak vekâletname yok.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Toplu Arşivleme ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-slate-100 flex-shrink-0">
            <Archive className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-800 mb-1">Toplu Arşivleme</h2>
            <p className="text-sm text-slate-500 mb-4">Seçilen yıla ait tüm aktif dosyaları (AÇIK, İTİRAZ, TEMYİZ vb.) ARSIV durumuna al.</p>
            <ArsivleButonu />
          </div>
        </div>
      </div>
    </div>
  );
}

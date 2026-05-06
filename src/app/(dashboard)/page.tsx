import Link from "next/link";
import {
  Folder, Clock, Banknote, Scale,
  ShieldCheck, Briefcase, HandshakeIcon,
  TrendingDown, TrendingUp, ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { fetchDashboardVeri } from "@/lib/utils/dashboard-veri";
import { DosyaTipGrafik } from "@/components/dashboard/dosya-tip-grafik";
import { KalanGunBadge, OncelikBadge, KategoriBadge } from "@/components/sureli-isler/oncelik-badge";
import type { Oncelik, SureliIsKategori } from "@/lib/types/database";

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatTL(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₺`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K ₺`;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency", currency: "TRY", maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("tr-TR", {
    day: "numeric", month: "short",
  });
}

function selamla(): string {
  const saat = new Date().getHours();
  if (saat < 12) return "Günaydın";
  if (saat < 18) return "İyi günler";
  return "İyi akşamlar";
}

// ─── Stat Kartı ──────────────────────────────────────────────────────────────

function StatKarti({
  icon: Icon,
  baslik,
  deger,
  alt,
  renk,
  href,
  vurgu,
}: {
  icon: React.ElementType;
  baslik: string;
  deger: string | number;
  alt?: string;
  renk: "navy" | "gold" | "green" | "red" | "orange";
  href: string;
  vurgu?: boolean;
}) {
  const RENKLER = {
    navy:   { bg: "bg-[#1B2A4A]",  text: "text-white",     icon: "text-white/70",  ring: "" },
    gold:   { bg: "bg-[#C9A84C]",  text: "text-[#1B2A4A]", icon: "text-[#1B2A4A]/60", ring: "" },
    green:  { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-400", ring: "border border-emerald-200" },
    red:    { bg: vurgu ? "bg-red-600" : "bg-red-50", text: vurgu ? "text-white" : "text-red-700", icon: vurgu ? "text-white/70" : "text-red-400", ring: vurgu ? "" : "border border-red-200" },
    orange: { bg: "bg-orange-50",  text: "text-orange-700", icon: "text-orange-400", ring: "border border-orange-200" },
  };
  const r = RENKLER[renk];

  return (
    <Link href={href}
      className={`${r.bg} ${r.ring} rounded-2xl p-5 flex flex-col gap-3 hover:opacity-90 active:scale-[0.98] transition-all group`}>
      <div className="flex items-center justify-between">
        <Icon className={`w-5 h-5 ${r.icon}`} />
        <ArrowRight className={`w-4 h-4 ${r.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
      <div>
        <p className={`text-3xl font-bold tabular-nums ${r.text}`}>{deger}</p>
        <p className={`text-sm font-medium mt-0.5 ${r.text} opacity-80`}>{baslik}</p>
        {alt && (
          <p className={`text-xs mt-1.5 ${r.text} opacity-60`}>{alt}</p>
        )}
      </div>
    </Link>
  );
}

// ─── Modül Sayaç Satırı ───────────────────────────────────────────────────────

function ModulSatiri({
  icon: Icon,
  label,
  sayi,
  href,
  renk,
}: {
  icon: React.ElementType;
  label: string;
  sayi: number;
  href: string;
  renk: string;
}) {
  return (
    <Link href={href}
      className="flex items-center justify-between py-3 px-1 rounded-lg hover:bg-slate-50 transition-colors group">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: renk + "20" }}>
          <Icon className="w-3.5 h-3.5" style={{ color: renk }} />
        </div>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold tabular-nums text-slate-800">{sayi}</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}

// ─── Finans Kutusu ────────────────────────────────────────────────────────────

function FinansKutusu({
  label, tutar, renk, ikon, href,
}: {
  label: string; tutar: number; renk: string; ikon: string; href: string;
}) {
  return (
    <Link href={href} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{ikon}</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-xl font-bold tabular-nums" style={{ color: renk }}>{formatTL(tutar)}</p>
      <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
    </Link>
  );
}

// ─── Dashboard sayfası ────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const veri = await fetchDashboardVeri();

  const toplamDosya = veri.hukukDosya + veri.cezaDosya + veri.icraDosya;
  const toplamServis = veri.aktifArabuluculuk + veri.aktifCmk + veri.aktifDanismanlik;
  const bugun = new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Başlık */}
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>
            {selamla()} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">{bugun}</p>
        </div>
        {veri.kritikSureSayisi > 0 && (
          <Link href="/sureli-isler"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors">
            <AlertTriangle className="w-4 h-4" />
            {veri.kritikSureSayisi} acil süre var
          </Link>
        )}
      </div>

      {/* 4 Ana Stat Kartı */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatKarti
          icon={Folder}
          baslik="Aktif Dosya"
          deger={toplamDosya}
          alt={`Hukuk ${veri.hukukDosya} · Ceza ${veri.cezaDosya} · İcra ${veri.icraDosya}`}
          renk="navy"
          href="/dosyalar"
        />
        <StatKarti
          icon={Clock}
          baslik="Yaklaşan Süre"
          deger={veri.kritikSureSayisi}
          alt="Bugün ve yarın dolan"
          renk={veri.kritikSureSayisi > 0 ? "red" : "green"}
          href="/sureli-isler"
          vurgu={veri.kritikSureSayisi > 3}
        />
        <StatKarti
          icon={Banknote}
          baslik="Bekleyen Tahsilat"
          deger={formatTL(veri.bekleyenTahsilat)}
          alt="Makbuz — ödenmemiş"
          renk={veri.bekleyenTahsilat > 0 ? "orange" : "green"}
          href="/finans/makbuzlar"
        />
        <StatKarti
          icon={Scale}
          baslik="Aktif Servis"
          deger={toplamServis}
          alt={`Arabuluculuk ${veri.aktifArabuluculuk} · CMK ${veri.aktifCmk} · Danışmanlık ${veri.aktifDanismanlik}`}
          renk="gold"
          href="/arabuluculuk"
        />
      </div>

      {/* Orta: Pie + Kritik Süreler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Dosya Tipi Dağılımı */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Dosya Tipi Dağılımı</h2>
            <Link href="/dosyalar" className="text-xs font-medium hover:underline" style={{ color: "#1B2A4A" }}>
              Tümünü gör →
            </Link>
          </div>
          <DosyaTipGrafik
            hukuk={veri.hukukDosya}
            ceza={veri.cezaDosya}
            icra={veri.icraDosya}
          />
        </div>

        {/* Yaklaşan İşler */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">
              Kritik Süreler
            </h2>
            <Link href="/sureli-isler" className="text-xs font-medium hover:underline" style={{ color: "#1B2A4A" }}>
              Tümünü gör →
            </Link>
          </div>

          {veri.yaklasanIsler.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
              <Clock className="w-8 h-8 mb-2 text-slate-200" />
              <p className="text-sm font-medium">Yaklaşan süre yok 🎉</p>
              <p className="text-xs mt-1">Tüm işler zamanında!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {veri.yaklasanIsler.map((is) => (
                <Link key={is.id} href={`/sureli-isler/${is.id}`}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-slate-100">

                  {/* Sol: öncelik + içerik */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <OncelikBadge oncelik={is.oncelik as Oncelik} />
                      <KategoriBadge kategori={is.kategori as SureliIsKategori} />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-[#1B2A4A]">
                      {is.baslik}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{formatDate(is.son_tarih)}</span>
                      <KalanGunBadge sonTarih={is.son_tarih} />
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alt: Modüller + Finans Özeti */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Modül Sayaçları */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-1">Modüller</h2>
          <p className="text-xs text-slate-400 mb-4">Aktif kayıt sayıları</p>
          <div className="divide-y divide-slate-100">
            <ModulSatiri icon={Folder}        label="Hukuk Dosyaları"   sayi={veri.hukukDosya}       href="/dosyalar?tip=HUKUK"      renk="#1B2A4A" />
            <ModulSatiri icon={Folder}        label="Ceza Dosyaları"    sayi={veri.cezaDosya}        href="/dosyalar?tip=CEZA"       renk="#7C3AED" />
            <ModulSatiri icon={Folder}        label="İcra Dosyaları"    sayi={veri.icraDosya}        href="/dosyalar?tip=ICRA"       renk="#0369A1" />
            <ModulSatiri icon={HandshakeIcon} label="Arabuluculuk"      sayi={veri.aktifArabuluculuk} href="/arabuluculuk"           renk="#059669" />
            <ModulSatiri icon={ShieldCheck}   label="CMK İşlemleri"     sayi={veri.aktifCmk}          href="/cmk"                   renk="#DC2626" />
            <ModulSatiri icon={Briefcase}     label="Danışmanlık"       sayi={veri.aktifDanismanlik}  href="/danismanlik"           renk="#C9A84C" />
          </div>
        </div>

        {/* Finans Bu Ay Özeti */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-1">Bu Ay Finans</h2>
          <p className="text-xs text-slate-400 mb-4">
            {new Date().toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FinansKutusu
              label="Bekleyen Tahsilat"
              tutar={veri.bekleyenTahsilat}
              renk="#C9A84C"
              ikon="📄"
              href="/finans/makbuzlar"
            />
            <FinansKutusu
              label="Giderler"
              tutar={veri.buAyGider}
              renk="#DC2626"
              ikon="📤"
              href="/finans/giderler"
            />
            <FinansKutusu
              label="Tahsilatlar"
              tutar={veri.buAyTahsilat}
              renk="#059669"
              ikon="📥"
              href="/finans/tahsilatlar"
            />
          </div>

          {/* Gelir/Gider net */}
          {(veri.buAyGider > 0 || veri.buAyTahsilat > 0) && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Bu Ay Net</span>
                <div className="flex items-center gap-1.5">
                  {veri.buAyTahsilat >= veri.buAyGider
                    ? <TrendingUp className="w-4 h-4 text-emerald-500" />
                    : <TrendingDown className="w-4 h-4 text-red-500" />
                  }
                  <span className={`text-sm font-bold tabular-nums ${
                    veri.buAyTahsilat >= veri.buAyGider ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {veri.buAyTahsilat >= veri.buAyGider ? "+" : ""}
                    {formatTL(veri.buAyTahsilat - veri.buAyGider)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

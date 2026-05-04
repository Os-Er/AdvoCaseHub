"use client";

import { useActionState, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Upload, Download, CheckCircle2, XCircle,
  AlertTriangle, FileText, X, FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { importDosyalar, type ImportSonuc } from "@/lib/actions/import-dosyalar";

// ─── Şablon ────────────────────────────────────────────────────────────────
const SABLON_BASLIK =
  "Kategori Adı,Klasör No,Dosya No,Başvuru/Esas No,Taraf 1,Taraf 2,Mahkeme/Merkez,Konu,Sonuç,Durum,Görev Tarihi,Duruşma Tarihi,Rapor Tarihi,Notlar";

const SABLON_ORNEKLER = [
  'Arabulucu İş,2024/001,2024/123,BAŞV-001,Ahmet Yılmaz,Mehmet Kaya,İstanbul Adliyesi,İş Uyuşmazlığı,Devam ediyor,ACIK,2024-01-15,2024-06-20,2024-06-25,İlk duruşma yapıldı',
  'Hukuki Danışmanlık,2024/002,,ESAS-042,Ayşe Demir,,Ankara BAM,Ticari Dava,,KAPALI,2024-02-10,,,Karar verildi',
];

function sablonIndir() {
  const bom = "﻿";
  const icerik = [bom + SABLON_BASLIK, ...SABLON_ORNEKLER].join("\r\n");
  const blob = new Blob([icerik], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dosya_import_sablonu.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sütun Kılavuzu ────────────────────────────────────────────────────────
const SUTUNLAR = [
  { ad: "Kategori Adı",       aciklama: "Sistemdeki kategori adıyla birebir eşleşmeli (zorunlu değil, varsayılan kullanılır)" },
  { ad: "Klasör No",          aciklama: "Ofis klasör numarası" },
  { ad: "Dosya No",           aciklama: "Mahkeme dosya numarası" },
  { ad: "Başvuru/Esas No",    aciklama: "Başvuru veya esas numarası" },
  { ad: "Taraf 1",            aciklama: "Birinci taraf adı (Klasör No veya Dosya No ile en az biri zorunlu)" },
  { ad: "Taraf 2",            aciklama: "İkinci taraf adı" },
  { ad: "Mahkeme/Merkez",     aciklama: "Mahkeme veya arabuluculuk merkezi adı" },
  { ad: "Konu",               aciklama: "Davanın konusu" },
  { ad: "Sonuç",              aciklama: "Dava sonucu (opsiyonel)" },
  { ad: "Durum",              aciklama: "ACIK | KAPALI | ITIRAZ | TEMYIZ | ASKIDA | INFAZ | ARSIV" },
  { ad: "Görev Tarihi",       aciklama: "YYYY-AA-GG formatında (örn: 2024-01-15)" },
  { ad: "Duruşma Tarihi",     aciklama: "YYYY-AA-GG formatında" },
  { ad: "Rapor Tarihi",       aciklama: "YYYY-AA-GG formatında" },
  { ad: "Notlar",             aciklama: "Serbest metin notlar" },
];

// ─── Yardımcı: dosya boyutu formatla ────────────────────────────────────────
function formatBoyut(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Ana Sayfa ──────────────────────────────────────────────────────────────
export default function DosyaImportPage() {
  const [sonuc, formAction, pending] = useActionState<ImportSonuc | null, FormData>(
    importDosyalar,
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [secilenDosya, setSecilenDosya] = useState<File | null>(null);
  const [surukleAktif, setSurukleAktif] = useState(false);
  const [sutunlarAcik, setSutunlarAcik] = useState(false);

  // Dosya seçimi (input veya drag&drop)
  const dosyaAta = useCallback((file: File) => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") return;
    setSecilenDosya(file);
    // input.files'ı da güncelle (form submit için)
    if (inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      inputRef.current.files = dt.files;
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setSurukleAktif(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setSurukleAktif(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setSurukleAktif(false);
    const file = e.dataTransfer.files[0];
    if (file) dosyaAta(file);
  }, [dosyaAta]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) dosyaAta(file);
  }, [dosyaAta]);

  const dosyayiKaldir = useCallback(() => {
    setSecilenDosya(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const basariYuzdesi = sonuc && sonuc.toplam > 0
    ? Math.round((sonuc.basarili / sonuc.toplam) * 100)
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Geri */}
      <div className="flex items-center gap-4">
        <Link href="/dosyalar">
          <Button variant="ghost" size="sm" className="text-slate-500">
            <ArrowLeft className="w-4 h-4 mr-1" /> Geri
          </Button>
        </Link>
      </div>

      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Toplu Dosya Yükle</h1>
        <p className="text-slate-500 mt-1 text-sm">
          CSV şablonunu doldurarak yüzlerce dosyayı tek seferde sisteme aktarın.
        </p>
      </div>

      {/* Adımlar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { num: "1", title: "Şablonu İndir",  desc: "CSV formatını ve örnek veriyi al" },
          { num: "2", title: "Doldurun",        desc: "Excel veya metin editörüyle düzenle" },
          { num: "3", title: "Yükleyin",        desc: "Sürükle-bırak veya tıklayarak aktar" },
        ].map((s) => (
          <div key={s.num} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
              style={{ backgroundColor: "#1B2A4A" }}
            >{s.num}</span>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{s.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Şablon İndir + Sütun Kılavuzu */}
      <div className="bg-white rounded-xl border-2 p-5 space-y-4" style={{ borderColor: "#D4AF37" }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-semibold text-slate-800">CSV Şablonu — 14 Sütun</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Kategori Adı, tüm tarihler (YYYY-AA-GG), Durum kodu dahil eksiksiz şablon.
            </p>
          </div>
          <button
            onClick={sablonIndir}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: "#D4AF37" }}
          >
            <Download className="w-4 h-4" />
            Şablon İndir
          </button>
        </div>

        {/* Sütun kılavuzunu aç/kapat */}
        <button
          type="button"
          onClick={() => setSutunlarAcik((v) => !v)}
          className="text-xs font-medium flex items-center gap-1 transition-colors"
          style={{ color: "#B8962A" }}
        >
          <span>{sutunlarAcik ? "▾" : "▸"}</span>
          {sutunlarAcik ? "Sütun kılavuzunu gizle" : "Sütun kılavuzunu göster (14 alan)"}
        </button>

        {sutunlarAcik && (
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="text-left px-3 py-2 font-semibold text-slate-600 w-6">#</th>
                  <th className="text-left px-3 py-2 font-semibold text-slate-600">Sütun Adı</th>
                  <th className="text-left px-3 py-2 font-semibold text-slate-600">Açıklama</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SUTUNLAR.map((s, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="px-3 py-1.5 text-slate-400 font-mono">{i + 1}</td>
                    <td className="px-3 py-1.5 font-medium text-slate-800 whitespace-nowrap">{s.ad}</td>
                    <td className="px-3 py-1.5 text-slate-500">{s.aciklama}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Drag & Drop Upload Alanı ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="font-semibold text-slate-800">CSV Dosyası Yükle</h3>
        <form action={formAction} className="space-y-4">
          {/* Drop Zone */}
          {!secilenDosya ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className="relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200"
              style={{
                borderColor: surukleAktif ? "#D4AF37" : "#CBD5E1",
                backgroundColor: surukleAktif ? "#D4AF3708" : "transparent",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors"
                style={{ backgroundColor: surukleAktif ? "#D4AF3720" : "#F1F5F9" }}
              >
                <Upload
                  className="w-7 h-7 transition-colors"
                  style={{ color: surukleAktif ? "#D4AF37" : "#94A3B8" }}
                />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {surukleAktif ? "Bırakın!" : "CSV dosyasını buraya sürükleyin"}
              </p>
              <p className="text-xs text-slate-400 mt-1">veya tıklayarak seçin · Maksimum 10 MB</p>

              {surukleAktif && (
                <div
                  className="absolute inset-0 rounded-xl border-2 pointer-events-none"
                  style={{ borderColor: "#D4AF37" }}
                />
              )}
            </div>
          ) : (
            /* Seçili Dosya Kartı */
            <div
              className="flex items-center gap-4 p-4 rounded-xl border-2"
              style={{ borderColor: "#D4AF37", backgroundColor: "#D4AF3708" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#D4AF3720" }}
              >
                <FileText className="w-6 h-6" style={{ color: "#B8962A" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{secilenDosya.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{formatBoyut(secilenDosya.size)} · CSV</p>
              </div>
              <button
                type="button"
                onClick={dosyayiKaldir}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex-shrink-0 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Gizli Input */}
          <input
            ref={inputRef}
            type="file"
            name="csv_dosya"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleInputChange}
          />

          {/* Gönder Butonu */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              Hatalı satırlar atlanır, geçerli satırlar eklenir.
            </p>
            <Button
              type="submit"
              disabled={pending || !secilenDosya}
              className="text-white font-semibold gap-2"
              style={{ backgroundColor: secilenDosya ? "#1B2A4A" : undefined }}
            >
              <Upload className="w-4 h-4" />
              {pending ? "Aktarılıyor..." : "İçe Aktar"}
            </Button>
          </div>
        </form>
      </div>

      {/* ─── Sonuç Paneli ──────────────────────────────────────────────────── */}
      {sonuc && (
        <div className="space-y-4">
          {/* Özet Kartlar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Toplam Satır</p>
              <p className="text-2xl font-bold text-slate-800">{sonuc.toplam}</p>
            </div>
            <div
              className="rounded-xl border p-4 text-center"
              style={{
                backgroundColor: sonuc.basarili > 0 ? "#ECFDF5" : "#F8FAFC",
                borderColor: sonuc.basarili > 0 ? "#A7F3D0" : "#E2E8F0",
              }}
            >
              <p className="text-xs font-medium uppercase tracking-wide mb-1"
                style={{ color: sonuc.basarili > 0 ? "#065F46" : "#64748B" }}>
                Başarıyla Eklendi
              </p>
              <p className="text-2xl font-bold" style={{ color: sonuc.basarili > 0 ? "#059669" : "#CBD5E1" }}>
                {sonuc.basarili}
              </p>
            </div>
            <div
              className="rounded-xl border p-4 text-center"
              style={{
                backgroundColor: sonuc.hatalar.length > 0 ? "#FEF2F2" : "#F8FAFC",
                borderColor: sonuc.hatalar.length > 0 ? "#FECACA" : "#E2E8F0",
              }}
            >
              <p className="text-xs font-medium uppercase tracking-wide mb-1"
                style={{ color: sonuc.hatalar.length > 0 ? "#991B1B" : "#64748B" }}>
                Atlanan Satır
              </p>
              <p className="text-2xl font-bold" style={{ color: sonuc.hatalar.length > 0 ? "#DC2626" : "#CBD5E1" }}>
                {sonuc.hatalar.length}
              </p>
            </div>
          </div>

          {/* İlerleme çubuğu */}
          {sonuc.toplam > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">Aktarım Oranı</span>
                <span className="font-bold" style={{ color: basariYuzdesi === 100 ? "#059669" : "#1B2A4A" }}>
                  %{basariYuzdesi}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${basariYuzdesi}%`,
                    backgroundColor: basariYuzdesi === 100 ? "#10B981" : "#D4AF37",
                  }}
                />
              </div>
              {sonuc.basarili > 0 && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {sonuc.basarili} dosya başarıyla sisteme eklendi.
                </p>
              )}
            </div>
          )}

          {/* Hata Listesi */}
          {sonuc.hatalar.length > 0 && (
            <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
              <div className="px-4 py-3 bg-red-50 border-b border-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-sm font-semibold text-red-700">
                  Atlanılan Satırlar ({sonuc.hatalar.length})
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {sonuc.hatalar.map((h, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-start gap-3">
                    {h.satir > 0 ? (
                      <span className="inline-flex items-center justify-center px-2 h-5 rounded text-xs font-mono font-semibold bg-red-100 text-red-700 flex-shrink-0 mt-0.5 whitespace-nowrap">
                        Satır {h.satir}
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center px-2 h-5 rounded text-xs font-semibold bg-slate-100 text-slate-600 flex-shrink-0 mt-0.5">
                        Genel
                      </span>
                    )}
                    <span className="text-sm text-slate-700">{h.mesaj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aksiyon Butonları */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {sonuc.basarili > 0 ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-700">
                  {sonuc.basarili} dosya eklendi
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-500">Hiç dosya eklenemedi</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  dosyayiKaldir();
                  window.location.reload();
                }}
              >
                Yeni Aktarım
              </Button>
              {sonuc.basarili > 0 && (
                <Link href="/dosyalar">
                  <Button className="text-white" style={{ backgroundColor: "#1B2A4A" }}>
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Dosyalara Git
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

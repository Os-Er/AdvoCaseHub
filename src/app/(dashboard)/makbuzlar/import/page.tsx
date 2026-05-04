"use client";

import { DataUploader } from "@/components/import/data-uploader";
import { importMakbuzlar } from "@/lib/actions/import-makbuzlar";

const SUTUNLAR = [
  { ad: "Makbuz No",       aciklama: "Makbuz numarası (serbest metin)",                             zorunlu: false },
  { ad: "Dosya No",        aciklama: "Bağlanacak dosyanın Dosya No, Klasör No veya Başvuru No'su",  zorunlu: false },
  { ad: "Makbuz Miktarı",  aciklama: "Toplam makbuz tutarı, ondalık için nokta veya virgül",        zorunlu: true  },
  { ad: "Makbuz Tarihi",   aciklama: "YYYY-AA-GG formatında (örn: 2024-03-15)",                     zorunlu: true  },
  { ad: "Ödenen Miktar",   aciklama: "Bugüne kadar tahsil edilen tutar",                            zorunlu: false },
  { ad: "Ödeme Tarihi",    aciklama: "YYYY-AA-GG formatında",                                       zorunlu: false },
  { ad: "Notlar",          aciklama: "Serbest not alanı",                                           zorunlu: false },
  { ad: "Manuel Onay",     aciklama: "EVET veya HAYIR — 'EVET' girilirse durum otomatik ODENDI",    zorunlu: false },
];

const SABLON_SATIRLARI = [
  "Makbuz No,Dosya No,Makbuz Miktarı,Makbuz Tarihi,Ödenen Miktar,Ödeme Tarihi,Notlar,Manuel Onay",
  "MKB-2024-001,D-1234,5000.00,2024-03-15,2500.00,2024-04-01,İlk ödeme alındı,HAYIR",
  "MKB-2024-002,,3000.00,2024-03-20,,,Dosya bağlantısı yok,HAYIR",
  "MKB-2024-003,E-456/2024,8000.00,2024-04-01,8000.00,2024-04-01,Tam ödeme,EVET",
];

function sablonIndir() {
  const icerik = SABLON_SATIRLARI.join("\r\n");
  const blob = new Blob(["﻿" + icerik], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "makbuz_import_sablonu.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function MakbuzImportPage() {
  return (
    <DataUploader
      action={importMakbuzlar}
      baslik="Makbuzları İçe Aktar"
      aciklama="CSV dosyası ile toplu makbuz yükleyin. Dosya No sütununa değer girilen satırlar otomatik olarak ilgili dosyayla ilişkilendirilir."
      sablonIndir={sablonIndir}
      sablonAciklama="Zorunlu sütunlar: Makbuz Miktarı ve Makbuz Tarihi. Dosya No girilirse eşleştirme yapılır, girilmezse bağımsız makbuz oluşturulur."
      sutunlar={SUTUNLAR}
      geriHref="/makbuzlar"
      listHref="/makbuzlar"
      listButonMetni="Makbuzlara Git"
    />
  );
}

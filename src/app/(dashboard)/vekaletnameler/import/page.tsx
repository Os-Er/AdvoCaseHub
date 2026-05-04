"use client";

import { DataUploader } from "@/components/import/data-uploader";
import { importVekaletnameler } from "@/lib/actions/import-vekaletnameler";

const SUTUNLAR = [
  { ad: "Vekâlet Veren",      aciklama: "Müvekkil adı veya kurum (zorunlu)",                              zorunlu: true  },
  { ad: "Vekaletname No",     aciklama: "Vekâletname numarası (serbest metin)",                           zorunlu: false },
  { ad: "Tür",                aciklama: "Vekâletname türü (örn: Genel, Özel, Dava)",                      zorunlu: false },
  { ad: "Düzenlenme Tarihi",  aciklama: "YYYY-AA-GG formatında (örn: 2024-01-10) — zorunlu",              zorunlu: true  },
  { ad: "Bitiş Tarihi",       aciklama: "YYYY-AA-GG formatında, boş bırakılabilir",                       zorunlu: false },
  { ad: "Dosya No",           aciklama: "Bağlanacak dosyanın Dosya No, Klasör No veya Başvuru No'su",     zorunlu: false },
  { ad: "Durum",              aciklama: "AKTIF | SONA_ERDI | IPTAL (boş girilirse AKTIF)",                zorunlu: false },
  { ad: "Notlar",             aciklama: "Serbest not alanı",                                              zorunlu: false },
];

const SABLON_SATIRLARI = [
  "Vekâlet Veren,Vekaletname No,Tür,Düzenlenme Tarihi,Bitiş Tarihi,Dosya No,Durum,Notlar",
  "Ahmet Yılmaz,VKL-2024-001,Genel,2024-01-10,2025-01-10,D-1234,AKTIF,Genel dava vekâleti",
  "Mehmet Kaya,VKL-2024-002,Özel,2024-02-15,,E-456/2024,AKTIF,",
  "Fatma Demir,VKL-2023-010,Dava,2023-06-01,2024-06-01,,SONA_ERDI,Süresi doldu",
];

function sablonIndir() {
  const icerik = SABLON_SATIRLARI.join("\r\n");
  const blob = new Blob(["﻿" + icerik], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vekaletname_import_sablonu.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function VekaletImportPage() {
  return (
    <DataUploader
      action={importVekaletnameler}
      baslik="Vekâletnameleri İçe Aktar"
      aciklama="CSV dosyası ile toplu vekâletname yükleyin. Dosya No sütununa değer girilen satırlar otomatik olarak ilgili dosyayla ilişkilendirilir."
      sablonIndir={sablonIndir}
      sablonAciklama="Zorunlu sütunlar: Vekâlet Veren ve Düzenlenme Tarihi. Dosya No girilirse eşleştirme yapılır, girilmezse bağımsız vekâletname oluşturulur."
      sutunlar={SUTUNLAR}
      geriHref="/vekaletnameler"
      listHref="/vekaletnameler"
      listButonMetni="Vekâletnamelere Git"
    />
  );
}

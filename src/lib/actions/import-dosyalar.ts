"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ImportHata = { satir: number; mesaj: string };

export type ImportSonuc = {
  basarili: number;
  hatalar: ImportHata[];
  toplam: number;
};

// CSV şablonunun sütun sırası (0-tabanlı)
// 0:Kategori Adı  1:Klasör No  2:Dosya No  3:Başvuru/Esas No
// 4:Taraf 1       5:Taraf 2    6:Mahkeme/Merkez  7:Konu
// 8:Sonuç         9:Durum      10:Görev Tarihi   11:Duruşma Tarihi
// 12:Rapor Tarihi 13:Notlar

const GECERLI_DURUMLAR = ["ACIK", "KAPALI", "ITIRAZ", "TEMYIZ", "ASKIDA", "INFAZ", "ARSIV"];

function str(kolonlar: string[], i: number): string | null {
  return kolonlar[i]?.trim() || null;
}

function tarihDogrula(deger: string | null, alan: string, satirNo: number): string | null {
  if (!deger) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deger)) {
    throw new Error(`"${alan}" YYYY-AA-GG formatında olmalı (örn: 2024-01-15), girilen: "${deger}"`);
  }
  const d = new Date(deger);
  if (isNaN(d.getTime())) throw new Error(`"${alan}" geçersiz tarih: "${deger}"`);
  return deger;
}

function parseCSVSatir(satir: string): string[] {
  const sonuc: string[] = [];
  let mevcut = "";
  let tırnakIcinde = false;

  for (let i = 0; i < satir.length; i++) {
    const c = satir[i];
    if (c === '"') {
      if (tırnakIcinde && satir[i + 1] === '"') { mevcut += '"'; i++; }
      else tırnakIcinde = !tırnakIcinde;
    } else if (c === "," && !tırnakIcinde) {
      sonuc.push(mevcut); mevcut = "";
    } else {
      mevcut += c;
    }
  }
  sonuc.push(mevcut);
  return sonuc;
}

export async function importDosyalar(
  _prev: ImportSonuc | null,
  formData: FormData
): Promise<ImportSonuc> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { basarili: 0, toplam: 0, hatalar: [{ satir: 0, mesaj: "Oturum bulunamadı." }] };

  // Tüm kategorileri yükle (sistem + kullanıcıya ait)
  const { data: tumKategoriler } = await supabase
    .from("kategoriler")
    .select("id, adi, user_id")
    .or(`user_id.is.null,user_id.eq.${user.id}`) as unknown as {
      data: { id: number; adi: string; user_id: string | null }[] | null;
    };

  // Kategori adı → id map'i (büyük/küçük harf duyarsız)
  const kategoriMap = new Map<string, number>();
  let varsayilanKategoriId: number | null = null;

  for (const k of tumKategoriler ?? []) {
    kategoriMap.set(k.adi.toLowerCase().trim(), k.id);
    if (k.user_id === null && varsayilanKategoriId === null) {
      varsayilanKategoriId = k.id; // ilk sistem kategorisi
    }
  }
  if (!varsayilanKategoriId && (tumKategoriler?.length ?? 0) > 0) {
    varsayilanKategoriId = tumKategoriler![0].id;
  }

  const dosya = formData.get("csv_dosya") as File;
  if (!dosya || dosya.size === 0) {
    return { basarili: 0, toplam: 0, hatalar: [{ satir: 0, mesaj: "Dosya seçilmedi veya boş." }] };
  }
  if (dosya.size > 10 * 1024 * 1024) {
    return { basarili: 0, toplam: 0, hatalar: [{ satir: 0, mesaj: "Dosya boyutu 10MB'ı aşıyor." }] };
  }

  const text = await dosya.text();
  const satirlar = text.split(/\r?\n/).filter((s) => s.trim().length > 0);

  if (satirlar.length < 2) {
    return { basarili: 0, toplam: 0, hatalar: [{ satir: 0, mesaj: "Dosya boş veya başlık satırı eksik." }] };
  }

  const veriSatirlari = satirlar.slice(1); // Başlık satırını atla
  const toplam = veriSatirlari.length;
  const hatalar: ImportHata[] = [];
  const eklenecekler: Record<string, unknown>[] = [];

  for (let i = 0; i < veriSatirlari.length; i++) {
    const satirNo = i + 2;
    const ham = veriSatirlari[i].trim();
    if (!ham) continue;

    const k = parseCSVSatir(ham);

    try {
      // Kategori eşleme
      const kategoriAdi = str(k, 0);
      let kategoriId: number | null = null;
      if (kategoriAdi) {
        kategoriId = kategoriMap.get(kategoriAdi.toLowerCase()) ?? null;
        if (!kategoriId) {
          hatalar.push({
            satir: satirNo,
            mesaj: `Kategori bulunamadı: "${kategoriAdi}". Mevcut kategoriler: ${[...kategoriMap.keys()].join(", ")}`,
          });
          continue;
        }
      }
      if (!kategoriId) {
        if (!varsayilanKategoriId) {
          hatalar.push({ satir: satirNo, mesaj: "Kategori belirtilmedi ve varsayılan kategori bulunamadı." });
          continue;
        }
        kategoriId = varsayilanKategoriId;
      }

      // Alanlar
      const klasorNo  = str(k, 1);
      const dosyaNo   = str(k, 2);
      const basvuruNo = str(k, 3);
      const taraf1    = str(k, 4);
      const taraf2    = str(k, 5);
      const mahkeme   = str(k, 6);
      const konu      = str(k, 7);
      const sonuc     = str(k, 8);
      const durumHam  = (str(k, 9) ?? "ACIK").toUpperCase();
      const gorevTar  = str(k, 10);
      const durusmaTar = str(k, 11);
      const raporTar  = str(k, 12);
      const notlar    = str(k, 13);

      // Zorunlu alan kontrolü
      if (!taraf1 && !klasorNo && !dosyaNo) {
        hatalar.push({ satir: satirNo, mesaj: "En az Taraf 1, Klasör No veya Dosya No alanlarından biri zorunlu." });
        continue;
      }

      // Durum doğrulama
      if (!GECERLI_DURUMLAR.includes(durumHam)) {
        hatalar.push({ satir: satirNo, mesaj: `Geçersiz durum: "${durumHam}". Geçerli değerler: ${GECERLI_DURUMLAR.join(" | ")}` });
        continue;
      }

      // Tarih doğrulama
      const gorev   = tarihDogrula(gorevTar,   "Görev Tarihi",   satirNo);
      const durusma = tarihDogrula(durusmaTar,  "Duruşma Tarihi", satirNo);
      const rapor   = tarihDogrula(raporTar,    "Rapor Tarihi",   satirNo);

      eklenecekler.push({
        user_id:        user.id,
        kategori_id:    kategoriId,
        klasor_no:      klasorNo,
        dosya_no:       dosyaNo,
        basvuru_no:     basvuruNo,
        taraf_1:        taraf1,
        taraf_2:        taraf2,
        mahkeme_merkez: mahkeme,
        konu,
        sonuc,
        durum:          durumHam,
        gorev_tarihi:   gorev,
        durusma_tarihi: durusma,
        rapor_tarihi:   rapor,
        notlar,
      });
    } catch (err) {
      hatalar.push({ satir: satirNo, mesaj: `Satır ${satirNo}: ${(err as Error).message}` });
    }
  }

  if (eklenecekler.length === 0) {
    return { basarili: 0, toplam, hatalar };
  }

  // 50'şer batch'te ekle
  let basarili = 0;
  for (let i = 0; i < eklenecekler.length; i += 50) {
    const batch = eklenecekler.slice(i, i + 50);
    const { error } = await supabase.from("dosyalar").insert(batch) as unknown as {
      error: { message?: string; code?: string } | null;
    };
    if (error) {
      const baslangicSatir = i + 2;
      hatalar.push({ satir: baslangicSatir, mesaj: `Toplu ekleme hatası (satır ${baslangicSatir}-${baslangicSatir + batch.length - 1}): ${error.message}` });
    } else {
      basarili += batch.length;
    }
  }

  if (basarili > 0) {
    revalidatePath("/dosyalar");
    revalidatePath("/dashboard");
  }

  return { basarili, toplam, hatalar };
}

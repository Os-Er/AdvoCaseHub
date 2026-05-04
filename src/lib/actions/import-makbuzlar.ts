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
// 0:Makbuz No  1:Dosya No  2:Makbuz Miktarı  3:Makbuz Tarihi
// 4:Ödenen Miktar  5:Ödeme Tarihi  6:Notlar  7:Manuel Onay (EVET/HAYIR)

type MakbuzDurum = "BEKLENIYOR" | "KISMI" | "ODENDI";

function hesaplaDurum(makbuzMiktari: number, odemeMiktari: number | null, manuelOnay = false): MakbuzDurum {
  if (manuelOnay) return "ODENDI";
  if (!odemeMiktari || odemeMiktari <= 0) return "BEKLENIYOR";
  if (odemeMiktari >= makbuzMiktari) return "ODENDI";
  return "KISMI";
}

function str(kolonlar: string[], i: number): string | null {
  return kolonlar[i]?.trim() || null;
}

function parseNum(deger: string | null): number | null {
  if (!deger) return null;
  const n = parseFloat(deger.replace(",", ".").replace(/\s/g, ""));
  return isNaN(n) ? null : n;
}

function tarihDogrula(deger: string | null, alan: string): string | null {
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

export async function importMakbuzlar(
  _prev: ImportSonuc | null,
  formData: FormData
): Promise<ImportSonuc> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { basarili: 0, toplam: 0, hatalar: [{ satir: 0, mesaj: "Oturum bulunamadı." }] };

  // Kullanıcının dosyalarını yükle — birden fazla alanla eşleştirme için
  const { data: tumDosyalar } = await supabase
    .from("dosyalar")
    .select("id, dosya_no, klasor_no, basvuru_no")
    .eq("user_id", user.id) as unknown as {
      data: { id: string; dosya_no: string | null; klasor_no: string | null; basvuru_no: string | null }[] | null;
    };

  // Arama haritaları (ilk eşleşen dosyayı al, küçük harf normalize)
  const dosyaNoMap = new Map<string, string>();
  const klasorNoMap = new Map<string, string>();
  const basvuruNoMap = new Map<string, string>();

  for (const d of tumDosyalar ?? []) {
    if (d.dosya_no && !dosyaNoMap.has(d.dosya_no.toLowerCase()))
      dosyaNoMap.set(d.dosya_no.toLowerCase(), d.id);
    if (d.klasor_no && !klasorNoMap.has(d.klasor_no.toLowerCase()))
      klasorNoMap.set(d.klasor_no.toLowerCase(), d.id);
    if (d.basvuru_no && !basvuruNoMap.has(d.basvuru_no.toLowerCase()))
      basvuruNoMap.set(d.basvuru_no.toLowerCase(), d.id);
  }

  const dosya = formData.get("csv_dosya") as File;
  if (!dosya || dosya.size === 0)
    return { basarili: 0, toplam: 0, hatalar: [{ satir: 0, mesaj: "Dosya seçilmedi veya boş." }] };
  if (dosya.size > 10 * 1024 * 1024)
    return { basarili: 0, toplam: 0, hatalar: [{ satir: 0, mesaj: "Dosya boyutu 10MB'ı aşıyor." }] };

  const text = await dosya.text();
  const satirlar = text.split(/\r?\n/).filter((s) => s.trim().length > 0);

  if (satirlar.length < 2)
    return { basarili: 0, toplam: 0, hatalar: [{ satir: 0, mesaj: "Dosya boş veya başlık satırı eksik." }] };

  const veriSatirlari = satirlar.slice(1);
  const toplam = veriSatirlari.length;
  const hatalar: ImportHata[] = [];
  const eklenecekler: Record<string, unknown>[] = [];
  // Hangi index'teki kaydın hangi dosyayla eşleştiğini tut
  const dosyaBaglantilari: { index: number; dosyaId: string }[] = [];

  for (let i = 0; i < veriSatirlari.length; i++) {
    const satirNo = i + 2;
    const ham = veriSatirlari[i].trim();
    if (!ham) continue;

    const k = parseCSVSatir(ham);

    try {
      const makbuzNo = str(k, 0);
      const dosyaNoHam = str(k, 1);
      const makbuzMiktariStr = str(k, 2);
      const makbuzTarihi = str(k, 3);
      const odemeMiktariStr = str(k, 4);
      const odemeTarihi = str(k, 5);
      const notlar = str(k, 6);
      const manuelOnayStr = (str(k, 7) ?? "").toUpperCase();

      // Zorunlu alanlar
      if (!makbuzMiktariStr) {
        hatalar.push({ satir: satirNo, mesaj: "Makbuz Miktarı zorunludur." });
        continue;
      }
      if (!makbuzTarihi) {
        hatalar.push({ satir: satirNo, mesaj: "Makbuz Tarihi zorunludur." });
        continue;
      }

      const makbuzMiktari = parseNum(makbuzMiktariStr);
      if (!makbuzMiktari || makbuzMiktari <= 0) {
        hatalar.push({ satir: satirNo, mesaj: `Geçersiz Makbuz Miktarı: "${makbuzMiktariStr}". Sayısal değer giriniz.` });
        continue;
      }

      const odemeMiktari = parseNum(odemeMiktariStr);
      if (odemeMiktariStr && odemeMiktari === null) {
        hatalar.push({ satir: satirNo, mesaj: `Geçersiz Ödenen Miktar: "${odemeMiktariStr}". Sayısal değer giriniz.` });
        continue;
      }

      // Tarih doğrulama
      const makbuzTar = tarihDogrula(makbuzTarihi, "Makbuz Tarihi");
      const odemeTar = tarihDogrula(odemeTarihi, "Ödeme Tarihi");

      const manuelOnay = manuelOnayStr === "EVET" || manuelOnayStr === "E" || manuelOnayStr === "1" || manuelOnayStr === "TRUE";
      const durum = hesaplaDurum(makbuzMiktari, odemeMiktari, manuelOnay);

      // Dosya eşleştirme (opsiyonel)
      let eslesilenDosyaId: string | null = null;
      if (dosyaNoHam) {
        const anahtar = dosyaNoHam.toLowerCase();
        eslesilenDosyaId =
          dosyaNoMap.get(anahtar) ??
          klasorNoMap.get(anahtar) ??
          basvuruNoMap.get(anahtar) ??
          null;

        if (!eslesilenDosyaId) {
          hatalar.push({ satir: satirNo, mesaj: `Dosya bulunamadı: "${dosyaNoHam}". Dosya No, Klasör No veya Başvuru No ile eşleştirme yapılamadı.` });
          continue;
        }
      }

      const currentIndex = eklenecekler.length;
      eklenecekler.push({
        user_id: user.id,
        makbuz_no: makbuzNo,
        makbuz_miktari: makbuzMiktari,
        makbuz_tarihi: makbuzTar,
        odeme_miktari: odemeMiktari,
        odeme_tarihi: odemeTar,
        notlar,
        durum,
        manuel_odendi_onayi: manuelOnay,
      });

      if (eslesilenDosyaId) {
        dosyaBaglantilari.push({ index: currentIndex, dosyaId: eslesilenDosyaId });
      }
    } catch (err) {
      hatalar.push({ satir: satirNo, mesaj: (err as Error).message });
    }
  }

  if (eklenecekler.length === 0) {
    return { basarili: 0, toplam, hatalar };
  }

  // 50'şer batch'te ekle
  let basarili = 0;
  let insertedOffset = 0;

  for (let i = 0; i < eklenecekler.length; i += 50) {
    const batch = eklenecekler.slice(i, i + 50);
    const { data: eklenenler, error } = await supabase
      .from("makbuzlar")
      .insert(batch)
      .select("id") as unknown as { data: { id: string }[] | null; error: { message?: string; code?: string } | null };

    if (error || !eklenenler) {
      const baslangicSatir = i + 2;
      hatalar.push({ satir: baslangicSatir, mesaj: `Toplu ekleme hatası (satır ${baslangicSatir}-${baslangicSatir + batch.length - 1}): ${error?.message ?? "Bilinmeyen hata"}` });
      insertedOffset += batch.length;
      continue;
    }

    // Dosya bağlantılarını oluştur
    const junctionKayitlar: { makbuz_id: string; dosya_id: string }[] = [];
    for (const baglanti of dosyaBaglantilari) {
      const localIndex = baglanti.index - insertedOffset;
      if (localIndex >= 0 && localIndex < eklenenler.length) {
        junctionKayitlar.push({
          makbuz_id: eklenenler[localIndex].id,
          dosya_id: baglanti.dosyaId,
        });
      }
    }

    if (junctionKayitlar.length > 0) {
      await supabase.from("makbuz_dosya").insert(junctionKayitlar);
    }

    basarili += eklenenler.length;
    insertedOffset += batch.length;
  }

  if (basarili > 0) {
    revalidatePath("/makbuzlar");
    revalidatePath("/dashboard");
  }

  return { basarili, toplam, hatalar };
}

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
// 0:Vekâlet Veren  1:Vekaletname No  2:Tür  3:Düzenlenme Tarihi
// 4:Bitiş Tarihi   5:Dosya No        6:Durum (AKTIF/SONA_ERDI/IPTAL)  7:Notlar

const GECERLI_DURUMLAR = ["AKTIF", "SONA_ERDI", "IPTAL"];

function str(kolonlar: string[], i: number): string | null {
  return kolonlar[i]?.trim() || null;
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

export async function importVekaletnameler(
  _prev: ImportSonuc | null,
  formData: FormData
): Promise<ImportSonuc> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { basarili: 0, toplam: 0, hatalar: [{ satir: 0, mesaj: "Oturum bulunamadı." }] };

  // Kullanıcının dosyalarını yükle
  const { data: tumDosyalar } = await supabase
    .from("dosyalar")
    .select("id, dosya_no, klasor_no, basvuru_no")
    .eq("user_id", user.id) as unknown as {
      data: { id: string; dosya_no: string | null; klasor_no: string | null; basvuru_no: string | null }[] | null;
    };

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
  const dosyaBaglantilari: { index: number; dosyaId: string }[] = [];

  for (let i = 0; i < veriSatirlari.length; i++) {
    const satirNo = i + 2;
    const ham = veriSatirlari[i].trim();
    if (!ham) continue;

    const k = parseCSVSatir(ham);

    try {
      const vekaletVeren = str(k, 0);
      const vekaletNo = str(k, 1);
      const tur = str(k, 2);
      const vekaletTarihi = str(k, 3);
      const bitisTarihi = str(k, 4);
      const dosyaNoHam = str(k, 5);
      const durumHam = (str(k, 6) ?? "AKTIF").toUpperCase().trim();
      const notlar = str(k, 7);

      // Zorunlu alanlar
      if (!vekaletVeren) {
        hatalar.push({ satir: satirNo, mesaj: "Vekâlet Veren zorunludur." });
        continue;
      }
      if (!vekaletTarihi) {
        hatalar.push({ satir: satirNo, mesaj: "Düzenlenme Tarihi zorunludur." });
        continue;
      }

      // Durum doğrulama
      if (!GECERLI_DURUMLAR.includes(durumHam)) {
        hatalar.push({ satir: satirNo, mesaj: `Geçersiz durum: "${durumHam}". Geçerli değerler: ${GECERLI_DURUMLAR.join(" | ")}` });
        continue;
      }

      // Tarih doğrulama
      const vekaletTar = tarihDogrula(vekaletTarihi, "Düzenlenme Tarihi");
      const bitisTar = tarihDogrula(bitisTarihi, "Bitiş Tarihi");

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
        vekalet_veren: vekaletVeren,
        vekaletname_no: vekaletNo,
        turu: tur,
        vekaletname_tarihi: vekaletTar,
        bitis_tarihi: bitisTar,
        durum: durumHam,
        notlar,
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
      .from("vekaletnameler")
      .insert(batch)
      .select("id") as unknown as { data: { id: string }[] | null; error: { message?: string; code?: string } | null };

    if (error || !eklenenler) {
      const baslangicSatir = i + 2;
      hatalar.push({ satir: baslangicSatir, mesaj: `Toplu ekleme hatası (satır ${baslangicSatir}-${baslangicSatir + batch.length - 1}): ${error?.message ?? "Bilinmeyen hata"}` });
      insertedOffset += batch.length;
      continue;
    }

    // Dosya bağlantılarını oluştur
    const junctionKayitlar: { vekaletname_id: string; dosya_id: string }[] = [];
    for (const baglanti of dosyaBaglantilari) {
      const localIndex = baglanti.index - insertedOffset;
      if (localIndex >= 0 && localIndex < eklenenler.length) {
        junctionKayitlar.push({
          vekaletname_id: eklenenler[localIndex].id,
          dosya_id: baglanti.dosyaId,
        });
      }
    }

    if (junctionKayitlar.length > 0) {
      await supabase.from("vekaletname_dosya").insert(junctionKayitlar);
    }

    basarili += eklenenler.length;
    insertedOffset += batch.length;
  }

  if (basarili > 0) {
    revalidatePath("/vekaletnameler");
    revalidatePath("/dashboard");
  }

  return { basarili, toplam, hatalar };
}

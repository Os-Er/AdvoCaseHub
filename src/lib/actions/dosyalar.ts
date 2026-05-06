"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { DosyaDurum, DosyaTip } from "@/lib/types/database";

export type DosyaActionState =
  | { error: string }
  | { success: true; id: string }
  | null;

function formStr(fd: FormData, key: string): string | null {
  const v = (fd.get(key) as string)?.trim();
  return v || null;
}

function formDate(fd: FormData, key: string): string | null {
  const v = fd.get(key) as string;
  return v || null;
}

// Taraf satırlarını kaydet (delete + reinsert)
async function saveTaraflar(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  dosyaId: string,
  userId: string,
  taraflarJson: string | null
) {
  await supabase
    .from("dosya_taraflari")
    .delete()
    .eq("dosya_id", dosyaId)
    .eq("user_id", userId);

  if (!taraflarJson) return;
  try {
    const taraflar: { ad: string; rol: string }[] = JSON.parse(taraflarJson);
    const rows = taraflar
      .filter((t) => t.ad?.trim())
      .map((t, i) => ({
        dosya_id: dosyaId,
        user_id: userId,
        ad: t.ad.trim(),
        rol: t.rol || null,
        sira: i,
      }));
    if (rows.length > 0) {
      await supabase.from("dosya_taraflari").insert(rows);
    }
  } catch {
    // geçersiz JSON — sessizce geç
  }
}

// Tüm dosya path'lerini revalidate et
function revalidateAll(id?: string) {
  revalidatePath("/dosyalar/hukuk");
  revalidatePath("/dosyalar/hukuk/arsiv");
  revalidatePath("/dosyalar/ceza");
  revalidatePath("/dosyalar/ceza/arsiv");
  revalidatePath("/dosyalar/icra");
  revalidatePath("/dosyalar/icra/arsiv");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/dosyalar/${id}`);
}

// ─── CREATE ─────────────────────────────────────────────────────────────────

export async function createDosya(
  _prev: DosyaActionState,
  formData: FormData
): Promise<DosyaActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const tip = (formData.get("tip") as DosyaTip) || "HUKUK";

  const { data: dosya, error } = await supabase
    .from("dosyalar")
    .insert({
      user_id: user.id,
      kategori_id: Number(formData.get("kategori_id")),
      tip,
      klasor_no: formStr(formData, "klasor_no"),
      dosya_no: formStr(formData, "dosya_no"),
      basvuru_no: formStr(formData, "basvuru_no"),
      taraf_1: formStr(formData, "taraf_1"),
      taraf_2: formStr(formData, "taraf_2"),
      mahkeme_merkez: formStr(formData, "mahkeme_merkez"),
      konu: formStr(formData, "konu"),
      gorev_tarihi: formDate(formData, "gorev_tarihi"),
      durusma_tarihi: formDate(formData, "durusma_tarihi"),
      rapor_tarihi: formDate(formData, "rapor_tarihi"),
      sonuc: formStr(formData, "sonuc"),
      notlar: formStr(formData, "notlar"),
      durum: (formData.get("durum") as DosyaDurum) || "ACIK",
    })
    .select("id")
    .single() as unknown as { data: { id: string } | null; error: { code?: string; message: string } | null };

  if (error) {
    if (error.code === "23505") return { error: "Bu numara zaten başka bir dosyada kayıtlı." };
    return { error: error.message };
  }
  if (!dosya) return { error: "Kayıt oluşturulamadı." };

  await saveTaraflar(supabase, dosya.id, user.id, formData.get("taraflar_json") as string | null);

  revalidateAll(dosya.id);
  return { success: true, id: dosya.id };
}

// ─── UPDATE ─────────────────────────────────────────────────────────────────

export async function updateDosya(
  id: string,
  _prev: DosyaActionState,
  formData: FormData
): Promise<DosyaActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("dosyalar")
    .update({
      kategori_id: Number(formData.get("kategori_id")),
      klasor_no: formStr(formData, "klasor_no"),
      dosya_no: formStr(formData, "dosya_no"),
      basvuru_no: formStr(formData, "basvuru_no"),
      taraf_1: formStr(formData, "taraf_1"),
      taraf_2: formStr(formData, "taraf_2"),
      mahkeme_merkez: formStr(formData, "mahkeme_merkez"),
      konu: formStr(formData, "konu"),
      gorev_tarihi: formDate(formData, "gorev_tarihi"),
      durusma_tarihi: formDate(formData, "durusma_tarihi"),
      rapor_tarihi: formDate(formData, "rapor_tarihi"),
      sonuc: formStr(formData, "sonuc"),
      notlar: formStr(formData, "notlar"),
      durum: formData.get("durum") as DosyaDurum,
    })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { code?: string; message: string } | null };

  if (error) {
    if (error.code === "23505") return { error: "Bu numara zaten başka bir dosyada kayıtlı." };
    return { error: error.message };
  }

  await saveTaraflar(supabase, id, user.id, formData.get("taraflar_json") as string | null);

  revalidateAll(id);
  return { success: true, id };
}

// ─── ARŞİVLE ────────────────────────────────────────────────────────────────

export async function arsivleDosya(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("dosyalar")
    .update({ arsivlendi: true })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };

  revalidateAll(id);
  return { success: true };
}

// ─── ARŞİVDEN ÇIKAR ─────────────────────────────────────────────────────────

export async function arsivdenCikarDosya(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("dosyalar")
    .update({ arsivlendi: false })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };

  revalidateAll(id);
  return { success: true };
}

// ─── SİL (Sadece arşivdeki kayıtlar) ────────────────────────────────────────

export async function deleteDosya(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  // Güvenlik: sadece arsivlendi=true olan kayıtlar silinebilir
  const { data: dosya } = await supabase
    .from("dosyalar")
    .select("id, arsivlendi")
    .eq("id", id)
    .eq("user_id", user.id)
    .single() as unknown as { data: { id: string; arsivlendi: boolean } | null };

  if (!dosya) return { error: "Dosya bulunamadı." };
  if (!dosya.arsivlendi) return { error: "Kalıcı silme için önce dosyayı arşivleyin." };

  await supabase.from("dosyalar").delete().eq("id", id).eq("user_id", user.id);

  revalidateAll();
  return { success: true };
}

// ─── DURUM GÜNCELLE ─────────────────────────────────────────────────────────

export async function updateDosyaDurum(
  id: string,
  durum: DosyaDurum
): Promise<{ success: true; id: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  await supabase.from("dosyalar").update({ durum }).eq("id", id).eq("user_id", user.id);
  revalidateAll(id);
  return { success: true, id };
}

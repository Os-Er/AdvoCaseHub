"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { DosyaDurum } from "@/lib/types/database";

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

export async function createDosya(
  _prev: DosyaActionState,
  formData: FormData
): Promise<DosyaActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { data: dosya, error } = await supabase
    .from("dosyalar")
    .insert({
      user_id: user.id,
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
      durum: (formData.get("durum") as DosyaDurum) || "ACIK",
    })
    .select("id")
    .single() as unknown as { data: { id: string } | null; error: { code?: string; message: string } | null };

  if (error) {
    if (error.code === "23505") return { error: "Bu numara zaten başka bir dosyada kayıtlı." };
    return { error: error.message };
  }
  if (!dosya) return { error: "Kayıt oluşturulamadı." };

  revalidatePath("/dosyalar");
  revalidatePath("/dashboard");
  return { success: true, id: dosya.id };
}

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

  revalidatePath("/dosyalar");
  revalidatePath(`/dosyalar/${id}`);
  revalidatePath("/dashboard");
  return { success: true, id };
}

export async function deleteDosya(id: string): Promise<{ success: true } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  await supabase.from("dosyalar").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/dosyalar");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateDosyaDurum(
  id: string,
  durum: DosyaDurum
): Promise<{ success: true; id: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  await supabase.from("dosyalar").update({ durum }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/dosyalar");
  revalidatePath(`/dosyalar/${id}`);
  revalidatePath("/dashboard");
  return { success: true, id };
}

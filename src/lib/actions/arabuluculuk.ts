"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ArabuluculukDurum, ArabuluculukSonuc } from "@/lib/types/database";

export type ArabuluculukActionState =
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

function revalidateAll(id?: string) {
  revalidatePath("/arabuluculuk");
  revalidatePath("/arabuluculuk/arsiv");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/arabuluculuk/${id}`);
}

// ─── CREATE ─────────────────────────────────────────────────────────────────

export async function createArabuluculuk(
  _prev: ArabuluculukActionState,
  formData: FormData
): Promise<ArabuluculukActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { data, error } = await supabase
    .from("arabuluculuk")
    .insert({
      user_id:        user.id,
      basvuru_no:     formStr(formData, "basvuru_no"),
      basvuran:       formStr(formData, "basvuran"),
      karsi_taraf:    formStr(formData, "karsi_taraf"),
      arabulucu_adi:  formStr(formData, "arabulucu_adi"),
      basvuru_tarihi: formDate(formData, "basvuru_tarihi"),
      gorusme_tarihi: formDate(formData, "gorusme_tarihi"),
      konu:           formStr(formData, "konu"),
      sonuc:          (formData.get("sonuc") as ArabuluculukSonuc) || null,
      durum:          (formData.get("durum") as ArabuluculukDurum) || "DEVAM",
      notlar:         formStr(formData, "notlar"),
    })
    .select("id")
    .single() as unknown as { data: { id: string } | null; error: { message: string } | null };

  if (error) return { error: error.message };
  if (!data) return { error: "Kayıt oluşturulamadı." };

  revalidateAll(data.id);
  return { success: true, id: data.id };
}

// ─── UPDATE ─────────────────────────────────────────────────────────────────

export async function updateArabuluculuk(
  id: string,
  _prev: ArabuluculukActionState,
  formData: FormData
): Promise<ArabuluculukActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("arabuluculuk")
    .update({
      basvuru_no:     formStr(formData, "basvuru_no"),
      basvuran:       formStr(formData, "basvuran"),
      karsi_taraf:    formStr(formData, "karsi_taraf"),
      arabulucu_adi:  formStr(formData, "arabulucu_adi"),
      basvuru_tarihi: formDate(formData, "basvuru_tarihi"),
      gorusme_tarihi: formDate(formData, "gorusme_tarihi"),
      konu:           formStr(formData, "konu"),
      sonuc:          (formData.get("sonuc") as ArabuluculukSonuc) || null,
      durum:          (formData.get("durum") as ArabuluculukDurum) || "DEVAM",
      notlar:         formStr(formData, "notlar"),
    })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };

  revalidateAll(id);
  return { success: true, id };
}

// ─── ARŞİVLE ────────────────────────────────────────────────────────────────

export async function arsivleArabuluculuk(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("arabuluculuk")
    .update({ arsivlendi: true })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };
  revalidateAll(id);
  return { success: true };
}

// ─── ARŞİVDEN ÇIKAR ─────────────────────────────────────────────────────────

export async function arsivdenCikarArabuluculuk(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("arabuluculuk")
    .update({ arsivlendi: false })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };
  revalidateAll(id);
  return { success: true };
}

// ─── SİL (Sadece arşivden) ───────────────────────────────────────────────────

export async function deleteArabuluculuk(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { data } = await supabase
    .from("arabuluculuk")
    .select("id, arsivlendi")
    .eq("id", id)
    .eq("user_id", user.id)
    .single() as unknown as { data: { id: string; arsivlendi: boolean } | null };

  if (!data) return { error: "Kayıt bulunamadı." };
  if (!data.arsivlendi) return { error: "Kalıcı silme için önce arşivleyin." };

  await supabase.from("arabuluculuk").delete().eq("id", id).eq("user_id", user.id);
  revalidateAll();
  return { success: true };
}

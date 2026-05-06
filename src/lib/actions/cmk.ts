"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CmkDurum, CmkSureTipi } from "@/lib/types/database";

export type CmkActionState =
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
  revalidatePath("/cmk");
  revalidatePath("/cmk/arsiv");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/cmk/${id}`);
}

// ─── CREATE ─────────────────────────────────────────────────────────────────

export async function createCmkIslem(
  _prev: CmkActionState,
  formData: FormData
): Promise<CmkActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { data, error } = await supabase
    .from("cmk_islemleri")
    .insert({
      user_id:       user.id,
      baro_atama_no: formStr(formData, "baro_atama_no"),
      atama_tarihi:  formDate(formData, "atama_tarihi"),
      muvekkil_adi:  formStr(formData, "muvekkil_adi"),
      // suc_isnadı — Türkçe karakter, DB kolonuyla eşleşmeli
      "suc_isnadı":  formStr(formData, "suc_isnadı"),
      sure_tipi:     (formData.get("sure_tipi") as CmkSureTipi) || null,
      merci:         formStr(formData, "merci"),
      dosya_no:      formStr(formData, "dosya_no"),
      durum:         (formData.get("durum") as CmkDurum) || "DEVAM",
      notlar:        formStr(formData, "notlar"),
    })
    .select("id")
    .single() as unknown as { data: { id: string } | null; error: { message: string } | null };

  if (error) return { error: error.message };
  if (!data) return { error: "Kayıt oluşturulamadı." };

  revalidateAll(data.id);
  return { success: true, id: data.id };
}

// ─── UPDATE ─────────────────────────────────────────────────────────────────

export async function updateCmkIslem(
  id: string,
  _prev: CmkActionState,
  formData: FormData
): Promise<CmkActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("cmk_islemleri")
    .update({
      baro_atama_no: formStr(formData, "baro_atama_no"),
      atama_tarihi:  formDate(formData, "atama_tarihi"),
      muvekkil_adi:  formStr(formData, "muvekkil_adi"),
      "suc_isnadı":  formStr(formData, "suc_isnadı"),
      sure_tipi:     (formData.get("sure_tipi") as CmkSureTipi) || null,
      merci:         formStr(formData, "merci"),
      dosya_no:      formStr(formData, "dosya_no"),
      durum:         (formData.get("durum") as CmkDurum) || "DEVAM",
      notlar:        formStr(formData, "notlar"),
    })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };

  revalidateAll(id);
  return { success: true, id };
}

// ─── ARŞİVLE ────────────────────────────────────────────────────────────────

export async function arsivleCmkIslem(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("cmk_islemleri")
    .update({ arsivlendi: true })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };
  revalidateAll(id);
  return { success: true };
}

// ─── ARŞİVDEN ÇIKAR ─────────────────────────────────────────────────────────

export async function arsivdenCikarCmkIslem(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("cmk_islemleri")
    .update({ arsivlendi: false })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };
  revalidateAll(id);
  return { success: true };
}

// ─── SİL (Sadece arşivden) ───────────────────────────────────────────────────

export async function deleteCmkIslem(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { data } = await supabase
    .from("cmk_islemleri")
    .select("id, arsivlendi")
    .eq("id", id)
    .eq("user_id", user.id)
    .single() as unknown as { data: { id: string; arsivlendi: boolean } | null };

  if (!data) return { error: "Kayıt bulunamadı." };
  if (!data.arsivlendi) return { error: "Kalıcı silme için önce arşivleyin." };

  await supabase.from("cmk_islemleri").delete().eq("id", id).eq("user_id", user.id);
  revalidateAll();
  return { success: true };
}

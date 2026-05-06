"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { DanismanlikDurum, DanismanlikTur } from "@/lib/types/database";

export type DanismanlikActionState =
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

function formNum(fd: FormData, key: string): number | null {
  const v = (fd.get(key) as string)?.trim();
  if (!v) return null;
  const n = parseFloat(v.replace(",", "."));
  return isNaN(n) || n < 0 ? null : n;
}

function revalidateAll(id?: string) {
  revalidatePath("/danismanlik");
  revalidatePath("/danismanlik/arsiv");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/danismanlik/${id}`);
}

// ─── CREATE ─────────────────────────────────────────────────────────────────

export async function createDanismanlik(
  _prev: DanismanlikActionState,
  formData: FormData
): Promise<DanismanlikActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { data, error } = await supabase
    .from("danismanlik")
    .insert({
      user_id:          user.id,
      muvekkil:         formStr(formData, "muvekkil"),
      tur:              (formData.get("tur") as DanismanlikTur) || null,
      sozlesme_no:      formStr(formData, "sozlesme_no"),
      baslangic_tarihi: formDate(formData, "baslangic_tarihi"),
      bitis_tarihi:     formDate(formData, "bitis_tarihi"),
      ucret:            formNum(formData, "ucret"),
      konu:             formStr(formData, "konu"),
      durum:            (formData.get("durum") as DanismanlikDurum) || "AKTIF",
      notlar:           formStr(formData, "notlar"),
    })
    .select("id")
    .single() as unknown as { data: { id: string } | null; error: { message: string } | null };

  if (error) return { error: error.message };
  if (!data) return { error: "Kayıt oluşturulamadı." };

  revalidateAll(data.id);
  return { success: true, id: data.id };
}

// ─── UPDATE ─────────────────────────────────────────────────────────────────

export async function updateDanismanlik(
  id: string,
  _prev: DanismanlikActionState,
  formData: FormData
): Promise<DanismanlikActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("danismanlik")
    .update({
      muvekkil:         formStr(formData, "muvekkil"),
      tur:              (formData.get("tur") as DanismanlikTur) || null,
      sozlesme_no:      formStr(formData, "sozlesme_no"),
      baslangic_tarihi: formDate(formData, "baslangic_tarihi"),
      bitis_tarihi:     formDate(formData, "bitis_tarihi"),
      ucret:            formNum(formData, "ucret"),
      konu:             formStr(formData, "konu"),
      durum:            (formData.get("durum") as DanismanlikDurum) || "AKTIF",
      notlar:           formStr(formData, "notlar"),
    })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };

  revalidateAll(id);
  return { success: true, id };
}

// ─── ARŞİVLE ────────────────────────────────────────────────────────────────

export async function arsivleDanismanlik(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("danismanlik")
    .update({ arsivlendi: true })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };
  revalidateAll(id);
  return { success: true };
}

// ─── ARŞİVDEN ÇIKAR ─────────────────────────────────────────────────────────

export async function arsivdenCikarDanismanlik(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("danismanlik")
    .update({ arsivlendi: false })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };
  revalidateAll(id);
  return { success: true };
}

// ─── SİL (Sadece arşivden) ───────────────────────────────────────────────────

export async function deleteDanismanlik(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { data } = await supabase
    .from("danismanlik")
    .select("id, arsivlendi")
    .eq("id", id)
    .eq("user_id", user.id)
    .single() as unknown as { data: { id: string; arsivlendi: boolean } | null };

  if (!data) return { error: "Kayıt bulunamadı." };
  if (!data.arsivlendi) return { error: "Kalıcı silme için önce arşivleyin." };

  await supabase.from("danismanlik").delete().eq("id", id).eq("user_id", user.id);
  revalidateAll();
  return { success: true };
}

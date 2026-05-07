"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { UzlastirmaDurum, UzlastirmaSonuc } from "@/lib/types/database";

export type UzlastirmaActionState =
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
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function revalidateAll(id?: string) {
  revalidatePath("/uzlastirma");
  revalidatePath("/uzlastirma/arsiv");
  if (id) revalidatePath(`/uzlastirma/${id}`);
}

// ─── CREATE ──────────────────────────────────────────────────────────────────

export async function createUzlastirma(
  _prev: UzlastirmaActionState,
  formData: FormData
): Promise<UzlastirmaActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { data, error } = await supabase
    .from("uzlastirma")
    .insert({
      user_id:           user.id,
      basvuru_no:        formStr(formData, "basvuru_no"),
      suphe_sani:        formStr(formData, "suphe_sani"),
      magdur:            formStr(formData, "magdur"),
      uzlastirmaci_adi:  formStr(formData, "uzlastirmaci_adi"),
      suc_isnad:         formStr(formData, "suc_isnad"),
      atama_tarihi:      formDate(formData, "atama_tarihi"),
      gorusme_tarihi:    formDate(formData, "gorusme_tarihi"),
      sonuc:             (formData.get("sonuc") as UzlastirmaSonuc) || null,
      durum:             (formData.get("durum") as UzlastirmaDurum) || "DEVAM",
      ucret:             formNum(formData, "ucret"),
      notlar:            formStr(formData, "notlar"),
    })
    .select("id")
    .single() as unknown as { data: { id: string } | null; error: { message: string } | null };

  if (error) return { error: error.message };
  if (!data) return { error: "Kayıt oluşturulamadı." };

  revalidateAll(data.id);
  return { success: true, id: data.id };
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────

export async function updateUzlastirma(
  id: string,
  _prev: UzlastirmaActionState,
  formData: FormData
): Promise<UzlastirmaActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("uzlastirma")
    .update({
      basvuru_no:        formStr(formData, "basvuru_no"),
      suphe_sani:        formStr(formData, "suphe_sani"),
      magdur:            formStr(formData, "magdur"),
      uzlastirmaci_adi:  formStr(formData, "uzlastirmaci_adi"),
      suc_isnad:         formStr(formData, "suc_isnad"),
      atama_tarihi:      formDate(formData, "atama_tarihi"),
      gorusme_tarihi:    formDate(formData, "gorusme_tarihi"),
      sonuc:             (formData.get("sonuc") as UzlastirmaSonuc) || null,
      durum:             (formData.get("durum") as UzlastirmaDurum) || "DEVAM",
      ucret:             formNum(formData, "ucret"),
      notlar:            formStr(formData, "notlar"),
    })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };

  revalidateAll(id);
  return { success: true, id };
}

// ─── ARŞİVLE ─────────────────────────────────────────────────────────────────

export async function arsivleUzlastirma(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("uzlastirma")
    .update({ arsivlendi: true })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };
  revalidateAll(id);
  return { success: true };
}

// ─── ARŞİVDEN ÇIKAR ──────────────────────────────────────────────────────────

export async function arsivdenCikarUzlastirma(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("uzlastirma")
    .update({ arsivlendi: false })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };
  revalidateAll(id);
  return { success: true };
}

// ─── SİL ─────────────────────────────────────────────────────────────────────

export async function deleteUzlastirma(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { data } = await supabase
    .from("uzlastirma")
    .select("id, arsivlendi")
    .eq("id", id)
    .eq("user_id", user.id)
    .single() as unknown as { data: { id: string; arsivlendi: boolean } | null };

  if (!data) return { error: "Kayıt bulunamadı." };
  if (!data.arsivlendi) return { error: "Kalıcı silme için önce arşivleyin." };

  await supabase.from("uzlastirma").delete().eq("id", id).eq("user_id", user.id);
  revalidateAll();
  return { success: true };
}

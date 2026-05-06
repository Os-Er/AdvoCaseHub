"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SureliIsKategori, Oncelik, KaynakTip } from "@/lib/types/database";

export type SureliIsActionState =
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
  revalidatePath("/sureli-isler");
  revalidatePath("/sureli-isler/arsiv");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/sureli-isler/${id}`);
}

// ─── CREATE ─────────────────────────────────────────────────────────────────

export async function createSureliIs(
  _prev: SureliIsActionState,
  formData: FormData
): Promise<SureliIsActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const baslik = formStr(formData, "baslik");
  if (!baslik) return { error: "Başlık zorunludur." };

  const son_tarih = formDate(formData, "son_tarih");
  if (!son_tarih) return { error: "Son tarih zorunludur." };

  const kategori = formData.get("kategori") as SureliIsKategori;
  if (!kategori) return { error: "Kategori zorunludur." };

  const kaynak_tip = (formData.get("kaynak_tip") as KaynakTip) || null;
  const kaynak_id  = formStr(formData, "kaynak_id") || null;

  const { data, error } = await supabase
    .from("sureli_isler")
    .insert({
      user_id:           user.id,
      baslik,
      kategori,
      aciklama:          formStr(formData, "aciklama"),
      son_tarih,
      hatirlatma_tarihi: formDate(formData, "hatirlatma_tarihi"),
      oncelik:           (formData.get("oncelik") as Oncelik) || "NORMAL",
      kaynak_tip:        kaynak_tip,
      kaynak_id:         kaynak_tip ? kaynak_id : null,
    })
    .select("id")
    .single() as unknown as { data: { id: string } | null; error: { message: string } | null };

  if (error) return { error: error.message };
  if (!data) return { error: "Kayıt oluşturulamadı." };

  revalidateAll(data.id);
  return { success: true, id: data.id };
}

// ─── UPDATE ─────────────────────────────────────────────────────────────────

export async function updateSureliIs(
  id: string,
  _prev: SureliIsActionState,
  formData: FormData
): Promise<SureliIsActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const baslik = formStr(formData, "baslik");
  if (!baslik) return { error: "Başlık zorunludur." };

  const son_tarih = formDate(formData, "son_tarih");
  if (!son_tarih) return { error: "Son tarih zorunludur." };

  const kaynak_tip = (formData.get("kaynak_tip") as KaynakTip) || null;
  const kaynak_id  = formStr(formData, "kaynak_id") || null;

  const { error } = await supabase
    .from("sureli_isler")
    .update({
      baslik,
      kategori:          formData.get("kategori") as SureliIsKategori,
      aciklama:          formStr(formData, "aciklama"),
      son_tarih,
      hatirlatma_tarihi: formDate(formData, "hatirlatma_tarihi"),
      oncelik:           (formData.get("oncelik") as Oncelik) || "NORMAL",
      kaynak_tip:        kaynak_tip,
      kaynak_id:         kaynak_tip ? kaynak_id : null,
    })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };

  revalidateAll(id);
  return { success: true, id };
}

// ─── TAMAMLA ────────────────────────────────────────────────────────────────

export async function tamamlaSureliIs(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const bugun = new Date().toISOString().split("T")[0];

  const { error } = await supabase
    .from("sureli_isler")
    .update({ tamamlandi: true, tamamlanma_tarihi: bugun })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };
  revalidateAll(id);
  return { success: true };
}

// ─── ARŞİVLE ────────────────────────────────────────────────────────────────

export async function arsivleSureliIs(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("sureli_isler")
    .update({ arsivlendi: true })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };
  revalidateAll(id);
  return { success: true };
}

// ─── ARŞİVDEN ÇIKAR ─────────────────────────────────────────────────────────

export async function arsivdenCikarSureliIs(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("sureli_isler")
    .update({ arsivlendi: false, tamamlandi: false, tamamlanma_tarihi: null })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };
  revalidateAll(id);
  return { success: true };
}

// ─── SİL (Sadece arşivden) ───────────────────────────────────────────────────

export async function deleteSureliIs(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { data } = await supabase
    .from("sureli_isler")
    .select("id, arsivlendi, tamamlandi")
    .eq("id", id)
    .eq("user_id", user.id)
    .single() as unknown as { data: { id: string; arsivlendi: boolean; tamamlandi: boolean } | null };

  if (!data) return { error: "Kayıt bulunamadı." };
  if (!data.arsivlendi && !data.tamamlandi)
    return { error: "Kalıcı silme için önce tamamlayın veya arşivleyin." };

  await supabase.from("sureli_isler").delete().eq("id", id).eq("user_id", user.id);
  revalidateAll();
  return { success: true };
}

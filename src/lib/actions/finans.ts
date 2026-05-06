"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { FinansTip, FinansDurum, KaynakTip } from "@/lib/types/database";

export type FinansActionState =
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

const TIP_REVALIDATE: Record<FinansTip, string[]> = {
  MAKBUZ:    ["/finans/makbuzlar", "/finans/makbuzlar/arsiv"],
  GIDER:     ["/finans/giderler",  "/finans/giderler/arsiv"],
  TAHSILAT:  ["/finans/tahsilatlar", "/finans/tahsilatlar/arsiv"],
};

function revalidateAll(tip?: FinansTip, id?: string) {
  revalidatePath("/dashboard");
  if (tip) {
    TIP_REVALIDATE[tip].forEach((p) => revalidatePath(p));
  } else {
    Object.values(TIP_REVALIDATE).flat().forEach((p) => revalidatePath(p));
  }
  if (id) revalidatePath(`/finans/${id}`);
}

// ─── CREATE ─────────────────────────────────────────────────────────────────

export async function createFinans(
  _prev: FinansActionState,
  formData: FormData
): Promise<FinansActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const tip = formData.get("tip") as FinansTip;
  if (!tip) return { error: "İşlem tipi zorunludur." };

  const tarih = formDate(formData, "tarih");
  if (!tarih) return { error: "Tarih zorunludur." };

  const miktar = formNum(formData, "miktar");
  if (!miktar || miktar <= 0) return { error: "Geçerli bir miktar giriniz." };

  const kaynak_tip = formData.get("kaynak_tip") as KaynakTip;
  if (!kaynak_tip) return { error: "Kaynak türü zorunludur." };

  const odenen_miktar = formNum(formData, "odenen_miktar");

  const { data, error } = await supabase
    .from("finans")
    .insert({
      user_id:       user.id,
      tip,
      kaynak_tip,
      kaynak_id:     formStr(formData, "kaynak_id") || null,
      miktar,
      tarih,
      referans_no:   formStr(formData, "referans_no"),
      aciklama:      formStr(formData, "aciklama"),
      durum:         (formData.get("durum") as FinansDurum) || "BEKLIYOR",
      odenen_miktar,
      notlar:        formStr(formData, "notlar"),
    })
    .select("id")
    .single() as unknown as { data: { id: string } | null; error: { message: string } | null };

  if (error) return { error: error.message };
  if (!data) return { error: "Kayıt oluşturulamadı." };

  revalidateAll(tip, data.id);
  return { success: true, id: data.id };
}

// ─── UPDATE ─────────────────────────────────────────────────────────────────

export async function updateFinans(
  id: string,
  _prev: FinansActionState,
  formData: FormData
): Promise<FinansActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const tarih = formDate(formData, "tarih");
  if (!tarih) return { error: "Tarih zorunludur." };

  const miktar = formNum(formData, "miktar");
  if (!miktar || miktar <= 0) return { error: "Geçerli bir miktar giriniz." };

  const kaynak_tip = formData.get("kaynak_tip") as KaynakTip;
  if (!kaynak_tip) return { error: "Kaynak türü zorunludur." };

  const tip = formData.get("tip") as FinansTip;
  const odenen_miktar = formNum(formData, "odenen_miktar");

  const { error } = await supabase
    .from("finans")
    .update({
      tip,
      kaynak_tip,
      kaynak_id:     formStr(formData, "kaynak_id") || null,
      miktar,
      tarih,
      referans_no:   formStr(formData, "referans_no"),
      aciklama:      formStr(formData, "aciklama"),
      durum:         (formData.get("durum") as FinansDurum) || "BEKLIYOR",
      odenen_miktar,
      notlar:        formStr(formData, "notlar"),
    })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };

  revalidateAll(tip, id);
  return { success: true, id };
}

// ─── ARŞİVLE ────────────────────────────────────────────────────────────────

export async function arsivleFinans(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { data: kayit } = await supabase
    .from("finans")
    .select("id, tip")
    .eq("id", id)
    .eq("user_id", user.id)
    .single() as unknown as { data: { id: string; tip: FinansTip } | null };

  if (!kayit) return { error: "Kayıt bulunamadı." };

  const { error } = await supabase
    .from("finans")
    .update({ arsivlendi: true })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };
  revalidateAll(kayit.tip, id);
  return { success: true };
}

// ─── ARŞİVDEN ÇIKAR ─────────────────────────────────────────────────────────

export async function arsivdenCikarFinans(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { data: kayit } = await supabase
    .from("finans")
    .select("id, tip")
    .eq("id", id)
    .eq("user_id", user.id)
    .single() as unknown as { data: { id: string; tip: FinansTip } | null };

  if (!kayit) return { error: "Kayıt bulunamadı." };

  const { error } = await supabase
    .from("finans")
    .update({ arsivlendi: false })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message: string } | null };

  if (error) return { error: error.message };
  revalidateAll(kayit.tip, id);
  return { success: true };
}

// ─── SİL (Sadece arşivden) ───────────────────────────────────────────────────

export async function deleteFinans(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { data } = await supabase
    .from("finans")
    .select("id, tip, arsivlendi")
    .eq("id", id)
    .eq("user_id", user.id)
    .single() as unknown as { data: { id: string; tip: FinansTip; arsivlendi: boolean } | null };

  if (!data) return { error: "Kayıt bulunamadı." };
  if (!data.arsivlendi) return { error: "Kalıcı silme için önce arşivleyin." };

  await supabase.from("finans").delete().eq("id", id).eq("user_id", user.id);
  revalidateAll(data.tip);
  return { success: true };
}

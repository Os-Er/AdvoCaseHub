"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Vekaletnamedurum } from "@/lib/types/database";

export type VekaletActionState =
  | { error: string }
  | { success: true; id: string }
  | null;

function formStr(fd: FormData, key: string): string | null {
  const v = (fd.get(key) as string)?.trim();
  return v || null;
}

export async function createVekaletname(
  _prev: VekaletActionState,
  formData: FormData
): Promise<VekaletActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { data: vekalet, error } = await supabase
    .from("vekaletnameler")
    .insert({
      user_id: user.id,
      vekaletname_no: formStr(formData, "vekaletname_no"),
      vekaletname_tarihi: formData.get("vekaletname_tarihi") as string,
      bitis_tarihi: formData.get("bitis_tarihi") as string,
      vekalet_veren: (formData.get("vekalet_veren") as string).trim(),
      turu: formStr(formData, "turu"),
      notlar: formStr(formData, "notlar"),
      durum: (formData.get("durum") as Vekaletnamedurum) || "AKTIF",
    })
    .select("id")
    .single() as unknown as { data: { id: string } | null; error: { message?: string } | null };

  if (error || !vekalet) {
    return { error: (error as { message?: string } | null)?.message ?? "Kayıt oluşturulamadı." };
  }

  const dosyaIds = formData.getAll("dosya_ids") as string[];
  if (dosyaIds.length > 0) {
    await supabase.from("vekaletname_dosya").insert(
      dosyaIds.map((did) => ({ vekaletname_id: vekalet.id, dosya_id: did }))
    );
  }

  revalidatePath("/vekaletnameler");
  revalidatePath("/dashboard");
  return { success: true, id: vekalet.id };
}

export async function updateVekaletname(
  id: string,
  _prev: VekaletActionState,
  formData: FormData
): Promise<VekaletActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase
    .from("vekaletnameler")
    .update({
      vekaletname_no: formStr(formData, "vekaletname_no"),
      vekaletname_tarihi: formData.get("vekaletname_tarihi") as string,
      bitis_tarihi: formData.get("bitis_tarihi") as string,
      vekalet_veren: (formData.get("vekalet_veren") as string).trim(),
      turu: formStr(formData, "turu"),
      notlar: formStr(formData, "notlar"),
      durum: formData.get("durum") as Vekaletnamedurum,
    })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message?: string } | null };

  if (error) return { error: error.message ?? "Güncelleme başarısız." };

  await supabase.from("vekaletname_dosya").delete().eq("vekaletname_id", id);

  const dosyaIds = formData.getAll("dosya_ids") as string[];
  if (dosyaIds.length > 0) {
    await supabase.from("vekaletname_dosya").insert(
      dosyaIds.map((did) => ({ vekaletname_id: id, dosya_id: did }))
    );
  }

  revalidatePath("/vekaletnameler");
  revalidatePath(`/vekaletnameler/${id}`);
  revalidatePath("/dashboard");
  return { success: true, id };
}

export async function deleteVekaletname(id: string): Promise<{ success: true } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  await supabase.from("vekaletname_dosya").delete().eq("vekaletname_id", id);
  await supabase.from("vekaletnameler").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/vekaletnameler");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateVekaletnamedurum(
  id: string,
  durum: Vekaletnamedurum
): Promise<{ success: true; id: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  await supabase
    .from("vekaletnameler")
    .update({ durum })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/vekaletnameler");
  revalidatePath(`/vekaletnameler/${id}`);
  revalidatePath("/dashboard");
  return { success: true, id };
}

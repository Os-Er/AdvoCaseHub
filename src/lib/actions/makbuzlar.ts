"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MakbuzDurum } from "@/lib/types/database";

export type MakbuzActionState =
  | { error: string }
  | { success: true; id: string }
  | null;

function formStr(fd: FormData, key: string): string | null {
  const v = (fd.get(key) as string)?.trim();
  return v || null;
}

function formNum(fd: FormData, key: string): number | null {
  const v = (fd.get(key) as string)?.trim();
  if (!v) return null;
  const n = parseFloat(v.replace(",", "."));
  return isNaN(n) ? null : n;
}

function hesaplaDurum(makbuzMiktari: number, odemeMiktari: number | null, manuelOnay = false): MakbuzDurum {
  if (manuelOnay) return "ODENDI";
  if (!odemeMiktari || odemeMiktari <= 0) return "BEKLENIYOR";
  if (odemeMiktari >= makbuzMiktari)      return "ODENDI";
  return "KISMI";
}

export async function createMakbuz(
  _prev: MakbuzActionState,
  formData: FormData
): Promise<MakbuzActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const makbuzMiktari = formNum(formData, "makbuz_miktari");
  if (!makbuzMiktari || makbuzMiktari <= 0) return { error: "Geçerli bir makbuz miktarı girin." };

  const odemeMiktari = formNum(formData, "odeme_miktari");
  const manuelOnay = formData.get("manuel_odendi_onayi") === "on";
  const durum = hesaplaDurum(makbuzMiktari, odemeMiktari, manuelOnay);

  const { data: makbuz, error } = await supabase
    .from("makbuzlar")
    .insert({
      user_id: user.id,
      makbuz_no: formStr(formData, "makbuz_no"),
      makbuz_miktari: makbuzMiktari,
      makbuz_tarihi: formData.get("makbuz_tarihi") as string,
      odeme_miktari: odemeMiktari,
      odeme_tarihi: formStr(formData, "odeme_tarihi"),
      notlar: formStr(formData, "notlar"),
      durum,
      manuel_odendi_onayi: manuelOnay,
    })
    .select("id")
    .single() as unknown as { data: { id: string } | null; error: { message?: string } | null };

  if (error || !makbuz) return { error: error?.message ?? "Kayıt oluşturulamadı." };

  const dosyaIds = formData.getAll("dosya_ids") as string[];
  if (dosyaIds.length > 0) {
    await supabase.from("makbuz_dosya").insert(
      dosyaIds.map((did) => ({ makbuz_id: makbuz.id, dosya_id: did }))
    );
  }

  revalidatePath("/makbuzlar");
  revalidatePath("/dashboard");
  return { success: true, id: makbuz.id };
}

export async function updateMakbuz(
  id: string,
  _prev: MakbuzActionState,
  formData: FormData
): Promise<MakbuzActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const makbuzMiktari = formNum(formData, "makbuz_miktari");
  if (!makbuzMiktari || makbuzMiktari <= 0) return { error: "Geçerli bir makbuz miktarı girin." };

  const odemeMiktari = formNum(formData, "odeme_miktari");
  const manuelOnay = formData.get("manuel_odendi_onayi") === "on";
  const durum = hesaplaDurum(makbuzMiktari, odemeMiktari, manuelOnay);

  const { error } = await supabase
    .from("makbuzlar")
    .update({
      makbuz_no: formStr(formData, "makbuz_no"),
      makbuz_miktari: makbuzMiktari,
      makbuz_tarihi: formData.get("makbuz_tarihi") as string,
      odeme_miktari: odemeMiktari,
      odeme_tarihi: formStr(formData, "odeme_tarihi"),
      notlar: formStr(formData, "notlar"),
      durum,
      manuel_odendi_onayi: manuelOnay,
    })
    .eq("id", id)
    .eq("user_id", user.id) as unknown as { error: { message?: string } | null };

  if (error) return { error: error.message ?? "Güncelleme başarısız." };

  await supabase.from("makbuz_dosya").delete().eq("makbuz_id", id);

  const dosyaIds = formData.getAll("dosya_ids") as string[];
  if (dosyaIds.length > 0) {
    await supabase.from("makbuz_dosya").insert(
      dosyaIds.map((did) => ({ makbuz_id: id, dosya_id: did }))
    );
  }

  revalidatePath("/makbuzlar");
  revalidatePath(`/makbuzlar/${id}`);
  revalidatePath("/dashboard");
  return { success: true, id };
}

export async function deleteMakbuz(id: string): Promise<{ success: true } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  await supabase.from("makbuz_dosya").delete().eq("makbuz_id", id);
  await supabase.from("makbuzlar").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/makbuzlar");
  revalidatePath("/dashboard");
  return { success: true };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function arsivleDosyalar(
  _prev: { mesaj: string } | null,
  formData: FormData
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const yil = formData.get("yil") as string;
  if (!yil) return;

  // Önce etkiyi ölçmek için sayım yap
  const { count } = await supabase
    .from("dosyalar")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .neq("durum", "ARSIV")
    .gte("created_at", `${yil}-01-01`)
    .lte("created_at", `${yil}-12-31T23:59:59`) as unknown as { count: number | null };

  const { error } = await supabase
    .from("dosyalar")
    .update({ durum: "ARSIV" })
    .eq("user_id", user.id)
    .neq("durum", "ARSIV")
    .gte("created_at", `${yil}-01-01`)
    .lte("created_at", `${yil}-12-31T23:59:59`) as unknown as { error: unknown };

  if (error) return;

  redirect(`/dosyalar?toast=${count ?? 0}+dosya+ar%C5%9Fivlendi&yil=${yil}`);
}

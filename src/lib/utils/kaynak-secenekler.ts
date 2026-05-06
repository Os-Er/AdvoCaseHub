import { createClient } from "@/lib/supabase/server";
import type { KaynakTip } from "@/lib/types/database";

export type KaynakOption = {
  tip: KaynakTip;
  id: string;
  label: string;
};

export async function fetchKaynakSecenekleri(): Promise<KaynakOption[]> {
  const supabase = await createClient();

  const [dosyalar, arabuluculuk, cmk, danismanlik] = await Promise.all([
    supabase
      .from("dosyalar")
      .select("id, dosya_no, konu")
      .eq("arsivlendi", false)
      .order("created_at", { ascending: false })
      .limit(200) as unknown as Promise<{
        data: { id: string; dosya_no: string | null; konu: string | null }[] | null;
      }>,

    supabase
      .from("arabuluculuk")
      .select("id, basvuru_no, basvuran")
      .eq("arsivlendi", false)
      .order("created_at", { ascending: false })
      .limit(200) as unknown as Promise<{
        data: { id: string; basvuru_no: string | null; basvuran: string | null }[] | null;
      }>,

    supabase
      .from("cmk_islemleri")
      .select("id, baro_atama_no, muvekkil_adi")
      .eq("arsivlendi", false)
      .order("created_at", { ascending: false })
      .limit(200) as unknown as Promise<{
        data: { id: string; baro_atama_no: string | null; muvekkil_adi: string | null }[] | null;
      }>,

    supabase
      .from("danismanlik")
      .select("id, muvekkil, sozlesme_no")
      .eq("arsivlendi", false)
      .order("created_at", { ascending: false })
      .limit(200) as unknown as Promise<{
        data: { id: string; muvekkil: string | null; sozlesme_no: string | null }[] | null;
      }>,
  ]);

  return [
    ...(dosyalar.data ?? []).map((d) => ({
      tip: "DOSYA" as const,
      id: d.id,
      label: [d.dosya_no, d.konu].filter(Boolean).join(" – ") || d.id,
    })),
    ...(arabuluculuk.data ?? []).map((a) => ({
      tip: "ARABULUCULUK" as const,
      id: a.id,
      label: [a.basvuru_no, a.basvuran].filter(Boolean).join(" – ") || a.id,
    })),
    ...(cmk.data ?? []).map((c) => ({
      tip: "CMK" as const,
      id: c.id,
      label: [c.baro_atama_no, c.muvekkil_adi].filter(Boolean).join(" – ") || c.id,
    })),
    ...(danismanlik.data ?? []).map((d) => ({
      tip: "DANISMANLIK" as const,
      id: d.id,
      label: [d.muvekkil, d.sozlesme_no].filter(Boolean).join(" – ") || d.id,
    })),
  ];
}

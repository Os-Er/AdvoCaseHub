import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { SureliIsFormu } from "@/components/sureli-isler/sureli-is-formu";
import { updateSureliIs } from "@/lib/actions/sureli-isler";
import type { SureliIs } from "@/lib/types/database";
import type { KaynakOption } from "@/components/sureli-isler/sureli-is-formu";

async function fetchKaynaklar(): Promise<KaynakOption[]> {
  const supabase = await createClient();

  const [dosyalar, arabuluculuk, cmk, danismanlik] = await Promise.all([
    supabase
      .from("dosyalar")
      .select("id, dosya_no, konu")
      .eq("arsivlendi", false)
      .order("created_at", { ascending: false })
      .limit(200) as unknown as Promise<{ data: { id: string; dosya_no: string | null; konu: string | null }[] | null }>,

    supabase
      .from("arabuluculuk")
      .select("id, basvuru_no, basvuran")
      .eq("arsivlendi", false)
      .order("created_at", { ascending: false })
      .limit(200) as unknown as Promise<{ data: { id: string; basvuru_no: string | null; basvuran: string | null }[] | null }>,

    supabase
      .from("cmk_islemleri")
      .select("id, baro_atama_no, muvekkil_adi")
      .eq("arsivlendi", false)
      .order("created_at", { ascending: false })
      .limit(200) as unknown as Promise<{ data: { id: string; baro_atama_no: string | null; muvekkil_adi: string | null }[] | null }>,

    supabase
      .from("danismanlik")
      .select("id, muvekkil, sozlesme_no")
      .eq("arsivlendi", false)
      .order("created_at", { ascending: false })
      .limit(200) as unknown as Promise<{ data: { id: string; muvekkil: string | null; sozlesme_no: string | null }[] | null }>,
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

export default async function SureliIsDuzenlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: kayit }, kaynaklar] = await Promise.all([
    supabase
      .from("sureli_isler")
      .select("*")
      .eq("id", id)
      .single() as unknown as Promise<{ data: SureliIs | null }>,
    fetchKaynaklar(),
  ]);

  if (!kayit) notFound();

  const boundAction = updateSureliIs.bind(null, id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href={`/sureli-isler/${id}`}>
        <Button variant="ghost" size="sm" className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-1" /> Geri
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Süreli İşi Düzenle</h1>
        <p className="text-slate-500 mt-1 text-sm">{kayit.baslik}</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <SureliIsFormu
          action={boundAction}
          kayit={kayit}
          cancelHref={`/sureli-isler/${id}`}
          kaynaklar={kaynaklar}
        />
      </div>
    </div>
  );
}

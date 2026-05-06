import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CmkFormu } from "@/components/cmk/cmk-formu";
import { updateCmkIslem } from "@/lib/actions/cmk";
import type { CmkIslem } from "@/lib/types/database";

export default async function CmkDuzenlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: kayit } = await supabase
    .from("cmk_islemleri")
    .select("*")
    .eq("id", id)
    .single() as unknown as { data: CmkIslem | null };

  if (!kayit) notFound();

  const boundAction = updateCmkIslem.bind(null, id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href={`/cmk/${id}`}>
        <Button variant="ghost" size="sm" className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-1" /> Geri
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>CMK Kaydını Düzenle</h1>
        <p className="text-slate-500 mt-1 text-sm">{kayit.baro_atama_no ?? kayit.muvekkil_adi ?? "CMK işlemi"}</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <CmkFormu action={boundAction} kayit={kayit} cancelHref={`/cmk/${id}`} />
      </div>
    </div>
  );
}

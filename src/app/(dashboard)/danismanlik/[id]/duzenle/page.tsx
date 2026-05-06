import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { DanismanlikFormu } from "@/components/danismanlik/danismanlik-formu";
import { updateDanismanlik } from "@/lib/actions/danismanlik";
import type { Danismanlik } from "@/lib/types/database";

export default async function DanismanlikDuzenlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: kayit } = await supabase
    .from("danismanlik")
    .select("*")
    .eq("id", id)
    .single() as unknown as { data: Danismanlik | null };

  if (!kayit) notFound();

  const boundAction = updateDanismanlik.bind(null, id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href={`/danismanlik/${id}`}>
        <Button variant="ghost" size="sm" className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-1" /> Geri
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Danışmanlık Kaydını Düzenle</h1>
        <p className="text-slate-500 mt-1 text-sm">{kayit.muvekkil ?? kayit.sozlesme_no ?? "Danışmanlık kaydı"}</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <DanismanlikFormu action={boundAction} kayit={kayit} cancelHref={`/danismanlik/${id}`} />
      </div>
    </div>
  );
}

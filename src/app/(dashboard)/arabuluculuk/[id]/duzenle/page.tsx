import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ArabuluculukFormu } from "@/components/arabuluculuk/arabuluculuk-formu";
import { updateArabuluculuk } from "@/lib/actions/arabuluculuk";
import type { Arabuluculuk } from "@/lib/types/database";

export default async function ArabuluculukDuzenlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: kayit } = await supabase
    .from("arabuluculuk")
    .select("*")
    .eq("id", id)
    .single() as unknown as { data: Arabuluculuk | null };

  if (!kayit) notFound();

  const boundAction = updateArabuluculuk.bind(null, id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href={`/arabuluculuk/${id}`}>
        <Button variant="ghost" size="sm" className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-1" /> Geri
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Kaydı Düzenle</h1>
        <p className="text-slate-500 mt-1 text-sm">{kayit.basvuru_no ?? "Arabuluculuk kaydı"}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <ArabuluculukFormu
          action={boundAction}
          kayit={kayit}
          cancelHref={`/arabuluculuk/${id}`}
        />
      </div>
    </div>
  );
}

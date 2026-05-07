import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { UzlastirmaFormu } from "@/components/uzlastirma/uzlastirma-formu";
import { updateUzlastirma } from "@/lib/actions/uzlastirma";
import type { Uzlastirma } from "@/lib/types/database";

export const metadata = { title: "Uzlaştırma Düzenle" };

export default async function UzlastirmaDuzenle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: kayit } = await supabase
    .from("uzlastirma")
    .select("*")
    .eq("id", id)
    .single() as unknown as { data: Uzlastirma | null };

  if (!kayit) notFound();

  const action = updateUzlastirma.bind(null, id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href={`/uzlastirma/${id}`}>
        <Button variant="ghost" size="sm" className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-1" /> Geri
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Uzlaştırma Düzenle</h1>
        <p className="text-slate-500 text-sm mt-1">{kayit.basvuru_no ?? "Kayıt düzenleniyor"}</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <UzlastirmaFormu action={action} kayit={kayit} cancelHref={`/uzlastirma/${id}`} />
      </div>
    </div>
  );
}

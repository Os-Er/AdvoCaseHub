import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { VekaletFormu } from "@/components/vekaletnameler/vekalet-formu";
import { updateVekaletname } from "@/lib/actions/vekaletnameler";
import type { Vekaletname, Dosya } from "@/lib/types/database";

export default async function VekaletDuzenlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: vekalet }, { data: dosyalar }, { data: iliskiler }] = await Promise.all([
    supabase
      .from("vekaletnameler")
      .select("*")
      .eq("id", id)
      .single() as unknown as Promise<{ data: Vekaletname | null }>,
    supabase
      .from("dosyalar")
      .select("id, klasor_no, dosya_no, taraf_1")
      .order("created_at", { ascending: false }) as unknown as Promise<{
        data: Pick<Dosya, "id" | "klasor_no" | "dosya_no" | "taraf_1">[] | null;
      }>,
    supabase
      .from("vekaletname_dosya")
      .select("dosya_id")
      .eq("vekaletname_id", id) as unknown as Promise<{ data: { dosya_id: string }[] | null }>,
  ]);

  if (!vekalet) notFound();

  const seciliDosyaIds = (iliskiler ?? []).map((i) => i.dosya_id);
  const boundAction = updateVekaletname.bind(null, id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/vekaletnameler/${id}`}>
          <Button variant="ghost" size="sm" className="text-slate-500">
            <ArrowLeft className="w-4 h-4 mr-1" /> Geri
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Vekâletnameyi Düzenle</h1>
        <p className="text-slate-500 mt-1 text-sm">{vekalet.vekalet_veren}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <VekaletFormu
          action={boundAction}
          dosyalar={dosyalar ?? []}
          seciliDosyaIds={seciliDosyaIds}
          vekalet={vekalet}
          cancelHref={`/vekaletnameler/${id}`}
        />
      </div>
    </div>
  );
}

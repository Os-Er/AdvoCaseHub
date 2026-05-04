import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { MakbuzFormu } from "@/components/makbuzlar/makbuz-formu";
import { updateMakbuz } from "@/lib/actions/makbuzlar";
import type { Makbuz, Dosya } from "@/lib/types/database";

export default async function MakbuzDuzenlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: makbuz }, { data: dosyalar }, { data: iliskiler }] = await Promise.all([
    supabase
      .from("makbuzlar")
      .select("*")
      .eq("id", id)
      .single() as unknown as Promise<{ data: Makbuz | null }>,
    supabase
      .from("dosyalar")
      .select("id, klasor_no, dosya_no, taraf_1")
      .order("created_at", { ascending: false }) as unknown as Promise<{
        data: Pick<Dosya, "id" | "klasor_no" | "dosya_no" | "taraf_1">[] | null;
      }>,
    supabase
      .from("makbuz_dosya")
      .select("dosya_id")
      .eq("makbuz_id", id) as unknown as Promise<{ data: { dosya_id: string }[] | null }>,
  ]);

  if (!makbuz) notFound();

  const seciliDosyaIds = (iliskiler ?? []).map((i) => i.dosya_id);
  const boundAction = updateMakbuz.bind(null, id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/makbuzlar/${id}`}>
          <Button variant="ghost" size="sm" className="text-slate-500">
            <ArrowLeft className="w-4 h-4 mr-1" /> Geri
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Makbuzu Düzenle</h1>
        <p className="text-slate-500 mt-1 text-sm">{makbuz.makbuz_no ?? "Makbuz"}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <MakbuzFormu
          action={boundAction}
          dosyalar={dosyalar ?? []}
          seciliDosyaIds={seciliDosyaIds}
          makbuz={makbuz}
          cancelHref={`/makbuzlar/${id}`}
        />
      </div>
    </div>
  );
}

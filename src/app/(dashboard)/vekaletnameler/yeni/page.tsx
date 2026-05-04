import { createClient } from "@/lib/supabase/server";
import { VekaletFormu } from "@/components/vekaletnameler/vekalet-formu";
import { createVekaletname } from "@/lib/actions/vekaletnameler";
import type { Dosya } from "@/lib/types/database";

interface PageProps {
  searchParams: Promise<{ dosyaId?: string }>;
}

export default async function YeniVekaletnamePage({ searchParams }: PageProps) {
  const { dosyaId } = await searchParams;
  const supabase = await createClient();

  const { data: dosyalar } = await supabase
    .from("dosyalar")
    .select("id, klasor_no, dosya_no, taraf_1")
    .order("created_at", { ascending: false }) as unknown as {
      data: Pick<Dosya, "id" | "klasor_no" | "dosya_no" | "taraf_1">[] | null;
    };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Yeni Vekâletname</h1>
        <p className="text-slate-500 mt-1 text-sm">Yeni bir vekâletname kaydı oluşturun.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <VekaletFormu
          action={createVekaletname}
          dosyalar={dosyalar ?? []}
          seciliDosyaIds={dosyaId ? [dosyaId] : []}
          cancelHref="/vekaletnameler"
        />
      </div>
    </div>
  );
}

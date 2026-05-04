import { createClient } from "@/lib/supabase/server";
import { MakbuzFormu } from "@/components/makbuzlar/makbuz-formu";
import { createMakbuz } from "@/lib/actions/makbuzlar";
import type { Dosya } from "@/lib/types/database";

interface PageProps {
  searchParams: Promise<{ dosyaId?: string }>;
}

export default async function YeniMakbuzPage({ searchParams }: PageProps) {
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
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Yeni Makbuz</h1>
        <p className="text-slate-500 mt-1 text-sm">Yeni bir makbuz ve ödeme kaydı oluşturun.</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <MakbuzFormu
          action={createMakbuz}
          dosyalar={dosyalar ?? []}
          seciliDosyaIds={dosyaId ? [dosyaId] : []}
          cancelHref="/makbuzlar"
        />
      </div>
    </div>
  );
}

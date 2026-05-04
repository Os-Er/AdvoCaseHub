import { createClient } from "@/lib/supabase/server";
import { DosyaFormu } from "@/components/dosyalar/dosya-formu";
import { createDosya } from "@/lib/actions/dosyalar";

export default async function YeniDosyaPage() {
  const supabase = await createClient();
  const { data: kategoriler } = await supabase
    .from("kategoriler")
    .select("id, adi, color, user_id")
    .order("adi") as unknown as { data: import("@/lib/types/database").Kategori[] | null };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Yeni Dosya</h1>
        <p className="text-slate-500 mt-1 text-sm">Yeni bir hukuki dosya oluşturun.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <DosyaFormu
          action={createDosya}
          kategoriler={kategoriler ?? []}
          cancelHref="/dosyalar"
        />
      </div>
    </div>
  );
}

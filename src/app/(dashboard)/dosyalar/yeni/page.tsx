import { createClient } from "@/lib/supabase/server";
import { DosyaFormu } from "@/components/dosyalar/dosya-formu";
import { createDosya } from "@/lib/actions/dosyalar";
import type { DosyaTip } from "@/lib/types/database";

const TIP_BASLIK: Record<DosyaTip, string> = {
  HUKUK: "Yeni Hukuk Dosyası",
  CEZA:  "Yeni Ceza Dosyası",
  ICRA:  "Yeni İcra Takibi",
};

const TIP_GERI: Record<DosyaTip, string> = {
  HUKUK: "/dosyalar/hukuk",
  CEZA:  "/dosyalar/ceza",
  ICRA:  "/dosyalar/icra",
};

interface PageProps {
  searchParams: Promise<{ tip?: string }>;
}

export default async function YeniDosyaPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const tip = (["HUKUK", "CEZA", "ICRA"].includes(sp.tip ?? "")
    ? sp.tip
    : "HUKUK") as DosyaTip;

  const supabase = await createClient();
  const { data: kategoriler } = await supabase
    .from("kategoriler")
    .select("id, adi, color, user_id")
    .order("adi") as unknown as { data: import("@/lib/types/database").Kategori[] | null };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>{TIP_BASLIK[tip]}</h1>
        <p className="text-slate-500 mt-1 text-sm">Yeni bir hukuki dosya oluşturun.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <DosyaFormu
          action={createDosya}
          kategoriler={kategoriler ?? []}
          cancelHref={TIP_GERI[tip]}
          tip={tip}
        />
      </div>
    </div>
  );
}

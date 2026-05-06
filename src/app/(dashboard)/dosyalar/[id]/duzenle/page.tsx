import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { DosyaFormu } from "@/components/dosyalar/dosya-formu";
import { updateDosya } from "@/lib/actions/dosyalar";
import type { Dosya, DosyaTaraf } from "@/lib/types/database";

export default async function DosyaDuzenlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: dosya }, { data: kategoriler }, { data: taraflar }] = await Promise.all([
    supabase
      .from("dosyalar")
      .select("*")
      .eq("id", id)
      .single() as unknown as Promise<{ data: Dosya | null }>,
    supabase
      .from("kategoriler")
      .select("id, adi, color, user_id")
      .order("adi") as unknown as Promise<{ data: import("@/lib/types/database").Kategori[] | null }>,
    supabase
      .from("dosya_taraflari")
      .select("id, ad, rol, sira")
      .eq("dosya_id", id)
      .order("sira") as unknown as Promise<{ data: Pick<DosyaTaraf, "id"|"ad"|"rol"|"sira">[] | null }>,
  ]);

  if (!dosya) notFound();

  const boundAction = updateDosya.bind(null, id);

  const initialTaraflar = (taraflar ?? []).map((t) => ({
    id: t.id,
    ad: t.ad,
    rol: t.rol ?? "",
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dosyalar/${id}`}>
          <Button variant="ghost" size="sm" className="text-slate-500">
            <ArrowLeft className="w-4 h-4 mr-1" /> Geri
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Dosyayı Düzenle</h1>
        <p className="text-slate-500 mt-1 text-sm">
          {dosya.klasor_no ?? dosya.dosya_no ?? "Dosya bilgileri"}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <DosyaFormu
          action={boundAction}
          kategoriler={kategoriler ?? []}
          dosya={dosya}
          cancelHref={`/dosyalar/${id}`}
          initialTaraflar={initialTaraflar}
        />
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { FinansFormu } from "@/components/finans/finans-formu";
import { updateFinans } from "@/lib/actions/finans";
import { fetchKaynakSecenekleri } from "@/lib/utils/kaynak-secenekler";
import type { Finans } from "@/lib/types/database";

export default async function FinansDuzenlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: kayit }, kaynaklar] = await Promise.all([
    supabase
      .from("finans")
      .select("*")
      .eq("id", id)
      .single() as unknown as Promise<{ data: Finans | null }>,
    fetchKaynakSecenekleri(),
  ]);

  if (!kayit) notFound();

  const boundAction = updateFinans.bind(null, id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href={`/finans/${id}`}>
        <Button variant="ghost" size="sm" className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-1" /> Geri
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Finans Kaydını Düzenle</h1>
        <p className="text-slate-500 mt-1 text-sm">
          {kayit.referans_no ?? kayit.aciklama ?? "Finans kaydı"}
        </p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <FinansFormu
          action={boundAction}
          kayit={kayit}
          cancelHref={`/finans/${id}`}
          kaynaklar={kaynaklar}
        />
      </div>
    </div>
  );
}

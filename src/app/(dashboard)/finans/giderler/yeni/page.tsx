import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FinansFormu } from "@/components/finans/finans-formu";
import { createFinans } from "@/lib/actions/finans";
import { fetchKaynakSecenekleri } from "@/lib/utils/kaynak-secenekler";

export default async function GiderYeniPage() {
  const kaynaklar = await fetchKaynakSecenekleri();
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/finans/giderler">
        <Button variant="ghost" size="sm" className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-1" /> Geri
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>📤 Yeni Gider</h1>
        <p className="text-slate-500 mt-1 text-sm">Büro gideri veya dosya masrafını kaydedin.</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <FinansFormu action={createFinans} cancelHref="/finans/giderler" kaynaklar={kaynaklar} defaultTip="GIDER" />
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DanismanlikFormu } from "@/components/danismanlik/danismanlik-formu";
import { createDanismanlik } from "@/lib/actions/danismanlik";

export default function DanismanlikYeniPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/danismanlik">
        <Button variant="ghost" size="sm" className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-1" /> Geri
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Yeni Danışmanlık Kaydı</h1>
        <p className="text-slate-500 mt-1 text-sm">Danışmanlık veya sözleşme bilgilerini girin.</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <DanismanlikFormu action={createDanismanlik} cancelHref="/danismanlik" />
      </div>
    </div>
  );
}

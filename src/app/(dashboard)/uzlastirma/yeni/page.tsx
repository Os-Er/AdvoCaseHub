import { UzlastirmaFormu } from "@/components/uzlastirma/uzlastirma-formu";
import { createUzlastirma } from "@/lib/actions/uzlastirma";

export const metadata = { title: "Yeni Uzlaştırma" };

export default function UzlastirmaYeniPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Yeni Uzlaştırma</h1>
        <p className="text-slate-500 text-sm mt-1">Uzlaştırma sürecini kayıt altına alın.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <UzlastirmaFormu action={createUzlastirma} cancelHref="/uzlastirma" />
      </div>
    </div>
  );
}

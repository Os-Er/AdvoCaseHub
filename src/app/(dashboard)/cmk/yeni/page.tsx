import { CmkFormu } from "@/components/cmk/cmk-formu";
import { createCmkIslem } from "@/lib/actions/cmk";

export const metadata = { title: "Yeni CMK İşlemi" };

export default function YeniCmkPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Yeni CMK İşlemi</h1>
        <p className="text-slate-500 mt-1 text-sm">Baro atamalı yeni bir CMK işlemi kaydedin.</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <CmkFormu action={createCmkIslem} cancelHref="/cmk" />
      </div>
    </div>
  );
}

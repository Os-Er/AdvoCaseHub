import { ArabuluculukFormu } from "@/components/arabuluculuk/arabuluculuk-formu";
import { createArabuluculuk } from "@/lib/actions/arabuluculuk";

export const metadata = { title: "Yeni Arabuluculuk Kaydı" };

export default function YeniArabuluculukPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2A4A" }}>Yeni Arabuluculuk Kaydı</h1>
        <p className="text-slate-500 mt-1 text-sm">Yeni bir arabuluculuk süreci başlatın.</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <ArabuluculukFormu action={createArabuluculuk} cancelHref="/arabuluculuk" />
      </div>
    </div>
  );
}

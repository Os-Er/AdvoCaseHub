import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
            <FileQuestion className="w-10 h-10 text-slate-400" />
          </div>
        </div>
        <h1 className="text-6xl font-bold mb-3" style={{ color: "#1B2A4A" }}>404</h1>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Sayfa Bulunamadı</h2>
        <p className="text-slate-500 mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#1B2A4A" }}
        >
          Panele Dön
        </Link>
      </div>
    </div>
  );
}

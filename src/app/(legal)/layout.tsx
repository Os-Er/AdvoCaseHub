import Link from "next/link";
import Image from "next/image";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="AdvoCaseHub" width={140} height={40} className="object-contain" unoptimized />
          </Link>
          <Link href="/login" className="text-sm font-medium hover:underline" style={{ color: "#1B2A4A" }}>
            Giriş Yap
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {children}
      </main>

      <footer className="border-t border-slate-200 mt-16">
        <div className="max-w-3xl mx-auto px-6 py-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} AdvoCaseHub. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}

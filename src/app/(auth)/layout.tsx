import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="w-full flex justify-center">
        {children}
      </div>
      <footer className="mt-8 flex gap-4 text-xs text-slate-400">
        <Link href="/kvkk" className="hover:text-slate-600 hover:underline">KVKK</Link>
        <Link href="/gizlilik-politikasi" className="hover:text-slate-600 hover:underline">Gizlilik Politikası</Link>
        <Link href="/kullanim-kosullari" className="hover:text-slate-600 hover:underline">Kullanım Koşulları</Link>
      </footer>
    </div>
  );
}

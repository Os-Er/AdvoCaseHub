"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpWithEmail, signInWithGoogle } from "@/lib/actions/auth";

type State = { error: string } | null;

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    signUpWithEmail,
    null
  );
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-center mb-8">
        <Image src="/logo.png" alt="AdvoCaseHub" width={200} height={160} className="object-contain drop-shadow-md" priority unoptimized />
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <h2 className="text-xl font-semibold mb-1" style={{ color: "#1B2A4A" }}>Hesap Oluşturun</h2>
        <p className="text-slate-500 text-sm mb-6">Advocate Technology Hub</p>

        {state?.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{state.error}</div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Ad Soyad</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input id="full_name" name="full_name" type="text" placeholder="Av. Ahmet Yılmaz" className="pl-9" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-posta Adresi</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input id="email" name="email" type="email" placeholder="avukat@ornekbaro.com" className="pl-9" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Şifre</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input id="password" name="password" type="password" placeholder="En az 8 karakter" className="pl-9" minLength={8} required />
            </div>
          </div>

          <div className="flex items-start gap-2.5 pt-1">
            <input
              id="kvkk"
              type="checkbox"
              checked={kvkkAccepted}
              onChange={(e) => setKvkkAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-[#1B2A4A] cursor-pointer flex-shrink-0"
            />
            <label htmlFor="kvkk" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
              <Link href="/kvkk" target="_blank" className="underline hover:text-[#1B2A4A]">KVKK Aydınlatma Metni</Link>
              'ni ve{" "}
              <Link href="/gizlilik-politikasi" target="_blank" className="underline hover:text-[#1B2A4A]">Gizlilik Politikası</Link>
              'nı okudum, kabul ediyorum.
            </label>
          </div>

          <Button type="submit" className="w-full text-white" style={{ backgroundColor: "#1B2A4A" }} disabled={pending || !kvkkAccepted}>
            {pending ? "Hesap oluşturuluyor..." : "Kayıt Ol"}
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-slate-400">veya</span></div>
        </div>

        <form action={signInWithGoogle}>
          <Button type="submit" variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google ile Kayıt Ol
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="font-medium hover:underline" style={{ color: "#C9A84C" }}>Giriş Yapın</Link>
        </p>
      </div>
    </div>
  );
}

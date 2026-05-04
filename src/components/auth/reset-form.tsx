"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Scale, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/actions/auth";

type State = { success: boolean; error?: string } | null;

export function ResetForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    resetPassword,
    null
  );

  if (state?.success) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
            <Mail className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">E-posta Gönderildi</h2>
          <p className="text-slate-500 text-sm mb-6">
            Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
            Gelen kutunuzu kontrol edin.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Giriş Sayfasına Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
          <Scale className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">AdvoCaseHub</h1>
        <p className="text-slate-500 mt-1 text-sm">Avukatlık Yönetim Sistemi</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Şifre Sıfırla</h2>
        <p className="text-slate-500 text-sm mb-6">
          E-posta adresinizi girin, sıfırlama bağlantısı gönderelim.
        </p>

        {state?.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-posta Adresi</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="avukat@ornekbaro.com"
                className="pl-9"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={pending}
          >
            {pending ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
          </Button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
}

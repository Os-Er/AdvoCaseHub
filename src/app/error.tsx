"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Bir Hata Oluştu</h2>
        <p className="text-slate-500 mb-8">
          Beklenmeyen bir sorun yaşandı. Lütfen tekrar deneyin.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={unstable_retry} style={{ backgroundColor: "#1B2A4A" }} className="text-white">
            Tekrar Dene
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
            Panele Dön
          </Button>
        </div>
        {error.digest && (
          <p className="text-xs text-slate-400 mt-6">Hata kodu: {error.digest}</p>
        )}
      </div>
    </div>
  );
}

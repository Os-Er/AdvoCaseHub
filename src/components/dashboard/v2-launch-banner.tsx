"use client";

import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";

const BANNER_KEY = "advocasehub_v2_banner_dismissed";

export function V2LaunchBanner() {
  const [goster, setGoster] = useState(false);

  useEffect(() => {
    // localStorage'da kapatıldı mı kontrol et
    const kapatildi = localStorage.getItem(BANNER_KEY);
    if (!kapatildi) setGoster(true);
  }, []);

  function kapat() {
    localStorage.setItem(BANNER_KEY, "1");
    setGoster(false);
  }

  if (!goster) return null;

  return (
    <div
      role="banner"
      className="relative overflow-hidden rounded-2xl px-5 py-4"
      style={{
        background: "linear-gradient(135deg, #1B2A4A 0%, #243660 60%, #2d4277 100%)",
      }}
    >
      {/* Dekoratif arka plan halkası */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-10"
        style={{ background: "#C9A84C" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-8 right-24 h-24 w-24 rounded-full opacity-10"
        style={{ background: "#C9A84C" }}
      />

      {/* İçerik */}
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* İkon */}
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <Sparkles className="h-4 w-4 text-[#C9A84C]" />
          </div>

          {/* Metin */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#C9A84C]">
                Yeni Sürüm
              </span>
              <span className="rounded-full bg-[#C9A84C]/20 px-2 py-0.5 text-[10px] font-bold text-[#C9A84C] border border-[#C9A84C]/30">
                v2.0.0
              </span>
            </div>
            <p className="mt-0.5 text-sm font-semibold text-white">
              AdvoCaseHub v2 yayında! 🎉
            </p>
            <p className="mt-1 text-xs leading-relaxed text-white/70">
              Arabuluculuk, CMK, Danışmanlık, Süreli İşler ve merkezi Finans yönetimi —
              tüm modüller tek çatı altında.
            </p>

            {/* Özellik listesi */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {[
                "📁 Ceza & İcra Dosyaları",
                "🤝 Arabuluculuk",
                "🛡️ CMK İşlemleri",
                "💼 Danışmanlık",
                "⏰ Süreli İşler",
                "💰 Finans Yönetimi",
              ].map((ozellik) => (
                <span
                  key={ozellik}
                  className="rounded-lg bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/80"
                >
                  {ozellik}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Kapat butonu */}
        <button
          onClick={kapat}
          aria-label="Bildirimi kapat"
          className="shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

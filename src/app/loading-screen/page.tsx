"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoadingScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/dashboard");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ backgroundColor: "#1B2A4A" }}>
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="animate-pulse">
          <Image
            src="/logo.png"
            alt="AdvoCaseHub"
            width={220}
            height={180}
            className="object-contain drop-shadow-2xl"
            priority
            unoptimized
          />
        </div>

        {/* Gold loading dots */}
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full animate-bounce"
            style={{ backgroundColor: "#C9A84C", animationDelay: "0ms" }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full animate-bounce"
            style={{ backgroundColor: "#C9A84C", animationDelay: "150ms" }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full animate-bounce"
            style={{ backgroundColor: "#C9A84C", animationDelay: "300ms" }}
          />
        </div>

        <p className="text-sm tracking-widest uppercase" style={{ color: "#C9A84C80" }}>
          Yükleniyor
        </p>
      </div>
    </div>
  );
}

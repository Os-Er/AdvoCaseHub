import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://advocasehub.com"),
  title: {
    default: "AdvoCaseHub — Avukatlık Yönetim Sistemi",
    template: "%s — AdvoCaseHub",
  },
  description:
    "Türk avukatlara özel bulut tabanlı hukuk bürosu yönetim sistemi. Dava dosyalarınızı, vekaletnamelerinizi ve makbuzlarınızı tek yerden güvenle yönetin.",
  keywords: ["avukat yazılımı", "hukuk bürosu yönetimi", "dava takip", "vekaletname", "avukatlık programı"],
  authors: [{ name: "AdvoCaseHub" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://advocasehub.com",
    siteName: "AdvoCaseHub",
    title: "AdvoCaseHub — Avukatlık Yönetim Sistemi",
    description:
      "Türk avukatlara özel bulut tabanlı hukuk bürosu yönetim sistemi.",
    images: [{ url: "/logo.png", width: 200, height: 160, alt: "AdvoCaseHub" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${geist.variable} h-full antialiased`}>
      <body className="h-full">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

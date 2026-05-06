import { ArsivListesi } from "@/components/dosyalar/arsiv-listesi";

interface PageProps {
  searchParams: Promise<{ q?: string; sayfa?: string }>;
}

export const metadata = { title: "Hukuk Davaları — Arşiv" };

export default function HukukArsivPage({ searchParams }: PageProps) {
  return <ArsivListesi tip="HUKUK" searchParams={searchParams} />;
}

import { ArsivListesi } from "@/components/dosyalar/arsiv-listesi";

interface PageProps {
  searchParams: Promise<{ q?: string; sayfa?: string }>;
}

export const metadata = { title: "Ceza Davaları — Arşiv" };

export default function CezaArsivPage({ searchParams }: PageProps) {
  return <ArsivListesi tip="CEZA" searchParams={searchParams} />;
}

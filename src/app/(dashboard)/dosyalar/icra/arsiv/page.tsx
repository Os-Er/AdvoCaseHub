import { ArsivListesi } from "@/components/dosyalar/arsiv-listesi";

interface PageProps {
  searchParams: Promise<{ q?: string; sayfa?: string }>;
}

export const metadata = { title: "İcra Takipleri — Arşiv" };

export default function IcraArsivPage({ searchParams }: PageProps) {
  return <ArsivListesi tip="ICRA" searchParams={searchParams} />;
}

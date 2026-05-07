import { UzlastirmaListesi } from "@/components/uzlastirma/uzlastirma-listesi";

interface PageProps {
  searchParams: Promise<{ q?: string; durum?: string; sayfa?: string }>;
}

export const metadata = { title: "Uzlaştırma — Arşiv" };

export default function UzlastirmaArsivPage({ searchParams }: PageProps) {
  return <UzlastirmaListesi arsivlendi={true} searchParams={searchParams} />;
}

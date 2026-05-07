import { UzlastirmaListesi } from "@/components/uzlastirma/uzlastirma-listesi";

interface PageProps {
  searchParams: Promise<{ q?: string; durum?: string; sayfa?: string }>;
}

export const metadata = { title: "Uzlaştırma" };

export default function UzlastirmaPage({ searchParams }: PageProps) {
  return <UzlastirmaListesi arsivlendi={false} searchParams={searchParams} />;
}

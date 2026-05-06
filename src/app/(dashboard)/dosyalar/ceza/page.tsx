import { DosyaListesi } from "@/components/dosyalar/dosya-listesi";

interface PageProps {
  searchParams: Promise<{
    q?: string; durum?: string; kategori?: string;
    sayfa?: string; yil?: string; siralama?: string; filtre?: string;
  }>;
}

export const metadata = { title: "Ceza Davaları" };

export default function CezaPage({ searchParams }: PageProps) {
  return <DosyaListesi tip="CEZA" searchParams={searchParams} />;
}

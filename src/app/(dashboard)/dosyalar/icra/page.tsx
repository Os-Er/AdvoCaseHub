import { DosyaListesi } from "@/components/dosyalar/dosya-listesi";

interface PageProps {
  searchParams: Promise<{
    q?: string; durum?: string; kategori?: string;
    sayfa?: string; yil?: string; siralama?: string; filtre?: string;
  }>;
}

export const metadata = { title: "İcra Takipleri" };

export default function IcraPage({ searchParams }: PageProps) {
  return <DosyaListesi tip="ICRA" searchParams={searchParams} />;
}

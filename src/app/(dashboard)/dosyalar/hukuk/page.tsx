import { DosyaListesi } from "@/components/dosyalar/dosya-listesi";

interface PageProps {
  searchParams: Promise<{
    q?: string; durum?: string; kategori?: string;
    sayfa?: string; yil?: string; siralama?: string; filtre?: string;
  }>;
}

export const metadata = { title: "Hukuk Davaları" };

export default function HukukPage({ searchParams }: PageProps) {
  return <DosyaListesi tip="HUKUK" searchParams={searchParams} />;
}

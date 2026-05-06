import { CmkListesi } from "@/components/cmk/cmk-listesi";

interface PageProps {
  searchParams: Promise<{ q?: string; durum?: string; sure_tipi?: string; sayfa?: string }>;
}

export const metadata = { title: "CMK İşlemleri" };

export default function CmkPage({ searchParams }: PageProps) {
  return <CmkListesi arsivlendi={false} searchParams={searchParams} />;
}

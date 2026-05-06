import { ArabuluculukListesi } from "@/components/arabuluculuk/arabuluculuk-listesi";

interface PageProps {
  searchParams: Promise<{ q?: string; durum?: string; sayfa?: string }>;
}

export const metadata = { title: "Arabuluculuk" };

export default function ArabuluculukPage({ searchParams }: PageProps) {
  return <ArabuluculukListesi arsivlendi={false} searchParams={searchParams} />;
}

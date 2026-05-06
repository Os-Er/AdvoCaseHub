import { ArabuluculukListesi } from "@/components/arabuluculuk/arabuluculuk-listesi";

interface PageProps {
  searchParams: Promise<{ q?: string; sayfa?: string }>;
}

export const metadata = { title: "Arabuluculuk — Arşiv" };

export default function ArabuluculukArsivPage({ searchParams }: PageProps) {
  return <ArabuluculukListesi arsivlendi={true} searchParams={searchParams} />;
}

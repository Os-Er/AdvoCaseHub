import { CmkListesi } from "@/components/cmk/cmk-listesi";

interface PageProps {
  searchParams: Promise<{ q?: string; sayfa?: string }>;
}

export const metadata = { title: "CMK İşlemleri — Arşiv" };

export default function CmkArsivPage({ searchParams }: PageProps) {
  return <CmkListesi arsivlendi={true} searchParams={searchParams} />;
}

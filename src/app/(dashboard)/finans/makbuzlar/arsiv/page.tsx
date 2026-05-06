import { FinansListesi } from "@/components/finans/finans-listesi";

export default function MakbuzlarArsivPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; durum?: string; yil?: string; sayfa?: string }>;
}) {
  return <FinansListesi tip="MAKBUZ" arsivlendi={true} searchParams={searchParams} />;
}

import { FinansListesi } from "@/components/finans/finans-listesi";

export default function TahsilatlarArsivPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; durum?: string; yil?: string; sayfa?: string }>;
}) {
  return <FinansListesi tip="TAHSILAT" arsivlendi={true} searchParams={searchParams} />;
}

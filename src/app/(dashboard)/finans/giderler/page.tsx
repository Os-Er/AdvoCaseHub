import { FinansListesi } from "@/components/finans/finans-listesi";

export default function GiderlerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; durum?: string; yil?: string; sayfa?: string }>;
}) {
  return <FinansListesi tip="GIDER" arsivlendi={false} searchParams={searchParams} />;
}

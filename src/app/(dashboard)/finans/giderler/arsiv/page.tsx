import { FinansListesi } from "@/components/finans/finans-listesi";

export default function GiderlerArsivPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; durum?: string; yil?: string; sayfa?: string }>;
}) {
  return <FinansListesi tip="GIDER" arsivlendi={true} searchParams={searchParams} />;
}

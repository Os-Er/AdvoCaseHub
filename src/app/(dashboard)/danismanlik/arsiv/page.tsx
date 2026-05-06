import { DanismanlikListesi } from "@/components/danismanlik/danismanlik-listesi";

export default function DanismanlikArsivPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; durum?: string; tur?: string; sayfa?: string }>;
}) {
  return <DanismanlikListesi arsivlendi={true} searchParams={searchParams} />;
}

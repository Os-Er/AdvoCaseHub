import { DanismanlikListesi } from "@/components/danismanlik/danismanlik-listesi";

export default function DanismanlikPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; durum?: string; tur?: string; sayfa?: string }>;
}) {
  return <DanismanlikListesi arsivlendi={false} searchParams={searchParams} />;
}

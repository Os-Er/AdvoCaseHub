import { SureliIsListesi } from "@/components/sureli-isler/sureli-is-listesi";

export default function SureliIslerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; oncelik?: string; kategori?: string; sayfa?: string }>;
}) {
  return <SureliIsListesi arsivlendi={false} searchParams={searchParams} />;
}

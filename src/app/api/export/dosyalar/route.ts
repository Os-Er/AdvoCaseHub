import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildCSV } from "@/lib/utils/csv";
import type { DosyaDurum } from "@/lib/types/database";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const q      = sp.get("q")      ?? "";
  const durum  = sp.get("durum")  ?? "";
  const yil    = sp.get("yil")    ?? "";

  let query = supabase
    .from("dosyalar")
    .select("klasor_no, dosya_no, basvuru_no, taraf_1, taraf_2, mahkeme_merkez, konu, durum, gorev_tarihi, durusma_tarihi, rapor_tarihi, sonuc, notlar, created_at")
    .order("created_at", { ascending: false });

  if (q)     query = query.or(`klasor_no.ilike.%${q}%,dosya_no.ilike.%${q}%,taraf_1.ilike.%${q}%,taraf_2.ilike.%${q}%`);
  if (durum) query = query.eq("durum", durum as DosyaDurum);
  if (yil)   query = query.gte("created_at", `${yil}-01-01`).lte("created_at", `${yil}-12-31`);

  const { data } = await query as unknown as { data: Record<string, unknown>[] | null };

  const headers = ["Klasör No","Dosya No","Başvuru No","Taraf 1","Taraf 2","Mahkeme/Merkez","Konu","Durum","Görev Tarihi","Duruşma Tarihi","Rapor Tarihi","Sonuç","Notlar","Oluşturma Tarihi"];
  const rows = (data ?? []).map((d) => [
    d.klasor_no, d.dosya_no, d.basvuru_no, d.taraf_1, d.taraf_2,
    d.mahkeme_merkez, d.konu, d.durum, d.gorev_tarihi, d.durusma_tarihi,
    d.rapor_tarihi, d.sonuc, d.notlar, d.created_at,
  ]);

  const csv = buildCSV(headers, rows);
  const filename = `dosyalar_${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

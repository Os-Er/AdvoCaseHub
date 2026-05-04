import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildCSV } from "@/lib/utils/csv";
import type { MakbuzDurum } from "@/lib/types/database";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const q     = sp.get("q")     ?? "";
  const durum = sp.get("durum") ?? "";
  const yil   = sp.get("yil")   ?? "";

  let query = supabase
    .from("makbuzlar")
    .select("makbuz_no, makbuz_miktari, makbuz_tarihi, odeme_miktari, odeme_tarihi, durum, notlar, created_at")
    .order("makbuz_tarihi", { ascending: false });

  if (q)     query = query.ilike("makbuz_no", `%${q}%`);
  if (durum) query = query.eq("durum", durum as MakbuzDurum);
  if (yil)   query = query.gte("makbuz_tarihi", `${yil}-01-01`).lte("makbuz_tarihi", `${yil}-12-31`);

  const { data } = await query as unknown as { data: Record<string, unknown>[] | null };

  const headers = ["Makbuz No","Makbuz Miktarı (₺)","Makbuz Tarihi","Ödenen Miktar (₺)","Ödeme Tarihi","Durum","Notlar","Oluşturma Tarihi"];
  const rows = (data ?? []).map((d) => [
    d.makbuz_no, d.makbuz_miktari, d.makbuz_tarihi,
    d.odeme_miktari, d.odeme_tarihi, d.durum, d.notlar, d.created_at,
  ]);

  const csv = buildCSV(headers, rows);
  const filename = `makbuzlar_${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

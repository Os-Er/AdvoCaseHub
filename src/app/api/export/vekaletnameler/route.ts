import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildCSV } from "@/lib/utils/csv";
import type { Vekaletnamedurum } from "@/lib/types/database";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const q     = sp.get("q")     ?? "";
  const durum = sp.get("durum") ?? "";
  const yil   = sp.get("yil")   ?? "";

  let query = supabase
    .from("vekaletnameler")
    .select("vekaletname_no, vekalet_veren, turu, vekaletname_tarihi, bitis_tarihi, durum, notlar, created_at")
    .order("bitis_tarihi", { ascending: true });

  if (q)     query = query.ilike("vekalet_veren", `%${q}%`);
  if (durum) query = query.eq("durum", durum as Vekaletnamedurum);
  if (yil)   query = query.gte("vekaletname_tarihi", `${yil}-01-01`).lte("vekaletname_tarihi", `${yil}-12-31`);

  const { data } = await query as unknown as { data: Record<string, unknown>[] | null };

  const headers = ["Vekâletname No","Vekâlet Veren","Tür","Düzenlenme Tarihi","Bitiş Tarihi","Durum","Notlar","Oluşturma Tarihi"];
  const rows = (data ?? []).map((d) => [
    d.vekaletname_no, d.vekalet_veren, d.turu,
    d.vekaletname_tarihi, d.bitis_tarihi, d.durum, d.notlar, d.created_at,
  ]);

  const csv = buildCSV(headers, rows);
  const filename = `vekaletnameler_${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

import { createClient } from "@/lib/supabase/server";

// ─── Tip tanımları ────────────────────────────────────────────────────────────

export interface YaklasanIs {
  id: string;
  baslik: string;
  son_tarih: string;
  oncelik: string;
  kategori: string;
  kaynak_tip: string | null;
}

export interface DashboardVeri {
  // Dosyalar (tip bazlı)
  hukukDosya:      number;
  cezaDosya:       number;
  icraDosya:       number;

  // Diğer modüller (aktif kayıtlar)
  aktifArabuluculuk: number;
  aktifCmk:          number;
  aktifDanismanlik:  number;

  // Süreli işler
  kritikSureSayisi:  number;    // Bugün + yarın dolan, tamamlanmamış
  yaklasanIsler:     YaklasanIs[]; // İlk 5, son_tarih asc

  // Finans
  bekleyenTahsilat:  number;   // MAKBUZ BEKLIYOR/KISMI toplam kalan
  buAyGider:         number;   // Bu ay GIDER toplam
  buAyTahsilat:      number;   // Bu ay TAHSILAT TAMAMLANDI toplam

  // Meta
  sonGuncelleme: string; // ISO timestamp
}

// ─── Ana veri çekme fonksiyonu ────────────────────────────────────────────────

export async function fetchDashboardVeri(): Promise<DashboardVeri> {
  const supabase = await createClient();

  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const bugunStr = bugun.toISOString().split("T")[0];

  const yarin = new Date(bugun);
  yarin.setDate(yarin.getDate() + 1);
  const yarinStr = yarin.toISOString().split("T")[0];

  const ayBasi = new Date(bugun.getFullYear(), bugun.getMonth(), 1)
    .toISOString().split("T")[0];

  const [
    // Dosyalar: count by tip
    { count: hukukSayisi },
    { count: cezaSayisi },
    { count: icraSayisi },

    // Diğer modüller
    { count: arabuluculukSayisi },
    { count: cmkSayisi },
    { count: danismanlikSayisi },

    // Süreli işler: bugün + yarın dolan sayısı
    { count: kritikSure },

    // Süreli işler: ilk 5 (en yakın deadline önce)
    { data: yaklasanRaw },

    // Finans: bekleyen makbuzlar
    { data: bekleyenMakbuzlar },

    // Bu ay gider
    { data: ayGiderler },

    // Bu ay tahsilat
    { data: ayTahsilatlar },
  ] = await Promise.all([

    supabase
      .from("dosyalar")
      .select("id", { count: "exact", head: true })
      .eq("tip", "HUKUK")
      .eq("arsivlendi", false) as unknown as Promise<{ count: number | null }>,

    supabase
      .from("dosyalar")
      .select("id", { count: "exact", head: true })
      .eq("tip", "CEZA")
      .eq("arsivlendi", false) as unknown as Promise<{ count: number | null }>,

    supabase
      .from("dosyalar")
      .select("id", { count: "exact", head: true })
      .eq("tip", "ICRA")
      .eq("arsivlendi", false) as unknown as Promise<{ count: number | null }>,

    supabase
      .from("arabuluculuk")
      .select("id", { count: "exact", head: true })
      .eq("arsivlendi", false)
      .eq("durum", "AKTIF") as unknown as Promise<{ count: number | null }>,

    supabase
      .from("cmk_islemleri")
      .select("id", { count: "exact", head: true })
      .eq("arsivlendi", false)
      .eq("durum", "DEVAM") as unknown as Promise<{ count: number | null }>,

    supabase
      .from("danismanlik")
      .select("id", { count: "exact", head: true })
      .eq("arsivlendi", false)
      .eq("durum", "AKTIF") as unknown as Promise<{ count: number | null }>,

    supabase
      .from("sureli_isler")
      .select("id", { count: "exact", head: true })
      .eq("tamamlandi", false)
      .eq("arsivlendi", false)
      .lte("son_tarih", yarinStr) as unknown as Promise<{ count: number | null }>,

    supabase
      .from("sureli_isler")
      .select("id, baslik, son_tarih, oncelik, kategori, kaynak_tip")
      .eq("tamamlandi", false)
      .eq("arsivlendi", false)
      .order("son_tarih", { ascending: true })
      .limit(5) as unknown as Promise<{ data: YaklasanIs[] | null }>,

    // Bekleyen makbuzlar: BEKLIYOR veya KISMI olan makbuzların (miktar, odenen_miktar)
    supabase
      .from("finans")
      .select("miktar, odenen_miktar")
      .eq("tip", "MAKBUZ")
      .in("durum", ["BEKLIYOR", "KISMI"])
      .eq("arsivlendi", false) as unknown as Promise<{
        data: { miktar: number; odenen_miktar: number | null }[] | null;
      }>,

    // Bu ay gider
    supabase
      .from("finans")
      .select("miktar")
      .eq("tip", "GIDER")
      .eq("arsivlendi", false)
      .gte("tarih", ayBasi) as unknown as Promise<{
        data: { miktar: number }[] | null;
      }>,

    // Bu ay tahsilat (TAMAMLANDI)
    supabase
      .from("finans")
      .select("miktar")
      .eq("tip", "TAHSILAT")
      .eq("durum", "TAMAMLANDI")
      .eq("arsivlendi", false)
      .gte("tarih", ayBasi) as unknown as Promise<{
        data: { miktar: number }[] | null;
      }>,
  ]);

  // Bekleyen tahsilat: kalan tutar toplamı
  const bekleyenTahsilat = (bekleyenMakbuzlar ?? []).reduce(
    (acc, r) => acc + (r.miktar - (r.odenen_miktar ?? 0)),
    0
  );

  const buAyGider = (ayGiderler ?? []).reduce((acc, r) => acc + r.miktar, 0);
  const buAyTahsilat = (ayTahsilatlar ?? []).reduce((acc, r) => acc + r.miktar, 0);

  return {
    hukukDosya:        hukukSayisi  ?? 0,
    cezaDosya:         cezaSayisi   ?? 0,
    icraDosya:         icraSayisi   ?? 0,
    aktifArabuluculuk: arabuluculukSayisi ?? 0,
    aktifCmk:          cmkSayisi    ?? 0,
    aktifDanismanlik:  danismanlikSayisi  ?? 0,
    kritikSureSayisi:  kritikSure   ?? 0,
    yaklasanIsler:     yaklasanRaw  ?? [],
    bekleyenTahsilat,
    buAyGider,
    buAyTahsilat,
    sonGuncelleme: new Date().toISOString(),
  };
}

// ─── Akıllı Tarih Hiyerarşisi ────────────────────────────────────────────────
// Dosya yılını/tarihini belirleyen uygulama geneli COALESCE mantığı:
//   1. gorev_tarihi   → davanın fiili başlangıç tarihi
//   2. durusma_tarihi → duruşma günü
//   3. rapor_tarihi   → rapor tarihi
//   4. created_at     → sisteme kayıt tarihi (her zaman dolu)

export type DosyaTarihItem = {
  gorev_tarihi:   string | null;
  durusma_tarihi: string | null;
  rapor_tarihi:   string | null;
  created_at:     string;
};

export type TarihKaynagi = "görev" | "duruşma" | "rapor" | "kayıt";

/** Etkin tarihi döndürür (string). */
export function getEffectiveDate(item: DosyaTarihItem): string {
  return item.gorev_tarihi ?? item.durusma_tarihi ?? item.rapor_tarihi ?? item.created_at;
}

/** Etkin yılı döndürür (number). */
export function getEffectiveYear(item: DosyaTarihItem): number {
  return new Date(getEffectiveDate(item)).getFullYear();
}

/** Etkin tarihi ve kaynağı birlikte döndürür. */
export function getEffectiveDateWithSource(item: DosyaTarihItem): {
  date: string;
  kaynak: TarihKaynagi;
} {
  if (item.gorev_tarihi)   return { date: item.gorev_tarihi,   kaynak: "görev" };
  if (item.durusma_tarihi) return { date: item.durusma_tarihi, kaynak: "duruşma" };
  if (item.rapor_tarihi)   return { date: item.rapor_tarihi,   kaynak: "rapor" };
  return { date: item.created_at, kaynak: "kayıt" };
}

/**
 * PostgREST OR filtre dizesi — yıla göre dosya filtreleme.
 * Null alanlar yerleştirme (fallback) mantığıyla hiyerarşik koşul üretir.
 *
 * Kullanım: query.or(dosyaYilFiltresi("2024"))
 */
export function dosyaYilFiltresi(yil: string): string {
  const bas = `${yil}-01-01`;
  const son = `${yil}-12-31`;
  return [
    // 1. gorev_tarihi varsa ve o yıldaysa
    `and(gorev_tarihi.gte.${bas},gorev_tarihi.lte.${son})`,
    // 2. gorev_tarihi yok, durusma_tarihi o yılda
    `and(gorev_tarihi.is.null,durusma_tarihi.gte.${bas},durusma_tarihi.lte.${son})`,
    // 3. İkisi de yok, rapor_tarihi o yılda
    `and(gorev_tarihi.is.null,durusma_tarihi.is.null,rapor_tarihi.gte.${bas},rapor_tarihi.lte.${son})`,
    // 4. Hiçbiri yok, created_at o yılda
    `and(gorev_tarihi.is.null,durusma_tarihi.is.null,rapor_tarihi.is.null,created_at.gte.${bas}T00:00:00,created_at.lte.${son}T23:59:59)`,
  ].join(",");
}

/**
 * Türk Lirası formatlama yardımcıları
 * Çıktı: 15.000,00 ₺
 */

const formatter = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatTL(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return formatter.format(amount) + " ₺";
}

/** Kalan borç: makbuz - ödenen */
export function kalanBorcHesapla(makbuz: number, odeme: number | null): number {
  return Math.max(0, makbuz - (odeme ?? 0));
}

/** Ödeme yüzdesi (0-100) */
export function odemeYuzdesi(makbuz: number, odeme: number | null): number {
  if (!makbuz) return 0;
  return Math.min(100, Math.round(((odeme ?? 0) / makbuz) * 100));
}

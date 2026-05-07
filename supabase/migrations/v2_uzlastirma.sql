-- ============================================================
-- AdvoCaseHub v2 — Uzlaştırma Modülü Migration
-- Supabase SQL Editor'da çalıştırılacak
-- ============================================================

CREATE TABLE IF NOT EXISTS uzlastirma (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Referans
  basvuru_no        TEXT,

  -- Taraflar
  suphe_sani        TEXT,          -- Şüpheli / Sanık
  magdur            TEXT,          -- Mağdur / Müşteki
  uzlastirmaci_adi  TEXT,

  -- Suç ve süreç
  suc_isnad         TEXT,          -- Suç isnadı / türü
  atama_tarihi      DATE,
  gorusme_tarihi    DATE,

  -- Sonuç
  sonuc             TEXT          CHECK (sonuc IN ('UZLASTI','UZLASAMADI','DEVAM')),

  -- Durum
  durum             TEXT          NOT NULL DEFAULT 'DEVAM'
                                  CHECK (durum IN ('DEVAM','TAMAMLANDI','IPTAL')),
  arsivlendi        BOOLEAN       NOT NULL DEFAULT FALSE,
  ucret             NUMERIC(12,2) CHECK (ucret >= 0),
  notlar            TEXT,

  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_uzlastirma_updated_at
  BEFORE UPDATE ON uzlastirma
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_uzlastirma_user_arsiv
  ON uzlastirma(user_id, arsivlendi);

ALTER TABLE uzlastirma ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uzlastirma_rls" ON uzlastirma
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Kontrol:
--   SELECT COUNT(*) FROM uzlastirma;

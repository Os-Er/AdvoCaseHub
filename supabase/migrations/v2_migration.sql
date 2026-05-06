-- ============================================================
-- AdvoCaseHub v2 — Faz 1: Veritabanı Migration
-- Supabase SQL Editor'da tek seferde çalıştırılacak
-- ============================================================


-- ============================================================
-- 1. MEVCUT TABLOLARDA DEĞİŞİKLİK
-- ============================================================

-- dosyalar tablosuna tip kolonu ekle (mevcut kayıtlar HUKUK olur)
ALTER TABLE dosyalar
ADD COLUMN IF NOT EXISTS tip TEXT NOT NULL DEFAULT 'HUKUK'
CHECK (tip IN ('HUKUK','CEZA','ICRA'));

-- Performans için index
CREATE INDEX IF NOT EXISTS idx_dosyalar_tip
  ON dosyalar(user_id, tip)
  WHERE durum != 'ARSIV';


-- ============================================================
-- 2. SHARED TRIGGER FUNCTION (updated_at için)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 3. ARABULUCULUK TABLOSU
-- ============================================================

CREATE TABLE IF NOT EXISTS arabuluculuk (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Taraf bilgileri
  basvuru_no       TEXT,
  basvuran         TEXT,
  karsi_taraf      TEXT,
  arabulucu_adi    TEXT,

  -- Süreç bilgileri
  basvuru_tarihi   DATE,
  gorusme_tarihi   DATE,
  konu             TEXT,
  sonuc            TEXT        CHECK (sonuc IN ('ANLASMA','ANLASAMAMAMA','DEVAM')),

  -- Durum
  durum            TEXT        NOT NULL DEFAULT 'DEVAM'
                               CHECK (durum IN ('DEVAM','TAMAMLANDI','IPTAL')),
  arsivlendi       BOOLEAN     NOT NULL DEFAULT FALSE,
  notlar           TEXT,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_arabuluculuk_updated_at
  BEFORE UPDATE ON arabuluculuk
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_arabuluculuk_user_arsiv
  ON arabuluculuk(user_id, arsivlendi);


-- ============================================================
-- 4. CMK_ISLEMLERI TABLOSU
-- ============================================================

CREATE TABLE IF NOT EXISTS cmk_islemleri (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Atama bilgileri
  baro_atama_no    TEXT,
  atama_tarihi     DATE,

  -- Kişi bilgileri
  muvekkil_adi     TEXT,
  suc_isnadı       TEXT,

  -- Süreç
  sure_tipi        TEXT        CHECK (sure_tipi IN ('SORUSTURMA','KOVUSTURMA')),
  merci            TEXT,       -- savcılık veya mahkeme adı
  dosya_no         TEXT,

  -- Durum
  durum            TEXT        NOT NULL DEFAULT 'DEVAM'
                               CHECK (durum IN ('DEVAM','TAMAMLANDI','IPTAL')),
  arsivlendi       BOOLEAN     NOT NULL DEFAULT FALSE,
  notlar           TEXT,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_cmk_updated_at
  BEFORE UPDATE ON cmk_islemleri
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_cmk_user_arsiv
  ON cmk_islemleri(user_id, arsivlendi);


-- ============================================================
-- 5. DANISMANLIK TABLOSU
-- ============================================================

CREATE TABLE IF NOT EXISTS danismanlik (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Müvekkil ve tür
  muvekkil         TEXT,
  tur              TEXT          CHECK (tur IN ('DANISMANLIK','SOZLESME','GENEL')),

  -- Sözleşme bilgileri
  sozlesme_no      TEXT,
  baslangic_tarihi DATE,
  bitis_tarihi     DATE,
  ucret            NUMERIC(12,2) CHECK (ucret >= 0),

  -- Konu
  konu             TEXT,

  -- Durum
  durum            TEXT          NOT NULL DEFAULT 'AKTIF'
                                 CHECK (durum IN ('AKTIF','TAMAMLANDI','IPTAL')),
  arsivlendi       BOOLEAN       NOT NULL DEFAULT FALSE,
  notlar           TEXT,

  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_danismanlik_updated_at
  BEFORE UPDATE ON danismanlik
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_danismanlik_user_arsiv
  ON danismanlik(user_id, arsivlendi);


-- ============================================================
-- 6. SURELI_ISLER TABLOSU
-- ============================================================

CREATE TABLE IF NOT EXISTS sureli_isler (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Polymorphic kaynak bağı
  kaynak_tip        TEXT        CHECK (kaynak_tip IN ('DOSYA','ARABULUCULUK','CMK','DANISMANLIK')),
  kaynak_id         UUID,       -- NULL = bağımsız iş

  -- İş bilgileri
  baslik            TEXT        NOT NULL,
  kategori          TEXT        NOT NULL
                                CHECK (kategori IN (
                                  'ISTINAF','CEVAP_DILEKCESI','BILIRKISI_ITIRAZI',
                                  'TEMYIZ','ITIRAZ','DURUSMA','DIGER'
                                )),
  aciklama          TEXT,

  -- Süre
  son_tarih         DATE        NOT NULL,
  hatirlatma_tarihi DATE,

  -- Öncelik ve durum
  oncelik           TEXT        NOT NULL DEFAULT 'NORMAL'
                                CHECK (oncelik IN ('DUSUK','NORMAL','YUKSEK','KRITIK')),
  tamamlandi        BOOLEAN     NOT NULL DEFAULT FALSE,
  tamamlanma_tarihi DATE,
  arsivlendi        BOOLEAN     NOT NULL DEFAULT FALSE,

  -- İlerideki hukuki süre hesaplama mantığı için
  -- Örnek: {"hafta_sonu_atla": true, "adli_tatil_dikkate_al": true, "sure_gun": 30}
  sure_logic        JSONB       NOT NULL DEFAULT '{}'::jsonb,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_sureli_isler_updated_at
  BEFORE UPDATE ON sureli_isler
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Yaklaşan işler için optimize index
CREATE INDEX IF NOT EXISTS idx_sureli_isler_aktif
  ON sureli_isler(user_id, son_tarih)
  WHERE tamamlandi = FALSE AND arsivlendi = FALSE;


-- ============================================================
-- 7. FINANS TABLOSU
-- ============================================================

CREATE TABLE IF NOT EXISTS finans (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- İşlem tipi
  tip           TEXT          NOT NULL CHECK (tip IN ('MAKBUZ','GIDER','TAHSILAT')),

  -- Hangi modüle bağlı
  kaynak_tip    TEXT          NOT NULL CHECK (kaynak_tip IN ('DOSYA','ARABULUCULUK','CMK','DANISMANLIK')),
  kaynak_id     UUID,         -- NULL: migration sırasında bağsız makbuzlar için

  -- Finansal bilgiler
  miktar        NUMERIC(12,2) NOT NULL CHECK (miktar > 0),
  tarih         DATE          NOT NULL,
  referans_no   TEXT,         -- makbuz no, fatura no, dekont no
  aciklama      TEXT,

  -- Ödeme durumu
  durum         TEXT          NOT NULL DEFAULT 'BEKLIYOR'
                              CHECK (durum IN ('BEKLIYOR','KISMI','TAMAMLANDI','IPTAL')),
  odenen_miktar NUMERIC(12,2) CHECK (odenen_miktar >= 0),

  -- Arşiv
  arsivlendi    BOOLEAN       NOT NULL DEFAULT FALSE,
  notlar        TEXT,

  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_finans_updated_at
  BEFORE UPDATE ON finans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_finans_user_tip
  ON finans(user_id, tip)
  WHERE arsivlendi = FALSE;

CREATE INDEX IF NOT EXISTS idx_finans_kaynak
  ON finans(kaynak_tip, kaynak_id);


-- ============================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE arabuluculuk  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cmk_islemleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE danismanlik   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sureli_isler  ENABLE ROW LEVEL SECURITY;
ALTER TABLE finans        ENABLE ROW LEVEL SECURITY;

-- Her tablo için: kullanıcı yalnızca kendi verisini görür/yönetir
CREATE POLICY "arabuluculuk_rls" ON arabuluculuk
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "cmk_islemleri_rls" ON cmk_islemleri
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "danismanlik_rls" ON danismanlik
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "sureli_isler_rls" ON sureli_isler
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "finans_rls" ON finans
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ============================================================
-- 9. MAKBUZLAR → FİNANS MİGRASYONU
-- Mevcut makbuz verileri finans tablosuna kopyalanır.
-- Orijinal makbuzlar tablosu korunur (yedek).
-- Her makbuz için bağlı ilk dosya kaynak olarak alınır.
-- ============================================================

INSERT INTO finans (
  id,
  user_id,
  tip,
  kaynak_tip,
  kaynak_id,
  miktar,
  tarih,
  referans_no,
  durum,
  odenen_miktar,
  notlar,
  created_at,
  updated_at
)
SELECT
  m.id,
  m.user_id,
  'MAKBUZ'                                              AS tip,
  'DOSYA'                                               AS kaynak_tip,
  (
    SELECT dosya_id FROM makbuz_dosya
    WHERE makbuz_id = m.id
    ORDER BY created_at
    LIMIT 1
  )                                                     AS kaynak_id,
  m.makbuz_miktari                                      AS miktar,
  m.makbuz_tarihi::DATE                                 AS tarih,
  m.makbuz_no                                           AS referans_no,
  CASE m.durum
    WHEN 'BEKLENIYOR' THEN 'BEKLIYOR'
    WHEN 'KISMI'      THEN 'KISMI'
    WHEN 'ODENDI'     THEN 'TAMAMLANDI'
    ELSE 'BEKLIYOR'
  END                                                   AS durum,
  m.odeme_miktari                                       AS odenen_miktar,
  m.notlar,
  m.created_at,
  m.updated_at
FROM makbuzlar m
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- TAMAMLANDI
-- Kontrol sorguları:
--   SELECT COUNT(*) FROM arabuluculuk;
--   SELECT COUNT(*) FROM cmk_islemleri;
--   SELECT COUNT(*) FROM danismanlik;
--   SELECT COUNT(*) FROM sureli_isler;
--   SELECT COUNT(*) FROM finans;
--   SELECT tip, COUNT(*) FROM dosyalar GROUP BY tip;
-- ============================================================

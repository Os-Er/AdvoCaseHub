-- ============================================================
-- dosyalar tablosuna arsivlendi kolonu ekle
-- (kod bu kolonu kullanıyor ama migration eksikti)
-- ============================================================

ALTER TABLE dosyalar
  ADD COLUMN IF NOT EXISTS arsivlendi BOOLEAN NOT NULL DEFAULT FALSE;

-- Mevcut kayıtları durum'a göre senkronize et
-- ARSIV durumundaki dosyalar arsivlendi = true olarak işaretlenir
UPDATE dosyalar
SET arsivlendi = TRUE
WHERE durum = 'ARSIV' AND arsivlendi = FALSE;

-- Performans için index ekle
CREATE INDEX IF NOT EXISTS idx_dosyalar_arsivlendi
  ON dosyalar(user_id, arsivlendi, tip);

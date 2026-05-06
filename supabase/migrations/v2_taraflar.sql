-- ============================================================
-- dosya_taraflari — Çok taraflı dosya yapısı
-- Supabase SQL Editor'da çalıştırılacak
-- ============================================================

CREATE TABLE IF NOT EXISTS dosya_taraflari (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  dosya_id   UUID        NOT NULL REFERENCES dosyalar(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad         TEXT        NOT NULL,
  rol        TEXT,       -- Davacı | Davalı | Sanık | Alacaklı | Borçlu | vb.
  sira       INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dosya_taraflari_dosya
  ON dosya_taraflari(dosya_id);

CREATE INDEX IF NOT EXISTS idx_dosya_taraflari_user
  ON dosya_taraflari(user_id);

-- Taraf adı arama için GIN index
CREATE INDEX IF NOT EXISTS idx_dosya_taraflari_ad_trgm
  ON dosya_taraflari USING gin (ad gin_trgm_ops);

ALTER TABLE dosya_taraflari ENABLE ROW LEVEL SECURITY;

CREATE POLICY "taraflari_rls" ON dosya_taraflari
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Kontrol:
--   SELECT COUNT(*) FROM dosya_taraflari;
-- ============================================================

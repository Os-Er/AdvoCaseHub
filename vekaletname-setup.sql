-- ================================================================
-- Sprint 3: Vekaletname Yönetimi – SQL Setup
-- Supabase SQL Editor'da çalıştırın
-- ================================================================

-- 1. vekaletname_expiring VIEW
--    Sadece AKTIF vekâletnameleri, kalan gün hesabıyla döndürür.
--    security_invoker = true → RLS'ye uyar, her kullanıcı sadece kendininkini görür.
-- ----------------------------------------------------------------
CREATE OR REPLACE VIEW vekaletname_expiring
WITH (security_invoker = true)
AS
SELECT
  v.id,
  v.user_id,
  v.vekaletname_no,
  v.vekaletname_tarihi,
  v.bitis_tarihi,
  v.vekalet_veren,
  v.turu,
  v.notlar,
  v.durum,
  v.created_at,
  v.updated_at,
  u.full_name AS avukat_adi,
  u.email,
  (v.bitis_tarihi::date - CURRENT_DATE)::integer AS kalan_gun
FROM vekaletnameler v
JOIN public.users u ON u.id = v.user_id
WHERE v.durum = 'AKTIF';

-- 2. RLS – vekaletnameler
-- ----------------------------------------------------------------
ALTER TABLE vekaletnameler ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vekaletnameler_select" ON vekaletnameler;
DROP POLICY IF EXISTS "vekaletnameler_insert" ON vekaletnameler;
DROP POLICY IF EXISTS "vekaletnameler_update" ON vekaletnameler;
DROP POLICY IF EXISTS "vekaletnameler_delete" ON vekaletnameler;

CREATE POLICY "vekaletnameler_select"
  ON vekaletnameler FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "vekaletnameler_insert"
  ON vekaletnameler FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "vekaletnameler_update"
  ON vekaletnameler FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "vekaletnameler_delete"
  ON vekaletnameler FOR DELETE
  USING (user_id = auth.uid());

-- 3. RLS – vekaletname_dosya
-- ----------------------------------------------------------------
ALTER TABLE vekaletname_dosya ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vekaletname_dosya_select" ON vekaletname_dosya;
DROP POLICY IF EXISTS "vekaletname_dosya_insert" ON vekaletname_dosya;
DROP POLICY IF EXISTS "vekaletname_dosya_delete" ON vekaletname_dosya;

-- Kullanıcı, kendi vekaletname'lerine bağlı dosya ilişkilerini görebilir
CREATE POLICY "vekaletname_dosya_select"
  ON vekaletname_dosya FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vekaletnameler v
      WHERE v.id = vekaletname_dosya.vekaletname_id
        AND v.user_id = auth.uid()
    )
  );

CREATE POLICY "vekaletname_dosya_insert"
  ON vekaletname_dosya FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vekaletnameler v
      WHERE v.id = vekaletname_dosya.vekaletname_id
        AND v.user_id = auth.uid()
    )
  );

CREATE POLICY "vekaletname_dosya_delete"
  ON vekaletname_dosya FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM vekaletnameler v
      WHERE v.id = vekaletname_dosya.vekaletname_id
        AND v.user_id = auth.uid()
    )
  );

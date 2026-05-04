-- ================================================================
-- Sprint 4: Makbuz Yönetimi – RLS Setup
-- Supabase SQL Editor'da çalıştırın
-- ================================================================

-- 1. RLS – makbuzlar
-- ----------------------------------------------------------------
ALTER TABLE makbuzlar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "makbuzlar_select" ON makbuzlar;
DROP POLICY IF EXISTS "makbuzlar_insert" ON makbuzlar;
DROP POLICY IF EXISTS "makbuzlar_update" ON makbuzlar;
DROP POLICY IF EXISTS "makbuzlar_delete" ON makbuzlar;

CREATE POLICY "makbuzlar_select"
  ON makbuzlar FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "makbuzlar_insert"
  ON makbuzlar FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "makbuzlar_update"
  ON makbuzlar FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "makbuzlar_delete"
  ON makbuzlar FOR DELETE
  USING (user_id = auth.uid());

-- 2. RLS – makbuz_dosya
-- ----------------------------------------------------------------
ALTER TABLE makbuz_dosya ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "makbuz_dosya_select" ON makbuz_dosya;
DROP POLICY IF EXISTS "makbuz_dosya_insert" ON makbuz_dosya;
DROP POLICY IF EXISTS "makbuz_dosya_delete" ON makbuz_dosya;

CREATE POLICY "makbuz_dosya_select"
  ON makbuz_dosya FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM makbuzlar m
      WHERE m.id = makbuz_dosya.makbuz_id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "makbuz_dosya_insert"
  ON makbuz_dosya FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM makbuzlar m
      WHERE m.id = makbuz_dosya.makbuz_id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "makbuz_dosya_delete"
  ON makbuz_dosya FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM makbuzlar m
      WHERE m.id = makbuz_dosya.makbuz_id
        AND m.user_id = auth.uid()
    )
  );

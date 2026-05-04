-- Önce mevcut politikaları listele (adları farklı olabilir)
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'kategoriler';

-- Mevcut SELECT politikasını sil (adı farklıysa aşağıdan kontrol et)
DROP POLICY IF EXISTS "Kullanıcı kendi kategorilerini görebilir" ON kategoriler;
DROP POLICY IF EXISTS "Users can view own categories" ON kategoriler;
DROP POLICY IF EXISTS "kategoriler_select" ON kategoriler;

-- Yeni politika: user_id NULL olan (sistem) VEYA kendi kategorilerini görebilir
CREATE POLICY "kategoriler_select"
ON kategoriler
FOR SELECT
USING (
  user_id IS NULL          -- Sistem kategorileri (herkese açık)
  OR user_id = auth.uid()  -- Kullanıcının kendi kategorileri
);

-- INSERT: Sadece kendi adına ekleyebilir
DROP POLICY IF EXISTS "Kullanıcı kendi kategorisini ekleyebilir" ON kategoriler;
DROP POLICY IF EXISTS "Users can insert own categories" ON kategoriler;
DROP POLICY IF EXISTS "kategoriler_insert" ON kategoriler;

CREATE POLICY "kategoriler_insert"
ON kategoriler
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- UPDATE: Sadece kendi kategorilerini güncelleyebilir (sistem kategorileri dokunulamaz)
DROP POLICY IF EXISTS "Kullanıcı kendi kategorisini güncelleyebilir" ON kategoriler;
DROP POLICY IF EXISTS "Users can update own categories" ON kategoriler;
DROP POLICY IF EXISTS "kategoriler_update" ON kategoriler;

CREATE POLICY "kategoriler_update"
ON kategoriler
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: Sadece kendi kategorilerini silebilir
DROP POLICY IF EXISTS "Kullanıcı kendi kategorisini silebilir" ON kategoriler;
DROP POLICY IF EXISTS "Users can delete own categories" ON kategoriler;
DROP POLICY IF EXISTS "kategoriler_delete" ON kategoriler;

CREATE POLICY "kategoriler_delete"
ON kategoriler
FOR DELETE
USING (user_id = auth.uid());

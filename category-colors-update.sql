-- ========================================
-- ADVOCASEHUB - Kategori Renk Güncellemesi
-- Lacivert + Altın marka paletiyle uyumlu
-- Supabase SQL Editor'da çalıştırın
-- ========================================

UPDATE kategoriler SET color = '#1B2A4A' WHERE adi = 'Arabulucu İş';       -- Lacivert (ana renk)
UPDATE kategoriler SET color = '#2D4270' WHERE adi = 'Arabulucu Ticaret';  -- Açık lacivert
UPDATE kategoriler SET color = '#1E5B5B' WHERE adi = 'Arabulucu Tüketici'; -- Koyu teal
UPDATE kategoriler SET color = '#64748B' WHERE adi = 'Arabulucu Diğer';    -- Füme/gri
UPDATE kategoriler SET color = '#C9A84C' WHERE adi = 'Uzlaştırma';         -- Altın (accent)
UPDATE kategoriler SET color = '#7A1E2E' WHERE adi = 'CMK';                -- Bordo (ceza hukuku)
UPDATE kategoriler SET color = '#1E3A5F' WHERE adi = 'Hukuk';              -- Derin lacivert
UPDATE kategoriler SET color = '#5C1B2A' WHERE adi = 'Ceza';               -- Koyu bordo
UPDATE kategoriler SET color = '#A07830' WHERE adi = 'İcra';               -- Koyu altın

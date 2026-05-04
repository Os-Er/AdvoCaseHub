-- makbuzlar tablosuna manuel_odendi_onayi kolonu ekle
ALTER TABLE makbuzlar
  ADD COLUMN IF NOT EXISTS manuel_odendi_onayi BOOLEAN NOT NULL DEFAULT FALSE;

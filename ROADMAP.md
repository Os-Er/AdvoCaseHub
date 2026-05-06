# AdvoCaseHub v2 — Yeniden Yapılanma Yol Haritası

## Geliştirme Stratejisi

> **Tüm fazlar önce local ortamda geliştirilir ve test edilir.**
> **Hiçbir şey tek tek deploy edilmez — her şey bitince tek seferde yayınlanır.**

---

## Arşivleme Kuralları (Tüm Modüller İçin)

Her modülde silme yerine önce **arşivleme** tercih edilir:

- Her tabloda `arsivlendi BOOLEAN DEFAULT FALSE` kolonu bulunur
- Ana listeler varsayılan olarak `arsivlendi = FALSE` filtresiyle gelir
- Her kayıt için **"Arşivle"** butonu bulunur
- Her modülün kendi **"Arşiv"** görünümü vardır (`/arsiv` alt sayfası)
- Arşivlenen kayıt **geri alınabilir** (Arşivden Çıkar)
- Kalıcı **silme** yalnızca arşivden yapılabilir
- Mevcut `dosyalar` tablosundaki `ARSIV` durumu korunur, yeni tablolarda `arsivlendi` kolonu kullanılır

```
Ana Liste  →  Arşivle  →  Arşiv Görünümü  →  Kalıcı Sil
                              ↓
                         Arşivden Çıkar  →  Ana Listeye Döner
```

---

## FAZ 0 — Hazırlık (1 gün)

**Amaç:** Canlı siteyi bozmadan geliştirme yapabilmek.

```
✅ 0.1 — Git'te yeni branch aç: git checkout -b v2-restructure
✅ 0.2 — Supabase'den mevcut veriyi yedekle (Dashboard → SQL Editor → Export)
✅ 0.3 — Local'de npm run dev çalıştır, mevcut durum sağlıklı mı kontrol et
```

---

## FAZ 1 — Veritabanı Migration (1 gün)

**Amaç:** Yeni şemayı production'a uygulamak, mevcut veriyi korumak.

```
📄 1.1 — dosyalar tablosuna tip kolonu ekle
         ALTER TABLE dosyalar ADD COLUMN tip TEXT NOT NULL DEFAULT 'HUKUK'
         CHECK (tip IN ('HUKUK','CEZA','ICRA'));
         (ARSIV durumu mevcut durum enum'unda zaten var — değişiklik yok)

📄 1.2 — 5 yeni tablo oluştur (hepsinde arsivlendi kolonu dahil)
         - arabuluculuk
         - cmk_islemleri
         - danismanlik
         - sureli_isler
         - finans

📄 1.3 — RLS policy'leri ekle (her yeni tablo için)

📄 1.4 — makbuzlar verisini finans tablosuna kopyala
         INSERT INTO finans SELECT ... FROM makbuzlar
         (kaynak_tip='DOSYA', tip='MAKBUZ', arsivlendi=FALSE)

📄 1.5 — Tüm tabloların updated_at için trigger ekle

📄 1.6 — database.ts güncelle (yeni tüm tipler ve interface'ler)
```

---

## FAZ 2 — Sidebar Yeniden Tasarımı (1 gün)

**Amaç:** Accordion'lu yeni menü yapısını kurmak.

```
📄 2.1 — src/components/layout/sidebar.tsx komple yeniden yaz
         - Accordion state: useState ile hangi gruplar açık
         - URL'e göre aktif accordion otomatik açılır
         - Yeni menü yapısı:
           📂 Dosya Yönetimi (accordion)
              ├── Hukuk Davaları   → /dosyalar/hukuk
              ├── Ceza Davaları    → /dosyalar/ceza
              └── İcra Takipleri   → /dosyalar/icra
           🤝 Arabuluculuk         → /arabuluculuk
           ⚖️  CMK İşlemleri       → /cmk
           💼 Danışmanlık & Genel  → /danismanlik
           ⏳ Süreli İşler          → /sureli-isler
           💰 Finans (accordion)
              ├── Makbuzlar        → /finans/makbuzlar
              ├── Giderler         → /finans/giderler
              └── Tahsilatlar      → /finans/tahsilatlar

📄 2.2 — Badge'leri güncelle
         - Süreli İşler: bugün/yarın dolacak işler sayısı
         - Finans: bekleyen tahsilatlar sayısı
```

---

## FAZ 3 — Dosya Yönetimi Modülü (2 gün)

**Amaç:** Mevcut dosyaları 3 alt tipe ayırmak.

```
📁 Klasör yapısı:
   src/app/(dashboard)/dosyalar/
   ├── hukuk/
   │   ├── page.tsx              (liste — arsivlendi=FALSE)
   │   ├── arsiv/page.tsx        (arşiv görünümü)
   │   ├── yeni/page.tsx
   │   └── [id]/
   │       ├── page.tsx
   │       └── duzenle/page.tsx
   ├── ceza/                     (aynı yapı)
   └── icra/                     (aynı yapı)

📁 src/components/dosyalar/
   ├── (mevcut bileşenler korunur)
   ├── arsivle-butonu.tsx        (mevcut — güncellenir)
   └── arsivden-cikar-butonu.tsx (yeni)

📄 3.1 — Her tip için sayfa oluştur
📄 3.2 — Dosya formlarını tipe göre uyarla
         - Hukuk: mahkeme, esas no, karar no
         - Ceza: savcılık, iddianame no
         - İcra: icra no, icra dairesi, takip tutarı
📄 3.3 — src/lib/actions/dosyalar.ts → tip parametresi eklenir
📄 3.4 — /dosyalar → /dosyalar/hukuk redirect
```

---

## FAZ 4 — Arabuluculuk Modülü (1.5 gün)

**Amaç:** Bağımsız arabuluculuk takip modülü.

```
📁 src/app/(dashboard)/arabuluculuk/
   ├── page.tsx              (liste — arsivlendi=FALSE)
   ├── arsiv/page.tsx        (arşiv görünümü)
   ├── loading.tsx
   ├── yeni/page.tsx
   └── [id]/
       ├── page.tsx
       └── duzenle/page.tsx

📁 src/components/arabuluculuk/
   ├── arabuluculuk-formu.tsx
   ├── arabuluculuk-durum-badge.tsx
   ├── arsivle-butonu.tsx
   ├── arsivden-cikar-butonu.tsx
   └── sil-butonu.tsx        (yalnızca arşivdeyken aktif)

📄 src/lib/actions/arabuluculuk.ts
   - getArabuluculuklar()        (arsivlendi=FALSE)
   - getArsivArabuluculuklar()   (arsivlendi=TRUE)
   - createArabuluculuk()
   - updateArabuluculuk()
   - arsivleArabuluculuk()
   - arsivdenCikarArabuluculuk()
   - deleteArabuluculuk()        (yalnızca arşivdeyken)
```

---

## FAZ 5 — CMK İşlemleri Modülü (1.5 gün)

**Amaç:** Baro atama ve CMK süreç takibi.

```
📁 src/app/(dashboard)/cmk/
   ├── page.tsx
   ├── arsiv/page.tsx
   ├── loading.tsx
   ├── yeni/page.tsx
   └── [id]/
       ├── page.tsx
       └── duzenle/page.tsx

📁 src/components/cmk/
   ├── cmk-formu.tsx
   ├── cmk-sure-badge.tsx        (SORUŞTURMA / KOVUŞTURMA)
   ├── arsivle-butonu.tsx
   ├── arsivden-cikar-butonu.tsx
   └── sil-butonu.tsx

📄 src/lib/actions/cmk.ts
   - getCmkIslemleri()
   - getArsivCmkIslemleri()
   - createCmkIslem()
   - updateCmkIslem()
   - arsivleCmkIslem()
   - arsivdenCikarCmkIslem()
   - deleteCmkIslem()
```

---

## FAZ 6 — Danışmanlık & Genel Modülü (1 gün)

**Amaç:** Sözleşme ve danışmanlık takibi.

```
📁 src/app/(dashboard)/danismanlik/
   ├── page.tsx
   ├── arsiv/page.tsx
   ├── loading.tsx
   ├── yeni/page.tsx
   └── [id]/
       ├── page.tsx
       └── duzenle/page.tsx

📁 src/components/danismanlik/
   ├── danismanlik-formu.tsx
   ├── danismanlik-tur-badge.tsx
   ├── arsivle-butonu.tsx
   ├── arsivden-cikar-butonu.tsx
   └── sil-butonu.tsx

📄 src/lib/actions/danismanlik.ts
   - getDanismanliklar()
   - getArsivDanismanliklar()
   - createDanismanlik()
   - updateDanismanlik()
   - arsivleDanismanlik()
   - arsivdenCikarDanismanlik()
   - deleteDanismanlik()
```

---

## FAZ 7 — Süreli İşler Modülü (2 gün)

**Amaç:** Tüm modüllerden beslenen merkezi deadline havuzu.

```
📁 src/app/(dashboard)/sureli-isler/
   ├── page.tsx              (liste — tamamlanmamış + arsivlendi=FALSE)
   ├── arsiv/page.tsx        (arşiv görünümü)
   ├── loading.tsx
   └── yeni/page.tsx

📁 src/components/sureli-isler/
   ├── sureli-is-formu.tsx
   │   - Kaynak tipi seç (Dosya / Arabuluculuk / CMK / Danışmanlık)
   │   - Kaynak seç (seçilen tipe göre dropdown dolar)
   │   - Kategori seç (İstinaf, Cevap Dilekçesi, vb.)
   │   - Son tarih + hatırlatma tarihi
   │   - Öncelik
   ├── sureli-is-oncelik-badge.tsx
   ├── sureli-is-kategori-badge.tsx
   ├── tamamla-butonu.tsx
   ├── arsivle-butonu.tsx
   ├── arsivden-cikar-butonu.tsx
   └── sil-butonu.tsx

📄 src/lib/actions/sureli-isler.ts
   - getSureliIsler()             (tamamlanmamış, arsivlendi=FALSE)
   - getArsivSureliIsler()        (arsivlendi=TRUE)
   - createSureliIs()
   - updateSureliIs()
   - tamamlaSureliIs()
   - arsivleSureliIs()
   - arsivdenCikarSureliIs()
   - deleteSureliIs()

⚙️  Otomatik tetikleyiciler (app katmanında):
   - İcra dosyası oluşturulunca → sureli_isler'e otomatik kayıt
   - CMK atama yapılınca → sureli_isler'e otomatik kayıt
```

---

## FAZ 8 — Finans Yönetimi Modülü (2 gün)

**Amaç:** Makbuz, gider ve tahsilatları tek çatı altında yönetmek.

```
📁 src/app/(dashboard)/finans/
   ├── makbuzlar/
   │   ├── page.tsx
   │   ├── arsiv/page.tsx
   │   ├── yeni/page.tsx
   │   └── [id]/page.tsx
   ├── giderler/
   │   ├── page.tsx
   │   ├── arsiv/page.tsx
   │   ├── yeni/page.tsx
   │   └── [id]/page.tsx
   └── tahsilatlar/
       ├── page.tsx
       ├── arsiv/page.tsx
       ├── yeni/page.tsx
       └── [id]/page.tsx

📁 src/components/finans/
   ├── finans-formu.tsx          (tip'e göre dinamik alanlar)
   ├── finans-tip-badge.tsx
   ├── arsivle-butonu.tsx
   ├── arsivden-cikar-butonu.tsx
   └── sil-butonu.tsx

📄 src/lib/actions/finans.ts
   - getFinans(tip)
   - getArsivFinans(tip)
   - createFinans()
   - updateFinans()
   - arsivleFinans()
   - arsivdenCikarFinans()
   - deleteFinans()

⚙️  Eski /makbuzlar, /vekaletnameler route'ları → redirect
```

---

## FAZ 9 — Dashboard Güncelleme (1 gün)

**Amaç:** Ana sayfayı yeni modülleri yansıtacak şekilde güncellemek.

```
📄 9.1 — İstatistik kartları güncelle
         - Toplam aktif dosya (tüm tipler, arsivlendi=FALSE)
         - Bugün dolacak süreli işler
         - Bu ay gelir vs gider
         - Bekleyen tahsilatlar

📄 9.2 — Grafikler güncelle
         - Dosya dağılımı (HUKUK/CEZA/İCRA/CMK/ARABULUCULUK)
         - Aylık finans grafiği (gelir/gider/tahsilat)

📄 9.3 — Süreli işler widget'ı ekle
         - "Bu hafta dolacak işler" listesi
```

---

## FAZ 10 — Temizlik & Deploy (1 gün)

```
✅ 10.1 — Tüm modüllerde arşivleme/silme akışı test edilir
          - Arşivle → Arşivden Çıkar → Kalıcı Sil
          - Her modülde çalışıyor mu?

✅ 10.2 — Eski route'ları temizle veya redirect ekle
          /dosyalar       → /dosyalar/hukuk
          /makbuzlar      → /finans/makbuzlar
          /vekaletnameler → kalıyor (değişmedi)

✅ 10.3 — proxy.ts middleware'e yeni route'ları ekle

✅ 10.4 — Local'de tam test
          - Her modül CRUD çalışıyor mu?
          - Süreli işler bağlantıları doğru mu?
          - Finans kaynak seçimi çalışıyor mu?
          - Arşivleme her modülde çalışıyor mu?

✅ 10.5 — v2-restructure branch'ini main'e merge et
✅ 10.6 — Vercel otomatik deploy alır → tek seferlik yayın
✅ 10.7 — Production'da smoke test
```

---

## Özet Takvim

| Faz | İş                      | Süre       |
|-----|-------------------------|------------|
| 0   | Hazırlık                | 1 gün      |
| 1   | DB Migration            | 1 gün      |
| 2   | Sidebar                 | 1 gün      |
| 3   | Dosya Yönetimi          | 2 gün      |
| 4   | Arabuluculuk            | 1.5 gün    |
| 5   | CMK İşlemleri           | 1.5 gün    |
| 6   | Danışmanlık & Genel     | 1 gün      |
| 7   | Süreli İşler            | 2 gün      |
| 8   | Finans Yönetimi         | 2 gün      |
| 9   | Dashboard               | 1 gün      |
| 10  | Temizlik & Deploy       | 1 gün      |
| **TOPLAM** |                | **~15 gün** |

> 💡 Tüm fazlar local'de tamamlanır. Deploy yalnızca Faz 10'da yapılır.

---

## Veritabanı Şeması (Özet)

### Mevcut tablolarda değişiklik

```sql
-- dosyalar tablosuna tip eklenir (ARSIV durumu zaten mevcut)
ALTER TABLE dosyalar
ADD COLUMN tip TEXT NOT NULL DEFAULT 'HUKUK'
CHECK (tip IN ('HUKUK','CEZA','ICRA'));
```

### Yeni tablolar

```sql
-- Arabuluculuk
CREATE TABLE arabuluculuk (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id),
  basvuru_no       TEXT,
  basvuran         TEXT,
  karsi_taraf      TEXT,
  arabulucu_adi    TEXT,
  basvuru_tarihi   DATE,
  gorusme_tarihi   DATE,
  konu             TEXT,
  sonuc            TEXT CHECK (sonuc IN ('ANLASMA','ANLASAMAMAMA','DEVAM')),
  durum            TEXT NOT NULL DEFAULT 'DEVAM'
                   CHECK (durum IN ('DEVAM','TAMAMLANDI','IPTAL')),
  arsivlendi       BOOLEAN NOT NULL DEFAULT FALSE,
  notlar           TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- CMK İşlemleri
CREATE TABLE cmk_islemleri (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id),
  baro_atama_no    TEXT,
  atama_tarihi     DATE,
  muvekkil_adi     TEXT,
  suc_isnadı       TEXT,
  sure_tipi        TEXT CHECK (sure_tipi IN ('SORUSTURMA','KOVUSTURMA')),
  merci            TEXT,
  dosya_no         TEXT,
  durum            TEXT NOT NULL DEFAULT 'DEVAM'
                   CHECK (durum IN ('DEVAM','TAMAMLANDI','IPTAL')),
  arsivlendi       BOOLEAN NOT NULL DEFAULT FALSE,
  notlar           TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Danışmanlık
CREATE TABLE danismanlik (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id),
  muvekkil         TEXT,
  tur              TEXT CHECK (tur IN ('DANISMANLIK','SOZLESME','GENEL')),
  sozlesme_no      TEXT,
  baslangic_tarihi DATE,
  bitis_tarihi     DATE,
  ucret            NUMERIC(12,2),
  konu             TEXT,
  durum            TEXT NOT NULL DEFAULT 'AKTIF'
                   CHECK (durum IN ('AKTIF','TAMAMLANDI','IPTAL')),
  arsivlendi       BOOLEAN NOT NULL DEFAULT FALSE,
  notlar           TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Süreli İşler
CREATE TABLE sureli_isler (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id),
  kaynak_tip        TEXT CHECK (kaynak_tip IN ('DOSYA','ARABULUCULUK','CMK','DANISMANLIK')),
  kaynak_id         UUID,
  baslik            TEXT NOT NULL,
  kategori          TEXT NOT NULL,
  son_tarih         DATE NOT NULL,
  hatirlatma_tarihi DATE,
  oncelik           TEXT DEFAULT 'NORMAL'
                    CHECK (oncelik IN ('DUSUK','NORMAL','YUKSEK','KRITIK')),
  tamamlandi        BOOLEAN DEFAULT FALSE,
  tamamlanma_tarihi DATE,
  arsivlendi        BOOLEAN NOT NULL DEFAULT FALSE,
  sure_logic        JSONB DEFAULT '{}'::jsonb,
  aciklama          TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Finans (Makbuz + Gider + Tahsilat)
CREATE TABLE finans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id),
  tip           TEXT NOT NULL CHECK (tip IN ('MAKBUZ','GIDER','TAHSILAT')),
  kaynak_tip    TEXT NOT NULL CHECK (kaynak_tip IN ('DOSYA','ARABULUCULUK','CMK','DANISMANLIK')),
  kaynak_id     UUID NOT NULL,
  miktar        NUMERIC(12,2) NOT NULL,
  tarih         DATE NOT NULL,
  referans_no   TEXT,
  aciklama      TEXT,
  durum         TEXT DEFAULT 'BEKLIYOR'
                CHECK (durum IN ('BEKLIYOR','KISMI','TAMAMLANDI','IPTAL')),
  odenen_miktar NUMERIC(12,2),
  arsivlendi    BOOLEAN NOT NULL DEFAULT FALSE,
  notlar        TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### İlişki Yapısı

```
dosyalar      (tip: HUKUK|CEZA|ICRA)  ──┐
arabuluculuk                            ├──► sureli_isler (kaynak_tip + kaynak_id)
cmk_islemleri                           ├──► finans       (kaynak_tip + kaynak_id)
danismanlik                             ──┘
```

---

## TypeScript Tipleri

```typescript
export type DosyaTip         = "HUKUK" | "CEZA" | "ICRA";
export type KaynakTip        = "DOSYA" | "ARABULUCULUK" | "CMK" | "DANISMANLIK";
export type FinansTip        = "MAKBUZ" | "GIDER" | "TAHSILAT";
export type SureliIsKategori =
  | "ISTINAF" | "CEVAP_DILEKCESI" | "BILIRKISI_ITIRAZI"
  | "TEMYIZ"  | "ITIRAZ"          | "DURUSMA" | "DIGER";
export type Oncelik          = "DUSUK" | "NORMAL" | "YUKSEK" | "KRITIK";
```

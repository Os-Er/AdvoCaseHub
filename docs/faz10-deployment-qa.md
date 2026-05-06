# AdvoCaseHub v2 — Faz 10: Deployment & Kalite Kontrol

> **Tarih:** 2026-05-06  
> **Dal:** `v2-restructure`  
> **Durum:** Kod tamamlandı — manuel adımlar seni bekliyor

---

## İÇİNDEKİLER

1. [Bu Seansta Yapılanlar](#1-bu-seansta-yapılanlar)
2. [Deployment Check-list](#2-deployment-check-list)
3. [Supabase Migration Sıralaması](#3-supabase-migration-sıralaması)
4. [Vercel Kurulumu — Adım Adım](#4-vercel-kurulumu--adım-adım)
5. [Supabase Auth Ayarları](#5-supabase-auth-ayarları)
6. [5 Kritik Sanity Check Senaryosu](#6-5-kritik-sanity-check-senaryosu)
7. [Hata Yönetimi Rehberi](#7-hata-yönetimi-rehberi)
8. [v2.0.0 Launch Banner](#8-v200-launch-banner)

---

## 1. Bu Seansta Yapılanlar

### 1.1 KRİTİK DÜZELTME — `middleware.ts` Oluşturuldu

**Sorun:** Proje kökünde `middleware.ts` yoktu. Bu, `/dashboard`, `/dosyalar`, tüm modül sayfaları gibi tüm rotaların **giriş yapmadan erişilebilir** olduğu anlamına geliyordu. Supabase RLS veritabanı seviyesinde koruma sağlıyor olsa da UI tamamen açıktı.

**Çözüm:** `middleware.ts` proje kökünde oluşturuldu.

**Dosya:** `middleware.ts` (proje kökü, `src/` içinde değil)

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ACIK_ROTALAR = ["/login", "/register", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ACIK_ROTALAR.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname); // giriş sonrası nereye dönülecek
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|login|register|reset-password).*)",
  ],
};
```

**Nasıl çalışır:**
- Kullanıcı oturum açmamışsa → `/login?next=/hedef-rota` adresine yönlendirilir
- `getUser()` her seferinde Supabase sunucusuna doğrulama isteği atar; cookie manipülasyonuna karşı güvenlidir
- `_next/static`, `_next/image`, favicon gibi statik kaynaklar middleware'e takılmaz

---

### 1.2 v2.0.0 Launch Banner Bileşeni

**Dosya:** `src/components/dashboard/v2-launch-banner.tsx`

- `"use client"` bileşeni — tarayıcı `localStorage` kullanıyor
- İlk girişte gösterilir, X butonuyla kapatılır ve bir daha gösterilmez
- `localStorage` anahtarı: `advocasehub_v2_banner_dismissed`
- Navy gradient arka plan, gold vurgu rengi, animasyonlu dekoratif halkalar
- 6 yeni özelliği pill badge'lerle listeler

**Dashboard'a entegrasyonu:**

`src/app/(dashboard)/page.tsx` dosyasına şu iki değişiklik yapıldı:

```typescript
// Import eklendi:
import { V2LaunchBanner } from "@/components/dashboard/v2-launch-banner";

// JSX'in en üstüne eklendi (Başlık div'inden önce):
<V2LaunchBanner />
```

---

### 1.3 TypeScript Kontrolü

```
npx tsc --noEmit → 0 hata ✅
```

---

## 2. Deployment Check-list

Aşağıdaki tabloyu yukarıdan aşağıya çalış. Tümünü tamamlamadan `main`'e merge etme veya production'a deploy etme.

### 🔴 Kritik — Yayın Öncesi Zorunlu

| # | Kontrol | Durum | Nasıl Doğrulanır |
|---|---------|:-----:|-----------------|
| 1 | `middleware.ts` proje kökünde mevcut | ✅ Tamamlandı | `ls middleware.ts` |
| 2 | Vercel'de `NEXT_PUBLIC_SUPABASE_URL` tanımlı | ⬜ Bekliyor | Bölüm 4'e bak |
| 3 | Vercel'de `NEXT_PUBLIC_SUPABASE_ANON_KEY` tanımlı | ⬜ Bekliyor | Bölüm 4'e bak |
| 4 | Vercel'de `NEXT_PUBLIC_SITE_URL` production URL | ⬜ Bekliyor | Bölüm 4'e bak |
| 5 | `v2_migration.sql` Supabase'de çalıştırıldı | ⬜ Bekliyor | Bölüm 3'e bak |
| 6 | `v2_taraflar.sql` Supabase'de çalıştırıldı | ⬜ Bekliyor | Bölüm 3'e bak |
| 7 | Supabase RLS tüm yeni tablolarda aktif | ✅ SQL'de var | Bölüm 3 doğrulama sorguları |
| 8 | Supabase Auth → Redirect URL'ler eklendi | ⬜ Bekliyor | Bölüm 5'e bak |
| 9 | Deploy için `v2-restructure` branch seçildi | ⬜ Bekliyor | Vercel → Project → Settings → Git |

### 🟡 Önemli — Yayın Sonrası Hemen

| # | Kontrol | Nasıl Test Edilir |
|---|---------|-----------------|
| 10 | `/makbuzlar` → `/finans/makbuzlar` redirect çalışıyor | Tarayıcıda `/makbuzlar` aç, 308 redirect bekle |
| 11 | Giriş yapmadan dashboard'a erişim → `/login`'e yönleniyor | Gizli sekme ile `/dashboard` dene |
| 12 | RLS: Kullanıcı başkasının verisini göremez | Bölüm 6 Senaryo 2 |

### 🟢 İsteğe Bağlı — İlk Hafta

| # | Kontrol |
|---|---------|
| 13 | Vercel Analytics aktif et (Project → Analytics) |
| 14 | Supabase → Project Settings → Auth → Email Templates özelleştir |
| 15 | Supabase → Project Settings → Point-in-Time Recovery (Pro plan) |

---

## 3. Supabase Migration Sıralaması

> **Nerede yapılır:** https://supabase.com → Proje seç → SQL Editor

### Adım 0 — Mevcut Durumu Kontrol Et

SQL Editor'da çalıştır, sonuçları kaydet:

```sql
-- Hangi tablolar zaten var?
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Makbuzlar tablosunda kaç kayıt var? (migration sonucu finans'a geçmeli)
SELECT COUNT(*) AS makbuz_sayisi FROM makbuzlar;

-- dosyalar tablosunda tip kolonu var mı?
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'dosyalar' AND column_name = 'tip';
```

---

### Adım 1 — `v2_migration.sql` Çalıştır

**Dosya:** `supabase/migrations/v2_migration.sql`

SQL Editor'ı aç → dosyanın tüm içeriğini yapıştır → **Run** tuşuna bas.

Bu dosya şunları yapar:
- `dosyalar` tablosuna `tip` kolonu ekler (`HUKUK` / `CEZA` / `ICRA`)
- `arabuluculuk` tablosu oluşturur
- `cmk_islemleri` tablosu oluşturur
- `danismanlik` tablosu oluşturur
- `sureli_isler` tablosu oluşturur
- `finans` tablosu oluşturur
- Tüm yeni tablolara RLS aktif eder + policy oluşturur
- Mevcut `makbuzlar` verisini `finans` tablosuna kopyalar

**⚠️ Güvenli çalıştırma notu:**
- `ADD COLUMN IF NOT EXISTS` → kolon zaten varsa hata vermez
- `CREATE TABLE IF NOT EXISTS` → tablo zaten varsa hata vermez
- `INSERT ... ON CONFLICT (id) DO NOTHING` → tekrar çalıştırsan veri çoğalmaz

---

### Adım 1 Sonrası — Doğrulama Sorguları

```sql
-- Yeni tablolar oluştu mu?
SELECT COUNT(*) AS arabuluculuk_sayisi    FROM arabuluculuk;
SELECT COUNT(*) AS cmk_sayisi            FROM cmk_islemleri;
SELECT COUNT(*) AS danismanlik_sayisi    FROM danismanlik;
SELECT COUNT(*) AS sureli_isler_sayisi   FROM sureli_isler;

-- finans tablosuna makbuzlar kopyalandı mı?
-- (adım 0'daki makbuz_sayisi ile eşleşmeli)
SELECT COUNT(*) AS finans_sayisi FROM finans;
SELECT tip, durum, COUNT(*) FROM finans GROUP BY tip, durum ORDER BY tip;

-- dosyalar.tip kolonu eklendi mi?
SELECT tip, COUNT(*) FROM dosyalar GROUP BY tip;
-- Mevcut tüm dosyalar → HUKUK olarak görünmeli

-- RLS aktif mi?
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('arabuluculuk','cmk_islemleri','danismanlik','sureli_isler','finans');
-- rowsecurity = true olmalı (hepsi)

-- Policy'ler oluştu mu?
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

### Adım 2 — `v2_taraflar.sql` Çalıştır

**Dosya:** `supabase/migrations/v2_taraflar.sql`

SQL Editor'ı aç → dosyanın içeriğini yapıştır → **Run** tuşuna bas.

> **Neden Adım 1'den sonra?** `dosya_taraflari` tablosu `dosyalar(id)` tablosuna FK referansı veriyor. `dosyalar` tablosu zaten v1'den geldiği için sorun yok, ama yine de sıra bozulmasın.

**Doğrulama:**
```sql
SELECT COUNT(*) AS taraf_sayisi FROM dosya_taraflari;
-- 0 beklenir (yeni tablo, henüz veri yok)
```

---

### Geri Alma Planı (Sorun Çıkarsa)

Migration'ı geri almak gerekirse aşağıdaki SQL'i çalıştır. **Dikkat:** `finans` tablosu düşürülünce kopyalanan makbuz verileri de gider; ancak orijinal `makbuzlar` tablosu dokunulmadan duruyor.

```sql
-- Yeni tabloları temizle (makbuzlar tablosu korunur)
DROP TABLE IF EXISTS dosya_taraflari CASCADE;
DROP TABLE IF EXISTS finans           CASCADE;
DROP TABLE IF EXISTS sureli_isler     CASCADE;
DROP TABLE IF EXISTS danismanlik      CASCADE;
DROP TABLE IF EXISTS cmk_islemleri    CASCADE;
DROP TABLE IF EXISTS arabuluculuk     CASCADE;
ALTER TABLE dosyalar DROP COLUMN IF EXISTS tip;

-- Kontrol: eski durum geri geldi mi?
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;
```

---

## 4. Vercel Kurulumu — Adım Adım

### 4.1 Ortam Değişkenleri

> **Nerede:** https://vercel.com → Proje: `advocasehub` → Settings → Environment Variables

Aşağıdaki üç değişkeni ekle. Her biri için **Environment: Production, Preview, Development** seç.

| Değişken Adı | Değer | Nereden Alınır |
|-------------|-------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://itifzdgmngyicsywgbfw.supabase.co` | `.env.local` dosyan |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (uzun JWT) | `.env.local` dosyan |
| `NEXT_PUBLIC_SITE_URL` | `https://advocasehub.vercel.app` | Production URL'in |

> **⚠️ Dikkat:** `.vercel/.env.production.local` dosyasında bu değerler **boş** görünüyor. Bu dosya Vercel CLI tarafından otomatik oluşturulur ve zaten production'da çalışmaz — Vercel Dashboard'daki ayarlar geçerlidir. Bu yüzden Dashboard'dan mutlaka girilmeli.

### 4.2 Deploy Branch Seçimi

> **Nerede:** Vercel → Proje → Settings → Git → Production Branch

`v2-restructure` veya `main`'e merge ettikten sonra `main` olarak ayarla.

**Önerilen akış:**
```
v2-restructure → (test et) → main'e merge → Vercel otomatik deploy eder
```

### 4.3 Build Ayarları (Varsayılanlar Yeterli)

| Ayar | Değer |
|------|-------|
| Framework Preset | Next.js |
| Build Command | `next build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

---

## 5. Supabase Auth Ayarları

> **Nerede:** https://supabase.com → Proje → Authentication → URL Configuration

### 5.1 Site URL

```
https://advocasehub.vercel.app
```

### 5.2 Redirect URLs (İzin Verilen Yönlendirmeler)

Şunları ekle:

```
https://advocasehub.vercel.app/**
http://localhost:3000/**
```

> **Neden gerekli?** Magic link, OAuth ve şifre sıfırlama e-postalarındaki callback URL'leri bu liste dışındaysa Supabase reddeder.

### 5.3 E-posta Şablonları (İsteğe Bağlı ama Önerilir)

> Authentication → Email Templates

- **Confirm signup** → Türkçeleştir
- **Reset password** → Türkçeleştir
- Gönderen adı: `AdvoCaseHub` olarak güncelle

---

## 6. 5 Kritik Sanity Check Senaryosu

Yayın bittikten sonra aşağıdaki 5 senaryoyu **bu sırayla**, üretim ortamında (production URL'den) manuel olarak test et.

---

### Senaryo 1 — Kimlik Doğrulama Koruması

**Amaç:** Middleware çalışıyor mu?

```
1. Tarayıcıda yeni gizli sekme aç (Ctrl+Shift+N)
2. https://advocasehub.vercel.app/dashboard adresine git
3. ✅ → /login?next=/dashboard adresine yönlendirilmeli
4. Giriş yap
5. ✅ → /dashboard'a dönmeli
6. /dosyalar sayfasına git
7. Sağ üstten çıkış yap (logout)
8. ✅ → /login'e yönlenmeli
```

**Başarısız olursa:**
- `middleware.ts` proje kökünde mi? (`src/` içinde değil)
- Vercel env değişkenleri girildi mi?
- `next build` sonrası deploy tetiklendi mi?

---

### Senaryo 2 — Veri İzolasyonu (RLS)

**Amaç:** Kullanıcılar birbirinin verisini göremiyor mu?

```
1. Kullanıcı A ile giriş yap
2. /dosyalar/yeni → "Test Dosyası A" isimli bir dosya oluştur
3. Çıkış yap
4. Kullanıcı B ile giriş yap (farklı e-posta)
5. /dosyalar → listede "Test Dosyası A" görünmemeli ✅
6. Supabase → Table Editor → dosyalar tablosunu aç
   → user_id sütununa bak, A ve B'nin kayıtları ayrı olmalı ✅
```

**Başarısız olursa:**
- Supabase → Authentication → Policies → dosyalar tablosuna bak
- `auth.uid()` policy'si var mı?

---

### Senaryo 3 — Finans Modülü Tam Akış

**Amaç:** Makbuz oluştur → durumu güncelle → dashboard'a yansı.

```
1. /finans/makbuzlar/yeni → Yeni makbuz oluştur
   - Tutar: 5.000
   - Durum: BEKLIYOR
   - Tarih: bugün
   - Kaydet

2. /finans/makbuzlar → Listede görünmeli ✅
   Üstteki "Bekleyen Tahsilat" kartı ≥ 5.000 ₺ göstermeli ✅

3. Makbuzu aç → Düzenle
   - odened_miktar: 5000
   - durum: TAMAMLANDI
   - Kaydet

4. /finans/makbuzlar → Kalan = "Tam Ödendi" göstermeli ✅

5. Dashboard → Bekleyen Tahsilat bu makbuzu artık saymamalı ✅
   (5.000 ₺ azalmış olmalı)
```

**Başarısız olursa:**
- Supabase Logs → API → `finans` tablosuna gelen isteklere bak
- `odened_miktar` sütun adı doğru mu? (n harfi, char 110)

---

### Senaryo 4 — Süreli İş Kritik Akış

**Amaç:** Deadline takibi, görsel uyarı ve tamamlama akışı.

```
1. /sureli-isler/yeni → Yeni iş oluştur
   - Başlık: "Test Deadline"
   - Son Tarih: BUGÜN
   - Öncelik: KRİTİK
   - Kaydet

2. /sureli-isler → Satırın arka planı kırmızı + "BUGÜN!" shake animasyonu ✅

3. Dashboard → Sağ üstte "X acil süre var" uyarısı çıkmış olmalı ✅

4. Süreli işe tıkla → Detay sayfasında "Tamamla" butonuna bas ✅

5. /sureli-isler → Listeden kaybolmuş olmalı ✅

6. /sureli-isler/arsiv → "Test Deadline" burada görünmeli ✅
```

**Başarısız olursa:**
- `globals.css`'te `@keyframes shake` ve `.animate-shake` var mı?
- `tamamlaSureliIs` server action `revalidatePath` çağırıyor mu?

---

### Senaryo 5 — Eski Makbuz URL Yönlendirmesi

**Amaç:** v1 URL'leri v2'ye sessizce yönlensin.

```
1. https://advocasehub.vercel.app/makbuzlar adresine git
   ✅ → /finans/makbuzlar adresine yönlenmeli

2. https://advocasehub.vercel.app/makbuzlar/yeni → /finans/makbuzlar/yeni ✅

3. DevTools (F12) → Network sekmesi → İsteğin Status: 308 olmalı ✅
```

**Başarısız olursa:**
- `next.config.ts` içindeki `redirects()` fonksiyonuna bak
- `permanent: true` → 308, `permanent: false` → 307 döner

---

## 7. Hata Yönetimi Rehberi

### Dashboard 500 Hatası Verirse — Nereye Bakılır

```
SIRA  ARAÇ / DOSYA                         NE ARARILIR
────  ────────────────────────────────────  ─────────────────────────────────────────
 1    Vercel → Project → Functions Logs     Stack trace, tam hata mesajı
      (fonksiyon adı: dashboard veya page)

 2    Supabase → Logs → API                 HTTP 4xx/5xx istekler
      (itifzdgmng... projesi)               Hangi tablo? Hangi sütun?

 3    src/lib/utils/dashboard-veri.ts       Promise.all içinde 11 sorgu var
      → Her sorguyu ayrı try/catch'e al     Hangisi patlıyor? console.error ekle

 4    src/components/dashboard/             "use client" Recharts bileşeni
      dosya-tip-grafik.tsx                  SSR sırasında window/document erişimi?

 5    Vercel → Environment Variables        NEXT_PUBLIC_SUPABASE_URL boş mu?
```

---

### Supabase Hata Kodları

| Kod | Anlamı | Çözüm |
|-----|--------|-------|
| `42703` | Sütun bulunamadı | `odened_miktar` yazım kontrolü — 'n' (char 110) mi? |
| `42P01` | Tablo bulunamadı | Migration çalıştırılmamış — SQL Editor'da tekrar çalıştır |
| `42501` | RLS izin reddetti | Policy eksik veya `user_id` gönderilmiyor |
| `23505` | Unique constraint ihlali | Aynı `id` iki kez insert edilmeye çalışılıyor |
| `PGRST116` | `.single()` 0 satır döndü | `notFound()` handle edilmeli — sayfa 404 versin |
| `PGRST301` | JWT süresi dolmuş | Middleware `getUser()` token refresh yapıyor, oturum açtır |

---

### Server Action Hata Ayıklama Şablonu

Bir Server Action sürekli hata veriyorsa aşağıdaki sarmalayıcı ile izole et:

```typescript
export async function createXxx(_prev: ActionState, formData: FormData) {
  try {
    const supabase = await createClient();

    // 1. Kullanıcı oturumu kontrolü
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("[createXxx] auth:", authError);
      return { hata: "Oturum süresi doldu, lütfen yeniden giriş yapın." };
    }

    // 2. Veritabanı işlemi
    const { error: dbError } = await supabase
      .from("tablo")
      .insert({ user_id: user.id, /* ... */ });

    if (dbError) {
      // Kod ve mesaj birlikte logla — Vercel Logs'ta görünür
      console.error("[createXxx] db:", dbError.code, dbError.message, dbError.details);
      return { hata: "Kayıt oluşturulamadı. Lütfen tekrar deneyin." };
    }

    revalidatePath("/hedef-rota");
    redirect("/hedef-rota");

  } catch (beklenmeyen) {
    console.error("[createXxx] beklenmeyen hata:", beklenmeyen);
    return { hata: "Beklenmeyen bir hata oluştu." };
  }
}
```

---

### TypeScript Build Kontrolü

Yayına çıkmadan önce yerel ortamda şunu çalıştır:

```bash
# Tip hatalarını kontrol et
npx tsc --noEmit

# Tam production build dene
next build

# Çıktıda şunlara dikkat:
# ⚠  Warning: ... → incelenebilir
# ✘  Error: ...   → YAYİN ÖNCESİ DÜZELTİLMELİ
```

---

## 8. v2.0.0 Launch Banner

**Dosya:** `src/components/dashboard/v2-launch-banner.tsx`

Dashboard'ın en üstünde, kullanıcı ilk girişinde gösterilen, kapatılabilen bir bildirim bileşeni.

**Özellikler:**
- Navy gradient arka plan (`#1B2A4A → #2d4277`), gold vurgu (`#C9A84C`)
- `localStorage` ile durum yönetimi → bir kez kapatıldı mı, bir daha gösterilmez
- 6 yeni özelliği pill badge'lerle listeler
- `X` butonu ile kapatma, `Sparkles` ikonu, dekoratif arka plan halkaları

**Davranışı değiştirmek istersen:**

```typescript
// Bannerı tamamen kaldır:
// src/app/(dashboard)/page.tsx → <V2LaunchBanner /> satırını sil

// localStorage anahtarını değiştir (sıfırlama için):
const BANNER_KEY = "advocasehub_v2_banner_dismissed";
// → farklı bir key yaz, tüm kullanıcılar yeniden görsün

// Belirli bir süre sonra tekrar göster:
// localStorage'a tarih kaydet, X gün sonra sil
```

---

## EK — Önemli Dosya Konumları

```
advocasehub/
├── middleware.ts                                  ← Auth koruması (YENİ)
├── next.config.ts                                 ← /makbuzlar redirect'leri
├── supabase/
│   └── migrations/
│       ├── v2_migration.sql                       ← Ana migration (5 yeni tablo)
│       └── v2_taraflar.sql                        ← dosya_taraflari tablosu
├── src/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts                          ← SSR client (cookie tabanlı)
│   │   │   └── client.ts                          ← Browser client
│   │   ├── actions/
│   │   │   ├── sureli-isler.ts                    ← CRUD + tamamla + arşiv
│   │   │   └── finans.ts                          ← CRUD + tip bazlı revalidate
│   │   └── utils/
│   │       ├── dashboard-veri.ts                  ← 11 paralel sorgu
│   │       └── kaynak-secenekler.ts               ← Tüm modüllerden KaynakOption[]
│   └── components/
│       └── dashboard/
│           ├── dosya-tip-grafik.tsx               ← Recharts donut PieChart
│           └── v2-launch-banner.tsx               ← v2.0.0 banner (YENİ)
└── .env.local                                     ← Yerel env (Vercel'e manuel kopyala)
```

---

*AdvoCaseHub v2 — Faz 10 tamamlandı. Tüm 10 faz kodlanmış durumda. 🚀*

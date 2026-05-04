import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası — AdvoCaseHub",
  description: "AdvoCaseHub gizlilik politikası ve kişisel veri işleme prensipleri.",
};

export default function GizlilikPolitikasiPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "#1B2A4A" }}>
        Gizlilik Politikası
      </h1>
      <p className="text-sm text-slate-500 mb-8">Son güncelleme: Mayıs 2026</p>

      <Section title="1. Genel Bakış">
        <p>
          AdvoCaseHub olarak gizliliğinize saygı duyuyor ve kişisel verilerinizi korumayı
          taahhüt ediyoruz. Bu politika, hizmetimizi kullanırken hangi verileri topladığımızı,
          nasıl kullandığımızı ve nasıl koruduğumuzu açıklar.
        </p>
      </Section>

      <Section title="2. Topladığımız Veriler">
        <p><strong>Hesap oluştururken:</strong></p>
        <ul>
          <li>Ad soyad</li>
          <li>E-posta adresi</li>
          <li>Şifre (şifrelenmiş olarak saklanır, biz göremeyiz)</li>
        </ul>
        <p><strong>Sistemi kullanırken:</strong></p>
        <ul>
          <li>Oluşturduğunuz dava dosyaları, vekaletnameler ve makbuzlar</li>
          <li>Giriş/çıkış zamanları ve gerçekleştirilen işlemler</li>
          <li>Tarayıcı türü ve IP adresi (güvenlik amacıyla)</li>
        </ul>
      </Section>

      <Section title="3. Verileri Nasıl Kullanıyoruz">
        <ul>
          <li>Hesabınızı oluşturmak ve yönetmek</li>
          <li>Hizmetimizi sunmak ve iyileştirmek</li>
          <li>Güvenlik ihlallerini tespit etmek ve önlemek</li>
          <li>Yasal yükümlülüklerimizi yerine getirmek</li>
          <li>Sizinle iletişim kurmak (önemli güncellemeler, güvenlik bildirimleri)</li>
        </ul>
      </Section>

      <Section title="4. Veri Güvenliği">
        <ul>
          <li>Tüm veriler şifreli bağlantı (HTTPS/TLS) üzerinden iletilir</li>
          <li>Veritabanı erişimi Row Level Security (RLS) ile kısıtlanmıştır — her avukat yalnızca kendi verilerini görebilir</li>
          <li>Şifreler hash'lenerek saklanır, düz metin olarak tutulmaz</li>
          <li>Tüm işlemler audit log'a kaydedilir</li>
        </ul>
      </Section>

      <Section title="5. Üçüncü Taraf Hizmetler">
        <p>Hizmetimiz aşağıdaki üçüncü taraf altyapıları kullanmaktadır:</p>
        <ul>
          <li><strong>Supabase</strong> — veritabanı ve kimlik doğrulama</li>
          <li><strong>Vercel</strong> — uygulama barındırma</li>
          <li><strong>Google OAuth</strong> — Google ile giriş seçeneği (tercih ederseniz)</li>
        </ul>
        <p>Bu hizmetlerin kendi gizlilik politikaları mevcuttur.</p>
      </Section>

      <Section title="6. Çerezler">
        <p>
          Yalnızca oturum yönetimi için zorunlu çerezler kullanılmaktadır. Pazarlama veya
          takip amaçlı çerez kullanılmamaktadır.
        </p>
      </Section>

      <Section title="7. Veri Silme">
        <p>
          Hesabınızı silmek veya verilerinizin silinmesini talep etmek için{" "}
          <a href="mailto:destek@advocasehub.com" style={{ color: "#C9A84C" }}>
            destek@advocasehub.com
          </a>{" "}
          adresine yazabilirsiniz. Talepler 30 gün içinde işleme alınır.
        </p>
      </Section>

      <Section title="8. İletişim">
        <p>
          Gizlilik politikamıza ilişkin sorularınız için:{" "}
          <a href="mailto:destek@advocasehub.com" style={{ color: "#C9A84C" }}>
            destek@advocasehub.com
          </a>
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-3 pb-2 border-b border-slate-200" style={{ color: "#1B2A4A" }}>
        {title}
      </h2>
      <div className="text-slate-600 text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

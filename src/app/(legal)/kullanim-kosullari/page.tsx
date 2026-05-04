import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanım Koşulları — AdvoCaseHub",
  description: "AdvoCaseHub hizmet kullanım koşulları ve şartları.",
};

export default function KullanimKosullariPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "#1B2A4A" }}>
        Kullanım Koşulları
      </h1>
      <p className="text-sm text-slate-500 mb-8">Son güncelleme: Mayıs 2026</p>

      <Section title="1. Kabul">
        <p>
          AdvoCaseHub'ı kullanarak bu kullanım koşullarını kabul etmiş sayılırsınız.
          Koşulları kabul etmiyorsanız hizmeti kullanmayınız.
        </p>
      </Section>

      <Section title="2. Hizmet Tanımı">
        <p>
          AdvoCaseHub, Türk avukatlarına yönelik bulut tabanlı bir hukuk bürosu yönetim sistemidir.
          Dava dosyası, vekaletname ve makbuz takibini tek bir platformda sunar.
        </p>
      </Section>

      <Section title="3. Hesap Güvenliği">
        <ul>
          <li>Hesabınıza ait giriş bilgilerinin gizliliğinden siz sorumlusunuz</li>
          <li>Şüpheli bir durum fark ettiğinizde derhal şifrenizi değiştirin ve bize bildirin</li>
          <li>Hesabınız başka kişilerle paylaşılamaz</li>
        </ul>
      </Section>

      <Section title="4. Kullanım Kuralları">
        <p>Aşağıdaki eylemler kesinlikle yasaktır:</p>
        <ul>
          <li>Sisteme yetkisiz erişim girişimi</li>
          <li>Başkalarına ait verilere erişmeye çalışmak</li>
          <li>Sistemi yasa dışı amaçlarla kullanmak</li>
          <li>Virüs, zararlı yazılım veya otomatik bot kullanmak</li>
          <li>Sistemin performansını olumsuz etkileyecek aşırı yük oluşturmak</li>
        </ul>
      </Section>

      <Section title="5. Veri Sorumluluğu">
        <p>
          Sisteme girdiğiniz veriler (müvekkil bilgileri, dava detayları vb.) tamamen size aittir.
          AdvoCaseHub bu verileri hizmet sunumu dışında kullanmaz, satmaz veya üçüncü taraflarla
          paylaşmaz.
        </p>
        <p>
          Girdiğiniz verilerin doğruluğundan ve yasallığından siz sorumlusunuz.
        </p>
      </Section>

      <Section title="6. Hizmet Sürekliliği">
        <p>
          Hizmetin kesintisiz çalışması için azami özen gösterilmekle birlikte, bakım, güncelleme
          veya öngörülemeyen teknik sorunlar nedeniyle kısa süreli kesintiler yaşanabilir.
          Planlı bakımlar önceden duyurulur.
        </p>
      </Section>

      <Section title="7. Fikri Mülkiyet">
        <p>
          AdvoCaseHub platformunun tasarımı, kodu ve içeriği AdvoCaseHub'a aittir. Sisteme
          girdiğiniz veriler ise size aittir.
        </p>
      </Section>

      <Section title="8. Sorumluluk Sınırlaması">
        <p>
          AdvoCaseHub, hizmetin kullanımından kaynaklanan dolaylı, arızi veya sonuçsal zararlardan
          sorumlu tutulamaz. Maksimum sorumluluk, son 3 ay içinde ödenen abonelik ücretiyle sınırlıdır.
        </p>
      </Section>

      <Section title="9. Değişiklikler">
        <p>
          Bu koşulları önceden haber vermeksizin değiştirme hakkımızı saklı tutarız.
          Önemli değişiklikler e-posta ile bildirilir. Değişikliklerin ardından hizmeti
          kullanmaya devam etmeniz yeni koşulları kabul ettiğiniz anlamına gelir.
        </p>
      </Section>

      <Section title="10. Uygulanacak Hukuk">
        <p>
          Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda İstanbul
          Mahkemeleri ve İcra Daireleri yetkilidir.
        </p>
      </Section>

      <Section title="11. İletişim">
        <p>
          Sorularınız için:{" "}
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
